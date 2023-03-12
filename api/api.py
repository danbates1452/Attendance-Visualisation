# Libraries
from flask import Flask, render_template, request
from flask_restful import Resource, Api, reqparse
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, BigInteger, Boolean, String, Date, DateTime, ForeignKey, cast
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import yaml
from distutils.util import strtobool
from flask_marshmallow import Marshmallow
import simplejson
from decimal import Decimal

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
ma = Marshmallow(app)

# TODO: Remember to use escape() on userinput to avoid XSS attacks
# TODO: figure out how to limit then number returned 
class APIResource(Resource): # TODO: experiment to see if we can avoid repetitive code by using a common superclass like this one
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        super(APIResource, self).__init__()

class StudentByIdAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        super(StudentByIdAPI, self).__init__()

    def get(self, student_id):
        #args = self.reqparse.parse_args()
        query = db.session.query(Student).filter_by(student_id=student_id).first()
        schema = StudentSchema()
        return schema.dump(query)
    
    def put(self, student_id):
        pass #TODO: check args for all required parts of a student

class StudentByCourseAPI(Resource):
    #Course Code, not title
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        super(StudentByCourseAPI, self).__init__()

    def get(self, course_code):
        args = self.reqparse.parse_args()
        return student_query_to_dict(db.session.query(Student).filter_by(course_code=course_code))

class StudentByStageAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        super(StudentByStageAPI, self).__init__()
    
    def get(self, stage):
        args = self.reqparse.parse_args()
        query = db.session.query(Student).filter_by(stage=stage)
        return student_query_to_dict(query)

class StudentByGradAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        super(StudentByGradAPI, self).__init__()
    
    def get(self, is_undergraduate):
        args = self.reqparse.parse_args()
        is_ug = strtobool(is_undergraduate)
        return row_to_dict(db.session.query(Student).filter_by(is_undergraduate=is_ug))

class SnapshotByIdStartEndAPI(Resource): #student_id, start_date, end_date
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        super(SnapshotByIdStartEndAPI, self).__init__()

    def get(self, student_id, start_date, end_date):
        args = self.reqparse.parse_args()      
        query = db.session.query(Snapshot).filter(
            db.Snapshot.student_id == student_id,
            db.Snapshot.date >= start_date,
            db.Snapshot.date <= end_date
        )
        return snapshot_query_to_dict(query)


class SnapshotByIdStartOnlyAPI(Resource): #student_id, start_date
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        super(SnapshotByIdStartOnlyAPI, self).__init__()

    def get(self, student_id, start_date):
        args = self.reqparse.parse_args()
        query = db.session.query(Snapshot).filter(
            db.Snapshot.student_id==student_id, 
            db.Snapshot.date == start_date
        )
        return snapshot_query_to_dict(query)

class SnapshotByIdOnlyAPI(Resource): #student_id
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        super(SnapshotByIdOnlyAPI, self).__init__()

    def get(self, student_id):
        args = self.reqparse.parse_args()
        query = db.session.query(Snapshot).filter_by(student_id=student_id)
        return snapshot_query_to_dict(query)


class CourseByCodeAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        super(CourseByCodeAPI, self).__init__()

    def get(self, code):
        args = self.reqparse.parse_args()
        return row_to_dict(db.session.query(Course).filter_by(code=code))

class CourseByTitleAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        super(CourseByTitleAPI, self).__init__()

    def get(self, title):
        args = self.reqparse.parse_args()
        return row_to_dict(db.session.query(Course).filter_by(title=title))

# Aggregate Functions: Strictly Read-Only
class AggregateCourseStageAPI(Resource): #aggregated data for a whole course & stage e.g. Computer Science - Year 3
    def get(self, course_code, stage):
        pass

class AggregateCourseAPI(Resource): #aggregated data for a whole course e.g. Computer Science
    def get(self, course_code):
        #get list of students by their courses (like StudentByCourseAPI)
        student_dict = student_query_to_dict(db.session.query(Student).filter_by(course_code=course_code)) 
        
        # return aggregate data for every column in Snapshot
        #query = db.session.query(
        #    func.min(Snapshot.teaching_attendance).filter(Snapshot.student_id.in_(student_dict.keys())).label('min'),
        #    func.max(Snapshot.teaching_attendance).filter(Snapshot.student_id.in_(student_dict.keys())).label('max'),
        #    func.avg(Snapshot.teaching_attendance).filter(Snapshot.student_id.in_(student_dict.keys())).label('avg'),
        #    func.count(Snapshot.teaching_attendance).filter(Snapshot.student_id.in_(student_dict.keys())).label('count')
        #)

        snapshot_dict = snapshot_query_to_dict(db.session.query(Snapshot).filter(Snapshot.student_id.in_(student_dict.keys())))
        
        query = db.session.query(
            func.min(Snapshot.teaching_attendance).filter(Snapshot.date.in_(snapshot_dict.keys())),
            func.max(Snapshot.teaching_attendance).filter(Snapshot.date.in_(snapshot_dict.keys())),
            func.avg(Snapshot.teaching_attendance).filter(Snapshot.date.in_(snapshot_dict.keys())),
            func.sum(Snapshot.teaching_attendance).filter(Snapshot.date.in_(snapshot_dict.keys()))
        ).group_by(cast(Snapshot.date, Date))

        for row in query:
            print(row)

        names = ['min', 'max', 'avg', 'sum']
        data = {}
        for i in range(len(names)):
            if (type(query[0][i]) == Decimal):
                data[names[i]] = str(query[0][i])
            else: 
                data[names[i]] = query[0][i]
        return data

