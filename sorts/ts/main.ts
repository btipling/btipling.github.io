import { makeDOMDriver } from '@cycle/dom';
import { captureClicks, makeHistoryDriver } from '@cycle/history';
import { run } from '@cycle/run';
import onionify from 'cycle-onionify';
import Router from './Router';
import routes from './routes';
import SortView from './SortView';

import '../sass/main.sass';

run(onionify(Router(routes, SortView)), {
    dom: makeDOMDriver('#app'),
    history: captureClicks(makeHistoryDriver()),
});
