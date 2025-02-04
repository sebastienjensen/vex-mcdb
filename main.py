# Import libraries, modules
from flask import Flask
from flask_cors import CORS
import subprocess

# Initialise Flask app
app = Flask(__name__)
CORS(app)

# ROUTES

# Index, commit ID (short)
@app.route('/')
def index():
    commitId = subprocess.check_output(['git', 'rev-parse', '--short', 'HEAD']).strip().decode('utf-8')
    return f'vex-mcdb {commitId}'

# Run app
if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)