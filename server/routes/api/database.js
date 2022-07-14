//======================================== [Dependecies] ================================================//

//Route Main Dependecies
const { request }                   =   require("express");
const express                       =   require("express");
const router                        =   express.Router();

//SQL Depedencies
const mssql                         =   require("mssql");

//current timestamp
var moment                          =   require('moment');

//Calling External APIs [Translation] Dependecies
const axios                         =   require('axios');
const { getCountryNameByAlpha2 }    =   require("country-locale-map");

//======================================== [Dependecies] ================================================//

//==================================== [Language Preference] =============================================//

var prefferedLanguage = "English";
var languageCode = "en";

//==================================== [Language Preference] =============================================//

var user_details = {};

const MSSQLconfig = {connectionLimit : 10, user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };
const sql = new mssql.ConnectionPool(MSSQLconfig);

async function executeQuery(MSSQLconfig, query)
{
    try
    {
        let queryRequested = new Promise( async function(resolve, reject){ 
            //var sql = new mssql.ConnectionPool(MSSQLconfig);

            sql.connect(async function(error)
            {
                try{
                    let sqlRequest = new mssql.Request(sql);
                    let sqlQuery = query;
                    try
                    {
                        let queryResp =  new Promise( async function(resolve, reject){ sqlRequest.query(sqlQuery, function(err, queryResult) { resolve(queryResult); })  });
                        var queryResult = await queryResp.then(function(value){ return value });
                        resolve(queryResult);
                    }
                    catch(error)
                    {
                        console.log(error);
                    }
                    if(error)
                    {
                        reject("Database connection error: " + error);
                    }
                }
                catch(error)
                {
                    console.log(error);
                }
            });
        });

        var result = await queryRequested.then(function(value){ return value });

        return result;
    }
    catch(error)
    {
        console.log(error);
    }
}

async function getCityName(cityCode, current_session)
{

    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', requestType: "getCityName", cityCode : cityCode }, session_handle_axios);
    return DBresponse.data.recordObj.City;
}

async function getHotelDetails(TravelerID, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', TravelerID : TravelerID, requestType : "getHotelDetails" }, session_handle_axios);
    if(DBresponse.data != undefined)
    {
        if(DBresponse.data.numOfRecs != undefined)
        {
            if(DBresponse.data.numOfRecs > 0)
            {
                var response = DBresponse.data;
                var record_array = response.records;
                return record_array;
            }
        }
        else
        {
            return [];
        }
    }
    else
    {
        return [];
    }
}

async function getRentalCarDetails(TravelerID, current_session)
{

    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', TravelerID : TravelerID, requestType : "getRentalCarDetails" }, session_handle_axios);
    if(DBresponse.data != undefined)
    {
        if(DBresponse.data.numOfRecs != undefined)
        {
            if(DBresponse.data.numOfRecs > 0)
            {
                var response = DBresponse.data;
                var record_array = response.records;
                return record_array;
            }
        }
        else
        {
            return [];
        }
    }
    else
    {
        return [];
    }
}

async function getTownCarDetails(TravelerID, current_session)
{

    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', TravelerID : TravelerID, requestType : "getTownCarDetails" }, session_handle_axios);
    if(DBresponse.data != undefined)
    {
        if(DBresponse.data.numOfRecs != undefined)
        {
            if(DBresponse.data.numOfRecs > 0)
            {
                var response = DBresponse.data;
                var record_array = response.records;
                return record_array;
            }
        }
        else
        {
            return [];
        }
    }
    else
    {
        return [];
    }
}

async function getRailDetails(TravelerID, current_session)
{

    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', TravelerID : TravelerID, requestType : "getRailDetails" }, session_handle_axios);
    if(DBresponse.data != undefined)
    {
        if(DBresponse.data.numOfRecs != undefined)
        {
            if(DBresponse.data.numOfRecs > 0)
            {
                var response = DBresponse.data;
                var record_array = response.records;
                return record_array;
            }
        }
        else
        {
            return [];
        }
    }
    else
    {
        return [];
    }
}

async function translateTextAPI(text, current_session)
{

    var languageCode = "en";
    let session_handle_axios = { headers: { cookie : current_session } };
    var APIResponse = await axios.post( process.env.IP + '/api/watson/tanslate', { from : "English", to : languageCode, text : text }, session_handle_axios);
    return APIResponse.data;
}

async function getRequiredData(user_id, current_session)
{

    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', requestType: "getRequiredDetails", user_id : user_id }, session_handle_axios);
    if(DBresponse.data.record)
    {
        return DBresponse.data.record;
    }
    else
    {
        return null;
    }
}

async function getAllCities(current_session)
{    

    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', requestType: "getAlCitiesNames" }, session_handle_axios);
    if(DBresponse.data.record)
    {
        return DBresponse.data.record;
    }
    else
    {
        return null;
    }
}

async function filterTravelerProfiles(array, current_session)
{  
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/sabre/bulkSearchProfiles', { profiles_to_search : array }, session_handle_axios);
    return DBresponse.data;
}

async function updateTripDtaesPreviousReservation(obj,dep_date,returndate)
{
    let keys = ['flight_details', 'hotelDetails', 'rentalCarDetails', 'townCarDetails'];
    for(let i=0;i<keys.length;i++)
    {
        if(obj[keys[i]] != undefined && obj[keys[i]] != null && obj[keys[i]] != "")
        {
            switch(keys[i]) {
                case 'flight_details':
                    for(let j=0; j<obj[keys[i]].length;j++)
                    {
                        var date = j == 0 ? dep_date : returndate;
                        if(obj[keys[i]][j].FlightDepartureDate)
                        {
                            var flight_dep_date = obj[keys[i]][j].FlightDepartureDate.split(' ');
                        }
                        else
                        {
                            //If unable to get previous date from DB, assign the current date 
                            var datetime = new Date();
                            var flight_dep_date = datetime.toISOString().slice(0,10);
                        }

                        if(obj[keys[i]][j].FlightArrivalDate)
                        {
                            var flight_arr_date = obj[keys[i]][j].FlightArrivalDate.split(' ');
                        }
                        else
                        {
                            //If unable to get previous date from DB, assign the current date 
                            var datetime = new Date();
                            var flight_arr_date = datetime.toISOString().slice(0,10);
                        }

                        obj[keys[i]][j].FlightDepartureDate = date+' '+ (flight_dep_date[1] != undefined ? flight_dep_date[1].split('.')[0]:'00:00:00');
                        obj[keys[i]][j].FlightArrivalDate = date+' '+ (flight_arr_date[1] != undefined ? flight_arr_date[1].split('.')[0]:'00:00:00');
                    }
                  break;
                case 'hotelDetails':
                        if(obj[keys[i]][0][0].HotelCheckIn)
                        {
                            var hotel_checkin_date = obj[keys[i]][0][0].HotelCheckIn.split('T');
                        }
                        else
                        {
                            var datetime = new Date();
                            var hotel_checkin_date = datetime.toISOString().slice(0,10);
                        }

                        if(obj[keys[i]][0][0].HotelCheckOut)
                        {
                            var hotel_checkouut_date = obj[keys[i]][0][0].HotelCheckOut.split('T');
                        }
                        else
                        {
                            var datetime = new Date();
                            var hotel_checkouut_date = datetime.toISOString().slice(0,10);
                        }

                        obj[keys[i]][0][0].HotelCheckIn = dep_date+'T'+(hotel_checkin_date[1] != undefined ? hotel_checkin_date[1]:'00:00:00.000Z')
                        obj[keys[i]][0][0].HotelCheckOut = returndate+'T'+(hotel_checkouut_date[1] != undefined ? hotel_checkouut_date[1]:'00:00:00.000Z')
                  break;
                case 'rentalCarDetails':

                        // let PickupDateTime = obj[keys[i]][0][0].PickupDateTime.split('T');
                        // let DropoffDateTime = obj[keys[i]][0][0].DropoffDateTime.split('T');
                        // obj[keys[i]][0][0].PickupDateTime = dep_date+'T'+(PickupDateTime[1] != undefined ? PickupDateTime[1]:'10:00:00.000Z')
                        // obj[keys[i]][0][0].DropoffDateTime = returndate+'T'+(DropoffDateTime[1] != undefined ? DropoffDateTime[1]:'10:00:00.000Z')


                        if(obj[keys[i]][0][0].PickupDateTime)
                        {
                            var PickupDateTime = obj[keys[i]][0][0].PickupDateTime.split('T');
                        }
                        else
                        {
                            var datetime = new Date();
                            var PickupDateTime = datetime.toISOString().slice(0,10);
                        }

                        if(obj[keys[i]][0][0].DropoffDateTime)
                        {
                            var DropoffDateTime = obj[keys[i]][0][0].DropoffDateTime.split('T');
                        }
                        else
                        {
                            var datetime = new Date();
                            var DropoffDateTime = datetime.toISOString().slice(0,10);
                        }
                        
                        obj[keys[i]][0][0].PickupDateTime = dep_date+'T'+(PickupDateTime[1] != undefined ? PickupDateTime[1]:'00:00:00.000Z')
                        obj[keys[i]][0][0].DropoffDateTime = returndate+'T'+(DropoffDateTime[1] != undefined ? DropoffDateTime[1]:'00:00:00.000Z')


                  break;
                default:
              }
        }
    }
    return obj;
}

async function updateCorrectCarCodes()
{
    var corectCodesArry = [
        ['AC','ACE'],
        ['AD','ADVANTAGE'],
        ['AL','ALAMO'],
        ['AO','ACO'],
        ['BV','BLUU'],
        ['DF','DRVFORCE'],
        ['DS','DISCOUNT'],
        ['EM','EUROMOBIL'],
        ['EP','EUROPCAR'],
        ['ES','EASIRENT'],
        ['ET','ENTERPRISE'],
        ['EY','ECONOMY'],
        ['EZ','EZ'],
        ['FF','FIREFLY'],
        ['FR','FIRST'],
        ['FX','FOX'],
        ['GM','GREENMOTION'],
        ['IM','EUROPCAR SA'],
        ['LL','LOCALIZA'],
        ['MG','MAGGIORE'],
        ['MO','MOVIDA'],
        ['MW','MIDWAY'],
        ['MX','MEX'],
        ['NC','NEXT'],
        ['NU','NU'],
        ['PR','PRICELESS'],
        ['RO','ROUTES'],
        ['RW','RENT A WRECK'],
        ['SV','USAVE AUTO'],
        ['SX','SIXT'],
        ['TI','TEMPEST'],
        ['UN','UNIDAS'],
        ['WF','WOODFORD'],
        ['XX','OTHER'],
        ['ZA','PAYLESS'],
        ['ZD','BUDGET'],
        ['ZE','HERTZ'],
        ['ZI','AVIS'],
        ['ZL','NATIONAL'],
        ['ZR','DOLLAR'],
        ['ZT','THRIFTY'],
        ['1C','CAR TRAWLER']
    ];

    for(let i in corectCodesArry)
    {
        let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };
            let query=`
            UPDATE Merck_EmpItinData1  
            SET correct_car_code = '${corectCodesArry[i][0]}'
            WHERE Company like '%${corectCodesArry[i][1]}%'
            `;
            var receivedData =  await executeQuery(db_config, query);
    }
}