class AggregateStageAPI(Resource): #aggregated data for a whole stage e.g. Year 3
    def get(self, stage):
        pass

class AggregateDepartmentAPI(Resource): #aggregated data for a whole department (group of degrees)
    def get(self, department):
        # department should be a list of degrees -> TODO: maybe make a table for this when you do UI
        pass

class AggregateSchoolAPI(Resource): #aggregated data for the whole school
    def get(self):
        #while only used in EngInf, just get all data
        pass

# NOTE: Make sure resource endpoints are unique
#filter student by course, stage, and graduate status
api.add_resource(StudentByCourseAPI, '/api/student/course/<course_code>') 
api.add_resource(StudentByStageAPI, '/api/student/stage/<int:stage>')
api.add_resource(StudentByGradAPI, '/api/student/is_undergraduate/<is_undergraduate>')
api.add_resource(StudentByIdAPI, '/api/student/student_id/<int:student_id>')

#TODO: bring snapshot endpoints more in line with student and course
api.add_resource(SnapshotByIdStartEndAPI, '/api/snapshot/<int:student_id>/<start_date>/<end_date>')
api.add_resource(SnapshotByIdStartOnlyAPI, '/api/snapshot/<int:student_id>/<start_date>')
api.add_resource(SnapshotByIdOnlyAPI, '/api/snapshot/<int:student_id>')

api.add_resource(CourseByCodeAPI, '/api/course/code/<code>')
api.add_resource(CourseByTitleAPI, '/api/course/title/<title>')

api.add_resource(AggregateCourseStageAPI, '/api/aggregate/course_stage/<course_code>/<stage>')
api.add_resource(AggregateCourseAPI, '/api/aggregate/course/<course_code>')
api.add_resource(AggregateStageAPI, '/api/aggregate/stage/<int:stage>')
api.add_resource(AggregateDepartmentAPI, '/api/aggregate/department/<department>')
api.add_resource(AggregateSchoolAPI, '/api/aggregate/school')
# TODO: add search endpoint for each to allow for querying/searches direct from frontend
# Database Setup
db = SQLAlchemy(app)

class Snapshot(db.Model):
    __tablename__ = "Snapshot"
    student_id = Column(Integer, ForeignKey("Student.student_id"), primary_key=True, nullable=False)
    date = Column(DateTime, primary_key=True, nullable=False)
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
    assessment_last = Column(Date) # Date of last Assessment
    # Academic Advising
    academic_advising_sessions = Column(Integer)  # Academic Advising Sessions Assigned
    academic_advising_attendance = Column(Integer)  # Academic Advising Attended
    academic_advising_explained_absence = Column(Integer) # Academic Advising Explained Absence
    academic_advising_absence = Column(Integer)  # Academic Advising Absence
    academic_advising_not_recorded = Column(Integer)  # Academic Advising Attendance Not Recorded
    academic_advising_last = Column(Date)  # Date of last Academic Advising session attended

    # Relationships
    # student = relationship("Student", back_populates = "snapshots")


class Course(db.Model):
    __tablename__ = "Course"
    code = Column(String, primary_key=True)
    title = Column(String, nullable=False)


class Student(db.Model):
    __tablename__ = 'Student'
    student_id = Column(BigInteger(), primary_key=True, nullable=False)  # doesn't need to autoincrement since we already have an id
    is_undergraduate = Column(Boolean, nullable=False) # True = Undergraduate, False = Postgraduate Taught
    stage = Column(Integer, nullable=False)
    course_code = Column(String, ForeignKey(Course.code), nullable=False) # course_code, One-To-One
    # Relationships
    snapshots = relationship('Snapshot', backref = 'Student')  # snapshots, One-To-Many
    course = relationship('Course', foreign_keys='Student.course_code')

with app.app_context():
    #db.drop_all()
    #db.create_all()
    #db.session.commit()
    #from excel_import import excel_to_db
    #excel_to_db('./sample_data.xlsx', db)
    pass

if __name__ == '__main__':
    app.run()
