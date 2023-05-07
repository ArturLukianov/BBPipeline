#!/usr/bin/env python3

from .socket import InputSocket, OutputSocket, Socket, get_socket
import subprocess
import string
import random


class Node:
    TYPE = 'node'

    def __init__(self, name, inputs, outputs, position=None, id=None):
        self.name = name
        self.id = id
        self.inputs = inputs
        self.outputs = outputs
        self.position = position

        self.inputSockets = {}
        self.outputSockets = {}

        for input_data in self.inputs:
            self.inputSockets[input_data['name']] = InputSocket(input_data['name'],
                                                                self,
                                                                input_data.get('id'))

        for output_data in self.outputs:
            self.outputSockets[output_data['name']] = OutputSocket(output_data['name'],
                                                                   self,
                                                                   output_data.get('id'))

    def wire_connections(self):
        for output_data in self.outputs:
            for connection in output_data.get('connections', []):
                connect_to = get_socket(connection)
                self.outputSockets[output_data['name']].add_connection(connect_to)


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

    def run(self):
        pass

    def get_next_nodes(self):
        return []



def random_output_name(output_name):
    return output_name + '_' + ''.join([random.choice(string.ascii_lowercase) for _ in range(16)])

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

    def run(self):
        prepared_command = self.command
        for input_name in self.inputSockets:
            if self.inputSockets[input_name].hasData():
                prepared_command = prepared_command.replace(f'<{input_name}>', next(self.inputSockets[input_name].fetch()))
            else: return []

        output_files = {}
        for output_name in self.outputSockets:
            output_filename = random_output_name(output_name)
            output_files[output_name] = output_filename
            prepared_command = prepared_command.replace(f'<:{output_name}>', output_filename)

        print(prepared_command)
        return []
        # subprocess.check_output(self.command)
