#!/usr/bin/env python3

import sys
import threading
from flask import Flask, send_from_directory, redirect, jsonify, request

sys.path.append('..')
from core.node import Node, CustomNode
from core.profile import Profile
from core.helpers import save_node, load_nodes, save_profile, load_profile, node_from_dict


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
        node = node_from_dict(node_data)

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
            node_from_dict(node_data)
            for node_data in data['nodes']
        ]
        loaded_profile = Profile(nodes)
        save_profile(loaded_profile)
        return jsonify({'result': 'ok'})


def run_profile():
    global loaded_profile
    loaded_profile.run()

@app.route('/api/scan/run')
def run_scan():
    threading.Thread(target=run_profile).start()
    return jsonify({'status': loaded_profile.status})

@app.route('/api/scan/status')
def status_scan():
    return jsonify({'status': loaded_profile.status})

@app.route('/api/scan/result')
def scan_result():
    return jsonify({'result': loaded_profile.result})



@app.route('/api/scan/scope', methods=['POST', 'GET'])
def scan_scope():
    if request.method == 'GET':
        return jsonify({'scope': loaded_profile.get_scope()})
    else:
        scope = request.json.get('scope')
        if not scope: return jsonify({'result': 'no scope given'})
        loaded_profile.set_scope(scope)
        return jsonify({'result': 'ok'})
