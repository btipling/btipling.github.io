import {
    div,
    span,
    VNode,
} from '@cycle/dom';
// import isolate from '@cycle/isolate';
import xs, { Stream } from 'xstream';
import { ISinks, ISortDemo, ISources, Reducer } from '../typedefs';

import '../../sass/sortdemo.sass';
import '../../sass/sortitem.sass';

function view(sortList$: Stream<[ISortDemo]>): Stream<VNode> {
    return sortList$.map(([state]) => {
        const { compare } = state as any as ISortDemo;
        return div('.SortDemo', [
            div({
                class: {
                    'SortDemo-listContainer': true,
                },
                style: {
                    'grid-template-columns': `repeat(${state.list.length}, 1fr)`,
                },
            }, state.list
                .filter(({ value }) => value >= 0)
                .map(sortData => div({
                    class: {
                        'SortItem': true,
                        'SortItem-focused': sortData.focused.indexOf(sortData.index) !== -1,
                        'SortItem-highlighted': sortData.highlighted.indexOf(sortData.index) !== -1,
                        'SortItem-highlightedSection': sortData.sections[1] && sortData.sections[1].find((index: number) => index === sortData.index) !== undefined,
                        'SortItem-section': sortData.sections.length && sortData.sections[0].find((index: number) => index === sortData.index) !== undefined,
                        'SortItem-selected': sortData.selected.indexOf(sortData.index) !== -1,
                    },
                    style: {
                        height: `${sortData.value}%`,
                        visibility: sortData.value ? 'visible' : 'hidden',
                    },
                },
                    span('.content', ' '))),
            ),
        ].concat([div({
            class: {
                'SortDemo-compareAt': true,
            },
            style: {
                bottom: `${compare}%`,
                visibility: compare >= 0 ? 'visible' : 'hidden',
            },
        })]));
    });
}

export default function SortDemo(sources: ISources): ISinks {
    const state$ = (sources.onion.state$ as any as Stream<ISortDemo>);

    const reducer$ = xs.of(function initReducer() {
        return { compare: 0, list: [] };
    }) as any as Stream<Reducer>;

    const vdom$ = view(xs.combine(state$));
    return {
        dom: vdom$,
        onion: reducer$,
    };
}
