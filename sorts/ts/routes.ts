import BubbleSort from './BubbleSort';
import InsertionSort from './InsertionSort';
import { IRoute } from './typedefs';

const routes: IRoute[] = [
    {
        component: BubbleSort,
        name: '',
        path: '/',
    },
    {
        component: BubbleSort,
        name: 'Bubble Sort',
        path: '/bubble',
    },
    {
        component: InsertionSort,
        name: 'Insertion Sort',
        path: '/insertion',
    },
];

export default routes;
