#!/usr/bin/env python3

import sys
from flask import Flask, send_from_directory, redirect, jsonify, request

sys.path.append('..')
from core.node import Node
from core.profile import Profile
from core.helpers import save_node, load_nodes, save_profile, load_profile


loaded_nodes = load_nodes()
loaded_profile  = load_profile()
app = Flask(__name__)


@app.route('/<path>')
def public(path):
    return send_from_directory('public', path)

@app.route('/')
def index():
    return redirect('/index.html')

@app.route('/api/nodes', methods=['POST', 'GET'])
def nodes():
    global loaded_nodes
    if request.method == 'GET':
        return jsonify([node.to_dict() for node in loaded_nodes])
    else:
        data = request.json
        if not data.get('node'): return jsonify({'error': 'no node'})
        node_data = data.get('node')
        node = Node(node_data['name'],
                    node_data['command'],
                    node_data['inputs'],
                    node_data['outputs'])

        save_node(node)
        loaded_nodes = load_nodes()

        return jsonify({'result': 'ok'})

@app.route('/api/profile', methods=['POST', 'GET'])
def profile():
    global loaded_profile
    if request.method == 'GET':
        return jsonify(loaded_profile.to_dict())
    else:
        data = request.json
        nodes = [
            Node(node_data['name'], node_data['command'], node_data['inputs'],
                 node_data['outputs'], node_data['position'])
            for node_data in data['nodes']
        ]
        loaded_profile = Profile(nodes)
        save_profile(loaded_profile)
        return jsonify({'result': 'ok'})
