## Helper Methods
import os
from marshmallow import Schema, fields

def get_absolute_path(relative):
    working_directory = os.path.dirname(__file__)
    return os.path.join(working_directory, relative)

# Convert SQLAlchemy Row Object to a Python Dictionary
def row_to_dict(row):
    return {column: str(getattr(row, column)) for column in row.__table__.c.keys()}

def snapshot_query_to_dict(query):
    result = {}
    for row in query:
        date = row.date.isoformat()
        result[date] = row_to_dict(row)
    return result

def student_query_to_dict(query):
    result = {}
    for row in query:
        result[row.student_id] = row_to_dict(row)
    return result

def try_cast_int(i):
    if i is None:
        return None
    return int(i)

#Global Constants
#date_format = '%Y-%m-%d'

#Schemas - formalises how APIs should return table data

class Snapshot(Schema):
    student_id = fields.Int()
    date = fields.DateTime()
    registration_status = fields.Str()
    teaching_sessions = fields.Int()
    teaching_attendance = fields.Int()
    teaching_explained_absence = fields.Int()
    teaching_absence = fields.Int()
    teaching_last = date = fields.Date()
    # Assessments
    assessments = fields.Int()
    assessment_submission = fields.Int()
    assessment_explained_non_submission = fields.Int()
    assessment_non_submission = fields.Int()
    assessment_in_late_period = fields.Int()
    assessment_last = fields.Date()
    # Academic Advising
    academic_advising_sessions = fields.Int()
    academic_advising_attendance = fields.Int()
    academic_advising_explained_absence = fields.Int()
    academic_advising_absence = fields.Int()
    academic_advising_not_recorded = fields.Int()
    academic_advising_last = fields.Date()


class CourseSchema(Schema):
    code = fields.Str()
    title = fields.Str()

class StudentSchema(Schema):
    student_id = fields.Int()
    is_undergraduate = fields.Bool()
    stage = fields.Int()
    course_code = fields.Str()