import { Point } from "../../../shared/types";
import { generateHilbertBorder, generateSnakeBorder, pointsToCompleteSvgPath } from "./peano";

export type HilbertBorderProps = {
    blockHeight: number;
    stackHeight?: number;
    children: React.ReactNode;
    pathIndices: [number, number];
    themeIndex: number;
    iter?: number;
    passThrough?: boolean;
    margin?: number;
};

type BorderPaths = {
    startingPath: string;
    widePath: string;
    startingPoints: Point[];
    widePoints: Point[];
    adjacentDifference: number;
    pointsPerSide: number;
};

const borderCache = new Map<string, BorderPaths>();


export const constructBorderPaths = function(
    width: number,
    themeTo: number,
    pathTo: number,
    blockHeight: number,
    iter: number,
    stackHeight: number,
    margin: number = 0,
): BorderPaths {
    const MEMOIZE = false;
    // Create cache key from parameters
    const cacheKey = `${pathTo}-${blockHeight}-${iter}-${stackHeight}-${margin}`;
    
    // Return cached result if available
    if (MEMOIZE && borderCache.has(cacheKey)) {
        return borderCache.get(cacheKey)!;
    }
    
    // Calculate border paths
    // const width = widths[pathTo];
    const mode = ["hilbert", "snake", "dots", "dots", "dots"][themeTo] ?? "hilbert";
    const center = blockHeight / 2 + width / 2;
    const left = blockHeight;
    const right = blockHeight + width;
    
    const hilbertPoints = generateHilbertBorder(blockHeight, 0, iter, stackHeight);
    const snakePoints = generateSnakeBorder(blockHeight, 0, iter, stackHeight);
    const startingPoints = mode === "hilbert" ? hilbertPoints : snakePoints;
     
    // Offset right side points
    startingPoints.slice(0, Math.floor(startingPoints.length / 2)).forEach(point => {
        point.x += width - blockHeight * 2;
    });
    startingPoints.push({... startingPoints[0]});
    

    if (margin !== 0) {
        startingPoints.forEach(point => {
            point.x += margin;
            point.y += margin;
        });
    }
    const startingPath = pointsToCompleteSvgPath(startingPoints);
    
    // Create wider version for hover effect
    const widePoints = startingPoints.map(p => {
        if (p.x < center + margin) {
            const distToLeft = p.x - (left + margin);
            return { x: p.x + distToLeft * 0.2, y: p.y };
        }
        if (p.x > center + margin) {
            const distToRight = p.x - (right + margin);
            return { x: p.x + distToRight * 0.2, y: p.y };
        }
        return p;
    });
    const widePath = pointsToCompleteSvgPath(widePoints);
    
    const pointsPerSide = (2 ** iter);
    const adjacentDifference = blockHeight / (pointsPerSide - 1);

        // Apply margin shift to all points
    

    const result: BorderPaths = {
        startingPath,
        widePath,
        startingPoints,
        widePoints,
        adjacentDifference,
        pointsPerSide
    };
    
    // Cache the result
    borderCache.set(cacheKey, result);
    
    return result;
}