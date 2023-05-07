#!/usr/bin/env python3

from .node import Node
from .nodes.scope import Scope
from queue import Queue

class Profile:
    def __init__(self, nodes):
        self.nodes = nodes
        self.scope = []
        self.current_node = None

    def to_dict(self):
        return {
            'nodes': [node.to_dict() for node in self.nodes],
        }

    def run(self):
        scope_node = None
        for node in self.nodes:
            if node.TYPE == Scope.TYPE:
                scope_node = node

        scope_node.set_scope(self.scope)

        node_queue = Queue()
        node_queue.put(scope_node)
        while not node_queue.empty():
            self.current_node = node_queue.get()
            print(self.current_node)
            next_nodes = self.current_node.run()
            for node in next_nodes:
                node_queue.put(node)

    def wire_connections(self):
        for node in self.nodes:
            node.wire_connections()

    def get_scope(self):
        return self.scope

    def set_scope(self, scope):
        self.scope = scope
