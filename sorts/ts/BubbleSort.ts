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
import SpeedChooser, { SPEED_1X, SPEED_2X, SPEED_3X, SPEED_4X } from './SpeedChooser';
import { IBubbleState, ISinks, ISources } from './typedefs';

import '../sass/bubblesort.sass';

export interface IState {
    content: string;
}
export type Reducer = (prev?: IState) => IState | undefined;

export function makeSortData(arrayData: number[], compareAIndex: number, compareBIndex: number, compare: number, highlighted: number): IBubbleState {
    return {
        compare,
        list: arrayData.map((value, index) => ({ compare, highlighted, index, value, compareAIndex, compareBIndex })),
        speedChooser: SPEED_4X,
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
    yield makeSortData(sortedArray, len, len, sortedArray[len], sortedArray[len]);
}

function genBubbleSort(): Iterator<IBubbleState> {
    return bubbleSort(times(() => Math.floor((Math.random() * 99) + 1), 20));
}

function model(state$: Stream<any>): Stream<Reducer> {
    let sorter: Iterator<IBubbleState> = genBubbleSort();
    const initialReducer$ = xs.of(() => {
        return sorter.next().value;
    });
    const addOneReducer$ = state$.map(({ list, speedChooser }) => {
        let speed = 0;
        if (speedChooser.speed === SPEED_2X) {
            speed = 500;
        } else if (speedChooser.speed === SPEED_1X) {
            speed = 1000;
        } else if (speedChooser.speed === SPEED_3X) {
            speed = 250;
        } else if (!speedChooser || speedChooser.speed === SPEED_4X) {
            speed = 100;
        }
        return xs.periodic(speed).mapTo({ list, speedChooser });
    }).flatten()
        .mapTo(({ speedChooser }) => {
            let value = sorter.next();
            if (value.done) {
                sorter = genBubbleSort();
                value = sorter.next();
            }
            return Object.assign(value.value, { speedChooser });
        });

    return xs.merge(initialReducer$, addOneReducer$) as any as Stream<Reducer>;
}

function view(listVNode$: Stream<[IState, VNode, VNode]>): Stream<VNode> {
    return listVNode$.map(([state, controls, listItems]) => {
        const { compare } = state as any as IBubbleState;
        return div('.BubbleSort', [
            div('.BubbleSort-demo', [
                div('.BubbleSort-controls', [controls]),
                listItems,
                div({
                    class: {
                        'BubbleSort-compareAt': true,
                    },
                    style: {
                        bottom: `${compare}%`,
                    },
                }),
            ]),
            div('.BubbleSort-graph', h2('The Bubble Sort')),
        ]);
    });
}

export default function BubbleSort(sources: ISources): ISinks {
    // Defining the list of items to be sorted.
    const state$ = sources.onion.state$;
    // state$.subscribe({
    //     complete: console.log,
    //     error: console.log,
    //     next: console.log,
    // });
    const List = makeCollection({
        collectSinks: (instances: any) => ({
            dom: instances.pickCombine('dom')
                .map((itemVNodes: VNode[]) => div('.BubbleSort-listContainer', itemVNodes)),
            onion: instances.pickMerge('onion'),
        }),
        item: BubbleSortItem,
        itemKey: (_: any, index: number) => index.toString(),
        itemScope: (key: string) => key,
    });
    const listSinks = isolate(List, 'list')(sources as any);
    const speedSinks = isolate(SpeedChooser, 'speedChooser')(sources as any);

    const speedReducer$ = speedSinks.onion as any as Stream<Reducer>;

    const reducer$ = xs.merge(model(state$), speedReducer$);
    const vdom$ = view(xs.combine(state$, speedSinks.dom, listSinks.dom));
    return {
        dom: vdom$,
        onion: reducer$,
    };
}
