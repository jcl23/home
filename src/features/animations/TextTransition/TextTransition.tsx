import { useRef, createRef, useEffect } from "react";
import { NAME_ANIMS } from "../animCfg";
import styles from "../../themes/styles";
import textStyles from "./TextTransition.module.css";
type TextTransitionProps = {
    text: string;
    themeIndex: number;
    duration: number;
};

export const TextTransition = function( {text, themeIndex,  duration }: TextTransitionProps)  {
    const to = styles[themeIndex].name;
    const prevStyle = useRef(to);
    const resetTransition = useRef<Function>(() => {});
    console.log(prevStyle.current, to);

    console.log(to);

    const words = text.split(/\s+/g);
    const chars = words.map(word => word.split(""))
    const refs = Array(text.length).fill(0).map(createRef<HTMLDivElement>);
    
    useEffect(() => {
        resetTransition.current();
        const promiseData = NAME_ANIMS[themeIndex](refs, prevStyle.current, to, duration);
        const promises = Array.isArray(promiseData) ? promiseData : [promiseData];
        const reset = () => {
            prevStyle.current = to;
            refs.forEach(ref => {
                if (ref.current && ref.current.actualText) {
                    ref.current.innerText = ref.current.actualText;
                }
            });
            resetTransition.current = () => {};

        }
        resetTransition.current = reset;
        // Reset the transition after the animation is done
        Promise.all(promises).then(() => {
            reset();
            resetTransition.current = () => {};
        });

    }, [to]);
    const widthsByThemeIndex = [
        [8.5, 5, 14.5],
        [9, 5, 14.8],
        [9, 5.3, 14.2],
        [9, 4.7, 12],
        [9, 4.7, 12],
    ]
    let charNo = 0;
    return (
        <div 
            className={textStyles.container} 
            style={{ clipPath: 'polygon(0% 40%, 20% 40%, 40% 0%, 6 0% 40%, 80% 40%, 100% 40%, 100% 100%, 0% 100%)' }}
        >
            {chars.map((word, i) => (
                <span
                className={`${textStyles.word}`}
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
                    return <span key={"TextTransitionChar" + i + " " + j} ref={refs[charNo++]}>{char}</span>;
                })}
                </span>
            ))}
        </div>
    );
}