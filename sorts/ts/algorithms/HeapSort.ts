import { fix, makeSortDemoData, randArrayOfNumbers } from '../sortUtils';
import { ISorter, ISortState, MakeSortDataFunc } from '../typedefs';

interface INode { left: INode | null; right: INode | null; value: number; }

function addToHeap(nodeToAdd: INode, currentNode: INode) {
    if (nodeToAdd.value <= currentNode.value) {
        if (currentNode.left) {
            addToHeap(nodeToAdd, currentNode.left);
        } else {
            currentNode.left = nodeToAdd;
        }
    } else {
        if (currentNode.right) {
            addToHeap(nodeToAdd, currentNode.right);
        } else {
            currentNode.right = nodeToAdd;
        }

    }
    return currentNode;
}

function heapToSortedArray(currentNode: INode, arr: number[]) {
    if (!currentNode) {
        return arr;
    }
    let result = arr;
    if (currentNode.left) {
        result = heapToSortedArray(currentNode.left, result);
    }
    result.push(currentNode.value);
    if (currentNode.right) {
        result = heapToSortedArray(currentNode.right, result);
    }
    return result;
}

export function* heapSort(unsortedArray: number[], makeSortData: MakeSortDataFunc): Iterator<ISortState> {

    if (!unsortedArray.length) {
        return unsortedArray;
    }

    function* feedHeap(arr: number[], head: INode): Iterator<ISortState> {
        if (!arr.length) {
            return;
        }
        addToHeap({ left: null, right: null, value: arr[0] as number }, head);
        yield makeSortData(
            makeSortDemoData(unsortedArray, -1, [], []),
            makeSortDemoData(fix(heapToSortedArray(head, []), unsortedArray.length), -1, [], []),
        );
        yield* feedHeap(arr.slice(1, arr.length), head) as any;
        return;
    }

    yield makeSortData(
        makeSortDemoData(unsortedArray, -1, [], []),
        makeSortDemoData([], -1, [], []),
    );
    const headNode = { left: null, right: null, value: unsortedArray[0] as number };
    yield* feedHeap(unsortedArray.slice(1, unsortedArray.length), headNode) as any;
    const sortedArray = heapToSortedArray(headNode, []);

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
    return scales.map(heapSortOpCounter);
}

export default {
    genSort,
    genSortScales,
};
