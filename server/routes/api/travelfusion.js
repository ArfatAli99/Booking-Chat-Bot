//Route Main Dependecies
const express = require("express");
const router = express.Router();

//Calling External APIs [Translation] Dependecies
const axios = require('axios');

//Setting or formatting date
var moment = require('moment');

//Formatting Date according to sabre soap request
var dateFormat = require('dateformat');
var now = new Date;
var sabreTimeStamp = dateFormat(now, "isoDateTime");

//For parsing the XML response
var parseString = require("xml2js").parseString;
const { v4: uuidv4 } = require('uuid');

var uniqid = require('uniqid');

var watsonRoute = require('./watson');

global.loginID_val = "07AXXR07YMYQF0EU";
global.tf_endpoint = "https://api.travelfusion.com";
global.routing_id_val = "";
global.outward_id_val = "";
global.tfRef_booking_val = "";



//====================================== [Route Implementation] =========================================//


//******************************************************************************************************************************* */
// ***********************************************   Flight Search And Valdiation   ***********************************************
//******************************************************************************************************************************* */


router.post('/lowFlightSearchApi', async (req, res) => {

    if (!loginID_val) {
        var response_array = await getAccessLoginID();
        // console.log(response_array);
    } else {
        console.log("loginID_val"); //console.log(loginID_val);
        console.log("lowFlightSearchAPI Request");// console.log(req.body);
        //this request The response to the StartRouting request will not contain any flight data. 
        //Instead it will just contain a list of all the Routers that have been launched in relation to your search.
        //we only need Routing ID from this for later Searches.
        let params = {};
        params.date = moment(req.body.date).format('DD/MM/YYYY-HH:MM');
        params.departure = req.body.departure;
        params.destination = req.body.destination;
        params.flightType = req.body.flightType;
        params.invoke_source = req.body.invoke_source;
        params.numOfSeats = req.body.numOfSeats;
        params.time = req.body.time;
        params.action = req.body.action;
        // console.log("lPARAMAS Request"); console.log(params);
        var step2Response = await step2SubmittingtheSearchRequest(params);//step 2 will provide the RoutingID
        // console.log("========step2Response==========");
        // console.log(JSON.stringify(step2Response));
        // console.log(params.date);
        // console.log("========step2Response==========");
        try {
            if (step2Response.CommandList.hasOwnProperty("CommandExecutionFailure")) {
                var textToShow = `
                <div class="">There are also options available from the TravelFusions</div>
                <div class="accordion-box-scroll" style="height: 350px; overflow: auto">
                    <div class="accordion-box">
                        <ul class="accordion-list">`;
                textToShow += `${step2Response.CommandList.CommandExecutionFailure[0].StartRouting[0].$.etext}`;
                textToShow += `</ul></div></div>`;

                var result = {
                    resultFor: "getFlightDetailsTF",
                    result_array: "CommandExecutionFailure",
                    textToShow: textToShow
                };

                res.json(result);

            }

            if (step2Response.CommandList.StartRouting[0].hasOwnProperty("RoutingId")) {
                var RoutingId = step2Response.CommandList.StartRouting[0].RoutingId[0];
                routing_id_val = RoutingId; //assigning routing_id to the global variable
                var step3Response = await step3SubmittingtheResultsRequest(RoutingId);

                var allRouterLists = step3Response.CommandList.CheckRouting[0].RouterList[0].Router;
                var flight_details = [];

                for (let i = 0; i < allRouterLists.length; i++) {
                    let singleRoute = allRouterLists[i];
                    let singleobj = {};//for singleRoute
                    /* try { */
                        console.log("=========singleRoute===========");
                        // console.log(JSON.stringify(singleRoute));
                        console.log("=========singleRoute===========");
                    if (typeof singleRoute.GroupList[0] !== undefined && singleRoute.GroupList[0].hasOwnProperty("Group")) {
                        // console.log("singleRoute");
                        // console.log(singleRoute);
                        // console.log("singleRoute====");
                        // console.log("singleRoute");
                        // console.log(JSON.stringify(singleRoute));
                        // console.log("singleRoute====");
                        // console.log("Group");
                        // console.log(singleRoute.GroupList[0].Group[0].Id);
                        // console.log("Group====");
                        singleobj.supplier = singleRoute.Supplier[0];
                        singleobj.vendor = singleRoute.Vendor[0].Name[0];
                        singleobj.group_id = singleRoute.GroupList[0].Group[0].Id[0];
                        singleobj.outwardlist = [];//for singleRoute all outward List
                        let outward_array = singleRoute.GroupList[0].Group[0].OutwardList[0].Outward;
                        for (let k = 0; k < outward_array.length; k++) {
                            let output_single_outward = {};//single outward to be pushed in outward list array
                            let single_outward = outward_array[k];
                            output_single_outward.id = single_outward.Id[0];
                            output_single_outward.fare = single_outward.Price[0].Amount[0];
                            output_single_outward.currency_code = single_outward.Price[0].Currency[0];
                            output_single_outward.duration = single_outward.Duration[0];
                            output_single_outward.origin_type = single_outward.SegmentList[0].Segment[0].Origin[0].Type[0];
                            output_single_outward.origin = single_outward.SegmentList[0].Segment[0].Origin[0].Code[0];
                            output_single_outward.destination_type = single_outward.SegmentList[0].Segment[0].Destination[0].Type[0];
                            output_single_outward.destination = single_outward.SegmentList[0].Segment[0].Destination[0].Code[0];
                            output_single_outward.depart_date = single_outward.SegmentList[0].Segment[0].DepartDate[0];
                            output_single_outward.arrive_date = single_outward.SegmentList[0].Segment[0].ArriveDate[0];
                            output_single_outward.flight_code = single_outward.SegmentList[0].Segment[0].FlightId[0].Code[0];
                            output_single_outward.flight_number = single_outward.SegmentList[0].Segment[0].FlightId[0].Number[0];
                            output_single_outward.flight_class = single_outward.SegmentList[0].Segment[0].TravelClass[0].TfClass[0];
                            singleobj.outwardlist.push(output_single_outward);
                        }
                    } else {
                        continue;
                    }
                    flight_details.push(singleobj);
                }
                // console.log("  flights_data  ");
                // console.log(JSON.stringify(flight_details));
                // console.log(" flights_data End ");

                if (flight_details.length > 0) {
                    //Adding Flight Preferences

                    var numberOfFlights = flight_details.length;


                    var Fare = "Fare";
                    var Select = "Select";
                    var Flight_Career = "Flight Career";
                    var Number_of_Legs = "Stop";
                    var Flight = "Option";
                    var Duration = "Duration";
                    var non_stop = "NONSTOP";
                    var preffered = "Preffered";

                    var textToShow = `
                <div class="">There are also options available from the TravelFusions</div>
                <div class="accordion-box-scroll" style="height: 350px; overflow: auto">
                    <div class="accordion-box">
                        <ul class="accordion-list">`;

                    //==============================
                    let option_counter = 0;

                    for (let m = 0; m < flight_details.length; m++) {

                        console.log("flight_details==================");
                        // console.log(flight_details[m]);
                        console.log("flight_details==================");

                        var all_outward_in_single_Group = flight_details[m].outwardlist;
                        // console.log("all_outward_in_single_Group==================");
                        // console.log(all_outward_in_single_Group);
                        // console.log("all_outward_in_single_Group==================");
                        if (1 === 1) {
                            var show = `<h5> ${non_stop} </h5>`;
                        }

                        for (let n = 0; n < all_outward_in_single_Group.length; n++) {
                            option_counter++;
                            single_outward_in_single_Group = all_outward_in_single_Group[n];

                            textToShow += `
                    <li class="accordion-row" id="${option_counter}">
                        <div class="right-fare"> 
                            <label> ${single_outward_in_single_Group.fare}: 
                            <span>${single_outward_in_single_Group.fare} <b>$</b> </span></label> 
                            <button class="select-btn disableIt" onclick='selectedFlight_Travelfusion("${single_outward_in_single_Group.id}"); addClosingClass("${option_counter}");'> ${Select} </button>
                            </div><div class="flight-career"> 
                                ${show} 
                        </div>
                        <a class="accordion-title" href="javascript:void(0)" onclick="removeClass('${option_counter}')"> ${Flight} # ${option_counter}</a>
                        <div class="flight-box">`;

                            textToShow += `
                    <div class="flight-row">
                        <div class="flight-column">
                            <label> ${getFlightCode(single_outward_in_single_Group.flight_code,single_outward_in_single_Group.flight_number)}:</label>

                            <span>${getFlightCode(single_outward_in_single_Group.flight_code,single_outward_in_single_Group.flight_number)}-${single_outward_in_single_Group.flight_number}</span>
                        </div>
                        <div class="flight-column inline-column">
                            <div class="center-flight-city">
                                <span> <strong> ${single_outward_in_single_Group.origin} </strong>  <br> ${formatDateforFlightTimes(single_outward_in_single_Group.depart_date).timeF} <br> ${formatDateforFlightTimes(single_outward_in_single_Group.depart_date).dateF} </span>
                                <span> <img src="/images/airplane-icon.png" alt="airplane-icon" border="0"> </span>
                                <span> <strong> ${single_outward_in_single_Group.destination} </strong> <br> ${formatDateforFlightTimes(single_outward_in_single_Group.arrive_date).timeF} <br> ${formatDateforFlightTimes(single_outward_in_single_Group.arrive_date).dateF}</span>
                            </div>
                        </div>
                        <div class="flight-column">
                            <label> ${Duration}: </label> 
                            <span>${timeConvert(single_outward_in_single_Group.duration)}</span>
                        </div>
                    </div>
                    <div class="flight-row responsive-row">
                        <div class="flight-column">
                            <div class="right-fare"> 
                                <label> ${Fare}: <span> ${all_outward_in_single_Group.fare} <b> $ </b> </span> </label>
                            </div>
                        <div class="flight-career"> 
                            <h5> ${Number_of_Legs} : <span> ${non_stop} </span> </h5>
                        </div>
                    </div></div>`;
                            textToShow += `</div></li>`;

                        }
                    }//outer loop

                    textToShow += `</ul></div></div>`;



                }

            } else {

                var textToShow = `
            <div class="">There are also options available from the TravelFusions</div>
            <div class="accordion-box-scroll" style="height: 350px; overflow: auto">
                <div class="accordion-box">
                    <ul class="accordion-list">`;

                textToShow += `Currently No options available for this destination`;
                textToShow += `</ul></div></div>`;

            }

        } catch (error) {
            console.log(error);

        }

        var result = {
            resultFor: "getFlightDetailsTF",
            result_array: "",
            textToShow: textToShow
        };

        res.json(result);

    }
});