//==================================== [Route Implementation] ===========================================//

router.post('/changeLanguage', async (req, res) => {
    var new_language = req.body.language;
    languageCode = req.body.languageCode;
    prefferedLanguage = new_language;
    var response = { status : 1 };
    res.json(response);
});

router.post('/query', async (req, res) => {

    if(!user_details[req.session.user_name])
    {
        user_details[req.session.user_name] = {};
    }

    queryAction = req.body.queryAction;
    requestType = req.body.requestType;

    if(queryAction && queryAction != "" && typeof queryAction === "string")
    {
        if(queryAction === "FetchData" || queryAction === "InsertData")
        {
            if(queryAction === "FetchData")
            {
                if(requestType === "getUserCountry")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var userID = req.body.userID;

                    if(userID != undefined && userID != "")
                    {
                        try
                        {
                            let query = `SELECT [ez_Lk_Country].[ez_country_abbr], [ez_key].[ez_company_id] FROM [ez_key] INNER JOIN [ez_Lk_Country] ON [ez_key].[ez_country_id] = [ez_Lk_Country].[ez_country_id] WHERE [ez_key].[ez_user_id] = ${userID}`;
                            var receivedData =  await executeQuery(db_config, query);
                            if(receivedData != undefined && receivedData != "")
                            {
                                respObj = { resultFor : requestType, numOfRecs : (receivedData.recordsets[0]).length , records : receivedData.recordsets };
                            }
                        }
                        catch(error)
                        {
                            var respObj = { status : 404, message : "Cannot find the country of required user." };
                        }
                    }
                    else
                    {
                        var respObj = { status : 404, message : "Cannot find the country of required user." };
                    }
                }

                if(requestType === "getUserPreferedLanguage")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var country_code   =   req.body.country_code;
                    var company_id     =   req.body.company_id;

                    if(country_code && company_id)
                    {
                        try
                        {
                            let query = `SELECT * FROM Ez_Company_Location WHERE ez_company_id = ${company_id} AND ez_loc_country_default = '${country_code}'`;
                            var receivedData =  await executeQuery(db_config, query);
                            if(receivedData != undefined && receivedData != "")
                            {
                                respObj = { resultFor : requestType, numOfRecs : (receivedData.recordsets[0]).length , records : receivedData.recordset };
                            }
                        }
                        catch(error)
                        {
                            var respObj = { status : 404, message : "Cannot find the country of required user." };
                        }
                    }
                    else
                    {
                        var respObj = { status : 404, message : "Cannot find the country of required user." };
                    }
                }

                if(requestType === "getPreviousBooking")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var userID = req.body.requestedID;
                    
                    if(userID != 0)
                    {
                        try
                        {
                            let query = `SELECT [dup_EzMailFlights].[FlightID], [dup_EZMailTravelers].[TravelerID], [dup_EZMailTravelers].[FirstName], [dup_EZMailTravelers].[LastName], [dup_EZMailTravelers].[TripPurpose], [dup_EzMailFlights].[FlightDepartureCity], [dup_EzMailFlights].[FlightDepartureDate], [dup_EzMailFlights].[FlightArrivalCity], [dup_EzMailFlights].[FlightTime], [dup_EzMailFlights].[TravelTypeID] FROM [dup_EZMailTravelers]  RIGHT OUTER JOIN  [dup_EzMailFlights] ON [dup_EZMailTravelers].[TravelerID] = [dup_EzMailFlights].[TravelerID] WHERE [dup_EZMailTravelers].[ez_user_id_Traveler] = ${userID} AND [dup_EzMailFlights].[FlightSegmentNumber] = 1 AND NumberInGroup = 1`;
                            var receivedData =  await executeQuery(db_config, query);
                            if(receivedData != undefined && receivedData != "")
                            {
                                respObj = { resultFor : requestType, numOfRecs : (receivedData.recordsets[0]).length , records : receivedData.recordsets };
                            }
                        }
                        catch(error)
                        {
                            console.log(error);
                        }
                    }
                    else
                    {
                        respObj = { resultFor : requestType, numOfRecs : 0, result : "Requested Traveller ID not found in the api request." };
                    }   
                
                }

                if(requestType === "getSpecialRequest")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var travelerID = req.body.travelerID;
                    let query = `SELECT SpecialRequests FROM [dup_EZMailTravelers] WHERE TravelerID = ${travelerID}`;
                    var receivedData =  await executeQuery(db_config, query);
                    respObj = { resultFor : requestType, numOfRecs : (receivedData.recordsets[0]).length , records : receivedData.recordsets };
                }

                if(requestType === "getTripPurpose")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var travelerID = req.body.travelerID;
                    let query = `SELECT TripPurposeID FROM [dup_EZMailTravelers] WHERE TravelerID = ${travelerID}`;
                    var receivedData =  await executeQuery(db_config, query);
                    respObj = { resultFor : requestType, numOfRecs : (receivedData.recordsets[0]).length , records : receivedData.recordsets };
                }

                if(requestType === "getFlightDetails")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var TravelerID = req.body.TravelerID;
                    
                    if(TravelerID != 0)
                    {
                        let query = `SELECT [dup_EzMailFlights].[FlightDepartureCity], [dup_EzMailFlights].[FlightArrivalCity], [dup_EzMailFlights].[FlightTime], [dup_EzMailFlights].[TravelTypeID], [dup_EzMailFlights].[FlightDepartureDate], [dup_EZMailTravelers].[GroupID] FROM  [dup_EzMailFlights] INNER JOIN [dup_EZMailTravelers] ON [dup_EzMailFlights].[TravelerID] = [dup_EZMailTravelers].[TravelerID] WHERE [dup_EZMailTravelers].[TravelerID] = ${TravelerID}`;
                        var receivedData =  await executeQuery(db_config, query);
                        respObj = { resultFor : requestType, numOfRecs : (receivedData.recordsets[0]).length , records : receivedData.recordsets };
                    }
                }

                if(requestType === "getHotelDetails")
                {
                    // let db_config = { user: "atg-admin", password: "Travel@123", server: "sql-looker-db.database.windows.net", database: "Looker_live", options: { enableArithAbort: true } };

                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };
                    var TravelerID = req.body.TravelerID;
                    
                    if(TravelerID != 0)
                    {
                        let query=`select M.HOTELNAM as HotelName,M.metro as HotelState, M.roomtype, M.datein as HotelCheckIn,M.checkout as HotelCheckOut from Merck_EmpItinData1 M WHERE M.spend_type = 'Hotel' AND M.reckey='${TravelerID}'`;
                        var receivedData =  await executeQuery(db_config, query);
                        respObj = { resultFor : requestType, numOfRecs : (receivedData.recordsets[0]).length , records : receivedData.recordsets };
                    }
                }

                if(requestType === "getRentalCarDetails")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };
                    // let db_config = { user: "atg-admin", password: "Travel@123", server: "sql-looker-db.database.windows.net", database: "Looker_live", options: { enableArithAbort: true } };

                    var TravelerID = req.body.TravelerID;
                    
                    if(TravelerID != 0)
                    {
                        let query = ` select M.autocity as DropoffCity, M.citycode as DropoffCityCode, M.autocity as PickupCity, M.citycode as PickupCityCode, M.rentdate as PickupDateTime, M.returndate as DropoffDateTime,M.correct_car_code as CarVendor, M.cartype, M.Company from Merck_EmpItinData1 M WHERE spend_type = 'Car' AND M.reckey ='${TravelerID}'`;

                        var receivedData =  await executeQuery(db_config, query);
                        if(receivedData)
                        {
                            respObj = { resultFor : requestType, numOfRecs : (receivedData.recordsets[0]).length , records : receivedData.recordsets };
                        }
                    }
                }

                if(requestType === "getTownCarDetails")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };
                    // let db_config = { user: "atg-admin", password: "Travel@123", server: "sql-looker-db.database.windows.net", database: "Looker_live", options: { enableArithAbort: true } };

                    var TravelerID = req.body.TravelerID;
                    
                    if(TravelerID != 0)
                    {
                        let query = `
                        select M.autocity as DropoffCity,M.autocity as PickupCity, M.rentdate as PickupDateTime,
                        M.returndate as DropoffDateTime from Merck_EmpItinData1 M WHERE spend_type = 'Car' 
                        AND M.reckey = '${TravelerID}'
                        `;
                        var receivedData =  await executeQuery(db_config, query);
                        respObj = { resultFor : requestType, numOfRecs : (receivedData.recordsets[0]).length , records : receivedData.recordsets };
                    }
                }

                if(requestType === "getRailDetails")
                {
                    var TravelerID = req.body.TravelerID;

                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };
                    
                    if(TravelerID != 0)
                    {
                        let query = `SELECT [TravelTypeID], [RailDepartureCity], [RailDepartureDate], [RailArrivalCity], [RailTime], [RailPreferredTime] FROM dup_EZMailRails WHERE TravelerID = ${TravelerID}`;
                        var receivedData =  await executeQuery(db_config, query);
                        respObj = { resultFor : requestType, numOfRecs : (receivedData.recordsets[0]).length , records : receivedData.recordsets };
                    }
                }

                if(requestType === "0previousBookingData")
                {
                    var previousBookingID = req.body.requestedID;

                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    if(previousBookingID)
                    {
                        let query = "SELECT [FlightDepartureCity], [FlightArrivalCity], [FlightTime], [TravelTypeID] FROM [dup_EzMailFlights] WHERE TravelerID = " + previousBookingID;
                        var receivedData =  await executeQuery(db_config, query);
                        respObj = { records : receivedData.recordsets };
                    }
                }

                if(requestType === "previousFlightType")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var TravelerID = req.body.requestedID;

                    if(TravelerID)
                    {
                        let query = `SELECT [TravelTypeID] FROM [dup_EzMailFlights] WHERE TravelerID = ${TravelerID}`;
                        var receivedData =  await executeQuery(db_config, query);
                        respObj = { records : receivedData.recordsets };
                    }
                }

                if(requestType === "previousBookingDataRound")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var previousBookingID = req.body.requestedID;
                    
                    if(previousBookingID)
                    {
                        let query = "SELECT [FlightDepartureCity], [FlightArrivalCity], [FlightTime], [TravelTypeID], [FlightSegmentNumber] FROM [dup_EzMailFlights] WHERE TravelerID = " + previousBookingID;
                        var receivedData =  await executeQuery(db_config, query);
                        respObj = { records : receivedData.recordsets };
                    }
                }

                if(requestType === "getCountriesList")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    let query = "SELECT [ez_country] FROM  [ez_lk_country]";
                    var receivedData =  await executeQuery(db_config, query);
                    respObj = { resultFor : requestType, numOfRecs : (receivedData.recordsets[0]).length , records : receivedData.recordsets };
                }

                if(requestType === "getCitiesList")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };
                    
                    //needed to be change
                    let query = "SELECT [ez_country] FROM  [ez_lk_country]";
                    var receivedData =  await executeQuery(db_config, query);
                    respObj = { resultFor : requestType, numOfRecs : (receivedData.recordsets[0]).length , records : receivedData.recordsets };
                }

                if(requestType === "GetAirportDetails")
                {

                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    let query = "SELECT TOP(1) [Name], [IATA], [City], [Country] FROM EZMailAirportsIATA24";
                    
                    var receivedData =  await executeQuery(db_config, query);
                    
                    if(receivedData != undefined)
                    {
                        respObj = { resultFor : requestType, numOfRecs : (receivedData.recordsets[0]).length , records : receivedData.recordsets };
                    }
                }

                if(requestType === "getPersonalInfo")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var userID = req.body.requestedID;
                    let query = "SELECT [Email], [Phone] FROM [dup_EZMailTravelers] WHERE  [ez_user_id_Traveler] = " + userID;
                    var receivedData =  await executeQuery(db_config, query);
                    var email = receivedData['recordset'][0].Email;
                    var phone = receivedData['recordset'][0].Phone;
                    respObj = { resultFor : requestType, numOfRecs : (receivedData.recordsets[0]).length , email : email, phone : phone };
                }

                if(requestType === "getCountryCode")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var userID = req.body.requestedID;
                    let query = `SELECT ez_country_id FROM [EZ_Key] WHERE ez_user_id = ${userID}`;
                    var receivedData =  await executeQuery(db_config, query);

                    if(receivedData === null || receivedData === undefined)
                    {
                        var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', requestedID : userID, requestType : "getCountryCode" });
                        receivedData =  DBresponse.data;
                    }
                    else
                    {
                        respObj = { resultFor : requestType, numOfRecs : (receivedData.recordsets[0]).length , records : receivedData.recordsets };
                    }
                }

                if(requestType === "getTravelerInfo")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var userID = req.body.userID;
                    let query = `SELECT ez_fname, ez_lname, ez_email  FROM ez_key WHERE ez_user_id = ${userID}`;
                    var receivedData =  await executeQuery(db_config, query);
                    respObj = { resultFor : requestType, record : receivedData.recordset[0] };
                }

                if(requestType === "legalEntity")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    let query = `SELECT ez_legal_entity_value FROM EZ_LegalEntity`;
                    var receivedData =  await executeQuery(db_config, query);
                    respObj = { resultFor : requestType, numOfRecs : (receivedData.recordsets[0]).length , records : receivedData.recordsets };
                }

                if(requestType === "department")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    let query = `SELECT ez_business_unit_value FROM EZ_BusinessUnit`;
                    var receivedData =  await executeQuery(db_config, query);
                    respObj = { resultFor : requestType, numOfRecs : (receivedData.recordsets[0]).length , records : receivedData.recordsets };
                }

                if(requestType === "division")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    let query = `SELECT ez_division_value FROM EZ_Division`;
                    var receivedData =  await executeQuery(db_config, query);
                    respObj = { resultFor : requestType, numOfRecs : (receivedData.recordsets[0]).length , records : receivedData.recordsets };
                }

                if(requestType === "departmentID")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };
                    
                    let query = `SELECT ez_department_code_value FROM EZ_DepartmentCode`;
                    var receivedData =  await executeQuery(db_config, query);
                    respObj = { resultFor : requestType, numOfRecs : (receivedData.recordsets[0]).length , records : receivedData.recordsets };
                }

                if(requestType === "getTravelEventID")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var companyID   =   req.body.companyID;
                    var countryID   =   req.body.countryID;

                    if(companyID != "" && companyID != null && companyID != undefined)
                    {
                        if(countryID != "" && countryID != null && countryID != undefined)
                        {
                            let query = `SELECT TOP(1) TravelEventID FROM EZMailTravelEvents WHERE ez_company_id = '${companyID}' AND ez_country_id = '${countryID}'`;
                            var receivedData =  await executeQuery(db_config, query);

                            if(receivedData != "" && receivedData != undefined && receivedData != null)
                            {
                                respObj = { resultFor : requestType, numOfRecs : (receivedData.recordsets[0]).length , records : receivedData.recordsets };
                            }
                            else
                            {
                                respObj = { resultFor : requestType, numOfRecs : 0 , records : null };
                            }

                        }
                        else
                        {
                            respObj = { resultFor : requestType, numOfRecs : 0 , records : null };
                        }
                    }
                    else
                    {
                        respObj = { resultFor : requestType, numOfRecs : 0 , records : null };
                    }
                    
                }

                if(requestType === "getLatestFormID")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    let query = `SELECT IDENT_CURRENT('dup_EZMailTravelers')`;
                    var receivedData =  await executeQuery(db_config, query);
                    respObj = { resultFor : requestType, numOfRecs : (receivedData.recordsets[0]).length , records : receivedData.recordsets };
                }

                if(requestType === "checkBookingAllowance")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var countryID = req.body.countryID;
                    var companyID = req.body.companyID;
                    var requiredMean = req.body.bookingMean;

                    let query = `SELECT TOP(1) FormTypesOfTravel FROM  EZMailTravelEvents  WHERE  ez_company_id = ${companyID} AND ez_country_id = ${countryID}`;
                    var receivedData =  await executeQuery(db_config, query);
                    var resultArray = receivedData.recordsets[0][0].FormTypesOfTravel;
                    var result = resultArray.search(requiredMean);

                    if(result > 1)
                    {
                        respObj = { resultFor : requestType, result : 1 };
                    }
                    else
                    {
                        respObj = { resultFor : requestType, result : 0 };
                    }
                }

                if(requestType === "getTravelerData")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var recordID = req.body.recordID;
                    var keyArray = req.body.keyArray;

                    let query = `SELECT `
                    for (var i = 0; i < keyArray.length; i++)
                    {
                        query += `"${keyArray[i]}", `;
                    }
                    query += `"GroupID" FROM [dup_EZMailTravelers] WHERE TravelerID = ${recordID}`;

                    var queryResult =  await executeQuery(db_config, query);
                    var respObj = { recordObj : queryResult.recordset[0]};
                }

                if(requestType === "getCityName")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var cityCode = req.body.cityCode;
                    let query = `SELECT TOP(1) City FROM EZMailAirportsIATA24 WHERE IATA = '${cityCode}'`;
                    var queryResult =  await executeQuery(db_config, query);
                    if(queryResult != undefined)
                    {
                        var respObj = { recordObj : queryResult.recordset[0]};
                    }
                    
                }

                if(requestType === "getRecords")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var id = req.body.travelerID;
                    var mode = req.body.recordMode;

                    if(mode === "hotel")
                    {
                        var query = `SELECT * FROM dup_EZMailHotels WHERE TravelerID = ${id}`;
                        var queryResult =  await executeQuery(db_config, query);
                        var respObj = { numOfRecs : queryResult.rowsAffected[0] };
                    }

                    if(mode === "rentalCar")
                    {
                        var query = `SELECT * FROM dup_EZMailCars WHERE TravelerID = ${id}`;
                        var queryResult = await executeQuery(db_config, query);
                        var respObj = { numOfRecs : queryResult.rowsAffected[0] };
                    }

                    if(mode === "towncar")
                    {
                        var query = `SELECT * FROM dup_EZMailTownCars WHERE TravelerID = ${id}`;
                        var queryResult = await executeQuery(db_config, query);
                        var respObj = { numOfRecs : queryResult.rowsAffected[0] };
                    }

                    if(mode === "rail")
                    {
                        var query = `SELECT * FROM dup_EZMailRails WHERE TravelerID = ${id}`;
                        var queryResult = await executeQuery(db_config, query);
                        var numOfRecs = queryResult.rowsAffected[0];
                        if(numOfRecs === 0)
                        {
                            var respObj = { numOfRecs : numOfRecs };
                        }
                        else
                        {
                            var respObj = { numOfRecs : queryResult.rowsAffected[0], railType : queryResult.recordset[0].TravelTypeID  };
                        }
                    }
                }

                if(requestType === "getCityCode")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var to_remove = "\\N";
                    var cityName = req.body.cityName;
                    let query = `SELECT TOP(1) IATA FROM EZMailAirportsIATA24 WHERE City = '${cityName}' AND IATA != '${to_remove}'`;
                    var queryResult =  await executeQuery(db_config, query);
                    
                    while(queryResult === undefined)
                    {
                        var queryResult =  await executeQuery(db_config ,query);                        
                    }
                    var respObj = { recordObj : queryResult.recordset[0]};
                }

                if(requestType === "getTravelerDetails")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var travelerID = req.body.TravelerID;
                    var GroupID = req.body.GroupID;

                    if(GroupID === null || GroupID === "null")
                    {
                        var query = `SELECT FirstName, LastName, Email, Phone, EmployeeNumber, CMGNumber, TravelEventID, TripPurposeID, ez_user_id_SubmittedBy, ez_user_id_Traveler, CustomField1, Department, Division, DepartmentID FROM dup_EZMailTravelers WHERE TravelerID =  ${travelerID}`;
                    }
                    else 
                    {
                        var query = `SELECT FirstName, LastName, Email, Phone, EmployeeNumber, CMGNumber, TravelEventID, TripPurposeID, ez_user_id_SubmittedBy, ez_user_id_Traveler, CustomField1, Department, Division, DepartmentID FROM dup_EZMailTravelers WHERE GroupID = '${GroupID}'`;
                    }
                    var receivedData =  await executeQuery(db_config, query);
                    respObj = { resultFor : requestType, record : receivedData.recordsets[0] };
                }

                if(requestType === "getSepcialRequest")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var travelerID = req.body.TravelerID;
                    let query = `SELECT SpecialRequests FROM dup_EZMailTravelers WHERE TravelerID = '${travelerID}'`;
                    var receivedData =  await executeQuery(db_config, query);
                    respObj = { resultFor : requestType, record : receivedData.recordsets[0] };
                }

                if(requestType === "getTravelerType")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var TravelerID = req.body.TravelerID;
                    let query = `SELECT GroupID FROM dup_EZMailTravelers WHERE TravelerID = ${TravelerID}`;
                    var queryResult =  await executeQuery(db_config, query);
                    var respObj = { recordObj : queryResult.recordset[0]};
                }

                if(requestType === "getTripPurposeID")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var travelerID = req.body.TravelerID;
                    let query = `SELECT TripPurposeID FROM dup_EZMailTravelers WHERE TravelerID = '${travelerID}'`;
                    var receivedData =  await executeQuery(db_config, query);
                    respObj = { resultFor : requestType, record : receivedData.recordsets[0] };
                }

                if(requestType === "getUserEmailByID")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var userID = req.body.userID;
                    let query = `SELECT ez_email FROM ez_key WHERE ez_user_id = '${userID}'`;
                    var receivedData =  await executeQuery(db_config, query);
                    if(receivedData != undefined && receivedData != "" )
                    {
                        respObj = { resultFor : requestType, record : receivedData.recordsets[0] };
                    }
                    else
                    {
                        respObj = { resultFor : requestType, record : null };
                    }
                    
                }

                if(requestType === "getReservationTypesDetails")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var travelerID = req.body.travelerID;
                    var reservationDetailsArray = [];
                    
                    //For checking flight details
                    var query0 = `SELECT * FROM dup_EzMailFlights WHERE TravelerID = ${travelerID}`;
                    var receivedData0 =  await executeQuery(db_config, query0);
                    if(receivedData0 != undefined)
                    {
                        var records = receivedData0.recordset;
                        if(records.length != 0)
                        {
                            reservationDetailsArray.push("flight");
                        }
                    }

                    //For checking hotel details
                    var query1 = `SELECT * FROM dup_EZMailHotels WHERE TravelerID = ${travelerID}`;
                    var receivedData1 =  await executeQuery(db_config, query1);
                    if(receivedData1 != undefined)
                    {
                        var records = receivedData1.recordset;
                        if(records.length != 0)
                        {
                            reservationDetailsArray.push("hotel");
                        }
                    }
                    
                    //For checking rental car details
                    var query2 = `Select * FROM dup_EZMailCars WHERE TravelerID = ${travelerID}`;
                    var receivedData2 =  await executeQuery(db_config, query2);
                    if(receivedData2 != undefined)
                    {
                        var records = receivedData2.recordset;
                        if(records.length != 0)
                        {
                            reservationDetailsArray.push("rental_car");
                        }
                    }

                    //For checking town car details
                    var query3 = `SELECT * FROM dup_EZMailTownCars WHERE TravelerID = ${travelerID}`;
                    var receivedData3 =  await executeQuery(db_config, query3);
                    if(receivedData3 != undefined)
                    {
                        var records = receivedData3.recordset;
                        if(records.length != 0)
                        {
                            reservationDetailsArray.push("town_car");
                        }
                    }

                    //For checking rail reservation details
                    var query4 = `SELECT * FROM dup_EZMailRails WHERE TravelerID = ${travelerID}`;
                    var receivedData4 =  await executeQuery(db_config, query4);
                    if(receivedData4 != undefined)
                    {
                        var records = receivedData4.recordset;
                        if(records.length != 0)
                        {
                            reservationDetailsArray.push("rail");
                        }
                    }

                    respObj = { resultFor : requestType, record_array : reservationDetailsArray };
                }

                if(requestType === "getSeats")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var GroupID = req.body.GroupID;
                    let query =  `SELECT COUNT(*) AS seats FROM [dup_EZMailTravelers] WHERE GroupID = '${GroupID}'`;
                    var receivedData =  await executeQuery(db_config, query);
                    if(receivedData != undefined)
                    {
                        respObj = { resultFor : requestType, record : receivedData.recordsets[0][0].seats };
                    }
                }

                if(requestType === "checkPreviousFlights")
                {

                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };
                    var destination_city = req.body.destination_city;
                    var emp_id = req.body.emp_id; 
                    var userID = req.body.userID;
                    var dep_date = req.body.dep_date;
                    var return_date = req.body.return_date;

                    user_details[req.session.user_name].main_data = {};

                    if( destination_city )
                    {
                        if( emp_id )
                        {
                            let traveler_most_frequent = `
                            ; WITH CTE AS
                            ( 
                                SELECT
                                    LR_1.RECKEY,
                                    MAX(RDEPDATE) as DEP_DATE,
                                    ( SELECT TOP ( 1 ) LR_2.ORIGIN FROM LegRouting LR_2 WHERE LR_2.RECKEY = LR_1.RECKEY ORDER BY LR_2.seqno ASC ) AS ORIGIN,
                                    ( SELECT TOP ( 1 ) LR_3.DESTINAT FROM LegRouting LR_3 WHERE LR_3.RECKEY = LR_1.RECKEY ORDER BY LR_3.seqno DESC ) AS DESTINAT,
                                    ( SELECT COUNT( * ) FROM LegRouting LR_5 WHERE LR_5.RECKEY = LR_1.RECKEY  ) AS TOTAL_COUNT
                                FROM
                                    LegRouting LR_1 WITH ( nolock )
                                WHERE
                                    DESTINAT = '${destination_city}'		
                                GROUP BY
                                    LR_1.RECKEY
                            )
                            ,
                            CTE1 AS
                            (
                                SELECT 
                                    RECKEY,DEP_DATE,ORIGIN,DESTINAT,TOTAL_COUNT
                                FROM
                                    CTE
                                WHERE
                                    ORIGIN <> '${destination_city}'
                                AND
                                    TOTAL_COUNT <= 2	
                            )
                            ,
                            CTE2 AS 
                            (
                                SELECT TOP
                                    ( 1 ) RECKEY,DEP_DATE,ORIGIN,DESTINAT,
                                    ROW_NUMBER ( ) OVER ( Partition BY ORIGIN,DESTINAT ORDER BY DEP_DATE ) AS Row_Number 
                                FROM
                                    CTE1
                                ORDER BY
                                    Row_Number DESC 
                            )
                            ,
                            CTE3 AS 
                            (
                                SELECT DISTINCT
                                LR.reckey,
                                AR_OCty.City AS FlightDepartureCity,
                                AR_dCty.City AS FlightArrivalCity,
                                AR.airline_name,
                                AR.airline_code,
                                LR.rarrdttim AS FlightArrivalDate,
                                LR.rdepdttim AS FlightDepartureDate,
                                LR.origin,
                                LR.destinat,
                                LR.class, 
                                LR.seqno
                            FROM
                                LegRouting LR WITH ( nolock )
                                INNER JOIN AirportDatalooker AR_OCty WITH ( nolock ) ON AR_OCty.IATA = LR.origin
                                INNER JOIN AirportDatalooker AR_dCty WITH ( nolock ) ON AR_dCty.IATA = LR.destinat
                                INNER JOIN newAirLineData AR WITH ( nolock ) ON AR.airline_code = LR.airline 
                            WHERE
                                LR.reckey = ( SELECT reckey FROM cte2 )
                            )

                            SELECT MAX ( reckey ) AS reckey, MAX(airline_code) AS airline_code, FlightDepartureCity, FlightArrivalCity, MAX ( airline_name ) AS airline_name, MIN ( FlightArrivalDate ) AS FlightArrivalDate, MIN ( FlightDepartureDate ) AS FlightDepartureDate, origin, destinat, MAX ( class ) AS class
                            FROM 
                                CTE3	
                            GROUP BY
                                FlightDepartureCity,FlightArrivalCity,origin,destinat
                            ORDER BY
                                MIN(FlightArrivalDate) ASC
                            `;

                            var traveler_most_frequent_result =  await executeQuery(db_config, traveler_most_frequent);

                            if(traveler_most_frequent_result != null && traveler_most_frequent_result != undefined)
                            {
                                var record_array = traveler_most_frequent_result.recordset;
                                if(record_array.length != 0)
                                {
                                    var traveler_most_frequent_obj = {};
                                    var reckey = record_array[0].reckey;

                                    traveler_most_frequent_obj['flight_details']    =   record_array;
                                    traveler_most_frequent_obj['hotelDetails']      =   await getHotelDetails(reckey, req.headers.cookie);
                                    traveler_most_frequent_obj['rentalCarDetails']  =   await getRentalCarDetails(reckey, req.headers.cookie);
                                    traveler_most_frequent_obj['townCarDetails']    =   await getTownCarDetails(reckey, req.headers.cookie);
                                    traveler_most_frequent_obj['railDetails']       =   await getRailDetails(reckey, req.headers.cookie);
                                    
                                    user_details[req.session.user_name].main_data['traveler_most_frequent'] = await updateTripDtaesPreviousReservation(traveler_most_frequent_obj,dep_date,return_date);
                                }
                            }

                            //Travelers Most Recent
                            let traveler_most_recent = `
                            ; WITH CTE AS (
                                SELECT
                                    LR_1.RECKEY,
                                    LR_1.rdepdate AS DEP_DATE,
                                    ( SELECT TOP ( 1 ) LR_2.ORIGIN FROM LegRouting LR_2 WHERE LR_2.RECKEY = LR_1.RECKEY ORDER BY LR_2.legcntr ASC ) AS ORIGIN,
                                    ( SELECT TOP ( 1 ) LR_3.DESTINAT FROM LegRouting LR_3 WHERE LR_3.RECKEY = LR_1.RECKEY ORDER BY LR_3.legcntr DESC ) AS DESTINAT,
                                    ( SELECT COUNT( * ) FROM LegRouting LR_4 WHERE LR_4.RECKEY = LR_1.RECKEY ) AS TOTAL_COUNT 
                                FROM
                                    LegRouting LR_1 
                                WHERE
                                    LR_1.DESTINAT = '${destination_city}' 
                                GROUP BY
                                    LR_1.RECKEY,
                                    LR_1.rdepdate 
                                ),
                                CTE1 AS ( SELECT TOP ( 1 ) RECKEY, ORIGIN, DESTINAT, DEP_DATE FROM CTE WHERE ORIGIN <> '${destination_city}' AND TOTAL_COUNT <= 2 ORDER BY DEP_DATE DESC ) SELECT DISTINCT
                                LR.reckey,
                                AR_OCty.City AS FlightDepartureCity,
                                AR_dCty.City AS FlightArrivalCity,
                                AR.airline_name,
                                AR.airline_code,
                                LR.rarrdttim AS FlightArrivalDate,
                                LR.rdepdttim AS FlightDepartureDate,
                                LR.origin,
                                LR.destinat,
                                LR.class,
                                LR.legcntr 
                            FROM
                                LegRouting LR
                                INNER JOIN AirportDatalooker AR_OCty WITH ( nolock ) ON AR_OCty.IATA = LR.origin
                                INNER JOIN AirportDatalooker AR_dCty WITH ( nolock ) ON AR_dCty.IATA = LR.destinat
                                INNER JOIN newAirLineData AR WITH ( nolock ) ON AR.airline_code = LR.airline 
                            WHERE
                                LR.RECKEY = ( SELECT RECKEY FROM CTE1 ) 
                            ORDER BY
                                LR.legcntr ASC                             
                            `;  
                                
                            traveler_most_recent_result = await executeQuery(db_config, traveler_most_recent);
                            
                            if(traveler_most_recent_result != null && traveler_most_recent_result != undefined)
                            {
                                var record_array = traveler_most_recent_result.recordset;
                                if(record_array.length != 0)
                                {
                                    var traveler_most_recent_obj = {};
                                    var reckey = record_array[0].reckey;

                                    traveler_most_recent_obj['flight_details']    =   record_array;
                                    traveler_most_recent_obj['hotelDetails']      =   await getHotelDetails(reckey, req.headers.cookie);
                                    traveler_most_recent_obj['rentalCarDetails']  =   await getRentalCarDetails(reckey, req.headers.cookie);
                                    traveler_most_recent_obj['townCarDetails']    =   await getTownCarDetails(reckey, req.headers.cookie);
                                    traveler_most_recent_obj['railDetails']       =   await getRailDetails(reckey, req.headers.cookie);
                                    
                                    user_details[req.session.user_name].main_data['traveler_most_recent'] = await updateTripDtaesPreviousReservation(traveler_most_recent_obj,dep_date,return_date);
                                }
                            }

                            //Companys Most Frequent
                            let company_most_frequent = `
                            ; WITH CTE AS
                            ( 
                                SELECT
                                    LR_1.RECKEY,
                                    MAX(RDEPDATE) as DEP_DATE,
                                    ( SELECT TOP ( 1 ) LR_2.ORIGIN FROM LegRouting LR_2 WHERE LR_2.RECKEY = LR_1.RECKEY ORDER BY LR_2.seqno ASC ) AS ORIGIN,
                                    ( SELECT TOP ( 1 ) LR_3.DESTINAT FROM LegRouting LR_3 WHERE LR_3.RECKEY = LR_1.RECKEY ORDER BY LR_3.seqno DESC ) AS DESTINAT,
                                    ( SELECT COUNT( * ) FROM LegRouting LR_5 WHERE LR_5.RECKEY = LR_1.RECKEY  ) AS TOTAL_COUNT
                                FROM
                                    LegRouting LR_1 WITH ( nolock )
                                WHERE
                                    DESTINAT = '${destination_city}'		
                                GROUP BY
                                    LR_1.RECKEY
                            )
                            ,
                            CTE1 AS
                            (
                                SELECT 
                                    RECKEY,DEP_DATE,ORIGIN,DESTINAT,TOTAL_COUNT
                                FROM
                                    CTE
                                WHERE
                                    ORIGIN <> '${destination_city}'
                                AND
                                    TOTAL_COUNT <= 2	
                            )
                            ,
                            CTE2 AS 
                            (
                                SELECT TOP
                                    ( 1 ) RECKEY,DEP_DATE,ORIGIN,DESTINAT,
                                    ROW_NUMBER ( ) OVER ( Partition BY ORIGIN,DESTINAT ORDER BY DEP_DATE ) AS Row_Number 
                                FROM
                                    CTE1
                                ORDER BY
                                    Row_Number DESC 
                            )
                            ,
                            CTE3 AS 
                            (
                                SELECT DISTINCT
                                LR.reckey,
                                AR_OCty.City AS FlightDepartureCity,
                                AR_dCty.City AS FlightArrivalCity,
                                AR.airline_name,
                                AR.airline_code,
                                LR.rarrdttim AS FlightArrivalDate,
                                LR.rdepdttim AS FlightDepartureDate,
                                LR.origin,
                                LR.destinat,
                                LR.class, 
                                LR.seqno
                            FROM
                                LegRouting LR WITH ( nolock )
                                INNER JOIN AirportDatalooker AR_OCty WITH ( nolock ) ON AR_OCty.IATA = LR.origin
                                INNER JOIN AirportDatalooker AR_dCty WITH ( nolock ) ON AR_dCty.IATA = LR.destinat
                                INNER JOIN newAirLineData AR WITH ( nolock ) ON AR.airline_code = LR.airline 
                            WHERE
                                LR.reckey = ( SELECT reckey FROM cte2 )
                            )

                            SELECT MAX ( reckey ) AS reckey, MAX(airline_code) AS airline_code, FlightDepartureCity, FlightArrivalCity, MAX ( airline_name ) AS airline_name, MIN ( FlightArrivalDate ) AS FlightArrivalDate, MIN ( FlightDepartureDate ) AS FlightDepartureDate, origin, destinat, MAX ( class ) AS class
                            FROM 
                                CTE3	
                            GROUP BY
                                FlightDepartureCity,FlightArrivalCity,origin,destinat
                            ORDER BY
                                MIN(FlightArrivalDate) ASC
                            `;
                            var company_most_frequent_result =  await executeQuery(db_config, company_most_frequent);
                            
                            if(company_most_frequent_result != null && company_most_frequent_result != undefined)
                            {
                                var record_array = company_most_frequent_result.recordset;
                                if(record_array.length != 0)
                                {
                                    var company_most_frequent_obj = {};
                                    //var traveler_id = record_array[0].TravelerID;
                                    var reckey = record_array[0].reckey;
                                    company_most_frequent_obj['flight_details']    =   record_array;
                                    company_most_frequent_obj['hotelDetails']      =   await getHotelDetails(reckey, req.headers.cookie);
                                    company_most_frequent_obj['rentalCarDetails']  =   await getRentalCarDetails(reckey, req.headers.cookie);
                                    company_most_frequent_obj['townCarDetails']    =   await getTownCarDetails(reckey, req.headers.cookie);
                                    company_most_frequent_obj['railDetails']       =   await getRailDetails(reckey, req.headers.cookie);
                                    
                                    user_details[req.session.user_name].main_data['company_most_frequent'] = await updateTripDtaesPreviousReservation(company_most_frequent_obj,dep_date,return_date);
                                }
                            }

                            //Companys Most Recent
                            let company_most_recent = `
                            ; WITH CTE AS (
                                SELECT
                                    LR_1.RECKEY,
                                    LR_1.rdepdate AS DEP_DATE,
                                    ( SELECT TOP ( 1 ) LR_2.ORIGIN FROM LegRouting LR_2 WHERE LR_2.RECKEY = LR_1.RECKEY ORDER BY LR_2.legcntr ASC ) AS ORIGIN,
                                    ( SELECT TOP ( 1 ) LR_3.DESTINAT FROM LegRouting LR_3 WHERE LR_3.RECKEY = LR_1.RECKEY ORDER BY LR_3.legcntr DESC ) AS DESTINAT,
                                    ( SELECT COUNT( * ) FROM LegRouting LR_4 WHERE LR_4.RECKEY = LR_1.RECKEY ) AS TOTAL_COUNT 
                                FROM
                                    LegRouting LR_1 
                                WHERE
                                    LR_1.DESTINAT = '${destination_city}' 
                                GROUP BY
                                    LR_1.RECKEY,
                                    LR_1.rdepdate 
                                ),
                                CTE1 AS ( SELECT TOP ( 1 ) RECKEY, ORIGIN, DESTINAT, DEP_DATE FROM CTE WHERE ORIGIN <> '${destination_city}' AND TOTAL_COUNT <= 2 ORDER BY DEP_DATE DESC ) SELECT DISTINCT
                                LR.reckey,
                                AR_OCty.City AS FlightDepartureCity,
                                AR_dCty.City AS FlightArrivalCity,
                                AR.airline_name,
                                AR.airline_code,
                                LR.rarrdttim AS FlightArrivalDate,
                                LR.rdepdttim AS FlightDepartureDate,
                                LR.origin,
                                LR.destinat,
                                LR.class,
                                LR.legcntr 
                            FROM
                                LegRouting LR
                                INNER JOIN AirportDatalooker AR_OCty WITH ( nolock ) ON AR_OCty.IATA = LR.origin
                                INNER JOIN AirportDatalooker AR_dCty WITH ( nolock ) ON AR_dCty.IATA = LR.destinat
                                INNER JOIN newAirLineData AR WITH ( nolock ) ON AR.airline_code = LR.airline 
                            WHERE
                                LR.RECKEY = ( SELECT RECKEY FROM CTE1 ) 
                            ORDER BY
                                LR.legcntr ASC 
                            `;
                            var company_most_recent_result =  await executeQuery(db_config, company_most_recent);
                            if(company_most_recent_result != null && company_most_recent_result != undefined)
                            {
                                var record_array = company_most_recent_result.recordset;
                                if(record_array.length != 0)
                                {
                                    var company_most_recent_obj = {};
                                    var reckey = record_array[0].reckey;

                                    company_most_recent_obj['flight_details']    =   record_array;
                                    company_most_recent_obj['hotelDetails']      =   await getHotelDetails(reckey, req.headers.cookie);
                                    company_most_recent_obj['rentalCarDetails']  =   await getRentalCarDetails(reckey, req.headers.cookie);
                                    company_most_recent_obj['townCarDetails']    =   await getTownCarDetails(reckey, req.headers.cookie);
                                    company_most_recent_obj['railDetails']       =   await getRailDetails(reckey, req.headers.cookie);
                                    
                                    user_details[req.session.user_name].main_data['company_most_recent'] =  await updateTripDtaesPreviousReservation(company_most_recent_obj,dep_date,return_date);
                                }
                            }
                            
                            var respObj = { status : 200 , records : user_details[req.session.user_name].main_data };
                        }
                        else
                        {
                            var respObj = { status : 400 , records : null };
                        }
                    }
                    else
                    {
                        var respObj = { status : 400 , records : null };
                    }  
                }

                if(requestType === "getConcTravelers")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var arranger_email = req.body.arranger_email;

                    let query =  `SELECT first_name, last_name, email_address FROM [dbo].[ez_hrfeed_records_merck] WHERE manager_email = '${arranger_email}'`;
                    
                    var receivedData =  await executeQuery(db_config, query);
                    
                    if(receivedData.rowsAffected[0] != undefined)
                    {
                        //The array having the traveler record that have profile on the GDS
                        var final_array_to_send = [];

                        if(receivedData.rowsAffected[0] != 0)
                        {
                            var concernedtravelers = receivedData.recordset;
                            var concernedtravelersEmails = [];

                            for(var i = 0 ; i < concernedtravelers.length; i++)
                            {
                                concernedtravelersEmails.push(concernedtravelers[i]['email_address']);
                            }

                            var travelerProfiles = await filterTravelerProfiles(concernedtravelersEmails, req.headers.cookie);

                            if(travelerProfiles.status == 200)
                            {
                                var travelerWithProfiles = travelerProfiles['records'];
                                
                                for(var i = 0; i < concernedtravelers.length; i++)
                                {
                                    if(travelerWithProfiles.includes(concernedtravelers[i]['email_address']))
                                    {
                                        final_array_to_send.push(concernedtravelers[i])
                                    }
                                }
                                respObj = { status: 200, resultFor : "getConcTravelers", record_array : final_array_to_send };
                            }
                            else if(travelerProfiles.message == "Session Initialization Error")
                            {
                                respObj = { status: 404, resultFor : "getConcTravelers", message : "Sabre Web Services are currently down. Please try again later." };
                            }
                            else
                            {
                                respObj = { status: 400, resultFor : "getConcTravelers" };
                            }
                        }
                        else
                        {
                            respObj = { status: 400, resultFor : "getConcTravelers" };
                        }
                    }
                    else
                    {
                        respObj = { status: 400, resultFor : "getConcTravelers" };
                    }
                }

                if(requestType === "getCountryCode2Digits")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var country_id = req.body.countryID;
                    let query =  `SELECT * FROM Ez_Lk_Country WHERE ez_country_id = ${country_id}`;
                    var receivedData =  await executeQuery(db_config, query);
                    if(receivedData != undefined)
                    {
                        respObj = { resultFor : requestType, record : receivedData.recordset[0].ez_country_abbr };
                    }
                }

                if(requestType === "getRequiredDetails")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var user_id = req.body.user_id;
                    if(user_id != null && user_id != undefined && user_id != "")
                    {
                        let query = `SELECT Ez_Lk_Country.ez_country_abbr, Ez_Company.ez_company_name FROM ez_key INNER JOIN Ez_Lk_Country ON ez_key.ez_country_id = Ez_Lk_Country.ez_country_id LEFT JOIN Ez_Company ON ez_key.ez_company_id = Ez_Company.ez_company_id WHERE ez_user_id = ${user_id};`;
                        var receivedData =  await executeQuery(db_config, query);
                        if(receivedData != undefined)
                        {
                            respObj = { resultFor : requestType, record : receivedData.recordset[0] };
                        }
                    }
                }

                if(requestType === "getUserDetails")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };
                    var userID = req.body.userID;
                    let query =  `SELECT TOP(1) ez_user_id, ez_fname, ez_lname, ez_company_id, ez_email, ez_country_id FROM ez_key WHERE ez_user_id = ${userID}`;
                    var receivedData =  await executeQuery(db_config, query);
                    
                    if(receivedData != undefined)
                    {
                        respObj = { resultFor : requestType, record : receivedData.recordset[0] };
                    }
                }

                if(requestType === "getAlCitiesNames")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    let query = `SELECT City FROM EZMailAirportsIATA24`;
                    var receivedData =  await executeQuery(db_config, query);
                    respObj = { resultFor : requestType, record : receivedData.recordset };
                }

                if(requestType === "getCurrentUserID")
                {
                    var email = req.body.email;

                    if(email != "" && email != undefined && email != null)
                    {

                        let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };
                        let query = `SELECT ez_user_id, ez_fname, ez_lname FROM ez_key WHERE ez_email = '${email}'`; //AND ez_country_id = 12633
                        var receivedData =  await executeQuery(db_config, query);
                        
                        if(receivedData != undefined && receivedData != "" && receivedData != null)
                        {
                            respObj = { resultFor : requestType, record : receivedData.recordset };
                        }
                        else
                        {
                            respObj = { resultFor : requestType, record : null };
                        }
                    }
                    else
                    {
                        respObj = { resultFor : requestType, record : null };
                    }
                }

                if(requestType === "getTripPurposes")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var companyID = req.body.companyID;
                    var countryID = req.body.countryID;

                    let query = `SELECT TripPurposeID, TripPurpose FROM EZMailTripPurposes INNER JOIN EZMailTravelEvents ON EZMailTravelEvents.TravelEventID = EZMailTripPurposes.TravelEventID WHERE EZMailTravelEvents.ez_company_id = ${companyID} AND EZMailTravelEvents.ez_country_id = ${countryID}`;
                    
                    var queryResult =  await executeQuery(db_config, query);

                    if(queryResult != undefined && queryResult != "")
                    {
                        if(prefferedLanguage === "English")
                        {
                            var respObj = { resultFor : "getTripPurposes", status : "200", recordObj : queryResult.recordset, numOfRecs : queryResult.rowsAffected[0] };
                        }
                        else
                        {
                            var required_array = [];    
    
                            for (var i= 0; i < (queryResult.recordset).length; i++)
                            {
                                var tmpObj = {};
                                tmpObj['TripPurposeID'] = queryResult.recordset[i].TripPurposeID;
                                tmpObj['TripPurpose']  = await translateTextAPI(queryResult.recordset[i].TripPurpose, req.headers.cookie); 
                                required_array.push(tmpObj); 
                            }
                            var respObj = { resultFor : "getTripPurposes", status : "200", recordObj : required_array, numOfRecs : queryResult.rowsAffected[0] };
                        }
                    }
                    else
                    {
                        var respObj = { resultFor : requestType, status : "404" };
                    }
                }

                if(requestType === "getAirlineName")
                {
                    var airline_name = req.body.airline_name;
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };
                    let query = `SELECT airline_name FROM newAirLineData WHERE airline_code = '${airline_name}'`;
                    var receivedData =  await executeQuery(db_config, query);
                    var respObj = { resultFor : requestType, record : receivedData };
                }

                if(requestType === "getAirPreferences")
                {
                    var company_id = req.body.company_id;
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };
                    let query = `SELECT vendor_name FROM Preference_air_car WHERE client_id = ${company_id} AND type = 'air'`;
                    var receivedData =  await executeQuery(db_config, query);
                    var respObj = { resultFor : requestType, record : receivedData };
                }

                if(requestType === "getCarPreferences")
                {
                    var company_id = req.body.company_id;
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };
                    let query = `SELECT vendor_name FROM Preference_air_car WHERE client_id = ${company_id} AND type = 'car'`;
                    var receivedData =  await executeQuery(db_config, query);
                    var respObj = { resultFor : requestType, record : receivedData };
                }

                if(requestType === "getHotelPreferences")
                {
                    var company_id = req.body.company_id;
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };
                    let query = `SELECT hotel_name, property_id, hotel_code FROM Ez_company_preferred_hotel WHERE ez_company_id = ${company_id}`;
                    var receivedData =  await executeQuery(db_config, query);
                    var respObj = { resultFor : requestType, record : receivedData };
                }

                if(requestType === "getUserLocalLanguage")
                {
                    var user_id = req.body.user_id;

                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };
                    
                    let query = `SELECT EK.ez_company_id, EK.ez_country_id,EC.ez_loc_second_language FROM Ez_Key EK INNER JOIN Ez_Company_Location EC ON EC.ez_company_id = EK.ez_company_id INNER JOIN Ez_Lk_Country EL ON EL.ez_country_id = EK.ez_country_id WHERE EC.ez_loc_country_default = EL.ez_country_abbr AND EK.ez_user_id = ${user_id}`;
                    var receivedData =  await executeQuery(db_config, query);
                    var respObj = { resultFor : requestType, record : receivedData };
                }
                //modified by Ys
                if(requestType === "getPNRLocator")
                {
                    var traveler_id = req.body.traveler_id;
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };
                    let query = `SELECT recloc FROM baldwin_pnr_info WHERE travler_id = '${traveler_id}'`;
                    var receivedData =  await executeQuery(db_config, query);
                    var respObj = { resultFor : requestType, record : receivedData };
                }
            }

            if(queryAction === "InsertData")
            {
                var action = req.body.action;

                //Inserting traveler personal information in DB
                if(action === "insertTravelerInfo")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var dataArray       =   req.body.dataArray;
                    var specialRequest  =   req.body.specialRequest;
                    var currentDate     =   moment().format('YYYY-MM-DD HH:mm:ss.SSS');

                    if(dataArray.length === 1)
                    {
                        var dataObj = dataArray[0];
                        var objKeys = Object.keys(dataObj);

                        //Parsing Query
                        var query = `INSERT INTO [dup_EZMailTravelers] (StatusID, CreatedAt, UpdatedAt, NumberInGroup, SpecialRequests, `;
                        
                        for(var i = 0; i < objKeys.length; i++)
                        {
                            if(i != (objKeys.length - 1))
                            {
                                query += `${objKeys[i]}, `;
                            }
                            else
                            {
                                query += `${objKeys[i]} )`;
                            }
                        }
                        
                        query += ` OUTPUT Inserted.TravelerID VALUES (1, '${currentDate}', '${currentDate}', 1, '${specialRequest}', `;
                        
                        for (var j = 0; j < objKeys.length; j++)
                        {
                            if(j != (objKeys.length - 1))
                            {  
                                if(objKeys[j] == "Phone")
                                {
                                    query += `'${dataObj[objKeys[j]].replace(/[^\d]+/g, "")}', `;
                                }
                                else
                                {
                                    if(dataObj[objKeys[j]] == "null" ||dataObj[objKeys[j]] == null || dataObj[objKeys[j]] == 'null')
                                    {
                                        query += null+`,`;
                                    }else
                                    {
                                        query += `'${dataObj[objKeys[j]]}', `;
                                    }
                                    
                                }
                            }
                            else
                            {
                                if(objKeys[j] == "Phone")
                                {
                                    query += `'${dataObj[objKeys[j]].replace(/[^\d]+/g, "")}' )`;
                                }
                                else
                                {
                                    if(dataObj[objKeys[j]] == "null" || dataObj[objKeys[j]] == null || dataObj[objKeys[j]] == 'null')
                                    {
                                        query += null;

                                    }else
                                    {
                                        
                                        query += `'${dataObj[objKeys[j]]}' )`;

                                    }
                                }
                            }   
                        }

                        try
                        {
                            var queryResult =  await executeQuery(db_config, query);
                        }
                        catch (error)
                        {
                            console.log("Traveler info insertion error", error);
                        }

                        var travelerIDObject = queryResult.recordset[0];

                        if(!user_details[req.session.user_name])
                        {
                            user_details[req.session.user_name] = {};
                            user_details[req.session.user_name].travelerIDArray = [];
                        }
                        else
                        {
                            user_details[req.session.user_name].travelerIDArray = [];   
                        }

                        (user_details[req.session.user_name].travelerIDArray).push(travelerIDObject.TravelerID);

                        //Generating response 
                        //respObj = { result : queryResult.rowsAffected[0]};
                        var respObj = {result : 1, travelerIDArray : user_details[req.session.user_name].travelerIDArray};
                        user_details[req.session.user_name].travelerIDArray = [];
                    }
                    else
                    {
                        for (var k = 0 ; k < dataArray.length; k++)
                        {
                            var dataObj = dataArray[k];
                            var travelerNumber = (k + 1);
                            var objKeys = Object.keys(dataObj);

                            //Parsing Query
                            var query = `INSERT INTO [dup_EZMailTravelers] (StatusID, CreatedAt, UpdatedAt, NumberInGroup, `;
                            for(var i = 0; i < objKeys.length; i++)
                            {
                                if(i != (objKeys.length - 1))
                                {
                                    query += `${objKeys[i]}, `;
                                }
                                else
                                {
                                    query += `${objKeys[i]} )`;
                                }
                            }
                            query += ` OUTPUT Inserted.TravelerID VALUES (1, '${currentDate}', '${currentDate}', ${travelerNumber}, `;
                            for (var j = 0; j < objKeys.length; j++)
                            {
                                if(j != (objKeys.length - 1))
                                {  
                                    if(objKeys[j] == "Phone")
                                    {
                                        query += `'${dataObj[objKeys[j]].replace(/[^\d]+/g, "")}', `;
                                    }
                                    else
                                    {
                                        query += `'${dataObj[objKeys[j]]}', `;
                                    }
                                }
                                else
                                {
                                    if(objKeys[j] == "Phone")
                                    {
                                        query += `'${dataObj[objKeys[j]].replace(/[^\d]+/g, "")}' )`;
                                    }
                                    else
                                    {
                                        query += `'${dataObj[objKeys[j]]}' )`;
                                    }
                                }   
                            }
                                try {
                                    var queryResult =  await executeQuery(db_config, query);
                                } catch (error) {
                                    console.log("traveler info insertion error",error);
                                }
                            var travelerIDObject = queryResult.recordset[0];
                            
                            if(!user_details[req.session.user_name])
                            {
                                user_details[req.session.user_name] = {};
                            }

                            user_details[req.session.user_name].travelerIDArray.push(travelerIDObject.TravelerID);
                        }
                        var respObj = {result : 1, travelerIDArray : user_details[req.session.user_name].travelerIDArray};
                        user_details[req.session.user_name].travelerIDArray = [];
                    }

                }

                //Inserting flight reservation information in DB
                if(action === "insertFlightInfo")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var dataArray       =   req.body.dataArray;
                    var travelerArray   =   req.body.travelerArray;
                    var currentDate     =   moment().format('YYYY-MM-DD HH:mm:ss.SSS');

                    for(var i = 0; i < travelerArray.length; i++)
                    {
                        var TravelerID = travelerArray[i];
                        
                        for(var j = 0; j < dataArray.length; j++)
                        {
                            var currentDataObj = dataArray[j];
                            var keys = Object.keys(currentDataObj);

                            //Making Query
                            var query = `INSERT INTO dup_EzMailFlights ( TravelerID, FlightDepartureState, FlightArrivalState, FlightPreferredTime, CreatedAt, UpdatedAt, `;
                            for (var k = 0; k < keys.length; k++)
                            {
                                if(keys[k] === "flightType")
                                {
                                    query += "TravelTypeID ,";
                                } 
                                if(keys[k] === "origin")
                                {
                                    query += "FlightDepartureCity, ";
                                }
                                if(keys[k] === "destination")
                                {
                                    query += "FlightArrivalCity, ";
                                }
                                if(keys[k] === "time")
                                {
                                    query += "FlightTime, ";
                                }
                                if(keys[k] === "date")
                                {
                                    query += "FlightDepartureDate, ";
                                }
                            }
                            query += ` FlightSegmentNumber ) VALUES ( ${TravelerID}, '${currentDataObj['origin']}', '${currentDataObj['destination']}', 'Departure', '${currentDate}', '${currentDate}', `;
                            for (var l = 0; l < keys.length; l++)
                            {
                                if(currentDataObj[keys[l]] === "oneway")
                                {
                                    query += `1, ` ;
                                }
                                else if(currentDataObj[keys[l]] === "roundtrip")
                                {
                                    query += `2, ` ;
                                }
                                else if(currentDataObj[keys[l]] === "multicity")
                                {
                                    query += `3, ` ;
                                }
                                else
                                {
                                    query += `'${currentDataObj[keys[l]]}', `;
                                }
                            }
                            query += ` ${(j + 1)} )`;

                            //Executing Query
                            var queryResult =  await executeQuery(db_config, query);
                            var respObj = { result : 1 };
                        }
                    }

                }

                //Inserting hotel reservation information in DB
                if(action === "insertHotelInfo")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var travelerArray   =   req.body.travelerArray;
                    var dataArray       =   req.body.dataArray;
                    var currentDate     =   moment().format('YYYY-MM-DD HH:mm:ss.SSS');

                    for (var i = 0; i < travelerArray.length; i++)
                    {
                        var TravelerID = travelerArray[i];

                        for (var j = 0; j < dataArray.length; j++)
                        {
                            var currentDataObj = dataArray[j];
                            var keys = Object.keys(currentDataObj);
                            
                            //Make Query
                            var query = `INSERT INTO dup_EZMailHotels ( TravelerID, CreatedAt, HotelCity, `
                            
                            for (var k = 0; k < keys.length; k++)
                            {
                                if(keys[k] === "hotelName")
                                {
                                    query += `HotelName, `;
                                }

                                if(keys[k] === "HotelState")
                                {
                                    query += `HotelState, `;
                                }

                                if(keys[k] === "HotelCheckIn")
                                {
                                    query += `HotelCheckIn, `;
                                }

                                if(keys[k] === "HotelCheckOut")
                                {
                                    query += `HotelCheckOut, `;
                                }
                            }
                            query += ` UpdatedAt) VALUES ( '${TravelerID}', '${currentDate}', '${currentDataObj['HotelState']}', `;
                            for (var l = 0; l < keys.length; l++)
                            {
                                query += `'${currentDataObj[keys[l]]}', `;
                            }
                            query += `'${currentDate}' )`;

                            //Executing Query
                            var queryResult =  await executeQuery(db_config, query);
                            var respObj = { result : 1 };
                        }
                    }
                }

                //Inserting rental car infromation in DB
                if(action === "insertRentalCarInfo")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var travelerArray   =   req.body.travelerArray;
                    var dataArray       =   req.body.dataArray;
                    var currentDate     =   moment().format('YYYY-MM-DD HH:mm:ss.SSS');

                    for (var i = 0; i < travelerArray.length; i++)
                    {
                        var TravelerID = travelerArray[i]; 
                        var recordObj = dataArray[0];
                        var keys = Object.keys(recordObj);
                        
                        //Making Query
                        var query = `INSERT INTO dup_EZMailCars (  TravelerID, CreatedAt, PickupState, DropoffState, `; 
                        for (var j = 0; j < keys.length; j++)
                        {
                            if(keys[j] === "PickupCity")
                            {
                                query +=  `PickupCity, `;
                            }

                            if(keys[j] === "PickupDateTime")
                            {
                                query +=  `PickupDateTime, `;
                            }

                            if(keys[j] === "DropoffCity")
                            {
                                query +=  `DropoffCity, `;
                            }

                            if(keys[j] === "DropoffDateTime")
                            {
                                query +=  `DropoffDateTime, `;
                            }
                        }
                        query += ` UpdatedAt ) VALUES ( '${TravelerID}', '${currentDate}', '${recordObj['PickupCity']}', '${recordObj['DropoffCity']}', `;
                        for(var k = 0; k < keys.length; k++)
                        {
                            query += `'${recordObj[keys[k]]}', `;
                        }
                        query += `'${currentDate}' )`;

                        //Executing Query
                        var queryResult =  await executeQuery(db_config, query);
                        var respObj = { result : 1 };
                    }
                }

                //Inserting town car infromation to DB
                if(action === "insertTownCarInfo")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var travelerArray   =   req.body.travelerArray;
                    var dataArray       =   req.body.dataArray;
                    var currentDate     =   moment().format('YYYY-MM-DD HH:mm:ss.SSS');

                    for (var i = 0; i < travelerArray.length; i++)
                    {
                        var TravelerID = travelerArray[i];
                        var recordObj = dataArray[0];
                        var keys = Object.keys(recordObj);

                        //Making Query
                        var query = `INSERT INTO dup_EZMailTownCars ( TravelerID, CreatedAt, `;
                        for(var j = 0; j < keys.length; j++)
                        {
                            if(keys[j] === "Passengers")
                            {
                                query += `Passengers, `;
                            }

                            if(keys[j] === "TownCarDate")
                            {
                                query += `TownCarDate, `;
                            }

                            if(keys[j] === "TownCarPickupTime")
                            {
                                query += `TownCarPickupTime, `;
                            }

                            if(keys[j] === "TownCarDropoffTime")
                            {
                                query += `TownCarDropoffTime, `;
                            }

                            if(keys[j] === "TownCarPickupAddress")
                            {
                                query += `TownCarPickupAddress, `;
                            }

                            if(keys[j] === "TownCarDropoffAddress")
                            {
                                query += `TownCarDropoffAddress, `;
                            }

                            if(keys[j] === "townCarMode")
                            {
                                query += `TravelTypeID, `;
                            }
                        }
                        query += `UpdatedAt ) VALUES (  '${TravelerID}', '${currentDate}', `;
                        for (var k = 0; k < keys.length; k++)
                        {
                            if(recordObj[keys[k]] == "oneway")
                            {
                                query += `1, `;
                            }
                            else if(recordObj[keys[k]] == "hourly")
                            {
                                query += `5, `;
                            }
                            else
                            {
                                query += `'${recordObj[keys[k]]}', `;
                            }
                            
                        }
                        query += ` '${currentDate}' )`;

                        //Executing Query
                        var queryResult =  await executeQuery(db_config, query);
                        var respObj = { result : 1 };
                    }
                }

                //Inserting rail information to DB
                if(action === "insertRailInfo")
                {
                    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };

                    var travelerArray   =   req.body.travelerArray;
                    var dataArray       =   req.body.dataArray;
                    var currentDate     =   moment().format('YYYY-MM-DD HH:mm:ss.SSS');

                    for(var i = 0; i < travelerArray.length; i++)
                    {
                        TravelerID = travelerArray[i];

                        for (var j = 0; j < dataArray.length; j++)
                        {
                            var currentRecordObj = dataArray[j];
                            var keys = Object.keys(currentRecordObj);

                            //Making Query 
                            var query = `INSERT INTO dup_EZMailRails ( TravelerID, CreatedAt, RailDepartureState, RailArrivalState, ` ;
                            for(var k = 0; k < keys.length; k++)
                            {
                                if(keys[k] === "RailDepartureCity")
                                {
                                    query += `RailDepartureCity, `;
                                }
                                if(keys[k] === "RailArrivalCity")
                                {
                                    query += `RailArrivalCity, `;
                                }
                                if(keys[k] === "RailPreferredTime")
                                {
                                    query += `RailPreferredTime, `;
                                }
                                if(keys[k] === "RailDepartureDate")
                                {
                                    query += `RailDepartureDate, `;
                                }
                                if(keys[k] === "RailTime")
                                {
                                    query += `RailTime, `;
                                }
                                if(keys[k] === "TravelerTypeID")
                                {
                                    query += `TravelTypeID, `;
                                }
                            }
                            query += ` UpdatedAt, RailSegmentNumber ) VALUES ( '${TravelerID}', '${currentDate}', '${currentRecordObj['RailDepartureCity']}', '${currentRecordObj['RailArrivalCity']}',  `;
                            for(var l = 0; l < keys.length; l++)
                            {
                                if(currentRecordObj[keys[l]] === "departure time")
                                {
                                    query += `'departure', `;
                                }
                                else if(currentRecordObj[keys[l]] === "arrival time")
                                {
                                    query += `'arrival', `;
                                }
                                else
                                {
                                    query += `'${currentRecordObj[keys[l]]}', `;
                                }
                            }
                            query += `'${currentDate}', ${(j + 1)} )`;

                            //Executing Query
                            var queryResult =  await executeQuery(db_config, query);
                            var respObj = { result : 1 };
                        }
                    }
                }
                if(action === "insertPnrInfo")
                {
                    try
                    {
                        var save_data = req.body.save_data;
                        let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };
                        let query = `insert into baldwin_pnr_info (traveler_id,trip_short_details,recloc,pnr_response,hotel_,car_)
                        VALUES ('${save_data.traveler_id}','${save_data.short_desc}','${save_data.locator_id}','${JSON.stringify(save_data.pnr_response)}',0,0)`;
                        // for now we are inserting 0 for car and hotel since it is test pnr.
                        var queryResult =  await executeQuery(db_config, query);
                    }
                    catch (error) 
                    {
                       console.log("something went wrong while saving pnr data"); 
                    }
                } 
            }
        }
        else
        {
            respObj = { result : "Sorry! The Rquested Action Type Is Not Supported." };
        }
    }
    else
    {
        respObj = { result : "Sorry! The Rquested Action Type Should be a String or it cannot be Empty." };
    }

    res.json(respObj);
});

