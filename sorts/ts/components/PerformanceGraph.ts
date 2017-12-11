import {
    div,
    DOMSource,
    h,
    label,
} from '@cycle/dom';
import { map, max, min, range } from 'ramda';
import { VNode } from 'snabbdom/vnode';
import xs, { Stream } from 'xstream';
import { getSplines } from '../../external/bezier-spline';
import { SCALE_1, SCALE_2, SCALE_4 } from '../constants';
import { scaleToN } from '../sortUtils';
import { IGraphState, ISinks, ISources, Reducer } from '../typedefs';

import performanceData from '../generatedPerformanceData';

import '../../sass/performancegraph.sass';

console.log('performanceData', performanceData);

export function defaultScale(): { scale: number } {
    return { scale: SCALE_2 };
}

export function intent(domSource: DOMSource): Stream<[IGraphState, IGraphState]> {
    const cn = 'PerformanceGraph-section';
    const gen = f => xs.merge.apply(null, map(f, range(SCALE_1, SCALE_4 + 1)));

    const select = (scale, event, fn) => domSource.select(`.${cn}${scale}`).events(event).map(fn);
    const click = scale => select(scale, 'click', () => ({ scale })).startWith(defaultScale()) as any as Stream<IGraphState>;
    const over = scale => select(scale, 'mouseover', () => ({ scale }));
    const out = scale => select(scale, 'mouseout', () => ({ scale: 0 }));
    const overout = xs.merge(gen(over), gen(out)).startWith({ scale: 0 }) as any as Stream<IGraphState>;

    return xs.combine(gen(click), overout);
}

export function model(actions$: Stream<[IGraphState, IGraphState]>, state: Stream<IGraphState>) {
    const initReducer$ = xs.of(function initReducer(_: IGraphState): IGraphState {
        return defaultScale();
    });

    const addReducer$ = xs.merge(actions$.map(action => action[0]), state)
        .map(scale => function addReducer(_: IGraphState): IGraphState {
            return scale;
        });
    return xs.merge(initReducer$, addReducer$) as any as Stream<Reducer>;
}

export function segment(): (scale: number) => VNode {
    const cn = 'PerformanceGraph-section';
    return (scale: number) => {
        return div(`.${cn} ${cn}${scale}`, [
        ]);
    };
}

function points(positions: Array<[number, number]>, width: number, scale: number, overScale: number): VNode[] {
    const r = min(15, max(1, width / 100));
    return positions.map(([cx, cy], n) => point(cx, cy, r, n + 1 === scale, n + 1 === overScale));
}

function point(cx: number, cy: number, r: number, active: boolean, highlighted: boolean): VNode {
    return h('circle', {
        attrs: {
            cx,
            cy,
            'fill': highlighted ? '#FFF' : active ? '#C1D1F2' : '#2468F2',
            r,
            'stroke': 'transparent',
            'stroke-width': 0,
        },
    });
}

function paths(positions: Array<[number, number]>, width: number, active: boolean = true): VNode[] {
    const strokeWidth = min(width / 100, 3);
    return getSplines(positions).map(d => path(d, strokeWidth, active));
}

function path(d: string, strokeWidth: number, active: boolean): VNode {
    return h('path', {
        attrs: {
            d,
            'fill': 'transparent',
            'stroke': active ? '#83C7DE' : '#444',
            'stroke-width': strokeWidth,
        },
    });
}

function pointInfo(scale: number, numOps?: number[]) {
    if (!scale || !numOps) {
        return [];
    }
    const numOperations = numOps[scale - 1].toLocaleString();
    const numSortItems = scaleToN(scale).toLocaleString();

    return [
        div(label('Items:')), div('.PerformanceGraph-infoData', label(`${numSortItems}`)),
        div(label('Swaps:')), div('.PerformanceGraph-infoData', label(`~${numOperations}`)),
    ];
}

// Takes normalized numOps and scale count and converts it into graph x, y coordinates.
function numOpsToPos(numOps: number, n: number, distancePerSize: number, width: number, height: number): [number, number] {
    const heightDistanceUnits = height / 100;
    const heightInUnits = heightDistanceUnits * 100;
    const padding = (width / 100) * 2;
    const a = padding;
    const b = width - padding;
    const minScale = distancePerSize * scaleToN(SCALE_1);
    const maxScale = distancePerSize * scaleToN(SCALE_4);
    const x = (((b - a) * ((distancePerSize * scaleToN(n)) - minScale)) / (maxScale - minScale)) + a;
    const y = heightInUnits - numOps * heightDistanceUnits;
    return [x, y];
}

