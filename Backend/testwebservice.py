from flask import Flask, jsonify, request, send_file, redirect, url_for, flash
from flaskext.mysql import MySQL
from flask_cors import CORS
import json
import pymysql
import datetime
import hashlib
import binascii
import os
import jwt
import datetime
from authenticate import token_required
import base64
from werkzeug.utils import secure_filename
from random import randrange


SECRET_KEY = "781f00adac61902359fb34caf3214af0a8738f20e347e1c10f00e0d23ce175d7"
# SECRET_KEY = "1507"
ALLOWED_EXTENSIONS = {'webp', 'tif', 'png', 'jpg', 'jpeg', 'gif'}
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

# conn = mysql.connect()
# cursor = conn.cursor()


def checkNone(reqdata):
    if reqdata != None:
        return reqdata


def getPasswordFromDB(userid):
    conn = mysql.connect()
    cur = conn.cursor()
    cur.execute("select * from User where UserID = %s", (userid))
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


@app.route('/login', methods=['POST'], endpoint='logins')
def Login():
    conn = mysql.connect()
    # result = request.get_json()
    result = request.get_json(force=True)
    pwd = getPasswordFromDB(result['UserID'])
    if verify_password(pwd, result['Password']) == True:
        timeLimit = datetime.datetime.utcnow(
        ) + datetime.timedelta(minutes=300)  # set limit for user
        payload = {"user_id": str(result['UserID']), "exp": timeLimit}
        token = jwt.encode(payload, SECRET_KEY)
        print(str(result['UserID']))
        return_data = {
            "UserID": str(result['UserID']),
            "error": "0",
            "message": "Successful",
            "token": token.decode("UTF-8"),
            "Elapse_time": str(timeLimit)
        }
        return app.response_class(response=json.dumps(return_data), mimetype='application/json')
    else:

        return jsonify('Login Fail')


@app.route('/verifypassword', methods=['POST'], endpoint='verifypasswords')
@token_required
def Verify():
    conn = mysql.connect()
    # result = request.get_json()
    result = request.get_json(force=True)
    pwd = getPasswordFromDB(result['UserID'])
    if verify_password(pwd, result['Password']) == True:
        return jsonify('Correct Password')
    else:

        return jsonify('InCorrect Password')


@app.route('/signup', methods=['POST'], endpoint='signups')
def Signup():
    conn = mysql.connect()
    date = datetime.datetime.now()
    sdate = str(date.year)+"-"+str(date.month)+"-"+str(date.day)
    result = request.get_json(force=True)
    pwd = hash_password(str(result['Password']))
    # pwd = str(result['Password'])
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute(
        "Insert INTO User" +
        "(UserID,Password,Firstname,Lastname,Birthday,Signupdate)" +
        "values(%s,%s,%s,%s,%s,%s)", (str(result['UserID']), pwd, str(result['Firstname']), str(result['Lastname']), str(result['Birthday']), sdate))
    conn.commit()
    path = 'img/'+str(result['UserID'])
    try:
        os.makedirs(path)
    except OSError:
        if os.path.exists(path):
            pass
        print("Creation of the directory %s failed" % path)
    else:
        # raise
        print("Successfully created the directory %s " % path)

    return jsonify('Record Inserted Successfully')


@app.route('/editprofile', methods=['POST'], endpoint='Edprofile')
@token_required
def EditProfile():
    conn = mysql.connect()
    result = request.get_json(force=True)

    fname, lname, bday, udesc, country, skills, phone, mail, fb, twitter = None, None, None, None, None, None, None, None, None, None
    fname = checkNone(result['Firstname'])
    lname = checkNone(result['Lastname'])
    bday = checkNone(result['Birthday'])
    udesc = checkNone(result['UserDesc'])
    country = checkNone(result['Country'])
    skills = checkNone(result['Skills'])
    phone = checkNone(result['Phone'])
    mail = checkNone(result['Mail'])
    fb = checkNone(result['Facebook'])
    twitter = checkNone(result['Twitter'])

    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute("UPDATE User SET Firstname=%s,Lastname=%s,Birthday=%s,UserDesc=%s" +
                ",Country=%s,Skills=%s,Phone=%s,Mail=%s,Facebook=%s,Twitter=%s  WHERE UserID =%s",
                (fname, lname, bday, udesc, country, skills, phone, mail, fb, twitter, result['UserID']))
    conn.commit()
    return jsonify('Record Update Successfully')


