import BubbleSort from './BubbleSort';
import InsertionSort from './InsertionSort';
import SortView from './SortView';
import { IRoute } from './typedefs';

const routes: IRoute[] = [
    {
        component: SortView(BubbleSort),
        name: '',
        path: '/',
    },
    {
        component: SortView(BubbleSort),
        name: 'Bubble Sort',
        path: '/bubble',
    },
    {
        component: SortView(InsertionSort),
        name: 'Insertion Sort',
        path: '/insertion',
    },
];

export default routes;
