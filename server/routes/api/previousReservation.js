//======================================== [Dependecies] ================================================//

//Route Main Dependecies
const { request }           =   require("express");
const express               =   require("express");
const router                =   express.Router();

//SQL Depedencies
const sql                   =   require("mssql");

//current timestamp
var moment                  =   require('moment');

//Calling External APIs [Translation] Dependecies
const axios                 =   require('axios');
const { v4: uuidv4 }        =   require('uuid');
var PreviousRes             =   require("../../custom_views/previousreservation_view.js");
var CurrentTravelrInfo      =   require('./traveler');
var watsonRoute             =   require('./watson');

//======================================== [Dependecies] ================================================//

//==================================== [Language Preference] =============================================//

var user_details = {};

router.post('/changeLanguage', async (req, res) => {

    if(!user_details[req.session.user_name])
    {
        user_details[req.session.user_name] = {};
        user_details[req.session.user_name].prefferedLanguage = "English"
        user_details[req.session.user_name].languageCode = "en"
    }
    else
    {
        user_details[req.session.user_name].prefferedLanguage = "English"
        user_details[req.session.user_name].languageCode = "en"
    }

    user_details[req.session.user_name].prefferedLanguage = req.body.language;
    user_details[req.session.user_name].prefferedLanguage = req.body.languageCode;
    var response = { status : 1 };
    res.json(response);
});

//==================================== [Language Preference] =============================================//

//====================================== [Helping functions] =============================================//

async function getFlightData(TravelerID, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', TravelerID : TravelerID, requestType : "getFlightDetails" }, session_handle_axios);
    return DBresponse.data;
}

async function getSeats(GroupID, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', GroupID : GroupID, requestType : "getSeats" }, session_handle_axios);
    return DBresponse.data.record;
}

async function getHotelData(TravelerID, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', TravelerID : TravelerID, requestType : "getHotelDetails" }, session_handle_axios);
    return DBresponse.data;
}

async function getRentalCarData(TravelerID, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', TravelerID : TravelerID, requestType : "getRentalCarDetails" }, session_handle_axios);
    return DBresponse.data;
}

async function getTownCarData(TravelerID, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', TravelerID : TravelerID, requestType : "getTownCarDetails" }, session_handle_axios);
    return DBresponse.data;
}

async function getRailData(TravelerID, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', TravelerID : TravelerID, requestType : "getRailDetails" }, session_handle_axios);
    return DBresponse.data;
}

//This function will check either the traveler is SINGLE or in GROUP.
async function checkTraveler(TravelerID, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', TravelerID : TravelerID, requestType : "getTravelerType" }, session_handle_axios);
    return DBresponse.data;
} 

async function getTravelerInfo(TravelerID, GroupID, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', TravelerID : TravelerID, GroupID : GroupID, requestType : "getTravelerDetails" }, session_handle_axios);
    return DBresponse.data;
}

function changeTime(timeStamp)
{
    
    var h = new Date(timeStamp).getHours();
    var m = new Date(timeStamp).getMinutes();
    
    h = (h<10) ? '0' + h : h;
    m = (m<10) ? '0' + m : m;
    var output = h + ':' + m;
    return output;
}

async function getSpecialRequest(TravelerID, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', TravelerID : TravelerID, requestType : "getSepcialRequest" }, session_handle_axios);
    return DBresponse.data;
}

async function getTripPurpose(TravelerID, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', TravelerID : TravelerID, requestType : "getTripPurposeID" }, session_handle_axios);
    return DBresponse.data;
}   

async function translateTextAPI(text, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var APIResponse = await axios.post( process.env.IP + '/api/watson/tanslate', { from : "English", to : "en", text : text }, session_handle_axios);
    return APIResponse.data;
}

async function storeFlightData(obj, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var api_response = await axios.post( process.env.IP + '/api/save/saveData', { dataType : "flight", dataObj : obj }, session_handle_axios);
    return api_response.data;
}

async function storeTravelerData(obj, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var api_response = await axios.post( process.env.IP + '/api/save/saveData', { dataType: 'traveler', data : obj }, session_handle_axios);
    return api_response.data;
}

async function storeHotelData(obj, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var api_response = await axios.post( process.env.IP + '/api/save/saveData', { dataType: 'hotel', dataObj : obj }, session_handle_axios);
    return api_response.data;
}

async function storeHotelArrayData(obj, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var api_response = await axios.post( process.env.IP + '/api/save/saveData', { dataType: 'hotelArray', dataObj : obj }, session_handle_axios);
    return api_response.data;
}

async function storeRentalCarData(obj, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var api_response = await axios.post( process.env.IP + '/api/save/saveData', { dataType: 'rentalcar', dataObj : obj }, session_handle_axios);
    return api_response.data;
}

async function storeTownCarData(obj, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var api_response = await axios.post( process.env.IP + '/api/save/saveData', { dataType: 'towncar', dataObj : obj }, session_handle_axios);
    return api_response.data;
}

async function storeRailData(obj, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var api_response = await axios.post( process.env.IP + '/api/save/saveData', { dataType: 'rail', dataObj : obj }, session_handle_axios);
    return api_response.data;
}

async function storeRailArrayData(array, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var api_response = await axios.post( process.env.IP + '/api/save/saveData', { dataType: 'railArray', dataObj : array }, session_handle_axios);
    return api_response.data;
}

async function storeSpecialRequest(data, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var api_response = await axios.post( process.env.IP + '/api/save/saveData', { dataType: 'specialRequest', specialRequest : data }, session_handle_axios);
    return api_response.data;
}

function getNewDate(base_date, module_date, new_date)
{
    var date_1 = new Date(base_date);
    var date_2 = new Date(module_date);

    //Get 1 day in milliseconds
    var one_day = 1000*60*60*24;

    // Convert both dates to milliseconds
    var date1_ms = date_1.getTime();
    var date2_ms = date_2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = date2_ms - date1_ms;
    
    // Convert back to days and return
    var days_to_add = Math.round(difference_ms/one_day);

    var new_module_date =  moment(new_date).add(days_to_add, 'd').format('YYYY-MM-DD');

    return new_module_date;
}

async function getBaseDate(current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var api_response = await axios.post( process.env.IP + '/api/save/getFlightBaseData', { test : "Test" }, session_handle_axios);
    return api_response.data.base_date;
}

async function setTripPurpose(id, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var RouteResponse = await axios.post( process.env.IP + '/api/save/storeTripPurpose', { tripPurposeID : id }, session_handle_axios);
    return RouteResponse.data;
}

async function getPreviousReservationDetails(city_name, userID, employee_id, dep_date, return_date, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var RouteResponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : "FetchData", requestType : "checkPreviousFlights", destination_city : city_name, userID : userID, emp_id : employee_id, dep_date : dep_date, return_date : return_date }, session_handle_axios);
    return RouteResponse.data;
}

async function getCityCode(cityName, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', requestType: "getCityCode", cityName : cityName }, session_handle_axios);
    return DBresponse.data.recordObj.IATA;
}

async function getCityName(cityCode, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', requestType: "getCityName", cityCode : cityCode }, session_handle_axios);
    var city_name = DBresponse?.data?.recordObj?.City;
    return city_name;
}

//====================================== [Helping functions] ============================================//

//==================================== [Route Implementation] ===========================================//

router.post("/flightReservation", async (req, res) => {
    
    var action = req.body.action;

    if(action === "initialize")
    {
        if(!user_details[req.session.user_name])
        {
            user_details[req.session.user_name] = {};            
            user_details[req.session.user_name].flightDetailsArray = [];
        }
        else
        {
            user_details[req.session.user_name].flightDetailsArray = [];
        }
        
        var TravelerID  =   req.body.data.TravelerID;
        var flightType  =   req.body.data.flightType;
        var result      =   await getFlightData(TravelerID, req.headers.cookie);
        var seats       =   null;
        
        //Making Form
        var form = `<div class="panel panel-default"><div class="panel-body travel-form-body">`;

        if(flightType === 1)
        {
            var dataObj     =   result.records['0'][0];
            var group_id    =   dataObj.GroupID;
            
            if(group_id == 'null' || group_id == '')
            {
                seats = 1;
            }
            else
            {
                seats = await getSeats(dataObj.GroupID, req.headers.cookie);
            }
            
            var keys = Object.keys(dataObj);
            
            //Making Form
            for(var i = 0; i < keys.length; i++)
            {
                if(keys[i] === "FlightDepartureCity")
                {
                    form += `<div class="form-group travel-form-group"><label for="origin" class="disable_field"> Origin: </label><input type="text" autocomplete="off" class="form-control flight_info_insert" id="origin" value="${dataObj[keys[i]]}" disabled></div>`;
                }

                if(keys[i] === "FlightArrivalCity")
                {
                    form += `<div class="form-group travel-form-group"><label for="destination" class="disable_field">Destination:</label><input type="text" autocomplete="off" class="form-control flight_info_insert" id="destination" value="${dataObj[keys[i]]}" disabled></div>`;
                }
            }
            
            form += `<div class="form-group travel-form-group" id="date_error_belowLine"><label for="date">Departure Date:</label><input type="text" autocomplete="off" class="form-control date-input flight_info_insert" data-field="date" readonly id="date"> <span class="required-alert" id="date_error_text_incomplete_field" style="display:none;"> Please fill this field. </div>`;
        }
        
        else if(flightType === 2)
        {
            var requiredObj = {};
            var dataObjArray = result.records['0'];
            var group_id = dataObjArray[0]["GroupID"];
            
            if(group_id == 'null' || group_id == '')
            {
                seats = 1;
            }
            else
            {
                seats = await getSeats(group_id, req.headers.cookie);
            }
            
            for(var i = 0 ; i < dataObjArray.length; i++)
            {
                var dataObj = dataObjArray[i];
                var keys = Object.keys(dataObj);
                for(var j = 0; j < keys.length; j++)
                {
                    requiredObj[`${keys[j] + i}`] = dataObj[keys[j]];
                }
            }

            //Making form
            form += `<div class="form-group-row"> <h3> Air Destination 1 </h3> </div>`;
            form += `<div class="form-group travel-form-group"><label for="departureCityGo" class="disable_field">Origin:</label><input type="text" autocomplete="off" class="form-control flight_info_insert" id="departureCityGo" value="${requiredObj['FlightDepartureCity0']}" disabled></div>`;
            form += `<div class="form-group travel-form-group"><label for="destinationCityGo" class="disable_field">Destination:</label><input type="text" autocomplete="off" class="form-control flight_info_insert" id="destinationCityGo" value="${requiredObj['FlightArrivalCity0']}" disabled></div>`; 
            // form += `<div class="form-group travel-form-group"><label for="departureTime" class="disable_field">Departure Time:</label><input type="text" autocomplete="off" class="form-control flight_info_insert" id="departureTime" value="${requiredObj['FlightTime0']}" disabled></div>`;         
            form += `<div class="form-group travel-form-group" id="departureDate_error_belowLine"><label for="departureDate">Departure Date:</label><input type="text" autocomplete="off" class="form-control date-input flight_info_insert" data-field="date" id="departureDate" readonly><span class="required-alert" id="departureDate_error_text_incomplete_field" style="display:none"> Please fill this field. </span> </div>`;
            form +=  `<div class="cst-divider"><hr></div>`;
            form += `<div class="form-group-row"> <h3> Return Flight</h3> </div>`;
            form += `<div class="form-group travel-form-group" id="date1_error_belowLine"><label for="departureCityReturn" class="disable_field">Return Origin:</label><input type="text" autocomplete="off" class="form-control flight_info_insert" id="departureCityReturn" value="${requiredObj['FlightDepartureCity1']}" disabled></div>`;
            form += `<div class="form-group travel-form-group"><label for="destinationCityReturn" class="disable_field">Return Destination:</label><input type="text" autocomplete="off" class="form-control flight_info_insert" id="destinationCityReturn" value="${requiredObj['FlightArrivalCity1']}" disabled></div>`; 
            // form += `<div class="form-group travel-form-group"><label for="returnTime" class="disable_field">Return Time:</label><input type="text" autocomplete="off" class="form-control flight_info_insert" id="returnTime" value="${requiredObj['FlightTime1']}" disabled></div>`;
            form += `<div class="form-group travel-form-group" id="returnDate_error_belowLine"><label for="returnDate">Return Date:</label><input type="text" autocomplete="off" class="form-control date-input flight_info_insert" data-field="date" id="returnDate" readonly><span class="required-alert" id="returnDate_error_text_incomplete_field" style="display:none"> Please fill this field. </span> </div>`;
            // form += `<div class="cst-divider"><hr></div>`;
            // form += `<div class="form-group travel-form-group"><label for="seats" class="">Seats:</label><select class="selectOptions disable_field" id="seats">`;
            // var selected = "selected='selecetd'";
            // var notSelected = "";
            // for (var l = 1; l <= 9; l++)
            // {
            //     form += `<option value='${l}' ${(seats == l) ? selected : notSelected } > ${l} </option>`;
            // }
            // form += `</select></div>`;
        }

        else
        {

            var dataObjArray = result.records['0'];
            var group_id = dataObjArray[0]["GroupID"];

            if(group_id == 'null' || group_id == '')
            {
                seats = 1;
            }
            else
            {
                seats = await getSeats(group_id, req.headers.cookie);
            }

            for(var i = 0 ; i < dataObjArray.length; i++)
            {
                var dataObj = dataObjArray[i];

                var keys = Object.keys(dataObj);

                if(i === (dataObjArray.length - 1))
                {
                    form += `<div class="form-group-row"> <h3> Return Flight : </h3> </div>`;
                }
                else
                {
                    form += `<div class="form-group-row"> <h3> Air Destination ${(i + 1)} : </h3> </div>`;
                }

                for(var j = 0; j < keys.length; j++)
                {

                    if(keys[j] === "FlightDepartureCity")
                    {
                        form += `<div class="form-group-row"><div class="form-group travel-form-group"><label for="origin${i}" class="disable_field">Origin:</label><input type="text" autocomplete="off" class="form-control flight_info_insert" id="origin${i}" value="${dataObj[keys[j]]}" disabled></div>`;
                    }

                    if(keys[j] === "FlightArrivalCity")
                    {
                        form += `<div class="form-group travel-form-group"><label for="destination${i}" class="disable_field">Destination:</label><input type="text" autocomplete="off" class="form-control flight_info_insert" id="destination${i}" value="${dataObj[keys[j]]}" disabled></div></div>`;
                    }

                    // if(keys[j] === "FlightTime")
                    // {
                    //     form += `<div class="form-group-row"><div class="form-group travel-form-group"><label for="time${i}" class="disable_field">Departure Time:</label><input type="text" autocomplete="off" class="form-control flight_info_insert" id="time${i}" value="${dataObj[keys[j]]}" disabled></div>`;
                    // }

                    if(keys[j] === "FlightDepartureDate")
                    {
                        form += `<div class="form-group travel-form-group" id="date${i}_error_belowLine"><label for="date${i}">Departure Date:</label><input type="text" autocomplete="off" class="form-control date-input flight_info_insert" data-field="date" id="date${i}" readonly><span class="required-alert" id="date${i}_error_text_incomplete_field" style="display:none"> Please fill this field. </span> </div></div>`;
                    }
                }
                
                form +=  `<div class="cst-divider"><hr></div>`;
            }

            // form +=  `<div class="cst-divider"><hr></div>`;

            form += `<div class="form-group travel-form-group"><label for="seats" class="">Seats:</label><select class="selectOptions disable_field" id="seats">`;
            var selected = "selected='selecetd'";
            var notSelected = "";
            for (var l = 1; l <= 9; l++)
            {
                form += `<option value='${l}' ${(seats == l) ? selected : notSelected } > ${l} </option>`;
            }
            form += `</select></div>`;
        }

        form += `<div class="form-group travel-form-group"> <div class='msg-row select'> <button type="update" class="btn btn-default disableIt" onclick="updateFlightInfo(${flightType});disableButtons();"> OK </button> </div> </div></div></div>`;
        

        var response = { responseFor : "flightReservation" , form : form };
    }

    res.json(response)
});

