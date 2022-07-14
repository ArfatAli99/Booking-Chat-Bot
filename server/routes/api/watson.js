//======================================== [Dependecies] ================================================//

//Route Main Dependecies
const express               =   require("express");
const router                =   express.Router();
const path                  =   require("path");

//IBM watson authenticator
const { IamAuthenticator }  =   require('ibm-watson/auth');

//Watson ChatBot Dependecies
const AssistantV2           =   require('ibm-watson/assistant/v2');

//Watson Translator Dependecies
const LanguageTranslatorV3  =   require('ibm-watson/language-translator/v3');

//Watson TTS Dependecies
const TextToSpeechV1        =   require('ibm-watson/text-to-speech/v1');

//Watson STT Dependecies
const SpeechToTextV1        =   require('ibm-watson/speech-to-text/v1');

//IBM Watson STT Dependencies
const fs                    =   require('fs');

//Calling External APIs [Translation] Dependecies
const axios                 =   require('axios');

//Setting or formatting date
var moment                  =   require('moment');
const { resolve }           =   require("path");

const clm                   =   require('country-locale-map'); //Getting Language Code 
const ISO6391               =   require('iso-639-1'); //Getting Laguage Name

//======================================== [Dependecies] ================================================//

//=================================== [Service Initialization] ==========================================//

//Watson Translation API Authentication
const languageTranslator = new LanguageTranslatorV3({ version: '2018-05-01', authenticator: new IamAuthenticator({ apikey: process.env.WATSON_TRANSLATOR_APIKEY }), serviceUrl: process.env.WATSON_TRANSLATOR_URL, disableSslVerification: true });

//Watson Assistant API Authentication
const assistant = new AssistantV2({ version: '2020-04-01', disableSslVerification: true, authenticator: new IamAuthenticator({ apikey: process.env.WATSONN_ASSISTANT_APIKEY, }), serviceUrl: process.env.WATSONN_ASSISTANT_URL });

//IBM STT API Authentication
const speechToText = new SpeechToTextV1({ authenticator: new IamAuthenticator({ apikey: process.env.WATSON_STT_APIKEY }), serviceUrl: process.env.WATSON_STT_URL });

//Watson TTS API Authentication 
const textToSpeech = new TextToSpeechV1({ authenticator: new IamAuthenticator({ apikey: process.env.WATSON_TTS_APIKEY }), serviceUrl: process.env.WATSON_TTS_URL });

//=================================== [Service Initialization] ==========================================//

//==================================== [Language Preference] =============================================//
//var current_module = null;
//var user_company_ID = null;


var user_details = {};

router.post('/changeLanguage', async (req, res) => {

    if(!user_details[req.session.user_name])
    {
        user_details[req.session.user_name] = {};
        user_details[req.session.user_name].prefferedLanguage = "English";
        user_details[req.session.user_name].languageCode = "en";
    }
    else
    {
        user_details[req.session.user_name].prefferedLanguage = "English";
        user_details[req.session.user_name].languageCode = "en";
    }

    user_details[req.session.user_name].languageCode        =   req.body.languageCode;
    user_details[req.session.user_name].prefferedLanguage   =   req.body.language;

    var response = { status : 1 };
    res.json(response);
});

//==================================== [Language Preference] =============================================//

//======================================= [Helping functions] ===========================================//

//Getting user details
async function getUserDetails(id, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', requestType : "getUserDetails", userID : id }, session_handle_axios);
    if(DBresponse.data != undefined)
    {
        return DBresponse.data.record;
    }
    else
    {
        return null;
    }
}

function formatFlightTimes(time)
{   

    if(time.indexOf('+'))
    {
        var times = time.split('+');
        var time1 = moment(times[0], "HH:mm:ss");
        var time2 = moment(times[1], "HH:mm");
        var formatedTime = time1.add(time2.format('HH'), 'hours').format('hh:mm A');
    }
    else if(time.indexOf('Z') || time.indexOf('z'))
    {
        var times = moment(time, "HH:mm:ss");
        var formatedTime = times.format('hh:mm A');
    }
    
    return formatedTime;
}

function timeConvert(n) {
    var num = n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    return rhours + " H(s) and " + rminutes + " M(s)";
}

async function getCityName(cityCode, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', requestType: "getCityName", cityCode : cityCode }, session_handle_axios);
    if(DBresponse.data.recordObj != undefined)
    {
        return DBresponse.data.recordObj.City;
    }
    else
    {
        return cityCode;
    }
    
}

function strToMins(t) 
{
    var s = t.split(":");
    return Number(s[0]) * 60 + Number(s[1]);
}

function minsToStr(t) 
{
    return Math.trunc(t / 60)+':'+('00' + t % 60).slice(-2);
}

function calTimes(time1, time2, action) 
{
    if(action = "plus")
    {
        var result = minsToStr( strToMins(time1) + strToMins(time2) );
    }
    else if(action = "minus")
    {
        var result = minsToStr( strToMins(time1) - strToMins(time2) );
    }
    
    return result;
}  

function formatDate(date)
{
    var date1 = date.split('-');
    var newDate = `${date1[2]}-${date1[0]}-${date1[1]}`;
    return newDate;
}

async function setFlightTime(array, type, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var APIresponse = await axios.post( process.env.IP + '/api/save/setFlightDateTime', { data : array }, session_handle_axios);
    return APIresponse.data;
}

async function getUserGDS(id, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/getConcernedGDS', { purpose : "concernedGDS", user_id : id }, session_handle_axios);
    return DBresponse.data.GDS;
}

async function translate(to, text, user_name) 
{

    if(!to)
    {
        var to  =   user_details[user_name].languageCode;
    }   

    if(to == "en" || to == "EN")
    {
        var result = text;
    }
    else
    {
        let payload = { source : "en", target : to, text : text };
        
        try 
        {
            var response    =   await languageTranslator.translate(payload);
            var result      =   response['result']?.translations[0]?.translation;
        } 
        catch(error)
        {
            console.log("===============================");
            console.log(error);
            console.log("watson.js");
            console.log("===============================");

            var result = text;
        }
    }

    return result;
}

async function getUserCountry(userID, current_session)
{
    try
    {
        let session_handle_axios = { headers: { cookie : current_session } };
        var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', userID : userID, requestType : "getUserCountry" }, session_handle_axios);
    
        if(DBresponse?.data && DBresponse?.data?.records && DBresponse?.data?.records[0])
        {
            var country_code = DBresponse?.data?.records[0][0]?.ez_country_abbr;
            if(country_code)
            {
                return country_code;
            }
            else
            {
                return "US";
            }
        }
        else
        {
            return "US";
        }
    }
    catch(error)
    {
        return "US";
    }
}

//======================================= [Helping functions] ===========================================//


//=================================== [Chat Route Implementation] =======================================//

