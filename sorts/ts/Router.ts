
import { Location } from 'history';
import { Component, ISinks, ISources } from './typedefs';

export default function Router(routes: { [key: string]: Component; }): Component {
    return (sources: ISources): ISinks => {
        const history$ = sources.history;

        const routeSinks: { [key: string]: ISinks } = {};
        const runRoute = (pathname: string): ISinks => {
            if (!routeSinks.hasOwnProperty(pathname)) {
                routeSinks[pathname] = routes[pathname](sources);
            }
            return routeSinks[pathname];
        };
        return {
            dom: history$.map(
                (location: Location) => runRoute(location.pathname).dom).flatten(),
            onion: history$.map(
                (location: Location) => runRoute(location.pathname).onion).flatten(),
        };
    };
}
