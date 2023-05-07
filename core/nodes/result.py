#!/usr/bin/env python3

from ..node import Node

class Result(Node):
    TYPE = 'result'

    def __init__(self, inputs=None, position=None, id=None):
        if inputs == None: inputs = [{'name': 'text'}]
        super().__init__('Result', inputs, [], position, id)
        self.result = ''

    def set_scope(self, scope):
        self.scope = scope

    def to_dict(self):
        return {
            'type': Result.TYPE,
            'name': self.name,
            'inputs': self.inputs,
            'outputs': self.outputs,
            'position': self.position,
            'description': 'The result of scanning'
        }

    @staticmethod
    def from_dict(data):
        return Result(data['inputs'], data.get('position'), data.get('id'))

    def run(self):
        self.result = '# Result\n'
        i = 1
        for text in self.inputSockets['text'].fetch():
            self.result += f'## Subsection #{str(i)}\n'
            self.result += f'{text}\n'
            i += 1
