# Libraries
from typing import List

import flask
from flask import Flask, render_template, request
import yaml
from flask_sqlalchemy import SQLAlchemy

from sqlalchemy import Column, Integer, Boolean, String, Date, ForeignKey, ForeignKeyConstraint, Table
from sqlalchemy.orm import relationship, Mapped
import os

# Project Modules
import excel_import
import pages

# environment_type = 'dev'
environment_type = 'dev_service'
# environment_type = 'prod'


def get_config_list(path):
    working_directory = os.path.dirname(__file__)
    path = os.path.join(working_directory, path)
    with open(path, 'r') as stream:
        try:
            return yaml.safe_load(stream)
        except yaml.YAMLError as exception:
            return exception


config = get_config_list('./config.yaml') # local path will be translated in function

if isinstance(config, Exception):  # if config is not loaded successfully... exit with exception
    import sys
    sys.exit('Configuration Error:\n' + str(config))

app = Flask(__name__)

for key, value in config['APP'].items():  # loop through and add base configurations for the flask app
    app.config[key] = value

if config['APP_' + environment_type.upper()]:  # if environment type has app config
    for key, value in config['APP_' + environment_type.upper()].items():  # loop through and add environment configurations
        app.config[key] = value

# todo: Remember to use escape() on userinput to avoid XSS attacks
@app.route('/')
def home_get():
    return pages.show_home()


@app.route('/import')
def import_get():
    return pages.show_import()


@app.route('/login')
def login_get():
    return pages.show_login()

# Database Setup
db = SQLAlchemy(app)

with app.app_context():
    db.create_all()


class Snapshot(db.Model):
    student_id = Column(Integer, ForeignKey("Student.id"), primary_key=True, nullable=False)
    date = Column(Date, primary_key=True, nullable=False)
    registration_status = Column(String)
    # Teaching
    teaching_sessions = Column(Integer)  # Teaching Sessions Assigned
    teaching_attendance = Column(Integer)  # Teaching Sessions Attended
    teaching_explained_absence = Column(Integer)  # Teaching Session Explained Absence
    teaching_absence = Column(Integer)  # Teaching Session Unexplained Absence
    teaching_last = Column(Date)  # Date of last teaching session attendance
    # Assessments
    assessments = Column(Integer)  # Assessments Assigned
    assessment_submission = Column(Integer)  # Assessments Submitted
    assessment_explained_non_submission = Column(Integer) # Explained Unsubmitted Assessments
    assessment_non_submission = Column(Integer)  # Unexplained Unsubmitted Assessments
    assessment_in_late_period = Column(Integer)  # Submitted during Late Period
    # Academic Advising
    academic_advising_sessions = Column(Integer)  # Academic Advising Sessions Assigned
    academic_advising_attendance = Column(Integer)  # Academic Advising Attended
    academic_advising_explained_absence = Column(Integer) # Academic Advising Explained Absence
    academic_advising_absence = Column(Integer)  # Academic Advising Absence
    academic_advising_not_recorded = Column(Integer)  # Academic Advising Attendance Not Recorded
    academic_advising_last = Column(Integer)  # Date of last Academic Advising session attended

    # Relationships
    student = relationship("Student", back_populates = "Snapshots")


class Course(db.Model):
    __tablename__ = "Course"
    code = Column(String, primary_key=True)
    title = Column(String, nullable=False)


class Student(db.Model):
    __tablename__ = 'Student'
    id = Column(Integer, primary_key=True, nullable=False)  # doesn't need to autoincrement since we already have an id
    is_undergraduate = Column(Boolean, nullable=False) # True = Undergraduate, False = Postgraduate Taught
    stage = Column(Integer, nullable=False)
    course_code = Column(Integer, ForeignKey(Course.code), nullable=False) # course_code, One-To-One
    # Relationships
    snapshots = relationship('Snapshot', back_populates = 'Student')  # snapshots, One-To-Many
    course = relationship('Course', foreign_keys='Student.course_code')


if __name__ == '__main__':
    # db.create_all()
    app.run()
