# Libraries
from typing import List

from flask import Flask, render_template, request
from flask_restful import Resource, Api, reqparse
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, BigInteger, Boolean, String, Date, ForeignKey
from sqlalchemy.orm import relationship
import yaml
import json

# Project Modules
import pages
from helper_methods import *

# environment_type = 'dev'
environment_type = 'dev_service'
# environment_type = 'prod'


def get_config_list(path):
    with open(get_absolute_path(path), 'r') as stream:
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

api = Api(app)
parser = reqparse.RequestParser()
parser.add_argument('')

# todo: Remember to use escape() on userinput to avoid XSS attacks

class StudentList(Resource):
    def get(self):
        pass #TODO: figure out how to limit then number returned 

class Student(Resource):
    def get(self, id):
        row = db.session.query(Student).filter_by(id=id)
        return json.dumps(row)

class SnapshotList(Resource):
    def get(self, student_id):
        rows = db.session.query(Snapshot).filter_by(student_id=student_id)
        return json.dumps(row_to_dict(row) for row in rows)

class Snapshot(Resource):
    def get(self, student_id, date):
        return {}
    
    def put(self, student_id, date):
        args = parser.parse_args()
        pass


api.add_resource(SnapshotList, '/snapshot/<student_id>')
api.add_resource(Snapshot, '/snapshot/<student_id>/<date>')

@app.route('/student', methods=['GET'])
def get_student():
    args = request.args
    #return db.session.query(Student).filter_by(id=args.get('id')).first().__dict__
    row = db.session.query(Student).filter_by(id=args.get('id')).first()
    return row_to_dict(row)

# todo: sus out how I'm going to do all the different parameters etc that a snapshot endpoint could use -> look into Flask RESTful
@app.route('/snapshot', methods=['GET'])
def get_snapshot():
    args = request.args
    row = db.session.query(Snapshot).filter_by(student_id=args.get('student_id')).first()
    return {column: str(getattr(row, column)) for column in row.__table__.c.keys()}

# Database Setup
db = SQLAlchemy(app)

class Snapshot(db.Model):
    __tablename__ = "Snapshot"
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
    # student = relationship("Student", back_populates = "snapshots")


class Course(db.Model):
    __tablename__ = "Course"
    code = Column(String, primary_key=True)
    title = Column(String, nullable=False)


class Student(db.Model):
    __tablename__ = 'Student'
    id = Column(BigInteger(), primary_key=True, nullable=False)  # doesn't need to autoincrement since we already have an id
    is_undergraduate = Column(Boolean, nullable=False) # True = Undergraduate, False = Postgraduate Taught
    stage = Column(Integer, nullable=False)
    course_code = Column(String, ForeignKey(Course.code), nullable=False) # course_code, One-To-One
    # Relationships
    snapshots = relationship('Snapshot', backref = 'Student')  # snapshots, One-To-Many
    course = relationship('Course', foreign_keys='Student.course_code')

with app.app_context():
    #db.create_all()
    #from excel_import import excel_to_db
    #excel_to_db('./sample_data.xlsx', db)
    pass

if __name__ == '__main__':
    app.run()
