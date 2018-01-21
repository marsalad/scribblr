var request = require("request")
// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

    // if (event.session.application.applicationId !== "") {
    //     context.fail("Invalid Application ID");
    //  }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    getWelcomeResponse(callback)
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {

    var intent = intentRequest.intent
    var intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here

    if(intentName == "CreateRoom"){
        handleCreateRoomResponse(intent, session, callback);
    }else if(intentName == "StartRecording"){
        handlerStartResponse(intent, session, callback)
    }else if(intentName == "StopRecording"){
        handlerStopResponse(intent, session, callback)
    }else if (intentName == "AMAZON.CancelIntent"){
        handleFinishSessionRequest(intent, session, callback)
    }else if (intentName == "AMAZON.HelpIntent"){
      handleGetHelpRequest(intent, session, call)
    }else if (intentName == "AMAZON.StopIntent"){
      handleFinishSessionRequest(intent, session, callback)
    }else if(intentName == "AMAZON.YesIntent"){
      handleYesResponse(intent, session, callback)
    }else if(intentName == "AMAZON.NoIntent"){
      handleNoResponse(intent, session, callback)
    }else if(intentName == "addContact"){
      handleAddContact(intent, session, callback)
    }else{
      throw "Invalid intent"
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {

}

// ------- Skill specific logic -------

function getWelcomeResponse(callback) {
    var speechOutput = "Hi! I'm your scribbler, how can I help?"
    var reprompt = "Would you like to create a meeting room?"
    var header = "Scribblr"
    var shouldEndSession = false
    var sessionAttributes = {
      "speechOutput": speechOutput,
      "repromptText": reprompt
    }

    callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession))
}

// Create the room via API endpoints
function handleCreateRoomResponse(intent, session, callback){
      if(true){
        var speechOutput = "Something went wrong."
          getJSON(function(data){
            if(data != "ERROR"){
              speechOutput = "You succesfully started room " + data
            }
          callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, "", false))
          })
      }else{
        var speechOutput = "I'm sorry, I couldn't open the meeting room."
        var repromptText = "would you like to try again?"
        var header = "Creating Room failed."
        var shouldEndSession = false
        callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession));
  }
}

//StartRecording
function handlerStartResponse(intent, session, callback){
  var speechOutput = "Recording unavailable"

  getLameKerlin(urlrecording(), function(data){
    if(data != "ERROR"){
      speechOutput = data
    }
  callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput,"", true))
  })
}
//StopRecording
function handlerStopResponse(intent, session, callback){
  var speechOutput = "Can't stop recording"

  getLameKerlin(urlstop(), function(data){
    if(data != "ERROR"){
      speechOutput = data
    }
  callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput,"", true))
  })
}

function handleAddContact(intent, session, callback){
  //TODO check if the "contact" is right here
  var name = intent.slots.contact.value.toLowerCase();
  if(!contact[name]){
    var speechOutput = "This person is not in your contacts. Try another."
    var repromptText = "Try adding someone in your contacts."
    var header = "Not in contacts."
  }else{
    var speechOutput = name + " has been added. Do you want to add another contact?"
    var repromptText = "Do you want to add another contact?"
    var header = "Added Contact"
  }
  var shouldEndSession = false
  callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession))

  var header = "Added someone to meeting"
}

//Connection to API
function url(){
  //get request url from wikipedia
  return "http://kerlin.tech:5000/create-room"
}

function urlrecording(){
  return "http://kerlin.tech:5000/start-recording"
}

function urlstop(){
  return "http://kerlin.tech:5000/stop-recording"
}
function getLameKerlin(url, callback){
    request.get(url, function(error, response, body){
      var d = body
      if(d == "Success"){
        callback(d);
      } else {
        callback("ERROR")
      }
    })
}
function getJSON(callback){
    request.get(url(), function(error, response, body){
      var d = Number.parseInt(body)
      if(d >= 0){
        callback(d);
      } else {
        callback("ERROR")
      }
    })
}

function handleYesResponse(intent, session, callback){
  var speechOutput = "What can I do for you?"
  var repromptText = "What can I do for you?"
  var shouldEndSession = false
  callback(sessioon.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession))
}

function handleNoResponse(intent, session, callback){
  handleFinishSessionRequest(intent, session, callback)
}
function handleGetHelpRequest(intent, session, callback) {
    // Ensure that session.attributes has been initialized
    if (!session.attributes) {
        session.attributes = {};
    }
    var speechOutput = "I can open meetings, I can close meetings."
    var repromptText = "Ask me to open or close a meeting."
    callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession = false))

}

function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!" if the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Good bye!", "Call me back if you need me to do anything else", true));
}


// ------- Helper functions to build responses for Alexa -------


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
