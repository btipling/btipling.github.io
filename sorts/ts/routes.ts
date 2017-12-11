import bubbleSort from './algorithms/BubbleSort';
import heapSort from './algorithms/HeapSort';
import insertionSort from './algorithms/InsertionSort';
import mergeSort from './algorithms/MergeSort';
import quickSort from './algorithms/QuickSort';
import { IRoute } from './typedefs';

const routes: IRoute[] = [
    {
        name: '',
        path: '/sorts/',
        sort: bubbleSort,
    },
    {
        name: bubbleSort.name,
        path: '/sorts/bubble',
        sort: bubbleSort,
    },
    {
        name: heapSort.name,
        path: '/sorts/heap',
        sort: heapSort,
    },
    {
        name: insertionSort.name,
        path: '/sorts/insertion',
        sort: insertionSort,
    },
    {
        name: mergeSort.name,
        path: '/sorts/merge',
        sort: mergeSort,
    },
    {
        name: quickSort.name,
        path: '/sorts/quick',
        sort: quickSort,
    },
];

export default routes;
