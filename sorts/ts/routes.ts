import BubbleSort from './BubbleSort';
import SortView from './SortView';
import { Component } from './typedefs';

const routes: { [key: string]: Component; } = {
    '/': SortView(BubbleSort),
    '/bubblesort': SortView(BubbleSort),
};

export default routes;
