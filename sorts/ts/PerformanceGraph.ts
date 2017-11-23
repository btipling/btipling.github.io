import {
    div,
    DOMSource,
} from '@cycle/dom';
import xs, { Stream } from 'xstream';
import { IGraphState, ISinks, ISources, Reducer } from './typedefs';

import '../sass/performancegraph.sass';

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

export function view(state$: Stream<IGraphState>) {
    const cn = 'PerformanceGraph-section';
    return state$.map(currentScale => {
        const f = (scale: number) => div(`.${cn} ${cn}${scale} ${scale === currentScale.scale ? `${cn}Active` : ''}`, '');
        return div('.PerformanceGraph', [
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
    const vdom$ = view(state$);
    return {
        dom: vdom$,
        onion: reducers$,
    };
}