router.post("/hotelReservation", async (req, res) => {

    if(!user_details[req.session.user_name])
    {
        user_details[req.session.user_name] = {};
        user_details[req.session.user_name].hotelDetailsArray = [];
    }
    else
    {
        user_details[req.session.user_name].hotelDetailsArray = [];   
    }

    // hotelDetailsArray = [];
    var TravelerID = req.body.data.TravelerID;
    var result = await getHotelData(TravelerID, req.headers.cookie);
    var recordsArray = result.records[0];
    
    //Making Form
    var form = `<div class="panel panel-default"><div class="panel-body travel-form-body">`;

    for (var i = 0; i < recordsArray.length; i++)
    {
        var currentRecObj = recordsArray[i];
        var keys = Object.keys(currentRecObj);
        
        form += `<div class="form-group-row"> <h3> ${ await watsonRoute.translate(null, "Hotel Destination", req.session.user_name) } ${(i + 1)} : </h3> </div>`;
        
        for (var j = 0; j < keys.length; j++)
        {
            if(keys[j] === "HotelName")
            {
                form += `<div class="form-group-row"><div class="form-group travel-form-group"><label for="hotelName${i}" class="disable_field"> ${ await watsonRoute.translate(null, "Hotel Name", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control hotel_info_insert" id="hotelName${i}" value="${currentRecObj[keys[j]]}" disabled></div>`;
            }

            if(keys[j] === "HotelState")
            {
                form += `<div class="form-group travel-form-group"><label for="HotelState${i}" class="disable_field"> ${ await watsonRoute.translate(null, "Hotel State", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control hotel_info_insert" id="HotelState${i}" value="${currentRecObj[keys[j]]}" disabled></div></div>`;
            }

            if(keys[j] === "HotelCheckIn")
            {
                form += `<div class="form-group-row"><div class="form-group travel-form-group" id="HotelCheckIn${i}_error_belowLine"><label for="HotelCheckIn${i}"> ${ await watsonRoute.translate(null, "Hotel Check-In Date", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control date-input hotel_info_insert" data-field="date" id="HotelCheckIn${i}" readonly><span class="required-alert" id="HotelCheckIn${i}_error_text_incomplete_field" style="display:none"> ${ await watsonRoute.translate(null, "Please fill this field", req.session.user_name) } . </span> </div>`;
            }

            if(keys[j] === "HotelCheckOut")
            {
                form += `<div class="form-group travel-form-group" id="HotelCheckOut${i}_error_belowLine"><label for="HotelCheckOut${i}"> ${ await watsonRoute.translate(null, "Hotel Check-Out Date", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control date-input hotel_info_insert" data-field="date" id="HotelCheckOut${i}" readonly><span class="required-alert" id="HotelCheckOut${i}_error_text_incomplete_field" style="display:none"> ${ await watsonRoute.translate(null, "Please fill this field", req.session.user_name) } . </span> </div></div>`;
            }
        }
        if(i != (recordsArray.length - 1))
        {
            form +=  `<div class="cst-divider"><hr></div>`;
        }
    }
    form += `<div class="form-group travel-form-group"> <div class='msg-row select'> <button type="update" class="btn btn-default disableIt" onclick="updateHotelInfo(); disableButtons();"> ${ await watsonRoute.translate(null, "OK", req.session.user_name) } </button> </div> </div></div></div>`;

    var response = { responseFor : "flightReservation" , form : form };
    res.json(response);
    
});

router.post("/rentalCarReservation", async (req, res) => {
    var TravelerID = req.body.data.TravelerID;
    var result = await getRentalCarData(TravelerID, req.headers.cookie);
    var recordsObj = result.records['0'][0];
    var keys = Object.keys(recordsObj);
    
    //Making Form
    var form = `<div class="panel panel-default"><div class="panel-body travel-form-body">`;
    for(var i = 0; i < keys.length; i++)
    {
        if(keys[i] === "PickupCity")
        {
            form += `<div class="form-group travel-form-group"><label for="PickUpCity" class="disable_field"> ${ await watsonRoute.translate(null, "Pick-up City", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control rentalCar_info_insert" id="PickUpCity" value="${recordsObj[keys[i]]}" disabled></div>`;
        }

        if(keys[i] === "DropoffCity")
        {
            form += `<div class="form-group travel-form-group"><label for="DropOffCity" class="disable_field"> ${ await watsonRoute.translate(null, "Drop-off City", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control rentalCar_info_insert" id="DropOffCity" value="${recordsObj[keys[i]]}" disabled></div>`;
        }

        if(keys[i] === "PickupDateTime")
        {
            form += `<div class="form-group travel-form-group"><label for="PickUpTime" class="disable_field"> ${ await watsonRoute.translate(null, "Pick-up Time", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control rentalCar_info_insert" id="PickUpTime" value="${changeTime(recordsObj[keys[i]])}" disabled></div>`;
        }

        if(keys[i] === "DropoffDateTime")
        {
            form += `<div class="form-group travel-form-group"><label for="DropOffTime" class="disable_field"> ${ await watsonRoute.translate(null, "Drop-off Time", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control rentalCar_info_insert" id="DropOffTime" value="${changeTime(recordsObj[keys[i]])}" disabled></div>`;
        }
    }
    form += `<div class="form-group travel-form-group" id="PickUpDate_error_belowLine"><label for="PickUpDate"> ${ await watsonRoute.translate(null, "Pick-up Date", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control date-input rentalCar_info_insert" data-field="date" id="PickUpDate" readonly><span class="required-alert" id="PickUpDate_error_text_incomplete_field" style="display:none;">  ${ await watsonRoute.translate(null, "Please fill this field", req.session.user_name) }. </span> </div>`;
    form += `<div class="form-group travel-form-group" id="DropOffDate_error_belowLine"><label for="DropOffDate"> ${ await watsonRoute.translate(null, "Drop-off Date", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control date-input rentalCar_info_insert" data-field="date" id="DropOffDate" readonly><span class="required-alert" id="DropOffDate_error_text_incomplete_field" style="display:none"> ${ await watsonRoute.translate(null, "Please fill this field", req.session.user_name) }. </span> </div>`;
    form += `<div class="form-group travel-form-group"> <div class='msg-row select'> <button type="update" class="btn btn-default disableIt" onclick="updateRentalCarInfo(); disableButtons();"> ${ await watsonRoute.translate(null, "OK", req.session.user_name) } </button> </div> </div></div></div>`;
    

    var response = { responseFor : "rentalCarReservation" , form : form };

    res.json(response);
});

router.post("/townCarReservation", async (req, res) => {
    var TravelerID = req.body.data.TravelerID;
    var result = await getTownCarData(TravelerID, req.headers.cookie);
    var recordObj = result.records['0'][0];
    
    if(recordObj.TravelTypeID === 1)
    {
        //Making Form
        var form = `<div class="panel panel-default"><div class="panel-body travel-form-body">`;
        form += `<div class="form-group travel-form-group"><label for="numberOfPassengers" class="disable_field"> ${ await watsonRoute.translate(null, "Passengers", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control townCar_info_insert" id="numberOfPassengers" value="${recordObj['Passengers']}" disabled></div>`;
        form += `<div class="form-group travel-form-group" id="pickUpDate_error_belowLine"><label for="pickUpDate"> ${ await watsonRoute.translate(null, "Pick-up Date", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control date-input townCar_info_insert" data-field="date" id="pickUpDate" readonly><span class="required-alert" id="pickUpDate_error_text_incomplete_field" style="display:none"> ${ await watsonRoute.translate(null, "Please fill this field", req.session.user_name) }. </span> </div>`;
        form += `<div class="form-group travel-form-group"><label for="pickUpTime" class="disable_field"> ${ await watsonRoute.translate(null, "Pick-up Time", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control townCar_info_insert" id="pickUpTime" value="${recordObj['TownCarPickupTime']}" disabled></div>`;
        form += `<div class="form-group travel-form-group"><label for="pickUpAddress" class="disable_field"> ${ await watsonRoute.translate(null, "Pick-up Address", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control townCar_info_insert" id="pickUpAddress" value="${recordObj['TownCarPickupAddress']}" disabled></div>`;
        form += `<div class="form-group travel-form-group"><label for="TownCarDropoffAddress" class="disable_field"> ${ await watsonRoute.translate(null, "Drop-off Address", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control townCar_info_insert" id="TownCarDropoffAddress" value="${recordObj['TownCarDropoffAddress']}" disabled></div>`;
        form += `<div class="form-group travel-form-group"> <div class='msg-row select'> <button type="update" class="btn btn-default disableIt" onclick="updateTownCarInfo(1); disableButtons();"> ${ await watsonRoute.translate(null, "OK", req.session.user_name) } </button> </div> </div></div></div>`;
    }
    else
    {
        var form = `<div class="panel panel-default"><div class="panel-body travel-form-body">`;
        form += `<div class="form-group travel-form-group"><label for="numberOfPassengers" class="disable_field"> ${ await watsonRoute.translate(null, "Passengers", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control townCar_info_insert" id="numberOfPassengers" value="${recordObj['Passengers']}" disabled></div>`;
        form += `<div class="form-group travel-form-group" id="pickUpDate_error_belowLine"><label for="pickUpDate"> ${ await watsonRoute.translate(null, "Pick-up Date", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control date-input townCar_info_insert" data-field="date" id="pickUpDate" readonly><span class="required-alert" id="pickUpDate_error_text_incomplete_field" style="display:none"> ${ await watsonRoute.translate(null, "Please fill this field", req.session.user_name) }. </span> </div>`;
        form += `<div class="form-group travel-form-group"><label for="pickUpAddress" class="disable_field"> ${ await watsonRoute.translate(null, "Pick-up Address", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control townCar_info_insert" id="pickUpAddress" value="${recordObj['TownCarPickupAddress']}" disabled></div>`;
        form += `<div class="form-group travel-form-group"><label for="pickUpTime" class="disable_field"> ${ await watsonRoute.translate(null, "Pick-up Time", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control townCar_info_insert" id="pickUpTime" value="${recordObj['TownCarPickupTime']}" disabled></div>`;
        form += `<div class="form-group travel-form-group"><label for="dropOffTime" class="disable_field"> ${ await watsonRoute.translate(null, "Drop-off Time", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control townCar_info_insert" id="dropOffTime" value="${recordObj['TownCarDropoffTime']}" disabled></div>`;
        form += `<div class="form-group travel-form-group"> <div class='msg-row select'> <button type="update" class="btn btn-default disableIt" onclick="updateTownCarInfo(5); disableButtons();"> ${ await watsonRoute.translate(null, "OK", req.session.user_name) } </button> </div> </div></div></div>`;
    }
    
    var response = { responseFor : "townCarReservation" , form : form };
    res.json(response);
});

