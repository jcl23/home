import React from "react";
import { getTextDims } from "../../shared/utils/getTextWidth";


// Spreading algorithm shit
function permuteIndex(i: number, n: number): number {
    const a = 1009; // Large prime, should be coprime with n
    const b = 2027; // Large prime for shifting
    // log for everything
    return (a * i + b) % n;
}

const smallPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
const nextPrime = (num: number): number => {
    const bigPrime = 1013; // Fixed big prime
    if (num > 97) return bigPrime;

    let left = 0, right = smallPrimes.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (smallPrimes[mid] >= num) {
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    return smallPrimes[left];
};


type TextAnim = (cancelRefrefs: React.RefObject<HTMLDivElement | null>[], from: string, to: string, duration: number) => Promise<void>[];
const permuteTimeScale = (i: number, n: number, duration: number): number => {
    if (n === 0) return 0;
    return permuteIndex(i, n) * duration / n;
}

export const doPhaseIn: TextAnim = (refs: React.RefObject<HTMLDivElement | null>[],  from: string, to: string, duration: number) => {
    const prime = nextPrime(refs.length);
    
    return refs.map((ref, i) => {
        return new Promise<void>((resolve) => {
            if (!ref.current) {
                console.warn("Ref is null, resolving immediately.");
                resolve();
                return;
            };
            ref.current.className = from;
            setTimeout(() => {
                if (!ref.current) return;
                ref.current.className = to;

                resolve();
            }, permuteTimeScale(i, prime, duration));
        });
    });
}
const underscoreBlink = (ref: React.RefObject<HTMLDivElement | null>, duration = 200) => {
    if (ref.current) {
        ref.current.actualText = ref.current.innerText;
        ref.current.innerText = "_";
        setTimeout(() => {
            ref.current!.innerText = ref.current!.actualText;
            ref.current!.actualText = undefined;
        }, duration);
    }
}
export const doSnakeIn: TextAnim = (refs: React.RefObject<HTMLDivElement | null>[], from: string, to: string, duration: number) => {
    return [new Promise<void>((resolve) => {
        let currentIndex = 0;
        const interval = duration / refs.length;

        const intervalId = setInterval(() => {
            if (currentIndex >= refs.length) {
                clearInterval(intervalId);
                resolve();
                return;
            }
            const ref = refs[currentIndex];
            if (ref.current) {
                ref.current.className = to;
                underscoreBlink(ref, interval);
            }
            currentIndex++;
        }, interval);
    })];
}
const doBlinkInGroup: TextAnim = (refs: React.RefObject<HTMLDivElement | null>[], from: string, to: string, duration: number, toggleCount = 10) => {
    const warpPattern = Math.sqrt;
    const blinkTimes = Array.from({ length: toggleCount }, (_, i) => i).map(i => warpPattern(i / toggleCount) * duration);
    // round all 
    blinkTimes.forEach((v, i) => {
        blinkTimes[i] = Math.round(v);
    });
    return [new Promise<void>((resolve) => {
        // Random variation to make animation more natural
        const waitPropMax = 0.4;
        const waitProp = Math.random() * waitPropMax;
        const waitDuration = duration * waitProp;
        const activeDuration = duration * (1 - waitProp);

        // const randomOffset = Math.floor(Math.random() * waitDuration);
        // const togglePointsWithinActiveDuration = [];
        const togglePoints = Array(toggleCount).fill(0).map((_, i) => {
            const pointInUnitInterval = i / toggleCount;
            const warpedPoint = warpPattern(pointInUnitInterval);
            return warpedPoint * activeDuration + waitDuration;
        });
        // add zero to start
        
        const delays = togglePoints.map((point, i) => {
            if (i === 0) return point;
            return point - togglePoints[i - 1];
        });

        if (!refs.some(ref => ref.current)) {
            console.warn("All refs are null, resolving immediately.");
            resolve();
            return;
        }
        
        // Set initial state
        refs.forEach(ref => {
            if (ref.current) ref.current.className = from;
        });
        
        // Create array of toggle promises
        const toggleInterval = duration / toggleCount;
        const togglePromises: Promise<void>[] = [];
        
        // For each toggle, create a promise that will toggle at the right time
        togglePoints.forEach((delay, i) => {
            togglePromises.push(
                new Promise<void>(toggleResolve => {
                    setTimeout(() => {
                        refs.forEach(ref => {
                            if (!ref.current) return;
                            
                            // Toggle between classes
                            const isEven = i % 2 === 0;
                            ref.current.className = isEven ? to : from;
                        });
                        toggleResolve();
                    }, delay);
                })
            );
        });
        
        // When all toggles are done, resolve the main promise
        Promise.all(togglePromises).then(() => {
            refs.forEach(ref => {
                if (ref.current) {
                    ref.current.className = to;
                }
            });
            resolve();
        });
    })];
};


export const doBlockPhaseIn: TextAnim = (refs: React.RefObject<HTMLDivElement | null>[], from: string, to: string, duration: number, width = 200) => {
    const text = refs.reduce((acc, ref) => {
        if (ref.current) {
            return acc + ref.current.innerText;
        }
        return acc;
    }
    , "");
    const localize = (t1: number, t2: number): (t: number) => number  => {
        return (t: number) => {
            return t1 + (t2 - t1) * t;
        }
    }

    let [toW, toH] = getTextDims("Justin Lee",  to);
    toW = width;
    const ref1 = refs[0];
    const newDiv = document.createElement("div");
    const shell = document.createElement("div");
    // animation: cubic-bezier(0.0, 0.0, 1.0, 1.0); 4s ease-in-out infinite;
    const N_STEPS = refs.length;
    const slideInTime = 1 / 4;

    // const numSlideInSteps  = Math.floor(N_STEPS * slideInTime / duration);
    // const numActiveSteps = N_STEPS - numSlideInSteps;
    const slideInDurationToInterval = (t: number) => {
        const y = t / slideInTime;
        return y;
    }
    const activeDurationToInterval = (t: number) => {
        const y = (t - slideInTime) / (1 - slideInTime);
        return y;
    }
    // const slideInKF = Array(numSlideInSteps + 1).fill(0).map((_, i) => i / numSlideInSteps).map(intervalToActiveDuration); // percents in a funny way
    // const activeKF = Array(numActiveSteps + 1).fill(0).map((_, i) => i / numActiveSteps).map(intervalToActiveDuration); // percents in a funny way
    
    const c = 5;
    const first_f = (t: number) => (1 - Math.exp(-c*t))*(1-t) + t; 
    const second_f = (t: number) => 1 - first_f(1 - t);
    const finalF = (t: number) => (first_f(t) + second_f(t)) / 2
    
    const finalFInverse = (t: number) => {
        const c = 5;
        const a = 1 - t;
        const b = t;
        return (1 - Math.exp(-c*a))*(1-b) + b; 
    }
    const slideInMargin = (t: number) => {
        const setbackAmount = 10;
        return -setbackAmount * (1 - t) * (1 - t) * (1 - t);
    }
    const activeMargin = (t: number, W: number): number  => {
        return second_f(t) * W
    }
    
    const activeWidth = (t: number, W: number): number => {
        const fst = first_f(t);
        const snd = second_f(t);
        return (fst - snd) * W;
    }
    type KFS = { t: number, w: number, m: number }[];
    const kfs = Array(N_STEPS + 1).fill(0)
        .map((_, i) => i / N_STEPS) // scale to the interval
        .map((t) => {
            if (t < slideInTime) {
                const y = slideInDurationToInterval(t);
                return { t, w: 12, m: slideInMargin(y) };
            } else {
                const y = activeDurationToInterval(t);
                return { t, w: activeWidth(y, toW), m: activeMargin(y, toW) };
            }
        });
    
    
    const keyframeStrings = kfs.map(({t: time, w: width, m: margin}, i) => {

        return `${(time * 100).toFixed(2)}% {
            width: ${width.toFixed(2)}px;
            margin-left: ${margin.toFixed(2)}px;
            padding: 0 ${time == 1 ? 0 : 0}px;
        }`;
    });
    if (ref1.current) {
        const W = toW;
        const blockStyle = `
        .slideAndParabola {
        }
        @keyframes parabola {
        ${keyframeStrings.join("\n")}  
        }
        `;

        const style = document.createElement("style");
        style.innerHTML = blockStyle;
        document.head.appendChild(style);
        newDiv.className = "parabola";
        newDiv.style.animation = `parabola ${duration}ms linear`;
        newDiv.style.position = "absolute";
        newDiv.style.zIndex = "1000";
        newDiv.style.height = `${toH}px`;
        newDiv.style.top = "0px"
        newDiv.style.background = 'black';
        // ref1.current.parentNode!.style.transform = "scaleX(2)"
        ref1.current.parentNode!.parentNode!.appendChild(shell);
        shell.style.transform = "scaleX(1)";
        shell.style.width = "100%";
        shell.style.height = "100%";
        shell.style.position = "absolute";
        shell.style.top = "5px";
        shell.style.left = "0";
        shell.appendChild(newDiv);
        setTimeout(() => {
            // if (ref1.current) {
            // ref1.current.removeChild(newDiv);
            // }
            newDiv.remove();
        }, duration);
    }
    const shift = 0.2;
    return refs.map((ref, i) => {
        return new Promise<void>((resolve) => {
            if (ref.current) {
                ref.current.className = from;
                setTimeout(() => {
                    if (ref.current) ref.current.className = to;
                    resolve();
                    // Should switch to the other theme once it is 
                    // covered by the block. THis means, 

                }, duration * (i / refs.length * (1 - shift) + shift));
            } else {
                resolve();
            }
        });
    });
}


export const doBlinkIn = (refs: React.RefObject<HTMLDivElement | null>[], from: string, to: string, duration: number) => {

    // since the refs are for spans, get the indices of all refs that just ahve whitespace like space or nbsp

    const indices = refs.map((r, i) => [r, i]).filter(([r]) => {
        if (r === null) return false;
        if (typeof r === "number") return false;
        if (r.current) {
            return /^\s*$/.test(r.current.innerText);
        }
        return false;
    }).map(([r, i]) => i);

    // split the refs into groups by the indices of the whitespace refs
    const groups = [] as React.RefObject<HTMLDivElement | null>[][];
    let group = [] as React.RefObject<HTMLDivElement | null>[];
    for (let i = 0; i < refs.length; i++) {
        if (indices.includes(i)) {
            groups.push(group);
            group = [];
        } else {
            group.push(refs[i]);
        }
    }
    if (group.length > 0) {
        groups.push(group);
    }
    return groups.filter(g => g.length).flatMap((group, i) => {
        return Promise.all(doBlinkInGroup(group, from, to, duration)).then(() => {
            // console.log("Group done", i);
        });
    });
};