@app.route('/choosetag', methods=['POST'], endpoint='choosetag123')
# @token_required
def ChooseTag():
    conn = mysql.connect()
    result = request.get_json(force=True)
    cur = conn.cursor(pymysql.cursors.DictCursor)
    tag = [None, None, None, None, None]
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
    cur.execute("UPDATE User SET `Tag1`=%s,`Tag2`=%s,`Tag3`=%s,`Tag4`=%s,`Tag5`=%s WHERE UserID =%s",
                (tag[0], tag[1], tag[2], tag[3], tag[4], result['UserID']))
    conn.commit()
    return jsonify('Record Update Successfully')

# Get all


@app.route('/', methods=['GET'])
def UserAll():
    conn = mysql.connect()
    cur = conn.cursor()
    cur.execute("select * from User")
    data = cur.fetchall()
    return jsonify(data)

# Get one


@app.route('/<string:userid>', methods=['GET'], endpoint='User')
@token_required
def User(userid):
    conn = mysql.connect()
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute("SELECT * FROM User WHERE UserID = %s", (str(userid)))
    data = cur.fetchall()
    return jsonify(data)


@app.route('/follow', methods=['POST'], endpoint='follows')
@token_required
def Follow():
    conn = mysql.connect()
    result = request.get_json(force=True)
    cur = conn.cursor(pymysql.cursors.DictCursor)
    if(result['choice'] == 'Followed'):
        cur.execute(
            "Insert INTO Subscribe " +
            "(UserID,FollowerID)" +
            "values(%s,%s)", (str(result['UserID']), str(result['FollowerID'])))
    elif(result['choice'] == 'Follow'):
        cur.execute(
            "DELETE FROM Subscribe " +
            "WHERE UserID = %s and FollowerID = %s", (str(result['UserID']), str(result['FollowerID'])))
    conn.commit()
    return jsonify('Record Update Successfully')


@app.route('/follow/<userid>', methods=['get'], endpoint='followss')
@token_required
def Follow(userid):
    conn = mysql.connect()
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute(
        "SELECT UserID as Follower from Subscribe WHERE UserID = %s", (str(userid)))
    conn.commit()
    follower = len(cur.fetchall())
    cur.execute(
        "SELECT FollowerID as Following from Subscribe WHERE FollowerID = %s", (str(userid)))
    conn.commit()
    following = len(cur.fetchall())
    returndata = {
        "Follower": str(follower),
        "Following": str(following)
    }
    return jsonify(returndata)


@app.route('/follower/<userid>', methods=['get'], endpoint='followers')
@token_required
def Follower(userid):
    conn = mysql.connect()
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute("SELECT FollowerID, User.Firstname, User.Lastname, User.Profileimg " +
                "FROM User, Subscribe " +
                "WHERE User.UserID=Subscribe.FollowerID " +
                "AND Subscribe.UserID=%s", (str(userid)))
    conn.commit()
    data = cur.fetchall()
    return jsonify(data)


@app.route('/following/<userid>', methods=['get'], endpoint='followings')
@token_required
def Following(userid):
    conn = mysql.connect()
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute("SELECT Subscribe.UserID, User.Firstname, User.Lastname, User.Profileimg " +
                "FROM User, Subscribe " +
                "WHERE User.UserID=Subscribe.UserID " +
                "AND Subscribe.FollowerID=%s", (str(userid)))
    conn.commit()
    data = cur.fetchall()
    return jsonify(data)


@app.route('/followed', methods=['Post'], endpoint='followed')
@token_required
def Followed():
    conn = mysql.connect()
    result = request.get_json(force=True)
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute("SELECT * from Subscribe WHERE UserID = %s and FollowerID = %s",
                (result['UserID'], result['FollowerID']))
    data = cur.fetchall()
    if(len(data) == 1):
        return jsonify('yes')
    else:
        return jsonify('no')


