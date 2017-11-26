import {
    div,
    h2,
    VNode,
} from '@cycle/dom';
import isolate from '@cycle/isolate';
import xs, { Stream } from 'xstream';
import BubbleSort from './BubbleSort';
import PerformanceGraph from './PerformanceGraph';
import SpeedChooser from './SpeedChooser';
import { ISinks, ISources, IState } from './typedefs';

import '../sass/sortview.sass';

export interface IState {
    content: string;
}
export type Reducer = (prev?: IState) => IState | undefined;

function view(listVNode$: Stream<[VNode, VNode, VNode]>): Stream<VNode> {
    return listVNode$.map(([controls, sortDemo, graphNode]) => {
        return div('.SortView', [
            div('.SortView-demo', [
                div('.SortView-controls', [controls]),
                sortDemo,
                div(''),
            ]),
            h2('Bubble Sort'),
            div('.SortView-graph', graphNode),
        ]);
    });
}

export default function SortView(sources: ISources): ISinks {

    const sortSinks = BubbleSort(sources as any);
    const speedSinks = isolate(SpeedChooser, 'speedChooser')(sources as any);
    const graphSinks = isolate(PerformanceGraph, 'graph')(sources as any);

    const sortReducer$ = sortSinks.onion as any as Stream<Reducer>;
    const speedReducer$ = speedSinks.onion as any as Stream<Reducer>;
    const graphReducer$ = graphSinks.onion as any as Stream<Reducer>;

    const reducer$ = xs.merge(sortReducer$, speedReducer$, graphReducer$);
    const vdom$ = view(xs.combine(speedSinks.dom, sortSinks.dom, graphSinks.dom));
    return {
        dom: vdom$,
        onion: reducer$,
    };
}