//Initialize Chat (Error Handling Completed)
router.post('/initialize', async (req, res) => {

    var userDetails = req.body.user_details;

    //Initializing Global Variables
    if(!user_details[req.session.user_name])
    {
        user_details[req.session.user_name] = {};
        user_details[req.session.user_name].current_module      =   null;
        user_details[req.session.user_name].user_company_ID     =   null;
        user_details[req.session.user_name].prefferedLanguage   =   "English";
        user_details[req.session.user_name].languageCode        =   "en";
    }
    else
    {
        user_details[req.session.user_name].current_module      =   null;
        user_details[req.session.user_name].user_company_ID     =   null;
        user_details[req.session.user_name].prefferedLanguage   =   "English";
        user_details[req.session.user_name].languageCode        =   "en";
    }
    
    if( Object.entries(userDetails).length > 0 )
    {
        user_details[req.session.user_name].user_company_ID     =   userDetails.COMPANY_ID;
        user_details[req.session.user_name].userDetails         =   userDetails;

        try
        {
            var session_idObj   =   await assistant.createSession({ assistantId: process.env.WATSONN_ASSISTANT_ID });
            var session_id      =   session_idObj['result'].session_id;

            //Constructing PayLoad
            let payload = {
                assistantId: process.env.WATSONN_ASSISTANT_ID,
                sessionId: session_id,
                input: {
                    'message_type': 'text',
                    'text': "",
                    'options': {
                        'return_context': true
                    }
                },
                context: {
                    skills : {
                        "main skill": {
                            user_defined : {
                                firstName           :   userDetails.FIRST_NAME,
                                lastName            :   userDetails.LAST_NAME,
                                userid              :   userDetails.USER_ID, 
                                seats               :   0,
                                countrycode         :   userDetails.COUNTRY_ID,
                                email               :   userDetails.USER_EMAIL,
                                companyID           :   userDetails.COMPANY_ID,
                                sessionid           :   session_id,
                                airtype             :   null,
                                cookie_id           :   req.headers.cookie,
                                user_language_code  :   userDetails.PREFFERED_LANGUAGE_CODE,
                                user_language       :   userDetails.PREFFERED_LANGUAGE_NAME,
                                traveler_role       :   userDetails.TRAVELER_TYPE
                            }
                        }
                    }
                }
            }

            try
            {
                var BotResponse     =   await assistant.message(payload);
                var responseCount   =   (BotResponse['result'].output.generic).length;

                /*
                
                - If there is only one response from IBM Watson Service, the structure of API response is changed
                - If there is multiple responses from IBM Watson Service, the structure of API response is changed
                - Thats why we used check to handle the response from IBM Watson 
                
                */

                //If there is only one response
                if(responseCount === 1)
                {
                    var botResp         =   BotResponse['result'].output.generic[0];
                    var responseType    =   botResp.response_type;

                    if(responseType == "text")
                    {
                        var respTitle   =   botResp.text;
                        var options     =   null;
                    }
                    else
                    {
                        //Creating array to store options
                        var options         =   [];
                        var respTitle       =   botResp.title;
                        var optionsCount    =   (botResp.options).length;

                        for(var i = 0; i < optionsCount; i++)
                        {
                            optionObj = { optionLabel : botResp.options[i].label, optionValue : botResp.options[i].value.input.text };
                            options.push(optionObj);
                        }
                    }

                    var sendObj = {  
                        status          :   200, 
                        response        :   "single", 
                        responseType    :   responseType,  
                        title           :   respTitle,
                        options         :   options
                    }

                }

                //If there are multiple responses
                else
                {
                    var arrayOfResponses = [];
                    
                    for(var j = 0; j < responseCount; j++)
                    {
                        var botResp         =   BotResponse['result'].output.generic[j];
                        var responseType    =   botResp.response_type;
                    
                        if(responseType === "text")
                        {
                            var respTitle   =   botResp.text;
                            var options     =   null;
                        }
                        else
                        {
                            var respTitle       = botResp.title;
                            var optionsCount    = (botResp.options).length;
                            var options         = [];

                            for(var i = 0; i < optionsCount; i++)
                            {
                                optionObj = {
                                    optionLabel : botResp.options[i].label,
                                    optionValue : botResp.options[i].value.input.text
                                }
                                options.push(optionObj);
                            }
                        }

                        var temp_obj = {
                            status : 200,
                            responseType: responseType,
                            title: respTitle,
                            options: options
                        }

                        arrayOfResponses.push(temp_obj);
                    }

                    var sendObj = { 
                        response : "multiple", 
                        arrayObjs : arrayOfResponses 
                    };
                }

                //IBM Watson Context Variables

                if(BotResponse.result.context.skills["main skill"].user_defined.sessionid)
                {
                    sendObj['sessionID'] = BotResponse.result.context.skills["main skill"].user_defined.sessionid;
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.LanguageChangeQuery)
                {
                    var request = BotResponse.result.context.skills["main skill"].user_defined.LanguageChangeQuery;
                    
                    if(request === "askForLanguageChange")
                    {
                        var language = BotResponse.result.context.skills["main skill"].user_defined.language;
                        var languageCode = BotResponse.result.context.skills["main skill"].user_defined.languageCode;
                        
                        var statement_one       = `Based on your location it seems you'd prefer talking in ${language}?`;
                        var statement_two       = await translate(languageCode, statement_one, null);
                        var option_translated   = await translate(languageCode, `Yes, continue in ${language}`, null);
                        var translating_text    = await translate(languageCode, 'Applying Language Preferences', null);

                        var contextParamsObj = { 
                            statement_one : statement_one, 
                            statement_two: statement_two, 
                            option_translated : option_translated, 
                            langauge_code : languageCode,
                            language : language,
                            translating_text : translating_text
                        };

                        sendObj['context'] =  request;
                        sendObj['contextParams'] = contextParamsObj;
                        sendObj['contextType'] = "LanguageChangeQuery";
                    }
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.requiredData)
                {
                    sendObj['requiredData'] = BotResponse.result.context.skills["main skill"].user_defined.requiredData;
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.checkUserRole)
                {
                    if(BotResponse.result.context.skills["main skill"].user_defined.checkUserRole = "checkUserRole")
                    {
                        sendObj['checkUserRole'] = "checkUserRole";
                        sendObj['UserID'] = BotResponse.result.context.skills["main skill"].user_defined.UserID;
                    }
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal)
                {

                    var request_type = BotResponse.result.context.skills["main skill"].user_defined.QueryLocal;

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "initializeVariables")
                    {
                        var contextParamsObj = null;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "getCurrentTravelerInfo")
                    {
                        var contextParamsObj = null;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "getCityName")
                    {
                        var city_code           =   BotResponse.result.context.skills["main skill"].user_defined.city_code;
                        var paramteres          =   { city_code : city_code };
                        var contextParamsObj    =   paramteres;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "store_dates")
                    {
                        var trip_departure_Date =   BotResponse.result.context.skills["main skill"].user_defined.user_departure_date;
                        var trip_return_date    =   BotResponse.result.context.skills["main skill"].user_defined.user_return_date;
                        var paramteres          =   { trip_departure_Date : trip_departure_Date , trip_return_date : trip_return_date};
                        var contextParamsObj    =   paramteres;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "checkReservationRequirement")
                    {
                        var reservation_type    =   BotResponse.result.context.skills["main skill"].user_defined.reservationType;
                        var paramteres          =   { reservation_type : reservation_type };
                        var contextParamsObj    =   paramteres;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "get_traveler_most_frequent_city")
                    {
                        var contextParamsObj    =   null;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "makeFlightReservation")
                    {

                        if(flightType == "oneway")
                        {
                            var date    =   BotResponse.result.context.skills["main skill"].user_defined.date;
                            var time    =   BotResponse.result.context.skills["main skill"].user_defined.time;
                            var origin    =   BotResponse.result.context.skills["main skill"].user_defined.origin;
                            var flightType    =   BotResponse.result.context.skills["main skill"].user_defined.flightType;
                            var destination    =   BotResponse.result.context.skills["main skill"].user_defined.destination;

                            var paramteres  =   { 
                                date : date,
                                time : time,
                                origin : origin,
                                flightType: flightType,
                                destination: destination
                            };
                        }

                        else
                        {
                            var flightType    =   BotResponse.result.context.skills["main skill"].user_defined.flightType;
                            var returnDate    =   BotResponse.result.context.skills["main skill"].user_defined.returnDate;
                            var returnTime    =   BotResponse.result.context.skills["main skill"].user_defined.returnTime;
                            var departureDate    =   BotResponse.result.context.skills["main skill"].user_defined.departureDate;
                            var departureTime    =   BotResponse.result.context.skills["main skill"].user_defined.departureTime;
                            var departureCityGo    =   BotResponse.result.context.skills["main skill"].user_defined.departureCityGo;
                            var destinationCityGo    =   BotResponse.result.context.skills["main skill"].user_defined.destinationCityGo;
                            var departureCityReturn    =   BotResponse.result.context.skills["main skill"].user_defined.departureCityReturn;
                            var destinationCityReturn    =   BotResponse.result.context.skills["main skill"].user_defined.destinationCityReturn;

                            var paramteres = {
                                flightType : flightType,
                                returnDate : returnDate,
                                returnTime : returnTime,
                                departureDate : departureDate,
                                departureTime : departureTime,
                                departureCityGo : departureCityGo,
                                destinationCityGo : destinationCityGo,
                                departureCityReturn : departureCityReturn,
                                destinationCityReturn : destinationCityReturn
                            }
                        }
                        
                        var contextParamsObj    =   paramteres;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "addTripPurpose")
                    {
                        var tripPurposeID       =   BotResponse.result.context.skills["main skill"].user_defined.tripPurposeID;
                        var paramteres          =   { tripPurposeID : tripPurposeID };
                        var contextParamsObj    =   paramteres;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "addHotelReservationInformation")
                    {

                        var cityArea    =   BotResponse.result.context.skills["main skill"].user_defined.cityArea;
                        var hotelName    =   BotResponse.result.context.skills["main skill"].user_defined.hotelName;
                        var checkinDate    =   BotResponse.result.context.skills["main skill"].user_defined.checkinDate;
                        var checkOutDate    =   BotResponse.result.context.skills["main skill"].user_defined.checkOutDate;

                        var paramteres  =   { 
                            cityArea : cityArea,
                            hotelName : hotelName,
                            checkinDate  :checkinDate,
                            checkOutDate : checkOutDate
                        };
                        
                        
                        var contextParamsObj    =   paramteres;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "makeCarReservation")
                    {

                        var PickUpCity    =   BotResponse.result.context.skills["main skill"].user_defined.PickUpCity;
                        var PickUpDate    =   BotResponse.result.context.skills["main skill"].user_defined.PickUpDate;
                        var PickUpTime    =   BotResponse.result.context.skills["main skill"].user_defined.PickUpTime;
                        var DropOffCity    =   BotResponse.result.context.skills["main skill"].user_defined.DropOffCity;
                        var DropOffDate    =   BotResponse.result.context.skills["main skill"].user_defined.DropOffDate;
                        var DropOffTime    =   BotResponse.result.context.skills["main skill"].user_defined.DropOffTime;

                        var paramteres  =   { 
                            PickUpCity : PickUpCity,
                            PickUpDate : PickUpDate,
                            PickUpTime : PickUpTime,
                            DropOffCity : DropOffCity,
                            DropOffDate : DropOffDate,
                            DropOffTime : DropOffTime
                        };
                        
                        
                        var contextParamsObj    =   paramteres;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "checkForReservationInfo")
                    {
                        var contextParamsObj    =   null;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "addSpecialReq")
                    {
                        var specialRequest      =   BotResponse.result.context.skills["main skill"].user_defined.specialRequest;
                        var parameters          =   { specialRequest : specialRequest };
                        var contextParamsObj    =   parameters;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "emptyTravelersInfoArray")
                    {
                        var contextParamsObj    =   null;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "get_previous_iternery_data")
                    {
                        var reservation_mod  =   BotResponse.result.context.skills["main skill"].user_defined.reservation_module;
                        var parameters          =   { reservation_mod : reservation_mod };
                        var contextParamsObj    =   parameters;
                    }

                    sendObj['context'] =  request_type;
                    sendObj['contextParams'] = contextParamsObj;
                    sendObj['contextType'] = "QueryLocal";
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.QueryDB)
                {
                    var DBrequest = BotResponse.result.context.skills["main skill"].user_defined.QueryDB;
                    
                    if(DBrequest === "getConcTravelers")
                    {
                        var arranger_email  = BotResponse.result.context.skills["main skill"].user_defined.arrangerEmail;
                        var travelerStatus  = BotResponse.result.context.skills["main skill"].user_defined.travelerStatus;
                        var firstName       = BotResponse.result.context.skills["main skill"].user_defined.firstName;
                        var lastName        = BotResponse.result.context.skills["main skill"].user_defined.lastName;
                        var parameters      = { 
                            arranger_email : arranger_email, 
                            travelerStatus : travelerStatus, 
                            firstName: firstName, 
                            lastName : lastName 
                        };
                        
                        sendObj['context']      = DBrequest;
                        sendObj['contextType']  = "QueryDB";
                        sendObj['params']       = parameters;
                    }
                }

                res.json(sendObj);
            }
            catch(error)
            {
                console.log("===============================");
                console.log(error);
                console.log("watson.js");
                console.log("===============================");

                var response = { status : 404, message : "IBM Watson Assistant Service is currently down. Please try again later." };
                res.json(response);
            } 
        }
        catch(error)
        {
            console.log("===============================");
            console.log(error);
            console.log("watson.js");
            console.log("===============================");

            var response = { status : 404, message : "IBM Watson Assistant Service is currently down. Please try again later." };
            res.json(response);
        }
    }
    else
    {
        var response = { status : 404, message : "Unable to identify the user. Can not continue the reservation process." };
        res.json(response);
    }
});

