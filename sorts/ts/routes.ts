import SortView from './SortView';
import { Component } from './typedefs';

const routes: { [key: string]: Component; } = {
    '/': SortView,
    '/bubblesort': SortView,
};

export default routes;
