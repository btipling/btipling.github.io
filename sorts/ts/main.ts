import { makeDOMDriver } from '@cycle/dom';
import { captureClicks, makeHashHistoryDriver } from '@cycle/history';
import { run } from '@cycle/run';
import onionify from 'cycle-onionify';
import SortChooser from './SortChooser';

run(onionify(SortChooser), {
    dom: makeDOMDriver('#main'),
    history: captureClicks(makeHashHistoryDriver()),
});
