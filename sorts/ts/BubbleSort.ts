import {
    div,
    h2,
    VNode,
} from '@cycle/dom';
import isolate from '@cycle/isolate';
import { makeCollection } from 'cycle-onionify';
import { times } from 'ramda';
import xs, { Stream } from 'xstream';
import BubbleSortItem from './BubbleSortItem';
import SpeedChooser, { SPEED_1X, SPEED_3X, SPEED_2X } from './SpeedChooser';
import { ISinks, ISortData, ISources } from './typedefs';

import '../sass/bubblesort.sass';

export interface IState {
    content: string;
}
export type Reducer = (prev?: IState) => IState | undefined;

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
    return bubbleSort(times(() => Math.floor((Math.random() * 99) + 1), 20));
}

function model(state$: Stream<any>): Stream<Reducer> {
    let sorter: Iterator<ISortData[]> = genBubbleSort();
    const initialReducer$ = xs.of(() => {
        const value = sorter.next().value;
        return { list: value };
    });
    const addOneReducer$ = state$.map(({ list, speedChooser }) => {
        let speed;
        if (!speedChooser || speedChooser.speed === SPEED_2X) {
            speed = 500;
        } else if (speedChooser.speed === SPEED_1X) {
            speed = 1000;
        } else if (speedChooser.speed === SPEED_3X) {
            speed = 250;
        }
        return xs.periodic(speed).mapTo({ list, speedChooser });
    }).flatten()
        .mapTo(({ speedChooser }) => {
            let value = sorter.next();
            if (value.done) {
                sorter = genBubbleSort();
                value = sorter.next();
            }
            return {
                list: value.value,
                speedChooser,
            };
        });

    return xs.merge(initialReducer$, addOneReducer$) as any as Stream<Reducer>;
}
function view(listVNode$: Stream<[VNode, VNode]>): Stream<VNode> {
    return listVNode$.map(([controls, listItems]) => div('.BubbleSort', [
        div('.BubbleSort-demo', [
            div('.BubbleSort-controls', [controls]),
            listItems,
        ]),
        div('.BubbleSort-graph', h2('The Bubble Sort')),
    ]));
}

export default function BubbleSort(sources: ISources): ISinks {
    // Defining the list of items to be sorted.
    const state$ = sources.onion.state$;
    const List = makeCollection({
        collectSinks: (instances: any) => ({
            dom: instances.pickCombine('dom')
                .map((itemVNodes: VNode[]) => div('.BubbleSort-listContainer', itemVNodes)),
            onion: instances.pickMerge('onion'),
        }),
        item: BubbleSortItem,
        itemKey: (_: any, index: number) => index.toString(),
        itemScope: (key: string) => key,
    });
    const listSinks = isolate(List, 'list')(sources as any);
    const speedSinks = isolate(SpeedChooser, 'speedChooser')(sources as any);

    const speedReducer$ = speedSinks.onion as any as Stream<Reducer>;

    const reducer$ = xs.merge(model(state$), speedReducer$);
    const vdom$ = view(xs.combine(speedSinks.dom, listSinks.dom));
    return {
        dom: vdom$,
        onion: reducer$,
    };
}
