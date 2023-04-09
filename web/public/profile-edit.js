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
  const canvas = document.getElementById('profile-edit-canvas');
  const context = canvas.getContext('2d');
  const addNodeButton = document.querySelector('.add-node-button');
  const saveButton = document.querySelector('.save-button');
  const searchBar = document.querySelector('#searchBar')
  const nodePaletteContent = document.querySelector('#nodePaletteContent')
  const modal = document.querySelector(".modal");
  const contextMenu = document.querySelector('.contextMenu')

  let nodes = [];
  let nodeBank = [];
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
  // nodes.push(new Node(500, 10, 'subfinder', [{name: "domains"}], [{name: "subdomains"}]));

  // resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false);

  fetch('/api/nodes').then(data => data.json()).then(nodes => {
    nodeBank = nodes;
  })

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    draw();
  }

  addNodeButton.addEventListener('click', function(e) {

    searchBar.focus();
    nodePaletteContent.innerHTML = '';
    for (let node of nodeBank) {
      let row = nodePaletteContent.insertRow();
      row.insertCell(0).innerHTML = node['name']
      row.insertCell(1).innerHTML = escapeHtml(node['description'])
      row.addEventListener('click', function() {
        nodes.push(new Node(canvas.width / 2 - 150, canvas.height / 2 - 150,
                            node['type'],
                            node['name'], node['inputs'], node['outputs']))
        modal.style.display = 'none';
        draw();
      })
    }
  })

  saveButton.addEventListener('click', function(e) {
    let nodesSerialized = nodes.map(node => node.toDict())
    fetch('/api/profile', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({nodes: nodesSerialized})
    }).then(data => data.json()).then(data => {
    })
  })


  resizeCanvas();


  let selectedNode = null;
  let selectedSocket = null;
  let drag = false;
  let dragOffsetX, dragOffsetY;

  canvas.addEventListener('mousedown', function(e) {
    contextMenu.style.display = 'none';

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

    if (selectedNode === null && selectedSocket === null) {
      dragOffsetX = x;
      dragOffsetY = y;
      drag = true;
    }
    draw();
  });


  canvas.addEventListener('mouseup', function(e) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top;  //y position within the element.

    if (selectedNode) {
      selectedNode.staleX = selectedNode.x;
      selectedNode.staleY = selectedNode.y;
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

    if (selectedNode) {
      selectedNode.x = x + dragOffsetX;
      selectedNode.y = y + dragOffsetY;
    }

    if (drag && selectedNode === null && selectedSocket === null) {
      for (let node of nodes) {
        node.x = node.staleX + x - dragOffsetX;
        node.y = node.staleY + y - dragOffsetY;
      }
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

  canvas.addEventListener('wheel', function(e) {
    let delta = (e.wheelDelta / 120) * 1.1
  })

  canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();

    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top;  //y position within the element.

    contextNode = null;
    for (let node of nodes) {
      if (node.contains(x, y)) contextNode = node;
    }

    if (contextNode) {
      contextMenu.style.left = e.pageX;
      contextMenu.style.top = e.pageY;
      contextMenu.style.display = 'block';
    }
  })

  contextMenu.querySelector('a').addEventListener('click', function(e) {
    contextMenu.style.display = 'none';
    nodes.splice(nodes.indexOf(contextNode), 1)
    delete contextNode;
    draw();
  })

  function draw() {
    context.clearRect(0,0,canvas.width,canvas.height);

    for (node of nodes)
      node.draw(context);
  }
})();