router.post("/railReservation", async (req, res) => {
    var TravelerID = req.body.data.TravelerID;
    var railType = req.body.data.railType;
    var result = await getRailData(TravelerID, req.headers.cookie);

    
    //For one-way rail reservation
    if(railType === 1)
    {
        var recordObj =  result.records['0'][0];
        
        var form = `<div class="panel panel-default"><div class="panel-body travel-form-body">`;
        form += `<div class="form-group travel-form-group"><label for="departureCity" class="disable_field"> ${ await watsonRoute.translate(null, "Departure City", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control rail_info_insert" id="departureCity" value="${recordObj['RailDepartureCity']}" disabled></div>`;
        form += `<div class="form-group travel-form-group"><label for="arrivalCity" class="disable_field"> ${ await watsonRoute.translate(null, "Arrival City", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control rail_info_insert" id="arrivalCity" value="${recordObj['RailArrivalCity']}" disabled></div>`;
        form += `<div class="form-group travel-form-group"><label for="time" class="disable_field"> ${ await watsonRoute.translate(null, "Time", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control rail_info_insert" id="time" value="${recordObj['RailTime']}" disabled></div>`;
        form += `<div class="form-group travel-form-group" id="departureDate_error_belowLine"><label for="departureDate"> ${ await watsonRoute.translate(null, "Pick-up Date", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control date-input rail_info_insert" data-field="date" id="departureDate" readonly><span class="required-alert" id="departureDate_error_text_incomplete_field" style="display:none"> ${ await watsonRoute.translate(null, "Please fill this field", req.session.user_name) }. </span> </div>`;
        form += `<div class="form-group travel-form-group"><label for="prefferedTime" class="disable_field"> ${ await watsonRoute.translate(null, "Preferred Time", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control rail_info_insert" id="prefferedTime" value="${recordObj['RailPreferredTime']}" disabled></div>`;
        form += `<div class="form-group travel-form-group"> <div class='msg-row select'> <button type="update" class="btn btn-default disableIt" onclick="updateRailInfo(1); disableButtons();"> ${ await watsonRoute.translate(null, "OK", req.session.user_name) } </button> </div> </div></div></div>`;
    }

    //For round-trip
    if(railType === 2)
    {
        var finalObj = {};
        var dataArray = result.records[0];

        for(var i = 0 ; i < dataArray.length; i++)
        {
            var currentObj = dataArray[i];
            var keys = Object.keys(currentObj);
            for (var j = 0; j < keys.length; j++)
            {
                finalObj[`${keys[j] + i}`] = currentObj[keys[j]];
            }
        }
        
        var form = `<div class="panel panel-default"><div class="panel-body travel-form-body">`;
        form += `<div class="form-group-row"> <h3> ${ await watsonRoute.translate(null, "Rail Destination", req.session.user_name) } 1 </h3> </div>`;
        form += `<div class="form-group travel-form-group"><label for="departureCityNameGo" class="disable_field"> ${ await watsonRoute.translate(null, "Departure City", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control rail_info_insert" id="departureCityNameGo" value="${finalObj['RailDepartureCity0']}" disabled></div>`;
        form += `<div class="form-group travel-form-group"><label for="arrivalCityGo" class="disable_field"> ${ await watsonRoute.translate(null, "Arrival City", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control rail_info_insert" id="arrivalCityGo" value="${finalObj['RailArrivalCity0']}" disabled></div>`;
        form += `<div class="form-group travel-form-group"><label for="departureTimeGo" class="disable_field"> ${ await watsonRoute.translate(null, "Time", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control rail_info_insert" id="departureTimeGo" value="${finalObj['RailTime0']}" disabled></div>`;
        form += `<div class="form-group travel-form-group" id="departureDateGo_error_belowLine"><label for="departureDateGo"> ${ await watsonRoute.translate(null, "Pick-up Date", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control date-input rail_info_insert" data-field="date" id="departureDateGo" readonly><span class="required-alert" id="departureDateGo_error_text_incomplete_field" style="display:none"> ${ await watsonRoute.translate(null, "Please fill this field", req.session.user_name) }. </span> </div>`;
        form += `<div class="form-group travel-form-group"><label for="prefferedTime" class="disable_field">Preferred ${ await watsonRoute.translate(null, "Time", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control rail_info_insert" id="prefferedTime" value="${finalObj['RailPreferredTime0']}" disabled></div>`;
        form +=  `<div class="cst-divider"><hr></div>`;
        form += `<div class="form-group-row"> <h3> ${ await watsonRoute.translate(null, "Rail Return", req.session.user_name) } </h3> </div>`;
        form += `<div class="form-group travel-form-group"><label for="departureCityNameReturn" class="disable_field"> ${await watsonRoute.translate(null, "Departure City", req.session.user_name)} :</label><input type="text" autocomplete="off" class="form-control rail_info_insert" id="departureCityNameReturn" value="${finalObj['RailDepartureCity1']}" disabled></div>`;
        form += `<div class="form-group travel-form-group"><label for="arrivalCityReturn" class="disable_field"> ${await watsonRoute.translate(null, "Arrival City", req.session.user_name)} :</label><input type="text" autocomplete="off" class="form-control rail_info_insert" id="arrivalCityReturn" value="${finalObj['RailArrivalCity1']}" disabled></div>`;
        form += `<div class="form-group travel-form-group"><label for="departureTimeReturn" class="disable_field"> ${ await watsonRoute.translate(null, "Time", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control rail_info_insert" id="departureTimeReturn" value="${finalObj['RailTime1']}" disabled></div>`;
        form += `<div class="form-group travel-form-group" id="departureDateReturn_error_belowLine"><label for="departureDateReturn"> ${ await watsonRoute.translate(null, "Pick-up Date", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control date-input rail_info_insert" data-field="date" id="departureDateReturn" readonly><span class="required-alert" id="departureDateReturn_error_text_incomplete_field" style="display:none"> ${ await watsonRoute.translate(null, "Please fill this field", req.session.user_name) }. </span> </div>`;
        form += `<div class="form-group travel-form-group"><label for="departurePreferredTimeReturn" class="disable_field"> ${ await watsonRoute.translate(null, "Preferred Time", req.session.user_name) }: </label><input type="text" autocomplete="off" class="form-control rail_info_insert" id="departurePreferredTimeReturn" value="${finalObj['RailPreferredTime1']}" disabled></div>`;
        form += `<div class="form-group travel-form-group"> <div class='msg-row select'> <button type="update" class="btn btn-default disableIt" onclick="updateRailInfo(2); disableButtons();"> ${ await watsonRoute.translate(null, "OK", req.session.user_name) } </button> </div> </div></div></div>`;
    }

    //For multi-city
    if(railType === 3)
    {
        var dataArray = result.records[0];

        var form = `<div class="panel panel-default"><div class="panel-body travel-form-body">`;
        for(var i=0; i < dataArray.length; i++)
        {
            var currentObj = dataArray[i];
            var keys = Object.keys(currentObj);

            if(i === (dataArray.length - 1))
            {
                form += `<div class="form-group-row"> <h3> ${ await watsonRoute.translate(null, "Rail Return", req.session.user_name) } : </h3> </div>`;
            }
            else
            {
                form += `<div class="form-group-row"> <h3> ${ await watsonRoute.translate(null, "Rail Destination", req.session.user_name) } ${(i + 1)} : </h3> </div>`;
            }

            for (var j = 0; j < keys.length; j++)
            {
                if(keys[j] === "RailDepartureCity")
                {
                    form += `<div class="form-group travel-form-group"><label for="RailDepartureCity${i}" class="disable_field"> ${ await watsonRoute.translate(null, "Departure City", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control rail_info_insert" id="RailDepartureCity${i}" value="${currentObj[keys[j]]}" disabled></div>`;
                }

                if(keys[j] === "RailArrivalCity")
                {
                    form += `<div class="form-group travel-form-group"><label for="RailArrivalCity${i}" class="disable_field"> ${ await watsonRoute.translate(null, "Arrival City", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control rail_info_insert" id="RailArrivalCity${i}" value="${currentObj[keys[j]]}" disabled></div>`;
                }
                
                if(keys[j] === "RailTime")
                {
                    form += `<div class="form-group travel-form-group"><label for="RailTime${i}" class="disable_field"> ${ await watsonRoute.translate(null, "Time", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control rail_info_insert" id="RailTime${i}" value="${currentObj[keys[j]]}" disabled></div>`;
                }

                if(keys[j] === "RailDepartureDate")
                {
                    form += `<div class="form-group travel-form-group" id="RailDepartureDate${i}_error_belowLine"><label for="RailDepartureDate${i}"> ${ await watsonRoute.translate(null, "Departure Date", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control date-input rail_info_insert" data-field="date" id="RailDepartureDate${i}" readonly><span class="required-alert" id="RailDepartureDate${i}_error_text_incomplete_field" style="display:none"> ${await watsonRoute.translate(null, "Please fill this field", req.session.uer_name)}. </span> </div>`;
                }

                if(keys[j] === "RailPreferredTime")
                {
                    form += `<div class="form-group travel-form-group"><label for="RailPreferredTime${i}" class="disable_field"> ${ await watsonRoute.translate(null, "Preferred Time", req.session.user_name) } :</label><input type="text" autocomplete="off" class="form-control rail_info_insert" id="RailPreferredTime${i}" value="${currentObj[keys[j]]}" disabled></div>`;
                }
            }
            form +=  `<div class="cst-divider"><hr></div>`;
        }
        form += `<div class="form-group travel-form-group"><button type="update" class="btn btn-default disableIt" onclick="updateRailInfo(3); disableButtons();"> ${ await watsonRoute.translate(null, "OK", req.session.user_name) } </button></div></div></div>`;
    }
    

    var response = { responseFor : "railReservation" , form : form };
    res.json(response);
});

