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


export const Border = ({ blockHeight, width, themeIndex, children, iter = 3, passThrough = false, stackHeight = 1}: HilbertBorderProps) => {
    
    const styleModule = styles[themeIndex ?? 0];
    const lastPropValRef = useRef<Record<string, any>>({});

  const doHoverScale = themeIndex === 2;
  console.log("DoHoverScale:", doHoverScale);


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

    
    const mode = ["hilbert", "snake", "dots", "dots", "dots"][themeIndex] ?? "hilbert";
    // themeIndex == 1 ? "snake" : "hilbert";
    const center = blockHeight + width / 2;
    const left = blockHeight;
    const right = blockHeight + width;
    const hilbertPoints = generateHilbertBorder(blockHeight, 0, iter, stackHeight);
    const snakePoints = generateSnakeBorder(blockHeight, 0, iter, stackHeight);

    const startingPoints = mode === "hilbert" ? hilbertPoints : snakePoints;
 
    startingPoints.slice(0, Math.floor(startingPoints.length / 2)).forEach(point => {
        point.x += width;
    });
    startingPoints.push(startingPoints[0])
    const startingPath = pointsToCompleteSvgPath(startingPoints);
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






    // set first and last of wides to normal firt and last


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
        console.log("MOUEOVER")
        if (target.tagName.toLowerCase() === "svg") {
            const paths = target.querySelectorAll("path");
            paths.forEach((path) => {
                // Perform an action on each path – for example, update an attribute.
                path.setAttribute("d", pointsToCompleteSvgPath(widePoints));
                path.setAttribute("strokeDashArray", `${strokeLength}px,${gapSize*10}px`);
                // strokeDasharray={`${strokeLength}px,${gapSize}px`}

            });

        }
    }
    const svgMouseOutHandler = (e: React.MouseEvent) => {
        const target = e.target as SVGElement;
        if (target.tagName.toLowerCase() === "svg") {
            const paths = target.querySelectorAll("path");
            paths.forEach((path) => {
                // Perform an action on each path – for example, update an attribute.
                path.setAttribute("d", startingPath);
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
            // onMouseEnter={doHoverScale ? svgMouseOverHandler : undefined}
            // onMouseLeave={doHoverScale ? svgMouseOutHandler : undefined}
            onMouseOut={svgMouseOutHandler}
            ref={refSvg} className={`${mainStyle.svg} ${styleModule.svg}`} width={`${CANV_WIDTH}px`} height={totalHeight} viewBox={`-${PADDING} -${PADDING} ${720 + PADDING * 2} ${totalHeight + PADDING * 2}`}>

            <path
                className={[hilbertStyles.polyline2, styleModule.polyline2].join(" ")} 
                strokeWidth="1" 
                d={startingPath}

                style={{
                    transform: `translateX(${finalMargin}px)`,
                    transition: "0.5s",
                    transitionProperty: "stroke-dashoffset, color, stroke, strokeWidth",
                    strokeWidth: 2,
                }}
            />
            <path
                className={[hilbertStyles.polyline1, styleModule.polyline1].join(" ")} 
                strokeWidth="4" 
                strokeDashoffset={gapSize}
                strokeDasharray={`${strokeLength}px,${gapSize}px`}
                style={{
                    transform: `translateX(${finalMargin}px)`,
                    transition: "0.5s",
                    transitionProperty: "stroke-dashoffset, color, stroke, strokeWidth",

                }}
                d={startingPath}
            />

            // <path
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