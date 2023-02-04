## Helper Methods
import os
def get_absolute_path(relative):
    working_directory = os.path.dirname(__file__)
    return os.path.join(working_directory, relative)