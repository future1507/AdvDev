from flask  import Flask,jsonify,request,send_file,redirect, url_for,flash
from flaskext.mysql import MySQL
from flask_cors import CORS
import json
import pymysql
import datetime
import hashlib, binascii, os
import jwt
import datetime
from authenticate import token_required
import base64
from werkzeug.utils import secure_filename
from random import randrange


SECRET_KEY = "781f00adac61902359fb34caf3214af0a8738f20e347e1c10f00e0d23ce175d7"
#SECRET_KEY = "1507"
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}
UPLOAD_FOLDER = '/home/future/img/'


app = Flask(__name__)
CORS(app)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
mysql = MySQL()
app.config['MYSQL_DATABASE_HOST'] = '203.154.83.62'
app.config['MYSQL_DATABASE_USER'] = 'future'
app.config['MYSQL_DATABASE_PASSWORD'] = '1507'
app.config['MYSQL_DATABASE_DB'] = 'db_future'

mysql.init_app(app)

##conn = mysql.connect()
##cursor = conn.cursor()       

def getPasswordFromDB(userid):
    conn = mysql.connect()
    cur = conn.cursor() 
    cur.execute("select * from User where UserID = %s",(userid))
    data = cur.fetchone()
    return str(data[1])

def hash_password(password):
    """Hash a password for storing."""
    salt = hashlib.sha256(os.urandom(60)).hexdigest().encode('ascii')
    pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), 
                                salt, 100000)
    pwdhash = binascii.hexlify(pwdhash)
    return (salt + pwdhash).decode('ascii')
 
def verify_password(stored_password, provided_password):
    """Verify a stored password against one provided by user"""
    salt = stored_password[:64]
    stored_password = stored_password[64:]
    pwdhash = hashlib.pbkdf2_hmac('sha512', 
                                  provided_password.encode('utf-8'), 
                                  salt.encode('ascii'), 
                                  100000)
    pwdhash = binascii.hexlify(pwdhash).decode('ascii')
    return pwdhash == stored_password

@app.route('/login', methods=['POST'])
def Login():
    conn = mysql.connect()
    #result = request.get_json()
    result = request.get_json(force=True)
    pwd = getPasswordFromDB(result['UserID'])
    if verify_password(pwd,result['Password']) == True:
        timeLimit= datetime.datetime.utcnow() + datetime.timedelta(minutes=300) #set limit for user
        payload = {"user_id": str(result['UserID']),"exp":timeLimit}
        token = jwt.encode(payload,SECRET_KEY)
        print(str(result['UserID']))
        return_data = {
            "UserID" : str(result['UserID']),
            "error": "0",
            "message": "Successful",
            "token": token.decode("UTF-8"),
            "Elapse_time": str(timeLimit)
        }
        return app.response_class(response=json.dumps(return_data), mimetype='application/json')
    else :

        return 'Login Fail'


@app.route('/signup', methods=['POST'])
def Signup():
    conn = mysql.connect()
    date = datetime.datetime.now()
    sdate = str(date.year)+"-"+str(date.month)+"-"+str(date.day)
    result = request.get_json(force=True)
    pwd = hash_password(str(result['Password']))
    #pwd = str(result['Password'])
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute(
        "Insert INTO User"+
        "(UserID,Password,Firstname,Lastname,Birthday,Signupdate)"+
        "values(%s,%s,%s,%s,%s,%s)",(str(result['UserID']),pwd,str(result['Firstname']),str(result['Lastname']),str(result['Birthday']),sdate))
    conn.commit()
    path = 'img/'+str(result['UserID'])
    try:   
        os.makedirs(path)
    except OSError:
        if os.path.exists(path):
            pass
        print ("Creation of the directory %s failed" % path)
    else:
        raise
        #print ("Successfully created the directory %s " % path)
        
    return jsonify('Record Inserted Successfully')

@app.route('/editprofile', methods=['POST'],endpoint='Edprofile')
@token_required
def EditProfile():
    conn = mysql.connect()
    result = request.get_json(force=True)
    profileimg = None
    if result['Profileimg'] != None:
        profileimg = str(result['Profileimg'])
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute("UPDATE User SET Firstname=%s,Lastname=%s,Birthday=%s,Profileimg=%s WHERE UserID =%s",
    (result['Firstname'],result['Lastname'],result['Birthday'],profileimg,result['UserID']))
    conn.commit()
    return jsonify('Record Update Successfully')

@app.route('/choosetag', methods=['POST'],endpoint='choosetag123')
#@token_required
def ChooseTag():
    conn = mysql.connect()
    result = request.get_json(force=True)
    cur = conn.cursor(pymysql.cursors.DictCursor)
    tag = [None,None,None,None,None]
    if result['Tag1'] != None:
        tag[0] = str(result['Tag1'])
    if result['Tag2'] != None:
        tag[1] = str(result['Tag2'])
    if result['Tag3'] != None:
        tag[2] = str(result['Tag3'])
    if result['Tag4'] != None:
        tag[3] = str(result['Tag4'])
    if result['Tag5'] != None:
        tag[4] = str(result['Tag5'])
    cur.execute("UPDATE User SET `Tag1`=%s,`Tag2`=%s,`Tag3`=%s,`Tag4`=%s,`Tag5`=%s WHERE UserID =%s",(tag[0],tag[1],tag[2],tag[3],tag[4],result['UserID']))
    conn.commit()
    return jsonify('Record Update Successfully')