@app.route('/newstory', methods=['POST'], endpoint='addstory')
@token_required
def AddnewStory():
    coverphoto = None
    desc = None

    date = datetime.datetime.now()
    conn = mysql.connect()
    result = request.get_json(force=True)
    postname = str(result['Storyname'])
    # postname = 'กางแต๊ด'
    postid = ''
    for i in range(50):
        postid += str(randrange(10))
    print(postid)
    if result['Coverphoto'] != None:
        coverphoto = str(result['Coverphoto'])
    if result['StoryDesc'] != None:
        desc = str(result['StoryDesc'])
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute(
        "Insert INTO Story" +
        "(StoryID,Storyname,UserID,StoryTime,Tag,Targetgroup,StoryDesc,Coverphoto)" +
        "values(%s,%s,%s,%s,%s,%s,%s,%s)", (postid, postname, str(result['UserID']),
                                            date, result['Tag'], str(result['Targetgroup']), desc, coverphoto))
    conn.commit()
    path = 'img/'+str(result['UserID'])+'/'+postid
    try:
        os.makedirs(path)
    except OSError:
        if os.path.exists(path):
            pass
        print("Creation of the directory %s failed" % path)
    else:
        # raise
        print("Successfully created the directory %s " % path)

    return jsonify(postid)


@app.route('/editstory', methods=['POST'], endpoint='editstorys')
@token_required
def EditStory():
    conn = mysql.connect()
    result = request.get_json(force=True)

    storyname, tag, targetgroup, storydesc = None, None, None, None
    storyname = checkNone(result['Storyname'])
    tag = checkNone(result['Tag'])
    targetgroup = checkNone(result['Targetgroup'])
    storydesc = checkNone(result['StoryDesc'])

    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute("UPDATE Story SET Storyname=%s,Tag=%s,Targetgroup=%s,StoryDesc=%s " +
                "WHERE StoryID =%s",
                (storyname, tag, targetgroup, storydesc, result['StoryID']))
    conn.commit()
    return jsonify('Record Update Successfully')


@app.route('/editstoryname', methods=['POST'], endpoint='editstorynames')
@token_required
def EditStoryName():
    conn = mysql.connect()
    result = request.get_json(force=True)

    storyname = None
    storyname = checkNone(result['Storyname'])
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute("UPDATE Story SET Storyname=%s " +
                "WHERE StoryID =%s",
                (storyname, result['StoryID']))
    conn.commit()
    return jsonify('Record Update Successfully')


@app.route('/deletestory/<storyid>', methods=['get'], endpoint='deletepost')
@token_required
def DeleteStory(storyid):
    conn = mysql.connect()
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute(
        "DELETE FROM Story " +
        "WHERE StoryID = %s", (str(storyid)))
    conn.commit()
    return jsonify('Record Delete Successfully')


@app.route('/story', methods=['POST'], endpoint='story')
@token_required
def ContinueStory():
    coverphoto = None
    desc = None

    date = datetime.datetime.now()
    conn = mysql.connect()
    result = request.get_json(force=True)
    postname = str(result['Storyname'])
    # postname = 'กางแต๊ด'
    postid = str(result['UserID'])+"?"+postname[0:5]
    # print(postid)
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute(
        "SELECT MAX(Section) AS Recentsection FROM Story where StoryID = %s", (postid))
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
        "Insert INTO Story" +
        "(StoryID,Storyname,Section,UserID,StoryTime,Tag,Targetgroup,StoryDesc,Coverphoto)" +
        "values(%s,%s,%s,%s,%s,%s,%s,%s,%s)", (postid, postname, section, str(result['UserID']),
                                               date, result['Tag'], str(result['Targetgroup']), desc, coverphoto))
    conn.commit()
    return 'Record Inserted Successfully'


