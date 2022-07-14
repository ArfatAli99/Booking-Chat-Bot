//======================================== [Dependecies] ================================================//

const express = require("express");
const router = express.Router();
const axios = require('axios');
var moment = require('moment');
var dateFormat = require('dateformat');
var now = new Date;
var sabreTimeStamp = dateFormat(now, "isoDateTime");
var parseString = require("xml2js").parseString;
const { v4: uuidv4 } = require('uuid');
var uniqid = require('uniqid');
var watsonRoute = require('./watson');
var Flight_Search_View = require('../../custom_views/flight_search_view');
var Hotel_Search_View = require('../../custom_views/hotel_search_view');

//======================================== [Dependecies] ================================================//

//==================================== [Language Preference] ============================================//

router.post('/changeLanguage', async (req, res) => {

    if (!user_details[req.session.user_name]) {
        user_details[req.session.user_name] = {};
        user_details[req.session.user_name].prefferedLanguage = "English";
        user_details[req.session.user_name].languageCode = "en";
    }
    else {
        user_details[req.session.user_name].prefferedLanguage = "English";
        user_details[req.session.user_name].languageCode = "en";
    }

    user_details[req.session.user_name].languageCode = req.body.languageCode;
    user_details[req.session.user_name].prefferedLanguage = req.body.language;

    var response = { status: 1 };
    res.json(response);
});

//==================================== [Language Preference] ============================================//

//=================================== [Setting Custom Variables] ========================================//

var user_details = {};

//=================================== [Setting Custom Variables] ========================================//

//======================================= [Helping functions] ===========================================//

async function translateTextAPI(text, current_session) {
    var languageCode = "en";
    let session_handle_axios = { headers: { cookie: current_session } };
    var APIResponse = await axios.post(process.env.IP + '/api/watson/tanslate', { from: "English", to: languageCode, text: text }, session_handle_axios);
    return APIResponse.data;
}

function car_categoty(label) {
    var vehicleTypes = { M: "Mini", N: "Mini Elite", E: "Economy", H: "Economy Elite", C: "Compact", D: "Compact Elite", I: "Intermediate", J: "Intermediate Elite", S: "Standard", R: "Standard Elite", F: "Fullsize", G: "Fullsize Elite", P: "Premium", U: "Premium Elite", L: "Luxury", W: "Luxury Elite", O: "Oversize", X: "Special" };
    if (vehicleTypes[label] != undefined) {
        var vehicle_type = vehicleTypes[label];
    }
    else {
        var vehicle_type = "Not Provided";
    }

    return vehicle_type;
}

function car_type(label) {
    var vehicleTypes = { B: "2-3 Door", C: "2/4 Door", D: "4-5 Door", W: "Wagon/Estate", V: "Passenger Van", L: "Limousine", S: "Sport", T: "Convertible", F: "SUV", J: "Open Air All Terrain", X: "Special", P: "Pick up Regular Cab", Q: "Pick up Extended Cab", Z: "Special Offer Car", E: "Coupe", M: "Monospace", H: "Motor Home", Y: "2 Wheel Vehicle", N: "Roadster" };
    if (vehicleTypes[label] != undefined) {
        var car_type = vehicleTypes[label];
    }
    else {
        var car_type = "Not Provided";
    }

    return car_type;
}

function drive_type(label) {
    var vehicleTypes = { M: "Manual Unspecified Drive", N: "Manual 4WD", C: "Manual AWD", A: "Auto Unspecified Drive", B: "Auto 4WD", D: "Auto AWD" };
    if (vehicleTypes[label] != undefined) {
        var drive_type = vehicleTypes[label];
    }
    else {
        var drive_type = "Not Provided";
    }

    return drive_type;
}

function formatPhoneNum(num) {
    var old_num = num;
    var tmp_data = old_num.match(/\d/g);
    new_number = tmp_data.join("");
    return new_number;
}

function check_undefine(result, json_string) {
    try {
        if (json_string) {
            return true;
        }
    }
    catch (error) {
        return false;
    }
}

//--------------------------------------------------------------------------------------------------------------------- */
// -----------------------------------------------   Session Creation   -----------------------------------------------
//--------------------------------------------------------------------------------------------------------------------- */

async function getAccessToken() {
    var unique_id = uuidv4();
    var sabre_endpoint = "https://webservices.havail.sabre.com";
    var headers_info = {
        headers: {
            'cache-control': 'no-cache',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'text/xml',
            'Cache-Control': 'no-cache',
            'Accept': '*/*',
            'Content-Type': 'text/xml'
        }
    };
    var xml = `<SOAP-ENV:Envelope
    xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:eb="http://www.ebxml.org/namespaces/messageHeader"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:xsd="http://www.w3.org/1999/XMLSchema">
    <SOAP-ENV:Header>
        <eb:MessageHeader SOAP-ENV:mustUnderstand="1" eb:version="1.0">
            <eb:From>
                <eb:PartyId>Client</eb:PartyId>
            </eb:From>
            <eb:To>
                <eb:PartyId>SWS</eb:PartyId>
            </eb:To>
            <eb:CPAId>${process.env.SABRE_CLIENT_PCC}</eb:CPAId>
            <eb:ConversationId>${unique_id}</eb:ConversationId>
            <eb:Service>SessionCreateRQ</eb:Service>
            <eb:Action>SessionCreateRQ</eb:Action>
            <eb:MessageData>
                <eb:MessageId>SWS-${unique_id}</eb:MessageId>
                <eb:Timestamp>${sabreTimeStamp}</eb:Timestamp>
            </eb:MessageData>
        </eb:MessageHeader>
        <wsse:Security
            xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext"
            xmlns:wsu="http://schemas.xmlsoap.org/ws/2002/12/utility">
            <wsse:UsernameToken> 
                <wsse:Username>${process.env.SABRE_USERID}</wsse:Username>
                <wsse:Password>${process.env.SABRE_USERPASS}</wsse:Password>
                <Organization>${process.env.SABRE_CLIENT_PCC}</Organization>
                <Domain>DEFAULT</Domain>
            </wsse:UsernameToken>
        </wsse:Security>
    </SOAP-ENV:Header>
    <SOAP-ENV:Body>
        <SessionCreateRQ Version="2003A.TsabreXML1.0.1">
            <POS>
                <Source PseudoCityCode="${process.env.SABRE_CLIENT_PCC}"/>
            </POS>
        </SessionCreateRQ>
    </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`

    try {
        var api_response = await axios.post(sabre_endpoint, xml, headers_info);
        var response_array = doSecurityParse(api_response.data, "NO8H");

        if (response_array === null || response_array == []) {
            return null;
        }
        else {
            return response_array;
        }
    }
    catch(error)
    {
        console.log(error.response.data);
        return null;
    }
}

async function getAccessToken_test() {
    var unique_id = uuidv4();
    var sabre_endpoint = "https://sws-crt.cert.havail.sabre.com";
    var headers_info = {
        headers: {
            'cache-control': 'no-cache',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'text/xml',
            'Cache-Control': 'no-cache',
            'Accept': '*/*',
            'Content-Type': 'text/xml'
        }
    };
    var xml = `<SOAP-ENV:Envelope
    xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:eb="http://www.ebxml.org/namespaces/messageHeader"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:xsd="http://www.w3.org/1999/XMLSchema">
    <SOAP-ENV:Header>
        <eb:MessageHeader SOAP-ENV:mustUnderstand="1" eb:version="1.0">
            <eb:From>
                <eb:PartyId>Client</eb:PartyId>
            </eb:From>
            <eb:To>
                <eb:PartyId>SWS</eb:PartyId>
            </eb:To>
            <eb:CPAId>${process.env.SABRE_CLIENT_PCC}</eb:CPAId>
            <eb:ConversationId>${unique_id}</eb:ConversationId>
            <eb:Service>SessionCreateRQ</eb:Service>
            <eb:Action>SessionCreateRQ</eb:Action>
            <eb:MessageData>
                <eb:MessageId>SWS-${unique_id}</eb:MessageId>
                <eb:Timestamp>${sabreTimeStamp}</eb:Timestamp>
            </eb:MessageData>
        </eb:MessageHeader>
        <wsse:Security
            xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext"
            xmlns:wsu="http://schemas.xmlsoap.org/ws/2002/12/utility">
            <wsse:UsernameToken> 
                <wsse:Username>${process.env.SABRE_USERID}</wsse:Username>
                <wsse:Password>${process.env.SABRE_USERPASS}</wsse:Password>
                <Organization>${process.env.SABRE_CLIENT_PCC}</Organization>
                <Domain>DEFAULT</Domain>
            </wsse:UsernameToken>
        </wsse:Security>
    </SOAP-ENV:Header>
    <SOAP-ENV:Body>
        <SessionCreateRQ Version="2003A.TsabreXML1.0.1">
            <POS>
                <Source PseudoCityCode="${process.env.SABRE_CLIENT_PCC}"/>
            </POS>
        </SessionCreateRQ>
    </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`

    try {
        var api_response = await axios.post(sabre_endpoint, xml, headers_info);

        var response_array = doSecurityParse(api_response.data, "NO8H");

        if (response_array === null || response_array == []) {
            return null;
        }
        else {
            return response_array;
        }
    }
    catch (error) {
        console.log(error);
        return null;
    }
}

async function doSecurityParse(xml, pcc) {

    parseString(xml, pcc, function(err, result) {
    
        try 
        {
            if (result['soap-env:Envelope']['soap-env:Body'] !== 'undefined' && result['soap-env:Envelope']['soap-env:Body'][0]['SessionCreateRS'][0]['$']['status'] !== 'undefined') 
            {    
                returnedStatus = result['soap-env:Envelope']['soap-env:Body'][0]['SessionCreateRS'][0]['$']['status'];
                returnedToken = result['soap-env:Envelope']['soap-env:Header'][0]['wsse:Security'][0]['wsse:BinarySecurityToken'][0]['_'];
                returnedConversationId = result['soap-env:Envelope']['soap-env:Header'][0]['eb:MessageHeader'][0]['eb:ConversationId'][0];
                returnedService = result['soap-env:Envelope']['soap-env:Header'][0]['eb:MessageHeader'][0]['eb:Service'][0]['_'];
                returnedAction = result['soap-env:Envelope']['soap-env:Header'][0]['eb:MessageHeader'][0]['eb:Action'][0];
                returnedMessageId = result['soap-env:Envelope']['soap-env:Header'][0]['eb:MessageHeader'][0]['eb:MessageData'][0]['eb:MessageId'][0];
                returnedTimestamp = result['soap-env:Envelope']['soap-env:Header'][0]['eb:MessageHeader'][0]['eb:MessageData'][0]['eb:Timestamp'][0];
                returnedCapId = pcc
            }
            else {
                return null;
            }

        } catch (e) {
            return null;
        }
    });

    var tokenArray = {};
    tokenArray.status = returnedStatus;
    tokenArray.capid = returnedCapId;
    tokenArray.token = returnedToken;
    tokenArray.conversationid = returnedConversationId;
    tokenArray.service = returnedService;
    tokenArray.action = returnedAction;
    tokenArray.messageid = returnedMessageId;
    tokenArray.timestamp = returnedTimestamp;

    return tokenArray;
}

async function closeSession(token_details) {
    var sabre_endpoint = "https://webservices.havail.sabre.com";
    var header_info = {
        headers: {
            'cache-control': 'no-cache',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'text/xml',
            'Cache-Control': 'no-cache',
            'Accept': '*/*',
            'Content-Type': 'text/xml'
        }
    };
    var xml = '<soap-env:Envelope xmlns:soap-env=\'http://schemas.xmlsoap.org/soap/envelope/\' \n    xmlns:xlink=\'http://www.w3.org/1999/xlink\' \n    xmlns:xsd=\'http://www.w3.org/1999/XMLSchema\'>\n    <soap-env:Header>\n        <eb:MessageHeader xmlns:eb=\'http://www.ebxml.org/namespaces/messageHeader\' eb:version=\'1.0\' soap-env:mustUnderstand=\'1\'>\n            <eb:From>\n                <eb:PartyId eb:type=\'urn:x12.org.IO5:01\'>com.sabre.SWSSession</eb:PartyId>\n            </eb:From>\n            <eb:To>\n                <eb:PartyId eb:type=\'urn:x12.org.IO5:01\'>webservices.sabre.com</eb:PartyId>\n            </eb:To>\n            <eb:CAPId>' + token_details.capid + '</eb:CAPId>\n            <eb:ConversationId>' + token_details.conversationid + '</eb:ConversationId>\n            <eb:Service eb:type=\'SabreXML\'>SessionCloseRQ</eb:Service>\n            <eb:Action>SessionCloseRQ</eb:Action>\n            <eb:Messagetoken_details>\n                <eb:MessageId>' + token_details.messageid + '</eb:MessageId>\n                <eb:Timestamp>' + token_details.timestamp + '</eb:Timestamp>\n            </eb:Messagetoken_details>\n        </eb:MessageHeader>\n        <wsse:Security xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext">\n            <wsse:BinarySecurityToken valueType="String" EncodingType="wsse:Base64Binary">' + token_details.token + '</wsse:BinarySecurityToken>\n        </wsse:Security>\n    </soap-env:Header>\n    <soap-env:Body>\n        <SessionCloseRQ Version=\'2003A.TsabreXML1.0.1\'>\n            <POS>\n                <Source PseudoCityCode=\'' + token_details.capid + '\' />\n            </POS>\n        </SessionCloseRQ>\n    </soap-env:Body>\n</soap-env:Envelope>';
    var api_response = await axios.post(sabre_endpoint, xml, header_info);
    return api_response.data;
}

async function closeSession_test(token_details) {
    var sabre_endpoint = "https://sws-crt.cert.havail.sabre.com";
    var header_info = {
        headers: {
            'cache-control': 'no-cache',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'text/xml',
            'Cache-Control': 'no-cache',
            'Accept': '*/*',
            'Content-Type': 'text/xml'
        }
    };
    var xml = '<soap-env:Envelope xmlns:soap-env=\'http://schemas.xmlsoap.org/soap/envelope/\' \n    xmlns:xlink=\'http://www.w3.org/1999/xlink\' \n    xmlns:xsd=\'http://www.w3.org/1999/XMLSchema\'>\n    <soap-env:Header>\n        <eb:MessageHeader xmlns:eb=\'http://www.ebxml.org/namespaces/messageHeader\' eb:version=\'1.0\' soap-env:mustUnderstand=\'1\'>\n            <eb:From>\n                <eb:PartyId eb:type=\'urn:x12.org.IO5:01\'>com.sabre.SWSSession</eb:PartyId>\n            </eb:From>\n            <eb:To>\n                <eb:PartyId eb:type=\'urn:x12.org.IO5:01\'>webservices.sabre.com</eb:PartyId>\n            </eb:To>\n            <eb:CAPId>' + token_details.capid + '</eb:CAPId>\n            <eb:ConversationId>' + token_details.conversationid + '</eb:ConversationId>\n            <eb:Service eb:type=\'SabreXML\'>SessionCloseRQ</eb:Service>\n            <eb:Action>SessionCloseRQ</eb:Action>\n            <eb:Messagetoken_details>\n                <eb:MessageId>' + token_details.messageid + '</eb:MessageId>\n                <eb:Timestamp>' + token_details.timestamp + '</eb:Timestamp>\n            </eb:Messagetoken_details>\n        </eb:MessageHeader>\n        <wsse:Security xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext">\n            <wsse:BinarySecurityToken valueType="String" EncodingType="wsse:Base64Binary">' + token_details.token + '</wsse:BinarySecurityToken>\n        </wsse:Security>\n    </soap-env:Header>\n    <soap-env:Body>\n        <SessionCloseRQ Version=\'2003A.TsabreXML1.0.1\'>\n            <POS>\n                <Source PseudoCityCode=\'' + token_details.capid + '\' />\n            </POS>\n        </SessionCloseRQ>\n    </soap-env:Body>\n</soap-env:Envelope>';
    var api_response = await axios.post(sabre_endpoint, xml, header_info);
    return api_response.data;
}

//--------------------------------------------------------------------------------------------------------------------- */
// -----------------------------------------------   Flight Search    -----------------------------------------------
//--------------------------------------------------------------------------------------------------------------------- */

async function getFlightDetails(token_details, flight_prefs) {

    if (flight_prefs.exact_match == true && (flight_prefs.flight_carrier != undefined && flight_prefs.flight_carrier != null && flight_prefs.flight_carrier != "")) {
        var exact_match = `
        <TravelPreferences ETicketDesired="true" MaxStopsQuantity="0" ValidInterlineTicket="false" Hybrid="false">
            <VendorPref Code="${flight_prefs.flight_carrier}" PreferLevel="Preferred" Type="Operating"/>
                <VendorPrefPairing Applicability="AtLeastOneSegment" PreferLevel="Preferred">
                    <VendorPref Code="${flight_prefs.flight_carrier}" Type="Operating"/>
                </VendorPrefPairing>
        </TravelPreferences>`;
    }
    else {
        var exact_match = ``;
    }

    if(flight_prefs.flight_type == "oneway")
    {
        
        if( flight_prefs.exact_match == true )
        {
            //let one_way_dep_time            =   moment(flight_prefs.departure_time, "HHmm").subtract(30,"minutes").format("HHmm") + moment(flight_prefs.departure_time, "HHmm").add(30,"minutes").format("HHmm");
            var one_way_dep_arrival_window  =   `<DepartureWindow>${flight_prefs.departure_time_window}</DepartureWindow>`;
            var flight_departure_time       =   flight_prefs.departure_time;
        }
        else {
            var one_way_dep_arrival_window = ``;
            var flight_departure_time = "00:00:00";
        }

        var flight_preference = `<OriginDestinationInformation RPH="1">
            <DepartureDateTime>${flight_prefs.departure_date}T${flight_departure_time}</DepartureDateTime> 
            ${one_way_dep_arrival_window} 
            <OriginLocation LocationCode="${flight_prefs.departure_city}"/> 
            <DestinationLocation LocationCode="${flight_prefs.destination_city}"/> 
        </OriginDestinationInformation>`;
    }

    else if(flight_prefs.flight_type == "roundtrip")
    {
        if(flight_prefs.exact_match == true)
        {
            if( flight_prefs.departureTime )
            {
                //let round_trip_dep_time = moment(flight_prefs.departureTime, "HHmm").subtract(30,"minutes").format("HHmm") + moment(flight_prefs.departureTime, "HHmm").add(30,"minutes").format("HHmm");
                var round_trip_dep_arrival_window = `<DepartureWindow>${flight_prefs.departure_time_window}</DepartureWindow>`;
            }

            if( flight_prefs.returnTime )
            {
                //let round_trip_return_time = moment(flight_prefs.returnTime, "HHmm").subtract(30,"minutes").format("HHmm") + moment(flight_prefs.returnTime, "HHmm").add(30,"minutes").format("HHmm");
                var round_trip_return_dep_arrival_window = `<DepartureWindow>${flight_prefs.return_time_window}</DepartureWindow>`;                                    
            }

            var flight_departure_time = flight_prefs.departureTime;
            var flight_return_time = flight_prefs.returnTime;
        }
        else {
            var flight_departure_time = "00:00:00";
            var flight_return_time = "00:00:00";
            var round_trip_dep_arrival_window = "";
            var round_trip_return_dep_arrival_window = "";
        }

        var flight_preference = `<OriginDestinationInformation RPH="1"> 
            <DepartureDateTime>${flight_prefs.departureDate}T${flight_departure_time}</DepartureDateTime>
            ${round_trip_dep_arrival_window} 
            <OriginLocation LocationCode="${flight_prefs.departureOrigin}" /> 
            <DestinationLocation LocationCode="${flight_prefs.departureDestination}" /> 
        </OriginDestinationInformation> 
        <OriginDestinationInformation RPH="2"> 
            <DepartureDateTime>${flight_prefs.returnDate}T${flight_return_time}</DepartureDateTime> 
            ${round_trip_return_dep_arrival_window}
            <OriginLocation LocationCode="${flight_prefs.returnOrigin}" /> 
            <DestinationLocation LocationCode="${flight_prefs.returnDestination}" /> 
        </OriginDestinationInformation>`;
    }

    var sabre_endpoint = "https://webservices.havail.sabre.com";
    var headers_info = {
        headers: {
            'cache-control': 'no-cache',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'text/xml',
            'Cache-Control': 'no-cache',
            'Accept': '*/*',
            'Content-Type': 'text/xml'
        }
    };

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
        <soap-env:Envelope xmlns:soap-env='http://schemas.xmlsoap.org/soap/envelope/' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:xsd='http://www.w3.org/1999/XMLSchema'>
            <soap-env:Header>
                <eb:MessageHeader xmlns:eb='http://www.ebxml.org/namespaces/messageHeader'>
                        <eb:From>
                            <eb:PartyId eb:type='urn:x12.org.IO5:01'>Client</eb:PartyId>           
                        </eb:From>
                        <eb:To>
                            <eb:PartyId eb:type='urn:x12.org.IO5:01'>SWS</eb:PartyId>
                        </eb:To>
                        <eb:CAPId>${token_details.capid}</eb:CAPId>
                        <eb:ConversationId>${token_details.conversationid}</eb:ConversationId>
                        <eb:Service>Air Shopping Service</eb:Service>
                        <eb:Action>BargainFinderMaxRQ</eb:Action>
                        <eb:MessageData>
                            <eb:MessageId>${token_details.messageid}</eb:MessageId>
                            <eb:Timestamp>${token_details.timestamp}</eb:Timestamp>
                        </eb:MessageData>
                </eb:MessageHeader>
                <wsse:Security xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext">
                    <wsse:BinarySecurityToken valueType="String" EncodingType="wsse:Base64Binary">${token_details.token}</wsse:BinarySecurityToken>
                </wsse:Security>
            </soap-env:Header>
            <soap-env:Body>
            <OTA_AirLowFareSearchRQ xmlns:xs="http://www.w3.org/2020/XMLSchema" xmlns="http://www.opentravel.org/OTA/2003/05" xmlns:xsi="http://www.w3.org/2020/XMLSchema-instance" Target="Production" Version="6.4.0" ResponseType="OTA" ResponseVersion="6.4.0">
                <POS>
                    <Source PseudoCityCode="PCC">
                        <RequestorID ID="1" Type="1">
                            <CompanyName Code="TN"/>
                        </RequestorID>
                    </Source>
                </POS>
                    ${flight_preference}
                    ${exact_match}
                <TravelerInfoSummary>
                    <SeatsRequested>1</SeatsRequested>
                    <AirTravelerAvail>
                        <PassengerTypeQuantity Code="ADT" Quantity="1"/>
                    </AirTravelerAvail>
                    <PriceRequestInformation CurrencyCode="USD" />
                </TravelerInfoSummary>
                <TPA_Extensions>
                    <IntelliSellTransaction>
                        <RequestType Name="50ITINS"/>
                    </IntelliSellTransaction>
                </TPA_Extensions>
            </OTA_AirLowFareSearchRQ>  
            </soap-env:Body>
        </soap-env:Envelope>`;

    try
    {
        var api_response = await axios.post(sabre_endpoint, xml, headers_info);

        if (flight_prefs.flight_type == "oneway") {
            var flight_details = await parse_getFlightDetails_oneway(api_response.data, flight_prefs.departure_city, flight_prefs.destination_city, flight_prefs.departure_date, flight_prefs.departure_time);
        }

        else if( flight_prefs.flight_type == "roundtrip" )
        {
            var flight_details = await parse_getFlightDetails_roundtrip(api_response.data, flight_prefs.departureOrigin, flight_prefs.departureDestination, flight_prefs.returnOrigin, flight_prefs.returnDestination, flight_prefs.departureDate, flight_prefs.departureTime, flight_prefs.returnDate, flight_prefs.returnTime);
        }

        if (flight_details != null) {
            return flight_details;
        }
        else {
            return null;
        }
    }
    catch (error) {
        console.log(error.response.body);
        return [];
    }
}

async function parse_getFlightDetails_oneway(xml, departure_city, destination_city, departure_date, departure_time) {
    flight_details = [];

    parseString(xml, function (err, result) {

        try {
            if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body'] && result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]) {
                if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body'] && result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0] && result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]?.OTA_AirLowFareSearchRS && result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]?.OTA_AirLowFareSearchRS[0] && result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]?.OTA_AirLowFareSearchRS[0]?.PricedItineraries && result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]?.OTA_AirLowFareSearchRS[0]?.PricedItineraries[0] && result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]?.OTA_AirLowFareSearchRS[0]?.PricedItineraries[0]?.PricedItinerary) {
                    var avail_flights = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]?.OTA_AirLowFareSearchRS[0]?.PricedItineraries[0]?.PricedItinerary;

                    if (avail_flights != null && avail_flights != undefined && avail_flights.length > 0) {
                        var num_of_itins = avail_flights.length;

                        for (var i = 0; i < num_of_itins; i++) {

                            var flight_tmp = {};
                            flight_tmp['flightScheduleData'] = [];

                            flight_tmp.id = (i + 1);
                            flight_tmp.departure_city = departure_city;
                            flight_tmp.destination_city = destination_city;
                            flight_tmp.mainDepartDate = departure_date;
                            flight_tmp.mainDepartTime = departure_time;
                            flight_tmp.flightType = "oneway";

                            flight_tmp.pricingSource = avail_flights[i]?.AirItineraryPricingInfo[0]?.$?.PricingSource;
                            flight_tmp.pricingSubSource = avail_flights[i]?.AirItineraryPricingInfo[0]?.$?.PricingSubSource;
                            flight_tmp.lastTicketDate = avail_flights[i]?.AirItineraryPricingInfo[0]?.$?.LastTicketDate;
                            flight_tmp.lastTicketTime = avail_flights[i]?.AirItineraryPricingInfo[0]?.$?.LastTicketTime;
                            flight_tmp.FareReturned = avail_flights[i]?.AirItineraryPricingInfo[0]?.$?.FareReturned;
                            flight_tmp.baseFare = avail_flights[i]?.AirItineraryPricingInfo[0]?.ItinTotalFare[0]?.EquivFare[0]?.$?.Amount;
                            flight_tmp.taxAmount = avail_flights[i]?.AirItineraryPricingInfo[0]?.ItinTotalFare[0]?.Taxes[0]?.Tax[0]?.$?.Amount;
                            flight_tmp.currencyCode = avail_flights[i]?.AirItineraryPricingInfo[0]?.ItinTotalFare[0]?.TotalFare[0]?.$?.CurrencyCode;
                            flight_tmp.totalPrice = avail_flights[i]?.AirItineraryPricingInfo[0]?.ItinTotalFare[0]?.TotalFare[0]?.$?.Amount;
                            flight_tmp.cabin = avail_flights[i]?.AirItineraryPricingInfo[0]?.FareInfos[0]?.FareInfo[0]?.TPA_Extensions[0]?.Cabin[0]?.$?.Cabin;
                            flight_tmp.availSeats = avail_flights[i]?.AirItineraryPricingInfo[0]?.FareInfos[0]?.FareInfo[0]?.TPA_Extensions[0]?.SeatsRemaining[0]?.$?.Number;
                            flight_tmp.flightCarrier = avail_flights[i]?.TPA_Extensions[0]?.ValidatingCarrier[0]?.$?.Code;
                            var flight_segments = avail_flights[i]?.AirItinerary[0]?.OriginDestinationOptions[0]?.OriginDestinationOption[0]?.FlightSegment;
                            flight_tmp.numberOfLegs = flight_segments.length;

                            for (var j = 0; j < flight_segments.length; j++) {
                                var flight_schedule_tmp = {};

                                flight_schedule_tmp.arrialAirport = flight_segments[j]?.ArrivalAirport[0]?.$?.LocationCode;
                                flight_schedule_tmp.arrialAirportTerminal = flight_segments[j]?.ArrivalAirport[0]?.$?.TerminalID;
                                flight_schedule_tmp.arrivalCity = flight_segments[j]?.ArrivalAirport[0]?.$?.LocationCode;
                                flight_schedule_tmp.arrivalTime = flight_segments[j]?.$?.ArrivalDateTime;
                                flight_schedule_tmp.arrivalDateTime = flight_segments[j]?.$?.ArrivalDateTime;
                                flight_schedule_tmp.departureDateTime = flight_segments[j]?.$?.DepartureDateTime;
                                flight_schedule_tmp.deptTime = flight_segments[j]?.$?.DepartureDateTime;
                                flight_schedule_tmp.flight_departure_date = flight_segments[j]?.$?.DepartureDateTime;
                                flight_schedule_tmp.classOfService = flight_segments[j]?.$?.ResBookDesigCode;
                                flight_schedule_tmp.deptAirPort = flight_segments[j]?.DepartureAirport[0]?.$?.LocationCode;
                                flight_schedule_tmp.deptAirPortTerminal = flight_segments[j]?.DepartureAirport[0]?.$?.TerminalID;
                                flight_schedule_tmp.deptCity = flight_segments[j]?.DepartureAirport[0]?.$?.LocationCode;
                                flight_schedule_tmp.deptTerminal = flight_segments[j]?.DepartureAirport[0]?.$?.TerminalID;
                                flight_schedule_tmp.flightTotalMilesFlown = flight_segments[j]?.TPA_Extensions[0]?.Mileage[0]?.$?.Amount;
                                flight_schedule_tmp.fligtElapsedTime = flight_segments[j]?.$?.ElapsedTime;
                                flight_schedule_tmp.MarketflightNumber = flight_segments[j]?.$?.FlightNumber;
                                flight_schedule_tmp.MarketingCarrier = flight_segments[j]?.MarketingAirline[0]?.$?.Code;
                                flight_schedule_tmp.OperatflightNumber = flight_segments[j]?.OperatingAirline[0]?.$?.Code;
                                flight_schedule_tmp.equipType = flight_segments[j]?.Equipment?.[0]?.$?.AirEquipType;
                                flight_schedule_tmp.DepartureTimeZone = flight_segments[j]?.DepartureTimeZone[0]?.$?.GMTOffset;
                                flight_schedule_tmp.ArrivalTimeZone = flight_segments[j]?.ArrivalTimeZone[0]?.$?.GMTOffset;

                                flight_tmp['flightScheduleData'].push(flight_schedule_tmp);
                            }

                            flight_details.push(flight_tmp);
                        }
                    }
                }
                else {
                    flight_details = [];
                }
            }
            else {
                flight_details = [];
            }
        }
        catch (error) {
            console.log(error);
            flight_details = [];
        }
    });

    return flight_details;
}

async function parse_getFlightDetails_roundtrip(xml, departureOrigin, departureDestination, returnOrigin, returnDestination, departureDate, departureTime, returnDate, returnTime) {
    flight_details = [];

    parseString(xml, function (err, result) {
        try {

            if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body']) {
                if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['OTA_AirLowFareSearchRS']) {
                    if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body'] && result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0] && result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]?.OTA_AirLowFareSearchRS && result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]?.OTA_AirLowFareSearchRS[0] && result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]?.OTA_AirLowFareSearchRS[0]?.PricedItineraries && result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]?.OTA_AirLowFareSearchRS[0]?.PricedItineraries[0] && result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]?.OTA_AirLowFareSearchRS[0]?.PricedItineraries[0]?.PricedItinerary) {
                        var avail_flights = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]?.OTA_AirLowFareSearchRS[0]?.PricedItineraries[0]?.PricedItinerary;

                        if (avail_flights != null && avail_flights != undefined && avail_flights.length > 0) {
                            var num_of_itins = avail_flights.length;

                            for (var i = 0; i < num_of_itins; i++) {

                                var flight_tmp = {};
                                flight_tmp['flightScheduleData'] = [];

                                flight_tmp.id = (i + 1);
                                flight_tmp.departureOrigin = departureOrigin;
                                flight_tmp.departureDestination = departureDestination;
                                flight_tmp.returnOrigin = returnOrigin;
                                flight_tmp.returnDestination = returnDestination;
                                flight_tmp.departureDate = departureDate;
                                flight_tmp.departureTime = departureTime;
                                flight_tmp.returnDate = returnDate;
                                flight_tmp.returnTime = returnTime;
                                flight_tmp.flightType = "roundtrip";

                                flight_tmp.pricingSource = avail_flights[i]?.AirItineraryPricingInfo[0]?.$?.PricingSource;

                                flight_tmp.pricingSubSource = avail_flights[i]?.AirItineraryPricingInfo[0]?.$?.PricingSubSource;

                                flight_tmp.lastTicketDate = avail_flights[i]?.AirItineraryPricingInfo[0]?.$?.LastTicketDate;

                                flight_tmp.lastTicketTime = avail_flights[i]?.AirItineraryPricingInfo[0]?.$?.LastTicketTime;

                                flight_tmp.FareReturned = avail_flights[i]?.AirItineraryPricingInfo[0]?.$?.FareReturned;

                                flight_tmp.baseFare = check_undefine(result, avail_flights[i]['AirItineraryPricingInfo'][0]['ItinTotalFare'][0]['EquivFare'][0]['$']['Amount']) ? avail_flights[i]['AirItineraryPricingInfo'][0]['ItinTotalFare'][0]['EquivFare'][0]['$']['Amount'] : "Not Provided";
                                flight_tmp.taxAmount = check_undefine(result, avail_flights[i]['AirItineraryPricingInfo'][0]['ItinTotalFare'][0]['Taxes'][0]['Tax'][0]['$']['Amount']) ? avail_flights[i]['AirItineraryPricingInfo'][0]['ItinTotalFare'][0]['Taxes'][0]['Tax'][0]['$']['Amount'] : "Not Provided";
                                flight_tmp.currencyCode = check_undefine(result, avail_flights[i]['AirItineraryPricingInfo'][0]['ItinTotalFare'][0]['TotalFare'][0]['$']['CurrencyCode']) ? avail_flights[i]['AirItineraryPricingInfo'][0]['ItinTotalFare'][0]['TotalFare'][0]['$']['CurrencyCode'] : "Not Provided";
                                flight_tmp.totalPrice = check_undefine(result, avail_flights[i]['AirItineraryPricingInfo'][0]['ItinTotalFare'][0]['TotalFare'][0]['$']['Amount']) ? avail_flights[i]['AirItineraryPricingInfo'][0]['ItinTotalFare'][0]['TotalFare'][0]['$']['Amount'] : "Not Provided";
                                flight_tmp.cabin = check_undefine(result, avail_flights[i]['AirItineraryPricingInfo'][0]['FareInfos'][0]['FareInfo'][0]['TPA_Extensions'][0]['Cabin'][0]['$']['Cabin']) ? avail_flights[i]['AirItineraryPricingInfo'][0]['FareInfos'][0]['FareInfo'][0]['TPA_Extensions'][0]['Cabin'][0]['$']['Cabin'] : "Not Provided";
                                flight_tmp.availSeats = check_undefine(result, avail_flights[i]['AirItineraryPricingInfo'][0]['FareInfos'][0]['FareInfo'][0]['TPA_Extensions'][0]['SeatsRemaining'][0]['$']['Number']) ? avail_flights[i]['AirItineraryPricingInfo'][0]['FareInfos'][0]['FareInfo'][0]['TPA_Extensions'][0]['SeatsRemaining'][0]['$']['Number'] : "Not Provided";
                                flight_tmp.flightCarrier = check_undefine(result, avail_flights[i]['TPA_Extensions'][0]['ValidatingCarrier'][0]['$']['Code']) ? avail_flights[i]['TPA_Extensions'][0]['ValidatingCarrier'][0]['$']['Code'] : "Not Provided";

                                //For Oneway it will only be 1 and for round it will be 2
                                var origin_destination_options = avail_flights[i]['AirItinerary'][0]['OriginDestinationOptions'][0]['OriginDestinationOption'];

                                for (var l = 0; l < origin_destination_options.length; l++) {
                                    var flight_segments = avail_flights[i]['AirItinerary'][0]['OriginDestinationOptions'][0]['OriginDestinationOption'][l]['FlightSegment'];
                                    // flight_tmp.numberOfLegs        +=   flight_segments.length;

                                    for (var j = 0; j < flight_segments.length; j++) {
                                        var flight_schedule_tmp = {};

                                        flight_schedule_tmp.RPH = (l + 1);
                                        flight_schedule_tmp.arrialAirport = check_undefine(result, flight_segments[j]['ArrivalAirport'][0]['$']['LocationCode']) ? flight_segments[j]['ArrivalAirport'][0]['$']['LocationCode'] : "Not Provided";
                                        flight_schedule_tmp.arrialAirportTerminal = check_undefine(result, flight_segments[j]['ArrivalAirport'][0]['$']['TerminalID']) ? flight_segments[j]['ArrivalAirport'][0]['$']['TerminalID'] : "Not Provided";
                                        flight_schedule_tmp.arrivalCity = check_undefine(result, flight_segments[j]['ArrivalAirport'][0]['$']['LocationCode']) ? flight_segments[j]['ArrivalAirport'][0]['$']['LocationCode'] : "Not Provided";
                                        flight_schedule_tmp.arrivalTime = check_undefine(result, flight_segments[j]['$']['ArrivalDateTime']) ? flight_segments[j]['$']['ArrivalDateTime'] : "Not Provided";
                                        flight_schedule_tmp.arrivalDateTime = check_undefine(result, flight_segments[j]['$']['ArrivalDateTime']) ? flight_segments[j]['$']['ArrivalDateTime'] : "Not Provided";
                                        flight_schedule_tmp.departureDateTime = check_undefine(result, flight_segments[j]['$']['DepartureDateTime']) ? flight_segments[j]['$']['DepartureDateTime'] : "Not Provided";
                                        flight_schedule_tmp.deptTime = check_undefine(result, flight_segments[j]['$']['DepartureDateTime']) ? flight_segments[j]['$']['DepartureDateTime'] : "Not Provided";
                                        flight_schedule_tmp.flight_departure_date = check_undefine(result, flight_segments[j]['$']['DepartureDateTime']) ? flight_segments[j]['$']['DepartureDateTime'] : "Not Provided";
                                        flight_schedule_tmp.classOfService = check_undefine(result, flight_segments[j]['$']['ResBookDesigCode']) ? flight_segments[j]['$']['ResBookDesigCode'] : "Not Provided";
                                        flight_schedule_tmp.deptAirPort = check_undefine(result, flight_segments[j]['DepartureAirport'][0]['$']['LocationCode']) ? flight_segments[j]['DepartureAirport'][0]['$']['LocationCode'] : "Not Provided";
                                        flight_schedule_tmp.deptAirPortTerminal = check_undefine(result, flight_segments[j]['DepartureAirport'][0]['$']['TerminalID']) ? flight_segments[j]['DepartureAirport'][0]['$']['TerminalID'] : "Not Provided";
                                        flight_schedule_tmp.deptCity = check_undefine(result, flight_segments[j]['DepartureAirport'][0]['$']['LocationCode']) ? flight_segments[j]['DepartureAirport'][0]['$']['LocationCode'] : "Not Provided";
                                        flight_schedule_tmp.deptTerminal = check_undefine(result, flight_segments[j]['DepartureAirport'][0]['$']['TerminalID']) ? flight_segments[j]['DepartureAirport'][0]['$']['TerminalID'] : "Not Provided";
                                        flight_schedule_tmp.flightTotalMilesFlown = check_undefine(result, flight_segments[j]['TPA_Extensions'][0]['Mileage'][0]['$']['Amount']) ? flight_segments[j]['TPA_Extensions'][0]['Mileage'][0]['$']['Amount'] : "Not Provided";
                                        flight_schedule_tmp.fligtElapsedTime = check_undefine(result, flight_segments[j]['$']['ElapsedTime']) ? flight_segments[j]['$']['ElapsedTime'] : "Not Provided";
                                        flight_schedule_tmp.MarketflightNumber = check_undefine(result, flight_segments[j]['$']['FlightNumber']) ? flight_segments[j]['$']['FlightNumber'] : "Not Provided";
                                        flight_schedule_tmp.MarketingCarrier = check_undefine(result, flight_segments[j]['MarketingAirline'][0]['$']['Code']) ? flight_segments[j]['MarketingAirline'][0]['$']['Code'] : "Not Provided";
                                        flight_schedule_tmp.OperatflightNumber = check_undefine(result, flight_segments[j]['OperatingAirline'][0]['$']['Code']) ? flight_segments[j]['OperatingAirline'][0]['$']['Code'] : "Not Provided";
                                        flight_schedule_tmp.equipType = check_undefine(result, flight_segments[j]['Equipment'][0]['$']['AirEquipType']) ? flight_segments[j]['Equipment'][0]['$']['AirEquipType'] : "Not Provided";
                                        flight_schedule_tmp.DepartureTimeZone = check_undefine(result, flight_segments[j]['DepartureTimeZone'][0]['$']['GMTOffset']) ? flight_segments[j]['DepartureTimeZone'][0]['$']['GMTOffset'] : "Not Provided";
                                        flight_schedule_tmp.ArrivalTimeZone = check_undefine(result, flight_segments[j]['ArrivalTimeZone'][0]['$']['GMTOffset']) ? flight_segments[j]['ArrivalTimeZone'][0]['$']['GMTOffset'] : "Not Provided";


                                        flight_tmp['flightScheduleData'].push(flight_schedule_tmp);
                                    }
                                }

                                flight_tmp.numberOfLegs = flight_tmp['flightScheduleData'].length;
                                flight_details.push(flight_tmp);

                            }
                        }
                    }
                    else {
                        flight_details = [];
                    }
                }
                else {
                    flight_details = [];
                }
            }
            else {
                flight_details = [];
            }
        }
        catch (error) {
            console.log(error);
            flight_details = [];
        }
    });

    return flight_details;
}

async function validate_itinerary_oneway(token_details, flight_details) {

    var legs_details = flight_details.flightScheduleData;

    var flight_scedule_details = ``;

    for (var i = 0; i < legs_details.length; i++) {
        flight_scedule_details += `<Flight ArrivalDateTime="${legs_details[i].arrivalDateTime}" ClassOfService="${legs_details[i].classOfService}" DepartureDateTime="${legs_details[i].departureDateTime}" Number="${legs_details[i].MarketflightNumber}"> <OriginLocation LocationCode="${legs_details[i].deptAirPort}"/> <DestinationLocation LocationCode="${legs_details[i].arrialAirport}"/> <Airline Marketing="${legs_details[i].MarketingCarrier}" Operating="${legs_details[i].OperatflightNumber}"/> </Flight>`
    }

    var sabre_endpoint = "https://webservices.havail.sabre.com";
    var headers_info = {
        headers: {
            'cache-control': 'no-cache',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'text/xml',
            'Cache-Control': 'no-cache',
            'Accept': '*/*',
            'Content-Type': 'text/xml'
        }
    };
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
                    <soap-env:Envelope
                    xmlns:soap-env='http://schemas.xmlsoap.org/soap/envelope/'
                    xmlns:xlink='http://www.w3.org/1999/xlink'
                    xmlns:xsd='http://www.w3.org/1999/XMLSchema'>
                        <soap-env:Header>
                            <eb:MessageHeader
                            xmlns:eb='http://www.ebxml.org/namespaces/messageHeader'>
                                    <eb:From>
                                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>Client</eb:PartyId>           
                                    </eb:From>
                                    <eb:To>
                                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>SWS</eb:PartyId>
                                    </eb:To>
                                    <eb:CAPId>${token_details.capid}</eb:CAPId>
                                    <eb:ConversationId>${token_details.conversationid}</eb:ConversationId>
                                    <eb:Action>RevalidateItinRQ</eb:Action>
                                    <eb:MessageData>
                                        <eb:MessageId>${token_details.messageid}</eb:MessageId>
                                        <eb:Timestamp>${token_details.timestamp}</eb:Timestamp>
                                    </eb:MessageData>
                            </eb:MessageHeader>
                            <wsse:Security
                            xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext">
                                <wsse:BinarySecurityToken valueType="String" EncodingType="wsse:Base64Binary">${token_details.token}</wsse:BinarySecurityToken>
                            </wsse:Security>
                        </soap-env:Header>
                        <soap-env:Body>
                        <OTA_AirLowFareSearchRQ xmlns="http://www.opentravel.org/OTA/2003/05" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ResponseType="OTA" ResponseVersion="6.4.0" SeparateMessages="true" Target="Production" TruncateMessages="false" Version="6.4.0">
                            <POS>
                                <Source PseudoCityCode="PCC">
                                    <RequestorID ID="1" Type="1">
                                    <CompanyName Code="TN"/>
                                    </RequestorID>
                                </Source>
                            </POS>
                            <OriginDestinationInformation RPH="1">
                            <DepartureDateTime>${legs_details[0].departureDateTime}</DepartureDateTime>
                            <OriginLocation LocationCode="${flight_details.departure_city}" LocationType="A"/>
                            <DestinationLocation LocationCode="${flight_details.destination_city}" LocationType="A"/>
                            <TPA_Extensions>
                                ${flight_scedule_details}
                            </TPA_Extensions>
                            </OriginDestinationInformation>
                            <TravelPreferences>
                            <TPA_Extensions>
                                <VerificationItinCallLogic AlwaysCheckAvailability="true"/>
                            </TPA_Extensions>
                            </TravelPreferences>
                            <TravelerInfoSummary>
                            <SeatsRequested>1</SeatsRequested>
                            <AirTravelerAvail>
                                <PassengerTypeQuantity Code="ADT" Quantity="1">
                                <TPA_Extensions>
                                    <VoluntaryChanges Match="Info"/>
                                </TPA_Extensions>
                                </PassengerTypeQuantity>
                            </AirTravelerAvail>
                            <PriceRequestInformation NegotiatedFaresOnly="false" CurrencyCode="USD" ProcessThruFaresOnly="false">
                            </PriceRequestInformation>
                            </TravelerInfoSummary>
                            <TPA_Extensions>
                            <IntelliSellTransaction>
                                <RequestType Name="REVALIDATE"/>
                                <ServiceTag Name="REVALIDATE"/>
                            </IntelliSellTransaction>
                            </TPA_Extensions>
                        </OTA_AirLowFareSearchRQ>
                        </soap-env:Body>
                    </soap-env:Envelope>`
    try {
        var api_response = await axios.post(sabre_endpoint, xml, headers_info);
        var flight_details = await parse_validate_itinerary_oneway(api_response.data);

        if (flight_details != null) {
            return flight_details;
        }
        else {
            return null;
        }

    }
    catch (error) {
        console.log(error);
        return null;
    }
}

