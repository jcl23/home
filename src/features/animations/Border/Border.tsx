import { generateHilbertBorder, generateSnakeBorder, Point, pointsToCompleteSvgPath, pointsToSvgPolyline } from "./peano";
import hilbertStyles from "./Border.module.css";
import ambientStyle from "../../../App.module.css"
import { useMemo, useRef } from "react";
import styles from "../../themes/styles";

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

const PADDING = 5;
const GAP_PROP = 1;

const big = 570
const widths = [
    big, 350, big, big, 570, 570, 280, 280, 570, 280
];
// Cache for memoizing border calculations
const borderCache = new Map<string, BorderPaths>();

/**
 * Constructs border paths for a given theme index
 * Results are cached to avoid recalculation
 */
function constructBorderPaths(
    themeTo: number,
    pathTo: number,
    blockHeight: number,
    iter: number,
    stackHeight: number
): BorderPaths {
    const MEMOIZE = false;
    // Create cache key from parameters
    const cacheKey = `${pathTo}-${blockHeight}-${iter}-${stackHeight}`;
    
    // Return cached result if available
    if (MEMOIZE && borderCache.has(cacheKey)) {
        return borderCache.get(cacheKey)!;
    }

    // Calculate border paths
    const width = widths[pathTo];
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

export const Border = ({ blockHeight, pathIndices, themeIndex, children, iter = 3, passThrough = false, stackHeight = 1}: HilbertBorderProps) => {

    const [_pathFrom, pathTo] = pathIndices;
    const styleModule = styles[themeIndex ?? 0];

    const doHoverScale = themeIndex === 2;
    console.log("DoHoverScale:", doHoverScale);
    const width = widths[pathTo];

    // Initialize hooks before any conditional returns
    const refSvg = useRef<SVGSVGElement>(null);
    const refOuter = useRef<HTMLDivElement>(null);
    const refInnerBox = useRef<HTMLDivElement>(null);

    // Use memoized border construction
    const borderPaths = useMemo(
        () => constructBorderPaths(themeIndex, pathTo, blockHeight, iter, stackHeight),
        [pathTo, blockHeight, iter, stackHeight]
    );

    const { 
        startingPath, 
        adjacentDifference, 
    } = borderPaths;

    themeIndex  ??= 0;
    if (passThrough) {
        return (
            <div className={`${ambientStyle.outer} ${styleModule.outer}`} style={{
                width: "100%",
                height: blockHeight + PADDING * 2,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}>
                {children}
            </div>
        )
    }

    const totalWidth = blockHeight * 2 + width;
    const gapSize = adjacentDifference * GAP_PROP;
    const strokeLength = adjacentDifference - gapSize;
    const totalHeight = stackHeight * (blockHeight + PADDING * 2);
   
    const svgMouseOutHandler = (e: React.MouseEvent) => {
        const target = e.target as SVGElement;
        if (target.tagName.toLowerCase() === "svg") {
            const paths = target.querySelectorAll("path");
            paths.forEach((path) => {
                path.setAttribute("d", startingPath);
            });
        }
    }
    
    return (
    <div ref={refOuter} className={`${ambientStyle.outer} ${styleModule.outer}`} style={{
        width: "100%",
        height: totalHeight,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    }}>
        <h6 style={{transform:"translateY(0px)", position: "absolute", zIndex: "100", top: 0, background: "white"}}>
            {width}, {pathTo}, {themeIndex}
        </h6>

        <svg 
            // onMouseEnter={doHoverScale ? svgMouseOverHandler : undefined}
            // onMouseLeave={doHoverScale ? svgMouseOutHandler : undefined}
            onMouseOut={svgMouseOutHandler}
            ref={refSvg} className={`${ambientStyle.svg} ${styleModule.svg}`} height={totalHeight} width={`${width}px`}>
            {/* <animate attributeName="viewBox" to={`-${PADDING} -${PADDING} ${width + PADDING * 2} ${totalHeight}`} dur="1s" fill="freeze" /> */}
            <animate attributeName="viewBox" to={`-${0} -${0} ${width + 0 * 2} ${totalHeight}`} dur="1s" />
            <animate attributeName="width" to={`${width}px`} dur="1s" fill="freeze" />
            <circle cx="0" cy="0" r="3" fill="yellow" />

            <path
                className={[hilbertStyles.polyline2, styleModule.polyline2].join(" ")} 
                strokeWidth="1" 
                d={startingPath}

                style={{
                    // transform: `translateX(${finalMargin}px)`,
                    transition: "0.5s",
                    strokeWidth: 2,
                }}
            />
            <path
                className={[hilbertStyles.polyline1, styleModule.polyline1].join(" ")} 
                strokeWidth="4" 
                strokeDashoffset={gapSize}
                strokeDasharray={`${strokeLength}px,${gapSize}px`}
                style={{
                    transition: "0.5s",
                }}
                d={startingPath}
            />

          <path
            //     className={[hilbertStyles.polyline2, styleModule.polyline2].join(" ")} 
            //     strokeWidth="2" 
            //     stroke="black"
            //     d={`M ${bottomLeft.x},${bottomLeft.y} L ${bottomRight.x},${bottomRight.y}`}
            //     style={{
            //         transform: `translateX(${finalMargin}px)`,
            //         transition: "0.5s",
            //     }}
            // />
            // <path
            //     d={`M ${bottomLeft.x},${bottomLeft.y} L ${bottomRight.x},${bottomRight.y}`}
            //     className={[hilbertStyles.polyline1, styleModule.polyline1].join(" ")} 
            //     strokeWidth="4" 
            //     stroke="black"
            //     strokeDashoffset={gapSize}
            //     strokeDasharray={`${strokeLength}px,${gapSize}px`}
            //     style={{
            //         transform: `translateX(${finalMargin}px)`,
            //         transition: "0.5s",
            //     }}
            />

        {/* END BOTTOM */}
        </svg>
        <div 
            ref={refInnerBox}
            className={`${ambientStyle.inner} ${styleModule.inner}`}
            style={{
                width: totalWidth - gapSize * 2 - PADDING * 4 - blockHeight * 2,
                height: blockHeight - gapSize - PADDING * 2,
                margin: `-${gapSize / 2}px -${gapSize / 2 }px`,
                padding: `${gapSize / 2}px ${gapSize }px`,
                pointerEvents: "none",
                textAlign: "center",
            }}
        >
            {children}
        </div>
    </div>)
}