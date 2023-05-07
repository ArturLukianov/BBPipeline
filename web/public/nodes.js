/* Third-party code */
/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(
  ctx,
  x,
  y,
  width,
  height,
  radius = 5,
  fill = false,
  stroke = true
) {
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    radius = {...{tl: 0, tr: 0, br: 0, bl: 0}, ...radius};
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}

function drawCircle(ctx, x, y, radius, fill, stroke, strokeWidth) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.lineWidth = strokeWidth
    ctx.strokeStyle = stroke
    ctx.stroke()
  }
}


function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}


class Socket {
  constructor(node, name, index, type, id = null) {
    this.id = id ? id : uuidv4();
    this.node = node
    this.name = name
    this.index = index
    this.type = type
    this.textWidth = 0;
    this.selected = false;
    this.connectedTo = [];
  }

  draw(ctx) {
    ctx.fillStyle = "#000";

    const text = ctx.measureText(this.name);
    let fillColor = (this.selected || this.connectedTo.length != 0) ? '#045d9a' : '#fff'
    let strokeColor = (this.selected || this.connectedTo.length != 0) ? '#045d9a' : '#0462aa'
    if (this.type == 'output') {
      ctx.fillText(this.name, this.node.x + this.node.width - text.width - 20,
                   this.node.y + 66 + this.index * 40);
    } else {
      ctx.fillText(this.name, this.node.x + 20, this.node.y + 66 + this.index * 40);
    }

    drawCircle(ctx, this.getX(), this.getY(), 5,
               fillColor, strokeColor, 3)

    for (let connection of this.connectedTo) {
      let x = connection.getX();
      let y = connection.getY();
      ctx.strokeStyle = "#045d9a 3px";
      ctx.beginPath();
      let sx = this.getX();
      let sy = this.getY();
      ctx.moveTo(sx, sy);
      let cx = (sx + x) / 2;
      let cy = (sy + y) / 2;
      ctx.bezierCurveTo(cx, sy, cx, y, x, y);
      ctx.stroke();
    }
  }

  contains(x, y) {
    let px = this.getX() - x
    let py = this.getY() - y
    if (px * px + py * py <= 5 * 5) {
      return true;
    }
  }

  getX() {
    if (this.type == 'input') return this.node.x
    else return this.node.x + this.node.width
  }

  getY() {
    return this.node.y + 66 + this.index * 40 - 5;
  }

  toDict() {
    if (this.type == 'input') return {
      'id': this.id,
      'name': this.name,
      'type': this.type,
    }

    return {
      'id': this.id,
      'name': this.name,
      'type': this.type,
      'connections': this.connectedTo.map(connection => connection.id)
    }
  }
}

/* Pipeline node */
class Node {
  constructor(x, y, type, name, inputs = null, outputs = null, id = null, command = null) {
    this.id = id ? id : uuidv4();
    this.x = x;
    this.y = y;
    this.type = type;
    this.command = command;
    this.staleX = x;
    this.staleY = y;
    this.name = name;
    this.headerSelected = false;
    this.setSockets(inputs, outputs)
  }

  setSockets(inputs, outputs) {
    if (!inputs) this.inputs = []
    else this.inputs = inputs
    if (!outputs) this.outputs = []
    else this.outputs = outputs

    let index = 0;
    this.outputSockets = [];
    for (let output of this.outputs) {
      this.outputSockets.push(new Socket(this, output.name, index, 'output', output.id?output.id:null))
      index++;
    }

    index = 0;
    this.inputSockets = [];
    for (let input of this.inputs) {
      this.inputSockets.push(new Socket(this, input.name, index, 'input', input.id?input.id:null))
      index++;
    }

    this.width = 300
    this.height = 40 + Math.max(this.inputs.length,
                                this.outputs.length) * 40;

  }

  draw(ctx) {
    ctx.fillStyle = "#ddd";
    roundRect(ctx, this.x, this.y, this.width, this.height, 10, true, false);
    if (this.headerSelected) {
      ctx.fillStyle = "#049A5D";
    } else {
      ctx.fillStyle = "#04AA6D";
    }
    if (this.height == 40)
      roundRect(ctx, this.x, this.y, this.width, 40, 10, true, false);
    else
      roundRect(ctx, this.x, this.y, this.width, 40, {tl: 10, tr: 10}, true, false);
    ctx.font = "20px monospace";
    ctx.fillStyle = "#fff";
    ctx.fillText(this.name, this.x + 10, this.y + 26);

    ctx.font = "15px monospace";
    ctx.fillStyle = "#000";

    for (let outputSocket of this.outputSockets)
      outputSocket.draw(ctx)

    for (let inputSocket of this.inputSockets)
      inputSocket.draw(ctx)
  }

  contains(x, y) {

  }

  headerContains(x, y) {
    return this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + 40
  }

  contains(x, y) {
    return this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + this.height
  }

  socketContains(x, y) {
    for (let outputSocket of this.outputSockets) {
      if (outputSocket.contains(x, y))
        return outputSocket
    }


    for (let inputSocket of this.inputSockets) {
      if (inputSocket.contains(x, y))
        return inputSocket
    }

    return null;
  }

  toDict() {
    return {
      'id': this.id,
      'type': this.type,
      'command': this.command,
      'name': this.name,
      'inputs': this.inputSockets.map(socket => socket.toDict()),
      'outputs': this.outputSockets.map(socket => socket.toDict()),
      'position': [this.x, this.y]
    }
  }
}
