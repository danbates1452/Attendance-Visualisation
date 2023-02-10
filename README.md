# Attendance-Visualisation
My Dissertation Project on *Attendance Monitoring Visualisation*, at the University of Sussex (2023).

## Motivations
As university attendance rates continue to soar, the number of staff checking up on student attendance has stayed roughly the same. Sussex experiences this just as much as other universities, and as such, there is space/need for more powerful tool to visualise and filter attendance data.

## Installation
Note: Requires Node.js and Python3
1. Run ```npm install``` in the project directory to install dependencies from package.json.
2. Navigate to the '/api' subdirectory e.g. by using ```cd api```
3. Create a python virtual environment at '/api/venv' with ```python3 -m venv venv```
4. Install all python dependencies by running ```pip install -r requirements.txt```

### Further steps
Create a configuration file for your Flask API in the following format, where a common 'APP' configuration stores common items, and subversions have differing attributes.
```
APP:
    secret_key: <value>
    SQLALCHEMY_TRACK_MODIFICATIONS: <value>

APP_DEV:
    SQLALCHEMY_DATABASE_URI: <value>

APP_DEV_SERVICE:
    SQLALCHEMY_DATABASE_URI: <value>

APP_PROD:
    SQLALCHEMY_DATABASE_URI: <value>
```
## To Start (from project directory)
React Application: `npm start`

Flask API: `npm run-script start-api`
