import { makeDOMDriver } from '@cycle/dom';
import { captureClicks, makeHistoryDriver } from '@cycle/history';
import { run } from '@cycle/run';
import onionify from 'cycle-onionify';
import Router from './Router';
import routes from './routes';

import '../sass/main.sass';

run(onionify(Router(routes)), {
    dom: makeDOMDriver('#main'),
    history: captureClicks(makeHistoryDriver()),
});
