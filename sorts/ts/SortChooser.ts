import {
    div,
    h1,
    hr,
    input,
    label,
} from '@cycle/dom';
import xs from 'xstream';
import { ISinks, ISources } from './typedefs';

export default function main(sources: ISources): ISinks {
    const vdom$ = sources.dom
        .select('.myinput').events('input')
        .map((ev: Event) => (ev.target as HTMLTextAreaElement).value)
        .startWith('')
        .map((name) =>
            div([
                label('Name:'),
                input('.myinput', {
                    attrs: {
                        type: 'text',
                    },
                }),
                hr(),
                h1(`Hello ${name}`),
            ]),
    );

    return {
        dom: vdom$,
        onion: xs.empty(),
    };
}
