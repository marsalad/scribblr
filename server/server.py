from flask import Flask, request
import socketio
import eventlet
import eventlet.wsgi
import speech_recognition as sr
from pydub import AudioSegment

app = Flask(__name__)
sio = socketio.Server()
r = sr.Recognizer()

recorders = []

@app.route("/start-recording", methods=["POST", "GET"])
def trigger_record():
    for recorder in recorders:
        sio.emit('start-recording', room=recorder)
    return "Success"

@app.route("/stream-audio", methods=["POST"])
def stream_audio():
    if 'file' in request.files:
        _file = request.files['file']
        _file.save('./test.wav')
        audio_file = AudioSegment.from_file("test.wav", format="m4a")
        audio_file.export("test.wav", format="wav")
        try:
            with sr.AudioFile('./test.wav') as f:
                audio = r.record(f)
                text = r.recognize_google(audio)
                print(text)
        except Exception as e:
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
