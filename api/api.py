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

class StudentByLevelAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        super(StudentByLevelAPI, self).__init__()
    
    def get(self, level):
        args = self.reqparse.parse_args()
        level = strtobool(level)
        return row_to_dict(db.session.query(Student).filter_by(level=level))

class SnapshotByIdYearSemesterWeekAPI(Resource): #student_id, year, semester, week
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        super(SnapshotByIdYearSemesterWeekAPI, self).__init__()
    
    def get(self, student_id, year, semester, week):
        query = db.session.query(Snapshot).filter_by(
            student_id=student_id,
            year=year,
            semester=semester,
            week=week
        )
        return snapshot_query_to_dict(query)

class SnapshotByIdYearSemesterAPI(Resource): #student_id, year, semester
    def get(self, student_id, year, semester):  
        query = db.session.query(Snapshot).filter_by(
            student_id=student_id,
            year=year,
            semester=semester
        )
        return snapshot_query_to_dict(query)

class SnapshotByIdYearAPI(Resource): #student_id, year
    def get(self, student_id, year):
        query = db.session.query(Snapshot).filter_by(
            student_id=student_id,
            year=year
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
def getAggregateDataFromQuery(query, agg=['min', 'max', 'avg', 'sum']):
    data = {}
    for r, row in enumerate(query):
        row_data = {}
        for i in range(len(agg)):
            if (type(query[0][i]) == Decimal):
                row_data[agg[i]] = str(row[i])
            else: 
                row_data[agg[i]] = row[i]
        data[r] = row_data
    return data

#def aggregate

class AggregateCourseStageAPI(Resource): #aggregated data for a whole course & stage e.g. Computer Science - Year 3
    def get(self, course_code, stage):
        pass

class AggregateCourseAPI(Resource): #aggregated data for a whole course e.g. Computer Science
    def get(self, course_code):
        #get list of students by their courses (like StudentByCourseAPI)
        student_list = student_query_to_dict(db.session.query(Student).filter_by(course_code=course_code)).keys()
        #get one expansive dictionary of snapshots for each student in student_list
        snapshot_dict = snapshot_query_to_dict(db.session.query(Snapshot).filter(Snapshot.student_id.in_(student_list)))

        insert_datetimes = [sd['insert_datetime'] for sd in snapshot_dict.values()] #used here purely as a unique identifier for individual snapshots that already exists in the db 
        
        query = db.session.query(
            func.min(Snapshot.teaching_attendance).filter(Snapshot.insert_datetime.in_(insert_datetimes)),
            func.max(Snapshot.teaching_attendance).filter(Snapshot.insert_datetime.in_(insert_datetimes)),
            func.avg(Snapshot.teaching_attendance).filter(Snapshot.insert_datetime.in_(insert_datetimes)),
            func.sum(Snapshot.teaching_attendance).filter(Snapshot.insert_datetime.in_(insert_datetimes))
        ).group_by(cast(Snapshot.insert_datetime, Date), Snapshot.week)
        for row in query:
            print(row)
        return getAggregateDataFromQuery(query)

# TODO: make a AverageCourseAPI which gets an average (e.g. attendance) of a course over time

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
api.add_resource(StudentByLevelAPI, '/api/student/level/<level>')
api.add_resource(StudentByIdAPI, '/api/student/student_id/<int:student_id>')

#TODO: bring snapshot endpoints more in line with student and course
api.add_resource(SnapshotByIdYearSemesterWeekAPI, '/api/snapshot/<int:student_id>/<int:year>/<semester>/<int:week>')
api.add_resource(SnapshotByIdYearSemesterAPI, '/api/snapshot/<int:student_id>/<int:year>/<semester>')
api.add_resource(SnapshotByIdYearAPI, '/api/snapshot/<int:student_id>/<int:year>')
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
    year = Column(Integer, nullable=False) # year of snapshot (e.g. 2023)
    semester = Column(String, nullable=False, default='Outside Teaching Time')  # Semester 'Autumn', or 'Spring' typically
    week = Column(String, nullable=False, default='0') # week of snapshot (e.g. Week 8, Spring Semester, 2023)
    insert_datetime = Column(DateTime, primary_key=True, nullable=False)
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
    level = Column(String, nullable=False) # True = Undergraduate, False = Postgraduate Taught
    stage = Column(Integer, nullable=False)
    course_code = Column(String, ForeignKey(Course.code), nullable=False) # course_code, One-To-One
    # Relationships
    snapshots = relationship('Snapshot', backref = 'Student')  # snapshots, One-To-Many
    course = relationship('Course', foreign_keys='Student.course_code')

upload_db = False
#upload_db = True #only uncomment to reupload the entire development dataset
if upload_db:
    with app.app_context():
        db.drop_all()
        db.create_all()
        db.session.commit()
        from excel_import import excel_to_db
        #excel_to_db('./sample_data.xlsx', db, 2017, 'Autumn', -1)
        excel_to_db('./sample_snapshot1.xlsx', db, 2017, 'Autumn', 3)
        excel_to_db('./sample_snapshot2.xlsx', db, 2017, 'Autumn', 6)
        excel_to_db('./sample_snapshot3.xlsx', db, 2017, 'Autumn', 9)
        excel_to_db('./sample_snapshot4.xlsx', db, 2017, 'Autumn', 11)

if __name__ == '__main__':
    app.run()
