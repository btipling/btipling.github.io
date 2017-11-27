import {
    div,
    VNode,
} from '@cycle/dom';
import isolate from '@cycle/isolate';
import xs, { Stream } from 'xstream';
import PerformanceGraph from './PerformanceGraph';
import SortChooser from './SortChooser';
import SpeedChooser from './SpeedChooser';
import { Component, IRoute, ISinks, ISources, IState } from './typedefs';

import '../sass/sortdemo.sass';
import '../sass/sortview.sass';

export interface IState {
    content: string;
}
export type Reducer = (prev?: IState) => IState | undefined;

function view(listVNode$: Stream<[VNode, VNode, VNode, VNode]>): Stream<VNode> {
    return listVNode$.map(([controls, sortDemo, graphNode, sortChooserNode]) => {
        return div('.SortView', [
            div('.SortView-demo', [
                div('.SortView-controls', [controls]),
                sortDemo,
                div(''),
            ]),
            sortChooserNode,
            div('.SortView-graph', graphNode),
        ]);
    });
}

export default function SortView(route: IRoute, routes: IRoute[]): Component {
    return (sources: ISources): ISinks => {
        const sortSinks = route.component(sources as any);
        const speedSinks = isolate(SpeedChooser, 'speedChooser')(sources as any);
        const graphSinks = isolate(PerformanceGraph, 'graph')(sources as any);
        const sortChooser = SortChooser(route, routes)(sources as any);

        const sortReducer$ = sortSinks.onion as any as Stream<Reducer>;
        const speedReducer$ = speedSinks.onion as any as Stream<Reducer>;
        const graphReducer$ = graphSinks.onion as any as Stream<Reducer>;

        const reducer$ = xs.merge(sortReducer$, speedReducer$, graphReducer$);
        const vdom$ = view(xs.combine(speedSinks.dom, sortSinks.dom, graphSinks.dom, sortChooser.dom));
        return {
            dom: vdom$,
            onion: reducer$,
        };
    };
}
