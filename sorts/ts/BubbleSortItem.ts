import {
    div,
    span,
} from '@cycle/dom';
import xs from 'xstream';
import { ISinks, ISortData, ISources } from './typedefs';

export default function Item(sources: ISources): ISinks {
    const state$ = sources.onion.state$;

    const vdom$ = state$.map(state => {
        const sortData = state as any as ISortData;

        return div({
            class: {
                'BubbleSort-compareA': sortData.compareAIndex === sortData.index,
                'BubbleSort-compareB': sortData.compareBIndex === sortData.index,
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
