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
        name: 'Bubble Sort',
        path: '/bubble',
        sort: bubbleSort,
    },
    {
        name: 'Heap Sort',
        path: '/heap',
        sort: heapSort,
    },
    {
        name: 'Insertion Sort',
        path: '/insertion',
        sort: insertionSort,
    },
    {
        name: 'Merge Sort',
        path: '/merge',
        sort: mergeSort,
    },
    {
        name: 'Quick Sort',
        path: '/quick',
        sort: quickSort,
    },
];

export default routes;