router.post('/select2DataSearch', async (req, res) => {

    //MSSQL Configurations For This Route
    let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };
    
    var searchTerm = '%' + req.body.term['term'] + '%';
    if(req.body.term['term'].length === 3)
    {
        var query = "SELECT  [Name], [IATA], [City], [Country]  FROM  EZMailAirportsIATA24  WHERE  (  [IATA] like '" + searchTerm + "') AND IATA != '\\N'";
    }
    else
    {
        var query = "SELECT  [Name], [IATA], [City], [Country]  FROM  EZMailAirportsIATA24  WHERE  (  [IATA] like '" + searchTerm + "'  OR  [Name]  like '" + searchTerm + "'  OR  [Country] like '" + searchTerm + "' OR  [City] like '" + searchTerm + "' ) AND IATA != '\\N'";
    }

    var receivedData =  await executeQuery(db_config, query);
    if(receivedData)
    {
        var respArray = [];
        for(var i = 0; i < (receivedData.recordsets[0]).length; i++)
        {
            respArray.push({ name : receivedData.recordsets[0][i].Name, code : receivedData.recordsets[0][i].IATA, country : receivedData.recordsets[0][i].Country, city : receivedData.recordsets[0][i].City });
        }
        
        res.json(respArray);
    }
    else
    {
        var nullObj = {};
        res.json(null);
    }
});

