const canvas = document.querySelector('canvas') as HTMLCanvasElement
const context = canvas.getContext('2d')

context.fillStyle = 'black'
context.fillRect(0, 0, canvas.width, canvas.height)
