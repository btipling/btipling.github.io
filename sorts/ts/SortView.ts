import {
    div,
    h2,
    VNode,
} from '@cycle/dom';
import isolate from '@cycle/isolate';
import { makeCollection } from 'cycle-onionify';
// import { times } from 'ramda';
import xs, { Stream } from 'xstream';
import BubbleSortItem from './BubbleSortItem';
import PerformanceGraph, { SCALE_1, SCALE_2, SCALE_3, SCALE_4 } from './PerformanceGraph';
import { randArrayOfNumbers, ticker } from './sortUtils';
import SpeedChooser, { defaultSpeed } from './SpeedChooser';
import { IBubbleState, ISinks, ISorter, ISources } from './typedefs';

import '../sass/sortview.sass';

export interface IState {
    content: string;
}
export type Reducer = (prev?: IState) => IState | undefined;

export function makeSortData(
    arrayData: number[],
    compareAIndex: number,
    compareBIndex: number,
    compare: number,
    highlighted: number,
    numOps: number[]): IBubbleState {
    return {
        compare,
        graph: { scale: SCALE_1 },
        list: arrayData.map((value, index) => ({ compare, highlighted, index, value, compareAIndex, compareBIndex })),
        numOps,
        speedChooser: defaultSpeed(),
    };
}

export function* bubbleSort(unsortedArray: number[], numOps: number[]): Iterator<IBubbleState> {
    const len = unsortedArray.length;
    const sortedArray = ([] as number[]).concat(unsortedArray);
    let a = 0;
    let b = 0;
    for (let i = len; i > 0; i--) {
        let swapped = false;
        yield makeSortData(sortedArray, a, b, sortedArray[b], sortedArray[b], numOps);
        for (let j = 0; j < i - 1; j++) {
            a = j;
            b = j + 1;
            const itemA = sortedArray[a];
            const itemB = sortedArray[b];
            yield makeSortData(sortedArray, a, b, sortedArray[a], sortedArray[a], numOps);
            if (itemB < itemA) {
                sortedArray[a] = itemB;
                sortedArray[b] = itemA;
                yield makeSortData(sortedArray, b, a, sortedArray[b], sortedArray[b], numOps);
                swapped = true;
            } else {
                yield makeSortData(sortedArray, b, -1, sortedArray[b], sortedArray[b], numOps);
            }
        }
        if (!swapped) {
            break;
        }
    }
    // Twice for 2 frames.
    yield makeSortData(sortedArray, len, len, -1, sortedArray[len], numOps);
    yield makeSortData(sortedArray, len, len, -1, sortedArray[len], numOps);
}
function genBubbleSort(scale: number, numOps: number[]): ISorter {
    return {
        scale,
        sorter: bubbleSort(randArrayOfNumbers(scale), numOps),
    };
}

function bubbleSortOpCounter(scale: number): number {
    let count = 0;
    const len = randArrayOfNumbers(scale).length;
    for (let i = len; i > 0; i--) {
        for (let j = 0; j < i - 1; j++) {
            count += 1;
        }
    }
    return count;
}

function genSortScales(scales: number[]): number[] {
    return scales.map(bubbleSortOpCounter);
}

function model(state$: Stream<any>): Stream<Reducer> {
    let sorter: ISorter;
    const numOps = genSortScales([SCALE_1, SCALE_2, SCALE_3, SCALE_4]);
    const initialReducer$ = xs.of(() => {
        return makeSortData([], 0, 0, 0, 0, numOps);
    });
    const addOneReducer$ = state$
        .map(({ list, speedChooser }) => ticker(speedChooser).mapTo({ list, speedChooser }))
        .flatten()
        .mapTo(({ speedChooser, graph }) => {
            if (!sorter) {
                sorter = genBubbleSort(graph.scale, numOps);
            }
            if (sorter.scale !== graph.scale) {
                sorter = genBubbleSort(graph.scale, numOps);
            }
            let value = sorter.sorter.next();
            if (value.done) {
                sorter = genBubbleSort(graph.scale, numOps);
                value = sorter.sorter.next();
            }
            graph.numOps = numOps;
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
                        visibility: compare >= 0 ? 'visible' : 'hidden',
                    },
                }),
                div(''),
            ]),
            h2('Bubble Sort'),
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
