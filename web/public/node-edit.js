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
  const canvas = document.getElementById('previewCanvas');
  const context = canvas.getContext('2d');
  const nodesTable = document.getElementById('nodesTable');
  const saveButton = document.getElementById('saveButton')
  const tbody = nodesTable.querySelector('tbody')
  var modal = document.getElementById("newNodeModal");

  const inputRe = /<([^\:]+?)>/g
  const outputRe = /<\:(.+?)>/g

  let inputs = [];
  let outputs = [];


  let node = new Node(600 / 2 - 300 / 2, 10, 'New node', null, []);

  canvas.width = 600;
  canvas.height = 200;

  function updateTable() {
    fetch('/api/nodes').then(data => data.json()).then(nodes => {
      tbody.innerHTML = '';
      for (let node of nodes) {
        let row = tbody.insertRow();
        row.insertCell(0).innerHTML = node['name']
        row.insertCell(1).innerHTML = escapeHtml(node['command'])
        row.insertCell(2).innerHTML = '<td> <a href="#"><i class="fa fa-trash" style="color: red"></i></a> <a href="#"><i class="fa fa-pencil" style="color: blue"></i></a> </td>'
      }
    })
  }

  saveButton.addEventListener('click', function(e) {
    let name = document.getElementById('nodeName').value
    let command = document.getElementById('nodeCommand').value

    fetch('/api/nodes', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({node: {name: name, command: command, inputs: inputs, outputs: outputs}})
    }).then(data => data.json()).then(data => {
      updateTable();
      modal.style.display = 'none';
    })
  })

  updateTable();
  draw();


  function draw() {
    canvas.style.height = node.height + 40 + 'px';
    canvas.height = node.height + 40;
    context.clearRect(0,0,canvas.width,canvas.height);
    node.draw(context);
  }

  const commandInput = document.getElementById('nodeCommand')
  const nameInput = document.getElementById('nodeName')

  nameInput.addEventListener('input', function(e) {
    let name = e.target.value
    if (name === '') name = 'New node'
    node.title = name
    draw()
  })

  commandInput.addEventListener('input', function(e) {
    let command = e.target.value
    let inputsMatches = command.match(inputRe)
    let outputsMatches = command.match(outputRe)
    inputs = [];
    outputs = [];

    if (inputsMatches) {
      for (let inputMatch of inputsMatches)
        inputs.push({name: inputMatch.substr(1, inputMatch.length - 2)})
    }

    if (outputsMatches) {
      for (let outputMatch of outputsMatches)
        outputs.push({name: outputMatch.substr(2, outputMatch.length - 3)})
    }

    node.setSockets(inputs, outputs)
    draw();
  })
})();
