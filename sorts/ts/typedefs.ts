import { DOMSource, VNode } from '@cycle/dom';
import { HistoryInput } from '@cycle/history';
import { StateSource } from 'cycle-onionify';
import { Location } from 'history';
import { Stream } from 'xstream';

interface IState {
    content: string;
}

export interface ISources {
    dom: DOMSource;
    history: Stream<Location>;
    onion: StateSource<IState>;
}

type Reducer = (prev?: IState) => IState | undefined;

export interface ISinks {
    dom: Stream<VNode>;
    history?: Stream<HistoryInput>;
    onion: Stream<Reducer>;
}

export type Component = (n: ISources) => ISinks;