@app.route('/showpost', methods=['POST'], endpoint='showallposts')
@token_required
def ShowallPost():
    conn = mysql.connect()
    result = request.get_json(force=True)
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute("SELECT a.* " +
                "FROM( " +
                "SELECT Story.StoryID, Storyname, StoryTime, Tag, Targetgroup, StoryDesc, Coverphoto, Story.UserID, User.Firstname, User.Lastname, User.Profileimg " +
                ",Tag.Tagname " +
                ",COUNT(Likes.PostID) AS AmountOfLikes  ," +
                "Likes.PostID IN( " +
                "    SELECT Likes.PostID FROM Likes " +
                "    WHERE Likes.PostID=Story.StoryID " +
                "    AND Likes.UserID=%s) as Islike " +
                "FROM Story " +
                "LEFT JOIN Likes ON Story.StoryID = Likes.PostID " +
                "INNER JOIN User ON User.UserID=Story.UserID " +
                ",Tag " +
                "WHERE Tag in (%s,%s,%s,%s,%s)  " +
                "AND Story.Targetgroup = 'public' " +
                "AND Story.Tag = Tag.ID " +
                "GROUP BY Story.StoryID " +
                "ORDER BY Story.StoryTime DESC " +
                "LIMIT 5 " +
                ") a " +
                "UNION  " +
                "SELECT b.* " +
                "FROM( " +
                "SELECT Story.StoryID, Storyname, StoryTime, Tag, Targetgroup, StoryDesc, Coverphoto, Story.UserID, User.Firstname, User.Lastname, User.Profileimg " +
                ",Tag.Tagname " +
                ",COUNT(Likes.PostID) AS AmountOfLikes  ," +
                "Likes.PostID IN( " +
                "    SELECT Likes.PostID FROM Likes " +
                "    WHERE Likes.PostID=Story.StoryID " +
                "    AND Likes.UserID=%s) as Islike " +
                "FROM Story " +
                "LEFT JOIN Likes ON Story.StoryID = Likes.PostID " +
                "INNER JOIN User ON User.UserID=Story.UserID " +
                ",Tag " +
                "WHERE User.UserID= %s " +
                "AND Story.Tag = Tag.ID " +
                "GROUP BY Story.StoryID " +
                "ORDER BY Story.StoryTime DESC " +
                ") b " +
                "UNION  " +
                "SELECT c.* " +
                "FROM( " +
                "SELECT Story.StoryID, Storyname, StoryTime, Tag, Targetgroup, StoryDesc, Coverphoto, Subscribe.UserID, User.Firstname, User.Lastname, User.Profileimg " +
                ",Tag.Tagname " +
                ",COUNT(Likes.PostID) AS AmountOfLikes  ," +
                "Likes.PostID IN( " +
                "    SELECT Likes.PostID FROM Likes " +
                "    WHERE Likes.PostID=Story.StoryID " +
                "    AND Likes.UserID=%s) as Islike " +
                "FROM Story " +
                "LEFT JOIN Likes ON Story.StoryID = Likes.PostID " +
                ", User, Subscribe " +
                ",Tag " +
                "WHERE User.UserID=Story.UserID " +
                "and Story.UserID=Subscribe.UserID " +
                "and User.UserID=Subscribe.UserID " +
                "and Subscribe.FollowerID=%s" +
                "and Story.Targetgroup != 'private' " +
                "AND Story.Tag = Tag.ID " +
                "GROUP BY Story.StoryID " +
                "ORDER BY Story.StoryTime DESC " +
                ") c ORDER BY StoryTime DESC ",
                (result['UserID'], result['Tag1'], result['Tag2'], result['Tag3'], result['Tag4'], result['Tag5'], result['UserID'], result['UserID'], result['UserID'], result['UserID']))
    data = cur.fetchall()
    return jsonify(data)


