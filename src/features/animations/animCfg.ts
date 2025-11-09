import { doBlinkIn, doBlockPhaseIn, doPhaseIn, doSnakeIn } from "./textTransitions";

export const TRANSITION_DURATION = 600;
export const NUM_THEMES = 5;
// export const NAME_ANIMS = [
//     doBlockPhaseIn,
//     doBlockPhaseIn,
//     doBlockPhaseIn,
//     doBlockPhaseIn,
//     doBlockPhaseIn,
// ]
export const NAME_ANIMS = [
    doBlockPhaseIn,
    doBlinkIn,
    doPhaseIn,
    doSnakeIn,
    doSnakeIn,
]
