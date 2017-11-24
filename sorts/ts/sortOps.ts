import { SCALE_1, SCALE_4 } from './PerformanceGraph';

export function scaleToN(scale: number): number {
    const a = 10;
    const b = 100;
    const min = SCALE_1;
    const max = SCALE_4;
    return Math.round((((b - a) * (scale - min)) / (max - min)) + a);
}
