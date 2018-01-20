from flask import Flask, request
import speech_recognition as sr
from pydub import AudioSegment

app = Flask(__name__)
r = sr.Recognizer()

@app.route("/test", methods=["POST"])
def test():
    return "Hello"

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

if __name__ == "__main__":
    app.run(host='0.0.0.0')
