require('dotenv').config();
process.env.UV_THREADPOOL_SIZE=127;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

const path                  =   require("path");
const express               =   require("express");
const app                   =   express();
var cors                    =   require('cors');

//Socket.io Dependencies
const https                 =   require("https");
const http                  =   require("http").Server(app);
const io                    =   require("socket.io")(http, { cors: { origin: '*' } } );

//ViewEngine Dependecies
var bodyParser              =   require('body-parser');
const { resolve }           =   require("path");

//IBM Watson STT Dependencies
const fs                    =   require('fs');

//Serving Audio File
const ms                    =   require('mediaserver');

//Calling External APIs [Translation] Dependecies
const axios                 =   require('axios');

//Geo Localization Data Dependecies
var geoip                   =   require('geoip-lite'); //Getting IP Information
const { getName }           =   require('country-list'); //Getting Country Name
const clm                   =   require('country-locale-map'); //Getting Language Code 
const ISO6391               =   require('iso-639-1'); //Getting Laguage Name
const { response }          =   require("express");
var logger                  =   require('morgan');
var cookieParser            =   require('cookie-parser');
const session               =   require('express-session');
const short                 =   require('short-uuid');

//======================================== [Dependecies] ================================================//

//======================================= [Handling CORS] ================================================//

const corsOptions = {
    "Access-Control-Allow-Origin"       :  "*",
    "Access-Control-Allow-Methods"      :  "POST, GET, OPTIONS, DELETE",
    "Access-Control-Allow-Headers"      :   "Content-Type",
    "Access-Control-Allow-Credentials"  :   true,
    origin                              :   true,
    credentials                         :   true,
}

app.use(cors(corsOptions));

//======================================= [Handling CORS] ================================================//

//===================================== [App Configurations] ============================================//

//app.use(logger(':method  -- :url -- :status -- :response-time ms'));
//app.use(logger('dev'));

app.use(cookieParser());

app.set('trust proxy', 1);

var hour = 3600000;

app.use(session({
    secret: 'secret_key',
    resave: true,
    saveUninitialized: true,
    cookie: { sameSite:"None", secure:true, httpOnly:true, maxAge: hour }
}));

app.use((req, res, next) => {

    res.setHeader('Access-Control-Allow-Credentials', true);

    if(req.session.user_name)
    {
        next();
    }
    else
    {
        if(req.headers.session_status == "initialize")
        {
            next();
        }
        else
        {
            console.log("====================================================");
            console.log("User Session Not Found");
            console.log(req.headers);
            console.log("====================================================");
            next();
        }
    }
});

//App Configuration For Serving POST Requests
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

//App Configurations for Paths
const rootPath              =   path.join(__dirname, "../");
var privateKey              =   path.join(rootPath, "key.pem");
var certificate             =   path.join(rootPath, "cert.pem");

var credentials             =   { key: fs.readFileSync(privateKey), cert: fs.readFileSync(certificate) };
var httpsServer             =   https.createServer(credentials, app);

//===================================== [App Configurations] ============================================//

//=========================================== [Routes] ==================================================//

//IBM Watson Route
const watsonRoutes = require("../routes/api/watson");
app.use("/api/watson" , watsonRoutes.router);

//Database Route
const MSSQLRoute = require("../routes/api/database");
app.use("/api/localQuery", MSSQLRoute);

//SABRE Route
const sabreAPI = require("../routes/api/sabre");
app.use("/api/sabre", sabreAPI);

//MERCK Form Details Route [Country Wise]
const merckAPI = require("../routes/api/merck");
app.use("/api/merck", merckAPI);

//Traveler information verification process
const travelerAPI = require("../routes/api/traveler");
app.use("/api/travelerInformation", travelerAPI);

//TravelFusion Route
// const travelfusionAPI = require("../routes/api/travelfusion");
// app.use("/api/travelfusion", travelfusionAPI);

//Making log of the user chat
const logAPI = require("../routes/api/logger");
app.use("/api/createLog", logAPI);

//Storing traveler booking related data
const saveAPI = require("../routes/api/bookingDetail");
app.use("/api/save", saveAPI);

//Storing and managing the previous reservation data
const previousAPI = require("../routes/api/previousReservation");
app.use("/api/previousData", previousAPI);

//Searching and getting traveler profiles
const umbrellaFaces = require("../routes/api/umbrellaFaces");
app.use("/api/umbrellaFaces", umbrellaFaces);

//=========================================== [Routes] ==================================================//

//================================== [WebHook Supporting Funciton] =======================================//

var user_details = {};

async function databaseQueryFetch(id, requestType, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', requestedID : id, requestType : requestType }, session_handle_axios);
    return DBresponse.data;
}

async function databaseQueryInsert(data, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'InsertData', data : data }, session_handle_axios);
    return DBresponse.data;
}

function parseDate(date)
{
    var dateTime = new Date(date);
    if(dateTime)
    {
        var time = dateTime.toLocaleTimeString();
        return time;
    }
    else
    {
        return date;
    }
}

async function checkBookingALlowance(countryID, companyID, bookingMean, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', companyID : companyID, countryID : countryID, bookingMean: bookingMean, requestType : "checkBookingAllowance" }, session_handle_axios);
    return DBresponse.data;
}

async function getCityName(cityCode, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', requestType: "getCityName", cityCode : cityCode }, session_handle_axios);
    return DBresponse.data;
}

async function intializeStoringModule(current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } }
    var DBresponse = await axios.post( process.env.IP + '/api/save/initialize', {}, session_handle_axios);
    return DBresponse.data.initializationStatus;
}

async function saveData(dataType, dataObj, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/save/saveData', { dataType : dataType, dataObj : dataObj }, session_handle_axios);
    return DBresponse.data;
}

async function getFlightResInfo(current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/save/getResInfo', { dataRequired : "flight" }, session_handle_axios);
    return DBresponse.data;
}

async function getRecords(id, mode, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', requestType: "getRecords", travelerID : id, recordMode : mode }, session_handle_axios);
    return DBresponse.data;
}

async function translateTextAPI(text, languageCode, current_session)
{
    var languageCode = "English";
    let session_handle_axios = { headers: { cookie : current_session } };
    var APIResponse = await axios.post( process.env.IP + '/api/watson/tanslate', { from : "English", to : languageCode, text : text }, session_handle_axios);
    return APIResponse.data;
}

async function getFlightData(TravelerID, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', TravelerID : TravelerID, requestType : "getFlightDetails" }, session_handle_axios);
    return DBresponse.data;
}

async function getTravelerDetails(travelerID, GroupID, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', TravelerID : travelerID, GroupID : GroupID, requestType : "getTravelerDetails" }, session_handle_axios);
    return DBresponse.data;
}

