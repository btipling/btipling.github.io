import { randArrayOfNumbers } from './sortUtils';
import { ISorter, ISortState, MakeSortDataFunc } from './typedefs';

export function* mergeSort(unsortedArray: number[], makeSortData: MakeSortDataFunc): Iterator<ISortState> {

    function* mergeSorter(arr: number[], trackStart: number, trackEnd: number): Iterator<ISortState> {
        if (arr.length <= 1) {
            return;
        }

        const low = 0;
        const high = arr.length - 1;
        const subsection = [sortedArray.map((_, index) => index).filter(index => index < trackStart || index > trackStart + (arr.length - 1))];

        function* yieldSortProgress(highlighted: number[], focused: number[], highlightSection: number[]): Iterator<ISortState> {
            for (let i = 0; i < arr.length; i++) {
                sortedArray[i + trackStart] = arr[i];
            }
            yield makeSortData([sortedArray, arr], highlighted, focused, -1, [], subsection.concat([highlightSection]));
        }

        yield* yieldSortProgress([], [], []) as any;

        const p = Math.floor(high / 2);
        const left = arr.slice(low, p + 1);
        const right = arr.slice(p + 1, high + 1);

        yield* mergeSorter(left, trackStart, trackEnd - p) as any;
        yield* mergeSorter(right, p, trackEnd) as any;
        yield* merge(arr, left, right) as any;


        if (arr === unsortedArray) {
            // No need to update the array, it's already updated.
            return;
        }

        function* merge(arrayToMergeInto: number[], leftR: number[], rightR: number[]): Iterator<ISortState> {
            let i = 0;
            let l = 0;
            let r = 0;
            while (l < leftR.length && r < rightR.length) {
                if (leftR[l] <= right[r]) {
                    arrayToMergeInto[i] = leftR[l];
                    l += 1;
                } else {
                    arrayToMergeInto[i] = rightR[r];
                    r += 1;
                }
                i += 1;
                yield* yieldSortProgress([r + trackStart], [l + r + trackStart], rightR.map((_, index) => index + l + trackStart)) as any;
            }

            for (; l < leftR.length; l++ , i++) {
                arrayToMergeInto[i] = leftR[l];
                yield* yieldSortProgress([i + trackStart], [], rightR.map((_, index) => index + l + trackStart)) as any;
            }

            for (; r < rightR.length; r++ , i++) {
                arrayToMergeInto[i] = rightR[r];
                yield* yieldSortProgress([i + trackStart], [], rightR.map((_, index) => index + l + trackStart)) as any;
            }
        }
    }

    const sortedArray = ([] as number[]).concat(unsortedArray);
    yield makeSortData([sortedArray], [], [], -1);
    yield* mergeSorter(sortedArray, 0, sortedArray.length - 1) as any;
    // Twice for 2 frames.
    yield makeSortData([sortedArray], [], [], -1);
    yield makeSortData([sortedArray], [], [], -1);

}

function genSort(scale: number, makeSortData: MakeSortDataFunc): ISorter {
    return {
        scale,
        sorter: mergeSort(randArrayOfNumbers(scale), makeSortData),
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
