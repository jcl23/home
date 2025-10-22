import { JSX } from "react";

export type Project = {
    name: string;
    body: JSX.Element;
    link: string;
};

export const projects: Project[] = [
    { 
        name: "Topological Calculator", 
        body: (
            <>
                This interactive CW‑complex calculator is an educational tool designed to teach the fundamentals of topology—especially homology—by letting you build spaces and compute their homological features. With a solid grasp of homology, you'll be better equipped to understand advanced topics such as <a href="https://math.stackexchange.com/questions/73690/real-life-applications-of-topology">topological data analysis</a>, sensor network coverage, and robotic <a href="https://en.wikipedia.org/wiki/Configuration_space">configuration spaces</a>. These core concepts are also essential for exploring the classification of <a href="https://en.wikipedia.org/wiki/Topological_insulator">quantum materials</a>, analyzing <a href="https://en.wikipedia.org/wiki/Connectome">brain connectivity</a>, and enhancing modern AI through <a href="https://en.wikipedia.org/wiki/Topological_deep_learning">topological deep learning</a>. Master homology with our tool and build the mathematical foundation that underpins these cutting‑edge applications.
            </>
        ),
        link: "https://jcl23.github.io/homology/",
    },
    { 
        name: "Rotation Symmetry Navigator", 
        body: (
            <>
                Symmetries of all things are encoded in algebraic structures known as groups. With my Navigator, explore the symmetry groups for all the platonic solids.
            </>
        ),
        link: "https://jcl23.github.io/homology/",
    },
    { 
        name: "CounterStrike Tactic Planner", 
        body: (
            <>
                This interactive CW‑complex calculator is an educational tool designed to teach the fundamentals of topology—especially homology—by letting you build spaces and compute their homological features. With a solid grasp of homology, you'll be better equipped to understand advanced topics such as <a href="https://math.stackexchange.com/questions/73690/real-life-applications-of-topology">topological data analysis</a>, sensor network coverage, and robotic <a href="https://en.wikipedia.org/wiki/Configuration_space">configuration spaces</a>. These core concepts are also essential for exploring the classification of <a href="https://en.wikipedia.org/wiki/Topological_insulator">quantum materials</a>, analyzing <a href="https://en.wikipedia.org/wiki/Connectome">brain connectivity</a>, and enhancing modern AI through <a href="https://en.wikipedia.org/wiki/Topological_deep_learning">topological deep learning</a>. Master homology with our tool and build the mathematical foundation that underpins these cutting‑edge applications.
            </>
        ),
        link: "https://jcl23.github.io/homology/",
    },
];
projects.length = 0;