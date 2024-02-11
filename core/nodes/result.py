#!/usr/bin/env python3

from ..node import Node
import os

class Result(Node):
    TYPE = 'result'

    def __init__(self, inputs=None, position=None, id=None):
        if inputs == None: inputs = [{'name': 'text'}]
        super().__init__('Result', inputs, [], position, id)
        self.result = '# Result\n'

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
        i = 1
        for text in self.inputSockets['text'].fetch():
            if os.path.exists(text):
                with open(text) as f:
                    self.result += f'```\n{f.read()}\n```\n'
            else:
                self.result += f'{text}\n\n'
            i += 1

        return []
