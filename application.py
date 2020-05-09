import os
import requests
from flask import Flask, session, jsonify, render_template,g, request
from flask_session import Session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = 'secretkey'
socketio = SocketIO(app)

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)


users_session={}
channels={}
channels['General']=[]
users=set()


@app.route("/")
def index():
	return render_template('message.html')

@socketio.on("send msg")
def incoming_msg(data):
	channel=data["channel"]
	msg=data["msg"]
	time=data["time"]
	user=data["user"]
	channels[channel].append({'msg':msg,'user':user,'time':time})
	if(len(channels[channel])>100):
		channels[channel].pop(0)
	emit("announce msg",{'channel':channel,'msg':msg,'user':user,'time':time},broadcast=True)


@socketio.on("connect")
def connect():
	global online_users
	print("User Connected!")
	print(channels)
	emit("load channels",{'channels':channels,'online':str(len(users_session))})

@socketio.on("new username")
def new_username(data):
	users_session[data['user']]=request.sid
	print(users_session)
	session['username']=data['user']
	session['active-channel']='General'
	users.add(data['user'])
	emit("add username",{"user":data['user']})

@socketio.on('create newchannel')
def add_newchannel(data):
	if data['channel_name'] in channels.keys():
		emit("error",{'error':'Channel Name Alredy Exists Give Diffrent Name'})
	else:
		channels[data['channel_name']]=[]
		emit("added newchannel",{'channel_name':data['channel_name']},broadcast=True)

@socketio.on('load channel msgs')
def load_channel_msgs(data):
	print(data['user']+" "+ data['channel_name'])
	emit('loaded channel msgs',{'user':data['user'],'channel_msgs':channels[data['channel_name']]},broadcast=True)

@socketio.on('changed channel')
def change_channel(data):
	session['active-channel']=data['channel_name']


# @socketio.on('private_message', namespace='/private')
# def private_message(payload):
#     recipient_session_id = users[payload['username']]
#     message = payload['message']

#     emit('new_private_message', message, room=recipient_session_id)

# @socketio.on('private_message', namespace='/private')
# def private_message(payload):
#     recipient_session_id = users[payload['username']]
#     message = payload['message']
# 	emit('new_private_message', message, room=recipient_session_id)
