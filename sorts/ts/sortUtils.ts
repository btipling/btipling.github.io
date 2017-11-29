import { times } from 'ramda';
import { SCALE_1, SCALE_4 } from './PerformanceGraph';
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
    return (arrayData: number[], highlighted: number[], focused: number[], compare: number, selected: number[] = [], sections: number[][] = []): ISortState => {
        return {
            compares: [arrayData[compare]],
            lists: [arrayData.map((value, index) => ({ compare, index, value, highlighted, focused, selected, sections }))],
            numOps,
        };
    };
}

export function listExtraction(index: number) {
    return {
        get: state => state.lists[index] || [],
        set: (state, _) => state,
    };
}
