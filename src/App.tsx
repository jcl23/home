import { useEffect, useMemo, useRef, useState } from 'react'

import './App.css'
import styles from './styles/styles.ts';
import mainStyle from './styles/Style.module.css'
import { anim } from './styles/animation'
import { TRANSITION_DURATION } from './styles/animCfg'
import { ThemeSelector } from './ThemeSelector/ThemeSelector'
import { TextTransition } from './comps/TextTransition/TextTransition.tsx';
import { generateHilbertBorder, generateHilbertCurve, generateHilbertEdge, pointsToSvgPolyline } from './comps/Border/peano.ts';
import { projects } from './data/projects.tsx';
import { Border } from './comps/Border/Border.tsx';

const themes = styles;


function App() {


  // THEME STUFF
  const [themeIndex, unsafeSetThemeIndex] = useState(0);
  const setThemeIndex = (index: number) => {
    if (!Number.isInteger(index)) {
      console.error("Theme index is not an integer");
      return;
    }
    unsafeSetThemeIndex(index);
  }
  
  const [duration, setDuration] = useState(TRANSITION_DURATION);

  const style = themes[themeIndex];
  const n =  4;
  // const points = generateHilbertBorder(100);
  // console.log({points})
  // const svgPoints = pointsToSvgPolyline(points);

  const width = [
    240, 240, 240, 240//250, 300, 400
  ][themeIndex];

  const doHoverScale = themeIndex === 2;

  if (themeIndex === undefined) {
    console.error("Theme index is undefined");
  }

  const [selectedPassageIndex, setSelectedPassageIndex] = useState(-1);

  return (
    <div 
      className={`${mainStyle.outer} ${style.outer}`}
      onClick={(e) => {
        setSelectedPassageIndex(-1);
      }}
    >
      <div 
      className={mainStyle.debug}>
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
      <div className={`${mainStyle.main} ${style.main}`}>
        <div className={`${mainStyle.header} ${style.header}`}>
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
        </div>
        <div className={[style.name, mainStyle.name].join(' ')}>
          <Border iter={3} blockHeight={60} width={width} themeIndex={themeIndex}  passThrough={false}>
            {/* <div style={{width: "100%", height: "100%", display: "flex", flexDirection: "row"}}> */}
              <TextTransition text="Justin&nbsp;Lee" themeIndex={themeIndex} duration={duration}  />
              {/* <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gridTemplateRows: "repeat(4, 1fr)",
                  width: "180px",
                  height: "100px",
                  gap: "2px",
                }}>
                  {Array.from({ length: 16 }).map((_, index) => (
                    <div key={index} style={{
                      border: "1px solid black",
                      width: "100%",
                      height: "100%",
                    }} />
                  ))}
                </div>
                </div> */}
          </Border>
         
        </div>
        {/* <svg className={style.svg} width={10 + n * 100} height={110} viewBox={`-5 -5  ${10 + n * 100} 110`}>
          <polyline points={svgPoints} />
          <polyline points={svgPoints} />
        </svg> */}
      <div className={[style.body, mainStyle.body].join(' ')}>
          {/* <button ref={toggleThemeButtonRef} onClick={(e) => {

          }}>Current theme: {themeIndex}</button> */}
          <ThemeSelector currentIndex={themeIndex} setIndex={setThemeIndex} />
          <div className={`${style.nameOuter} ${mainStyle.nameOuter}`}>
          </div>
          {/* Do mainStyle and style, for div class "card" and its two children divs, classes "card_header" and "card_body" */}
          {/* Card 1 */}
          <div className={style.card_list} >
            {projects.map((project, i) => (
              <div 
                key={i}
                className={`${mainStyle.card} ${style.card} ${selectedPassageIndex === i + 1 ? style.selected : ''}`} 
                onClick={(e) => {
                  setSelectedPassageIndex(i + 1);
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <h1 
                  className={`${mainStyle.card_banner} ${style.card_banner}`}
                >
                 
                  <Border blockHeight={26} width={720 - 60} themeIndex={themeIndex} iter={2} passThrough={false} stackHeight={4}>
                     <p className={`${""} ${style.name_peano}`} style={{marginTop:"-6px"}}>  {project.name}</p>
                  </Border>
          
                </h1>
                <div className={`${mainStyle.card_header} ${style.card_header}`}>
                  
                </div>
                <div className={`${mainStyle.card_body} ${style.card_body}`}>
                {project.body}
                  <a href={project.link}>See Demo</a>
                </div>
              </div>
            ))}
           
          </div>
        </div>
      </div>
    </div>
  )
}
{/* <div 
className={`${mainStyle.card} ${style.card} ${selectedPassageIndex === 0 ? style.selected : ''}`}  */}
//>
{/* This next thing should have class name banner */}
{/* <h1 
  className={`${mainStyle.card_banner} ${style.card_banner}`}
  onClick={(e) => {
    setSelectedPassageIndex(0);
    e.preventDefault();
    e.stopPropagation();
  }}
>
    Homology Calculator
  </h1>
<div className={`${mainStyle.card_header} ${style.card_header}`}>
    Construct spaces and calculate their homology in seconds.
</div>
<div className={`${mainStyle.card_body} ${style.card_body}`}>
This interactive CW‑complex calculator is an educational tool designed to teach the fundamentals of topology—especially homology—by letting you build spaces and compute their homological features. With a solid grasp of homology, you'll be better equipped to understand advanced topics such as <a href="https://math.stackexchange.com/questions/73690/real-life-applications-of-topology">topological data analysis</a>, sensor network coverage, and robotic <a href="https://en.wikipedia.org/wiki/Configuration_space">configuration spaces</a>. These core concepts are also essential for exploring the classification of <a href="https://en.wikipedia.org/wiki/Topological_insulator">quantum materials</a>, analyzing <a href="https://en.wikipedia.org/wiki/Connectome">brain connectivity</a>, and enhancing modern AI through <a href="https://en.wikipedia.org/wiki/Topological_deep_learning">topological deep learning</a>. Master homology with our tool and build the mathematical foundation that underpins these cutting‑edge applications.
<a href="https://jcl23.github.io/homology/">See Demo</a>
</div>
</div> */}
// {/* Card 1 */}

// <div 
// className={`${mainStyle.card} ${style.card} ${selectedPassageIndex === 1 ? style.selected : ''}`} 
// onClick={(e) => {
//   setSelectedPassageIndex(1);
// }}
// >
// <div className={`${mainStyle.card_header} ${style.card_header}`}>
//   123
// </div>
// <div className={`${mainStyle.card_body} ${style.card_body}`}>
//   Description 1
// </div>
// </div>
// {/* Card 1 */}
// <div 
// className={`${mainStyle.card} ${style.card} ${selectedPassageIndex === 2 ? style.selected : ''}`} 
// onClick={(e) => {
//   setSelectedPassageIndex(2);
// }}
// >
// <div className={`${mainStyle.card_header} ${style.card_header}`}>
//   123
// </div>
// <div className={`${mainStyle.card_body} ${style.card_body}`}>
//   Description 1
// </div>
// </div>
export default App