##Get all
@app.route('/', methods=['GET'])
def UserAll():
    conn = mysql.connect()
    cur = conn.cursor() 
    cur.execute("select * from User")
    data = cur.fetchall()
    return jsonify(data)

#Get one
@app.route('/<string:userid>', methods=['GET'],endpoint='User')
@token_required
def User(userid):
    conn = mysql.connect()
    cur = conn.cursor(pymysql.cursors.DictCursor) 
    cur.execute("SELECT `Firstname`, `Lastname`, `Birthday`, `Tag1`, `Tag2`, `Tag3`,`Tag4`,`Tag5`,`Profileimg` FROM User WHERE UserID = %s",(str(userid)))
    data = cur.fetchall()
    return jsonify(data)

@app.route('/newstory', methods=['POST'],endpoint='addstory')
@token_required
def AddnewStory():
    coverphoto = None
    desc = None
   
    date = datetime.datetime.now()
    conn = mysql.connect()
    result = request.get_json(force=True)
    postname = str(result['Storyname'])
    #postname = 'กางแต๊ด'
    postid = str(result['UserID'])+"?"+postname[0:5]
    print(postid)
    if result['Coverphoto'] != None:
        coverphoto = str(result['Coverphoto'])
    if result['StoryDesc'] != None:
        desc = str(result['StoryDesc'])
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute(
        "Insert INTO Story"+
        "(StoryID,Storyname,Section,UserID,StoryTime,Tag,Targetgroup,StoryDesc,Coverphoto)"+
        "values(%s,%s,%s,%s,%s,%s,%s,%s,%s)",(postid,postname,1,str(result['UserID']),
        date,result['Tag'],str(result['Targetgroup']),desc,coverphoto))
    conn.commit()
    return 'Record Inserted Successfully'   

@app.route('/story', methods=['POST'],endpoint='story')
@token_required
def ContinueStory():
    coverphoto = None
    desc = None
   
    date = datetime.datetime.now()
    conn = mysql.connect()
    result = request.get_json(force=True)
    postname = str(result['Storyname'])
    #postname = 'กางแต๊ด'
    postid = str(result['UserID'])+"?"+postname[0:5]
    #print(postid)
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute("SELECT MAX(Section) AS Recentsection FROM Story where StoryID = %s",(postid))
    data = cur.fetchone()
    # print('========================')
    # print(int(data['Recentsection']))
    # return int(data['Recentsection'])
    section = int(data['Recentsection'])+1

    if result['Coverphoto'] != None:
        coverphoto = str(result['Coverphoto'])
    if result['StoryDesc'] != None:
        desc = str(result['StoryDesc'])
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute(
        "Insert INTO Story"+
        "(StoryID,Storyname,Section,UserID,StoryTime,Tag,Targetgroup,StoryDesc,Coverphoto)"+
        "values(%s,%s,%s,%s,%s,%s,%s,%s,%s)",(postid,postname,section,str(result['UserID']),
        date,result['Tag'],str(result['Targetgroup']),desc,coverphoto))
    conn.commit()
    return 'Record Inserted Successfully' 

@app.route('/showpost/<string:userid>', methods=['GET'])
def ShowPost(userid):
    conn = mysql.connect()
    cur = conn.cursor() 
    cur.execute("select * from Post where UserID = %s ",(userid))
    data = cur.fetchall()
    return jsonify(data)


folder = ''
@app.route('/upload', methods=['POST'],endpoint = 'Upload')
def upload_file():
    userid = request.form['userid']
    if request.form['folder'] != None:
        folder = request.form['folder']
    if request.method == 'POST':
        if 'file' not in request.files:
            print("1")
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            print("2")
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            number = ""
            for i in range(40):
                number += str(randrange(10))
            filename = (secure_filename(file.filename)).split(".")
            if len(filename) == 2:
                filename = filename[1]
            else:
                filename = filename[0]

            if folder == 'profile':
                file.save(os.path.join(app.config['UPLOAD_FOLDER']+"/profile", number+".jpg"))
                conn = mysql.connect()
                cur = conn.cursor(pymysql.cursors.DictCursor)
                cur.execute("UPDATE User SET Profileimg = %s where Userid = %s",(number,userid))
                conn.commit()
            else:
                file.save(os.path.join(app.config['UPLOAD_FOLDER']+userid, number+".jpg"))
            resp = jsonify(number)
            resp.headers['Access-Control-Allow-Origin'] = '*'
            resp.content_type = "application/json"
            return resp

    resp = jsonify("Error")
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.content_type = "application/json"
    return resp

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/img/profile/<filename>', methods=['GET'])
def photoProfile(filename):
    return send_file("img/profile/"+filename+".jpg")


if __name__ == "__main__":
    #8app.run(debug=True)    
    app.run(debug=True,port=1507,host='0.0.0.0')   