async function parse_validate_itinerary_oneway(xml) {
    var flight_tmp = {};

    parseString(xml, function (err, result) {
        try {
            if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body']) {
                if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]?.OTA_AirLowFareSearchRS[0]?.$?.PricedItinCount) {
                    if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]?.OTA_AirLowFareSearchRS[0]?.PricedItineraries[0]?.PricedItinerary[0]) {
                        var avail_flights = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]?.OTA_AirLowFareSearchRS[0]?.PricedItineraries[0]?.PricedItinerary[0];

                        flight_tmp['flightScheduleData'] = [];
                        flight_tmp.pricingSource = avail_flights?.AirItineraryPricingInfo[0]?.$?.PricingSource;
                        flight_tmp.pricingSubSource = avail_flights?.AirItineraryPricingInfo[0]?.$?.PricingSubSource;
                        flight_tmp.lastTicketDate = avail_flights?.AirItineraryPricingInfo[0]?.$?.LastTicketDate;
                        flight_tmp.lastTicketTime = avail_flights?.AirItineraryPricingInfo[0]?.$?.LastTicketTime;
                        flight_tmp.FareReturned = avail_flights?.AirItineraryPricingInfo[0]?.$?.FareReturned;
                        flight_tmp.baseFare = avail_flights?.AirItineraryPricingInfo[0]?.ItinTotalFare[0]?.EquivFare[0]?.$?.Amount;
                        flight_tmp.taxAmount = avail_flights?.AirItineraryPricingInfo[0]?.ItinTotalFare[0]?.Taxes[0]?.Tax[0]?.$?.Amount;
                        flight_tmp.currencyCode = avail_flights?.AirItineraryPricingInfo[0]?.ItinTotalFare[0]?.TotalFare[0]?.$?.CurrencyCode;
                        flight_tmp.totalPrice = avail_flights?.AirItineraryPricingInfo[0]?.ItinTotalFare[0]?.TotalFare[0]?.$?.Amount;
                        flight_tmp.cabin = avail_flights?.AirItineraryPricingInfo[0]?.FareInfos[0]?.FareInfo[0]?.TPA_Extensions[0]?.Cabin[0]?.$?.Cabin;
                        flight_tmp.availSeats = avail_flights?.AirItineraryPricingInfo[0]?.FareInfos[0]?.FareInfo[0]?.TPA_Extensions[0]?.SeatsRemaining[0]?.$?.Number;
                        flight_tmp.flightCarrier = avail_flights?.TPA_Extensions[0]?.ValidatingCarrier[0]?.$?.Code;
                        var flight_segments = avail_flights?.AirItinerary[0]?.OriginDestinationOptions[0]?.OriginDestinationOption[0]?.FlightSegment;

                        (flight_segments) ? flight_tmp.numberOfLegs = flight_segments.length : flight_tmp.numberOfLegs = 0;

                        for (var j = 0; j < flight_segments.length; j++) {
                            var flight_schedule_tmp = {};

                            flight_schedule_tmp.arrialAirport = flight_segments[j]?.ArrivalAirport[0]?.$?.LocationCode;
                            flight_schedule_tmp.arrialAirportTerminal = flight_segments[j]?.ArrivalAirport[0]?.$?.TerminalID;
                            flight_schedule_tmp.arrivalCity = flight_segments[j]?.ArrivalAirport[0]?.$?.LocationCode;
                            flight_schedule_tmp.arrivalTime = flight_segments[j]?.$?.ArrivalDateTime;
                            flight_schedule_tmp.arrivalDateTime = flight_segments[j]?.$?.ArrivalDateTime;
                            flight_schedule_tmp.departureDateTime = flight_segments[j]?.$?.DepartureDateTime;
                            flight_schedule_tmp.deptTime = flight_segments[j]?.$?.DepartureDateTime;
                            flight_schedule_tmp.flight_departure_date = flight_segments[j]?.$?.DepartureDateTime;
                            flight_schedule_tmp.classOfService = flight_segments[j]?.$?.ResBookDesigCode;
                            flight_schedule_tmp.deptAirPort = flight_segments[j]?.DepartureAirport[0]?.$?.LocationCode;
                            flight_schedule_tmp.deptAirPortTerminal = flight_segments[j]?.DepartureAirport[0]?.$?.TerminalID;
                            flight_schedule_tmp.deptCity = flight_segments[j]?.DepartureAirport[0]?.$?.LocationCode;
                            flight_schedule_tmp.deptTerminal = flight_segments[j]?.DepartureAirport[0]?.$?.TerminalID;
                            flight_schedule_tmp.flightTotalMilesFlown = flight_segments[j]?.TPA_Extensions[0]?.Mileage[0]?.$?.Amount;
                            flight_schedule_tmp.fligtElapsedTime = flight_segments[j]?.$?.ElapsedTime;
                            flight_schedule_tmp.MarketflightNumber = flight_segments[j]?.$?.FlightNumber;
                            flight_schedule_tmp.MarketingCarrier = flight_segments[j]?.MarketingAirline[0]?.$?.Code;
                            flight_schedule_tmp.OperatflightNumber = flight_segments[j]?.OperatingAirline[0]?.$?.Code;
                            flight_schedule_tmp.equipType = flight_segments[j]?.Equipment[0]?.$?.AirEquipType;
                            flight_schedule_tmp.DepartureTimeZone = flight_segments[j]?.DepartureTimeZone[0]?.$?.GMTOffset;
                            flight_schedule_tmp.ArrivalTimeZone = flight_segments[j]?.ArrivalTimeZone[0]?.$?.GMTOffset;

                            flight_tmp['flightScheduleData'].push(flight_schedule_tmp);
                        }
                    }
                    else {
                        flight_tmp = null;
                    }
                }
                else {
                    flight_tmp = null;
                }
            }
            else {
                flight_tmp = null;
            }
        }
        catch (error) {
            flight_tmp = null;
        }
    });

    return flight_tmp;
}

async function parse_validate_itinerary_roundtrip(xml) {
    var flight_tmp = {};

    parseString(xml, function (err, result) {
        try {
            if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body']) {
                if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]?.OTA_AirLowFareSearchRS[0]?.$?.PricedItinCount) {
                    if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]?.OTA_AirLowFareSearchRS[0]?.PricedItineraries[0]?.PricedItinerary[0]) {
                        var avail_flights = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]?.OTA_AirLowFareSearchRS[0]?.PricedItineraries[0]?.PricedItinerary[0];

                        flight_tmp['flightScheduleData'] = [];
                        flight_tmp.pricingSource = avail_flights?.AirItineraryPricingInfo[0]?.$?.PricingSource;
                        flight_tmp.pricingSubSource = avail_flights?.AirItineraryPricingInfo[0]?.$?.PricingSubSource;
                        flight_tmp.lastTicketDate = avail_flights?.AirItineraryPricingInfo[0]?.$?.LastTicketDate;
                        flight_tmp.lastTicketTime = avail_flights?.AirItineraryPricingInfo[0]?.$?.LastTicketTime;
                        flight_tmp.FareReturned = avail_flights?.AirItineraryPricingInfo[0]?.$?.FareReturned;
                        flight_tmp.baseFare = avail_flights?.AirItineraryPricingInfo[0]?.ItinTotalFare[0]?.EquivFare[0]?.$?.Amount;
                        flight_tmp.taxAmount = avail_flights?.AirItineraryPricingInfo[0]?.ItinTotalFare[0]?.Taxes[0]?.Tax[0]?.$?.Amount;
                        flight_tmp.currencyCode = avail_flights?.AirItineraryPricingInfo[0]?.ItinTotalFare[0]?.TotalFare[0]?.$?.CurrencyCode;
                        flight_tmp.totalPrice = avail_flights?.AirItineraryPricingInfo[0]?.ItinTotalFare[0]?.TotalFare[0]?.$?.Amount;
                        flight_tmp.cabin = avail_flights?.AirItineraryPricingInfo[0]?.FareInfos[0]?.FareInfo[0]?.TPA_Extensions[0]?.Cabin[0]?.$?.Cabin;
                        flight_tmp.availSeats = avail_flights?.AirItineraryPricingInfo[0]?.FareInfos[0]?.FareInfo[0]?.TPA_Extensions[0]?.SeatsRemaining[0]?.$?.Number;
                        flight_tmp.flightCarrier = avail_flights?.TPA_Extensions[0]?.ValidatingCarrier[0]?.$?.Code;

                        var num_of_flights = avail_flights?.AirItinerary[0]?.OriginDestinationOptions[0]?.OriginDestinationOption;

                        for (var k = 0; k < num_of_flights.length; k++) {
                            var flight_segments = avail_flights?.AirItinerary[0]?.OriginDestinationOptions[0]?.OriginDestinationOption[k]?.FlightSegment;
                            (flight_segments) ? flight_tmp.numberOfLegs = flight_segments.length : flight_tmp.numberOfLegs = 0;

                            for (var j = 0; j < flight_segments.length; j++) {
                                var flight_schedule_tmp = {};

                                flight_schedule_tmp.RPH = (k + 1);
                                flight_schedule_tmp.arrialAirport = flight_segments[j]?.ArrivalAirport[0]?.$?.LocationCode;
                                flight_schedule_tmp.arrialAirportTerminal = flight_segments[j]?.ArrivalAirport[0]?.$?.TerminalID;
                                flight_schedule_tmp.arrivalCity = flight_segments[j]?.ArrivalAirport[0]?.$?.LocationCode;
                                flight_schedule_tmp.arrivalTime = flight_segments[j]?.$?.ArrivalDateTime;
                                flight_schedule_tmp.arrivalDateTime = flight_segments[j]?.$?.ArrivalDateTime;
                                flight_schedule_tmp.departureDateTime = flight_segments[j]?.$?.DepartureDateTime;
                                flight_schedule_tmp.deptTime = flight_segments[j]?.$?.DepartureDateTime;
                                flight_schedule_tmp.flight_departure_date = flight_segments[j]?.$?.DepartureDateTime;
                                flight_schedule_tmp.classOfService = flight_segments[j]?.$?.ResBookDesigCode;
                                flight_schedule_tmp.deptAirPort = flight_segments[j]?.DepartureAirport[0]?.$?.LocationCode;
                                flight_schedule_tmp.deptAirPortTerminal = flight_segments[j]?.DepartureAirport[0]?.$?.TerminalID;
                                flight_schedule_tmp.deptCity = flight_segments[j]?.DepartureAirport[0]?.$?.LocationCode;
                                flight_schedule_tmp.deptTerminal = flight_segments[j]?.DepartureAirport[0]?.$?.TerminalID;
                                flight_schedule_tmp.flightTotalMilesFlown = flight_segments[j]?.TPA_Extensions[0]?.Mileage[0]?.$?.Amount;
                                flight_schedule_tmp.fligtElapsedTime = flight_segments[j]?.$?.ElapsedTime;
                                flight_schedule_tmp.MarketflightNumber = flight_segments[j]?.$?.FlightNumber;
                                flight_schedule_tmp.MarketingCarrier = flight_segments[j]?.MarketingAirline[0]?.$?.Code;
                                flight_schedule_tmp.OperatflightNumber = flight_segments[j]?.OperatingAirline[0]?.$?.Code;
                                flight_schedule_tmp.equipType = flight_segments[j]?.Equipment[0]?.$?.AirEquipType;
                                flight_schedule_tmp.DepartureTimeZone = flight_segments[j]?.DepartureTimeZone[0]?.$?.GMTOffset;
                                flight_schedule_tmp.ArrivalTimeZone = flight_segments[j]?.ArrivalTimeZone[0]?.$?.GMTOffset;

                                flight_tmp['flightScheduleData'].push(flight_schedule_tmp);
                            }

                        }
                    }
                    else {
                        flight_tmp = null;
                    }
                }
                else {
                    flight_tmp = null;
                }
            }
            else {
                flight_tmp = null;
            }
        }
        catch (error) {
            flight_tmp = null;
        }
    });

    return flight_tmp;
}

async function validate_itinerary_roundtrip(token_details, flight_details) {
    var legs_details = flight_details.flightScheduleData;
    var rph_one = legs_details.filter(function (legs_details) {
        return legs_details.RPH === 1;
    });
    var rph_two = legs_details.filter(function (legs_details) {
        return legs_details.RPH != 1;
    });
    var flight_scedule_details_RPH1 = ``;
    var flight_scedule_details_RPH2 = ``;
    var flight_scedule_sub_details_RPH1 = ``;
    var flight_scedule_sub_details_RPH2 = ``;

    for (var i = 0; i < legs_details.length; i++) {
        if (legs_details[i].RPH == 1) {
            flight_scedule_sub_details_RPH1 += `<Flight ArrivalDateTime="${legs_details[i].arrivalDateTime}" ClassOfService="${legs_details[i].classOfService}" DepartureDateTime="${legs_details[i].departureDateTime}" Number="${legs_details[i].MarketflightNumber}"> <OriginLocation LocationCode="${legs_details[i].deptAirPort}"/> <DestinationLocation LocationCode="${legs_details[i].arrialAirport}"/> <Airline Marketing="${legs_details[i].MarketingCarrier}" Operating="${legs_details[i].OperatflightNumber}"/> </Flight>`
        }
        else {
            flight_scedule_sub_details_RPH2 += `<Flight ArrivalDateTime="${legs_details[i].arrivalDateTime}" ClassOfService="${legs_details[i].classOfService}" DepartureDateTime="${legs_details[i].departureDateTime}" Number="${legs_details[i].MarketflightNumber}"> <OriginLocation LocationCode="${legs_details[i].deptAirPort}"/> <DestinationLocation LocationCode="${legs_details[i].arrialAirport}"/> <Airline Marketing="${legs_details[i].MarketingCarrier}" Operating="${legs_details[i].OperatflightNumber}"/> </Flight>`
        }
    }

    flight_scedule_details_RPH1 = ` <OriginDestinationInformation RPH="1">
                                        <DepartureDateTime>${rph_one[0].departureDateTime}</DepartureDateTime>
                                        <OriginLocation LocationCode="${flight_details.departureOrigin}" LocationType="A"/>
                                        <DestinationLocation LocationCode="${flight_details.departureDestination}" LocationType="A"/>
                                        <TPA_Extensions>
                                            ${flight_scedule_sub_details_RPH1}
                                        </TPA_Extensions>
                                    </OriginDestinationInformation>`;

    flight_scedule_details_RPH2 = ` <OriginDestinationInformation RPH="2">
                                    <DepartureDateTime>${rph_two[0].departureDateTime}</DepartureDateTime>
                                    <OriginLocation LocationCode="${flight_details.returnOrigin}" LocationType="A"/>
                                    <DestinationLocation LocationCode="${flight_details.returnDestination}" LocationType="A"/>
                                    <TPA_Extensions>
                                        ${flight_scedule_sub_details_RPH2}
                                    </TPA_Extensions>
                                </OriginDestinationInformation>`;

    var sabre_endpoint = "https://webservices.havail.sabre.com";
    var headers_info = {
        headers: {
            'cache-control': 'no-cache',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'text/xml',
            'Cache-Control': 'no-cache',
            'Accept': '*/*',
            'Content-Type': 'text/xml'
        }
    };
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
                    <soap-env:Envelope
                    xmlns:soap-env='http://schemas.xmlsoap.org/soap/envelope/'
                    xmlns:xlink='http://www.w3.org/1999/xlink'
                    xmlns:xsd='http://www.w3.org/1999/XMLSchema'>
                        <soap-env:Header>
                            <eb:MessageHeader
                            xmlns:eb='http://www.ebxml.org/namespaces/messageHeader'>
                                    <eb:From>
                                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>Client</eb:PartyId>           
                                    </eb:From>
                                    <eb:To>
                                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>SWS</eb:PartyId>
                                    </eb:To>
                                    <eb:CAPId>${token_details.capid}</eb:CAPId>
                                    <eb:ConversationId>${token_details.conversationid}</eb:ConversationId>
                                    <eb:Action>RevalidateItinRQ</eb:Action>
                                    <eb:MessageData>
                                        <eb:MessageId>${token_details.messageid}</eb:MessageId>
                                        <eb:Timestamp>${token_details.timestamp}</eb:Timestamp>
                                    </eb:MessageData>
                            </eb:MessageHeader>
                            <wsse:Security
                            xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext">
                                <wsse:BinarySecurityToken valueType="String" EncodingType="wsse:Base64Binary">${token_details.token}</wsse:BinarySecurityToken>
                            </wsse:Security>
                        </soap-env:Header>
                        <soap-env:Body>
                        <OTA_AirLowFareSearchRQ xmlns="http://www.opentravel.org/OTA/2003/05" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ResponseType="OTA" ResponseVersion="6.4.0" SeparateMessages="true" Target="Production" TruncateMessages="false" Version="6.4.0">
                            <POS>
                                <Source PseudoCityCode="PCC">
                                    <RequestorID ID="1" Type="1">
                                    <CompanyName Code="TN"/>
                                    </RequestorID>
                                </Source>
                            </POS>
                            ${flight_scedule_details_RPH1}
                            ${flight_scedule_details_RPH2}
                            <TravelPreferences>
                                <TPA_Extensions>
                                    <VerificationItinCallLogic AlwaysCheckAvailability="true"/>
                                </TPA_Extensions>
                            </TravelPreferences>
                            <TravelerInfoSummary>
                            <SeatsRequested>1</SeatsRequested>
                            <AirTravelerAvail>
                                <PassengerTypeQuantity Code="ADT" Quantity="1">
                                <TPA_Extensions>
                                    <VoluntaryChanges Match="Info"/>
                                </TPA_Extensions>
                                </PassengerTypeQuantity>
                            </AirTravelerAvail>
                            <PriceRequestInformation NegotiatedFaresOnly="false" CurrencyCode="USD" ProcessThruFaresOnly="false">
                            </PriceRequestInformation>
                            </TravelerInfoSummary>
                            <TPA_Extensions>
                            <IntelliSellTransaction>
                                <RequestType Name="REVALIDATE"/>
                                <ServiceTag Name="REVALIDATE"/>
                            </IntelliSellTransaction>
                            </TPA_Extensions>
                        </OTA_AirLowFareSearchRQ>
                        </soap-env:Body>
                    </soap-env:Envelope>`

    try {
        var api_response = await axios.post(sabre_endpoint, xml, headers_info);
        var flight_details = await parse_validate_itinerary_roundtrip(api_response.data);

        if (flight_details != null) {
            return flight_details;
        }
        else {
            return null;
        }

    }
    catch (error) {
        console.log(error);
        return null;
    }
}

//--------------------------------------------------------------------------------------------------------------------- */
// ------------------------------------------------   Hotel Search    -------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------- */

async function getHotelSearch(token_details, city_code , hotel_name)
{

    if( hotel_name )
    {
        hotel_name = `HotelName="${hotel_name}"`;
    }
    else {
        hotel_name = ``;
    }

    var sabre_endpoint = "https://webservices.havail.sabre.com";
    var headers_info = {
        headers: {
            'cache-control': 'no-cache',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'text/xml',
            'Cache-Control': 'no-cache',
            'Accept': '*/*',
            'Content-Type': 'text/xml'
        }
    };

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <soap-env:Envelope
    xmlns:soap-env='http://schemas.xmlsoap.org/soap/envelope/'
    xmlns:xlink='http://www.w3.org/1999/xlink'
    xmlns:xsd='http://www.w3.org/1999/XMLSchema'>
        <soap-env:Header>
            <eb:MessageHeader
            xmlns:eb='http://www.ebxml.org/namespaces/messageHeader'>
                    <eb:From>
                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>Client</eb:PartyId>           
                    </eb:From>
                    <eb:To>
                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>Sabre</eb:PartyId>
                    </eb:To>
                    <eb:CAPId>${token_details.capid}</eb:CAPId>
                    <eb:ConversationId>${token_details.conversationid}</eb:ConversationId>
                    <eb:Service></eb:Service>
                    <eb:Action>HotelSearchRQ</eb:Action>
                    <eb:MessageData>
                        <eb:MessageId>${token_details.messageid}</eb:MessageId>
                        <eb:Timestamp>${token_details.timestamp}</eb:Timestamp>
                    </eb:MessageData>
            </eb:MessageHeader>
            <wsse:Security
            xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext">
                <wsse:BinarySecurityToken valueType="String" EncodingType="wsse:Base64Binary">${token_details.token}</wsse:BinarySecurityToken>
            </wsse:Security>
        </soap-env:Header>
        <soap-env:Body>
            <HotelSearchRQ xmlns="http://services.sabre.com/hotel/hsearch/v2"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="2.0.0" xsi:schemaLocation="http://services.sabre.com/hotel/hsearch/v2/HotelSearchRQ_v2.xsd">
                <SearchCriteria SortBy="DistanceFrom" MaxResults="5" SortOrder="ASC" TierLabels="true">
                    <GeoSearch>
                        <GeoRef Radius="50" UOM="MI">
                            <RefPoint Value="${city_code}" ValueContext="CODE" RefPointType="6"/>
                        </GeoRef>
                    </GeoSearch>
                    <HotelPref ${hotel_name}>
                        <SabreRating Min="1.0" Max="5.0"/>
                    </HotelPref>
                    <ImageRef Type="MEDIUM" CategoryCode="1" LanguageCode="EN"/>
                </SearchCriteria>
            </HotelSearchRQ>
        </soap-env:Body>
    </soap-env:Envelope>`

    try {
        var api_response = await axios.post(sabre_endpoint, xml, headers_info);
        var hotel_data_array = await doParseHotelData(api_response.data);

        if (hotel_data_array && hotel_data_array.length != 0) {
            return hotel_data_array;
        }
        else {
            return [];
        }
    }
    catch (error) {
        console.log(error);
        return [];
    }
}