router.post("/autoPreviousReservation", async (req, res) => {

    var new_date = req.body.newDate;
    // var travelerID = req.body.travelerID; {have commented this on purpose}
    var travelerID = 123873;
    //Getting trip purpose
    var tripPurpose = await getTripPurpose(travelerID, req.headers.cookie);
    // var previousTripPurpose = tripPurpose.record[0].TripPurposeID;

    //Getting flight data.
    var flightData = await getFlightData(travelerID, req.headers.cookie);
    var flightPreviousRecord = flightData.records[0];

    //For reference
    var base_date = flightPreviousRecord[0].FlightDepartureDate;

    if(flightPreviousRecord.length != 0)
    {
        //Accessing flight type (Oneway, roundtrip, multicity)
        var flightType = flightPreviousRecord[0].TravelTypeID;

        if(flightType === 1)
        {
            var dataObj = {};
            dataObj["origin"] = flightPreviousRecord[0].FlightDepartureCity;
            dataObj["destination"] = flightPreviousRecord[0].FlightArrivalCity;
            dataObj["time"] = flightPreviousRecord[0].FlightTime;
            dataObj["date"] = new_date;
            dataObj["flightType"] = 'oneway';
        }
        else if(flightType === 2)
        {
            var dataObj = {};

            dataObj["departureCityGo"] = flightPreviousRecord[0].FlightDepartureCity;
            dataObj["destinationCityGo"] = flightPreviousRecord[0].FlightArrivalCity;
            dataObj["departureTime"] = flightPreviousRecord[0].FlightTime;
            dataObj["departureDate"] = new_date;
            dataObj["departureCityReturn"] = flightPreviousRecord[1].FlightDepartureCity;
            dataObj["destinationCityReturn"] = flightPreviousRecord[1].FlightArrivalCity;
            dataObj["returnDate"] = getNewDate(base_date, flightPreviousRecord[1].FlightDepartureDate, new_date);
            dataObj["returnTime"] = flightPreviousRecord[1].FlightTime;
            dataObj["flightType"] = "roundtrip";
        }
        else if(flightType === 3)
        {
            var dataObj = {};
            user_details[req.session.user_name].flightDetailsArray = [];

            for(var i = 0; i < flightPreviousRecord.length; i++)
            {
                var tmp_obj = {};
                var current_obj = flightPreviousRecord[i];

                if(i == 0)
                {
                    tmp_obj["origin"] = current_obj["FlightDepartureCity"];;
                    tmp_obj["destination"] = current_obj["FlightArrivalCity"];
                    tmp_obj["time"] = current_obj["FlightTime"];
                    tmp_obj["date"] = new_date;
                }
                else
                {
                    tmp_obj["origin"] = current_obj["FlightDepartureCity"];
                    tmp_obj["destination"] = current_obj["FlightArrivalCity"];
                    tmp_obj["time"] = current_obj["FlightTime"];
                    tmp_obj["date"] = getNewDate(base_date, current_obj["FlightDepartureDate"], new_date);
                }

                user_details[req.session.user_name].flightDetailsArray.push(tmp_obj);
            }

            dataObj["flightDetailsArray"] = user_details[req.session.user_name].flightDetailsArray;
            dataObj["flightType"] = "multicity";
        }

        var saving_flight_new_record = await storeFlightData(dataObj, req.headers.cookie);
        var storing_status = saving_flight_new_record.status;
    
    }

    //Getting traveler trip purpose
    var travelerInfo = await getTravelerInfo(travelerID, null, req.headers.cookie);
    var tripPurpose =  travelerInfo.record[0]['TripPurposeID'];
    var status =  await setTripPurpose(tripPurpose, req.headers.cookie);

    //Getting hotel reservation details.
    var hotelData = await getHotelData(travelerID, req.headers.cookie);
    var hotelPreviousRecord = hotelData.records[0];
    if(hotelPreviousRecord.length != 0)
    {
        var num_of_recs = hotelPreviousRecord.length;
    
        if(num_of_recs === 1)
        {
            var dataObj = {};
            dataObj["cityArea"] = hotelPreviousRecord[0].HotelState;
            dataObj["hotelName"] = hotelPreviousRecord[0].HotelName;
            dataObj["checkinDate"] = getNewDate(base_date, hotelPreviousRecord[0].HotelCheckIn, new_date);
            dataObj["checkOutDate"] = getNewDate(base_date, hotelPreviousRecord[0].HotelCheckOut, new_date);
            
            var saving_hotel_new_record = await storeHotelData(dataObj, req.headers.cookie);
        }
        else
        {
            var dataObj = {};
            user_details[req.session.user_name].hotelDetailsArray = [];

            for(var i = 0; i < hotelPreviousRecord.length; i++)
            {
                var tmpObj = {};
                var current_obj = hotelPreviousRecord[i];

                tmpObj["cityArea"] = current_obj.HotelState;
                tmpObj["hotelName"] = current_obj.HotelName;
                tmpObj["checkinDate"] = getNewDate(base_date, current_obj.HotelCheckIn, new_date);
                tmpObj["checkOutDate"] = getNewDate(base_date, current_obj.HotelCheckOut, new_date);

                user_details[req.session.user_name].hotelDetailsArray.push(tmpObj);
            }

            dataObj["dataObj"] = user_details[req.session.user_name].hotelDetailsArray;

            var saving_hotel_array_new_record = await storeHotelArrayData(dataObj, req.headers.cookie);
        }
    }
    
    //Getting rental car data.
    var rentalCarData = await getRentalCarData(travelerID, req.headers.cookie);
    var rentalCarPreviousRecord = rentalCarData.records[0];

    if(rentalCarPreviousRecord.length != 0)
    {
        var pickupDateTime = rentalCarPreviousRecord[0].PickupDateTime;
        var DropoffDateTime = rentalCarPreviousRecord[0].DropoffDateTime;

        var dataObj = {};
        dataObj["PickUpCity"] = rentalCarPreviousRecord[0].PickupCity;
        dataObj["DropOffCity"] = rentalCarPreviousRecord[0].DropoffCity;
        dataObj["PickUpTime"] = pickupDateTime.substring(11, 19);
        dataObj["DropOffTime"] = DropoffDateTime.substring(11, 19);
        dataObj["PickUpDate"] = getNewDate(base_date, pickupDateTime.substring(0, 10), new_date);
        dataObj["DropOffDate"] = getNewDate(base_date, DropoffDateTime.substring(0, 10), new_date);

        var saving_rental_car_new_record = await storeRentalCarData(dataObj, req.headers.cookie);
    }

    //Getting town car data.
    var townCarData = await getTownCarData(travelerID, req.headers.cookie);
    var townCarPreviousRecord = townCarData.records[0];

    if(townCarPreviousRecord.length != 0)
    {
        var town_car_type = townCarPreviousRecord[0].TravelTypeID;

        if(town_car_type === 1)
        {
            var dataObj = {};

            dataObj["numberOfPassengers"] = townCarPreviousRecord[0].Passengers;
            dataObj["pickUpDate"] = getNewDate(base_date, townCarPreviousRecord[0].TownCarDate, new_date);
            dataObj["pickUpTime"] = townCarPreviousRecord[0].TownCarPickupTime;
            dataObj["pickUpAddress"] = townCarPreviousRecord[0].TownCarPickupAddress;
            dataObj["dropOffAddress"] = townCarPreviousRecord[0].TownCarDropoffAddress;
            dataObj["townCarMode"] = "oneway";

            var saving_town_car_new_record = await storeTownCarData(dataObj, req.headers.cookie);
        }
        else
        {
            var dataObj = {};
            dataObj["townCarMode"] = "hourly";
            dataObj["numberOfPassengers"] = townCarPreviousRecord[0].Passengers;
            dataObj["pickUpDate"] = getNewDate(base_date, townCarPreviousRecord[0].TownCarDate, new_date);
            dataObj["pickUpAddress"] = townCarPreviousRecord[0].TownCarPickupAddress;
            dataObj["pickUpTime"] = townCarPreviousRecord[0].TownCarPickupTime;
            dataObj["dropOffTime"] = townCarPreviousRecord[0].TownCarDropoffTime;

            var saving_town_car_new_record = await storeTownCarData(dataObj, req.headers.cookie);
        }
    }

    //Getting rail data.
    var railData = await getRailData(travelerID, req.headers.cookie);
    ralPreviousRecord = railData.records[0];

    if(ralPreviousRecord.length != 0)
    {
        var ratil_type = ralPreviousRecord[0].TravelTypeID;

        if(ratil_type === 1)
        {
            var dataObj = {};

            dataObj["departureCity"] = ralPreviousRecord[0].RailDepartureCity;
            dataObj["departureDate"] = getNewDate(base_date, ralPreviousRecord[0].RailDepartureDate, new_date);
            dataObj["prefferedTime"] = ralPreviousRecord[0].RailPreferredTime;
            dataObj["time"] = ralPreviousRecord[0].RailTime;
            dataObj["arrivalCity"] = ralPreviousRecord[0].RailArrivalCity;
            dataObj["railType"] = "oneway";

            var saving_rail_new_record = await storeRailData(dataObj, req.headers.cookie);
        }
        else if(ratil_type === 2)
        {
            var dataObj = {};
            dataObj["railType"] = "roundtrip";
            dataObj["departureCityNameGo"] = ralPreviousRecord[0].RailDepartureCity;
            dataObj["arrivalCityGo"] = ralPreviousRecord[0].RailArrivalCity;
            dataObj["departureTimeGo"] = ralPreviousRecord[0].RailTime;
            dataObj["departureDateGo"] = getNewDate(base_date, ralPreviousRecord[0].RailDepartureDate, new_date);
            dataObj["prefferedTime"] = ralPreviousRecord[0].RailPreferredTime;
            dataObj["departureCityNameReturn"] = ralPreviousRecord[1].RailDepartureCity;
            dataObj["arrivalCityReturn"] = ralPreviousRecord[1].RailArrivalCity;
            dataObj["departureTimeReturn"] = ralPreviousRecord[1].RailTime;
            dataObj["departureDateReturn"] = getNewDate(base_date, ralPreviousRecord[1].RailDepartureDate, new_date);
            dataObj["departurePreferredTimeReturn"] = ralPreviousRecord[1].RailPreferredTime;

            var saving_rail_new_record = await storeRailData(dataObj, req.headers.cookie);
        }
        else if(ratil_type === 3)
        {
            var dataObj = [];

            for(var i = 0; i < ralPreviousRecord.length; i++)
            {
                var tmp_obj = {};
                var current_obj = ralPreviousRecord[i];
                
                tmp_obj["RailDepartureCity"] = current_obj.RailDepartureCity;
                tmp_obj["RailDepartureDate"] = getNewDate(base_date, current_obj.RailDepartureDate, new_date);
                tmp_obj["RailArrivalCity"] = current_obj.RailArrivalCity;
                tmp_obj["RailTime"] = current_obj.RailTime;
                tmp_obj["RailPreferredTime"] = current_obj.RailPreferredTime;
                tmp_obj["railType"] = "multicity";
                
                dataObj.push(tmp_obj);
            }

            var saving_rail_new_record = await storeRailArrayData(dataObj, req.headers.cookie);
        }
    }

    // Getting special request
    var special_request = await getSpecialRequest(travelerID, req.headers.cookie);
    var previousSepcialRequest = special_request.record[0].SpecialRequests;
    var saving_special_request_record = await storeSpecialRequest(previousSepcialRequest, req.headers.cookie);

    var response = { result : 1 };
    res.json(response);
});

router.post("/repeatPreviousReservation2", async (req, res) => {
    var reservation_type = req.body.data.reservationType;
    var travelerID = req.body.data.travelerID;
    var base_date = null;

    if(reservation_type === "flight")
    {
        var new_date = req.body.data.newDate;

        var flightData = await getFlightData(travelerID, req.headers.cookie);
        var flightPreviousRecord = flightData.records[0];

        base_date = flightPreviousRecord[0].FlightDepartureDate;

        if(flightPreviousRecord.length != 0)
        {
            //Accessing flight type (Oneway, roundtrip, multicity)
            var flightType = flightPreviousRecord[0].TravelTypeID;

            if(flightType === 1)
            {
                var dataObj = {};
                dataObj["origin"] = flightPreviousRecord[0].FlightDepartureCity;
                dataObj["destination"] = flightPreviousRecord[0].FlightArrivalCity;
                dataObj["time"] = flightPreviousRecord[0].FlightTime;
                dataObj["date"] = new_date;
                dataObj["flightType"] = 'oneway';
            }
            else if(flightType === 2)
            {
                var dataObj = {};

                dataObj["departureCityGo"] = flightPreviousRecord[0].FlightDepartureCity;
                dataObj["destinationCityGo"] = flightPreviousRecord[0].FlightArrivalCity;
                dataObj["departureTime"] = flightPreviousRecord[0].FlightTime;
                dataObj["departureDate"] = new_date;
                dataObj["departureCityReturn"] = flightPreviousRecord[1].FlightDepartureCity;
                dataObj["destinationCityReturn"] = flightPreviousRecord[1].FlightArrivalCity;
                dataObj["returnDate"] = getNewDate(base_date, flightPreviousRecord[1].FlightDepartureDate, new_date);
                dataObj["returnTime"] = flightPreviousRecord[1].FlightTime;
                dataObj["flightType"] = "roundtrip";
            }
            else if(flightType === 3)
            {
                
                var dataObj = {};
                user_details[req.session.user_name].flightDetailsArray = [];

                for(var i = 0; i < flightPreviousRecord.length; i++)
                {
                    var tmp_obj = {};
                    var current_obj = flightPreviousRecord[i];

                    if(i == 0)
                    {
                        tmp_obj["origin"] = current_obj["FlightDepartureCity"];
                        tmp_obj["destination"] = current_obj["FlightArrivalCity"];
                        tmp_obj["time"] = current_obj["FlightTime"];
                        tmp_obj["date"] = new_date;
                    }
                    else
                    {
                        tmp_obj["origin"] = current_obj["FlightDepartureCity"];
                        tmp_obj["destination"] = current_obj["FlightArrivalCity"];
                        tmp_obj["time"] = current_obj["FlightTime"];
                        tmp_obj["date"] = getNewDate(base_date, current_obj["FlightDepartureDate"], new_date);
                    }

                    user_details[req.session.user_name].flightDetailsArray.push(tmp_obj);
                }

                dataObj["flightDetailsArray"] = user_details[req.session.user_name].flightDetailsArray;
                dataObj["flightType"] = "multicity";
            }

            var saving_flight_new_record = await storeFlightData(dataObj, req.headers.cookie);
            var storing_status = saving_flight_new_record.status;
        }
    }

    if(reservation_type === "hotel")
    {
        var new_date = req.body.data.newDate;

        if(base_date == null)
        {
            base_date = await getBaseDate(req.headers.cookie);
        }

        var hotelData = await getHotelData(travelerID, req.headers.cookie);
        var hotelPreviousRecord = hotelData.records[0];
        if(hotelPreviousRecord.length != 0)
        {
            var num_of_recs = hotelPreviousRecord.length;
        
            if(num_of_recs === 1)
            {
                var dataObj = {};
                dataObj["cityArea"] = hotelPreviousRecord[0].HotelState;
                dataObj["hotelName"] = hotelPreviousRecord[0].HotelName;
                dataObj["checkinDate"] = getNewDate(base_date, hotelPreviousRecord[0].HotelCheckIn, new_date);
                dataObj["checkOutDate"] = getNewDate(base_date, hotelPreviousRecord[0].HotelCheckOut, new_date);
                var saving_hotel_new_record = await storeHotelData(dataObj, req.headers.cookie);
            }
            else
            {
                var dataObj = {};
                user_details[req.session.user_name].hotelDetailsArrayy = [];

                for(var i = 0; i < hotelPreviousRecord.length; i++)
                {
                    var tmpObj = {};
                    var current_obj = hotelPreviousRecord[i];

                    tmpObj["cityArea"] = current_obj.HotelState;
                    tmpObj["hotelName"] = current_obj.HotelName;
                    tmpObj["checkinDate"] = getNewDate(base_date, current_obj.HotelCheckIn, new_date);
                    tmpObj["checkOutDate"] = getNewDate(base_date, current_obj.HotelCheckOut, new_date);

                    user_details[req.session.user_name].hotelDetailsArray.push(tmpObj);
                }

                dataObj["dataObj"] = user_details[req.session.user_name].hotelDetailsArray;
                var saving_hotel_array_new_record = await storeHotelArrayData(dataObj, req.headers.cookie);
            }
        }
    }

    if(reservation_type === "rental_car")
    {

        if(base_date == null)
        {
            base_date = await getBaseDate(req.headers.cookie);
        }

        var new_date = req.body.data.newDate;
        //Getting rental car data.
        var rentalCarData = await getRentalCarData(travelerID, req.headers.cookie);
        var rentalCarPreviousRecord = rentalCarData.records[0];

        if(rentalCarPreviousRecord.length != 0)
        {
            var pickupDateTime = rentalCarPreviousRecord[0].PickupDateTime;
            var DropoffDateTime = rentalCarPreviousRecord[0].DropoffDateTime;

            var dataObj = {};
            dataObj["PickUpCity"] = rentalCarPreviousRecord[0].PickupCity;
            dataObj["DropOffCity"] = rentalCarPreviousRecord[0].DropoffCity;
            dataObj["PickUpTime"] = pickupDateTime.substring(11, 19);
            dataObj["DropOffTime"] = DropoffDateTime.substring(11, 19);
            dataObj["PickUpDate"] = getNewDate(base_date, pickupDateTime.substring(0, 10), new_date);
            dataObj["DropOffDate"] = getNewDate(base_date, DropoffDateTime.substring(0, 10), new_date);

            var saving_rental_car_new_record = await storeRentalCarData(dataObj, req.headers.cookie);
        }
    }

    if(reservation_type === "town_car")
    {
        if(base_date == null)
        {
            base_date = await getBaseDate(req.headers.cookie);
        }

        var new_date = req.body.data.newDate;
        var townCarData = await getTownCarData(travelerID, req.headers.cookie);
        var townCarPreviousRecord = townCarData.records[0];

        if(townCarPreviousRecord.length != 0)
        {
            var town_car_type = townCarPreviousRecord[0].TravelTypeID;

            if(town_car_type === 1)
            {
                var dataObj = {};

                dataObj["numberOfPassengers"] = townCarPreviousRecord[0].Passengers;
                dataObj["pickUpDate"] = getNewDate(base_date, townCarPreviousRecord[0].TownCarDate, new_date);
                dataObj["pickUpTime"] = townCarPreviousRecord[0].TownCarPickupTime;
                dataObj["pickUpAddress"] = townCarPreviousRecord[0].TownCarPickupAddress;
                dataObj["dropOffAddress"] = townCarPreviousRecord[0].TownCarDropoffAddress;
                dataObj["townCarMode"] = "oneway";

                var saving_town_car_new_record = await storeTownCarData(dataObj, req.headers.cookie);
            }
            else
            {
                var dataObj = {};
                dataObj["townCarMode"] = "hourly";
                dataObj["numberOfPassengers"] = townCarPreviousRecord[0].Passengers;
                dataObj["pickUpDate"] = getNewDate(base_date, townCarPreviousRecord[0].TownCarDate, new_date);
                dataObj["pickUpAddress"] = townCarPreviousRecord[0].TownCarPickupAddress;
                dataObj["pickUpTime"] = townCarPreviousRecord[0].TownCarPickupTime;
                dataObj["dropOffTime"] = townCarPreviousRecord[0].TownCarDropoffTime;

                var saving_town_car_new_record = await storeTownCarData(dataObj, req.headers.cookie);
            }
        }
    }

    if(reservation_type === "rail")
    {
        if(base_date == null)
        {
            base_date = await getBaseDate(req.headers.cookie);
        }
        
        var new_date = req.body.data.newDate;
        var railData = await getRailData(travelerID, req.headers.cookie);
        ralPreviousRecord = railData.records[0];

        if(ralPreviousRecord.length != 0)
        {
            var ratil_type = ralPreviousRecord[0].TravelTypeID;

            if(ratil_type === 1)
            {
                var dataObj = {};

                dataObj["departureCity"] = ralPreviousRecord[0].RailDepartureCity;
                dataObj["departureDate"] = getNewDate(base_date, ralPreviousRecord[0].RailDepartureDate, new_date);
                dataObj["prefferedTime"] = ralPreviousRecord[0].RailPreferredTime;
                dataObj["time"] = ralPreviousRecord[0].RailTime;
                dataObj["arrivalCity"] = ralPreviousRecord[0].RailArrivalCity;
                dataObj["railType"] = "oneway";

                var saving_rail_new_record = await storeRailData(dataObj, req.headers.cookie);
            }
            else if(ratil_type === 2)
            {
                var dataObj = {};
                dataObj["railType"] = "roundtrip";
                dataObj["departureCityNameGo"] = ralPreviousRecord[0].RailDepartureCity;
                dataObj["arrivalCityGo"] = ralPreviousRecord[0].RailArrivalCity;
                dataObj["departureTimeGo"] = ralPreviousRecord[0].RailTime;
                dataObj["departureDateGo"] = getNewDate(base_date, ralPreviousRecord[0].RailDepartureDate, new_date);
                dataObj["prefferedTime"] = ralPreviousRecord[0].RailPreferredTime;
                dataObj["departureCityNameReturn"] = ralPreviousRecord[1].RailDepartureCity;
                dataObj["arrivalCityReturn"] = ralPreviousRecord[1].RailArrivalCity;
                dataObj["departureTimeReturn"] = ralPreviousRecord[1].RailTime;
                dataObj["departureDateReturn"] = getNewDate(base_date, ralPreviousRecord[1].RailDepartureDate, new_date);
                dataObj["departurePreferredTimeReturn"] = ralPreviousRecord[1].RailPreferredTime;

                var saving_rail_new_record = await storeRailData(dataObj, req.headers.cookie);
            }
            else if(ratil_type === 3)
            {
                var dataObj = [];

                for(var i = 0; i < ralPreviousRecord.length; i++)
                {
                    var tmp_obj = {};
                    var current_obj = ralPreviousRecord[i];
                    
                    tmp_obj["RailDepartureCity"] = current_obj.RailDepartureCity;
                    tmp_obj["RailDepartureDate"] = getNewDate(base_date, current_obj.RailDepartureDate, new_date);
                    tmp_obj["RailArrivalCity"] = current_obj.RailArrivalCity;
                    tmp_obj["RailTime"] = current_obj.RailTime;
                    tmp_obj["RailPreferredTime"] = current_obj.RailPreferredTime;
                    tmp_obj["railType"] = "multicity";
                    
                    dataObj.push(tmp_obj);
                }

                var saving_rail_new_record = await storeRailArrayData(dataObj, req.headers.cookie);
            }
        }
    }

    var response = {status : 1};
    res.json(response);
});

