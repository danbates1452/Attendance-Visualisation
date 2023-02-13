from flask import render_template

import excel_import


def show_home():
    return render_template(
        'page.html',
        title='Attendance Visualisation'
    )

def show_import():
    pass  # todo: take in a file for import via react
    filepath = '../sample_data.xlsx'
    #excel_import.excel_to_db(filepath, db)


def show_login():
    pass