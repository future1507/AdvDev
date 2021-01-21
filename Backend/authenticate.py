import json
import jwt
from flask import Flask, request
from flask_cors import CORS

flask_app = Flask(__name__)
CORS(flask_app)

SECRET_KEY = "781f00adac61902359fb34caf3214af0a8738f20e347e1c10f00e0d23ce175d7"
#SECRET_KEY = "1507"

def token_required(something):
    def wrap(*args, **kwargs):
        try:
            token_passed = request.headers['TOKEN']
            if request.headers['TOKEN'] != '' and request.headers['TOKEN'] != None:
                try:
                    data = jwt.decode(token_passed,SECRET_KEY, algorithms=['HS256'])
                    return something(*args, **kwargs)
                except jwt.exceptions.ExpiredSignatureError:
                    return_data = {
                        "error": "1",
                        "message": "Token has expired"
                        }
                    return flask_app.response_class(response=json.dumps(return_data), mimetype='application/json'),401
                except:
                    return_data = {
                        "error": "1",
                        "message": "Invalid Token"
                    }
                    return flask_app.response_class(response=json.dumps(return_data), mimetype='application/json'),401
            else:
                return_data = {
                    "error" : "2",
                    "message" : "Token required",
                }
                return flask_app.response_class(response=json.dumps(return_data), mimetype='application/json'),401
        except Exception as e:
            return_data = {
                "error" : "3",
                "message" : "An error occured"
                }
            return flask_app.response_class(response=json.dumps(return_data), mimetype='application/json'),500

    return wrap