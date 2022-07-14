//======================================== [Dependecies] ================================================//

//Route Main Dependecies
const { request, response } =   require("express");
const express               =   require("express");
const { route }             =   require("./watson");
const router                =   express.Router();

//Directory Accessing Dependency
var fs                      =   require('fs');
const path                  =   require("path");

//Calling External APIs [Translation] Dependecies
const axios                 =   require('axios');

//Simple random number generator
const random                =   require("simple-random-number-generator");
var moment                  =   require('moment');
var watsonRoute             =   require('./watson');

//======================================== [Dependecies] ================================================//

//==================================== [Language Preference] =============================================//

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

    user_details[req.session.user_name].prefferedLanguage = req.body.language;
    user_details[req.session.user_name].languageCode = req.body.languageCode;

    var response = { status : 1 };
    res.json(response);
});

//==================================== [Language Preference] =============================================//

//====================================== [Helping functions] ============================================//

let params = { min: 1, max: 1076, integer: true };

async function saveDates(obj)
{
    date_range_data = obj;
    return 1;
}

async function saveFlightBookingData(obj)
{
    airBookingArray.push(obj);
    return 1;
} 

async function saveTravelerInfo(obj)
{
    travelerInfoArray.push(obj);
    return 1;
}

async function updateTravelerInfo(obj)
{
    var travelerInfoArrayLength = travelerInfoArray.length;
    var requiredindex = travelerInfoArrayLength - 1;
    travelerInfoArray[requiredindex] = obj;
    return 1;
}

async function saveHotelBookingData(obj)
{
    hotelBookingArray.push(obj);
    return 1;
}

async function saveRentalCarBooking(obj)
{
    rentalCarBookingArray.push(obj);
    return 1;
}

async function saveRailBooking(obj)
{
    railBookingArray.push(obj);
    return 1;
}

async function saveTownCarBooking(obj)
{
    townCarBookingArray.push(obj);
    return 1;
}

async function insertTravelerDataToDB(array, specialRequest, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'InsertData', action : 'insertTravelerInfo', dataArray : array, specialRequest : specialRequest }, session_handle_axios);
    return DBresponse.data;
}

async function insertFlightInfo(dataArray, travelerArray, current_session)
{

    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'InsertData', action : 'insertFlightInfo', dataArray : dataArray, travelerArray : travelerArray }, session_handle_axios);
    return DBresponse.data;
}

async function insertHotelInfo(dataArray, travelerArray, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'InsertData', action : 'insertHotelInfo', dataArray : dataArray, travelerArray : travelerArray }, session_handle_axios);
    return DBresponse.data;
}

async function insertRentalCarInfo(dataArray, travelerArray, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'InsertData', action : 'insertRentalCarInfo', dataArray : dataArray, travelerArray : travelerArray }, session_handle_axios);
    return DBresponse.data;
}

async function insertTownCarInfo(dataArray, travelerArray, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'InsertData', action : 'insertTownCarInfo', dataArray : dataArray, travelerArray : travelerArray }, session_handle_axios);
    return DBresponse.data;
}

async function insertRailInfo(dataArray, travelerArray, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'InsertData', action : 'insertRailInfo', dataArray : dataArray, travelerArray : travelerArray }, session_handle_axios);
    return DBresponse.data;
}

async function translateTextAPI(text, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var languageCode = "en";
    var APIResponse = await axios.post( process.env.IP + '/api/watson/tanslate', { from : "English", to : languageCode, text : text }, session_handle_axios);
    return APIResponse.data;
}

async function getSelectedFlightDetails(flightID, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var APIResponse = await axios.post( process.env.IP + '/api/sabre/getFlightDetails',{ flightID : flightID }, session_handle_axios);
    return APIResponse.data;
}

async function getSelectedHotelDetails(current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var APIResponse = await axios.post( process.env.IP + '/api/sabre/getSelectedHotelDetails', {}, session_handle_axios);
    return APIResponse.data;
}

async function getSelectedRentalCarDetails(selectedCar, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var APIResponse = await axios.post( process.env.IP + '/api/sabre/getRentalCarDetailsData', { id : selectedCar }, session_handle_axios);
    return APIResponse.data;
}

async function getSelectedTownCarDetails(selectedCar, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var APIResponse = await axios.post( process.env.IP + '/api/sabre/getTownCarDetailsData', { id : selectedCar }, session_handle_axios);
    return APIResponse.data;
}

function getTimeDiff(valuestart, valuestop)
{
    var timeStart = new Date("01/01/2007 " + valuestart).getHours();
    var timeEnd = new Date("01/01/2007 " + valuestop).getHours();
    var hourDiff = timeEnd - timeStart;
    (hourDiff < 0) ? hourDiff = 24 + hourDiff : hourDiff;
    return hourDiff;
}

async function createPNR(traveler_details,id_number,current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var APIResponse = await axios.post( process.env.IP + '/api/sabre/createPassengerNameRecord', { traveler_details : traveler_details,id_number:id_number }, session_handle_axios);
    return APIResponse.data;
}