// numOps normalized is a scale of range from 0 to 100, not the actual number of operations for the scale of that sort.
function numOpsNormalized(numOps: number[], minN: number = 0, maxN: number = 0): number[] {
    const a = 5;
    const b = 95;
    return numOps.map(n => ((b - a) * (n - minN)) / (maxN - minN) + a);
}

function getBoundaries(data: any): { maxN: number, minN: number } {
    let maxN = 0;
    let minN = Number.POSITIVE_INFINITY;
    Object.entries(data).forEach(([_, sortData]) => {
        Object.entries(sortData).forEach(([__, d]) => {
            if (d.average > maxN) {
                maxN = d.average;
            }
            if (d.average < minN) {
                minN = d.average;
            }
        });
    });
    return { maxN, minN };
}

function getNumOpsPerSort(data: any): { [s: string]: number[]; } {
    const resultData = {};
    Object.entries(data).forEach(([sortName, sortData]) => {
        resultData[sortName] = Object.entries(sortData).map(([_, d]) => d.average);
    });
    return resultData;
}

export function view(action$: Stream<[IGraphState, IGraphState]>, state$: Stream<IGraphState>, domSource$: DOMSource) {
    // Get dimensions from previously rendered graph.
    const graphDimensions$ = domSource$.select('.PerformanceGraph-sections')
        .element()
        .map((e: Element) => ({ width: e.scrollWidth, height: e.scrollHeight }))
        .startWith({ width: 0, height: 0 }) as Stream<{ width: number, height: number }>;

    // Combine state and dimensions to create graph.
    const hover$ = action$.map(action => action[1]).startWith({ scale: 0 });
    const { maxN, minN } = getBoundaries(performanceData);
    const sortNumOps = getNumOpsPerSort(performanceData);
    return xs.combine(state$, graphDimensions$, hover$)
        .filter(([state, { width }, _]) => {
            return state.sortName !== undefined || width === 0;
        })
        .map(([state, { width, height }, hover]) => {
            const numOps = sortNumOps[state.sortName as string];
            const distancePerSize = width / (scaleToN(SCALE_4) + 10);
            const positions = state.sortName ? numOpsNormalized(numOps, minN, maxN)
                .map((normalizedNumOps, n) => numOpsToPos(normalizedNumOps, n + 1, distancePerSize, width, height)) : [];

            const otherSortPaths = Object.entries(sortNumOps)
                .filter(([iterSortName]) => iterSortName !== state.sortName)
                .map(([_, iterNumOps]) => numOpsNormalized(iterNumOps, minN, maxN)
                    .map((normalizedNumOps, n) => numOpsToPos(normalizedNumOps, n + 1, distancePerSize, width, height)))
                .map(pos => paths(pos, width, false))
                .reduce((acc, sels) => acc.concat(sels), []);
            const graphPaths = paths(positions, width);
            const graphPoints = points(positions, width, state.scale, hover.scale);
            const graphPointInfo = pointInfo(hover.scale, numOps);

            const graphContent = otherSortPaths.concat(graphPaths.concat(graphPoints));
            const segments = map(segment(), range(SCALE_1, SCALE_4 + 1));

            return div('.PerformanceGraph', [
                div('.PerformanceGraph-label', label('Number of Operations')),
                div('.PerformanceGraph-sections', [
                    div('.PerformanceGraph-graphBG', [
                        h('svg', { attrs: { height, width } }, graphContent),
                    ]),
                ].concat(segments)), div('.PerformanceGraph-label .PerformanceGraph-pointLabel', graphPointInfo),
                div(''), div('.PerformanceGraph-label', label('Number of Items')), div(''),
            ]);
        });
}

export default function PerformanceGraph(sources: ISources): ISinks {
    const state$ = sources.onion.state$ as any as Stream<IGraphState>;
    const action$ = intent(sources.dom);
    const reducers$ = model(action$, state$);
    const vdom$ = view(action$, state$, sources.dom);
    return {
        dom: vdom$,
        onion: reducers$,
    };
}
