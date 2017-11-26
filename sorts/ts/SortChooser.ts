import {
    a,
    div,
    VNode,
} from '@cycle/dom';
import xs, { Stream } from 'xstream';
import { Component, IRoute, ISinks } from './typedefs';

import '../sass/sortchooser.sass';

function view(routes: IRoute[]): Stream<VNode> {
    return xs.of(
        div('.SortChooser', routes.map(({ path, name }) => a({ attrs: { href: path } }, name))));
}

export default function SortChooser(routes: IRoute[]): Component {
    return (): ISinks => {

        const vdom$ = view(routes);

        return {
            dom: vdom$,
            onion: xs.empty(),
        };
    };
}
