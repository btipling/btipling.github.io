import {
    span,
} from '@cycle/dom';
import xs from 'xstream';
import { ISinks, ISortData, ISources } from './typedefs';

export default function Item(sources: ISources): ISinks {
    const state$ = sources.onion.state$;

    const vdom$ = state$.map(state => {
        const sortData = state as any as ISortData;
        let open = '';
        let close = '';
        if (sortData.compareAIndex === sortData.index) {
            open = '[';
            close = ']';
        } else if (sortData.compareBIndex === sortData.index) {
            open = '(';
            close = ')';
        }

        return span('.item', [
            span('.content', `${open}${sortData.value}${close} `),
        ]);
    });
    return {
        dom: vdom$,
        onion: xs.empty(),
    };
}
