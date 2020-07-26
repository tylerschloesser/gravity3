interface Vec2 {
  x: number
  y: number
}

interface Cursor {
  p: Vec2
  v: Vec2
  a: Vec2
}

export interface Point {
  p: Vec2
  hit: boolean
}

export interface State {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  cursor: Cursor

  paused: boolean

  dragging: boolean
  dragX: number
  maxSpeed: number

  centerA: number

  points: Point[]
}
