import { DOMSource, VNode } from '@cycle/dom';
import { StateSource } from 'cycle-onionify';
import { Stream } from 'xstream';

interface IState {
    content: string;
}

export interface ISources {
    dom: DOMSource;
    onion: StateSource<IState>;
}

type Reducer = (prev?: IState) => IState | undefined;

export interface ISinks {
    dom: Stream<VNode>;
    onion: Stream<Reducer>;
}
