
import { Location } from 'history';
import { hasIn } from 'ramda';
import { Component, ISinks, ISources } from './typedefs';

interface IRoutesMap { [key: string]: Component; }
interface IRouteSinksMap { [key: string]: ISinks; };

export function runRouter(routes: IRoutesMap, sources: ISources, routeSinks: IRouteSinksMap) {
    return (pathname: string): ISinks => {
        if (!hasIn(pathname, routeSinks)) {
            routeSinks[pathname] = routes[pathname](sources);
        }
        return routeSinks[pathname];
    };
}

export default function Router(routes: IRoutesMap): Component {
    return (sources: ISources): ISinks => {
        const history$ = sources.history;
        const runRoute = runRouter(routes, sources, {});

        return {
            dom: history$.map(
                (location: Location) => runRoute(location.pathname).dom).flatten(),
            onion: history$.map(
                (location: Location) => runRoute(location.pathname).onion).flatten(),
        };
    };
}
