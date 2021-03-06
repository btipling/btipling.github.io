import { makeSortDemoData, randArrayOfNumbers } from '../sortUtils';
import { ISorter, ISortState, MakeSortDataFunc } from '../typedefs';

export function* insertionSort(unsortedArray: number[], makeSortData: MakeSortDataFunc): Iterator<ISortState> {
    const len = unsortedArray.length;
    const sortedArray = ([] as number[]).concat(unsortedArray);
    let a = 1;
    while (a < len) {
        let b = a;
        yield makeSortData(makeSortDemoData(sortedArray, b, [b], [b - 1]));
        while (b > 0 && sortedArray[b - 1] > sortedArray[b]) {
            const t = sortedArray[b];
            sortedArray[b] = sortedArray[b - 1];
            sortedArray[b - 1] = t;
            yield makeSortData(makeSortDemoData(sortedArray, b - 1, [b - 1], [b]));
            b -= 1;
            yield makeSortData(makeSortDemoData(sortedArray, b, [b], [b - 1]));
        }
        a += 1;
    }
    // Twice for 2 frames.
    yield makeSortData(makeSortDemoData(sortedArray, -1, [], []));
    yield makeSortData(makeSortDemoData(sortedArray, -1, [], []));
}
function genSort(scale: number, makeSortData: MakeSortDataFunc): ISorter {
    return {
        scale,
        sorter: insertionSort(randArrayOfNumbers(scale), makeSortData),
    };
}

function insertionSortOpCounter(scale: number): number {
    let count = 0;
    const unsortedArray = randArrayOfNumbers(scale);
    const len = unsortedArray.length;
    const sortedArray = ([] as number[]).concat(unsortedArray);
    let a = 1;
    while (a < len) {
        let b = a;
        while (b > 0 && sortedArray[b - 1] > sortedArray[b]) {
            const t = sortedArray[b];
            sortedArray[b] = sortedArray[b - 1];
            sortedArray[b - 1] = t;
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

export default {
    genSort,
    genSortScales,
    name: 'Insertion Sort',
};
