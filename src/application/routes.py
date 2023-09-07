from flask import jsonify, render_template, request
from application import app
from werkzeug.utils import secure_filename

import json 
with open("src/application/static/data/penguins.json", "r") as fdata:
    data = json.load(fdata)

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html', title='template', data=data)


@app.route('/about')
def about():
    return render_template('about.html', title='template')

