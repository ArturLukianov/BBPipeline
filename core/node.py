#!/usr/bin/env python3

class Node:
    TYPE = 'node'

    def __init__(self, name, inputs, outputs, position=None, id=None):
        self.name = name
        self.id = id
        self.inputs = inputs
        self.outputs = outputs
        self.position = position

    def to_dict(self):
        return {
            'type': Node.TYPE,
            'name': self.name,
            'inputs': self.inputs,
            'outputs': self.outputs,
            'position': self.position,
            'description': 'Abstract node'
        }

    @staticmethod
    def from_dict(data):
        return Node(data['name'], data['inputs'], data['outputs'], data.get('position'),
                    data.get('id'))



class CustomNode(Node):
    TYPE = 'custom'

    def __init__(self, name, command, inputs, outputs, position=None, id=None):
        super().__init__(name, inputs, outputs, position, id)
        self.command = command

    def to_dict(self):
        return {
            'type': CustomNode.TYPE,
            'name': self.name,
            'command': self.command,
            'inputs': self.inputs,
            'outputs': self.outputs,
            'position': self.position,
            'description': self.command
        }

    @staticmethod
    def from_dict(data):
        return CustomNode(data['name'], data['command'],
                          data['inputs'], data['outputs'], data.get('position'),
                          data.get('id'))
