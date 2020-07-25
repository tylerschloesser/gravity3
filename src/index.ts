import { State } from './state'

const canvas = document.querySelector('canvas') as HTMLCanvasElement
const context = canvas.getContext('2d')

canvas.width = document.body.clientWidth
canvas.height = document.body.clientHeight

context.fillStyle = 'black'
context.fillRect(0, 0, canvas.width, canvas.height)

let state: State = {
  canvas,
  context,
}