async function doParseHotelData(xml) {
    var hotel_data_array = [];

    parseString(xml, async function (err, result) {
        try {
            ns = null;
            for (var f = 0; f < 40; f++) {
                if (result['soap-env:Envelope']['soap-env:Body'][0][`ns${f}:HotelSearchRS`]) {
                    ns = `ns${f}`;
                    break;
                }
            }

            if (result['soap-env:Envelope']['soap-env:Body']) {

                if (result['soap-env:Envelope']['soap-env:Body'] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns}:HotelSearchRS`] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns}:HotelSearchRS`][0][`${ns}:HotelSearchInfos`] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns}:HotelSearchRS`][0][`${ns}:HotelSearchInfos`][0][`${ns}:HotelSearchInfo`]) {
                    hotel_data = result['soap-env:Envelope']['soap-env:Body'][0][`${ns}:HotelSearchRS`][0][`${ns}:HotelSearchInfos`][0][`${ns}:HotelSearchInfo`];

                    if (hotel_data != null && hotel_data != undefined && hotel_data.length != 0) {
                        for (i = 0; i < hotel_data.length; i++) {
                            tmp_obj = {};
                            amenities_array = [];
                            current_obj = hotel_data[i];

                            if (current_obj[`${ns}:HotelInfo`] && current_obj[`${ns}:HotelInfo`][0][`${ns}:Amenities`]) {
                                tmp_obj['hotel_name'] = current_obj[`${ns}:HotelInfo`][0]?.$?.HotelName;

                                //Hotel Image
                                if (current_obj[`${ns}:HotelImageInfo`] && current_obj[`${ns}:HotelImageInfo`][0][`${ns}:ImageItem`] && current_obj[`${ns}:HotelImageInfo`][0][`${ns}:ImageItem`][0][`${ns}:Image`]) {
                                    tmp_obj['hotel_image'] = current_obj[`${ns}:HotelImageInfo`][0][`${ns}:ImageItem`][0][`${ns}:Image`][0]?.$?.Url;
                                }
                                else {
                                    tmp_obj['hotel_image'] = null;
                                }

                                //Hotel Code
                                if (current_obj[`${ns}:HotelInfo`] && current_obj[`${ns}:HotelInfo`][0]?.$?.HotelCode) {
                                    tmp_obj['sabre_hotel_code'] = current_obj[`${ns}:HotelInfo`][0]?.$?.HotelCode;
                                }
                                else {
                                    tmp_obj['sabre_hotel_code'] = null;
                                }

                                //Sabre Hotel Code
                                if (current_obj[`${ns}:HotelInfo`] && current_obj[`${ns}:HotelInfo`][0]?.$?.HotelCode) {
                                    tmp_obj['hotel_code'] = current_obj[`${ns}:HotelInfo`][0]['$']['HotelCode'];
                                }
                                else {
                                    tmp_obj['hotel_code'] = null;
                                }

                                //Longitude
                                if (current_obj[`${ns}:HotelInfo`] && current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`] && current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`][0]?.$?.Longitude) {
                                    tmp_obj['Longitude'] = current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`][0]?.$?.Longitude;
                                }
                                else {
                                    tmp_obj['Longitude'] = null;
                                }

                                //Lattitude
                                if (current_obj[`${ns}:HotelInfo`] && current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`] && current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`][0]?.$?.Latitude) {
                                    tmp_obj['Latitude'] = current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`][0]?.$?.Latitude;
                                }
                                else {
                                    tmp_obj['Latitude'] = null;
                                }

                                //Hotel Phone
                                if (current_obj[`${ns}:HotelInfo`] && current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`] && current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`][0][`${ns}:Contact`] && current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`][0][`${ns}:Contact`][0]?.$?.Phone) {
                                    tmp_obj['hotel_phone'] = current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`][0][`${ns}:Contact`][0]?.$?.Phone;
                                }
                                else {
                                    tmp_obj['hotel_phone'] = null;
                                }

                                //Hotel Address Part 1
                                if (current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`][0][`${ns}:Address`][0][`${ns}:AddressLine1`][0]) {
                                    tmp_obj['address_part1'] = current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`][0][`${ns}:Address`][0][`${ns}:AddressLine1`][0];
                                }
                                else {
                                    tmp_obj['address_part1'] = null;
                                }

                                //Hotel Address Part 2
                                if (current_obj[`${ns}:HotelInfo`] && current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`] && current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`][0][`${ns}:Address`] && current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`][0][`${ns}:Address`][0][`${ns}:CityName`] && current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`][0][`${ns}:Address`][0][`${ns}:CityName`][0]?._) {
                                    tmp_obj['address_part2'] = current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`][0][`${ns}:Address`][0][`${ns}:CityName`][0]?._;
                                }
                                else {
                                    tmp_obj['address_part2'] = null;
                                }

                                //Hotel Address Part 3
                                if (current_obj[`${ns}:HotelInfo`] && current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`] && current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`][0][`${ns}:Address`] && current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`][0][`${ns}:Address`][0][`${ns}:CountryName`] && current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`][0][`${ns}:Address`][0][`${ns}:CountryName`][0]?._) {
                                    tmp_obj['adress_part3'] = current_obj[`${ns}:HotelInfo`][0][`${ns}:LocationInfo`][0][`${ns}:Address`][0][`${ns}:CountryName`][0]?._;
                                }
                                else {
                                    tmp_obj['adress_part3'] = null;
                                }

                                //Hotel Amenities
                                if (current_obj[`${ns}:HotelInfo`] && current_obj[`${ns}:HotelInfo`][0][`${ns}:Amenities`] && current_obj[`${ns}:HotelInfo`][0][`${ns}:Amenities`][0][`${ns}:Amenity`]) {
                                    amentities = current_obj[`${ns}:HotelInfo`][0][`${ns}:Amenities`][0][`${ns}:Amenity`];

                                    if (amentities.length > 0) {
                                        for (j = 0; j < amentities.length; j++) {
                                            amenities_array.push(amentities[j]['$']['Description']);
                                        }
                                        tmp_obj['amenities_array'] = amenities_array;
                                    }

                                }

                                hotel_data_array.push(tmp_obj);
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    });

    if (hotel_data_array.length != 0) {
        return hotel_data_array;
    }
    else {
        return [];
    }
}

async function getHotelDetail(token_details, hotel_code, check_in_date, check_out_date, room_type) {
    if (room_type != undefined && room_type != "" && room_type != null) {
        room_type = `<RoomTypeCodes> <RoomTypeCode Code="${room_type}"/> </RoomTypeCodes> `;
    }
    else {
        room_type = ``;
    }

    var sabre_endpoint = "https://webservices.havail.sabre.com";
    var headers_info = {
        headers: {
            'cache-control': 'no-cache',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'text/xml',
            'Cache-Control': 'no-cache',
            'Accept': '*/*',
            'Content-Type': 'text/xml'
        }
    };

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <soap-env:Envelope
    xmlns:soap-env='http://schemas.xmlsoap.org/soap/envelope/'
    xmlns:xlink='http://www.w3.org/1999/xlink'
    xmlns:xsd='http://www.w3.org/1999/XMLSchema'>
        <soap-env:Header>
            <eb:MessageHeader
            xmlns:eb='http://www.ebxml.org/namespaces/messageHeader'>
                    <eb:From>
                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>Client</eb:PartyId>           
                    </eb:From>
                    <eb:To>
                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>Sabre</eb:PartyId>
                    </eb:To>
                    <eb:CAPId>${token_details.capid}</eb:CAPId>
                    <eb:ConversationId>${token_details.conversationid}</eb:ConversationId>
                    <eb:Service></eb:Service>
                    <eb:Action>GetHotelDetailsRQ</eb:Action>
                    <eb:MessageData>
                        <eb:MessageId>${token_details.messageid}</eb:MessageId>
                        <eb:Timestamp>${token_details.timestamp}</eb:Timestamp>
                    </eb:MessageData>
            </eb:MessageHeader>
            <wsse:Security
            xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext">
                <wsse:BinarySecurityToken valueType="String" EncodingType="wsse:Base64Binary">${token_details.token}</wsse:BinarySecurityToken>
            </wsse:Security>
        </soap-env:Header>
        <soap-env:Body>
        <GetHotelDetailsRQ xmlns="http://services.sabre.com/hotel/details/v3_0_0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="3.0.0" xsi:schemaLocation="http://services.sabre.com/hotel/details/v3_0_0 GetHotelDetailsRQ_v3.0.0.xsd">
            <SearchCriteria>
                <HotelRefs>
                    <HotelRef HotelCode="${hotel_code}" CodeContext="GLOBAL"/>
                </HotelRefs>
                <RateInfoRef CurrencyCode="USD" PrepaidQualifier="IncludePrepaid" RefundableOnly="false" ConvertedRateInfoOnly="true" ShowNegotiatedRatesFirst="true">
                    <StayDateTimeRange StartDate="${check_in_date}" EndDate="${check_out_date}"/>
                    <Rooms>
                        <RoomSetTypes>
                            <RoomSet Type="RateSource"/>
                            <RoomSet Type="RoomType"/>
                            <RoomSet Type="BedType"/>
                            <RoomSet Type="RoomView"/>
                        </RoomSetTypes>
                        <Room Index="1" Adults="1">
                        </Room>
                    </Rooms>
                    <RatePlanCandidates ExactMatchOnly="false">
                        <RatePlanCandidate RatePlanCode="HFH"/>
                        <RatePlanCandidate RatePlanCode="EZR"/>
                    </RatePlanCandidates>
                </RateInfoRef>
                <HotelContentRef>
                    <DescriptiveInfoRef>
                        <PropertyInfo>true</PropertyInfo>
                        <LocationInfo>true</LocationInfo>
                        <Amenities>true</Amenities>
                        <Descriptions>
                            <Description Type="ShortDescription"/>                 
                        </Descriptions>
                        <SecurityFeatures>true</SecurityFeatures>
                    </DescriptiveInfoRef>
                    <MediaRef MaxItems="30">
                        <MediaTypes>
                            <Images>
                                <Image Type="ORIGINAL"/>
                            </Images>
                            <PanoramicMedias>
                                <PanoramicMedia Type="HD360"/>
                            </PanoramicMedias>
                            <Videos>
                                <Video Type="VIDEO360"/>
                            </Videos>
                        </MediaTypes>
                        ${room_type}
                        <AdditionalInfo>
                            <Info Type="CAPTION">true</Info>
                        </AdditionalInfo>
                        <Languages>
                            <Language Code="EN"/>
                        </Languages>
                    </MediaRef>
                </HotelContentRef>
            </SearchCriteria>
        </GetHotelDetailsRQ>
        </soap-env:Body>
    </soap-env:Envelope>`

    try {
        var api_response = await axios.post(sabre_endpoint, xml, headers_info);
        var room_details = await doParseHotelDetails(api_response.data);

        if (room_details['room_details'].length > 0) {
            return room_details;
        }
        else {
            return null;
        }
    }
    catch (error) {
        console.log(error);
        return null;
    }
}

async function doParseHotelDetails(xml) {
    var more_details = {};
    var image_details = [];
    var room_detail_array = [];
    var starting_from = null;

    parseString(xml, function (err, result) {

        try {

            if (result['soap-env:Envelope']['soap-env:Body']) {

                //Room Details
                if (result['soap-env:Envelope']['soap-env:Body'][0]['ns40:GetHotelDetailsRS'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns40:GetHotelDetailsRS'][0]['ns40:HotelDetailsInfo'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns40:GetHotelDetailsRS'][0]['ns40:HotelDetailsInfo'][0]['ns40:HotelRateInfo']) {
                    var room_list = result['soap-env:Envelope']['soap-env:Body'][0]['ns40:GetHotelDetailsRS'][0]['ns40:HotelDetailsInfo'][0]['ns40:HotelRateInfo'][0]['ns40:RoomSets'][0]['ns40:RoomSet'];

                    for (var i = 0; i < room_list.length; i++) {
                        if (room_list[i]['ns40:Room']) {
                            var sub_room_list = room_list[i]['ns40:Room'];
                        }
                        else {
                            sub_room_list = [];
                        }

                        for (var j = 0; j < sub_room_list.length; j++) {
                            var rate_plan_distribution = [];
                            var accepted_card_options = [];
                            var room_amenities = [];
                            var room_details_obj = {};

                            //Rate Plan Distribution
                            if (sub_room_list[j]['ns40:RatePlans'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['ns40:ConvertedRateInfo'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['ns40:ConvertedRateInfo'][0]['ns40:Rates'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['ns40:ConvertedRateInfo'][0]['ns40:Rates'][0]['ns40:Rate']) {
                                var room_rate_distribution_list = sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['ns40:ConvertedRateInfo'][0]['ns40:Rates'][0]['ns40:Rate'];

                                for (var k = 0; k < room_rate_distribution_list.length; k++) {
                                    var rate_dist_obj = {};
                                    rate_dist_obj['from_date'] = room_rate_distribution_list[k]?.$?.StartDate;
                                    rate_dist_obj['upto_date'] = room_rate_distribution_list[k]?.$?.EndDate;
                                    rate_dist_obj['amount'] = room_rate_distribution_list[k]?.$?.AmountBeforeTax;

                                    rate_plan_distribution.push(rate_dist_obj);
                                }
                            }

                            //Supported Card Lists
                            if (sub_room_list[j]['ns40:RatePlans'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['ns40:ConvertedRateInfo'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['ns40:ConvertedRateInfo'][0]['ns40:Guarantee'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['ns40:ConvertedRateInfo'][0]['ns40:Guarantee'][0]['ns40:GuaranteesAccepted'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['ns40:ConvertedRateInfo'][0]['ns40:Guarantee'][0]['ns40:GuaranteesAccepted'][0]['ns40:GuaranteeAccepted'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['ns40:ConvertedRateInfo'][0]['ns40:Guarantee'][0]['ns40:GuaranteesAccepted'][0]['ns40:GuaranteeAccepted'][0]['ns40:PaymentCards'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['ns40:ConvertedRateInfo'][0]['ns40:Guarantee'][0]['ns40:GuaranteesAccepted'][0]['ns40:GuaranteeAccepted'][0]['ns40:PaymentCards'][0]['ns40:PaymentCard']) {
                                var card_accept_list = sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['ns40:ConvertedRateInfo'][0]['ns40:Guarantee'][0]['ns40:GuaranteesAccepted'][0]['ns40:GuaranteeAccepted'][0]['ns40:PaymentCards'][0]['ns40:PaymentCard'];
                            }
                            else {
                                card_accept_list = [];
                            }

                            for (var l = 0; l < card_accept_list.length; l++) {
                                var card_name = card_accept_list[l]['_'];
                                accepted_card_options.push(card_name);
                            }

                            //Room Amenities
                            if (sub_room_list[j]['ns40:Amenities'] && sub_room_list[j]['ns40:Amenities'][0]['ns40:Amenity']) {
                                var room_amenities_list = sub_room_list[j]['ns40:Amenities'][0]['ns40:Amenity'];
                                for (var m = 0; m < room_amenities_list.length; m++) {
                                    var amenity_value = room_amenities_list[m]?.$?.Description;
                                    room_amenities.push(amenity_value);
                                }
                            }

                            //Room Rates
                            if (sub_room_list[j]['ns40:RatePlans'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['ns40:ConvertedRateInfo'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['ns40:ConvertedRateInfo'][0]?.$?.AmountBeforeTax) {
                                room_details_obj['room_rate'] = sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['ns40:ConvertedRateInfo'][0]['$']['AmountBeforeTax'];
                            }
                            else {
                                room_details_obj['room_rate'] = null;
                            }

                            //Rate Plan Code
                            if(sub_room_list[j]['ns40:RatePlans'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['$'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['$']['RatePlanCode'])
                            {
                                room_details_obj['rate_plan_code'] = sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['$']['RatePlanCode'];
                            }
                            else
                            {
                                room_details_obj['rate_plan_code'] = null;
                            }
                            
                            //Room Rate Key
                            if (sub_room_list[j]['ns40:RatePlans'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]?.$?.RateKey) {
                                room_details_obj['rate_key'] = sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['$']['RateKey'];
                            }
                            else {
                                room_details_obj['rate_key'] = null;
                            }

                            //Room Tax Amount
                            room_details_obj['room_tax'] = sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['ns40:ConvertedRateInfo'][0]['$']['AmountAfterTax'] - sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['ns40:ConvertedRateInfo'][0]['$']['AmountBeforeTax'];

                            //Room Average Night
                            if (sub_room_list[j]['ns40:RatePlans'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['ns40:ConvertedRateInfo'] && sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['ns40:ConvertedRateInfo'][0]?.$?.AverageNightlyRate) {
                                room_details_obj['avg_night_rate'] = sub_room_list[j]['ns40:RatePlans'][0]['ns40:RatePlan'][0]['ns40:ConvertedRateInfo'][0]['$']['AverageNightlyRate'];
                            }
                            else {
                                room_details_obj['avg_night_rate'] = null;
                            }

                            //Room Bed Option
                            if (sub_room_list[j]['ns40:BedTypeOptions'] && sub_room_list[j]['ns40:BedTypeOptions'][0]['ns40:BedTypes'] && sub_room_list[j]['ns40:BedTypeOptions'][0]['ns40:BedTypes'][0]['ns40:BedType'] && sub_room_list[j]['ns40:BedTypeOptions'][0]['ns40:BedTypes'][0]['ns40:BedType'][0]?.$?.Description) {
                                room_details_obj['bed_type'] = sub_room_list[j]['ns40:BedTypeOptions'][0]['ns40:BedTypes'][0]['ns40:BedType'][0]['$']['Description'];
                            }
                            else {
                                room_details_obj['bed_type'] = null;
                            }

                            //Room Description
                            if (sub_room_list[j]['ns40:RoomDescription'] && sub_room_list[j]['ns40:RoomDescription'][0]['ns40:Text'] && sub_room_list[j]['ns40:RoomDescription'][0]['ns40:Text']['0']) {
                                room_details_obj['room_description'] = sub_room_list[j]['ns40:RoomDescription'][0]['ns40:Text']['0'];
                            }
                            else {
                                room_details_obj['room_description'] = null;
                            }

                            room_details_obj['rate_plan_distribution'] = rate_plan_distribution;
                            room_details_obj['accepted_card_options'] = accepted_card_options;
                            room_details_obj['room_amenities_list'] = room_amenities;

                            if (sub_room_list[j]?.$?.RoomType) {
                                room_details_obj['room_type'] = sub_room_list[j]?.$?.RoomType;
                            }
                            else {
                                room_details_obj['room_type'] = "Premier Room";
                            }

                            if (starting_from) {
                                if (starting_from > room_details_obj['room_rate']) {
                                    starting_from = room_details_obj['room_rate'];
                                }
                            }
                            else {
                                starting_from = room_details_obj['room_rate'];
                            }

                            room_detail_array.push(room_details_obj);
                        }
                    }
                }

                //Image Details
                if (result['soap-env:Envelope']['soap-env:Body'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns40:GetHotelDetailsRS'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns40:GetHotelDetailsRS'][0]['ns40:HotelDetailsInfo'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns40:GetHotelDetailsRS'][0]['ns40:HotelDetailsInfo'][0]['ns40:HotelMediaInfo'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns40:GetHotelDetailsRS'][0]['ns40:HotelDetailsInfo'][0]['ns40:HotelMediaInfo'][0]['ns40:MediaItems'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns40:GetHotelDetailsRS'][0]['ns40:HotelDetailsInfo'][0]['ns40:HotelMediaInfo'][0]['ns40:MediaItems'][0]['ns40:MediaItem']) {
                    var images_detail_array = result['soap-env:Envelope']['soap-env:Body'][0]['ns40:GetHotelDetailsRS'][0]['ns40:HotelDetailsInfo'][0]['ns40:HotelMediaInfo'][0]['ns40:MediaItems'][0]['ns40:MediaItem'];

                    for (var j = 0; j < images_detail_array.length; j++) {
                        var current_img_obj = images_detail_array[j];
                        var image_tmp_obj = {};

                        if (current_img_obj['ns40:ImageItems'] && current_img_obj['ns40:ImageItems'][0]['ns40:Image'] && current_img_obj['ns40:ImageItems'][0]['ns40:Image'][0]?.$?.Url) {
                            image_tmp_obj.img = current_img_obj['ns40:ImageItems'][0]['ns40:Image'][0]['$']['Url'];
                        }
                        else {
                            image_tmp_obj.img = null;
                        }


                        if (current_img_obj['ns40:AdditionalInfo'] && current_img_obj['ns40:AdditionalInfo'][0]['ns40:Info'] && current_img_obj['ns40:AdditionalInfo'][0]['ns40:Info'][0]['ns40:Description'] && current_img_obj['ns40:AdditionalInfo'][0]['ns40:Info'][0]['ns40:Description'][0]['ns40:Text'] && current_img_obj['ns40:AdditionalInfo'][0]['ns40:Info'][0]['ns40:Description'][0]['ns40:Text'][0]?._) {
                            image_tmp_obj.caption = current_img_obj['ns40:AdditionalInfo'][0]['ns40:Info'][0]['ns40:Description'][0]['ns40:Text'][0]['_'];
                        }
                        else {
                            image_tmp_obj.caption = null;
                        }

                        image_details.push(image_tmp_obj);
                    }
                }
                else {
                    image_details = [];
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    });

    more_details['room_details'] = room_detail_array;
    more_details['image_details'] = image_details;
    more_details['starting_from'] = starting_from;

    return more_details;
}

async function validate_hotel_price(token_details, rate_key) {
    var sabre_endpoint = "https://webservices.havail.sabre.com";
    var headers_info = {
        headers: {
            'cache-control': 'no-cache',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'text/xml',
            'Cache-Control': 'no-cache',
            'Accept': '*/*',
            'Content-Type': 'text/xml'
        }
    };
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
                    <soap-env:Envelope
                    xmlns:soap-env='http://schemas.xmlsoap.org/soap/envelope/'
                    xmlns:xlink='http://www.w3.org/1999/xlink'
                    xmlns:xsd='http://www.w3.org/1999/XMLSchema'>
                        <soap-env:Header>
                            <eb:MessageHeader
                            xmlns:eb='http://www.ebxml.org/namespaces/messageHeader'>
                                    <eb:From>
                                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>Client</eb:PartyId>           
                                    </eb:From>
                                    <eb:To>
                                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>SWS</eb:PartyId>
                                    </eb:To>
                                    <eb:CAPId>${token_details.capid}</eb:CAPId>
                                    <eb:ConversationId>${token_details.conversationid}</eb:ConversationId>
                                    <eb:Action>HotelPriceCheckRQ</eb:Action>
                                    <eb:MessageData>
                                        <eb:MessageId>${token_details.messageid}</eb:MessageId>
                                        <eb:Timestamp>${token_details.timestamp}</eb:Timestamp>
                                    </eb:MessageData>
                            </eb:MessageHeader>
                            <wsse:Security
                            xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext">
                                <wsse:BinarySecurityToken valueType="String" EncodingType="wsse:Base64Binary">${token_details.token}</wsse:BinarySecurityToken>
                            </wsse:Security>
                        </soap-env:Header>
                        <soap-env:Body>
                            <HotelPriceCheckRQ
                            xmlns="http://services.sabre.com/hotel/pricecheck/v4_0_0"
                            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="4.0.0" xsi:schemaLocation="http://services.sabre.com/hotel/pricecheck/v4_0_0 HotelPriceCheckRQ_v4.0.0.xsd">
                            <POS>
                                <Source PseudoCityCode="${process.env.SABRE_CLIENT_PCC}"/>
                            </POS>
                            <RateInfoRef RateKey="${rate_key}"/>
                        </HotelPriceCheckRQ>
                        </soap-env:Body>
                    </soap-env:Envelope>`
    try {
        var api_response = await axios.post(sabre_endpoint, xml, headers_info);
        var room_validated_details = await parse_validate_hotel_price(api_response.data);

        if (room_validated_details) {
            return room_validated_details
        }
        else {
            return null;
        }
    }
    catch (error) {
        console.log(error);
        return null;
    }
}

