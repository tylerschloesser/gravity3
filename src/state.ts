interface Vec2 {
  x: number
  y: number
}

interface Cursor {
  p: Vec2
}

export interface State {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  cursor: Cursor
}