//Mannaging Chat (Error Handling Completed)
router.post('/message', async (req, res)=>{

    var resText                     =   req.body.text;
    var sessionID                   =   req.body.sessionID;
    var hotelName                   =   req.body.hotelName;
    var getPickUpAddress            =   req.body.getPickUpAddress;
    var getDropOffAddress           =   req.body.getDropOffAddress;
    var specialRequest              =   req.body.specialRequest;
    var email                       =   req.body.email;
    var travelerInfo                =   req.body.travelerInfo;
    var city_name_result            =   req.body.city_name_result;
    var getting_traveler_most_frequent_city =   req.body.getting_traveler_most_frequent_city;
    var get_previous_iternery_info_segment = req.body.get_previous_iternery_info_segment;

    var context_variables           =   {};
    context_variables['cookie_id']  =   req.headers.cookie;

    if(hotelName) { context_variables['hotelName'] = hotelName; };
    if(getPickUpAddress) { context_variables['getPickUpAddress'] = getPickUpAddress };
    if(getDropOffAddress) { context_variables['getDropOffAddress'] = getDropOffAddress };
    if(specialRequest) { context_variables['specialRequest'] = specialRequest };
    if(email) { context_variables['email'] = email };
    if(travelerInfo) { context_variables['currentTravelerInfo'] = travelerInfo };
    if(city_name_result) { context_variables['city_name_result'] = city_name_result };
    if(getting_traveler_most_frequent_city) { context_variables['most_frequent_city'] = getting_traveler_most_frequent_city };
    if(get_previous_iternery_info_segment) { context_variables['previous_iternery_info_segment'] = get_previous_iternery_info_segment };

    if(resText)
    {
        if(sessionID)
        {   
            var payload = {
                assistantId: process.env.WATSONN_ASSISTANT_ID,
                sessionId: sessionID,
                input: {
                    'message_type': 'text',
                    'text': resText,
                    'options': {
                        'return_context': true
                    }
                },
                context: {
                    skills : {
                        "main skill": {
                            user_defined : context_variables
                        }
                    }
                }
            }

            try
            {

                var BotResponse     =   await assistant.message(payload);
                var responseCount   =   (BotResponse['result'].output.generic).length;

                if(responseCount === 1)
                {
                    var botResp         =   BotResponse['result'].output.generic[0];
                    var responseType    =   botResp.response_type;
                    
                    if(responseType === "text")
                    {
                        var respTitle   =   await translate(user_details[req.session.user_name].languageCode, botResp.text, null);
                        var options     =   null;
                    } 
                    else
                    {
                        var respTitle       =   await translate(user_details[req.session.user_name].languageCode, botResp.title, null);
                        var optionsCount    =   (botResp.options).length;
                        var options         =   [];

                        for(var i = 0; i < optionsCount; i++)
                        {
                            optionObj = {
                                optionLabel : await translate(user_details[req.session.user_name].languageCode, botResp.options[i].label, null),
                                optionValue : botResp.options[i].value.input.text
                            }
                            options.push(optionObj);
                        }
                    }

                    var sendObj = { 
                        status : 200, 
                        response : "single", 
                        responseType: responseType, 
                        title: respTitle, 
                        options: options 
                    };
                }
                else
                {
                    var arrayOfResponses = [];
                    for(var j = 0; j < responseCount; j++)
                    {
                        var botResp         =   BotResponse['result'].output.generic[j];
                        var responseType    =   botResp.response_type;

                        if(responseType === "text")
                        {
                            var respTitle = await translate(user_details[req.session.user_name].languageCode, botResp.text, null);
                            var options   = null;
                        }
                        else
                        {
                            var respTitle       =   await translate(user_details[req.session.user_name].languageCode,botResp.title, null);
                            var optionsCount    =   (botResp.options).length;
                            var options         =   [];

                            for(var i = 0; i < optionsCount; i++)
                            {
                                optionObj = {
                                    optionLabel : await translate(user_details[req.session.user_name].languageCode, botResp.options[i].label, null),
                                    optionValue : botResp.options[i].value.input.text
                                }
                                options.push(optionObj);
                            }
                        }

                        var temp_obj = { 
                            status          :   200, 
                            responseType    :   responseType, 
                            title           :   respTitle, 
                            options         :   options 
                        };

                        arrayOfResponses.push(temp_obj);
                    }
                    
                    var sendObj = {
                        status      :   200, 
                        response    :   "multiple", 
                        arrayObjs   :   arrayOfResponses 
                    };
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.CloseChat)
                {
                    sendObj['CloseChat'] = BotResponse.result.context.skills["main skill"].user_defined.CloseChat;
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.requiredData)
                {
                    sendObj['requiredData'] = BotResponse.result.context.skills["main skill"].user_defined.requiredData;
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.QueryDB)
                {
                    var DBrequest = BotResponse.result.context.skills["main skill"].user_defined.QueryDB;
                    
                    if(DBrequest === "getPreviousBooking")
                    {
                        var userID = BotResponse.result.context.skills["main skill"].user_defined.userid;
                        sendObj['context'] = BotResponse.result.context.skills["main skill"].user_defined.QueryDB;
                        sendObj['contextType'] = "QueryDB";
                        sendObj['userID'] = userID;
                    }
                    if(DBrequest === "GetAirportDetails")
                    {
                        sendObj['context'] = BotResponse.result.context.skills["main skill"].user_defined.QueryDB;
                        sendObj['contextType'] = "QueryDB";
                        sendObj['userID'] = null;
                    }
                    if(DBrequest === "getTripPurposes")
                    {
                        var companyID = BotResponse.result.context.skills["main skill"].user_defined.companyID;
                        var countryID = BotResponse.result.context.skills["main skill"].user_defined.countrycode;
                        var parameters = { companyID : companyID, countryID : countryID };

                        sendObj['context'] = BotResponse.result.context.skills["main skill"].user_defined.QueryDB;
                        sendObj['contextType'] = "QueryDB";
                        sendObj['params'] = parameters;
                    }
                    if(DBrequest === "checkPreviousFlights")
                    {

                        var destination_city = BotResponse.result.context.skills["main skill"].user_defined.destination_city_check;
                        var userID = BotResponse.result.context.skills["main skill"].user_defined.userID;
                        var new_dep_date = BotResponse.result.context.skills["main skill"].user_defined.new_trip_dep_date;
                        var new_return_date = BotResponse.result.context.skills["main skill"].user_defined.new_trip_return_date;
                        var travelerRole = BotResponse.result.context.skills["main skill"].user_defined.travelerRole;
                        var firstName = BotResponse.result.context.skills["main skill"].user_defined.firstName;
                        var lastName = BotResponse.result.context.skills["main skill"].user_defined.lastName;


                        var parameters = { destination_city : destination_city, userID : userID,
                            dep_date : new_dep_date,
                            return_date : new_return_date,
                            travelerRole : travelerRole,
                            firstName : firstName,
                            lastName : lastName
                        };
                        
                        sendObj['context'] = DBrequest;
                        sendObj['contextType'] = "QueryDB";
                        sendObj['params'] = parameters;
                    }
                    if(DBrequest === "getConcTravelers")
                    {
                        var arranger_email = BotResponse.result.context.skills["main skill"].user_defined.arrangerEmail;
                        var travelerStatus = BotResponse.result.context.skills["main skill"].user_defined.travelerStatus;
                        var firstName = BotResponse.result.context.skills["main skill"].user_defined.firstName;
                        var lastName = BotResponse.result.context.skills["main skill"].user_defined.lastName;
                        var parameters = { arranger_email : arranger_email, travelerStatus : travelerStatus, firstName: firstName, lastName : lastName };
                        
                        sendObj['context'] = DBrequest;
                        sendObj['contextType'] = "QueryDB";
                        sendObj['params'] = parameters;
                    }
                }
                    
                if(BotResponse.result.context.skills["main skill"].user_defined.QueryAPI)
                {
                    var APIrequest = BotResponse.result.context.skills["main skill"].user_defined.QueryAPI;

                    if(APIrequest === "getFlightDetails")       
                    {
                        var flightType = BotResponse.result.context.skills["main skill"].user_defined.flightType;

                        //now checking for flight type
                        if(flightType === "oneway")
                        {
                            var departureCode = BotResponse.result.context.skills["main skill"].user_defined.origin;
                            var destinationCode = BotResponse.result.context.skills["main skill"].user_defined.destination;
                            var departureDate = BotResponse.result.context.skills["main skill"].user_defined.date;
                            var departureTime = BotResponse.result.context.skills["main skill"].user_defined.time;
                            var numOfSeats = BotResponse.result.context.skills["main skill"].user_defined.seats;
                            var invoke_source = BotResponse.result.context.skills["main skill"].user_defined.invoke_source;
                            var div_id = BotResponse.result.context.skills["main skill"].user_defined.div_id;
                            var hotel_difference = BotResponse.result.context.skills["main skill"].user_defined.hotel_difference;
                            var rental_difference = BotResponse.result.context.skills["main skill"].user_defined.rental_difference;
                            var flight_carrier = BotResponse.result.context.skills["main skill"].user_defined.flight_carrier;

                            var contextParamsObj = { flightType : flightType,
                                departure: departureCode, destination: destinationCode,
                                date: departureDate, time: departureTime, numOfSeats: numOfSeats,
                                invoke_source : invoke_source,
                                hotel_difference:hotel_difference,
                                rental_difference :rental_difference,
                                div_id:div_id,
                                flight_carrier:flight_carrier
                            };
                        }

                        if(flightType === "roundtrip")
                        {
                            var departureOrigin = BotResponse.result.context.skills["main skill"].user_defined.departureOrigin;
                            var departureDestination = BotResponse.result.context.skills["main skill"].user_defined.departureDestination;
                            var returnOrigin = BotResponse.result.context.skills["main skill"].user_defined.returnOrigin;
                            var returnDestination = BotResponse.result.context.skills["main skill"].user_defined.returnDestination;
                            var departureDate = BotResponse.result.context.skills["main skill"].user_defined.departureDate;
                            var departureTime = BotResponse.result.context.skills["main skill"].user_defined.departureTime;
                            var returnDate = BotResponse.result.context.skills["main skill"].user_defined.returnDate;
                            var returnTime = BotResponse.result.context.skills["main skill"].user_defined.returnTime;
                            var seats = BotResponse.result.context.skills["main skill"].user_defined.seats;
                            var invoke_source = BotResponse.result.context.skills["main skill"].user_defined.invoke_source;
                            var div_id = BotResponse.result.context.skills["main skill"].user_defined.div_id;
                            var hotel_difference = BotResponse.result.context.skills["main skill"].user_defined.hotel_difference;
                            var rental_difference = BotResponse.result.context.skills["main skill"].user_defined.rental_difference;
                            var flight_carrier = BotResponse.result.context.skills["main skill"].user_defined.flight_carrier;

                            var contextParamsObj = { flightType : flightType, departureOrigin : departureOrigin, 
                                departureDestination : departureDestination, returnOrigin : returnOrigin, 
                                returnDestination : returnDestination, departureDate : departureDate, 
                                departureTime : departureTime, returnDate : returnDate, returnTime : returnTime, 
                                seats : seats, invoke_source :invoke_source,div_id : div_id,
                                hotel_difference:hotel_difference,
                                rental_difference :rental_difference,
                                flight_carrier:flight_carrier

                            };
                        }

                        if(flightType === "multicity")
                        {
                            var flightDetails = BotResponse.result.context.skills["main skill"].user_defined.flightDetails;
                            var seats = BotResponse.result.context.skills["main skill"].user_defined.seats;
                            var contextParamsObj = { flightType : flightType, seats : seats, flightDetails : flightDetails };
                        }
                    
                        sendObj['context'] =  APIrequest;
                        sendObj['contextParams'] = contextParamsObj;
                        sendObj['contextType'] = "QueryAPI";
                    }

                    if(APIrequest === "getForInputFeilds")
                    {
                        var formID = BotResponse.result.context.skills["main skill"].user_defined.formInputDetails;
                        var userID = BotResponse.result.context.skills["main skill"].user_defined.userid;
                        var travelerType = BotResponse.result.context.skills["main skill"].user_defined.travelerType;
                        var currentTraveller = BotResponse.result.context.skills["main skill"].user_defined.currentTraveller;
                        var numOfTravelers = BotResponse.result.context.skills["main skill"].user_defined.numOfTravelers;
                        var companyID = BotResponse.result.context.skills["main skill"].user_defined.companyID;
                        var countryID = BotResponse.result.context.skills["main skill"].user_defined.countrycode;
                        var sessionID = BotResponse.result.context.skills["main skill"].user_defined.sessionid;
                        var tripPurpose = BotResponse.result.context.skills["main skill"].user_defined.tripPurpose;
                        var travelerEmail = BotResponse.result.context.skills["main skill"].user_defined.travelerEmail;
                        
                        if(BotResponse.result.context.skills["main skill"].user_defined.arrangerID)
                        {
                            var arrangerID = BotResponse.result.context.skills["main skill"].user_defined.arrangerID;
                        }
                        else
                        {
                            var arrangerID = null;
                        }
                        
                        var contextParamsObj = { formTypeID : formID, userID :  userID, travelerType : travelerType, currentTraveller: currentTraveller, numOfTravelers : numOfTravelers, companyID: companyID, countryID: countryID, sessionID : sessionID, tripPurpose : tripPurpose, travelerEmail : travelerEmail, arrangerID : arrangerID };                                

                        sendObj['context'] =  APIrequest;
                        sendObj['contextParams'] = contextParamsObj;
                        sendObj['contextType'] = "QueryAPI";
                    }

                    if(APIrequest === "editTravelerInfo")
                    {
                        var userID = BotResponse.result.context.skills["main skill"].user_defined.userid;
                        var formInputDetails = BotResponse.result.context.skills["main skill"].user_defined.formInputDetails;
                        var travelerType = BotResponse.result.context.skills["main skill"].user_defined.travelerType;
                        var numOfTravelers = BotResponse.result.context.skills["main skill"].user_defined.numOfTravelers;
                        var companyID = BotResponse.result.context.skills["main skill"].user_defined.compnayID;
                        var countryID = BotResponse.result.context.skills["main skill"].user_defined.countryID;
                        var contextParamsObj = { userID :  userID, formInputDetails : formInputDetails, travelerType : travelerType, numOfTravelers: numOfTravelers, companyID : companyID, countryID : countryID };
                        
                        sendObj['context'] =  APIrequest;
                        sendObj['contextParams'] = contextParamsObj;
                        sendObj['contextType'] = "QueryAPI";
                    }

                    if(APIrequest === "flightReservation")
                    {
                        var TravelerID = BotResponse.result.context.skills["main skill"].user_defined.TravelerID;
                        var userID = BotResponse.result.context.skills["main skill"].user_defined.userid;
                        var companyID = BotResponse.result.context.skills["main skill"].user_defined.companyID;
                        var countryID = BotResponse.result.context.skills["main skill"].user_defined.countrycode;
                        
                        var contextParamsObj = { userID :  userID, companyID : companyID, countryID : countryID, TravelerID : TravelerID };

                        sendObj['context'] =  APIrequest;
                        sendObj['contextParams'] = contextParamsObj;
                        sendObj['contextType'] = "QueryAPI";
                    }

                    if(APIrequest === "getHotelDetails")
                    {
                        var city            =   BotResponse.result.context.skills["main skill"].user_defined.city;
                        var checkInDate     =   BotResponse.result.context.skills["main skill"].user_defined.checkInDate;
                        var checkOutDate    =   BotResponse.result.context.skills["main skill"].user_defined.checkOutDate;
                        var invoke_source   =   BotResponse.result.context.skills["main skill"].user_defined.invoke_source;
                        var div_id          =   BotResponse.result.context.skills["main skill"].user_defined.div_id;
                        
                        var contextParamsObj = { 
                            city :  city, 
                            checkInDate : checkInDate, 
                            invoke_source:invoke_source,
                            div_id : div_id,
                            checkOutDate : checkOutDate 
                        };

                        sendObj['context'] =  APIrequest;
                        sendObj['contextParams'] = contextParamsObj;
                        sendObj['contextType'] = "QueryAPI";
                    }

                    if(APIrequest === "getReservationTypesDetails")
                    {
                        sendObj['context'] = APIrequest;
                        sendObj['contextType'] = "QueryAPI";
                    }

                    if(APIrequest === "getReservationTypesAltDetails")
                    {
                        if(BotResponse.result.context.skills["main skill"].user_defined.travelerID != undefined)
                        {
                            sendObj['travelerID'] = BotResponse.result.context.skills["main skill"].user_defined.travelerID;
                        }
                        else
                        {
                            sendObj['travelerID'] = 0;
                        }
                        sendObj['context'] = APIrequest;
                        sendObj['contextType'] = "QueryAPI";
                    }

                    if(APIrequest === "repeatPreviousReservation")
                    {
                        sendObj['context'] = APIrequest;
                        var reservationType = BotResponse.result.context.skills["main skill"].user_defined.reservationType;
                        var travelerID = BotResponse.result.context.skills["main skill"].user_defined.travelerID;
                        if(BotResponse.result.context.skills["main skill"].user_defined.newDate != undefined)
                        {
                            var newDate = BotResponse.result.context.skills["main skill"].user_defined.newDate;
                        }
                        sendObj['contextType'] = "QueryAPI";
                        sendObj['requestParams'] = { reservationType : reservationType, travelerID : travelerID, newDate : newDate };
                    }

                    if(APIrequest === "getRentalCarDetails")
                    {
                        var pick_up_city = BotResponse.result.context.skills["main skill"].user_defined.pick_up_city;
                        var pick_up_date = BotResponse.result.context.skills["main skill"].user_defined.pick_up_date;
                        var pick_up_time = BotResponse.result.context.skills["main skill"].user_defined.pick_up_time;
                        var drop_off_city = BotResponse.result.context.skills["main skill"].user_defined.drop_off_city;
                        var drop_off_date = BotResponse.result.context.skills["main skill"].user_defined.drop_off_date;
                        var drop_off_time = BotResponse.result.context.skills["main skill"].user_defined.drop_off_time;
                        var invoke_source = BotResponse.result.context.skills["main skill"].user_defined.invoke_source;
                        var div_id = BotResponse.result.context.skills["main skill"].user_defined.div_id;
                        var rental_car_details = { pick_up_city: pick_up_city, pick_up_date : pick_up_date,
                                pick_up_time : pick_up_time, drop_off_city : drop_off_city, drop_off_date : drop_off_date, 
                                drop_off_time: drop_off_time,invoke_source:invoke_source,div_id:div_id };

                        sendObj['contextType'] = "QueryAPI";
                        sendObj['context'] = APIrequest;
                        sendObj['contextParams'] = rental_car_details;
                    }

                    if(APIrequest === "getTownCarDetails")
                    {
                        var carType = BotResponse.result.context.skills["main skill"].user_defined.carType;
                        
                        if(carType == "oneway")
                        {
                            var numOfPassengers = BotResponse.result.context.skills["main skill"].user_defined.numOfPassengers;
                            var townPickUpTime = BotResponse.result.context.skills["main skill"].user_defined.townPickUpTime;
                            var townCarPickUpDate = BotResponse.result.context.skills["main skill"].user_defined.townCarPickUpDate;
                            var getPickUpAddress = BotResponse.result.context.skills["main skill"].user_defined.getPickUpAddress;
                            var getDropOffAddress = BotResponse.result.context.skills["main skill"].user_defined.getDropOffAddress;

                            var town_car_details = { carType: carType, numOfPassengers : numOfPassengers, townPickUpTime : townPickUpTime, townCarPickUpDate : townCarPickUpDate, getPickUpAddress : getPickUpAddress, getDropOffAddress : getDropOffAddress };
                        }
                        else if(carType == "hourly")
                        {
                            var numOfPassengers = BotResponse.result.context.skills["main skill"].user_defined.numOfPassengers;
                            var townPickUpTime = BotResponse.result.context.skills["main skill"].user_defined.townPickUpTime;
                            var townCarPickUpDate = BotResponse.result.context.skills["main skill"].user_defined.townCarPickUpDate;
                            var getPickUpAddress = BotResponse.result.context.skills["main skill"].user_defined.getPickUpAddress;
                            var DropOffTime = BotResponse.result.context.skills["main skill"].user_defined.DropOffTime;

                            var town_car_details = { carType: carType, numOfPassengers : numOfPassengers, townPickUpTime : townPickUpTime, townCarPickUpDate : townCarPickUpDate, getPickUpAddress : getPickUpAddress, DropOffTime : DropOffTime };
                        }
                        
                        sendObj['contextType'] = "QueryAPI";
                        sendObj['context'] = APIrequest;
                        sendObj['contextParams'] = town_car_details;
                    }

                    if(APIrequest === "cloneReservation")
                    {
                        sendObj['cloneReservation'] = "cloneReservation";
                    }
                }   
                //For TravelFusion
                // if(BotResponse.result.context.skills["main skill"].user_defined.QueryAPI_Travelfusion)
                // {
                //     console.log("============TravelFusion=============");
                //     console.log("============TravelFusion=============");
                //     console.log(BotResponse.result.context.skills["main skill"].user_defined);
                //     console.log("============TravelFusion=============");
                //     console.log("============Req.body=============");
                //     console.log(req.body);
                //     console.log("============Req.body=============");
                //     var APIrequest = BotResponse.result.context.skills["main skill"].user_defined.QueryAPI_Travelfusion;

                //     if(APIrequest === "getbookingStatus")       
                //     {
                //         var flightType = BotResponse.result.context.skills["main skill"].user_defined.flightType;

                //         //now checking for flight type
                //         if(flightType === "oneway")
                //         {
                //             var departureCode = BotResponse.result.context.skills["main skill"].user_defined.origin;
                //             var destinationCode = BotResponse.result.context.skills["main skill"].user_defined.destination;
                //             var departureDate = BotResponse.result.context.skills["main skill"].user_defined.date;
                //             var departureTime = BotResponse.result.context.skills["main skill"].user_defined.time;
                //             var numOfSeats = BotResponse.result.context.skills["main skill"].user_defined.seats;
                //             var invoke_source = BotResponse.result.context.skills["main skill"].user_defined.invoke_source;
                //             var div_id = BotResponse.result.context.skills["main skill"].user_defined.div_id;
                //             var hotel_difference = BotResponse.result.context.skills["main skill"].user_defined.hotel_difference;
                //             var rental_difference = BotResponse.result.context.skills["main skill"].user_defined.rental_difference;
                //             var flight_carrier = BotResponse.result.context.skills["main skill"].user_defined.flight_carrier;
                //             var outward_id = BotResponse.result.context.skills["main skill"].user_defined.outward_id;

                //             var contextParamsObj = { flightType : flightType,
                //                 departure: departureCode, destination: destinationCode,
                //                 date: departureDate, time: departureTime, numOfSeats: numOfSeats,
                //                 invoke_source : invoke_source,
                //                 hotel_difference:hotel_difference,
                //                 rental_difference :rental_difference,
                //                 div_id:div_id,
                //                 flight_carrier:flight_carrier,
                //                 outward_id:outward_id
                //             };
                //         }

                //         if(flightType === "roundtrip")
                //         {
                //             var departureOrigin = BotResponse.result.context.skills["main skill"].user_defined.departureOrigin;
                //             var departureDestination = BotResponse.result.context.skills["main skill"].user_defined.departureDestination;
                //             var returnOrigin = BotResponse.result.context.skills["main skill"].user_defined.returnOrigin;
                //             var returnDestination = BotResponse.result.context.skills["main skill"].user_defined.returnDestination;
                //             var departureDate = BotResponse.result.context.skills["main skill"].user_defined.departureDate;
                //             var departureTime = BotResponse.result.context.skills["main skill"].user_defined.departureTime;
                //             var returnDate = BotResponse.result.context.skills["main skill"].user_defined.returnDate;
                //             var returnTime = BotResponse.result.context.skills["main skill"].user_defined.returnTime;
                //             var seats = BotResponse.result.context.skills["main skill"].user_defined.seats;
                //             var invoke_source = BotResponse.result.context.skills["main skill"].user_defined.invoke_source;
                //             var div_id = BotResponse.result.context.skills["main skill"].user_defined.div_id;
                //             var hotel_difference = BotResponse.result.context.skills["main skill"].user_defined.hotel_difference;
                //             var rental_difference = BotResponse.result.context.skills["main skill"].user_defined.rental_difference;
                //             var flight_carrier = BotResponse.result.context.skills["main skill"].user_defined.flight_carrier;

                //             var contextParamsObj = { flightType : flightType, departureOrigin : departureOrigin, 
                //                 departureDestination : departureDestination, returnOrigin : returnOrigin, 
                //                 returnDestination : returnDestination, departureDate : departureDate, 
                //                 departureTime : departureTime, returnDate : returnDate, returnTime : returnTime, 
                //                 seats : seats, invoke_source :invoke_source,div_id : div_id,
                //                 hotel_difference:hotel_difference,
                //                 rental_difference :rental_difference,
                //                 flight_carrier:flight_carrier,
                //                 outward_id:outward_id
                //             };
                //         }

                //         if(flightType === "multicity")
                //         {
                //             var flightDetails = BotResponse.result.context.skills["main skill"].user_defined.flightDetails;
                //             var seats = BotResponse.result.context.skills["main skill"].user_defined.seats;
                //             var contextParamsObj = { flightType : flightType, seats : seats, flightDetails : flightDetails };
                //         }
                    
                //         sendObj['context'] =  APIrequest;
                //         sendObj['contextParams'] = contextParamsObj;
                //         sendObj['contextType'] = "QueryAPI_Travelfusion";
                //     }
                    
                // }   
                //For TravelFusion End
                if(BotResponse.result.context.skills["main skill"].user_defined.PreviousReservation)
                {
                    var mode = BotResponse.result.context.skills["main skill"].user_defined.PreviousReservation;

                    if(mode === "flightReservation")
                    {
                        var previousReservationMode = BotResponse.result.context.skills["main skill"].user_defined.PreviousReservation;
                        var TravelerID = BotResponse.result.context.skills["main skill"].user_defined.TravelerID;
                        var userID = BotResponse.result.context.skills["main skill"].user_defined.userid;
                        var companyID = BotResponse.result.context.skills["main skill"].user_defined.companyID;
                        var countryID = BotResponse.result.context.skills["main skill"].user_defined.countrycode;
                        var flightType = BotResponse.result.context.skills["main skill"].user_defined.flightType;
                            
                        var contextParamsObj = { userID :  userID, companyID : companyID, countryID : countryID, TravelerID : TravelerID, flightType : flightType };
                    }

                    if(mode === "hotelReservation")
                    {
                        var previousReservationMode = BotResponse.result.context.skills["main skill"].user_defined.PreviousReservation;
                        var TravelerID = BotResponse.result.context.skills["main skill"].user_defined.TravelerID;
                        var contextParamsObj = { TravelerID : TravelerID };
                    }

                    if(mode === "rentalCarReservation")
                    {
                        var previousReservationMode = BotResponse.result.context.skills["main skill"].user_defined.PreviousReservation;
                        var TravelerID = BotResponse.result.context.skills["main skill"].user_defined.TravelerID;
                        var contextParamsObj = { TravelerID : TravelerID };
                    }

                    if(mode === "townCarReservation")
                    {
                        var previousReservationMode = BotResponse.result.context.skills["main skill"].user_defined.PreviousReservation;
                        var TravelerID = BotResponse.result.context.skills["main skill"].user_defined.TravelerID;
                        var contextParamsObj = { TravelerID : TravelerID };
                    }

                    if(mode === "railReservation")
                    {
                        var previousReservationMode = BotResponse.result.context.skills["main skill"].user_defined.PreviousReservation;
                        var TravelerID = BotResponse.result.context.skills["main skill"].user_defined.TravelerID;
                        var railType = BotResponse.result.context.skills["main skill"].user_defined.railType;
                        var contextParamsObj = { TravelerID : TravelerID, railType : railType };
                    }

                    sendObj['context'] =  previousReservationMode;
                    sendObj['contextParams'] = contextParamsObj;
                    sendObj['contextType'] = "PreviousReservation";
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.hotelName)
                {
                    if(BotResponse.result.context.skills["main skill"].user_defined.hotelName === "getHotelName")
                    {
                        sendObj['hotelName'] = BotResponse.result.context.skills["main skill"].user_defined.hotelName;
                    }
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.getPickUpAddress)
                {
                    if(BotResponse.result.context.skills["main skill"].user_defined.getPickUpAddress === "getPickUpAddress")
                    {
                        sendObj['getPickUpAddress'] = BotResponse.result.context.skills["main skill"].user_defined.getPickUpAddress;
                    }
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.getDropOffAddress)
                {
                    if(BotResponse.result.context.skills["main skill"].user_defined.getDropOffAddress === "getDropOffAddress")
                    {
                        sendObj['getDropOffAddress'] = BotResponse.result.context.skills["main skill"].user_defined.getDropOffAddress;
                    }
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.specialRequest)
                {
                    if(BotResponse.result.context.skills["main skill"].user_defined.specialRequest === "specialRequest")
                    {
                        sendObj['specialRequest'] = BotResponse.result.context.skills["main skill"].user_defined.specialRequest;
                    }
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.FinalEnsuring)
                {
                    if(BotResponse.result.context.skills["main skill"].user_defined.FinalEnsuring === "FinalEnsuring")
                    {
                        sendObj['FinalEnsuring'] = BotResponse.result.context.skills["main skill"].user_defined.FinalEnsuring;
                        sendObj['editobjfunctionality2'] = BotResponse.result.context.skills["main skill"].user_defined.editobjfunctionality2;
                        sendObj['traveler_id'] = BotResponse.result.context.skills["main skill"].user_defined.traveler_id;

                    }
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.FlightEnsure)
                {
                    if(BotResponse.result.context.skills["main skill"].user_defined.FlightEnsure === "FlightEnsure")
                    {   
                        var details = BotResponse.result.context.skills["main skill"].user_defined.details;
                        sendObj['FlightEnsure'] = BotResponse.result.context.skills["main skill"].user_defined.FlightEnsure;
                        sendObj['FlightEnsureDetails'] = details;
                    }
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.auto_previous_reservation)
                {
                    if(BotResponse.result.context.skills["main skill"].user_defined.auto_previous_reservation = "auto_previous_reservation")
                    {
                        sendObj['auto_previous_reservation'] = "auto_previous_reservation";
                        sendObj['travelerID'] = BotResponse.result.context.skills["main skill"].user_defined.travelerID;
                        sendObj['newDate'] = BotResponse.result.context.skills["main skill"].user_defined.newDate;
                        sendObj['returnDate'] = BotResponse.result.context.skills["main skill"].user_defined.return_Date;
                    }
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.checkUserRole)
                {
                    if(BotResponse.result.context.skills["main skill"].user_defined.checkUserRole = "checkUserRole")
                    {
                        sendObj['checkUserRole'] = "checkUserRole";
                        sendObj['UserID'] = BotResponse.result.context.skills["main skill"].user_defined.UserID;
                    }
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.module_completed)
                {
                    var initial_module = BotResponse.result.context.skills["main skill"].user_defined.module_completed;

                    if(!user_details[req.session.user_name])
                    {
                        user_details[req.session.user_name] = {};
                        user_details[req.session.user_name].current_module = null;
                    }
                    else
                    {
                        user_details[req.session.user_name].current_module = null;
                    }

                    if(user_details[req.session.user_name].current_module != initial_module)
                    {
                        user_details[req.session.user_name].current_module = initial_module;
                        
                        if(user_details[req.session.user_name].current_module == "flight")
                        {
                            var selectedFlight = BotResponse.result.context.skills["main skill"].user_defined.selectedFlightID;
                            sendObj['id'] = selectedFlight;
                        }
                        
                        if(user_details[req.session.user_name].current_module == "hotel")
                        {
                            var selectedHotel = BotResponse.result.context.skills["main skill"].user_defined.hotelName;
                            sendObj['id'] = selectedHotel;
                        }

                        if(user_details[req.session.user_name].current_module == "rental_car")
                        {
                            var selectedRentalCar = BotResponse.result.context.skills["main skill"].user_defined.selected_car;
                            sendObj['id'] = selectedRentalCar;
                        }

                        if(user_details[req.session.user_name].current_module == "town_car")
                        {
                            var selectedTownCar = BotResponse.result.context.skills["main skill"].user_defined.town_car_selected;
                            sendObj['id'] = selectedTownCar;
                        }

                        sendObj['current_module'] = user_details[req.session.user_name].current_module;
                    }
                    else
                    {
                        sendObj['current_module'] = null;
                    }
                }
                    
                if(BotResponse.result.context.skills["main skill"].user_defined.editObjFunctionality)
                {
                    var edit_resp = BotResponse.result.context.skills["main skill"].user_defined.editObjFunctionality;
                    
                    if(edit_resp == "editobjfunctionality")
                    {
                        sendObj['div_id'] = BotResponse.result.context.skills["main skill"].user_defined.div_id;
                        sendObj['edit_type'] = BotResponse.result.context.skills["main skill"].user_defined.edit_type;
                        sendObj['editing'] = BotResponse.result.context.skills["main skill"].user_defined.editing;
                        sendObj['editobjfunctionality'] = BotResponse.result.context.skills["main skill"].user_defined.editObjFunctionality;
                       
                        if(BotResponse.result.context.skills["main skill"].user_defined.editing == "flight")
                        {
                            sendObj['hotel_diff'] = BotResponse.result.context.skills["main skill"].user_defined.hotel_diff;
                            sendObj['rental_diff'] = BotResponse.result.context.skills["main skill"].user_defined.rental_diff;
                            sendObj['flightType'] = BotResponse.result.context.skills["main skill"].user_defined.flightType;
                            
                            if(BotResponse.result.context.skills["main skill"].user_defined.edit_type == "datetime")
                            {
                                sendObj['flight_date_type'] = BotResponse.result.context.skills["main skill"].user_defined.flight_date_type;
                                
                                if(BotResponse.result.context.skills["main skill"].user_defined.flight_date_type == "departure")
                                {
                                    sendObj['dep_date'] = BotResponse.result.context.skills["main skill"].user_defined.departureDate;
                                    sendObj['dep_time'] = BotResponse.result.context.skills["main skill"].user_defined.departureTime;
                                }

                                if(BotResponse.result.context.skills["main skill"].user_defined.flight_date_type == "return")
                                {
                                    sendObj['return_date'] = BotResponse.result.context.skills["main skill"].user_defined.returnDate;
                                    sendObj['return_time'] = BotResponse.result.context.skills["main skill"].user_defined.returnTime;
                                }

                                if(BotResponse.result.context.skills["main skill"].user_defined.flight_date_type == "flighttriprange")
                                {
                                    sendObj['return_date'] = BotResponse.result.context.skills["main skill"].user_defined.returnDate;
                                    sendObj['return_time'] = BotResponse.result.context.skills["main skill"].user_defined.returnTime;
                                    sendObj['dep_date'] = BotResponse.result.context.skills["main skill"].user_defined.departureDate;
                                    sendObj['dep_time'] = BotResponse.result.context.skills["main skill"].user_defined.departureTime;
                                }
                            }
                        }

                        if(BotResponse.result.context.skills["main skill"].user_defined.editing == "hotel")
                        {
                            if(BotResponse.result.context.skills["main skill"].user_defined.edit_type == "datetime")
                            {
                                sendObj['hotel_date_type'] = BotResponse.result.context.skills["main skill"].user_defined.hotel_date_type;
                               
                                if(BotResponse.result.context.skills["main skill"].user_defined.hotel_date_type == "check-in")
                                {
                                    sendObj['chek_in_date'] = BotResponse.result.context.skills["main skill"].user_defined.chek_in_date;
                                }
                               
                                if(BotResponse.result.context.skills["main skill"].user_defined.hotel_date_type == "check-out")
                                {
                                    sendObj['chek_out_date'] = BotResponse.result.context.skills["main skill"].user_defined.chek_out_date;
                                }
                               
                                if(BotResponse.result.context.skills["main skill"].user_defined.hotel_date_type == "hotel_date_range")
                                {
                                    sendObj['chek_out_date'] = BotResponse.result.context.skills["main skill"].user_defined.chek_out_date;
                                    sendObj['chek_in_date'] = BotResponse.result.context.skills["main skill"].user_defined.chek_in_date;
                                }
                            }
                        }

                        if(BotResponse.result.context.skills["main skill"].user_defined.editing == "rentalcar")
                        {
                            if(BotResponse.result.context.skills["main skill"].user_defined.edit_type == "datetime")
                            {
                                sendObj['rentalcar_date_type'] = BotResponse.result.context.skills["main skill"].user_defined.rentalcar_date_type;
                               
                                if(BotResponse.result.context.skills["main skill"].user_defined.rentalcar_date_type == "pick-up")
                                {
                                    sendObj['car_pickup_date'] = BotResponse.result.context.skills["main skill"].user_defined.car_pickup_date;
                                    sendObj['car_pickup_time'] = BotResponse.result.context.skills["main skill"].user_defined.car_pickup_time;
                                }

                                if(BotResponse.result.context.skills["main skill"].user_defined.rentalcar_date_type == "drop-off")
                                {
                                    sendObj['car_dropoff_date'] = BotResponse.result.context.skills["main skill"].user_defined.car_dropoff_date;
                                    sendObj['car_dropof_time'] = BotResponse.result.context.skills["main skill"].user_defined.car_dropof_time;
                                }

                                if(BotResponse.result.context.skills["main skill"].user_defined.rentalcar_date_type == "rental_car_date_range")
                                {
                                    sendObj['car_pickup_date'] = BotResponse.result.context.skills["main skill"].user_defined.car_pickup_date;
                                    sendObj['car_pickup_time'] = BotResponse.result.context.skills["main skill"].user_defined.car_pickup_time;
                                    sendObj['car_dropoff_date'] = BotResponse.result.context.skills["main skill"].user_defined.car_dropoff_date;
                                    sendObj['car_dropof_time'] = BotResponse.result.context.skills["main skill"].user_defined.car_dropof_time;
                                }
                                
                            }
                        }
                    }
                    else
                    {
                        sendObj['parameters'] = null;
                    }
                    
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.travelerInfo)
                {
                    if(BotResponse.result.context.skills["main skill"].user_defined.travelerInfo === "getCurrentTravelerInfo")
                    {
                        sendObj['travelerInfo'] = BotResponse.result.context.skills["main skill"].user_defined.travelerInfo;
                    }
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.getting_traveler_most_frequent_city)
                {
                    if(BotResponse.result.context.skills["main skill"].user_defined.getting_traveler_most_frequent_city === "getting_traveler_most_frequent_city")
                    {
                        sendObj['getting_traveler_most_frequent_city'] = BotResponse.result.context.skills["main skill"].user_defined.getting_traveler_most_frequent_city;
                    }
                }
                
                if(BotResponse.result.context.skills["main skill"].user_defined.city_name_result)
                {
                    if(BotResponse.result.context.skills["main skill"].user_defined.city_name_result === "city_name_result")
                    {
                        sendObj['city_name_result'] = BotResponse.result.context.skills["main skill"].user_defined.city_name_result;
                    }
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.get_previous_iternery_info_segment)
                {
                    if(BotResponse.result.context.skills["main skill"].user_defined.get_previous_iternery_info_segment === "get_previous_iternery_info_segment")
                    {
                        sendObj['get_previous_iternery_info_segment'] = BotResponse.result.context.skills["main skill"].user_defined.get_previous_iternery_info_segment;
                    }
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.new_trip_dep_date)
                {
                    sendObj['new_trip_dep_date'] = BotResponse.result.context.skills["main skill"].user_defined.new_trip_dep_date;   
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.new_trip_return_date)
                {
                    sendObj['new_trip_return_date'] = BotResponse.result.context.skills["main skill"].user_defined.new_trip_return_date;   
                }

                if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal)
                {

                    var request_type = BotResponse.result.context.skills["main skill"].user_defined.QueryLocal;

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "initializeVariables")
                    {
                        var contextParamsObj = null;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "getCurrentTravelerInfo")
                    {
                        var contextParamsObj = null;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "getCityName")
                    {
                        var city_code           =   BotResponse.result.context.skills["main skill"].user_defined.city_code;
                        var paramteres          =   { city_code : city_code };
                        var contextParamsObj    =   paramteres;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "store_dates")
                    {
                        var trip_departure_Date =   BotResponse.result.context.skills["main skill"].user_defined.user_departure_date;
                        var trip_return_date    =   BotResponse.result.context.skills["main skill"].user_defined.user_return_date;
                        var paramteres          =   { trip_departure_Date : trip_departure_Date , trip_return_date : trip_return_date};
                        var contextParamsObj    =   paramteres;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "checkReservationRequirement")
                    {
                        var reservation_type    =   BotResponse.result.context.skills["main skill"].user_defined.reservationType;
                        var paramteres          =   { reservation_type : reservation_type };
                        var contextParamsObj    =   paramteres;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "get_traveler_most_frequent_city")
                    {
                        var contextParamsObj    =   null;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "makeFlightReservation")
                    {

                        if(flightType == "oneway")
                        {
                            var date    =   BotResponse.result.context.skills["main skill"].user_defined.date;
                            var time    =   BotResponse.result.context.skills["main skill"].user_defined.time;
                            var origin    =   BotResponse.result.context.skills["main skill"].user_defined.origin;
                            var flightType    =   BotResponse.result.context.skills["main skill"].user_defined.flightType;
                            var destination    =   BotResponse.result.context.skills["main skill"].user_defined.destination;

                            var paramteres  =   { 
                                date : date,
                                time : time,
                                origin : origin,
                                flightType: flightType,
                                destination: destination
                            };
                        }

                        else
                        {
                            var flightType    =   BotResponse.result.context.skills["main skill"].user_defined.flightType;
                            var returnDate    =   BotResponse.result.context.skills["main skill"].user_defined.returnDate;
                            var returnTime    =   BotResponse.result.context.skills["main skill"].user_defined.returnTime;
                            var departureDate    =   BotResponse.result.context.skills["main skill"].user_defined.departureDate;
                            var departureTime    =   BotResponse.result.context.skills["main skill"].user_defined.departureTime;
                            var departureCityGo    =   BotResponse.result.context.skills["main skill"].user_defined.departureCityGo;
                            var destinationCityGo    =   BotResponse.result.context.skills["main skill"].user_defined.destinationCityGo;
                            var departureCityReturn    =   BotResponse.result.context.skills["main skill"].user_defined.departureCityReturn;
                            var destinationCityReturn    =   BotResponse.result.context.skills["main skill"].user_defined.destinationCityReturn;

                            var paramteres = {
                                flightType : flightType,
                                returnDate : returnDate,
                                returnTime : returnTime,
                                departureDate : departureDate,
                                departureTime : departureTime,
                                departureCityGo : departureCityGo,
                                destinationCityGo : destinationCityGo,
                                departureCityReturn : departureCityReturn,
                                destinationCityReturn : destinationCityReturn
                            }
                        }
                        
                        var contextParamsObj    =   paramteres;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "addTripPurpose")
                    {
                        var tripPurposeID       =   BotResponse.result.context.skills["main skill"].user_defined.tripPurposeID;
                        var paramteres          =   { tripPurposeID : tripPurposeID };
                        var contextParamsObj    =   paramteres;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "addHotelReservationInformation")
                    {

                        var cityArea    =   BotResponse.result.context.skills["main skill"].user_defined.cityArea;
                        var hotelName    =   BotResponse.result.context.skills["main skill"].user_defined.hotelName;
                        var checkinDate    =   BotResponse.result.context.skills["main skill"].user_defined.checkinDate;
                        var checkOutDate    =   BotResponse.result.context.skills["main skill"].user_defined.checkOutDate;

                        var paramteres  =   { 
                            cityArea : cityArea,
                            hotelName : hotelName,
                            checkinDate  :checkinDate,
                            checkOutDate : checkOutDate
                        };
                        
                        
                        var contextParamsObj    =   paramteres;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "makeCarReservation")
                    {

                        var PickUpCity    =   BotResponse.result.context.skills["main skill"].user_defined.PickUpCity;
                        var PickUpDate    =   BotResponse.result.context.skills["main skill"].user_defined.PickUpDate;
                        var PickUpTime    =   BotResponse.result.context.skills["main skill"].user_defined.PickUpTime;
                        var DropOffCity    =   BotResponse.result.context.skills["main skill"].user_defined.DropOffCity;
                        var DropOffDate    =   BotResponse.result.context.skills["main skill"].user_defined.DropOffDate;
                        var DropOffTime    =   BotResponse.result.context.skills["main skill"].user_defined.DropOffTime;

                        var paramteres  =   { 
                            PickUpCity : PickUpCity,
                            PickUpDate : PickUpDate,
                            PickUpTime : PickUpTime,
                            DropOffCity : DropOffCity,
                            DropOffDate : DropOffDate,
                            DropOffTime : DropOffTime
                        };
                        
                        
                        var contextParamsObj    =   paramteres;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "checkForReservationInfo")
                    {
                        var contextParamsObj    =   null;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "addSpecialReq")
                    {
                        var specialRequest      =   BotResponse.result.context.skills["main skill"].user_defined.specialRequest;
                        var parameters          =   { specialRequest : specialRequest };
                        var contextParamsObj    =   parameters;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "emptyTravelersInfoArray")
                    {
                        var contextParamsObj    =   null;
                    }

                    if(BotResponse.result.context.skills["main skill"].user_defined.QueryLocal === "get_previous_iternery_data")
                    {
                        var reservation_mod  =   BotResponse.result.context.skills["main skill"].user_defined.reservation_module;
                        var parameters          =   { reservation_mod : reservation_mod };
                        var contextParamsObj    =   parameters;
                    }

                    sendObj['context'] =  request_type;
                    sendObj['contextParams'] = contextParamsObj;
                    sendObj['contextType'] = "QueryLocal";
                }

                res.json(sendObj);

            }
            catch(error)
            {

                console.log("===============================");
                console.log(error);
                console.log("watson.js");
                console.log("===============================");

                var response = { status : 404, message : "Cannot send message to IBM Watson Assistant." };
                res.json(response);
            }
        }
        else
        { 
            console.log("===============================");
            console.log(error);
            console.log("watson.js");
            console.log("===============================");

            var response = { status : 404, message : "IBM Watson Assistant Session Error." };
            res.json(response);
        }
    }
    else
    {
        console.log("===============================");
        console.log(error);
        console.log("watson.js");
        console.log("===============================");

        var response = { status : 404, message : "Empty Message Identified. Cannot send empty message to IBM Watson Assistant." }
        res.json(response);
    }
});

