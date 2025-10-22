// Animation components
export { TextTransition } from './TextTransition/TextTransition';
export { Border } from './Border/Border';

// Animation utilities
export { doPhaseIn, doSnakeIn, doBlinkIn, doBlockPhaseIn } from './textTransitions';
export { NAME_ANIMS, TRANSITION_DURATION, NUM_THEMES } from './animCfg';

// Math utilities
export { 
  generateHilbertBorder, 
  generateSnakeBorder, 
  pointsToCompleteSvgPath, 
  pointsToSvgPolyline 
} from './Border/peano';