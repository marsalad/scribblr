import watson_developer_cloud
from watson_developer_cloud import NaturalLanguageUnderstandingV1
from watson_developer_cloud.natural_language_understanding_v1 import Features, EntitiesOptions, KeywordsOptions, ConceptsOptions
from nltk import word_tokenize, pos_tag, ne_chunk, sent_tokenize
import nltk
import parsedatetime
from datetime import datetime
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer as Summarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
nltk.download('maxent_ne_chunker')
nltk.download('words')

class TranscriptAnalyzer:
	"""This class defines several procdures for analyzing Scribblr transcripts."""

	natural_language_understanding = NaturalLanguageUnderstandingV1(
		version='2017-02-27',
		username='94a07ed0-2680-4872-9ea6-8ff875af2747',
		password='DZlV0nWmEobI')

	def __init__(self, transcript_file_path, summary_number):
		""" Input a transcript_file_path in the form of a string and a
			summary_number denoting the number of sentences requested in the summary.
		"""
		self.transcript_file = transcript_file_path
		full_transcript_text = file.read(open(self.transcript_file, "r"))
		self.tokenized_transcript = sent_tokenize(full_transcript_text);

		LANGUAGE = "English"
		parser = PlaintextParser.from_file(self.transcript_file, Tokenizer(LANGUAGE))
		stemmer = Stemmer(LANGUAGE)

		summarizer = Summarizer(stemmer)
		summarizer.stop_words = get_stop_words(LANGUAGE)
		self.summary = summarizer(parser.document, summary_number)


	def _sentence_entity_finder(self, sentence):
		# Uses IBM BlueMix. Returns the string of the Entity if one is found in the sentence.
		try:
			response = self.natural_language_understanding.analyze(
				text=sentence,
				features=Features(entities=EntitiesOptions(), keywords=KeywordsOptions()))
			if response.get("entities") == []:
				return None
			return ((response.get("entities")[0]).get("text"))
		except watson_developer_cloud.watson_service.WatsonApiException:
			return None

	def _concept_finder(self, sentence):
		# Uses IBM BlueMix.
		try:
			response = self.natural_language_understanding.analyze(text = sentence,
				features=Features(
					concepts=ConceptsOptions(
						limit=3)))
			if response.get("concepts") == []:
				return None
			return (response.get("concepts")[0]).get("text")
		except watson_developer_cloud.watson_service.WatsonApiException:
			return None

	def _keyword_detector(self, sentence):
		# Uses IBM BlueMix. Return a list of the keywords in a sentence.
		try:
			response = self.natural_language_understanding.analyze(
			text=sentence,
			features=Features(
			keywords=KeywordsOptions(
				sentiment=False,
				emotion=True,
				limit=2)))
			keywords = []
			for item in response.get("keywords"):
				keywords += [item.get("text")];
			return keywords
		except watson_developer_cloud.watson_service.WatsonApiException:
			return []

	def frequently_discussed_topics(self):
		# Returns a set of the most frequently discussed topics
		topics = []
		for sentence in self.summary:
			topics+= [self._keyword_detector(str(sentence))]
			entity = self._sentence_entity_finder(str(sentence))
			if entity is not None:
				topics+= [entity]
		important_topics = []
		for item in topics:
			if topics.count(item)>1:
				important_topics += [item]
		return set(important_topics)

	def concepts_discussed(self):
		# Returns a list of the concepts discussed
		concepts = []
		for sentence in self.summary:
			concept = (self._concept_finder(str(sentence))) 
			if concept is not None:
				 concepts += [concept]
		return concepts

	def retrieve_calendar_items(self):
		# Returns a tuple containing the context or sentence defining the event, 
		# a datetime.datetime date and a list of keywords relevant to the event.
		calendar_items = []
		for sentence in self.tokenized_transcript:
			possible_date = self._date_parser(sentence.decode("utf-8"))
			if possible_date is not None:
				calendar_items += [(sentence, possible_date, self._keyword_detector(str(sentence)))]
		return calendar_items

	def retrieve_action_items(self):
		# Returns a list of the sentences containing action items.
		action_items = []
		for sentence in self.tokenized_transcript:
			possible_command = self._command_detected(str(sentence))
			if possible_command is True:
				action_items += [(str(sentence))]
		return action_items

	command_words = ["can you", "would you", "can we", "you should", "we should", "we need to", 
					 "you need to", "ensure", "make sure", "make it", "we want to", "we must",
					 "you must", "you have to", "we have to" "homework"]
	prohibited_command_words = ["Let me", "?"]

	def _command_detected(self, sentence):
		# Detects whether a given String sentence is a command or action-item
		tagged_sentence = pos_tag(word_tokenize(sentence));
		first_word = tagged_sentence[0];
		pos_first = first_word[1];
		first_word = first_word[0].lower()
		for word in self.prohibited_command_words:
			if word in sentence:
				return False
		for word in self.command_words:
			if word in sentence:
				return True
		# Checks whether the first sentence is a Modal Verb or other type of Verb that is not a gerund
		if (pos_first == "VB" or pos_first == "VBZ" or pos_first == "VBP")    and first_word[-3:] != "ing":
			return True
		return False

	schedule_words = [" by ", " due ", "plan", "setup", "schedule", "complete by", "complete on", "next", " on ", " in "]
	prohibited_schedule_words = ["today"]

	def _date_parser(self, sentence):
		cal = parsedatetime.Calendar()
		time_struct, parse_status = cal.parse(sentence)
		time_struct_null, parse_status_null = cal.parse("")

		# If the time detected is the same as the current time, discard.
		if datetime(*time_struct[:6]) == datetime(*time_struct_null[:6]):
			return None
		# For ease of use, events cannot be scheduled for the same day with use of the word "today." 
		# A relative term ("in an hour") should be used instead.
		for word in self.prohibited_schedule_words:
			if word in sentence:
				return None
		# Events cannot be schedule in the past.
		tagged_sentence = pos_tag(word_tokenize(sentence));
		for word in tagged_sentence:
			if word[1] == "VBD":
				return None

		for word in self.schedule_words:
			if word in sentence:
				return datetime(*time_struct[:6])
		return None
		
	def text_summary(self):
		# Returns a summary of the transcript of the length given to the constructor.
		transcript_summary = ""
		for sentence in self.summary:
			transcript_summary    = transcript_summary + " " + str(sentence)
		return transcript_summary
