/**
 * A trigger-driven function that sends user info to Mailchimp
 * after a user responds to the form.
 */

/**
* Settings - Google Forms
*/

// form id to apply this to (so this does not run for all of the forms)
var subscribe_form_id = ''; // id of the Google Form

// makes it easier to retrieve form question names - key : name pairs
var form_questions = {
  "first_name" : "What is your first name?", // actual name of the 'Your name?' question on your form
  "last_name" : "What is your last name?",
  "phone" : "What's your phone number?"
};

/**
* Settings - Mailchimp
*/

// id of the list you want to add the user to
var list_id = "";
// api url
var url = "https://usXX.api.mailchimp.com/3.0/lists/" + list_id + "/members/";
// username (could be anything)
var username = "forms";
// Mailchimp api key
var api_key = "adsf-usXX"; // get this from your Mailchimp Account

// marketing permission ids for the list (if your List in Mailchimp has 'GDPR' enabled)
var marketing_permissions = [
  {
    "marketing_permission_id": "b4c9d79ea8",
    "text": "Email",
    "enabled": true
  }
];

// handles form submit (pick this function in form triggers)
function onSubmit(e) {
  // not actually used - fixes permissions when saving a trigger. Otherwise, a trigger does not know it needs the 'Forms' permission
  var current_form = FormApp.getActiveForm();
  // get current form id
  var form_id = e.source.getId();
  Logger.log("form_id = " + form_id);
  
  // compare this form ids
  if (form_id == subscribe_form_id) {
    
    Logger.log('form matches');

    var response = e.response;
    
    var email = response.getRespondentEmail();
    var items = response.getItemResponses();
    
    // object of parsed data
    var parsed = {};
    
    Logger.log('Looping through reponse items');
    
    for (i in items){
      var key = items[i].getItem().getTitle();
      var val = items[i].getResponse();
      Logger.log(key + ': ' + val);
      parsed[key] = val;
    }
    
    Logger.log('parsed: ' + parsed);
    
    var data = {
      "email_address" : email,
      "status" : "subscribed",
      "merge_fields" : {
        "FNAME" : parsed[form_questions["first_name"]],
        "LNAME" : parsed[form_questions["last_name"]],
        "PHONE" : parsed[form_questions["phone"]]
      },
      "marketing_permissions": marketing_permissions
    };
    
    Logger.log('calling sendData()');
    // perform ajax request
    sendData(data);
  } 
}

// sends data to Mailchimp API
function sendData(data){
  
  var auth = Utilities.base64Encode(username+':'+api_key, Utilities.Charset.UTF_8);
  var option = {
    headers: {
      'Authorization' : 'Basic ' + auth,
      'contentType' : 'application/json',
    },
    'method' : 'post',
    'payload' : JSON.stringify(data)
  };
  
  Logger.log('About to perform a '+ option.headers['method'] + ' request to ' + url);
  
  // perform request
  var response = UrlFetchApp.fetch(url, option);
  response2 = JSON.parse(response);
  
  Logger.log('Request complete');
  
  // Logger.log('Logging response: ' + response.getContentText());
}
