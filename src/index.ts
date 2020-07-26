import { State, Point } from './state'

const canvas = document.querySelector('canvas') as HTMLCanvasElement
const context = canvas.getContext('2d')

canvas.width = document.body.clientWidth
canvas.height = document.body.clientHeight

function generatePoints(): Point[] {
  const points: Point[] = [
    {
      p: { x: 0, y: 4000 },
      hit: false,
    },
  ]

  for (let i = 0; i < 100; i++) {
    points.push({
      p: {
        x: 0,
        y: i * 500 + 4000,
      },
      hit: false,
    })
  }

  return points
}

let state: State = {
  canvas,
  context,
  cursor: {
    p: { x: 0, y: 0 },
    v: { x: 0, y: 0 },
    a: { x: 0, y: 500 },
  },
  paused: false,
  dragging: false,
  dragX: 0,
  maxSpeed: 1000,
  centerA: 500,
  points: generatePoints(),
}

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === ' ') {
    state = {
      ...state,
      paused: !state.paused,
    }
    console.log('paused:', state.paused)
  }
})

let lastClientX: number
document.addEventListener('pointerdown', (e: PointerEvent) => {
  lastClientX = e.clientX
  state = {
    ...state,
    dragging: true,
  }
})

document.addEventListener('pointermove', (e: PointerEvent) => {
  // movementX not support for non-mouse events :(
  const movementX = e.clientX - lastClientX
  lastClientX = e.clientX
  if (!state.dragging) {
    return
  }
  state = {
    ...state,
    dragX: state.dragX + movementX,
  }
})

document.addEventListener('pointerup', (e: PointerEvent) => {
  state = {
    ...state,
    dragging: false,
  }
})

// disable bounce on ios
document.addEventListener('touchmove', (e: TouchEvent) => {
  e.preventDefault()
}, { passive: false })

function drawCursor(state: State): void {
  const { context, canvas } = state

  context.resetTransform()
  context.translate(
    canvas.width / 2 + state.cursor.p.x,
    canvas.height / 2)
  context.rotate(-Math.atan2(state.cursor.v.y, state.cursor.v.x) + Math.PI / 2)

  context.fillStyle = 'white'
  context.beginPath()
  context.moveTo(0, -50)
  context.lineTo(50, 50)
  context.lineTo(-50, 50)
  context.lineTo(0, -50)
  context.fill()
}

function drawBackground(state: State): void {
  const { canvas, context } = state
  const numLines = 4
  const lineRangeY = canvas.height / numLines
  context.resetTransform()
  context.translate(0, state.cursor.p.y % lineRangeY)
  context.strokeStyle = 'white'
  for (let i = 0; i < numLines; i++) {
    const y = i * lineRangeY
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(canvas.width, y)
    context.stroke()
  }
}

function applyDragToCursor(state: State, elapsed: number): State {
  if (state.dragX === 0) {
    return state
  }
  const { cursor } = state
  const newState = {
    ...state,
    cursor: {
      ...cursor,
      v: {
        ...cursor.v,
        x: cursor.v.x + state.dragX,
      },
    },
    dragX: 0,
  }
  return newState
}

function calcPointHit(state: State): State {

  const { cursor, points } = state
  let newPoints: Point[] = []

  for (const point of points) {
    if (Math.abs(point.p.y - cursor.p.y) < 20 &&
      Math.abs(point.p.x - cursor.p.x) < 20) {
      newPoints.push({
        ...point,
        hit: true,
      })
    } else {
      newPoints.push(point)
    }
  }

  return {
    ...state,
    points: newPoints,
  }
}

function drawPoints(state: State): void {
  const { context, canvas, cursor } = state
  context.resetTransform()
  context.translate(canvas.width / 2, canvas.height / 2)
  for (const point of state.points) {
    if (point.p.y > (cursor.p.y - canvas.height / 2)
      && point.p.y < (cursor.p.y + canvas.height / 2)) {

      if (point.hit) {
        context.fillStyle = 'orange'
      } else {
        context.fillStyle = 'blue'
      }
      context.beginPath()
      context.arc(0, cursor.p.y - point.p.y, 20, 0, 2 * Math.PI)
      context.fill()

    }
  }
}

function calcCursor(state: State, elapsed: number): State {

  const { maxSpeed } = state

  const { cursor } = state
  const nextP = {
    x: cursor.p.x + cursor.v.x * (elapsed / 1000),
    y: cursor.p.y + cursor.v.y * (elapsed / 1000),
  }

  let centerA = 0
  if (cursor.p.x < 0) {
    centerA = state.centerA
  } else if (cursor.p.x > 0) {
    centerA = -state.centerA
  }

  let nextV = {
    x: cursor.v.x + cursor.a.x * (elapsed / 1000) + centerA * (elapsed / 1000),
    y: cursor.v.y + cursor.a.y * (elapsed / 1000),
  }

  const speed = Math.sqrt(
    nextV.x * nextV.x +
    nextV.y * nextV.y
  )

  if (speed > maxSpeed) {
    nextV = {
      x: nextV.x / speed * maxSpeed,
      y: nextV.y / speed * maxSpeed,
    }
  }

  return {
    ...state,
    cursor: {
      ...cursor,
      p: nextP,
      v: nextV,
    }
  }
}


function drawScore(state: State): void {
  const { context, points } = state

  const score = points.reduce((acc, point) => acc + (point.hit ? 1 : 0), 0)

  context.fillStyle = 'white'
  context.resetTransform()
  context.font = '48px serif'
  context.fillText(`Score: ${score}`, 0, 48)
}

let lastFrame: DOMHighResTimeStamp = 0

function handleFrame(now: DOMHighResTimeStamp): void {

  if (state.paused) {
    lastFrame = now
    window.requestAnimationFrame(handleFrame)
    return
  }

  const elapsed = now.valueOf() - lastFrame.valueOf()
  context.resetTransform()
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'black'
  context.fillRect(0, 0, canvas.width, canvas.height)

  state = applyDragToCursor(state, elapsed)
  state = calcCursor(state, elapsed)
  state = calcPointHit(state)

  drawBackground(state)
  drawPoints(state)
  drawCursor(state)
  drawScore(state)

  lastFrame = now
  window.requestAnimationFrame(handleFrame)
}
window.requestAnimationFrame(handleFrame)
