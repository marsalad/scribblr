FROM python:3

ADD . .

#RUN pip install -r requirements.txt
RUN pip install flask
RUN pip install SpeechRecognition
RUN pip install python-socketio
RUN pip install eventlet
RUN pip install pydub
RUN pip install firebase-admin
RUN pip install -e git://github.com/summanlp/textrank.git#egg=summa

CMD ["python", "./server.py"]