async function parse_validate_hotel_price(xml) {
    var room_detailing = {};

    parseString(xml, function (err, result) {
        try {

            var room_amenities_Array = [];
            var rate_plan_array = [];
            var card_accepted_array = [];

            if (result['soap-env:Envelope']['soap-env:Body']) {
                for (var l = 0; l < 40; l++) {
                    if (result['soap-env:Envelope']['soap-env:Body'][0][`ns${l}:HotelPriceCheckRS`]) {
                        ns_value = `ns${l}`;
                        break;
                    }
                }

                // if(result['soap-env:Envelope']['soap-env:Body'][0]['ns34:HotelPriceCheckRS'])
                // {
                //     ns_value = 'ns34'
                // }

                // if(result['soap-env:Envelope']['soap-env:Body'][0]['ns31:HotelPriceCheckRS'])
                // {
                //     ns_value = 'ns31'
                // }

                // if(result['soap-env:Envelope']['soap-env:Body'][0]['ns33:HotelPriceCheckRS'])
                // {
                //     ns_value = 'ns33'
                // }

                if (result['soap-env:Envelope']['soap-env:Body'] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`][0][`${ns_value}:PriceCheckInfo`] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`][0][`${ns_value}:PriceCheckInfo`][0][`${ns_value}:HotelInfo`] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`][0][`${ns_value}:PriceCheckInfo`][0][`${ns_value}:HotelInfo`][0]) {
                    var hotel_details = result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`][0][`${ns_value}:PriceCheckInfo`][0][`${ns_value}:HotelInfo`][0];
                }
                else {
                    var hotel_details = null;
                }

                room_detailing['HotelName'] = hotel_details?.$?.HotelName;
                room_detailing['HotelCode'] = hotel_details?.$?.HotelCode;

                //Booking Key
                if (result['soap-env:Envelope']['soap-env:Body'] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`][0][`${ns_value}:PriceCheckInfo`] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`][0][`${ns_value}:PriceCheckInfo`][0]['$'] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`][0][`${ns_value}:PriceCheckInfo`][0]['$']['BookingKey']) {
                    room_detailing['booking_key'] = result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`][0][`${ns_value}:PriceCheckInfo`][0]['$']['BookingKey'];
                }
                else {
                    room_detailing['booking_key'] = null;
                }

                //Longitude
                if (hotel_details[`${ns_value}:LocationInfo`] && hotel_details[`${ns_value}:LocationInfo`][0]?.$?.Longitude) {
                    room_detailing['Longitude'] = hotel_details[`${ns_value}:LocationInfo`][0]['$']['Longitude'];
                }
                else {
                    room_detailing['Longitude'] = null;
                }

                //Latitude
                if (hotel_details[`${ns_value}:LocationInfo`] && hotel_details[`${ns_value}:LocationInfo`][0]?.$?.Latitude) {
                    room_detailing['Latitude'] = hotel_details[`${ns_value}:LocationInfo`][0]['$']['Latitude'];
                }
                else {
                    room_detailing['Latitude'] = null;
                }

                //City Name
                if (hotel_details[`${ns_value}:LocationInfo`] && hotel_details[`${ns_value}:LocationInfo`][0][`${ns_value}:Address`] && hotel_details[`${ns_value}:LocationInfo`][0][`${ns_value}:Address`][0][`${ns_value}:CityName`] && hotel_details[`${ns_value}:LocationInfo`][0][`${ns_value}:Address`][0][`${ns_value}:CityName`][0]?._) {
                    room_detailing['city_name'] = hotel_details[`${ns_value}:LocationInfo`][0][`${ns_value}:Address`][0][`${ns_value}:CityName`][0]['_'];
                }
                else {
                    room_detailing['city_name'] = null;
                }

                //Phone Number
                if (hotel_details[`${ns_value}:LocationInfo`] && hotel_details[`${ns_value}:LocationInfo`][0][`${ns_value}:Contact`] && hotel_details[`${ns_value}:LocationInfo`][0][`${ns_value}:Contact`][0]?.$?.Phone) {
                    room_detailing['contact'] = hotel_details[`${ns_value}:LocationInfo`][0][`${ns_value}:Contact`][0]['$']['Phone'];
                }
                else {
                    room_detailing['contact'] = null;
                }

                //Rate Info & check-in, check-out dates
                if (result['soap-env:Envelope']['soap-env:Body'] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`][0][`${ns_value}:PriceCheckInfo`] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`][0][`${ns_value}:PriceCheckInfo`][0][`${ns_value}:HotelRateInfo`] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`][0][`${ns_value}:PriceCheckInfo`][0][`${ns_value}:HotelRateInfo`][0][`${ns_value}:RateInfos`] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`][0][`${ns_value}:PriceCheckInfo`][0][`${ns_value}:HotelRateInfo`][0][`${ns_value}:RateInfos`][0][`${ns_value}:RateInfo`] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`][0][`${ns_value}:PriceCheckInfo`][0][`${ns_value}:HotelRateInfo`][0][`${ns_value}:RateInfos`][0][`${ns_value}:ConvertedRateInfo`][0]?.$) {
                    var rate_details = result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`][0][`${ns_value}:PriceCheckInfo`][0][`${ns_value}:HotelRateInfo`][0][`${ns_value}:RateInfos`][0][`${ns_value}:ConvertedRateInfo`][0]['$'];

                    //Room rate
                    if (rate_details?.AmountBeforeTax) {
                        room_detailing['room_rate'] = rate_details?.AmountAfterTax;
                    }
                    else {
                        room_detailing['room_rate'] = null;
                    }

                    //room tax
                    if (rate_details?.AmountAfterTax) {
                        room_detailing['room_tax'] = rate_details['AmountAfterTax'] - rate_details['AmountBeforeTax'];
                    }

                    //room avg night rate
                    if (rate_details?.AverageNightlyRate) {
                        room_detailing['avg_night_rate'] = rate_details?.AverageNightlyRate;
                    }
                    else {
                        room_detailing['avg_night_rate'] = null;
                    }

                    //check-in Date
                    if (rate_details?.StartDate) {
                        room_detailing['check_in_date'] = rate_details?.StartDate;
                    }
                    else {
                        room_detailing['check_in_date'] = null;
                    }

                    //check-out Date
                    if (rate_details?.EndDate) {
                        room_detailing['check_out_date'] = rate_details?.EndDate;
                    }
                    else {
                        room_detailing['check_out_date'] = null;
                    }

                }
                else {
                    var rate_details = null;
                }

                if (result['soap-env:Envelope']['soap-env:Body'] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`][0][`${ns_value}:PriceCheckInfo`] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`][0][`${ns_value}:PriceCheckInfo`][0][`${ns_value}:HotelRateInfo`] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`][0][`${ns_value}:PriceCheckInfo`][0][`${ns_value}:HotelRateInfo`][0][`${ns_value}:Rooms`] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`][0][`${ns_value}:PriceCheckInfo`][0][`${ns_value}:HotelRateInfo`][0][`${ns_value}:Rooms`][0][`${ns_value}:Room`] && result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`][0][`${ns_value}:PriceCheckInfo`][0][`${ns_value}:HotelRateInfo`][0][`${ns_value}:Rooms`][0][`${ns_value}:Room`][0]) {
                    var room_details = result['soap-env:Envelope']['soap-env:Body'][0][`${ns_value}:HotelPriceCheckRS`][0][`${ns_value}:PriceCheckInfo`][0][`${ns_value}:HotelRateInfo`][0][`${ns_value}:Rooms`][0][`${ns_value}:Room`][0];

                    //room type
                    if (room_details?.$?.RoomType) {
                        room_detailing['room_type'] = room_details['$']['RoomType'];
                    }
                    else {
                        room_detailing['room_type'] = null;
                    }

                    //bed type
                    if (room_details[`${ns_value}:BedTypeOptions`] && room_details[`${ns_value}:BedTypeOptions`][0][`${ns_value}:BedTypes`] && room_details[`${ns_value}:BedTypeOptions`][0][`${ns_value}:BedTypes`][0][`${ns_value}:BedType`] && room_details[`${ns_value}:BedTypeOptions`][0][`${ns_value}:BedTypes`][0][`${ns_value}:BedType`][0]?.$?.Description) {
                        room_detailing['bed_type'] = room_details[`${ns_value}:BedTypeOptions`][0][`${ns_value}:BedTypes`][0][`${ns_value}:BedType`][0]['$']['Description'];
                    }
                    else {
                        room_detailing['bed_type'] = null;
                    }

                    //room description
                    if (room_details[`${ns_value}:RoomDescription`] && room_details[`${ns_value}:RoomDescription`][0][`${ns_value}:Text`] && room_details[`${ns_value}:RoomDescription`][0][`${ns_value}:Text`][0]) {
                        room_detailing['room_description'] = room_details[`${ns_value}:RoomDescription`][0][`${ns_value}:Text`][0];
                    }
                    else {
                        room_detailing['room_description'] = null;
                    }

                    if (room_details[`${ns_value}:Amenities`] && room_details[`${ns_value}:Amenities`][0][`${ns_value}:Amenity`]) {
                        var room_amenities = room_details[`${ns_value}:Amenities`][0][`${ns_value}:Amenity`];

                        for (var i = 0; i < room_amenities.length; i++) {
                            var amenity_value = check_undefine(result, room_amenities[i]['$']['Description']) ? room_amenities[i]['$']['Description'] : "Not Provided";
                            room_amenities_Array.push(amenity_value);
                        }
                    }

                    room_detailing['room_amenities'] = room_amenities_Array;

                    if (room_details[`${ns_value}:RatePlans`] && room_details[`${ns_value}:RatePlans`][0][`${ns_value}:RatePlan`] && room_details[`${ns_value}:RatePlans`][0][`${ns_value}:RatePlan`][0][`${ns_value}:RateInfo`] && room_details[`${ns_value}:RatePlans`][0][`${ns_value}:RatePlan`][0][`${ns_value}:RateInfo`][0][`${ns_value}:Rates`] && room_details[`${ns_value}:RatePlans`][0][`${ns_value}:RatePlan`][0][`${ns_value}:RateInfo`][0][`${ns_value}:Rates`][0][`${ns_value}:Rate`]) {
                        var rate_plan = room_details[`${ns_value}:RatePlans`][0][`${ns_value}:RatePlan`][0][`${ns_value}:RateInfo`][0][`${ns_value}:Rates`][0][`${ns_value}:Rate`];

                        for (var j = 0; j < rate_plan.length; j++) {
                            var temp_obj = {};
                            temp_obj['from_date'] = check_undefine(result, rate_plan[j]['$']['StartDate']) ? rate_plan[j]['$']['StartDate'] : "Not Provided";
                            temp_obj['upto_date'] = check_undefine(result, rate_plan[j]['$']['EndDate']) ? rate_plan[j]['$']['EndDate'] : "Not Provided";
                            temp_obj['amount'] = check_undefine(result, rate_plan[j]['$']['AmountBeforeTax']) ? rate_plan[j]['$']['AmountBeforeTax'] : "Not Provided";
                            rate_plan_array.push(temp_obj);
                        }

                    }

                    room_detailing['rate_plan_distribution'] = rate_plan_array;

                    if (room_details[`${ns_value}:RatePlans`] && room_details[`${ns_value}:RatePlans`][0][`${ns_value}:RatePlan`] && room_details[`${ns_value}:RatePlans`][0][`${ns_value}:RatePlan`][0][`${ns_value}:RateInfo`] && room_details[`${ns_value}:RatePlans`][0][`${ns_value}:RatePlan`][0][`${ns_value}:RateInfo`][0][`${ns_value}:Guarantee`] && room_details[`${ns_value}:RatePlans`][0][`${ns_value}:RatePlan`][0][`${ns_value}:RateInfo`][0][`${ns_value}:Guarantee`][0][`${ns_value}:GuaranteesAccepted`] && room_details[`${ns_value}:RatePlans`][0][`${ns_value}:RatePlan`][0][`${ns_value}:RateInfo`][0][`${ns_value}:Guarantee`][0][`${ns_value}:GuaranteesAccepted`][0][`${ns_value}:GuaranteeAccepted`] && room_details[`${ns_value}:RatePlans`][0][`${ns_value}:RatePlan`][0][`${ns_value}:RateInfo`][0][`${ns_value}:Guarantee`][0][`${ns_value}:GuaranteesAccepted`][0][`${ns_value}:GuaranteeAccepted`][0][`${ns_value}:PaymentCards`] && room_details[`${ns_value}:RatePlans`][0][`${ns_value}:RatePlan`][0][`${ns_value}:RateInfo`][0][`${ns_value}:Guarantee`][0][`${ns_value}:GuaranteesAccepted`][0][`${ns_value}:GuaranteeAccepted`][0][`${ns_value}:PaymentCards`][0][`${ns_value}:PaymentCard`]) {
                        var card_accepted = room_details[`${ns_value}:RatePlans`][0][`${ns_value}:RatePlan`][0][`${ns_value}:RateInfo`][0][`${ns_value}:Guarantee`][0][`${ns_value}:GuaranteesAccepted`][0][`${ns_value}:GuaranteeAccepted`][0][`${ns_value}:PaymentCards`][0][`${ns_value}:PaymentCard`];

                        for (var k = 0; k < card_accepted.length; k++) {
                            card_accepted_array.push(card_accepted[k]['_']);
                        }
                    }
                }
                else {
                    var room_details = null;
                }

                room_detailing['accepted_card_options'] = card_accepted_array;
            }
            else {
                room_detailing = null;
            }
        }
        catch (error) {
            room_detailing = null;
        }
    });

    return room_detailing;
}

//----------------------------------------------------------------------------------------------------------------------- */
// -----------------------------------------------   Rental Car Search    -----------------------------------------------
//----------------------------------------------------------------------------------------------------------------------- */

async function getRentalCarDetails(token_details, car_data) {
    if (car_data.car_type != undefined && car_data.car_type != "" && car_data.car_type != null) {
        car_data.car_type = `<VehType>${car_data.car_type}</VehType>`;
    } else {
        car_data.car_type = `<VehType>ECAR</VehType>
                            <VehType>GCAR</VehType>
                            <VehType>LCAR</VehType>
                            <VehType>RFDR</VehType>
                            <VehType>GFDR</VehType>
                            <VehType>IZAR</VehType>
                            <VehType>JEAR</VehType>
                            <VehType>LFDV</VehType>
                            <VehType>CSAR</VehType>
                            <VehType>XFAR</VehType>`;
    }
    if (car_data.car_vendor != undefined && car_data.car_vendor != "" && car_data.car_vendor != null) {
        car_data.car_vendor = `<VendorPrefs >
                        <VendorPref Code="${car_data.car_vendor}"/>
                    </VendorPrefs>`;
    } else {
        car_data.car_vendor = ``;
    }

    var sabre_endpoint = "https://webservices.havail.sabre.com";
    var headers_info = {
        headers: {
            'cache-control': 'no-cache',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'text/xml',
            'Cache-Control': 'no-cache',
            'Accept': '*/*',
            'Content-Type': 'text/xml'
        }
    };
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <soap-env:Envelope
    xmlns:soap-env='http://schemas.xmlsoap.org/soap/envelope/'
    xmlns:xlink='http://www.w3.org/1999/xlink'
    xmlns:xsd='http://www.w3.org/1999/XMLSchema'>
        <soap-env:Header>
            <eb:MessageHeader
            xmlns:eb='http://www.ebxml.org/namespaces/messageHeader'>
                    <eb:From>
                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>Client</eb:PartyId>           
                    </eb:From>
                    <eb:To>
                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>Sabre</eb:PartyId>
                    </eb:To>
                    <eb:CAPId>${token_details.capid}</eb:CAPId>
                    <eb:ConversationId>${token_details.conversationid}</eb:ConversationId>
                    <eb:Service>GetVehAvailRQ</eb:Service>
                    <eb:Action>GetVehAvailRQ</eb:Action>
                    <eb:MessageData>
                        <eb:MessageId>${token_details.messageid}</eb:MessageId>
                        <eb:Timestamp>${token_details.timestamp}</eb:Timestamp>
                    </eb:MessageData>
            </eb:MessageHeader>
            <wsse:Security
            xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext">
                <wsse:BinarySecurityToken valueType="String" EncodingType="wsse:Base64Binary">${token_details.token}</wsse:BinarySecurityToken>
            </wsse:Security>
        </soap-env:Header>
        <soap-env:Body>
        <GetVehAvailRQ xmlns="http://services.sabre.com/car/avail/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="2.0.0">
                <SearchCriteria PickUpDate= "${car_data.pick_up_date}" ReturnDate="${car_data.drop_off_date}" PickUpTime="${car_data.pick_up_time}" ReturnTime="${car_data.drop_off_time}" SortBy="Price" SortOrder="ASC" >
                    <AirportRef>
                        <PickUpLocation LocationCode="${car_data.pick_up_city}"/>
                        <ReturnLocation LocationCode="${car_data.drop_off_city}" />
                    </AirportRef>
                    ${car_data.car_vendor}
                    <RatePrefs  RatePlan="D" Commission="false" CurrencyCode="USD" ConvertedRateInfoOnly="false" SupplierCurrencyOnly="false" >
                    </RatePrefs>
                    <VehPrefs>
                        <VehPref>
                            ${car_data.car_type}
                        </VehPref>
                    </VehPrefs>
                    <LocPolicyRef Include="true"/>
                    <ImageRef>
                        <Image Type="ORIGINAL"/>
                    </ImageRef>
                </SearchCriteria>
            </GetVehAvailRQ>
        </soap-env:Body>
    </soap-env:Envelope>`
    try {
        var api_response = await axios.post(sabre_endpoint, xml, headers_info);
        var car_data_array = await doParseRentalCarData(api_response.data, car_data);
        return car_data_array;
    }
    catch (e) {
        return [];
    }
}

async function doParseRentalCarData(xml, car_data) {
    var final_result = null;
    var car_data_array = [];

    parseString(xml, function (err, result) {
        var response = {};

        try {

            if (result['soap-env:Envelope']['soap-env:Body']) {
                if (result['soap-env:Envelope']['soap-env:Body'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns28:GetVehAvailRS'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns28:GetVehAvailRS'][0]['ns28:VehAvailInfos'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns28:GetVehAvailRS'][0]['ns28:VehAvailInfos'][0]['ns28:VehAvailInfo']) {
                    var data_array = result['soap-env:Envelope']['soap-env:Body'][0]['ns28:GetVehAvailRS'][0]['ns28:VehAvailInfos'][0]['ns28:VehAvailInfo'];

                    for (var i = 0; i < data_array.length; i++) {
                        var temp_obj = {};
                        temp_obj['car_id'] = (i + 1);

                        temp_obj['pickUpTime'] = car_data.pick_up_time;

                        temp_obj['dropOffTime'] = car_data.drop_off_time;

                        temp_obj['pickUpDate'] = car_data.pick_up_date;

                        temp_obj['dropOffDate'] = car_data.drop_off_date;
                        temp_obj['pickUpCity'] = car_data.pick_up_city;
                        temp_obj['dropOffCity'] = car_data.drop_off_city;

                        //Vendor Code
                        if (data_array[i]['ns28:Vendor'] && data_array[i]['ns28:Vendor'][0]?.$?.Code) {
                            temp_obj['vendor_code'] = data_array[i]['ns28:Vendor'][0]['$']['Code'];
                        }
                        else {
                            temp_obj['vendor_code'] = null;
                        }

                        //Vendor Logo
                        if (data_array[i]['ns28:Vendor'] && data_array[i]['ns28:Vendor'][0]?.$?.Logo) {
                            temp_obj['vendor_logo'] = data_array[i]['ns28:Vendor'][0]['$']['Logo'];
                        }
                        else {
                            temp_obj['vendor_logo'] = null;
                        }

                        //Vendor Name
                        if (data_array[i]['ns28:Vendor'] && data_array[i]['ns28:Vendor'][0]?.$?.Logo) {
                            temp_obj['vendor_name'] = data_array[i]['ns28:Vendor'][0]['$']['Name'];
                        }
                        else {
                            temp_obj['vendor_name'] = null;
                        }

                        //Number of Seats
                        if (data_array[i]['ns28:ConvertedVehRentalRate'] && data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'] && data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'] && data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:SeatBelts'] && data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:SeatBelts'][0]?.$?.Quantity) {
                            temp_obj['num_of_seats'] = data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:SeatBelts'][0]['$']['Quantity'];
                        }
                        else {
                            temp_obj['num_of_seats'] = null;
                        }


                        //RateKey
                        if (data_array[i]['ns28:ConvertedVehRentalRate'] && data_array[i]['ns28:ConvertedVehRentalRate'][0]?.$?.RateKey) {
                            temp_obj['RateKey'] = data_array[i]['ns28:ConvertedVehRentalRate'][0]['$']['RateKey'];
                        }
                        else {
                            temp_obj['RateKey'] = null;
                        }

                        //Approximate Total Fare
                        if (data_array[i]['ns28:ConvertedVehRentalRate'] && data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:VehicleCharges'] && data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:VehicleCharges'][0]['ns28:VehicleCharge']) {
                            var rate_array = data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:VehicleCharges'][0]['ns28:VehicleCharge'];

                            for (var l = 0; l < rate_array.length; l++) {
                                if (rate_array[l]?.$?.ChargeType == "ApproximateTotalPrice") {
                                    temp_obj['approximate_total_fare'] = rate_array[l]?.$?.Amount;
                                }

                                if (rate_array[l]?.$?.ChargeType == "ExtraHour") {
                                    temp_obj['extra_hour_fee'] = rate_array[l]?.$?.Amount;
                                }
                            }
                            //temp_obj['approximate_total_fare'] = data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:VehicleCharges'][0]['ns28:VehicleCharge'][3]['$']['Amount'];
                        }
                        else {
                            temp_obj['approximate_total_fare'] = null;
                        }

                        //Car logo

                        if (data_array[i]['ns28:VehRentalRate'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:Images'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:Images'][0]['ns28:Image']) {
                            temp_obj['car_logo'] = data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:Images'][0]['ns28:Image'][0]?.$?.Url;
                        }
                        else {
                            temp_obj['car_logo'] = "https://junipertest.atgtravel.com/images/default_image.png";
                        }

                        //Number of bags allowed
                        if (data_array[i]['ns28:VehRentalRate'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:BagsInfo'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:BagsInfo'][0]['ns28:Bags'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:BagsInfo'][0]['ns28:Bags'][0]?.$?.Quantity) {
                            temp_obj['number_of_bags'] = data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:BagsInfo'][0]['ns28:Bags'][0]?.$?.Quantity;
                        }
                        else {
                            temp_obj['number_of_bags'] = null;
                        }

                        //Bag Size
                        if (data_array[i]['ns28:VehRentalRate'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:BagsInfo'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:BagsInfo'][0]['ns28:Bags'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:BagsInfo'][0]['ns28:Bags'][0]?.$?.Size) {
                            temp_obj['bag_size'] = data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:BagsInfo'][0]['ns28:Bags'][0]['$']['Size'];
                        }
                        else {
                            temp_obj['bag_size'] = null;
                        }

                        //Vehicle Type
                        if (data_array[i]['ns28:ConvertedVehRentalRate'] && data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'] && data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'][0]?.$?.VehType) {
                            var vehicle_type = data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'][0]?.$?.VehType;

                            temp_obj['vehicle_type'] = vehicle_type;
                            temp_obj['vehicle_category'] = car_categoty(vehicle_type[0]);
                            temp_obj['vehicle_type'] = car_type(vehicle_type[1]);
                            temp_obj['vehicle_drive'] = drive_type(vehicle_type[2]);
                        }
                        else {
                            temp_obj['vehicle_type'] = null;
                            temp_obj['vehicle_category'] = null;
                            temp_obj['vehicle_type'] = null;
                            temp_obj['vehicle_drive'] = null;
                        }

                        car_data_array.push(temp_obj);
                    }
                }
                else {
                    car_data_array = [];
                }
            }
            else {
                car_data_array = [];
            }
        }
        catch (error) {
            console.log(error);
            return null;
        }
    });

    if (car_data_array.length != 0) {
        return car_data_array;
    }
    else {

        return null;
    }
}

async function vehiclePriceCheck(token_details, rate_key) {
    var sabre_endpoint = "https://webservices.havail.sabre.com";
    var headers_info = {
        headers: {
            'cache-control': 'no-cache',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'text/xml',
            'Cache-Control': 'no-cache',
            'Accept': '*/*',
            'Content-Type': 'text/xml'
        }
    };
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
                    <soap-env:Envelope
                    xmlns:soap-env='http://schemas.xmlsoap.org/soap/envelope/'
                    xmlns:xlink='http://www.w3.org/1999/xlink'
                    xmlns:xsd='http://www.w3.org/1999/XMLSchema'>
                        <soap-env:Header>
                            <eb:MessageHeader
                            xmlns:eb='http://www.ebxml.org/namespaces/messageHeader'>
                                    <eb:From>
                                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>Client</eb:PartyId>           
                                    </eb:From>
                                    <eb:To>
                                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>SWS</eb:PartyId>
                                    </eb:To>
                                    <eb:CAPId>${token_details.capid}</eb:CAPId>
                                    <eb:ConversationId>${token_details.conversationid}</eb:ConversationId>
                                    <eb:Action>VehPriceCheckRQ</eb:Action>
                                    <eb:MessageData>
                                        <eb:MessageId>${token_details.messageid}</eb:MessageId>
                                        <eb:Timestamp>${token_details.timestamp}</eb:Timestamp>
                                    </eb:MessageData>
                            </eb:MessageHeader>
                            <wsse:Security
                            xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext">
                                <wsse:BinarySecurityToken valueType="String" EncodingType="wsse:Base64Binary">${token_details.token}</wsse:BinarySecurityToken>
                            </wsse:Security>
                        </soap-env:Header>
                        <soap-env:Body>
                            <VehPriceCheckRQ xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://services.sabre.com/car/pricecheck/v1_0_0" version="1.0.0" xsi:schemaLocation="http://services.sabre.com/car/pricecheck/v1_0_0 VehPriceCheckRQ_v1.0.0.xsd">
                                <VehRateInfoRef RateKey="${rate_key}"/>
                            </VehPriceCheckRQ>
                        </soap-env:Body>
                    </soap-env:Envelope>`
    try {
        var api_response = await axios.post(sabre_endpoint, xml, headers_info);
        var price_validation = await parse_vehiclePriceCheck(api_response.data);

        if (price_validation) {
            return price_validation;
        }
        else {
            return null;
        }
    }
    catch (error) {
        console.log(error);
        return null;
    }
}

async function parse_vehiclePriceCheck(xml) {
    var temp_obj = {};

    parseString(xml, function (err, result) {
        try {
            if (result['soap-env:Envelope']['soap-env:Body']) {
                if (result['soap-env:Envelope']['soap-env:Body'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'][0]['ns15:VehRateInfo'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'][0]['ns15:VehRateInfo'][0]['ns15:VehAvailInfos'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'][0]['ns15:VehRateInfo'][0]['ns15:VehAvailInfos'][0]['ns15:VehAvailInfo'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'][0]['ns15:VehRateInfo'][0]['ns15:VehAvailInfos'][0]['ns15:VehAvailInfo'][0]) {
                    var car_detail_object = result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'][0]['ns15:VehRateInfo'][0]['ns15:VehAvailInfos'][0]['ns15:VehAvailInfo'][0];

                    if (car_detail_object['ns15:ConvertedVehRentalRate'] && car_detail_object['ns15:ConvertedVehRentalRate'][0]['ns15:VehicleCharges'] && car_detail_object['ns15:ConvertedVehRentalRate'][0]['ns15:VehicleCharges'][0]['ns15:VehicleCharge']) {
                        var car_charges_array = car_detail_object['ns15:ConvertedVehRentalRate'][0]['ns15:VehicleCharges'][0]['ns15:VehicleCharge'];

                        for (var l = 0; l < car_charges_array.length; l++) {
                            if (car_charges_array[l]?.$?.ChargeType == "ApproximateTotalPrice") {
                                temp_obj['approximate_total_fare'] = car_charges_array[l]?.$?.Amount;
                            }
                        }
                    }
                    else {
                        temp_obj['approximate_total_fare'] = null;
                    }
                }
                else {
                    temp_obj['approximate_total_fare'] = null;
                }

                if (result['soap-env:Envelope']['soap-env:Body'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'][0]['ns15:VehRateInfo'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'][0]['ns15:VehRateInfo'][0]['ns15:VehAvailInfos'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'][0]['ns15:VehRateInfo'][0]['ns15:VehAvailInfos'][0]['ns15:VehAvailInfo'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'][0]['ns15:VehRateInfo'][0]['ns15:VehAvailInfos'][0]['ns15:VehAvailInfo'][0]['ns15:ConvertedVehRentalRate'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'][0]['ns15:VehRateInfo'][0]['ns15:VehAvailInfos'][0]['ns15:VehAvailInfo'][0]['ns15:ConvertedVehRentalRate'][0]['$'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'][0]['ns15:VehRateInfo'][0]['ns15:VehAvailInfos'][0]['ns15:VehAvailInfo'][0]['ns15:ConvertedVehRentalRate'][0]['$']['RateCode']) {
                    temp_obj['rate_code'] = result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'][0]['ns15:VehRateInfo'][0]['ns15:VehAvailInfos'][0]['ns15:VehAvailInfo'][0]['ns15:ConvertedVehRentalRate'][0]['$']['RateCode'];
                }

                if (result['soap-env:Envelope']['soap-env:Body'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'][0]['ns15:VehRateInfo'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'][0]['ns15:VehRateInfo'][0]['ns15:VehAvailInfos'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'][0]['ns15:VehRateInfo'][0]['ns15:VehAvailInfos'][0]['ns15:VehAvailInfo'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'][0]['ns15:VehRateInfo'][0]['ns15:VehAvailInfos'][0]['ns15:VehAvailInfo'][0]['ns15:ConvertedVehRentalRate'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'][0]['ns15:VehRateInfo'][0]['ns15:VehAvailInfos'][0]['ns15:VehAvailInfo'][0]['ns15:ConvertedVehRentalRate'][0]['$'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'][0]['ns15:VehRateInfo'][0]['ns15:VehAvailInfos'][0]['ns15:VehAvailInfo'][0]['ns15:ConvertedVehRentalRate'][0]['ns15:VehicleCharges'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'][0]['ns15:VehRateInfo'][0]['ns15:VehAvailInfos'][0]['ns15:VehAvailInfo'][0]['ns15:ConvertedVehRentalRate'][0]['ns15:VehicleCharges'][0]['ns15:VehicleCharge']) {
                    var charges_array = result['soap-env:Envelope']['soap-env:Body'][0]['ns15:VehPriceCheckRS'][0]['ns15:PriceCheckInfo'][0]['ns15:VehRateInfo'][0]['ns15:VehAvailInfos'][0]['ns15:VehAvailInfo'][0]['ns15:ConvertedVehRentalRate'][0]['ns15:VehicleCharges'][0]['ns15:VehicleCharge'];

                    for (var i = 0; i < charges_array.length; i++) {
                        if (charges_array[i]['$'].ChargeType == "DropOffCharge") {
                            temp_obj['drop_off_charge'] = charges_array[i]['$'].Amount;
                            break;
                        }
                    }
                }
            }
            else {
                temp_obj['approximate_total_fare'] = null;
            }
        }
        catch (error) {
            console.log(error);
            return null;
        }
    });

    return temp_obj;
}

//----------------------------------------------------------------------------------------------------------------------- */
// -----------------------------------------------   Town Car Search    -----------------------------------------------
//----------------------------------------------------------------------------------------------------------------------- */

async function getGeoCode(address) {
    var escaped_address = escape(address)
    try {
        var endpoint_url = `http://api.positionstack.com/v1/forward?access_key=${process.env.POSITION_STACK_API}&query=${escaped_address}`;
        var geo_code_details = await axios.get(endpoint_url);

        if (geo_code_details.data && geo_code_details.data.data) {
            var data_array = geo_code_details.data.data;
            if (data_array.length != 0) {
                return data_array[0];
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }

    }
    catch (error) {
        console.log(error);
    }
}

async function getTownCarOneWay(token_details, car_data) {
    //Checking all the required data is available
    if (car_data['pick_up_latitude'] == null) {
        return null;
    }
    else if (car_data['pick_up_longitude'] == null) {
        return null;
    }
    else if (car_data['drop_off_latitude'] == null) {
        return null;
    }
    else if (car_data['drop_off_longitude'] == null) {
        return null;
    }
    else {
        var sabre_endpoint = "https://webservices.havail.sabre.com";
        var headers_info = {
            headers: {
                'cache-control': 'no-cache',
                'Connection': 'keep-alive',
                'Accept-Encoding': 'text/xml',
                'Cache-Control': 'no-cache',
                'Accept': '*/*',
                'Content-Type': 'text/xml'
            }
        };
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
                    <soap-env:Envelope
                    xmlns:soap-env='http://schemas.xmlsoap.org/soap/envelope/'
                    xmlns:xlink='http://www.w3.org/1999/xlink'
                    xmlns:xsd='http://www.w3.org/1999/XMLSchema'>
                        <soap-env:Header>
                            <eb:MessageHeader
                            xmlns:eb='http://www.ebxml.org/namespaces/messageHeader'>
                                    <eb:From>
                                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>Client</eb:PartyId>           
                                    </eb:From>
                                    <eb:To>
                                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>Sabre</eb:PartyId>
                                    </eb:To>
                                    <eb:CAPId>${token_details.capid}</eb:CAPId>
                                    <eb:ConversationId>${token_details.conversationid}</eb:ConversationId>
                                    <eb:Service>GetVehAvailRQ</eb:Service>
                                    <eb:Action>GetVehAvailRQ</eb:Action>
                                    <eb:MessageData>
                                        <eb:MessageId>${token_details.messageid}</eb:MessageId>
                                        <eb:Timestamp>${token_details.timestamp}</eb:Timestamp>
                                    </eb:MessageData>
                            </eb:MessageHeader>
                            <wsse:Security
                            xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext">
                                <wsse:BinarySecurityToken valueType="String" EncodingType="wsse:Base64Binary">${token_details.token}</wsse:BinarySecurityToken>
                            </wsse:Security>
                        </soap-env:Header>
                        <soap-env:Body>
                            <GetVehAvailRQ xmlns="http://services.sabre.com/car/avail/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="2.0.0">
                                <SearchCriteria PickUpDate= "${car_data.pick_up_date}" PickUpTime="${car_data.pick_up_time}" ReturnDate="${car_data.pick_up_date}" ReturnTime="23:59" SortBy="Price" SortOrder="ASC" >
                                    <GeoRef>
                                        <PickUpLocRef>
                                            <GeoCode Latitude="${car_data.pick_up_latitude}" Longitude="${car_data.pick_up_longitude}"/>
                                        </PickUpLocRef>
                                        <ReturnLocRef>
                                            <GeoCode Latitude="${car_data.drop_off_latitude}" Longitude="${car_data.drop_off_longitude}"/>
                                        </ReturnLocRef>
                                    </GeoRef>   
                                    <RatePrefs  RatePlan="D" Commission="false" CurrencyCode="USD" ConvertedRateInfoOnly="false" SupplierCurrencyOnly="false" >
                                    </RatePrefs>
                                    <VehPrefs>
                                        <VehPref>
                                            <VehType>ECAR</VehType>
                                            <VehType>GCAR</VehType>
                                            <VehType>LCAR</VehType>
                                            <VehType>RFDR</VehType>
                                            <VehType>GFDR</VehType>
                                            <VehType>IZAR</VehType>
                                            <VehType>JEAR</VehType>
                                            <VehType>LFDV</VehType>
                                            <VehType>CSAR</VehType>
                                            <VehType>XFAR</VehType>
                                        </VehPref>
                                    </VehPrefs>
                                    <LocPolicyRef Include="true"/>
                                    <ImageRef>
                                        <Image Type="ORIGINAL"/>
                                    </ImageRef>
                                </SearchCriteria>
                            </GetVehAvailRQ>    
                        </soap-env:Body>
                    </soap-env:Envelope>`
        try {
            var api_response = await axios.post(sabre_endpoint, xml, headers_info);
            var car_data_array = await doParseTownCarDataOneWay(api_response.data, car_data);
            return car_data_array;
        }
        catch (error) {
            console.log(error);
            return [];
        }
    }
}

async function doParseTownCarDataOneWay(xml, car_data) {
    var final_result = null;
    var car_data_array = [];

    parseString(xml, function (err, result) {
        var response = {};

        try {
            if (result['soap-env:Envelope']['soap-env:Body']) {
                if (result['soap-env:Envelope']['soap-env:Body'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns28:GetVehAvailRS'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns28:GetVehAvailRS'][0]['ns28:VehAvailInfos'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns28:GetVehAvailRS'][0]['ns28:VehAvailInfos'][0]['ns28:VehAvailInfo']) {
                    var data_array = result['soap-env:Envelope']['soap-env:Body'][0]['ns28:GetVehAvailRS'][0]['ns28:VehAvailInfos'][0]['ns28:VehAvailInfo'];

                    for (var i = 0; i < data_array.length; i++) {
                        var temp_obj = {};
                        temp_obj['car_id'] = (i + 1);

                        temp_obj['pickUpTime'] = car_data.pick_up_time_main;
                        temp_obj['pickUpDate'] = car_data.pick_up_date;
                        temp_obj['pickUpAddress'] = car_data.pick_up_address;
                        temp_obj['dropOffAddress'] = car_data.drop_off_address;
                        temp_obj['carType'] = "One-Way";

                        //Vendor Code
                        if (data_array[i]['ns28:Vendor'] && data_array[i]['ns28:Vendor'][0]?.$?.Code) {
                            temp_obj['vendor_code'] = data_array[i]['ns28:Vendor'][0]?.$?.Code;
                        }
                        else {
                            temp_obj['vendor_code'] = null;
                        }

                        //Vendor Logo
                        if (data_array[i]['ns28:Vendor'] && data_array[i]['ns28:Vendor'][0]?.$?.Logo) {
                            temp_obj['vendor_logo'] = data_array[i]['ns28:Vendor'][0]?.$?.Logo;
                        }
                        else {
                            temp_obj['vendor_logo'] = "https://junipertest.atgtravel.com/images/default_image.png";
                        }

                        //Vendor Name
                        if (data_array[i]['ns28:Vendor'] && data_array[i]['ns28:Vendor'][0]?.$?.Logo) {
                            temp_obj['vendor_name'] = data_array[i]['ns28:Vendor'][0]['$']['Name'];
                        }
                        else {
                            temp_obj['vendor_name'] = null;
                        }

                        //Number of Seats
                        if (data_array[i]['ns28:ConvertedVehRentalRate'] && data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'] && data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'] && data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:SeatBelts'] && data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:SeatBelts'][0]?.$?.Quantity) {
                            temp_obj['num_of_seats'] = data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:SeatBelts'][0]['$']['Quantity'];
                        }
                        else {
                            temp_obj['num_of_seats'] = null;
                        }

                        //RateKey
                        if (data_array[i]['ns28:ConvertedVehRentalRate'] && data_array[i]['ns28:ConvertedVehRentalRate'][0]?.$?.RateKey) {
                            temp_obj['RateKey'] = data_array[i]['ns28:ConvertedVehRentalRate'][0]?.$?.RateKey;
                        }
                        else {
                            temp_obj['RateKey'] = null;
                        }

                        //Approximate Total Fare
                        if (data_array[i]['ns28:ConvertedVehRentalRate'] && data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:VehicleCharges'] && data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:VehicleCharges'][0]['ns28:VehicleCharge']) {
                            var charges_array = data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:VehicleCharges'][0]['ns28:VehicleCharge'];
                            for (var l = 0; l < charges_array.length; l++) {
                                if (charges_array[l]?.$?.ChargeType == "ApproximateTotalPrice") {
                                    temp_obj['approximate_total_fare'] = charges_array[l]?.$?.Amount;
                                }

                                if (charges_array[l]?.$?.ChargeType == "ExtraHour") {
                                    temp_obj['extra_hour_fee'] = charges_array[l]?.$?.Amount;
                                }
                            }

                        }
                        else {
                            temp_obj['approximate_total_fare'] = null;
                        }

                        //Car logo
                        if (data_array[i]['ns28:VehRentalRate'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:Images'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:Images'][0]['ns28:Image'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:Images'][0]['ns28:Image'][0]?.$?.Url) {
                            temp_obj['car_logo'] = data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:Images'][0]['ns28:Image'][0]['$']['Url'];
                        }
                        else {
                            temp_obj['car_logo'] = null;
                        }

                        //Number of bags allowed
                        if (data_array[i]['ns28:VehRentalRate'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:BagsInfo'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:BagsInfo'][0]['ns28:Bags'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:BagsInfo'][0]['ns28:Bags'][0]?.$?.Quantity) {
                            temp_obj['number_of_bags'] = data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:BagsInfo'][0]['ns28:Bags'][0]['$']['Quantity'];
                        }
                        else {
                            temp_obj['number_of_bags'] = null;
                        }

                        //Bag Size
                        if (data_array[i]['ns28:VehRentalRate'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:BagsInfo'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:BagsInfo'][0]['ns28:Bags'] && data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:BagsInfo'][0]['ns28:Bags'][0]?.$?.Size) {
                            temp_obj['bag_size'] = data_array[i]['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:BagsInfo'][0]['ns28:Bags'][0]['$']['Size'];
                        }
                        else {
                            temp_obj['bag_size'] = null;
                        }

                        //Vehicle Type
                        if (data_array[i]['ns28:ConvertedVehRentalRate'] && data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'] && data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'][0]?.$?.VehType) {
                            var vehicle_type = data_array[i]['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'][0]['$']['VehType'];
                            temp_obj['vehicle_type'] = vehicle_type;
                            temp_obj['vehicle_category'] = car_categoty(vehicle_type[0]);
                            temp_obj['vehicle_type'] = car_type(vehicle_type[1]);
                            temp_obj['vehicle_drive'] = drive_type(vehicle_type[2]);
                        }
                        else {
                            temp_obj['vehicle_type'] = null;
                            temp_obj['vehicle_category'] = null;
                            temp_obj['vehicle_type'] = null;
                            temp_obj['vehicle_drive'] = null;
                        }

                        car_data_array.push(temp_obj);
                    }
                }
                else {
                    car_data_array = [];
                }
            }
            else {
                car_data_array = [];
            }
        }
        catch (error) {
            console.log(error);
            car_data_array = [];
        }
    });

    if (car_data_array.length != 0) {
        return car_data_array;
    }
    else {
        return null;
    }
}

async function getTownCarHourly(token_details, car_data) {
    //Checking all the required data is available
    if (car_data['pick_up_latitude'] == null) {
        return null;
    }
    else if (car_data['pick_up_longitude'] == null) {
        return null;
    }
    else {
        var sabre_endpoint = "https://webservices.havail.sabre.com";
        var headers_info = {
            headers: {
                'cache-control': 'no-cache',
                'Connection': 'keep-alive',
                'Accept-Encoding': 'text/xml',
                'Cache-Control': 'no-cache',
                'Accept': '*/*',
                'Content-Type': 'text/xml'
            }
        };
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
                    <soap-env:Envelope
                    xmlns:soap-env='http://schemas.xmlsoap.org/soap/envelope/'
                    xmlns:xlink='http://www.w3.org/1999/xlink'
                    xmlns:xsd='http://www.w3.org/1999/XMLSchema'>
                        <soap-env:Header>
                            <eb:MessageHeader
                            xmlns:eb='http://www.ebxml.org/namespaces/messageHeader'>
                                    <eb:From>
                                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>Client</eb:PartyId>           
                                    </eb:From>
                                    <eb:To>
                                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>Sabre</eb:PartyId>
                                    </eb:To>
                                    <eb:CAPId>${token_details.capid}</eb:CAPId>
                                    <eb:ConversationId>${token_details.conversationid}</eb:ConversationId>
                                    <eb:Service>GetVehAvailRQ</eb:Service>
                                    <eb:Action>GetVehAvailRQ</eb:Action>
                                    <eb:MessageData>
                                        <eb:MessageId>${token_details.messageid}</eb:MessageId>
                                        <eb:Timestamp>${token_details.timestamp}</eb:Timestamp>
                                    </eb:MessageData>
                            </eb:MessageHeader>
                            <wsse:Security
                            xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext">
                                <wsse:BinarySecurityToken valueType="String" EncodingType="wsse:Base64Binary">${token_details.token}</wsse:BinarySecurityToken>
                            </wsse:Security>
                        </soap-env:Header>
                        <soap-env:Body>
                            <GetVehAvailRQ xmlns="http://services.sabre.com/car/avail/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="2.0.0">
                                <SearchCriteria PickUpDate= "${car_data.pick_up_date}" PickUpTime="${car_data.pick_up_time}" ReturnDate="${car_data.pick_up_date}" ReturnTime="${car_data.drop_off_time}" SortBy="Price" SortOrder="ASC" >
                                    <GeoRef>
                                        <PickUpLocRef>
                                            <GeoCode Latitude="${car_data.pick_up_latitude}" Longitude="${car_data.pick_up_longitude}"/>
                                        </PickUpLocRef>
                                    </GeoRef>   
                                    <RatePrefs  RatePlan="D" Commission="false" CurrencyCode="USD" ConvertedRateInfoOnly="false" SupplierCurrencyOnly="false" >
                                    </RatePrefs>
                                    <VehPrefs>
                                        <VehPref>
                                            <VehType>ECAR</VehType>
                                            <VehType>GCAR</VehType>
                                            <VehType>LCAR</VehType>
                                            <VehType>RFDR</VehType>
                                            <VehType>GFDR</VehType>
                                            <VehType>IZAR</VehType>
                                            <VehType>JEAR</VehType>
                                            <VehType>LFDV</VehType>
                                            <VehType>CSAR</VehType>
                                            <VehType>XFAR</VehType>
                                        </VehPref>
                                    </VehPrefs>
                                    <LocPolicyRef Include="true"/>
                                    <ImageRef>
                                        <Image Type="ORIGINAL"/>
                                    </ImageRef>
                                </SearchCriteria>
                            </GetVehAvailRQ>    
                        </soap-env:Body>
                    </soap-env:Envelope>`
        try {
            var api_response = await axios.post(sabre_endpoint, xml, headers_info);
            var car_data_array = await doParseTownCarDataHourly(api_response.data, car_data);
            return car_data_array;
        }
        catch (error) {
            console.log(error);
            return [];
        }
    }
}

