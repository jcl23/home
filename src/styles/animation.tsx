
import { NAME_ANIMS } from "./animCfg";

import { createRef, use, useEffect, useRef } from "react";
import styles from "./styles";

export const anim = (el: HTMLElement, from: string, to: string) => {
    const contents = el.innerText;

    const newContents = [...contents].map(c =>{
        const ref = createRef<HTMLDivElement>();
        return (<div className={from}>{c}</div>)
    }

    ) 
    newContents.forEach((div, i) => { 
        // get HTML element from JSX element

        setTimeout(() => {
            el.classList.add(to);
        }
        , i * 500);

    });

    setTimeout(() => {
        el.innerHTML = contents;
    }, contents.length * 500);
}
