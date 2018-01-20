from flask import Flask, request
app = Flask(__name__)

@app.route("/test", methods=["POST"])
def test():
    return "Hello"

@app.route("/stream-audio", methods=["POST"])
def stream_audio():
    if 'file' in request.files:
        _file = request.files['file']
        _file.save('./test.aac')
        return 'Got file'
    return 'No file'

if __name__ == "__main__":
    app.run(host='0.0.0.0')