router.post('/selectingaFlightForBooking', async (req, res) => {
    let outward_id = req.body.outward_id;
    outward_id_val = outward_id;
    console.log(outward_id);
    try {
        let step4Response = await step4SelectingaFlightForBooking(outward_id_val);
        console.log("  Step 4  ");
        console.log(JSON.stringify(step4Response));
        console.log("  Step 4 _______  ");
  
        let step5Response = await step5SubmittingtheBookingdetails();
        console.log("  Step 5  ");
        console.log(JSON.stringify(step5Response));
        console.log("  Step 5 _______  ");
        tfRef_booking_val = step5Response.CommandList.ProcessTerms[0].TFBookingReference[0];
  
  
        let step6Param ={
          "tfRef_booking_val":tfRef_booking_val,
          "Currency_Code":step5Response.CommandList.ProcessTerms[0].Router[0].GroupList[0].Group[0].Price[0].Currency[0],
          "Amount":step5Response.CommandList.ProcessTerms[0].Router[0].GroupList[0].Group[0].Price[0].Amount[0]
        } 
  
  
        console.log("  Step 5 ================ ");
        console.log(JSON.stringify(step5Response));
        console.log("  Step 5 ===================  ");
        console.log("  Start Booking Process");
  
        if(tfRef_booking_val){
          let step6Response =  await step6StartingtheBooking(step6Param);
          console.log("  Step 6 ================ ");
          console.log(JSON.stringify(step6Response));
          console.log("  Step 6 ===================  ");
  
  
          tfRef_booking_val = step6Response.CommandList.StartBooking[0].TFBookingReference[0];
          let step7Response =   await step7RetrievingtheBookingStatus(tfRef_booking_val);
            console.log("  Step 7 ================ ");
            console.log(JSON.stringify(step7Response));
            console.log("  Step 7 ===================  ");
  
        }
     
        
    } catch (error) {
        console.log("errorssss=========");
        console.log(error);
        
    }
   


});
async function getAccessLoginID() {
    // var unique_id = uuidv4();

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
    var xml = `<CommandList>
    <Login>
      <Username>${process.env.TF_USERID}</Username>
      <Password>${process.env.TF_USERPASS}</Password>
    </Login>
  </CommandList>`

    try {
        var api_response = await axios.post(tf_endpoint, xml, headers_info);

        var response_array = await obtainLoginParse(api_response.data);

        if (response_array === null || response_array === undefined) {
            return null;
        }
        else {

            return response_array;
        }
    }
    catch (error) {
        // console.log(error)
        return null;
    }
}
async function step2SubmittingtheSearchRequest(params) {
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
    var xml = `<CommandList>
    <StartRouting>
        <XmlLoginId>${loginID_val}</XmlLoginId>
        <LoginId>${loginID_val}</LoginId>
        <Mode>plane</Mode>
        <Origin>
            <Descriptor>${params.departure}</Descriptor>
            <Type>airportcode</Type>
        </Origin>
        <Destination>
            <Descriptor>${params.destination}</Descriptor>
            <Type>airportcode</Type>
        </Destination>
        <OutwardDates>
            <DateOfSearch>${params.date}</DateOfSearch>
        </OutwardDates>
        <MaxChanges>1</MaxChanges>
        <MaxHops>2</MaxHops>
        <Timeout>40</Timeout>
        <TravellerList>
            <Traveller>
                <Age>30</Age>
            </Traveller>
        </TravellerList>
        <IncrementalResults>true</IncrementalResults>
    </StartRouting>
  </CommandList>`
    console.log("XML");
    console.log(xml);
    try {


        var api_response = await axios.post(tf_endpoint, xml, headers_info);
        var response_array = await parsetheApiResponse(api_response.data);
        if (response_array === null || response_array === undefined) {

            return null;
        }
        else {

            return response_array;
        }
    }
    catch (error) {
        console.log("error");
        console.log(error);
        return null;
    }

}
async function step3SubmittingtheResultsRequest(routing_id) {
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
    var xml = `<CommandList>
    <CheckRouting>
        <XmlLoginId>${loginID_val}</XmlLoginId>
        <LoginId>${loginID_val}</LoginId>
        <RoutingId>${routing_id}</RoutingId>
    </CheckRouting>
  </CommandList>`

    try {
        var api_response = await axios.post(tf_endpoint, xml, headers_info);
        // console.log("api_response Response");
        // console.log(api_response);
        // console.log("  api_response ");
        var response_array = await parsetheApiResponse(api_response.data);

        if (response_array === null || response_array === undefined) {

            return null;
        }
        else {

            return response_array;
        }
    }
    catch (error) {
        // console.log(error)
        return null;
    }

}
async function step4SelectingaFlightForBooking(outward_id) {
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

    var xml = `<CommandList>
    <ProcessDetails>
    <XmlLoginId>${loginID_val}</XmlLoginId>
    <LoginId>${loginID_val}</LoginId>
    <RoutingId>${routing_id_val}</RoutingId>
    <OutwardId>${outward_id}</OutwardId>
    <HandoffParametersOnly>false</HandoffParametersOnly>
    </ProcessDetails>
   </CommandList>`
console.log(xml);
    try {
        var api_response = await axios.post(tf_endpoint, xml, headers_info);
        console.log("api_response Response");
        console.log(api_response);
        console.log("  api_response ");
        var response_array = await parsetheApiResponse(api_response.data);

        if (response_array === null || response_array === undefined) {

            return null;
        }
        else {

            return response_array;
        }
    }
    catch (error) {
        console.log("======error")
        console.log(error)
        return null;
    }

}
async function step5SubmittingtheBookingdetails() {
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
  
    var xml = `<CommandList>
    <ProcessTerms>
      <XmlLoginId>${loginID_val}</XmlLoginId>
      <LoginId>${loginID_val}</LoginId>
      <RoutingId>${routing_id_val}</RoutingId>
      <BookingProfile>
      <TravellerList>
        <Traveller>
          <Age>30</Age>
          <Name>
            <Title>Mr</Title>
            <NamePartList>
              <NamePart>Andy</NamePart>
              <NamePart>S</NamePart>
              <NamePart>Peterson</NamePart>
            </NamePartList>
          </Name>
        </Traveller>
      </TravellerList>
       <ContactDetails>
         <Name>
          <Title>Mr</Title>
          <NamePartList>
            <NamePart>Andy</NamePart>
            <NamePart>S</NamePart>
            <NamePart>Peterson</NamePart>
          </NamePartList>
         </Name>
         <Address>
           <Company></Company>
           <Flat>22A</Flat>
           <BuildingName>Dean's Court</BuildingName>
           <BuildingNumber>3</BuildingNumber>
           <Street>St. George Street</Street>
           <Locality>Redland</Locality>
           <City>Bristol</City>
           <Province>Avon</Province>
           <Postcode>BS8 6GC</Postcode>
           <CountryCode>GB</CountryCode>
         </Address>
         <HomePhone>
           <InternationalCode>0044</InternationalCode>
           <AreaCode>12332</AreaCode>
           <Number>232223</Number>
           <Extension>3322</Extension>
         </HomePhone>
         <Email>andy@hotmail.com</Email>
      </ContactDetails>
      <BillingDetails>
        <Name>
          <Title>Mr</Title>
          <NamePartList>
            <NamePart>Andy</NamePart>
            <NamePart>S</NamePart>
            <NamePart>Peterson</NamePart>
          </NamePartList>
        </Name>
        <Address>
           <Company></Company>
           <Flat>22A</Flat>
           <BuildingName>Dean's Court</BuildingName>
           <BuildingNumber>3</BuildingNumber>
           <Street>St. George Street</Street>
           <Locality>Redland</Locality>
           <City>Bristol</City>
           <Province>Avon</Province>
           <Postcode>BS8 6GC</Postcode>
           <CountryCode>GB</CountryCode>
        </Address>
        <CreditCard>
           <Company></Company>
           <NameOnCard>
            <NamePartList>
              <NamePart>Mr Andy S Peterson</NamePart>
            </NamePartList>
           </NameOnCard>
           <Number>5411666677775555</Number>
           <SecurityCode>887</SecurityCode>
           <ExpiryDate>01/25</ExpiryDate>
           <StartDate>01/21</StartDate>
           <CardType>MasterCard</CardType>
           <IssueNumber>0</IssueNumber>
        </CreditCard>
      </BillingDetails>
    </BookingProfile>
      </ProcessTerms>
    </CommandList>`
  
    try {
        var api_response = await axios.post(tf_endpoint, xml, headers_info);
        // console.log("api_response Response");
        // console.log(api_response);
        // console.log("  api_response ");
        var response_array = await parsetheApiResponse(api_response.data);
  
        if (response_array === null || response_array === undefined) {
  
            return null;
        }
        else {
  
            return response_array;
        }
    }
    catch (error) {
        // console.log(error)
        return null;
    }
  
}
async function step6StartingtheBooking(param) {
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
  
    var xml = `<CommandList>
    <StartBooking>
    <XmlLoginId>${loginID_val}</XmlLoginId>
    <LoginId>${loginID_val}</LoginId>
      <TFBookingReference>${param.tfRef_booking_val}</TFBookingReference>
      <ExpectedPrice>
          <Amount>${param.Amount}</Amount>
          <Currency>${param.Currency_Code}</Currency>
      </ExpectedPrice>
      <FakeBooking>
        <EnableFakeBooking>true</EnableFakeBooking>
        <FakeBookingSimulatedDelaySeconds>15</FakeBookingSimulatedDelaySeconds>
        <FakeBookingStatus>Succeeded</FakeBookingStatus>
        <EnableFakeCardVerification>true</EnableFakeCardVerification>
      </FakeBooking>
    </StartBooking>
  </CommandList>`
  
    try {
        var api_response = await axios.post(tf_endpoint, xml, headers_info);
        // console.log("api_response Response");
        // console.log(api_response);
        // console.log("  api_response ");
        var response_array = await parsetheApiResponse(api_response.data);
  
        if (response_array === null || response_array === undefined) {
  
            return null;
        }
        else {
  
            return response_array;
        }
    }
    catch (error) {
        // console.log(error)
        return null;
    }
  
}  
async function step7RetrievingtheBookingStatus(param) {
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
  
    var xml = `
  <CommandList>
    <CheckBooking>
    <XmlLoginId>${loginID_val}</XmlLoginId>
    <LoginId>${loginID_val}</LoginId>
      <TFBookingReference>${param}</TFBookingReference>
    </CheckBooking>
  </CommandList>`
  
    try {
        var api_response = await axios.post(tf_endpoint, xml, headers_info);
        // console.log("api_response Response");
        // console.log(api_response);
        // console.log("  api_response ");
        var response_array = await parsetheApiResponse(api_response.data);
  
        if (response_array === null || response_array === undefined) {
  
            return null;
        }
        else {
  
            return response_array;
        }
    }
    catch (error) {
        // console.log(error)
        return null;
    }
  
}
  

