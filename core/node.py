#!/usr/bin/env python3

class Node:

    def __init__(self, name, command, inputs, outputs, position=None, id=None):
        self.name = name
        self.id = id
        self.command = command
        self.inputs = inputs
        self.outputs = outputs
        self.position = position

    def to_dict(self):
        return {
            'name': self.name,
            'command': self.command,
            'inputs': self.inputs,
            'outputs': self.outputs,
            'position': self.position
        }
