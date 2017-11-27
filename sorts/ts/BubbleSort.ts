import { makeSortData, randArrayOfNumbers } from './sortUtils';
import { ISorter, ISortState } from './typedefs';

export function* bubbleSort(unsortedArray: number[], numOps: number[]): Iterator<ISortState> {
    const len = unsortedArray.length;
    const sortedArray = ([] as number[]).concat(unsortedArray);
    let a = 0;
    let b = 0;
    for (let i = len; i > 0; i--) {
        let swapped = false;
        yield makeSortData(sortedArray, a, b, sortedArray[b], b, numOps);
        for (let j = 0; j < i - 1; j++) {
            a = j;
            b = j + 1;
            const itemA = sortedArray[a];
            const itemB = sortedArray[b];
            yield makeSortData(sortedArray, a, b, sortedArray[a], a, numOps);
            if (itemB < itemA) {
                sortedArray[a] = itemB;
                sortedArray[b] = itemA;
                yield makeSortData(sortedArray, b, a, sortedArray[b], b, numOps);
                swapped = true;
            } else {
                yield makeSortData(sortedArray, b, -1, sortedArray[b], b, numOps);
            }
        }
        if (!swapped) {
            break;
        }
    }
    // Twice for 2 frames.
    yield makeSortData(sortedArray, len, len, -1, -1, numOps);
    yield makeSortData(sortedArray, len, len, -1, -1, numOps);
}
function genSort(scale: number, numOps: number[]): ISorter {
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

export default {
    genSort,
    genSortScales,
};