async function doParseTownCarDataHourly(xml, car_data) {
    var final_result = null;
    var car_data_array = [];

    parseString(xml, function (err, result) {
        var response = {};

        try {

            if (result['soap-env:Envelope']['soap-env:Body']) {
                if (result['soap-env:Envelope']['soap-env:Body'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns28:GetVehAvailRS'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns28:GetVehAvailRS'][0]['ns28:VehAvailInfos'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns28:GetVehAvailRS'][0]['ns28:VehAvailInfos'][0]['ns28:VehAvailInfo']) {
                    var data_array = result['soap-env:Envelope']['soap-env:Body'][0]['ns28:GetVehAvailRS'][0]['ns28:VehAvailInfos'][0]['ns28:VehAvailInfo'];

                    for (var i = 0; i < data_array.length; i++) {
                        var temp_obj = {};
                        var current_data_obj = data_array[i];
                        temp_obj['car_id'] = (i + 1);

                        temp_obj['pickUpDate'] = car_data.pick_up_date;
                        temp_obj['pickUpTime'] = car_data.pick_up_time;
                        temp_obj['pickUpAddress'] = car_data.pick_up_address;
                        temp_obj['dropOffTime'] = car_data.drop_off_time;
                        temp_obj['carType'] = "Hourly";

                        //Vendor Code
                        if (current_data_obj['ns28:Vendor'] && current_data_obj['ns28:Vendor'][0]?.$?.Code) {
                            temp_obj['vendor_code'] = current_data_obj['ns28:Vendor'][0]['$']['Code'];
                        }
                        else {
                            temp_obj['vendor_code'] = null;
                        }

                        //Vendor Logo
                        if (current_data_obj['ns28:Vendor'] && current_data_obj['ns28:Vendor'][0]?.$?.Logo) {
                            temp_obj['vendor_logo'] = current_data_obj['ns28:Vendor'][0]['$']['Logo'];
                        }
                        else {
                            temp_obj['vendor_logo'] = null;
                        }

                        //RateKey
                        if (data_array[i]['ns28:ConvertedVehRentalRate'] && data_array[i]['ns28:ConvertedVehRentalRate'][0]?.$?.RateKey) {
                            temp_obj['RateKey'] = data_array[i]['ns28:ConvertedVehRentalRate'][0]['$']['RateKey'];
                        }
                        else {
                            temp_obj['RateKey'] = null;
                        }

                        //Vendor Name
                        if (current_data_obj['ns28:Vendor'] && current_data_obj['ns28:Vendor'][0]?.$?.Name) {
                            temp_obj['vendor_name'] = current_data_obj['ns28:Vendor'][0]['$']['Name'];
                        }
                        else {
                            temp_obj['vendor_name'] = null;
                        }

                        //Vehicle Type
                        if (current_data_obj['ns28:ConvertedVehRentalRate'] && current_data_obj['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'] && current_data_obj['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'][0]?.$?.VehType) {
                            var vehicle_type = current_data_obj['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'][0]['$']['VehType'];

                            //Getting the categories from the  
                            temp_obj['vehicle_category'] = car_categoty(vehicle_type[0]);
                            temp_obj['vehicle_type'] = car_type(vehicle_type[1]);
                            temp_obj['vehicle_drive'] = drive_type(vehicle_type[2]);
                        }
                        else {
                            temp_obj['vehicle_category'] = null;
                            temp_obj['vehicle_type'] = null;
                            temp_obj['vehicle_drive'] = null;
                        }

                        //Number of Seats
                        if (current_data_obj['ns28:ConvertedVehRentalRate'] && current_data_obj['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'] && current_data_obj['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'] && current_data_obj['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:SeatBelts'] && current_data_obj['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:SeatBelts'][0]?.$?.Quantity) {
                            temp_obj['num_of_seats'] = current_data_obj['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'][0]['ns28:SeatBeltsAndBagsInfo'][0]['ns28:SeatBelts'][0]['$']['Quantity'];
                        }
                        else {
                            temp_obj['num_of_seats'] = null;
                        }

                        //Approximate Total Fare
                        if (current_data_obj['ns28:ConvertedVehRentalRate'] && current_data_obj['ns28:ConvertedVehRentalRate'][0]['ns28:VehicleCharges'] && current_data_obj['ns28:ConvertedVehRentalRate'][0]['ns28:VehicleCharges'][0]['ns28:VehicleCharge']) {

                            var price_Array = current_data_obj['ns28:ConvertedVehRentalRate'][0]['ns28:VehicleCharges'][0]['ns28:VehicleCharge'];

                            for (var l = 0; l < price_Array.length; l++) {
                                if (price_Array[l]['$'].ChargeType == "ApproximateTotalPrice") {
                                    temp_obj['approximate_total_fare'] = price_Array[l]['$'].Amount;
                                }

                                if (price_Array[l]['$'].ChargeType == "ExtraHour") {
                                    temp_obj['extra_hour_fee'] = price_Array[l]['$'].Amount;
                                }
                            }

                            // if(current_data_obj['ns28:ConvertedVehRentalRate'][0]['ns28:VehicleCharges'][0]['ns28:VehicleCharge'][3]['$']['ChargeType'] == "ApproximateTotalPrice")
                            // {
                            //     var approximate_total_fare = current_data_obj['ns28:ConvertedVehRentalRate'][0]['ns28:VehicleCharges'][0]['ns28:VehicleCharge'][3]['$']['Amount'];
                            //     temp_obj['approximate_total_fare'] = approximate_total_fare;
                            // }
                            // else
                            // {
                            //     var approximate_total_fare = current_data_obj['ns28:ConvertedVehRentalRate'][0]['ns28:VehicleCharges'][0]['ns28:VehicleCharge'][4]['$']['Amount'];
                            //     temp_obj['approximate_total_fare'] = approximate_total_fare;
                            // }


                            // if(current_data_obj['ns28:ConvertedVehRentalRate'][0]['ns28:VehicleCharges'][0]['ns28:VehicleCharge'][4] != undefined)
                            // {    
                            //     temp_obj['approximate_total_fare'] = current_data_obj['ns28:ConvertedVehRentalRate'][0]['ns28:VehicleCharges'][0]['ns28:VehicleCharge'][4]['$']['Amount'];
                            // }
                        }
                        else {
                            temp_obj['approximate_total_fare'] = null;
                            temp_obj['extra_hour_fee'] = null
                        }


                        if (current_data_obj['ns28:VehRentalRate'] && current_data_obj['ns28:VehRentalRate'][0]['ns28:Vehicle'] && current_data_obj['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:Images'] && current_data_obj['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:Images'][0]['ns28:Image'] && current_data_obj['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:Images'][0]['ns28:Image'][0]?.$?.Url) {
                            temp_obj['car_logo'] = current_data_obj['ns28:VehRentalRate'][0]['ns28:Vehicle'][0]['ns28:Images'][0]['ns28:Image'][0]['$']['Url'];
                        }
                        else {
                            temp_obj['car_logo'] = "https://junipertest.atgtravel.com/images/default_image.png";
                        }

                        //Car Logo
                        // if(current_data_obj['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'][0]['ns28:Images'] != undefined)
                        // {
                        //     var car_logo_details = current_data_obj['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'][0]['ns28:Images'];

                        //     if(Object.values(car_logo_details)[0] != "")
                        //     {
                        //         var car_logo =  current_data_obj['ns28:ConvertedVehRentalRate'][0]['ns28:Vehicle'][0]['ns28:Images'][0]['ns28:Image'][0]['$']['Url'];
                        //         temp_obj['car_logo'] = car_logo;
                        //     }
                        // }
                        // else
                        // {
                        //     temp_obj['car_logo'] = null;
                        // }

                        car_data_array.push(temp_obj);
                    }
                }
                else if (result['soap-env:Envelope']['soap-env:Body'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns28:GetVehAvailRS'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns28:GetVehAvailRS'][0]['ns10:ApplicationResults'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns28:GetVehAvailRS'][0]['ns10:ApplicationResults'][0]['ns10:Warning'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns28:GetVehAvailRS'][0]['ns10:ApplicationResults'][0]['ns10:Warning'][0]['ns10:SystemSpecificResults'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns28:GetVehAvailRS'][0]['ns10:ApplicationResults'][0]['ns10:Warning'][0]['ns10:SystemSpecificResults'][0]['ns10:Message'] && result['soap-env:Envelope']['soap-env:Body'][0]['ns28:GetVehAvailRS'][0]['ns10:ApplicationResults'][0]['ns10:Warning'][0]['ns10:SystemSpecificResults'][0]['ns10:Message'][0]?._) {
                    response['status'] = 404;
                    response['message'] = "NO RATES QUALIFY";
                    car_data_array = [];
                }
                else {
                    car_data_array = [];
                }
            }
        }
        catch (error) {
            console.log(error);
            car_data_array = [];
        }
    });

    if (car_data_array.length != 0) {
        return car_data_array;
    }
    else {
        return null;
    }
}

//----------------------------------------------------------------------------------------------------------------------- */
// ---------------------------------------------------   Rail Search    -------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------- */

async function getStatioName(token_details, city_name) {
    var sabre_endpoint = "https://webservices.havail.sabre.com";
    var headers_info = {
        headers: {
            'cache-control': 'no-cache',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'text/xml',
            'Cache-Control': 'no-cache',
            'Accept': '*/*',
            'Content-Type': 'text/xml'
        }
    };
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
                    <soap-env:Envelope
                    xmlns:soap-env='http://schemas.xmlsoap.org/soap/envelope/'
                    xmlns:xlink='http://www.w3.org/1999/xlink'
                    xmlns:xsd='http://www.w3.org/1999/XMLSchema'>
                        <soap-env:Header>
                            <eb:MessageHeader
                            xmlns:eb='http://www.ebxml.org/namespaces/messageHeader'>
                                    <eb:From>
                                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>Client</eb:PartyId>           
                                    </eb:From>
                                    <eb:To>
                                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>SWS</eb:PartyId>
                                    </eb:To>
                                    <eb:CAPId>${token_details.capid}</eb:CAPId>
                                    <eb:ConversationId>${token_details.conversationid}</eb:ConversationId>
                                    <eb:Service>RailLocationRQ</eb:Service>
                                    <eb:Action>RailLocationRQ</eb:Action>
                                    <eb:MessageData>
                                        <eb:MessageId>${token_details.messageid}</eb:MessageId>
                                        <eb:Timestamp>${token_details.timestamp}</eb:Timestamp>
                                    </eb:MessageData>
                            </eb:MessageHeader>
                            <wsse:Security
                            xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext">
                                <wsse:BinarySecurityToken valueType="String" EncodingType="wsse:Base64Binary">${token_details.token}</wsse:BinarySecurityToken>
                            </wsse:Security>
                        </soap-env:Header>
                        <soap-env:Body>
                            <RailLocationRQ xmlns="http://webservices.sabre.com/sabreXML/RCP/rl" PrimaryLangID="en" Version="1.22.0">
                                <LocationCriteria>
                                    <Locations>
                                        <Location>${city_name}</Location>
                                    </Locations>
                                </LocationCriteria>
                            </RailLocationRQ>
                        </soap-env:Body>
                    </soap-env:Envelope>`

    try {
        var api_response = await axios.post(sabre_endpoint, xml, headers_info);
        var station_name = await doParseStatioName(api_response.data);
        return station_name;
    }
    catch (error) {
        console.log(error);
        return [];
    }
}

async function doParseStatioName(xml) {
    var final_result = null;
    parseString(xml, function (err, result) {
        try {
            final_result = result;
        }
        catch (error) {
            return null;
        }
    });

    return final_result;
}

async function getRailDetailsOneWay(token_details, rail_details) {
    var sabre_endpoint = "https://webservices.havail.sabre.com";
    var headers_info = {
        headers: {
            'cache-control': 'no-cache',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'text/xml',
            'Cache-Control': 'no-cache',
            'Accept': '*/*',
            'Content-Type': 'text/xml'
        }
    };
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
                    <soap-env:Envelope
                    xmlns:soap-env='http://schemas.xmlsoap.org/soap/envelope/'
                    xmlns:xlink='http://www.w3.org/1999/xlink'
                    xmlns:xsd='http://www.w3.org/1999/XMLSchema'>
                        <soap-env:Header>
                            <eb:MessageHeader
                            xmlns:eb='http://www.ebxml.org/namespaces/messageHeader'>
                                    <eb:From>
                                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>Client</eb:PartyId>           
                                    </eb:From>
                                    <eb:To>
                                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>Sabre</eb:PartyId>
                                    </eb:To>
                                    <eb:CAPId>${token_details.capid}</eb:CAPId>
                                    <eb:ConversationId>${token_details.conversationid}</eb:ConversationId>
                                    <eb:Service>RailShopRQ</eb:Service>
                                    <eb:Action>RailShopRQ</eb:Action>
                                    <eb:MessageData>
                                        <eb:MessageId>${token_details.messageid}</eb:MessageId>
                                        <eb:Timestamp>${token_details.timestamp}</eb:Timestamp>
                                    </eb:MessageData>
                            </eb:MessageHeader>
                            <wsse:Security
                            xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext">
                                <wsse:BinarySecurityToken valueType="String" EncodingType="wsse:Base64Binary">${token_details.token}</wsse:BinarySecurityToken>
                            </wsse:Security>
                        </soap-env:Header>
                        <soap-env:Body>
                        <ns10:RailShopRQ xmlns:ns10="http://webservices.sabre.com/sabreXML/RCP/rs" xmlns:ns11="http://webservices.sabre.com/sabreXML/RCP/rsm" xmlns:ns12="http://webservices.sabre.com/sabreXML/RCP/rd" xmlns:ns13="http://webservices.sabre.com/sabreXML/RCP/rrep" xmlns:ns14="http://webservices.sabre.com/sabreXML/RCP/ris" xmlns:ns15="http://webservices.sabre.com/sabreXML/RCP/rpnrs" xmlns:ns16="http://webservices.sabre.com/sabreXML/RCP/rrc" xmlns:ns17="http://webservices.sabre.com/sabreXML/RCP/rrs" xmlns:ns18="http://webservices.sabre.com/sabreXML/RCP/rrr" xmlns:ns19="http://webservices.sabre.com/sabreXML/RCP/rmas" xmlns:ns2="http://schemas.xmlsoap.org/ws/2002/12/secext" xmlns:ns20="http://webservices.sabre.com/sabreXML/RCP/rl" xmlns:ns21="http://webservices.sabre.com/sabreXML/RCP/rmb" xmlns:ns22="http://webservices.sabre.com/sabreXML/RCP/rmt" xmlns:ns4="http://www.ebxml.org/namespaces/messageHeader" xmlns:ns5="http://www.w3.org/1999/xlink" xmlns:ns6="http://www.w3.org/2000/09/xmldsig#" xmlns:ns7="urn:schemas-sabre-com:soap-header-debug" xmlns:ns8="http://webservices.sabre.com/sabreXML/RCP/ota" xmlns:ns9="http://webservices.sabre.com/sabreXML/RCP/common" CorrelationID="11131632" MarketingCarrier="6X_B" PrimaryLangID="en" ResponseType="Fares" SearchType="AVAIL" Version="1.22.0">
                        <ns10:OffersSearchCriteria>
                            <ns10:AvailQueryCriteria JourneyDirection="Outbound" MaxConnections="0">
                                <ns10:DepartureDateTime>2021-07-05T00:00:00</ns10:DepartureDateTime>
                                <ns10:OriginAndDestination>
                                    <ns10:Origin LocationCode="NLASC"/>
                                    <ns10:Destination LocationCode="BEBMI"/>
                                </ns10:OriginAndDestination>
                            </ns10:AvailQueryCriteria>
                            <ns10:PassengerTypes>
                                <ns9:PassengerType Code="A" Quantity="1"/>
                            </ns10:PassengerTypes>
                        </ns10:OffersSearchCriteria>
                    </ns10:RailShopRQ>     
                        </soap-env:Body>
                    </soap-env:Envelope>`

    try {
        var api_response = await axios.post(sabre_endpoint, xml, headers_info);
        var city_details = await doParseRailDetailsOneWay(api_response.data);
        return city_details;
    }
    catch (error) {
        console.log(error);
        return [];
    }
}

async function doParseRailDetailsOneWay(xml) {
    var final_result = null;
    parseString(xml, function (err, result) {
        try {
            final_result = result;
        }
        catch (error) {
            return null;
        }
    });

    return final_result;
}

//----------------------------------------------------------------------------------------------------------------------- */
// -------------------------------------------------   Profile Search    ------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------- */

async function searchProfilesByEmail(token_details, email) {

    if (email == "admin@atgtravel.com") {
        var request_body = `<Sabre_OTA_ProfileSearchRQ Version='6.55' xmlns='http://www.sabre.com/eps/schemas' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='http://www.sabre.com/eps/schemas
        C:/code/EPS/schemas/STABLE~2.1/schemasWSDL/Sabre_OTA_ProfileSearchRQ.xsd'>
            <ProfileSearchCriteria ProfileNameOnly='Y' ReturnCount="1">
                <TPA_Identity ProfileName='*' DomainID='*' ProfileTypeCode='TVL' ClientCode='TN' ClientContextCode='TMP'/>
                <Traveler Surname="Never US" GivenName="William"/>
                <Email EmailAddress="${email}" />
            </ProfileSearchCriteria>
        </Sabre_OTA_ProfileSearchRQ>`
    }
    else {
        var request_body = `<Sabre_OTA_ProfileSearchRQ Version='6.55' xmlns='http://www.sabre.com/eps/schemas' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='http://www.sabre.com/eps/schemas
        C:/code/EPS/schemas/STABLE~2.1/schemasWSDL/Sabre_OTA_ProfileSearchRQ.xsd'>
            <ProfileSearchCriteria ProfileNameOnly='Y' ReturnCount="1">
                <TPA_Identity ProfileName='*' DomainID='*' ProfileTypeCode='TVL' ClientCode='TN' ClientContextCode='TMP'/>
                <Email EmailAddress="${email}" />
            </ProfileSearchCriteria>
        </Sabre_OTA_ProfileSearchRQ>`
    }

    var sabre_endpoint = "https://webservices.havail.sabre.com";
    var headers_info = {
        headers: {
            'cache-control': 'no-cache',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'text/xml',
            'Cache-Control': 'no-cache',
            'Accept': '*/*',
            'Content-Type': 'text/xml'
        }
    };
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <soap-env:Envelope
    xmlns:soap-env='http://schemas.xmlsoap.org/soap/envelope/'
    xmlns:xlink='http://www.w3.org/1999/xlink'
    xmlns:xsd='http://www.w3.org/1999/XMLSchema'>
        <soap-env:Header>
            <eb:MessageHeader
            xmlns:eb='http://www.ebxml.org/namespaces/messageHeader'>
                    <eb:From>
                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>Client</eb:PartyId>           
                    </eb:From>
                    <eb:To>
                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>Sabre</eb:PartyId>
                    </eb:To>
                    <eb:CAPId>${token_details.capid}</eb:CAPId>
                    <eb:ConversationId>${token_details.conversationid}</eb:ConversationId>
                    <eb:Service>EPS_EXT_ProfileSearchRQ</eb:Service>
                    <eb:Action>EPS_EXT_ProfileSearchRQ</eb:Action>
                    <eb:MessageData>
                        <eb:MessageId>${token_details.messageid}</eb:MessageId>
                        <eb:Timestamp>${token_details.timestamp}</eb:Timestamp>
                    </eb:MessageData>
            </eb:MessageHeader>
            <wsse:Security
            xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext">
                <wsse:BinarySecurityToken valueType="String" EncodingType="wsse:Base64Binary">${token_details.token}</wsse:BinarySecurityToken>
            </wsse:Security>
        </soap-env:Header>
        <soap-env:Body>
            ${request_body}
        </soap-env:Body>
    </soap-env:Envelope>`

    try {
        var api_response = await axios.post(sabre_endpoint, xml, headers_info);
        var profile_details = await doParseSearchResultByEmail(api_response.data);

        if (profile_details != null) {
            return profile_details;
        }
        else {
            return {};
        }
    }
    catch(error)
    {
        console.log(error.response.data);
        return {};
    }
}

async function doParseSearchResultByEmail(xml) {
    default_field_info = [];
    final_traveler_info_array = {};
    error = null;

    parseString(xml, function (err, result) {
        try {
            //Getting traveler information
            if (result['soap-env:Envelope']['soap-env:Body'] && result['soap-env:Envelope']['soap-env:Body'][0] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0]['Profile'] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0]['Profile'][0] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0]['Profile'][0]['Traveler'] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0]['Profile'][0]['Traveler'][0] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0]['Profile'][0]['Traveler'][0]['Customer'] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0]['Profile'][0]['Traveler'][0]['Customer'][0]) {
                tmp_result = result;
                traveler_info_array_obj = result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0]['Profile'][0]['Traveler'][0]['Customer'][0];
            }
            else {
                traveler_info_array_obj = null;
            }

            if (result['soap-env:Envelope']['soap-env:Body'] && result['soap-env:Envelope']['soap-env:Body'][0] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0]['Profile'] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0]['Profile'][0] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0]['Profile'][0]['Traveler'] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0]['Profile'][0]['Traveler'][0] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0]['Profile'][0]['Traveler'][0]['TPA_Extensions']) {
                if (result['soap-env:Envelope']['soap-env:Body'] && result['soap-env:Envelope']['soap-env:Body'][0] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0]['Profile'] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0]['Profile'][0] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0]['Profile'][0]['Traveler'] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0]['Profile'][0]['Traveler'][0] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0]['Profile'][0]['Traveler'][0]['TPA_Extensions'] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0]['Profile'][0]['Traveler'][0]['TPA_Extensions'][0] && result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0]['Profile'][0]['Traveler'][0]['TPA_Extensions'][0]['CustomDefinedData']) {
                    custom_defined_info_obj_array = result['soap-env:Envelope']['soap-env:Body'][0]['Sabre_OTA_ProfileSearchRS'][0]['ProfileInfo'][0]['Profile'][0]['Traveler'][0]['TPA_Extensions'][0]['CustomDefinedData'];
                }
                else {
                    custom_defined_info_obj_array = null
                }
            }
            else {
                custom_defined_info_obj_array = null;
            }
        }
        catch (error) {
            console.log(error);
            error = 1;
        }
    });

    if (error === 1) {
        return null;
    }
    else {
        if (traveler_info_array_obj != null) {
            traveler_info_array_obj_keys = Object.keys(traveler_info_array_obj);

            for (var i = 0; i < traveler_info_array_obj_keys.length; i++) {
                var current_data_array = traveler_info_array_obj_keys[i];

                //Traveler Name
                if (current_data_array === "PersonName") {
                    if (traveler_info_array_obj[current_data_array][0]['GivenName'] != undefined) {

                        if (traveler_info_array_obj[current_data_array][0]['GivenName'][0] == "MELANIE") {
                            final_traveler_info_array['first_name'] = 'William'
                        }
                        else if (traveler_info_array_obj[current_data_array][0]['GivenName'][0] == "MARCO") {
                            final_traveler_info_array['first_name'] = 'SALLY'
                        }
                        else if (traveler_info_array_obj[current_data_array][0]['GivenName'][0] == "Albert") {
                            final_traveler_info_array['first_name'] = 'John'
                        }
                        else if (traveler_info_array_obj[current_data_array][0]['GivenName'][0] == "Latina") {
                            final_traveler_info_array['first_name'] = 'William'
                        }
                        else {
                            final_traveler_info_array['first_name'] = traveler_info_array_obj[current_data_array][0]['GivenName'][0];
                        }
                    }
                    else {
                        final_traveler_info_array['first_name'] = null;
                    }

                    if (traveler_info_array_obj[current_data_array][0]['SurName'] != undefined) {

                        if (traveler_info_array_obj[current_data_array][0]['SurName'][0] == "BREIDUNG") {
                            final_traveler_info_array['last_name'] = "Never";
                        }
                        else if (traveler_info_array_obj[current_data_array][0]['SurName'][0] == "KOHNKE") {
                            final_traveler_info_array['last_name'] = "Ride";
                        }
                        else if (traveler_info_array_obj[current_data_array][0]['SurName'][0] == "Chuang") {
                            final_traveler_info_array['last_name'] = "Doe";
                        }
                        else if (traveler_info_array_obj[current_data_array][0]['SurName'][0] == "Dimitrova") {
                            final_traveler_info_array['last_name'] = "Never";
                        }
                        else {
                            final_traveler_info_array['last_name'] = traveler_info_array_obj[current_data_array][0]['SurName'][0];
                        }
                    }
                    else {
                        final_traveler_info_array['last_name'] = null;
                    }
                }

                //Telephone
                if (current_data_array === "Telephone") {
                    if (traveler_info_array_obj[current_data_array][0]['FullPhoneNumber'] != undefined) {
                        final_traveler_info_array['telephone'] = formatPhoneNum(traveler_info_array_obj[current_data_array][0]['FullPhoneNumber'][0]);

                    }

                    if (traveler_info_array_obj[current_data_array][0]['ParsedPhoneNumber'] != undefined) {
                        var telephone_country_code = traveler_info_array_obj[current_data_array][0]['ParsedPhoneNumber'][0]['$']['CountryCd'];
                        var telephone_number = traveler_info_array_obj[current_data_array][0]['ParsedPhoneNumber'][0]['$']['PhoneNumber'];

                        if (telephone_country_code != undefined && telephone_number != undefined) {
                            final_traveler_info_array['telephone'] = formatPhoneNum(telephone_number);
                        }
                        else if (telephone_number != undefined) {
                            final_traveler_info_array['telephone'] = formatPhoneNum(telephone_number);

                        }
                    }
                }

                //Email
                if (current_data_array === "Email") {
                    final_traveler_info_array['email'] = traveler_info_array_obj[current_data_array][0]['$']['EmailAddress'];
                }

                //Address
                if (current_data_array === "Address") {
                    if (traveler_info_array_obj[current_data_array][0]['AddressLine'] != undefined) {
                        final_traveler_info_array['address_line'] = traveler_info_array_obj[current_data_array][0]['AddressLine'][0];
                    }

                    if (traveler_info_array_obj[current_data_array][0]['CityName'] != undefined) {
                        final_traveler_info_array['city_name'] = traveler_info_array_obj[current_data_array][0]['CityName'][0];
                    }

                    if (traveler_info_array_obj[current_data_array][0]['PostalCd'] != undefined) {
                        final_traveler_info_array['postal_code'] = traveler_info_array_obj[current_data_array][0]['PostalCd'][0];
                    }

                    if (traveler_info_array_obj[current_data_array][0]['StateCode'] != undefined) {
                        final_traveler_info_array['state_code'] = traveler_info_array_obj[current_data_array][0]['StateCode'][0];
                    }

                    if (traveler_info_array_obj[current_data_array][0]['CountryCode'] != undefined) {
                        final_traveler_info_array['country_code'] = traveler_info_array_obj[current_data_array][0]['CountryCode'][0];
                    }
                }

                //Employee Info
                if (current_data_array === "EmploymentInfo") {
                    if (traveler_info_array_obj[current_data_array][0]['EmployeeInfo'][0]['$']['EmployeeId'] != undefined) {
                        final_traveler_info_array['employee_id'] = traveler_info_array_obj[current_data_array][0]['EmployeeInfo'][0]['$']['EmployeeId'];
                    }

                    if (traveler_info_array_obj[current_data_array][0]['EmployeeInfo'][0]['$']['EmployeeTitle'] != undefined) {
                        final_traveler_info_array['employee_title'] = traveler_info_array_obj[current_data_array][0]['EmployeeInfo'][0]['$']['EmployeeTitle'];
                    }

                    if (traveler_info_array_obj[current_data_array][0]['EmployeeInfo'][0]['$']['Company'] != undefined) {
                        final_traveler_info_array['employee_company'] = traveler_info_array_obj[current_data_array][0]['EmployeeInfo'][0]['$']['Company'];
                    }

                    if (traveler_info_array_obj[current_data_array][0]['EmployeeInfo'][0]['$']['Division'] != undefined) {
                        final_traveler_info_array['employee_division'] = traveler_info_array_obj[current_data_array][0]['EmployeeInfo'][0]['$']['Division'];
                    }

                    if (traveler_info_array_obj[current_data_array][0]['EmployeeInfo'][0]['$']['AccountingCd'] != undefined) {
                        final_traveler_info_array['employee_accounting_code'] = traveler_info_array_obj[current_data_array][0]['EmployeeInfo'][0]['$']['AccountingCd'];
                    }

                    if (traveler_info_array_obj[current_data_array][0]['EmployeeInfo'][0]['$']['LocationCd'] != undefined) {
                        final_traveler_info_array['employee_location_code'] = traveler_info_array_obj[current_data_array][0]['EmployeeInfo'][0]['$']['LocationCd'];
                    }

                    if (traveler_info_array_obj[current_data_array][0]['EmployeeInfo'][0]['$']['BranchID'] != undefined) {
                        final_traveler_info_array['employee_branch_id'] = traveler_info_array_obj[current_data_array][0]['EmployeeInfo'][0]['$']['BranchID'];
                    }
                }
            }
        }

        if (custom_defined_info_obj_array != null) {
            for (var j = 0; j < custom_defined_info_obj_array.length; j++) {
                data_obj = {};
                current_obj = custom_defined_info_obj_array[j]['$'];

                object_key = current_obj['InformationText'];
                object_value = current_obj['Value'];

                //Employee ID for Wargaming
                if (object_key == "UD27_EMPLOYEEID") {
                    if (!final_traveler_info_array['employee_id']) {
                        final_traveler_info_array['employee_id'] = object_value;
                    }
                }

                if (object_value != "") {
                    data_obj[object_key] = object_value;
                    default_field_info.push(data_obj);
                }
            }

            final_traveler_info_array['default_field_info'] = default_field_info;
        }

        return final_traveler_info_array;
    }
}

//----------------------------------------------------------------------------------------------------------------------- */
// -------------------------------------------------   Create PNR    ------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------- */

async function createPNR(token_details, booking_details) {
    if (booking_details.is_flight || booking_details.is_hotel || booking_details.is_rental_car) {

        if (booking_details.is_flight) {
            var flight_data = `<AirBook> <RetryRebook Option="true"/> <HaltOnStatus Code="HL" /> <HaltOnStatus Code="NN" /> <HaltOnStatus Code="KK" /> <HaltOnStatus Code="LL" /> <HaltOnStatus Code="NO" /> <HaltOnStatus Code="UC" /> <HaltOnStatus Code="US" /> <OriginDestinationInformation>`;
            var schedule_details = booking_details.flight_schedule_details;

            for (var i = 0; i < schedule_details.length; i++) {
                flight_data += `<FlightSegment ArrivalDateTime="${schedule_details[i].arrivalDateTime}" DepartureDateTime="${schedule_details[i].departureDateTime}" FlightNumber="${schedule_details[i].MarketflightNumber}" NumberInParty="${schedule_details[i].NumberInParty}" ResBookDesigCode="${schedule_details[i].ResBookDesigCode}" Status="${schedule_details[i].Status}"> <DestinationLocation LocationCode="${schedule_details[i].DestinationLocation}" /> <MarketingAirline Code="${schedule_details[i].MarketingCarrier}" FlightNumber="${schedule_details[i].MarketflightNumber}" /> <OriginLocation LocationCode="${schedule_details[i].OriginLocation}" /> </FlightSegment>`;
            }

            flight_data += `</OriginDestinationInformation> <RedisplayReservation NumAttempts="10" WaitInterval="300" /> </AirBook>`;
        }
        else {
            flight_data = ``;
        }

        if (booking_details.is_hotel) {
            var hotel_data = `<HotelBook><BookingInfo><BookingKey>${booking_details.booking_key}</BookingKey></BookingInfo></HotelBook>`;
        }
        else {
            var hotel_data = ``;
        }

        if (booking_details.is_rental_car) {
            var rental_car_details = `<VehicleBook> <RatePrefs RateCode="${booking_details.RateCode}"> <DropOffCharge Amount="${booking_details.DropOffCharge}"/> </RatePrefs> <VehRentalCore InsertAfter="0" PickUpDate="${booking_details.PickUpDate}" PickUpTime="${booking_details.PickUpTime}" Quantity="${booking_details.Quantity}" ReturnDate="${booking_details.ReturnDate}" ReturnTime="${booking_details.ReturnTime}"> <PickUpLocation LocationCode="${booking_details.PickUpLocation}"/> <ReturnLocation LocationCode="${booking_details.ReturnLocation}"/> </VehRentalCore> </VehicleBook>`;
        }
        else {
            var rental_car_details = ``;
        }

        var sabre_endpoint1 = "https://sws-crt.cert.havail.sabre.com";
        var headers_info = {
            headers: {
                'cache-control': 'no-cache',
                'Connection': 'keep-alive',
                'Accept-Encoding': 'text/xml',
                'Cache-Control': 'no-cache',
                'Accept': '*/*',
                'Content-Type': 'text/xml'
            }
        };
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
        <soap-env:Envelope
        xmlns:soap-env='http://schemas.xmlsoap.org/soap/envelope/'
        xmlns:xlink='http://www.w3.org/1999/xlink'
        xmlns:xsd='http://www.w3.org/1999/XMLSchema'>
            <soap-env:Header>
                <eb:MessageHeader
                xmlns:eb='http://www.ebxml.org/namespaces/messageHeader'>
                        <eb:From>
                            <eb:PartyId eb:type='urn:x12.org.IO5:01'>Client</eb:PartyId>           
                        </eb:From>
                        <eb:To>
                            <eb:PartyId eb:type='urn:x12.org.IO5:01'>Sabre</eb:PartyId>
                        </eb:To>
                        <eb:CAPId>${token_details.capid}</eb:CAPId>
                        <eb:ConversationId>${token_details.conversationid}</eb:ConversationId>
                        <eb:Action>CreatePassengerNameRecordRQ</eb:Action>
                        <eb:MessageData>
                            <eb:MessageId>${token_details.messageid}</eb:MessageId>
                            <eb:Timestamp>${token_details.timestamp}</eb:Timestamp>
                        </eb:MessageData>
                </eb:MessageHeader>
                <wsse:Security
                xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext">
                    <wsse:BinarySecurityToken valueType="String" EncodingType="wsse:Base64Binary">${token_details.token}</wsse:BinarySecurityToken>
                </wsse:Security>
            </soap-env:Header>
            <soap-env:Body>
                <CreatePassengerNameRecordRQ xmlns="http://services.sabre.com/sp/reservation/v2_4" version="2.4.0" targetCity="NO8H" haltOnAirPriceError="true">
                    <TravelItineraryAddInfo>
                        <AgencyInfo> 
                            <Address> 
                                <AddressLine>ATG Travel Company</AddressLine> 
                                <CityName>Boston</CityName> 
                                <CountryCode>US</CountryCode> 
                                <PostalCode>00000</PostalCode> 
                                <StateCountyProv StateCode="DX"/> 
                                <StreetNmbr>123 Road</StreetNmbr> 
                            </Address>
                            <Ticketing TicketType="7TAW"/> 
                        </AgencyInfo> 
                        <CustomerInfo>
                        <ContactNumbers>
                            <ContactNumber NameNumber="1.1" Phone="123-456-7891" PhoneUseType="W" />
                        </ContactNumbers>
                        <PersonName NameNumber="1.1">
                            <GivenName>William</GivenName>
                            <Surname>Never</Surname>
                        </PersonName>
                        </CustomerInfo>
                    </TravelItineraryAddInfo>
                    ${flight_data}
                    ${hotel_data}
                    ${rental_car_details}
                    <PostProcessing>
                        <EndTransaction>
                        <Source ReceivedFrom="Baldwin - Booking Butler - Test PNR" />
                        </EndTransaction>
                        <PostBookingHKValidation waitInterval="2000" numAttempts="6" />
                        <WaitForAirlineRecLoc waitInterval="2000" numAttempts="6" />
                        <RedisplayReservation waitInterval="100" />
                    </PostProcessing>
                </CreatePassengerNameRecordRQ>
            </soap-env:Body>
        </soap-env:Envelope>`

        try {

            var api_response = await axios.post(sabre_endpoint1, xml, headers_info);
            var createPNRResponse = await doParsePNRData(api_response.data);

            if (createPNRResponse) {
                return createPNRResponse;
            }
            else {
                return null;
            }
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    else {
        return null;
    }
}

async function doParsePNRData(xml) {
    var pnr_response = {};

    parseString(xml, function (err, result) {
        try {
            if (result['soap-env:Envelope']['soap-env:Body']) {

                //PNR Locator ID
                if (result['soap-env:Envelope']['soap-env:Body'] && result['soap-env:Envelope']['soap-env:Body'][0]['CreatePassengerNameRecordRS'] && result['soap-env:Envelope']['soap-env:Body'][0]['CreatePassengerNameRecordRS'][0]['ItineraryRef'] && result['soap-env:Envelope']['soap-env:Body'][0]['CreatePassengerNameRecordRS'][0]['ItineraryRef'][0]['$'] && result['soap-env:Envelope']['soap-env:Body'][0]['CreatePassengerNameRecordRS'][0]['ItineraryRef'][0]['$']['ID']) {
                    pnr_response.locator_id = result['soap-env:Envelope']['soap-env:Body'][0]['CreatePassengerNameRecordRS'][0]['ItineraryRef'][0]['$']['ID'];
                }
                else {
                    pnr_response.locator_id = null;
                }

                if (result['soap-env:Envelope']['soap-env:Body'] && result['soap-env:Envelope']['soap-env:Body'][0]['CreatePassengerNameRecordRS'] && result['soap-env:Envelope']['soap-env:Body'][0]['CreatePassengerNameRecordRS'][0]['TravelItineraryRead'] && result['soap-env:Envelope']['soap-env:Body'][0]['CreatePassengerNameRecordRS'][0]['TravelItineraryRead'][0]['TravelItinerary'] && result['soap-env:Envelope']['soap-env:Body'][0]['CreatePassengerNameRecordRS'][0]['TravelItineraryRead'][0]['TravelItinerary'][0]['CustomerInfo'] && result['soap-env:Envelope']['soap-env:Body'][0]['CreatePassengerNameRecordRS'][0]['TravelItineraryRead'][0]['TravelItinerary'][0]['CustomerInfo'][0]['PersonName'] && result['soap-env:Envelope']['soap-env:Body'][0]['CreatePassengerNameRecordRS'][0]['TravelItineraryRead'][0]['TravelItinerary'][0]['CustomerInfo'][0]['PersonName'][0]['GivenName']) {
                    pnr_response.first_name = result['soap-env:Envelope']['soap-env:Body'][0]['CreatePassengerNameRecordRS'][0]['TravelItineraryRead'][0]['TravelItinerary'][0]['CustomerInfo'][0]['PersonName'][0]['GivenName'][0];
                }
                else {
                    pnr_response.first_name = null;
                }

                if (result['soap-env:Envelope']['soap-env:Body'] && result['soap-env:Envelope']['soap-env:Body'][0]['CreatePassengerNameRecordRS'] && result['soap-env:Envelope']['soap-env:Body'][0]['CreatePassengerNameRecordRS'][0]['TravelItineraryRead'] && result['soap-env:Envelope']['soap-env:Body'][0]['CreatePassengerNameRecordRS'][0]['TravelItineraryRead'][0]['TravelItinerary'] && result['soap-env:Envelope']['soap-env:Body'][0]['CreatePassengerNameRecordRS'][0]['TravelItineraryRead'][0]['TravelItinerary'][0]['CustomerInfo'] && result['soap-env:Envelope']['soap-env:Body'][0]['CreatePassengerNameRecordRS'][0]['TravelItineraryRead'][0]['TravelItinerary'][0]['CustomerInfo'][0]['PersonName'] && result['soap-env:Envelope']['soap-env:Body'][0]['CreatePassengerNameRecordRS'][0]['TravelItineraryRead'][0]['TravelItinerary'][0]['CustomerInfo'][0]['PersonName'][0]['Surname']) {
                    pnr_response.last_name = result['soap-env:Envelope']['soap-env:Body'][0]['CreatePassengerNameRecordRS'][0]['TravelItineraryRead'][0]['TravelItinerary'][0]['CustomerInfo'][0]['PersonName'][0]['Surname'][0]
                }
                else {
                    pnr_response.last_name = null;
                }
                pnr_response.data = result['soap-env:Envelope']['soap-env:Body'];
            } else {
                pnr_response.data = null;
            }
        }
        catch (error) {
            console.log(error);
        }
    });

    if (pnr_response) {
        return pnr_response;
    }
    else {
        return null;
    }
}

//----------------------------------------------------------------------------------------------------------------------- */
// -------------------------------------------------   MICN Search    ---------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------- */

async function get_vehicle_vendor_codes_all(token_details) {

    var sabre_endpoint = "https://webservices.havail.sabre.com";
    var headers_info = {
        headers: {
            'cache-control': 'no-cache',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'text/xml',
            'Cache-Control': 'no-cache',
            'Accept': '*/*',
            'Content-Type': 'text/xml'
        }
    };
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
                    <soap-env:Envelope
                    xmlns:soap-env='http://schemas.xmlsoap.org/soap/envelope/'
                    xmlns:xlink='http://www.w3.org/1999/xlink'
                    xmlns:xsd='http://www.w3.org/1999/XMLSchema'>
                        <soap-env:Header>
                            <eb:MessageHeader
                            xmlns:eb='http://www.ebxml.org/namespaces/messageHeader'>
                                    <eb:From>
                                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>Client</eb:PartyId>           
                                    </eb:From>
                                    <eb:To>
                                        <eb:PartyId eb:type='urn:x12.org.IO5:01'>SWS</eb:PartyId>
                                    </eb:To>
                                    <eb:CAPId>${token_details.capid}</eb:CAPId>
                                    <eb:ConversationId>${token_details.conversationid}</eb:ConversationId>
                                    <eb:Action>VendorCodesLLSRQ</eb:Action>
                                    <eb:MessageData>
                                        <eb:MessageId>${token_details.messageid}</eb:MessageId>
                                        <eb:Timestamp>${token_details.timestamp}</eb:Timestamp>
                                    </eb:MessageData>
                            </eb:MessageHeader>
                            <wsse:Security
                            xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext">
                                <wsse:BinarySecurityToken valueType="String" EncodingType="wsse:Base64Binary">${token_details.token}</wsse:BinarySecurityToken>
                            </wsse:Security>
                        </soap-env:Header>
                        <soap-env:Body>
                            <VendorCodesRQ Version="2.0.1" xmlns="http://webservices.sabre.com/sabreXML/2011/10" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
                                <Vendor Code="CAR"/>
                            </VendorCodesRQ>
                        </soap-env:Body>
                    </soap-env:Envelope>`
    try {
        var api_response = await axios.post(sabre_endpoint, xml, headers_info);
        var vendor_codes = await parse_get_vehicle_vendor_codes_all(api_response.data);

        if (vendor_codes) {
            return vendor_codes
        }
        else {
            return null;
        }
    }
    catch (error) {
        console.log(error);
        return null;
    }
}

async function parse_get_vehicle_vendor_codes_all(xml) {
    var vendor_code_array = [];
    var car_code_array = [];

    parseString(xml, function (err, result) {
        try {
            if (result['soap-env:Envelope']['soap-env:Body'] != undefined) {
                var sub_tables = result['soap-env:Envelope']['soap-env:Body'][0]['VendorCodesRS'][0]['Table'][0]['SubTable'];
                for (var i = 0; i < sub_tables.length; i++) {
                    var code_type = sub_tables[i]['$']['Name'];

                    if (code_type == "CAR VENDORS") {
                        var vendor_codes_list = sub_tables[i]['Row']

                        for (var j = 0; j < vendor_codes_list.length; j++) {
                            var vendor_code_value = vendor_codes_list[j]['Column'][0]['Text']['0'];
                            vendor_code_array.push(`<VendorPref Code=${vendor_code_value} />`);
                        }
                    }

                    if (code_type == "CAR TYPES") {
                        var car_codes_list = sub_tables[i]['Row']

                        for (var j = 0; j < car_codes_list.length; j++) {
                            var car_code_value = car_codes_list[j]['Column'][0]['Text']['0'];
                            car_code_array.push(`<VehType>${car_code_value}</VehType>`);
                        }
                    }
                }
            }
            else {
                return null;
            }
        }
        catch (error) {
            console.log(error);
            return null;
        }
    });
    var response = { vendor_code_array: vendor_code_array, car_code_array: car_code_array }
    return response;
}

async function getAirlineName(airline_name, current_session) {
    let session_handle_axios = { headers: { cookie: current_session } };
    var DBresponse = await axios.post(process.env.IP + '/api/localQuery/query', { queryAction: 'FetchData', requestType: "getAirlineName", airline_name: airline_name }, session_handle_axios);
    var airline = DBresponse?.data?.record?.recordset[0]?.airline_name;

    if (airline) {
        return airline
    }
    else {
        return airline_name;
    }
}

async function getCompanyID(current_session) {
    let session_handle_axios = { headers: { cookie: current_session } };
    var APIresponse = await axios.post(process.env.IP + '/api/watson/userDetails', {}, session_handle_axios);
    var user_details = APIresponse?.data;
    return user_details;
}

async function getAirPreferences(current_session) {

    var user_details = await getCompanyID(current_session);
    var preference_list = [];

    if (user_details) {
        var company_id = user_details?.record?.ez_company_id;

        if (company_id) {
            let session_handle_axios = { headers: { cookie: current_session } };
            var DBresponse = await axios.post(process.env.IP + '/api/localQuery/query', { queryAction: 'FetchData', requestType: "getAirPreferences", company_id: company_id }, session_handle_axios);
            var air_preferences = DBresponse?.data?.record?.recordset;
            if (air_preferences) {
                for (var i = 0; i < air_preferences.length; i++) {
                    if (air_preferences[i]?.vendor_name)
                        preference_list.push(air_preferences[i].vendor_name);
                }

                return preference_list;
            }
            else {
                return [];
            }
        }
        else {
            return [];
        }
    }
    else {
        return [];
    }
}

async function getCarPreferences(current_session) {
    var user_details = await getCompanyID(current_session);
    var preference_list = [];

    if (user_details) {
        var company_id = user_details?.record?.ez_company_id;
        if (company_id) {
            let session_handle_axios = { headers: { cookie: current_session } };
            var DBresponse = await axios.post(process.env.IP + '/api/localQuery/query', { queryAction: 'FetchData', requestType: "getCarPreferences", company_id: company_id }, session_handle_axios);
            var car_preferences = DBresponse?.data?.record?.recordset;

            for (var i = 0; i < car_preferences.length; i++) {
                if (car_preferences[i]?.vendor_name)
                    preference_list.push(car_preferences[i].vendor_name);
            }

            return preference_list;
        }
        else {
            return [];
        }
    }
    else {
        return [];
    }
}

async function getHotelPreferences(current_session) {
    var user_details = await getCompanyID(current_session);
    var preference_list = [];

    if (user_details) {
        var company_id = user_details?.record?.ez_company_id;
        if (company_id) {
            let session_handle_axios = { headers: { cookie: current_session } };
            var DBresponse = await axios.post(process.env.IP + '/api/localQuery/query', { queryAction: 'FetchData', requestType: "getHotelPreferences", company_id: company_id }, session_handle_axios);
            var hotel_preferences = DBresponse?.data?.record?.recordset;

            for (var i = 0; i < hotel_preferences.length; i++) {
                if (hotel_preferences[i]?.hotel_name)
                    preference_list.push(hotel_preferences[i].hotel_name);
            }

            return preference_list;
        }
        else {
            return [];
        }
    }
    else {
        return [];
    }

}

function getTimeDiff(valuestart, valuestop) {
    var timeStart = new Date("01/01/2007 " + valuestart).getHours();
    var timeEnd = new Date("01/01/2007 " + valuestop).getHours();
    var hourDiff = timeEnd - timeStart;
    (hourDiff < 0) ? hourDiff = 24 + hourDiff : hourDiff;
    return hourDiff;
}

//======================================= [Helping functions] ===========================================//

//====================================== [Route Implementation] =========================================//

// *************************************************** Exact match for flights, hotels ,cars *******************************************************

async function getPrevious_reservation_obj(id_number, cookie_detail) {
    let session_handle_axios = { headers: { cookie: cookie_detail } };
    let updated_previous_reservation_obj = await axios.post(process.env.IP + '/api/previousData/getAllPreviousIternaries', { id_number: id_number }, session_handle_axios);

    return updated_previous_reservation_obj;
}

async function flightBookingExactMatch(req) {
    var response = {
        result: "error"
    };

    var flight_prefs = {};
    var flight_type = req.body.flightType;
    var invoke_source = req.body.invoke_source;
    var action = req.body.action;
    var avalibilty_carrier = req.body.flight_carrier;
    var selected_departure_time = req.body.departureTime;
    var selected_return_departure_time = req.body.returnTime;
    var div_id = req.body.div_id;

    if (flight_type == "oneway") 
    {
        var departure_time = req?.body?.time;
        var arrivalTime = req?.body?.arrivalTime;
        (departure_time) ? flight_prefs.departure_time = departure_time : flight_prefs.departure_time = "00:00:00";
        (arrivalTime) ? flight_prefs.arrivalTime = arrivalTime : flight_prefs.arrivalTime = "00:00:00";

        flight_prefs.departure_city         =   req?.body?.departure;
        flight_prefs.destination_city       =   req?.body?.destination;
        flight_prefs.departure_date         =   req.body.date;
        flight_prefs.required_seats         =   req.body.numOfSeats;
        flight_prefs.flight_carrier         =   req?.body?.flight_carrier;
        flight_prefs.departure_time_window  =   moment(flight_prefs.departure_time, "HHmm").subtract(30,"minutes").format("HHmm") + moment(flight_prefs.departure_time, "HHmm").add(30,"minutes").format("HHmm");
        flight_prefs.flight_type            =   "oneway";
        flight_prefs.exact_match            =   true;
    }

    else if(flight_type == "roundtrip")
    {
        returnTime              =   req?.body?.returnTime;
        return_arrivalTime      =   req?.body?.return_arrivalTime;
        departureTime           =   req?.body?.departureTime;
        departure_arrivalTime   =   req?.body?.departure_arrivalTime;
        
        flight_prefs.departureTime              =   ( departureTime ) ?  departureTime : "00:00:00";
        flight_prefs.departure_arrivalTime      =   ( departure_arrivalTime ) ? departure_arrivalTime : "00:00:00";
        flight_prefs.returnTime                 =   ( returnTime ) ? returnTime : "00:00:00";
        flight_prefs.return_arrivalTime         =   ( return_arrivalTime ) ? return_arrivalTime : "00:00:00";
        flight_prefs.departureOrigin            =   req.body.departureOrigin;
        flight_prefs.departureDestination       =   req.body.departureDestination;
        flight_prefs.returnOrigin               =   req.body.returnOrigin;
        flight_prefs.returnDestination          =   req.body.returnDestination;
        flight_prefs.departureDate              =   req.body.departureDate;
        flight_prefs.returnDate                 =   req.body.returnDate;
        flight_prefs.seats                      =   req.body.seats;
        flight_prefs.flight_carrier             =   req?.body?.flight_carrier;
        flight_prefs.flight_carrier2            =   req?.body?.flight_carrier2;
        flight_prefs.departure_time_window      =   moment(flight_prefs.departureTime, "HHmm").subtract(30,"minutes").format("HHmm") + moment(flight_prefs.departureTime, "HHmm").add(30,"minutes").format("HHmm");
        flight_prefs.return_time_window         =   moment(flight_prefs.returnTime, "HHmm").subtract(30,"minutes").format("HHmm") + moment(flight_prefs.returnTime, "HHmm").add(30,"minutes").format("HHmm");
        flight_prefs.flight_type                =   "roundtrip";
        flight_prefs.exact_match                =   true;
    }

    //Initializing Session
    var access_token_details    =   await getAccessToken();

    if(access_token_details != null )
    {  
        var flight_details = await getFlightDetails(access_token_details, flight_prefs);

        if( flight_details && flight_details.length === 0 )
        {

            let flight_type = flight_prefs.flight_type;
            if( flight_type === "oneway" )
            {
                flight_prefs.departure_time_window = moment(flight_prefs.departure_time, "HHmm").subtract(60,"minutes").format("HHmm") + moment(flight_prefs.departure_time, "HHmm").add(60,"minutes").format("HHmm");
            }
            else
            {
                flight_prefs.departure_time_window = moment(flight_prefs.departureTime, "HHmm").subtract(60,"minutes").format("HHmm") + moment(flight_prefs.departureTime, "HHmm").add(60,"minutes").format("HHmm");
                flight_prefs.return_time_window = moment(flight_prefs.returnTime, "HHmm").subtract(60,"minutes").format("HHmm") + moment(flight_prefs.returnTime, "HHmm").add(60,"minutes").format("HHmm");
            }
            
            var flight_details = await getFlightDetails(access_token_details, flight_prefs);
        }

        try
        {
            for(let i in flight_details)
            {
                var selected_flight = flight_details[i];
                
                if(selected_flight != undefined && selected_flight != null && selected_flight != "")
                {
                    if(selected_flight.flightType == "oneway")
                    {
                        if(selected_flight.flightScheduleData[0].OperatflightNumber == flight_prefs.flight_carrier)
                        {
                            var result1 = await validate_itinerary_oneway(access_token_details, selected_flight);
                            
                            if(result1 != null)
                            {
                                response = {result:"success",selected_flight:result1};
                                break;
                            }   
                        }
                    }

                    else if(selected_flight.flightType == "roundtrip")
                    {
                        var legs_details    =   selected_flight.flightScheduleData;
                        var rph_one         =   legs_details.filter(function (legs_details) { return legs_details.RPH === 1; });
                        var rph_two         =   legs_details.filter(function (legs_details) { return legs_details.RPH != 1; });
                        if (rph_one[0].OperatflightNumber == flight_prefs.flight_carrier && rph_two[0].OperatflightNumber == flight_prefs.flight_carrier2) 
                        {
                            var result1 = await validate_itinerary_roundtrip(access_token_details, selected_flight);
                        }
                        
                        if (result1 != null) {
                            response = { result: "success", selected_flight: result1 };
                            break;
                        }
                    }

                }
            }
        }
        catch(error)
        {
            console.log(error);
        }

        var close_Session = await closeSession(access_token_details);
    }
    return response;
}

async function hotelBookingExactMatch(obj)
{
    var response = { result : "error" };

    var access_token_details1 = await getAccessToken();
    
    if(access_token_details1 != null)
    {
        var s_selected_hotel = await getHotelSearch(access_token_details1,obj.cityCode,obj.available_hotel_name);
        
        var to_search_hotel_name = (obj.available_hotel_name).toUpperCase();
    
        if(s_selected_hotel && s_selected_hotel.length > 0 )
        {
            for(var i = 0; i < s_selected_hotel.length; i++)
            {
                var current_hotel_name = (s_selected_hotel[i].hotel_name).toUpperCase();

                if( to_search_hotel_name == current_hotel_name )
                {
                    var more_hotel_data = await getHotelDetail(access_token_details1, s_selected_hotel[i].sabre_hotel_code, obj.checkInDate, obj.checkOutDate,obj.room_type);

                    try
                    {
                        var matched_room = "empty";

                        for ( let j = 0; j < more_hotel_data['room_details'].length; j++ )
                        {
                            if( more_hotel_data['room_details'][j]['room_rate'] == more_hotel_data['starting_from'] )
                            {
                                matched_room = more_hotel_data['room_details'][j];
                                var validated_room_price = await validate_hotel_price(access_token_details1, matched_room.rate_key);
                                
                                if(validated_room_price)
                                {
                                    var hotel_name =  validated_room_price.HotelName;

                                    if(hotel_name)
                                    {
                                        response = {
                                            result  :   "success",
                                            obj     :   validated_room_price
                                        };
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    catch (error)
                    {
                        console.log(error);
                    }
                }
            }
        }

        var close_session = await closeSession(access_token_details1);
    }
    
    return response;
}

async function rentalCarBookingExactMatch(req) {
    var response = { result: "error" };
    var div_id = req.body.div_id;
    var pick_up_city_code = req?.body?.pick_up_city;
    var drop_off_city_code = req?.body?.drop_off_city;

    if (pick_up_city_code && drop_off_city_code) {
        var car_details = {};
        var pick_up_time = req?.body?.pick_up_time;
        var drop_of_time = req?.body?.drop_off_time;
        (pick_up_time) ? car_details['pick_up_time'] = pick_up_time.substring(0, 5) : car_details['pick_up_time'] = "10:00";
        (drop_of_time) ? car_details['drop_off_time'] = drop_of_time.substring(0, 5) : car_details['drop_off_time'] = "10:00";
        // car_details['pick_up_city'] = "MSN";
        car_details['pick_up_city'] = req?.body?.pick_up_city;
        car_details['pick_up_date'] = req.body.pick_up_date;
        // car_details['drop_off_city'] = "MSN";
        car_details['drop_off_city'] = req?.body?.drop_off_city;
        car_details['drop_off_date'] = req.body.drop_off_date;
        car_details['car_vendor'] = req.body.car_vendor;
        car_details['car_type'] = req.body.car_type;
        var access_token_detailsc = null;
        access_token_detailsc = await getAccessToken();
        if (access_token_detailsc) {
            var out_result = await getRentalCarDetails(access_token_detailsc, car_details);
            try {
                var out_result_ = out_result.reduce((max, out_result) => {
                    return max.approximate_total_fare <= out_result.approximate_total_fare ? max : out_result;
                });
                if (out_result_.RateKey != undefined && out_result_.RateKey != "" && out_result_.RateKey != null) {
                    access_token_detailsc = await getAccessToken();
                    if (access_token_detailsc) {
                        var price_check_c = await vehiclePriceCheck(access_token_detailsc, out_result_.RateKey);
                        if (price_check_c.approximate_total_fare) {
                            response = { result: "success", rentalCrdetails: out_result_, validatedCarResult: price_check_c }
                        }
                    }
                }
            }
            catch (error) {
                console.log(error);
            };
        }
    }

    return response;
}

async function save_created_pnr_data(traveler_id, created_pnr_data, flight_scheduals, current_session) {

    var trip_short_desc = '';
    let save_data = {};
    for (let i in flight_scheduals.flightScheduleData) {
        let obj = flight_scheduals.flightScheduleData[i];
        trip_short_desc += `${obj.deptCity}to${obj.arrivalCity}(${obj.arrivalDateTime}^${obj.departureDateTime})|`;
    }
    save_data.short_desc = trip_short_desc;
    save_data.locator_id = created_pnr_data.locator_id;
    save_data.traveler_id = traveler_id;
    save_data.pnr_response = created_pnr_data.data;

    let session_handle_axios = { headers: { cookie: current_session } };
    var DBresponse = await axios.post(process.env.IP + '/api/localQuery/query', { queryAction: 'InsertData', action: 'insertPnrInfo', save_data: save_data }, session_handle_axios);

    return 0;
}

//======================================= [Helping functions] ===========================================//

//====================================== [Route Implementation] =========================================//


//******************************************************************************************************************************* */
// ***********************************************   Flight Search And Valdiation   ***********************************************
//******************************************************************************************************************************* */

router.post('/lowFlightSearchBFM', async (req, res) => {

    if (!user_details[req.session.user_name]) {
        user_details[req.session.user_name] = {};
    }

    var flight_validated = 0;

    var pre_selected = {
        preselected: "false"
    };

    if (req.body.invoke_source == "availability") {
        if (req.body.pnrObj != undefined && req.body.pnrObj != "" && req.body.pnrObj != null) {
            var access_token_details2 = await getAccessToken();

            if (req.body.flightType == "oneway") {
                var result1 = await validate_itinerary_oneway(access_token_details2, req.body.pnrObj);
            }

            else if (req.body.flightType == "roundtrip") {
                var result1 = await validate_itinerary_roundtrip(access_token_details2, req.body.pnrObj);
            }

            var close_session2 = await closeSession(access_token_details2);

            if (result1 != null) {
                var out_result = result1;
                flight_validated = 1;

                pre_selected = {
                    preselected: "success",
                    pnrobje_validation: true,
                    flight_details: out_result,
                    div_id: req.body.div_id
                }
            }
        }
        else {
            var exact_match = await flightBookingExactMatch(req);

            if (exact_match.result == "success") {
                try {
                    let divid = req.body.div_id;
                    let iternary = divid.substring(0, divid.length - 1);
                    let id_number = divid.charAt(divid.length - 1);
                    let session_handle_axios = { headers: { cookie: req.headers.cookie } };
                    var updated_previous_reservation_obj = await axios.post(process.env.IP + '/api/previousData/updatePreviousReservationObjectforPnr', { iternary: iternary, id_number: id_number, type: "flight", obj: exact_match.selected_flight }, session_handle_axios);
                    flight_validated = 1;

                    for (let x in exact_match.selected_flight.flightScheduleData) {
                        exact_match.selected_flight.flightScheduleData[x].carrier_name = await getAirlineName(exact_match.selected_flight.flightScheduleData[x].MarketingCarrier, req.headers.cookie);
                    }

                    pre_selected = {
                        preselected: "success",
                        pnrobje_validation: false,
                        flight_details: exact_match.selected_flight,
                        div_id: req.body.div_id
                    }
                }
                catch (error) {
                    console.log(error);
                    flight_validated = 0;
                }
            }
        }
    }

    if (flight_validated == 1) {
        return res.json(pre_selected);
    };

    user_details[req.session.user_name].flight_type = req.body.flightType;

    var flight_prefs = {};
    var air_preference = [];
    var flight_type = req.body.flightType;
    var invoke_source = req.body.invoke_source;
    var action = req.body.action;
    var avalibilty_carrier = req.body.flight_carrier;
    var selected_available_flight = "empty";
    var selected_departure_time = req.body.departureTime;
    var selected_return_departure_time = req.body.returnTime;
    air_preference = await getAirPreferences(req.headers.cookie);
    var div_id = req.body.div_id;

    //Accessign the flight preferences and generating payload
    if (flight_type == "oneway") {
        var departure_time = req?.body?.time;
        (departure_time) ? flight_prefs.departure_time = departure_time : flight_prefs.departure_time = "00:00:00";

        flight_prefs.departure_city = req?.body?.departure;
        flight_prefs.destination_city = req?.body?.destination;
        flight_prefs.departure_date = req.body.date;
        flight_prefs.required_seats = req.body.numOfSeats;
        flight_prefs.flight_type = "oneway";
    }

    else if (flight_type == "roundtrip") {

        returnTime = req?.body?.returnTime;
        departureTime = req?.body?.departureTime;

        (departureTime) ? flight_prefs.departureTime = departureTime : flight_prefs.departureTime = "00:00:00";
        (returnTime) ? flight_prefs.returnTime = returnTime : flight_prefs.returnTime = "00:00:00";

        flight_prefs.departureOrigin = req.body.departureOrigin;
        flight_prefs.departureDestination = req.body.departureDestination;
        flight_prefs.returnOrigin = req.body.returnOrigin;
        flight_prefs.returnDestination = req.body.returnDestination;
        flight_prefs.departureDate = req.body.departureDate;
        flight_prefs.returnDate = req.body.returnDate;
        flight_prefs.seats = req.body.seats;
        flight_prefs.flight_type = "roundtrip";
    }

    //Initializing Session
    var access_token_details = await getAccessToken();

    if (access_token_details != null) {
        var flight_details = await getFlightDetails(access_token_details, flight_prefs);

        /*
            Updating each flight search option object and creating a new array:
            1.  Adding flight preference
            2.  Updating Date and Time for each itinierary
            3.  Calculating overall flight overlay delay
            4.  Analyzing number of stops and their details   
        */

        var updated_flight_details = [];

        for (var i = 0; i < flight_details.length; i++) {
            var current_flight_obj = flight_details[i];
            var flight_schedule_details = current_flight_obj?.flightScheduleData;
            var flight_type = current_flight_obj?.flightType;

            if (current_flight_obj.cabin === "P") {
                var class_of_service = "Premium First Class";
            }
            else if (current_flight_obj.cabin === "F") {
                var class_of_service = "First Class";
            }
            else if (current_flight_obj.cabin === "J") {
                var class_of_service = "Premium Business Class";
            }
            else if (current_flight_obj.cabin === "C") {
                var class_of_service = "Business Class";
            }
            else if (current_flight_obj.cabin === "S") {
                var class_of_service = "Premium Economy Class";
            }
            else {
                var class_of_service = "Economy Class";
            }

            if (flight_type === "oneway") {
                var temp_departure_details = {};
                var temp_return_details = null;
                var stops_details = [];
                var total_overlay_delay = 0;

                var departure_city = current_flight_obj.departure_city;
                var arrival_city = current_flight_obj.destination_city;

                for (var j = 0; j < flight_schedule_details.length; j++) {

                    //Departure date and time
                    if (j === 0) {
                        var departure_date_time = flight_schedule_details[j].departureDateTime;
                    }

                    //Arrival date and time
                    if (j === ((flight_schedule_details.length) - 1)) {
                        var arrival_date_time = flight_schedule_details[j].arrivalDateTime;
                    }

                    //Overlay calculation and stops details
                    if (j != 0 && (j <= ((flight_schedule_details.length) - 1))) {
                        var overlay_calcultation = getTimeDiff(moment.utc(flight_schedule_details[(j - 1)].arrivalDateTime).format('LT'), moment.utc(flight_schedule_details[j].departureDateTime).format('LT'));
                        total_overlay_delay += overlay_calcultation;
                        stops_details.push({ stop_name: flight_schedule_details[j].deptAirPort, delay_overlay: overlay_calcultation });
                    }

                    //Adding flight preference
                    if (air_preference.includes(flight_schedule_details[j].OperatflightNumber)) {
                        flight_schedule_details[j].preference_indicator = true;
                    }
                    else {
                        flight_schedule_details[j].preference_indicator = false;
                    }

                }

                temp_departure_details = {
                    departure_city: departure_city,
                    arrival_city: arrival_city,
                    departure_date_time: departure_date_time,
                    arrival_date_time: arrival_date_time,
                    total_overlay_delay: total_overlay_delay,
                    stops_details: stops_details,
                    flight_schedule_details: flight_schedule_details
                }

            }

            else if (flight_type === "roundtrip") {
                var temp_departure_details = {};
                var temp_return_details = {};

                var departure_flight_schedule_details = [];
                var return_flight_schedule_details = [];

                var stops_details_departure = [];
                var stops_details_return = [];
                var total_overlay_delay_departure = 0;
                var total_overlay_delay_return = 0;

                var departure_origin_city = current_flight_obj.departureOrigin;
                var departure_destination_city = current_flight_obj.departureDestination;
                var return_origin_city = current_flight_obj.returnOrigin;
                var return_destination_city = current_flight_obj.returnDestination;

                //Seperating schedule details for departure and origin flights and adding preferences
                for (var k = 0; k < flight_schedule_details.length; k++) {
                    if (flight_schedule_details[k].RPH === 1) {
                        departure_flight_schedule_details.push(flight_schedule_details[k]);
                    }
                    else {
                        return_flight_schedule_details.push(flight_schedule_details[k]);
                    }

                    //Adding flight preference
                    if (air_preference.includes(flight_schedule_details[k].OperatflightNumber)) {
                        flight_schedule_details[k].preference_indicator = true;
                    }
                    else {
                        flight_schedule_details[k].preference_indicator = false;
                    }
                }

                //Schedule details for departure flights
                for (var j = 0; j < departure_flight_schedule_details.length; j++) {

                    //Departure date and time
                    if (j === 0) {
                        var departure_date_time_1 = departure_flight_schedule_details[j].departureDateTime;
                    }

                    //Arrival date and time
                    if (j === ((departure_flight_schedule_details.length) - 1)) {
                        var arrival_date_time_1 = departure_flight_schedule_details[j].arrivalDateTime;
                    }

                    //Overlay calculation and stops details
                    if (j != 0 && (j <= ((departure_flight_schedule_details.length) - 1))) {
                        var overlay_calcultation = getTimeDiff(moment.utc(departure_flight_schedule_details[(j - 1)].arrivalDateTime).format('LT'), moment.utc(departure_flight_schedule_details[j].departureDateTime).format('LT'));
                        total_overlay_delay_departure += overlay_calcultation;
                        stops_details_departure.push({ stop_name: departure_flight_schedule_details[j].deptAirPort, delay_overlay: overlay_calcultation });
                    }
                }

                //Schedule details for return flights
                for (var j = 0; j < return_flight_schedule_details.length; j++) {

                    //Departure date and time
                    if (j === 0) {
                        var departure_date_time_2 = return_flight_schedule_details[j].departureDateTime;
                    }

                    //Arrival date and time
                    if (j === ((return_flight_schedule_details.length) - 1)) {
                        var arrival_date_time_2 = return_flight_schedule_details[j].arrivalDateTime;
                    }

                    //Overlay calculation and stops details
                    if (j != 0 && (j <= ((return_flight_schedule_details.length) - 1))) {
                        var overlay_calcultation = getTimeDiff(moment.utc(return_flight_schedule_details[(j - 1)].arrivalDateTime).format('LT'), moment.utc(return_flight_schedule_details[j].departureDateTime).format('LT'));
                        total_overlay_delay_return += overlay_calcultation;
                        stops_details_return.push({ stop_name: return_flight_schedule_details[j].deptAirPort, delay_overlay: overlay_calcultation });
                    }

                }

                temp_departure_details = {
                    departure_city: departure_origin_city,
                    arrival_city: departure_destination_city,
                    departure_date_time: departure_date_time_1,
                    arrival_date_time: arrival_date_time_1,
                    total_overlay_delay: total_overlay_delay_departure,
                    stops_details: stops_details_departure,
                    flight_schedule_details: departure_flight_schedule_details
                }

                temp_return_details = {
                    departure_city: return_origin_city,
                    arrival_city: return_destination_city,
                    departure_date_time: departure_date_time_2,
                    arrival_date_time: arrival_date_time_2,
                    total_overlay_delay: total_overlay_delay_return,
                    stops_details: stops_details_return,
                    flight_schedule_details: return_flight_schedule_details
                }
            }

            var temp_flight_obj = {
                flight_type: flight_type,
                flight_id: flight_details[i].id,
                total_price: flight_details[i].totalPrice,
                class_of_service: class_of_service,
                temp_departure_details: temp_departure_details,
                temp_return_details: temp_return_details,
            }

            updated_flight_details.push(temp_flight_obj);
        }

        user_details[req.session.user_name].flighSearctDetails = flight_details;

        var flight_view = new Flight_Search_View();
        var html = await flight_view.parse_flight_search_view(updated_flight_details, div_id, invoke_source, req.session.user_name);

        if (invoke_source === "availability" || invoke_source === "edit_pannel") {
            var result = {
                resultFor: action,
                textToShow: html,
                selected_available_flight: selected_available_flight,
                total_empty_resonse: "found",
                div_id: div_id,
                flight_carrier: req.body.flight_carrier,
                flight_carrier_name: req.body.flight_carrier_name,
                //modified by YS
                result_array: updated_flight_details,
                invoke_source : invoke_source,
                div_id : div_id
            };
        }
        else {
            var result = {
                // modified by YS
                result_array: updated_flight_details,
                resultFor: action,
                textToShow: html,
                invoke_source : "new_reservation",
                div_id : null
            };
        }
    }
    else {
        var result = { status: 404, message: "Session Initialization Error" };
    }

    if (access_token_details) {
        var close_session = await closeSession(access_token_details);
    }

    res.json(result);
});

router.post('/valdiateFlightItinerary', async (req, res) => {

    var flight_id = req.body.flight_id;
    var invoke_source = req.body.invoke_source;

    if (user_details[req.session.user_name].flighSearctDetails != null) {
        if (flight_id <= (user_details[req.session.user_name].flighSearctDetails).length) {
            var selected_flight = (user_details[req.session.user_name].flighSearctDetails)[flight_id - 1];

            if (selected_flight != undefined) {
                var access_token_details = await getAccessToken();

                if (selected_flight.flightType == "oneway") {
                    (user_details[req.session.user_name].flighSearctDetails)[flight_id - 1].operating_carrier = (user_details[req.session.user_name].flighSearctDetails)[flight_id - 1]['flightScheduleData'][0].OperatflightNumber;
                    (user_details[req.session.user_name].flighSearctDetails)[flight_id - 1].carrier_name = await getAirlineName(user_details[req.session.user_name].flighSearctDetails[flight_id - 1]['flightScheduleData'][0].OperatflightNumber, req.headers.cookie);

                    try {
                        if (invoke_source == "edit_pannel") {
                            if (user_details[req.session.user_name].flighSearctDetails[flight_id - 1] != undefined) {
                                if (user_details[req.session.user_name].flighSearctDetails[flight_id - 1].flightScheduleData != undefined) {
                                    if (user_details[req.session.user_name].flighSearctDetails[flight_id - 1].flightScheduleData.length) {
                                        for (let i = 0; i < user_details[req.session.user_name].flighSearctDetails[flight_id - 1].flightScheduleData.length; i++) {
                                            user_details[req.session.user_name].flighSearctDetails[flight_id - 1].flightScheduleData[i].carrier_name = await getAirlineName(user_details[req.session.user_name].flighSearctDetails[flight_id - 1].flightScheduleData[i].MarketingCarrier, req.headers.cookie);
                                        }
                                    }
                                }
                            }
                            var response = { success: true, flight_details: user_details[req.session.user_name].flighSearctDetails[flight_id - 1] };
                            return res.json(response);
                        }
                    }
                    catch (error) {
                        console.log(error);
                    }

                    var validate_itin = await validate_itinerary_oneway(access_token_details, selected_flight);
                }
                else if (selected_flight.flightType == "roundtrip") {
                    var legs_details = user_details[req.session.user_name].flighSearctDetails[flight_id - 1]['flightScheduleData'];

                    for (var i = 0; i < legs_details.length; i++) {
                        if (legs_details[i].RPH == 1) {
                            user_details[req.session.user_name].flighSearctDetails[flight_id - 1].carrier_name1 = await getAirlineName(legs_details[i].OperatflightNumber, req.headers.cookie);
                            user_details[req.session.user_name].flighSearctDetails[flight_id - 1].operating_carrier1 = legs_details[i].OperatflightNumber;
                            break;
                        }
                    }

                    for (var j = 0; j < legs_details.length; j++) {
                        if (legs_details[j].RPH == 2) {
                            user_details[req.session.user_name].flighSearctDetails[flight_id - 1].carrier_name2 = await getAirlineName(legs_details[j].OperatflightNumber, req.headers.cookie);
                            user_details[req.session.user_name].flighSearctDetails[flight_id - 1].operating_carrier2 = legs_details[j].OperatflightNumber;
                            break;
                        }
                    }

                    try {
                        if (invoke_source == "edit_pannel") {
                            if (user_details[req.session.user_name].flighSearctDetails[flight_id - 1] != undefined) {
                                if (user_details[req.session.user_name].flighSearctDetails[flight_id - 1].flightScheduleData != undefined) {
                                    if (user_details[req.session.user_name].flighSearctDetails[flight_id - 1].flightScheduleData.length) {
                                        for (let i = 0; i < (user_details[req.session.user_name].flighSearctDetails[flight_id - 1].flightScheduleData).length; i++) {
                                            user_details[req.session.user_name].flighSearctDetails[flight_id - 1].flightScheduleData[i].carrier_name = await getAirlineName(user_details[req.session.user_name].flighSearctDetails[flight_id - 1].flightScheduleData[i].MarketingCarrier, req.headers.cookie);
                                        }
                                    }

                                }
                            }
                            var response = { success: true, flight_details: user_details[req.session.user_name].flighSearctDetails[flight_id - 1] };
                            return res.json(response);
                        }
                    }
                    catch (error) {
                        console.log(error);
                    }

                    var validate_itin = await validate_itinerary_roundtrip(access_token_details, selected_flight);
                }

                if (validate_itin != null) {
                    try {
                        if (validate_itin.flightScheduleData != undefined) {
                            if (validate_itin.flightScheduleData.length != 0 && validate_itin.flightScheduleData.length != undefined) {
                                for (let i = 0; i < validate_itin.flightScheduleData.length; i++) {
                                    validate_itin.flightScheduleData[i].carrier_name = await getAirlineName(validate_itin.flightScheduleData[i].MarketingCarrier, req.headers.cookie);
                                }
                            }
                        }
                    }
                    catch (error) {
                        console.log(error);
                    }

                    user_details[req.session.user_name].validated_flight_details = selected_flight;
                    var response = { success: true, flight_details: validate_itin, selected_flight_dtls: validate_itin }
                }
                else {
                    user_details[req.session.user_name].validated_flight_details = selected_flight;
                    try {
                        if (selected_flight != undefined) {
                            if (selected_flight.flightScheduleData != undefined) {
                                if (selected_flight.flightScheduleData.length) {
                                    for (let i = 0; i < selected_flight.flightScheduleData.length; i++) {
                                        selected_flight.flightScheduleData[i].carrier_name = await getAirlineName(selected_flight.flightScheduleData[i].MarketingCarrier, req.headers.cookie);
                                    }
                                }
                            }
                        }
                    } catch (error) {
                        console.log(error);
                    }
                    var response = { success: true, flight_details: validate_itin, selected_flight_dtls: selected_flight }
                }

                var close_session = await closeSession(access_token_details);
            }
            else {
                var response = { success: false, message: "Flight with provided ID not valid." }
            }

        }
        else {
            var response = { success: false, message: "Invalid Flight Number" }
        }
    }
    else {
        var response = { success: false, message: "No Flight Found" }
    }

    res.json(response);
});

router.post('/getFlightDetails', async (req, res) => {

    var dateArray = [];
    var flightID = req.body.flightID;
    var requiredFlight = user_details[req.session.user_name].flighSearctDetails[(flightID - 1)];
    requiredFlight['flightID'] = flightID;

    var flightDetails = {
        requiredFlight: requiredFlight,
        flightType: user_details[req.session.user_name].flightType,
        dateArray: dateArray,
        flightID: flightID
    };

    res.json(flightDetails);
});

//********************************************************************************************************************************* */
// ***********************************************   Hotel Search And Valdiation    ***********************************************
//********************************************************************************************************************************* */

router.post('/getHotelDetails', async (req, res) => {


    if(!user_details[req.session.user_name])
    {
        user_details[req.session.user_name] = {};
        user_details[req.session.user_name].hotelSearchDetails = null;
    }

    var hotel_validatedh = 0;
    var pre_selected = {
        preselected: "false"
    };

    if(req.body.invoke_source == "availability")
    {

        if(req.body.pnrObj != undefined && req.body.pnrObj != "" && req.body.pnrObj !=null)
        {
            var access_token_details1 = await getAccessToken();
            if (access_token_details1 != null) {
                var out_result = await validate_hotel_price(access_token_details1, req.body.pnrObj);
                if (out_result) {
                    var hotel_name = out_result.HotelName;
                    if (hotel_name) {
                        hotel_validatedh = 1;
                        pre_selected = {
                            preselected: "success",
                            pnrobje_validation: true,
                            hotel_details: out_result,
                            div_id: req.body.div_id
                        };
                    }
                }
                var close_session = await closeSession(access_token_details1);
            }
        }
        else {
            var exact_match = await hotelBookingExactMatch(req.body);
            if (exact_match.result == "success") {
                hotel_validatedh = 1;
                try {
                    let divid = req.body.div_id;
                    let iternary = divid.substring(0, divid.length - 1);
                    let id_number = divid.charAt(divid.length - 1);
                    let session_handle_axios = { headers: { cookie: req.headers.cookie } };
                    var updated_previous_reservation_obj = await axios.post(process.env.IP + '/api/previousData/updatePreviousReservationObjectforPnr', { iternary: iternary, id_number: id_number, type: "hotel", obj: exact_match.obj.booking_key }, session_handle_axios);

                }
                catch (error) {
                    console.log(error)
                }
                pre_selected = { preselected: "success", pnrobje_validation: false, hotel_details: exact_match.obj, div_id: req.body.div_id };
            }
        }
    }

    if (hotel_validatedh == 1) {
        return res.json(pre_selected);
    }

    var invoke_source = req.body.invoke_source;
    var div_id = req.body.div_id;
    var available_hotel_name = req.body.available_hotel_name;
    var selected_available_hotel = "empty";
    var hotel_details_array = [];
    var city_code = req?.body?.cityCode;
    var check_in_date = req.body.checkInDate;
    var check_out_date = req.body.checkOutDate;
    var hotel_preference = await getHotelPreferences(req.headers.cookie);
    var total_empty_resonse = undefined;

    user_details[req.session.user_name].hotel_rate_key_list = new Object();

    var access_token_details = await getAccessToken();

    if (access_token_details != null) {
        var hotel_details = await getHotelSearch(access_token_details, city_code);

        /*
            Updating each hotel search option object:
            1.  Adding hotel preference.
            2.  Adding hotel city code in each object (for Getting Hotel Details API Call).
            3.  Adding check-in and check-out dates into each object. 
            4.  Adding hotel details for each hotel object.
        */

        for (var i = 0; i < hotel_details.length; i++) {
            //Adding hotel city and dates
            hotel_details[i].hotelCity = req.body.cityCode;
            hotel_details[i].checkInDate = check_in_date;
            hotel_details[i].checkOutDate = check_out_date;

            //Adding Preference
            if (hotel_preference) {
                if (hotel_preference.includes(hotel_details[i]?.hotel_name)) {
                    hotel_details[i].preference_indicator = true;
                }
                else {
                    hotel_details[i].preference_indicator = false;
                }
            }

            var sabre_code = hotel_details[i].sabre_hotel_code;

            if (sabre_code) {

                var more_hotel_data = await getHotelDetail(access_token_details, sabre_code, check_in_date, check_out_date, req.body.room_type);

                if (more_hotel_data) {
                    var hotel_room_details = more_hotel_data.room_details;

                    //Managing Rate Key Object after hotel selection
                    for (var j = 0; j < hotel_room_details.length; j++) {
                        var rate_key_index = uniqid();
                        var rate_key = hotel_room_details[j].rate_key;
                        hotel_room_details[j]['rate_key_index'] = rate_key_index;
                        user_details[req.session.user_name].hotel_rate_key_list[rate_key_index] = rate_key;
                    }

                    //Hotel Address
                    if (hotel_details[i].address_part1) {

                        hotel_details[i].hotel_address = hotel_details[i].address_part1.replace(/[^a-zA-Z0-9 ]/g, "");

                        if (hotel_details[i].address_part2) {
                            hotel_details[i].hotel_address = hotel_details[i].address_part1.replace(/[^a-zA-Z0-9 ]/g, "") + ', ' + hotel_details[i].address_part2.replace(/[^a-zA-Z0-9 ]/g, "");

                            if (current_obj.address_part3 != undefined) {
                                hotel_details[i].hotel_address = hotel_details[i].address_part1.replace(/[^a-zA-Z0-9 ]/g, "") + ', ' + hotel_details[i].address_part1.replace(/[^a-zA-Z0-9 ]/g, "") + ', ' + hotel_details[i].address_part3.replace(/[^a-zA-Z0-9 ]/g, "");
                            }
                        }
                    }

                    hotel_details[i]['hotel_name'] = (hotel_details[i]['hotel_name']).replace(/[^a-zA-Z ]/g, "");
                    hotel_details[i]['hotel_phone'] = (hotel_details[i]['hotel_phone']).replace(/[^a-zA-Z0-9 ]/g, "")
                    hotel_details[i]['room_details'] = more_hotel_data.room_details;
                    hotel_details[i]['image_details'] = more_hotel_data.image_details;
                    hotel_details[i]['starting_from'] = more_hotel_data.starting_from;

                    hotel_details_array.push(hotel_details[i]);
                }
            }
        }

        user_details[req.session.user_name].hotelSearchDetails = hotel_details_array;

        var hotel_view = new Hotel_Search_View();
        var html = await hotel_view.parse_hotel_search_view(hotel_details_array, div_id, invoke_source, req.session.user_name);

        var response = {
            status: 200,
            textToShow: html,
            resultFor: "getHotelDetails",
            total_empty_resonse: total_empty_resonse,
            selected_available_hotel: selected_available_hotel
        };

        var close_session = await closeSession(access_token_details);
    }
    else {
        var response = {
            status: 404,
            message: `${await watsonRoute.translate(null, "Sabre Web Services are currently down", req.session.user_name)}. ${await watsonRoute.translate(null, "Please try again later", req.session.user_name)}.`,
            resultFor: "getHotelDetails"
        };
    }

    res.json(response);

});

router.post('/validateHotelPrice', async (req, res) => {

    var rate_key_index = req.body.rate_key_index;
    var hotel_rate_obj = user_details[req.session.user_name].hotel_rate_key_list;
    var rate_key = hotel_rate_obj[rate_key_index];

    if (req.body.invoke_source == "edit_pannel") {
        var response = { success: true, message: "Price Validated!", rate_key: rate_key };
    }
    else {
        var access_token_details = await getAccessToken();
        if (access_token_details != null) {
            var validated_room_price = await validate_hotel_price(access_token_details, rate_key);

            if (validated_room_price) {
                var hotel_name = validated_room_price.HotelName;

                if (hotel_name) {
                    if (user_details[req.session.user_name].hotelSearchDetails) {
                        user_details[req.session.user_name].validated_room_details = validated_room_price;
                        var response = { success: true, message: "Price Validated!", requiredDetails: validated_room_price, hotel_name: hotel_name };
                    }
                    else {
                        var response = { success: false, message: "Price Validation Failed! First search hotel." };
                    }
                }
                else {
                    var response = { success: false, message: "Price Validation Failed! Could not find the desired hotel details." };
                }
            }
            else {
                var response = { success: false, message: "Price Validation Failed! No rates qualify for the selected room." };
            }

            var close_session = await closeSession(access_token_details);
        }
        else {
            var response = { success: false, message: "Price Validation Failed! Sabre services seems to down." };
        }
    }
    res.json(response);
});

router.post('/getSelectedHotelDetails', async (req, res) => {

    if (user_details[req.session.user_name].validated_room_details) {
        var resposne = { requiredHotel: user_details[req.session.user_name].validated_room_details };
    }
    else {
        var resposne = { requiredHotel: null };
    }

    res.json(resposne);

});

//******************************************************************************************************************************* */
// ********************************************   Rental Car Search And Valdiation    *******************************************
//******************************************************************************************************************************* */

router.post('/getRentalCarDetails', async (req, res) => {

    if (!user_details[req.session.user_name]) {
        user_details[req.session.user_name] = {};
        user_details[req.session.user_name].rentalCarSearchDetails = null;
    }

    var rentalcar_validatedc = 0;
    var pre_selected = { preselected: "false" };

    if (req.body.invoke_source == "availability") {
        if (req.body.pnrObj != undefined && req.body.pnrObj != "" && req.body.pnrObj != null) {
            var access_token_detailsc = null;
            access_token_detailsc = await getAccessToken();

            if (access_token_detailsc) {
                var out_resultc = await vehiclePriceCheck(access_token_detailsc, req.body.pnrObj);
                if (out_resultc != undefined && out_resultc != "" && out_resultc != null) {
                    rentalcar_validatedc = 1;
                    pre_selected = { pnrobje_validation: true, preselected: "success", rentalcar_details: out_resultc, div_id: req.body.div_id };
                }
                var close_session = await closeSession(access_token_detailsc);
            }
        }
        else {
            var out_resultc = await rentalCarBookingExactMatch(req);
            if (out_resultc.result == "success") {
                rentalcar_validatedc = 1;
                try {
                    let divid = req.body.div_id;
                    let iternary = divid.substring(0, divid.length - 1);
                    let id_number = divid.charAt(divid.length - 1);
                    let session_handle_axios = { headers: { cookie: req.headers.cookie } };
                    out_resultc.rentalCrdetails.approximate_total_fare = out_resultc.validatedCarResult.approximate_total_fare;
                    out_resultc.rentalCrdetails.rate_code = out_resultc.validatedCarResult.rate_code;
                    var updated_previous_reservation_obj = await axios.post(process.env.IP + '/api/previousData/updatePreviousReservationObjectforPnr', { iternary: iternary, id_number: id_number, type: "car", obj: out_resultc.rentalCrdetails }, session_handle_axios);
                }
                catch (error) {
                    console.log(error)
                }
                pre_selected = { pnrobje_validation: false, preselected: "success", rental_car_details: out_resultc.rentalCrdetails, divid: req.body.div_id };
            }
        }
    }
    if (rentalcar_validatedc == 1) {
        return res.json(pre_selected);
    }

    var car_preference = [];
    rentalCarSearchDetails = null;
    car_preference = await getCarPreferences(req.headers.cookie);

    var div_id = req.body.div_id;
    var invoke_source = req.body.invoke_source;
    var pick_up_city_code = req?.body?.pick_up_city;
    var drop_off_city_code = req?.body?.drop_off_city;

    if (pick_up_city_code && drop_off_city_code) {

        var car_details = {};

        var pick_up_time = req?.body?.pick_up_time;
        var drop_of_time = req?.body?.drop_off_time;

        (pick_up_time) ? car_details['pick_up_time'] = pick_up_time.substring(0, 5) : car_details['pick_up_time'] = "10:00";
        (drop_of_time) ? car_details['drop_off_time'] = drop_of_time.substring(0, 5) : car_details['drop_off_time'] = "10:00";
        car_details['pick_up_time'] = car_details['pick_up_time'] == "00:00:00" || car_details['drop_off_time'] == "00:00" ? "10:00" : car_details['drop_off_time'];
        car_details['drop_off_time'] = car_details['drop_off_time'] == "00:00:00" || car_details['drop_off_time'] == "00:00" ? "10:00" : car_details['drop_off_time']
        car_details['pick_up_city'] = pick_up_city_code;
        car_details['pick_up_date'] = req.body.pick_up_date;
        car_details['drop_off_city'] = drop_off_city_code;
        car_details['drop_off_date'] = req.body.drop_off_date;

        var sendpickdate = req.body.pick_up_date;
        var senddropdate = req.body.drop_off_date;

        var access_token_details = null;
        access_token_details = await getAccessToken();

        //Initializing Sabre Session
        if (access_token_details != null) {
            //Getting Rental Car Info
            var car_details = await getRentalCarDetails(access_token_details, car_details);

            //Adding Vendor Preference
            if (car_details) {
                for (var i = 0; i < car_details.length; i++) {

                    if (car_preference.includes(car_details[i]?.vendor_code)) {
                        car_details[i].preference_indicator = true;
                    }
                    else {
                        car_details[i].preference_indicator = false;
                    }
                }
            }

            if (car_details == null) {
                var response = { resultFor: "getRentalCarDetails", status: 404, response_message: `${await watsonRoute.translate(null, "No Rates Qualify", req.session.user_name)}.` };
            }
            else if (car_details.length == 0) {
                var response = { resultFor: "getRentalCarDetails", status: 404, response_message: `${await watsonRoute.translate(null, "No Rates Qualify", req.session.user_name)}` };
            }
            else {
                //Storing in global variables
                user_details[req.session.user_name].rentalCarSearchDetails = car_details;

                //Generating UI
                var textToShow = `<div class="panel panel-default">`;
                textToShow += `<div class="panel-body"><div class="hotel_detail_div" style="height: 400px; overflow: auto;"><div id="carousel_rental_car" class="hotel-secton">`;

                var preferred = await watsonRoute.translate(null, "Preferred", req.session.user_name);
                var select = await watsonRoute.translate(null, "Select", req.session.user_name)

                for (var i = 0; i < car_details.length; i++) {
                    if (car_details[i].vendor_name) {
                        var vendor_logo = car_details[i].vendor_logo;
                        if (vendor_logo == null) {
                            vendor_logo = `https://i.ibb.co/KWCW6B6/default-image.png`;
                        }

                        var car_logo = car_details[i].car_logo;
                        if (car_logo == null) {
                            car_logo = `https://i.ibb.co/KWCW6B6/default-image.png`;
                        }

                        if (car_details[i].preference_indicator) {
                            var preference_check = `<div class="preffered-tag"> ${preferred} </div>`;
                        }
                        else {
                            var preference_check = ``;
                        }

                        textToShow += `<div class="hotel-row">${preference_check}<div class="hotel-column left car-rental-boxes"><div class="inner-left-text"><img src="${car_logo}" width="400" height="300">  <div class="brand-logo"> </div></div> <div class="inner-right-button"> <div class="brand-name"><img src="${vendor_logo}" width="50" height="40">${car_details[i].vendor_name}<p> (${car_details[i].vendor_code}) </p> <p class="brand-fee"> $${car_details[i].approximate_total_fare} </p></div>  <p class="bullet-text"> <span><i class="fa fa-car"></i> ${car_details[i].vehicle_category} </span> <span><i class="gear-icon"></i> ${car_details[i].vehicle_drive} </span> <span><i class="door-icon"></i>  ${car_details[i].vehicle_type} </span> <span><i class="seat-icon"></i> ${car_details[i].num_of_seats} personals</span> </p> <button type="button" class="btn btn-success btn-sm disableIt" onclick="check_rentalcar_price('${car_details[i].car_id}','${invoke_source}','${sendpickdate.replace('-', '/').replace('-', '/')}','${senddropdate.replace('-', '/').replace('-', '/')}','${div_id}'); disableButtons();"> ${select} </button> </div> </div></div>`;
                    }
                }
                textToShow += `</div> </div> </div></div>`;


                var response = { resultFor: "getRentalCarDetails", status: 200, response_message: car_details, textToShow: textToShow };
            }

            var close_session = await closeSession(access_token_details);
        }
        else {
            var response = { resultFor: "getRentalCarDetails", status: 404, message: `${await watsonRoute.translate(null, "Session Initialization Error", req.session.user_name)}` };
        }
    }
    else {
        var response = { resultFor: "getRentalCarDetails", status: 404, message: `${await watsonRoute.translate(null, "Session Initialization Error", req.session.user_name)}!` };
    }

    res.json(response);
});

