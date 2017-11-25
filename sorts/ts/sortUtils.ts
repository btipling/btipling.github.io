import { times } from 'ramda';
import xs, { Stream } from 'xstream';
import { SCALE_1, SCALE_4 } from './PerformanceGraph';
import { SPEED_1X, SPEED_2X, SPEED_3X, SPEED_4X, SPEED_5X } from './SpeedChooser';

export function scaleToN(scale: number): number {
    const a = 10;
    const b = 100;
    const min = SCALE_1;
    const max = SCALE_4;
    return Math.round((((b - a) * (scale - min)) / (max - min)) + a);
}

export function ticker(speedChooser: { speed: number }): Stream<number> {
    const speedChoice = speedChooser ? speedChooser.speed : SPEED_4X;
    let speed;
    switch (speedChoice) {
        case SPEED_1X:
            speed = 1000;
            break;
        case SPEED_2X:
            speed = 500;
            break;
        case SPEED_3X:
            speed = 250;
            break;
        case SPEED_5X:
            speed = 50;
            break;
        case SPEED_4X:
        default:
            speed = 100;
            break;
    }
    return xs.periodic(speed);
}


export function randN(): number {
    return Math.floor((Math.random() * 99) + 1);
}

export function randArrayOfNumbers(scale: number): number[] {
    return times(() => randN(), scaleToN(scale));
}
