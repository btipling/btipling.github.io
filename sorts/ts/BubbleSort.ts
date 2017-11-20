import {
    a,
    div,
    h2,
    span,
    VNode,
} from '@cycle/dom';
import isolate from '@cycle/isolate';
import { makeCollection } from 'cycle-onionify';
import { times } from 'ramda';
import xs, { Stream } from 'xstream';
import { ISinks, ISources } from './typedefs';

export interface IState {
    content: string;
}
export type Reducer = (prev?: IState) => IState | undefined;

export interface ISortData {
    value: number;
    index: number;
    compareAIndex: number;
    compareBIndex: number;
}

export function makeSortData(arrayData: number[], compareAIndex: number, compareBIndex: number): ISortData[] {
    return arrayData.map((value, index) => ({ index, value, compareAIndex, compareBIndex }));
}

export function* bubbleSort(unsortedArray: number[]): Iterator<ISortData[]> {
    const len = unsortedArray.length;
    const sortedArray = ([] as number[]).concat(unsortedArray);
    for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
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

function genBubbleSort(): Iterator<ISortData[]> {
    return bubbleSort(times(() => Math.floor(Math.random() * 100), 20));
}

function Item(sources: ISources): ISinks {
    console.log('item being made?');
    const state$ = sources.onion.state$;

    const vdom$ = state$.map(state => {
        const sortData = state as any as ISortData;
        let open = '';
        let close = '';
        if (sortData.compareAIndex === sortData.index) {
            open = '[';
            close = ']';
        } else if (sortData.compareBIndex === sortData.index) {
            open = '(';
            close = ')';
        }

        return span('.item', [
            span('.content', `${open}${sortData.value}${close} `),
        ]);
    });
    return {
        dom: vdom$,
        onion: xs.empty(),
    };
}

function view(listVNode$: Stream<VNode>): Stream<VNode> {
    return listVNode$.map(node => div([
        a({ props: { href: './' } }, 'back'),
        h2('BubbleSort!'),
        node,
    ]));
}

export default function BubbleSort(sources: ISources): ISinks {
    let sorter: Iterator<ISortData[]> = genBubbleSort();
    const initialReducer$ = xs.of(() => {
        const value = sorter.next().value;
        return { list: value };
    });
    const addOneReducer$ = xs.periodic(1000)
        .mapTo(() => {
            let value = sorter.next();
            if (value.done) {
                sorter = genBubbleSort();
                value = sorter.next();
            }
            return {
                list: value.value,
            };
        });
    const List = makeCollection({
        collectSinks: (instances: any) => ({
            dom: instances.pickCombine('dom')
                .map((itemVNodes: VNode[]) => div(itemVNodes)),
            onion: instances.pickMerge('onion'),
        }),
        item: Item,
        itemKey: (_: any, index: number) => index.toString(),
        itemScope: (key: string) => key,
    });

    const listSinks = isolate(List, 'list')(sources as any);

    const reducer$ = xs.merge(initialReducer$, addOneReducer$) as any as Stream<Reducer>;
    const vdom$ = view(listSinks.dom);

    return {
        dom: vdom$,
        onion: reducer$,
    };
}
