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
    v: { x: 0, y: 100 },
    a: { x: 0, y: 0 },
  },
  paused: false,
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

function drawCursor(state: State): void {
  const { context, canvas } = state

  context.resetTransform()
  context.translate(
    canvas.width / 2 - 100 / 2,
    canvas.height / 2 - 100 / 2)

  context.fillStyle = 'white'
  context.beginPath()
  context.moveTo(50, 0)
  context.lineTo(100, 100)
  context.lineTo(0, 100)
  context.lineTo(50, 0)
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

function calcCursor(state: State, elapsed: number): State {

  const { cursor } = state
  const nextP = {
    x: cursor.p.x + cursor.v.x * (elapsed / 1000),
    y: cursor.p.y + cursor.v.y * (elapsed / 1000),
  }

  const nextV = {
    x: cursor.v.x + cursor.a.x * (elapsed / 1000),
    y: cursor.v.y + cursor.a.y * (elapsed / 1000),
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

  state = calcCursor(state, elapsed)
  //console.log(JSON.stringify(state.cursor))

  drawBackground(state)
  drawCursor(state)

  lastFrame = now
  window.requestAnimationFrame(handleFrame)
}
window.requestAnimationFrame(handleFrame)
