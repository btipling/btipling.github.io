import { fix, makeSortDemoData, randArrayOfNumbers } from '../sortUtils';
import { ISorter, ISortState, MakeSortDataFunc } from '../typedefs';

interface INode { left: INode | null; right: INode | null; value: number; }

function addToHeap(nodeToAdd: INode, currentNode: INode) {
    if (nodeToAdd.value <= currentNode.value) {
        if (currentNode.left) {
            return addToHeap(nodeToAdd, currentNode.left);
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
}

function findArrayPositionForNode(haystack: INode, needle: INode, currentPosition: number = 0): { position: number, found: boolean } {
    /*
    position starts at zero
    we go into the function
    we check if the head is the node if so return found with position 0
    if not we increment one and check left
        - we go into the function
        - we check if the new head is the node and if so return found with position 1
            - we go to the top and see if found return 1 and that's done
        - or we check the right and increase the position to 2
            - we go into the function
            - we check if the new head is the node and if so return found with position 2
                - we return to the first left and see found from right and return 2
                    - we return to the top and see found from left and return 2 and that's done
            - or we set position to 3 and check the left
    */
    let position = currentPosition;
    let result: { position: number, found: boolean } | null = null;
    if (haystack.left) {
        result = findArrayPositionForNode(haystack.left, needle, position);
        if (result.found) {
            return result;
        } else {
            position = result.position + 1;
        }
    }
    if (haystack === needle) {
        return { position, found: true };
    }
    if (haystack.right) {
        // Increment position on going right.
        result = findArrayPositionForNode(haystack.right, needle, position + 1);
        if (result.found) {
            return result;
        } else {
            position = result.position;
        }
    }
    // Increment position on coming up.
    return { found: false, position };
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
        const currentIndex = unsortedArray.length - arr.length;
        yield makeSortData(
            makeSortDemoData(trackingArray, -1, [currentIndex], []),
            makeSortDemoData(fix(heapToSortedArray(head, []), unsortedArray.length), -1, [], []),
        );
        const newNode = { left: null, right: null, value: arr[0] as number };
        addToHeap(newNode, head);
        const findResult = findArrayPositionForNode(head, newNode);
        const indexAddedAt = findResult.position;
        const currentSortedProgress = heapToSortedArray(head, []);
        trackingArray[currentIndex] = 0;
        yield makeSortData(
            makeSortDemoData(trackingArray, -1, [], []),
            makeSortDemoData(fix(currentSortedProgress, unsortedArray.length), -1, [indexAddedAt], []),
        );
        yield* feedHeap(arr.slice(1, arr.length), head) as any;
        return;
    }

    yield makeSortData(
        makeSortDemoData(unsortedArray, -1, [], []),
        makeSortDemoData([], -1, [], []),
    );
    const headNode = { left: null, right: null, value: unsortedArray[0] as number };
    const trackingArray = ([] as number[]).concat(unsortedArray);
    trackingArray[0] = -1;
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
