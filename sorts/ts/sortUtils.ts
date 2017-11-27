import {
    div,
    VNode,
} from '@cycle/dom';
import { TimeSource } from '@cycle/time';
import { makeCollection } from 'cycle-onionify';
import { times } from 'ramda';
import xs, { Stream } from 'xstream';
import { SCALE_1, SCALE_4 } from './PerformanceGraph';
import SortItem from './SortItem';
import { defaultSpeed, SPEED_1X, SPEED_2X, SPEED_3X, SPEED_4X, SPEED_5X } from './SpeedChooser';
import { Component, ISorter, ISortState, IState, Reducer } from './typedefs';

export function scaleToN(scale: number): number {
    const a = 10;
    const b = 100;
    const min = SCALE_1;
    const max = SCALE_4;
    return Math.round((((b - a) * (scale - min)) / (max - min)) + a);
}

export function ticker(time$: TimeSource, speedChooser: { speed: number }): Stream<any> {
    const speedChoice = speedChooser ? speedChooser.speed : SPEED_4X;
    let speed;
    if (speedChoice === SPEED_5X) {
        return time$.animationFrames();
    }
    switch (speedChoice) {
        case SPEED_1X:
            speed = 1000;
            break;
        case SPEED_2X:
            speed = 750;
            break;
        case SPEED_3X:
            speed = 500;
            break;
        case SPEED_4X:
        default:
            speed = 250;
            break;
    }
    return time$.periodic(speed);
}

export function randN(): number {
    return Math.floor((Math.random() * 99) + 1);
}

export function randArrayOfNumbers(scale: number): number[] {
    return times(() => randN(), scaleToN(scale));
}

export function makeSortData(
    arrayData: number[],
    compareAIndex: number,
    compareBIndex: number,
    compare: number,
    highlighted: number,
    numOps: number[]): ISortState {
    return {
        compare,
        graph: { scale: SCALE_1 },
        list: arrayData.map((value, index) => ({ compare, highlighted, index, value, compareAIndex, compareBIndex })),
        numOps,
        speedChooser: defaultSpeed(),
    };
}

export function sortModel(numOps: number[], genSort: (scale: number, numOps: number[]) => ISorter, time$: TimeSource) {
    return (state$: Stream<any>): Stream<Reducer> => {
        const initialReducer$ = xs.of(() => {
            return makeSortData([], 0, 0, 0, 0, numOps);
        });
        let sorter: ISorter;
        const addOneReducer$ = state$
            .map(({ list, speedChooser }) => ticker(time$, speedChooser).mapTo({ list, speedChooser }))
            .flatten()
            .mapTo(({ speedChooser, graph }) => {
                if (!sorter) {
                    sorter = genSort(graph.scale, numOps);
                }
                if (sorter.scale !== graph.scale) {
                    sorter = genSort(graph.scale, numOps);
                }
                let value = sorter.sorter.next();
                if (value.done) {
                    sorter = genSort(graph.scale, numOps);
                    value = sorter.sorter.next();
                }
                graph.numOps = numOps;
                return Object.assign(value.value, { speedChooser, graph });
            });
        return xs.merge(initialReducer$, addOneReducer$) as any as Stream<Reducer>;
    };
}

export function sortComponentList(): Component {
    return makeCollection({
        collectSinks: (instances: any) => ({
            dom: instances.pickCombine('dom')
                .map((itemVNodes: VNode[]) => itemVNodes),
            onion: instances.pickMerge('onion'),
        }),
        item: SortItem,
        itemKey: (_: any, index: number) => index.toString(),
        itemScope: (key: string) => key,
    });
}

export function sortView(listVNode$: Stream<[IState, VNode[]]>): Stream<VNode> {
    return listVNode$.map(([state, listItems]) => {
        const { compare } = state as any as ISortState;
        return div('.SortDemo', [
            div({
                class: {
                    'SortDemo-listContainer': true,
                },
                style: {
                    'grid-template-columns': `repeat(${listItems.length}, 1fr)`,
                },
            }, listItems),
            div({
                class: {
                    'SortDemo-compareAt': true,
                },
                style: {
                    bottom: `${compare}%`,
                    visibility: compare >= 0 ? 'visible' : 'hidden',
                },
            }),
        ]);
    });
}

