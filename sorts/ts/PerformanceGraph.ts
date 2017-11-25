import {
    div,
    DOMSource,
    h,
    label,
} from '@cycle/dom';
import { map, max, min, range } from 'ramda';
import { VNode } from 'snabbdom/vnode';
import xs, { Stream } from 'xstream';
import { getSplines } from '../external/bezier-spline';
import '../sass/performancegraph.sass';
import { scaleToN } from './sortOps';
import { IGraphState, ISinks, ISources, Reducer } from './typedefs';

export const SCALE_1 = 1;
export const SCALE_2 = 2;
export const SCALE_3 = 3;
export const SCALE_4 = 4;

export function intent(domSource: DOMSource): Stream<[IGraphState, IGraphState]> {
    const cn = 'PerformanceGraph-section';
    const gen = f => xs.merge.apply(null, map(f, range(SCALE_1, SCALE_4 + 1)));

    const select = (scale, event, fn) => domSource.select(`.${cn}${scale}`).events(event).map(fn);
    const click = scale => select(scale, 'click', () => ({ scale })).startWith({ scale: SCALE_1 }) as any as Stream<IGraphState>;;
    const over = scale => select(scale, 'mouseover', () => ({ scale }));
    const out = scale => select(scale, 'mouseout', () => ({ scale: 0 }));
    const overout = xs.merge(gen(over), gen(out)).startWith({ scale: 0 }) as any as Stream<IGraphState>;

    return xs.combine(gen(click), overout);
}

export function model(actions$: Stream<[IGraphState, IGraphState]>, state: Stream<IGraphState>) {
    const initReducer$ = xs.of(function initReducer(_: IGraphState): IGraphState {
        return { scale: SCALE_1 };
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

function paths(positions: Array<[number, number]>, width: number): VNode[] {
    const strokeWidth = min(width / 100, 3);
    return getSplines(positions).map(d => path(d, strokeWidth));
}

function path(d: string, strokeWidth: number): VNode {
    return h('path', {
        attrs: {
            d,
            'fill': 'transparent',
            'stroke': '#83C7DE',
            'stroke-width': strokeWidth,
        },
    })
}

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

export function view(action$: Stream<[IGraphState, IGraphState]>, state$: Stream<IGraphState>, domSource$: DOMSource) {
    // Get dimensions from previously rendered graph.
    const graphDimensions$ = domSource$.select('.PerformanceGraph-sections')
        .element()
        .map((e: Element) => ({ width: e.scrollWidth, height: e.scrollHeight }))
        .startWith({ width: 0, height: 0 }) as Stream<{ width: number, height: number }>;

    // Combine state and dimensions to create graph.
    const hover$ = action$.map(action => action[1]).startWith({ scale: 0 });
    return xs.combine(state$, graphDimensions$, hover$)
        .filter(([state, { width }, _]) => {
            return state.numOps !== undefined || width === 0;
        })
        .map(([state, { width, height }, hover]) => {
            const distancePerSize = width / (scaleToN(SCALE_4) + 10);
            // numOps is a scale of range from 0 to 100, not the actual number of operations for the scale of that sort.
            const positions = state.numOps ? state.numOps.map((numOps, n) => numOpsToPos(numOps, n + 1, distancePerSize, width, height)) : [];
            const graphPaths = paths(positions, width);
            const graphPoints = points(positions, width, state.scale, hover.scale);
            const graphContent = graphPaths.concat(graphPoints);
            const segments = map(segment(), range(SCALE_1, SCALE_4 + 1));

            return div('.PerformanceGraph', [
                div('.PerformanceGraphYLabel', label('Number of Operations')),
                div('.PerformanceGraph-sections', [
                    div('.PerformanceGraph-graphBG', [
                        h('svg', { attrs: { height, width } }, graphContent),
                    ]),
                ].concat(segments)),
                div(''), div('.PerformanceGraphYLabel', label('Number of Items')),
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