router.post("/getPreviousReservations", async (req, res) => {

    if(!user_details[req.session.user_name])
    {
        user_details[req.session.user_name] = {};
        user_details[req.session.user_name].previous_reservation_array =   [];
        user_details[req.session.user_name].most_frequent_city = null;
        user_details[req.session.user_name].most_frequent_city_IATA_code = null;
    }
    else
    {
        user_details[req.session.user_name].previous_reservation_array      =   [];
        user_details[req.session.user_name].most_frequent_city = null;
        user_details[req.session.user_name].most_frequent_city_IATA_code = null;
    }

    try
    {
        var dep_date                    =   req.body.dep_date;
        var return_date                 =   req.body.return_date;
        var city_code                   =   req?.body?.destination_city;
        var userID                      =   req.body.userID;
        var employee_id                 =   "";

        //( city_code ) ? destination_city = await getCityName(city_code, req.headers.cookie) : destination_city = null;

        if( city_code && userID )
        {
            var info_array  =   CurrentTravelrInfo.current_traveler_info.avail_info;
        
            for(var i = 0; i < info_array.length; i++)
            {
                var mini_object = info_array[i];

                if(mini_object.id == "EmployeeNumber") 
                {
                    employee_id = mini_object.value;
                    break;
                }
            }
        
            var previous_reservation    =   await getPreviousReservationDetails(city_code, userID, employee_id, dep_date, return_date, req.headers.cookie);
            var reservation_details     =   previous_reservation?.records;

            var reservation_array_keys = [
                'traveler_most_frequent',
                'traveler_most_recent',
                'company_most_frequent',
                'company_most_recent'
            ]
    
            for(var i = 0; i < reservation_array_keys.length; i++)
            {
                if(reservation_details[reservation_array_keys[i]] != undefined || reservation_details[reservation_array_keys[i]] !="" || reservation_details[reservation_array_keys[i]] !=null )
                {
                    user_details[req.session.user_name].previous_reservation_array.push({ id : i, iternery : reservation_details[reservation_array_keys[i]]})
                }
                else
                {
                    user_details[req.session.user_name].previous_reservation_array.push({ id : i, iternery : {}})
                }
            }
    
            if(previous_reservation.status == 200)
            {
                var html = `
                <ul class="nav nav-tabs"> 
                    <li class="active">
                        <a data-toggle="tab" href="#traveler_data">
                            ${CurrentTravelrInfo.current_traveler_info.avail_info[0].value+' '+CurrentTravelrInfo.current_traveler_info.avail_info[1].value}
                        </a>
                    </li> 
                    <li>
                        <a data-toggle="tab" href="#company_data"> 
                            ACME 
                        </a>
                    </li> 
                </ul>
                <div class="tab-content">
                    <div class="inner-tab-content"> 
                        <div id="traveler_data" class="tab-pane fade in active"> 
                            <ul class="nav nav-pills"> 
                                <li class="active">
                                    <a data-toggle="pill" class="btn dark-blue-button active" href="#traveler_most_frequent">
                                        ${await watsonRoute.translate(null, "Most Frequent", req.session.user_name) }
                                    </a>
                                </li> 
                                <li>
                                    <a class="btn light-grey-button" data-toggle="pill" href="#traveler_most_recent">
                                        ${ await watsonRoute.translate(null, 'Most Recent', req.session.user_name)}
                                    </a>
                                </li> 
                            </ul>
                            <div class="tab-content">
                                <div id="traveler_most_frequent" class="tab-pane fade in active">`;

                //Traveler Most Frequent
                if(previous_reservation.records.traveler_most_frequent)
                {
                    var traveler_most_frequent  =   previous_reservation.records.traveler_most_frequent;
                    var flight_details          =   traveler_most_frequent?.flight_details;

                    if( flight_details )
                    {
                        user_details[req.session.user_name].most_frequent_city              =   flight_details[0]?.FlightDepartureCity;
                        user_details[req.session.user_name].most_frequent_city_IATA_code    =   flight_details[0]?.origin;
                    }
                    else
                    {
                        user_details[req.session.user_name].most_frequent_city = null;
                    }

                    var fliObj1 = new PreviousRes();
                    html+= await fliObj1.flights(flight_details,"flight_details",0, req.session.user_name);
                    
                    if(traveler_most_frequent.hotelDetails != undefined)
                    {
                        var hotel_details = traveler_most_frequent.hotelDetails[0];
                    }
                    else
                    {
                        var hotel_details = [];
                    }

                    if( hotel_details && hotel_details.length != 0 )
                    {
                        var date1   =   moment(hotel_details[0].HotelCheckIn);
                        var date2   =   moment(hotel_details[0].HotelCheckOut);
                        var diff    =   date2.diff(date1,'days');

                        html += `
                        <div class="chat-panel" id="hotelDetails0"> 
                            <div class="panel-alert">
                                Please click on highlighted below 
                                <a href="#" onclick="stopEditing('hotelDetails0')">
                                    <i class="fa fa-check"></i>
                                </a>
                            </div>
                            <div class="chat-panel-header">
                                <div class="chat-aero-info">
                                    <div class="inner-chat-aero-info hotel-box">
                                        <span class="left-date" onclick="message('dep_return');">
                                            <strong class="flight-sm-date" id="hotelDetails0_checkin">
                                                ${hotel_details[0].HotelCheckIn != null && hotel_details[0].HotelCheckIn != undefined?moment.utc(hotel_details[0].HotelCheckIn).format('llll').split(' ')[0]+' '+moment.utc(hotel_details[0].HotelCheckIn).format('ll'): 'N/A'}
                                            </strong>
                                        </span>
                                        <div class="center-location">
                                            <span><img src="/images/hotel-icon.png" bottom:></span>
                                        </div>
                                        <span class="left-date right" onclick="message('dep_return');">
                                            <strong class="flight-sm-date" id="hotelDetails0_checkout">
                                                ${hotel_details[0].HotelCheckOut != null && hotel_details[0].HotelCheckOut != undefined? moment.utc(hotel_details[0].HotelCheckOut).format('llll').split(' ')[0]+' '+moment.utc(hotel_details[0].HotelCheckOut).format('ll'): 'N/A'}
                                            </strong>
                                        </span>
                                    </div>
                                    <div class="right-edit-dropdown">
                                        <a href="#" class="edit_drop" onclick="editPreviousReservation('hotelDetails',0);"><i class="fa fa-pencil"></i></a>
                                        <a href="#" class="edit_drop" onclick="deleditPreviousReservation('hotelDetails0','Hotel');" data-toggle="modal" data-target="#myModal"><i class="fa fa-trash"></i></a>
                                    </div>
                                </div>
                                <h3 id="hotelDetails0_name" class="ailine-name" onclick="message('hotel');">
                                    ${hotel_details[0].HotelName}
                                </h3> 
                                <p id="hotelDetails0_state" class="hotel-state">
                                    ${hotel_details[0].HotelState}
                                </p>
                            </div> 
                            <div class="chat-panel-body"> 
                                <input type="hidden" id="hotelDetails0_diff" value="${diff}"/>
                            </div> 
                            <p class="price-tag" id="hotelDetails0_totalprice" style="display:none;">
                                <strong >Total Price: <span ></span></strong>
                            </p>
                        </div>`;
                    }
                    
                    if(traveler_most_frequent.rentalCarDetails!== undefined && traveler_most_frequent.rentalCarDetails!== "" && traveler_most_frequent.rentalCarDetails.length !==0)
                    {
                        var rental_car = traveler_most_frequent.rentalCarDetails[0];
                        
                        if(rental_car.length != 0)
                        {
                            var date1 = moment(rental_car[0].PickupDateTime);
                            var date2 = moment(rental_car[0].DropoffDateTime);
                            var diff = date2.diff(date1,'days');
                            html += `
                            <div class="chat-panel" id="rentalCarDetails0">
                                <div class="panel-alert">
                                    Please click on highlighted below 
                                    <a href="#" onclick="stopEditing('rentalCarDetails0')">
                                        <i class="fa fa-check"></i>
                                    </a>
                                </div> 
                                <div class="chat-panel-header"> 
                                    <h3>
                                        ${ await watsonRoute.translate(null, "Rental CAR DETAILS", req.session.user_name) }
                                    </h3> 
                                    <div class="chat-aero-info">
                                        <div class="inner-chat-aero-info hotel-box">
                                            <span class="left-date" onclick="message('dep_return')">
                                                <strong class="flight-sm-date" id="rentalCarDetails0_pickup">
                                                    ${moment.utc(rental_car[0].PickupDateTime).format('llll').split(' ')[0]+' '+moment.utc(rental_car[0].PickupDateTime).format('ll')}
                                                </strong>
                                            </span>
                                            <div class="center-location">
                                                <span>
                                                    <img src="/images/car-icon.png" bottom:>
                                                </span>
                                            </div>
                                            <span class="left-date right" onclick="message('dep_return')"> 
                                                <strong class="flight-sm-date" id="rentalCarDetails0_dropoff">
                                                    ${moment.utc(rental_car[0].DropoffDateTime).format('llll').split(' ')[0]+' '+moment.utc(rental_car[0].DropoffDateTime).format('ll')}
                                                </strong>
                                            </span>
                                            <div class="right-edit-dropdown">
                                                <a href="#" class="edit_drop" onclick="editPreviousReservation('rentalCarDetails',0);"><i class="fa fa-pencil"></i></a>
                                                <a href="#" class="edit_drop" onclick="deleditPreviousReservation('rentalCarDetails0','Car');" data-toggle="modal" data-target="#myModal"><i class="fa fa-trash"></i></a>
                                            </div>
                                        </div>
                                    </div>
                                    <h3 id="rentalCarDetails0_vendor" class="ailine-name" onclick="message('rentalCar');">${rental_car[0].Company}</h3> 
                                </div> 
                                <div class="chat-panel-body">
                                    <input type="hidden" id="rentalCarDetails0_diff" value="${diff}"/>
                                    <p>
                                        <span class="city">${rental_car[0].PickupCityCode}</span> 
                                        ${rental_car[0].PickupCity} 
                                    </p> 
                                    <p>
                                        <span class="city">${rental_car[0].DropoffCityCode}</span> 
                                        ${rental_car[0].DropoffCity} 
                                    </p>
                                </div> 
                                <p class="price-tag" id="rentalCarDetails0_totalprice" style="display:none;">
                                    <strong>Total Price: <span></span></strong>
                                </p>
                            </div>`;
                        }
                    }
                    html += `<p> <button id="ti${flight_details[0].reckey}" type="button" value="t0" class="btn dark-blue-button disableIt booknowcls" onclick="message('${flight_details[0].reckey}0'); disableButtons();"> ${ await watsonRoute.translate( null, "Book Now", req.session.user_name ) } </button> </p>`;
                }
                else
                {
                    html += `<span class="no-found"> No Reservation Found </span>`;
                }
                html += `</div><div id="traveler_most_recent" class="tab-pane fade in">`;

                //Traveler Most Recent
                if(previous_reservation.records.traveler_most_recent)
                {
                    var traveler_most_recent = previous_reservation.records.traveler_most_recent;
                    
                    //Flight Data Html
                    var flight_details  =   traveler_most_recent.flight_details;
                    var fliObj2         =   new PreviousRes();
                    html               +=  await fliObj2.flights(flight_details,"flight_details",1, req.session.user_name);
                    
                    //Hotel Data Html
                    if(traveler_most_recent.hotelDetails)
                    {
                        var hotel_details = traveler_most_recent.hotelDetails[0];
                        if(!hotel_details) { hotel_details = []; };
                        if(hotel_details.length != 0)
                        {
                            var date1 = moment(hotel_details[0].HotelCheckIn);
                            var date2 = moment(hotel_details[0].HotelCheckOut);
                            var diff = date2.diff(date1,'days');
                            html += `
                            <div class="chat-panel" id="hotelDetails1">
                                <div class="panel-alert">
                                    Please click on highlighted below 
                                    <a href="#" onclick="stopEditing('hotelDetails1')">
                                        <i class="fa fa-check"></i>
                                    </a>
                                </div> 
                                <div class="chat-panel-header">
                                    <div class="chat-aero-info">
                                        <div class="inner-chat-aero-info hotel-box">
                                            <span class="left-date" onclick="message('dep_return')"> 
                                                <strong class="flight-sm-date" id="hotelDetails1_checkin">
                                                    ${hotel_details[0].HotelCheckIn != null && hotel_details[0].HotelCheckIn != undefined?moment.utc(hotel_details[0].HotelCheckIn).format('llll').split(' ')[0]+' '+moment.utc(hotel_details[0].HotelCheckIn).format('ll'): 'N/A'}
                                                </strong>
                                            </span>
                                            <div class="center-location">
                                                <span>
                                                    <img src="/images/hotel-icon.png" bottom:>
                                                </span>
                                            </div>
                                            <span class="left-date right" onclick="message('dep_return')"> 
                                                <strong class="flight-sm-date" id="hotelDetails1_checkout">
                                                    ${hotel_details[0].HotelCheckOut != null && hotel_details[0].HotelCheckOut != undefined? moment.utc(hotel_details[0].HotelCheckOut).format('llll').split(' ')[0]+' '+moment.utc(hotel_details[0].HotelCheckOut).format('ll'): 'N/A'}
                                                </strong>
                                            </span>
                                        </div>
                                        <div class="right-edit-dropdown">
                                            <a href="#" class="edit_drop" onclick="editPreviousReservation('hotelDetails',1);"><i class="fa fa-pencil"></i></a>
                                            <a href="#" class="edit_drop" onclick="deleditPreviousReservation('hotelDetails1','Hotel');" data-toggle="modal" data-target="#myModal"><i class="fa fa-trash"></i></a>
                                        </div>
                                    </div>
                                    <h3 id="hotelDetails1_name" class="ailine-name" onclick="message('hotel')">${hotel_details[0].HotelName}</h3> 
                                    <p id="hotelDetails1_state" class="hotel-state">
                                        ${hotel_details[0].HotelState}
                                    </p>
                                </div> 
                                <div class="chat-panel-body"> 
                                    <input type="hidden" id="hotelDetails1_diff" value="${diff}"/>
                                </div> 
                                <p class="price-tag" id="hotelDetails1_totalprice" style="display:none;"><strong >Total Price: <span ></span></strong></p>
                            </div>`;
                        }
                    }
                    else
                    {
                        var hotel_details = [];
                    }
                    
                    //Rental Car
                    if(traveler_most_recent.rentalCarDetails!== undefined && traveler_most_recent.rentalCarDetails!== "" && traveler_most_recent.rentalCarDetails.length !==0)
                    {
                        var rental_car = traveler_most_recent.rentalCarDetails[0];

                        if( rental_car.length != 0 )
                        {
                            var date1 = moment(rental_car[0].PickupDateTime);
                            var date2 = moment(rental_car[0].DropoffDateTime);
                            var diff = date2.diff(date1,'days');
                            html += `<div class="chat-panel" id="rentalCarDetails1">
                            <div class="panel-alert">Please click on highlighted below <a href="#" onclick="stopEditing('rentalCarDetails1')"><i class="fa fa-check"></i></a></div>  
                            <div class="chat-panel-header"> 
                                <h3>${ await watsonRoute.translate(null, "Rental CAR DETAILS", req.session.user_name) }</h3> 
                                <div class="chat-aero-info">
                                    <div class="inner-chat-aero-info hotel-box">
                                    <span class="left-date" onclick="message('dep_return')"> <strong class="flight-sm-date" id="rentalCarDetails1_pickup">
                                    ${moment.utc(rental_car[0].PickupDateTime).format('llll').split(' ')[0]+' '+moment.utc(rental_car[0].PickupDateTime).format('ll')}
                                    </strong></span>
                                    <div class="center-location">
                                        <span><img src="/images/car-icon.png" bottom:></span>
                                    </div>
                                    <span class="left-date right" onclick="message('dep_return')">N/A <strong class="flight-sm-date" id="rentalCarDetails1_dropoff">
                                    ${moment.utc(rental_car[0].DropoffDateTime).format('llll').split(' ')[0]+' '+moment.utc(rental_car[0].DropoffDateTime).format('ll')}
                                    </strong></span>
                                        <div class="right-edit-dropdown">
                                        <a href="#" class="edit_drop" onclick="editPreviousReservation('rentalCarDetails',1);"><i class="fa fa-pencil"></i></a>
                                        <a href="#" class="edit_drop" onclick="deleditPreviousReservation('rentalCarDetails1','Car');" data-toggle="modal" data-target="#myModal"><i class="fa fa-trash"></i></a>
                                    </div>
                                    </div>
                                
                                </div>
                                <h3 id="rentalCarDetails1_vendor" class="ailine-name" onclick="message('rentalCar');">${rental_car[0].Company}</h3> 

                                </div> 
                                <div class="chat-panel-body">
                                <input type="hidden" id="rentalCarDetails1_diff" value="${diff}"/>

                                <p>
                                    <span class="city">${rental_car[0].PickupCityCode}</span> 
                                    ${rental_car[0].PickupCity} 
                                </p> 
                                <p>
                                    <span class="city">${rental_car[0].DropoffCityCode}</span> 
                                    ${rental_car[0].DropoffCity} 
                                </p>
                            </div> 
                            <p class="price-tag" id="rentalCarDetails1_totalprice" style="display:none;"><strong >Total Price: <span ></span></strong></p>
                        </div>`;
                        }
                    }
                    html += `<p> <button id="ti${flight_details[0].reckey}" type="button" value="t1" class="btn dark-blue-button booknowcls disableIt" onclick="message('${flight_details[0].reckey}1'); disableButtons();"> ${ await watsonRoute.translate(null, "Book Now", req.session.user_name) } </button> </p>`;
                
                }
                else
                {
                    html += `<span class="no-found"> No Reservation Found </span>`;
                }
                html += `</div> </div> </div> <div id="company_data" class="tab-pane fade in"> <ul class="nav nav-pills"> <li class="active"><a data-toggle="pill" class="btn dark-blue-button active" href="#company_most_frequent">${ await watsonRoute.translate(null, "Most Frequent", req.session.user_name) }</a></li> <li><a data-toggle="pill" class="btn light-grey-button" href="#company_most_recent">${ await watsonRoute.translate(null, "Most Recent", req.session.user_name) }</a></li> </ul> <div class="tab-content"> <div id="company_most_frequent" class="tab-pane fade in active">`;
            
                //Company Most Frequent
                if(previous_reservation.records.company_most_frequent)
                {
                    var company_most_frequent = previous_reservation.records.company_most_frequent;
                    var flight_details = company_most_frequent.flight_details;
                    var fliObj3 = new PreviousRes();
                    html+= await fliObj3.flights(flight_details,"flight_details",2, req.session.user_name);
                
                    //Hotel Data Html
                    if(company_most_frequent.hotelDetails != "" && company_most_frequent.hotelDetails != undefined && company_most_frequent.hotelDetails != null)
                    {
                        var hotel_details = company_most_frequent.hotelDetails[0];
                        if(hotel_details.length != 0)
                        {
                            var date1 = moment(hotel_details[0].HotelCheckIn);
                            var date2 = moment(hotel_details[0].HotelCheckOut);
                            var diff = date2.diff(date1,'days');
                            html += `<div class="chat-panel" id="hotelDetails2"> 
                            <div class="panel-alert">Please click on highlighted below <a href="#" onclick="stopEditing('hotelDetails2')"><i class="fa fa-check"></i></a></div>  
                                        <div class="chat-panel-header">
                                            <div class="chat-aero-info">
                                                <div class="inner-chat-aero-info hotel-box">
                                                    <span class="left-date" onclick="message('dep_return')"> <strong class="flight-sm-date" id="hotelDetails2_checkin">
                                                    ${hotel_details[0].HotelCheckIn != null && hotel_details[0].HotelCheckIn != undefined?moment.utc(hotel_details[0].HotelCheckIn).format('llll').split(' ')[0]+' '+moment.utc(hotel_details[0].HotelCheckIn).format('ll'): 'N/A'}
                                                    </strong></span>
                                                    <div class="center-location">
                                                        <span><img src="/images/hotel-icon.png" bottom:></span>
                                                    </div>
                                                    <span class="left-date right" onclick="message('dep_return')">N/A <strong class="flight-sm-date" id="hotelDetails2_checkout">
                                                    ${hotel_details[0].HotelCheckOut != null && hotel_details[0].HotelCheckOut != undefined? moment.utc(hotel_details[0].HotelCheckOut).format('llll').split(' ')[0]+' '+moment.utc(hotel_details[0].HotelCheckOut).format('ll'): 'N/A'}
                                                    </strong></span>
                                                </div>
                                                <div class="right-edit-dropdown">
                                                <a href="#" class="edit_drop" onclick="editPreviousReservation('hotelDetails',2);"><i class="fa fa-pencil"></i></a>
                                                <a href="#" class="edit_drop" onclick="deleditPreviousReservation('hotelDetails2','Car');" data-toggle="modal" data-target="#myModal"><i class="fa fa-trash"></i></a>
                                            </div>
                                            </div>

                                            <h3 id="hotelDetails2_name" class="ailine-name" onclick="message('hotel')">${hotel_details[0].HotelName}</h3> 
                                            <p id="hotelDetails2_state" class="hotel-state">${hotel_details[0].HotelState}</p>
                                        </div> 
                                        <div class="chat-panel-body"> 
                                        <input type="hidden" id="hotelDetails2_diff" value="${diff}"/>
                                            </div> 
                                            <p class="price-tag" id="hotelDetails2_totalprice" style="display:none;"><strong >Total Price: <span ></span></strong></p>
                                        </div>`;
                        }
                    }
                
                    if(company_most_frequent.rentalCarDetails!== undefined && company_most_frequent.rentalCarDetails!== "" && company_most_frequent.rentalCarDetails.length !==0)
                    {
                        var rental_car = company_most_frequent.rentalCarDetails[0];
                        if(rental_car.length != 0)
                        {
                            var date1 = moment(rental_car[0].PickupDateTime);
                            var date2 = moment(rental_car[0].DropoffDateTime);
                            var diff = date2.diff(date1,'days');
                            html += `<div class="chat-panel" id="rentalCarDetails2">
                            <div class="panel-alert">Please click on highlighted below <a href="#" onclick="stopEditing('rentalCarDetails2')"><i class="fa fa-check"></i></a></div>   
                            <div class="chat-panel-header"> 
                                <h3>${ await watsonRoute.translate(null, "Rental CAR DETAILS", req.session.user_name) }</h3> 
                                <div class="chat-aero-info">
                                    <div class="inner-chat-aero-info hotel-box">
                                        <span class="left-date" onclick="message('dep_return')">N/A <strong class="flight-sm-date" id="rentalCarDetails2_pickup">
                                        ${moment.utc(rental_car[0].PickupDateTime).format('llll').split(' ')[0]+' '+moment.utc(rental_car[0].PickupDateTime).format('ll')}
                                        </strong></span>
                                        <div class="center-location">
                                            <span><img src="/images/car-icon.png" bottom:></span>
                                        </div>
                                        <span class="left-date right" onclick="message('dep_return')">N/A <strong class="flight-sm-date" id="rentalCarDetails2_dropoff">
                                        ${moment.utc(rental_car[0].DropoffDateTime).format('llll').split(' ')[0]+' '+moment.utc(rental_car[0].DropoffDateTime).format('ll')}
                                        </strong></span>
                                        <div class="right-edit-dropdown">
                                        <a href="#" class="edit_drop" onclick="editPreviousReservation('rentalCarDetails',2);"><i class="fa fa-pencil"></i></a>
                                        <a href="#" class="edit_drop" onclick="deleditPreviousReservation('rentalCarDetails2','Car');" data-toggle="modal" data-target="#myModal"><i class="fa fa-trash"></i></a>
                                    </div>
                                    </div>
                                
                                </div>
                                <h3 id="rentalCarDetails2_vendor" class="ailine-name" onclick="message('rentalCar');">${rental_car[0].Company}</h3> 
                                </div> 
                                <div class="chat-panel-body">
                                <input type="hidden" id="rentalCarDetails2_diff" value="${diff}"/>

                                <p>
                                    <span class="city">${rental_car[0].PickupCityCode}</span> 
                                    ${rental_car[0].PickupCity} 
                                </p> 
                                <p>
                                    <span class="city">${rental_car[0].DropoffCityCode}</span> 
                                    ${rental_car[0].DropoffCity} 
                                </p>
                            </div> 
                            <p class="price-tag" id="rentalCarDetails2_totalprice" style="display:none;"><strong >Total Price: <span ></span></strong></p>
                        </div>`;
                        }
                    }
                    html += `<p> <button id="ti${flight_details[0].reckey}" type="button" value="t2" class="btn dark-blue-button disableIt booknowcls" onclick="message('${flight_details[0].reckey}2'); disableButtons();"> ${ await watsonRoute.translate(null, "Book Now", req.session.user_name) } </button> </p>`;
                }
                else
                {
                    html += `<span class="no-found"> No Reservation Found </span>`;
                }
                html += `</div><div id="company_most_recent" class="tab-pane fade in">`;
            
                //COmpany Most Recent
                if(previous_reservation.records.company_most_recent)
                {
                    var company_most_recent = previous_reservation.records.company_most_recent;
                
                    var flight_details = company_most_recent.flight_details;
                    var fliObj4 = new PreviousRes();
                    html+= await fliObj4.flights(flight_details,"flight_details",3, req.session.user_name);
                
                    //Hotel Data Html
                    if(company_most_recent.hotelDetails != "" && company_most_recent.hotelDetails != undefined && company_most_recent.hotelDetails!= null)
                    {
                        var hotel_details = company_most_recent.hotelDetails[0];
                        if(hotel_details.length != 0)
                        {
                            var date1 = moment(hotel_details[0].HotelCheckIn);
                            var date2 = moment(hotel_details[0].HotelCheckOut);
                            var diff = date2.diff(date1,'days');
                            html += `<div class="chat-panel" id="hotelDetails3"> 
                            <div class="panel-alert">Please click on highlighted below <a href="#" onclick="stopEditing('hotelDetails3')"><i class="fa fa-check"></i></a></div>   
                                        <div class="chat-panel-header">
                                            <div class="chat-aero-info">
                                                <div class="inner-chat-aero-info hotel-box">
                                                    <span class="left-date" onclick="message('dep_return')"><strong class="flight-sm-date" id="hotelDetails3_checkin">
                                                    ${hotel_details[0].HotelCheckIn != null && hotel_details[0].HotelCheckIn != undefined?moment.utc(hotel_details[0].HotelCheckIn).format('llll').split(' ')[0]+' '+moment.utc(hotel_details[0].HotelCheckIn).format('ll'): 'N/A'}
                                                    </strong></span>
                                                    <div class="center-location">
                                                        <span><img src="/images/hotel-icon.png" bottom:></span>
                                                    </div>
                                                    <span class="left-date right" onclick="message('dep_return')"><strong class="flight-sm-date" id="hotelDetails3_checkout">
                                                    ${hotel_details[0].HotelCheckOut != null && hotel_details[0].HotelCheckOut != undefined? moment.utc(hotel_details[0].HotelCheckOut).format('llll').split(' ')[0]+' '+moment.utc(hotel_details[0].HotelCheckOut).format('ll'): 'N/A'}
                                                    </strong></span>
                                                </div>
                                                <div class="right-edit-dropdown">
                                                <a href="#" class="edit_drop" onclick="editPreviousReservation('hotelDetails',3);"><i class="fa fa-pencil"></i></a>
                                                <a href="#" class="edit_drop" onclick="deleditPreviousReservation('hotelDetails3','Hotel');" data-toggle="modal" data-target="#myModal"><i class="fa fa-trash"></i></a>
                                            </div>
                                            </div>

                                            <h3 id="hotelDetails3_name" class="ailine-name" onclick="message('hotel')">${hotel_details[0].HotelName}</h3> 
                                            <p id="hotelDetails3_state" class="hotel-state">${hotel_details[0].HotelState}</p>
                                        </div> 
                                        <div class="chat-panel-body"> 
                                        <input type="hidden" id="hotelDetails3_diff" value="${diff}"/>
                                        </div> 
                                        <p class="price-tag" id="hotelDetails3_totalprice" style="display:none;"><strong >Total Price: <span ></span></strong></p>
                                        </div>`;          
                        }
                    }
                    // rental car
                    if(company_most_recent.rentalCarDetails!== undefined && company_most_recent.rentalCarDetails!== "" && company_most_recent.rentalCarDetails.length !==0)
                    {
                        var rental_car = company_most_recent.rentalCarDetails[0];
                        if(rental_car.length != 0)
                        {
                            var date1 = moment(rental_car[0].PickupDateTime);
                            var date2 = moment(rental_car[0].DropoffDateTime);
                            var diff = date2.diff(date1,'days');
                            html += `<div class="chat-panel" id="rentalCarDetails3"> 
                            <div class="panel-alert">Please click on highlighted below <a href="#" onclick="stopEditing('rentalCarDetails3')"><i class="fa fa-check"></i></a></div>   
                            <div class="chat-panel-header"> 
                                <h3>${ await watsonRoute.translate(null, "Rental CAR DETAILS", req.session.user_name) }</h3> 
                                <div class="chat-aero-info">
                                    <div class="inner-chat-aero-info hotel-box">
                                        <span class="left-date" onclick="message('dep_return')"> <strong class="flight-sm-date" id="rentalCarDetails3_pickup">
                                        ${moment.utc(rental_car[0].PickupDateTime).format('llll').split(' ')[0]+' '+moment.utc(rental_car[0].PickupDateTime).format('ll')}
                                        </strong></span>
                                        <div class="center-location">
                                            <span><img src="/images/car-icon.png" bottom:></span>
                                        </div>
                                        <span class="left-date right" onclick="message('dep_return')"> <strong class="flight-sm-date" id="rentalCarDetails3_dropoff">
                                        ${moment.utc(rental_car[0].DropoffDateTime).format('llll').split(' ')[0]+' '+moment.utc(rental_car[0].DropoffDateTime).format('ll')}
                                        </strong></span>
                                        <div class="right-edit-dropdown">
                                        <a href="#" class="edit_drop" onclick="editPreviousReservation('rentalCarDetails',3);"><i class="fa fa-pencil"></i></a>
                                        <a href="#" class="edit_drop" onclick="deleditPreviousReservation('rentalCarDetails3','Car');" data-toggle="modal" data-target="#myModal"><i class="fa fa-trash"></i></a>
                                    </div>
                                    </div>
                                
                                </div>
                                <h3 id="rentalCarDetails3_vendor" class="ailine-name" onclick="message('rentalCar');">${rental_car[0].Company}</h3> 
                                </div> 
                                <div class="chat-panel-body">
                                <input type="hidden" id="rentalCarDetails3_diff" value="${diff}"/>

                                <p>
                                    <span class="city">${rental_car[0].PickupCityCode}</span> 
                                    ${rental_car[0].PickupCity} 
                                </p> 
                                <p>
                                    <span class="city">${rental_car[0].DropoffCityCode}</span> 
                                    ${rental_car[0].DropoffCity} 
                                </p>
                            </div>
                            <p class="price-tag" id="rentalCarDetails3_totalprice" style="display:none;"><strong >Total Price: <span ></span></strong></p> 
                        </div>`;
                        }
                    }
                
                    html += `<p> <button id="ti${flight_details[0].reckey}" type="button" value="t3" class="btn dark-blue-button disableIt booknowcls" onclick="message('${flight_details[0].reckey}3'); disableButtons();"> ${ await watsonRoute.translate(null, "Book Now", req.session.user_name) } </button> </p>`;
                }
                else
                {
                    html += `<span class="no-found"> No Reservation Found </span>`;
                }
                html += `</div></div></div></div></div>  <div class="rerservation-button"><button type="button" class="btn light-grey-button disableIt makenew makenewcls" onclick="message('yes'); disableButtons();"> ${ await watsonRoute.translate( null, "Make New Reservation", req.session.user_name ) } </button></div>`;

                var response = { 
                    status              :   200,  
                    resultFor           :   "checkPreviousFlights",
                    textToShow          :   html,  
                    reservation_details :   reservation_details 
                };
            }
            else
            {
                var response = { status : 400,  records : null, resultFor : "checkPreviousFlights" };
            }
        }
        else
        {
            var response = { status : 400,  records : null, resultFor : "checkPreviousFlights" };
        }
    }
    catch(error)
    {
        var response = { status : 400,  records : null, resultFor : "checkPreviousFlights" };
        console.log(error);
    }
    
    res.json(response);
});