@ app.route('/search', methods=['Post'], endpoint='searchs')
@ token_required
def ShowSearchPost():
    conn = mysql.connect()
    result = request.get_json(force=True)
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute(
            "SELECT a.* FROM( "+ ##Firstname
            "SELECT Story.StoryID, Storyname, StoryTime, Tag, Targetgroup, StoryDesc, Coverphoto, Story.UserID, User.Firstname, User.Lastname, User.Profileimg "+
            ", Tag.Tagname, COUNT(Likes.PostID) AS AmountOfLikes, "+
            "Likes.PostID IN( "+
            "    SELECT Likes.PostID FROM Likes "+
            "    WHERE Likes.PostID=Story.StoryID "+
            "    AND Likes.UserID=%s) as Islike "+
            "FROM Story "+
            "LEFT JOIN Likes ON Story.StoryID=Likes.PostID, User, Tag "+
            "where Story.UserID=User.UserID "+
            "AND Story.Tag=Tag.ID "+
            "AND User.Firstname LIKE %s "+
            "GROUP BY Story.StoryID "+
            "ORDER BY Story.StoryTime DESC)a "+
            "UNION "+
            "SELECT b.* FROM( "+ ##Lastname
            "SELECT Story.StoryID, Storyname, StoryTime, Tag, Targetgroup, StoryDesc, Coverphoto, Story.UserID, User.Firstname, User.Lastname, User.Profileimg "+
            ", Tag.Tagname, COUNT(Likes.PostID) AS AmountOfLikes, "+
            "Likes.PostID IN( "+
            "    SELECT Likes.PostID FROM Likes "+
            "    WHERE Likes.PostID=Story.StoryID "+
            "    AND Likes.UserID=%s) as Islike "+
            "FROM Story "+
            "LEFT JOIN Likes ON Story.StoryID=Likes.PostID, User, Tag "+
            "where Story.UserID=User.UserID "+
            "AND Story.Tag=Tag.ID "+
            "AND User.Lastname LIKE %s "+
            "GROUP BY Story.StoryID "+
            "ORDER BY Story.StoryTime DESC)b "+
            "UNION "+
            "SELECT c.* FROM( "+ ##Storyname
            "SELECT Story.StoryID, Storyname, StoryTime, Tag, Targetgroup, StoryDesc, Coverphoto, Story.UserID, User.Firstname, User.Lastname, User.Profileimg "+
            ", Tag.Tagname, COUNT(Likes.PostID) AS AmountOfLikes, "+
            "Likes.PostID IN( "+
            "    SELECT Likes.PostID FROM Likes "+
            "    WHERE Likes.PostID=Story.StoryID "+
            "    AND Likes.UserID=%s) as Islike "+
            "FROM Story "+
            "LEFT JOIN Likes ON Story.StoryID=Likes.PostID, User, Tag "+
            "where Story.UserID=User.UserID "+
            "AND Story.Tag=Tag.ID "+
            "AND Story.Storyname LIKE %s "+
            "GROUP BY Story.StoryID "+
            "ORDER BY Story.StoryTime DESC)c "+
            "UNION "+
            "SELECT d.* FROM( "+ ##Tagname
            "SELECT Story.StoryID, Storyname, StoryTime, Tag, Targetgroup, StoryDesc, Coverphoto, Story.UserID, User.Firstname, User.Lastname, User.Profileimg "+
            ", Tag.Tagname, COUNT(Likes.PostID) AS AmountOfLikes, "+
            "Likes.PostID IN( "+
            "    SELECT Likes.PostID FROM Likes "+
            "    WHERE Likes.PostID=Story.StoryID "+
            "    AND Likes.UserID=%s) as Islike "+
            "FROM Story "+
            "LEFT JOIN Likes ON Story.StoryID=Likes.PostID, User, Tag "+
            "where Story.UserID=User.UserID "+
            "AND Story.Tag=Tag.ID "+
            "AND Tag.Tagname LIKE %s "+
            "GROUP BY Story.StoryID "+
            "ORDER BY Story.StoryTime DESC)d "
            , (result['UserID'],result['Search']+"%",result['UserID'],result['Search']+"%",result['UserID'],result['Search']+"%",result['UserID'],result['Search']+"%")
    )
    data = cur.fetchall()
    return jsonify(data)


@app.route('/showselfpost/<userid>', methods=['GET'], endpoint='showselfposts')
@token_required
def ShowSelfPost(userid):
    conn = mysql.connect()
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute(
        "SELECT Story.StoryID, Storyname, StoryTime, Tag, Targetgroup, StoryDesc, Coverphoto, Story.UserID, User.Firstname, User.Lastname, User.Profileimg " +
        ",Tag.Tagname " +
        ",COUNT(Likes.PostID) AS AmountOfLikes ," +
        "Likes.PostID IN( " +
        "    SELECT Likes.PostID FROM Likes " +
        "    WHERE Likes.PostID=Story.StoryID " +
        "    AND Likes.UserID=%s) as Islike " +
        "FROM Story " +
        "LEFT JOIN Likes ON Story.StoryID = Likes.PostID " +
        "INNER JOIN User ON User.UserID=Story.UserID " +
        ",Tag " +
        "WHERE User.UserID= %s " +
        "AND Story.Tag = Tag.ID " +
        "GROUP BY Story.StoryID " +
        "ORDER BY Story.StoryTime DESC ", (str(userid), str(userid)))
    data = cur.fetchall()
    return jsonify(data)


