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
def formatAggregateData(query, agg=['min', 'max', 'avg', 'sum']):
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

def getAggregateData(
        student_list,
        attributes={
            'teaching_sessions': Snapshot.teaching_sessions,
            'teaching_attendance': Snapshot.teaching_attendance, 
            'teaching_explained_absence': Snapshot.teaching_explained_absence,
            'teaching_absence': Snapshot.teaching_absence,
            'assessments': Snapshot.assessments,
            'assessment_submission': Snapshot.assessment_submission,
            'assessment_explained_non_submission': Snapshot.assessment_explained_non_submission,
            'assessment_non_submission': Snapshot.assessment_non_submission,
            'assessment_in_late_period': Snapshot.assessment_in_late_period,
            'academic_advising_sessions': Snapshot.academic_advising_sessions,
            'academic_advising_attendance': Snapshot.academic_advising_attendance,
            'academic_advising_explained_absence': Snapshot.academic_advising_explained_absence,
            'academic_advising_absence': Snapshot.academic_advising_absence,
            'academic_advising_not_recorded': Snapshot.academic_advising_not_recorded
        }):
    #get one expansive dictionary of snapshots for each student in student_list
    snapshot_dict = snapshot_query_to_dict(db.session.query(Snapshot).filter(Snapshot.student_id.in_(student_list)))

    insert_datetimes = [sd['insert_datetime'] for sd in snapshot_dict.values()] #used here purely as a unique identifier for individual snapshots that already exists in the db 
    
    output_dict = {}
    for name, attribute in attributes.items():
        query = db.session.query(
            func.min(attribute).filter(Snapshot.insert_datetime.in_(insert_datetimes)),
            func.max(attribute).filter(Snapshot.insert_datetime.in_(insert_datetimes)),
            func.avg(attribute).filter(Snapshot.insert_datetime.in_(insert_datetimes)),
            func.sum(attribute).filter(Snapshot.insert_datetime.in_(insert_datetimes))
        ).group_by(cast(Snapshot.insert_datetime, Date), Snapshot.week)
        output_dict[name] = formatAggregateData(query)
    return output_dict
    

class AggregateCourseStageAPI(Resource): #aggregated data for a whole course & stage e.g. Computer Science - Year 3
    def get(self, course_code, stage):
        student_list = student_query_to_dict(db.session.query(Student).filter_by(course_code=course_code, stage=stage)).keys()
        return getAggregateData(student_list)

class AggregateCourseAPI(Resource): #aggregated data for a whole course e.g. Computer Science
    def get(self, course_code):
        #get list of students by their courses (like StudentByCourseAPI)
        student_list = student_query_to_dict(db.session.query(Student).filter_by(course_code=course_code)).keys()
        return getAggregateData(student_list) 

class AggregateStageAPI(Resource): #aggregated data for a whole stage e.g. Year 3
    def get(self, stage):
        student_list = student_query_to_dict(db.session.query(Student).filter_by(stage=stage)).keys()
        return getAggregateData(student_list)

class AggregateDepartmentAPI(Resource): #aggregated data for a whole department (group of courses)
    def get(self, department):
        # department should be a list of degrees -> TODO: maybe make a table for this when you do UI

        '''
        code	title
        G5Q32T	Intel and Adap Sys
        H5001U	Elecl Eng and Elecc Eng
        H3006U	Mechanical Engineering
        G5001U	Computer Science
        H3002U	Mechanical Engineering
        H9001U	Eng (FDN)
        G41F0U	Comp Sci (IP)
        H7006U	Product Design (IP)
        H34F0U	Mechanical Engineering (IP)
        H3501T	Adv Mech Eng
        G45F0U	Comp for Dig Med (IP)
        G5020U	Computing for Digital Media
        GH561U	Computing for Bus and Mgmt
        H6008U	E and E Eng with Robotics IPY
        G44F0U	Comp for Bus and Mgmt (IP)
        H7003U	Product Design
        P4503T	Computing with Digital Media
        H9000T	Engineering Business Managemnt
        G5005U	Comp Sci and AI
        H6001U	Computer Engineering
        H5002U	Elecl Eng and Elecc Eng
        H3020U	Automotive Engineering (IP)
        G5511T	Mgmt of IT
        G41F1U	Comp Sci (IP)
        G5009U	Comp Sci (FDN)
        H7504T	IT with Bus and Mgmt
        H3014U	Automotive Engineering
        G42F0U	Comp Sci and AI (IP)
        G4010U	Computer Science
        H32F0U	Mechanical Engineering (IP)
        YY003U	V&E - Informatics
        H3025U	Automotive Engineering (IP)
        G46F0U	GAME (IP)
        H34F1U	Mechanical Engineering (IP)
        W2002U	Crtve Tech and Dgn with FY
        G5509T	Advanced Computer Science
        G5027U	GAME
        H3012U	Automotive Engineering
        G40F0U	Comp Sci (IP)
        H3019U	Automotive Engineering (IP)
        H3008U	Mechanical Engineering (YAB)
        H6009U	E and E Eng with Robotics
        H6517T	Robotics and Autonomous Sy
        H61F0U	Elecl Eng and Elecc Eng (IP)
        H6510T	Embedded Digital Systems
        H61F1U	Elecl Eng and Elecc Eng (IP)
        H6518T	Robotics and Autonomous System
        H35F0U	Mech Eng (IP Yr 4)
        H60F0U	Elecl Eng and Elecc Eng (IP)
        H6519T	Robotics and Autonomous System
        YY002U	V&E - Engineering and Design
        H7011U	Product Design (YAB)
        H6006U	Computer Engineering
        G5006U	Computer Science (YAB)
        H63F0U	Computer Engineering (IP)
        '''
        if department == 'informatics' or department == 'inf':
            course_list = [
                '',
                
            ]
        elif department == 'engineering' or department == 'eng':
            course_list = [
                
            ]
        else:
            return {'message': 'Invalid department'}
        student_list = student_query_to_dict(db.session.query(Student).filter(db.Student.course_code.in_(course_list)))
        return getAggregateData(student_list)

class AggregateSchoolAPI(Resource): #aggregated data for the whole school
    def get(self):
        #while only used in EngInf, just get all data
        student_list = student_query_to_dict(db.session.query(Student).all())
        return getAggregateData(student_list) 

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
api.add_resource(AggregateDepartmentAPI, '/api/aggregate/department/<department>') # whole departments - slow query
api.add_resource(AggregateSchoolAPI, '/api/aggregate/school') #whole school - VERY slow query
# TODO: add search endpoint for each to allow for querying/searches direct from frontend

### Database uploading / app boilerplate

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
