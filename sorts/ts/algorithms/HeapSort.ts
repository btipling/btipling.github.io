import { makeSortDemoData, randArrayOfNumbers } from '../sortUtils';
import { ISorter, ISortState, MakeSortDataFunc } from '../typedefs';

export function parent(index) {
    return Math.floor(index / 2);
}

export function leftChild(index) {
    return index * 2;
}

export function rightChild(index) {
    return index * 2 + 1;
}

export function leftSibling(index) {
    return index + 1;
}

export function rightSibling(index) {
    return index - 1;
}

export function* heapSort(unsortedArray: number[], makeSortData: MakeSortDataFunc): Iterator<ISortState> {

    if (!unsortedArray.length) {
        return unsortedArray;
    }

    function* heapify(arr: number[], count: number): Iterator<ISortState> {
        let start = parent(count - 1);

        while (start >= 0) {
            yield* siftDown(arr, start, count - 1) as any;
            start -= 1;
        }
    }

    function* siftDown(arr: number[], start: number, end: number): Iterator<ISortState> {
        let root = start;
        let swap = root;
        while (leftChild(root) <= end) {
            const child = leftChild(root);
            if (arr[swap] < arr[child]) {
                swap = child;
            }
            const childR = rightSibling(child);
            if (childR <= end && arr[swap] < arr[childR]) {
                swap = childR;
            }
            if (swap === root) {
                return;
            }
            const t = arr[root];
            arr[root] = arr[swap];
            arr[swap] = t;
            root = swap;
        }
    }

    yield makeSortData(
        makeSortDemoData(unsortedArray, -1, [], []),
        makeSortDemoData([], -1, [], []),
    );
    const sortedArray = ([] as number[]).concat(unsortedArray);
    yield* heapify(sortedArray, sortedArray.length) as any;
    let trackingEnd = sortedArray.length - 1;

    while (trackingEnd > 0) {
        const t = sortedArray[0];
        sortedArray[0] = sortedArray[trackingEnd];
        sortedArray[trackingEnd] = t;
        trackingEnd -= 1;
        yield* siftDown(sortedArray, 0, trackingEnd) as any;
    }
    // Twice for 2 frames.
    yield makeSortData(
        makeSortDemoData([], -1, [], []),
        makeSortDemoData(sortedArray, -1, [], []),
    );
    yield makeSortData(
        makeSortDemoData([], -1, [], []),
        makeSortDemoData(sortedArray, -1, [], []),
    );
}

function genSort(scale: number, makeSortData: MakeSortDataFunc): ISorter {
    return {
        scale,
        sorter: heapSort(randArrayOfNumbers(scale), makeSortData),
    };
}

function heapSortOpCounter(scale: number): number {
    return Math.floor(Math.random() * Math.pow(100, scale));
}

function genSortScales(scales: number[]): number[] {
    return scales.map(heapSortOpCounter);
}

export default {
    genSort,
    genSortScales,
};
