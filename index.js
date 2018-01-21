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
    console.log(intentName);
    if(intentName == "CreateRoom"){
      //callback(session.attributes, buildSpeechletResponseWithoutCard("Test", "test", false))
      //return;
        handleCreateRoomResponse(intent, session, callback);
    }
    else if(intentName == "StartRecording"){
      //callback(session.attributes, buildSpeechletResponseWithoutCard("You succesfully started recording", "Can I do anything else for you?", false));
        handlerStartResponse(intent, session, callback)
    }else if(intentName == "CloseRoom"|| intentName == "StopRecording"){
        handlerStopResponse(intent, session, callback)
    }else if (intentName == "AMAZON.CancelIntent"){
        handleFinishSessionRequest(intent, session, callback)
    }else if (intentName == "AMAZON.HelpIntent"){
      handleGetHelpRequest(intent, session, callback)
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
              var repromptText = "Can I do anything else for you?"
            }
          callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, false))
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
  if(true){
    var speechOutput = "Recording unavailable."
      startJSON(function(data){
        if(data != "ERROR"){
          speechOutput = "Your meeting is now being recorded"
          var repromptText = "Can I do anything else for you?"
        }
      callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, false))
      })
  }else{
    var speechOutput = "I'm sorry, I couldn't record anything."
    var repromptText = "would you like to try again?"
    var header = "Recording failed."
    var shouldEndSession = false
    callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession));
   }

}

//StopRecording
function handlerStopResponse(intent, session, callback){
  var speechOutput = "Can't stop recording"
  //FIXME remove
  request.get("http://64dc0fe9.ngrok.io/stop-recording", function(error, response, body){
    speechOutput = "Your meeting is no longer being recorded"
    var repromptText = "Can I do anything else for you?"
    callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, false))
    })
}

//Get user spoken name and match to a slot
function handleAddContact(intent, session, callback){
  //TODO check if the "contact" is right here
  var name = this.event.request.intent.slots.contact.value.toLowerCase();
  console.log(name);
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

}

//Connection to the server
function url(){
  //get request url for room createion
  return "http://64dc0fe9.ngrok.io/create-room"
}

function urlrecording(){
  return "http://64dc0fe9.ngrok.io/start-recording"
}

function urlstop(){
  return "http://64dc0fe9.ngrok.io/stop-recording"
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

function startJSON(callback){
  request.get(urlrecording(), function(error, response, body){
    var d = Number.parseInt(body)
    if(d >= 0){
      callback(d);
    } else {
      callback("ERROR")
    }
  })
}

// --------- Don't touch anything bellow this line ------
function handleYesResponse(intent, session, callback){
  var speechOutput = "What can I do for you?"
  var repromptText = "What can I do for you?"
  var shouldEndSession = false
  callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession))
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
    callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, false))

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
