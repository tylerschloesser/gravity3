import { State } from './state'

const canvas = document.querySelector('canvas') as HTMLCanvasElement
const context = canvas.getContext('2d')

canvas.width = document.body.clientWidth
canvas.height = document.body.clientHeight

let state: State = {
  canvas,
  context,
  cursor: {
    p: { x: 0, y: 0 },
    v: { x: 0, y: 0 },
    a: { x: 0, y: 250 },
  },
  paused: false,
  dragging: false,
  dragX: 0,
  maxSpeed: 500,
  centerA: 250,
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

  drawBackground(state)
  drawCursor(state)

  lastFrame = now
  window.requestAnimationFrame(handleFrame)
}
window.requestAnimationFrame(handleFrame)
