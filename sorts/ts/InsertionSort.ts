import {
    div,
    VNode,
} from '@cycle/dom';
import isolate from '@cycle/isolate';
import { makeCollection } from 'cycle-onionify';
import xs, { Stream } from 'xstream';
import BubbleSortItem from './BubbleSortItem';
import { SCALE_1, SCALE_2, SCALE_3, SCALE_4 } from './PerformanceGraph';
import { makeSortData, randArrayOfNumbers, sortModel } from './sortUtils';
import { ISinks, ISorter, ISortState, ISources, IState } from './typedefs';

import '../sass/bubblesort.sass';

export function* insertionSort(unsortedArray: number[], numOps: number[]): Iterator<ISortState> {
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
function genInsertionSort(scale: number, numOps: number[]): ISorter {
    return {
        scale,
        sorter: insertionSort(randArrayOfNumbers(scale), numOps),
    };
}

function insertionSortOpCounter(scale: number): number {
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
    return scales.map(insertionSortOpCounter);
}

function view(listVNode$: Stream<[IState, VNode[]]>): Stream<VNode> {
    return listVNode$.map(() => {
        // const { compare } = state as any as ISortState;
        return div('.InsertionSort', 'InsertionSort');
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

    const numOps = genSortScales([SCALE_1, SCALE_2, SCALE_3, SCALE_4]);

    const listSinks = isolate(List, 'list')(sources as any);
    const reducer$ = sortModel(numOps, genInsertionSort)(state$);
    const vdom$ = view(xs.combine(state$, listSinks.dom));
    return {
        dom: vdom$,
        onion: reducer$,
    };
}
