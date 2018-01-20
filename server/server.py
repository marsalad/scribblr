from flask import Flask, request
import socketio
import eventlet
import eventlet.wsgi
import speech_recognition as sr
from pydub import AudioSegment
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from summa import keywords, summarizer
from nltk.tokenize import word_tokenize
from os.path import join, dirname
from dotenv import load_dotenv
from send_email import send_cards
dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

app = Flask(__name__)
sio = socketio.Server()
r = sr.Recognizer()

recorders = []

cred = credentials.Certificate('./key.json')
default_app = firebase_admin.initialize_app(cred, {
    'databaseURL' : 'https://scribblr-73ff0.firebaseio.com/'
})
fb_root = db.reference()

@app.route("/create-room", methods=["POST", "GET"])
def create_room():
    num_rooms = len(fb_root.child('room').get())
    fb_root.child('room').child(str(num_rooms)).set({'emails': ['michelkerlin@gmail.com']})
    return str(num_rooms)

@app.route("/add-email", methods=["GET"])
def add_email():
    emails = fb_root.child('room').child(request.args.get('room')).child('emails').get()
    emails.append(request.args.get('email'))
    fb_root.child('room').child(request.args.get('room')).child('emails').set(emails)
    return "Added email"

@app.route("/send-emails", methods=["GET"])
def send_meeting_emails():
    emails = fb_root.child('room').child(request.args.get('room')).child('emails').get()
    send_cards(['Suh dude'], emails)
    return 'Emails sent'

@app.route("/start-recording", methods=["POST", "GET"])
def trigger_record():
    for recorder in recorders:
        sio.emit('start-recording', room=recorder)
    return "Success"

@app.route("/stop-recording", methods=["POST", "GET"])
def trigger_stop():
    for recorder in recorders:
        sio.emit('stop-recording', room=recorder)
    return "Success"

words = []
curr_sent = ''
sents = []
@app.route("/stream-audio", methods=["POST"])
def stream_audio():
    if 'file' in request.files:
        _file = request.files['file']
        _file.save('./test.wav')
        audio_file = AudioSegment.from_file("test.wav", format="m4a")
        audio_file.export("test.wav", format="wav")
        try:
            with sr.AudioFile('./test.wav') as f:
                global curr_sent
                audio = r.record(f)
                text = r.recognize_google(audio)
                tokens = word_tokenize(text)
                global words
                words += tokens
                curr_sent += text + ' '
                print('text:', text)
                if len(words) >= 30:
                    print('Keywords:', str(keywords.keywords(' '.join(words)).split('\n')))
                    print('Sents:', '.'.join(sents))
                    #print('Summary:', summarizer.summarize(' '.join(words), words=15))
                    words = []
        except Exception as e:
            #global sents
            sents.append(curr_sent)
            curr_sent = ''
            print(e)
            return 'Error'
        return 'Got file'
    return 'No file'

@sio.on('connect')
def connect(sid, environ):
    recorders.append(sid)
    print("connect ", sid)

@sio.on('chat message')
def message(sid, data):
    print("message ", data)
    sio.emit('reply', room=sid)

@sio.on('disconnect')
def disconnect(sid):
    recorders.remove(sid)
    print('disconnect ', sid)

if __name__ == "__main__":
    #app.run(host='0.0.0.0')
    app = socketio.Middleware(sio, app)
    eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 5000)), app)
