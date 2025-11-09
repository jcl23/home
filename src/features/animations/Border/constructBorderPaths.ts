import { Point } from "../../../shared/types";
import { generateHilbertBorder, generateSnakeBorder, pointsToCompleteSvgPath } from "./peano";

type HilbertBorderProps = {
    blockHeight: number;
    stackHeight?: number;
    children: React.ReactNode;
    pathIndices: [number, number];
    themeIndex: number;
    iter?: number;
    passThrough?: boolean;
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
): BorderPaths {
    const MEMOIZE = false;
    // Create cache key from parameters
    const cacheKey = `${pathTo}-${blockHeight}-${iter}-${stackHeight}`;
    
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
    startingPoints.push(startingPoints[0]);
    
    const startingPath = pointsToCompleteSvgPath(startingPoints);
    
    // Create wider version for hover effect
    const widePoints = startingPoints.map(p => {
        if (p.x < center) {
            const distToLeft = p.x - left;
            return { x: p.x + distToLeft * 0.2, y: p.y };
        }
        if (p.x > center) {
            const distToRight = p.x - right;
            return { x: p.x + distToRight * 0.2, y: p.y };
        }
        return p;
    });
    const widePath = pointsToCompleteSvgPath(widePoints);
    
    const pointsPerSide = (2 ** iter);
    const adjacentDifference = blockHeight / (pointsPerSide - 1);
    
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