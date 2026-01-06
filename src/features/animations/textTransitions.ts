import React from "react";
import { getTextDims } from "../../shared/utils/getTextWidth";

// ==========================================
// 1. THE INFRASTRUCTURE
// ==========================================

/**
 * A helper class to track resources (timers, elements) for a single animation run.
 * Calling cancel() cleans up everything associated with this scope.
 */
class AnimationScope {
    private timeouts: Set<number> = new Set();
    private intervals: Set<number> = new Set();
    private cleanups: Set<() => void> = new Set();
    public isCancelled = false;

    setTimeout(fn: () => void, ms: number) {
        if (this.isCancelled) return;
        const id = window.setTimeout(() => {
            this.timeouts.delete(id);
            if (!this.isCancelled) fn();
        }, ms);
        this.timeouts.add(id);
    }

    setInterval(fn: () => void, ms: number) {
        if (this.isCancelled) return;
        const id = window.setInterval(() => {
            if (this.isCancelled) {
                window.clearInterval(id);
                return;
            }
            fn();
        }, ms);
        this.intervals.add(id);
    }

    /** Register a custom cleanup function (e.g., removing a DOM node) */
    addCleanup(fn: () => void) {
        this.cleanups.add(fn);
    }

    cancel() {
        this.isCancelled = true;
        this.timeouts.forEach(id => window.clearTimeout(id));
        this.intervals.forEach(id => window.clearInterval(id));
        this.cleanups.forEach(fn => fn());
        this.timeouts.clear();
        this.intervals.clear();
        this.cleanups.clear();
    }
}

/**
 * New Signature:
 * Returns a function that, when called, immediately stops the animation.
 */
export type TextAnim = (
    refs: React.RefObject<HTMLDivElement | null>[],
    from: string,
    to: string,
    duration: number,
    onComplete?: () => void
) => () => void; // Returns the "Stop" function


// ==========================================
// 2. UTILS & MATH
// ==========================================

function permuteIndex(i: number, n: number): number {
    const a = 1009; 
    const b = 2027; 
    return (a * i + b) % n;
}

const smallPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
const nextPrime = (num: number): number => {
    const bigPrime = 1013; 
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

const permuteTimeScale = (i: number, n: number, duration: number): number => {
    if (n === 0) return 0;
    const val = permuteIndex(i, n) * duration / n;
    return val;
}

const underscoreBlink = (scope: AnimationScope, ref: React.RefObject<HTMLDivElement | null>, duration = 200) => {
    if (ref.current) {
        const element = ref.current;
        const originalText = element.innerText;
        // Store original text on the element if needed, or just closure it
        element.innerText = "_";
        
        scope.setTimeout(() => {
            if (element) element.innerText = originalText;
        }, duration);
    }
}

// ==========================================
// 3. REFACTORED ANIMATIONS
// ==========================================

export const doPhaseIn: TextAnim = function(refs, from, to, duration, onComplete) {

    const prime = nextPrime(refs.length);
    let completedCount = 0;
    const total = refs.length;
    refs.forEach(function(ref, i) {
        if (!ref.current) {
            completedCount++;
            return;
        }

        // Set initial state
        ref.current.className = from;


        setTimeout(function() {
            if (ref.current !== null) {
                console.log("Animating to:", to);
                ref.current.className = to;
            } else {
                console.log("Ref.current is null during animation");
            }
            
            completedCount++;
            if (completedCount === total && onComplete) {
                onComplete();
            }
        }, i / refs.length * duration);
    });
    return () => {};
};

export const doSnakeIn: TextAnim = (refs, from, to, duration, onComplete) => {
    const scope = new AnimationScope();
    let currentIndex = 0;
    const interval = duration / refs.length;

    scope.setInterval(() => {
        if (currentIndex >= refs.length) {
            scope.cancel(); // Stop the interval
            if (onComplete) onComplete();
            return;
        }
        
        const ref = refs[currentIndex];
        if (ref.current) {
            ref.current.className = to;
            underscoreBlink(scope, ref, interval);
        }
        currentIndex++;
    }, interval);

    return () => scope.cancel();
};

// Helper for the group logic, not exported as a full TextAnim but follows pattern
const doBlinkInGroup = (
    scope: AnimationScope,
    refs: React.RefObject<HTMLDivElement | null>[], 
    from: string, 
    to: string, 
    duration: number,
    onGroupComplete: () => void,
    toggleCount = 10
) => {
    const warpPattern = Math.sqrt;
    
    // Random variation
    const waitPropMax = 0.4;
    const waitProp = Math.random() * waitPropMax;
    const waitDuration = duration * waitProp;
    const activeDuration = duration * (1 - waitProp);

    const togglePoints = Array(toggleCount).fill(0).map((_, i) => {
        const pointInUnitInterval = i / toggleCount;
        const warpedPoint = warpPattern(pointInUnitInterval);
        return warpedPoint * activeDuration + waitDuration;
    });

    if (!refs.some(ref => ref.current)) {
        onGroupComplete();
        return;
    }
    
    // Set initial state
    refs.forEach(ref => {
        if (ref.current) ref.current.className = from;
    });
    
    let togglesFinished = 0;

    togglePoints.forEach((delay, i) => {
        scope.setTimeout(() => {
            refs.forEach(ref => {
                if (!ref.current) return;
                const isEven = i % 2 === 0;
                ref.current.className = isEven ? to : from;
            });

            togglesFinished++;
            if (togglesFinished === togglePoints.length) {
                // Final state enforcement
                refs.forEach(ref => {
                    if (ref.current) ref.current.className = to;
                });
                onGroupComplete();
            }
        }, delay);
    });
};

export const doBlinkIn: TextAnim = (refs, from, to, duration, onComplete) => {
    const scope = new AnimationScope();

    const indices = refs.map((r, i) => [r, i] as const).filter(([r]) => {
        if (!r?.current) return false;
        return /^\s*$/.test(r.current.innerText);
    }).map(([_, i]) => i);

    const groups: React.RefObject<HTMLDivElement | null>[][] = [];
    let group: React.RefObject<HTMLDivElement | null>[] = [];
    
    for (let i = 0; i < refs.length; i++) {
        if (indices.includes(i)) {
            groups.push(group);
            group = [];
        } else {
            group.push(refs[i]);
        }
    }
    if (group.length > 0) groups.push(group);

    const activeGroups = groups.filter(g => g.length);
    let groupsCompleted = 0;

    activeGroups.forEach(g => {
        doBlinkInGroup(scope, g, from, to, duration, () => {
            groupsCompleted++;
            if (groupsCompleted === activeGroups.length && onComplete) {
                onComplete();
            }
        });
    });

    return () => scope.cancel();
};

export const doBlockPhaseIn: TextAnim = (refs, from, to, duration, onComplete) => {
    const scope = new AnimationScope();
    const width = 200; // Default from original arg

    let [toW, toH] = getTextDims("Justin Lee",  to);
    toW = width;
    const ref1 = refs[0];
    
    // DOM Creation
    const newDiv = document.createElement("div");
    const shell = document.createElement("div");
    
    // Register cleanup for DOM elements immediately
    scope.addCleanup(() => {
        newDiv.remove();
        shell.remove();
    });

    const N_STEPS = refs.length;
    const slideInTime = 1 / 4;

    const slideInDurationToInterval = (t: number) => t / slideInTime;
    const activeDurationToInterval = (t: number) => (t - slideInTime) / (1 - slideInTime);
    
    const c = 5;
    const first_f = (t: number) => (1 - Math.exp(-c*t))*(1-t) + t; 
    const second_f = (t: number) => 1 - first_f(1 - t);
    
    const slideInMargin = (t: number) => {
        const setbackAmount = 10;
        return -setbackAmount * (1 - t) * (1 - t) * (1 - t);
    }
    const activeMargin = (t: number, W: number): number => second_f(t) * W;
    const activeWidth = (t: number, W: number): number => {
        const fst = first_f(t);
        const snd = second_f(t);
        return (fst - snd) * W;
    }

    const kfs = Array(N_STEPS + 1).fill(0)
        .map((_, i) => i / N_STEPS)
        .map((t) => {
            if (t < slideInTime) {
                const y = slideInDurationToInterval(t);
                return { t, w: 12, m: slideInMargin(y) };
            } else {
                const y = activeDurationToInterval(t);
                return { t, w: activeWidth(y, toW), m: activeMargin(y, toW) };
            }
        });
    
    const keyframeStrings = kfs.map(({t: time, w: width, m: margin}) => {
        return `${(time * 100).toFixed(2)}% {
            width: ${width.toFixed(2)}px;
            margin-left: ${margin.toFixed(2)}px;
            padding: 0 ${time == 1 ? 0 : 0}px;
        }`;
    });

    if (ref1.current) {
        const blockStyle = `
        @keyframes parabola {
        ${keyframeStrings.join("\n")}  
        }
        `;

        const style = document.createElement("style");
        style.innerHTML = blockStyle;
        document.head.appendChild(style);
        scope.addCleanup(() => style.remove()); // Clean up style tag too

        newDiv.className = "parabola";
        newDiv.style.animation = `parabola ${duration}ms linear`;
        newDiv.style.position = "absolute";
        newDiv.style.zIndex = "1000";
        newDiv.style.height = `${toH}px`;
        newDiv.style.top = "0px"
        newDiv.style.background = 'black';
        
        ref1.current.parentNode!.parentNode!.appendChild(shell);
        shell.style.transform = "scaleX(1)";
        shell.style.width = "100%";
        shell.style.height = "100%";
        shell.style.position = "absolute";
        shell.style.top = "5px";
        shell.style.left = "0";
        shell.appendChild(newDiv);
        
        scope.setTimeout(() => {
            newDiv.remove();
        }, duration);
    }

    const shift = 0.2;
    let completedCount = 0;
    const total = refs.length;

    refs.forEach((ref, i) => {
        if (ref.current) {
            ref.current.className = from;
            scope.setTimeout(() => {
                if (ref.current) ref.current.className = to;
                
                completedCount++;
                if (completedCount === total && onComplete) {
                    onComplete();
                }
            }, duration * (i / refs.length * (1 - shift) + shift));
        } else {
            completedCount++;
        }
    });

    return () => scope.cancel();
}