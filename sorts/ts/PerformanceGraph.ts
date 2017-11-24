import {
    div,
    DOMSource,
    h,
} from '@cycle/dom';
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

export function view(state$: Stream<IGraphState>, domSource$: DOMSource) {

    const graph$ = domSource$.select('.PerformanceGraph')
        .element()
        .map((e: Element) => ({ width: e.scrollWidth, height: e.scrollHeight }))
        .startWith({ width: 0, height: 0 }) as Stream<{ width: number, height: number }>;
    return xs.combine(state$, graph$)
        .filter(([state, { width }]) => state.numOps !== undefined || width === 0)
        .map(([state, { width, height }]) => {
            // console.log('view');
            const distancePerSize = width / 210;
            const heightDistanceUnits = height / 100;
            let r = distancePerSize;
            if (r < 1) {
                r = 1;
            } else if (r > 50) {
                r = 50;
            }
            let strokeWidth = distancePerSize / 2;
            if (strokeWidth > 3) {
                strokeWidth = 3;
            }
            let circles: VNode[] = [];
            let d = '';
            if (state.numOps) {
                const max = heightDistanceUnits * 100;
                const positions = [
                    [distancePerSize * scaleToN(SCALE_1), `${max - state.numOps[0] * heightDistanceUnits}`],
                    [distancePerSize * scaleToN(SCALE_2), `${max - state.numOps[1] * heightDistanceUnits}`],
                    [distancePerSize * scaleToN(SCALE_3), `${max - state.numOps[2] * heightDistanceUnits}`],
                    [distancePerSize * scaleToN(SCALE_4), `${max - state.numOps[3] * heightDistanceUnits}`],
                ];
                circles = positions.map(([cx, cy]) => h('circle', {
                    attrs: {
                        cx,
                        cy,
                        'fill': '#2468F2',
                        r,
                        'stroke': 'transparent',
                        'stroke-width': 0,
                    },
                }));
                d = positions.reduce((acc, [x, y]: [number, number]) => `${acc} ${acc.length ? 'L' : 'M'}  ${x} ${y}`, '');
            }
            const f = segment();
            return div('.PerformanceGraph', [
                div('.PerformanceGraph-graphBG', [
                    h('svg', {
                        attrs: {
                            height,
                            width,
                        },
                    }, [
                        h('path', {
                            attrs: {
                                d,
                                'fill': 'transparent',
                                'stroke': '#83C7DE',
                                'stroke-width': strokeWidth,
                            },
                        }),
                    ].concat(circles)),
                ]),
                f(SCALE_1),
                f(SCALE_2),
                f(SCALE_3),
                f(SCALE_4)]);
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
