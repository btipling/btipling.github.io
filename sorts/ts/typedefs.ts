import { DOMSource, VNode } from '@cycle/dom';
import { HistoryInput } from '@cycle/history';
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
    compareAIndex: number;
    compareBIndex: number;
    highlighted: number;
}

export interface ISortState {
    compare: number;
    graph: { scale: number };
    list: ISortDataItem[];
    numOps: number[];
    speedChooser: { speed: number };
}

export interface ISources {
    dom: DOMSource;
    history: Stream<Location>;
    onion: StateSource<IState>;
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
