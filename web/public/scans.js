function escapeHtml(unsafe)
{
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

(function() {
  const canvas = document.getElementById('profile-preview-canvas');
  const context = canvas.getContext('2d');
  const saveScopeButton = document.getElementById('saveScope');
  const runScanButton = document.getElementById('runScan')
  const status = document.getElementById('status')

  let nodes = [];
  let contextNode = null;

  fetch('/api/profile').then(data => data.json()).then(data => {
    nodes = [];
    for (let node of data['nodes']) {
      nodes.push(new Node(node['position'][0], node['position'][1],
                          node['type'],
                          node['name'], node['inputs'], node['outputs'],
                          node['id'], node['command']))
    }

    // TODO: make better referencing
    for (let node of nodes) {
      for (let output of node.outputs) {
        let outputSocket = null;
        if (output.connections === undefined) continue
        for (let os of node.outputSockets)
          if (os.name == output.name) outputSocket = os

        for (let node2 of nodes) {
          for (let input of node2['inputSockets']) {
            if (output.connections.includes(input.id)) {
              outputSocket.connectedTo.push(input)
              input.selected = true;
            }
          }
        }
      }
    }

    draw();
  })

  // resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false);

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    draw();
  }

  resizeCanvas();


  let drag = false;
  let dragOffsetX, dragOffsetY;

  canvas.addEventListener('mousedown', function(e) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top;  //y position within the element.

    dragOffsetX = x;
    dragOffsetY = y;
    drag = true;

    draw();
  });


  canvas.addEventListener('mouseup', function(e) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top;  //y position within the element.

    if (drag) {
      drag = false;
      for (let node of nodes) {
        node.staleX = node.x;
        node.staleY = node.y;
      }
    }

    draw();
  });

  canvas.addEventListener('mousemove', function(e) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top;  //y position within the element.

    if (drag) {
      for (let node of nodes) {
        node.x = node.staleX + x - dragOffsetX;
        node.y = node.staleY + y - dragOffsetY;
      }
    }

    draw();
  })

  function draw() {
    context.clearRect(0,0,canvas.width,canvas.height);

    for (node of nodes)
      node.draw(context);
  }

  runScanButton.addEventListener('click', function(e) {
    fetch('/api/scan/run').then(data => data.json()).then(data => {
      status.innerHTML = 'Status: runnnig'
    })
  })
})();