//******************************************************************************************************************************* */
// ***********************************************   Parse Functions   ***********************************************
//******************************************************************************************************************************* */
async function obtainLoginParse(xml) {
    let newLoginId = "";
    parseString(xml, '', function (err, result) {
        try {
            if (result.CommandList.Login[0].LoginId[0]) {
                loginID_val = result.CommandList.Login[0].LoginId[0];
                newLoginId = result.CommandList.Login[0].LoginId[0];
            }
            else {
                return null;
            }

        } catch (e) {
            console.log(e);
            return null;
        }
    });

    var tokenArray = {};
    tokenArray.loginID = newLoginId;
    console.log("in tokenArray");
    console.log(tokenArray);
    console.log("in tokenArray end");
    return tokenArray;
}
async function parsetheApiResponse(xml) {
    var end_result = "";
    parseString(xml, '', function (err, result) {
        try {
            if (result) {
                end_result = result;
            }
            else {
                return null;
            }
  
        } catch (e) {
  
            return null;
        }
    });
  
    return end_result;
}

//******************************************************Helping Functions************************************************************************* */
//************************************************************************************************************************************************* */
//************************************************************************************************************************************************* */

function formatDateforFlightTimes(datetime) {

    const myArray = datetime.split("-");
    let arrayone = myArray[0];
    let arraytwo = myArray[1];

    let datesplits = arrayone.split("/");
    let reversedFormat = datesplits['2']+"/"+datesplits['1']+"/"+datesplits['0'];
    console.log("======datesplits");
    console.log(datesplits);
    console.log("datesplits========");

    console.log("======reversedFormat");
    console.log(reversedFormat);
    console.log("reversedFormat========");

    let newDateobj = new Date(reversedFormat);
    console.log("======myArray");
    console.log(myArray);
    console.log("myArray========");

    let formattedDate = moment(newDateobj).format("ddd,D MMM,yyyy");
    console.log("======formattedDate");
    console.log(formattedDate);
    console.log("formattedDate========");

    var formattedTime = moment(arraytwo,"H:mm");
    var twelveHr = formattedTime.format("hh:mm");
    var twelveHrPM = formattedTime.format("LT");
    return {
        "dateF":formattedDate,
        "timeF":twelveHrPM
    };
}

function timeConvert(n) {
    var num = n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    return rhours + " H(s) and " + rminutes + " M(s)";
}
function getFlightCode(flightcode,flight_number) { 
        const airlineCode = flightcode.replaceAll(flight_number, '');
        console.log("airlineCode");
        console.log(airlineCode);
        console.log("===============");
        return airlineCode; 
}

module.exports = router;