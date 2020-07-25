import { State } from './state'

const canvas = document.querySelector('canvas') as HTMLCanvasElement
const context = canvas.getContext('2d')

canvas.width = document.body.clientWidth
canvas.height = document.body.clientHeight


let state: State = {
  canvas,
  context,
}

function handleFrame(now: DOMHighResTimeStamp): void {
  context.fillStyle = 'black'
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.fillStyle = 'white'
  context.beginPath()
  context.moveTo(100, 0)
  context.lineTo(0, 100)
  context.lineTo(0, 0)
  context.fill()

  window.requestAnimationFrame(handleFrame)
}
window.requestAnimationFrame(handleFrame)
