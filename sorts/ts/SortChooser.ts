import {
    a,
    div,
    h2,
    li,
    ul,
} from '@cycle/dom';
import xs from 'xstream';
import { Component, IRoute, ISinks } from './typedefs';

import '../sass/sortchooser.sass';

export default function SortChooser(route: IRoute, routes: IRoute[]): Component {
    return (): ISinks => {
        if (!route.name) {
            // If the current route is the default home page route, find its actual route information.
            route = routes.find(({ component }) => route.component === component) as IRoute;
        }
        const vdom$ = xs.of(div('.SortChooser', [
            h2(route.name),
            ul('.SortChooser-list',
                routes
                    .filter(({ name }) => name !== route.name && name.length)
                    .map(({ path, name }) => li(a({ attrs: { href: path } }, name))),
            ),
        ]));

        return {
            dom: vdom$,
            onion: xs.empty(),
        };
    };
}
