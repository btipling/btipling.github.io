import {
    div,
    span,
} from '@cycle/dom';
import xs from 'xstream';
import { ISinks, ISortDataItem, ISources } from './typedefs';

import '../sass/bubblesortitem.sass';

export default function Item(sources: ISources): ISinks {
    const state$ = sources.onion.state$;

    const vdom$ = state$.map(state => {
        const sortData = state as any as ISortDataItem;
        return div({
            class: {
                'BubbleSortItem': true,
                'BubbleSortItem-compareA': sortData.highlighted === sortData.value &&
                    (sortData.compareAIndex === sortData.index || sortData.compareBIndex === sortData.index),
                'BubbleSortItem-compareB': (sortData.highlighted !== sortData.value && sortData.compareBIndex === sortData.index),
            },
            style: {
                height: `${sortData.value}%`,
            },
        }, [
                span('.content', ' '),
            ]);
    });
    return {
        dom: vdom$,
        onion: xs.empty(),
    };
}
