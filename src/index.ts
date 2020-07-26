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
  },
}

function drawCursor(state: State): void {
  const { context } = state

  context.resetTransform()
  context.translate(
    canvas.width / 2 - 100 / 2,
    canvas.height / 2 - 100 / 2)

  context.moveTo(50, 0)
  context.fillStyle = 'white'
  context.beginPath()
  context.lineTo(100, 100)
  context.lineTo(0, 100)
  context.lineTo(50, 0)
  context.fill()
}

function handleFrame(now: DOMHighResTimeStamp): void {
  context.fillStyle = 'black'
  context.fillRect(0, 0, canvas.width, canvas.height)

  drawCursor(state)

  window.requestAnimationFrame(handleFrame)
}
window.requestAnimationFrame(handleFrame)
