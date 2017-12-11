
import { Location } from 'history';
import { reduce } from 'ramda';
import { Component, IRoute, ISinks, ISources } from '../typedefs';

type SortView = (route: IRoute, routes: IRoute[]) => Component;

export function runRouter(routes: IRoute[], sources: ISources, sortView: SortView) {
    const routesMap = reduce((acc, route) => Object.assign({ [route.path]: route }, acc), {}, routes);
    return (pathname: string): ISinks => {
        // let loc = pathname;
        // const deployedPath = '/sorts';
        // if (loc.indexOf(deployedPath) !== -1) {
        //     loc = loc.slice(deployedPath.length);
        // }
        return sortView(routesMap[pathname], routes)(sources);
    }
}

export default function Router(routes: IRoute[], sortView: SortView): Component {
    return (sources: ISources): ISinks => {
        const history$ = sources.history;
        const runRoute = runRouter(routes, sources, sortView);
        return {
            dom: history$.map(
                (location: Location) => runRoute(location.pathname).dom).flatten(),
            onion: history$.map(
                (location: Location) => runRoute(location.pathname).onion).flatten(),
        };
    };
}
