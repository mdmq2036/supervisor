export type Tool =
  | 'select'
  | 'draw'
  | 'text'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'image'
  | 'pan';

export type Point = {
  x: number;
  y: number;
};

export type DrawingPath = {
  type: 'drawing';
  id: string;
  points: Point[];
  color: string;
  width: number;
};

export type TextElement = {
  type: 'text';
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
};

export type RectangleElement = {
  type: 'rectangle';
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  filled: boolean;
};

export type CircleElement = {
  type: 'circle';
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  filled: boolean;
};

export type LineElement = {
  type: 'line';
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
};

export type ImageElement = {
  type: 'image';
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
};

export type CanvasElement =
  | DrawingPath
  | TextElement
  | RectangleElement
  | CircleElement
  | LineElement
  | ImageElement;

export type ViewportState = {
  x: number;
  y: number;
  zoom: number;
};
