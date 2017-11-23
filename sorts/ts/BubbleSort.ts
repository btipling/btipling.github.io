import {
    div,
    h2,
    VNode,
} from '@cycle/dom';
import isolate from '@cycle/isolate';
import { makeCollection } from 'cycle-onionify';
import { times } from 'ramda';
import xs, { Stream } from 'xstream';
import BubbleSortItem from './BubbleSortItem';
import PerformanceGraph, { SCALE_1, SCALE_2, SCALE_3, SCALE_4 } from './PerformanceGraph';
import SpeedChooser, { SPEED_1X, SPEED_2X, SPEED_3X, SPEED_4X, SPEED_5X } from './SpeedChooser';
import { IBubbleState, ISinks, ISorter, ISources } from './typedefs';

import '../sass/bubblesort.sass';

export interface IState {
    content: string;
}
export type Reducer = (prev?: IState) => IState | undefined;

export function makeSortData(arrayData: number[], compareAIndex: number, compareBIndex: number, compare: number, highlighted: number): IBubbleState {
    return {
        compare,
        graph: { scale: SCALE_1 },
        list: arrayData.map((value, index) => ({ compare, highlighted, index, value, compareAIndex, compareBIndex })),
        speedChooser: { speed: SPEED_4X },
    };
}

export function* bubbleSort(unsortedArray: number[]): Iterator<IBubbleState> {
    const len = unsortedArray.length;
    const sortedArray = ([] as number[]).concat(unsortedArray);
    let j = 0;
    for (let i = 0; i < len; i++) {
        yield makeSortData(sortedArray, i, j, sortedArray[i], sortedArray[i]);
        for (j = i + 1; j < len; j++) {
            const itemA = sortedArray[i];
            const itemB = sortedArray[j];
            if (itemB < itemA) {
                yield makeSortData(sortedArray, i, j, sortedArray[i], sortedArray[i]);
                yield makeSortData(sortedArray, i, j, sortedArray[i], sortedArray[j]);
                yield makeSortData(sortedArray, i, j, sortedArray[j], sortedArray[j]);
                sortedArray[i] = itemB;
                sortedArray[j] = itemA;
            }
            yield makeSortData(sortedArray, i, j, sortedArray[i], sortedArray[i]);
        }
    }
    // Twice for 2 frames.
    yield makeSortData(sortedArray, len, len, sortedArray[len], sortedArray[len]);
    yield makeSortData(sortedArray, len, len, sortedArray[len], sortedArray[len]);
}

function scaleToN(scale: number): number {
    switch (scale) {
        case SCALE_2:
            return 50;
        case SCALE_3:
            return 100;
        case SCALE_4:
            return 200;
        case SCALE_1:
        default:
            return 20;
    }
}

function genBubbleSort(scale: number): ISorter {
    return {
        scale,
        sorter: bubbleSort(times(() => Math.floor((Math.random() * 99) + 1), scaleToN(scale))),
    };
}

function model(state$: Stream<any>): Stream<Reducer> {
    let sorter: ISorter;
    const initialReducer$ = xs.of(() => {
        return makeSortData([], 0, 0, 0, 0);
    });
    const addOneReducer$ = state$.map(({ list, speedChooser }) => {
        const speedChoice = speedChooser ? speedChooser.speed : SPEED_4X;
        let speed;
        switch (speedChoice) {
            case SPEED_1X:
                speed = 1000;
                break;
            case SPEED_2X:
                speed = 500;
                break;
            case SPEED_3X:
                speed = 250;
                break;
            case SPEED_5X:
                speed = 50;
                break;
            case SPEED_4X:
            default:
                speed = 100;
                break;
        }
        return xs.periodic(speed).mapTo({ list, speedChooser });
    }).flatten()
        .mapTo(({ speedChooser, graph }) => {
            if (!sorter) {
                sorter = genBubbleSort(graph.scale);
            }
            if (sorter.scale !== graph.scale) {
                sorter = genBubbleSort(graph.scale);
            }
            let value = sorter.sorter.next();
            if (value.done) {
                sorter = genBubbleSort(graph.scale);
                value = sorter.sorter.next();
            }
            return Object.assign(value.value, { speedChooser, graph });
        });

    return xs.merge(initialReducer$, addOneReducer$) as any as Stream<Reducer>;
}

function view(listVNode$: Stream<[IState, VNode, VNode[], VNode]>): Stream<VNode> {
    return listVNode$.map(([state, controls, listItems, graphNode]) => {
        const { compare } = state as any as IBubbleState;
        return div('.BubbleSort', [
            div('.BubbleSort-demo', [
                div('.BubbleSort-controls', [controls]),
                div({
                    class: {
                        'BubbleSort-listContainer': true,
                    },
                    style: {
                        'grid-template-columns': `repeat(${listItems.length}, 1fr)`,
                    },
                }, listItems),
                div({
                    class: {
                        'BubbleSort-compareAt': true,
                    },
                    style: {
                        bottom: `${compare}%`,
                    },
                }),
            ]),
            h2('The Bubble Sort'),
            div('.BubbleSort-graph', graphNode),
        ]);
    });
}

export default function BubbleSort(sources: ISources): ISinks {
    // Defining the list of items to be sorted.
    const state$ = sources.onion.state$;
    // state$.subscribe({ complete: console.log, error: console.log, next: console.log });
    const List = makeCollection({
        collectSinks: (instances: any) => ({
            dom: instances.pickCombine('dom')
                .map((itemVNodes: VNode[]) => itemVNodes),
            onion: instances.pickMerge('onion'),
        }),
        item: BubbleSortItem,
        itemKey: (_: any, index: number) => index.toString(),
        itemScope: (key: string) => key,
    });
    const listSinks = isolate(List, 'list')(sources as any);
    const speedSinks = isolate(SpeedChooser, 'speedChooser')(sources as any);
    const graphSinks = isolate(PerformanceGraph, 'graph')(sources as any);

    const speedReducer$ = speedSinks.onion as any as Stream<Reducer>;
    const graphReducer$ = graphSinks.onion as any as Stream<Reducer>;

    const reducer$ = xs.merge(model(state$), speedReducer$, graphReducer$);
    const vdom$ = view(xs.combine(state$, speedSinks.dom, listSinks.dom, graphSinks.dom));
    return {
        dom: vdom$,
        onion: reducer$,
    };
}
