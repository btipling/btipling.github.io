import { randArrayOfNumbers } from './sortUtils';
import { ISorter, ISortState, MakeSortDataFunc } from './typedefs';

export function* quickSort(unsortedArray: number[], makeSortData: MakeSortDataFunc): Iterator<ISortState> {
    function* quickSorter(arr: number[], low: number, high: number): Iterator<ISortState> {

        let p = -1;

        function* partition(partionedArray: number[], lo: number, hi: number): Iterator<ISortState> {
            let pivotIndex = lo;
            const pivot = partionedArray[lo];
            const subsection = [partionedArray.map((_, index) => index).filter(index => index < lo || index > hi)];
            let i = lo - 1;
            let j = hi + 1;
            do {
                do {
                    i += 1;
                    yield makeSortData([partionedArray], [pivotIndex], [i, j], pivotIndex, [], subsection);
                } while (partionedArray[i] < pivot);
                yield makeSortData([partionedArray], [pivotIndex], [j], pivotIndex, [i], subsection);

                do {
                    j -= 1;
                    yield makeSortData([partionedArray], [pivotIndex], [j], pivotIndex, [i], subsection);
                } while (partionedArray[j] > pivot);
                yield makeSortData([partionedArray], [pivotIndex], [], pivotIndex, [i, j], subsection);

                if (i >= j) {
                    p = j;
                    return;
                }

                const t = partionedArray[j];
                yield makeSortData([partionedArray], [pivotIndex, i, j], [], pivotIndex, [], subsection);
                partionedArray[j] = partionedArray[i];
                partionedArray[i] = t;
                if (i === pivotIndex) {
                    pivotIndex = j;
                }
                yield makeSortData([partionedArray], [pivotIndex, i, j], [], pivotIndex, [], subsection);
                yield makeSortData([partionedArray], [pivotIndex], [], pivotIndex, [i, j], subsection);
            } while (true); // tslint:disable-line no-constant-condition
        }

        if (low >= high) {
            return arr;
        }
        yield* partition(arr, low, high) as any;
        yield* quickSorter(arr, low, p) as any;
        yield* quickSorter(arr, p + 1, high) as any;
    }

    const sortedArray = ([] as number[]).concat(unsortedArray);
    yield* quickSorter(sortedArray, 0, sortedArray.length - 1) as any;

    // Twice for 2 frames.
    yield makeSortData([sortedArray], [], [], -1);
    yield makeSortData([sortedArray], [], [], -1);
}

function genSort(scale: number, makeSortData: MakeSortDataFunc): ISorter {
    return {
        scale,
        sorter: quickSort(randArrayOfNumbers(scale), makeSortData),
    };
}

function opCounter(scale: number): number {
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
    return scales.map(opCounter);
}

export default {
    genSort,
    genSortScales,
};