router.post("/current_previousReservationDetails", async (req, res) => {

    var required_iternery = req.body.selected_iternery;
    var reservation_module = req.body.reservation_module;
    var previous_iternery = user_details[req.session.user_name].previous_reservation_array[required_iternery];

    if(!user_details[req.session.user_name])
    {
        user_details[req.session.user_name] = {};
        user_details[req.session.user_name].required_details_to_update = null;
    }
    else
    {
        user_details[req.session.user_name].required_details_to_update = null;   
    }

    user_details[req.session.user_name].required_details_to_update = previous_iternery.iternery[reservation_module];

    if(reservation_module == "flight_details")
    {
        for(var i=0;i<(user_details[req.session.user_name].required_details_to_update).length;i++)
        {
            user_details[req.session.user_name].required_details_to_update[i]['div_id'] = reservation_module+''+required_iternery;
            user_details[req.session.user_name].required_details_to_update[i]['hotel_difference'] = "empty";
            user_details[req.session.user_name].required_details_to_update[i]['rental_difference'] = "empty";

            if( previous_iternery.iternery['hotelDetails'] && (previous_iternery.iternery['hotelDetails']).length > 0 )
            {
                if(previous_iternery.iternery['hotelDetails'][0][0].HotelCheckOut !== undefined  && previous_iternery.iternery['hotelDetails'][0][0].HotelCheckIn !== undefined)
                {
                    if(previous_iternery.iternery['hotelDetails'][0][0].HotelCheckOut != null  && previous_iternery.iternery['hotelDetails'][0][0].HotelCheckIn != null)
                    {
                        var date1 = moment(previous_iternery.iternery['hotelDetails'][0][0].HotelCheckIn);
                        var date2 = moment(previous_iternery.iternery['hotelDetails'][0][0].HotelCheckOut);
                        var diff = date2.diff(date1,'days');
                        user_details[req.session.user_name].required_details_to_update[i]['hotel_difference'] = diff;
                    }
                }
            }
            if( previous_iternery.iternery['rentalCarDetails'] && (previous_iternery.iternery['rentalCarDetails']).length > 0 )
            {
                if(previous_iternery.iternery['rentalCarDetails'][0][0].PickupDateTime !== undefined  && previous_iternery.iternery['rentalCarDetails'][0][0].PickupDateTime !== undefined)
                {
                    if(previous_iternery.iternery['rentalCarDetails'][0][0].DropoffDateTime != null  && previous_iternery.iternery['rentalCarDetails'][0][0].DropoffDateTime != null)
                    {
                        var date1 = moment(previous_iternery.iternery['rentalCarDetails'][0][0].PickupDateTime);
                        var date2 = moment(previous_iternery.iternery['rentalCarDetails'][0][0].DropoffDateTime);
                        var diff = date2.diff(date1,'days');
                        user_details[req.session.user_name].required_details_to_update[i]['rental_difference'] = diff;
                    }

                }
            }
        }
    }

    if(reservation_module == "hotelDetails")
    {
        for(var i=0;i<(user_details[req.session.user_name].required_details_to_update).length;i++)
        {
            user_details[req.session.user_name].required_details_to_update[0][i]['div_id'] = reservation_module+''+required_iternery;
        }
    }

    if(reservation_module == "rentalCarDetails")
    {
        for(var i=0;i<(user_details[req.session.user_name].required_details_to_update).length;i++)
        {
            user_details[req.session.user_name].required_details_to_update[0][i]['div_id'] = reservation_module+''+required_iternery;
        }
    }

    var response = user_details[req.session.user_name].required_details_to_update;

    res.json(response);
});