//Keeping session alive [It doesnt require any language preference] (Error Handling Completed)
router.post('/keepSessionAlive', async (req, res) => {
    var msg = req.body.msg;
    var session_id = req.body.sessionID;

    if(msg != null && msg != undefined && msg != "")
    {
        if(session_id != null && session_id != undefined && session_id != "")
        {
            //Prepairing Payload
            var payload = {
                assistantId: process.env.WATSONN_ASSISTANT_ID,
                sessionId: session_id,
                input: {
                    'message_type': 'text',
                    'text': msg,
                    'options': {
                        'return_context': true
                    }
                }
            }

            try{

                var BotResponse = await assistant.message(payload);
                var botResp = BotResponse['result'].output.generic[0];

                var responseType = botResp.response_type;
                var respTitle = botResp.text;

                if (respTitle === "Alive")
                {
                    var result = { AliveStatus : "alive" };
                }
                else
                {
                    var result = { AliveStatus : "not_alive" }
                }        
                
                res.json(result);
            }
            catch(error)
            {
                var encountered_error = null;
                
                if(error.body != undefined)
                {
                    var error_body = JSON.parse(error.body);
                    if(error_body.error != undefined)
                    {
                        encountered_error = error_body.error;
                    }
                }
                
                var response = { status : 404, message : "IBM Watson Assistant Service seems to be down. Please try again later." };
                res.json(response);
            }
        }
        else
        {
            var response = { status : 404, message : "IBM Watson Assistant Session Error." };
            res.json(response);
        }
    }
    else
    {
        var response = { status : 404, message : "IBM Watson Assistant Service seems to be down. Please try again later." };
        res.json(response);
    }

});

