import {
    button,
    div,
    DOMSource,
    label,
    VNode,
} from '@cycle/dom';
import xs, { Stream } from 'xstream';
import { ISinks, ISources, Reducer } from './typedefs';

import '../sass/speedchooser.sass';

export const SPEED_1X = 1;
export const SPEED_2X = 2;
export const SPEED_3X = 3;
export const SPEED_4X = 4;
export const SPEED_5X = 5;

export interface ISpeedOption { speed: number; }

function intent(domSource: DOMSource): Stream<ISpeedOption> {
    const f = speed => domSource.select(`.SpeedChooser-${speed}x`).events('click').map(() => ({ speed }));
    return xs.merge(
        f(SPEED_1X),
        f(SPEED_2X),
        f(SPEED_3X),
        f(SPEED_4X),
        f(SPEED_5X));
}

function model(actions: Stream<ISpeedOption>): Stream<Reducer> {
    const initReducer$ = xs.of(function initReducer(_: ISpeedOption): ISpeedOption {
        return defaultSpeed();
    });

    const addReducer$ = actions
        .map(content => function addReducer(_: ISpeedOption): ISpeedOption {
            return content;
        });
    return xs.merge(initReducer$, addReducer$) as any as Stream<Reducer>;
}

function view(speed$: Stream<ISpeedOption>): Stream<VNode> {
    return speed$.map(({ speed }) => {
        const cn = 'SpeedChooser';
        const f = s => div(button(`.${cn}-choice ${cn}-${s}x ${s === speed ? `.${cn}-selected` : ''}`, `${s}x`));
        return div('.SpeedChooser', [
            label('.SpeedChooser-label', 'Speed'),
            f(SPEED_1X),
            f(SPEED_2X),
            f(SPEED_3X),
            f(SPEED_4X),
            f(SPEED_5X)]);
    });
}

export function defaultSpeed(): { speed: number } {
    return { speed: SPEED_3X };
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
