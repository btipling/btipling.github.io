/**
 * This file generates performance data by running a number of iterations of each of the sorting algorithms and taking the average.
 */
import { writeFileSync } from 'fs';
import bubbleSort from '../algorithms/BubbleSort';
import heapSort from '../algorithms/HeapSort';
import insertionSort from '../algorithms/InsertionSort';
import mergeSort from '../algorithms/MergeSort';
import quickSort from '../algorithms/QuickSort';
import { SCALE_1, SCALE_2, SCALE_3, SCALE_4 } from '../constants';

const NUM_ITERATIONS = 1000000;
const FILE_PATH = '../generatedPerformanceData.json';

const algorithms = [
    bubbleSort,
    insertionSort,
    quickSort,
    mergeSort,
    heapSort,
];

const scales = [
    SCALE_1,
    SCALE_2,
    SCALE_3,
    SCALE_4,
];

let resultData = {};
algorithms.forEach(sort => {
    resultData = generateAverageScales(scales, sort, resultData);
});
const resultStr = JSON.stringify(resultData, undefined, '    ');
console.log(resultStr);
writeFileSync(FILE_PATH, resultStr);

function generateAverageScales(suppliedScales: number[], sort, data = {}) {
    const sortName = sort.name;
    if (!data[sortName]) {
        data[sortName] = new Map();
    }
    const results = {};
    const allResults = {};
    suppliedScales.forEach(scale => {
        results[scale] = {};
        allResults[scale] = [];
    });
    for (let i = 0; i < NUM_ITERATIONS; i++) {
        const genResult = sort.genSortScales(scales);
        suppliedScales.forEach(scale => {
            const scaleIndex = scale - 1;
            const scaleResult = genResult[scaleIndex];
            const currentCount = results[scale][scaleResult] || 0;
            results[scale][scaleResult] = currentCount + 1;
            allResults[scale].push(scaleResult);
        });
    }
    suppliedScales.forEach(scale => {

        const sum = allResults[scale].reduce((acc, value) => acc + value, 0);
        const average = Math.round(sum / NUM_ITERATIONS);
        const best = allResults[scale].reduce((acc, value) => value < acc ? value : acc, Number.POSITIVE_INFINITY);
        const worst = allResults[scale].reduce((acc, value) => value > acc ? value : acc, -1);

        let medium = -1;
        let biggestCount = -1;
        Object.entries(results[scale]).forEach(([key, value]) => {
            if (value > biggestCount) {
                medium = parseInt(key, 10);
                biggestCount = value;
            }
        });

        const scaleResult = { best, worst, average, medium };
        data[sortName][scale] = scaleResult;
    });
    return data;
}