@app.route('/showdetailpost/<storyid>', methods=['GET'], endpoint='showdetailposts')
@token_required
def ShowDetailPost(storyid):
    conn = mysql.connect()
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute(
        "SELECT Story.StoryID, Storyname, StoryTime, Tag, Targetgroup, StoryDesc, Coverphoto, Story.UserID, PrevID, NextID , User.Firstname, User.Lastname " +
        ",Tag.Tagname " +
        ",COUNT(Likes.PostID) AS AmountOfLikes " +
        # "Likes.PostID IN( " +
        # "    SELECT Likes.PostID FROM Likes " +
        # "    WHERE Likes.PostID=Story.StoryID " +
        # "    AND Likes.UserID=%s) as Islike " +
        "FROM Story " +
        "LEFT JOIN Likes ON Story.StoryID = Likes.PostID " +
        ", User " +
        ",Tag " +
        "where Story.UserID = User.UserID " +
        "AND Story.Tag = Tag.ID " +
        "and StoryID = %s", (str(storyid)))
    data = cur.fetchall()
    return jsonify(data)


@ app.route('/showprevnextpost', methods=['Post'], endpoint='showprevnextposts')
@token_required
def ShowPrevNextPost():
    conn = mysql.connect()
    result = request.get_json(force=True)
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute("SELECT StoryID, Storyname " +
                "FROM Story " +
                "WHERE UserID= %s " +
                "and StoryID NOT IN (%s,%s)", (result['UserID'], result['StoryID'], result['ConnectID']))
    data = cur.fetchall()
    return jsonify(data)


@ app.route('/setprevnextpost', methods=['Post'], endpoint='setprevnextposts')
@token_required
def SetPrevNextPost():
    conn = mysql.connect()
    result = request.get_json(force=True)
    cur = conn.cursor(pymysql.cursors.DictCursor)
    if result['Type'] == 'prev':
        cur.execute(
            "UPDATE Story SET NextID = %s where StoryID = %s", (None, result['OldConnectID']))
        conn.commit()

        cur.execute("UPDATE Story t1 JOIN Story t2 " +
                    "ON t1.StoryID=%s AND t2.StoryID=%s " +
                    "SET t1.PrevID=%s, " +
                    "t2.NextID=%s ",
                    (result['StoryID'], result['ConnectID'], result['ConnectID'], result['StoryID']))
        conn.commit()
    elif result['Type'] == 'next':
        cur.execute(
            "UPDATE Story SET PrevID = %s where StoryID = %s", (None, result['OldConnectID']))
        conn.commit()

        cur.execute("UPDATE Story t1 JOIN Story t2 " +
                    "ON t1.StoryID=%s AND t2.StoryID=%s " +
                    "SET t1.NextID=%s, " +
                    "t2.PrevID=%s ",
                    (result['StoryID'], result['ConnectID'], result['ConnectID'], result['StoryID']))
        conn.commit()
    # conn.commit()
    return jsonify('Record Update Successfully')


@ app.route('/showsomeonepost', methods=['Post'], endpoint='showsomeoneposts')
@ token_required
def ShowSomeonePost():
    conn = mysql.connect()
    result = request.get_json(force=True)
    cur = conn.cursor(pymysql.cursors.DictCursor)
    if result['IsFollow'] == 'Followed':
        cur.execute(
            "SELECT Story.StoryID, Storyname, StoryTime, Tag, Targetgroup, StoryDesc, Coverphoto, Story.UserID, User.Firstname, User.Lastname, User.Profileimg " +
            ",Tag.Tagname " +
            ",COUNT(Likes.PostID) AS AmountOfLikes, " +
            "Likes.PostID IN( " +
            "    SELECT Likes.PostID FROM Likes " +
            "    WHERE Likes.PostID=Story.StoryID " +
            "    AND Likes.UserID=%s) as Islike " +
            "FROM Story " +
            "LEFT JOIN Likes ON Story.StoryID = Likes.PostID " +
            "INNER JOIN User ON User.UserID=Story.UserID " +
            ",Tag " +
            "WHERE User.UserID= %s " +
            "AND Targetgroup != 'private' " +
            "AND Story.Tag = Tag.ID " +
            "GROUP BY Story.StoryID " +
            "ORDER BY Story.StoryTime DESC ", (result['SelfID'], result['UserID']))
    elif result['IsFollow'] == 'Follow':
        cur.execute(
            "SELECT Story.StoryID, Storyname, StoryTime, Tag, Targetgroup, StoryDesc, Coverphoto, Story.UserID, User.Firstname, User.Lastname, User.Profileimg " +
            ",Tag.Tagname " +
            ",COUNT(Likes.PostID) AS AmountOfLikes, " +
            "Likes.PostID IN( " +
            "    SELECT Likes.PostID FROM Likes " +
            "    WHERE Likes.PostID=Story.StoryID " +
            "    AND Likes.UserID=%s) as Islike " +
            "FROM Story " +
            "LEFT JOIN Likes ON Story.StoryID = Likes.PostID " +
            "INNER JOIN User ON User.UserID=Story.UserID " +
            ",Tag " +
            "WHERE User.UserID= %s " +
            "AND Targetgroup = 'public' " +
            "AND Story.Tag = Tag.ID " +
            "GROUP BY Story.StoryID " +
            "ORDER BY Story.StoryTime DESC ", (result['SelfID'], result['UserID']))
    data = cur.fetchall()
    return jsonify(data)


