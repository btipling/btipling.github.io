import {
    run
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
import { captureClicks, makeHashHistoryDriver } from '@cycle/history';
import xs, { Stream, MemoryStream } from 'xstream';
import { HistoryInput, Location } from '@cycle/history';

console.log('hello typescript');

export interface Sources {
    dom: DOMSource;
    history: MemoryStream<Location>;
}

export interface Sinks {
    dom: Stream<VNode>;
    history: Stream<HistoryInput | string>;
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
        history: xs.empty(),
    };
}

run(main, {
    dom: makeDOMDriver('#main'),
    history: captureClicks(makeHashHistoryDriver()),
})
