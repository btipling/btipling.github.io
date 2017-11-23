import {
    div,
    DOMSource,
} from '@cycle/dom';
import xs, { Stream } from 'xstream';
import { ISinks, ISources, Reducer } from './typedefs';

import '../sass/performancegraph.sass';

const SCALE_1 = 1;
const SCALE_2 = 2;
const SCALE_3 = 3;
const SCALE_4 = 4;

export function intent(domSource: DOMSource): Stream<number> {
    const cn = 'PerformanceGraph-section';
    const f = (scale: number) => domSource.select(`.${cn}${scale}`).events('click').map((): number => scale);
    return xs.merge(
        f(SCALE_1),
        f(SCALE_2),
        f(SCALE_3),
        f(SCALE_4));
}

export function model(actions: Stream<number>, state: Stream<number>) {

    const initReducer$ = xs.of(function initReducer(_: number): number {
        return SCALE_1;
    });

    const addReducer$ = xs.merge(actions, state)
        .map(scale => function addReducer(_: number): number {
            return scale;
        });
    return xs.merge(initReducer$, addReducer$) as any as Stream<Reducer>;
}

export function view(state$: Stream<number>) {
    const cn = 'PerformanceGraph-section';
    return state$.map(currentScale => {
        const f = (scale: number) => div(`.${cn} ${cn}${scale} ${scale === currentScale ? `${cn}Active` : ''}`, '');
        return div('.PerformanceGraph', [
            f(SCALE_1),
            f(SCALE_2),
            f(SCALE_3),
            f(SCALE_4)]);
    });
}

export default function PerformanceGraph(sources: ISources): ISinks {
    const state$ = sources.onion.state$ as any as Stream<number>;
    const action$ = intent(sources.dom)
    const reducers$ = model(action$, state$);
    const vdom$ = view(state$);
    return {
        dom: vdom$,
        onion: reducers$,
    };
}
