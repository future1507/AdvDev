from flask  import Flask,jsonify,request
from flaskext.mysql import MySQL
import json
import pymysql
import datetime
import hashlib, binascii, os

app = Flask(__name__)

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
    result = request.get_json()
    pwd = getPasswordFromDB(result['UserID'])
    if verify_password(pwd,result['Password']) == True:
        cur = conn.cursor(pymysql.cursors.DictCursor)
        cur.execute("select * from User where UserID = %s",(result['UserID']))
        data = cur.fetchone()
        return jsonify(data)
    else :
        return 'Login Fail'


@app.route('/signup', methods=['POST'])
def Signup():
    date = datetime.datetime.now()
    sdate = str(date.year)+"-"+str(date.month)+"-"+str(date.day)
    conn = mysql.connect()
    result = request.get_json()
    pwd = hash_password(str(result['Password']))
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute(
        "Insert INTO User"+
        "(UserID,Password,Firstname,Lastname,Birthday,Signupdate)"+
        "values(%s,%s,%s,%s,%s,%s)",(str(result['UserID']),pwd,str(result['Firstname']),str(result['Lastname']),str(result['Birthday']),sdate))
    conn.commit()
    return 'Record Inserted Successfully'
    

##Get all
@app.route('/', methods=['GET'])
def UserAll():
    conn = mysql.connect()
    cur = conn.cursor() 
    cur.execute("select * from User")
    data = cur.fetchall()
    return jsonify(data)

##Get one
@app.route('/<string:userid>', methods=['GET'])
def User(userid):
    conn = mysql.connect()
    cur = conn.cursor() 
    cur.execute("select * from User where UserID = %s",(userid))
    data = cur.fetchall()
    return jsonify(data)

@app.route('/addpost', methods=['POST'])
def AddPost():
    date = datetime.datetime.now()
    conn = mysql.connect()
    result = request.get_json()
    postname = str(result['Postname'])
    postid = str(result['UserID'])+"?"+postname[0:3]+postname[-1]
    #postid = str(result['UserID'])
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute(
        "Insert INTO Post"+
        "(PostID,Postname,UserID,PostTime,Tag,Targetgroup)"+
        "values(%s,%s,%s,%s,%s,%s)",(postid,postname,str(result['UserID']),date,str(result['Tag']),str(result['Targetgroup'])))
    conn.commit()
    return 'Record Inserted Successfully'   

@app.route('/showpost/<string:userid>', methods=['GET'])
def ShowPost(userid):
    conn = mysql.connect()
    cur = conn.cursor() 
    cur.execute("select * from Post where UserID = %s ",(userid))
    data = cur.fetchall()
    return jsonify(data)


if __name__ == "__main__":
    #app.run(debug=True)    
    app.run(debug=True,port=1507,host='0.0.0.0')   