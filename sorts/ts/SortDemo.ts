import {
    div,
    VNode,
} from '@cycle/dom';
import isolate from '@cycle/isolate';
import { makeCollection } from 'cycle-onionify';
import xs, { Stream } from 'xstream';
import SortItem from './SortItem';
import { Component, ISinks, ISortDemo, ISources } from './typedefs';

import '../sass/sortdemo.sass';

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

function view(listVNode$: Stream<[ISortDemo, VNode[]]>): Stream<VNode> {
    return listVNode$.map(([state, listItems]) => {
        const { compare } = state as any as ISortDemo;
        return div('.SortDemo', [
            div({
                class: {
                    'SortDemo-listContainer': true,
                },
                style: {
                    'grid-template-columns': `repeat(${listItems.length}, 1fr)`,
                },
            }, listItems.concat([div({
                class: {
                    'SortDemo-compareAt': true,
                },
                style: {
                    bottom: `${compare}%`,
                    visibility: compare >= 0 ? 'visible' : 'hidden',
                },
            })])),
        ]);
    });
}

export default function SortDemo(sources: ISources): ISinks {
    const state$ = sources.onion.state$ as any as Stream<ISortDemo>;

    const List = sortComponentList();
    const listSinks = isolate(List, 'list')(sources as any);

    const vdom$ = view(xs.combine(state$, listSinks));
    return {
        dom: vdom$,
        onion: xs.empty(),
    };
}
