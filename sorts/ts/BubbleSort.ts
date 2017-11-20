import {
    a,
    div,
    h2,
} from '@cycle/dom';
import xs, { Stream } from 'xstream';
import { ISinks, ISources } from './typedefs';

export interface IState {
    content: string;
}
export type Reducer = (prev?: IState) => IState | undefined;

export interface ISortData {
    arrayData: number[];
    compareAIndex: number;
    compareBIndex: number;
}

export function makeSortData(arrayData: number[], compareAIndex: number, compareBIndex: number): ISortData {
    return { arrayData, compareAIndex, compareBIndex };
}

export function* bubbleSort(unsortedArray: number[]): Iterator<ISortData> {
    const len = unsortedArray.length;
    const sortedArray = ([] as number[]).concat(unsortedArray);
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len; j++) {
            const itemA = sortedArray[i];
            const itemB = sortedArray[j];
            if (itemB < itemA) {
                sortedArray[i] = itemB;
                sortedArray[j] = itemA;
            }
            yield makeSortData(sortedArray, i, j);
        }
    }
    yield makeSortData(sortedArray, len, len);
}

function genBubbleSort(): Iterator<ISortData> {
    return bubbleSort([1000, 23, 99, 308, 2, 57, 2091]);
}

export default function BubbleSort(sources: ISources): ISinks {
    let sorter: Iterator<ISortData> = genBubbleSort();
    const initialReducer$ = xs.of(() => sorter.next().value);
    const addOneReducer$ = xs.periodic(1000)
        // .mapTo(prev => [1].concat(prev));
        .mapTo(() => {
            let value = sorter.next();
            if (value.done) {
                sorter = genBubbleSort();
                value = sorter.next();
            }
            return value.value;
        });

    const reducer$ = xs.merge(initialReducer$, addOneReducer$) as any as Stream<Reducer>;

    const state$ = sources.onion.state$ as any as Stream<ISortData>;
    const vdom$ = state$.map((value: ISortData) => {
        return div([
            a({ props: { href: './' } }, 'back'),
            h2('BubbleSort!' + value.arrayData),
        ]);
    });

    return {
        dom: vdom$,
        onion: reducer$,
    };
}
