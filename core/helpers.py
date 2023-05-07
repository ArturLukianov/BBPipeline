#!/usr/bin/env python3

from .node import Node, CustomNode
from .nodes.scope import Scope
from .nodes.result import Result
from .profile import Profile
import json
import os


## Nodes

builtin_nodes = [Scope(), Result()]
node_types = dict()


for node in builtin_nodes:
    node_types[node.TYPE] = node.__class__
node_types[CustomNode.TYPE] = CustomNode

def node_from_dict(data):
    return node_types[data.get('type')].from_dict(data)

def save_node(node: Node):
    nodes = load_nodes()
    nodes.append(node)
    nodes = [node.to_dict() for node in nodes if node.TYPE == CustomNode.TYPE]
    with open('config/nodes.json', 'w+') as f:
        json.dump(nodes, f)


def load_nodes() -> list[Node]:
    nodes = []
    if os.path.exists('config/nodes.json'):
        with open('config/nodes.json', 'r') as f:
            nodes = [node_from_dict(node_data) for node_data in json.load(f)]
    return builtin_nodes + nodes


## Profile

def save_profile(profile: Profile):
    with open('config/profile.json', 'w+') as f:
        json.dump(profile.to_dict(), f)


def load_profile() -> Profile:
    profile = None
    if not os.path.exists('config/profile.json'): return Profile([])
    with open('config/profile.json', 'r') as f:
        data = json.load(f)
        profile = Profile([node_from_dict(node_data)
                           for node_data in data['nodes']])
        profile.wire_connections()
    return profile