//Getting logs for conversation [Currenlty it is not working, it will work when the IBM plan chnaged from lite to enterprize]
router.post('/getConversationLogs', async (req, res) => {
    
    //Enterprize Plan is required to do that. Furthermore this will give the details for all the things.
    const params = { assistantId: process.env.WATSONN_ASSISTANT_ID };

    try
    {
        var logResponse = await assistant.listLogs(params);
        res.json(logResponse)
    }
    catch(error)
    {
        console.log(error);
    }
});

//=================================== [Chat Route Implementation] =======================================//

//====================================== [TTS Implementation] ===========================================//

router.post('/tts', async (req,res) => {

    var text =  req.body.text;
    var synthesize_text = text.replace(/<br>/g,"");
    
    //Constructing parameters for sending API request [Bot Voice is specified here!]
    const synthesizeParams = { text: synthesize_text, accept: 'audio/wav', voice: 'en-GB_JamesV3Voice' };
    
    //Getting back chunks of audio
    var audioChunks = await textToSpeech.synthesize(synthesizeParams);

    //Accessing array buffer from the API response 
    var audioFileBinary = await textToSpeech.repairWavHeaderStream(audioChunks.result);
    
    //Converting the binary buffer to binary buffer array
    var binAudio = Buffer.from(audioFileBinary, 'base64');
    
    //Writing binary buffer array to send back
    res.write(binAudio,'binary');
    res.end(null, 'binary');
});

