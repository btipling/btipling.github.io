
import { Location } from 'history';
import { hasIn, reduce } from 'ramda';
import { Component, IRoute, ISinks, ISources } from './typedefs';

interface IRouteSinksMap { [key: string]: ISinks; }
type SortView = (Sort: Component, routes: IRoute[]) => Component;

export function runRouter(routes: IRoute[], sources: ISources, routeSinks: IRouteSinksMap, sortView: SortView) {
    const routesMap = reduce((acc, route) => Object.assign({ [route.path]: route.component }, acc), {}, routes);
    return (pathname: string): ISinks => {
        if (!hasIn(pathname, routeSinks)) {
            routeSinks[pathname] = sortView(routesMap[pathname], routes)(sources);
        }
        return routeSinks[pathname];
    };
}

export default function Router(routes: IRoute[], sortView: SortView): Component {
    return (sources: ISources): ISinks => {
        const history$ = sources.history;
        const runRoute = runRouter(routes, sources, {}, sortView);

        return {
            dom: history$.map(
                (location: Location) => runRoute(location.pathname).dom).flatten(),
            onion: history$.map(
                (location: Location) => runRoute(location.pathname).onion).flatten(),
        };
    };
}