router.post('/getConcernedGDS', async (req, res) => {
    
    var purpose = req.body.purpose;
    
    if(purpose === "concernedGDS")
    {
        var user_id = req.body.user_id;
        
        var getRequiredDataPre = await getRequiredData(user_id, req.headers.cookie);

        if(getRequiredDataPre != null)
        {
           
            var country_name = getRequiredDataPre.ez_country_abbr;
            var company_name = getRequiredDataPre.ez_company_name;
        
            if(country_name != undefined && country_name != null && country_name != "")
            {
                if(company_name != undefined && company_name != null && company_name != "")
                {
                    let db_config = { user: "yasir", password: "fVQvb9p4Fyfqxfhk8i9JPT93txyis9ZWRdgV2gbqkUHXB5inKs", server: "atg-prod.database.windows.net", database: "ATGPNRDB_LIVE", options: { enableArithAbort: true } };

                    let query = `SELECT TCTRIPS.GDS FROM TCACCTS INNER JOIN TCTRIPS ON TCACCTS.acct = TCTRIPS.acct WHERE TCACCTS.Client <> '' AND TCACCTS.country = '${country_name}' AND TCTRIPS.GDS <> '' AND TCACCTS.Client LIKE '${company_name}' GROUP BY TCACCTS.Client, TCACCTS.ACCT, TCACCTS.country, TCTRIPS.GDS`;
                    let receivedData =  await executeQuery(db_config, query);
                    
                    if(receivedData.recordset)
                    {
                        if(receivedData.recordset.length != 0)
                        {
                            var response_pre = receivedData.recordset[0].GDS;
                            var response = { status : 200, resultFor : purpose, GDS : response_pre };
                        }
                    }
                    else
                    {
                        var response = { status : 400, resultFor : purpose, message : `Sorry! No GDS record found for the provided user id.`, record : 0 };
                    }
                }
                else
                {
                    var response = { status : 400, resultFor : purpose, message : `Company name is not valid! Provided name =  ${company_name}`, record : 0 };
                }
            }
            else
            {
                var response = { status : 400, resultFor : purpose, message : `Country name is not valid! Provided name =  ${country_name}`, record : 0 };
            }
        }
        else
        {
            var response = { status : 400, resultFor : purpose, message : `User id is not valid! Provided user id =  ${user_id}`, record : 0 };
        }

        res.json(response);
    }
});

