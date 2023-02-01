#Database Handling
from flask_sqlalchemy import SQLAlchemy


def setup_database(app, db_string):
    metadata_object = SQLAlchemy.MetaData()

    engine = SQLAlchemy.create_engine(db_string)

    for table_name in ['Student', 'Snapshot', 'Course']:
        if not engine.dialect.has_table(engine, table_name):
            metadata = SQLAlchemy.MetaData(engine)
            if table_name == 'Student':
                student = SQLAlchemy.Table(
                    'Student',
                    metadata,
                    SQLAlchemy.Column('id', SQLAlchemy.Integer, primary_key=True, nullable=False),
                    SQLAlchemy.Column('is_undergraduate', SQLAlchemy.Boolean, nullable=False),  # True = Undergraduate, False = Postgraduate Taught
                    SQLAlchemy.Column('course_year', SQLAlchemy.Integer, nullable=False),
                    SQLAlchemy.relationship(SQLAlchemy.Model, "Course"),  # course_code, Many-To-Many
                    SQLAlchemy.relationship(SQLAlchemy.Model, "Snapshot")  # snapshots, One-To-Many
                )
            elif table_name == 'Snapshot':
                snapshot = SQLAlchemy.Table(
                    'Snapshot',
                    metadata,
                    SQLAlchemy.Column('student_id', SQLAlchemy.Integer, SQLAlchemy.ForeignKey("student.id"), primary_key=True, nullable=False),
                    SQLAlchemy.Column('date', SQLAlchemy.Date, primary_key=True, nullable=False),
                    SQLAlchemy.Column('registration_status', SQLAlchemy.String),

                    SQLAlchemy.Column('teaching_sessions', SQLAlchemy.Integer),  # Teaching Sessions Assigned
                    SQLAlchemy.Column('teaching_attendance', SQLAlchemy.Integer),  # Teaching Sessions Attended
                    SQLAlchemy.Column('teaching_explained_absence', SQLAlchemy.Integer),  # Teaching Session Explained Absence
                    SQLAlchemy.Column('teaching_absence', SQLAlchemy.Integer),  # Teaching Session Unexplained Absence
                    SQLAlchemy.Column('teaching_last', SQLAlchemy.Date),  # Date of last teaching session attendance

                    SQLAlchemy.Column('assessments', SQLAlchemy.Integer),  # Assessments Assigned
                    SQLAlchemy.Column('assessment_submission', SQLAlchemy.Integer),  # Assessments Submitted
                    SQLAlchemy.Column('assessment_explained_non_submission', SQLAlchemy.Integer),  # Explained Unsubmitted Assessments
                    SQLAlchemy.Column('assessment_non_submission', SQLAlchemy.Integer),  # Unexplained Unsubmitted Assessments
                    SQLAlchemy.Column('assessment_in_late_period', SQLAlchemy.Integer),  # Submitted during Late Period

                    SQLAlchemy.Column('academic_advising_sessions', SQLAlchemy.Integer),  # Academic Advising Sessions Assigned
                    SQLAlchemy.Column('academic_advising_attendance', SQLAlchemy.Integer),  # Academic Advising Attended
                    SQLAlchemy.Column('academic_advising_explained_absence', SQLAlchemy.Integer),  # Academic Advising Explained Absence
                    SQLAlchemy.Column('academic_advising_absence', SQLAlchemy.Integer),  # Academic Advising Absence
                    SQLAlchemy.Column('academic_advising_not_recorded', SQLAlchemy.Integer),  # Academic Advising Attendance Not Recorded
                    SQLAlchemy.Column('academic_advising_last', SQLAlchemy.Integer),  # Date of last Academic Advising session attended
                )
            elif table_name == 'Course':
                course = SQLAlchemy.Table(
                    'Course',
                    metadata,
                    SQLAlchemy.Column('code', SQLAlchemy.String, primary_key=True),
                    SQLAlchemy.Column('title', SQLAlchemy.String)
                )

    return engine
