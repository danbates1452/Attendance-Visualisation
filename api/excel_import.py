# import data from excel, sanitize and ready it to be inserted into the database
# todo: allow a user to upload it within the application then insert it in
# external imports
import pandas as pd
import numpy as np
from datetime import datetime
from helper_methods import *
# NOTE: You must upload only ONE Snapshot at a time, as there is no way to tell them apart,
# and they will be treated as one snapshot, ignoring earlier entries if there is a later entry for the same
# student
def excel_to_db(filename, db):
    from api import Student, Snapshot, Course # avoiding mutual import issues by importing classes only here
    # todo: check if file exists - throw exception if not, or if there is an issue in reading
    df = pd.read_excel(get_absolute_path(filename))

    # todo: Validation
    df = df.dropna(how='all')  # drop any fully empty rows

    #df = df.fillna('N/A') # fill empty rows with 'N/A' to avoid NaN and NaT issues with insertion

    df = df.replace({float('nan'): 0, np.datetime64('nat'):'N/A'})

    #df = df.fillna(np.nan).replace([np.nan], [None]) # replace all 'Not A X' types with np.nan then None
    pd.set_option('display.max_columns', None)
    print(df.head(1))
    for index, row in df.iterrows():
        # get all data regardless of table
        # name = row[index] #Original Name

        student_id = int(row[0]) #User
        is_undergraduate = True if row[1] == "UG" else False #Level of Study
        stage = int(row[2]) #Year of Course
        registration_status = row[3] #Registration Status
        title = row[4] #Course Title
        code = row[5] #Course Code
        teaching_sessions = int(row[6]) #Teaching Sessions
        teaching_attendance = int(row[7]) #Attended
        teaching_explained_absence = int(row[8]) #Explained Absences
        teaching_absence = int(row[9]) #Non Attendance
        # row indices 10 and 11 are percentages that can be calculated on the fly
        teaching_last = row[12] #Last Attendance
        assessments = int(row[13]) #Assessments
        assessment_submission = int(row[14]) #Submitted
        assessment_explained_non_submission = int(row[15]) #Explained Non-Submission
        assessment_non_submission = int(row[16]) #Non Submission
        assessment_in_late_period = row[17] #Within Late Period Flag
        assessment_last = row[19]
        # row index 18 is a percentage
        academic_advising_sessions = int(row[20]) #Academic Advising Sessions
        academic_advising_attendance = int(row[21]) #Attended (AA)
        academic_advising_explained_absence = int(row[22]) #Explained Non Attendances (AA)
        academic_advising_absence = int(row[23]) #Non Attendances (AA)
        academic_advising_not_recorded = int(row[24]) #Attendance Not Recorded (AA)
        # row index 25 is a percentage
        academic_advising_last = row[26] #Last Attended (AA)

        date = datetime.now() # insertion date & time, for keeping track of snapshots

        # Adding Courses, Students, then Snapshots in that order
        # as Snapshots depend on a foreign key of Students which depends on a foreign key of Course

        # if course does not already exist
        if db.session.query(Course.code).filter_by(code=code, title=title).first() is None:
            new_course = Course(code=code, title=title)
            db.session.add(new_course)

        # Check if student exists already before either updating or creating anew
        if db.session.query(Student).filter_by(id=student_id).first() is not None:
            # Student already exists -> update existing student
            updated_student = db.session.query(Student).filter(id=student_id).first()
            updated_student.is_undergraduate = is_undergraduate
            updated_student.stage = stage
            updated_student.course_code = code

            db.session.add(updated_student)
        else:
            # Student does not exist -> create new student
            new_student = Student(
                id=student_id,
                is_undergraduate=is_undergraduate,
                stage=stage,
                course_code=code
            )
            db.session.add(new_student)

        # if snapshot does not already exist
        if db.session.query(Snapshot.student_id).filter_by(student_id=student_id, date=date).first() is None:
            new_snapshot = Snapshot(
                student_id=student_id,
                date=date,
                registration_status=registration_status,

                teaching_sessions=teaching_sessions,
                teaching_attendance=teaching_attendance,
                teaching_explained_absence=teaching_explained_absence,
                teaching_absence=teaching_absence,
                teaching_last=teaching_last,

                assessments=assessments,
                assessment_submission=assessment_submission,
                assessment_explained_non_submission=assessment_explained_non_submission,
                assessment_non_submission=assessment_non_submission,
                assessment_in_late_period=assessment_in_late_period,
                assessment_last=assessment_last,

                academic_advising_sessions=academic_advising_sessions,
                academic_advising_attendance=academic_advising_attendance,
                academic_advising_explained_absence=academic_advising_explained_absence,
                academic_advising_absence=academic_advising_absence,
                academic_advising_not_recorded=academic_advising_not_recorded,
                academic_advising_last=academic_advising_last,
            )

            db.session.add(new_snapshot)

        db.session.commit()  # Commit Changes to DB
        # todo: add a try-except here down the line
