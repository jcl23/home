import React from 'react';

import selectorStyle from "./ThemeSelector.module.css";
import styles from '../styles/styles';

import icon1 from "../assets/icons/1.png"
import icon3 from "../assets/icons/32.png"
import icon4 from "../assets/icons/42.png"
import empty from "../assets/icons/empty.png"
type ThemeSelectorProps = {
  currentIndex: number;
  setIndex: (index: number) => void;
};
const icons = [icon1,  icon4, icon3,empty, empty]
export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentIndex, setIndex }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row',
      gap: '10px',
      justifyContent: 'center',

    }}>
      {styles.map((style, index) => {
        let buttonClass = style.button;
        if (index === 3) {
          buttonClass = selectorStyle.theme4buttonSubstitute;
        }
        return (
          <button
            key={index}
            // className={`  ${selectorStyle.button} ${buttonClass}`}
            className={` ${buttonClass}  ${selectorStyle.button}`}
            style={{
              backgroundImage: `url(${icons[index]})`,
              backgroundSize: 'cover',

            }}
            onClick={() => setIndex(index)}
            aria-label={`Theme ${index + 1}`}
            aria-pressed={currentIndex === index}
          />
        )
  })}
    </div>
  );
};
