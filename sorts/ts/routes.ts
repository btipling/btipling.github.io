import bubbleSort from './BubbleSort';
import insertionSort from './InsertionSort';
import quickSort from './QuickSort';
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
    {
        name: 'Quick Sort',
        path: '/quick',
        sort: quickSort,
    },
];

export default routes;