router.post('/validateRentalCarPrice', async (req, res) => {
    var car_id = req.body.car_id;

    if (user_details[req.session.user_name].rentalCarSearchDetails != null && user_details[req.session.user_name].rentalCarSearchDetails != []) {
        if (car_id > (user_details[req.session.user_name].rentalCarSearchDetails).length) {
            var response = { success: false, message: `${await watsonRoute.translate(null, "The selected car ID is not valid", req.session.user_name)}!` }
        }
        else {
            for (var i = 0; i < (user_details[req.session.user_name].rentalCarSearchDetails).length; i++) {
                (user_details[req.session.user_name].rentalCarSearchDetails)[i].car_id;

                if ((user_details[req.session.user_name].rentalCarSearchDetails)[i].car_id == car_id) {
                    required_deails = (user_details[req.session.user_name].rentalCarSearchDetails)[i];
                    break;
                }
            }

            if (required_deails.RateKey) {
                if (req.body.invoke_source == "edit_pannel") {
                    var response = { success: true, selected_car_details: required_deails }
                }
                else {
                    var access_token_details = null;
                    access_token_details = await getAccessToken();

                    if (access_token_details) {
                        var price_check = await vehiclePriceCheck(access_token_details, required_deails.RateKey);
                        if (price_check.approximate_total_fare <= required_deails.approximate_total_fare) {
                            required_deails.rate_code = price_check.rate_code;
                            required_deails.drop_off_charge = price_check.drop_off_charge;

                            user_details[req.session.user_name].validated_rental_car_details = required_deails;
                            var response = { success: true, current_price: price_check, expected_price: required_deails.approximate_total_fare, selected_car_details: required_deails }
                        }
                        else {
                            var response = { success: false, current_price: price_check, expected_price: required_deails.approximate_total_fare, message: `Prices are slightly increased! Current price is ${price_check.approximate_total_fare}$ while the expected price is ${required_deails.approximate_total_fare}$` }
                        }

                        var close_session = await closeSession(access_token_details);
                    }
                    else {
                        var response = { success: false, message: `${await watsonRoute.translate(null, "Sabre services seems to be down. Please try again later", req.session.user_name)}!` }
                    }
                }

            }
            else {
                var response = { success: false, message: `${await watsonRoute.translate(null, "Details not found", req.session.user_name)}!` }
            }
        }
    }
    else {
        var response = { success: false, message: `${await watsonRoute.translate(null, "No details found! Search car options first", req.session.user_name)}!` }
    }

    res.json(response)

});

