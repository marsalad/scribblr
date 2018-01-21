import cal_feeder as calf
import transcript_processor as nlp
from flask import Flask, request


app = Flask(__name__)

@app.route('/meetingOver', methods=['POST'])
def meetingOver():
	response = request.get_json(cache=False)
	text = response.get('text')
	with open('transcript.txt', 'w') as f:
		f.write(text)
	t_proc = nlp.TranscriptAnalyzer('transcript.txt', 5)
	print t_proc.text_summary()

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=5000)