import { useEffect, useState } from "react";
// import type { Graph } from "./graphs";
type PathState = [[number, number], boolean];
export const usePathTransition = function(
  // graph: Graph,
  points: number[],
  paths: number[][][],
  currentIndex: number, 
  targetIndex: number,
  duration: number
): PathState {
  const [activeData, setActiveData] = useState<PathState>([[currentIndex, currentIndex], true]);

  useEffect(() => {
    let stepIndex = 0;
    const pCurrent = points.indexOf(currentIndex);
    const pTarget = points.indexOf(targetIndex);
    const path = paths[pCurrent][pTarget];
    if (!path || path.length <= 1) return;
    
    const interval = (duration) / (path.length - 1);

    const putStep = (nextStep: number, showImages: boolean) => {
      setTimeout(() => {
        setActiveData((data) => [[data[0][1], nextStep], showImages]);
      }, interval * stepIndex);
      stepIndex += 1;
    };

    // first hide the images given the current step 
    putStep(currentIndex, false);   
      
    
    path.slice(1).forEach((node) => {
      putStep(node, false);
    });
    // finally show the images
    putStep(targetIndex, true);

  }, [targetIndex, currentIndex, duration, paths, points]);

  return activeData;
}