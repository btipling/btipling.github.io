import { SCALE_1, SCALE_2, SCALE_3, SCALE_4 } from './PerformanceGraph';

export function scaleToN(scale: number): number {
    switch (scale) {
        case SCALE_2:
            return 85;
        case SCALE_3:
            return 140;
        case SCALE_4:
            return 200;
        case SCALE_1:
        default:
            return 20;
    }
}
