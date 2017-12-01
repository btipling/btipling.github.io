import { makeDOMDriver } from '@cycle/dom';
import { captureClicks, makeHistoryDriver } from '@cycle/history';
import { run } from '@cycle/run';
import { timeDriver } from '@cycle/time';
import onionify from 'cycle-onionify';
import Router from './components/Router';
import SortView from './components/SortView';
import routes from './routes';

import '../sass/main.sass';

run(onionify(Router(routes, SortView)), {
    Time: timeDriver,
    dom: makeDOMDriver('#app'),
    history: captureClicks(makeHistoryDriver()),
});