@ app.route('/like', methods=['POST'], endpoint='likes')
@ token_required
def Like():
    conn = mysql.connect()
    result = request.get_json(force=True)
    cur = conn.cursor(pymysql.cursors.DictCursor)
    if(result['choice'] == 'YES'):
        cur.execute(
            "Insert INTO Likes " +
            "(UserID,PostID)" +
            "values(%s,%s)", (str(result['UserID']), str(result['PostID'])))
    elif(result['choice'] == 'NO'):
        cur.execute(
            "DELETE FROM Likes " +
            "WHERE UserID = %s and PostID = %s", (str(result['UserID']), str(result['PostID'])))
    conn.commit()
    return jsonify('Record Update Successfully')


@ app.route('/showcomment/<storyid>', methods=['GET'], endpoint='showcomments')
@ token_required
def ShowComment(storyid):
    conn = mysql.connect()
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute("SELECT Comment.CommentID, Comment.PostID, Comment.UserID, Comment.CommentTime, Comment.CommentDes, User.Firstname, User.Lastname, User.Profileimg " +
                "from Comment, User " +
                "WHERE Comment.UserID=User.UserID " +
                "AND Comment.PostID= %s " +
                "ORDER BY Comment.CommentTime ", (str(storyid)))
    data = cur.fetchall()
    return jsonify(data)


@ app.route('/addcomment', methods=['POST'], endpoint='addcomments')
@ token_required
def AddComment():
    date = datetime.datetime.now()
    conn = mysql.connect()
    result = request.get_json(force=True)
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute(
        "Insert INTO Comment" +
        "(PostID,UserID,CommentTime,CommentDes)" +
        "values(%s,%s,%s,%s)", (result['PostID'], result['UserID'], date, result['CommentDes']))
    conn.commit()
    return jsonify('Record Insert Successfully')


@ app.route('/swapcontent', methods=['POST'], endpoint='swapcontents')
@ token_required
def SwapContent():
    conn = mysql.connect()
    result = request.get_json(force=True)
    cur = conn.cursor(pymysql.cursors.DictCursor)
    # cur.execute(
    #     "UPDATE Content SET ContentOrder=%s WHERE PostID=%s and ContentOrder=%s", (result['Source'],result['PostID'],result['Dest']))
    # conn.commit()
    # cur.execute(
    #     "UPDATE Content SET ContentOrder=%s WHERE PostID=%s and ContentOrder=%s", (result['Dest'],result['PostID'],result['Source']))
    # conn.commit()
    cur.execute("UPDATE Content t1 JOIN Content t2 " +
                "ON t1.ContentID=%s AND t2.ContentID=%s " +
                "SET t1.ContentOrder=%s, " +
                "t2.ContentOrder=%s ",
                (result['SourceID'], result['DestID'], result['DestOrder'], result['SourceOrder']))
    conn.commit()
    return jsonify('Record Swap Successfully')


@ app.route('/showcontent/<storyid>', methods=['GET'], endpoint='showcontents')
@ token_required
def ShowContent(storyid):
    conn = mysql.connect()
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute("SELECT ContentID, Content.PostID, Story.Storyname, ContentOrder, ContentTime, ContentType, ContentDesc " +
                "FROM Content, Story " +
                "WHERE Story.StoryID=Content.PostID " +
                "AND Content.PostID=%s " +
                "ORDER BY Content.ContentOrder", (str(storyid)))
    data = cur.fetchall()
    return jsonify(data)


