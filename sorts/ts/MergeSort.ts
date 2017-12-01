// import { makeSortDemoData, randArrayOfNumbers } from './sortUtils';
import { makeSortDemoData, randArrayOfNumbers } from './sortUtils';
import { ISorter, ISortState, MakeSortDataFunc } from './typedefs';

export function* mergeSort(unsortedArray: number[], makeSortData: MakeSortDataFunc): Iterator<ISortState> {

    function* mergeSorter(arr: number[], trackStart: number, trackEnd: number): Iterator<ISortState> {
        if (arr.length <= 1) {
            return;
        }

        const low = 0;
        const high = arr.length - 1;
        const subsection = [sortedArray.map((_, index) => index).filter(index => index < trackStart || index > trackStart + (arr.length - 1))];

        function* yieldSortProgress(highlighted: number[], focused: number[], highlightSection: number[], lists: number[][]): Iterator<ISortState> {
            for (let i = 0; i < arr.length; i++) {
                sortedArray[i + trackStart] = arr[i];
            }
            const stuffedLists = lists.map(l => {
                const newR = ([] as number[]).concat(l);
                while (newR.length < sortedArray.length) {
                    newR.push(0);
                }
                return newR;
            });
            yield makeSortData(
                makeSortDemoData(stuffedLists[0], -1, highlighted, focused, [], subsection.concat([highlightSection])),
                makeSortDemoData(stuffedLists[1], -1, [], [], []),
            );
            // yield makeSortData(lists, highlighted, focused, -1, [], subsection.concat([highlightSection]));
        }

        yield* yieldSortProgress([], [], [], [sortedArray, arr]) as any;

        const p = Math.floor(high / 2);
        const left = arr.slice(low, p + 1);
        yield* yieldSortProgress([], [], [], [sortedArray.map((n, si) => si > trackStart && si <= trackStart + p - 1 ? 0 : n), left]) as any;

        const right = arr.slice(p + 1, high + 1);
        // yield* yieldSortProgress([], [], [], [sortedArray.map((n, si) => si > trackStart && si <= trackStart + arr.length - 1 ? 0 : n), left, right]) as any;
        yield* mergeSorter(left, trackStart, trackEnd - p) as any;
        yield* mergeSorter(right, p, trackEnd) as any;
        yield* merge(arr, left, right) as any;

        if (arr === unsortedArray) {
            // No need to update the array, it's already updated.
            return;
        }

        function* merge(arrayToMergeInto: number[], leftR: number[], rightR: number[]): Iterator<ISortState> {
            let i = 0;
            // const purge = (n, si) => si > trackStart + i && si <= trackStart + arr.length - 1 ? 0 : n;
            while (leftR.length && rightR.length) {
                if (leftR[0] <= right[0]) {
                    arrayToMergeInto[i] = leftR.shift() as number;
                } else {
                    arrayToMergeInto[i] = rightR.shift() as number;
                }
                // yield* yieldSortProgress([], [], [], [sortedArray.map(purge), leftR, rightR]) as any;
                i += 1;
            }

            for (; leftR.length; i++) {
                arrayToMergeInto[i] = leftR.shift() as number;
                // yield* yieldSortProgress([], [], [], [sortedArray.map(purge), leftR, rightR]) as any;
            }

            for (; rightR.length; i++) {
                arrayToMergeInto[i] = rightR.shift() as number;
                // yield* yieldSortProgress([], [], [], [sortedArray.map(purge), leftR, rightR]) as any;
            }
        }
    }

    const sortedArray = ([] as number[]).concat(unsortedArray);
    // yield makeSortData([sortedArray], [], [], -1);
    yield* mergeSorter(sortedArray, 0, sortedArray.length - 1) as any;
    // Twice for 2 frames.
    // yield makeSortData([sortedArray], [], [], -1);
    // yield makeSortData([sortedArray], [], [], -1);

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
