#!/usr/bin/env python3

from .node import Node
from .nodes.scope import Scope

class Profile:
    def __init__(self, nodes):
        self.nodes = nodes
        self.scope = []

    def to_dict(self):
        return {
            'nodes': [node.to_dict() for node in self.nodes],
        }

    def run(self):
        scope_node = None
        for node in self.nodes:
            if node.TYPE == Scope.NODE:
                scope_node = node

    def get_scope(self):
        return self.scope

    def set_scope(self, scope):
        self.scope = scope
