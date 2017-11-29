import { DOMSource, VNode } from '@cycle/dom';
import { HistoryInput } from '@cycle/history';
import { TimeSource } from '@cycle/time';
import { StateSource } from 'cycle-onionify';
import { Location } from 'history';
import { Stream } from 'xstream';

export interface IState {
    graph: object;
    sort: object;
    speedChooser: object;
}

export interface ISortDataItem {
    value: number;
    index: number;
    compare: number;
    highlighted: number[];
    selected: number[];
    focused: number[];
    sections: number[][];
}

export type MakeSortDataFunc = (arrayData: number[][], highlighted: number[], focused: number[], compare: number, selected?: number[], sections?: number[][]) => ISortState;

export interface ISortState {
    compares: number[];
    lists: ISortDataItem[][];
    numOps: number[];
}

export interface ISources {
    dom: DOMSource;
    history: Stream<Location>;
    onion: StateSource<IState>;
    Time: TimeSource;
}

export type Reducer = (prev?: IState) => IState | undefined;

export interface ISinks {
    dom: Stream<VNode>;
    history?: Stream<HistoryInput>;
    onion: Stream<Reducer>;
}

export interface IGraphState {
    scale: number;
    numOps?: number[];
}

export type Component = (n: ISources) => ISinks;

export interface ISorter {
    sorter: Iterator<ISortState>;
    scale: number;
}

export interface ISort {
    genSort(scale: number, makeSortData: MakeSortDataFunc): ISorter;
    genSortScales(scales: number[]): number[];
}

export interface IRoute {
    sort: ISort;
    name: string;
    path: string;
}
