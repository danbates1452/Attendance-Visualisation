# import data from excel, sanitize and ready it to be inserted into the database
# todo: allow a user to upload it within the application then insert it in
import pandas as pd
from sqlalchemy import insert, update
from datetime import datetime
def excel_to_db(filename, db):
    df = pd.read_excel(filename)
    # todo: Validation
    df.dropna(how='all')  # drop any fully empty rows

    studentTable, SnapshotTable, CourseTable = []

    for index, row in df.iterrows():
        # get all data regardless of table
        # name = row[index] #Original Name
        id = row[0] #User
        is_undergraduate = True if row[1] == "UG" else False #Level of Study
        course_year = row[2] #Year of Course
        registration_status = row[3] #Registration Status
        title = row[4] #Course Title
        code = row[5] #Course Code
        teaching_sessions = row[6] #Teaching Sessions
        teaching_attendance = row[7] #Attended
        teaching_explained_absence = row[8] #Explained Absences
        teaching_absence = row[9] #Non Attendance
        # row indices 10 and 11 are percentages that can be calculated on the fly
        teaching_last = row[12] #Last Attendance
        assessments = row[13] #Assessments
        assessment_submission = row[14] #Submitted
        assessment_explained_non_submission = row[15] #Explained Non-Submission
        assessment_non_submission = row[16] #Non Submission
        assessment_in_late_period = row[17] #Within Late Period Flag
        # row index 18 is a percentage
        academic_advising_sessions = row[19] #Academic Advising Sessions
        academic_advising_attendance = row[20] #Attended (AA)
        academic_advising_explained_absence = row[21] #Explained Non Attendances (AA)
        academic_advising_absence = row[22] #Non Attendances (AA)
        academic_advising_not_recorded = row[23] #Attendance Not Recorded (AA)
        # row index 24 is a percentage
        academic_advising_last = row[25] #Last Attended (AA)

        # todo: add checks if entries already exist
        if db.execute('SELECT Student FROM Student WHERE Student.id = ?', id):
            # Student already exists
            # So we update the existing student
            studentStatement = (
                update('Student').
                where().
                values()
            )
        else:
            # Student does not exist
            # So we insert a new row
            studentStatement = (
                insert('Student').
                values(

                )
            )




        db.session.add()
        db.session.commit()


        studentStatement = (
            insert('student'). # todo: how to add snapshot child table?
            values(id=id, is_undergraduate=is_undergraduate, course_year=course_year, course_year=code, snapshots=)
        )

        snapshotStatement = (
            insert('snapshot').
            values(
                student_id=id,
                date=datetime.now(),
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
                academic_advising_sessions=academic_advising_sessions,
                academic_advising_attendance=academic_advising_attendance,
                academic_advising_explained_absence=academic_advising_explained_absence,
                academic_advising_absence=academic_advising_absence,
                academic_advising_not_recorded=academic_advising_not_recorded,
                academic_advising_last=academic_advising_last,
            )
        )

        courseStatement = (
            insert('course').
            values(code=code, title=title)
        )

        
