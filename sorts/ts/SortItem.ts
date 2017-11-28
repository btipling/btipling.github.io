import {
    div,
    span,
} from '@cycle/dom';
import xs from 'xstream';
import { ISinks, ISortDataItem, ISources } from './typedefs';

import '../sass/sortitem.sass';

export default function Item(sources: ISources): ISinks {
    const state$ = sources.onion.state$;

    const vdom$ = state$.map(state => {
        const sortData = state as any as ISortDataItem;
        return div({
            class: {
                'SortItem': true,
                'SortItem-focused': sortData.focused.indexOf(sortData.index) !== -1,
                'SortItem-highlighted': sortData.highlighted.indexOf(sortData.index) !== -1,
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
