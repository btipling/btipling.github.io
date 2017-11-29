import { randArrayOfNumbers } from './sortUtils';
import { ISorter, ISortState, MakeSortDataFunc } from './typedefs';

export function* bubbleSort(unsortedArray: number[], makeSortData: MakeSortDataFunc): Iterator<ISortState> {
    const len = unsortedArray.length;
    const sortedArray = ([] as number[]).concat(unsortedArray);
    let a = 0;
    let b = 0;
    for (let i = len; i > 0; i--) {
        let swapped = false;
        for (let j = 0; j < i - 1; j++) {
            a = j;
            b = j + 1;
            const itemA = sortedArray[a];
            const itemB = sortedArray[b];
            yield makeSortData([sortedArray], [a], [b], a);
            if (itemB < itemA) {
                sortedArray[a] = itemB;
                sortedArray[b] = itemA;
                yield makeSortData([sortedArray], [b], [a], b);
                swapped = true;
            } else {
                yield makeSortData([sortedArray], [b], [-1], b);
            }
        }
        if (!swapped) {
            break;
        }
    }
    // Twice for 2 frames.
    yield makeSortData([sortedArray], [], [], -1);
    yield makeSortData([sortedArray], [], [], -1);
}

function genSort(scale: number, makeSortData: MakeSortDataFunc): ISorter {
    return {
        scale,
        sorter: bubbleSort(randArrayOfNumbers(scale), makeSortData),
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
