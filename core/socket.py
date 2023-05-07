#!/usr/bin/env python3

from queue import Queue


SOCKETS = dict()


def get_socket(id):
    return SOCKETS.get(id)


class Socket:
    def __init__(self, name, node, id=None):
        global SOCKETS
        self.name = name
        self.node = node
        self.id = id

        SOCKETS[self.id] = self




class OutputSocket(Socket):
    def __init__(self, name, node, id=None):
        super().__init__(name, node, id)
        self.connections = []

    def commit(self, data):
        for connection in self.connections:
            connection.receive(data)

    def add_connection(self, connection):
        self.connections.append(connection)

    def get_next_nodes(self):
        next_nodes = []
        for connection in self.connections:
            next_nodes.append(connection.node)
        return next_nodes


class InputSocket(Socket):
    def __init__(self, name, node, id=None):
        super().__init__(name, node, id)
        self.queue = Queue()

    def receive(self, data):
        self.queue.put(data)

    def fetch(self):
        yield self.queue.get()

    def hasData(self):
        return not self.queue.empty()
