import bubbleSort from './algorithms/BubbleSort';
import insertionSort from './algorithms/InsertionSort';
import mergeSort from './algorithms/MergeSort';
import quickSort from './algorithms/QuickSort';
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
    {
        name: 'Merge Sort',
        path: '/merge',
        sort: mergeSort,
    },
];

export default routes;
