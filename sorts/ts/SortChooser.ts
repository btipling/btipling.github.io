import {
    a,
    div,
    p,
} from '@cycle/dom';
import { Location } from 'history';
import xs from 'xstream';
import { ISinks, ISources } from './typedefs';

export default function SortChooser(sources: ISources): ISinks {
    const history$ = sources.history;

    const vdom$ = history$.map((path: Location) => {
        console.log(path);
        return div([
            p('Choose a sort.'),
            a({ props: { href: './bubblesort' } }, 'bubble sort'),
        ]);
    });

    return {
        dom: vdom$,
        onion: xs.empty(),
    };
}
