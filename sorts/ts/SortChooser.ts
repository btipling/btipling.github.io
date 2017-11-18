import {
    div,
    h1,
} from '@cycle/dom';
import isolate from '@cycle/isolate';
import xs from 'xstream';
import BubbleSort from './BubbleSort';
import { ISinks, ISources } from './typedefs';

export default function SortChooser(sources: ISources): ISinks {
    const bubbleSortSinks = isolate(BubbleSort, 'bubbleSort')(sources);

    const vdom$ = bubbleSortSinks.dom.map(bubbleSortDOM => div([
        h1(`Hello World?!`),
        bubbleSortDOM,
    ]));

    return {
        dom: vdom$,
        onion: xs.empty(),
    };
}
