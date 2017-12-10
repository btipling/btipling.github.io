import { makeSortDemoData, randArrayOfNumbers } from '../sortUtils';
import { ISorter, ISortState, MakeSortDataFunc } from '../typedefs';

export function parent(index) {
    return Math.floor(index / 2);
}

export function leftChild(index) {
    return index * 2 + 1;
}

export function rightChild(index) {
    return index * 2 + 2;
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
        while (leftChild(root) <= end) {
            const child = leftChild(root);
            const childR = rightSibling(child);
            let swap = root;
            let highlight = swap;
            yield makeSortData(makeSortDemoData(sortedArray, -1, [highlight], [root, child, childR]));
            if (arr[swap] < arr[child]) {
                swap = child;
                highlight = swap;
                yield makeSortData(makeSortDemoData(sortedArray, highlight, [highlight], [root, child, childR]));
            }
            if (childR <= end && arr[swap] < arr[childR]) {
                swap = childR;
                highlight = swap;
                yield makeSortData(makeSortDemoData(sortedArray, highlight, [highlight], [root, child, childR]));
            }
            if (swap === root) {
                yield makeSortData(makeSortDemoData(sortedArray, -1, [highlight], [root]));
                return;
            }
            yield makeSortData(makeSortDemoData(sortedArray, highlight, [root, highlight], [root, child, childR]));
            const prevRoot = root;
            const t = arr[root];
            arr[root] = arr[swap];
            arr[swap] = t;
            root = swap;
            highlight = root;
            yield makeSortData(makeSortDemoData(sortedArray, prevRoot, [highlight, prevRoot], [prevRoot, child, childR]));
        }
    }

    yield makeSortData(makeSortDemoData(unsortedArray, -1, [], []));
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
    yield makeSortData(makeSortDemoData(sortedArray, -1, [], []));
    yield makeSortData(makeSortDemoData(sortedArray, -1, [], []));
}

function genSort(scale: number, makeSortData: MakeSortDataFunc): ISorter {
    return {
        scale,
        sorter: heapSort(randArrayOfNumbers(scale), makeSortData),
    };
}

function heapSortOpCounter(scale: number): number {
    let iterationCount = 0;

    function heapify(arr: number[], count: number) {
        let start = parent(count - 1);
        while (start >= 0) {
            siftDown(arr, start, count - 1);
            start -= 1;
        }
    }

    function siftDown(arr: number[], start: number, end: number) {
        let root = start;
        while (leftChild(root) <= end) {
            const child = leftChild(root);
            const childR = rightSibling(child);
            let swap = root;
            if (arr[swap] < arr[child]) {
                swap = child;
            }
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
            iterationCount += 1;
        }
    }

    const unsortedArray = randArrayOfNumbers(scale);
    const sortedArray = ([] as number[]).concat(unsortedArray);
    heapify(sortedArray, sortedArray.length);
    let trackingEnd = sortedArray.length - 1;

    while (trackingEnd > 0) {
        const t = sortedArray[0];
        sortedArray[0] = sortedArray[trackingEnd];
        sortedArray[trackingEnd] = t;
        trackingEnd -= 1;
        siftDown(sortedArray, 0, trackingEnd);
    }
    return iterationCount;
}

function genSortScales(scales: number[]): number[] {
    return scales.map(heapSortOpCounter);
}

export default {
    genSort,
    genSortScales,
    name: 'Heap Sort',
};
