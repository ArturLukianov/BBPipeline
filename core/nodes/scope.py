#!/usr/bin/env python3

from ..node import Node

class Scope(Node):
    TYPE = 'scope'

    def __init__(self, outputs=None, position=None, id=None):
        if outputs == None: outputs = [{'name': 'domains'}]
        super().__init__('Scope', [], outputs, position, id)

    def set_scope(self, scope):
        self.scope = scope

    def to_dict(self):
        return {
            'type': Scope.TYPE,
            'name': self.name,
            'inputs': self.inputs,
            'outputs': self.outputs,
            'position': self.position,
            'description': 'List of domains, subdomains, IPs of target'
        }

    @staticmethod
    def from_dict(data):
        return Scope(data['outputs'], data.get('position'), data.get('id'))

    def run(self):
        for domain in self.scope:
            self.outputSockets['domains'].commit(domain)

        next_nodes = self.outputSockets['domains'].get_next_nodes()
        return next_nodes
