#!/usr/bin/env python3

from .node import Node

class Profile:
    def __init__(self, nodes: list[Node]):
        self.nodes = nodes

    def to_dict(self):
        return {
            'nodes': [node.to_dict() for node in self.nodes],
        }

    def run(self):
        pass