async function getHotelDetails(travelerID, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', TravelerID : travelerID, requestType : "getHotelDetails" }, session_handle_axios);
    return DBresponse.data;
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

async function getReservationDetailsToAlter(id, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', travelerID : id, requestType : "getReservationTypesDetails" }, session_handle_axios);
    return DBresponse.data.record_array;
} 

async function setTripPurpose(id, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var RouteResponse = await axios.post( process.env.IP + '/api/save/storeTripPurpose', { tripPurposeID : id }, session_handle_axios);
    return RouteResponse.data;
}

async function getRentalCarDetails(id, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var RouteResponse = await axios.post( process.env.IP + '/api/sabre/getRentalCarDetailsData', { id : id }, session_handle_axios);
    return RouteResponse.data;
}

async function getTownCarDetails(id, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var RouteResponse = await axios.post( process.env.IP + '/api/sabre/getTownCarDetailsData', { id : id }, session_handle_axios);
    return RouteResponse.data;
}

async function getReservationInformation(current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var RouteResponse = await axios.post( process.env.IP + '/api/save/checkBookingDetails', {}, session_handle_axios);
    return RouteResponse.data;
}

async function emptyTravelerInfoArray(current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var RouteResponse = await axios.post( process.env.IP + '/api/save/emptyTravelerInfoArray',{}, session_handle_axios);
    return RouteResponse.data;
}

async function voiceToText(file_path, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var RouteResponse = await axios.post( process.env.IP + '/api/watson/stt', { fileName : file_path }, session_handle_axios);
    return RouteResponse.data;
}

async function verifyRoles(current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var RouteResponse = await axios.post( process.env.IP + '/api/umbrellaFaces/verifyAssignedRoles', {}, session_handle_axios);
    return RouteResponse.data;
}

async function translateTextAPI2(text, prefferedLanguage, current_session)
{
    var prefferedLanguage = "English";
    let session_handle_axios = { headers: { cookie : current_session } };
    var APIResponse = await axios.post( process.env.IP + '/api/watson/tanslate', { from : "English", to : prefferedLanguage, text : text }, session_handle_axios);
    return APIResponse.data;
}

async function getCurrentTravelerDetails(current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var APIResponse = await axios.get( process.env.IP + '/api/travelerInformation/currentTravelerDetails', session_handle_axios);
    return APIResponse.data;
}

async function getRequiredInfo(current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var APIResponse = await axios.post( process.env.IP + '/api/previousData/getRequiredInfo', {}, session_handle_axios);
    return APIResponse.data;
}

async function getpreviousbookingInfo(reckey, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var APIResponse = await axios.post( process.env.IP + '/api/previousData/getpreviousbookingInfo',{t_reckey : reckey}, session_handle_axios);
    return APIResponse.data;
}

async function get_frequent_city(current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var APIResponse = await axios.post( process.env.IP + '/api/previousData/getMostFrequestCity', {}, session_handle_axios);
    return APIResponse.data;
}

async function getUserLocalLanguage(user_id, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', requestType : "getUserLocalLanguage", user_id : user_id }, session_handle_axios);
    var user_language = DBresponse?.data?.record?.recordset[0]?.ez_loc_second_language;
    if(user_language)
    {
        return user_language;
    }
    else
    {
        return "EN";
    }
}

async function change_language_code(code, langauge, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var APIResponse = await axios.post( process.env.IP + '/api/watson/changeLanguage', {languageCode : code, prefferedLanguage : langauge}, session_handle_axios);
    return APIResponse.data;
}

async function getTravelerInfo(user_data)
{
    let session_handle_axios = { headers: { session_status : "initialize" } };
    var APIResponse = await axios.post( process.env.IP + '/api/travelerInformation/verifyInformation', { purpose : "intitialize", data : user_data }, session_handle_axios);
    return APIResponse.data;
}

//================================== [WebHook Supporting Funciton] =======================================//

//================================== [IBM WebHook Implementation] ========================================//

app.post('/session_set', async(req, res) => {

    var unique_id           =   short.generate();
    var user_id             =   req.body.user_id;
    req.session.user_name   =   unique_id;

    res.json(`Session Initialized, Session id = ${unique_id}`);

});

//Watson Chat Bot WebHook
app.post('/query', async (req, res) => {

    if(req.body.purpose ===  "previousBookings")
    {
        var userID = req.body.userID;
        var queryResult = await databaseQueryFetch(userID, 'getPreviousBooking', req.headers.cookie);
        var result = { result : queryResult.numOfRecs };
        res.json(result);
    }

    else if(req.body.purpose === "previousBookingData")
    {
        var previousBookingID = req.body.previousBookingID;
        var queryResult = await databaseQueryFetch(previousBookingID, 'previousBookingData', req.headers.cookie);
        var result = { TravelType : queryResult['records'][0]["0"].TravelTypeID, departureCity : queryResult['records'][0]["0"].FlightDepartureCity, arrivalCity : queryResult['records'][0]["0"].FlightArrivalCity, departureTime : (queryResult['records'][0]["0"].FlightTime).substring(0,5), result : 1 };
        res.json(result);
    }

    else if(req.body.purpose === "previousBookingDataRound")
    {
        var previousBookingID = req.body.previousBookingID;
        var queryResult = await databaseQueryFetch(previousBookingID, 'previousBookingDataRound', req.headers.cookie);
        var recordsArray = queryResult['records'][0];
        var numofRecs = recordsArray.length;
        
        var mainObj = {};
        for(var i = 0; i < numofRecs; i++)
        {
            var currentObj =  recordsArray[i];
            var keys = Object.keys(currentObj);
            
            for(var j = 0; j < keys.length; j++)
            {
                mainObj[`${keys[j] + i}`] = currentObj[keys[j]];
            }
        }

        var result = { 
            numOfRecs : numofRecs, 
            FlightDepartureCity0 : FlightDepartureCity0,
            FlightArrivalCity0 : FlightArrivalCity0,
            FlightDepartureCity1 : FlightDepartureCity1,
            FlightArrivalCity1 : FlightArrivalCity1,
            FlightTime1 : FlightTime1,
        };
        
        res.json(result);

    }

    else if(req.body.purpose === "previousFlightType")
    {
        var TravelerID = req.body.travelerID;
        var queryResult = await databaseQueryFetch(TravelerID, 'previousFlightType', req.headers.cookie);
        var result = { type : queryResult['records'][0]["0"].TravelTypeID };
        res.json(result);
    }

    else if(req.body.purpose === "getPersonalInfo")
    {
        var userID = req.body.userID;
        var queryResult = await databaseQueryFetch(userID, 'getPersonalInfo', req.headers.cookie);
        res.json(queryResult); 
    }

    else if(req.body.purpose === "updatePersonalInfo")
    {
        var userEmail = req.body.userEmail;
        var userPhone = req.body.userPhone;
        let data = {email : userEmail, phone : userPhone};
        var queryResult = await databaseQueryInsert(data, req.headers.cookie);
        var result = { result : queryResult.result.rowsAffected[0] }; 
        res.json(result);
    }

    else if(req.body.purpose === "getFlightData")
    {
        var flightID = req.body.selectedFlightID;
        let session_handle_axios = { headers: { cookie : req.session.user_name } };
        var result = await axios.post( process.env.IP + '/api/sabre/getFlightDetails', {  flightID : flightID }, session_handle_axios);
        var response = { result : 1, details : result.data };
        res.json(response);
    }

    else if(req.body.purpose === "getFormOptions")
    {
        result = { result : 1};
    }

    else if(req.body.purpose === "formType")
    {

        if(!user_details[req.session.user_name]) 
        { 
            user_details[req.session.user_name] = {};
            user_details[req.session.user_name].currentTraveler = 0;
        }
        else
        {
            user_details[req.session.user_name].currentTraveler = 0;
        }

        user_details[req.session.user_name].currentTraveler++;

        var numOfTravelers = req.body.seats;

        var response = { travelers : user_details[req.session.user_name].currentTraveler, result : 1 };
        
        if(numOfTravelers === user_details[req.session.user_name].currentTraveler)
        {
            user_details[req.session.user_name].currentTraveler = 0;
        }

        res.json(response);
    }

    else if(req.body.purpose === "checkAlowance")
    {
        var countryID = req.body.countryID;
        var companyID = req.body.companyID;
        var bookingMean = req.body.bookingMean;
        var result = await checkBookingALlowance(countryID, companyID, bookingMean, req.headers.cookie);
        var response = { result : result.result };
        res.json(response);
    }

    else if(req.body.purpose === "addHotelReservationInformation")
    {
        var cityArea = req.body.cityArea; 
        var hotelName = req.body.hotelName;
        var checkinDate = req.body.checkinDate;
        var checkOutDate = req.body.checkOutDate;

        (hotelName === "") ? hotelName = null : hotelName = hotelName;
        
        //Generatig payload for inserting data to the server
        var reservationDetails = { cityArea : cityArea, hotelName : hotelName, checkinDate : checkinDate, checkOutDate : checkOutDate };
            
        //Inserting data to the server
        var storeData = await saveData("hotel", reservationDetails, req.headers.cookie);
        if(storeData.status === 1)
        {
            var response = { success : true, response_for : req.body.purpose };
        }

        res.json(response);
    }

    else if(req.body.purpose === "multiHotelBooking")
    {

        if(!user_details[req.session.user_name])
        {
            user_details[req.session.user_name] = {};
            user_details[req.session.user_name].currentHotalDestinationOrder = 0;
        }
        else
        {
            user_details[req.session.user_name].currentHotalDestinationOrder = 0;            
        }

        user_details[req.session.user_name].currentHotalDestinationOrder++;
        
        var action = req.body.action;
        var numOfDestinations = req.body.numberOfDestination;

        if(action === "initialize")
        {
            var response = { currentHotalDestinationOrder : user_details[req.session.user_name].currentHotalDestinationOrder };
            if(user_details[req.session.user_name].currentHotalDestinationOrder > numOfDestinations)
            {
                user_details[req.session.user_name].currentHotalDestinationOrder = 0;
            }
        }

        if(action === "addHotelReservationInformation")
        {

            var cityArea = req.body.cityArea;
            var hotelName = req.body.hotelName;
            var checkinDate = req.body.checkinDate;
            var checkOutDate = req.body.checkOutDate;
            var destinationOrder = user_details[req.session.user_name].currentHotalDestinationOrder;
            
            (hotelName === "") ? hotelName = null : hotelName = hotelName;
        
            //Generatig payload for inserting data to the server
            var reservationDetails = { cityArea : cityArea, hotelName : hotelName, checkinDate : checkinDate, checkOutDate : checkOutDate };
                
            //Inserting data to the server
            var storeData = await saveData("hotel", reservationDetails, req.headers.cookie);
            
            if(storeData.status === 1)
            {
                var response = { result : 1 };
            }

            res.json(response);
        }

        if(action === "updateCurrentDestinationOrder")
        {
            user_details[req.session.user_name].currentHotalDestinationOrder = user_details[req.session.user_name].currentHotalDestinationOrder - 1;
            response = { result : 1 };
        }

        res.json(response);
    }

    else if(req.body.purpose === "setNumberOfDestinations")
    {
        user_details[req.session.user_name].currentHotalDestinationOrder = user_details[req.session.user_name].currentHotalDestinationOrder - 1;
        response = { result : 1 };
        res.json(response);
    }

    else if(req.body.purpose === "makeCarReservation")
    {
        var PickUpCity = req.body.PickUpCity;
        var DropOffCity = req.body.DropOffCity;
        var PickUpDate = req.body.PickUpDate;
        var DropOffDate = req.body.DropOffDate;
        var PickUpTime = req.body.PickUpTime;
        var DropOffTime = req.body.DropOffTime;
        
        //Generatig payload for inserting data to the server
        var reservationDetails = { 
            PickUpCity : PickUpCity,
            DropOffCity : DropOffCity,
            PickUpDate : PickUpDate,
            DropOffDate : DropOffDate,
            PickUpTime : PickUpTime,
            DropOffTime : DropOffTime
         };
                
        //Inserting data to the server
        var storeData = await saveData("rentalcar", reservationDetails, req.headers.cookie);
        
        if(storeData.status === 1)
        {
            var response = { success : true, response_for : req.body.purpose };
        }

        res.json(response);
    }

    else if(req.body.purpose === "makeTownCarReservation")
    {
        var townCarMode = req.body.townCarMode;

        if(townCarMode === "oneway")
        {
            var numberOfPassengers = req.body.numberOfPassengers;
            var pickUpDate = req.body.pickUpDate;
            var pickUpTime = req.body.pickUpTime;
            var pickUpAddress = req.body.pickUpAddress;
            var dropOffAddress = req.body.dropOffAddress;
            var townCarMode = req.body.townCarMode;

            //Generating the payload for storing the town car reservation details
            var reservationDetails = {
                numberOfPassengers : numberOfPassengers,
                pickUpDate: pickUpDate,
                pickUpTime : pickUpTime,
                pickUpAddress : pickUpAddress,
                dropOffAddress : dropOffAddress,   
                townCarMode : townCarMode
            }

            //Inserting data to the server
            var storeData = await saveData("towncar", reservationDetails, req.headers.cookie);
            if(storeData.status === 1)
            {
                var response = { result : 1 };
            }
        }

        else if(townCarMode === "hourly")
        {
            var numberOfPassengers = req.body.numberOfPassengers;
            var pickUpDate = req.body.pickUpDate;
            var pickUpTime = req.body.pickUpTime;
            var dropOffTime = req.body.townCarDropOffTime;
            var pickUpAddress = req.body.pickUpAddress;
            var townCarMode = req.body.townCarMode;

            
            //Generating the pay load for storing teh town car reservation data
            var reservationDetails = {
                numberOfPassengers : numberOfPassengers,
                pickUpDate : pickUpDate,
                pickUpTime : pickUpTime,
                dropOffTime : dropOffTime,
                pickUpAddress : pickUpAddress,
                townCarMode : townCarMode
            }

            var storeData = await saveData("towncar", reservationDetails, req.headers.cookie);
            if(storeData.status === 1)
            {
                var response = { result : 1 };
            }
        }

        res.json(response);
    }

    else if(req.body.purpose === "makeRailReservation")
    {
        var railType = req.body.railType

        if(railType === "oneway")
        {
            var departureCity = req.body.departureCity;
            var departureDate = req.body.departureDate;
            var prefferedTime = req.body.prefferedTime;
            var time = req.body.time;
            var arrivalCity = req.body.arrivalCity;
            
            //Generatig payload for inserting data to the server
            var reservationDetails = { 
                departureCity : departureCity,
                departureDate : departureDate,
                prefferedTime : prefferedTime,
                time : time,
                arrivalCity : arrivalCity,
                railType : req.body.railType
            };
                    
            //Inserting data to the server
            var storeData = await saveData("rail", reservationDetails, req.headers.cookie);
            if(storeData.status === 1)
            {
                var response = { result : 1 };
            }
            res.json(response);

        }

        if(railType === "roundtrip")
        {
            var arrivalCityGo =  req.body.arrivalCityGo;
            var departureTimeGo = req.body.departureTimeGo;
            var arrivalCityReturn = req.body.arrivalCityReturn;
            var departureCityNameGo = req.body.departureCityNameGo;
            var departureDateReturn = req.body.departureDateReturn;
            var departureTimeReturn =  req.body.departureTimeReturn;
            var departureCityNameReturn = req.body.departureCityNameReturn;
            var departurePreferredTimeGo = req.body.departurePreferredTimeGo;
            var departurePreferredTimeReturn = req.body.departurePreferredTimeReturn;
            var departureDateGo  = req.body.departureDateGo;

            //Generating pay load to store the rail reservation data to the server
            var reservationDetails = {
                arrivalCityGo : arrivalCityGo,
                departureTimeGo : departureTimeGo,
                arrivalCityReturn : arrivalCityReturn,
                departureCityNameGo : departureCityNameGo,
                departureDateReturn : departureDateReturn,
                departureTimeReturn : departureTimeReturn,
                departureCityNameReturn : departureCityNameReturn,
                departurePreferredTimeGo : departurePreferredTimeGo,
                departurePreferredTimeReturn : departurePreferredTimeReturn,
                railType : req.body.railType,
                departureDateGo : departureDateGo
            }

            //Inserting data to the server
            var storeData = await saveData("rail", reservationDetails, req.headers.cookie);
            if(storeData.status === 1)
            {
                var response = { result : 1 };
            }
            res.json(response);
        }

        if(railType === "multicity")
        {

            var action = req.body.action;

            if(action === "initialize")
            {

                if(!user_details[req.session.user_name])
                {
                    user_details[req.session.user_name] = {};
                    user_details[req.session.user_name].currentRailDestinationOrder = 0;
                }
                else
                {
                    user_details[req.session.user_name].currentRailDestinationOrder = 0;                    
                }

                user_details[req.session.user_name].currentRailDestinationOrder++;

                var numOfDestinations = req.body.numOfDestinations;
                
                var response = { currentRailDestinationOrder : user_details[req.session.user_name].currentRailDestinationOrder };
                
                if(user_details[req.session.user_name].currentRailDestinationOrder > numOfDestinations)
                {
                    user_details[req.session.user_name].currentRailDestinationOrder = 0;
                }
            }
            if(action === "insertData")
            {
                var departureCity   =   req.body.departureCity;
                var departureDate   =   req.body.departureDate;
                var prefferedTime   =   req.body.prefferedTime;
                var time            =   req.body.time;
                var arrivalCity     =   req.body.arrivalCity;
                var railType        =   req.body.railType;

                //Generating payload to store the rail reservation data
                var reservationDetails = {
                    departureCity : departureCity,
                    departureDate : departureDate,
                    prefferedTime : prefferedTime,
                    time : time,
                    arrivalCity : arrivalCity,
                    railType : railType
                }

                //Inserting data to the server
                var storeData = await saveData("rail", reservationDetails, req.headers.cookie);
                if(storeData.status === 1)
                {
                    var response = { result : 1, currentDestinationOrder :  user_details[req.session.user_name].currentRailDestinationOrder };
                }
                
            }
            if(action === "checkCurrentDestinationOrder")
            {
                var destinationOrder = user_details[req.session.user_name].currentRailDestinationOrder + 1;
                var response = { result : destinationOrder };
            }
            if(action === "decreaseOrder")
            {
                user_details[req.session.user_name].currentRailDestinationOrder--;
                var response = { result : 1 };
            }
            if(action === "resetValues")
            {
                user_details[req.session.user_name].currentRailDestinationOrder = 0;
            }
            
            res.json(response);
        }
    }

    else if(req.body.purpose === "makeFlightReservation")
    {
        var flightType = req.body.flightType;

        if(flightType === "oneway")
        {
            var origin = req.body.origin;
            var destination = req.body.destination;
            var time = req.body.time;
            var date = req.body.date;

            //Generatig payload for inserting data to the server
            var reservationDetails = { origin : origin, destination : destination, time : time, date : date, flightType : "oneway" };
            
            //Inserting data to the server
            var storeData = await saveData("flight", reservationDetails, req.headers.cookie);
            var response = { success : true, response_for : req.body.purpose };
            
        }
        
        else if(flightType === "roundtrip")
        {
            var departureCityGo = req.body.departureCityGo;
            var destinationCityGo = req.body.destinationCityGo;
            var departureTime = req.body.departureTime;
            var departureDate = req.body.departureDate;
            var departureCityReturn = req.body.departureCityReturn;
            var destinationCityReturn = req.body.destinationCityReturn;
            var returnDate = req.body.returnDate;
            var returnTime = req.body.returnTime;
            
            //Generatig payload for inserting data to the server
            var reservationDetails = { departureCityGo : departureCityGo, destinationCityGo : destinationCityGo, departureTime : departureTime, departureDate : departureDate, departureCityReturn : departureCityReturn, destinationCityReturn : destinationCityReturn, returnDate : returnDate, returnTime : returnTime, flightType : "roundtrip" };
            
            //Inserting data to the server
            var storeData = await saveData("flight", reservationDetails, req.headers.cookie);
            var response = { success : true, response_for : req.body.purpose };
        }
        
        res.json(response);
    }

    else if(req.body.purpose === "initializeVariables")
    {

        if(!user_details[req.session.user_name]) 
        {
            user_details[req.session.user_name] = {};
            user_details[req.session.user_name].currentTraveler = 0;
        }
        else
        {
            user_details[req.session.user_name].currentTraveler = 0;
        }

        if(!user_details[req.session.user_name])
        {
            user_details[req.session.user_name] = {};
            user_details[req.session.user_name].currentHotalDestinationOrder = 0;
        }
        else
        {
            user_details[req.session.user_name].currentHotalDestinationOrder = 0;
        }

        if(!user_details[req.session.user_name])
        {
            user_details[req.session.user_name] = {};
            user_details[req.session.user_name].currentRailDestinationOrder = 0;
        }
        else
        {
            user_details[req.session.user_name].currentRailDestinationOrder = 0;
        }

        if(!user_details[req.session.user_name])
        {
            user_details[req.session.user_name] = {};
            user_details[req.session.user_name].currentFlightDestinationOrder = 0;
        }
        else
        {
            user_details[req.session.user_name].currentFlightDestinationOrder = 0;
        }

        if(!user_details[req.session.user_name])
        {
            user_details[req.session.user_name] = {};
            user_details[req.session.user_name].multiCityFlightDetails = [];
        }
        else
        {
            user_details[req.session.user_name].multiCityFlightDetails = [];   
        }

        //Initializing storing module
        var initStoringMod = await intializeStoringModule(req.headers.cookie);
        if(initStoringMod === 1)
        {
            var response = { success : true, result : 1, response_for : req.body.purpose };
        }
        res.json(response);
    }

    else if(req.body.purpose === "getMultiCityDetails")
    {
        var response = { details : user_details[req.session.user_name].multiCityFlightDetails, result : (user_details[req.session.user_name].multiCityFlightDetails).length };
        res.json(response);
    }

    else if(req.body.purpose === "getCityName") 
    {
        var cityCode = req?.body?.cityCode;

        var city_name   =   await getCityName(cityCode, req.headers.cookie);
        var name        =   city_name?.recordObj?.City;
        var response    =   { success : true, name : name, response_for : req.body.purpose };

        res.json(response);
    }

    else if(req.body.purpose === "flightDataReq")
    {
        var flightType = req.body.flightType;

        if(flightType === "oneway")
        {
            var flightDetails = await getFlightResInfo(req.headers.cookie);
            var response = { result : 1, details : flightDetails.responseDetails[0] };
        }
        else if(flightType === "roundtrip")
        {
            var finalObj = {};

            var flightDetails = await getFlightResInfo(req.headers.cookie);
            //as we knoe there are two itenrneries in a round trip
            for (var i = 0; i < 2; i++)
            {
                var currentRecObj = flightDetails.responseDetails[i];
                var keys = Object.keys(currentRecObj);
                for (var j = 0; j < keys.length; j++)
                {
                    finalObj[`${keys[j] + i}`] = currentRecObj[keys[j]];
                }
            }            
            
            var response = { result : 1, details : finalObj };
        }
        else if(flightType === "multicity")
        {
            var flightDetails = await getFlightResInfo(req.headers.cookie);
            var response = { result : 1, details : flightDetails.responseDetails };
        }
        
        res.json(response);
    }

    else if(req.body.purpose === "checkRecord")
    {
        var recordType = req.body.bookingMean;

        if(recordType === "hotel")
        {
            var TravelerID = req.body.travelerID;
            var records = await getRecords(TravelerID, "hotel", req.headers.cookie);
            if(records.numOfRecs === 0)
            {
                var response = { result : 0 };
            }
            else 
            {
                var response = { result : records.numOfRecs };
            }
        }

        if(recordType === "rentalCar")
        {
            var TravelerID = req.body.travelerID;
            var records = await getRecords(TravelerID, "rentalCar", req.headers.cookie);
            if(records.numOfRecs === 0)
            {
                var response = { result : 0 };
            }
            else 
            {
                var response = { result : records.numOfRecs };
            }
        }

        if(recordType === "towncar")
        {
            var TravelerID = req.body.travelerID;
            var records = await getRecords(TravelerID, "towncar", req.headers.cookie);
            if(records.numOfRecs === 0)
            {
                var response = { result : 0 };
            }
            else 
            {
                var response = { result : records.numOfRecs };
            }
        }

        if(recordType === "rail")
        {
            var TravelerID = req.body.travelerID;
            var records = await getRecords(TravelerID, "rail", req.headers.cookie);
            if(records.numOfRecs === 0)
            {
                var response = { result : 0 };
            }
            else 
            {
                var response = { result : records.numOfRecs, railType : records.railType };
            }
        }

        res.json(response);
    }

    else if(req.body.purpose === "addSpecialReq")
    {
        var specialRequest = req.body.specialRequest;
        let session_handle_axios = { headers: { cookie : req.headers.cookie } };
        var result = await axios.post( process.env.IP + '/api/save/saveData', { dataType : 'specialRequest', specialRequest : specialRequest }, session_handle_axios);
        var response = { success : true, response_for : req.body.purpose };
        res.json(response);
    }

    else if(req.body.purpose === "getSpecialRequest")
    {
        var travelerID = req.body.travelerID;
        let session_handle_axios = { headers: { cookie : req.session.user_name } };
        var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', requestType: "getSepcialRequest", TravelerID : travelerID }, session_handle_axios);
        var specialRequest = DBresponse.data.record[0].SpecialRequests;
        var response = { result : 1, request : specialRequest };
        res.json(response);
    }

    else if(req.body.purpose === "getTripPurpose")
    {
        var travelerID = req.body.travelerID;
        let session_handle_axios = { headers: { cookie : req.session.user_name } };
        var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', requestType: "getTripPurpose", travelerID : travelerID }, session_handle_axios);
        var TripPurposeID = DBresponse.data.records[0][0].TripPurposeID;
        if(DBresponse.data.numOfRecs === 1)
        {
            var response = { result : 1, tripPurposeID : TripPurposeID };
        }
        
        res.json(response);
    }

    else if(req.body.purpose === "checkNativeLanguage")
    {
        var user_id = req.body.userID;
        var countryCode = await getUserCountry(user_id, req.headers.cookie);

        if(countryCode == "MX") { countryCode = "ES" };

        var supportedLanguages = { ZA: 'af', AR: 'ar', AE: 'ar', SA : 'ar', AZ: 'az', RU: 'ru', BY: 'be', BG: 'bg', BD: 'bn', BA: 'bs', ES: 'es', ME: 'cnr', CZ: 'cs', GB: 'cy', DK: 'da', DE: 'de', GR: 'el', US: 'en', EO: 'eo', EE: 'et', IR: 'fa', FI: 'fi', FR: 'fr', CA: 'fr-CA', IE: 'ga', IN: 'hi', IL: 'he', HR: 'hr', HT: 'ht', HU: 'hu', AM: 'hy', ID: 'id', IS: 'is', IT: 'it', JP: 'ja', GE: 'ka', KZ: 'kk', KH: 'km', KR: 'ko', ku: 'ku', KG: 'ky', LA: 'lo', LT: 'lt', LV: 'lv', MN: 'mn', MY: 'ms', MT: 'mt', MM: 'my', NO: 'nn', NP: 'ne', NL: 'nl', PK: 'ur', PL: 'pl', PS: 'ps', BR: 'pt', RO: 'ro', LK: 'si', SK: 'sk', SI: 'sl', SO: 'so', AL: 'sq', RS: 'sr', SE: 'sv', TH: 'th', PH: 'tl', TR: 'tr', UA: 'uk', VN: 'vi', CN: 'zh', TW: 'zh-TW' };

        if(!user_details[req.session.user_name])
        {
            user_details[req.session.user_name] = {};
            user_details[req.session.user_name].prefferedLanguage = "English"
            user_details[req.session.user_name].identifiedPrefferedLanguage = "English";
            user_details[req.session.user_name].languageCode = "en";
            user_details[req.session.user_name].identifiedLanguageCode = "en";
        }
        else
        {
            user_details[req.session.user_name].prefferedLanguage = "English"
            user_details[req.session.user_name].identifiedPrefferedLanguage = "English";
            user_details[req.session.user_name].languageCode = "en";
            user_details[req.session.user_name].identifiedLanguageCode = "en";
        }

        user_details[req.session.user_name].identifiedLanguageCode      =   await supportedLanguages[countryCode];
        user_details[req.session.user_name].identifiedPrefferedLanguage =   await ISO6391.getName(clm.getCountryByAlpha2(countryCode).languages[0]);

        if( user_details[req.session.user_name].identifiedLanguageCode == "en" ||  user_details[req.session.user_name].identifiedLanguageCode == undefined || user_details[req.session.user_name].identifiedLanguageCode == "" )
        {
            var response = { result : 1 };
        }
        else 
        {
            if( user_details[req.session.user_name].identifiedPrefferedLanguage === "English" || user_details[req.session.user_name].identifiedPrefferedLanguage === "english")
            {
                var response = { result : 1 };
            }
            else
            {
                var response = { result : 0, languageCode : user_details[req.session.user_name].identifiedLanguageCode, language : user_details[req.session.user_name].identifiedPrefferedLanguage };
            }
        }

        res.json(response);
    }

    else if(req.body.purpose === "changeLanguage")
    {
        var preffered_language      =   req.body.language;
        var language_code           =   req.body.languageCode;
        var session_handle_axios    =   { headers: { cookie : req.headers.cookie } };
        var watson_response         =   await axios.post( process.env.IP + '/api/watson/changeLanguage', { language: preffered_language, languageCode : language_code }, session_handle_axios);
        var api_response            =   watson_response?.data?.status;
        
        if(api_response)
        {
            var response = {result : 1}
        }
        else
        {
            var response = { result : 0 };
        }

        res.json(response);
    }

    else if(req.body.purpose === "requiredReservationTypes")
    {
        if(!user_details[req.session.user_name])
        {
            user_details[req.session.user_name] = {};
            user_details[req.session.user_name].reservation_array = [];   
        }
        else
        {
            user_details[req.session.user_name].reservation_array = [];
        }

        user_details[req.session.user_name].reservation_array = req.body.reservation_array;

        var response = { status : 1 };
        res.json(response);
    }

    else if(req.body.purpose === "checkReservationRequirement")
    {
        var reservation_type = req.body.reservationType;
        var status = (user_details[req.session.user_name].reservation_array).includes(reservation_type);
        if (status === true)
        {
            var response = { success  : true, response_for : req.body.purpose };
        }
        else
        {
            var response = { success  : false, response_for : req.body.purpose };
        }

        res.json(response);
    }

    else if(req.body.purpose === "getReservationDetailsToAlter")
    {
        var travelerID = req.body.travelerID;
        var reservationDetails = await getReservationDetailsToAlter(travelerID, req.headers.cookie); //It will restun an array

        if(user_details[req.session.user_name].prefferedLanguage === "English")
        {
            //Here we will make a form that will be send to the client view
            var textToShow = `<div class='msg-row'><div class='user-msg receive'><p> What reservation types you want to alter? </p></div> <div class='msg-row select'> <ul class='reservation-list'>`;
            
            if(reservationDetails.includes("flight") == true)
            {
                textToShow += `<li><input type="checkbox" id="flight_reservation" class="reservation_details_previous" value="flight"><label for="flight_reservation"> Flight Reservation </label></li>`;   
            }

            if(reservationDetails.includes("hotel") == true)
            {
                textToShow += `<li><input type="checkbox" id="hotel_reservation" class="reservation_details_previous" value="hotel"><label for="hotel_reservation"> Hotel Reservation </label></li>`;   
            }

            if(reservationDetails.includes("rental_car") == true)
            {
                textToShow += `<li><input type="checkbox" id="rental_car_reservation" class="reservation_details_previous" value="rental_car"><label for="rental_car_reservation"> Rental Car Reservation </label></li>`;
            }
            
            if(reservationDetails.includes("town_car") == true)
            {
                textToShow += `<li><input type="checkbox" id="town_car_reservation" class="reservation_details_previous" value="town_car"><label for="town_car_reservation"> Town Car Reservation </label></li>`;
            }
            
            if(reservationDetails.includes("rail") == true)
            {
                textToShow += `<li><input type="checkbox" id="rail_reservation" class="reservation_details_previous" value="rail"><label for="rail_reservation"> Rail Reservation </label></li>`;
            }

            textToShow += `</ul> </div> <div class='reserve-button'> <div class='msg-row select'> <div class='msg-row select'> <button type="button" class='btn btn-default disableIt' onclick="requiredReservationTypesPrevious();"> Ok </button> </div> </div> </div></div>`;

        }

        else
        {
            var textToShow = `<div class='msg-row'><div class='user-msg receive'><p> ${await translateTextAPI("What reservation types you want to alter", req.headers.cookie)}? </p></div> <div class='msg-row select'> <ul class='reservation-list'>`;
            
            if(reservationDetails.includes("flight") == true)
            {
                textToShow += `<li><input type="checkbox" id="flight_reservation" class="reservation_details_previous" value="flight"><label for="flight_reservation"> ${await translateTextAPI("Flight Reservation", req.headers.cookie)} </label></li>`;   
            }

            if(reservationDetails.includes("hotel") == true)
            {
                textToShow += `<li><input type="checkbox" id="hotel_reservation" class="reservation_details_previous" value="hotel"><label for="hotel_reservation"> ${await translateTextAPI("Hotel Reservation", req.headers.cookie)} </label></li>`;   
            }

            if(reservationDetails.includes("rental_car") == true)
            {
                textToShow += `<li><input type="checkbox" id="rental_car_reservation" class="reservation_details_previous" value="rental_car"><label for="rental_car_reservation"> ${await translateTextAPI("Rental Car Reservation", req.headers.cookie)} </label></li>`;
            }
            
            if(reservationDetails.includes("town_car") == true)
            {
                textToShow += `<li><input type="checkbox" id="town_car_reservation" class="reservation_details_previous" value="town_car"><label for="town_car_reservation"> ${await translateTextAPI("Town Car Reservation", req.headers.cookie)} </label></li>`;
            }
            
            if(reservationDetails.includes("rail") == true)
            {
                textToShow += `<li><input type="checkbox" id="rail_reservation" class="reservation_details_previous" value="rail"><label for="rail_reservation"> ${await translateTextAPI("Rail Reservation", req.headers.cookie)} </label></li>`;
            }

            textToShow += `</ul> </div> <div class='reserve-button'> <div class='msg-row select'> <div class='msg-row select'> <button type="button" class='btn btn-default disableIt' onclick="requiredReservationTypesPrevious();"> ${await translateTextAPI("Ok", req.headers.cookie)} </button> </div> </div> </div></div>`;
        }

        var response = { textToShow : textToShow };
        res.json(response);
    }

    else if(req.body.purpose === "addTripPurpose")
    {
        var tripPurposeID = req.body.tripPurposeID;

        var status = await setTripPurpose(tripPurposeID, req.headers.cookie);
        var response = { success : true, response_for : req.body.purpose };
        res.json(response);
    }

    else if(req.body.purpose === "getRentalCarDetails")
    {
        var selected_car = req.body.car_id;
        var car_details = await getRentalCarDetails(selected_car, req.headers.cookie);
        res.json(car_details);
    }

    else if(req.body.purpose === "getTownCarDetails")
    {
        var selected_car = req.body.car_id;
        var car_details = await getTownCarDetails(selected_car, req.headers.cookie);
        res.json(car_details);
    }

    else if(req.body.purpose === "checkForReservationInfo")
    {
        var reservation_infromation = await getReservationInformation(req.headers.cookie);

        if(reservation_infromation.reservation_count > 0)
        {
            response = { success : true, response_for : req.body.purpose };
        }
        else
        {
            response = { success : false, response_for : req.body.purpose };
        }

        res.json(response);
    }

    else if(req.body.purpose === "emptyTravelersInfoArray")
    {
        var emptyTravelerInfo = await emptyTravelerInfoArray(req.headers.cookie);
        var resposne = { success : true, response_for : req.body.purpose };
        res.json(resposne);
    }

    else if(req.body.purpose === "verifyArrangerRole")
    {
        var verify_roles = await verifyRoles(req.headers.cookie);
        var response = { status : verify_roles.status };
        res.json(response);
    }

    else if(req.body.purpose === "translateLocalStatements")
    {
        var translatedStatements    =   [];
        var translatedStatements1   =   [];
        var statmentsToTranslate    =   req.body.statmentsToTranslate;
        var statmentsToTranslate1   =   req.body.statmentsToTranslate1;
        var langauge_code           =   req.body.language_code;
        var langauge                =   req.body.langauge;
        
        for (var i = 0; i < statmentsToTranslate.length; i++)
        {
            var translatedStatement = await watsonRoutes.translate(langauge_code, statmentsToTranslate[i], null);
            translatedStatements.push(translatedStatement);
        }

        for (var i = 0; i < statmentsToTranslate1.length; i++)
        {
            var translatedStatement1 = await watsonRoutes.translate(langauge_code, statmentsToTranslate1[i], null);
            translatedStatements1.push(translatedStatement1);
        }

        var change_language = await change_language_code(langauge_code, langauge, req.headers.cookie);
        
        var response = { translatedStatements : translatedStatements, translatedStatements1 : translatedStatements1 };
        res.json(response);
    }

    else if(req.body.purpose === "getCurrentTravelerDetails")
    {
        var currentTravelerDetails = await getCurrentTravelerDetails(req.headers.cookie);
        var response = { success : true, first_name : currentTravelerDetails.first_name, last_name : currentTravelerDetails.last_name, userID : currentTravelerDetails.userID, response_for: "getCurrentTravelerInfo" };
        res.json(response);
    }

    else if(req.body.purpose === "getTranslationEnabled")
    {
        var reservaiton_required = req.body.required_reservation;

        if(reservaiton_required == "date_range")
        {
            var html = `<div class="chat-panel" id="dates-left-pannel"> <div class="chat-panel-header"> <h3> ${ await watsonRoutes.translate(null, "Trip Date Range", req.session.user_name) } </h3> </div> <div class="chat-panel-body"> <p> ${ await watsonRoutes.translate(null, "Getting Dates", req.session.user_name) } </p> </div> </div>`;   
        }
        if(reservaiton_required == "flight")
        {
            var html = `<div class="chat-panel" id="flight-left-pannel"> <div class="chat-panel-header"> <h3> ${ await watsonRoutes.translate(null, "AIR RESERVATION DETAILS", req.session.user_name) } </h3> </div> <div class="chat-panel-body"> <p> ${ await watsonRoutes.translate(null, "Reservation in process", req.session.user_name) } </p> </div> </div>`;   
        }
        else if(reservaiton_required == "hotel")
        {
            var html = `<div class="chat-panel" id="hotel-left-pannel"> <div class="chat-panel-header"> <h3> ${ await watsonRoutes.translate(null, "HOTEL RESERVATION DETAILS", req.session.user_name) } </h3> </div> <div class="chat-panel-body"> <p> ${ await watsonRoutes.translate(null, "Reservation in process", req.session.user_name) } </p> </div> </div>`;   
        }
        else if(reservaiton_required == "rental_car")
        {
            var html = `<div class="chat-panel" id="rental_car-left-pannel"> <div class="chat-panel-header"> <h3> ${ await watsonRoutes.translate(null, "RENTAL CAR RESERVATION DETAILS", req.session.user_name) } </h3> </div> <div class="chat-panel-body"> <p> ${ await watsonRoutes.translate(null, "Reservation in process", req.session.user_name) } </p> </div> </div>`;   
        }
        else if(reservaiton_required == "town_car")
        {
            var html = `<div class="chat-panel" id="town_car-left-pannel"> <div class="chat-panel-header"> <h3> ${ await watsonRoutes.translate(null, "TOWN CAR RESERVATION DETAILS", req.session.user_name) } </h3> </div> <div class="chat-panel-body"> <p> ${ await watsonRoutes.translate(null, "Reservation in process", req.session.user_name) } </p> </div> </div>`;   
        }
        else if(reservaiton_required == "rail")
        {
            var html = `<div class="chat-panel" id="rail-left-pannel"> <div class="chat-panel-header"> <h3> ${ await watsonRoutes.translate(null, "RAIL RESERVATION DETAILS", req.session.user_name) } </h3> </div> <div class="chat-panel-body"> <p> ${ await watsonRoutes.translate(null, "Reservation in process", req.session.user_name) } </p> </div> </div>`;   
        }
        var response = { textToShow : html };
        res.json(response);
    }

    else if(req.body.purpose === "get_previous_iternery_data")
    {
        
        var reservation_module_type = req.body.reservation_module;
        var required_info = await getRequiredInfo(req.headers.cookie);
        
        if(required_info != null && required_info != undefined)
        {
            if(reservation_module_type == "flight")
            {
                if(required_info.length > 1) 
                {
                    var dep_date = required_info[0].FlightDepartureDate.split(' ')[0];
                    var dep_time = required_info[0].FlightDepartureDate.split(' ')[1];
                    var arr_date = required_info[1].FlightDepartureDate.split(' ')[0];
                    var arr_time = required_info[1].FlightDepartureDate.split(' ')[1];
                    var response = {
                        success : true,
                        flightType : 2,
                        div_id:required_info[0].div_id,
                        rental_difference :required_info[0].rental_difference,
                        hotel_difference:required_info[0].hotel_difference,
                        flightDeparture : required_info[0].origin,
                        dep_date : dep_date,
                        dep_time : dep_time,
                        arr_date : arr_date,
                        arr_time : arr_time,
                        flightArrival : required_info[0].destinat,
                        flight_carrier : required_info[0].airline_code,
                        response_for : req.body.purpose
                    }
                } 
                else
                {
                    var dep_date = required_info[0].FlightDepartureDate.split(' ')[0];
                    var dep_time = required_info[0].FlightDepartureDate.split(' ')[1];

                    var response = {
                        success : true,
                        flightType : 1,
                        div_id:required_info[0].div_id,
                        rental_difference :required_info[0].rental_difference,
                        hotel_difference:required_info[0].hotel_difference,
                        flightDeparture : required_info[0].origin,
                        flightArrival : required_info[0].destinat,
                        dep_date : dep_date,
                        dep_time : dep_time,
                        flight_carrier : required_info[0].airline_code,
                        response_for : req.body.purpose
                    }
                }
            
            }
            if(reservation_module_type == "hotel")
            {
                var check_in_date = required_info[0][0].HotelCheckIn.split('T')[0];
                var check_out_date = required_info[0][0].HotelCheckOut.split('T')[0];
                var response = {
                    success : true,
                    seats:1,
                    type:1,
                    div_id:required_info[0][0].div_id,
                    hotelCity:required_info[0][0].HotelState,
                    check_in_date:check_in_date,
                    check_out_date:check_out_date,
                    response_for : req.body.purpose
                }
            }
            if(reservation_module_type == "rentalcar")
            {
                var response = {
                    success : true,
                    type:1,
                    div_id:required_info[0][0].div_id,
                    carDropOffCity:required_info[0][0].DropoffCityCode,
                    carPickupCity:required_info[0][0].PickupCityCode,
                    pick_up_date :required_info[0][0].PickupDateTime.indexOf('T') > -1 ? required_info[0][0].PickupDateTime.split('T')[0] : required_info[0][0].PickupDateTime.split(' ')[0],
                    pick_up_time :required_info[0][0].PickupDateTime.indexOf('T') > -1 ? '00:00:00' : required_info[0][0].PickupDateTime.split(' ')[1],
                    drop_off_date :required_info[0][0].DropoffDateTime.indexOf('T') > -1 ? required_info[0][0].DropoffDateTime.split('T')[0] : required_info[0][0].DropoffDateTime.split(' ')[0],
                    drop_off_time :required_info[0][0].DropoffDateTime.indexOf('T') > -1 ? '00:00:00' : required_info[0][0].DropoffDateTime.split(' ')[1],
                    response_for : req.body.purpose
                }
            }
        }
        else
        {
            var response = { status: 404, message: "Cannot get the infromation" };
        }
        res.json(response);
    }

    else if(req.body.purpose === "get_booking_iternery_data")
    {
        var reckey_id = req.body.traveler_reckey;
        var required_info = await getpreviousbookingInfo(reckey_id, req.headers.cookie);
        if(required_info != null && required_info != undefined )
        {
            if(required_info.trip_type != null && required_info.trip_type != undefined)
            {
                if(required_info.trip_type > 1)
                {
                    var response = { flightType : 2};
                }else
                {
                    var response = { flightType : 1};
                }
            }else
            {
                var response = 0;
            }
        }
        else
        {
            var response = { status: 404, message: "Cannot get the infromation" };
        }
        res.json(response);
    }

    else if(req.body.purpose === "get_traveler_most_frequent_city")
    {
        var frequent_city = await get_frequent_city(req.headers.cookie);
        var response = { success : true, city_name : frequent_city.city_name, city_code : frequent_city.city_code, response_for : req.body.purpose };
        res.json(response);
    }

    else if(req.body.purpose === "storeDatesToDB")
    {
        var departure_date_range    =   req.body.departure_date_range;
        var return_date_range       =   req.body.return_date_range;

        var dates_details = { departure_date_range : departure_date_range, return_date_range : return_date_range };

        var storeData = await saveData("dates", dates_details, req.headers.cookie);

        if(storeData.status === 1)
        {
            var response = { success : true, response_for : "store_dates" };
        }

        res.json(response);
    }

    else if(req.body.purpose === "translate_text")
    {
        var text    =   req.body.text;
        var result  =   await watsonRoutes.translate(null, text, req.session.user_name);
        res.json(result);
    }

    else if(req.body.purpose === "get_traveler_infromation")
    {
        var email = req.body.email;
        var user_id = req.body.user_id;
        var company_id = req.body.company_id;
        var country_id = req.body.country_id;

        var data = {
            formTypeID : 1,
            userID : user_id,
            travelerType : "employee",
            currentTraveller : 1,
            numOfTravelers : 0,
            companyID : company_id,
            countryID : country_id,
            tripPurpose : null,
            travelerEmail : email,
            arrangerID: null
        }

        var traveler_infromation = await getTravelerInfo(data);
        var response = { success: true, traveler_details : traveler_infromation }
        res.json(response);
    }
});

//================================== [IBM WebHook Implementation] =======================================//

//====================================== [Socket Configuration] ==========================================//

//Not currently being used
io.on('connect', (client) => {
    
    client.on('voiceData', async function(data) {
        
        //Data coming from browser in raw chunks
        const dataURL = data.audio.dataURL.split(',').pop();
        let fileBuffer = Buffer.from(dataURL, 'base64');
        
        //Storing Voices for shwoing on Chat and voice recogniton for STT
        var rootStoringPath = path.join(rootPath, "/Chatbot_Audios/");
        
        //Checking if the directory exists or will create a directoy for it
        if (!fs.existsSync(rootStoringPath)){ await fs.mkdirSync(rootStoringPath);}
        else
        {
            //For making unique voice data file every time
            var timestamp = new Date().getUTCMilliseconds();
            var fileName = timestamp;

            //Creating .wav file for the voice data
            const fileStoringPath = `${rootStoringPath + fileName}audiofile.wav`;
            await fs.writeFileSync(fileStoringPath, fileBuffer);
            
            //Generating file URL for serving on the client side
            var audioFilePathToPlay = `${process.env.IP}/audio/${fileName}audiofile`;
            var audioFilePathToAnalyze = `Chatbot_Audios/${fileName}audiofile.wav`;

            try{

                //Here we will call the route implementation for stt
                var response =  await voiceToText(audioFilePathToAnalyze, req.headers.cookie);

                if(response.text != undefined && response.text != null && response.text != "")
                {
                    result = { msg : response.text, filePath : audioFilePathToPlay, VoiceError : null }
                }
                else
                {
                    result = { msg : "I did not understant what are you trying to say! Please speak again.", filePath : audioFilePathToPlay, VoiceError : 1 }
                } 
                
                client.emit('results', result);
            
            }catch(error)
            {
                res.send("Following error occured : " + error);
            }
        }
    });

    client.on('disconnect', function(){ 
        //here show something when connection closed
    });
});

//====================================== [Socket Configuration] ==========================================//

//======================================= [Serving Audio Files] ==========================================//

//Not currenlty being used
app.get('/audio/:fileName', (req, res) => {
    var file = req.params.fileName;
    var filePath = path.join(rootPath, "Chatbot_Audios/");
    ms.pipe(req, res, filePath + `${file}.wav`);
});

//======================================= [Serving Audio Files] ==========================================//

httpsServer.listen(3546, function() { console.log(`Baldwin Booking Butler is up on : ${process.env.IP}`); });