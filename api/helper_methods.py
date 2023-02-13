## Helper Methods
import os
def get_absolute_path(relative):
    working_directory = os.path.dirname(__file__)
    return os.path.join(working_directory, relative)

# Convert SQLAlchemy Row Object to a Python Dictionary
def row_to_dict(row):
    return {column: str(getattr(row, column)) for column in row.__table__.c.keys()}