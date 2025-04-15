import { useRef, createRef, useEffect } from "react";
import { NAME_ANIMS } from "../../styles/animCfg";
import styles from "../../styles/styles";
import textStyles from "./TextTransition.module.css";
import aurora from "../aurora.module.css";
type TextTransitionProps = {
    text: string;
    themeIndex: number;
    duration: number;
};

export const TextTransition = function( {text, themeIndex,  duration }: TextTransitionProps)  {
    const to = styles[themeIndex].name;
    const prevStyle = useRef(to);
    console.log(prevStyle.current, to);

    console.log(to);

    const words = text.split(/\s+/g);
    const chars = words.map(word => word.split(""))
    const refs = Array(text.length).fill(0).map(createRef<HTMLDivElement>);
    
    useEffect(() => {
        const promiseData = NAME_ANIMS[themeIndex](refs, prevStyle.current, to, duration);
        const promises = Array.isArray(promiseData) ? promiseData : [promiseData];
        Promise.all(promises).then(() => {
            // Behavior to execute once all promises are settled
            prevStyle.current = to;
        });

    }, [to]);
    let charNo = 0;
    const widthsByThemeIndex = [
        [8.5, 5, 14.5],
        [9, 5, 14.8],
        [9, 5.3, 14.2],
        [9, 4.7, 12],
    ]
    return (
        <div className={textStyles.container}>
            {chars.map((word, i) => (
                <span 
                key={"TextTransitionBlock" + i}
                style={{
                    whiteSpace: "nowrap",
                    width: `${widthsByThemeIndex[themeIndex][i]}ch`,
                    display: "inline-block",
                    textAlign: "center",
                    transitionProperty: "width",
                    transitionDuration: `${duration * 0.25}ms`,
                    transitionDelay: `${duration * 0.75}ms`,
                    transitionTimingFunction: "linear",
                }}
            >   
                {word.map((char, j) => {
                    return <span key={"TextTransitionChar" + i + " " + j} className={textStyles.characterSpan} ref={refs[charNo++]}>{char}</span>;
                })}

            </span>
        ))}
        </div>
    );
}