//====================================== [TTS Implementation] ===========================================//

//================================== [Translation Implementation] =======================================//

//IBM Watson Translation module (Error handling Completed)
router.post('/tanslate', async (req, res) => {

    if( req.body.to === "en" || req.body.to === "EN" )
    {
        return res.json(req.body.text);
    }
    else
    {
        let payload = { "source" : req.body.from, "target" : req.body.to, "text" : req.body.text };

        try 
        {
            var response = await languageTranslator.translate(payload);
            var result = response['result'].translations[0].translation; 
            res.send(result);
        } 
        catch(error)
        {
            console.error(`Translation route : ${error?.body}`);
            res.send(req.body.text);
        }
    }
});

//To get the list of the supported langueges (Not used anymore)
router.get('/getLanguages', async (req, res) => {

    var supported_languages_array = [];

    //Generating translation response 
    try 
    {
        response = await languageTranslator.listLanguages();

        for (var i = 0; i < languagesArray.length; i++)
        {
            var temp_obj                =   {};
            temp_obj['country_code']    =   languagesArray[i].country_code;
            temp_obj['language_code']   =   languagesArray[i].language;
            temp_obj['language_name']   =   languagesArray[i].language_name;

            supported_languages.push(temp_obj);
        }
    } 
    catch (error)
    {
        console.log(error);
    }
    res.json(supported_languages);
});

