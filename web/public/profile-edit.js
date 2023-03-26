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

/* Pipeline node */
class Node {
  constructor(x, y, title, inputs = null, outputs = null) {
    this.x = x;
    this.y = y;
    this.title = title;
    this.headerSelected = false;
  }

  draw(ctx) {
    ctx.fillStyle = "#ddd";
    roundRect(ctx, this.x, this.y, 300, 200, 10, true, false);
    if (this.headerSelected) {
      ctx.fillStyle = "#049A5D";
    } else {
      ctx.fillStyle = "#04AA6D";
    }
    roundRect(ctx, this.x, this.y, 300, 40, {tl: 10, tr: 10}, true, false);
    ctx.font = "20px monospace";
    ctx.fillStyle = "#fff";
    ctx.fillText(this.title, this.x + 10, this.y + 26);
  }

  contains(x, y) {

  }

  headerContains(x, y) {
    return this.x <= x && x <= this.x + 300 && this.y <= y && y <= this.y + 40
  }
}



(function() {
  const canvas = document.getElementById('profile-edit-canvas');
  const context = canvas.getContext('2d');
  let nodes = [];

  nodes.push(new Node(10, 10, 'Scope'));
  nodes.push(new Node(500, 10, 'subfinder'));

  // resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false);

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    draw();
  }


  resizeCanvas();


  let selectedNode = null;
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
      } else node.headerSelected = false;
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
  })

  function draw() {
    context.clearRect(0,0,canvas.width,canvas.height);
    for (node of nodes)
      node.draw(context);
  }
})();