router.post('/getPreviousReservation', async (req, res) => {
    // var employee_id = req.body.employee_id;

    // if(employee_id != "" && employee_id != undefined)
    // {
        let db_config = { user: "atg-admin", password: "dev13579*", server: "atg-dev.database.windows.net", database: "TSIDB", options: { enableArithAbort: true } };
        
        let query = `
        ;with CTE AS
        (
                    SELECT top(1) LR.reckey,
                    ROW_NUMBER() OVER(Partition by AR_OCty.City ORDER BY LR.rdepdttim ) AS Row_Number
                    from Merck_EmpItinData1 M
                    INNER JOIN LegRouting LR ON M.reckey = LR.reckey
                    INNER JOIN AirportDatalooker AR_OCty WITH (nolock) ON AR_OCty.IATA = LR.origin
                    INNER JOIN AirportDatalooker AR_dCty WITH (nolock) ON AR_dCty.IATA = LR.destinat
                    where M.employeeid='M237283' AND M.spend_type = 'Air' AND AR_dCty.City = 'Boston'
                    ORDER BY Row_Number DESC
        )
        select LR.reckey,AR_OCty.City as FlightDepartureCity,AR_dCty.City as FlightArrivalCity,AR.airline_name,
        LR.rarrdttim as FlightArrivalDate,LR.rdepdttim as FlightDepartureDate,LR.origin,LR.destinat 
        from LegRouting LR with (nolock)
        INNER JOIN AirportDatalooker AR_OCty WITH (nolock) ON AR_OCty.IATA = LR.origin
        INNER JOIN AirportDatalooker AR_dCty WITH (nolock) ON AR_dCty.IATA = LR.destinat
        INNER JOIN Airline3 AR with (nolock) ON AR.airline_code = LR.airline
        where reckey = (select reckey from CTE)
        ORDER BY LR.seqno
                    `;

        try
        {
            var receivedData =  await executeQuery(db_config, query);
            if(receivedData != "" && receivedData != undefined)
            {
                var response = { status : 200, records_array : receivedData.recordsets[0] };
                res.json(response);
            }
            else
            {
                var response = { status : 404, message : "No reservation details found" };
            }
        }
        catch(error)
        {
            console.log(error);
            var response = { status : 404, message : "No reservation details found" };
        }

    res.json(response);
});

router.post('/checkCityName', async (req, res) => {
    
    var provided_city_name = req.body.city_name;

    if(cities_name_array.indexOf(provided_city_name.toUpperCase()) > -1)
    {
        var response = { valid : true };
    }
    else
    {
        var response = { valid : false };
    }
    
    res.json(response);
});

router.get('/getAllCitiesNames', async (req, res) => {
    var cities_array = [];

    var allCities = await getAllCities(req.headers.cookie);
    for (var i = 0 ; i < allCities.length; i++)
    {
        var city_name = allCities[i].City;

        cities_array.push(city_name.toUpperCase());
    }
    var response = { cities_name_array : cities_array };
    res.json(response);
});

router.post('/updateCorrectCarCodes', async (req, res) => {
    await updateCorrectCarCodes();
    return res.json("doneeeeeeeee");
});

//==================================== [Route Implementation] ===========================================//

module.exports = router;