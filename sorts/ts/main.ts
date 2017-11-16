import {
    run,
} from '@cycle/run';
import {
    DOMSource,
    VNode,
    div,
    label,
    input,
    hr,
    h1,
    makeDOMDriver
} from '@cycle/dom';
import onionify, { MainFn, StateSource } from 'cycle-onionify';
import { captureClicks, makeHashHistoryDriver } from '@cycle/history';
import xs, { Stream, MemoryStream } from 'xstream';
import { HistoryInput, Location } from '@cycle/history';

console.log('hello typescript with onionify.');

interface State {
    content: string;
}

export interface Sources {
    dom: DOMSource;
    onion: StateSource<State>;
}

type Reducer = (prev?: State) => State | undefined;

export interface Sinks {
    dom: Stream<VNode>;
    onion: Stream<Reducer>;
}

function main(sources: Sources): Sinks {
    const vdom$ = sources.dom
        .select('.myinput').events('input')
        .map((ev: Event) => (<HTMLTextAreaElement>ev.target).value)
        .startWith('')
        .map(name =>
            div([
                label('Name:'),
                input('.myinput', {
                    attrs: {
                        type: 'text'
                    }
                }),
                hr(),
                h1(`Hello ${name}`)
            ])
        );

    return {
        dom: vdom$,
        onion: xs.empty(),
    };
}
const wrappedMain = onionify(main);

run(wrappedMain, {
    dom: makeDOMDriver('#main'),
    history: captureClicks(makeHashHistoryDriver()),
})
