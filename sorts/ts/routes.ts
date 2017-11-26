import BubbleSort from './BubbleSort';
import { Component } from './typedefs';

const routes: { [key: string]: Component; } = {
    '/': BubbleSort,
    '/bubblesort': BubbleSort,
};

export default routes;
