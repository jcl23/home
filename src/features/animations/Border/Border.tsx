import { generateHilbertBorder, generateSnakeBorder, Point, pointsToCompleteSvgPath, pointsToSvgPolyline } from "./peano";
import hilbertStyles from "./Border.module.css";
import ambientStyle from "../../../App.module.css"
import { useMemo, useRef } from "react";
import styles from "../../themes/styles";
import { TRANSITION_DURATION } from "../animCfg";
import { constructBorderPaths } from "./constructBorderPaths";

// Cache for memoizing border calculations

/**
 * Constructs border paths for a given theme index
 * Results are cached to avoid recalculation
*/

const PADDING = 5;
const GAP_PROP = 1;




const big = 574;
const med = 351.5;
const widths = [
    big, med, big, big, big, big, 280, 280, 570, 280
];

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
        () => constructBorderPaths(width, themeIndex, pathTo, blockHeight, iter, stackHeight),
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
                height: blockHeight + PADDING * 2,
            }}>
                {children}
            </div>
        )
    }

    const totalWidth = blockHeight * 2 + width;
    const totalHeight = stackHeight * (blockHeight) + PADDING * 2;
    const gapSize = adjacentDifference * GAP_PROP;
    const strokeLength = adjacentDifference - gapSize;
   
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
            ref={refSvg} className={`${ambientStyle.svg} ${styleModule.svg}`} height={totalHeight } width={`${width}px`}>
            {/* <animate attributeName="viewBox" to={`-${PADDING} -${PADDING} ${width + PADDING * 2} ${totalHeight}`} dur="1s" fill="freeze" /> */}
            <animate 
                attributeName="viewBox" 
                to={`-${PADDING * 1000} -${PADDING} ${width + PADDING * 2} ${totalHeight}`} 
                dur={`${TRANSITION_DURATION/1000}s`}  
                // calcMode="spline" 
                // keySplines="0.4 0 0.2 1" 
                // keyTimes="0;1"   
            />
            <circle cx="0" cy="0" r="3" fill="yellow" />

            <path
                className={[hilbertStyles.polyline2, styleModule.polyline2].join(" ")} 
                strokeWidth="1" 
                d={startingPath}

                style={{
                    // transform: `translateX(${finalMargin}px)`,
                    transitionDuration: `${TRANSITION_DURATION}ms`,
                    strokeWidth: 2,
                }}
            />
            <path
                className={[hilbertStyles.polyline1, styleModule.polyline1].join(" ")} 
                strokeWidth="4" 
                strokeDashoffset={gapSize}
                strokeDasharray={`${strokeLength}px,${gapSize}px`}
                style={{
                    transitionDuration: `${TRANSITION_DURATION}ms`,

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