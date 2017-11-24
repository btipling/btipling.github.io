import {
    div,
    DOMSource,
    h,
} from '@cycle/dom';
import { VNode } from 'snabbdom/vnode';
import xs, { Stream } from 'xstream';
import '../sass/performancegraph.sass';
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

    return xs.combine(state$, graph$).map(([_, { width, height }]) => {
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
                                'd': 'M 0 10 L 400 10 C 40 10, 65 10, 95 80 S 150 150, 180 80',
                                'fill': 'transparent',
                                'stroke': 'lightblue',
                                'stroke-width': 3,
                            }
                        }),
                    ]),
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