router.post('/getRequiredInfo', async(req, res) => {
    res.json(user_details[req.session.user_name].required_details_to_update);
});

router.post('/getAllPreviousIternaries',async(req, res) => {
    res.json(user_details[req.session.user_name].previous_reservation_array[req.body.id_number]);
});

router.post('/getpreviousbookingInfo', async(req, res) => {
    var selected_key = 1;
    var required_iternery = req.body.t_reckey;
    for(let i=0;i< (user_details[req.session.user_name].previous_reservation_array).length ;i++)
    {
        if(user_details[req.session.user_name].previous_reservation_array[i].iternery.flight_details[0].reckey == required_iternery)
        {
            selected_key = user_details[req.session.user_name].previous_reservation_array[i].iternery.flight_details.length;
            break;
        }
    }
    res.json({trip_type:selected_key});
});

router.post('/deletePreviousReservationObjectSection', async(req, res) => {
    var iternary = req.body.iternary;
    var id_number = req.body.id_number;
    var opt = req.body.opt;
    try {
        user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary];
        if(opt == 1)
        {
            if(req.body.type == "Flight")
            {
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][0]['deleted'] = 1;
            }else
            {
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][0][0]['deleted'] = 1;
            }

        }else
        {
            if(req.body.type == "Flight")
            {
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][0]['deleted'] = 0;
            }else
            {
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][0][0]['deleted'] = 0;
            }
        }

        res.json({deleted_obj:user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary]});
    } 
    catch (error) 
    {
        res.json({deleted_obj:"error"});
    }
});

