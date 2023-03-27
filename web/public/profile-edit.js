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



class Socket {
  constructor(node, name, index, type) {
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
}

/* Pipeline node */
class Node {
  constructor(x, y, title, inputs = null, outputs = null) {
    this.x = x;
    this.y = y;
    this.title = title;
    this.headerSelected = false;
    if (!inputs) this.inputs = []
    else this.inputs = inputs
    if (!outputs) this.outputs = []
    else this.outputs = outputs

    let index = 0;
    this.outputSockets = [];
    for (let output of this.outputs) {
      this.outputSockets.push(new Socket(this, output.name, index, 'output'))
      index++;
    }

    index = 0;
    this.inputSockets = [];
    for (let input of this.inputs) {
      this.inputSockets.push(new Socket(this, input.name, index, 'input'))
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
    ctx.fillText(this.title, this.x + 10, this.y + 26);

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
}



(function() {
  const canvas = document.getElementById('profile-edit-canvas');
  const context = canvas.getContext('2d');
  let nodes = [];

  nodes.push(new Node(10, 10, 'Scope', null, [{name: "domains"}]));
  nodes.push(new Node(500, 10, 'subfinder', [{name: "domains"}], [{name: "subdomains"}]));

  // resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false);

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    draw();
  }


  resizeCanvas();


  let selectedNode = null;
  let selectedSocket = null;
  let dragOffsetX, dragOffsetY;

  canvas.addEventListener('mousedown', function(e) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top;  //y position within the element.

    for (node of nodes) {
      if (node.headerContains(x, y)) {
        node.headerSelected = true;
        selectedNode = node;
        dragOffsetX = node.x - x;
        dragOffsetY = node.y - y;
        break;
      } else node.headerSelected = false;
    }

    if (!selectedNode) {
      for (node of nodes) {
        if (node.socketContains(x, y) !== null) {
          selectedSocket = node.socketContains(x, y)
          selectedSocket.selected = true;
          break;
        }
      }
    }
    draw();
  });


  canvas.addEventListener('mouseup', function(e) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top;  //y position within the element.

    if (selectedNode) {
      selectedNode.headerSelected = false;
      selectedNode = null;
    }

    if (selectedSocket) {
      for (let node of nodes) {
        if (node.socketContains(x, y)) {
          let targetSocket = node.socketContains(x, y)
          if (targetSocket != selectedSocket) {
            selectedSocket.connectedTo.push(targetSocket)
            targetSocket.connectedTo.push(selectedSocket)
          }
        }
      }

      selectedSocket.selected = false;
      selectedSocket = null;
    }

    draw();
  });

  canvas.addEventListener('mousemove', function(e) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top;  //y position within the element.

    if (selectedNode) {
      selectedNode.x = x + dragOffsetX;
      selectedNode.y = y + dragOffsetY;
    }

    draw();

    if (selectedSocket) {
      context.strokeStyle = "#045d9a 3px";
      context.beginPath();
      let sx = selectedSocket.getX();
      let sy = selectedSocket.getY();
      context.moveTo(sx, sy);
      let cx = (sx + x) / 2;
      let cy = (sy + y) / 2;
      context.bezierCurveTo(cx, sy, cx, y, x, y);
      context.stroke();
    }
  })

  function draw() {
    context.clearRect(0,0,canvas.width,canvas.height);
    for (node of nodes)
      node.draw(context);
  }
})();