function flightTime(date)
{
    var day_of_week = moment.utc(date).format('llll').split(',')[0];
    var flight_date = moment.utc(date).format('llll').split(',')[1].split(' ')[2];
    var month_name = moment.utc(date).format('llll').split(',')[1].split(' ')[1];
    var year = moment.utc(date).format('llll').split(',')[2].split(' ')[1];
    var return_date = `${day_of_week}, ${flight_date} ${month_name}, ${year}`;
    return return_date;
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

async function getCityName(cityCode, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', requestType: "getCityName", cityCode : cityCode }, session_handle_axios);
    return DBresponse?.data?.recordObj?.City;
}

//====================================== [Helping functions] ============================================//

//==================================== [Route Implementation] ===========================================//

router.post('/initialize', async (req, res) => {

    if(!user_details[req.session.user_name])
    {
        user_details[req.session.user_name] = {};
        user_details[req.session.user_name].currentChatSessionID = null;
        user_details[req.session.user_name].specialRequest = null;
        user_details[req.session.user_name].currentUserID = null;
        user_details[req.session.user_name].airBookingArray = [];
        user_details[req.session.user_name].travelerInfoArray = [];
        user_details[req.session.user_name].hotelBookingArray = [];
        user_details[req.session.user_name].rentalCarBookingArray = [];
        user_details[req.session.user_name].railBookingArray = [];
        user_details[req.session.user_name].townCarBookingArray = [];
        user_details[req.session.user_name].travelerIDArray = [];
        user_details[req.session.user_name].checkBookingDetails = [];
        user_details[req.session.user_name].pnr_creation = [];
        user_details[req.session.user_name].pnr_details = [];
        user_details[req.session.user_name].date_range_data = null;
    }
    else
    {
        user_details[req.session.user_name].currentChatSessionID = null;
        user_details[req.session.user_name].specialRequest = null;
        user_details[req.session.user_name].currentUserID = null;
        user_details[req.session.user_name].airBookingArray = [];
        user_details[req.session.user_name].travelerInfoArray = [];
        user_details[req.session.user_name].hotelBookingArray = [];
        user_details[req.session.user_name].rentalCarBookingArray = [];
        user_details[req.session.user_name].railBookingArray = [];
        user_details[req.session.user_name].townCarBookingArray = [];
        user_details[req.session.user_name].travelerIDArray = [];
        user_details[req.session.user_name].checkBookingDetails = [];
        user_details[req.session.user_name].pnr_creation = [];
        user_details[req.session.user_name].pnr_details = [];
        user_details[req.session.user_name].date_range_data = null;
    }

    //Generating response
    var response = { initializationStatus : 1 };
    res.json(response);
});

router.post('/saveData', async ( req, res ) => {

    if(!user_details[req.session.user_name])
    {
        user_details[req.session.user_name] = {};
    }

    var dataType = req.body.dataType;
    
    if(dataType === "dates")
    {
        var departure_date_range    =   req.body.dataObj.departure_date_range;
        var return_date_range       =   req.body.dataObj.return_date_range;

        var date_details = {departure_date_range, return_date_range}

        //var storeStatus = await saveDates(date_details);
        user_details[req.session.user_name].date_range_data = date_details;

        if(storeStatus === 1)
        {
            var response = { status : 1 }
        }
    }

    //Storing flight reservation details
    if(dataType === "flight")
    {

        var data = req.body.dataObj;
        
        if(data.flightType === "oneway")
        {
            // var storingResponse = await saveFlightBookingData(data);
            user_details[req.session.user_name].airBookingArray.push(data);
            user_details[req.session.user_name].flightBaseDate = data.date;

            var storingResponse = 1;

            if(storingResponse === 1)
            {
                var response = { status : 1 };
            }
        }
        else if(data.flightType === "roundtrip")
        {
            var departureCityGo = req.body.dataObj.departureCityGo;
            var destinationCityGo = req.body.dataObj.destinationCityGo;
            var departureTime = req.body.dataObj.departureTime;
            var departureDate = req.body.dataObj.departureDate;
            var departureCityReturn = req.body.dataObj.departureCityReturn;
            var destinationCityReturn = req.body.dataObj.destinationCityReturn;
            var returnDate = req.body.dataObj.returnDate;
            var returnTime = req.body.dataObj.returnTime;

            user_details[req.session.user_name].flightBaseDate = departureDate;

            var itin1 = { origin : departureCityGo, destination : destinationCityGo, time : departureTime, date : departureDate, flightType : "roundtrip" };
            //var storingResponse1 = await saveFlightBookingData(itin1);
            user_details[req.session.user_name].airBookingArray.push(itin1);
            var storingResponse1 = 1;
            if(storingResponse1 === 1)
            {
                var itin2 = { origin : departureCityReturn, destination : destinationCityReturn, time : returnTime, date : returnDate, flightType : "roundtrip" };
                // var storingResponse2 = await saveFlightBookingData(itin2);
                user_details[req.session.user_name].airBookingArray.push(itin2);
                var storingResponse2 = 1;
                if(storingResponse2 === 1)
                {
                    var response = { status : 1 };
                }
            }
        }
        else if(data.flightType === "multicity")
        {
            user_details[req.session.user_name].flightBaseDate =  data.flightDetailsArray[0].date;
            var dataArray = req.body.dataObj.flightDetailsArray;
            var numOfItins = dataArray.length;
            for(var i = 0; i < numOfItins; i++)
            {
                // saveFlightBookingData(dataArray[i]);
                user_details[req.session.user_name].airBookingArray.push(dataArray[i]);
            }
            var response = { status : 1 };
        }
    }

    //Storing traveler information details
    if(dataType === "traveler")
    {
        var data = req.body.data;

        // var storeStatus = await saveTravelerInfo(data);
        // if(!user_details[req.session.user_name])
        // {
        //     user_details[req.session.user_name] = {};
        // }
        
        
        user_details[req.session.user_name].travelerInfoArray.push(data);
        //(user_details[req.session.user_name].travelerInfoArray)[0].TripPurposeID = user_details[req.session.user_name]?.TripPurposeID;

        var storeStatus = 1;

        if(storeStatus === 1)
        {
            var response = { status : 1 };
        }    
    }

    //Storing hotel reservation details
    if(dataType === "hotel")
    {
        var HotelState = req.body.dataObj.cityArea;
        var hotelName = req.body.dataObj.hotelName;
        var HotelCheckIn = req.body.dataObj.checkinDate;
        var HotelCheckOut = req.body.dataObj.checkOutDate;

        var hotelReservaitonObj = { hotelName : hotelName, HotelState : HotelState, HotelCheckIn : HotelCheckIn, HotelCheckOut : HotelCheckOut };
        
        // var storeStatus = await saveHotelBookingData(hotelReservaitonObj);
        user_details[req.session.user_name].hotelBookingArray.push(hotelReservaitonObj);
        var storeStatus = 1;
        
        if (storeStatus === 1)
        {
            var response = { status : 1 };
        }
    }

    if(dataType === "hotelArray")
    {
        user_details[req.session.user_name].hotelBookingArray = req.body.dataObj.hotelDetailsArray;
        var response = { status : 1 };
    }

    //Storing rental car reservation details
    if(dataType === "rentalcar")
    {
        var PickupCity = req.body.dataObj.PickUpCity;
        var PickupDate = req.body.dataObj.PickUpDate;
        var PickupTime = req.body.dataObj.PickUpTime;
        var DropoffCity = req.body.dataObj.DropOffCity;
        var DropOffDate = req.body.dataObj.DropOffDate;
        var DropOffTime = req.body.dataObj.DropOffTime;
        
        var rentalCarReservationObj = { 
            PickupCity : PickupCity,
            PickupDateTime : `${PickupDate} ${PickupTime}`,
            DropoffCity : DropoffCity,
            DropoffCity : DropoffCity,
            DropoffDateTime : `${DropOffDate} ${DropOffTime}`
        };

        // var storeStatus = await saveRentalCarBooking(rentalCarReservationObj);

        user_details[req.session.user_name].rentalCarBookingArray.push(rentalCarReservationObj);

        var storeStatus = 1;
        if (storeStatus === 1)
        {
            var response = { status : 1 };
        }

    }

    //Storing rail reservaiton details
    if(dataType === "rail")
    {
        var RailDepartureCity = req.body.dataObj.departureCity;
        var RailArrivalCity = req.body.dataObj.arrivalCity;
        var RailPreferredTime = req.body.dataObj.prefferedTime;
        var RailTime = req.body.dataObj.time;
        var railtype = req.body.dataObj.railType;
        var RailDepartureDate = req.body.dataObj.departureDate;

        //Storing data according to rail type
        if(railtype == "oneway")
        {   
            var railReservationObj = { 
                RailDepartureCity : RailDepartureCity,
                RailArrivalCity : RailArrivalCity,
                RailPreferredTime : RailPreferredTime,
                RailDepartureDate : RailDepartureDate,
                RailTime : RailTime,
                TravelerTypeID : 1,
            };

            // var storeStatus = await saveRailBooking(railReservationObj);
            user_details[req.session.user_name].railBookingArray.push(railReservationObj);
            var storeStatus = 1;

            if (storeStatus === 1)
            {
                var response = { status : 1 };
            }

        }
        else if(railtype == "roundtrip")
        {

            var railReservationObj1 = { 
                RailDepartureCity : req.body.dataObj.departureCityNameGo,
                RailArrivalCity : req.body.dataObj.arrivalCityGo,
                RailDepartureDate : req.body.dataObj.departureDateGo,
                RailPreferredTime : req.body.dataObj.departurePreferredTimeGo,
                RailTime : req.body.dataObj.departureTimeGo,
                TravelerTypeID : 2
            }

            // var storeStatus1 = await saveRailBooking(railReservationObj1);
            user_details[req.session.user_name].railBookingArray.push(railReservationObj1);
            var storeStatus1 = 1;

            if (storeStatus1 === 1)
            {
                var railReservationObj2 = {
                    RailDepartureCity : req.body.dataObj.departureCityNameReturn,
                    RailArrivalCity : req.body.dataObj.arrivalCityReturn,
                    RailDepartureDate : req.body.dataObj.departureDateReturn,
                    RailPreferredTime : req.body.dataObj.departurePreferredTimeReturn,
                    RailTime : req.body.dataObj.departureTimeReturn,
                    TravelerTypeID : 2
                }

                // var storeStatus2 = await saveRailBooking(railReservationObj2);
                user_details[req.session.user_name].railBookingArray.push(railReservationObj2);
                var storeStatus2 = 1;

                if (storeStatus2 === 1)
                {
                    var response = { status : 1 };
                }
            }
        }
        else
        {
            var railReservationObj = { 
                RailDepartureCity : RailDepartureCity,
                RailArrivalCity : RailArrivalCity,
                RailPreferredTime : RailPreferredTime,
                RailDepartureDate : RailDepartureDate,
                RailTime : RailTime,
                TravelerTypeID : 3
            };

            // var storeStatus = await saveRailBooking(railReservationObj);

            user_details[req.session.user_name].railBookingArray.push(railReservationObj);
            var storeStatus = 1;

            if (storeStatus === 1)
            {
                var response = { status : 1 };
            }
        }
    }

    if(dataType === "railArray")
    {
        user_details[req.session.user_name].railBookingArray = req.body.dataObj;
        var response = { status : 1 };
    }

    //Storing town car reservation details
    if(dataType === "towncar")
    {
        var townCarMode = req.body.dataObj.townCarMode;

        if(townCarMode === "oneway")
        {
            var Passengers = req.body.dataObj.numberOfPassengers;
            var TownCarDate = req.body.dataObj.pickUpDate;
            var TownCarPickupTime = req.body.dataObj.pickUpTime;
            var TownCarPickupAddress = req.body.dataObj.pickUpAddress;
            var TownCarDropoffAddress = req.body.dataObj.dropOffAddress;

            var townCarReservationObj = {
                Passengers : Passengers,
                TownCarDate : TownCarDate,
                TownCarPickupTime : TownCarPickupTime,
                TownCarPickupAddress : TownCarPickupAddress,
                TownCarDropoffAddress : TownCarDropoffAddress,
                townCarMode : req.body.dataObj.townCarMode
            }

            // var storeStatus = await saveTownCarBooking(townCarReservationObj);
            user_details[req.session.user_name].townCarBookingArray.push(townCarReservationObj);
            var storeStatus = 1;

            if (storeStatus === 1)
            {
                var response = { status : 1 };
            }
        }

        else if(townCarMode === "hourly")
        {
            var Passengers = req.body.dataObj.numberOfPassengers;
            var TownCarDate = req.body.dataObj.pickUpDate;
            var TownCarPickupTime = req.body.dataObj.pickUpTime;
            var TownCarPickupAddress = req.body.dataObj.pickUpAddress;
            var TownCarDropoffTime = req.body.dataObj.dropOffTime;

            var townCarReservationObj = {
                Passengers : Passengers,
                TownCarDate : TownCarDate,
                TownCarPickupTime : TownCarPickupTime,
                TownCarPickupAddress : TownCarPickupAddress,
                TownCarDropoffTime : TownCarDropoffTime,
                townCarMode : townCarMode
            }

            // var storeStatus = await saveTownCarBooking(townCarReservationObj);
            user_details[req.session.user_name].townCarBookingArray.push(townCarReservationObj);
            var storeStatus = 1;

            if (storeStatus === 1)
            {
                var response = { status : 1 };
            }
        }
    }

    //Getting the special request information
    if(dataType === "specialRequest")
    {
        user_details[req.session.user_name].specialRequest = req.body.specialRequest;
        var response = { status : 1 };
    }
    
    var response = { status : 1 };

    res.json(response);
});

router.post('/storeTripPurpose', async (req, res) => {

    if(!user_details[req.session.user_name])
    {
        user_details[req.session.user_name] = {};
    }
    
    var tripPurposeID = req.body.tripPurposeID;
    
    user_details[req.session.user_name].travelerInfoArray[0].TripPurposeID = tripPurposeID;
    

    var response = { status : 1 };
    res.json(response);
});

router.post('/setFlightDateTime', async (req, res) => {

    if(!user_details[req.session.user_name])
    {
        user_details[req.session.user_name] = {};
    }

    var updatedDateTimeArray = req.body.data;
    
    for(var i = 0; i < (user_details[req.session.user_name].airBookingArray).length; i++)
    {
        for(var j = 0; j < updatedDateTimeArray.length; j++)
        {
            if(updatedDateTimeArray[j].date == (user_details[req.session.user_name].airBookingArray)[i].date)
            {
                (user_details[req.session.user_name].airBookingArray)[i].time = updatedDateTimeArray[j].time;
                continue;
            }
        }
    }

    var response = { status : 1 };
    res.json(response);
});

router.post('/getResInfo', async (req, res) => {

    if(!user_details[req.session.user_name])
    {
        user_details[req.session.user_name] = {};
    }
    
    var requiredInfo = req.body.dataRequired;
    var response = {};

    if(requiredInfo === "flight")
    {
        var response = { responseDetails : user_details[req.session.user_name].airBookingArray };
    }
    
    res.json(response);
});

router.post('/ensuringFinalDetails',async (req, res) => {

    // *****[ If preffered language is ENGLISH ] *****
    if(user_details[req.session.user_name].prefferedLanguage === "English")
    {
        //Making ensure statement
        var ensureDetails = `<div class='accordion-box-scroll'>`;
        ensureDetails +=  `<div class="accordion-box"><ul class="accordion-list">`;

        if((user_details[req.session.user_name].airBookingArray).length != 0)
        {
            ensureDetails +=    `<li class="accordion-row"><a class="accordion-title" href="javascript:void(0)"> Air Reservation Details </a><div class="flight-box">`;
            
            for (var i = 0; i < (user_details[req.session.user_name].airBookingArray).length; i++)
            {
                ensureDetails +=    `<div class="inner-flight-box">`;
                ensureDetails +=    `<p> <label> Flight detail ${(i+1)} </label> </p>`;
                var currentDataObj = (user_details[req.session.user_name].airBookingArray)[i];
                var keys = Object.keys(currentDataObj);

                for (var j = 0; j < keys.length; j++)
                {
                    if(keys[j] == "origin")
                    {
                        ensureDetails +=    `<p> <label> Origin </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "destination")
                    {
                        ensureDetails +=    `<p> <label> Destination </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "time")
                    {
                        ensureDetails +=    `<p> <label> Time </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "date")
                    {
                        ensureDetails +=    `<p> <label> Date </label> ${currentDataObj[keys[j]]} </p>`;
                    }
                }
                ensureDetails +=     `</div>`;
            }            
            ensureDetails +=    `</div></li>`;
        }

        if((user_details[req.session.user_name].travelerInfoArray).length != 0)
        {
            ensureDetails +=    `<li class="accordion-row"><a class="accordion-title" href="javascript:void(0)"> Traveler Information  </a><div class="flight-box">`;

            for(var i = 0; i < (user_details[req.session.user_name].travelerInfoArray).length; i++)
            {
                ensureDetails +=    `<div class="inner-flight-box">`;
                ensureDetails += `<p> <label> Traveler ${(i+1)} </label> </p>`;
                var currentDataObj = (user_details[req.session.user_name].travelerInfoArray)[i];
                var keys  = Object.keys(currentDataObj);

                for(var j = 0; j < keys.length; j++)
                {

                    if(keys[j] == "FirstName")
                    {
                        ensureDetails +=    `<p> <label> First Name </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "LastName")
                    {
                        ensureDetails +=    `<p> <label> Last Name </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "Email")
                    {
                        ensureDetails +=    `<p> <label> Email </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "Phone")
                    {
                        ensureDetails +=    `<p> <label> Phone </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "EmployeeNumber")
                    {
                        ensureDetails +=    `<p> <label> Employee Number </label> ${currentDataObj[keys[j]]} </p>`;
                    }
                }   
                ensureDetails +=     `</div>`;
            }
            ensureDetails +=    `</div></li>`;
        }

        if((user_details[req.session.user_name].hotelBookingArray).length != 0)
        {
            ensureDetails +=    `<li class="accordion-row"><a class="accordion-title" href="javascript:void(0)"> Hotel Reservation Details </a><div class="flight-box">`;
            
            for(var i = 0; i < (user_details[req.session.user_name].hotelBookingArray).length; i++)
            {
                ensureDetails +=    `<div class="inner-flight-box">`;
                ensureDetails +=    `<p> <label> Hotel detail ${(i+1)} </label> </p>`;
                var currentDataObj = (user_details[req.session.user_name].hotelBookingArray)[i];
                var keys = Object.keys(currentDataObj);

                for(var j = 0; j < keys.length; j++)
                {
                    if(keys[j] == "hotelName")
                    {
                        ensureDetails +=    `<p> <label> Hotel Name </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "HotelState")
                    {
                        ensureDetails +=    `<p> <label> Hotel State </label> ${currentDataObj[keys[j]]} </p>`;
                    }
                    
                    if(keys[j] == "HotelCheckIn")
                    {
                        ensureDetails +=    `<p> <label> Hotel Check-In Date </label>  ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "HotelCheckOut")
                    {
                        ensureDetails +=    `<p> <label> Hotel Check-Out Date </label> ${currentDataObj[keys[j]]} </p>`;
                    }
                }
                ensureDetails +=    `</div>`;
            }

            ensureDetails +=    `</div></li>`;
        }

        if((user_details[req.session.user_name].rentalCarBookingArray).length != 0)
        {
            ensureDetails +=    `<li class="accordion-row"><a class="accordion-title" href="javascript:void(0)"> Rental Car Reservation Details </a><div class="flight-box">`;

            for(var i = 0; i < (user_details[req.session.user_name].rentalCarBookingArray).length; i++)
            {
                ensureDetails +=    `<div class="inner-flight-box">`;
                ensureDetails += `<p> <label> Car detail ${(i+1)} </label> </p>`;
                var currentDataObj = (user_details[req.session.user_name].rentalCarBookingArray)[i];
                var keys = Object.keys(currentDataObj);

                for(var j = 0; j < keys.length; j++)
                {
                    if(keys[j] == "PickupCity")
                    {
                        ensureDetails +=    `<p> <label> Pick-Up City </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "PickupDateTime")
                    {
                        ensureDetails +=    `<p> <label> Pick-Up Date | Time </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "DropoffCity")
                    {
                        ensureDetails +=    `<p> <label> Drop-Off City </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "DropoffDateTime")
                    {
                        ensureDetails +=    `<p> <label> Drop-Off Date | Time </label> ${currentDataObj[keys[j]]} </p>`;
                    }
                }   
                ensureDetails +=    `</div>`;
            }
            ensureDetails +=    `</div></li>`;
        }

        if((user_details[req.session.user_name].townCarBookingArray).length != 0)
        {
            ensureDetails +=    `<li class="accordion-row"><a class="accordion-title" href="javascript:void(0)"> Town Car Reservation Details </a><div class="flight-box">`;

            for(var i = 0; i < (user_details[req.session.user_name].townCarBookingArray).length; i++)
            {
                ensureDetails +=    `<div class="inner-flight-box">`;

                var currentDataObj = (user_details[req.session.user_name].townCarBookingArray)[i];
                ensureDetails += `<p> <label> Town Car detail ${(i+1)} </label> </p>`;
                
                ensureDetails += `<p> <label> Town Car mode </label> ${currentDataObj.townCarMode} </p>`;
                if(currentDataObj.townCarMode == "oneway")
                {
                    var keys = Object.keys(currentDataObj);

                    for (var j = 0; j < keys.length; j++)
                    {

                        if(keys[j] == "TownCarDate")
                        {
                            ensureDetails +=    `<p> <label> Pick-Up Date </label> ${currentDataObj[keys[j]]} </p>`;
                        }

                        if(keys[j] == "TownCarPickupTime")
                        {
                            ensureDetails +=    `<p> <label> Pick-Up Time </label> ${currentDataObj[keys[j]]} </p>`;
                        }

                        if(keys[j] == "TownCarPickupAddress")
                        {
                            ensureDetails +=    `<p> <label> Pick-Up Address </label> ${currentDataObj[keys[j]]} </p>`;
                        }

                        if(keys[j] == "TownCarDropoffAddress")
                        {
                            ensureDetails +=    `<p> <label> Drop-Off Address </label> ${currentDataObj[keys[j]]} </p>`;
                        }   
                    }
                }
                else
                {
                    var keys = Object.keys(currentDataObj);

                    for (var j = 0; j < keys.length; j++)
                    {
                        if(keys[j] == "TownCarDate")
                        {
                            ensureDetails +=    `<p> <label> Pick-Up Date </label> ${currentDataObj[keys[j]]} </p>`;
                        }

                        if(keys[j] == "TownCarPickupTime")
                        {
                            ensureDetails +=    `<p> <label> Pick-Up Time </label> ${currentDataObj[keys[j]]} </p>`;
                        }

                        if(keys[j] == "TownCarPickupAddress")
                        {
                            ensureDetails +=    `<p> <label> Pick-Up Address </label> ${currentDataObj[keys[j]]} </p>`;
                        }

                        if(keys[j] == "TownCarDropoffTime")
                        {
                            ensureDetails +=    `<p> <label> Drop-Off Time </label> ${currentDataObj[keys[j]]} </p>`;
                        }
                    }
                }
                ensureDetails +=    `</div>`;
            }
            ensureDetails +=    `</div></li>`;
        }

        if((user_details[req.session.user_name].railBookingArray).length != 0)
        {
            ensureDetails +=    `<li class="accordion-row"><a class="accordion-title" href="javascript:void(0)"> Rail Reservation Details </a><div class="flight-box">`;

            // if(railBookingArray[0].TravelerTypeID == 1)
            // {
            //     ensureDetails +=    `<p> <label> Rail Type </label> One-Way </p>`;
            // }
            // else if(railBookingArray[0].TravelerTypeID == 2)
            // {
            //     ensureDetails +=    `<p> <label> Rail Type </label> Round Trip </p>`;
            // }
            // else
            // {
            //     ensureDetails +=    `<p> <label> Rail Type </label> Multi City </p>`;
            // }
            
            for(var i = 0; i < (user_details[req.session.user_name].railBookingArray).length; i++)
            {
                var currentDataObj = (user_details[req.session.user_name].railBookingArray)[i];
                var keys = Object.keys(currentDataObj);
                ensureDetails +=    `<div class="inner-flight-box">`;
                ensureDetails += `<p> <label> Rail detail ${(i+1)}> </label> </p>`;

                for(var j = 0; j < keys.length; j++)
                {
                    if(keys[j] == "RailDepartureCity")
                    {
                        ensureDetails +=    `<p> <label> Departure </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "RailArrivalCity")
                    {
                        ensureDetails +=    `<p> <label> Arrival </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "RailDepartureDate")
                    {
                        ensureDetails +=    `<p> <label> Date </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "RailPreferredTime")
                    {
                        ensureDetails +=    `<p> <label> Preffered Time </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "RailTime")
                    {
                        ensureDetails +=    `<p> <label> Time </label> ${currentDataObj[keys[j]]} </p>`;
                    }
                }
                ensureDetails +=    `</div>`;
            }
            ensureDetails +=    `</div></li>`;
        }

        // if(specialRequest != null)
        // {
        //     ensureDetails +=    `<li class="accordion-row"><a class="accordion-title" href="javascript:void(0)"> Special Request </a><div class="flight-box">`;
        //     ensureDetails +=    `<p> ${specialRequest} </p>`;
        //     ensureDetails +=    `</div></li>`;
        // }
        ensureDetails += `</ul></div></div>`;
    }

    // *****[ If preffered language is NOT ENGLISH ] *****
    else
    {
        //Making ensure statement
        var ensureDetails = `<div class="accordion-box"><ul class="accordion-list"> <li class="accordion-row final_result" id="ensureDetails">`;
        ensureDetails +=  `<a class="accordion-title" href="javascript:void(0)"> ${await translateTextAPI("Reservation details", req.headers.cookie)} : </a> <div class="flight1-box" id="toggleClass" style="display:none;">`;

        //Air reservaiton details
        if((user_details[req.session.user_name].airBookingArray).length != 0)
        {
            ensureDetails +=    `<div class="flight-row">`;
            ensureDetails +=    `<h3> <u> <b> ${await translateTextAPI("Air reservation details", req.headers.cookie)} : </b> </u> </h3>`;
            ensureDetails +=    `<p> <label> ${await translateTextAPI("Flight Type", req.headers.cookie)} </label> ${await translateTextAPI((user_details[req.session.user_name].airBookingArray)[0].flightType, req.headers.cookie)} </p>`;
            
            for (var i = 0; i < (user_details[req.session.user_name].airBookingArray).length; i++)
            {
                ensureDetails += `<p> <h4> <b> ${ await translateTextAPI("Flight detail", req.headers.cookie) } : ${(i+1)} </b> </h4> </p>`;
                var currentDataObj = (user_details[req.session.user_name].airBookingArray)[i];
                var keys = Object.keys(currentDataObj);

                for (var j = 0; j < keys.length; j++)
                {
                    if(keys[j] == "origin")
                    {
                        ensureDetails +=    `<p> <label> ${await translateTextAPI("Origin", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "destination")
                    {
                        ensureDetails +=    `<p> <label> ${ await translateTextAPI("Destination", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "time")
                    {
                        ensureDetails +=    `<p> <label> ${ await translateTextAPI("Time", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "date")
                    {
                        ensureDetails +=    `<p> <label> ${await translateTextAPI("Date", req.headers.cookie) }  </label> ${currentDataObj[keys[j]]} </p>`;
                    }
                }

                ensureDetails +=    `<p class="ensureDetailsHR"> <hr> </p>`;
            }
            
            ensureDetails +=    `</div>`
        }

        if((user_details[req.session.user_name].travelerInfoArray).length != 0)
        {
            ensureDetails +=    `<div class="flight-row">`;
            ensureDetails +=    `<h3> <u> <b> ${await translateTextAPI("Traveler(s) details", req.headers.cookie) } : </u> </b> </h3>`;

            for(var i = 0; i < (user_details[req.session.user_name].travelerInfoArray).length; i++)
            {
                ensureDetails += `<p> <h4> <b>  ${await translateTextAPI("Traveler", req.headers.cookie) } : ${(i+1)} </b> </h4> </p>`;
                var currentDataObj = (user_details[req.session.user_name].travelerInfoArray)[i];
                var keys  = Object.keys(currentDataObj);

                for(var j = 0; j < keys.length; j++)
                {
                    if(keys[j] == "FirstName")
                    {
                        ensureDetails +=    `<p> <label> ${await translateTextAPI("First Name", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "LastName")
                    {
                        ensureDetails +=    `<p> <label> ${await translateTextAPI("Last Name", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "Email")
                    {
                        ensureDetails +=    `<p> <label> ${await translateTextAPI("Email", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "Phone")
                    {
                        ensureDetails +=    `<p> <label> ${await translateTextAPI("Phone", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "EmployeeNumber")
                    {
                        ensureDetails +=    `<p> <label> ${await translateTextAPI("Employee Number", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                    }
                }
                
                ensureDetails +=    `<p class="ensureDetailsHR"> <hr> </p>`;
            }

            ensureDetails +=    `</div>`;
        }

        if((user_details[req.session.user_name].hotelBookingArray).length != 0)
        {
            ensureDetails +=    `<div class="flight-row">`;
            ensureDetails +=    `<h3> <u> <b> ${await translateTextAPI("Hotel reservation details", req.headers.cookie) }: </b> </u> </h3>`;
            
            for(var i = 0; i < (user_details[req.session.user_name].hotelBookingArray).length; i++)
            {
                ensureDetails += `<p> <h4> <b> ${await translateTextAPI("Hotel detail", req.headers.cookie) } : ${(i+1)} </b> </h4> </p>`;
                var currentDataObj = (user_details[req.session.user_name].hotelBookingArray)[i];
                var keys = Object.keys(currentDataObj);

                for(var j = 0; j < keys.length; j++)
                {
                    if(keys[j] == "hotelName")
                    {
                        ensureDetails +=    `<p> <label> ${await translateTextAPI("Hotel Name", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "HotelState")
                    {
                        ensureDetails +=    `<p> <label> ${await translateTextAPI("Hotel State", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                    }
                    
                    if(keys[j] == "HotelCheckIn")
                    {
                        ensureDetails +=    `<p> <label> ${await translateTextAPI("Hotel Check-In Date", req.headers.cookie) } </label>  ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "HotelCheckOut")
                    {
                        ensureDetails +=    `<p> <label> ${await translateTextAPI("Hotel Check-Out Date", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                    }
                }
                
                ensureDetails +=    `<p class="ensureDetailsHR"> <hr> </p>`;
            }

            ensureDetails +=    `</div>`;
        }

        if((user_details[req.session.user_name].rentalCarBookingArray).length != 0)
        {
            ensureDetails +=    `<div class="flight-row">`;
            ensureDetails +=    `<h3> <u> <b> ${await translateTextAPI("Rental car reservation details", req.headers.cookie) }: </b> </u> </h3>`;

            for(var i = 0; i < (user_details[req.session.user_name].rentalCarBookingArray).length; i++)
            {
                ensureDetails += `<p> <h4> <b> ${await translateTextAPI("Car detail", req.headers.cookie) } : ${(i+1)} </b> </h4> </p>`;
                var currentDataObj = (user_details[req.session.user_name].rentalCarBookingArray)[i];
                var keys = Object.keys(currentDataObj);

                for(var j = 0; j < keys.length; j++)
                {
                    if(keys[j] == "PickupCity")
                    {
                        ensureDetails +=    `<p> <label> ${await translateTextAPI("Pick-Up City", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "PickupDateTime")
                    {
                        ensureDetails +=    `<p> <label> ${await translateTextAPI("Pick-Up Date | Time", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "DropoffCity")
                    {
                        ensureDetails +=    `<p> <label> ${await translateTextAPI("Drop-Off City", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "DropoffDateTime")
                    {
                        ensureDetails +=    `<p> <label> ${await translateTextAPI("Drop-Off Date | Time", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                    }
                }
                
                ensureDetails +=    `<p class="ensureDetailsHR"> <hr> </p>`;
            }

            ensureDetails +=    `</div>`;
        }

        if((user_details[req.session.user_name].townCarBookingArray).length != 0)
        {
            ensureDetails +=    `<div class="flight-row">`;
            ensureDetails +=    `<h3> <u> <b> ${await translateTextAPI("Town car reservation details", req.headers.cookie) }: </b> </u> </h3>`;

            for(var i = 0; i < (user_details[req.session.user_name].townCarBookingArray).length; i++)
            {
                var currentDataObj = (user_details[req.session.user_name].townCarBookingArray)[i];
                
                ensureDetails += `<p> <h4> <b> ${await translateTextAPI("Town Car detail", req.headers.cookie) } : ${(i+1)} </b> </h4> </p>`;
                
                ensureDetails += `<p> <label> Town Car mode </label> ${currentDataObj.townCarMode} </p>`;
                if(currentDataObj.townCarMode == "oneway")
                {
                    var keys = Object.keys(currentDataObj);

                    for (var j = 0; j < keys.length; j++)
                    {
                        if(keys[j] == "TownCarDate")
                        {
                            ensureDetails +=    `<p> <label> ${await translateTextAPI("Pick-Up Date", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                        }

                        if(keys[j] == "TownCarPickupTime")
                        {
                            ensureDetails +=    `<p> <label> ${await translateTextAPI("Pick-Up Time", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                        }

                        if(keys[j] == "TownCarPickupAddress")
                        {
                            ensureDetails +=    `<p> <label> ${await translateTextAPI("Pick-Up Address", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                        }

                        if(keys[j] == "TownCarDropoffAddress")
                        {
                            ensureDetails +=    `<p> <label> ${await translateTextAPI("Drop-Off Address", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                        }
                    }
            
                    
                }
                else
                {
                    var keys = Object.keys(currentDataObj);

                    for (var j = 0; j < keys.length; j++)
                    {
                        if(keys[j] == "TownCarDate")
                        {
                            ensureDetails +=    `<p> <label> ${await translateTextAPI("Pick-Up Date", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                        }

                        if(keys[j] == "TownCarPickupTime")
                        {
                            ensureDetails +=    `<p> <label> ${await translateTextAPI("Pick-Up Time", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                        }

                        if(keys[j] == "TownCarPickupAddress")
                        {
                            ensureDetails +=    `<p> <label> ${await translateTextAPI("Pick-Up Address", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                        }

                        if(keys[j] == "TownCarDropoffTime")
                        {
                            ensureDetails +=    `<p> <label> ${await translateTextAPI("Drop-Off Time", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                        }
                    }
                }
                
                ensureDetails +=    `<p class="ensureDetailsHR"> <hr> </p>`;
            }

            ensureDetails +=    `</div>`;
        }

        if((user_details[req.session.user_name].railBookingArray).length != 0)
        {
            ensureDetails +=    `<div class="flight-row">`;
            ensureDetails +=    `<h3> <u> <b> ${await translateTextAPI("Rail reservation details", req.headers.cookie) }: </b> </u> </h3>`;

            if((user_details[req.session.user_name].railBookingArray)[0].TravelerTypeID == 1)
            {
                ensureDetails +=    `<p> <label> ${await translateTextAPI("Rail Type", req.headers.cookie) } </label> ${await translateTextAPI("One-Way", req.headers.cookie) } </p>`;
            }
            else if((user_details[req.session.user_name].railBookingArray)[0].TravelerTypeID == 2)
            {
                ensureDetails +=    `<p> <label> ${await translateTextAPI("Rail Type", req.headers.cookie)} </label> ${await translateTextAPI("Round Trip", req.headers.cookie) } </p>`;
            }
            else
            {
                ensureDetails +=    `<p> <label> ${await translateTextAPI("Rail Type", req.headers.cookie) } </label> ${await translateTextAPI("Multi City", req.headers.cookie) } </p>`;
            }
            
            for(var i = 0; i < (user_details[req.session.user_name].railBookingArray).length; i++)
            {
                var currentDataObj = (user_details[req.session.user_name].railBookingArray)[i];
                var keys = Object.keys(currentDataObj);

                ensureDetails += `<p> <h4> <b> ${await translateTextAPI("Rail detail", req.headers.cookie) } : ${(i+1)} </b> </h4> </p>`;

                for(var j = 0; j < keys.length; j++)
                {
                    if(keys[j] == "RailDepartureCity")
                    {
                        ensureDetails +=    `<p> <label> ${await translateTextAPI("Departure", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "RailArrivalCity")
                    {
                        ensureDetails +=    `<p> <label> ${await translateTextAPI("Arrival", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "RailDepartureDate")
                    {
                        ensureDetails +=    `<p> <label> ${await translateTextAPI("Date", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "RailPreferredTime")
                    {
                        ensureDetails +=    `<p> <label> ${await translateTextAPI("Preffered Time", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                    }

                    if(keys[j] == "RailTime")
                    {
                        ensureDetails +=    `<p> <label> ${await translateTextAPI("Time", req.headers.cookie) } </label> ${currentDataObj[keys[j]]} </p>`;
                    }
                }
            
                ensureDetails +=    `<p class="ensureDetailsHR"> <hr> </p>`;
            }
            ensureDetails +=    `</div>`;
        }

        if(user_details[req.session.user_name].specialRequest != null)
        {
            ensureDetails +=    `<div class="flight-row end-div">`;
            ensureDetails +=    `<h3> ${await translateTextAPI("Special request", req.headers.cookie)}: </h3>`;
            ensureDetails +=    `<p> ${user_details[req.session.user_name].specialRequest} </p>`;
            ensureDetails +=    `</div>`;
        }
        
        ensureDetails +=    `</div></li></ul></div>`;
    }

    var response = { status : 1, ensureDetails : ensureDetails };

    res.json(response);
});

router.post('/migrateToDB', async (req, res) => {
    
    if(!user_details[req.session.user_name])
    {
        user_details[req.session.user_name] = {};
    }

    if(req.body.type != undefined && req.body.type == "previous")
    {
        var pnr_creation = await createPNR(user_details[req.session.user_name].travelerInfoArray,req.body.id_number,req.headers.cookie);
    }
    else
    {
        var pnr_creation = await createPNR(user_details[req.session.user_name].travelerInfoArray,"empty",req.headers.cookie);
    }    

        if(pnr_creation.success)
        {
            user_details[req.session.user_name].pnr_details.push(pnr_creation.pnr_details);
        }

        //Inserting traveler informaton to DB
        if(user_details[req.session.user_name].travelerInfoArray.length != 0)
        {
            if(user_details[req.session.user_name].specialRequest != null)
            {
                var insertStatus = await insertTravelerDataToDB(user_details[req.session.user_name].travelerInfoArray, user_details[req.session.user_name].specialRequest, req.headers.cookie);
                user_details[req.session.user_name].travelerIDArray = insertStatus.travelerIDArray;
            }
            else
            {
                try 
                {
                    var insertStatus = await insertTravelerDataToDB(user_details[req.session.user_name].travelerInfoArray, null, req.headers.cookie);
                    user_details[req.session.user_name].travelerIDArray = insertStatus.travelerIDArray;
                } 
                catch(error) 
                {
                    console.log(error);
                }
            }
        }

        //Inserting air information to DB
        if((user_details[req.session.user_name].airBookingArray).length != 0)
        {
            var insertStatus = await insertFlightInfo((user_details[req.session.user_name].airBookingArray), user_details[req.session.user_name].travelerIDArray, req.headers.cookie);
        }

        //Inserting hotel information to DB
        if((user_details[req.session.user_name].hotelBookingArray).length != 0)
        {
            var insertStatus = await insertHotelInfo(user_details[req.session.user_name].hotelBookingArray, user_details[req.session.user_name].travelerIDArray, req.headers.cookie);
        }
        
        //Inserting rental car information to DB
        if((user_details[req.session.user_name].rentalCarBookingArray).length != 0)
        {
            var insertStatus = await insertRentalCarInfo(user_details[req.session.user_name].rentalCarBookingArray, user_details[req.session.user_name].travelerIDArray, req.headers.cookie);   
        }

        if((user_details[req.session.user_name].townCarBookingArray).length != 0)
        {
            var insertStatus = await insertTownCarInfo(user_details[req.session.user_name].townCarBookingArray, user_details[req.session.user_name].travelerIDArray, req.headers.cookie);
        }

        if((user_details[req.session.user_name].railBookingArray).length != 0)
        {
            var insertStatus = await insertRailInfo(user_details[req.session.user_name].railBookingArray, user_details[req.session.user_name].travelerIDArray, req.headers.cookie);
        }

    var response = { status : 1 };
    res.json(response);
});

router.post('/getFlightBaseData', async (req, res) => {

    if(!user_details[req.session.user_name])
    {
        user_details[req.session.user_name] = {};
    }

    var base_date = `${user_details[req.session.user_name].flightBaseDate}T00:00:00.000Z`;
    var response = { base_date : base_date };
    res.json(response);
});

router.post('/getReservationTypesDetails', async (req, res) => {

    if(!user_details[req.session.user_name]) { user_details[req.session.user_name] = {}; };

    var randomVariable = random(params);
    
    // var textToShow = `<div class='msg-row'> <div class='user-msg receive'>  <p> What types of reservation(s) are needed? </p> </div> <div class='msg-row select'> <div class='user-msg receive'> <ul class='reservation-list'> <li><input type="checkbox" id="flight_reservation${randomVariable}" class="reservation_details" value="flight"><label for="flight_reservation${randomVariable}"> Flight Reservation </label></li> <li><input type="checkbox" id="hotel_reservation${randomVariable}" class="reservation_details" value="hotel"><label for="hotel_reservation${randomVariable}"> Hotel Reservation </label></li> <li><input type="checkbox" id="rental_car_reservation${randomVariable}" class="reservation_details" value="rental_car"><label for="rental_car_reservation${randomVariable}"> Rental Car Reservation </label></li> <li><input type="checkbox" id="town_car_reservation${randomVariable}" class="reservation_details" value="town_car" disabled><label for="town_car_reservation${randomVariable}"> Town Car Reservation </label></li> <li><input type="checkbox" id="rail_reservation${randomVariable}" class="reservation_details" value="rail" disabled><label for="rail_reservation${randomVariable}"> Rail Reservation </label></li> </ul> <div class='reserve-button'><button type="button" class='btn btn-default disableIt' onclick="requiredReservationTypes();"> Ok </button></div> </div> </div> </div>`;
    var textToShow = `
    <div class='msg-row'> 
        <div class='user-msg receive'> 
            <p> ${ await watsonRoute.translate(null, "What types of reservation(s) are needed", req.session.user_name) }? </p> 
        </div> 
        <div class='msg-row select'> 
            <div class='user-msg receive'> 
                <ul class='reservation-list'> 
                    <li>
                        <input type="checkbox" id="flight_reservation${randomVariable}" class="reservation_details" value="flight">
                        <label for="flight_reservation${randomVariable}"> ${ await watsonRoute.translate(null, "Flight Reservation", req.session.user_name) } </label>
                    </li> 
                    <li>
                        <input type="checkbox" id="hotel_reservation${randomVariable}" class="reservation_details" value="hotel">
                        <label for="hotel_reservation${randomVariable}"> ${ await watsonRoute.translate(null, "Hotel Reservation", req.session.user_name) } </label>
                    </li> 
                    <li>
                        <input type="checkbox" id="rental_car_reservation${randomVariable}" class="reservation_details" value="rental_car">
                        <label for="rental_car_reservation${randomVariable}"> ${ await watsonRoute.translate(null, "Rental Car Reservation", req.session.user_name) } </label>
                    </li> 
                </ul> 
                <div class='reserve-button'> 
                    <button type="button" class='btn btn-default disableIt' onclick="requiredReservationTypes();"> ${ await watsonRoute.translate(null, "Ok", req.session.user_name) } </button> 
                </div> 
            </div> 
        </div> 
    </div>`;

    var response = { textToShow : textToShow};
    res.json(response);
});

router.post('/checkBookingDetails', async (req, res) => {

    if(!user_details[req.session.user_name])
    {
        user_details[req.session.user_name] = {};
    }
    
    // var checkBookingDetails = [];

    //Checking if traveler make flight reservaion
    if((user_details[req.session.user_name].airBookingArray).length != 0)
    {
       user_details[req.session.user_name].checkBookingDetails.push("Flight");
    }

    if((user_details[req.session.user_name].hotelBookingArray).length != 0)
    {
        user_details[req.session.user_name].checkBookingDetails.push("Hotel");
    }

    if((user_details[req.session.user_name].rentalCarBookingArray).length != 0)
    {
        user_details[req.session.user_name].checkBookingDetails.push("Rental Car");
    }

    if((user_details[req.session.user_name].townCarBookingArray).length != 0)
    {
        user_details[req.session.user_name].checkBookingDetails.push("Town Car");
    }

    if((user_details[req.session.user_name].railBookingArray).length != 0)
    {
        user_details[req.session.user_name].checkBookingDetails.push("Rail");
    }

    var response = { reservation_count : (user_details[req.session.user_name].checkBookingDetails).length, reservation_details : user_details[req.session.user_name].checkBookingDetails };

    res.json(response);

});

router.post('/emptyTravelerInfoArray', async (req, res) => {

    if(!user_details[req.session.user_name]) { user_details[req.session.user_name] = {}; };

    user_details[req.session.user_name].travelerInfoArray = [];

    if((user_details[req.session.user_name].travelerInfoArray).length == 0)
    {
        var response = { status : 1 };
    }
    else
    {
        var response = { status : 0 };
    }

    res.json(response);
});

router.post('/gettingProvidedInformation', async (req, res) => {

    if(!user_details[req.session.user_name]) { user_details[req.session.user_name] = {}; };
    var reservation_type = req.body.reservation_type;

    if(reservation_type === "date_range")
    {
        if(user_details[req.session.user_name].date_range_data)
        {
            var html = `<div class="chat-panel" id="dates-left-pannel"><div class="chat-panel-header"> <h3> ${ await watsonRoute.translate(null, "Trip Date Range", req.session.user_name) } </h3> <p> ${ await watsonRoute.translate(null, "From", req.session.user_name) } : ${user_details[req.session.user_name].date_range_data.departure_date_range} ${ await watsonRoute.translate(null, "TO", req.session.user_name) }: ${user_details[req.session.user_name].date_range_data.return_date_range} </p>`;
            var response = { reservation_type : reservation_type, textToShow : html, departure_date_range : user_details[req.session.user_name].date_range_data.departure_date_range, return_date_range : user_details[req.session.user_name].date_range_data.return_date_range };
        }
        else
        {
            var html = `<p> ${ await watsonRoute.translate(null, "There is some error showing the date range", req.session.user_name) } </p>`;
            var response = { reservation_type : reservation_type, textToShow : html };
        }
    }

    //For air reservation (Done) (Transaltion Module is pending here)
    if(reservation_type === "flight")
    {
        var flightID                =   req.body.id;
        var selectedFlightDetails   =   await getSelectedFlightDetails(flightID, req.headers.cookie);
        var flight_details          =   selectedFlightDetails?.requiredFlight;

        if(flight_details)
        {
            var flight_type = flight_details?.flightType;
            
            if(flight_type)
            {
                if(flight_type == "oneway")
                {
                    var flightScheduleData = flight_details?.flightScheduleData;
                    
                    if(flightScheduleData && flightScheduleData.length > 0)
                    {
                        var html = `
                        <div class="chat-panel" id="flight-left-pannel">
                            <div class="chat-panel-header"> 
                                <h3> ${ await watsonRoute.translate(null, "AIR RESERVATION DETAILS", req.session.user_name) } </h3> 
                                <div class="chat-aero-info">
                                    <div class="inner-chat-aero-info">
                                        <span class="left-date"> 
                                            ${moment.utc(flightScheduleData[0].departureDateTime).format('LT')} 
                                            <strong class="flight-sm-date"> ${flightTime(flightScheduleData[0].departureDateTime)} </strong>
                                        </span>
                                        <div class="center-location">
                                            <i class="fa fa-plane"></i>`;
                        
                                            //No. of stops
                                            if(flightScheduleData.length > 1)
                                            {
                                                html += `
                                                <div class="location-stops">
                                                    <strong>${(flightScheduleData.length - 1)} ${ await watsonRoute.translate(null, "stops", req.session.user_name) }  <i class="fa fa-info-circle"></i> </strong> <p>`;
                                                    
                                                    for(var i = 1; i < flightScheduleData.length; i++)
                                                    {
                                                        html += `${flightScheduleData[i].deptCity}`;
                                                        if(flightScheduleData[(i+1)])
                                                        {
                                                            html += `, `;
                                                        }
                                                    }

                                                html += `</p>  <div class="sm-locate-alerts">`;
                                                for(var i = 1; i < flightScheduleData.length; i++)
                                                {
                                                    html += `<p> ${flightScheduleData[i].deptCity} ${moment.utc(flightScheduleData[i].departureDateTime).format('LT')} - ${moment.utc(flightScheduleData[i].arrivalDateTime).format('LT')} * ( ${getTimeDiff(moment.utc(flightScheduleData[i].departureDateTime).format('LT'), moment.utc(flightScheduleData[i].arrivalDateTime).format('LT'))} ${ await watsonRoute.translate(null, "hours overlay", req.session.user_name) } )</p>`;
                                                }
                                                html += `<p>* ${ await watsonRoute.translate(null, "All times shown are local standarad times", req.session.user_name) } </p></div></div>`;
                                            }
                                            else
                                            {
                                                html += `<p> ${ await watsonRoute.translate(null, "Non-Stop", req.session.user_name) } </p>`;
                                            }

                        var last_scedule_details =  flightScheduleData.slice(-1);
                        html += `</div><span class="left-date right">${moment.utc(last_scedule_details[0].arrivalDateTime).format('LT')} <strong class="flight-sm-date"> ${flightTime(last_scedule_details[0].arrivalDateTime)} </strong></span>`;
                        html += `<div class="right-edit-dropdown"></div></div></div>`;
                        html += `<h3>${flight_details.operating_carrier} | ${flight_details.carrier_name}</h3> <p class="hotel-state"> ${await watsonRoute.translate(null, "Flight", req.session.user_name)} # ${flightScheduleData[0].MarketflightNumber} </p> </div> `;
                        html += `<div class="chat-panel-body"><p class="flight_city_name"><span class="city">${flight_details.departure_city}</span> ${await getCityName(flight_details.departure_city, req.headers.cookie)}</p><p class="flight_city_name"><span class="city">${flight_details.destination_city}</span>${await getCityName(flight_details.destination_city, req.headers.cookie)}</p> </div> <p class="price-tag"> <strong> ${ await watsonRoute.translate(null, "Total Price", req.session.user_name) } :</strong> ${flight_details.totalPrice} $ </p> </div>`;
                    }
                }

                else if(flight_type == "roundtrip")
                {
                    var flightScheduleData = flight_details?.flightScheduleData;

                    if(flightScheduleData)
                    {
                        var flightScheduleData_depart = [];
                        var flightScheduleData_return = [];

                        for(var i = 0; i < flightScheduleData.length; i++)
                        {
                            if(flightScheduleData[i].RPH == 1)
                            {
                                flightScheduleData_depart.push(flightScheduleData[i]);
                            }
                            else
                            {
                                flightScheduleData_return.push(flightScheduleData[i]);
                            }
                        }

                        //HTML for Depart
                        var html = `<div class="chat-panel" id="flight-left-pannel"><div class="chat-panel-header"> <h3> ${ await watsonRoute.translate(null, "AIR RESERVATION DETAILS", req.session.user_name) } </h3> <div class="chat-aero-info"><div class="inner-chat-aero-info"><span class="left-date">${moment.utc(flightScheduleData_depart[0].departureDateTime).format('LT')} <strong class="flight-sm-date"> ${flightTime(flightScheduleData_depart[0].departureDateTime)} </strong></span><div class="center-location"><i class="fa fa-plane"></i>`;

                        //No. of stops
                        if(flightScheduleData_depart.length > 1)
                        {
                            html += `<div class="location-stops"><strong>${(flightScheduleData_depart.length - 1)} ${ await watsonRoute.translate(null, "stops", req.session.user_name) } <i class="fa fa-info-circle"></i></strong><p>`;
                            
                            for(var i = 1; i < flightScheduleData_depart.length; i++)
                            {
                                html += `${flightScheduleData_depart[i].deptCity}`;
                                if(flightScheduleData_depart[(i+1)])
                                {
                                    html += `, `;
                                }
                            }
                            
                            html += `</p> <div class="sm-locate-alerts">`;

                            for(var i = 1; i < flightScheduleData_depart.length; i++)
                            {
                                html += `<p>${flightScheduleData_depart[i].deptCity} ${moment.utc(flightScheduleData_depart[i].departureDateTime).format('LT')} - ${moment.utc(flightScheduleData_depart[i].arrivalDateTime).format('LT')} * ( ${getTimeDiff(moment.utc(flightScheduleData_depart[i].departureDateTime).format('LT'), moment.utc(flightScheduleData_depart[i].arrivalDateTime).format('LT'))} ${ await watsonRoute.translate(null, "hours overlay", req.session.user_name) } )</p>`;
                            }
                            
                            html += `<p>* ${ await watsonRoute.translate(null, "All times shown are local standarad times", req.session.user_name) } </p></div></div>`;
                        }
                        else
                        {
                            html += `<p> ${ await watsonRoute.translate(null, "Non-Stop", req.session.user_name) } </p>`;
                        }

                        var last_scedule_details =  flightScheduleData_depart.slice(-1);
                        html += `</div><span class="left-date right">${moment.utc(last_scedule_details[0].arrivalDateTime).format('LT')} <strong class="flight-sm-date"> ${flightTime(last_scedule_details[0].arrivalDateTime)} </strong></span>`;
                        html += `<div class="right-edit-dropdown"></div></div></div>`;
                        html += `<h3>${flight_details.operating_carrier1} | ${flight_details.carrier_name1}</h3> <p class="hotel-state"> ${ await watsonRoute.translate(null, "Flight", req.session.user_name) } # ${flightScheduleData_depart[0].MarketflightNumber} </p> </div> `;
                        html += `<div class="chat-panel-body"><p class="flight_city_name"><span class="city">${flight_details.departureOrigin}</span> ${await getCityName(flight_details.departureOrigin, req.headers.cookie)}</p><p class="flight_city_name"><span class="city">${flight_details.departureDestination}</span>${await getCityName(flight_details.departureDestination, req.headers.cookie)}</p> </div> </div>`;

                        //HTML for Return
                        var last_scedule_details =  flightScheduleData_return.slice(-1);
                        html += `<div class="chat-panel"><div class="chat-panel-header"> <div class="chat-aero-info back"><div class="inner-chat-aero-info"><span class="left-date">${moment.utc(last_scedule_details[0].arrivalDateTime).format('LT')} <strong class="flight-sm-date"> ${flightTime(last_scedule_details[0].arrivalDateTime)} </strong></span><div class="center-location"><i class="fa fa-plane"></i>`;

                        //No. of stops
                        if(flightScheduleData_return.length > 1)
                        {
                            html += `<div class="location-stops"><strong>${(flightScheduleData_return.length - 1)} stops <i class="fa fa-info-circle"></i></strong><p>`;
                            for(var i = 1; i < flightScheduleData_return.length; i++)
                            {
                                html += `${flightScheduleData_return[i].deptCity}`;
                                if(flightScheduleData_return[(i+1)])
                                {
                                    html += `, `;
                                }
                            }
                            html += `</p> <div class="sm-locate-alerts">`;
                            for(var i = 1; i < flightScheduleData_return.length; i++)
                            {
                                html += `<p>${flightScheduleData_return[i].deptCity} ${moment.utc(flightScheduleData_return[i].departureDateTime).format('LT')} - ${moment.utc(flightScheduleData_return[i].arrivalDateTime).format('LT')} * ( ${getTimeDiff(moment.utc(flightScheduleData_return[i].departureDateTime).format('LT'), moment.utc(flightScheduleData_return[i].arrivalDateTime).format('LT'))} hours overlay )</p>`;
                            }
                            html += `<p>* ${ await watsonRoute.translate(null, "All times shown are local standarad times", req.session.user_name) } </p></div></div>`;
                        }
                        else
                        {
                            html += `<p> ${ await watsonRoute.translate(null, "Non-Stop", req.session.user_name) } </p>`;
                        }

                        html += `</div><span class="left-date right"> ${moment.utc(flightScheduleData_return[0].departureDateTime).format('LT')} <strong class="flight-sm-date"> ${flightTime(flightScheduleData_return[0].departureDateTime)} </strong></span>`;
                        html += `<div class="right-edit-dropdown"></div></div></div>`;
                        html += `<h3>${flight_details.operating_carrier2} | ${flight_details.carrier_name2}</h3> <p class="hotel-state"> ${ await watsonRoute.translate(null, "Flight", req.session.user_name) } # ${flightScheduleData_return[0].MarketflightNumber} </p> </div> `;
                        html += `<div class="chat-panel-body"><p class="flight_city_name"><span class="city">${flight_details.returnDestination}</span> ${await getCityName(flight_details.returnDestination, req.headers.cookie)}</p><p class="flight_city_name"><span class="city">${flight_details.returnOrigin}</span>${await getCityName(flight_details.returnOrigin, req.headers.cookie)}</p> </div> <p class="price-tag"> <strong> ${await watsonRoute.translate(null, "Total Price", req.session.user_name)} :</strong> ${flight_details.totalPrice} $ </p> </div>`;
                    }
                }

                var response = { reservation_type : reservation_type, textToShow : html, selectedFlightDetails : selectedFlightDetails };
            }  
            else
            {
                var html = `<p> ${ await watsonRoute.translate(null, "There is some error showing the selected flight details", req.session.user_name) } </p>`;
                var response = { reservation_type : reservation_type, textToShow : html };
            } 
        }
        else
        {
            var html = `<p> ${ await watsonRoute.translate(null, "There is some error showing the selected flight details", req.session.user_name) } </p>`;
            var response = { reservation_type : reservation_type, textToShow : html };
        }

    }

    //For hotel reservation (Done)
    if(reservation_type === "hotel")
    {
        var selectedHotelDetails    =   await getSelectedHotelDetails(req.headers.cookie);
        var hotel_details           =   selectedHotelDetails?.requiredHotel;

        if(hotel_details)
        {
            var html = `<div class="chat-panel" id="hotel-left-pannel"><div class="chat-panel-header"> <h3> ${ await watsonRoute.translate(null, "HOTEL RESERVATION DETAILS", req.session.user_name) } </h3> <div class="chat-aero-info"><div class="inner-chat-aero-info hotel-box">`;
            html += `<span class="left-date"><strong class="flight-sm-date"> ${moment.utc(hotel_details.check_in_date).format('llll').split(' ')[0]+' '+moment.utc(hotel_details.check_in_date).format('ll')} </strong></span>`;
            html += `<div class="center-location"> <span><img src="/images/hotel-icon.png" bottom:></span> </div>`;
            html += `<span class="left-date right"><strong class="flight-sm-date"> ${moment.utc(hotel_details.check_out_date).format('llll').split(' ')[0]+' '+moment.utc(hotel_details.check_out_date).format('ll')} </strong></span>`;
            html += `</div><div class="right-edit-dropdown"></div></div>`;
            html += `<h3>${hotel_details.HotelName}</h3><p class="hotel-state"> ${hotel_details.city_name} </p>`;
            html += `</div><div class="chat-panel-body">`;
            html += `</div> <p class="price-tag"> <strong> ${ await watsonRoute.translate(null, "Total Price", req.session.user_name) } :</strong> ${hotel_details.room_rate} $ </p> </div>`;

            var response = { reservation_type : reservation_type, textToShow : html, selectedHotelDetails : selectedHotelDetails };
        }
        else
        {
            var html = `<p> ${ await watsonRoute.translate(null, "There is some error showing the selected room details", req.session.user_name) } </p>`;
            var response = { reservation_type : reservation_type, textToShow : html };
        }
    }

    //For rental car reservation
    if(reservation_type === "rental_car")
    {
        var selectedCar = req.body.id;
        var selectedRentalCarDetails = await getSelectedRentalCarDetails(selectedCar, req.headers.cookie);

        if(selectedRentalCarDetails)
        {
            var html = `<div class="chat-panel" id="rental_car-left-pannel"> <div class="chat-panel-header"> <h3> ${ await watsonRoute.translate(null, "RENTAL CAR RESERVATION DETAILS", req.session.user_name) } </h3> <div class="chat-aero-info"> <div class="inner-chat-aero-info hotel-box">`;
            html += `<span class="left-date"> <strong class="flight-sm-date"> ${flightTime(selectedRentalCarDetails.pickUpDate)} </strong></span>`;
            html += `<div class="center-location"> <span><img src="/images/car-icon.png" bottom:></span></div>`;
            html += `<span class="left-date right"> <strong class="flight-sm-date"> ${flightTime(selectedRentalCarDetails.dropOffDate)} </strong></span>`;
            html += `<div class="right-edit-dropdown"></div></div></div></div><div class="chat-panel-body">`;
            html += `<p class="flight_city_name"> <span class="city">${selectedRentalCarDetails.pickUpCity}</span> ${await getCityName(selectedRentalCarDetails.pickUpCity, req.headers.cookie)} </p>`;
            html += `<p class="flight_city_name"> <span class="city">${selectedRentalCarDetails.dropOffCity}</span> ${await getCityName(selectedRentalCarDetails.dropOffCity, req.headers.cookie)} </p>`;
            html += `</div> <p class="price-tag"> <strong> ${ await watsonRoute.translate(null, "Total Price", req.session.user_name) } :</strong> ${selectedRentalCarDetails.approximate_total_fare} </p> </div>`;

            var response = { reservation_type : reservation_type, textToShow : html, selectedRentalCarDetails : selectedRentalCarDetails };
        }
        else
        {
            var html = `<p> ${ await watsonRoute.translate(null, "There is some error showing the selected room details", req.session.user_name) } </p>`;
            var response = { reservation_type : reservation_type, textToShow : html };
        }
    }

    //For town car reservaiton
    if(reservation_type === "town_car")
    {
        var selectedCar = req.body.id;
        var selectedTownCarDetails = await getSelectedTownCarDetails(selectedCar, req.headers.cookie);

        var town_car_details = selectedTownCarDetails;

        if(town_car_details)
        {
            if(town_car_details.carType == "One-Way")
            {
                var html = `<div class="chat-panel" id="town_car-left-pannel"><div class="chat-panel-header"><h3> ${ await watsonRoute.translate(null, "TOWN CAR RESERVATION DETAILS", req.session.user_name) } </h3><div class="chat-aero-info"><div class="inner-chat-aero-info hotel-box">`;
                html += `<span class="left-date"> ${moment.utc(town_car_details.pickUpTime).format('LT')} <strong class="flight-sm-date"> ${moment.utc(town_car_details.pickUpDate).format('llll').split(' ')[0]+' '+moment.utc(town_car_details.pickUpDate).format('ll')} </strong></span>`;
                html += `<div class="center-location"> <span><img src="/images/car-icon.png" bottom:></span> </div>`;
                html += `<span class="left-date right"> N/A <strong class="flight-sm-date" id="rentalCarDetails1_dropoff"> N/A </strong></span> `;
                html += `<div class="right-edit-dropdown"></div>`;
                html += `</div></div></div><div class="chat-panel-body">`;
                html += `<p> <span class="city"> ${ await watsonRoute.translate(null, "Pick-Up Address", req.session.user_name) } </span> ${town_car_details.pickUpAddress} </p>`;
                html += `<p> <span class="city"> ${ await watsonRoute.translate(null, "Drop-Off Address", req.session.user_name) } </span> ${town_car_details.dropOffAddress} </p></div> <p class="price-tag"> <strong> ${ await watsonRoute.translate(null, "Total Price", req.session.user_name) } :</strong> ${town_car_details.approximate_total_fare} $ </p> </div>`;
            }
            else if(town_car_details.carType == "Hourly")
            {
                var html = `<div class="chat-panel"><div class="chat-panel-header"><h3> ${ await watsonRoute.translate(null, "TOWN CAR RESERVATION DETAILS", req.session.user_name) } </h3><div class="chat-aero-info"><div class="inner-chat-aero-info hotel-box">`;
                html += `<span class="left-date"> ${moment.utc(town_car_details.pickUpTime).format('LT')} <strong class="flight-sm-date"> ${moment.utc(town_car_details.pickUpDate).format('llll').split(' ')[0]+' '+moment.utc(town_car_details.pickUpDate).format('ll')} </strong></span>`;
                html += `<div class="center-location"> <span><img src="/images/car-icon.png" bottom:></span> </div>`;
                html += `<span class="left-date right"> ${moment.utc(town_car_details.dropOffTime).format('LT')} <strong class="flight-sm-date" id="rentalCarDetails1_dropoff"> N/A </strong></span>`;
                html += `<div class="right-edit-dropdown"></div></div></div></div><div class="chat-panel-body">`;
                html += `<p> <span class="city">  ${ await watsonRoute.translate(null, "Pick-Up Address", ) } </span> ${town_car_details.pickUpAddress} </p></div> <p class="price-tag"> <strong> ${ await watsonRoute.translate(null, "Total Price", req.session.user_name) } :</strong> ${town_car_details.approximate_total_fare} $ </p> </div>`;
            }

            var response = { reservation_type : reservation_type, textToShow : html, selectedTownCarDetails : selectedTownCarDetails };
        }
        else
        {
            var html = `<p> ${ await watsonRoute.translate(null, "There is some error showing the selected car details", req.session.user_name) } </p>`;
            var response = { reservation_type : reservation_type, textToShow : html };
        }
    }

    res.json(response);
});

router.post('/getPNRDetails', async (req, res) => {

    if(!user_details[req.session.user_name])
    {
        user_details[req.session.user_name] = {};
    }

    if((user_details[req.session.user_name].pnr_details).length > 0)
    {
        if((user_details[req.session.user_name].pnr_details).length == 1)
        {
            var html = `<p> <span id="chat_end_name"> ${(user_details[req.session.user_name].pnr_details)[0].first_name} ${(user_details[req.session.user_name].pnr_details)[0].last_name} </span> ${ await watsonRoute.translate(null, "That's it. Wasn't that easy", req.session.user_name) }. </p> <p> ${ await watsonRoute.translate(null, "Your PNR", req.session.user_name) } # ${(user_details[req.session.user_name].pnr_details)[0].locator_id} </p> <p> ${ await watsonRoute.translate(null, "You will shortly receive a confirmation message regarding the reservations", req.session.user_name) }. </p> <p> ${ await watsonRoute.translate(null, "Hoping to see you again", req.session.user_name) }. </p> <p> ${ await watsonRoute.translate(null, "Have a safe journey", req.session.user_name) }. </p>`;
        }
        else
        {
            var html = `<p> ${ await watsonRoute.translate(null, "That's it. Wasn't that easy", req.session.user_name) }. </p> <p> ${ await watsonRoute.translate(null, "The details of the created PNRs are", req.session.user_name) } </p>`;
            for(var i = 0; i < (user_details[req.session.user_name].pnr_details).length; i++)
            {
                html += `<p> PNR # ${(user_details[req.session.user_name].pnr_details)[i].locator_id} for ${(user_details[req.session.user_name].pnr_details)[i].first_name} ${(user_details[req.session.user_name].pnr_details)[i].last_name} </p>`; 
            }
            html += `<p> ${ await watsonRoute.translate(null, "You will shortly receive a confirmation message regarding the reservations", req.session.user_name) }. </p> <p> ${ await watsonRoute.translate(null, "Hoping to see you again", req.session.user_name) }. </p> <p> ${ await watsonRoute.translate(null, "Have a safe journey", req.session.user_name) }. </p>`;
        }
        var response = {success : true, text : html };
    }
    else
    {
        var html = `<p> <span id="chat_end_name"> ${user_details[req.session.user_name].travelerInfoArray[0].FirstName} ${user_details[req.session.user_name].travelerInfoArray[0].LastName} </span> ${ await watsonRoute.translate(null, "That's it. Wasn't that easy", req.session.user_name) }. </p><p> ${ await watsonRoute.translate(null, "You will shortly receive a confirmation message regarding the reservations", req.session.user_name) }. </p> <p> ${ await watsonRoute.translate(null, "Hoping to see you again", req.session.user_name) }. </p> <p> ${ await watsonRoute.translate(null, "Have a safe journey", req.session.user_name) }. </p>`;
        var response = {success : true, text : html };
    }

    res.json(response);
});

//==================================== [Route Implementation] ===========================================//

module.exports = router;