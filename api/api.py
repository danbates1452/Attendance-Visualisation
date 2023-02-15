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

# TODO: Remember to use escape() on userinput to avoid XSS attacks

class APIResource(Resource): # TODO: experiment to see if we can avoid repetitive code by using a common superclass like this one
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        super(APIResource, self).__init__()

class StudentListAPI(Resource):
    def get(self):
        pass #TODO: figure out how to limit then number returned 

class StudentAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument

    def get(self, id):
        row = db.session.query(Student).filter_by(id=id)
        return json.dumps(row)

class SnapshotListAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('student_id', type=int, required=True)
        self.reqparse.add_argument('start_date', type=Date, required=True)
        self.reqparse.add_argument('end_date', type=Date)
        super(SnapshotListAPI, self).__init__()

    def get(self):
        args = self.reqparse.parse_args()
        if args.start_date and args.end_date:
            query = db.session.query(Snapshot).filter(
                db.Snapshot.student_id == args.student_id,
                db.Snapshot.date >= args.start_date,
                db.Snapshot.date <= args.end_date
            )
        elif args.start_date: #no end date provided, so looks at a single date
            query = db.session.query(Snapshot).filter(db.Snapshot.student_id==args.student_id, db.Snapshot.date == args.start_date)
        else:
            query = db.session.query(Snapshot).filter(db.Snapshot.student_id==args.student_id)
        return {query_to_dict(query)}
    
    def put(self, student_id, date):
        args = self.reqparse.parse_args()
        pass

class CourseListAPI(Resource):
    def __init__(self):
        pass # TODO: complete

class CourseAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        #self.reqparse.add_argument('code_or_title', type=str)
        pass

    def get(self):
        # TODO: decide if the input is a code or a title - check for whitespace

        pass
    

# NOTE: Make sure resource endpoints are unique
api.add_resource(StudentListAPI, '/student/course/<course_code>')
api.add_resource(StudentAPI, '/student/<int:id>')

api.add_resource(SnapshotListAPI, '/snapshot/<int:student_id>/<start_date>/<end_date>')

#api.add_resource(CourseAPI, '/course/<str:code_or_title>')
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
