import bubbleSort from './BubbleSort';
import insertionSort from './InsertionSort';
import { IRoute } from './typedefs';

const routes: IRoute[] = [
    {
        name: '',
        path: '/',
        sort: bubbleSort,
    },
    {
        name: 'Bubble Sort',
        path: '/bubble',
        sort: bubbleSort,
    },
    {
        name: 'Insertion Sort',
        path: '/insertion',
        sort: insertionSort,
    },
];

export default routes;
