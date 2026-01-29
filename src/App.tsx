import { useEffect, useMemo, useRef, useState } from 'react';

import './App.css';
import { paths, points, TOTAL_STATES } from "./shared/constants/stateTransitionPaths";
import ambientStyle from "./App.module.css";
import layouts from "./features/layout/Layouts.module.css"; 
import styles from './features/themes/styles';
import { TRANSITION_DURATION } from './features/animations/animCfg'
import { ThemeSelector } from './features/themes'
import { TextTransition } from './features/animations';
import { Border } from './features/animations';
import { usePathTransition } from './features/layout';
// import NAME_WIDTH from "./"


const themes = styles;


const App = function () {
    const NAME_WIDTH = useMemo(() => {
        const computedStyle = getComputedStyle(document.documentElement);
        return parseInt(computedStyle.getPropertyValue('--NAME_WIDTH'));
    }, []);
  const refs = {
    outer: useRef(null),
    name: useRef(null),
    contact: useRef(null),
    contact2: useRef(null),
    proj1: useRef(null),
    proj2: useRef(null),
    proj3: useRef(null),
    proj4: useRef(null),    
  };
  // THEME STUFF
  const start = points[0];
  // const [duration, setDuration] = useState(TRANSITION_DURATION);
  const [debugStep, setDebugStep] = useState(0);
  const [[lastLayoutIndex, currentLayoutIndex], setLayoutIndices] = useState([start, start]);

  const setTarget = (index: number) => {
    setLayoutIndices((prev) => {
      if (prev[1] === index) return prev; // No change
      return [prev[1], index];
    });
  }
  const [modalOpen, setModalOpen] = useState(false);
  const [smoothIndices, showImages] = usePathTransition(
    points,
    paths,
    lastLayoutIndex,
    currentLayoutIndex,
    TRANSITION_DURATION, // Duration in milliseconds
  );
  
  const themeIndex = points.indexOf(currentLayoutIndex)
  const numStepsInTransition = paths[points.indexOf(lastLayoutIndex)][points.indexOf(currentLayoutIndex)].length - 1;
  const style = themes[points.indexOf(currentLayoutIndex)];




  if (themeIndex === undefined) {
    console.error("Theme index is undefined");
  }

  const [selectedPassageIndex, setSelectedPassageIndex] = useState(-1);
  // const rulesFor = (className: string) => `${styles[themeIndex][className] ?? ''} ${layouts[className + "_" + smoothIndices[1]] ?? ''}`;
  const classesFor = (className: string, other?: string) => `
  ${layouts[className + "_" + smoothIndices[1]] ?? ''}
  ${ambientStyle[className] ?? ''}
  ${styles[themeIndex][className] ?? ''}
  ${other ? styles[themeIndex][other] : ''} 
  `;

  const animTimePerStep = Math.floor(TRANSITION_DURATION / numStepsInTransition);

  const proj1Click = () => { window.open("https://justinl.me/rotate3"); }
  const proj2Click = () => { window.open("https://justinl.me/homology"); }
  const proj3Click = () => {};
  const proj4Click = () => {};

  return (
    <div className={classesFor("container")}
      onClick={(e) => { setSelectedPassageIndex(-1); }}>
        {/* <div className={classesFor("modal")}>
          <div className={classesFor("modalContent")}>
            <h2>Project Title</h2>
            <p>Project description goes here.</p>
            <button onClick={(e) => { e.stopPropagation(); setSelectedPassageIndex(-1); }}>Close</button>
          </div>
        </div> */}
        <div>
          {Array(TOTAL_STATES).fill(0).map((_, idx) => (
            <div key={idx} style={{display: 'inline-block', margin: '5px'}}>
              <button onClick={() => setTarget(idx)}>
                {`Go ${idx}`}
              </button>
            </div>
          ))}
        </div>
      <div ref={refs.outer}className={classesFor("outer")}     style={{transitionDuration: `${animTimePerStep}ms`}}>
        <div className={`${ambientStyle.header} ${style.header}`}>
          <div> <button className={`${ambientStyle.button} ${style.button}`}>
              Projects
          </button> </div>
          <div>
            <button className={`${ambientStyle.button} ${style.button}`}>
              Resume
            </button>
          </div>
          <div>
            <button className={`${ambientStyle.button} ${style.button}`}>
              About
            </button>
          </div>
        </div>

        <div ref={refs.outer} className={classesFor("layoutBorder")}>
          <div ref={refs.name} className={classesFor("name")}><div className={[style.name, ambientStyle.name].join(' ')}>
          {/* <Border margin={5} iter={3} blockHeight={60} pathIndices={smoothIndices} themeIndex={themeIndex} passThrough={false}>
            <TextTransition text="Justin&nbsp;Lee" themeIndex={themeIndex} duration={duration} />
          </Border>   */}
        </div></div>
          <div ref={refs.contact} className={classesFor("contact")}>
            <h2><a href="https://www.linkedin.com/in/justin-lee-2aa469212/">LinkedIn</a></h2>
            <h2><a href="mailto:justin.lee91375@gmail.com">Email</a></h2>
            <h2><a href="https://github.com/jcl23">GitHub</a></h2>
          </div>
          <div ref={refs.contact2} className={classesFor("contact2")}>2Contact</div>
            <div onClick={proj1Click} ref={refs.proj1} className={classesFor("proj1")}>
            <img src="src\assets\images\rotate_98.png"  className={classesFor("thumbnails", showImages ? "" : "hidden")} alt="Rotation Demo" />
            Symmetry Group Demo
            </div>
          <div onClick={proj2Click} ref={refs.proj2} className={classesFor("proj2")}>
            <img src="src\assets\images\homology_98.png"  className={classesFor("thumbnails")} alt="Rotation Demo" />
            Homology Calculator Demo
          </div>
          <div onClick={proj3Click} ref={refs.proj3} className={classesFor("proj3")}>
            Project 3
          </div>
          <div onClick={proj4Click} ref={refs.proj4} className={classesFor("proj4")}>Project 4</div>
        </div>
            <h2>
          Layout Index: {currentLayoutIndex}
          Step: {smoothIndices}
        </h2>
        {/* Name Section */}
        
      <ThemeSelector points={points} currentIndex={themeIndex} setIndex={setTarget} />
        </div>
        
      </div>

  )
}
export default App;
