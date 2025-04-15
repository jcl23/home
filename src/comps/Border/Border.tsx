import { generateHilbertBorder, generateSnakeBorder, Point, pointsToCompleteSvgPath, pointsToSvgPolyline } from "./peano";
import hilbertStyles from "./Border.module.css";
import mainStyle from '../../styles/Style.module.css'
import { useEffect, useRef } from "react";
import styles from "../../styles/styles";


type HilbertBorderProps = {
    blockHeight: number;
    stackHeight?: number;
    width: number;
    children: React.ReactNode;
    themeIndex: number;
    iter?: number;
    passThrough?: boolean;
};




const PADDING = 5;
const GAP_PROP = 1;
const CANV_WIDTH = 720;

function compareAndUpdateProps(
    oldRef: React.MutableRefObject<Record<string, any>>,
    newObj: Record<string, any>
): string {
    const removed: string[] = [];
    const changed: string[] = [];
    const added: string[] = [];

    // Identify removed and changed properties.
    for (const key in oldRef.current) {
        if (!(key in newObj)) {
            removed.push(`(${key})`);
        } else if (oldRef.current[key] !== newObj[key]) {
            changed.push(`(${key}): ${oldRef.current[key]} --> ${newObj[key]}`);
        }
    }

    // Identify new properties.
    for (const key in newObj) {
        if (!(key in oldRef.current)) {
            added.push(`(${key}): ${newObj[key]}`);
        }
    }

    // Update the ref with the new object.
    oldRef.current = { ...newObj };

    // Return a summary string with removed properties first, then changed, then added.
    return ["Removed:", ...removed, "Changed:", ...changed, "Added:", ...added].join("\n");
}
export const Border = ({ blockHeight, width, themeIndex, children, iter = 3, passThrough = false, stackHeight = 1}: HilbertBorderProps) => {
    
    const styleModule = styles[themeIndex ?? 0];
    const lastPropValRef = useRef<Record<string, any>>({});

  const doHoverScale = themeIndex === 2;


    themeIndex  ??= 0;
    if (passThrough) {
        return (
            <div className={`${mainStyle.outer} ${styleModule.outer}`} style={{
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

    
    const mode = themeIndex == 1 ? "snake" : "hilbert";
    const hilbertPoints = generateHilbertBorder(blockHeight, 0, iter, stackHeight);
    const snakePoints = generateSnakeBorder(blockHeight, 0, iter, stackHeight);

    const startingPoints = mode === "hilbert" ? hilbertPoints : snakePoints;
    startingPoints.slice(0, Math.floor(startingPoints.length / 2)).forEach(point => {
        point.x += width;
    });
    const startingPath = pointsToCompleteSvgPath(startingPoints);
    if (!Number.isInteger(themeIndex)) {
        console.log("WTF");
    }

    const propsObj = {
        "Theme #": themeIndex + 1,
        "Points": startingPoints.length,
        "X Range:": `${Math.min(...startingPoints.map(p => p.x))} - ${Math.max(...startingPoints.map(p => p.x))}`,
        "Y Range:": `${Math.min(...startingPoints.map(p => p.y))} - ${Math.max(...startingPoints.map(p => p.y))}`,
        "Width": width,
        "Height": blockHeight,
    }
    const change = compareAndUpdateProps(lastPropValRef, propsObj);
    console.log(change);

    // console.log(`
    // Theme #: ${themeIndex + 1};
    // Points: ${points.length};
    // MIN X: ${Math.min(...points.map(p => p.x))};
    // MIN Y: ${Math.min(...points.map(p => p.y))};
    // MAX X: ${Math.max(...points.map(p => p.x))};
    // MAX Y: ${Math.max(...points.map(p => p.y))};
    // Width: ${width};
    // Height: ${blockHeight};
    // `);
    const pointsPerSide = (2 ** iter);
    const pointsBerBox = (pointsPerSide ** 2) * stackHeight;
    const leftPoints = startingPoints.slice(pointsBerBox);
    const rightPoints = startingPoints.slice(0, pointsBerBox);
    const topLeft = leftPoints[0];
    const bottomLeft = leftPoints[leftPoints.length - 1];
    const bottomRight = { x: rightPoints[0].x, y: rightPoints[0].y };
    const topRight = { x: rightPoints[rightPoints.length - 1].x + width, y: rightPoints[rightPoints.length - 1].y };

    const innerBoxLeftX = topLeft.x ;
    const innerBoxRightX = topLeft.x + width;
    // console.log("Border points:", points);
    const adjacentDifference = blockHeight / (pointsPerSide - 1);
    const leftBorder = pointsToCompleteSvgPath(leftPoints);
    const rightBorder = pointsToCompleteSvgPath(rightPoints);
    const rightmostLeft = leftPoints[0];
    const leftmostRight = rightPoints[rightPoints.length - 1];
    const wideLeft = leftPoints.map((point, index) => {
        const distFromInner = point.x - rightmostLeft.x;
        return { ...point, x: point.x + distFromInner * 0.5};
    });
    const wideRight = rightPoints.map((point, index) => {
        const distFromInner = point.x - innerBoxLeftX;
        return { ...point, y: point.y - 20, x: point.x + 20}//  distFromInner - blockHeight};
    });

    const points = [...leftPoints, ...rightPoints];
    const widePoints = [...wideLeft, ...wideRight];
    if (wideLeft.length !== wideRight.length) {
        throw new Error("Wide left and right points do not match in length.");
    }
    const wideLeftBorder = pointsToCompleteSvgPath(wideLeft);

    const easyLeftPoints = leftPoints.map(pt => ({
        x: Math.round(pt.x),
        y: Math.round(pt.y)
    }));
    const easyWideLeftPoints = wideLeft.map(pt => ({
        x: Math.round(pt.x),
        y: Math.round(pt.y)
    }));
    // set first and last of wides to normal firt and last
    wideLeft[0] = leftPoints[0];
    wideLeft[wideLeft.length - 1] = leftPoints[leftPoints.length - 1];

    const easyWideLeftBorder = pointsToSvgPolyline(easyWideLeftPoints);
    const wideRightBorder = pointsToSvgPolyline(wideRight);
    const totalWidth = blockHeight * 2 + width;
    const gapSize = adjacentDifference * GAP_PROP;
    const strokeLength = adjacentDifference - gapSize;

    const polylineRef1 = useRef<SVGPolylineElement>(null);
    const polylineRef2 = useRef<SVGPolylineElement>(null);

    const refSvg = useRef<SVGSVGElement>(null);
    const refOuter = useRef<HTMLDivElement>(null);
    const refInnerBox = useRef<HTMLDivElement>(null);

    let oldWidthRef = useRef(-1);
    let oldWidth = oldWidthRef.current;

    const stretchGap = 2;
/*
    useEffect(() => {
        const interval = setInterval(() => {
            const stretchedLeftPoints = leftPoints.map((point, index) => {
                const distFromInner = point.x - innerBoxLeftX;
                if (index === 0) {
                    return { ...point, x: point.x - distFromInner * 0.2};
                }
                return point;
            });

            const stretchedRightPoints = rightPoints.map((point, index) => {
                const distFromInner = point.x - innerBoxRightX;
                if (index === 0) {
                    return { ...point, x: point.x + distFromInner * 0.2};
                }
                return point;
            });

            const newLeftBorder = pointsToSvgPolyline(stretchedLeftPoints);
            const newRightBorder = pointsToSvgPolyline(stretchedRightPoints);

            if (polylineRef1.current) {
                polylineRef1.current.setAttribute("points", newLeftBorder);
            }
            if (polylineRef2.current) {
                polylineRef2.current.setAttribute("points", newRightBorder);
            }

            setTimeout(() => {
                if (polylineRef1.current) {
                    console.log("Resetting polyline points:", leftBorder);
                    polylineRef1.current.setAttribute("points", leftBorder);
                    polylineRef1.current.setAttribute("stroke", "black");

                }
                if (polylineRef2.current) {
                    polylineRef2.current.setAttribute("points", rightBorder);
                    polylineRef2.current.setAttribute("stroke", "black");

                }
            }, 1000); // Reset after 500ms
        }, 2000); // Alternate every 1 second

        return () => clearInterval(interval);
    }, [leftPoints, rightPoints, adjacentDifference, leftBorder, rightBorder]);




    useEffect(() => {
        console.log("UseEffect:", `{width: ${width}, oldWidth: ${oldWidth}}`);
        
        if (oldWidth === -1) {
            oldWidthRef.current = width;
            return;
        }
        const widthDiff = oldWidth - width;
        oldWidth = width;
        let animationFrame: number;
        
        const duration = 500; // animation duration in ms
        const startTime = performance.now();

        const animate = (time: number) => {

            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            console.log("Progress:", progress);
            const delta = widthDiff * (1 - progress);
            const points = [...leftPoints, ...rightPoints.map((point, i) => ({ x: point.x + delta, y: point.y }))];
            if (polylineRef.current) {
                console.log("Setting polyline points:", points);
                polylineRef.current.setAttribute("points", pointsToSvgPolyline(points));
            } else {
                console.error("Polyline ref is null");
            }

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };
        
        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [width]);
    */
    const { x: tx, y: ty} = leftPoints[0];
    const finalMargin = (720 - blockHeight * 2 - width) / 2;
    const totalHeight = stackHeight * (blockHeight + PADDING * 2) - PADDING * 2;
    const svgMouseOverHandler = (e: React.MouseEvent) => {
        const target = e.target as SVGElement;
        if (target.tagName.toLowerCase() === "svg") {
            const leftPaths = target.querySelectorAll("path.left");
            leftPaths.forEach((path) => {
                // Perform an action on each path – for example, update an attribute.
                path.setAttribute("d", wideLeftBorder);
            });
            const rightPaths = target.querySelectorAll("path.right");
            rightPaths.forEach((path) => {
                // Perform an action on each path – for example, update an attribute.
                path.setAttribute("d", wideRightBorder);
            });
        }
    }
    const svgMouseOutHandler = (e: React.MouseEvent) => {
        const target = e.target as SVGElement;
        if (target.tagName.toLowerCase() === "svg") {
            const paths = target.querySelectorAll("path.left");
            paths.forEach((path) => {
                // Perform an action on each path – for example, update an attribute.
                path.setAttribute("d", leftBorder);
            });
        }
    }
    return (
    <div ref={refOuter} className={`${mainStyle.outer} ${styleModule.outer}`} style={{
        width: "100%",
        height: totalHeight,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    }}>
        <svg 
            onMouseOver={doHoverScale ? svgMouseOverHandler : undefined}
            onMouseLeave={doHoverScale ? svgMouseOutHandler : undefined}
            onMouseOut={svgMouseOutHandler}
            ref={refSvg} className={`${mainStyle.svg} ${styleModule.svg}`} width={`${CANV_WIDTH}px`} height={totalHeight} viewBox={`-${PADDING} -${PADDING} ${720 + PADDING * 2} ${totalHeight + PADDING * 2}`}>
        {/* BEGIN LEFT SIDE */}
            {/* <path

                // onMouseDown={svgMouseOverHandler}
                className={[hilbertStyles.polyline2, styleModule.polyline2].join(" ")}  
                fill="none" 
                strokeWidth={2}
                // points={easyLeftBorder} 
                d={leftBorder}
                style={{
                    // transform: `scaleX(1)`,
                    transform: `translateX(${finalMargin}px)`,
                    // transition: "0.5s",
                    transitionProperty: "transform 0.5s, points 0.5s",
                }}
            />
            <path
                className={[hilbertStyles.polyline2, styleModule.polyline2, "left"].join(" ")} 
                ref={polylineRef1}
                fill="none" 
                stroke="black"
                strokeWidth="4"
                d={leftBorder} 
                style={{
                    // transform: `scaleX(1)`,
                    transform: `translateX(${finalMargin}px)`,
                    // transition: "0.5s",
                    transitionProperty: "transform 0.5s, points 0.5s",
                }}
                strokeDashoffset={-gapSize / 2 + adjacentDifference / 2}
                strokeDasharray={`${strokeLength}px,${gapSize}px`}
                style={{
                    transform: `translateX(${finalMargin}px)`,
                    transition: "transform 0.5s",
                    strokeDashoffset: gapSize,
                    strokeDasharray: `${strokeLength}px,${gapSize}px`,
                    strokeWidth: 2,
                }}
                
            /> */}
            {/* <path
                className={[hilbertStyles.polyline2, styleModule.polyline2].join(" ")} 
                strokeWidth="1" 
                stroke="black"
                d={`M ${tx + width},${ty} L ${tx},${ty}`}
                style={{
                    transform: `translateX(${finalMargin}px)`,
                    transition: "0.5s",
                    strokeDashoffset: gapSize,
                    strokeDasharray: `${strokeLength}px,${gapSize}px`,
                    strokeWidth: 2,
                }}
            /> */}

        {/* END LEFT SIDE */}
        {/* BEGIN TOP */}
            <path
                className={[hilbertStyles.polyline2, styleModule.polyline2].join(" ")} 
                strokeWidth="1" 
                stroke="black"
                d={startingPath}
                style={{
                    transform: `translateX(${finalMargin}px)`,
                    transition: "0.5s",

                    strokeWidth: 2,
                }}
            />
            <path
                className={[hilbertStyles.polyline1, styleModule.polyline1].join(" ")} 
                strokeWidth="4" 
                stroke="black"
                strokeDashoffset={gapSize}
                strokeDasharray={`${strokeLength}px,${gapSize}px`}
                style={{
                    transform: `translateX(${finalMargin}px)`,
                    transition: "0.5s",
                }}
                d={startingPath}
            />
            
        {/* END TOP */}
        {/* BEGIN RIGHT */}
            {/* <polyline 
                className={[hilbertStyles.polyline2, styleModule.polyline2].join(" ")} 
                fill="none" 
                strokeWidth="1" 
                points={rightBorder} 
                style={{
                    transform: `translateX(${finalMargin + width}px)`,
                    transition: "0.5s",
                }}
            />
            <polyline 
                className={[hilbertStyles.polyline1, styleModule.polyline1].join(" ")} 
                ref={polylineRef2}
                fill="none" 
                strokeWidth="4" 
                points={rightBorder} 
                strokeDashoffset={-gapSize / 2 + adjacentDifference / 2}
                strokeDasharray={`${strokeLength}px,${gapSize}px`}
                style={{
                    transform: `translateX(${finalMargin + width}px)`,
                    transition: "0.5s",
                }}
            /> */}

        {/* END RIGHT */}
        {/* BEGIN BOTTOM */}
            <path
                className={[hilbertStyles.polyline2, styleModule.polyline2].join(" ")} 
                strokeWidth="1" 
                stroke="black"
                d={`M ${bottomLeft.x},${bottomLeft.y} L ${bottomRight.x},${bottomRight.y}`}
                style={{
                    transform: `translateX(${finalMargin}px)`,
                    transition: "0.5s",
                }}
            />
            <path
                d={`M ${bottomLeft.x},${bottomLeft.y} L ${bottomRight.x},${bottomRight.y}`}
                className={[hilbertStyles.polyline1, styleModule.polyline1].join(" ")} 
                strokeWidth="4" 
                stroke="black"
                strokeDashoffset={gapSize}
                strokeDasharray={`${strokeLength}px,${gapSize}px`}
                style={{
                    transform: `translateX(${finalMargin}px)`,
                    transition: "0.5s",
                }}
            />

        {/* END BOTTOM */}
        </svg>
        <div 
            ref={refInnerBox}
            className={`${mainStyle.inner} ${styleModule.inner}`}
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