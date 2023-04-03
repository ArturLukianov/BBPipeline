#!/usr/bin/env python3

from queue import Queue


class Socket:
    def __init__(self, name, node):
        self.name = name
        self.node = node



class OutputSocket(Socket):
    def __init__(self, name, node):
        super(name, node)
        self.connections = []

    def commit(self, data):
        for connection in self.connections:
            connection.receive(data)

    def add_connection(self, connection):
        self.connections.append(connection)


class InputSocket(Socket):
    def __init__(self, name, node):
        super(name, node)
        self.queue = Queue()

    def receive(self, data):
        self.queue.put(data)
