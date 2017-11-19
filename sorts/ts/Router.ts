
import { Location } from 'history';
import { Component, ISinks, ISources } from './typedefs';

export default function Router(routes: { [key: string]: Component; }): Component {
    return (sources: ISources): ISinks => {
        const history$ = sources.history;

        // This function exists to avoid calling a component function twice.
        let routerResult: ISinks;
        const runRoute = (pathname: string, previous: boolean): ISinks => {
            if (previous && routerResult !== undefined) {
                return routerResult;
            }
            routerResult = routes[pathname](sources);
            return routerResult;
        };
        return {
            dom: history$.map(
                (location: Location) => runRoute(location.pathname, false).dom).flatten(),
            onion: history$.map(
                (location: Location) => runRoute(location.pathname, true).onion).flatten(),
        };
    };
}
