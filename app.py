import flask
from flask import Flask, render_template, request, flash
from flask_sqlalchemy import SQLAlchemy
import yaml

import database_handling

# environment_type = 'dev'
environment_type = 'dev_service'
# environment_type = 'prod'


def get_config_list(path):
    with open(path, 'r') as stream:
        try:
            return yaml.safe_load(stream)
        except yaml.YAMLError as exception:
            return exception


config = get_config_list('./config.yaml')

if isinstance(config, Exception):  # if config is not loaded successfully... run the app
    import sys

    sys.exit('Configuration Error:\n' + str(config))

app = Flask(__name__)

for key, value in config['APP']:  # loop through and add base configurations for the flask app
    app.config[key] = value

if config['APP' + environment_type.upper()]:  # if environment type has app config
    for key, value in config['APP' + environment_type.upper()]:  # loop through and add environment configurations
        app.config[key] = value

# dbpass = '5eVc9mFz4giY72'
# secret = ''
#
# app = Flask(__name__)
# app.secret_key = 'secret string'
#
# # Database Config
# db_string = 'postgresql://postgres:' + dbpass + '@localhost/flasksql'
# app.config['SQLALCHEMY_DATABASE_URI'] = db_string
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Database Setup
db = database_handling.setup_database(app, app.config['SQLALCHEMY_DATABASE_URI'])

with app.app_context():
    db.create_all()


# todo: Remember to use escape() on userinput to avoid XSS attacks
@app.route('/')
def home():
    return flask.render_template(
        'index.html',
        title='Attendance Visualisation'
    )


@app.route('import')
def import_handler():
    # todo: take in a file for import via react
    e
    pass

@app.route('/login')
def loginHandler():
    pass


if __name__ == '__main__':
    # db.create_all()
    app.run()
