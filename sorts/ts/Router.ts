
import { Location } from 'history';
import { hasIn, reduce } from 'ramda';
import { Component, IRoute, ISinks, ISources } from './typedefs';

interface IRouteSinksMap { [key: string]: ISinks; }

export function runRouter(routes: IRoute[], sources: ISources, routeSinks: IRouteSinksMap) {
    const routesMap = reduce((acc, route) => Object.assign({ [route.path]: route.component }, acc), {}, routes);
    return (pathname: string): ISinks => {
        if (!hasIn(pathname, routeSinks)) {
            routeSinks[pathname] = routesMap[pathname](sources);
        }
        return routeSinks[pathname];
    };
}

export default function Router(routes: IRoute[]): Component {
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
