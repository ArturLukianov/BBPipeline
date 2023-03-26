#!/usr/bin/env python3

from flask import Flask, send_from_directory, redirect

app = Flask(__name__)


@app.route('/<path>')
def public(path):
    return send_from_directory('public', path)

@app.route('/')
def index():
    return redirect('/index.html')