@ app.route('/addcontent', methods=['POST'], endpoint='addcontents')
@ token_required
def AddContent():
    date = datetime.datetime.now()
    conn = mysql.connect()
    result = request.get_json(force=True)
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute(
        "SELECT max(ContentOrder) FROM Content " +
        "WHERE PostID = %s", (result['PostID']))
    conn.commit()
    data = cur.fetchall()
    order = data[0]['max(ContentOrder)']
    if order == None:
        order = '0'
    cur.execute(
        "Insert into Content(PostID,ContentOrder,ContentTime,ContentType,ContentDesc) " +
        " VALUES (%s,%s,%s,%s,%s)", (result['PostID'], int(order)+1, date, 'text', result['ContentDesc']))
    conn.commit()
    return jsonify('Record Insert Successfully')


@ app.route('/editcontent', methods=['POST'], endpoint='editcontents')
@ token_required
def EditContent():
    conn = mysql.connect()
    result = request.get_json(force=True)
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute(
        "UPDATE Content SET ContentDesc=%s WHERE PostID=%s and ContentOrder=%s", (result['ContentDesc'], result['PostID'], result['ContentOrder']))
    conn.commit()
    return jsonify('Record Update Successfully')


@ app.route('/deletecontent', methods=['POST'], endpoint='deletecontents')
@ token_required
def DeleteContent():
    conn = mysql.connect()
    result = request.get_json(force=True)
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute(
        "DELETE from Content WHERE PostID=%s and ContentOrder=%s", (result['PostID'], result['ContentOrder']))
    conn.commit()
    return jsonify('Record Update Successfully')


folder = ''


@ app.route('/upload', methods=['POST'], endpoint='Upload')
def upload_file():
    if request.form['folder'] != None:
        folder = request.form['folder']
    print(str(folder))
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
                userid = request.form['userid']
                file.save(os.path.join(
                    app.config['UPLOAD_FOLDER']+"/profile", number+".jpg"))
                conn = mysql.connect()
                cur = conn.cursor(pymysql.cursors.DictCursor)
                cur.execute(
                    "UPDATE User SET Profileimg = %s where UserID = %s", (number, userid))
                conn.commit()
            if folder == 'coverphoto':
                storyid = request.form['storyid']
                file.save(os.path.join(
                    app.config['UPLOAD_FOLDER']+"/coverphoto", number+".jpg"))
                conn = mysql.connect()
                cur = conn.cursor(pymysql.cursors.DictCursor)
                cur.execute(
                    "UPDATE Story SET Coverphoto = %s where StoryID = %s", (number, storyid))
                conn.commit()
            if len(folder) == 50:
                userid = request.form['userid']
                date = datetime.datetime.now()
                file.save(os.path.join(
                    app.config['UPLOAD_FOLDER']+"/"+userid+"/"+folder, number+".jpg"))
                conn = mysql.connect()
                cur = conn.cursor(pymysql.cursors.DictCursor)
                cur.execute(
                    "SELECT max(ContentOrder) FROM Content " +
                    "WHERE PostID = %s", (folder))
                conn.commit()
                data = cur.fetchall()
                order = data[0]['max(ContentOrder)']
                if order == None:
                    order = '0'
                print(order)
                cur.execute(
                    "Insert into Content(PostID,ContentOrder,ContentTime,ContentType,ContentDesc) " +
                    " VALUES (%s,%s,%s,%s,%s)", (folder, int(order)+1, date, 'image', number))
                conn.commit()

            # else:
            #     file.save(os.path.join(
            #         app.config['UPLOAD_FOLDER']+userid, number+".jpg"))
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


@ app.route('/img/profile/<filename>', methods=['GET'])
def photoProfile(filename):
    return send_file("img/profile/"+filename+".jpg")


@ app.route('/img/coverphoto/<filename>', methods=['GET'])
def photoCover(filename):
    return send_file("img/coverphoto/"+filename+".jpg")


@ app.route('/img/<userid>/<storyid>/<filename>', methods=['GET'])
def photoContent(userid, storyid, filename):
    return send_file("img/"+userid+"/"+storyid+"/"+filename+".jpg")


if __name__ == "__main__":
    # 8app.run(debug=True)
    app.run(debug=True, port=1507, host='0.0.0.0')
