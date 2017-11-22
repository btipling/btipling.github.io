import {
    div,
    span,
} from '@cycle/dom';
import xs from 'xstream';
import { ISinks, ISortDataItem, ISources } from './typedefs';

export default function Item(sources: ISources): ISinks {
    const state$ = sources.onion.state$;

    const vdom$ = state$.map(state => {
        const sortData = state as any as ISortDataItem;
        console.log(sortData.compare, 'compare?');
        return div({
            class: {
                'BubbleSort-compareA': sortData.compareAIndex === sortData.index || (sortData.highlighted === sortData.value && sortData.compareBIndex === sortData.index),
                'BubbleSort-compareB': (sortData.highlighted !== sortData.value && sortData.compareBIndex === sortData.index),
                'BubbleSort-item': true,
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
