import { useEffect, useState } from "react";
// import type { Graph } from "./graphs";

export const usePathTransition = function(
  // graph: Graph,
  points: number[],
  paths: number[][][],
  currentIndex: number, 
  targetIndex: number,
  duration: number
): [number, number] {
  const [activeData, setActiveData] = useState<[number, number]>([currentIndex, currentIndex]);

  useEffect(() => {
    const pCurrent = points.indexOf(currentIndex);
    const pTarget = points.indexOf(targetIndex);
    const path = paths[pCurrent][pTarget];
    if (!path || path.length <= 1) return;

    const interval = duration / (path.length - 1);

    path.slice(1).forEach((node, i) => {
      setTimeout(() => {
        setActiveData(data => {
          return [data[1], node];
        });
      }, interval * (i));
    });
  }, [targetIndex, currentIndex, duration, paths]);

  return activeData;
}