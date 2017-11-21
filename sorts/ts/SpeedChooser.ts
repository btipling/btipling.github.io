import {
    button,
    div,
    DOMSource,
    VNode,
} from '@cycle/dom';
import xs, { Stream } from 'xstream';
import { ISinks, ISources, Reducer } from './typedefs';

import '../sass/speedchooser.sass';

export const SPEED_1X = 1;
export const SPEED_2X = 2;
export const SPEED_3X = 3;

export interface ISpeedOption { speed: number; }

function intent(domSource: DOMSource): Stream<ISpeedOption> {
    const speed1X$ = domSource.select('.SpeedChooser-1x')
        .events('click')
        .map(() => ({ speed: SPEED_1X }));
    const speed2X$ = domSource.select('.SpeedChooser-2x')
        .events('click')
        .map(() => ({ speed: SPEED_2X }));
    const speed3X$ = domSource.select('.SpeedChooser-3x')
        .events('click')
        .map(() => ({ speed: SPEED_3X }));
    return xs.merge(speed1X$, speed2X$, speed3X$);
}

function model(actions: Stream<ISpeedOption>): Stream<Reducer> {
    const initReducer$ = xs.of(function initReducer(_: ISpeedOption): ISpeedOption {
        return { speed: SPEED_2X };
    });

    const addReducer$ = actions
        .map(content => function addReducer(_: ISpeedOption): ISpeedOption {
            return content;
        });
    return xs.merge(initReducer$, addReducer$) as any as Stream<Reducer>;
}

function view(speed$: Stream<ISpeedOption>): Stream<VNode> {
    return speed$.map(({ speed }) => div('.SpeedChooser', [
        div(button(`.SpeedChooser-1x ${speed === SPEED_1X ? '.SpeedChooser-selected' : ''}`, '1X')),
        div(button(`.SpeedChooser-2x ${speed === SPEED_2X ? '.SpeedChooser-selected' : ''}`, '2X')),
        div(button(`.SpeedChooser-3x ${speed === SPEED_3X ? '.SpeedChooser-selected' : ''}`, '3X')),
    ]));
}

export default function SpeedChooser(sources: ISources): ISinks {

    const state$ = sources.onion.state$;

    const action$ = intent(sources.dom);
    const reducers$ = model(action$);
    const vdom$ = view(state$ as any as Stream<ISpeedOption>);

    return {
        dom: vdom$,
        onion: reducers$,
    };
}
