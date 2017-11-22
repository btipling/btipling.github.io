import { DOMSource, VNode } from '@cycle/dom';
import { HistoryInput } from '@cycle/history';
import { StateSource } from 'cycle-onionify';
import { Location } from 'history';
import { Stream } from 'xstream';

interface IState {
    content: string;
}

export interface ISortDataItem {
    value: number;
    index: number;
    compare: number;
    compareAIndex: number;
    compareBIndex: number;
    highlighted: number;
}

export interface IBubbleState {
    list: ISortDataItem[];
    compare: number;
    speedChooser: number;
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

export type Component = (n: ISources) => ISinks;
