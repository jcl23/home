import { useEffect, useMemo, useRef, useState } from 'react';

import './App.css';
import { paths, points } from "./data/stateTransitionPaths.ts";
import ambientStyle from "./App.module.css";
import layouts from "./styles/Layouts.module.css"; 
import styles from './styles/styles.ts';
import { anim } from './styles/animation'
import { TRANSITION_DURATION } from './styles/animCfg'
import { ThemeSelector } from './ThemeSelector/ThemeSelector'
import { TextTransition } from './comps/TextTransition/TextTransition.tsx';
import { Border } from './comps/Border/Border.tsx';
import { usePathTransition } from './usePathTransition.ts';

const themes = styles;


const App = function () {

  const refs = {
    outer: useRef(null),
    name: useRef(null),
    contact: useRef(null),
    contact2: useRef(null),
    p1: useRef(null),
    p2: useRef(null),
    p3: useRef(null),
    p4: useRef(null),    
  };
  // THEME STUFF
  const start = points[0];
  const [duration, setDuration] = useState(TRANSITION_DURATION);
  const [[lastLayoutIndex, currentLayoutIndex], setLayoutIndices] = useState([start, start]);
  const setTarget = (index: number) => {
    setLayoutIndices((prev) => {
      if (prev[1] === index) return prev; // No change
      return [prev[1], index];
    });
  }

  const smoothLayoutIndex = usePathTransition(
    points,
    paths,
    lastLayoutIndex,
    currentLayoutIndex,
    600, // Duration in milliseconds
  );
  
  const themeIndex = points.indexOf(currentLayoutIndex)

  const style = themes[points.indexOf(currentLayoutIndex)];



  const width = [
    248.5, 248.5, 248.5, 248.5, 248.5//250, 300, 400
    // 248.5, 248.5, 248.5, 240//250, 300, 400
  ][themeIndex];


  if (themeIndex === undefined) {
    console.error("Theme index is undefined");
  }

  const [selectedPassageIndex, setSelectedPassageIndex] = useState(-1);
  // const rulesFor = (className: string) => `${styles[themeIndex][className]} ${layouts[className + "_" + smoothLayoutIndex]}`;
  const classesFor = (className: string) => `
    ${ambientStyle[className]}
    ${styles[themeIndex][className]} 
    ${layouts[className + "_" + smoothLayoutIndex]}`;



  return (
    <div 
      className={`${ambientStyle.outer} ${style.outer}`}
      onClick={(e) => {
        setSelectedPassageIndex(-1);
      }}
    >
      <div 
      className={ambientStyle.debug}>
        <h2>ThemeIndex: {themeIndex}, LayoutIndex: {currentLayoutIndex}</h2>
        <label htmlFor="durationSlider">Transition Duration:</label>
        <input
          id="durationSlider" type="range" min="0" max="4" step="1"
          value={[200, 500, 1000, 10000, 100000].indexOf(duration)}
          onChange={(e) => {
            const index = parseInt(e.target.value, 10);
            setDuration([200, 500, 1000, 10000, 100000][index]);
          }}
        />
        <span>{duration} ms</span>
      </div>
      <div className={classesFor("outer")}>
        {/* <div className={`${mainStyle.header} ${style.header}`}>
          <div> <button className={`${mainStyle.button} ${style.button}`}>
              Projects
          </button> </div>
          <div>
            <button className={`${mainStyle.button} ${style.button}`}>
              Resume
            </button>
          </div>
          <div>
            <button className={`${mainStyle.button} ${style.button}`}>
              3
            </button>
          </div>
        </div> */}
        {/* Name Section */}
        <div className={[style.name, ambientStyle.name].join(' ')}>
          <Border iter={3} blockHeight={60} width={width} themeIndex={themeIndex} passThrough={false}>
            <TextTransition text="Justin&nbsp;Lee" themeIndex={themeIndex} duration={duration} />
          </Border>  
        </div>

        <div ref={refs.outer} className={classesFor("layoutBorder")}>
          <div ref={refs.name} className={classesFor("name")}>Name</div>
          <div ref={refs.contact} className={classesFor("contact")}>Contact</div>
          <div ref={refs.contact2} className={classesFor("contact2")}>2Contact</div>
          <div ref={refs.p1} className={classesFor("p1")}>P1</div>
          <div ref={refs.p2} className={classesFor("p2")}>P2</div>
          <div ref={refs.p3} className={classesFor("p3")}>P3</div>
          <div ref={refs.p4} className={classesFor("p4")}>P4</div>
        </div>
    
        </div>
        <ThemeSelector points={points} currentIndex={themeIndex} setIndex={setTarget} />
      </div>

  )
}
export default App;