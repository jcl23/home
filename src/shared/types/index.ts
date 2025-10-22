import React from 'react';

// Animation types
export interface Point {
  x: number;
  y: number;
}

export interface Project {
  name: string;
  body: React.JSX.Element;
  link: string;
}

// Text animation function type
export type TextAnimationFunction = (
  refs: React.RefObject<HTMLDivElement | null>[],
  from: string,
  to: string,
  duration: number
) => Promise<void>[];

// Theme configuration types
export interface ThemeStyle {
  [key: string]: string;
}

// Component prop types
export interface TextTransitionProps {
  text: string;
  themeIndex: number;
  duration: number;
}

export interface BorderProps {
  blockHeight: number;
  stackHeight?: number;
  width: number;
  children: React.ReactNode;
  themeIndex: number;
  iter?: number;
  passThrough?: boolean;
}

export interface ThemeSelectorProps {
  points: number[];
  currentIndex: number;
  setIndex: (index: number) => void;
}