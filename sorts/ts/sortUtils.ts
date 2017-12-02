import { times } from 'ramda';
import { SCALE_1, SCALE_4 } from './components/PerformanceGraph';
import { ISortDataItem, ISortDemo, ISortState, MakeSortDataFunc } from './typedefs';

export function fix(r: number[], len: number): number[] {
    const fixedR = ([] as number[]).concat(r);
    while (fixedR.length < len) {
        fixedR.push(-1);
    }
    return fixedR;
}

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

export function makeSortDemoData(arrayData: number[], compare: number, highlighted: number[], focused: number[], selected: number[] = [], sections: number[][] = []): ISortDemo {
    const compareData = arrayData[compare];
    return {
        compare: compareData,
        list: arrayData.map((value, index): ISortDataItem => ({ value, index, compare: compareData, highlighted, focused, selected, sections })),
    };
}

export function makeSortData(numOps: number[]): MakeSortDataFunc {
    return (...sortDemoData: ISortDemo[]): ISortState => {
        return {
            lists: sortDemoData,
            numOps,
        };
    };
}
