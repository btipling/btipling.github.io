// import { makeSortDemoData, randArrayOfNumbers } from './sortUtils';
import { makeSortDemoData, randArrayOfNumbers } from './sortUtils';
import { ISorter, ISortState, MakeSortDataFunc } from './typedefs';

export function* mergeSort(unsortedArray: number[], makeSortData: MakeSortDataFunc): Iterator<ISortState> {

    function* mergeSorter(arr: number[], trackStart: number): Iterator<ISortState> {
        if (arr.length <= 1) {
            return;
        }

        const low = 0;
        // const subsection = [sortedArray.map((_, index) => index).filter(index => index < trackStart || index > trackStart + (arr.length - 1))];

        const p = Math.floor(arr.length / 2);
        const left = arr.slice(low, p);
        const right = arr.slice(p, arr.length);

        yield* mergeSorter(left, trackStart) as any;
        yield* mergeSorter(right, trackStart + p) as any;
        yield makeSortData(
            makeSortDemoData(trackingArray.map((n, si) => si >= trackStart && si < trackStart + p ? 0 : n), -1, [], []),
            makeSortDemoData(fix(left), -1, left.map((_, ii) => ii), []),
            makeSortDemoData([], -1, [], []),
        );
        yield* merge(arr, left, right) as any;

        if (arr === unsortedArray) {
            // No need to update the array, it's already updated.
            return;
        }

        function fix(r: number[]): number[] {
            const fixedR = ([] as number[]).concat(r);
            while (fixedR.length < sortedArray.length) {
                fixedR.push(0);
            }
            return fixedR;
        }

        function* merge(arrayToMergeInto: number[], leftR: number[], rightR: number[]): Iterator<ISortState> {
            let i = 0;
            const purge = (n, si) => (si >= (trackStart + i)) && si < (trackStart + arr.length) ? 0 : n;
            yield makeSortData(
                makeSortDemoData(trackingArray.map(purge), -1, [], []),
                makeSortDemoData(fix(leftR), -1, leftR.map((_, ii) => ii), []),
                makeSortDemoData(fix(rightR), -1, [], rightR.map((_, ii) => ii)),
            );
            const cameFromLeft = ([] as number[]);
            const cameFromRight = ([] as number[]);
            while (leftR.length && rightR.length) {
                const mappedIndex = i + trackStart;
                if (leftR[0] <= right[0]) {
                    arrayToMergeInto[i] = leftR.shift() as number;
                    cameFromLeft.push(mappedIndex);
                } else {
                    arrayToMergeInto[i] = rightR.shift() as number;
                    cameFromRight.push(mappedIndex);
                }
                trackingArray[mappedIndex] = arrayToMergeInto[i];
                i += 1;
                yield makeSortData(
                    makeSortDemoData(trackingArray.map(purge), -1, cameFromLeft, cameFromRight),
                    makeSortDemoData(fix(leftR), -1, leftR.map((_, ii) => ii), []),
                    makeSortDemoData(fix(rightR), -1, [], rightR.map((_, ii) => ii)),
                );
            }

            for (; leftR.length;) {
                const mappedIndex = i + trackStart;
                arrayToMergeInto[i] = leftR.shift() as number;
                trackingArray[mappedIndex] = arrayToMergeInto[i];
                cameFromLeft.push(mappedIndex);
                i += 1;
                yield makeSortData(
                    makeSortDemoData(trackingArray.map(purge), -1, cameFromLeft, cameFromRight),
                    makeSortDemoData(fix(leftR), -1, leftR.map((_, ii) => ii), []),
                    makeSortDemoData(fix(rightR), -1, [], rightR.map((_, ii) => ii)),
                );
            }

            for (; rightR.length;) {
                const mappedIndex = i + trackStart;
                arrayToMergeInto[i] = rightR.shift() as number;
                trackingArray[mappedIndex] = arrayToMergeInto[i];
                cameFromRight.push(mappedIndex);
                i += 1;
                yield makeSortData(
                    makeSortDemoData(trackingArray.map(purge), -1, cameFromLeft, cameFromRight),
                    makeSortDemoData(fix(leftR), -1, leftR.map((_, ii) => ii), []),
                    makeSortDemoData(fix(rightR), -1, [], rightR.map((_, ii) => ii)),
                );
            }
        }
    }

    const sortedArray = ([] as number[]).concat(unsortedArray);
    const trackingArray = ([] as number[]).concat(unsortedArray);
    yield makeSortData(
        makeSortDemoData(sortedArray, -1, [], []),
        makeSortDemoData([], -1, [], []),
        makeSortDemoData([], -1, [], []),
    );
    yield* mergeSorter(sortedArray, 0) as any;
    // Twice for 2 frames.
    yield makeSortData(
        makeSortDemoData(sortedArray, -1, [], []),
        makeSortDemoData([], -1, [], []),
        makeSortDemoData([], -1, [], []),
    );
    yield makeSortData(
        makeSortDemoData(sortedArray, -1, [], []),
        makeSortDemoData([], -1, [], []),
        makeSortDemoData([], -1, [], []),
    );

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
