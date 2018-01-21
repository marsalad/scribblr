from __future__ import print_function
import httplib2, os, datetime

from apiclient import discovery
from oauth2client import client
from oauth2client import tools
from oauth2client.file import Storage

try:
	import argparse
	flags = argparse.ArgumentParser(parents=[tools.argparser]).parse_args()
except ImportError:
	flags = None

SCOPES = 'https://www.googleapis.com/auth/calendar'
CLIENT_SECRET_FILE = 'client_secret.json'
APPLICATION_NAME = 'Google Calendar API Python Quickstart'

def get_credentials():
	"""Gets valid user credentials from storage.

	If nothing has been stored, or if the stored credentials are invalid,
	the OAuth2 flow is completed to obtain the new credentials.

	Returns:
		Credentials, the obtained credential.
	"""
	home_dir = os.path.expanduser('~')
	credential_dir = os.path.join(home_dir, '.credentials')
	if not os.path.exists(credential_dir):
		os.makedirs(credential_dir)
	credential_path = os.path.join(credential_dir,
								   'calendar-python-quickstart.json')

	store = Storage(credential_path)
	credentials = store.get()
	if not credentials or credentials.invalid:
		flow = client.flow_from_clientsecrets(CLIENT_SECRET_FILE, SCOPES)
		flow.user_agent = APPLICATION_NAME
		if flags:
			credentials = tools.run_flow(flow, store, flags)
		else: # Needed only for compatibility with Python 2.6
			credentials = tools.run(flow, store)
		print('Storing credentials to ' + credential_path)
	return credentials

def add_events(cal_list):
	credentials = get_credentials()
	http = credentials.authorize(httplib2.Http())
	service = discovery.build('calendar', 'v3', http=http)

	# (sentence, possible_date, keyword_list)
	for (sentence, start, keywords) in cal_list:
		end = start + datetime.timedelta(hours=1)
		if len(keywords) == 0:
			summary = 'Meeting/Task from Scribblr'
			description = ''
		else if len(keywords) == 1:
			summary = keywords[0].title() + ' Meeting'
			description = ''
		else:
			summary = keywords[0].title() + ' Meeting'
			description = 'Topics: ' + ', '.join(keywords[1::])

		event = {
			'summary': summary,
			'description': description,
			'start' : {
				'dateTime': start.isoformat('T'),
				'timeZone': 'America/New_York',
			},
			'end':{
				'dateTime': end.isoformat('T'),
				'timeZone': 'America/New_York',
			}
		}
		event = service.events().insert(calendarId ='primary', body=event).execute()