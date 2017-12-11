import {
    div,
    VNode,
} from '@cycle/dom';
import isolate from '@cycle/isolate';
import { TimeSource } from '@cycle/time';
import { makeCollection } from 'cycle-onionify';
import xs, { Stream } from 'xstream';
import { SCALE_1, SCALE_2, SCALE_3, SCALE_4 } from '../constants';
import { makeSortData, makeSortDemoData } from '../sortUtils';
import { Component, IRoute, ISinks, ISorter, ISources, IState, MakeSortDataFunc } from '../typedefs';
import PerformanceGraph from './PerformanceGraph';
import SortChooser from './SortChooser';
import SortDemo from './SortDemo';
import SpeedChooser, { SPEED_1X, SPEED_2X, SPEED_3X, SPEED_4X, SPEED_5X } from './SpeedChooser';

import '../../sass/sortview.sass';

export interface IState {
    content: string;
}
export type Reducer = (prev?: IState) => IState | undefined;

export function ticker(time$: TimeSource, speedChooser: { speed: number }): Stream<any> {
    const speedChoice = speedChooser ? speedChooser.speed : SPEED_4X;
    let speed;
    if (speedChoice === SPEED_5X) {
        return time$.animationFrames();
    }
    switch (speedChoice) {
        case SPEED_1X:
            speed = 1000;
            break;
        case SPEED_2X:
            speed = 750;
            break;
        case SPEED_3X:
            speed = 500;
            break;
        case SPEED_4X:
        default:
            speed = 250;
            break;
    }
    return time$.periodic(speed);
}

export function sortComponentDemoList(): Component {
    return makeCollection({
        collectSinks: (instances: any) => ({
            dom: instances.pickCombine('dom')
                .map((itemVNodes: VNode[]) => itemVNodes),
            onion: instances.pickMerge('onion'),
        }),
        item: SortDemo,
        itemKey: (_: any, index: number) => index.toString(),
        itemScope: (key: string) => key,
    });
}

export function model(numOps: number[], genSort: (scale: number, makeSortData: MakeSortDataFunc) => ISorter, time$: TimeSource) {
    return (state$: Stream<any>): Stream<Reducer> => {
        const mf: MakeSortDataFunc = makeSortData();
        const initialReducer$ = xs.of(() => {
            return mf(makeSortDemoData([], 0, [], []));
        });
        let sorter: ISorter;
        const addOneReducer$ = state$
            .map(({ list, speedChooser }) => ticker(time$, speedChooser).mapTo({ list, speedChooser }))
            .flatten()
            .mapTo(({ speedChooser, graph }) => {
                if (!sorter) {
                    sorter = genSort(graph.scale, mf);
                }
                if (sorter.scale !== graph.scale) {
                    sorter = genSort(graph.scale, mf);
                }
                let value = sorter.sorter.next();
                if (value.done) {
                    sorter = genSort(graph.scale, mf);
                    value = sorter.sorter.next();
                }
                graph.numOps = numOps;
                return Object.assign(value.value, { speedChooser, graph });
            });
        return xs.merge(initialReducer$, addOneReducer$) as any as Stream<Reducer>;
    };
}

function view(listVNode$: Stream<[VNode, VNode[], VNode, VNode]>): Stream<VNode> {
    return listVNode$.map(([controls, sortDemos, graphNode, sortChooserNode]) => {
        return div('.SortView', [
            div('.SortView-demoContainer', [
                div('.SortView-controls', [controls]),
                div({
                    class: {
                        'SortView-demo': true,
                    },
                    style: {
                        'grid-template-rows': `repeat(${sortDemos.length}, 1fr)`,
                    },
                }, sortDemos),
            ]),
            sortChooserNode,
            div('.SortView-graph', graphNode),
        ]);
    });
}

export default function SortView(route: IRoute, routes: IRoute[]): Component {
    return (sources: ISources): ISinks => {
        const state$ = sources.onion.state$;
        const time$ = sources.Time;

        const { genSortScales, genSort } = route.sort;
        const numOps = genSortScales([SCALE_1, SCALE_2, SCALE_3, SCALE_4]);
        console.log('numOps', numOps);
        const speedSinks = isolate(SpeedChooser, 'speedChooser')(sources as any);
        const graphSinks = isolate(PerformanceGraph, 'graph')(sources as any);
        const sortChooser = SortChooser(route, routes)(sources as any);

        const List = sortComponentDemoList();
        const listSinks = isolate(List, 'lists')(sources as any);

        const sortReducer$ = model(numOps, genSort, time$)(state$);
        const speedReducer$ = speedSinks.onion as any as Stream<Reducer>;
        const graphReducer$ = graphSinks.onion as any as Stream<Reducer>;

        const reducer$ = xs.merge(sortReducer$, speedReducer$, graphReducer$);
        const vdom$ = view(xs.combine(speedSinks.dom, listSinks.dom, graphSinks.dom, sortChooser.dom));
        return {
            dom: vdom$,
            onion: reducer$,
        };
    };
}
