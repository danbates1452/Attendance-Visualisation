# Libraries
from typing import List

import flask
from flask import Flask, render_template, request
import yaml
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, Boolean, String, ForeignKey, ForeignKeyConstraint, Table
from sqlalchemy.orm import relationship, Mapped

# Project Modules
import excel_import
import pages

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

if isinstance(config, Exception):  # if config is not loaded successfully... exit with exception
    import sys
    sys.exit('Configuration Error:\n' + str(config))

app = Flask(__name__)

for key, value in config['APP']:  # loop through and add base configurations for the flask app
    app.config[key] = value

if config['APP' + environment_type.upper()]:  # if environment type has app config
    for key, value in config['APP' + environment_type.upper()]:  # loop through and add environment configurations
        app.config[key] = value

# todo: Remember to use escape() on userinput to avoid XSS attacks
@app.route('/')
def home_get():
    return pages.show_home()


@app.route('import')
def import_get():
    return pages.show_import()


@app.route('/login')
def login_get():
    return pages.show_login()

# Database Setup
metadata_object = SQLAlchemy.MetaData()
engine = SQLAlchemy.create_engine(app.config['SQLALCHEMY_DATABASE_URI'])

with app.app_context():
    engine.create_all()


class Snapshot(engine):
    student = relationship("Student", back_populates = "Snapshots")
        student_id = (Integer, ForeignKey("student.id"), primary_key=True,
                          nullable=False),
        SQLAlchemy.Column('date', SQLAlchemy.Date, primary_key=True, nullable=False),
        SQLAlchemy.Column('registration_status', SQLAlchemy.String),

        SQLAlchemy.Column('teaching_sessions', SQLAlchemy.Integer),  # Teaching Sessions Assigned
        SQLAlchemy.Column('teaching_attendance', SQLAlchemy.Integer),  # Teaching Sessions Attended
        SQLAlchemy.Column('teaching_explained_absence', SQLAlchemy.Integer),  # Teaching Session Explained Absence
        SQLAlchemy.Column('teaching_absence', SQLAlchemy.Integer),  # Teaching Session Unexplained Absence
        SQLAlchemy.Column('teaching_last', SQLAlchemy.Date),  # Date of last teaching session attendance

        SQLAlchemy.Column('assessments', SQLAlchemy.Integer),  # Assessments Assigned
        SQLAlchemy.Column('assessment_submission', SQLAlchemy.Integer),  # Assessments Submitted
        SQLAlchemy.Column('assessment_explained_non_submission', SQLAlchemy.Integer),
        # Explained Unsubmitted Assessments
        SQLAlchemy.Column('assessment_non_submission', SQLAlchemy.Integer),  # Unexplained Unsubmitted Assessments
        SQLAlchemy.Column('assessment_in_late_period', SQLAlchemy.Integer),  # Submitted during Late Period

        SQLAlchemy.Column('academic_advising_sessions', SQLAlchemy.Integer),  # Academic Advising Sessions Assigned
        SQLAlchemy.Column('academic_advising_attendance', SQLAlchemy.Integer),  # Academic Advising Attended
        SQLAlchemy.Column('academic_advising_explained_absence', SQLAlchemy.Integer),
        # Academic Advising Explained Absence
        SQLAlchemy.Column('academic_advising_absence', SQLAlchemy.Integer),  # Academic Advising Absence
        SQLAlchemy.Column('academic_advising_not_recorded', SQLAlchemy.Integer),
        # Academic Advising Attendance Not Recorded
        SQLAlchemy.Column('academic_advising_last', SQLAlchemy.Integer),
        # Date of last Academic Advising session attended

association_table = Table(
    'association table',
    metadata_object,
    Column('left_id', ForeignKey('Student.id')),
    Column('right_id', ForeignKey('Course.code')),
)
class Course(engine):
    __tablename__ = "Course"
    code = Column(String, primary_key=True)
    title = Column(String, not_null=True)


class Student(engine):
    __tablename__ = 'Student'
    id = Column(Integer, primary_key=True, nullable=False)
    is_undergraduate = Column(Boolean, nullable=False) # True = Undergraduate, False = Postgraduate Taught
    course = Column(ForeignKeyConstraint, nullable=False), # course_code, Many-To-Many
    snapshots: Mapped[List[Snapshot]] = relationship(secondary=association_table) # snapshots, One-To-Many





if __name__ == '__main__':
    # db.create_all()
    app.run()