router.post('/getRentalCarDetailsData', async (req, res) => {
    var car_id = req.body.id;
    var required_deails = null;

    if (user_details[req.session.user_name].rentalCarSearchDetails != null && user_details[req.session.user_name].rentalCarSearchDetails != []) {
        for (var i = 0; i < (user_details[req.session.user_name].rentalCarSearchDetails).length; i++) {
            user_details[req.session.user_name].rentalCarSearchDetails[i].car_id;
            if ((user_details[req.session.user_name].rentalCarSearchDetails)[i].car_id == car_id) {
                required_deails = (user_details[req.session.user_name].rentalCarSearchDetails)[i];
            }
        }

        if (required_deails['approximate_total_fare'] != null) {
            required_deails['approximate_total_fare'] = `${required_deails['approximate_total_fare']} $`
        }
        else {
            required_deails['approximate_total_fare'] = `${await watsonRoute.translate(null, "Price not provided", req.session.user_name)}`;
        }
    }
    else {
        required_deails = `${await watsonRoute.translate(null, "No data found", req.session.user_name)}`;
    }

    res.json(required_deails);
});

router.post('/getVehicleVendorLists', async (req, res) => {

    access_token_details = await getAccessToken();

    if (access_token_details != null) {
        var vendor_codes = await get_vehicle_vendor_codes_all(access_token_details);
        var close_session = await closeSession(access_token_details);

        res.json(vendor_codes);
    }
});

