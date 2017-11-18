import {
    h2,
} from '@cycle/dom';
import xs from 'xstream';
import { ISinks, ISources } from './typedefs';

export default function BubbleSort(_: ISources): ISinks {
    const vdom$ = xs.of(h2('BubbleSort!'));

    return {
        dom: vdom$,
        onion: xs.empty(),
    };
}
