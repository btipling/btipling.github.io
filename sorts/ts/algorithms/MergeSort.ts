// import { makeSortDemoData, randArrayOfNumbers } from './sortUtils';
import { fix, makeSortDemoData, randArrayOfNumbers } from '../sortUtils';
import { ISorter, ISortState, MakeSortDataFunc } from '../typedefs';

export function* mergeSort(unsortedArray: number[], makeSortData: MakeSortDataFunc): Iterator<ISortState> {

    const totalLen = unsortedArray.length;

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
            makeSortDemoData(fix(left, totalLen), -1, left.map((_, ii) => ii), []),
            makeSortDemoData([], -1, [], []),
        );
        yield* merge(arr, left, right) as any;

        if (arr === unsortedArray) {
            // No need to update the array, it's already updated.
            return;
        }

        // Here left and right are merged. arrayToMergeInto is arr passed in from mergeSorter.
        function* merge(arrayToMergeInto: number[], leftR: number[], rightR: number[]): Iterator<ISortState> {
            let i = 0;
            // purge is used to punch a hole in the area of the main sort array in the sort demo display.
            const purge = (n, si) => (si >= (trackStart + i)) && si < (trackStart + arr.length) ? 0 : n;

            // cameFrom arrays track the highlight in main array and help maintain left/right track array position.
            const cameFromLeft = ([] as number[]);
            const cameFromRight = ([] as number[]);
            // These leftTrack/rightTrack arrays are an optimization and are updated with state to display to sortDemo.
            const leftTrack = fix(([] as number[]).concat(leftR), totalLen);
            const rightTrack = fix(([] as number[]).concat(rightR), totalLen);

            // These highlight arrays are used to highlight and focus the left and right arrays in their respective sort demos.
            const leftHighlight = leftR.map((_, ii) => ii);
            const rightHighlight = rightR.map((_, ii) => ii);

            // The innerTrack array is similar to left/right Track. It's an optimization and used to update the state for the sortDemo.
            const innerTrack = trackingArray.map(purge);

            function* updateSortState() {
                yield makeSortData(
                    makeSortDemoData(innerTrack, -1, cameFromLeft, cameFromRight),
                    makeSortDemoData(leftTrack, -1, leftHighlight, []),
                    makeSortDemoData(rightTrack, -1, [], rightHighlight),
                );
            }

            function* advanceLeft() {
                yield* advanceTrackingSortState(leftR, leftTrack, cameFromLeft) as any;
            }

            function* advanceRight() {
                yield* advanceTrackingSortState(rightR, rightTrack, cameFromRight) as any;
            }

            // To advance the state remove from the leftR or rightR and update all the tracking state, then advance i and yield state.
            function* advanceTrackingSortState(sideR: number[], sideTrack: number[], cameFrom: number[]) {
                // Update arr with current state, this is a core part of the merge operation, not tracking.
                arrayToMergeInto[i] = sideR.shift() as number;

                // This is all tracking for display.
                const mappedIndex = i + trackStart;
                sideTrack[cameFrom.length] = 0;
                cameFrom.push(mappedIndex);
                trackingArray[mappedIndex] = arrayToMergeInto[i];
                innerTrack[mappedIndex] = arrayToMergeInto[i];

                // Advancing i is a core part of the mege operation, not just tracking.
                i += 1;
                yield* updateSortState() as any;
            }

            // Display initial sort tracking state before doing anything.
            yield* updateSortState() as any;

            // While there are both left and right stacks, check which is smaller and advance that one.
            while (leftR.length && rightR.length) {
                if (leftR[0] <= right[0]) {
                    yield* advanceLeft() as any;
                } else {
                    yield* advanceRight() as any;
                }
            }

            // Advance any remaining on the left.
            while (leftR.length) {
                yield* advanceLeft() as any;
            }

            // Advance any remaining on the right.
            while (rightR.length) {
                yield* advanceRight() as any;
            }
        }
    }

    function* updateTopLevelSortState() {
        yield makeSortData(
            makeSortDemoData(sortedArray, -1, [], []),
            makeSortDemoData([], -1, [], []),
            makeSortDemoData([], -1, [], []),
        );
    }

    const sortedArray = ([] as number[]).concat(unsortedArray);
    // The trackingArray is used as a mirror of the sort state in a given snapshot of time. It is updated on the fly.
    const trackingArray = ([] as number[]).concat(unsortedArray);
    yield* updateTopLevelSortState() as any;
    yield* mergeSorter(sortedArray, 0) as any;
    // Finish and show twice for 2 frames.
    yield* updateTopLevelSortState() as any;
    yield* updateTopLevelSortState() as any;

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
