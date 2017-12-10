import bubbleSort from './algorithms/BubbleSort';
import heapSort from './algorithms/HeapSort';
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
        name: bubbleSort.name,
        path: '/bubble',
        sort: bubbleSort,
    },
    {
        name: heapSort.name,
        path: '/heap',
        sort: heapSort,
    },
    {
        name: insertionSort.name,
        path: '/insertion',
        sort: insertionSort,
    },
    {
        name: mergeSort.name,
        path: '/merge',
        sort: mergeSort,
    },
    {
        name: quickSort.name,
        path: '/quick',
        sort: quickSort,
    },
];

export default routes;
