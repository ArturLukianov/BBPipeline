#!/usr/bin/env python3

from .node import Node
from .profile import Profile
import json
import os


## Nodes

def save_node(node: Node):
    nodes = load_nodes()
    nodes.append(node)
    nodes = [node.to_dict() for node in nodes]
    with open('config/nodes.json', 'w+') as f:
        json.dump(nodes, f)


def load_nodes() -> list[Node]:
    nodes = []
    if not os.path.exists('config/nodes.json'): return nodes
    with open('config/nodes.json', 'r') as f:
        nodes = [Node(node_data['name'],
                      node_data['command'],
                      node_data['inputs'],
                      node_data['outputs']) for node_data in json.load(f)]
    return nodes


## Profile

def save_profile(profile: Profile):
    with open('config/profile.json', 'w+') as f:
        json.dump(profile.to_dict(), f)


def load_profile() -> Profile:
    profile = None
    if not os.path.exists('config/profile.json'): return Profile([])
    with open('config/profile.json', 'r') as f:
        data = json.load(f)
        profile = Profile(data['nodes'])
    return profile