router.post('/editPreviousReservationObjectSection', async(req, res) => {
    var iternary = req.body.iternary;
    var id_number = req.body.id_number;
    var response;
   
    try {
            if(req.body.type == "onewayDeparture")
            {
                var car_updated = 'false';
                var hotel_updated = 'false';
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][0].FlightDepartureDate = req.body.dep_date+' '+req.body.dep_time;
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][0].FlightArrivalDate = req.body.dep_date+' '+req.body.dep_time;
                if(req.body.hotel_diff != undefined && req.body.hotel_diff !="" && req.body.hotel_diff !=null)
                {
                    try {
                        user_details[req.session.user_name].previous_reservation_array[id_number].iternery['hotelDetails'][0][0].HotelCheckIn = req.body.dep_date+'T00:00:00.000Z';
                        user_details[req.session.user_name].previous_reservation_array[id_number].iternery['hotelDetails'][0][0].HotelCheckOut = moment.utc(req.body.dep_date).add(req.body.hotel_diff,'days').format('YYYY-MM-DD')+'T00:00:00.000Z';
                        hotel_updated = 'true';
                    } catch (error) {
                        hotel_updated = 'false';
                    }
                }
                if(req.body.rental_diff != undefined && req.body.rental_diff !="" && req.body.rental_diff !=null)
                {
                    try {
                        user_details[req.session.user_name].previous_reservation_array[id_number].iternery['rentalCarDetails'][0][0].PickupDateTime = req.body.dep_date+'T00:00:00.000Z';
                        user_details[req.session.user_name].previous_reservation_array[id_number].iternery['rentalCarDetails'][0][0].DropoffDateTime = moment.utc(req.body.dep_date).add(req.body.rental_diff,'days').format('YYYY-MM-DD')+'T00:00:00.000Z';
                        car_updated = 'true';
                    } catch (error) {
                        car_updated = 'false';
                    }
                }
                response = {obj:user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary], 
                    result:"success",
                    check:"onewayDeparture",
                    car_updated:car_updated,
                    PickupDateTime : car_updated == 'true'?user_details[req.session.user_name].previous_reservation_array[id_number].iternery['rentalCarDetails'][0][0].PickupDateTime :'00-00-00T00:00:00.000Z',
                    DropoffDateTime : car_updated == 'true'?user_details[req.session.user_name].previous_reservation_array[id_number].iternery['rentalCarDetails'][0][0].DropoffDateTime :'00-00-00T00:00:00.000Z',
                    hotel_updated: hotel_updated,
                    HotelCheckIn: hotel_updated == 'true' ?user_details[req.session.user_name].previous_reservation_array[id_number].iternery['hotelDetails'][0][0].HotelCheckIn:'00-00-00T00:00:00.000Z', 
                    HotelCheckOut: hotel_updated == 'true' ?user_details[req.session.user_name].previous_reservation_array[id_number].iternery['hotelDetails'][0][0].HotelCheckOut:'00-00-00T00:00:00.000Z', 
                }
            }
            else if(req.body.type == "rounddeparture")
            {
                var car_updated = 'false';
                var hotel_updated = 'false';
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][0].FlightDepartureDate = req.body.dep_date+' '+req.body.dep_time;
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][0].FlightArrivalDate = req.body.dep_date+' '+req.body.dep_time;
                if(req.body.hotel_diff != undefined && req.body.hotel_diff !="" && req.body.hotel_diff !=null)
                {
                    try {
                        user_details[req.session.user_name].previous_reservation_array[id_number].iternery['hotelDetails'][0][0].HotelCheckIn = req.body.dep_date+'T00:00:00.000Z';
                        user_details[req.session.user_name].previous_reservation_array[id_number].iternery['hotelDetails'][0][0].HotelCheckOut = moment.utc(req.body.dep_date).add(req.body.hotel_diff,'days').format('YYYY-MM-DD')+'T00:00:00.000Z';
                        hotel_updated = 'true';
                    } catch (error) {
                        hotel_updated = 'false';
                    }
                }
                if(req.body.rental_diff != undefined && req.body.rental_diff !="" && req.body.rental_diff !=null)
                {
                    try {
                        user_details[req.session.user_name].previous_reservation_array[id_number].iternery['rentalCarDetails'][0][0].PickupDateTime = req.body.dep_date+'T00:00:00.000Z';
                        user_details[req.session.user_name].previous_reservation_array[id_number].iternery['rentalCarDetails'][0][0].DropoffDateTime = moment.utc(req.body.dep_date).add(req.body.rental_diff,'days').format('YYYY-MM-DD')+'T00:00:00.000Z';
                        car_updated = 'true';
                    } catch (error) {
                        car_updated = 'false';
                    }
                }
                response = {obj:user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary], 
                    result:"success",
                    check:"rounddeparture",
                    car_updated:car_updated,
                    PickupDateTime : car_updated == 'true'?user_details[req.session.user_name].previous_reservation_array[id_number].iternery['rentalCarDetails'][0][0].PickupDateTime :'00-00-00T00:00:00.000Z',
                    DropoffDateTime : car_updated == 'true'?user_details[req.session.user_name].previous_reservation_array[id_number].iternery['rentalCarDetails'][0][0].DropoffDateTime :'00-00-00T00:00:00.000Z',
                    hotel_updated: hotel_updated,
                    HotelCheckIn: hotel_updated == 'true' ?user_details[req.session.user_name].previous_reservation_array[id_number].iternery['hotelDetails'][0][0].HotelCheckIn:'00-00-00T00:00:00.000Z', 
                    HotelCheckOut: hotel_updated == 'true' ?user_details[req.session.user_name].previous_reservation_array[id_number].iternery['hotelDetails'][0][0].HotelCheckOut:'00-00-00T00:00:00.000Z', 
                }
            }
            else if(req.body.type == "roundReturn")
            {
                var car_updated = 'false';
                var hotel_updated = 'false';
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][1].FlightDepartureDate = req.body.return_date+' '+req.body.return_time;
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][1].FlightArrivalDate = req.body.return_date+' '+req.body.return_time;
                if(req.body.hotel_diff != undefined && req.body.hotel_diff !="" && req.body.hotel_diff !=null)
                {
                    try {
                        user_details[req.session.user_name].previous_reservation_array[id_number].iternery['hotelDetails'][0][0].HotelCheckOut = req.body.return_date+'T00:00:00.000Z';
                        hotel_updated = 'true';
                    } catch (error) {
                        hotel_updated = 'false';
                    }
                }
                if(req.body.rental_diff != undefined && req.body.rental_diff !="" && req.body.rental_diff !=null)
                {
                    try {
                        user_details[req.session.user_name].previous_reservation_array[id_number].iternery['rentalCarDetails'][0][0].DropoffDateTime = req.body.return_date+'T00:00:00.000Z';
                        car_updated = 'true';
                    } catch (error) {
                        car_updated = 'false';
                    }
                }
                response = {obj:user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary], 
                    result:"success",
                    check:"roundReturn",
                    car_updated:car_updated,
                    DropoffDateTime : car_updated == 'true'?user_details[req.session.user_name].previous_reservation_array[id_number].iternery['rentalCarDetails'][0][0].DropoffDateTime :'00-00-00T00:00:00.000Z',
                    hotel_updated: hotel_updated,
                    HotelCheckOut: hotel_updated == 'true' ?user_details[req.session.user_name].previous_reservation_array[id_number].iternery['hotelDetails'][0][0].HotelCheckOut:'00-00-00T00:00:00.000Z'
                }

            }
            else if(req.body.type == "hotel_check_in")
            {
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][0][0].HotelCheckIn = req.body.chek_in_date+'T00:00:00.000Z';
                response = {obj:user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary], result:"success",check:"hotel_check_in"}
            }
            else if(req.body.type == "hotel_date_range")
            {
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][0][0].HotelCheckIn = req.body.chek_in_date+'T00:00:00.000Z';
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][0][0].HotelCheckOut = req.body.chek_out_date+'T00:00:00.000Z';
                response = {obj:user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary], result:"success",check:"hotel_date_range"}
            }
            else if(req.body.type == "hotel_check_out")
            {
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][0][0].HotelCheckOut = req.body.chek_out_date+'T00:00:00.000Z';
                response = {obj:user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary],result:"success",check:"hotel_check_out"}
            }
            else if(req.body.type == "rental_car_pickup")
            {
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][0][0].PickupDateTime = req.body.car_pickup_date+' '+req.body.car_pickup_time;
                response = {obj:user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary],result:"success",check:"rental_car_pickup"}
            }
            else if(req.body.type == "rental_car_date_range")
            {
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][0][0].PickupDateTime = req.body.car_pickup_date+' '+req.body.car_pickup_time;
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][0][0].DropoffDateTime = req.body.car_dropoff_date+' '+req.body.car_dropof_time;
                response = {obj:user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary],result:"success",check:"rental_car_date_range"}
            }
            else if(req.body.type == "rental_car_dropoff")
            {
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][0][0].DropoffDateTime = req.body.car_dropoff_date+' '+req.body.car_dropof_time;
                response = {obj:user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary],result:"success",check:"rental_car_dropoff"}
            }
            
            else if(req.body.type == "flighttriprange")
            {
                var car_updated = 'false';
                var hotel_updated = 'false';
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][1].FlightDepartureDate = req.body.return_date+' '+req.body.return_time;
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][1].FlightArrivalDate = req.body.return_date+' '+req.body.return_time;
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][0].FlightDepartureDate = req.body.dep_date+' '+req.body.dep_time;
                user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][0].FlightArrivalDate = req.body.dep_date+' '+req.body.dep_time;
                if(req.body.hotel_diff != undefined && req.body.hotel_diff !="" && req.body.hotel_diff !=null)
                {
                    try {
                        user_details[req.session.user_name].previous_reservation_array[id_number].iternery['hotelDetails'][0][0].HotelCheckIn = req.body.dep_date+'T00:00:00.000Z';
                        user_details[req.session.user_name].previous_reservation_array[id_number].iternery['hotelDetails'][0][0].HotelCheckOut = req.body.return_date+'T00:00:00.000Z';
                        hotel_updated = 'true';
                    } catch (error) {
                        hotel_updated = 'false';
                    }
                }
                if(req.body.rental_diff != undefined && req.body.rental_diff !="" && req.body.rental_diff !=null)
                {
                    try {
                        user_details[req.session.user_name].previous_reservation_array[id_number].iternery['rentalCarDetails'][0][0].PickupDateTime = req.body.dep_date+'T00:00:00.000Z';
                        user_details[req.session.user_name].previous_reservation_array[id_number].iternery['rentalCarDetails'][0][0].DropoffDateTime = req.body.return_date+'T00:00:00.000Z';
                        car_updated = 'true';
                    } catch (error) {
                        car_updated = 'false';
                    }
                }
                response = {obj:user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary], 
                    result:"success",
                    check:"flighttriprange",
                    car_updated:car_updated,
                    PickupDateTime : car_updated == 'true'?user_details[req.session.user_name].previous_reservation_array[id_number].iternery['rentalCarDetails'][0][0].PickupDateTime :'00-00-00T00:00:00.000Z',
                    DropoffDateTime : car_updated == 'true'?user_details[req.session.user_name].previous_reservation_array[id_number].iternery['rentalCarDetails'][0][0].DropoffDateTime :'00-00-00T00:00:00.000Z',
                    hotel_updated: hotel_updated,
                    HotelCheckIn: hotel_updated == 'true' ?user_details[req.session.user_name].previous_reservation_array[id_number].iternery['hotelDetails'][0][0].HotelCheckIn:'00-00-00T00:00:00.000Z',
                    HotelCheckOut: hotel_updated == 'true' ?user_details[req.session.user_name].previous_reservation_array[id_number].iternery['hotelDetails'][0][0].HotelCheckOut:'00-00-00T00:00:00.000Z'

                }

            }
            else
            {
                response = null;
            }
            res.json(response);

    } catch (error) {
        res.json({deleted_obj:"error"});
    }
});

router.post('/required_iternary_based_on_div', async(req, res) => {
    var iternary = req.body.iternary;
    var id_number = req.body.id_number;
    try {
            var previous_iternery = user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary];
            res.json(previous_iternery);
    } catch (error) {
        res.json({deleted_obj:"error"});
    }
});

router.post('/updatePreviousReservationObjectforPnr', async(req, res) => {
    var iternary = req.body.iternary;
    var id_number = req.body.id_number;
    try {
       
        if(req.body.type == "flight")
        {
            user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][0]['pnrObj'] = req.body.obj;
        }
        else
        {
            user_details[req.session.user_name].previous_reservation_array[id_number].iternery[iternary][0][0]['pnrObj'] = req.body.obj;
        }
            
        res.json({result:"success"});
    } 
    catch (error) 
    {
        res.json({result:"error"});
    }
});

router.post('/getMostFrequestCity', async (req, res) => {
    
    if(user_details[req.session.user_name]?.most_frequent_city && user_details[req.session.user_name]?.most_frequent_city_IATA_code)
    {
        var response = { success : true, city_name : user_details[req.session.user_name].most_frequent_city, city_code : user_details[req.session.user_name].most_frequent_city_IATA_code };
    }
    else
    {
        var response = { success : false, city_name : false };
    }

    res.json(response);
});

//==================================== [Route Implementation] ===========================================//

module.exports = router;