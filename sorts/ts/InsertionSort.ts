import {
    div,
    VNode,
} from '@cycle/dom';
import isolate from '@cycle/isolate';
import xs, { Stream } from 'xstream';
import { SCALE_1, SCALE_2, SCALE_3, SCALE_4 } from './PerformanceGraph';
import { makeSortData, randArrayOfNumbers, sortComponentList, sortModel } from './sortUtils';
import { ISinks, ISorter, ISortState, ISources, IState } from './typedefs';

import '../sass/bubblesort.sass';

export function* insertionSort(unsortedArray: number[], numOps: number[]): Iterator<ISortState> {
    const len = unsortedArray.length;
    const sortedArray = ([] as number[]).concat(unsortedArray);
    let a = 1;
    while (a < len) {
        let b = a;
        yield makeSortData(sortedArray, b - 1, b, sortedArray[b], sortedArray[b], numOps);
        while (b > 0 && sortedArray[b - 1] > sortedArray[b]) {
            yield makeSortData(sortedArray, b - 1, b, sortedArray[b], sortedArray[b - 1], numOps);
            yield makeSortData(sortedArray, b - 1, b, sortedArray[b - 1], sortedArray[b - 1], numOps);
            const t = sortedArray[b];
            sortedArray[b] = sortedArray[b - 1];
            sortedArray[b - 1] = t;
            yield makeSortData(sortedArray, b - 1, b, sortedArray[b], sortedArray[b], numOps);
            b -= 1;
        }
        a += 1;
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
    let a = 1;
    while (a < len) {
        let b = a;
        while (b > 0) {
            count += 1;
            b -= 1;
        }
        a += 1;
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
    const List = sortComponentList();

    const numOps = genSortScales([SCALE_1, SCALE_2, SCALE_3, SCALE_4]);

    const listSinks = isolate(List, 'list')(sources as any);
    const reducer$ = sortModel(numOps, genInsertionSort)(state$);
    const vdom$ = view(xs.combine(state$, listSinks.dom));
    return {
        dom: vdom$,
        onion: reducer$,
    };
}
