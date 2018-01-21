import cal_feeder as calf
import transcript_processor as nlp
from flask import Flask, request, jsonify


app = Flask(__name__)

@app.route('/meetingOver', methods=['POST'])
def meetingOver():
	response = request.get_json()
	text = response.get('text')
	with open('transcript.txt', 'w') as f:
		f.write(text.encode("utf-8"))
	t_proc = nlp.TranscriptAnalyzer('transcript.txt', 5)
	res = {'summary': t_proc.text_summary(), "action_items": t_proc.retrieve_action_items(), "calendar_events": t_proc.retrieve_calendar_items()}
	calf.add_events(res["calendar_events"])
	return jsonify(res)

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=5001)
