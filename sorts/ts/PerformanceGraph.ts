import {
    div,
    DOMSource,
    h,
    label,
} from '@cycle/dom';
import { map, max, min, range, reduce } from 'ramda';
import { VNode } from 'snabbdom/vnode';
import xs, { Stream } from 'xstream';
import '../sass/performancegraph.sass';
import { scaleToN } from './sortOps';
import { IGraphState, ISinks, ISources, Reducer } from './typedefs';

export const SCALE_1 = 1;
export const SCALE_2 = 2;
export const SCALE_3 = 3;
export const SCALE_4 = 4;

export function intent(domSource: DOMSource): Stream<IGraphState> {
    const cn = 'PerformanceGraph-section';
    const f = (scale: number) => domSource.select(`.${cn}${scale}`).events('click').map((): IGraphState => ({ scale }));
    return xs.merge(
        f(SCALE_1),
        f(SCALE_2),
        f(SCALE_3),
        f(SCALE_4));
}

export function model(actions: Stream<IGraphState>, state: Stream<IGraphState>) {

    const initReducer$ = xs.of(function initReducer(_: IGraphState): IGraphState {
        return { scale: SCALE_1 };
    });

    const addReducer$ = xs.merge(actions, state)
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

function points(positions: Array<[number, number]>, width: number): VNode[] {
    const r = min(15, max(1, width / 100));
    return map(([cx, cy]) => point(cx, cy, r), positions);
}

function point(cx: number, cy: number, r: number): VNode {
    return h('circle', {
        attrs: {
            cx,
            cy,
            'fill': '#2468F2',
            r,
            'stroke': 'transparent',
            'stroke-width': 0,
        },
    });
}

function path(positions: Array<[number, number]>, width: number): VNode {
    const strokeWidth = min(width / 100, 3);
    const d = reduce((acc, [x, y]: [number, number]) => `${acc} ${acc.length ? 'L' : 'M'}  ${x} ${y}`, '', positions);
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

export function view(state$: Stream<IGraphState>, domSource$: DOMSource) {
    // Get dimensions from previously rendered graph.
    const graphDimensions$ = domSource$.select('.PerformanceGraph-sections')
        .element()
        .map((e: Element) => ({ width: e.scrollWidth, height: e.scrollHeight }))
        .startWith({ width: 0, height: 0 }) as Stream<{ width: number, height: number }>;

    // Combine state and dimensions to create graph.
    return xs.combine(state$, graphDimensions$)
        .filter(([state, { width }]) => state.numOps !== undefined || width === 0)
        .map(([state, { width, height }]) => {
            const distancePerSize = width / (scaleToN(SCALE_4) + 10);
            // numOps is a scale of range from 0 to 100, not the actual number of operations for the scale of that sort.
            const positions = state.numOps ? state.numOps.map((numOps, n) => numOpsToPos(numOps, n + 1, distancePerSize, width, height)) : [];
            const graphPath = path(positions, width);
            const graphPoints = points(positions, width);
            const graphContent = [graphPath].concat(graphPoints);
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
    const vdom$ = view(state$, sources.dom);
    return {
        dom: vdom$,
        onion: reducers$,
    };
}