//***************************************************************************************************************************** */
// ********************************************   Town Car Search And Valdiation    *******************************************
//***************************************************************************************************************************** */

router.post('/getTownCarDetails', async (req, res) => {

    if (!user_details[req.session.user_name]) {
        user_details[req.session.user_name] = {};
        user_details[req.session.user_name].townCarSearchDetails = null;
    }

    var car_data = {};
    var car_type = req.body.car_type;
    var car_preference = [];
    car_preference = await getCarPreferences(req.headers.cookie);

    if (car_type === "oneway") {
        car_data['pick_up_date'] = req.body.pick_up_date;
        var timePre = req.body.pick_up_time;
        car_data['pick_up_time_main'] = timePre;
        car_data['pick_up_time'] = timePre.substr(0, 5);
        car_data['pick_up_address'] = req.body.pick_up_address;
        car_data['drop_off_address'] = req.body.drop_off_address;

        //Getting the pick_up_address coordinates (GeoCode) for the address 
        var pick_up_geo_code = await getGeoCode(car_data['pick_up_address']);

        if (pick_up_geo_code != null && pick_up_geo_code != undefined) {
            var pick_up_geo_code_latitude = pick_up_geo_code.latitude;
            var pick_up_geo_code_longitude = pick_up_geo_code.longitude;
            car_data['pick_up_latitude'] = pick_up_geo_code_latitude.toString();
            car_data['pick_up_longitude'] = pick_up_geo_code_longitude.toString();
        }
        else {
            car_data['pick_up_latitude'] = null;
            car_data['pick_up_longitude'] = null;
        }

        //Getting the drop_off_address coordinates (GeoCode) for the address 
        var drop_off_geo_code = await getGeoCode(car_data['drop_off_address']);
        if (drop_off_geo_code != null && drop_off_geo_code != undefined) {
            var drop_off_geo_code_latitude = drop_off_geo_code.latitude;
            var drop_off_geo_code_longitude = drop_off_geo_code.longitude;
            car_data['drop_off_latitude'] = drop_off_geo_code_latitude.toString();
            car_data['drop_off_longitude'] = drop_off_geo_code_longitude.toString();
        }
        else {
            car_data['drop_off_latitude'] = null;
            car_data['drop_off_longitude'] = null;
        }

        var access_token_details = null;
        access_token_details = await getAccessToken();

        //Initializing Sabre Session
        if (access_token_details != null) {
            //Getting Town Car Info
            var car_details = await getTownCarOneWay(access_token_details, car_data);

            //Adding Vendor Preference
            if (car_details) {
                for (var i = 0; i < car_details.length; i++) {

                    if (car_preference.includes(car_details[i]?.vendor_code)) {
                        car_details[i].preference_indicator = true;
                    }
                    else {
                        car_details[i].preference_indicator = false;
                    }
                }
            }

            if (car_details == null) {
                var response = { resultFor: "getRentalCarDetails", status: 404, response_message: `${await watsonRoute.translate(null, "No Rates Qualify", req.session.user_name)}` };
            }
            else if (car_details.length == 0) {
                var response = { resultFor: "getRentalCarDetails", status: 404, response_message: `${await watsonRoute.translate(null, "No Rates Qualify", req.session.user_name)}` };
            }
            else {
                //Storing in global variables
                user_details[req.session.user_name].townCarSearchDetails = car_details;

                //Generating UI
                var textToShow = `<div class="panel panel-default">`;
                textToShow += `<div class="panel-body"><div class="owl-slider"><div id="carousel_town_car" class="owl-carousel">`;

                for (var i = 0; i < car_details.length; i++) {
                    if (car_details[i].vendor_name) {

                        if (car_details[i].preference_indicator) {
                            var preference_check = `<div class="preffered-tag"> ${await watsonRoute.translate(null, "Preferred", req.session.user_name)} </div>`;
                        }
                        else {
                            var preference_check = ``;
                        }

                        if (car_details[i].approximate_total_fare != undefined) {
                            if (car_details[i].approximate_total_fare != null) {
                                var car_price = `$ ${car_details[i].approximate_total_fare}`;
                            }
                            else {
                                var car_price = `${await watsonRoute.translate(null, "Price Not Provided", req.session.user_name)}`;
                            }
                        }
                        else {
                            var car_price = "Price Not Provided";
                        }

                        var vendor_logo = car_details[i].vendor_logo;
                        if (vendor_logo == null) {
                            vendor_logo = `https://i.ibb.co/KWCW6B6/default-image.png`;
                        }

                        var car_logo = car_details[i].car_logo;
                        if (car_logo == null) {
                            car_logo = `https://i.ibb.co/KWCW6B6/default-image.png`;
                        }

                        textToShow += `<div class="hotel-row">${preference_check}<div class="hotel-column left car-rental-boxes"><div class="inner-left-text"><img src="${car_logo}" width="400" height="300">  <div class="brand-logo"> </div></div> <div class="inner-right-button"> <div class="brand-name"><img src="${vendor_logo}" width="50" height="40">${car_details[i].vendor_name}<p> (${car_details[i].vendor_code}) </p> <p class="brand-fee"> $${car_details[i].approximate_total_fare} </p></div>  <p class="bullet-text"> <span><i class="fa fa-car"></i> ${car_details[i].vehicle_category} </span> <span><i class="gear-icon"></i> ${car_details[i].vehicle_drive} </span> <span><i class="door-icon"></i>  ${car_details[i].vehicle_type} </span> <span><i class="seat-icon"></i> ${car_details[i].num_of_seats} personals</span> </p> <button type="button" class="btn btn-success btn-sm disableIt" onclick="check_towncar_price('${car_details[i].car_id}'); disableButtons();"> ${await watsonRoute.translate(null, "Select", req.session.user_name)} </button> </div> </div></div>`
                    }
                }
                textToShow += `</div> </div> </div></div>`;

                var response = { resultFor: "getTownCarDetails", status: 200, response_message: car_details, textToShow: textToShow };
            }
        }
        else {
            var response = { status: 404, message: "Session Initialization Error!" };
        }

        //Closing Sabre session
        if (access_token_details != null) {
            var close_session = await closeSession(access_token_details);
        }
        else {
            var response = { status: 404, message: "Saber API Error!" };
        }
    }
    else if (car_type === "hourly") {
        car_data['pick_up_date'] = req.body.pick_up_date;
        var pick_up_time_pre = req.body.pick_up_time;
        car_data['pick_up_time'] = pick_up_time_pre.substr(0, 5);
        car_data['pick_up_address'] = req.body.pick_up_address;
        var drop_off_time_pre = req.body.drop_off_time;
        car_data['drop_off_time'] = drop_off_time_pre.substr(0, 5);

        //Getting the pick_up_address coordinates (GeoCode) for the address 
        var pick_up_geo_code = await getGeoCode(car_data['pick_up_address']);

        if (pick_up_geo_code != null && pick_up_geo_code != undefined) {
            var pick_up_geo_code_latitude = pick_up_geo_code.latitude;
            var pick_up_geo_code_longitude = pick_up_geo_code.longitude;
            car_data['pick_up_latitude'] = pick_up_geo_code_latitude.toString();
            car_data['pick_up_longitude'] = pick_up_geo_code_longitude.toString();
        }
        else {
            car_data['pick_up_latitude'] = null;
            car_data['pick_up_longitude'] = null;
        }

        var access_token_details = null;
        access_token_details = await getAccessToken();

        //Initializing Sabre Session
        if (access_token_details != null) {
            //Getting Rental Car Info
            var car_details = await getTownCarHourly(access_token_details, car_data);

            if (car_details == null) {
                if (user_details[req.session.user_name].prefferedLanguage == "English") {
                    var response = { resultFor: "getRentalCarDetails", status: 404, response_message: "No Rates Qualify" };
                }
                else {
                    var response = { resultFor: "getRentalCarDetails", status: 404, response_message: `${await translateTextAPI("No Rates Qualify", req.headers.cookie)}` };
                }

            }
            else if (car_details.length == 0) {
                if (user_details[req.session.user_name].prefferedLanguage == "English") {
                    var response = { resultFor: "getRentalCarDetails", status: 404, response_message: "No Rates Qualify" };
                }
                else {
                    var response = { resultFor: "getRentalCarDetails", status: 404, response_message: `${await translateTextAPI("No Rates Qualify", req.headers.cookie)}` };
                }
            }
            else {
                //Storing in global variables
                user_details[req.session.user_name].townCarSearchDetails = car_details;

                //generating UI
                //If preffered language is english
                if (user_details[req.session.user_name].prefferedLanguage == "English") {
                    var textToShow = `<div class="panel panel-default">`;
                    textToShow += `<div class="panel-body"><div class="owl-slider"><div id="carousel_town_car" class="owl-carousel">`;
                    for (var i = 0; i < car_details.length; i++) {
                        if (car_details[i].approximate_total_fare != undefined) {
                            if (car_details[i].approximate_total_fare != null) {
                                var car_price = `$${car_details[i].approximate_total_fare}`;
                            }
                            else {
                                var car_price = "Price Not Provided";
                            }
                        }
                        else {
                            var car_price = "Price Not Provided";
                        }

                        var vendor_logo = car_details[i].vendor_logo;
                        if (vendor_logo == null) {
                            vendor_logo = `https://i.ibb.co/KWCW6B6/default-image.png`;
                        }

                        var car_logo = car_details[i].car_logo;
                        if (car_logo == null) {
                            car_logo = `https://i.ibb.co/KWCW6B6/default-image.png`;
                        }

                        textToShow += `<div class="brand-box"><div class="brand-image"><img src="${car_logo}" width="400" height="300">  <div class="brand-logo"> </div></div> <div class="brand-text"> <div class="brand-name"><img src='${vendor_logo}' width="50" height="40">${car_details[i].vendor_name}<p> (${car_details[i].vendor_code}) </p> <p class="brand-fee"> ${car_price} </p></div>  <p class="bullet-text"> <span><i class="fa fa-car"></i> ${car_details[i].vehicle_category} </span> <span><i class="gear-icon"></i> ${car_details[i].vehicle_drive} </span> <span><i class="door-icon"></i>  ${car_details[i].vehicle_type} </span> <span><i class="seat-icon"></i> ${car_details[i].num_of_seats} personals</span> </p> <button type="button" class="btn btn-success btn-sm disableIt" onclick="check_towncar_price('${car_details[i].car_id}'); disableButtons();"> Select </button> </div> </div>`;
                    }
                    textToShow += `</div> </div> </div> </div>`;
                }
                else
                //If preffered language is not english
                {
                    var textToShow = `<div class="panel panel-default">`;
                    textToShow += `<div class="panel-body"><div class="owl-slider"><div id="carousel_town_car" class="owl-carousel">`;
                    for (var i = 0; i < car_details.length; i++) {
                        if (car_details[i].approximate_total_fare != undefined) {
                            if (car_details[i].approximate_total_fare != null) {
                                var car_price = `$${car_details[i].approximate_total_fare}`;
                            }
                            else {
                                var car_price = `${await translateTextAPI("Price Not Provided", req.headers.cookie)}`;
                            }
                        }
                        else {
                            var car_price = `${await translateTextAPI("Price Not Provided", req.headers.cookie)}`;
                        }

                        var vendor_logo = car_details[i].vendor_logo;
                        if (vendor_logo == null) {
                            vendor_logo = `https://i.ibb.co/KWCW6B6/default-image.png`;
                        }

                        var car_logo = car_details[i].car_logo;
                        if (car_logo == null) {
                            car_logo = `https://i.ibb.co/KWCW6B6/default-image.png`;
                        }

                        textToShow += `<div class="brand-box"><div class="brand-image"><img src="${car_logo}" width="400" height="300">  <div class="brand-logo"></div></div> <div class="brand-text"> <div class="brand-name"><img src='${vendor_logo}' width="50" height="40"> ${car_details[i].vendor_name}<p> (${car_details[i].vendor_code}) </p> <p class="brand-fee"> ${car_price} </p></div>  <p class="bullet-text"> <span><i class="fa fa-car"></i> ${await translateTextAPI(car_details[i].vehicle_category, req.headers.cookie)} </span> <span><i class="gear-icon"></i> ${await translateTextAPI(car_details[i].vehicle_drive, req.headers.cookie)} </span> <span><i class="door-icon"></i>  ${await translateTextAPI(car_details[i].vehicle_type, req.headers.cookie)} </span> <span><i class="seat-icon"></i> ${car_details[i].num_of_seats} personals</span> </p> <button type="button" class="btn btn-success btn-sm disableIt" onclick="message('${car_details[i].car_id}'); disableButtons();"> ${await translateTextAPI("Select", req.headers.cookie)} </button> </div> </div>`;
                    }
                    textToShow += `</div> </div> </div> </div>`;
                }

                var response = { resultFor: "getTownCarDetails", status: 200, response_message: car_details, textToShow: textToShow };
            }

        }
        else {
            var response = { status: 404, message: "Session Initialization Error!" };
        }

        //Closing Sabre session
        if (access_token_details != null) {
            var close_session = await closeSession(access_token_details);
        }
        else {
            var response = { status: 404, message: "Saber API Error!" };
        }
    }

    res.json(response);
});

router.post('/validateTownCarPrice', async (req, res) => {

    var car_id = req.body.car_id;

    if (user_details[req.session.user_name].townCarSearchDetails != null && user_details[req.session.user_name].townCarSearchDetails != []) {
        if (car_id > (user_details[req.session.user_name].townCarSearchDetails).length) {
            var response = { success: false, message: `The selected car ID is not valid!` }
        }
        else {
            for (var i = 0; i < (user_details[req.session.user_name].townCarSearchDetails).length; i++) {
                if ((user_details[req.session.user_name].townCarSearchDetails)[i].car_id == car_id) {
                    required_deails = (user_details[req.session.user_name].townCarSearchDetails)[i];
                    break;
                }
            }

            if (required_deails.RateKey) {

                var access_token_details = null;
                access_token_details = await getAccessToken();

                if (access_token_details) {
                    var price_check = await vehiclePriceCheck(access_token_details, required_deails.RateKey);

                    if (price_check.approximate_total_fare <= required_deails.approximate_total_fare) {
                        var response = { success: true, current_price: price_check, expected_price: required_deails.approximate_total_fare }
                    }
                    else {
                        var response = { success: true, current_price: price_check, expected_price: required_deails.approximate_total_fare, message: `Prices are slightly increased! Current price is ${price_check.approximate_total_fare}$ while the expected price is ${required_deails.approximate_total_fare}$` }
                    }

                    var close_session = await closeSession(access_token_details);

                }
                else {
                    var response = { success: false, message: `Sabre services seems to be down. Please try again later!` }
                }

            }
            else {
                var response = { success: false, message: `Details not founda!` }
            }
        }
    }
    else {
        var response = { success: false, message: `No details found! Search car options first!` }
    }

    res.json(response);
});

router.post('/getTownCarDetailsData', async (req, res) => {
    var car_id = req.body.id;
    var required_deails = null;

    for (var i = 0; i < (user_details[req.session.user_name].townCarSearchDetails).length; i++) {
        (user_details[req.session.user_name].townCarSearchDetails)[i].car_id;
        if ((user_details[req.session.user_name].townCarSearchDetails)[i].car_id == car_id) {
            required_deails = (user_details[req.session.user_name].townCarSearchDetails)[i];
        }
    }

    if (required_deails['approximate_total_fare'] != null) {
        if (user_details[req.session.user_name].prefferedLanguage === "English") {
            required_deails['approximate_total_fare'] = 'Price Not Provided';
        }
        else {
            required_deails['approximate_total_fare'] = `${await translateTextAPI("Price Not Provided", req.headers.cookie)}`;
        }

    }
    else {
        required_deails['approximate_total_fare'] = `${required_deails['approximate_total_fare']} $`;
    }

    res.json(required_deails);
});


//************************************************************************************************************************* */
// ********************************************   Rail Search And Valdiation    *******************************************
//************************************************************************************************************************* */

router.post('/findStationName', async (req, res) => {

    var city_name = req.body.city_name;

    //Session Initialization
    var access_token_details = null;
    access_token_details = await getAccessToken();

    if (access_token_details != null) {
        var station_name = await getStatioName(access_token_details, city_name);
        var response = { status: 200, message: station_name };
    }
    else {
        var response = { status: 404, message: "Session Initialization Error!" };
    }

    //Close Session
    if (access_token_details != null) {
        var close_session = await closeSession(access_token_details);
    }

    res.json(response);
});

router.post('/getRailDetails', async (req, res) => {

    var rail_type = req.body.rail_type;
    var rail_details = {};

    if (rail_type === "oneway") {
        rail_details['date'] = req.body.date;
        rail_details['time'] = req.body.time;
        rail_details['origin'] = req.body.origin;
        rail_details['destination'] = req.body.destination;

        //Initializing Session Token
        var access_token_details = null;
        access_token_details = await getAccessToken();

        if (access_token_details != null) {
            var rail_details = await getRailDetailsOneWay(access_token_details, rail_details);
            var response = { status: 200, message: rail_details };
        }
        else {
            var response = { status: 404, message: "Session Initialization Error!" };
        }

        //Closing Session
        if (access_token_details != null) {
            var close_session = await closeSession(access_token_details);
        }

    }

    res.json(response);

});

//*********************************************************************************************************************** */
// *************************************************   Create PNR    ************************************************
//*********************************************************************************************************************** */

router.post('/createPassengerNameRecord', async (req, res) => {

    var id_number = req.body.id_number;

    if (id_number != "empty") {
        var previous_iternary_obj = await getPrevious_reservation_obj(req.body.id_number, req.headers.cookie);
        try {

            if (previous_iternary_obj?.data?.iternery?.flight_details && (previous_iternary_obj?.data?.iternery?.flight_details[0]?.deleted == 0 || previous_iternary_obj?.data?.iternery?.flight_details[0]?.deleted == undefined)) {
                user_details[req.session.user_name].validated_flight_details = previous_iternary_obj?.data?.iternery?.flight_details[0]?.pnrObj;
            }

            if (previous_iternary_obj?.data?.iternery?.hotelDetails && (previous_iternary_obj?.data?.iternery?.hotelDetails).length > 0 && (previous_iternary_obj?.data?.iternery?.hotelDetails[0][0]?.deleted == 0 || previous_iternary_obj?.data?.iternery?.flight_details[0]?.deleted == undefined)) {
                user_details[req.session.user_name].validated_room_details = {};
                user_details[req.session.user_name].validated_room_details.booking_key = previous_iternary_obj.data.iternery.hotelDetails[0][0].pnrObj;
            }

            if (previous_iternary_obj?.data?.iternery?.rentalCarDetails && (previous_iternary_obj?.data?.iternery?.rentalCarDetails).length > 0 && (previous_iternary_obj?.data?.iternery?.rentalCarDetails[0][0]?.deleted == 0 || previous_iternary_obj?.data.iternery?.rentalCarDetails[0][0]?.deleted == undefined)) {
                user_details[req.session.user_name].validated_rental_car_details = previous_iternary_obj.data.iternery.rentalCarDetails[0][0].pnrObj;
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    var traveler_details = req.body.traveler_details;

    //Generating Payload Objects
    var pnr_data = {};

    if (traveler_details) {
        //Fight Information for PNR
        if (user_details[req.session.user_name].validated_flight_details) {
            pnr_data.is_flight = true;
            var flight_schedule_details = [];
            var flight_legs = user_details[req.session.user_name].validated_flight_details.flightScheduleData;

            if (flight_legs.length > 0) {
                for (var i = 0; i < flight_legs.length; i++) {
                    var current_schedule = flight_legs[i];
                    var temp_obj = {};

                    temp_obj.arrivalDateTime = current_schedule.arrivalDateTime;
                    temp_obj.departureDateTime = current_schedule.arrivalDateTime;
                    temp_obj.MarketflightNumber = current_schedule.MarketflightNumber;
                    temp_obj.MarketingCarrier = current_schedule.MarketingCarrier;
                    temp_obj.ResBookDesigCode = current_schedule.classOfService;
                    temp_obj.DestinationLocation = current_schedule.arrialAirport;
                    temp_obj.OriginLocation = current_schedule.deptAirPort;
                    temp_obj.Status = "NN";
                    temp_obj.NumberInParty = 1;

                    flight_schedule_details.push(temp_obj);
                }
            }
            pnr_data.flight_schedule_details = flight_schedule_details;
        }
        else {
            pnr_data.is_flight = false;
        }

        //Hotel Infromation for PNR
        if (user_details[req.session.user_name].validated_room_details) {
            pnr_data.is_hotel = true;
            pnr_data.booking_key = user_details[req.session.user_name].validated_room_details.booking_key;
        }
        else {
            pnr_data.is_hotel = false;
        }

        //Vehicle Information for PNR
        if (user_details[req.session.user_name].validated_rental_car_details) {
            pnr_data.is_rental_car = true;
            pnr_data.RateCode = user_details[req.session.user_name].validated_rental_car_details.rate_code;
            pnr_data.DropOffCharge = user_details[req.session.user_name].validated_rental_car_details.drop_off_charge;
            pnr_data.PickUpDate = user_details[req.session.user_name].validated_rental_car_details.pickUpDate;
            pnr_data.PickUpTime = user_details[req.session.user_name].validated_rental_car_details.pickUpTime;
            pnr_data.Quantity = 1;
            pnr_data.ReturnDate = user_details[req.session.user_name].validated_rental_car_details.dropOffDate;
            pnr_data.ReturnTime = user_details[req.session.user_name].validated_rental_car_details.dropOffTime;
            pnr_data.PickUpLocation = user_details[req.session.user_name].validated_rental_car_details.pickUpCity;
            pnr_data.ReturnLocation = user_details[req.session.user_name].validated_rental_car_details.dropOffCity;
        }
        else {
            pnr_data.is_rental_car = false;
        }
    }

    var access_token_details = null;
    access_token_details = await getAccessToken_test();
    if (access_token_details != null) {
        var pnr_creation_result = await createPNR(access_token_details, pnr_data);
        if (pnr_creation_result.locator_id) {
            if (pnr_creation_result.data != null) {
                await save_created_pnr_data(req.body.traveler_details[0].ez_user_id_Traveler, pnr_creation_result, user_details[req.session.user_name].validated_flight_details, req.headers.cookie);
            }
            response = { success: true, pnr_details: pnr_creation_result };
        }
        else {
            response = { success: false };
        }

        var close_session = await closeSession_test(access_token_details);
    }
    else {
        var response = { resultFor: "getRentalCarDetails", status: 404, message: "Session Initialization Error!" };
    }

    res.json(response);

});

//*********************************************************************************************************************** */
// *************************************************   Profile Search    ************************************************
//*********************************************************************************************************************** */

router.post('/searchProfileByEmail', async (req, res) => {

    var email = req.body.email;

    var access_token_details = await getAccessToken();

    //Checking if the token is initialized
    if (access_token_details != null) {
        var search_profile = await searchProfilesByEmail(access_token_details, email);

        if (search_profile != null) {
            var response = { profile_details: search_profile };

            var close_session = await closeSession(access_token_details);
        }
        else {
            var response = { status: 404, message: "Sabre Web API Services are currenlty down. Please try later." };
        }
    }
    else {
        var response = { status: 404, message: "Session Initialization Error" };
    }

    res.json(response);
});

router.post('/bulkSearchProfiles', async (req, res) => {

    var array_to_send = [];

    var profiles_to_search = req.body.profiles_to_search;

    if (profiles_to_search.length != 0) {
        //Initializing Sabre Token Session
        access_token_details = await getAccessToken();

        if (access_token_details != null) {
            for (var i = 0; i < profiles_to_search.length; i++) {
                var profile_details = await searchProfilesByEmail(access_token_details, profiles_to_search[i])
                {
                    if (Object.keys(profile_details).length > 0) {
                        array_to_send.push(profiles_to_search[i]);
                    }
                }
            }
            var response = { status: 200, records: array_to_send };

            //Closing Session Error (Error handling Pending)
            var close_session = await closeSession(access_token_details);
        }
        else {
            var response = { status: 404, message: "Session Initialization Error" };
        }
    }
    else {
        var response = { status: 404, records: array_to_send, messsage: "Empty array is provided." };
    }

    res.json(response);
});
// =========================================//PNR function============================================== 
// =====================================================================================================
// =====================================================================================================

router.post('/getAllLocatorUser', async (req, res) => {
    var array_to_send = [];

    var traveler_id = req.body.traveler_id;

    let session_handle_axios = { headers: { cookie: current_session } };

    if (traveler_id != 0) {

        var DBresponse = await axios.post(process.env.IP + '/api/localQuery/query', { queryAction: 'FetchData', requestType: "getPNRLocator", traveler_id: traveler_id }, session_handle_axios);

        if (DBresponse != null) {

            var reclocs = DBresponse?.data?.record?.recordset;

            for (var i = 0; i < reclocs.length; i++) {
                if (reclocs[i]?.recloc)
                    array_to_send.push(reclocs[i]?.recloc);
            }

            var response = { status: 200, records: array_to_send };


        }
        else {
            var response = { status: 404, message: "No Data Found" };
        }
    }
    else {
        var response = { status: 404, records: array_to_send, messsage: "Empty array is provided." };
    }

    res.json(response);
});

router.post('/retrieveAndCancelPNRdetails', async (req, res) => {

    var recloc = req.body.reclocator;

    var token_details = await getAccessToken();

    if (token_details != null) {
        var sabre_endpoint = "https://webservices.havail.sabre.com";
        var headers_info = {
            headers: {
                'cache-control': 'no-cache',
                'Connection': 'keep-alive',
                'Accept-Encoding': 'text/xml',
                'Cache-Control': 'no-cache',
                'Accept': '*/*',
                'Content-Type': 'text/xml'
            }
        };
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
            <soap-env:Envelope xmlns:soap-env='http://schemas.xmlsoap.org/soap/envelope/' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:xsd='http://www.w3.org/1999/XMLSchema'>
                <soap-env:Header>
                    <eb:MessageHeader xmlns:eb='http://www.ebxml.org/namespaces/messageHeader'>
                            <eb:From>
                                <eb:PartyId eb:type='urn:x12.org.IO5:01'>Client</eb:PartyId>           
                            </eb:From>
                            <eb:To>
                                <eb:PartyId eb:type='urn:x12.org.IO5:01'>SWS</eb:PartyId>
                            </eb:To>
                            <eb:CAPId>${token_details.capid}</eb:CAPId>
                            <eb:ConversationId>${token_details.conversationid}</eb:ConversationId>
                            <eb:Service>Air Shopping Service</eb:Service>
                            <eb:Action>BargainFinderMaxRQ</eb:Action>
                            <eb:MessageData>
                                <eb:MessageId>${token_details.messageid}</eb:MessageId>
                                <eb:Timestamp>${token_details.timestamp}</eb:Timestamp>
                            </eb:MessageData>
                    </eb:MessageHeader>
                    <wsse:Security xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext">
                        <wsse:BinarySecurityToken valueType="String" EncodingType="wsse:Base64Binary">${token_details.token}</wsse:BinarySecurityToken>
                    </wsse:Security>
                </soap-env:Header>
                <soap-env:Body>
                <GetReservationRQ Version="1.19.0" xmlns="http://webservices.sabre.com/pnrbuilder/v1_19">
                <Locator>RHTVAJ</Locator>
                <RequestType>Stateful</RequestType>
                <ReturnOptions PriceQuoteServiceVersion="3.2.0">
                    <SubjectAreas>
                        <SubjectArea>ACTIVE</SubjectArea>
                        <SubjectArea>PRICE_QUOTE</SubjectArea>
                    </SubjectAreas>
                    <ViewName>Simple</ViewName>
                    <ResponseFormat>STL</ResponseFormat>
                </ReturnOptions>
            </GetReservationRQ>
            </soap-env:Body>
            </soap-env:Envelope>`;
        try {
            var api_response = await axios.post(sabre_endpoint, xml, headers_info);
            if (api_response.status = 200) {
                try {
                    var segments = get_segemts_request_xml(req.body.segments, api_response.data)?"<Segments></Segments>":"";

                    let xml2 = `<?xml version="1.0" encoding="UTF-8"?>
                <soap-env:Envelope xmlns:soap-env='http://schemas.xmlsoap.org/soap/envelope/' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:xsd='http://www.w3.org/1999/XMLSchema'>
                    <soap-env:Header>
                        <eb:MessageHeader xmlns:eb='http://www.ebxml.org/namespaces/messageHeader'>
                                <eb:From>
                                    <eb:PartyId eb:type='urn:x12.org.IO5:01'>Client</eb:PartyId>           
                                </eb:From>
                                <eb:To>
                                    <eb:PartyId eb:type='urn:x12.org.IO5:01'>SWS</eb:PartyId>
                                </eb:To>
                                <eb:CAPId>${token_details.capid}</eb:CAPId>
                                <eb:ConversationId>${token_details.conversationid}</eb:ConversationId>
                                <eb:Service>Air Shopping Service</eb:Service>
                                <eb:Action>BargainFinderMaxRQ</eb:Action>
                                <eb:MessageData>
                                    <eb:MessageId>${token_details.messageid}</eb:MessageId>
                                    <eb:Timestamp>${token_details.timestamp}</eb:Timestamp>
                                </eb:MessageData>
                        </eb:MessageHeader>
                        <wsse:Security xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext">
                            <wsse:BinarySecurityToken valueType="String" EncodingType="wsse:Base64Binary">${token_details.token}</wsse:BinarySecurityToken>
                        </wsse:Security>
                    </soap-env:Header>
                    <soap-env:Body>
                    <EnhancedCancelBookingRQ ErrorHandlingPolicy="ALLOW_PARTIAL_CANCEL" CancelAll="true" xmlns="http://services.sabre.com/sp/cancelbooking/v1">
                   ${segments}
                </EnhancedCancelBookingRQ>
                </soap-env:Body>
                </soap-env:Envelope>`;

                    var api_response2 = await axios.post(sabre_endpoint, xml2, headers_info);
                    if (api_response2.status == 200) {
                        var response = { response: api_response2.data };

                        var close_session = await closeSession(token_details);
                    }
                    else {
                        var response = { status: 404, message: "Sabre Web API Services are currenlty down. Please try later." };
                    }


                } catch (error) {

                }


            }

        }
        catch (error) {
            console.log(error.response.body);
            return [];
        }
    }
    return response;
});

function get_segemts_request_xml(params = "", retrieved_data) {
    var segments_list = retrieved_data["soap-env:Envelope"]["soap-env:Body"][0]["stl19:GetReservationRS"][0]["stl19:Reservation"][0]["stl19:PassengerReservation"][0]["stl19:Segments"][0]["stl19:Segment"];
    options_html = "<Segments>";
    segments_list.forEach(element => {
        if (params.includes("air")) {
          let id =   element["stl19:Segment"][0]?.$.id;
          let sequence =  element["stl19:Segment"][0]?.$.sequence;

            options_html += `<Segment sequence="${sequence}" id="${id}"/>`;

        }

    });
    options_html += "</Segments>";
    return options_html;
}

//====================================== [Route Implementation] =========================================//

module.exports = router;