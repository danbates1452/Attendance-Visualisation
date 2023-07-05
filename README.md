# Attendance-Visualisation
My Dissertation Project on *Attendance Monitoring Visualisation*, at the University of Sussex (2023).

Marks achieved:
- Interim Report: 68/100
- Project (Final Report and Codebase): 67/100
- Presentation: 66/100
- **Overall**: 67/100

See Section 8 (Conclusion) of the Final Report (under `/documents`), for a discussion of where this project did and did not meet its requirements.

## Abstract
This project investigates a prototype solution to the growing problem of tracking
university attendance. This is motivated by the link between attendance and
attainment in higher education, since keeping track of students who may be
falling behind and addressing the reasons for this, is likely to yield greater
attainment and improve student experience. There is currently no widely available
open-source attendance-tracker, nor an option widely in use for the University
of Sussex, as most solutions are bespoke tailored options hidden behind paywalls
and consulting. This project seeks to produce a three-tier application to store
attendance monitoring data for visualisation to key university attendance monitoring
staff. The projects objectives were generally achieved, but there is still further
work to be done in this area.
Functionality produced during this project includes a Flask API with a variety
of endpoints for retrieving attendance monitoring data from a PostgreSQL
Database, and a ReactJS Front-end that presents several visualisations and
options to filter this data.

## Installation
Note: Requires Node.js and Python3

In your terminal/OS of choice (though written for Windows CMD)...
1. Run ```npm install``` in the project directory to install dependencies from package.json.
2. Navigate to the '/api' subdirectory e.g. by using ```cd api```
3. Create a python virtual environment at '/api/venv' with ```python3 -m venv venv```
4. Activate your virtual environment by running ```./venv/Scripts/activate``` (```./venv/bin/activate``` for Unix systems)
5. Install all python dependencies into your virtual environment by running ```pip install -r requirements.txt```
6. Exit your virtual environment with a simple ```deactivate```

### Further steps
Create a configuration file for your Flask API in the following format, where a common 'APP' configuration stores common items, and subversions have differing attributes.
```
APP:
    secret_key: <value>
    SQLALCHEMY_TRACK_MODIFICATIONS: <value>
    SQLALCHEMY_POOL_RECYCLE: 300
    CACHE_TYPE: SimpleCache
    CACHE_DEFAULT_TIMEOUT: 60

APP_DEV:
    SQLALCHEMY_DATABASE_URI: <value>

APP_DEV_SERVICE:
    SQLALCHEMY_DATABASE_URI: <value>

APP_PROD:
    SQLALCHEMY_DATABASE_URI: <value>
```
## To Start
1. Open a terminal in the project's directory
2. Run `npm start` to start up the React Frontend Application
3. Run `npm run-script start-api` to start up the Flask Backend API
4. And that's it!