//To get the list of supported languages (Not used anymore)
router.get('/getSupportedLanguages', async (req, res) => {
    try 
    {
        var response = await languageTranslator.listLanguages();
        if(response.result != undefined)
        {
            var supported_languages = response.result.languages;
            if(supported_languages.length != 0)
            {
                var supportedLanguageobj = {};
                var parse_lannguage_details = [];
                for (var i = 0; i < supported_languages.length; i++)
                {
                    parse_lannguage_details.push(supported_languages[i].language_name);
                    supportedLanguageobj[`${supported_languages[i].country_code}`] = supported_languages[i].language;
                }
                var response = { result : supported_languages, parse_lannguage_details : parse_lannguage_details };
            }
            else
            {
                var response = { result : null };
            }
        }
        else
        {
            var response = { result : null };
        }
    } 
    catch (error)
    {
        console.log(error);
        var response = { result : null };
        return null;
    }

    res.json(response);
});

//================================== [Translation Implementation] =======================================//

//====================================== [STT Implementation] ===========================================//

router.post('/stt', async (req, res) => {

    var file = req.body.fileName;

    var file_path = path.join(__dirname, `../../${file}`);
    var result = file_path;

    var params = { objectMode: true, content_type: 'audio/wav', model: 'en-US_BroadbandModel' };
    var recognizeStream = await speechToText.recognizeUsingWebSocket(params);
    fs.createReadStream(file_path).pipe(recognizeStream);

    var response = new Promise((resolve, reject) => {
        
        //If voice recognition is successfull
        recognizeStream.on('data', function(data) 
        {
            if(data.results.length != 0)
            {
                result = { text : data.results[0].alternatives[0].transcript }
                resolve(result)
            }
            else
            {
                result = { text : null };
                resolve(result);
            } 
        });
        
        //If voice recognition is faulty
        recognizeStream.on('error', ()=>{ reject(error) });
    });
        
    var final_response = await response;

    res.json(final_response);
});

//====================================== [STT Implementation] ===========================================//

router.post('/userDetails', async (req, res) => {
    
    if(user_details[req.session.user_name].userDetails)
    {
        var resposne = { success: true, record: user_details[req.session.user_name].userDetails };
    }
    else
    {
        var resposne = { success: false, record: null, message: `No Record Found!` };
    }

    res.json(resposne);
    
});


module.exports = {
    translate : translate,
    router : router
}