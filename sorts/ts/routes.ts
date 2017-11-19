import BubbleSort from './BubbleSort';
import SortChooser from './SortChooser';
import { Component } from './typedefs';

const routes: { [key: string]: Component; } = {
    '/': SortChooser,
    '/bubblesort': BubbleSort,
};

export default routes;
