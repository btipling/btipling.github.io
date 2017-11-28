import { times } from 'ramda';
import { SCALE_1, SCALE_4 } from './PerformanceGraph';
import { defaultSpeed } from './SpeedChooser';
import { ISortState, MakeSortDataFunc } from './typedefs';

export function scaleToN(scale: number): number {
    const a = 10;
    const b = 100;
    const min = SCALE_1;
    const max = SCALE_4;
    return Math.round((((b - a) * (scale - min)) / (max - min)) + a);
}
export function randN(): number {
    return Math.floor((Math.random() * 99) + 1);
}

export function randArrayOfNumbers(scale: number): number[] {
    return times(() => randN(), scaleToN(scale));
}

export function makeSortData(numOps: number[]): MakeSortDataFunc {
    return (arrayData: number[], compareAIndex: number, compareBIndex: number, compare: number): ISortState => {
        return {
            compare: arrayData[compare],
            graph: { scale: SCALE_1 },
            list: arrayData.map((value, index) => ({ compare, index, value, compareAIndex, compareBIndex })),
            numOps,
            speedChooser: defaultSpeed(),
        };
    };
}
