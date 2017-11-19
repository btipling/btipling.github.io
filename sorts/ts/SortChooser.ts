import {
    a,
    div,
    p,
} from '@cycle/dom';
import xs from 'xstream';
import { ISinks, ISources } from './typedefs';

export default function SortChooser(_: ISources): ISinks {
    const vdom$ = xs.of(div([
        p('Choose a sort.'),
        a({ props: { href: './bubblesort' } }, 'bubble sort'),
    ]));

    return {
        dom: vdom$,
        onion: xs.empty(),
    };
}
