// ATG CHATBOT JS
const baseIP = "https://localhost:3546";

// ChatBody Hide and Show
$(".toggle-chat-box").click(function()
{
    $('#page-top').addClass("hang-scroll");
    $(".chat-box").slideToggle();
    $("#chat-launch-button").css("display", "none");
    $("#chat-minimize-button").css("display", "block");
});

$(".minimize-chat-box").click(function()
{
    $('#page-top').removeClass("hang-scroll");
});

$(".chat-minimize-button").click(function()
{
    $('#page-top').addClass("hang-scroll");
    $(".chat-box").slideToggle();
});

$("#mic-off").click(function(){
    $(".gif-box-off").slideToggle();
});

//Flight UI Accordian
$("body").on('click','.accordion-title', function(e) {
    e.preventDefault();

    let $this = $(this);

    if ($this.next().hasClass('show')) 
    {
        $this.next().removeClass('show');
        $this.next().slideUp(350);
    } 
    else if($this.next().hasClass('active'))
    {
        $this.next().removeClass('active');
        $this.parent().parent().find('li .flight-box').slideUp(350);
        $this.next().css('display','none');
    }
    else 
    {
        $this.parent().parent().find('li .flight-box').removeClass('active');
        $this.parent().parent().find('li .flight-box').slideUp(350);
        $this.next().toggleClass('active');
        $this.next().slideToggle(350);
    }
});  

//Global Variable(s):
//++++++++++++++++++
var personalInfoUpdationMode                =   false; 
var hotelName                               =   false;  
var specialRequest                          =   false; 
var getPickUpAddress                        =   false;  
var Email                                   =   false;
var getDropOffAddress                       =   false;
var allow_to_speak                          =   false;
var select_country                          =   true;
var error_log                               =   true;

var intervalVar                             =   null; 
var allowesIdleinterval                     =   null; 
var totalSeconds                            =   null;
var selectCount                             =   null; 
var sessionID                               =   null;
var requiredDataType                        =   null; 
var travelerInfo                            =   null;
var city_name_result                        =   null;
var get_previous_iternery_info_segment      =   null;
var current_reservation_module              =   null;
var getting_traveler_most_frequent_city     =   null;
var temp_variable                           =   null;
var current_selection_option                =   null;
var currentUserID                           =   null;
var GSPRavailibilty                         =   null;
var array_to_search_previous_reservation    =   null;
var from_previousReservation                =   null;
var on_previousReservation                  =   null;
var to_previousReservation                  =   null;
var at_previousReservation                  =   null;
var hotel_name_previousReservation          =   null;
var check_in_date_previousReservation       =   null;
var check_out_date_previousReservation      =   null;
var hotel_city_previousReservation          =   null;
var pick_up_city_previousReservation        =   null;
var drop_off_city_previousReservation       =   null;
var pick_up_date_time_previousReservation   =   null;
var drop_off_date_time_previousReservation  =   null;
var passengers_previousReservation          =   null;
var car_type_previousReservation            =   null;
var date_previousReservation                =   null;
var pick_up_address_previousReservation     =   null;
var drop_off_address_previousReservation    =   null;
var select_previousReservation              =   null;
var hourly_previousReservation              =   null;
var oneway_previousReservation              =   null;
var drop_off_time_previousReservation       =   null;
var roundtrip_previousReservation           =   null;
var requiredReservationArray                =   null;
var departure_date_range                    =   null;
var return_date_range                       =   null;

var phone_error_found                       =   0;
var string_error_found                      =   0;
var numeric_error_found                     =   0;
var email_error_found                       =   0;

var current_html_drop                       =   {};


//Regular Expressions for validating Input
//++++++++++++++++++++++++++++++++++++++++
const dateRegx          =   /[0-9][0-9]-[0-9][0-9]-[0-9][0-9][0-9][0-9]/gi;
const timeRegx          =   /[0-2][0-9]:[0-5][0-9]$/;
const reqExpForEmail    =   /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const phoneRegx         =   /^[0-9]+$/;
const number            =   /"^\d+$"/;

//=====================================================//

//           ** FUNCTION FOR LAUNCHING BOT **          //

function session_set(user_details)
{
    //Hiding footer detailings
    $('.chat-footer').hide();
    $('#chat-box').removeClass('add-footer');

    //Initializing reservation box
    document.getElementById("left-chat-panel").style.display = "none"; 
    document.getElementById("left-chat-panel-details").innerHTML = "";
    $('.chat-box').removeClass("open-reservation");

    let resourceURL             =   `${baseIP}/session_set`;
    selectCount                 =   0; 
    currentUserID               =   user_details;
    intervalVar                 =   null;
    current_reservation_module  =   null;
    current_selection_option    =   [];  

    var session_id_gen  =   Math.floor(Math.random() * (100000 - 1) + 10);
    var data_pre        =   { user_id : session_id_gen };
    var data            =   JSON.stringify(data_pre);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onerror = function() 
    {
        $("#botError").modal({ backdrop: 'static', keyboard: false });
        document.getElementById("error_message").innerHTML = "Failed to launch chat!";
    }
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {
            setTimeout(()=>{
                launchChatBot(user_details);
            }, 4000);
        }
    }
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("session_status", "initialize");
    xmlhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
    xmlhttp.send(data);
}

function launchChatBot(user_details)
{
    resetTimer();
    startTimer();
    
    const resourceURL = `${baseIP}/api/watson/initialize`;

    //Listening if the ENTER key is pressed
    var chatInputText = document.getElementById("chat-input"); 
    chatInputText.addEventListener("keydown", function (e) 
    {
        var msgTextBoxValue = chatInputText.value;
        if (e.keyCode === 13) 
        {
            if((msgTextBoxValue.trim()) != 0)
            {
                validateUserInput(msgTextBoxValue);
                chatInputText.value = "";
            }
        }
    });
    
    //Prepairing Payload
    var dataPre =   { "input" : "Welcome", "user_details" : user_details };
    var data    =   JSON.stringify(dataPre);

    var xhttp = new XMLHttpRequest();
    xhttp.onerror = function() 
    {
        $("#botError").modal({ backdrop: 'static', keyboard: false });
        document.getElementById("error_message").innerHTML = "Failed to launch chat!";
    };
    xhttp.onreadystatechange = function(data) 
    {
        if (this.readyState == 4 && this.status == 200) 
        {
            $('.chat-footer').show();
            $('#chat-box').removeClass('add-footer');

            document.getElementById('chat-loadding').style.display = "none";
            $(".chat-body").removeClass("chat-logo-relaunch");

            var response_object = JSON.parse(this.responseText);

            if(response_object.status != 404)
            {
                sessionID = response_object.sessionID;

                if(response_object.response === "multiple")
                {
                    var responsesArray  =   response_object.arrayObjs;
                    var responseCount   =   (responsesArray).length;

                    for(var j = 0; j < responseCount; j++)
                    {
                        var resp_obj        =   responsesArray[j];
                        var respType        =   ( resp_obj.responseType === "option" ) ? "option" : "text";

                        ( respType === "text" ) ? requiredDataType = "text" : requiredDataType = "Select";

                        if(respType === "text")
                        {
                            var html = `
                            <div class='msg-row'>
                                <div class='user-msg receive'>
                                    <div class='avator-icon'>
                                        <img src='/images/avatar-img-01.png'>
                                    </div>
                                    <p>
                                        ${resp_obj.title}
                                    </p>
                                </div>
                            </div>`;
                        }

                        if(respType === "option")
                        {
                            ( resp_obj.options <= 2 ) ? requiredDataType = "Decision" : requiredDataType = "Select";

                            if(resp_obj.options <= 2)
                            {  
                                var html = `
                                <div class='msg-row'>
                                    <div class='user-msg receive'>
                                        <div class='avator-icon'>
                                            <img src='/images/avatar-img-01.png'>
                                        </div>
                                        <p>
                                            ${resp_obj.title}
                                        </p>
                                    </div>
                                    <p>
                                        <div class='msg-row select'>`;
                                            for(var i= 0; i < resOptionLength; i++)
                                            {   
                                                current_selection_option.push(resp_obj.options[i].optionValue);

                                                let option  =   [];
                                                option[i]   =   'sendMessage("'+resp_obj.options[i].optionValue+'"); disableButtons();';
                                                html        +=  "<button type='button' class='btn btn-default disableIt' onclick='"+option[i]+"'> "+resp_obj.options[i].optionLabel+"</button>";
                                                html        +=  " ";
                                            }
                                        html += `
                                        </div>
                                    </p>
                                </div>`;
                            }
                            else
                            {
                                var html = `
                                <div class='msg-row'>
                                    <div class='user-msg receive'>
                                        <div class='avator-icon'>
                                            <img src='/images/avatar-img-01.png'>
                                        </div>
                                        <p>
                                            ${resp_obj.title}
                                        </p>
                                    </div>
                                </div>
                                <p>
                                    <div class='msg-row select'>
                                        <select class='selectOptions' onchange='sendMessage(this.value)'>`;
                                        html += 
                                        `<option> Please Select One </option>`;
                                        for(var i= 0; i < resOptionLength; i++)
                                        {   
                                            current_selection_option.push(resp_obj.options[i].optionValue);

                                            html += '<option value="'+resp_obj.options[i].optionValue+'">'+resp_obj.options[i].optionLabel+'</option>'; 
                                        }
                                        html += `
                                        </select>
                                    </div>
                                </p>`;
                            }
                        }
                        appendChatData(html);
                    }
                }
                else 
                {
                    var respType =  ( response_object.responseType === "option" ) ? "option" : "text";

                    ( respType === "text" ) ? requiredDataType = "text" : requiredDataType = "Select";

                    if(allow_to_speak)
                    { 
                        tts(response_object.title); 
                        allow_to_speak = false; 
                    }

                    if(respType === "text")
                    {  
                        var html = `
                        <div class='msg-row select'>
                            <div class='user-msg receive'>
                                <div class='avator-icon'>
                                    <img src='/images/avatar-img-01.png'>
                                </div>
                                <p>
                                    ${response_object.title}
                                </p>
                            </div>
                        </div>`;
                    }

                    if(respType === "option")
                    {
                        var resOptionLength = (response_object.options).length;

                        ( resOptionLength <= 2 ) ? requiredDataType = "Decision" : requiredDataType = "Select";

                        if(resOptionLength <= 2)
                        {
                            var html = `
                            <div class='msg-row select'>
                                <div class='user-msg receive'>
                                    <div class='avator-icon'>
                                        <img src='/images/avatar-img-01.png'>
                                    </div>
                                    <p>
                                        ${response_object.title}
                                    </p>
                                </div>
                                <p>
                                    <div class='msg-row select'>`;
                                    for(var i= 0; i < resOptionLength; i++)
                                    {   
                                        let option  = [];
                                        current_selection_option.push(response_object.options[i].optionValue);
                                        option[i]   = 'sendMessage("'+response_object.options[i].optionValue+'")';
                                        html += "<button type='button' class='btn btn-default' onclick='"+option[i]+"'> "+response_object.options[i].optionLabel+"</button>";
                                        html += " ";
                                    }
                                    html += `
                                    </div>
                                </p>
                            </div>`;   
                        }
                        else
                        {
                            var html = `
                            <div class='msg-row select'>
                                <div class='user-msg receive'>
                                    <div class='avator-icon'>
                                        <img src='/images/avatar-img-01.png'>
                                    </div>
                                    <p>
                                        ${response_object.title}
                                    </p>
                                </div>
                                <p>
                                    <div class='msg-row select'>
                                        <select class='selectOptions' onchange='sendMessage(this.value)'>
                                            <option> Please Select One </option>`;
                                            for(var i= 0; i < resOptionLength; i++)
                                            {   
                                                current_selection_option.push(response_object.options[i].optionValue);

                                                html += '<option value="'+response_object.options[i].optionValue+'">'+response_object.options[i].optionLabel+'</option>'; 
                                            }
                                        html += `
                                        </select>
                                    </div>
                                </p>
                            </div>`;
                        }
                    }

                    appendChatData(html);
                }

                if(response_object.checkUserRole)
                {
                    var UserID = response_object.UserID;
                    checkUserRoles(UserID);
                }

                if(response_object.requiredData)
                {
                    requiredDataType = response_object.requiredData;
                }

                if(response_object.contextType === "QueryLocal")
                {
                    queryLOCAL(response_object.context, response_object.contextParams);
                } 

                if(response_object.contextType === "QueryDB")
                {
                    queryDB(response_object.context, response_object.params);
                }

                if(response_object.contextType === "LanguageChangeQuery")
                {
                    if(response_object.context === "askForLanguageChange")
                    {
                        var responseStatement   =   response_object.contextParams;
                        var statement_one       =   responseStatement.statement_one;
                        var statement_two       =   responseStatement.statement_two;
                        var translated_option   =   responseStatement.option_translated;
                        var langauge_code       =   responseStatement.langauge_code;
                        var language            =   responseStatement.language;
                        var translating_text    =   responseStatement.translating_text;

                        //Translating special statement " Applying Language Preferences "
                        $('#translating_text').html(translating_text);

                        var statement = `
                        <div class='msg-row'>
                            <div class='user-msg receive'>
                                <div class='avator-icon'>
                                    <img src='/images/avatar-img-01.png'>
                                </div>
                                <p> 
                                    ${statement_one} 
                                    <br> 
                                    <span class="hr_test" style="display: block; width: 100%; border-top: 2px solid #fff; margin: 15px 0;"></span> 
                                    ${statement_two} 
                                </p>
                            </div>
                            <p>
                                <div class='msg-row select'>
                                    <button type="button" class="btn btn-default disableIt" onclick='changeLocalStatemnets("${langauge_code}", "${language}"); disableButtons();' > ${ translated_option } </button>  
                                    <button type="button" class="btn btn-default disableIt" onclick="changeLocalStatemnets('en', 'English'); disableButtons();"> No, I am comfortable with English </button> 
                                </div>
                            </p>
                        </div>`;

                        appendChatData(statement);
                    }
                }
            }
            else
            {
                $("#botError").modal({ backdrop: 'static', keyboard: false });
                document.getElementById("error_message").innerHTML = `${response_object.message}`;
                hideThings();
            }        
        }
    }
    xhttp.open("POST", resourceURL, true);
    xhttp.withCredentials = true;
    xhttp.credentials = "include";
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xhttp.send(data);
}

function changeLocalStatemnets(language_code, langauge)
{
    $('#translate-loadding').css("display", "flex");

    var text_array                          =   [];
    var text_array1                         =   [];
    var resourceURL                         =   `${baseIP}/query`;
    var text_to_translate_elements_array    =   document.getElementsByClassName("translate_text");
    var text_to_translate_elements_array1   =   document.getElementsByClassName("placeholder_translate");

    //For inner html text
    for(var i = 0; i < text_to_translate_elements_array.length; i++)
    {
        text_array.push(text_to_translate_elements_array[i].innerHTML);
    }

    //For placeholder text
    for(var i = 0; i < text_to_translate_elements_array1.length; i++)
    {
        text_array1.push(text_to_translate_elements_array1[i].getAttribute("placeholder"));
    }
    
    var dataPre =   { purpose : "translateLocalStatements", statmentsToTranslate : text_array, statmentsToTranslate1 : text_array1, language_code : language_code, langauge : langauge };
    var data    =   JSON.stringify(dataPre);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {
            $('#translate-loadding').css("display", "none");

            var response                        =   JSON.parse(this.response);
            var translatedStatements            =   response.translatedStatements;
            var translatedStatements1           =   response.translatedStatements1;

            for (var i = 0; i < text_to_translate_elements_array.length; i++)
            {
                text_to_translate_elements_array[i].innerHTML = translatedStatements[i];
            }

            for(var i = 0; i < text_to_translate_elements_array1.length; i++)
            {
                text_to_translate_elements_array1[i].setAttribute("placeholder", translatedStatements1[i]);
            }

            message('yes');
        }
    }
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

function checkUserRoles(id)
{
    //Disabling input functionality
    disbaleFunctionality();

    var resourceURL = `${baseIP}/api/umbrellaFaces/checkAssignedRoles`;

    var dataPre = { userID : id };
    var data = JSON.stringify(dataPre);

    //Appending Mesage Loader Image
    var msgLoaderImage = "<div class='loading-img' id='loading-img-2'><img src='/images/loader.gif'></div>";
    appendChatLoader(msgLoaderImage);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.timeout = 8000;
    xmlhttp.ontimeout = function (e) 
    { 
        var loader = document.getElementById("loading-img-2");
        if(loader) { loader.remove() };
        message("Traveler"); 
    };
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {

            //Enabling Functionality
            enableFunctionality();

            var loader = document.getElementById("loading-img-2");
            if(loader) { loader.remove() };

            var response_object = JSON.parse(this.responseText);
            if(response_object.status === "200")
            {
                if(response_object.arrangerRole && response_object.travelerRole)
                {
                    message("Both_Roles");
                }
                else if(response_object.arrangerRole && !response_object.travelerRole)
                {
                    message("Arranger");
                }
                else
                {
                    message("Traveler");
                }
            }
            else
            {
                message("Traveler");
            }
        }
    }
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

//           ** FUNCTION FOR LAUNCHING BOT **          //

//=====================================================//


//=====================================================//

//      ** FUNCTIONS THAT SEND MESSAGE TO BOT **      //

function queryLOCAL(action, dataObj)
{
    disbaleFunctionality();

    if(action == "initializeVariables")
    {
        var resourceURL =   `${baseIP}/query`;
        var data_pre    =   { purpose : "initializeVariables" };
        var data        =   JSON.stringify(data_pre);
    }

    else if(action == "getCurrentTravelerInfo")
    {
        var resourceURL =   `${baseIP}/query`;
        var data_pre    =   { purpose : "getCurrentTravelerDetails" };
        var data        =   JSON.stringify(data_pre);
    }

    else if(action == "getCityName")
    {
        var resourceURL =   `${baseIP}/query`;
        var data_pre    =   { purpose : "getCityName", cityCode : dataObj.city_code };
        var data        =   JSON.stringify(data_pre);
    }

    else if(action == "store_dates")
    {
        var resourceURL =   `${baseIP}/query`;
        var data_pre    =   { purpose : "storeDatesToDB", departure_date_range : dataObj.trip_departure_Date, return_date_range: dataObj.trip_return_date };
        var data        =   JSON.stringify(data_pre);
    }

    else if(action == "checkReservationRequirement")
    {
        var resourceURL =   `${baseIP}/query`;
        var data_pre    =   { purpose : "checkReservationRequirement", reservationType : dataObj.reservation_type };
        var data        =   JSON.stringify(data_pre);
    }

    else if(action == "get_traveler_most_frequent_city")
    {
        var resourceURL =   `${baseIP}/query`;
        var data_pre    =   { purpose : "get_traveler_most_frequent_city" };
        var data        =   JSON.stringify(data_pre);
    }

    else if(action == "makeFlightReservation")
    {
        var resourceURL =   `${baseIP}/query`;

        if(dataObj.flightType == "oneway")
        {
            var data_pre    =   { purpose : "makeFlightReservation", date : dataObj.date, time: dataObj.time, origin : dataObj.origin, flightType : dataObj.flightType, destination : dataObj.destination };
        }
        else
        {
            var data_pre = { purpose : "makeFlightReservation", flightType : dataObj.flightType, returnDate : dataObj.returnDate, returnTime : dataObj.returnTime, departureDate : dataObj.departureDate, departureTime : dataObj.departureTime, departureCityGo : dataObj.departureCityGo, destinationCityGo : dataObj.destinationCityGo, departureCityReturn : dataObj.departureCityReturn, destinationCityReturn : dataObj.destinationCityReturn }
        }

        var data        =   JSON.stringify(data_pre);
    }

    else if(action == "addTripPurpose")
    {
        var resourceURL =   `${baseIP}/query`;
        var data_pre    =   { purpose : "addTripPurpose", tripPurposeID : dataObj.tripPurposeID };
        var data        =   JSON.stringify(data_pre);
    }

    else if(action == "addHotelReservationInformation")
    {
        var resourceURL =   `${baseIP}/query`;
        var data_pre    =   { purpose : "addHotelReservationInformation", cityArea : dataObj.cityArea, hotelName : dataObj.hotelName, checkinDate : dataObj.checkinDate, checkOutDate : dataObj.checkOutDate };
        var data        =   JSON.stringify(data_pre);
    }

    else if(action == "makeCarReservation")
    {
        var resourceURL =   `${baseIP}/query`;
        var data_pre    =   { purpose : "makeCarReservation", PickUpCity : dataObj.PickUpCity, DropOffCity : dataObj.DropOffCity, PickUpDate : dataObj.PickUpDate, DropOffDate : dataObj.DropOffDate, PickUpTime : dataObj.PickUpTime, DropOffTime : dataObj.DropOffTime };
        var data        =   JSON.stringify(data_pre);
    }

    else if(action == "checkForReservationInfo")
    {
        var resourceURL =   `${baseIP}/query`;
        var data_pre    =   { purpose : "checkForReservationInfo" };
        var data        =   JSON.stringify(data_pre);
    }

    else if(action == "addSpecialReq")
    {
        var resourceURL =   `${baseIP}/query`;
        var data_pre    =   { purpose : "addSpecialReq", specialRequest : dataObj.specialRequest };
        var data        =   JSON.stringify(data_pre);
    }

    else if(action == "emptyTravelersInfoArray")
    {
        var resourceURL =   `${baseIP}/query`;
        var data_pre    =   { purpose : "emptyTravelersInfoArray" };
        var data        =   JSON.stringify(data_pre);
    }

    else if(action == "get_previous_iternery_data")
    {
        var resourceURL =   `${baseIP}/query`;
        var data_pre    =   { purpose : "get_previous_iternery_data", reservation_module : dataObj.reservation_mod };
        var data        =   JSON.stringify(data_pre);
    }

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {

            enableFunctionality();

            var response_object = JSON.parse(this.response);

            if(response_object.response_for == "initializeVariables")
            {
                if(response_object.success)
                {
                    if(response_object.result == 1)
                    {
                        message("yes");
                    }
                }
            }

            else if(response_object.response_for == "getCurrentTravelerInfo")
            {
                if(response_object.success)
                {
                    message(response_object);
                }
            }

            else if(response_object.response_for == "getCityName")
            {
                if(response_object.success)
                {
                    message(response_object);
                }
            }

            else if(response_object.response_for == "store_dates")
            {
                if(response_object.success)
                {
                    message("Yes");
                }
            }

            else if(response_object.response_for == "checkReservationRequirement")
            {
                if(response_object.success)
                {
                    message("Yes");
                }
                else
                {
                    message("No");
                }
            }

            else if(response_object.response_for == "get_traveler_most_frequent_city")
            {
                if(response_object.success)
                {
                    message(response_object);
                }
            }
            
            else if(response_object.response_for == "makeFlightReservation")
            {
                if(response_object.success)
                {
                    message("Yes");
                }
            }
            
            else if(response_object.response_for == "addTripPurpose")
            {
                if(response_object.success)
                {
                    message("Yes");
                }
            }

            else if(response_object.response_for == "addHotelReservationInformation")
            {
                if(response_object.success)
                {
                    message("Yes");
                }
            }

            else if(response_object.response_for == "makeCarReservation")
            {
                if(response_object.success)
                {
                    message("Yes");
                }
            }

            else if(response_object.response_for == "checkForReservationInfo")
            {
                if(response_object.success)
                {
                    message("Yes");
                }
                else
                {
                    message("No");
                }
            }

            else if(response_object.response_for == "addSpecialReq")
            {
                if(response_object.success)
                {
                    message("Yes");
                }
            }

            else if(response_object.response_for == "emptyTravelersInfoArray")
            {
                if(response_object.success)
                {
                    message("Yes");
                }
            }

            else if(response_object.response_for == "get_previous_iternery_data")
            {
                if(response_object.success)
                {
                    message(response_object);
                }
            }
        }
    };
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

function message(text)
{   
    disbaleFunctionality();
    resetTimer();

    var msgLoaderImage = "<div class='loading-img' id='loading-img-2'><img src='/images/loader.gif'></div>";
    appendChatLoader(msgLoaderImage);
        
    select_country = false;
    const resourceURL =  `${baseIP}/api/watson/message`;

    current_selection_option = [];
    
    //Generating payload to send to ibm watson
    if(validateEmail(text))
    {
        if(Email)
        {
            var dataPre = { "text" : text, "email" : text, "sessionID" : sessionID };
            Email = false;
        }
    }
    else if(hotelName)
    {
        var dataPre = { "text" : text, "hotelName" : text, "sessionID": sessionID };
        hotelName = false;
    }   
    else if(getPickUpAddress)
    {
        var dataPre = { "text" : text, "getPickUpAddress" : text, "sessionID" : sessionID };
        getPickUpAddress = false;
    }
    else if(getDropOffAddress)
    {
        var dataPre = { "text" : text, "getDropOffAddress" : text, "sessionID" : sessionID };
        getDropOffAddress = false;
    }  
    else if(specialRequest)
    {
        var dataPre = { "text" : text, "specialRequest" : text, "sessionID" : sessionID };
        specialRequest = false;
    }
    else if(travelerInfo)
    {
        var dataPre = { "text" : "Yes", "travelerInfo" : text, "sessionID" : sessionID };
        travelerInfo = false;
    }
    else if(city_name_result)
    {
        var dataPre = { "text" : "Yes", "city_name_result" : text, "sessionID" : sessionID };
        city_name_result = false;
    }
    else if(getting_traveler_most_frequent_city)
    {
        var dataPre = { "text" : "Yes", "getting_traveler_most_frequent_city" : text, "sessionID" : sessionID };
        getting_traveler_most_frequent_city = false;
    }
    else if(get_previous_iternery_info_segment)
    {
        var dataPre = { "text" : "Yes", "get_previous_iternery_info_segment" : text, "sessionID" : sessionID };
        get_previous_iternery_info_segment = false;
    }
    else
    {
        var dataPre = { "text" : text, "sessionID": sessionID };
    }
    
    var data = JSON.stringify(dataPre);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if(this.status >= 500) 
        {
            $("#botError").modal({ backdrop: 'static', keyboard: false });
            document.getElementById("error_message").innerHTML = "Internal Server Error! Please try again later.";
            hideThings();
        }
        if (this.readyState == 4 && this.status == 200) 
        {

            //Enabling Functionality
            enableFunctionality();

            var loader = document.getElementById("loading-img-2");
            if(loader){ loader.remove(); }
            var respObj = JSON.parse(this.responseText);

            if(respObj.status != 404)
            {
                if(respObj.current_module)
                {
                    if(respObj.current_module != null)
                    {
                        appendLeftPannel(respObj.current_module, respObj.id); 
                    }
                }

                //Checking if there is any request for DB or API call
                if(respObj.context)
                {
                    var requestType = respObj.contextType;

                    if(requestType === "QueryDB")
                    {
                        if(respObj.context === "getPreviousBooking")
                        {
                            queryDB(respObj.context, respObj.userID);
                        }

                        if(respObj.context === "GetAirportDetails")
                        {
                            select_country = true;
                            queryDB(respObj.context, respObj.userID);
                        }

                        if(respObj.context === "getTripPurposes")
                        {
                            queryDB(respObj.context, respObj.params);
                        }

                        if(respObj.context === "checkPreviousFlights")
                        {
                            queryDB(respObj.context, respObj.params);
                        }

                        if(respObj.context === "getConcTravelers")
                        {
                            queryDB(respObj.context, respObj.params);
                        }
                    }

                    if(requestType === "QueryAPI")
                    {
                        if(respObj.context === "getFlightDetails")
                        {
                            queryAPI(respObj.context, respObj.contextParams);
                        }

                        if(respObj.context === "getRentalCarDetails")
                        {
                            queryAPI(respObj.context, respObj.contextParams);
                        }

                        if(respObj.context === "getTownCarDetails")
                        {
                            queryAPI(respObj.context, respObj.contextParams);
                        }

                        if(respObj.context == "getForInputFeilds")
                        {
                            verifyTravelerInfo(respObj.contextParams);
                        }

                        if(respObj.context === "editTravelerInfo")
                        {
                            editTravelerInfo(null, respObj.contextParams);
                        }

                        if(respObj.context === "getFlightReservationForm")
                        {
                            queryAPI(respObj.context, respObj.contextParams);
                        }

                        if(respObj.context === "getHotelDetails")
                        {
                            queryAPI(respObj.context, respObj.contextParams);
                        }

                        if(respObj.context === "getReservationTypesDetails")
                        {
                            getReservationTypesDetailsForm();
                        }

                        if(respObj.context === "getReservationTypesAltDetails")
                        {
                            var travelerID = respObj.travelerID;
                            
                            if(travelerID == 0)
                            {
                                alert("No traveler id fourd");
                            }
                            else
                            {
                                getPreviousReservationDetails(travelerID);
                            } 
                        }

                        if(respObj.context === "repeatPreviousReservation")
                        {
                            var requestParams = respObj.requestParams;
                            repeatPreviousReservation(requestParams);
                        }
                    }

                    if(requestType === "PreviousReservation")
                    {
                        previousReservationUpdation(respObj.context, respObj.contextParams, "initialize");
                    }

                    if(requestType === "QueryLocal")
                    {
                        queryLOCAL(respObj.context, respObj.contextParams);
                    }
                }

                if(respObj.checkUserRole)
                {
                    var UserID = respObj.UserID;
                    checkUserRoles(UserID);
                }

                if(respObj.auto_previous_reservation)
                {
                    var travelerID = respObj.travelerID;
                    var newDate = respObj.newDate;
                    var returnDate = respObj.returnDate;
                    auto_previous_reservation(travelerID, newDate, returnDate);
                }

                if(respObj.editobjfunctionality && respObj.editobjfunctionality2 != "false")
                {
                    (async ()=>{
                        await editobjfunctionality_(respObj);
                    })();
                }
                
                if(respObj.travelerInfo)
                {
                    travelerInfo = true;
                }

                if(respObj.new_trip_dep_date)
                {
                    departure_date_range = respObj.new_trip_dep_date;
                }

                if(respObj.new_trip_return_date)
                {
                    return_date_range = respObj.new_trip_return_date;
                }

                if(respObj.city_name_result)
                {
                    city_name_result = true;
                }

                if(respObj.getting_traveler_most_frequent_city)
                {
                    getting_traveler_most_frequent_city = true;
                }

                if(respObj.get_previous_iternery_info_segment)
                {
                    get_previous_iternery_info_segment = true;
                }

                //checking if hotel name is required
                if(respObj.hotelName)
                {
                    //Hotel Name
                    hotelName = true;
                }

                if(respObj.cloneReservation)
                {
                    // Clone reservation
                    cloneReservation();
                }

                if(respObj.specialRequest)
                {
                    //If user need to provide the special request
                    specialRequest = true;
                }

                if(respObj.FinalEnsuring)
                {
                    //Final ensuring of the details
                    //ensureDetails();
                    
                    //PreviousReservationAvailiblity();
                    saveReservationData(respObj.editobjfunctionality2,respObj.traveler_id);

                }

                if(respObj.EnsureDetails)
                {
                    var EnsuringModeObj = respObj.EnsuringModeObj;
                    ensureDetailDiv(EnsuringModeObj);
                }

                if(respObj.CloseChat)
                {
                    if(respObj.CloseChat === "CloseChat")
                    {
                        chat_close();
                    }
                }

                //checking if pick-up address id required
                if(respObj.getPickUpAddress)
                {
                    //Will get the address from the user input
                    getPickUpAddress = true;
                }

                //checking if drop off address is required
                if(respObj.getDropOffAddress)
                {
                    //getting the drop off address from the user input and pass it as context varibale to the IBM watson assistant
                    getDropOffAddress = true;
                }

                //Checking the required datatype
                if(respObj.requiredData)
                {
                    

                    requiredDataType = respObj.requiredData;
                }

                if(respObj.response === "multiple")
                {
                    var responsesArray = respObj.arrayObjs;
                    var responseCount = (responsesArray).length;

                    for(var j = 0; j < responseCount; j++)
                    {
                        resposeObj = responsesArray[j];
                        
                        //Evaluating response type
                        resposeObj.responseType === "option" ? respType = "option" : respType = "text";

                        if(respType === "text")
                        {
                            var textToSHow = `<div class='msg-row'><div class='user-msg receive'><div class='avator-icon'><img src='/images/avatar-img-01.png'></div><p>${resposeObj.title}</p></div></div>`;
                        }

                        if(respType === "option")
                        {

                            //making log file
                            //makeLog(resposeObj.title,"Bot",null, null);
                            
                            resOptionLength = (resposeObj.options).length;

                            if(resOptionLength <= 2)
                            {
                                if(resposeObj.title)
                                {
                                    var textToSHow = `<div class='msg-row'><div class='user-msg receive'><div class='avator-icon'><img src='/images/avatar-img-01.png'></div><p>${resposeObj.title}</p></div><p><div class='msg-row select'>`;

                                    for(var i= 0; i < resOptionLength; i++)
                                    {   
                                        let option  = [];
                                        current_selection_option.push(resposeObj.options[i].optionValue);
                                        option[i]   = 'message("'+resposeObj.options[i].optionValue+'"); disableButtons();';
                                        textToSHow += "<button type='button' class='btn btn-default disableIt' onclick='"+option[i]+"'> "+resposeObj.options[i].optionLabel+"</button>";
                                        textToSHow += " ";
                                    }
                                    textToSHow += "</div></p></div>";
                                }
                                else
                                {
                                    var textToSHow = `<p><div class='msg-row select'>`;

                                    for(var i= 0; i < resOptionLength; i++)
                                    {   
                                        let option  = [];
                                        option[i]   = 'message("'+resposeObj.options[i].optionValue+'"); disableButtons();';
                                        current_selection_option.push(resposeObj.options[i].optionValue);
                                        textToSHow += "<button type='button' class='btn btn-default disableIt' onclick='"+option[i]+"'> "+resposeObj.options[i].optionLabel+"</button>";
                                        textToSHow += " ";
                                    }
                                    textToSHow += "</div></p>";
                                }
                            }
                            else
                            {
                                var textToSHow = `<div class='msg-row'><div class='user-msg receive'><div class='avator-icon'><img src='/images/avatar-img-01.png'></div><p>${resposeObj.title}</p></div></div><p>`;  
                                    textToSHow += "<div class='msg-row select'><select class='selectOptions disableIt' onchange='message(this.value); disableButtons()'>";
                                    textToSHow += "<option> Please Select One </option>";
                                for(var i= 0; i < resOptionLength; i++)
                                {   
                                    textToSHow += '<option value="'+resposeObj.options[i].optionValue+'">'+resposeObj.options[i].optionLabel+'</option>'; 
                                    current_selection_option.push(resposeObj.options[i].optionValue);
                                }
                                textToSHow += "</select></div>";
                            }
                        }
                        appendChatData(textToSHow);
                    }
                }
                else 
                {
                    //Evaluating response type
                    respObj.responseType === "option" ? respType = "option" : respType = "text";

                    if(respType === "text")
                    {
                        var textToSHow = `<div class='msg-row'><div class='user-msg receive'><div class='avator-icon'><img src='/images/avatar-img-01.png'></div><p>${respObj.title}</p></div></div>`;
                        
                        //making log file
                        //makeLog(respObj.title,"Bot",null,null);
                    }

                    if(respType === "option")
                    {
                        //making log file
                        //makeLog(respObj.title,"Bot",null,null);

                        //Evaluating Number of Options
                        resOptionLength = (respObj.options).length;

                        if(resOptionLength <= 2)
                        {
                            var textToSHow = `<div class='msg-row'><div class='user-msg receive'><div class='avator-icon'><img src='/images/avatar-img-01.png'></div><p>${respObj.title}</p></div><p><div class='msg-row select'>`;
                            for(var i= 0; i < resOptionLength; i++)
                            {   
                                let option  = [];
                                current_selection_option.push(respObj.options[i].optionValue);
                                option[i]   = 'message("'+respObj.options[i].optionValue+'"); disableButtons();';
                                textToSHow += "<button type='button' class='btn btn-default disableIt' onclick='"+option[i]+"'> "+respObj.options[i].optionLabel+"</button>";
                                textToSHow += " ";
                            }
                            textToSHow += "</div></p></div>";   
                        }
                        else
                        {
                            var textToSHow = `<div class='msg-row'><div class='user-msg receive'><div class='avator-icon'><img src='/images/avatar-img-01.png'></div><p>${respObj.title}</p></div><p>`;
                                textToSHow += "<div class='msg-row select'><select class='selectOptions disableIt' onchange='message(this.value); disableButtons();'>";
                                textToSHow += "<option> Please Select One </option>";
                            for(var i= 0; i < resOptionLength; i++)
                            {   
                                textToSHow += '<option value="'+respObj.options[i].optionValue+'">'+respObj.options[i].optionLabel+'</option>'; 
                                current_selection_option.push(respObj.options[i].optionValue);
                            }
                            textToSHow += "</select></div></p></div>";
                        }
                    }
                    appendChatData(textToSHow);
                }

                if(respObj.FlightEnsure)
                {
                    var flightDetails = respObj.FlightEnsureDetails;
                    ensureFlightDetails(flightDetails);
                }
            }
            else
            {
                //var chatAlert = document.getElementById("chat-alert");
                //chatAlert.style.display = "block";
                //chatAlert.innerHTML = `${respObj.message}`;

                $("#botError").modal({ backdrop: 'static', keyboard: false });
                document.getElementById("error_message").innerHTML = `${respObj.message}`;
                hideThings();
            }
        }
    }
    
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

async function editobjfunctionality_(obj)
{
    if(obj.editing == "flight")
    {
        await editobjfunctionality_flight(obj)
    }
    if(obj.editing == "hotel")
    {
        editobjfunctionality_hotel(obj);
    }
    if(obj.editing == "rentalcar")
    {
        editobjfunctionality_car(obj);
    }
}

async function editobjfunctionality_flight(obj)
{
        if(obj.edit_type == "datetime")
        {
                if(obj.flightType == "oneway")
                {
                    if(obj.flight_date_type == "departure")
                    {
                        var data_pre = {   dep_date : obj.dep_date,
                                            dep_time : obj.dep_time,
                                            type : "onewayDeparture",
                                            hotel_diff : obj.hotel_diff,
                                            rental_diff : obj.rental_diff,
                                            iternary : obj.div_id.substring(0, obj.div_id.length - 1),
                                            id_number :  obj.div_id.charAt(obj.div_id.length-1)
                                        }
                        await _GSPreviousreservation_obj(data_pre,(output)=>{    
                            if(output.check == "onewayDeparture")
                            {
                                
                                $("#"+obj.div_id+"_one_d_time").html(moment.utc(output.obj[0].FlightDepartureDate).format('LT'));
                                $("#"+obj.div_id+"one_0_dep").html( moment.utc(output.obj[0].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(output.obj[0].FlightDepartureDate).format('ll'));
    
                                $("#"+obj.div_id+"_one_a_time").html(moment.utc(output.obj[0].FlightDepartureDate).format('LT'));
                                $("#"+obj.div_id+"one_0_arr").html( moment.utc(output.obj[0].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(output.obj[0].FlightDepartureDate).format('ll'));

                                if(output.car_updated == "true")
                                {
                                    $('#rentalCarDetails'+obj.div_id.charAt(obj.div_id.length-1)+'_pickup').html(moment.utc(output.PickupDateTime).format('llll').split(' ')[0]+' '+moment.utc(output.PickupDateTime).format('ll'));
                                    $('#rentalCarDetails'+obj.div_id.charAt(obj.div_id.length-1)+'_dropoff').html(moment.utc(output.DropoffDateTime).format('llll').split(' ')[0]+' '+moment.utc(output.DropoffDateTime).format('ll'));
                                }
                                if(output.hotel_updated == "true")
                                {
                                    $('#hotelDetails'+obj.div_id.charAt(obj.div_id.length-1)+'_checkin').html(moment.utc(output.HotelCheckIn).format('llll').split(' ')[0]+' '+moment.utc(output.HotelCheckIn).format('ll'));
                                    $('#hotelDetails'+obj.div_id.charAt(obj.div_id.length-1)+'_checkout').html(moment.utc(output.HotelCheckOut).format('llll').split(' ')[0]+' '+moment.utc(output.HotelCheckOut).format('ll'));
                                    
                                }
                            }
                        });
                    }
                }
                if(obj.flightType == "round")
                {
                    if(obj.flight_date_type == "departure")
                    {
                        var data_pre = 
                        {   dep_date : obj.dep_date,
                            dep_time : obj.dep_time,
                            type : "rounddeparture",
                            hotel_diff : obj.hotel_diff,
                            rental_diff : obj.rental_diff,
                            iternary : obj.div_id.substring(0, obj.div_id.length - 1),
                            id_number :  obj.div_id.charAt(obj.div_id.length-1),
                        }
                        let result = await _GSPreviousreservation_obj(data_pre,(output)=>{
                            if(output.check == "rounddeparture")
                            {
                                
                                $("#"+obj.div_id+"_round1_d_time").html(moment.utc(output.obj[0].FlightDepartureDate).format('LT'));
                                $("#"+obj.div_id+"_round1_a_time").html(moment.utc(output.obj[0].FlightDepartureDate).format('LT'));

                                $("#"+obj.div_id+"_0_dep").html( moment.utc(output.obj[0].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(output.obj[0].FlightDepartureDate).format('ll'));
                                $("#"+obj.div_id+"_0_arr").html( moment.utc(output.obj[0].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(output.obj[0].FlightDepartureDate).format('ll'));
    
                                if(output.car_updated == "true")
                                {
                                    $('#rentalCarDetails'+obj.div_id.charAt(obj.div_id.length-1)+'_pickup').html(moment.utc(output.PickupDateTime).format('llll').split(' ')[0]+' '+moment.utc(output.PickupDateTime).format('ll'));
                                    $('#rentalCarDetails'+obj.div_id.charAt(obj.div_id.length-1)+'_dropoff').html(moment.utc(output.DropoffDateTime).format('llll').split(' ')[0]+' '+moment.utc(output.DropoffDateTime).format('ll'));
                                    
                                }
                                if(output.hotel_updated == "true")
                                {
                                    $('#hotelDetails'+obj.div_id.charAt(obj.div_id.length-1)+'_checkin').html(moment.utc(output.HotelCheckIn).format('llll').split(' ')[0]+' '+moment.utc(output.HotelCheckIn).format('ll'));
                                    $('#hotelDetails'+obj.div_id.charAt(obj.div_id.length-1)+'_checkout').html(moment.utc(output.HotelCheckOut).format('llll').split(' ')[0]+' '+moment.utc(output.HotelCheckOut).format('ll'));
                                    
                                }
                            }
                        });
                    }
                    if(obj.flight_date_type == "return")
                    {
                        var data_pre = 
                        {   return_date : obj.return_date,
                            return_time : obj.return_time,
                            type : "roundReturn",
                            hotel_diff : obj.hotel_diff,
                            rental_diff : obj.rental_diff,
                            iternary : obj.div_id.substring(0, obj.div_id.length - 1),
                            id_number :  obj.div_id.charAt(obj.div_id.length-1),
                        }
                        let result = await _GSPreviousreservation_obj(data_pre,(output)=>{
                            if(output.check == "roundReturn")
                            {
                                
                                $("#"+obj.div_id+"_round2_d_time").html(moment.utc(output.obj[1].FlightDepartureDate).format('LT'));
                                $("#"+obj.div_id+"_round2_a_time").html(moment.utc(output.obj[1].FlightDepartureDate).format('LT'));

                                $("#"+obj.div_id+"_1_dep").html( moment.utc(output.obj[1].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(output.obj[1].FlightDepartureDate).format('ll'));
                                $("#"+obj.div_id+"_1_arr").html( moment.utc(output.obj[1].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(output.obj[1].FlightDepartureDate).format('ll'));
                                if(output.car_updated == "true")
                                {
                                    $('#rentalCarDetails'+obj.div_id.charAt(obj.div_id.length-1)+'_dropoff').html(moment.utc(output.DropoffDateTime).format('llll').split(' ')[0]+' '+moment.utc(output.DropoffDateTime).format('ll'));
                                }
                                if(output.hotel_updated == "true")
                                {
                                    $('#hotelDetails'+obj.div_id.charAt(obj.div_id.length-1)+'_checkout').html(moment.utc(output.HotelCheckOut).format('llll').split(' ')[0]+' '+moment.utc(output.HotelCheckOut).format('ll'));
                                }
                            }
                        });
                    }
                    if(obj.flight_date_type == "flighttriprange")
                    {
                        var data_pre = 
                        {   
                            dep_date : obj.dep_date,
                            dep_time : obj.dep_time,
                            return_date : obj.return_date,
                            return_time : obj.return_time,
                            type : "flighttriprange",
                            hotel_diff : obj.hotel_diff,
                            rental_diff : obj.rental_diff,
                            iternary : obj.div_id.substring(0, obj.div_id.length - 1),
                            id_number :  obj.div_id.charAt(obj.div_id.length-1),
                        }
                        let result = await _GSPreviousreservation_obj(data_pre,(output)=>{
                            if(output.check == "flighttriprange")
                            {
                                
                                $("#"+obj.div_id+"_round1_d_time").html(moment.utc(output.obj[0].FlightDepartureDate).format('LT'));
                                $("#"+obj.div_id+"_round1_a_time").html(moment.utc(output.obj[0].FlightDepartureDate).format('LT'));

                                $("#"+obj.div_id+"_0_dep").html( moment.utc(output.obj[0].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(output.obj[0].FlightDepartureDate).format('ll'));
                                $("#"+obj.div_id+"_0_arr").html( moment.utc(output.obj[0].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(output.obj[0].FlightDepartureDate).format('ll'));
                               
                                $("#"+obj.div_id+"_round2_d_time").html(moment.utc(output.obj[1].FlightDepartureDate).format('LT'));
                                $("#"+obj.div_id+"_round2_a_time").html(moment.utc(output.obj[1].FlightDepartureDate).format('LT'));

                                $("#"+obj.div_id+"_1_dep").html( moment.utc(output.obj[1].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(output.obj[1].FlightDepartureDate).format('ll'));
                                $("#"+obj.div_id+"_1_arr").html( moment.utc(output.obj[1].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(output.obj[1].FlightDepartureDate).format('ll'));
                                if(output.car_updated == "true")
                                {
                                    $('#rentalCarDetails'+obj.div_id.charAt(obj.div_id.length-1)+'_pickup').html(moment.utc(output.PickupDateTime).format('llll').split(' ')[0]+' '+moment.utc(output.PickupDateTime).format('ll'));
                                    $('#rentalCarDetails'+obj.div_id.charAt(obj.div_id.length-1)+'_dropoff').html(moment.utc(output.DropoffDateTime).format('llll').split(' ')[0]+' '+moment.utc(output.DropoffDateTime).format('ll'));
                                }
                                if(output.hotel_updated == "true")
                                {
                                    $('#hotelDetails'+obj.div_id.charAt(obj.div_id.length-1)+'_checkin').html(moment.utc(output.HotelCheckIn).format('llll').split(' ')[0]+' '+moment.utc(output.HotelCheckIn).format('ll'));
                                    $('#hotelDetails'+obj.div_id.charAt(obj.div_id.length-1)+'_checkout').html(moment.utc(output.HotelCheckOut).format('llll').split(' ')[0]+' '+moment.utc(output.HotelCheckOut).format('ll'));
                                }
                            }
                        });
                    }
                }
        
        }
    
}

async function editobjfunctionality_hotel(obj)
{
    if(obj.edit_type == "datetime")
    {
        if(obj.hotel_date_type == "check-in")
        {
            var data_pre = {   chek_in_date : obj.chek_in_date,
                                type : "hotel_check_in",
                                iternary : obj.div_id.substring(0, obj.div_id.length - 1),
                                id_number :  obj.div_id.charAt(obj.div_id.length-1)
                            }
        
            await _GSPreviousreservation_obj(data_pre,(output)=>{
                if(output.check == "hotel_check_in")
                {
                    $('#'+obj.div_id+'_checkin').html(moment.utc(output.obj[0][0].HotelCheckIn).format('llll').split(' ')[0]+' '+moment.utc(output.obj[0][0].HotelCheckIn).format('ll'));
                }
                
            });
        }
        if(obj.hotel_date_type == "check-out")
        {
            var data_pre = {   chek_out_date : obj.chek_out_date,
                                type : "hotel_check_out",
                                iternary : obj.div_id.substring(0, obj.div_id.length - 1),
                                id_number :  obj.div_id.charAt(obj.div_id.length-1)
                            }
        
            await _GSPreviousreservation_obj(data_pre,(output)=>{
                if(output.check == "hotel_check_out")
                {
                    
                    $('#'+obj.div_id+'_checkout').html(moment.utc(output.obj[0][0].HotelCheckOut).format('llll').split(' ')[0]+' '+moment.utc(output.obj[0][0].HotelCheckOut).format('ll'));
                }
                
            });
        }
        if(obj.hotel_date_type == "hotel_date_range")
        {
            var data_pre = {   
                                chek_in_date : obj.chek_in_date,
                                chek_out_date : obj.chek_out_date,
                                type : "hotel_date_range",
                                iternary : obj.div_id.substring(0, obj.div_id.length - 1),
                                id_number :  obj.div_id.charAt(obj.div_id.length-1)
                            }
        
            await _GSPreviousreservation_obj(data_pre,(output)=>{
                if(output.check == "hotel_date_range")
                {
                    
                    $('#'+obj.div_id+'_checkin').html(moment.utc(output.obj[0][0].HotelCheckIn).format('llll').split(' ')[0]+' '+moment.utc(output.obj[0][0].HotelCheckIn).format('ll'));
                    $('#'+obj.div_id+'_checkout').html(moment.utc(output.obj[0][0].HotelCheckOut).format('llll').split(' ')[0]+' '+moment.utc(output.obj[0][0].HotelCheckOut).format('ll'));
                }
                
            });
        }
    }
    
}

async function editobjfunctionality_car(obj)
{
    
    if(obj.edit_type == "datetime")
    {
        if(obj.rentalcar_date_type == "pick-up")
        {
            var data_pre = {    car_pickup_date : obj.car_pickup_date,
                                car_pickup_time : obj.car_pickup_time,
                                type : "rental_car_pickup",
                                iternary : obj.div_id.substring(0, obj.div_id.length - 1),
                                id_number :  obj.div_id.charAt(obj.div_id.length-1)
                            }
        
            await _GSPreviousreservation_obj(data_pre,(output)=>{
                if(output.check == "rental_car_pickup")
                {
                    $('#'+obj.div_id+'_pickup').html(moment.utc(output.obj[0][0].PickupDateTime).format('llll').split(' ')[0]+' '+moment.utc(output.obj[0][0].PickupDateTime).format('ll'));
                }
                
            });
        }
        if(obj.rentalcar_date_type == "drop-off")
        {
            var data_pre = {    car_dropoff_date : obj.car_dropoff_date,
                                car_dropof_time : obj.car_dropof_time,
                                type : "rental_car_dropoff",
                                iternary : obj.div_id.substring(0, obj.div_id.length - 1),
                                id_number :  obj.div_id.charAt(obj.div_id.length-1)
                            }
        
            await _GSPreviousreservation_obj(data_pre,(output)=>{
                if(output.check == "rental_car_dropoff")
                {
                    $('#'+obj.div_id+'_dropoff').html(moment.utc(output.obj[0][0].DropoffDateTime).format('llll').split(' ')[0]+' '+moment.utc(output.obj[0][0].DropoffDateTime).format('ll'));
                }
                
            });
        }
        if(obj.rentalcar_date_type == "rental_car_date_range")
        {
            var data_pre = {    
                                car_pickup_date : obj.car_pickup_date,
                                car_pickup_time : obj.car_pickup_time,
                                car_dropoff_date : obj.car_dropoff_date,
                                car_dropof_time : obj.car_dropof_time,
                                type : "rental_car_date_range",
                                iternary : obj.div_id.substring(0, obj.div_id.length - 1),
                                id_number :  obj.div_id.charAt(obj.div_id.length-1)
                            }
        
            await _GSPreviousreservation_obj(data_pre,(output)=>{
                if(output.check == "rental_car_date_range")
                {
                    $('#'+obj.div_id+'_pickup').html(moment.utc(output.obj[0][0].PickupDateTime).format('llll').split(' ')[0]+' '+moment.utc(output.obj[0][0].PickupDateTime).format('ll'));
                    $('#'+obj.div_id+'_dropoff').html(moment.utc(output.obj[0][0].DropoffDateTime).format('llll').split(' ')[0]+' '+moment.utc(output.obj[0][0].DropoffDateTime).format('ll'));
                }
                
            });
        }
    }

}

async function _GSPreviousreservation_obj(data_pre,callback)
{
    var resourceURL = `${baseIP}/api/previousData/editPreviousReservationObjectSection`;
    var data = JSON.stringify(data_pre);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.status == 200) 
        {
            callback(JSON.parse(this.response));
        }
    }
    xmlhttp.open("POST", resourceURL, false);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

async function stopEditing(id)
{
    $('#'+id).removeClass('editable');
    $('#'+id).removeClass('clickable-icons');
    $('#'+id).removeClass('cst-edit');
    $('.booknowcls').attr('disabled',false);
    $('.makenewcls').attr('disabled',false);
    $('.edit_drop').css('pointer-events','');
    $('.edit_drop').attr('disabled',false);
    message('stop_');
}

function chat_close()
{

    var resourceURL = `${baseIP}/api/save/getPNRDetails`;

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {
            var response = JSON.parse(this.response);
            if(response.success)
            {
                $("#chatEnd").modal({ backdrop: 'static', keyboard: false });
                document.getElementById("chat_close_message").innerHTML = response.text;
                clearInterval(intervalVar);
                resetTimer();
                hideThings();
            }
            else
            {
                $("#chatEnd").modal({ backdrop: 'static', keyboard: false });
                document.getElementById("chat_close_message").innerHTML = `<p> That's it. Wasn't that easy. </p><p> You will shortly receive a confirmation message regarding the reservations. </p> <p> Hoping to see you again. </p> <p> Have a safe journey. </p>`;
                clearInterval(intervalVar);
                resetTimer();
                hideThings();
            }
        }
    }
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send();  
}

function PreviousReservationAvailiblity(id)
{
    var resourceURL = `${baseIP}/api/previousData/getAllPreviousIternaries`;
  
    // var divid = $('#ti'+id).val();
    id = id.toString();
    var id_number =  id.charAt(id.length-1);
    var data = JSON.stringify({id_number : id_number});
        
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {
            GSPRavailibilty = {
                'item':this.response,
                'obj':{
                    id_number : id_number
                }
            }
            
        }
    }
    xmlhttp.open("POST", resourceURL, false);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);

    var iternary = JSON.parse(GSPRavailibilty['item']);
    if(iternary.iternery.flight_details != undefined && iternary.iternery.flight_details != "" && iternary.iternery.flight_details != null && (iternary.iternery.flight_details[0].deleted == undefined || iternary.iternery.flight_details[0].deleted == 0))
    {
        validatefilghtavailability(iternary.iternery.flight_details,GSPRavailibilty.obj);
    }
    else if(iternary.iternery.hotelDetails != undefined && iternary.iternery.hotelDetails != "" && iternary.iternery.hotelDetails != null && (iternary.iternery.hotelDetails[0][0].deleted == undefined || iternary.iternery.hotelDetails[0][0].deleted == 0))
    {
        validatehotelavailability(iternary.iternery.hotelDetails,GSPRavailibilty.obj);
    }
    else if(iternary.iternery.rentalCarDetails != undefined && iternary.iternery.rentalCarDetails != "" && iternary.iternery.rentalCarDetails != null && (iternary.iternery.rentalCarDetails[0][0].deleted == undefined || iternary.iternery.rentalCarDetails[0][0].deleted == 0))
    {
        validatecaravailability(iternary.iternery.rentalCarDetails,GSPRavailibilty.obj);
    }
    else
    {
        message("yes");
    }
}

function validatefilghtavailability(item, obj)
{
    showCallLoader();
    var resourceURL = `${baseIP}/api/sabre/lowFlightSearchBFM`;

    (async()=>
    {
        await translateFromClinetSide(`Searching for flight availability.`, (dialog)=>{
            $("#msg-body").append(`
            <div class="msg-row" style=""><div class="user-msg receive"><div class="avator-icon">
            <img src="/images/avatar-img-01.png"></div>
            <p>${dialog}</p></div></div>`);
        });
    })();
    
    var tript_type = item.length == 1 ? "oneway": "roundtrip";

    if(tript_type == "roundtrip")
    {
        var flight_dept_time            =   ( item[0]?.FlightDepartureDate ) ? item[0].FlightDepartureDate.split(' ')[1] : "00:00:00";
        var flight_dept_arrival_time    =   ( item[0]?.FlightArrivalDate ) ? item[0].FlightArrivalDate.split(' ')[1] : "00:00:00";
        var flight_return_dept_time     =   ( item[1]?.FlightDepartureDate ) ? item[1].FlightDepartureDate.split(' ')[1] : "00:00:00";
        var flight_return_arrival_time  =   ( item[1]?.FlightArrivalDate ) ?  item[1].FlightArrivalDate.split(' ')[1] : "00:00:00";

        var datapre = 
        {
            flightType              :   tript_type,
            departureOrigin         :   item[0].origin,
            departureDestination    :   item[0].destinat,
            returnOrigin            :   item[1].origin,
            returnDestination       :   item[1].destinat,
            departureDate           :   item[0].FlightDepartureDate.split(' ')[0],
            departureTime           :   flight_dept_time,
            departure_arrivalTime   :   flight_dept_arrival_time,
            returnDate              :   item[1].FlightDepartureDate.split(' ')[0],
            returnTime              :   flight_return_dept_time,
            return_arrivalTime      :   flight_return_arrival_time,
            seats                   :   1,
            invoke_source           :   "availability",
            div_id                  :   "flight_details"+obj.id_number,
            action                  :   "getFlightDetails",
            flight_carrier          :   item[0].airline_code,
            flight_carrier2         :   item[1].airline_code,
            flight_carrier_name     :   item[0].airline_name,
            pnrObj                  :   item[0].pnrObj,
            flight_class_dep        :   item[0].class,
            flight_class_ret        :   item[1].class
        };      
    }
    else
    {

        var flight_dept_time            =   ( item[0]?.FlightDepartureDate ) ?  item[0].FlightDepartureDate.split(' ')[1] : "00:00:00";
        var flight_dept_arrival_time    =   ( item[0]?.FlightArrivalDate ) ? item[0].FlightArrivalDate.split(' ')[1] : "00:00:00";

        var datapre = 
        {
            flightType          :   "oneway",
            departure           :   item[0].origin,
            destination         :   item[0].destinat,
            date                :   item[0].FlightDepartureDate.split(' ')[0],
            time                :   flight_dept_time,
            arrivalTime         :   flight_dept_arrival_time,
            numOfSeats          :   1,
            invoke_source       :   "availability",
            div_id              :   "flight_details"+obj.id_number,
            action              :   "getFlightDetails",
            flight_carrier      :   item[0].airline_code,
            flight_carrier_name :   item[0].airline_name,
            pnrObj              :   item[0].pnrObj,
            flight_class        :   item[0].class
        };
    }
  
    var data = JSON.stringify(datapre);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {
            var respObj =  JSON.parse(this.response);
            if(this.status != 404)
            {
                if(respObj.preselected == "success")
                {
                    if(respObj.pnrobje_validation == false)
                    {
                        
                        (async()=>
                        {
                            await translateFromClinetSide(`Filght reservation has been completed.`,(dialog)=>{
                                $("#msg-body").append(`
                                <div class="msg-row" style=""><div class="user-msg receive"><div class="avator-icon">
                                <img src="/images/avatar-img-01.png"></div>
                                <p>${dialog}</p></div></div>`)
                            });
                        })();
                        hideCallLoader();
                        (async ()=>{
                            await updateDates_(respObj.flight_details.flightScheduleData,respObj.div_id,"N/A",respObj.flight_details,false)
                        })();
                        var iternary = JSON.parse(GSPRavailibilty['item']);
                        if(iternary.iternery.hotelDetails != undefined && iternary.iternery.hotelDetails != "" && iternary.iternery.hotelDetails != null && (iternary.iternery.hotelDetails[0][0].deleted == undefined || iternary.iternery.hotelDetails[0][0].deleted == 0))
                        {
                            validatehotelavailability(iternary.iternery.hotelDetails,GSPRavailibilty.obj);
                        }
                        else if(iternary.iternery.rentalCarDetails != undefined && iternary.iternery.rentalCarDetails != "" && iternary.iternery.rentalCarDetails != null && (iternary.iternery.rentalCarDetails[0][0].deleted == undefined || iternary.iternery.rentalCarDetails[0][0].deleted == 0))
                        {
                            validatecaravailability(iternary.iternery.rentalCarDetails,GSPRavailibilty.obj);
                        }
                        else
                        {
                            message("yes");
                        }
                    }
                    if(respObj.pnrobje_validation == true)
                    {
                        (async()=>
                        {
                            await translateFromClinetSide(`Filght reservation has been completed.`,(dialog)=>{
                                $("#msg-body").append(`
                                <div class="msg-row" style=""><div class="user-msg receive"><div class="avator-icon">
                                <img src="/images/avatar-img-01.png"></div>
                                <p>${dialog}</p></div></div>`)
                            });
                        })();
                        hideCallLoader();
                        var iternary = JSON.parse(GSPRavailibilty['item']);
                        if(iternary.iternery.hotelDetails != undefined && iternary.iternery.hotelDetails != "" && iternary.iternery.hotelDetails != null && (iternary.iternery.hotelDetails[0][0].deleted == undefined || iternary.iternery.hotelDetails[0][0].deleted == 0))
                        {
                            validatehotelavailability(iternary.iternery.hotelDetails,GSPRavailibilty.obj);
                        }
                        else if(iternary.iternery.rentalCarDetails != undefined && iternary.iternery.rentalCarDetails != "" && iternary.iternery.rentalCarDetails != null && (iternary.iternery.rentalCarDetails[0][0].deleted == undefined || iternary.iternery.rentalCarDetails[0][0].deleted == 0))
                        {
                            validatecaravailability(iternary.iternery.rentalCarDetails,GSPRavailibilty.obj);
                        }
                        else
                        {
                            message("yes");
                        }
                    }
                }
                else if(respObj.resultFor === "getFlightDetails")
                {
                        if(respObj.total_empty_resonse == "found")
                        {
                            
                            (async()=>
                            {
                                await translateFromClinetSide(`Hmm, there is no availability from ${respObj.flight_carrier_name} at that time but here are some other options.`,(dialog)=>{
                                    $("#msg-body").append(`
                                    <div class="msg-row" style=""><div class="user-msg receive"><div class="avator-icon">
                                    <img src="/images/avatar-img-01.png"></div>
                                    <p>${dialog}</p></div></div>`)
                                });
                            })();
                            requiredDataType = "Select";
                            //var textToShow = respObj.textToShow;
                            var textToShow = (respObj.result_array.length > 0) ? showFiltersToResponse(respObj.result_array, respObj.invoke_source, respObj.div_id) : respObj.textToShow;
                            appendChatData(textToShow);
                            hideCallLoader(); 
                        }
                        else if(respObj.total_empty_resonse == "empty")
                        {
                            requiredDataType = "Select";
                            var textToShow = respObj.textToShow;
                            appendChatData(textToShow);
                            hideCallLoader();

                        }
                }
            }
        }
    }
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

async function noflightavailable(type)
{
    if(type=="y_mknew")
    {
        message("ok");
    }else
    {
        await message("no");
        $('.booknowcls').attr('disabled',false);
        $('.makenewcls').attr('disabled',false);
    }
}

async function noAvailaablehotelfound(type)
{
    if(type=="y_mknew")
    {
        message("ok");
    }else
    {
      await message("no");
        $('.booknowcls').attr('disabled',false);
        $('.makenewcls').attr('disabled',false);
    }
}

function available_selected_flight(obj,divid,flightID,full_obj)
{
                    (async()=>{
                        updateDates_(obj,divid,flightID,full_obj)
                    })();
                    (async()=>
                    {
                        await translateFromClinetSide(`Filght reservation has been completed.`,(dialog)=>{
                            $("#msg-body").append(`
                            <div class="msg-row" style=""><div class="user-msg receive"><div class="avator-icon">
                            <img src="/images/avatar-img-01.png"></div>
                            <p>${dialog}</p></div></div>`)
                        });
                    })();
        var iternary = JSON.parse(GSPRavailibilty['item']);
        if(iternary.iternery.hotelDetails != undefined && iternary.iternery.hotelDetails != "" && iternary.iternery.hotelDetails != null && (iternary.iternery.hotelDetails[0][0].deleted == undefined || iternary.iternery.hotelDetails[0][0].deleted == 0))
        {
            validatehotelavailability(iternary.iternery.hotelDetails,GSPRavailibilty.obj);
        }
        else if(iternary.iternery.rentalCarDetails != undefined && iternary.iternery.rentalCarDetails != "" && iternary.iternery.rentalCarDetails != null && (iternary.iternery.rentalCarDetails[0][0].deleted == undefined || iternary.iternery.rentalCarDetails[0][0].deleted == 0))
        {
            validatecaravailability(iternary.iternery.rentalCarDetails,GSPRavailibilty.obj);
        }
        else
        {
            message("yes");
        }
}

function validatehotelavailability(item,obj)
{
    hideCallLoader();
    (async()=>
    {
        await translateFromClinetSide(`Searching for hotel availability.`,(dialog)=>{
            $("#msg-body").append(`
            <div class="msg-row" style=""><div class="user-msg receive"><div class="avator-icon">
            <img src="/images/avatar-img-01.png"></div>
            <p>${dialog}</p></div></div>`)
        });
    })();
    var resourceURL = `${baseIP}/api/sabre/getHotelDetails`;
    var dataPre = {
        // cityCode: 'Bedford',
        //cityCode: 'xyz',
        cityCode: item[0][0].HotelState,
        // checkInDate: obj.hotelcheck_in,
        // checkOutDate: obj.hotelcheckout,
        checkInDate: item[0][0].HotelCheckIn.indexOf('T') > -1 ? item[0][0].HotelCheckIn.split('T')[0] : item[0][0].HotelCheckIn,
        checkOutDate: item[0][0].HotelCheckOut.indexOf('T') > -1 ? item[0][0].HotelCheckOut.split('T')[0] : item[0][0].HotelCheckOut,
        invoke_source: 'availability',
        div_id: 'hotelDetails'+obj.id_number,
        // available_hotel_name :"Hilton Boston Logan Airport",
        available_hotel_name  : item[0][0].HotelName,
        available_hotel_state : item[0][0].HotelState,
        room_type :  item[0][0].roomtype,
        pnrObj : item[0][0].pnrObj
      };
    var data = JSON.stringify(dataPre);
    showCallLoader();
    keepSessionAlive();
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {
            var respObj = JSON.parse(this.responseText);
            if(respObj.preselected == "success")
            {
                if(respObj.pnrobje_validation == true)
                {
                    (async()=>
                    {
                        await translateFromClinetSide(`Hotel reservation has been completed.`,(dialog)=>{
                            $("#msg-body").append(`
                            <div class="msg-row" style=""><div class="user-msg receive"><div class="avator-icon">
                            <img src="/images/avatar-img-01.png"></div>
                            <p>${dialog}</p></div></div>`)
                        });
                    })();
                    var iternary = JSON.parse(GSPRavailibilty['item']);
                    if(iternary.iternery.rentalCarDetails != undefined && iternary.iternery.rentalCarDetails != "" && iternary.iternery.rentalCarDetails != null && (iternary.iternery.rentalCarDetails[0][0].deleted == undefined || iternary.iternery.rentalCarDetails[0][0].deleted == 0))
                    {
                        validatecaravailability(iternary.iternery.rentalCarDetails,GSPRavailibilty.obj);
                    }
                    else
                    {
                        message("yes");
                    }
                }
                if(respObj.pnrobje_validation == false)
                {
                    (async()=>
                    {
                        await translateFromClinetSide(`Hotel reservation has been completed.`,(dialog)=>{
                            $("#msg-body").append(`
                            <div class="msg-row" style=""><div class="user-msg receive"><div class="avator-icon">
                            <img src="/images/avatar-img-01.png"></div>
                            <p>${dialog}</p></div></div>`)
                        });
                    })();
                    $('#'+respObj.div_id+'_name').html(respObj.hotel_details.HotelName);
                    $('#'+respObj.div_id+'_state').html(respObj.hotel_details.city_name);
                    $('#'+respObj.div_id+'_checkin').html(moment.utc(respObj.hotel_details.check_in_date).format('llll').split(' ')[0]+' '+moment.utc(respObj.hotel_details.check_in_date).format('ll'));
                    $('#'+respObj.div_id+'_checkout').html(moment.utc(respObj.hotel_details.check_out_date).format('llll').split(' ')[0]+' '+moment.utc(respObj.hotel_details.check_out_date).format('ll'));
                    $("#"+respObj.div_id+"_totalprice").html('<strong>Total Price: '+respObj.hotel_details.room_rate+'$</strong>');
                    $("#"+respObj.div_id+"_totalprice").show();
                    hideCallLoader();
                    
                    var iternary = JSON.parse(GSPRavailibilty['item']);
                    if(iternary.iternery.rentalCarDetails != undefined && iternary.iternery.rentalCarDetails != "" && iternary.iternery.rentalCarDetails != null && (iternary.iternery.rentalCarDetails[0][0].deleted == undefined || iternary.iternery.rentalCarDetails[0][0].deleted == 0))
                    {
                        validatecaravailability(iternary.iternery.rentalCarDetails,GSPRavailibilty.obj);
                    }
                    else
                    {
                        message("yes");
                    }
                }
            }
            else if(respObj.resultFor === "getHotelDetails")
            {
                if(respObj.status == 200)
                {
                    if(respObj.total_empty_resonse != "empty")
                    {
                        (async()=>{
                            await translateFromClinetSide(`No, hotels were found according to selected details, you can select from following hotels.`,(dialog)=>{
                                $("#msg-body").append(`
                                <div class="msg-row" style=""><div class="user-msg receive"><div class="avator-icon">
                                <img src="/images/avatar-img-01.png"></div>
                                <p>${dialog}</p></div></div>`)
                            });
                        })();
                        requiredDataType = "Text";
                        var textToShow = respObj.textToShow;
                        appendChatData(textToShow);
                        hideCallLoader();
                    }
                    // requiredDataType = "Text";
                    // hotelName = true;
                    // var textToShow = respObj.textToShow;
                    // appendChatData(textToShow);
                    // //makeLog(textToShow, "bot", null, null);
                }
                else if(respObj.status == 404)
                {
                    var textToShow = respObj.message;
                    appendChatData(textToShow);
                    requiredDataType = "Text";
                    hotelName = true;
                    //makeLog(textToShow, "bot", null, null);
                }
            }
        }
    }
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

function available_selected_hotel(obj,divid)
{
    var hotelName = obj.HotelName;
    var state = obj.city_name;
    $('#'+divid+'_name').html(hotelName);
    $('#'+divid+'_state').html(state);
    $('#'+divid+'_checkin').html(moment.utc(obj.check_in_date).format('llll').split(' ')[0]+' '+moment.utc(obj.check_in_date).format('ll'));
    $('#'+divid+'_checkout').html(moment.utc(obj.check_out_date).format('llll').split(' ')[0]+' '+moment.utc(obj.check_out_date).format('ll'));
    $("#"+divid+"_totalprice").html('<strong>Total Price: '+obj.room_rate+'$</strong>');
    $("#"+divid+"_totalprice").show();
    
    (async()=>{
        await updatePreviousReservationObjectforPnr("hotel",divid,obj.booking_key);
    })();
    (async()=>{
        await translateFromClinetSide(`Hotel reservation has been completed.`,(dialog)=>{
            $("#msg-body").append(`
            <div class="msg-row" style=""><div class="user-msg receive"><div class="avator-icon">
            <img src="/images/avatar-img-01.png"></div>
            <p>${dialog}</p></div></div>`)
        });
    })();
    var iternary = JSON.parse(GSPRavailibilty['item']);
    if(iternary.iternery.rentalCarDetails != undefined && iternary.iternery.rentalCarDetails != "" && iternary.iternery.rentalCarDetails != null && (iternary.iternery.rentalCarDetails[0][0].deleted == undefined || iternary.iternery.rentalCarDetails[0][0].deleted == 0))
    {
        validatecaravailability(iternary.iternery.rentalCarDetails,GSPRavailibilty.obj);
    }
    else
    {
        message("yes");
    }
}

function validatecaravailability(item,obj)
{
    hideCallLoader();
    
    (async()=>{
        await translateFromClinetSide(`Searching for car availability.`,(dialog)=>{
            $("#msg-body").append(`
            <div class="msg-row" style=""><div class="user-msg receive"><div class="avator-icon">
            <img src="/images/avatar-img-01.png"></div>
            <p>${dialog}</p></div></div>`)
        });
    })();
    var resourceURL = `${baseIP}/api/sabre/getRentalCarDetails`;
    var dataPre = {
        drop_off_city: item[0][0].DropoffCityCode,
        drop_off_date: item[0][0].DropoffDateTime.indexOf('T') > -1 ? item[0][0].DropoffDateTime.split('T')[0] : item[0][0].DropoffDateTime.split(' ')[0],
        drop_off_time: item[0][0].DropoffDateTime.indexOf('T') > -1 ? '10:00' : item[0][0].DropoffDateTime.split(' ')[1],
        pick_up_city: item[0][0].PickupCityCode,
        pick_up_date: item[0][0].PickupDateTime.indexOf('T') > -1 ? item[0][0].PickupDateTime.split('T')[0] : item[0][0].PickupDateTime.split(' ')[0],
        pick_up_time: item[0][0].PickupDateTime.indexOf('T') > -1 ? '10:00' : item[0][0].PickupDateTime.split(' ')[1],
        div_id: 'rentalCarDetails'+obj.id_number,
        invoke_source: 'availability',
        pnrObj: item[0][0].pnrObj,
        // car_vendor: "ZE",
        // car_type :"ECAR"
        car_vendor: item[0][0].CarVendor,
        car_type : item[0][0].cartype
      }
      
      var data = JSON.stringify(dataPre);
      showCallLoader();
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() 
      {    
        if (this.readyState == 4 && this.status == 200) 
        {
            var respObj = JSON.parse(this.responseText);
            if(respObj.preselected == "success")
            {
                if(respObj.pnrobje_validation == true)
                {
                    (async()=>{
                        await translateFromClinetSide(`Car reservation has been completed.`,(dialog)=>{
                            $("#msg-body").append(`
                            <div class="msg-row" style=""><div class="user-msg receive"><div class="avator-icon">
                            <img src="/images/avatar-img-01.png"></div>
                            <p>${dialog}</p></div></div>`)
                        });
                    })();
                    hideCallLoader();
                    message("yes");
                }
                if(respObj.pnrobje_validation == false)
                {
                    (async()=>{
                        await translateFromClinetSide(`Car reservation has been completed.`,(dialog)=>{
                            $("#msg-body").append(`
                            <div class="msg-row" style=""><div class="user-msg receive"><div class="avator-icon">
                            <img src="/images/avatar-img-01.png"></div>
                            <p>${dialog}</p></div></div>`)
                        });
                    })();
                    
                    $("#"+respObj.divid+"_totalprice").html('<strong>Total Price: '+respObj.rental_car_details.approximate_total_fare+'$</strong>');
                    $("#"+respObj.divid+"_totalprice").show();
                    $('#'+respObj.divid+'_pickup').html(moment.utc(respObj.rental_car_details.pickUpDate).format('llll').split(' ')[0]+' '+moment.utc(respObj.rental_car_details.pickUpDate).format('ll'));
                    $('#'+respObj.divid+'_dropoff').html(moment.utc(respObj.rental_car_details.dropOffDate).format('llll').split(' ')[0]+' '+moment.utc(respObj.rental_car_details.dropOffDate).format('ll'));
                    $('#'+respObj.divid+'_vendor').html(respObj.rental_car_details.vendor_name);
                    hideCallLoader();
                    message("yes");
                }
            }

            else
            {
                if(respObj.status == 200)
                {
                    
                    var textToShow = respObj.textToShow;
                    
                    requiredDataType = "Text";
                    appendChatData(textToShow);
                    hideCallLoader(); 
                }
                else if(respObj.status == 404)
                {
                    message("no");
                }
            }
        }
      }
      xmlhttp.open("POST", resourceURL, true);
      xmlhttp.withCredentials = true;
      xmlhttp.credentials = "include";
      xmlhttp.setRequestHeader("Content-Type", "application/json");
      xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
      xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
      xmlhttp.send(data);
}

function available_selected_car(divid,id,obj)
{
    var checkin = obj.pickUpDate+' '+obj.pickUpTime;
    var checkout = obj.dropOffDate+' '+obj.dropOffTime;
    
    $("#"+divid+"_totalprice").html('<strong>Total Price: '+obj.approximate_total_fare+'$</strong>');
    $("#"+divid+"_totalprice").show();
    $('#'+divid+'_pickup').html(moment.utc(checkin).format('llll').split(' ')[0]+' '+moment.utc(checkin).format('ll'));
    $('#'+divid+'_dropoff').html(moment.utc(checkout).format('llll').split(' ')[0]+' '+moment.utc(checkout).format('ll'));
    $('#'+divid+'_vendor').html(obj.vendor_name);
    obj['custom_id'] = id;
    (async()=>{
        await updatePreviousReservationObjectforPnr("rentalCar",divid,obj);
    })();
    (async()=>{
        await translateFromClinetSide(`Car reservation has been completed.`,(dialog)=>{
            $("#msg-body").append(`
            <div class="msg-row" style=""><div class="user-msg receive"><div class="avator-icon">
            <img src="/images/avatar-img-01.png"></div>
            <p>${dialog}</p></div></div>`)
        });
    })();
    hideCallLoader();
    message("yes");
}

function validateEmail(email) 
{
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function temp(dataToSend, dataToShow)
{
    resetTimer();

    select_country = false;

    current_selection_option = [];

    const resourceURL =  `${baseIP}/api/watson/message`;
    var dataToShow = `<div class='msg-row'><div class='user-msg sent'><div class='avator-icon'><img src='/images/avatar-img-02.png'></div><p>${dataToShow}</p></div></div>`;
    //makeLog(dataToShow, "traveler", null, null)
    appendChatData(dataToShow);

    var dataPre = { "text" : dataToSend, "sessionID": sessionID };
    var data = JSON.stringify(dataPre);
    
    var msgLoaderImage = "<div class='loading-img' id='loading-img-2'><img src='/images/loader.gif'></div>";
    appendChatLoader(msgLoaderImage);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
         if (this.readyState == 4 && this.status == 200) 
        {
            document.getElementById("loading-img-2").remove();
            var respObj = JSON.parse(this.responseText);

            if(respObj.status != 404)
            {

                //Checking if there is any request for DB or API call
                if(respObj.context)
                {
                    var requestType = respObj.contextType;

                    if(requestType === "QueryDB")
                    {
                        if(respObj.context === "getPreviousBooking")
                        {
                            queryDB(respObj.context, respObj.userID);
                        }

                        if(respObj.context === "GetAirportDetails")
                        {
                            select_country = true;
                            queryDB(respObj.context, respObj.userID);
                        }

                        if(respObj.context === "getTripPurposes")
                        {
                            queryDB(respObj.context, respObj.params);
                        }

                        if(respObj.context === "getConcTravelers")
                        {
                            queryDB(respObj.context, respObj.params);
                        }
                    }

                    if(requestType === "QueryAPI")
                    {
                        if(respObj.context === "getFlightDetails")
                        {
                            queryAPI(respObj.context, respObj.contextParams);
                        }

                        if(respObj.context === "getRentalCarDetails")
                        {
                            queryAPI(respObj.context, respObj.contextParams);
                        }

                        if(respObj.context === "getTownCarDetails")
                        {
                            queryAPI(respObj.context, respObj.contextParams);
                        }

                        if(respObj.context == "getForInputFeilds")
                        {
                            //Here we pass the data to the dedicated function that handles the traveler info verification process
                            //As the first parameter of function is msg which is currently null
                            verifyTravelerInfo(respObj.contextParams);

                            //Here we also ensure to keep the session aive untill we get all the required info from the users.
                            //keepSessionAlive();
                        }

                        if(respObj.context === "editTravelerInfo")
                        {
                            editTravelerInfo(null, respObj.contextParams);
                        }

                        if(respObj.context === "getFlightReservationForm")
                        {
                            queryAPI(respObj.context, respObj.contextParams);
                        }

                        if(respObj.context === "getReservationTypesDetails")
                        {
                            var travelerID = respObj.travelerID;
                            
                            if(travelerID == 0)
                            {
                                alert("No traveler id fourd");
                            }
                            else
                            {
                                getPreviousReservationDetails(travelerID);
                            }
                            
                            //check previous reservation details
                            //Make a form for that
                            //and then get infromation about alteration
                        }
                    }

                    if(requestType === "PreviousReservation")
                    {
                        previousReservationUpdation(respObj.context, respObj.contextParams, "initialize");
                    }
                }

                if(respObj.checkUserRole)
                {
                    var UserID = respObj.UserID;
                    checkUserRoles(UserID);
                }

                //checking if hotel name is required
                if(respObj.hotelName)
                {
                    hotelName = true;
                }

                if(respObj.cloneReservation)
                {
                    cloneReservation();
                }

                if(respObj.specialRequest)
                {
                    specialRequest = true;
                }

                if(respObj.FinalEnsuring)
                {
                    ensureDetails();
                }

                //checking if pick-up address id required
                if(respObj.getPickUpAddress)
                {
                    //Will get the address from the user input
                    getPickUpAddress = true;
                }

                //checking if drop off address is required
                if(respObj.getDropOffAddress)
                {
                    //getting the drop off address from the user input and pass it as context varibale to the IBM watson assistant
                    getDropOffAddress = true;
                }

                //Checking the required datatype
                if(respObj.requiredData)
                {
                    requiredDataType = respObj.requiredData;
                }


                if(respObj.response === "multiple")
                {
                    var responsesArray = respObj.arrayObjs;
                    var responseCount = (responsesArray).length;

                    for(var j = 0; j < responseCount; j++)
                    {
                        resposeObj = responsesArray[j];
                        
                        //Evaluating response type
                        resposeObj.responseType === "option" ? respType = "option" : respType = "text";

                        if(respType === "text")
                        {
                            var textToSHow = `<div class='msg-row'><div class='user-msg receive'><div class='avator-icon'><img src='/images/avatar-img-01.png'></div><p>${resposeObj.title}</p></div></div>`;
                            
                            //making log file
                            //makeLog(resposeObj.title,"Bot",null, null);
                        }

                        if(respType === "option")
                        {
                            //making log file
                            //makeLog(resposeObj.title,"Bot",null, null);
                            
                            resOptionLength = (resposeObj.options).length;

                            if(resOptionLength <= 2)
                            {
                                var textToSHow = `<div class='msg-row'><div class='user-msg receive'><div class='avator-icon'><img src='/images/avatar-img-01.png'></div><p>${resposeObj.title}</p></div><p><div class='msg-row select'>`;

                                for(var i= 0; i < resOptionLength; i++)
                                {   
                                    let option  = [];
                                    current_selection_option.push(resposeObj.options[i].optionValue);
                                    option[i]   = 'message("'+resposeObj.options[i].optionValue+'"); disableButtons();';
                                    textToSHow += "<button type='button' class='btn btn-default disableIt' onclick='"+option[i]+"'> "+resposeObj.options[i].optionLabel+"</button>";
                                    textToSHow += " ";
                                }
                                textToSHow += "</div></p></div>";
                            }
                            else
                            {
                                var textToSHow = `<div class='msg-row'><div class='user-msg receive'><div class='avator-icon'><img src='/images/avatar-img-01.png'></div><p>${resposeObj.title}</p></div></div><p>`;
                                    textToSHow += "<div class='msg-row select'><select class='selectOptions disableIt' onchange='message(this.value); disableButtons()'>";
                                    textToSHow += "<option> Please Select One </option>";
                                for(var i= 0; i < resOptionLength; i++)
                                {   
                                    textToSHow += '<option value="'+resposeObj.options[i].optionValue+'">'+resposeObj.options[i].optionLabel+'</option>'; 
                                    current_selection_option.push(resposeObj.options[i].optionValue);

                                }
                                textToSHow += "</select></div>";
                            }
                        }
                        appendChatData(textToSHow);
                        
                        if(resposeObj.CloseChat)
                        {
                            if(resposeObj.CloseChat === "CloseChat")
                            {
                                hideThings();

                                //making log file
                                //makeLog(null,"Bot",null,"CloseChat");
                            }
                        }
                    }
                }
                else 
                {
                    //Evaluating response type
                    respObj.responseType === "option" ? respType = "option" : respType = "text";

                    if(respType === "text")
                    {
                        var textToSHow = `<div class='msg-row'><div class='user-msg receive'><div class='avator-icon'><img src='/images/avatar-img-01.png'></div><p>${respObj.title}</p></div></div>`;
                        
                        //making log file
                        //makeLog(respObj.title,"Bot",null,null);
                    }

                    if(respType === "option")
                    {
                        //making log file
                        //makeLog(respObj.title,"Bot",null,null);

                        //Evaluating Number of Options
                        resOptionLength = (respObj.options).length;

                        if(resOptionLength <= 2)
                        {
                            var textToSHow = `<div class='msg-row'><div class='user-msg receive'><div class='avator-icon'><img src='/images/avatar-img-01.png'></div><p>${respObj.title}</p></div><p><div class='msg-row select'>`;
                            for(var i= 0; i < resOptionLength; i++)
                            {   
                                let option  = [];
                                option[i]   = 'message("'+respObj.options[i].optionValue+'"); disableButtons();';
                                current_selection_option.push(respObj.options[i].optionValue);
                                textToSHow += "<button type='button' class='btn btn-default disableIt' onclick='"+option[i]+"'> "+respObj.options[i].optionLabel+"</button>";
                                textToSHow += " ";
                            }
                            textToSHow += "</div></p></div>";   
                        }
                        else
                        {
                            var textToSHow = `<div class='msg-row'><div class='user-msg receive'><div class='avator-icon'><img src='/images/avatar-img-01.png'></div><p>${respObj.title}</p></div><p>`;
                                textToSHow += "<div class='msg-row select'><select class='selectOptions disableIt' onchange='message(this.value); disableButtons();'>";
                                textToSHow += "<option> Please Select One </option>";
                            for(var i= 0; i < resOptionLength; i++)
                            {   
                                textToSHow += '<option value="'+respObj.options[i].optionValue+'">'+respObj.options[i].optionLabel+'</option>'; 
                                current_selection_option.push(respObj.options[i].optionValue);
                            }
                            textToSHow += "</select></div></p></div>";
                        }
                    }
                    appendChatData(textToSHow);
                }

                if(respObj.FlightEnsure)
                {
                    var flightDetails = respObj.FlightEnsureDetails;
                    ensureFlightDetails(flightDetails);
                }
            }
            else
            {
                // var chatAlert = document.getElementById("chat-alert");
                // chatAlert.style.display = "block";

                $("#botError").modal({ backdrop: 'static', keyboard: false });
                document.getElementById("error_message").innerHTML = `${response_object.message}`;
                hideThings();
            }
        }
    }    

    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

function repeatPreviousReservation(obj)
{

    //Disabling Functionality
    disbaleFunctionality();

    var resourceURL = `${baseIP}/api/previousData/repeatPreviousReservation2`;

    var dataPre = { data : obj };
    var data = JSON.stringify(dataPre);

    // var msgLoaderImage = "<div class='loading-img' id='loading-img-2'><img src='/images/loader.gif'></div>";
    // appendChatLoader(msgLoaderImage);
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {

            //Enabling Functionality
            enableFunctionality();

            var respObj = JSON.parse(this.responseText);
            message("Yes");
        }
    }
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

function getPreviousReservationDetails(id)
{

    //Disabling functionality
    disbaleFunctionality();

    var resourceURL = `${baseIP}/query`;

    var dataPre = { purpose : "getReservationDetailsToAlter", travelerID : id };
    var data = JSON.stringify(dataPre);

    var msgLoaderImage = "<div class='loading-img' id='loading-img-2'><img src='/images/loader.gif'></div>";
    appendChatLoader(msgLoaderImage);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {

            //Enabling Functionality
            enableFunctionality();

            var loader = document.getElementById("loading-img-2");
            if(loader){ loader.remove(); }
            
            var respObj = JSON.parse(this.responseText);
            var textToShow = respObj.textToShow;
            appendChatData(textToShow);
        }
    }
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

function requiredReservationTypes()
{

    var resourceURL = `${baseIP}/query`
    var reservation_array = [];
    var reservation_details = document.getElementsByClassName("reservation_details");

    for (var i = 0; i < reservation_details.length; i++)
    {
        if(reservation_details[i].checked)
        {   
            if(reservation_details[i].value != "")
            {
                reservation_array.push(reservation_details[i].value);
            }
        }
    }

    if(reservation_array.length > 0)
    {

        for (var i = 0; i < reservation_details.length; i++)
        {
            reservation_details[i].value = "";
        }

        reservation_array.splice(0, 0, 'date_range');

        var dataPre = { reservation_array : reservation_array, purpose : "requiredReservationTypes" };
        var data = JSON.stringify(dataPre);
        
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() 
        {
            if (this.readyState == 4 && this.status == 200) 
            {
                //Enabling Functionality
                enableFunctionality();

                requiredReservationArray = reservation_array;

                

                var respObj = JSON.parse(this.responseText);
                if(respObj.status == 1)
                {
                    initiateLeftPannel();
                    message("Ok");
                    disableButtons();
                }
            }
        }
        xmlhttp.open("POST", resourceURL, true);
        xmlhttp.withCredentials = true;
        xmlhttp.credentials = "include";
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
        xmlhttp.send(data);
    }
    else
    {
        $("#botError").modal({ backdrop: 'static', keyboard: false });
        document.getElementById("error_message").innerHTML = `Please select an option!`;
    }
}

function appendLeftPannel(data, id)
{
    var resourceURL =   `${baseIP}/api/save/gettingProvidedInformation`;
    var dataPre     =   { reservation_type : data, id : id };
    var data        =   JSON.stringify(dataPre);

    if(current_reservation_module != data)
    {
        current_reservation_module = data;

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() 
        {
            if (this.readyState == 4 && this.status == 200) 
            {
                var response_object = JSON.parse(this.response);
                var leftpanelBody = document.getElementById("left-chat-panel-details");
                
                if(leftpanelBody)
                {
                    leftpanelBody.style.display = "block";
                    $( document ).ready(()=>{ $('.chat-box').addClass("open-reservation"); });
                }

                if(response_object.reservation_type == "date_range")
                {
                    document.getElementById("dates-left-pannel").remove();
                    
                    //Getting flight UI
                    var textToShow = response_object.textToShow;

                    // departure_date_range = response_object.departure_date_range;
                    // return_date_range = response_object.return_date_range;

                    if(textToShow != null && textToShow != "" && textToShow != undefined)
                    {
                        $(textToShow).hide().appendTo('#left-chat-panel-details').fadeIn();
                        $("#left-chat-panel-details").animate({ scrollTop: 20000000 }, "slow");
                    }
                    else
                    {
                        //Show error message if the flight UI is not provided 
                    }

                    //Removing flight from the array;
                    const index = requiredReservationArray.indexOf('date_range'); if (index > -1) { requiredReservationArray.splice(index, 1); };
                }

                if(response_object.reservation_type == "flight")
                {
                    document.getElementById("flight-left-pannel").remove();

                    //Getting flight UI
                    var textToShow = response_object.textToShow;

                    if(textToShow != null && textToShow != "" && textToShow != undefined)
                    {
                        var selectedFlightDetails = response_object.selectedFlightDetails;

                        $(textToShow).hide().appendTo('#left-chat-panel-details').fadeIn();
                        $("#left-chat-panel-details").animate({ scrollTop: 20000000 }, "slow");
                    }
                    else
                    {
                        //Show error message if the flight UI is not provided 
                    }

                    //Removing flight from the array;
                    const index = requiredReservationArray.indexOf('flight'); if (index > -1) { requiredReservationArray.splice(index, 1); };
                }

                if(response_object.reservation_type == "hotel")
                {
                    document.getElementById("hotel-left-pannel").remove();

                    var textToShow = response_object.textToShow;

                    if(textToShow != "" && textToShow != null && textToShow != undefined)
                    {
                        var selectedHotelDetails = response_object.selectedHotelDetails;

                        $(textToShow).hide().appendTo('#left-chat-panel-details').fadeIn();
                        $("#left-chat-panel-details").animate({ scrollTop: 20000000 }, "slow");
                    }
                    else
                    {
                        //Show error message if the flight UI is not provided 
                    }

                    //Removing flight variable from the reservation array
                    const index = requiredReservationArray.indexOf('hotel'); if (index > -1) { requiredReservationArray.splice(index, 1); };
                }

                if(response_object.reservation_type == "rental_car")
                {
                    document.getElementById("rental_car-left-pannel").remove();

                    var textToShow = response_object.textToShow;

                    if(textToShow != "" && textToShow != undefined && textToShow != null)
                    {
                        var selectedRentalCarDetails = response_object.selectedRentalCarDetails;
                        
                        $(textToShow).hide().appendTo('#left-chat-panel-details').fadeIn();
                        $("#left-chat-panel-details").animate({ scrollTop: 20000000 }, "slow");
                    }
                    else
                    {
                        //Show error message if the flight UI is not provided 
                    }

                    //Removing the rental car variable from the reservation array
                    const index = requiredReservationArray.indexOf('rental_car'); if (index > -1) { requiredReservationArray.splice(index, 1); };
                }

                if(response_object.reservation_type == "town_car")
                {
                    document.getElementById("town_car-left-pannel").remove();

                    var textToShow = response_object.textToShow;

                    if(textToShow != null && textToShow != "" && textToShow != undefined)
                    {
                        var selectedTownCarDetails = response_object.selectedTownCarDetails;

                        $(textToShow).hide().appendTo('#left-chat-panel-details').fadeIn();
                        $("#left-chat-panel-details").animate({ scrollTop: 20000000 }, "slow");
                    }
                    else
                    {
                        //Show error message if the flight UI is not provided 
                    }

                    //Removing the town car variable from the reservation array
                    const index = requiredReservationArray.indexOf('town_car'); if (index > -1) { requiredReservationArray.splice(index, 1); };
                }

                initiateLeftPannel();
            }
        }
        xmlhttp.open("POST", resourceURL, true);
        xmlhttp.withCredentials = true;
        xmlhttp.credentials = "include";
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
        xmlhttp.send(data); 
    }   
}

function initiateLeftPannel()
{

    var resourceURL = `${baseIP}/query`;

    if(requiredReservationArray != undefined)
    {
        //If flight reservation is required
        if(requiredReservationArray[0] == "date_range")
        {   
            var dataPre = { purpose : "getTranslationEnabled", required_reservation : "date_range" };
            var data = JSON.stringify(dataPre);
        }
        if(requiredReservationArray[0] == "flight")
        {
            var dataPre = { purpose : "getTranslationEnabled", required_reservation : "flight" };
            var data = JSON.stringify(dataPre);
        }
        else if(requiredReservationArray[0] == "hotel")
        {
            var dataPre = { purpose : "getTranslationEnabled", required_reservation : "hotel" };
            var data = JSON.stringify(dataPre);
        }
        else if(requiredReservationArray[0] == "rental_car")
        {
            var dataPre = { purpose : "getTranslationEnabled", required_reservation : "rental_car" };
            var data = JSON.stringify(dataPre);
        }
        else if(requiredReservationArray[0] == "town_car")
        {
            var dataPre = { purpose : "getTranslationEnabled", required_reservation : "town_car" };
            var data = JSON.stringify(dataPre);
        }
        else if(requiredReservationArray[0] == "rail")
        {
            var dataPre = { purpose : "getTranslationEnabled", required_reservation : "rail" };
            var data = JSON.stringify(dataPre);
        }

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() 
        {
            if (this.readyState == 4 && this.status == 200) 
            {

                $( document ).ready(()=>{ $('#left-chat-panel-suggestion').hide(); });
                
                var response_object = JSON.parse(this.response);

                var leftpanelBody = document.getElementById("left-chat-panel")
            
                if(leftpanelBody)
                {
                    leftpanelBody.style.display = "block";
                    $( document ).ready(()=>{ $('.chat-box').addClass("open-reservation"); });
                }

                var textToShow = response_object.textToShow;
                if(textToShow != null && textToShow != "" && textToShow != undefined)
                {
                    $(textToShow).hide().appendTo('#left-chat-panel-details').fadeIn();
                    $("#left-chat-panel-details").animate({ scrollTop: 20000000 }, "slow");
                }
                else
                {
                    //Show error message here
                }
            }
        }
        xmlhttp.open("POST", resourceURL, true);
        xmlhttp.withCredentials = true;
        xmlhttp.credentials = "include";
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
        xmlhttp.send(data);
    }
}

function requiredReservationTypesPrevious()
{

    //Disbaling Functionality
    disbaleFunctionality();

    var resourceURL = `${baseIP}/query`;
    var reservation_array = [];
    var reservation_details = document.getElementsByClassName("reservation_details_previous");

    for (var i = 0; i < reservation_details.length; i++)
    {
        if(reservation_details[i].checked)
        {        
            if(reservation_details[i].value != "")
            {
                reservation_array.push(reservation_details[i].value);
            }
        }
        reservation_details[i].value = "";
    }   

    var dataPre = { reservation_array : reservation_array, purpose : "requiredReservationTypes" };
    var data = JSON.stringify(dataPre);

    // var msgLoaderImage = "<div class='loading-img' id='loading-img-2'><img src='/images/loader.gif'></div>";
    // appendChatLoader(msgLoaderImage);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {

            //Enabling functionality
            enableFunctionality();

            var respObj = JSON.parse(this.responseText);
            if(respObj.status == 1)
            {
                //document.getElementById("loading-img-2").remove();
                
                message("Ok");
            }
        }
    }
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

// It will handle the DB related queries like fetching flight data, getting other select options etc.
function queryDB(action, params)
{

    //Disabling Functionality
    disbaleFunctionality();

    var resourceURL = `${baseIP}/api/localQuery/query`;

    var msgLoaderImage = "<div class='loading-img' id='loading-img-2'><img src='/images/loader.gif'></div>";
    appendChatLoader(msgLoaderImage);

    if(action === "getPreviousBooking")
    {
        var predata = { queryAction : "FetchData", requestType : action, requestedID : params };
        var data = JSON.stringify(predata);
    }
    else if(action === "getCitiesList")
    {
        var predata = { queryAction : "FetchData", requestType : action };
        var data = JSON.stringify(predata);
    }
    else if(action === "GetAirportDetails")
    {
        var predata = { queryAction : "FetchData", requestType : action };
        var data = JSON.stringify(predata);
    }
    else if(action === "legalEntity")
    {
        var predata = { queryAction : "FetchData", requestType : action };
        var data = JSON.stringify(predata);
    }
    else if(action === "department")
    {
        var predata = { queryAction : "FetchData", requestType : action };
        var data = JSON.stringify(predata);
    }
    else if(action === "division")
    {
        var predata = { queryAction : "FetchData", requestType : action };
        var data = JSON.stringify(predata);
    }
    else if(action === "departmentID")
    {
        var predata = { queryAction : "FetchData", requestType : action };
        var data = JSON.stringify(predata);
    }
    else if(action === "getTripPurposes")
    {
        var companyID = params.companyID;
        var countryID = params.countryID;
        var predata = { queryAction : "FetchData", requestType : "getTripPurposes", companyID : companyID, countryID : countryID  };
        var data = JSON.stringify(predata);
    }
    else if(action === "checkPreviousFlights")
    {

        //Redefining resourceURL for getting the previous reservations information from server route.
        var resourceURL = `${baseIP}/api/previousData/getPreviousReservations`;
        var destination_city = params.destination_city;
        var userID = params.userID;
        var predata = { destination_city : destination_city, userID : userID,
            dep_date: params.dep_date,
            return_date: params.return_date,
            travelerRole : params.travelerRole,
            firstName : params.firstName,
            lastName : params.lastName
        };

        var data = JSON.stringify(predata);
    }
    else if(action === "getConcTravelers")
    {
        var arranger_email  =   params.arranger_email;
        var traveler_status =   params.travelerStatus;
        var predata = { queryAction : "FetchData", requestType : action, arranger_email : arranger_email, traveler_status : traveler_status };
        var data = JSON.stringify(predata);
    }

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {

            //Enabling Functionality
            enableFunctionality();

            var loader = document.getElementById("loading-img-2");
            if(loader){ loader.remove(); }
            
            var resObj =  JSON.parse(this.response);
            
            if(resObj.resultFor === "getPreviousBooking")
            {
                var numOfRecs = resObj.numOfRecs;
                var recordArray = resObj.records[0];
                
                textToSHow = "<select class='selectOptions disableIt' onchange='alterMessage(this.value); disableButtons();'>";
                textToSHow += "<option> Select One </option>";
                for(var i= 0; i < numOfRecs; i++)
                {   
                    if(recordArray[i].TravelTypeID === 1)  
                    {
                        var flightType = "One-Way";   
                    } 
                    else if(recordArray[i].TravelTypeID === 2)
                    {
                        var flightType = "Round-Trip";
                    }
                    else
                    {
                        var flightType = "Multi-City";
                    }

                    var value = { dataFor : "previousBooking", dataToSend : recordArray[i].TravelerID, dataToShow : ` ${flightType}, From: ${recordArray[i].FlightDepartureCity} On: ${dateFormatter(recordArray[i].FlightDepartureDate)} at ${(recordArray[i].FlightTime).substring(0,5)}` };
                    textToSHow += `<option value='${JSON.stringify(value)}'> ${flightType}, From: ${recordArray[i].FlightDepartureCity} On: ${dateFormatter(recordArray[i].FlightDepartureDate)} at ${(recordArray[i].FlightTime).substring(0,5)} </option>`; 
                }
                textToSHow += "</select>";
            }

            if(resObj.resultFor === "getCountriesList")
            {
                var numOfRecs = resObj.numOfRecs;
                var recordArray = resObj.records[0];
                var textToSHow = "<li class='mar-btm'><div class='media-body pad-hor'><div class='speech'><p>Please Select One From Below</p> <hr> <p>";
                textToSHow += "<div class='msg-row select'><select class='selectOptions' onchange='message(this.value)'>";
                textToSHow += "<option> Please Select One </option>";
                for(var i= 0; i < numOfRecs; i++)
                {   
                    textToSHow += '<option value="'+ recordArray[i].ez_country +'"> '+ recordArray[i].ez_country +' </option>'; 
                }
                textToSHow += "</select></div>";
            }

            if(resObj.resultFor === "getCitiesList")
            {
                var numOfRecs = resObj.numOfRecs;
                var recordArray = resObj.records[0];
                var textToSHow = "<li class='mar-btm'><div class='media-body pad-hor'><div class='speech'><p>Please Select One From Below</p> <hr> <p>";
                textToSHow += "<div class='msg-row select'><select class='selectOptions' onchange='message(this.value)'>";
                textToSHow += "<option> Please Select One </option>";
                for(var i= 0; i < numOfRecs; i++)
                {   
                    textToSHow += '<option value="'+ recordArray[i].ez_country +'"> '+ recordArray[i].ez_country +' </option>'; 
                }
                textToSHow += "</select></div>";
            }

            if(resObj.resultFor === "GetAirportDetails")
            {
                var numOfRecs = resObj.numOfRecs;
                var recordArray = resObj.records[0];
                var exampleID =  "example" + selectCount;
                var textToSHow = `<div class='msg-row select'><div id='div_${exampleID}'><select id='${exampleID}' class='example disableIt' onchange='message(this.value); disableButtons();'>`;
                textToSHow += "<option> Please type city name or code to select </option>";
                textToSHow += "</div></div>";
            }

            if(resObj.resultFor === "legalEntity")
            {
                var numOfRecs = resObj.numOfRecs;
                var recordArray = resObj.records[0];
                textToSHow = "<select class='selectOptions disableIt' onchange='verifyTravelerInfo(this.value, null); disableButtons();'>";
                textToSHow += "<option> Please Select One </option>";
                for(var i= 0; i < numOfRecs; i++)
                {   
                    textToSHow += `<option value="${recordArray[i].ez_legal_entity_value}"> ${recordArray[i].ez_legal_entity_value} </option>`; 
                }
                textToSHow += "</select>";
            }

            if(resObj.resultFor === "department")
            {
                var numOfRecs = resObj.numOfRecs;
                var recordArray = resObj.records[0];
                textToSHow = "<select class='selectOptions disableIt' onchange='verifyTravelerInfo(this.value, null); disableButtons();'>";
                textToSHow += "<option> Please Select One </option>";
                for(var i= 0; i < numOfRecs; i++)
                {   
                    textToSHow += `<option value="${recordArray[i].ez_business_unit_value}"> ${recordArray[i].ez_business_unit_value} </option>`; 
                }
                textToSHow += "</select>";
            }

            if(resObj.resultFor === "division")
            {
                var numOfRecs = resObj.numOfRecs;
                var recordArray = resObj.records[0];
                textToSHow = "<select class='selectOptions disableIt' onchange='verifyTravelerInfo(this.value, null); disableButtons();'>";
                textToSHow += "<option> Please Select One </option>";
                for(var i= 0; i < numOfRecs; i++)
                {   
                    textToSHow += `<option value="${recordArray[i].ez_division_value}"> ${recordArray[i].ez_division_value} </option>`; 
                }
                textToSHow += "</select>";
            }

            if(resObj.resultFor === "departmentID")
            {
                var numOfRecs = resObj.numOfRecs;
                var recordArray = resObj.records[0];
                textToSHow = "<div class='msg-row select'><select class='selectOptions disableIt' onchange='verifyTravelerInfo(this.value, null); disableButtons();'>";
                textToSHow += "<option> Please Select One </option>";
                for(var i= 0; i < numOfRecs; i++)
                {   
                    textToSHow += `<option value="${recordArray[i].ez_department_code_value}"> ${recordArray[i].ez_department_code_value} </option>`; 
                }
                textToSHow += "</select></div>";
            }

            if(resObj.resultFor === "getTripPurposes")
            {

                if(resObj.status == 200)
                {
                    var numOfRecs = resObj.numOfRecs;
                    var recordArray = resObj.recordObj;
                    textToSHow = "<div class='msg-row select'><select class='selectOptions disableIt' onchange='message(this.value); disableButtons();'>";
                    textToSHow += "<option> Please Select One </option>";
                    for(var i= 0; i < numOfRecs; i++)
                    {   
                        //var optionPre = { action : "getTripPurposes",  dataToSend : recordArray[i].TripPurposeID, dataToShow : recordArray[i].TripPurpose };
                        var option = recordArray[i].TripPurposeID;
                        textToSHow += `<option value='${option}'> ${recordArray[i].TripPurpose} </option>`; 
                    }
                    textToSHow += "</select></div>";
                }
                else
                {
                    queryDB(action, params);
                }
            }

            if(resObj.resultFor === "checkPreviousFlights")
            {   
                $( document ).ready(()=>{ $('#left-chat-panel-suggestion').show(); });
    

                if(resObj.status == 200)
                {
                    $( document ).ready(()=>{ $('.chat-box').addClass("open-reservation"); });
                    var textToShow = resObj.textToShow;
                    $(textToShow).hide().appendTo('#left-chat-panel-suggestion').fadeIn();
                    $("#left-chat-panel-suggestion").animate({ scrollTop: 20000000 }, "slow");
                    (async()=>{
                        await first_exact_match(resObj.reservation_details);
                        await translateFromClinetSide(`You can browse through the tabs in the left sidebar and select the best fit by clicking the BOOK NOW button. You can also edit any of the trip components by clicking the pencil. when done with editing or if you are ready then click book now.`,(dialog)=>{
                                $("#msg-body").append(`
                            <div class="msg-row" style=""><div class="user-msg receive"><div class="avator-icon">
                            <img src="/images/avatar-img-01.png"></div>
                            <p style="text-align: left;">${dialog.replace(/[\r\n]+$/, '')}</p></div></div>`)
                        });
                    })();
                }
                else
                {
                    message("No");
                }
            }

            if(resObj.resultFor === "getConcTravelers")
            {
                if(resObj.status == 200)
                {
                    Email = true;
                    requiredDataType = "Select";
                    var recordArray = resObj.record_array;

                    //textToSHow = "<div class='msg-row select'><select class='selectOptions disableIt' onchange='sendMessage(this.value); disableButtons();'>";
                    textToSHow = "<div class='msg-row select'><select class='selectOptions disableIt' onchange='message(this.value); disableButtons();'>";
                    textToSHow += "<option> Please Select One </option>";
                    
                    for(var i= 0; i < recordArray.length; i++)
                    {   
                        //var option = JSON.stringify(optionPre);
                        var first_name = (recordArray[i].first_name == "Latina") ? "William" : recordArray[i].first_name;
                        var last_name = (recordArray[i].last_name == "Dimitrova") ? "Never" : recordArray[i].last_name;;
                        textToSHow += `<option value='${recordArray[i].email_address}'> ${first_name} ${last_name} </option>`; 
                    }
                    if(traveler_status)
                    {
                        textToSHow += `<option value='${params.arranger_email}'> ${params.firstName} ${params.lastName} </option>`; 
                    }
                    textToSHow += "</select></div>";
                }
                else if(resObj.status == 404)
                {
                    var chatAlert = document.getElementById("chat-alert");
                    chatAlert.style.display = "block";
                    chatAlert.innerHTML = `${resObj.message}`;
                    hideThings();
                }
                else
                {
                    $( document ).ready(()=>{ $('#concernedTravelerError').click() });
                }
            }

            appendChatData(textToSHow);
        };
    };
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

function search_query()
{

    var array_to_show = [];
    var recordArray = array_to_search_previous_reservation;
    var search_fliter_pre = document.getElementById("search_item").value;
    var search_filter = search_fliter_pre.toUpperCase();

    if(search_filter != "" && recordArray != null)
    {
        for(var i = 0; i < recordArray.length; i++)
        {
            var current_obj = recordArray[i];

            var search_item_1 = (current_obj['main_data'].FlightDepartureCity).toUpperCase();
            var search_item_2 = dateFormatter(current_obj['main_data'].FlightDepartureDate);
            var search_item_3 = (current_obj['main_data'].FlightTime).substring(0,5);

            if(search_item_1.indexOf(search_filter) > -1 || search_item_2.indexOf(search_filter) > -1 || search_item_3.indexOf(search_filter) > -1)
            {
                array_to_show.push(current_obj);
            }
        }
    }
    else
    {
        array_to_show = [];
    }

    if(array_to_show != undefined && array_to_show != null && array_to_show != [])
    { 
        textToSHow = `<div class='' style=''> <div class="input-group"></div> <br> <div class="accordion-box"> <ul class="accordion-list">`;
        
        for(var i= 0; i < array_to_show.length; i++)
        {
            var main_data = array_to_show[i].main_data;
            if(main_data.TravelTypeID === 1)  
            {
                var flightType = oneway_previousReservation;   
            } 
            else if(main_data.TravelTypeID === 2)
            {
                var flightType = roundtrip_previousReservation;
            }

            var dataToShow = `${flightType}, ${from_previousReservation } : ${main_data.FlightDepartureCity} ${on_previousReservation}: ${dateFormatter(main_data.FlightDepartureDate)} ${at_previousReservation } ${(main_data.FlightTime).substring(0,5)}`;
            var dataToSend = main_data.TravelerID;
            textToSHow += `<li class="accordion-row to_hide" id=""><div class="right-fare"> </span></label> <button class="select-btn disableIt" onclick="temp('${dataToSend}', '${dataToShow}'); disableButtons();"> ${select_previousReservation } </button></div> <a class="accordion-title to_search" href="" onclick=""> <strong> ${from_previousReservation} </strong> ${main_data.FlightDepartureCity} <strong> ${to_previousReservation} </strong> ${main_data.FlightArrivalCity} <strong> ${on_previousReservation} </strong> ${dateFormatter(main_data.FlightDepartureDate)} <strong> ${at_previousReservation} </strong> ${(main_data.FlightTime).substring(0,5)} </a><div class="flight-box">`;
            
            if(array_to_show[i].hotelDetails != undefined)
            {
                var hotel_array = array_to_show[i].hotelDetails[0];
                if(hotel_array.length > 0)
                {
                    for (var j = 0; j < hotel_array.length; j++)
                    {
                        var current_hotel_obj = hotel_array[j];
                        textToSHow += `<div class="flight-row hotel-row">`;
                        textToSHow += `<div class="hotel-icon"><i class="fa fa-hospital-o"></i></div>`;
                        textToSHow +=  `<div class="hotel-column"><p><strong> ${hotel_name_previousReservation} </strong> ${current_hotel_obj.HotelName} </p>  <p><strong> ${check_in_date_previousReservation} </strong> ${current_hotel_obj.HotelCheckIn} </p> <p><strong> ${check_out_date_previousReservation} </strong> ${current_hotel_obj.HotelCheckOut}</p> <p><strong> ${hotel_city_previousReservation} </strong> ${current_hotel_obj.HotelState} </p></div>`;
                        textToSHow += `</div>`;
                    }
                }
            }

            if(array_to_show[i].rentalCarDetails != undefined)
            {
                var rental_car_array = array_to_show[i].rentalCarDetails[0];
                if(rental_car_array.length > 0)
                {
                    for (var j = 0; j < rental_car_array.length; j++)
                    {
                        var current_rental_car_obj = rental_car_array[j];
                        textToSHow += `<div class="flight-row hotel-row">`;
                        textToSHow += `<div class="hotel-icon"><i class="fa fa-car"></i></div>`;
                        textToSHow +=  `<div class="hotel-column"><p><strong> ${pick_up_city_previousReservation} </strong> ${current_rental_car_obj.PickupCity}</p> <p><strong> ${drop_off_city_previousReservation} </strong> ${current_rental_car_obj.DropoffCity}</p> <p><strong> ${pick_up_date_time_previousReservation} </strong> ${current_rental_car_obj.PickupDateTime} </p> <p><strong> ${drop_off_date_time_previousReservation} </strong> ${current_rental_car_obj.DropoffDateTime} </p></div>`;
                        textToSHow += `</div>`;
                    }
                }
            }

            if(array_to_show[i].townCarDetails != undefined)
            {
                var town_car_array = array_to_show[i].townCarDetails[0];
                if(town_car_array.length > 0)
                {
                    for (var j = 0; j < town_car_array.length; j++)
                    {
                        var current_town_car_obj = town_car_array[j];
                        textToSHow += `<div class="flight-row hotel-row">`;
                        textToSHow += `<div class="hotel-icon town-car-icon"><i class="fa fa-car"></i> <i class="fa fa-clock-o"></i></div>`;
                        if(current_town_car_obj.TravelTypeID == 5)
                        {
                            textToSHow +=  `<div class="hotel-column"><p> <strong> ${passengers_previousReservation} </strong> ${current_town_car_obj.Passengers}</p> <p><strong> ${car_type_previousReservation} </strong> ${hourly_previousReservation} </p> <p><strong> ${date_previousReservation} </strong> ${current_town_car_obj.TownCarDate}</p> <p><strong> ${pick_up_address_previousReservation} </strong> ${current_town_car_obj.TownCarPickupAddress}</p> <p><strong> ${drop_off_time_previousReservation} </strong> ${current_town_car_obj.TownCarDropoffTime} </p></div>`;
                        }
                        else
                        {
                            textToSHow +=  `<div class="hotel-column"><p> <strong> ${passengers_previousReservation} </strong> ${current_town_car_obj.Passengers}</p> <p><strong> ${car_type_previousReservation} </strong> ${oneway_previousReservation} </p> <p><strong> ${date_previousReservation} </strong> ${current_town_car_obj.TownCarDate}</p> <p><strong> ${pick_up_address_previousReservation} </strong> ${current_town_car_obj.TownCarPickupAddress}</p> <p><strong> ${drop_off_address_previousReservation} </strong> ${current_town_car_obj.TownCarDropoffAddress} </p></div>`;
                        }
                        textToSHow += `</div>`;
                    }
                }
            }

            if(array_to_show[i].railDetails != undefined)
            {
                var rail_array = array_to_show[i].railDetails[0];
                if(rail_array.length > 0)
                {
                    for (var j = 0; j < rail_array.length; j++)
                    {
                        var current_rail_obj = rail_array[j];
                        textToSHow += `<div class="flight-row hotel-row">`;
                        textToSHow += `<div class="hotel-icon town-car-icon"><i class="railcar-icon"></i></div>`;
                        textToSHow +=  `<div class="hotel-column"><p><strong> Departure City</strong> ${current_rail_obj.RailDepartureCity}</p> <p><strong> Arrival City </strong> ${current_rail_obj.RailArrivalCity}</p> <p><strong> Departure Date </strong> ${current_rail_obj.RailDepartureDate}</p> <p><strong> ${current_rail_obj.RailPreferredTime} Time</strong> ${current_rail_obj.RailTime} </p></div>`;
                        textToSHow += `</div>`;
                    }
                }
            }

            textToSHow += `</div></li>`;
        }
        textToSHow += `<div id="no_data" style="display: none"> No previous reservation found! </div>`;
        textToSHow += `</ul></div></div></div>`;   
    }
    else
    {
       var textToSHow = `No record found!`;
    }

    document.getElementById("search_result").innerHTML = textToSHow;
}   

// It will handle the API related quiries like SABRE API, Umbrella Faces API etc. (Currenlty Working on it)
function queryAPI(action, dataObj)
{
    //Disabling Functionality
    disbaleFunctionality();

    var msgLoaderImage = "<div class='loading-img' id='loading-img-1'><img src='/images/loader.gif'></div>";
    appendChatLoader(msgLoaderImage);

    if(action === "getFlightDetails")
    {
        var flightType = dataObj.flightType;

        if(flightType === "oneway")
        {
            var predata = dataObj;
            predata['action'] = action;
            var data = JSON.stringify(predata);
            var resourceURL = `${baseIP}/api/sabre/lowFlightSearchBFM`;
        }

        if(flightType === "roundtrip")
        {
            var predata = dataObj;
            predata['action'] = action;
            var data = JSON.stringify(predata);
            var resourceURL = `${baseIP}/api/sabre/lowFlightSearchBFM`;
        }

         if(flightType === "multicity")
        {
            var predata = dataObj;
            predata['action'] = action;
            var data = JSON.stringify(predata);
            var resourceURL = `${baseIP}/api/sabre/lowFlightSearchBFM`;
        }
    }

    if(action === "getHotelDetails")
    {
        var resourceURL = `${baseIP}/api/sabre/getHotelDetails`;
        var predata = { cityCode : dataObj.city , checkInDate : dataObj.checkInDate, 
            checkOutDate : dataObj.checkOutDate,
            invoke_source: dataObj.invoke_source, 
            div_id: dataObj.div_id
        };
        var data = JSON.stringify(predata);
    }

    if(action === "getRentalCarDetails")
    {
        var resourceURL = `${baseIP}/api/sabre/getRentalCarDetails`;
        
        var predata = { drop_off_city : dataObj.drop_off_city ,
             drop_off_date : dataObj.drop_off_date, drop_off_time : dataObj.drop_off_time,
              pick_up_city : dataObj.pick_up_city, pick_up_date : dataObj.pick_up_date, 
              pick_up_time : dataObj.pick_up_time,
            div_id : dataObj.div_id,
            invoke_source : dataObj.invoke_source
        };
        var data = JSON.stringify(predata);
    }

    if(action === "getTownCarDetails")
    {
        var resourceURL = `${baseIP}/api/sabre/getTownCarDetails`;

        if(dataObj.carType == "oneway")
        {
            var predata = { car_type : dataObj.carType, drop_off_address : dataObj.getDropOffAddress, pick_up_address : dataObj.getPickUpAddress, numOfPassengers : dataObj.numOfPassengers, pick_up_date : dataObj.townCarPickUpDate, pick_up_time : dataObj.townPickUpTime };
        }

        else if(dataObj.carType == "hourly")
        {
            var predata = { car_type : dataObj.carType, drop_off_time : dataObj.DropOffTime, pick_up_address : dataObj.getPickUpAddress, numOfPassengers : dataObj.numOfPassengers, pick_up_date : dataObj.townCarPickUpDate, pick_up_time : dataObj.townPickUpTime };
        }
        
        var data = JSON.stringify(predata);
    }

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {

            //Enabling Functionality
            enableFunctionality();

            document.getElementById("loading-img-1").remove();
            var respObj =  JSON.parse(this.response);

            if(this.status != 404)
            {
            
                if(respObj.resultFor === "getFlightDetails")
                {
                    requiredDataType = "Select";
                    //var textToShow = respObj.textToShow;
                    console.log(respObj);
                    var textToShow = (respObj.result_array.length > 0) ? showFiltersToResponse(respObj.result_array, respObj.invoke_source, respObj.div_id) : respObj.textToShow;
                    appendChatData(textToShow);
                }

                if(respObj.resultFor === "getHotelDetails")
                {

                    if(respObj.status == 200)
                    {
                        requiredDataType = "Text";
                        hotelName = true;
                        var textToShow = respObj.textToShow;
                        appendChatData(textToShow);
                        //makeLog(textToShow, "bot", null, null);
                    }

                    else if(respObj.status == 404)
                    {
                        var textToShow = respObj.textToShow;
                        appendChatData(textToShow);
                        requiredDataType = "Text";
                        hotelName = true;
                        //makeLog(textToShow, "bot", null, null);
                    }
                }

                if(respObj.resultFor === "getRentalCarDetails")
                {
                    if(respObj.status == 200)
                    {
                        var textToShow = respObj.textToShow;
                        appendChatData(textToShow);
                        requiredDataType = "Text";
                        //makeLog(textToShow, "bot", null, null);
                        //$("#carousel_rental_car").owlCarousel({ autoplay: false, rewind: true, /* use rewind if you don't want loop */ margin: 20, autoplay:true, responsiveClass: true, autoHeight: true, autoplayTimeout: 7000, smartSpeed: 800, nav: false, responsive: { 0: { items: 1 }, 600: { items: 3 }, 1024: { items: 4 }, 1366: { items: 4 } } });
                    }

                    else if(respObj.status == 404)
                    {
                        message("no");
                    }
                }

                if(respObj.resultFor === "getTownCarDetails")
                {
                    if(respObj.status == 200)
                    {
                        var textToShow = respObj.textToShow;
                        appendChatData(textToShow);
                        requiredDataType = "Text";
                        //makeLog(textToShow, "bot", null, null);
                        //$("#carousel_town_car").owlCarousel({ autoplay: false, rewind: true, margin: 20, autoplay:true, responsiveClass: true, autoHeight: true, autoplayTimeout: 7000, smartSpeed: 800, nav: false, responsive: { 0: { items: 1 }, 600: { items: 3 }, 1024: { items: 4 }, 1366: { items: 4 } } });
                    }

                    else if(respObj.status == 404)
                    {
                        message("no");
                    }
                }
            }
            else
            {
                $("#botError").modal({ backdrop: 'static', keyboard: false });
                document.getElementById("error_message").innerHTML = `Sabre Web Services are currenlty down. Please try again later.`;
                hideThings();
            }
        }
    };
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

// It will ensure the flight details after the traveler selects a flight (Depriciated)
function ensureFlightDetails(details)
{

    var resourceURL = `${baseIP}/api/watson/flightDetailsEnsure`;
    var dataPre = { details : details };
    var data = JSON.stringify(dataPre);

    var msgLoaderImage = "<div class='loading-img' id='loading-img-1'><img src='/images/loader.gif'></div>";
    appendChatLoader(msgLoaderImage);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {
            document.getElementById("loading-img-1").remove();
            var resObj =  JSON.parse(this.response);
            appendChatData(resObj.ensure_statement);
        }
    }

    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

// It will repeat the reservations with out alterations
function auto_previous_reservation(id, date, returnDate)
{
    //Disabling Functionality
    disbaleFunctionality();

    var resourceURL = `${baseIP}/api/previousData/autoPreviousReservation`;
    requiredDataType = "Text";

    //Generating payload to send to ibm watson
    var dataPre = { travelerID : id, newDate : date };
    var data = JSON.stringify(dataPre);

    var msgLoaderImage = "<div class='loading-img' id='loading-img-2'><img src='/images/loader.gif'></div>";
    appendChatLoader(msgLoaderImage);

    // var xmlhttp = new XMLHttpRequest();
    // xmlhttp.onreadystatechange = function() 
    // {
    //     if (this.readyState == 4 && this.status == 200) 
    //     {
            
            //Enabling Functionality
            enableFunctionality();

            var loader = document.getElementById("loading-img-2");
            if(loader){ loader.remove(); }
            // setTimeout(
            //     function() 
            //     {
            //         $('#msg-body').append(`<div class="msg-row select" style="margin-bottom:8px;">
            //         <button type="button" class="btn btn-default disableIt" onclick="PreviousReservationAvailiblity('${id}'); disableButtons();"> Yes</button> 
            //         <button type="button" class="btn btn-default disableIt" onclick="message('no'); disableButtons();enablebooknowanddmakenewbuttons();"> No</button> 
            //         </div>`);
            //       //do something special
            //     }, 2000);
            // var response = JSON.parse(this.responseText);
            PreviousReservationAvailiblity(id);
            // message("Yes");
    //     }
    // }
    // xmlhttp.open("POST", resourceURL, true);
    // xmlhttp.setRequestHeader("Content-Type", "application/json");
    // xmlhttp.setRequestHeader("Access-Control-Allow-Origin", "http://127.0.0.1:3000");
    // xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    // xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    // xmlhttp.send(data);
}

function enablebooknowanddmakenewbuttons()
{
    $('#Date').attr('disabled',true);
    $('.booknowcls').attr('disabled',false);
    $('.makenewcls').attr('disabled',false);
}

// This function will deal with the previous reservaiton data updation with monor alteration
// This function has some other realted helping functions
function previousReservationUpdation(mode, obj, action)
{

    //Disabling Functionality
    disbaleFunctionality();

    // var msgLoaderImage = "<div class='loading-img' id='loading-img-2'><img src='/images/loader.gif'></div>";
    // appendChatLoader(msgLoaderImage);

    if(mode == "flightReservation")
    {
        if(action == "initialize")
        {
            var resourceURL = `${baseIP}/api/previousData/flightReservation`;
            var dataPre = { action : action, data : obj };
            data = JSON.stringify(dataPre);
        }
    }

    if(mode === "hotelReservation")
    {
        var resourceURL = `${baseIP}/api/previousData/hotelReservation`;
        var dataPre = { action : action, data : obj };
        data = JSON.stringify(dataPre);
    }

    if(mode === "rentalCarReservation")
    {
        var resourceURL = `${baseIP}/api/previousData/rentalCarReservation`;
        var dataPre = { action : action, data : obj };
        data = JSON.stringify(dataPre);
    }

    if(mode === "townCarReservation")
    {
        var resourceURL = `${baseIP}/api/previousData/townCarReservation`;
        var dataPre = { action : action, data : obj };
        data = JSON.stringify(dataPre);
    }

    if(mode === "railReservation")
    {
        var resourceURL = `${baseIP}/api/previousData/railReservation`;
        var dataPre = { action : action, data : obj };
        data = JSON.stringify(dataPre);
    }

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {

            //Enabling Functionality
            enableFunctionality();

            //document.getElementById("loading-img-2").remove();
            
            var respObj = JSON.parse(this.responseText);

            var responseType = respObj.responseFor;
            
            if(responseType === "flightReservation")
            {
                var form = respObj.form;
                //makeLog(form, "bot", null, null);
                appendChatData(form);
            }

            if(responseType === "hotelReservation")
            {
                var form = respObj.form;
                //makeLog(form, "bot", null, null);
                appendChatData(form);
            }

            if(responseType === "rentalCarReservation")
            {
                var form = respObj.form;
                //makeLog(form, "bot", null, null);
                appendChatData(form);
            }

            if(responseType === "townCarReservation")
            {
                requiredDataType = "Form";
                var form = respObj.form;
                //makeLog(form, "bot", null, null);
                appendChatData(form);
            }

            if(responseType === "railReservation")
            {
                var form = respObj.form;
                //makeLog(form, "bot", null, null);
                appendChatData(form);
            }
        }
    }
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

//For previous reservation scenario with minor alterations, these functions are called from the form appended to the clint side

//For updating flight info
function updateFlightInfo(flightType,seats)
{

    //Disabling Functionality
    disbaleFunctionality();

    var error_array = [];
    var resourceURL = `${baseIP}/api/save/saveData`;
    var dataObject = {};
    var dataArray = document.getElementsByClassName("flight_info_insert");
    var requiredIteration = (dataArray.length) / 4;
    var seats = 1;
    //var seats = document.getElementById("seats").value;

    if(flightType === 1)
    {
        for(var i = 0; i < dataArray.length; i++)
        {
            if(dataArray[i].value === "")
            {
                error_array.push(dataArray[i].id);
                document.getElementById(`${dataArray[i].id}_error_belowLine`).classList.add("required");
                document.getElementById(`${dataArray[i].id}_error_text_incomplete_field`).style.display =  "block";
            }
            else
            {
                if(error_array.length != 0)
                {
                    error_array = error_array.filter(item => item !== dataArray[i].id)
                }

                if(document.getElementById(`${dataArray[i].id}_error_belowLine`))
                {
                    document.getElementById(`${dataArray[i].id}_error_belowLine`).classList.remove("required");
                    document.getElementById(`${dataArray[i].id}_error_text_incomplete_field`).style.display =  "none";
                }
            }
            dataObject[`${(dataArray[i].id).replace(/[0-9]/g, '')}`] = dataArray[i].value;
        }
        dataObject['flightType'] = "oneway";
        
        //making payload
        var dataPre = { dataType : "flight", dataObj : dataObject };
        var data = JSON.stringify(dataPre);
    }

    else if(flightType === 2)
    {
        for(var i = 0; i < dataArray.length; i++)
        {

            if(dataArray[i].value === "")
            {
                error_array.push(dataArray[i].id);
                document.getElementById(`${dataArray[i].id}_error_belowLine`).classList.add("required");
                document.getElementById(`${dataArray[i].id}_error_text_incomplete_field`).style.display =  "block";
            }
            else
            {
                if(error_array.length != 0)
                {
                    error_array = error_array.filter(item => item !== dataArray[i].id)
                }
                
                if(document.getElementById(`${dataArray[i].id}_error_belowLine`))
                {
                    document.getElementById(`${dataArray[i].id}_error_belowLine`).classList.remove("required");
                    document.getElementById(`${dataArray[i].id}_error_text_incomplete_field`).style.display =  "none";
                }
            }

            dataObject[`${(dataArray[i].id).replace(/[0-9]/g, '')}`] = dataArray[i].value;
        }
        dataObject['flightType'] = "roundtrip";

        //making payload
        var dataPre =  { dataType : "flight", dataObj : dataObject };
        var data = JSON.stringify(dataPre);
    }

    else if(flightType === 3)
    {
        var flightReservationArray = [];

        for(var i = 0; i < dataArray.length; i++)
        {

            if(dataArray[i].value === "")
            {
                error_array.push(dataArray[i].id);
                document.getElementById(`${dataArray[i].id}_error_belowLine`).classList.add("required");
                document.getElementById(`${dataArray[i].id}_error_text_incomplete_field`).style.display =  "block";
            }
            else
            {
                if(error_array.length != 0)
                {
                    error_array = error_array.filter(item => item !== dataArray[i].id)
                }

                if(document.getElementById(`${dataArray[i].id}_error_belowLine`))
                {
                    document.getElementById(`${dataArray[i].id}_error_belowLine`).classList.remove("required");
                    document.getElementById(`${dataArray[i].id}_error_text_incomplete_field`).style.display =  "none";
                }
            }

            dataObject[`${(dataArray[i].id).replace(/[0-9]/g, '')}`] = dataArray[i].value;
            
            if((i+1) % 4 === 0)
            {
                dataObject['flightType'] = "multicity";
                flightReservationArray.push(dataObject);
                dataObject = {};
            }
        }
        
        //making payload
        dataObject1 = {  flightType : "multicity", flightDetailsArray : flightReservationArray }
        var dataPre = { dataType : "flight", dataObj : dataObject1 };
        var data = JSON.stringify(dataPre);
    }

    if(error_array.length === 0)
    {
        disableButtons();
        //making ajax call to the server

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() 
        {
            if (this.readyState == 4 && this.status == 200) 
            {

                //Enabling Functionality
                enableFunctionality();

                var respObj = JSON.parse(this.responseText);
                if(respObj.status === 1)
                {
                    //var objPre = {dataFor : "null", dataToSend : seats, dataToShow : "Yes"};
                    //var obj = JSON.stringify(objPre);

                    message('1');
                }
            }
        }
        xmlhttp.open("POST", resourceURL, true);
        xmlhttp.withCredentials = true;
        xmlhttp.credentials = "include";
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
        xmlhttp.send(data);
    }
    else
    {
        //Enabling Functionality
        enableFunctionality();
    }
}

// For updating hotel info 
function updateHotelInfo()
{

    //Disabling Functionality
    disbaleFunctionality();

    var error_array = [];

    var hotelReservationArray = [];

    var resourceURL = `${baseIP}/api/save/saveData`;

    var dataObject = {};
    var dataArray = document.getElementsByClassName("hotel_info_insert");
    var requiredIteration = (dataArray.length) / 4;

    for(var i = 0; i < dataArray.length; i++)
    {

        if(dataArray[i].value === "")
        {
            error_array.push(dataArray[i].id);
            document.getElementById(`${dataArray[i].id}_error_belowLine`).classList.add("required");
            document.getElementById(`${dataArray[i].id}_error_text_incomplete_field`).style.display =  "block";
        }
        else
        {
            if(error_array.length != 0) { error_array = error_array.filter(item => item !== dataArray[i].id) };

            if(document.getElementById(`${dataArray[i].id}_error_belowLine`))
            {
                document.getElementById(`${dataArray[i].id}_error_belowLine`).classList.remove("required");
                document.getElementById(`${dataArray[i].id}_error_text_incomplete_field`).style.display =  "none";
            }
        }

        dataObject[`${(dataArray[i].id).replace(/[0-9]/g, '')}`] = dataArray[i].value;
        
        if((i+1) % 4 === 0)
        {
            hotelReservationArray.push(dataObject);
            dataObject = {};
        }
    }
    
    if(error_array.length === 0)
    {
        disableButtons();

        //making payload
        dataObject1 = {  hotelDetailsArray : hotelReservationArray }
        var dataPre = { dataType : "hotelArray", dataObj : dataObject1 };
        var data = JSON.stringify(dataPre);

        // //making ajax call to the server
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() 
        {
            if (this.readyState == 4 && this.status == 200) 
            {

                //Enabling Functionality
                enableFunctionality();

                var respObj = JSON.parse(this.responseText);
                if(respObj.status === 1)
                {
                    sendMessage("Yes");
                }
            }
        }
        xmlhttp.open("POST", resourceURL, true);
        xmlhttp.withCredentials = true;
        xmlhttp.credentials = "include";
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
        xmlhttp.send(data);
    }
}

// For updating rental car info
function updateRentalCarInfo()
{

    //Disabling functionality
    disbaleFunctionality();

    var error_array = [];

    var dataObject = {};
    var resourceURL = `${baseIP}/api/save/saveData`;
    var dataArray = document.getElementsByClassName("rentalCar_info_insert");

    for(var i = 0; i < dataArray.length; i++)
    {

        if(dataArray[i].value === "")
        {
            error_array.push(dataArray[i].id);
            document.getElementById(`${dataArray[i].id}_error_belowLine`).classList.add("required");
            document.getElementById(`${dataArray[i].id}_error_text_incomplete_field`).style.display =  "block";
        }
        else
        {
            if(error_array.length != 0) { error_array = error_array.filter(item => item !== dataArray[i].id) };
            if(document.getElementById(`${dataArray[i].id}_error_belowLine`))
            {
                document.getElementById(`${dataArray[i].id}_error_belowLine`).classList.remove("required");
                document.getElementById(`${dataArray[i].id}_error_text_incomplete_field`).style.display =  "none";
            }
        }

        dataObject[`${dataArray[i].id}`] = dataArray[i].value;
    }

    if(error_array.length === 0)
    {
        disableButtons();

        var dataPre = { dataType : "rentalcar", dataObj : dataObject };
        var data = JSON.stringify(dataPre);

        // making ajax call to the server
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() 
        {
            if (this.readyState == 4 && this.status == 200) 
            {

                //Enabling Functionality
                enableFunctionality();

                var respObj = JSON.parse(this.responseText);
                if(respObj.status === 1)
                {
                    sendMessage("Yes");
                }
            }
        }
        xmlhttp.open("POST", resourceURL, true);
        xmlhttp.withCredentials = true;
        xmlhttp.credentials = "include";
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
        xmlhttp.send(data);
    }
}

// For updating town car info
function updateTownCarInfo(travelType)
{

    //Disabling functionality
    disbaleFunctionality();

    var error_array = [];

    var dataObject = {};
    var resourceURL = `${baseIP}/api/save/saveData`;

    if(travelType === 1)
    {
        dataObject['townCarMode'] = "oneway";
    }
    else
    {
        dataObject['townCarMode'] = "hourly";
    }

    var dataArray = document.getElementsByClassName("townCar_info_insert");

    for(var i = 0; i < dataArray.length; i++)
    {
        if(dataArray[i].value === "")
        {
            error_array.push(dataArray[i].id);
            document.getElementById(`${dataArray[i].id}_error_belowLine`).classList.add("required");
            document.getElementById(`${dataArray[i].id}_error_text_incomplete_field`).style.display =  "block";
        }
        else
        {
            if(error_array.length != 0) { error_array = error_array.filter(item => item !== dataArray[i].id) };
            if(document.getElementById(`${dataArray[i].id}_error_belowLine`))
            {
                document.getElementById(`${dataArray[i].id}_error_belowLine`).classList.remove("required");
                document.getElementById(`${dataArray[i].id}_error_text_incomplete_field`).style.display =  "none";
            }
        }

        dataObject[`${dataArray[i].id}`] = dataArray[i].value;
    }

    if(error_array.length === 0)
    {
        disableButtons();

        var dataPre = { dataType : "towncar", dataObj : dataObject };
        var data = JSON.stringify(dataPre);

        // making ajax call to the server
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() 
        {
            if (this.readyState == 4 && this.status == 200) 
            {

                //Enabling Functionality
                enableFunctionality();

                var respObj = JSON.parse(this.responseText);
                if(respObj.status === 1)
                {
                    sendMessage("Yes");
                }
            }
        }
        xmlhttp.open("POST", resourceURL, true);
        xmlhttp.withCredentials = true;
        xmlhttp.credentials = "include";
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
        xmlhttp.send(data);
    }
}

// For updating rail info
function updateRailInfo(travelType)
{

    //Disabling functionality
    disbaleFunctionality();

    var error_array = [];

    var dataObject = {};
    var resourceURL = `${baseIP}/api/save/saveData`;

    if(travelType === 1)
    {
        dataObject['railType'] = "oneway";
        var dataArray = document.getElementsByClassName("rail_info_insert");

        for(var i = 0; i < dataArray.length; i++)
        {

            if(dataArray[i].value === "")
            {
                error_array.push(dataArray[i].id);
                document.getElementById(`${dataArray[i].id}_error_belowLine`).classList.add("required");
                document.getElementById(`${dataArray[i].id}_error_text_incomplete_field`).style.display =  "block";
            }
            else
            {
                if(error_array.length != 0) { error_array = error_array.filter(item => item !== dataArray[i].id) };
                if(document.getElementById(`${dataArray[i].id}_error_belowLine`))
                {
                    document.getElementById(`${dataArray[i].id}_error_belowLine`).classList.remove("required");
                    document.getElementById(`${dataArray[i].id}_error_text_incomplete_field`).style.display =  "none";
                }
            }

            dataObject[`${dataArray[i].id}`] = dataArray[i].value;
        }

        var dataPre = { dataType : "rail", dataObj : dataObject };
        var data = JSON.stringify(dataPre);
    }
    else if(travelType === 2)
    {
        dataObject['railType'] = "roundtrip";
        var dataArray = document.getElementsByClassName("rail_info_insert");

        for(var i = 0; i < dataArray.length; i++)
        {
            if(dataArray[i].value === "")
            {
                error_array.push(dataArray[i].id);
                document.getElementById(`${dataArray[i].id}_error_belowLine`).classList.add("required");
                document.getElementById(`${dataArray[i].id}_error_text_incomplete_field`).style.display =  "block";
            }
            else
            {
                if(error_array.length != 0) { error_array = error_array.filter(item => item !== dataArray[i].id) };
                if(document.getElementById(`${dataArray[i].id}_error_belowLine`))
                {
                    document.getElementById(`${dataArray[i].id}_error_belowLine`).classList.remove("required");
                    document.getElementById(`${dataArray[i].id}_error_text_incomplete_field`).style.display =  "none";
                }
            }

            dataObject[`${dataArray[i].id}`] = dataArray[i].value;
        }

        var dataPre = { dataType : "rail", dataObj : dataObject };
        var data = JSON.stringify(dataPre);
    }
    else
    {
        var railReservationArray = [];
        var dataArray = document.getElementsByClassName("rail_info_insert");

        for(var i = 0; i < dataArray.length; i++)
        {

            if(dataArray[i].value === "")
            {
                error_array.push(dataArray[i].id);
                document.getElementById(`${dataArray[i].id}_error_belowLine`).classList.add("required");
                document.getElementById(`${dataArray[i].id}_error_text_incomplete_field`).style.display =  "block";
            }
            else
            {
                if(error_array.length != 0) { error_array = error_array.filter(item => item !== dataArray[i].id) };
                if(document.getElementById(`${dataArray[i].id}_error_belowLine`))
                {
                    document.getElementById(`${dataArray[i].id}_error_belowLine`).classList.remove("required");
                    document.getElementById(`${dataArray[i].id}_error_text_incomplete_field`).style.display =  "none";
                }
            }

            dataObject[`${(dataArray[i].id).replace(/[0-9]/g, '')}`] = dataArray[i].value;
            
            if((i+1) % 5 === 0)
            {
                dataObject['railType'] = "multicity";
                railReservationArray.push(dataObject);
                dataObject = {};
            }
        }

        //making payload
        var dataPre = { dataType : "railArray", dataObj : railReservationArray };
        var data = JSON.stringify(dataPre);
    }

    if(error_array.length === 0)
    {
        disableButtons();

        // making ajax call to the server
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() 
        {
            if (this.readyState == 4 && this.status == 200) 
            {

                //Enabling functionality
                enableFunctionality();

                var respObj = JSON.parse(this.responseText);
                if(respObj.status === 1)
                {
                    sendMessage("Yes");
                }
            }
        }
        xmlhttp.open("POST", resourceURL, true);
        xmlhttp.withCredentials = true;
        xmlhttp.credentials = "include";
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
        xmlhttp.send(data);
    }
}

// This function will send the selected flight from the searched low fare flights to the server
function selectedFlight(flightName, flightID, invoke_source="empty", div_id="empty")
{

    $('#flight_validate_footer').css("display", "none");
    $("#flight_validation_result_not_found").css("display", "none");


    var resourceURL = `${baseIP}/api/sabre/valdiateFlightItinerary`;
    
    if(invoke_source != "edit_pannel")
    {
        $('#flight_validation_result').css("display", "block");
        $("#flight_validation").modal({ backdrop: 'static', keyboard: false });
    }
    else if(invoke_source == "edit_pannel")
    {
        showCallLoader();   
    }
    var data_pre = { flight_id : flightID , invoke_source:invoke_source};
    var data = JSON.stringify(data_pre);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {
            var response = JSON.parse(this.responseText);
            hideCallLoader();

            if(!response.success)
            {
                if(invoke_source != "edit_pannel")
                {
                    $("#flight_validation_result_not_found").css("display", "block");
                    $('#flight_validation_result').css("display", "none");
                    $('#flight_validate_footer').css("display", "block");
                }
            }
            else
            {
                $("#flight_validation").modal('hide');
                disableButtons();

                if(invoke_source == "availability")
                {
                    available_selected_flight(response.selected_flight_dtls.flightScheduleData,div_id,flightID,response.selected_flight_dtls)

                }
                else if(invoke_source == "edit_pannel")
                {
                    edit_selected_flight(response.flight_details.flightScheduleData,div_id,flightID,response.flight_details);
                }
                else
                {
                    var dataToSend = flightID.toString();
                    message(dataToSend);
                }
            }
        }
    }
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);

    //var selectedFlightDataPre = { dataFor : "lowFlightSearch", dataToSend : flightID, dataToShow : `${flightName} # ${flightID}` };
    //var selectedFlightData = JSON.stringify(selectedFlightDataPre);
}

function check_hotel_price(id,type="empty",div_id="empty",checkin_date="empty",checkout_date,hotel_name="empty",hotel_state="empty",room_rate="empty")
{    
    $('#hotel_validation_result').css("display", "none");
    $('#hotel_validation_result_not_found').css("display", "none");
    $('#hotel_validate_footer').css("display", "none");

    if(id)
    {
        var resourceURL = `${baseIP}/api/sabre/validateHotelPrice`;

        if(type != "edit_pannel")
        {
            $("#hotel_validation_result").css("display", "block");
            $("#hotel_validation").modal({ backdrop: 'static', keyboard: false });
        }

        if(type == "edit_pannel")
        {
            var data_pre = { rate_key_index : id ,invoke_source:type};
            showCallLoader();
        }
        else
        {
            var data_pre = { rate_key_index : id};
        }

        var data = JSON.stringify(data_pre);

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() 
        {
            if (this.readyState == 4 && this.status == 200) 
            {
                var response = JSON.parse(this.responseText);
                hideCallLoader();
                if(!response.success)
                {
                    if(type != "edit_pannel")
                    {
                        $('#hotel_validation_result_not_found').css("display", "block");
                        $('#hotel_validation_result').css("display", "none");
                        $('#hotel_validate_footer').css("display", "block");
                    }
                }
                else
                {
                    if(type == "availability")
                    {
                        $("#hotel_validation").modal('hide');
                        available_selected_hotel(response.requiredDetails,div_id);
                    }
                    else if(type == "edit_pannel")
                    {
                        
                        $("#hotel_validation").modal('hide');
                        edit_selected_hotel(response.rate_key,div_id,checkin_date,checkout_date,hotel_name,hotel_state,room_rate);
                    }
                    else
                    {
                        $("#hotel_validation").modal('hide');
                        disableButtons();
                        message(response.hotel_name);
                    }
                }
            }
        }
        xmlhttp.open("POST", resourceURL, true);
        xmlhttp.withCredentials = true;
        xmlhttp.credentials = "include";
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
        xmlhttp.send(data);


    }
}

function check_rentalcar_price(id,type="empty",sendpickdate="empty",senddropdate="empty",div_id="empty")
{

    $('#vehicle_validate_footer').css("display", "none");
    $('#vehicle_validation_result').css("display", "none");
    $('#vehicle_validation_result_not_found').css("display", "none");
    
    if(id)
    {
        var resourceURL = `${baseIP}/api/sabre/validateRentalCarPrice`;
        if(type != "edit_pannel")
        {
            $('#vehicle_validation_result').css("display", "block");
            $("#vehicle_validation").modal({ backdrop: 'static', keyboard: false });
        }
        else if(type == "edit_pannel")
        {
            showCallLoader();
        }
        var data_pre = { car_id : id };
        var data = JSON.stringify(data_pre);

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() 
        {
            if (this.readyState == 4 && this.status == 200) 
            {
                var response = JSON.parse(this.responseText);
                hideCallLoader();
                if(!response.success)
                {
                    if(type != "edit_pannel")
                    {
                        $('#vehicle_validation_result_not_found').css("display", "block");
                        $('#vehicle_validation_result').css("display", "none");
                        $('#vehicle_validate_footer').css("display", "block");
                    }                    
                }
                else
                {
                    if(type == "availability")
                    {
                        $("#vehicle_validation").modal('hide');
                        disableButtons();
                        available_selected_car(div_id,id,response.selected_car_details);    
                    }
                    else if(type == "edit_pannel")
                    {
                        $("#vehicle_validation").modal('hide');
                        disableButtons();
                        editSelectedentalcar(div_id,sendpickdate,senddropdate,id,response.selected_car_details);
                    }
                    else
                    {
                        $("#vehicle_validation").modal('hide');
                        disableButtons();
                        message(id);
                    }
                }
            }
        }
        xmlhttp.open("POST", resourceURL, true);
        xmlhttp.withCredentials = true;
        xmlhttp.credentials = "include";
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
        xmlhttp.send(data);
    }
}

function check_towncar_price(id)
{
    if(id)
    {
        var resourceURL = `${baseIP}/api/sabre/validateTownCarPrice`;

        document.getElementById("vehicle_validation_result").innerHTML = `<img src="/images/flight_valdiating.gif" style="width: 20%;"> <strong> Validating the Selected Car. </strong>`;

        //trigger a popup here
        $("#vehicle_validation").modal({ backdrop: 'static', keyboard: false });

        var data_pre = { car_id : id };
        var data = JSON.stringify(data_pre);

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() 
        {
            if (this.readyState == 4 && this.status == 200) 
            {
                var response = JSON.parse(this.responseText);
                if(!response.success)
                {
                    if(response.message)
                    {
                        document.getElementById("vehicle_validation_result").innerHTML = `${ response.message }! Please select another.`;
                        document.getElementById("vehicle_validate_footer").style.display = "block";
                    }
                    else
                    {
                        document.getElementById("vehicle_validation_result").innerHTML = "Vehicle price is not valdiated";
                    }
                }
                else
                {
                    $("#vehicle_validation").modal('hide');
                    disableButtons();
                    message(id);
                }
            }
        }
        xmlhttp.open("POST", resourceURL, true);
        xmlhttp.withCredentials = true;
        xmlhttp.credentials = "include";
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
        xmlhttp.send(data);
    }
}

// This function will display all the reservation infromation at the end of chate, just before the reservation confirmation message
// Will be removed shortly
function ensureDetails()
{
    var resourceURL = `${baseIP}/api/save/ensuringFinalDetails`;

    var msgLoaderImage = "<div class='loading-img' id='loading-img-2'><img src='/images/loader.gif'></div>";
    appendChatLoader(msgLoaderImage);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {
            var loader = document.getElementById("loading-img-2");
            if(loader) { loader.remove() };

            var respObj = JSON.parse(this.responseText);
            var textToShow = respObj.ensureDetails;
            appendChatData(textToShow);
            saveReservationData();
        }
    }
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send();
}

// This function will show the country (airport iata) list in select box where the user can search the desired city/airport. PART.1
function addAjaxSelect()
{
    var exmpaleID = "#example" + selectCount;
    var parentElement = `#div_example${selectCount}`;
        $('#msg-body').find(exmpaleID).select2({
            placeholder : 'Please type to search city',
            minimumInputLength: 3, 
            ajax: { 
                url: `${baseIP}/api/localQuery/select2DataSearch`, 
                dataType: 'json',
                xhrFields: {
                    withCredentials: true,
                    credentials : "include"
                 },
                type: "POST",
                data: function (term) {
                    return {
                        term: term
                    };
                },
                processResults: function (data) {
                   if(data != null)
                    {
                        var res = data.map(function (item) {
                            return {id: item.code, text: `<div> <b> ${item.code} </b> <br> ${item.name} , ${item.country} , ${item.city}. </div>` };
                        });
                        return {
                            results: res
                        }; 
                    }
                    else
                    {
                        return {text: "Nothing Found"};      
                    }
                },
            },
            escapeMarkup: function (markup) { return markup; }, 
            templateSelection: formatRepoSelection
        }).on('select2:open', function(params) { 

            if(this.dropdown)
            {
                this.dropdown._resizeDropdown(); 
                this.dropdown._positionDropdown();
            }
            
        });
    selectCount++;
}

// This function will handle the  PART.2
function formatRepoSelection (data) 
{
    //Provide back the selection id to the select 2
    return data.id;
}

//Function for viewing checkboxes to get the required reservation types
function getReservationTypesDetailsForm()
{
    //Disabling Functionality
    disbaleFunctionality();

    var resourceURL = `${baseIP}/api/save/getReservationTypesDetails`;

    var msgLoaderImage = "<div class='loading-img' id='loading-img-2'><img src='/images/loader.gif'></div>";
    appendChatLoader(msgLoaderImage);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {

            //Enabling Functionality
            enableFunctionality();

            var loader = document.getElementById("loading-img-2");
            if(loader) { loader.remove() };

            var respObj = JSON.parse(this.responseText);
            var textToShow = respObj.textToShow;
            appendChatData(textToShow);
        }
    }
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send();
}

//      ** FUNCTIONS THAT SEND MESSAGE TO BOT **      //

//=====================================================//

//=====================================================//

//     ** FUNCTION THAT HANDLES TYPING IN CHAT **      //

// This function is responsible for getting the input value to client and validate it
function sendMessageBot()
{

    var mainMessage = document.getElementById("chat-input");
    var DateAndTime = document.getElementById("DateAndTime");
    var timeInput = document.getElementById("timeInput");
    var Date = document.getElementById("Date");
    var demo = document.getElementById("demo");

    if(mainMessage.value)
    {
        validateUserInput(mainMessage.value);
        mainMessage.value = "";
    }
    else if(DateAndTime.value)
    {
        validateUserInput(DateAndTime.value);
        DateAndTime.value = "";
    }
    else if(timeInput.value)
    {
        validateUserInput(timeInput.value);
        timeInput.value = "";
    }
    else if(Date.value)
    {
        validateUserInput(Date.value);
        Date.value = "";
    }
    else if(demo.value)
    {
        validateUserInput(demo.value);
        demo.value = "";
    }
    else
    {
        var chatAlert = document.getElementById("chat-alert");
        chatAlert.style.display = "block";
        chatAlert.innerHTML = "Please type something to send!";
        setTimeout(()=>{ chatAlert.style.display = "none"; }, 2000);
    }
}

//Function for validation of input
function validateUserInput(data)
{
    if(data != "")
    {
        //Validating the data types
        if(requiredDataType === "Date")
        {
            var check = data.match(dateRegx);
            if(check && check != undefined)
            {
                if(personalInfoUpdationMode)
                {
                    verifyTravelerInfo(data, null);
                    personalInfoUpdationMode = false;
                }
                else
                {
                    message(data);
                    disableButtons();   
                }
            }
            else
            {
                var chatInputValue = document.getElementById('chat-input');
                if(chatInputValue.value)
                {
                    chatInputValue.value = "";
                }

                var showMsg = `<div class='msg-row'><div class='user-msg sent'><div class='avator-icon'><img src='/images/avatar-img-02.png'></div><p>${data}</p></div></div>`;
                appendChatData(showMsg);
                var textToSHow = "<div class='msg-row'><div class='user-msg receive'><div class='avator-icon'><img src='/images/avatar-img-01.png'></div><p>That doesn't look like a valid date. Please enter a valid one. Required Format : mm-dd-yyyy </p></div></div>";
                setTimeout(()=>{
                    appendChatData(textToSHow);
                },3000);
            }
        }
        else if(requiredDataType === "Time")
        {

            var check = data.match(timeRegx);
            if(check && check != undefined)
            {
                if(personalInfoUpdationMode)
                {
                    verifyTravelerInfo(data, null);
                    personalInfoUpdationMode = false;
                }
                else
                {
                    message(data);
                    disableButtons();
                }
            }
            else
            {
                var chatInputValue = document.getElementById('chat-input');
                if(chatInputValue.value)
                {
                    chatInputValue.value = "";
                }

                var showMsg = `<div class='msg-row'><div class='user-msg sent'><div class='avator-icon'><img src='/images/avatar-img-02.png'></div><p>${data}</p></div></div>`;
                appendChatData(showMsg);

                var textToSHow = "<div class='msg-row'><div class='user-msg receive'><div class='avator-icon'><img src='/images/avatar-img-01.png'></div><p>That doesn't look like a valid time. Please enter a valid one. <br> Required Format : 'xx:xx' <i>Sample : 13:59</i></p></div></div>";
                
                setTimeout(()=>{
                    appendChatData(textToSHow);
                },3000);
            }
        }
        else if(requiredDataType === "Decision")
        {
            if(data === "Yes" || data === "No" || data === "yes" || data === "no")
            {
                if(personalInfoUpdationMode)
                {
                    verifyTravelerInfo(data, null);
                    personalInfoUpdationMode = false;
                }
                else
                {
                    message(data);
                    disableButtons();
                }
            }
            else
            {
                var chatInputValue = document.getElementById('chat-input');
                if(chatInputValue.value)
                {
                    chatInputValue.value = "";
                }

                var showMsg = `<div class='msg-row'><div class='user-msg sent'><div class='avator-icon'><img src='/images/avatar-img-02.png'></div><p>${data}</p></div></div>`;
                appendChatData(showMsg);

                var textToSHow = "<div class='msg-row'><div class='user-msg receive'><div class='avator-icon'><img src='/images/avatar-img-01.png'></div><p>That doesn't look like a valid input. Please enter a valid one. <br> Required Format : 'Yes or No'</p></div></div>";
               
                setTimeout(()=>{
                    document.getElementById("loading-img-2").remove();
                    appendChatData(textToSHow);
                },3000);
            }
        }
        else if(requiredDataType === "Email")
        {

            var chatInputValue = document.getElementById('chat-input');
            if(chatInputValue.value)
            {
                chatInputValue.value = "";
            }

            Email = true;
            var check = data.match(reqExpForEmail);
            if(check && check != undefined)
            {
                if(personalInfoUpdationMode)
                {
                    verifyTravelerInfo(data, null);
                    personalInfoUpdationMode = false;
                }
                else
                {
                    message(data);
                    disableButtons();
                }
            }
            else
            {
                var chatInputValue = document.getElementById('chat-input');
                if(chatInputValue.value)
                {
                    chatInputValue.value = "";
                }

                var showMsg = `<div class='msg-row'><div class='user-msg sent'><div class='avator-icon'><img src='/images/avatar-img-02.png'></div><p>${data}</p></div></div>`;
                appendChatData(showMsg);

                var textToSHow = "<div class='msg-row'><div class='user-msg receive'><div class='avator-icon'><img src='/images/avatar-img-01.png'></div><p>That doesn't look like a valid email address. Please enter a valid one. <br> Required Format : 'xxx@email.com' <i>Sample : example@gmail.com</i></p></div></div>";
                
                setTimeout(()=>{
                    appendChatData(textToSHow);
                },3000);
            }
        }
        else if(requiredDataType === "Phone")
        {
            var check = data.match(phoneRegx);
            if(check && check != undefined)
            {
                if(personalInfoUpdationMode)
                {
                    verifyTravelerInfo(data, null);
                    personalInfoUpdationMode = false;
                }
                else
                {
                    message(data);
                    disableButtons();
                }
            }
            else
            {
                var chatInputValue = document.getElementById('chat-input');
                if(chatInputValue.value)
                {
                    chatInputValue.value = "";
                }

                var showMsg = `<div class='msg-row'><div class='user-msg sent'><div class='avator-icon'><img src='/images/avatar-img-02.png'></div><p>${data}</p></div></div>`;
                appendChatData(showMsg);

                var textToSHow = "<div class='msg-row'><div class='user-msg receive'><div class='avator-icon'><img src='/images/avatar-img-01.png'></div><p>That doesn't look like a valid number. Please enter a valid one. <br> Required Format : '00XXXXXXXXXXXXX'</p></div></div>";
                
                setTimeout(()=>{
                    appendChatData(textToSHow);
                },3000);
            }
        }
        else if(requiredDataType === "Select")
        {
            var chatInputValue = document.getElementById('chat-input');
            if(chatInputValue.value)
            {
                chatInputValue.value = "";
            }

            var showMsg = `<div class='msg-row'><div class='user-msg sent'><div class='avator-icon'><img src='/images/avatar-img-02.png'></div><p>${data}</p></div></div>`;
            appendChatData(showMsg);

            var textToSHow = "<div class='msg-row'><div class='user-msg receive'><div class='avator-icon'><img src='/images/avatar-img-01.png'></div><p>Please select from the options provided above.</p></div></div>";
            
            setTimeout(()=>{
                    appendChatData(textToSHow);
            },3000);
        }
        else if(requiredDataType === "Text")
        {
            if(personalInfoUpdationMode)
            {
                verifyTravelerInfo(data, null);
                personalInfoUpdationMode = false;
            }
            else
            {
                message(data);
                disableButtons();
            }

            var chat_input = document.getElementById("chat-input");
            var date_input = document.getElementById("Date");
            var dateTime_input = document.getElementById("DateAndTime");

            chat_input.disabled = false;
            date_input.disabled = false;
            dateTime_input.disabled = false;
        }
        else if(requiredDataType === "address")
        {
            
            message(data);
            disableButtons();

            var chat_input = document.getElementById("chat-input");
            var date_input = document.getElementById("Date");
            var dateTime_input = document.getElementById("DateAndTime");

            chat_input.disabled = false;
            date_input.disabled = false;
            dateTime_input.disabled = false;
        }
        else if(requiredDataType === "Number")
        {
            var check = data.match(number);
            if(check && check != undefined)
            {
                if(personalInfoUpdationMode)
                {
                    verifyTravelerInfo(data, null);
                    personalInfoUpdationMode = false;
                }
                else
                {
                    message(data);
                    disableButtons();
                }
            }
            else
            {
                var chatInputValue = document.getElementById('chat-input');
                if(chatInputValue.value)
                {
                    chatInputValue.value = "";
                }

                var showMsg = `<div class='msg-row'><div class='user-msg sent'><div class='avator-icon'><img src='/images/avatar-img-02.png'></div><p>${data}</p></div></div>`;
                appendChatData(showMsg);

                var textToSHow = "<div class='msg-row'><div class='user-msg receive'><div class='avator-icon'><img src='/images/avatar-img-01.png'></div><p>That doesn't look like a valid number. Please enter a valid one.</p></div></div>";
                setTimeout(()=>{
                    appendChatData(textToSHow);
                },3000);
            }
        }
        else if(requiredDataType === "DateAndTime")
        {
            message(data);
            disableButtons();
        }
        else if(requiredDataType === "DateRange")
        {
            message(data);
            disableButtons();
        }
    }
    else
    {
        var chatAlert = document.getElementById("chat-alert");
        chatAlert.style.display = "block";
        chatAlert.innerHTML = "Please type something to send!";
        setTimeout(()=>{ chatAlert.style.display = "none"; }, 2000);
    }
}

//     ** FUNCTION THAT HANDLES TYPING IN CHAT **      //

//=====================================================//




//=====================================================//
 
//      ** FUNCTION THAT APPEND DATA TO CHAT **        //


// Function for append text responses (Like forms, select and strings)
function appendChatData(data)
{

    document.getElementById("chat-footer").style.display = "none";
    $('#chat-box').removeClass('add-footer');

    var min_date_range = new Date(new Date().getTime()+(2*24*60*60*1000));

    if(departure_date_range && return_date_range)
    {
        var min_date = new Date(departure_date_range);
        var max_date = new Date(return_date_range);
    }

    if(data)
    {
        //Manipulating Input Mask
        if(requiredDataType === "DateAndTime")
        {   
            document.getElementById("chat-footer").style.display = "flex";
            $('#chat-box').addClass('add-footer');

            var chat_input = document.getElementById("chat-input");
            var DateAndTime_input = document.getElementById("DateAndTime");
            var Date_input = document.getElementById("Date");
            var timeInput_input = document.getElementById("timeInput");
            var chat_icons = document.getElementById("chat-icons");

            document.getElementById("DateAndTime").style.display = "block";
            document.getElementById("chat-input").style.display = "none";
            document.getElementById("timeInput").style.display = "none";
            document.getElementById("Date").style.display = "none";
            document.getElementById("demo").style.display = "none";
            
            if(chat_icons)
            {
                chat_icons.style.pointerEvents = "auto";
            }
            
            $( document ).ready(() => { 
                $('#DateAndTime').datetimepicker({ sideBySide: true, format: 'YYYY-MM-DD HH:mm' });
                $('#DateAndTime').data("DateTimePicker").maxDate(max_date); 
                $('#DateAndTime').data("DateTimePicker").minDate(min_date); 
                $('#DateAndTime').focus();
            });

            //Accessing if the ENTER key is pressed
            var chatInputText = document.getElementById("DateAndTime");
            chatInputText.addEventListener("keydown", function (e) {
                var msgTextBoxValue = chatInputText.value;
                if (e.keyCode === 13) 
                {
                    if((msgTextBoxValue.trim()) != 0)
                    {
                        validateUserInput(msgTextBoxValue);
                        chatInputText.value = "";
                    }
                }
            }); 
        }
        else if(requiredDataType === "Time")
        {

            document.getElementById("chat-footer").style.display = "flex";
            $('#chat-box').addClass('add-footer');

            var chat_input = document.getElementById("chat-input");
            var DateAndTime_input = document.getElementById("DateAndTime");
            var Date_input = document.getElementById("Date");
            var timeInput_input = document.getElementById("timeInput");
            var chat_icons = document.getElementById("chat-icons");
            
            if(chat_icons)
            {
                chat_icons.style.pointerEvents = "auto";
            }

            $( document ).ready(() => { 
                $('#timeInput').datetimepicker({ format: 'LT', format: 'HH:mm' }); 
                $('#timeInput').focus(); 
            });

            document.getElementById("DateAndTime").style.display = "none";
            document.getElementById("chat-input").style.display = "none";
            document.getElementById("timeInput").style.display = "block";
            document.getElementById("Date").style.display = "none";
            document.getElementById("demo").style.display = "none";

            //Accessing if the ENTER key is pressed
            var chatInputText = document.getElementById("timeInput");
            chatInputText.addEventListener("keydown", function (e) {
                var msgTextBoxValue = chatInputText.value;
                if (e.keyCode === 13) 
                {
                    if((msgTextBoxValue.trim()) != 0)
                    {
                        validateUserInput(msgTextBoxValue);
                        chatInputText.value = "";
                    }
                }
            }); 
        }
        else if(requiredDataType === "Date")
        {

            document.getElementById("chat-footer").style.display = "flex";
            $('#chat-box').addClass('add-footer');

            var chat_input = document.getElementById("chat-input");
            var DateAndTime_input = document.getElementById("DateAndTime");
            var Date_input = document.getElementById("Date");
            var timeInput_input = document.getElementById("timeInput");
            var chat_icons = document.getElementById("chat-icons");
            
            if(chat_icons)
            {
                chat_icons.style.pointerEvents = "auto";
            }

            $( document ).ready(() => { 
                $('#Date').datetimepicker({ format: 'LD', format: 'MM-DD-YYYY' }); 
                $('#Date').data("DateTimePicker").minDate(min_date); 
                $('#Date').data("DateTimePicker").maxDate(max_date); 
                $('#Date').focus(); 
            });

            document.getElementById("DateAndTime").style.display = "none";
            document.getElementById("Date").style.display = "block";
            document.getElementById("chat-input").style.display = "none";
            document.getElementById("timeInput").style.display = "none";
            document.getElementById("demo").style.display = "none";

            //Accessing if the ENTER key is pressed
            var chatInputText = document.getElementById("Date");
            chatInputText.addEventListener("keydown", function (e) {
                var msgTextBoxValue = chatInputText.value;
                if (e.keyCode === 13) 
                {
                    if((msgTextBoxValue.trim()) != 0)
                    {
                        validateUserInput(msgTextBoxValue);
                        chatInputText.value = "";
                    }
                }
            }); 
        }
        else if(requiredDataType ===  "DateRange")
        {
            document.getElementById("chat-footer").style.display = "flex";
            $('#chat-box').addClass('add-footer');

            var chat_input = document.getElementById("chat-input");
            var DateAndTime_input = document.getElementById("DateAndTime");
            var Date_input = document.getElementById("Date");
            var timeInput_input = document.getElementById("timeInput");
            var chat_icons = document.getElementById("chat-icons");

            if(chat_icons)
            {
                chat_icons.style.pointerEvents = "auto";
            }
            $( document ).ready(() => {
                $('#demo').daterangepicker({
                    "showISOWeekNumbers": true,
                    "timePicker": true,
                    "autoUpdateInput": true,
                    "minDate": min_date_range,
                    "locale": {
                        "cancelLabel": 'Clear',
                        "format": "YYYY-MM-DD HH:mm",
                        "separator": " To ",
                        "applyLabel": "Ok",
                        "fromLabel": "From",
                        "toLabel": "To",
                        "customRangeLabel": "Custom",
                        "weekLabel": "W",
                        "daysOfWeek": [
                            "Su",
                            "Mo",
                            "Tu",
                            "We",
                            "Th",
                            "Fr",
                            "Sa"
                        ],
                        "monthNames": [
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December"
                        ]
                    },
                    "linkedCalendars": true,
                    "showCustomRangeLabel": false,
                    "opens": "right"
                });
                $('#demo').focus();
            });

            document.getElementById("DateAndTime").style.display = "none";
            document.getElementById("Date").style.display = "none";
            document.getElementById("chat-input").style.display = "none";
            document.getElementById("timeInput").style.display = "none";
            document.getElementById("demo").style.display = "block";
        }
        else if(requiredDataType === "Form")
        {
            var chat_input = document.getElementById("chat-input");
            var DateAndTime_input = document.getElementById("DateAndTime");
            var Date_input = document.getElementById("Date");
            var timeInput_input = document.getElementById("timeInput");
            var chat_icons = document.getElementById("chat-icons");

            if(chat_icons)
            {
                chat_icons.style.pointerEvents = "none";
            }
            
            if(chat_input)
            {
                chat_input.disabled = true;
            }
            
            if(DateAndTime_input)
            {
                DateAndTime_input.disabled = true;
            }
            
            if(Date_input)
            {
                Date_input.disabled = true;
            }

            if(timeInput_input)
            {
                timeInput_input.disabled = true;
            }
        }
        else if(requiredDataType === "address")
        {
            document.getElementById("chat-footer").style.display = "flex";
            $('#chat-box').addClass('add-footer');
            document.getElementById("DateAndTime").style.display = "none";
            document.getElementById("chat-input").style.display = "block";
            document.getElementById("timeInput").style.display = "none";
            document.getElementById("Date").style.display = "none";
            document.getElementById("demo").style.display = "none";
        }
        else if(requiredDataType === "Email")
        {
            document.getElementById("chat-footer").style.display = "flex";
            $('#chat-box').addClass('add-footer');
            document.getElementById("DateAndTime").style.display = "none";
            document.getElementById("chat-input").style.display = "block";
            document.getElementById("timeInput").style.display = "none";
            document.getElementById("Date").style.display = "none";
            document.getElementById("demo").style.display = "none";
        }
        else
        {
            document.getElementById("DateAndTime").style.display = "none";
            document.getElementById("chat-input").style.display = "block";
            document.getElementById("timeInput").style.display = "none";
            document.getElementById("Date").style.display = "none";
            document.getElementById("demo").style.display = "none";

            var chat_input = document.getElementById("chat-input");
            var DateAndTime_input = document.getElementById("DateAndTime");
            var Date_input = document.getElementById("Date");
            var timeInput_input = document.getElementById("timeInput");
            var chat_icons = document.getElementById("chat-icons");
            
            if(chat_icons)
            {
                chat_icons.style.pointerEvents = "auto";
            }

            if(chat_input)
            {
                chat_input.disabled = false;
            }
            
            if(DateAndTime_input)
            {
                DateAndTime_input.disabled = false;
            }
            
            if(Date_input)
            {
                Date_input.disabled = false;
            }
            

            if(timeInput_input)
            {
                timeInput_input.disabled = false;
            }
        }
    
        var res1        =   data.match(/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]/gi);
        var res2        =   data.match(/[0-9][0-9]-[0-9][0-9]-[0-9][0-9][0-9][0-9]/gi);
        var timeRegx    =   data.match(/[0-9][0-9]:[0-9][0-9]:[0-9][0-9]/gi);

        if(res1 != null)
        {
            var dataUpdated = data;

            for(var i = 0; i < res1.length; i++)
            {
                var date = moment(res1[i], 'YYYY-MM-DD');
                var newVersion = moment(date).format('Do of MMMM, YYYY');
                dataUpdated = dataUpdated.replace(res1[i], newVersion);
            }
        }
        else if(res2 != null)
        {
            var dataUpdated = data;

            for(var i = 0; i < res2.length; i++)
            {
                var date = moment(res2[i], 'MM-DD-YYYY');
                var newVersion = moment(date).format('Do of MMMM, YYYY');
                dataUpdated = dataUpdated.replace(res2[i], newVersion);    
            }
        }
        else
        {
           if($('[id*="hotel_rooms"]')){
            $('[id*="hotel_rooms"]').remove();
           }
           $(data).hide().appendTo('#msg-body').fadeIn(); 
        }

        if(timeRegx != null)
        {
            if(dataUpdated == null)
            {
                var dataUpdated = data;
            }

            for(var i = 0; i < timeRegx.length; i++)
            {
                var newVersion = timeRegx[i];
                dataUpdated = dataUpdated.replace(timeRegx[i], newVersion);
            }
        }

        if(requiredDataType != "Text" && requiredDataType != "Form") //&& requiredDataType != "Select"
        {
            $(dataUpdated).hide().appendTo('#msg-body').fadeIn();
        }

        $("#chat-body").animate({ scrollTop: 20000000 }, "slow");

        if (data.indexOf('datepicker') > -1) 
        {
            addDatePicker();
        }
        else if(data.indexOf('selectOptions') > -1)
        {
            $('.selectOptions').select2();
        }
        else if(data.indexOf('timePicker') > -1)
        {
            addTimePicker();
        } 
        else if(data.indexOf('example' + selectCount) > -1)
        {
            addAjaxSelect();
        } 
    }
}

// Function for appending message waiting loader
function appendChatLoader(data)
{
    $(data).hide().appendTo('#chat-body').fadeIn();
    $("#chat-body").animate({ scrollTop: 20000000 }, "slow");
    //$('#msg-body').scrollTop( $('#msg-body' ).prop('scrollHeight'));  
}

//      ** FUNCTION THAT APPEND DATA TO CHAT **        //

//=====================================================//




//=====================================================//

//    ** FUNCTIONS THAT HANDLES CHAT SESSION  **       //

function startTimer()
{
    $(".chat-box").removeClass("delay-time");
    intervalVar = setInterval(timer, 1000);
}

function timer()
{
    totalSeconds++;
    
    if(totalSeconds == 3600) //300
    {
        sessionExpiration();
    }

    if(totalSeconds >= 3659) //280
    {
        document.getElementById("remaining_time").innerHTML = allowesIdleinterval--;
        $("#sessionAlert").modal({ backdrop: 'static', keyboard: false });
    }
}

function resetTimer()
{
    allowesIdleinterval = 10;
    totalSeconds = 0; 
}

function sessionExpiration()
{ 
    $("#sessionExpire").modal({ backdrop: 'static', keyboard: false }); 
    $('#sessionAlert').modal('toggle');

    clearInterval(intervalVar);
    resetTimer();
}

function keepSessionAlive()
{
    var resourceURL =   `${baseIP}/api/watson/keepSessionAlive`
    var preData     =   { msg : "Alive", sessionID : sessionID };
    var data        =   JSON.stringify(preData);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {
            var response = this.responseText;
            resetTimer();
        }
    }
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

//    ** FUNCTIONS THAT HANDLES CHAT SESSION  **       //

//=====================================================//

//=====================================================//

//          ** MISCELLANEOUS FUNCTIONS  **             //

// This function will convert teh 24 hours time format to 12 hours
function tConvert(time) {
    var timeString = time;
    var H = +timeString.substr(0, 2);
    var h = (H % 12) || 12;
    var ampm = H < 12 ? " AM" : " PM";
    timeString = h + timeString.substr(2, 3) + ampm;
    return timeString;
}

// This function will format the time and convert UTC time to 12 hours format
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

// This function will convert the number of minutes into hours and minutes
function timeConvert(n) {
    var num = n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    return rhours + " H(s) and " + rminutes + " M(s)";
}

// This function will extract time (24 hours) from the timestamp  
function changeTime(timeStamp)
{
    
    var h = new Date(timeStamp).getHours();
    var m = new Date(timeStamp).getMinutes();
    
    h = (h<10) ? '0' + h : h;
    m = (m<10) ? '0' + m : m;
    var output = h + ':' + m;
    return output;
}

// This function will hide the chat input and chat icons when required (Like when chat session is closed)
function hideThings()
{
    $( document ).ready( ()=> { $('.chat-box').addClass("complete-chat"); } );
    //document.getElementsByClassName('chat-input')[0].style.visibility = 'hidden';
    //document.getElementsByClassName('chat-icons')[0].style.visibility = 'hidden';
}

// This function will re launch the chat bot, when required
function relauchChat()
{
    window.stop();
    document.getElementById("translate-loadding").style.display = "none";
    document.getElementById("left-chat-panel-suggestion").innerHTML = "";
    document.getElementById("left-chat-panel-details").innerHTML = "";
    $( document ).ready(()=>{ $('#left-chat-panel-suggestion').hide(); });
    $( document ).ready(()=>{ $('#left-chat-panel').hide(); });
    $( document ).ready(()=>{ $('#chat-footer').css('padding-left', '0px') });

    if(document.getElementById("loading-img-2"))
    {
        document.getElementById("loading-img-2").remove();
    }
    
    var chatMinimizeButton = document.getElementById('chat-minimize-button');
    var chatButon = document.getElementById('chat-launch-button');
    var chatBody = document.getElementById('chat-body');
    var chatAlert = document.getElementById('chat-alert');
    var exisitngChatBody = document.getElementById('msg-body');

    $(".chat-body").addClass("chat-logo-relaunch");
    $(".chat-box").slideToggle();

    $(document).ready(()=>{ $('.chat-box').removeClass("complete-chat"); });

    chatMinimizeButton.style.display = "none";
    setTimeout(()=>{
        chatAlert.style.display = "none";
        chatButon.style.display = "block";
        exisitngChatBody.innerHTML = "";
        $('.msg-row').remove();
        $('.select').remove();
        launchChatBot(currentUserID);
        document.getElementById('chat-loadding').style.display = "block";
        $(".chat-box").slideToggle();
    },1000);
}

// This function will disbale each and every HTML element where the class "disbaleIt" is added
function disableButtons()
{
    var elems = document.getElementsByClassName("disableIt");
    for(var i = 0; i < elems.length; i++) {
        elems[i].disabled = true;
    }
}

// This function will convert the string date (numeric) into readable (Text format)
function dateFormatter(dateString)
{   
    //configuring the date
    return moment.utc(dateString).format('Do of MMMM, YYYY');
}

// The function to remove the class "" from the required element. It used in accordian (Sabre flight search)
function removeClass(id)
{
    //removing selected class from low flight search accordian
    $(`#${id}`).removeClass('selected-tab');
}

// This function is called just before closing the chat. It will trigger the server to store all the reservation data to DB
function saveReservationData(type="empty",id="empty")
{
    id = id.toString();
    var id_number =  id.charAt(id.length-1);

    //Disabling functionality
    disbaleFunctionality();

    var msgLoaderImage = "<div class='loading-img' id='loading-img-2'><img src='/images/loader.gif'></div>";
    appendChatLoader(msgLoaderImage);

    let resourceURL = `${baseIP}/api/save/migrateToDB`;
    if(type=="false")
    {
        var dataPre = { operation : "storeData",type:"previous",id_number:id_number };
    }else
    {
        var dataPre = { operation : "storeData" };
    }

    var data = JSON.stringify(dataPre);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {
            //Enabling functionality
            enableFunctionality();

            var loader = document.getElementById("loading-img-2");
            if(loader) { loader.remove() };
            var test = this.responseText;
            message("Yes");
        }
    }
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

// This function is used where their is numeric value along with ID in storing and updating traveler infromation 
function trimStr(str) 
{
    if(!str) return str;
    return str.replace(/^\s+|\s+$/g, '');
}

function addClosingClass(id)
{
    //adding class to close a accordian div
    $(`#${id}`).addClass('selected-tab');
}

function updateFlightTime()
{

    //Disabling functionality
    disbaleFunctionality();

    var baseIP = `${baseIP}/api/sabre/getFlightDetails`;

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {

            //Enabling Functionality
            enableFunctionality();

            var respObj = JSON.parse(this.responseText);
        }
    }
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

//Previous reservation search flight
function search_query1()
{
    var temp = [];
    var input_value = document.getElementsByClassName("to_search");
    var filter_pre = document.getElementById("search_item").value;
    var to_hide = document.getElementsByClassName("to_hide");
    var no_data = document.getElementById("no_data");
    var filter = filter_pre.toUpperCase();

    for(var i = 0; i < input_value.length; i++)
    {
        var item_value_pre = input_value[i].innerHTML;
        var item_value = item_value_pre.toUpperCase();

        if(item_value.indexOf(filter) > -1)
        {
            temp.push(1);
            to_hide[i].style.display = "block";
        }
        else
        {
            to_hide[i].style.display = "none";
        }
    }

    if(temp.length == 0)
    {
        no_data.style.display = "block";
    }
    else
    {
        no_data.style.display = "none";
    }
}

function cloneReservation()
{   
    //Disbaling Functionality
    disbaleFunctionality();

    var resourceURL = `${baseIP}/api/save/migrateToDB`;

    //Appending Mesage Loader Image
    var msgLoaderImage = "<div class='loading-img' id='loading-img-2'><img src='/images/loader.gif'></div>";
    appendChatLoader(msgLoaderImage);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {

            //Enabling Functionality
            enableFunctionality();

            var loader = document.getElementById("loading-img-2");
            if(loader) { loader.remove() };

            var respObj = JSON.parse(this.responseText);
            if(respObj.status == 1)
            {
                // var msgLoaderImage = "<div class='loading-img' id='loading-img-2'><img src='/images/loader.gif'></div>";
                // appendChatLoader(msgLoaderImage);
                message("yes");
            }
            else
            {
                // var msgLoaderImage = "<div class='loading-img' id='loading-img-2'><img src='/images/loader.gif'></div>";
                // appendChatLoader(msgLoaderImage);
                message("no");
            }
        }
    }
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send();
}

//To disable the chat icons.
function disbaleFunctionality()
{

    //Disabling chat inputs
    document.getElementById("chat-input").disabled = true;
    document.getElementById("DateAndTime").disabled = true;
    document.getElementById("Date").disabled = true;
    document.getElementById("timeInput").disabled = true;

    //Disabling Send Button
    document.getElementById("send-btn").style.pointerEvents="none";
    document.getElementById("send-btn").style.cursor="default";

    //Disabling MIC Icon
    document.getElementById("mic-on").style.pointerEvents="none";
    document.getElementById("mic-on").style.cursor="default";
}

//To enable the chat icons.
function enableFunctionality()
{  

    //Enabling chat inputs
    document.getElementById("chat-input").disabled = false;
    document.getElementById("DateAndTime").disabled = false;
    document.getElementById("Date").disabled = false;
    document.getElementById("timeInput").disabled = false;

    //Enabling Send Button
    document.getElementById("send-btn").style.pointerEvents="auto";
    document.getElementById("send-btn").style.cursor="pointer";

    //Enabling MIC Icon
    document.getElementById("mic-on").style.pointerEvents="auto";
    document.getElementById("mic-on").style.cursor="pointer";
}

//          ** MISCELLANEOUS FUNCTIONS  **             //

//=====================================================//




//=====================================================//

//          ** SPEECH TO TEXT FUNCTIONS  **            //

// This function is initialized when the user clicks on mic icon provided along the chat bot.
// It will record buffer using webRTC and send to the server using socket.io
function initiateSTT()
{

    //Disabling Functionality
    disbaleFunctionality();

    if(location.protocol === "https:")
    {
        $(".gif-box-on").slideToggle();

        var recordAudio =   null;
        var micON       =   document.getElementById('mic-on');
        var micOFF      =   document.getElementById('mic-off');

        micON.style.display     =   "none";
        micOFF.style.display    =   "block";

        const socketio = io(baseIP);
        $('.chat-box').addClass('audio-start');
        
        var socket = socketio.on('connect', function() 
        {
            const context = { 
                audio : true, 
                video : false 
            };

            navigator.getUserMedia( { audio: true }, function(stream) 
            {
                recordAudio = RecordRTC(stream, { type: 'audio', recorderType: StereoAudioRecorder, desiredSampRate: 16000 });
                recordAudio.startRecording();
            
            }, function(error) 
            {
                console.error(JSON.stringify(error));
            });
        
        });

        micOFF.onclick = function() 
        {
            $(".gif-box-on").slideToggle();
            $('.chat-box').removeClass('audio-start');

            micON.style.display = "block";
            micOFF.style.display = "none";
            
            recordAudio.stopRecording(function() 
            {
                recordAudio.getDataURL(function(audioDataURL) 
                {
                    var files = 
                    { 
                        audio: { 
                            type: recordAudio.getBlob().type, 
                            dataURL: audioDataURL 
                        }
                    };
                    socketio.emit('voiceData', files);
                });
            });
        };

        //STT result received from the server
        socketio.on('results', function (data) {

            enableFunctionality();

            $(".gif-box-off").slideToggle();
            if(data.VoiceError === null)
            {
                var message_pre = data.msg;
                var message = message_pre.toUpperCase();
                analyzeVoiceInput(message);
            }
            else
            {
                $( document ).ready(()=>{ $('#voiceError').click() });
            }
            socket.disconnect();
        });
        
    }
    else
    {
        $('#voiceSSLError').click();
    }
}

function analyzeVoiceInput(text)
{

    if(text != "" && text != null)
    {

        if(select_country === true)
        {
            checkCityName(text);
        }
        else
        {
            var match = 0;
            for(var i = 0; i < current_selection_option.length; i++)
            {
                var avail_options_pre = current_selection_option[i];
                var avail_options = avail_options_pre.toUpperCase();

                if(text.match(avail_options) != null)
                {
                    match = 1;
                    sendMessage(current_selection_option[i]);
                }
                else if(avail_options.match(text) != null) 
                {
                    match = 1
                    sendMessage(current_selection_option[i]);
                }
            }

            if(match == 0){ alert("Please speak again."); };
        }
    }
    else
    {
        $( document ).ready(()=>{ $('#voiceError').click() });
    }
    
}

function checkCityName(name)
{

    var resourceURL = `${baseIP}/api/localQuery/checkCityName`;
    var dataPre = { "city_name" : name.trim() };
    var data = JSON.stringify(dataPre);

    //Disbaling functionality
    disbaleFunctionality();

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {

            //Enabling functionality
            enableFunctionality();

            var resp_obj = JSON.parse(this.response);

            if(resp_obj.valid)
            {
                sendMessage(name);
            }
            else
            {
                $( document ).ready(()=>{ $('#voiceError').click() });
            }
        }
    }
    xhttp.open("POST", resourceURL, true);
    xhttp.withCredentials = true;
    xhttp.credentials = "include";
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(data);
}

//          ** SPEECH TO TEXT FUNCTIONS  **            //

//=====================================================//



//=====================================================//

//          ** TEXT TO SPEECH FUNCTION  **            //

// This function will convert the text message to voice and user will listen it on the speaker
function tts(toSpeak)
{
    var resourceURL = `${baseIP}/api/watson/tts`;
    var dataPre = { "text" : toSpeak };
    var data = JSON.stringify(dataPre);

    var xhttp = new XMLHttpRequest();
    xhttp.responseType = "arraybuffer";
    xhttp.onreadystatechange = function() 
    {
        //spaeking gif toggle start
        if (this.readyState == 4 && this.status == 200) 
        {
            var timeDuration;
            window.AudioContext = window.AudioContext||window.webkitAudioContext||window.mozAudioContext;
            var context = new AudioContext();
            var source = context.createBufferSource();

            context.decodeAudioData(this.response, function(buffer) 
            {
                
                $(".chat-box").addClass("bot-speaking");
                
                source.buffer = buffer;
                timeDuration = buffer.duration;
                timeDurationMilliSec = timeDuration * 1000;
                source.connect(context.destination);
                setTimeout(()=>{ $(".chat-box").removeClass("bot-speaking"); }, timeDurationMilliSec); 
                source.start(0);    
            }, null);
        }
    }
        
    xhttp.open("POST", resourceURL, true);
    xhttp.withCredentials = true;
    xhttp.credentials = "include";
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(data);
}

//          ** TEXT TO SPEECH FUNCTION  **            //

//=====================================================//




//==============================================================================//

//  ** FUNCTIONS FOR INSERTING AND UPDATING TRAVELER INFORMATION  **            //

// In this function we only pass the ID for the form and the remaining work will be done at backend.
// This will check if the infromation is requried to ask. and if the infromation is rquired, a form is appended asking for the required infromationb=
function verifyTravelerInfo(obj)
{
    //Disabling Functionality
    disbaleFunctionality();

    var resourceURL = `${baseIP}/api/travelerInformation/verifyInformation`;
    
    //Generating payload
    var preData = { purpose : "initialize", data : obj };
    var data = JSON.stringify(preData);

    //Adding message waiting loader
    var msgLoaderImage = "<div class='loading-img' id='loading-img-2'><img src='/images/loader.gif'></div>";
    appendChatLoader(msgLoaderImage);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {

            //Enabling Functionality
            enableFunctionality();

            var loader = document.getElementById("loading-img-2");
            if(loader){ loader.remove(); }

            var respObj = JSON.parse(this.responseText);

            if(respObj.status == 200)
            {
                
                var responseType = respObj.responseType;

                //Depreceated, No need to fill the form of the travellers as the profile should be done in the start of the chat
                if(responseType === "informationForm")
                {
                    //document.getElementById("loading-img-2").remove();   
                    //var textToShow =  respObj.form;
                    $( document ).ready(()=>{ $('#modal_PNF').click(); $('#email_no_profile').html(obj['travelerEmail']); });
                }

                if(responseType == "action")
                {
                    //var textToShow = respObj.textToShow;
                    //var modal_body = respObj.modal_body;
                    //$("#msg-body").append(modal_body);

                    var textToShow = respObj.textToShow;

                    if(textToShow != "" && textToShow != null && textToShow != undefined)
                    {
                        // var leftpanelBody = document.getElementById("left-chat-panel");

                        // if(leftpanelBody)
                        // {
                        //     leftpanelBody.style.display = "block";
                            // $( document ).ready(()=>{ $('.chat-box').addClass("open-reservation"); });
                        // }

                        //Showing traveler infromation at the left pannel
                        //var html = `<div class="chat-panel"> <div class="chat-panel-header"> <h3>TRAVELER INFORMATION</h3> </div> <div class="chat-panel-body"> <p><span>First Name:</span> ${travelerInfromationArray[0].value} </p> <p><span>Last Name:</span> ${travelerInfromationArray[1].value} </p> <p><span>E-mail:</span> ${travelerInfromationArray[2].value} </p> <p><span>Phone Number:</span>${travelerInfromationArray[3].value} </p> <p><span>Employee Number:</span> ${travelerInfromationArray[4].value} </p> </div> </div>`;

                        // $(textToShow).hide().appendTo('#left-chat-panel').fadeIn();
                        // $("#left-chat-panel").animate({ scrollTop: 20000000 }, "slow");

                        message("Yes");
                    }
                    else
                    {
                        //Show Error Dialogue
                        var chatAlert = document.getElementById("chat-alert");
                        chatAlert.style.display = "block";
                        chatAlert.innerHTML = `Unable to get traveler personal details. Please try again.`;
                        hideThings();

                    }

                }

                //appendChatData(textToShow);

                // Getting the phone number format according to the country of the user
                var phoneInputClass     =   "phone_number";
                var input               =   document.getElementsByClassName(phoneInputClass);
        
                for(var i = 0; i < input.length; i++)
                {
                    var iti = window.intlTelInput(input[i], { formatOnDisplay: true, allowDropdown: false, initialCountry: respObj.country_code });
                }
                    
                $('.phone_number').on("focus", function() 
                {
                    var current_node        =   event.target;
                    var current_placeholder =   $(current_node).attr('placeholder');
                    var mask                =   current_placeholder.replace(/[0-9]/g, "0");
                    $(current_node).mask(mask);
                });

                //makeLog(textToShow, "bot", null, null); 
            }
            else
            {
                $("#botError").modal({ backdrop: 'static', keyboard: false });
                document.getElementById("error_message").innerHTML = `Unable to find <strong> <u> ${respObj.user_first_name} ${respObj.user_last_name} </u> </strong> (${respObj.email}) on GDS.`;
                hideThings();
            }
        }
    }

    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(data);
}

// If the user wants to change the information, the infromation edit form will be shown that will change the input.
// This function is obsolete in the latest version of chat bot (Deprecated)
function editTravelerInfo(array, obj)
{
    let resourceURL = `${baseIP}/api/travelerInformation/editTravelerInfo`;

    //Adding message waiting loader
    // var msgLoaderImage = "<div class='loading-img' id='loading-img-2'><img src='/images/loader.gif'></div>";
    // appendChatLoader(msgLoaderImage);
    
    if(array)
    {
        var preData = { purpose : "update_records", data : array };
    }
    else
    {
        var preData = { purpose : "initialize", data : obj };
    }

    var data = JSON.stringify(preData);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {
            //removing loader
            //document.getElementById("loading-img-2").remove();
            
            var resObj = JSON.parse(this.responseText);
            var responseType = resObj.responseType; 

            if(responseType === "updateForm")
            {
                var textToShow = resObj.form;
                //makeLog(textToShow, "bot", null, null);
                appendChatData(textToShow);
            }
            else if(responseType === "update_records")
            {
                var status = resObj.status;
                if(status == 1)
                {
                    sendMessage("Yes", sessionID);
                }
                else
                {
                    alert("Values not updated");
                }
            }
        }
    }
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

// On the required form, when the user click on the OK button this function will be triggered and get all the details from the form fiels and send to the server
//(Deprecated)
function insertTravelerInfo()
{
    var valueArray = [];
    var resourceURL = `${baseIP}/api/travelerInformation/insertTravelerInfo`;
    var feildsValueArray = [];

    var feildsValues = document.getElementsByClassName('travel_info_insert');
    var divArray = document.getElementsByClassName('travel-form-group');
    var alertIds = document.getElementsByClassName('required-alert');

    for(var i = 0; i < feildsValues.length; i++)
    {
        if(feildsValues[i].value === "")
        {
            document.getElementById(`${feildsValues[i].id}_error_belowLine`).classList.add("required");
            
            var class1 = document.getElementById(`${feildsValues[i].id}_error_text_incomplete_field`);
            if(class1)
            {
                class1.style.display =  "block";
            }
        }
        else
        {

            var class1 = document.getElementById(`${feildsValues[i].id}_error_text_incomplete_field`);
            if(class1)
            {
                class1.style.display =  "none";
            }
            var data = { id : feildsValues[i].id, value : feildsValues[i].value };
            feildsValueArray.push(data);
        }    
    }

    for (var m = 0; m < feildsValues.length; m++)
    {
        if(feildsValues[m].value != 0)
        {
            valueArray.push(feildsValues[m].value);
        }
    }

    var feildsLength = feildsValues.length;
    var valuesLength = valueArray.length;



    if(feildsLength === valuesLength && numeric_error_found === 0 && email_error_found === 0 && phone_error_found === 0 && string_error_found === 0)
    {
        error_log = false;
    }

    if(!error_log)
    {
        //Removing IDs of the exisitng fields
        for (var j = 0; j < feildsValues.length; j++)
        {
            feildsValues[j].id = "";
        }

        for(var k = 0; k < divArray.length; k++)
        {
            divArray[k].id = "";
        }

        for (var l = 0; l < alertIds.length; l++)
        {
            alertIds[l].id = "";
        }


        //Removing classes of the exisitng fields
        $( "input" ).removeClass("travel_info_insert");
        $( "select" ).removeClass("travel_info_insert");

        disableButtons();

        var dataPre = { recordArray : feildsValueArray };
        var data = JSON.stringify(dataPre);
        //Adding message waiting loader
        // var msgLoaderImage = "<div class='loading-img' id='loading-img-2'><img src='/images/loader.gif'></div>";
        // appendChatLoader(msgLoaderImage);

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() 
        {
            if (this.readyState == 4 && this.status == 200) 
            {
                var respObj = JSON.parse(this.responseText);

                setTimeout(function(){
                    if(respObj.responseType == "action")
                    {
                        message("Yes");
                    }
                },2000); 
            }
        }

        xmlhttp.open("POST", resourceURL, true);
        xmlhttp.withCredentials = true;
        xmlhttp.credentials = "include";
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
        xmlhttp.send(data);
    }
}    

// On the update traverler info form, when the OK button is clicked this function will triggered and collect all the details from the from and send to the server
// This function is obsolete in the latest version of chat bot (Deprecated)
function updateTravelerInfo()
{
    error_log = true;

    var updatedFeildsValue = [];
    var valueArray = [];

    var feildsValues = document.getElementsByClassName('travel_info_update');
    var divArray = document.getElementsByClassName('travel-form-group');
    var alertIds = document.getElementsByClassName('required-alert');

    for(var i = 0; i < feildsValues.length; i++)
    {
        if(feildsValues[i].value === "")
        {
            document.getElementById(`${feildsValues[i].id}_error_belowLine`).classList.add("required");
            var class1 =  document.getElementById(`${feildsValues[i].id}_error_text_incomplete_field`);
            if(class1)
            {
                class1.style.display =  "block";
            }
           
        }
        else
        {
            var class1 =  document.getElementById(`${feildsValues[i].id}_error_text_incomplete_field`);
            if(class1)
            {
                class1.style.display =  "none";
            }
            var data = { id : feildsValues[i].id, value : feildsValues[i].value };
            updatedFeildsValue.push(data);
        }
    }

    for (var m = 0; m < feildsValues.length; m++)
    {
        if(feildsValues[m].value != 0)
        {
            valueArray.push(feildsValues[m].value);
        }
    }

    var feildsLength = feildsValues.length;
    var valuesLength = valueArray.length;

    if(feildsLength === valuesLength && string_error_found === 0 && numeric_error_found === 0 && email_error_found === 0 && phone_error_found === 0)
    {
        error_log = false;
    }

    if(!error_log)
    {
        disableButtons();

        //Removing IDs of the exisitng fields
        for (var j = 0; j < feildsValues.length; j++)
        {
            feildsValues[j].id = "";
        }

        for(var k = 0; k < divArray.length; k++)
        {
            divArray[k].id = "";
        }

        for (var l = 0; l < alertIds.length; l++)
        {
            alertIds[l].id = "";
        }

        //Removing class to avoid dupication
        $( "input" ).removeClass("travel_info_update");
        $( "select" ).removeClass("travel_info_update");

        //Sending the updated data to the server
        editTravelerInfo(updatedFeildsValue, null);
    }
}

// Helping functions

// This function will validate the fields of the user input shown in the form according to their type.
// This function is obsolete in the latest version of chat bot (Deprecated)
function validateField(dataType, elementID, dataValue)
{
    //Regex Definitions
    var stringRegex = /^[a-zA-Z-' ]*$/;
    var numericRegx = /^[a-zA-Z0-9]*$/;
    var phoneRegx = /^[0-9]*$/;
    
    if(dataType === "string")
    {
        var validationCheck = dataValue.match(stringRegex);
        
        if(validationCheck === null)
        {
            string_error_found = 1;
            document.getElementById(`${elementID}_error_belowLine`).classList.add("required");
            var class1 = document.getElementById(`${elementID}_error_text_incomplete_field`);
            if(class1)
            {
                class1.style.display = "none";
            }
            var class2 = document.getElementById(`${elementID}_error_text_chars`);
            if(class2)
            {
                class2.style.display = "block";
            }
        }
        else
        {
            string_error_found = 0;
            document.getElementById(`${elementID}_error_belowLine`).classList.remove("required");
            document.getElementById(`${elementID}_error_text_chars`).style.display = "none";
        }
    }
    
    if(dataType === "numeric")
    {   
        var validationCheck = dataValue.match(numericRegx);

        if(validationCheck === null)
        {
            numeric_error_found = 1;
            document.getElementById(`${elementID}_error_belowLine`).classList.add("required");
            var class1 = document.getElementById(`${elementID}_error_text_incomplete_field`);
            if(class1)
            {
                class1.style.display = "none";
            }
            
            var class2 = document.getElementById(`${elementID}_error_text_chars_numbers`);
            if(class2)
            {
                class2.style.display = "block";
            }
        }
        else
        {
            numeric_error_found = 0;
            document.getElementById(`${elementID}_error_belowLine`).classList.remove("required");
            var class1 = document.getElementById(`${elementID}_error_text_chars_numbers`);
            if(class1)
            {
                class1.style.display = "none";
            }
        }
    }
    
    if(dataType === "email")
    {   
        if(dataValue.length === "")
        {
            email_error_found = 1;
            document.getElementById(`${elementID}_error_belowLine`).classList.add("required");

            var class1 = document.getElementById(`${elementID}_error_text_incomplete_field`);
            if(class1)
            {
                class1.style.display = "none";
            }

            var class2 = document.getElementById(`${elementID}_error_text_invalid_mail`);
            if(class2)
            {
                class2.style.display = "block";
            }
        }
        else
        {
            email_error_found = 0;
            document.getElementById(`${elementID}_error_belowLine`).classList.remove("required");
            var class1 = document.getElementById(`${elementID}_error_text_invalid_mail`);
            if(class1)
            {
                class1.style.display = "none";
            }
        }
    }

    if(dataType === "phone")
    {
        var validationCheck = dataValue.match(phoneRegx);
        if(dataValue.length === null)
        {
            phone_error_found = 1;
            document.getElementById(`${elementID}_error_belowLine`).classList.add("required");
            var class1 = document.getElementById(`${elementID}_error_text_incomplete_field`);
            if(class1)
            {
                class1.style.display = "none";
            }

            var class2 = document.getElementById(`${elementID}_error_text_numbers`);
            if(class2)
            {
                class2.style.display = "block";
            }
            
        }
        else
        {
            phone_error_found = 0;
            document.getElementById(`${elementID}_error_belowLine`).classList.remove("required");
        }
    }
}

//  ** FUNCTIONS FOR INSERTING AND UPDATING TRAVELER INFORMATION  **            //

//==============================================================================//

async function deleditPreviousReservation(val,type)
{
    $.confirm({
        title: 'Are You sure!',
        content: 'Are you sure you want to delete',
        type: 'red',
        typeAnimated: true,
        buttons: {
            confirm:{
                text: 'Yes',
                btnClass: 'btn-red',
                action: async function(){
                       await deletePreviousReservationObjectSection(val,type,1,(val)=>{
                           if(val.can_book == 0)
                           {
                                $('#'+val.book_btn).prop('disabled',true);
                           }else
                           {
                                $('#'+val.book_btn).prop('disabled',false);
                           }
                        });
                        current_html_drop[val] = $('#'+val).html();
                        $('#'+val).html('');
                        $('#'+val).html(`<button class="btn btn-sm btn-success ${type=="Flight" ? "mt-3":""}" style="margin:0 auto;
                        display:block;" onclick="re_displayRemovedSection('${val}','${type}')">Add ${type} Again</button>`);
                        $.notify(" removed successfully","success");
                }
            },
            close: function () {
            }
        }
    });
    
    // var txt;
    // var r = confirm("Are you sure you want to remove this section");
    // if (r == true) {
    //   
    // }
}

function deletePreviousReservationObjectSection(divid,type,opt,callback)
{
    var iternary = divid.substring(0, divid.length - 1);
    var id_number =  divid.charAt(divid.length-1);
    var resourceURL = `${baseIP}/api/previousData/deletePreviousReservationObjectSection`;
    var data_pre = { iternary : iternary, id_number : id_number, opt:opt,type:type }
    var data = JSON.stringify(data_pre);
    var result_data;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.status == 200) 
        {
            result_data = JSON.parse(this.response);
            callback(result_data);
        }
    }
    xmlhttp.open("POST", resourceURL, false);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

async function re_displayRemovedSection(val,type)
{
    await deletePreviousReservationObjectSection(val,type,0,(val)=>{
        $('#'+val.book_btn).prop('disabled',false);
    });
    $('#'+val).html('');
    $('#'+val).html(current_html_drop[val]);
    $.notify(""+type+" added successfully","success");

}

// ################################   Edit and delete functionality for previous reservations   ###################################
var new_flight_details = {};
new_flight_details['flight'] = {};

function editPreviousReservation(reservation_type, rid)
{
    $('.edit_drop').css('pointer-events','none');
    $('.booknowcls').attr('disabled',true);
    $('.makenewcls').attr('disabled',true);
    var resourceURL = `${baseIP}/api/previousData/current_previousReservationDetails`;

    var data_pre = { selected_iternery : rid, reservation_module : reservation_type }
    var data = JSON.stringify(data_pre);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {
            $('#'+reservation_type+''+rid).addClass("editable");
            $('#'+reservation_type+''+rid).addClass("clickable-icons");

            if(reservation_type == "flight_details")
            {
                message('flight');
            }
            if(reservation_type == "hotelDetails")
            {
                $('#'+reservation_type+''+rid).addClass("cst-edit");
                message('hotel');
            }
            if(reservation_type == "rentalCarDetails")
            {
                $('#'+reservation_type+''+rid).addClass("cst-edit");
                message('rentalCar');
            }
        }else
        {
            $('.edit_drop').attr('disabled',false);
        }
    }

    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
    
}

function noflightavailable_edit(type,divid)
{
    if(type=="yes")
    {
        $('#'+divid).removeClass("editable");
        $('.booknowcls').attr('disabled',false);
        $('.makenewcls').attr('disabled',false);
        message("yes");
    }else
    {
        $('#'+divid).removeClass("editable");
        $('.booknowcls').attr('disabled',false);
        $('.makenewcls').attr('disabled',false);
        message("no");
    }
}

function nohotelfound_edit(type,divid)
{
    if(type=="yes")
    {
        $('#'+divid).removeClass("editable");
        $('.booknowcls').attr('disabled',false);
        $('.makenewcls').attr('disabled',false);
        message("yes");
    }else
    {
        $('#'+divid).removeClass("editable");
        $('.booknowcls').attr('disabled',false);
        $('.makenewcls').attr('disabled',false);
        message("no");
    }
}

function edit_selected_flight(obj,divid,flightID,full_obj = "empty")
{
    var div_ = divid.substring(0, divid.length - 1);
    var id_number =  divid.charAt(divid.length-1);
    var resourceURL = `${baseIP}/api/previousData/current_previousReservationDetails`;
    
    
    var data_pre = {reservation_module:div_,selected_iternery:id_number}
    var data = JSON.stringify(data_pre);
    var hotel_dateupdate0;
    var hotel_dateupdate1;
    var car_dateupdate0;
    var car_dateupdate1;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        // if (this.readyState == 4 && this.status == 200) 
        if (this.readyState == 4 && this.status == 200) 
        {
            (async()=>{
                await updatePreviousReservationObjectforPnr("flight",divid,full_obj);
            })();
            
            var flight_details = JSON.parse(this.response);
            $("#"+divid+"_totalprice").html('<strong>Total Price: '+full_obj.totalPrice+'$</strong>');
            $("#"+divid+"_totalprice").show();
            // flight_details = flight_details;
            // obj = obj;
            // divid = divid;
            if(flight_details.length > 1)
            {
                if(obj.length > 2)
                {

                    var round_0 =[];
                    var round_1 =[];
                        for(var k=0;k<obj.length;k++)
                        {   
                            obj[k].RPH === obj[0].RPH ? round_0.push(obj[k]):round_1.push(obj[k]);
                        }
                        
                        flight_details[0]['FlightDepartureDate'] = round_0[0]['departureDateTime'];
                        flight_details[0]['FlightArrivalDate'] = round_0[round_0.length-1]['arrivalDateTime']; 
                        flight_details[0]['deptime'] = round_0[0]['departureDateTime'];
                        flight_details[0]['arrtime'] = round_0[round_0.length-1]['arrivalDateTime']; 

                        flight_details[1]['FlightDepartureDate'] = round_1[0]['departureDateTime'];
                        flight_details[1]['FlightArrivalDate'] = round_1[round_1.length - 1]['arrivalDateTime'];
                        flight_details[1]['deptime'] = round_1[0]['departureDateTime'];
                        flight_details[1]['arrtime'] = round_1[round_1.length - 1]['arrivalDateTime'];

                        var count_stops_round_0 = 0;
                        var _round_0_stops = '';
                        if(round_0.length > 1)
                        {
                            
                            for(let i=0; i<round_0.length - 1;i++)
                            {
                                var startTime = moment(moment.utc(round_0[i].arrivalDateTime));
                                var end = moment(moment.utc(round_0[i+1].departureDateTime));
                                var duration = moment.duration(end.diff(startTime));
                                var hours = duration.asHours();
                                _round_0_stops +=`<p>
                                ${round_0[i].arrivalCity} 
                                ${moment.utc(round_0[i].arrivalDateTime).format('LT')} - 
                                ${moment.utc(round_0[i+1].departureDateTime).format('LT')} *
                                (${Math.ceil(hours)} hours overlay)
                                </p>`;
                                count_stops_round_0++;
                            }
                        }
                        var count_stops_round_1 = 0;
                        var _round_1_stops = '';
                        if(round_1.length > 1)
                        {
                            
                            for(let i=0; i<round_1.length - 1;i++)
                            {
                                var startTime = moment(moment.utc(round_1[i].arrivalDateTime));
                                var end = moment(moment.utc(round_1[i+1].departureDateTime));
                                var duration = moment.duration(end.diff(startTime));
                                var hours = duration.asHours();
                                _round_1_stops +=`<p>
                                ${round_1[i].arrivalCity} 
                                ${moment.utc(round_1[i].arrivalDateTime).format('LT')} - 
                                ${moment.utc(round_1[i+1].departureDateTime).format('LT')} *
                                (${Math.ceil(hours)} hours overlay)
                                </p>`;
                                count_stops_round_1++;
                            }
                        }
                        if(count_stops_round_0 == 0)
                        {
                            $('#'+divid+"_round_0_stops_total").html('NONSTOP');
                        }else
                        {
                            $('#'+divid+"_round_0_stops").html(_round_0_stops);
                            $('#'+divid+"_round_0_stops_total").html('Stops: '+ count_stops_round_0+' <i class="fa fa-info-circle" style="color:#17a2b8"></i>');
                        }
                        if(count_stops_round_1 == 0)
                        {
                            $('#'+divid+"_round_1_stops_total").html('NONSTOP');
                        }else
                        {
                            $('#'+divid+"_round_1_stops").html(_round_1_stops);
                            $('#'+divid+"_round_1_stops_total").html('Stops: '+count_stops_round_1+' <i class="fa fa-info-circle" style="color:#17a2b8"></i>');
                        }
                        // $('#'+divid+"_round_0_stops").html(_round_0_stops);
                        // $('#'+divid+"_round_1_stops").html(_round_1_stops);

                        // $('#'+divid+"_round_0_stops_total").html('Stops: '+ count_stops_round_0+' <i class="fa fa-info-circle" style="color:#17a2b8"></i>');
                        // $('#'+divid+"_round_1_stops_total").html('Stops: '+count_stops_round_1+' <i class="fa fa-info-circle" style="color:#17a2b8"></i>');

                    $('#'+divid+"_0_dep").html(moment.utc(flight_details[0].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightDepartureDate).format('ll'));
                    $('#'+divid+"_0_arr").html(moment.utc(flight_details[0].FlightArrivalDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightArrivalDate).format('ll'));
                    $('#'+divid+"_round1_d_time").html(moment(flight_details[0].deptime).format('LT'));
                    $('#'+divid+"_round1_a_time").html(moment(flight_details[0].arrtime).format('LT'));
                    
                    $('#'+divid+"_1_dep").html(moment.utc(flight_details[1].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[1].FlightDepartureDate).format('ll'));
                    $('#'+divid+"_1_arr").html(moment.utc(flight_details[1].FlightArrivalDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[1].FlightArrivalDate).format('ll'));
                    $('#'+divid+"_round2_d_time").html(moment(flight_details[1].deptime).format('LT'));
                    $('#'+divid+"_round2_a_time").html(moment(flight_details[1].arrtime).format('LT'));
                    
                    $("#"+divid+"_round0_airline_name").html(obj[0]['MarketingCarrier']+' | '+obj[0]['carrier_name']);
                    $("#"+divid+"_round1_airline_name").html(obj[obj.length - 1]['MarketingCarrier']+' | '+obj[obj.length - 1]['carrier_name']);
                    
                    $("#"+divid+"round_d_flight").html('Flight: '+obj[0]['MarketingCarrier']+'-'+obj[0]['MarketflightNumber']);
                    $("#"+divid+"round_d_flight").show();
                    $("#"+divid+"round_a_flight").show();
                    $("#"+divid+"round_a_flight").html("Flight: "+obj[obj.length - 1]['MarketingCarrier']+"-"+obj[obj.length - 1]['MarketflightNumber']);

                }else
                {
                    flight_details[0]['FlightDepartureDate'] = obj[0]['departureDateTime'];
                    flight_details[0]['FlightArrivalDate'] = obj[0]['arrivalDateTime']; 
                    flight_details[0]['deptime'] = obj[0]['departureDateTime'];
                    flight_details[0]['arrtime'] = obj[0]['arrivalDateTime']; 
    
                    flight_details[1]['FlightDepartureDate'] = obj[obj.length - 1]['departureDateTime'];
                    flight_details[1]['FlightArrivalDate'] = obj[obj.length - 1]['arrivalDateTime'];
                    flight_details[1]['deptime'] = obj[obj.length - 1]['departureDateTime'];
                    flight_details[1]['arrtime'] = obj[obj.length - 1]['arrivalDateTime'];

                    $('#'+divid+"_0_dep").html(moment.utc(flight_details[0].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightDepartureDate).format('ll'));
                    $('#'+divid+"_0_arr").html(moment.utc(flight_details[0].FlightArrivalDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightArrivalDate).format('ll'));
                    $('#'+divid+"_round1_d_time").html(moment(flight_details[0].deptime).format('LT'));
                    $('#'+divid+"_round1_a_time").html(moment(flight_details[0].arrtime).format('LT'));
                    
                    $("#"+divid+"_round0_airline_name").html(obj[0]['MarketingCarrier']+' | '+obj[0]['carrier_name']);
                    $("#"+divid+"_round1_airline_name").html(obj[obj.length - 1]['MarketingCarrier']+' | '+obj[obj.length - 1]['carrier_name']);

                    $('#'+divid+"_1_dep").html(moment.utc(flight_details[1].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[1].FlightDepartureDate).format('ll'));
                    $('#'+divid+"_1_arr").html(moment.utc(flight_details[1].FlightArrivalDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[1].FlightArrivalDate).format('ll'));
                    $('#'+divid+"_round2_d_time").html(moment(flight_details[1].deptime).format('LT'));
                    $('#'+divid+"_round2_a_time").html(moment(flight_details[1].arrtime).format('LT'));

                    $("#"+divid+"round_d_flight").html('Flight: '+obj[0]['MarketingCarrier']+'-'+obj[0]['MarketflightNumber']);
                    $("#"+divid+"round_d_flight").show();
                    $("#"+divid+"round_a_flight").show();
                    $("#"+divid+"round_a_flight").html('Flight: '+obj[obj.length - 1]['MarketingCarrier']+'-'+obj[obj.length - 1]['MarketflightNumber']);



                }
            }else
            {
                flight_details[0]['FlightDepartureDate'] = obj[0]['departureDateTime'];
                flight_details[0]['FlightArrivalDate'] = obj[obj.length - 1]['arrivalDateTime'];
                flight_details[0]['deptime'] = obj[0]['departureDateTime'];
                flight_details[0]['arrtime'] = obj[obj.length-1]['arrivalDateTime'];
                var count_stops_one_0 = 0;
                var _one_0_stops = '';
                if(obj.length > 1)
                {
                    for(let i=0; i<obj.length - 1;i++)
                    {
                        var startTime = moment(moment.utc(obj[i].arrivalDateTime));
                        var end = moment(moment.utc(obj[i+1].departureDateTime));
                        var duration = moment.duration(end.diff(startTime));
                        var hours = duration.asHours();
                        _one_0_stops +=`<p>
                        ${obj[i].arrivalCity} 
                        ${moment.utc(obj[i].arrivalDateTime).format('LT')} - 
                        ${moment.utc(obj[i+1].departureDateTime).format('LT')} *
                        (${Math.ceil(hours)} hours overlay)
                        </p>`;
                        count_stops_one_0++;
                    }
                         
                    $('#'+divid+"_one_0_stops").html(_one_0_stops);
                    $('#'+divid+"_one_0_stops_total").html('Stops: '+ count_stops_one_0+' <i class="fa fa-exclamation-triangle"></i>');
                    $('#'+divid+"one_0_dep").html(moment.utc(flight_details[0].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightDepartureDate).format('ll'));
                    $('#'+divid+"one_0_arr").html(moment.utc(flight_details[0].FlightArrivalDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightArrivalDate).format('ll'));
                    $('#'+divid+"_one_d_time").html(moment(flight_details[0].deptime).format('LT'));
                    $('#'+divid+"_one_a_time").html(moment(flight_details[0].arrtime).format('LT'));
                    $("#"+divid+"one_0_airline_name").html(obj[0]['MarketingCarrier']+' | '+obj[0]['carrier_name']);


                }else
                {
                    flight_details[0]['FlightDepartureDate'] = obj[0]['departureDateTime'];
                    flight_details[0]['FlightArrivalDate'] = obj[0]['arrivalDateTime'];
                    flight_details[0]['deptime'] = obj[0]['departureDateTime'];
                    flight_details[0]['arrtime'] = obj[0]['arrivalDateTime'];

                    $('#'+divid+"one_0_dep").html(moment.utc(flight_details[0].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightDepartureDate).format('ll'));
                    $('#'+divid+"one_0_arr").html(moment.utc(flight_details[0].FlightArrivalDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightArrivalDate).format('ll'));
                    $('#'+divid+"_one_d_time").html(moment(flight_details[0].deptime).format('LT'));
                    $('#'+divid+"_one_a_time").html(moment(flight_details[0].arrtime).format('LT'));
                    $("#"+divid+"one_0_airline_name").html(obj[0]['MarketingCarrier']+' | '+obj[0]['carrier_name']);

                }

            }
            // this is if trip is a round trip

            if(flight_details[0]['hotel_difference']!= "empty")
            {
                hotel_dateupdate0 = moment.utc(flight_details[0].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightDepartureDate).format('ll');
                hotel_dateupdate1 = moment.utc(flight_details[0].FlightDepartureDate).add(flight_details[0]['hotel_difference'], 'days').format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightDepartureDate).add(flight_details[0]['hotel_difference'], 'days').format('ll');
                $('#hotelDetails'+id_number+'_checkin').html(hotel_dateupdate0);
                $('#hotelDetails'+id_number+'_checkout').html(hotel_dateupdate1);

            }
            if(flight_details[0]['rental_difference']!= "empty")
            {
                car_dateupdate0 = moment.utc(flight_details[0].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightDepartureDate).format('ll');
                car_dateupdate1 = moment.utc(flight_details[0].FlightDepartureDate).add(flight_details[0]['rental_difference'], 'days').format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightDepartureDate).add(flight_details[0]['rental_difference'], 'days').format('ll');
                $('#rentalCarDetails'+id_number+'_pickup').html(hotel_dateupdate0);
                $('#rentalCarDetails'+id_number+'_dropoff').html(hotel_dateupdate1);
            }
            
            var dataToSend = flightID.toString();
            message(dataToSend);
            $('.booknowcls').attr('disabled',false);
            $('.makenewcls').attr('disabled',false);

        }
    }

    xmlhttp.open("POST", resourceURL, false);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);

  
}

async function updateDates_(obj,divid,flightID,full_obj = "empty",update_pnr_obj=true)
{
    var div_ = divid.substring(0, divid.length - 1);
    var id_number =  divid.charAt(divid.length-1);
    var resourceURL = `${baseIP}/api/previousData/current_previousReservationDetails`;
    
    var data_pre = {reservation_module:div_,selected_iternery:id_number}
    var data = JSON.stringify(data_pre);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        // if (this.readyState == 4 && this.status == 200) 
        if (this.readyState == 4 && this.status == 200) 
        {
            if(update_pnr_obj)
            {
                (async()=>{
                    await updatePreviousReservationObjectforPnr("flight",divid,full_obj);
                })();
            }

            var flight_details = JSON.parse(this.response);

            $("#"+divid+"_totalprice").html('<strong>Total Price: '+full_obj.totalPrice+'$</strong>');
            $("#"+divid+"_totalprice").show();

            if(flight_details.length > 1)
            {
                if(obj.length > 2)
                {

                    var round_0 =[];
                    var round_1 =[];
                        for(var k=0;k<obj.length;k++)
                        {   
                            obj[k].RPH === obj[0].RPH ? round_0.push(obj[k]):round_1.push(obj[k]);
                        }
                        
                        flight_details[0]['FlightDepartureDate'] = round_0[0]['departureDateTime'];
                        flight_details[0]['FlightArrivalDate'] = round_0[round_0.length-1]['arrivalDateTime']; 
                        flight_details[0]['deptime'] = round_0[0]['departureDateTime'];
                        flight_details[0]['arrtime'] = round_0[round_0.length-1]['arrivalDateTime']; 

                        flight_details[1]['FlightDepartureDate'] = round_1[0]['departureDateTime'];
                        flight_details[1]['FlightArrivalDate'] = round_1[round_1.length - 1]['arrivalDateTime'];
                        flight_details[1]['deptime'] = round_1[0]['departureDateTime'];
                        flight_details[1]['arrtime'] = round_1[round_1.length - 1]['arrivalDateTime'];

                        var count_stops_round_0 = 0;
                        var _round_0_stops = '';
                        if(round_0.length > 1)
                        {
                            
                            for(let i=0; i<round_0.length - 1;i++)
                            {
                                var startTime = moment(moment.utc(round_0[i].arrivalDateTime));
                                var end = moment(moment.utc(round_0[i+1].departureDateTime));
                                var duration = moment.duration(end.diff(startTime));
                                var hours = duration.asHours();
                                _round_0_stops +=`<p>
                                ${round_0[i].arrivalCity} 
                                ${moment.utc(round_0[i].arrivalDateTime).format('LT')} - 
                                ${moment.utc(round_0[i+1].departureDateTime).format('LT')} *
                                (${Math.ceil(hours)} hours overlay)
                                </p>`;
                                count_stops_round_0++;
                            }
                        }
                        var count_stops_round_1 = 0;
                        var _round_1_stops = '';
                        if(round_1.length > 1)
                        {
                            
                            for(let i=0; i<round_1.length - 1;i++)
                            {
                                var startTime = moment(moment.utc(round_1[i].arrivalDateTime));
                                var end = moment(moment.utc(round_1[i+1].departureDateTime));
                                var duration = moment.duration(end.diff(startTime));
                                var hours = duration.asHours();
                                _round_1_stops +=`<p>
                                ${round_1[i].arrivalCity} 
                                ${moment.utc(round_1[i].arrivalDateTime).format('LT')} - 
                                ${moment.utc(round_1[i+1].departureDateTime).format('LT')} *
                                (${Math.ceil(hours)} hours overlay)
                                </p>`;
                                count_stops_round_1++;
                            }
                        }


                        if(count_stops_round_0 == 0)
                        {
                            (divid,async()=>
                            {   await translateFromClinetSide(`NONSTOP`,(dialog)=>{
                                $('#'+divid+"_round_0_stops_total").html(dialog);
                                });
                            })();
                        }else
                        {
                            $('#'+divid+"_round_0_stops").html(_round_0_stops);
                            (divid,async()=>
                            {   await translateFromClinetSide(`Stops`,(dialog)=>{
                                $('#'+divid+"_round_0_stops_total").html(dialog+' :'+ count_stops_round_0+' <i class="fa fa-info-circle" style="color:#17a2b8"></i>');
                                });
                            })();
                        }
                        if(count_stops_round_1 == 0)
                        {
                            (divid,async()=>
                            {   await translateFromClinetSide(`NONSTOP`,(dialog)=>{
                                $('#'+divid+"_round_1_stops_total").html(dialog);
                                });
                            })();
                        }else
                        {
                            $('#'+divid+"_round_1_stops").html(_round_1_stops);
                            (divid,async()=>
                            {   await translateFromClinetSide(`Stops`,(dialog)=>{
                                $('#'+divid+"_round_1_stops_total").html(dialog+' :'+count_stops_round_1+' <i class="fa fa-info-circle" style="color:#17a2b8"></i>');
                            });
                            })();
                        }
                    $('#'+divid+"_0_dep").html(moment.utc(flight_details[0].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightDepartureDate).format('ll'));
                    $('#'+divid+"_0_arr").html(moment.utc(flight_details[0].FlightArrivalDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightArrivalDate).format('ll'));
                    $('#'+divid+"_round1_d_time").html(moment(flight_details[0].deptime).format('LT'));
                    $('#'+divid+"_round1_a_time").html(moment(flight_details[0].arrtime).format('LT'));
                    
                    $('#'+divid+"_1_dep").html(moment.utc(flight_details[1].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[1].FlightDepartureDate).format('ll'));
                    $('#'+divid+"_1_arr").html(moment.utc(flight_details[1].FlightArrivalDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[1].FlightArrivalDate).format('ll'));
                    $('#'+divid+"_round2_d_time").html(moment(flight_details[1].deptime).format('LT'));
                    $('#'+divid+"_round2_a_time").html(moment(flight_details[1].arrtime).format('LT'));
                    
                    $("#"+divid+"_round0_airline_name").html(obj[0]['MarketingCarrier']+' | '+obj[0]['carrier_name']);
                    $("#"+divid+"_round1_airline_name").html(obj[obj.length - 1]['MarketingCarrier']+' | '+obj[obj.length - 1]['carrier_name']);
                    
                    $("#"+divid+"round_d_flight").html('Flight: '+obj[0]['MarketingCarrier']+'-'+obj[0]['MarketflightNumber']);
                    $("#"+divid+"round_d_flight").show();
                    $("#"+divid+"round_a_flight").show();
                    $("#"+divid+"round_a_flight").html("Flight: "+obj[obj.length - 1]['MarketingCarrier']+"-"+obj[obj.length - 1]['MarketflightNumber']);

                }else
                {
                    flight_details[0]['FlightDepartureDate'] = obj[0]['departureDateTime'];
                    flight_details[0]['FlightArrivalDate'] = obj[0]['arrivalDateTime']; 
                    flight_details[0]['deptime'] = obj[0]['departureDateTime'];
                    flight_details[0]['arrtime'] = obj[0]['arrivalDateTime']; 
    
                    flight_details[1]['FlightDepartureDate'] = obj[obj.length - 1]['departureDateTime'];
                    flight_details[1]['FlightArrivalDate'] = obj[obj.length - 1]['arrivalDateTime'];
                    flight_details[1]['deptime'] = obj[obj.length - 1]['departureDateTime'];
                    flight_details[1]['arrtime'] = obj[obj.length - 1]['arrivalDateTime'];

                    $('#'+divid+"_0_dep").html(moment.utc(flight_details[0].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightDepartureDate).format('ll'));
                    $('#'+divid+"_0_arr").html(moment.utc(flight_details[0].FlightArrivalDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightArrivalDate).format('ll'));
                    $('#'+divid+"_round1_d_time").html(moment(flight_details[0].deptime).format('LT'));
                    $('#'+divid+"_round1_a_time").html(moment(flight_details[0].arrtime).format('LT'));
                    
                    $('#'+divid+"_1_dep").html(moment.utc(flight_details[1].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[1].FlightDepartureDate).format('ll'));
                    $('#'+divid+"_1_arr").html(moment.utc(flight_details[1].FlightArrivalDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[1].FlightArrivalDate).format('ll'));
                    $('#'+divid+"_round2_d_time").html(moment(flight_details[1].deptime).format('LT'));
                    $('#'+divid+"_round2_a_time").html(moment(flight_details[1].arrtime).format('LT'));

                    $("#"+divid+"_round0_airline_name").html(obj[0]['MarketingCarrier']+' | '+obj[0]['carrier_name']);
                    $("#"+divid+"_round1_airline_name").html(obj[obj.length - 1]['MarketingCarrier']+' | '+obj[obj.length - 1]['carrier_name']);
                    
                    $("#"+divid+"round_d_flight").html('Flight: '+obj[0]['MarketingCarrier']+'-'+obj[0]['MarketflightNumber']);
                    $("#"+divid+"round_d_flight").show();
                    $("#"+divid+"round_a_flight").show();
                    $("#"+divid+"round_a_flight").html('Flight: '+obj[obj.length - 1]['MarketingCarrier']+'-'+obj[obj.length - 1]['MarketflightNumber']);

                    

                }
            }
            else
            {
                flight_details[0]['FlightDepartureDate'] = obj[0]['departureDateTime'];
                flight_details[0]['FlightArrivalDate'] = obj[obj.length - 1]['arrivalDateTime'];
                flight_details[0]['deptime'] = obj[0]['departureDateTime'];
                flight_details[0]['arrtime'] = obj[obj.length-1]['arrivalDateTime'];
                var count_stops_one_0 = 0;
                var _one_0_stops = '';
                if(obj.length > 1)
                {
                    for(let i=0; i<obj.length - 1;i++)
                    {
                        var startTime = moment(moment.utc(obj[i].arrivalDateTime));
                        var end = moment(moment.utc(obj[i+1].departureDateTime));
                        var duration = moment.duration(end.diff(startTime));
                        var hours = duration.asHours();
                        _one_0_stops +=`<p>
                        ${obj[i].arrivalCity} 
                        ${moment.utc(obj[i].arrivalDateTime).format('LT')} - 
                        ${moment.utc(obj[i+1].departureDateTime).format('LT')} *
                        (${Math.ceil(hours)} hours overlay)
                        </p>`;
                        count_stops_one_0++;
                    }
                         
                    $('#'+divid+"_one_0_stops").html(_one_0_stops);
                    $('#'+divid+"_one_0_stops_total").html('Stops: '+ count_stops_one_0+' <i class="fa fa-exclamation-triangle"></i>');
                    $('#'+divid+"one_0_dep").html(moment.utc(flight_details[0].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightDepartureDate).format('ll'));
                    $('#'+divid+"one_0_arr").html(moment.utc(flight_details[0].FlightArrivalDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightArrivalDate).format('ll'));
                    $('#'+divid+"_one_d_time").html(moment(flight_details[0].deptime).format('LT'));
                    $('#'+divid+"_one_a_time").html(moment(flight_details[0].arrtime).format('LT'));
                    $("#"+divid+"one_0_airline_name").html(obj[0]['MarketingCarrier']+' | '+obj[0]['carrier_name']);

                    $("#"+divid+"_flight").html('Flight: '+obj[0]['MarketingCarrier']+'-'+obj[0]['MarketflightNumber']);
                    $("#"+divid+"_flight").show();


                }else
                {
                    flight_details[0]['FlightDepartureDate'] = obj[0]['departureDateTime'];
                    flight_details[0]['FlightArrivalDate'] = obj[0]['arrivalDateTime'];
                    flight_details[0]['deptime'] = obj[0]['departureDateTime'];
                    flight_details[0]['arrtime'] = obj[0]['arrivalDateTime'];

                    $('#'+divid+"one_0_dep").html(moment.utc(flight_details[0].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightDepartureDate).format('ll'));
                    $('#'+divid+"one_0_arr").html(moment.utc(flight_details[0].FlightArrivalDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightArrivalDate).format('ll'));
                    $('#'+divid+"_one_d_time").html(moment(flight_details[0].deptime).format('LT'));
                    $('#'+divid+"_one_a_time").html(moment(flight_details[0].arrtime).format('LT'));
                    $("#"+divid+"one_0_airline_name").html(obj[0]['MarketingCarrier']+' | '+obj[0]['carrier_name']);
                    $("#"+divid+"_flight").html('Flight: '+obj[0]['MarketingCarrier']+'-'+obj[0]['MarketflightNumber']);
                    $("#"+divid+"_flight").show();

                }

            }
        }
    }

    xmlhttp.open("POST", resourceURL, false);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);

  
}

function updateDatesforprevioubooking(id, date,return_date)
{
    var divid = $('#ti'+id).val();
    var id_number =  divid.charAt(divid.length-1);
    var hotel_dateupdate0;
    var hotel_dateupdate1;
    var car_dateupdate0;
    var car_dateupdate1;
    var flight_details_1_dep;
    var flight_details_1_arr;
            
            var flight_arr_date_diff = $('#flight_details'+id_number+'_diff').val();
            try {
                $('#flight_details'+id_number+'one_0_dep').html(moment.utc(date).format('llll').split(' ')[0]+' '+moment.utc(date).format('ll'))
                $('#flight_details'+id_number+'one_0_arr').html(moment.utc(date).format('llll').split(' ')[0]+' '+moment.utc(date).format('ll'))
                if($('#flight_details'+id_number+'_1_dep'))
                {
                    if(return_date != undefined)
                    {
                        $('#flight_details'+id_number+'_1_dep').html(moment.utc(return_date).format('llll').split(' ')[0]+' '+moment.utc(return_date).format('ll'))
                    }else
                    {
                        $('#flight_details'+id_number+'_1_dep').html(moment.utc(date).add(flight_arr_date_diff, 'days').format('llll').split(' ')[0]+' '+moment.utc(date).add(flight_arr_date_diff, 'days').format('ll'))
                    }
                }
                if($('#flight_details'+id_number+'_1_arr'))
                {
                    if(return_date != undefined)
                    {
                        $('#flight_details'+id_number+'_1_arr').html(moment.utc(return_date).format('llll').split(' ')[0]+' '+moment.utc(return_date).format('ll'))
                    }else
                    {
                        $('#flight_details'+id_number+'_1_arr').html(moment.utc(date).add(flight_arr_date_diff, 'days').format('llll').split(' ')[0]+' '+moment.utc(date).add(flight_arr_date_diff, 'days').format('ll'))
                    }
                }
            } catch (error) {
                console.log(error);
            }
            
            if($('#hotelDetails'+id_number))
            {
               
                hotel_dateupdate0 = moment.utc(date).format('llll').split(' ')[0]+' '+moment.utc(date).format('ll');
                if(return_date != undefined && return_date != "")
                {
                    
                    hotel_dateupdate1 = moment.utc(return_date).format('llll').split(' ')[0]+' '+moment.utc(return_date).format('ll');
                }else
                {
                    hotel_dateupdate1 = moment.utc(date).add($('#hotelDetails'+id_number+'_diff').val(), 'days').format('llll').split(' ')[0]+' '+moment.utc(date).add($('#hotelDetails'+id_number+'_diff').val(), 'days').format('ll');
                }
                $('#hotelDetails'+id_number+'_checkin').html(hotel_dateupdate0);
                $('#hotelDetails'+id_number+'_checkout').html(hotel_dateupdate1);

            }
            if($('#rentalCarDetails'+id_number))
            {
                car_dateupdate0 = moment.utc(date).format('llll').split(' ')[0]+' '+moment.utc(date).format('ll');
                if(return_date != undefined && return_date != "")
                {
                    car_dateupdate1 = moment.utc(return_date).format('llll').split(' ')[0]+' '+moment.utc(return_date).format('ll');
                }else
                {
                    car_dateupdate1 = moment.utc(date).add($('#rentalCarDetails'+id_number+'_diff').val(), 'days').format('llll').split(' ')[0]+' '+moment.utc(date).add($('#rentalCarDetails'+id_number+'_diff').val(), 'days').format('ll');
                }
                $('#rentalCarDetails'+id_number+'_pickup').html(car_dateupdate0);
                $('#rentalCarDetails'+id_number+'_dropoff').html(car_dateupdate1);
            }

            if(return_date != undefined)
            {
                flight_details_1_dep = moment.utc(return_date).format().split('T')[0];
                flight_details_1_arr = moment.utc(return_date).format().split('T')[0];
                hotel_dateupdate1 = moment.utc(return_date).format().split('T')[0];
                car_dateupdate1 = moment.utc(return_date).format().split('T')[0];
            }else
            {
                flight_details_1_dep = moment.utc(date).add(flight_arr_date_diff,'days').format().split('T')[0];
                flight_details_1_arr = moment.utc(date).add(flight_arr_date_diff,'days').format().split('T')[0];  
                hotel_dateupdate1 = moment.utc(date).add($('#hotelDetails'+id_number+'_diff').val(), 'days').format().split('T')[0];
                car_dateupdate1 = moment.utc(date).add($('#rentalCarDetails'+id_number+'_diff').val(), 'days').format().split('T')[0];
            }
            

            var resourceURL = `${baseIP}/api/previousData/getAllPreviousIternaries`;

            var obj = { hotelcheck_in : date,
                           hotelcheckout : moment(date).add($('#hotelDetails'+id_number+'_diff').val(), 'days').format().split('T')[0],
                           
                           carpick : date,
                            cardrop : moment(date).add($('#rentalCarDetails'+id_number+'_diff').val(), 'days').format().split('T')[0],
                            
                            flight_dep: date,
                            flight_arr :flight_details_1_dep,
                            id_number : id_number,
                            reckkey : id
                        };
                       
            var data = JSON.stringify({id_number : id_number});
        
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() 
            {
                if (this.readyState == 4 && this.status == 200) 
                {
                    GSPRavailibilty = {
                        'item':this.response,
                        'obj':obj
                    }
                }
            }
            xmlhttp.open("POST", resourceURL, true);
            xmlhttp.withCredentials = true;
            xmlhttp.credentials = "include";
            xmlhttp.setRequestHeader("Content-Type", "application/json");
            xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
            xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
            xmlhttp.send(data);

}

function display_edited_flights(flight_details,record_type,r_id)
{
    
    if(flight_details.length > 0 && flight_details.length!==undefined && flight_details.length !== "" && flight_details !== undefined)
    {
        if(flight_details.length == 2 && flight_details[0].origin == flight_details[1].destinat)
        {
            var html = `
            <div class="chat-panel" id='${record_type+''+r_id}'> 
                <div class="chat-panel-header"> 
                    <div class="chat-aero-info">
                        <div class="inner-chat-aero-info">
                            <span class="left-date">${moment(flight_details[0].deptime).format('LT')}</span>
                            <i class="fa fa-plane"></i>
                            <span class="left-date right">${moment(flight_details[0].arrtime).format('LT')}</span>
                        </div>
                    </div>
                    <div class="right-edit-dropdown">
                            <a href="#" onclick="editPreviousReservation('${record_type}','${r_id}');"><i class="fa fa-pencil"></i></a>
                            <a href="#" data-toggle="modal" data-target="#myModal"><i class="fa fa-trash"></i></a>
                    </div>
                    <h3>${flight_details[0].airline_name}</h3> 
                </div> 
                <div class="chat-panel-body"> <p>
                    <span class="city">${flight_details[0].origin}</span>
                    ${flight_details[0].FlightDepartureCity} </p> <p>
                    <span class="city">${flight_details[0].destinat}</span>
                    ${flight_details[0].FlightArrivalCity} </p> <p>
                    <span>${flight_details[0].FlightDepartureDate ? moment.utc(flight_details[0].FlightDepartureDate).format('llll').split('T')[0]+' '+moment.utc(flight_details[0].FlightDepartureDate).format('ll'): 'N/A'}</span> </p> <p>
                    <span>${flight_details[0].FlightArrivalDate ? moment.utc(flight_details[0].FlightArrivalDate).format('llll').split('T')[0]+' '+moment.utc(flight_details[0].FlightArrivalDate).format('ll'): 'N/A'}</span> </p>
                </div> 
                <div class="chat-panel-header"> 
                    <div class="chat-aero-info back">
                    <div class="inner-chat-aero-info">
                    <span class="left-date">${moment(flight_details[1].deptime).format('LT')}</span>
                    <i class="fa fa-plane"></i>
                    <span class="left-date right">${moment(flight_details[1].arrtime).format('LT')}</span>
                </div>
                    </div>
                    <h3>${flight_details[1].airline_name}</h3> 
                </div> 
                <div class="chat-panel-body"> <p>
                    <span class="city">${flight_details[1].origin}</span>
                    ${flight_details[1].FlightDepartureCity} </p> <p>
                    <span class="city">${flight_details[1].destinat}</span>
                    ${flight_details[1].FlightArrivalCity} </p> <p>
                    <span>${flight_details[1].FlightDepartureDate ? moment.utc(flight_details[1].FlightDepartureDate).format('llll').split('T')[0]+' '+moment.utc(flight_details[1].FlightDepartureDate).format('ll'): 'N/A'}</span> </p> <p>
                    <span>${flight_details[1].FlightArrivalDate ? moment.utc(flight_details[1].FlightArrivalDate).format('llll').split('T')[0]+' '+moment.utc(flight_details[1].FlightArrivalDate).format('ll'): 'N/A'}</span> </p>
                </div> 
            </div>`;
            return html;
        }
        else
        {
            var html = `
                <div class="chat-panel"> 
                    <div class="chat-panel-header"> 
                        <div class="chat-aero-info">
                        <div class="inner-chat-aero-info">
                            <span class="left-date">${moment(flight_details[0].deptime).format('LT')}</span>
                            <i class="fa fa-plane"></i>
                            <span class="left-date right">${moment(flight_details[0].arrtime).format('LT')}</span>
                        </div>
                        </div>
                        <div class="right-edit-dropdown">
                        <a href="#" onclick="editPreviousReservation('${record_type}','${r_id}');"><i class="fa fa-pencil"></i></a>
                        <a href="#" data-toggle="modal" data-target="#myModal"><i class="fa fa-trash"></i></a>
                        </div>
                        <h3>${flight_details[0].airline_name}</h3> 
                    </div> 
                    <div class="chat-panel-body"> <p>
                        <span class="city">${flight_details[0].origin}</span>
                        ${flight_details[0].FlightDepartureCity} </p> <p>
                        <span class="city">${flight_details[0].destinat}</span>
                        ${flight_details[0].FlightArrivalCity} </p> <p>
                        <span>${flight_details[0].FlightDepartureDate ? moment.utc(flight_details[0].FlightDepartureDate).format('llll').split('T')[0]+' '+moment.utc(flight_details[0].FlightDepartureDate).format('ll'): 'N/A'}</span> </p> <p>
                        <span>${flight_details[0].FlightArrivalDate ? moment.utc(flight_details[0].FlightArrivalDate).format('llll').split('T')[0]+' '+moment.utc(flight_details[0].FlightArrivalDate).format('ll'): 'N/A'}</span> </p>
                    </div> 
                </div>`;
                return html;
        }
    }
}

function ofdatecoverter(date)
{
    var dateArr = date.split(" ");
    var day = dateArr[0].replace('th','').replace('st','').replace('rd','').replace('nd','');
    var month = dateArr[2].replace(',','');
    var frdat = month+' '+day+', '+dateArr[3];

    return frdat;
}

function edit_selected_hotel(obj,divid,checkin,checkout,hotelName,state,totalPrice)
{
    (async()=>{
        await updatePreviousReservationObjectforPnr("hotel",divid,obj);
    })();

    $('#'+divid+'_name').html(hotelName);
    $('#'+divid+'_state').html(state);
    $('#'+divid+'_checkin').html(moment.utc(checkin).format('llll').split(' ')[0]+' '+moment.utc(checkin).format('ll'));
    $('#'+divid+'_checkout').html(moment.utc(checkout).format('llll').split(' ')[0]+' '+moment.utc(checkout).format('ll'));
    $("#"+divid+"_totalprice").html('<strong>Total Price: '+totalPrice+'$</strong>');
    $("#"+divid+"_totalprice").show();
    message("selected");
}

function editSelectedentalcar(divid,pick,drop,id,obj)
{
    var checkin = pick;
    var checkout =drop;
    $("#"+divid+"_totalprice").html('<strong>Total Price: '+obj.approximate_total_fare+'$</strong>');
    $("#"+divid+"_totalprice").show();
    $('#'+divid+'_pickup').html(moment.utc(checkin).format('llll').split(' ')[0]+' '+moment.utc(checkin).format('ll'));
    $('#'+divid+'_dropoff').html(moment.utc(checkout).format('llll').split(' ')[0]+' '+moment.utc(checkout).format('ll'));
    $('#'+divid+'_vendor').html(obj.vendor_name);

    (async()=>{
        await updatePreviousReservationObjectforPnr("rentalCar",divid,obj);
    })();
    message(id);
}

async function updatePreviousReservationObjectforPnr(type,divid,obj)
{
    var iternary = divid.substring(0, divid.length - 1);
    var id_number =  divid.charAt(divid.length-1);
    var resourceURL = `${baseIP}/api/previousData/updatePreviousReservationObjectforPnr`;
    var data_pre = { iternary : iternary, id_number : id_number, type:type,obj:obj }
    var data = JSON.stringify(data_pre);
    var result_data;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.status == 200) 
        {
            result_data = this.response;
            // callback(result_data);
        }
    }
    xmlhttp.open("POST", resourceURL, false);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

function custom_send_button(item)
{
    if(item == 'flight_dept_date')
    {
        document.getElementById("DateAndTime").style.display = "none";
        document.getElementById("chat-input").style.display = "block";
        document.getElementById("timeInput").style.display = "none";
        document.getElementById("Date").style.display = "none";
        $("#send-btn").attr("onclick","sendMessageBot()");
        new_flight_details['flight']['dept_date'] = $("#DateAndTime").val();
        showCallLoader();
        keepSessionAlive();
        setTimeout(function(){   
            hideCallLoader();
            $('#msg-body').append(`
                <div class="msg-row" style=""><div class="user-msg receive"><div class="avator-icon"><img src="/images/avatar-img-01.png"></div>
                <p>Is this a round trip or one way flight?</p></div><p></p>
                <div class="msg-row select">
                <button type="button" class="btn btn-default disableIt" onclick="editedflighttype('oneway'); disableButtons();" disabled=""> One Way</button> 
                <button type="button" class="btn btn-default disableIt" onclick="editedflighttype('roundtrip'); disableButtons();" disabled=""> Round Trip</button> 
                </div><p></p></div>`
                );
            },3000)
    }
    if(item == 'flight_return_date')
    {
        document.getElementById("DateAndTime").style.display = "none";
        document.getElementById("chat-input").style.display = "block";
        document.getElementById("timeInput").style.display = "none";
        document.getElementById("Date").style.display = "none";
        $("#send-btn").attr("onclick","sendMessageBot()");
        new_flight_details['flight']['returnDate'] = $("#DateAndTime").val();
        new_flight_details['flight']['flightType'] = "roundtrip";
    }
}

function editedflighttype(type)
{
    if(type== "oneway")
    {


    }
    if(type="roundtrip")
    {
        showCallLoader();
        keepSessionAlive();
        setTimeout(function(){   
        hideCallLoader();
        document.getElementById("DateAndTime").style.display = "block";
        document.getElementById("chat-input").style.display = "none";
        document.getElementById("timeInput").style.display = "none";
        document.getElementById("Date").style.display = "none";
        $('#msg-body').append(`
            <div class="msg-row" style=""><div class="user-msg receive"><div class="avator-icon"><img src="/images/avatar-img-01.png"></div>
            <p>Please select new return date</p></div></div>
        `);
        $( document ).ready(() => { $('#DateAndTime').datetimepicker({ sideBySide: true, format: 'YYYY-MM-DD HH:mm:ss' }); $('#DateAndTime').focus(); });
        $("#send-btn").attr("onclick","custom_send_button('flight_return_date')");
        },3000)
    }
    
}

function showCallLoader()
{
    var msgLoaderImage = "<div class='loading-img' id='loading-img-2'><img src='/images/loader.gif'></div>";
    appendChatLoader(msgLoaderImage);
}

function hideCallLoader()
{
    var loader = document.getElementById("loading-img-2");
    if(loader) { loader.remove() };
}

// ################################   Edit and delete functionality for previous reservations   ###################################

//==============================================================================//

//  ** LOGGER FUNCTIONALITY  **            //

//This function will make log for all the utterances made in the chatbot along with the time and make json file with session id as name
//Currenlty Not Working (Disbaled)
function makeLog(utterance, from, userID, CloseChat)
{
    let resourceURL = `${baseIP}/api/createLog/makeLog`;

    if(utterance)
    {
        var preData = { action : "updateJsonFile", utterance : utterance, from : from };
    }
    else if(CloseChat)
    {
        var preData = { action : "closeJsonFile" };
    }
    else
    {
        var preData = { action : "initialize", utterance : null, from : null, userID : userID, sessionID : sessionID };
    }
    var data = JSON.stringify(preData);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {
           var response = this.responseText; 
        }
    }
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send(data);
}

//  ** LOGGER FUNCTIONALITY  **            //

//==============================================================================//

async function translateFromClinetSide(text,callback)
{
    var resourceURL = `${baseIP}/query`;
    var data_pre = { purpose: 'translate_text', text : text };
    var data = JSON.stringify(data_pre);
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.status == 200) 
        {
            var result_data = this.response.replace(/[\n\r]/g,'').replace(/"/g,'');
            callback(result_data);
        }
    }
    xmlhttp.open("POST", resourceURL, false);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(data);
}


function close_popup()
{

    var left_pannel_new_reservation             =   document.getElementById("left-chat-panel");
    var left_pannel_new_reservation_details     =   document.getElementById("left-chat-panel-details");
    var left_pannel_previous_reservation        =   document.getElementById("left-chat-panel-suggestion");
    var msg_body                                =   document.getElementById("msg-body");

    $('#page-top').removeClass("hang-scroll");
    $(".chat-box").slideToggle();
    $("#chat-launch-button").css("display", "block");
    $("#chat-minimize-button").css("display", "none");
    $("#chat-box").removeClass("complete-chat");

    msg_body.innerHTML = "";
    left_pannel_new_reservation.style.display = "none";
    left_pannel_new_reservation_details.style.display = "none";
    left_pannel_new_reservation_details.innerHTML = "";
    left_pannel_previous_reservation.style.display = "none";
    left_pannel_previous_reservation.innerHTML = "";
    document.getElementById('chat-loadding').style.display = "flex";
}

async function first_exact_match(obj)
{
    //console.log(obj);
}

async function firstvalidation_flight(obj)
{
    showCallLoader();
    var resourceURL = `${baseIP}/api/sabre/lowFlightSearchBFM`;
    var tript_type = item.length == 1 ? "oneway": "roundtrip";
    if(tript_type == "roundtrip")
    {
        let flight_dept_time = item[0].FlightDepartureDate.split(' ')[1];
        let flight_dept_arrival_time = item[0].FlightArrivalDate.split(' ')[1];
        let flight_return_dept_time = item[1].FlightDepartureDate.split(' ')[1];
        let flight_return_arrival_time = item[1].FlightArrivalDate.split(' ')[1];
        if(flight_dept_time == undefined || flight_dept_time == "")
        {
            flight_dept_time = "00:00:00";
        }
        if(flight_dept_arrival_time == undefined || flight_dept_arrival_time == "")
        {
            flight_dept_arrival_time = "00:00:00";
        }
        if(flight_return_dept_time == undefined || flight_return_dept_time == "")
        {
            flight_return_dept_time = "00:00:00";
        }
        if(flight_return_arrival_time == undefined || flight_return_arrival_time == "")
        {
            flight_return_arrival_time = "00:00:00";
        }
        var datapre = {
        flightType:tript_type,
        departureOrigin:item[0].origin,
        departureDestination:item[0].destinat,
        returnOrigin:item[1].origin,
        returnDestination:item[1].destinat,
        departureDate:item[0].FlightDepartureDate.split(' ')[0],
        departureTime:'07:40:00',
        departure_arrivalTime:'10:40:00',
        returnDate:item[1].FlightDepartureDate.split(' ')[0],
        returnTime:'00:10:00',
        return_arrivalTime:'04:37:00',
        seats:1,
        invoke_source:"availability",
        div_id:"flight_details"+obj.id_number,
        action:"getFlightDetails",
        flight_carrier : item[0].airline_code,
        flight_carrier2 : item[1].airline_code,
        flight_carrier_name : item[0].airline_name,
        pnrObj : item[0].pnrObj
      };
          
    }else
    {
        let flight_dept_time = item[0].FlightDepartureDate.split(' ')[1];
        let flight_dept_arrival_time = item[0].FlightArrivalDate.split(' ')[1];
        if(flight_dept_time == undefined || flight_dept_time == "")
        {
            flight_dept_time = "00:00:00";
        }
        if(flight_dept_arrival_time == undefined || flight_dept_arrival_time == "")
        {
            flight_dept_arrival_time = "00:00:00";
        }
        var datapre = {
            flightType: "oneway",
            // departure: "Abu Dhabi",
            // destination: "manchester",

            departure:item[0].origin,
            destination:item[0].destinat,
            date: item[0].FlightDepartureDate.split(' ')[0],
            // date: obj.flight_dep,
            time: flight_dept_time,
            arrivalTime:flight_dept_arrival_time,
            // time: "07:09:00",
            // arrivalTime:"10:01:00",
            numOfSeats: 1,
            invoke_source: "availability",
            div_id:"flight_details"+obj.id_number,
            action: "getFlightDetails",
            flight_carrier :item[0].airline_code,
            flight_carrier_name : item[0].airline_name,
            pnrObj : item[0].pnrObj
          };
    }
}
    
async function xml_request()
{

    var resourceURL = `${baseIP}/api/save/getPNRDetails`;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {
            var response = JSON.parse(this.response);
            if(response.success)
            {

            }
        }
    }
    xmlhttp.open("POST", resourceURL, true);
    xmlhttp.withCredentials = true;
    xmlhttp.credentials = "include";
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    xmlhttp.send();  
}

function profileNotFound()
{
    $("#profile_search_error").modal({ backdrop: 'static', keyboard: false });
}

//  ** LOGGER FUNCTIONALITY  **            //

//==============================================================================//

//=================================Close Match task=============================================//
//=================================Close Match task=============================================//

function renderDropDown(first_and_last_html, option_array) {
    let str0 = first_and_last_html[0];
    let str1 = first_and_last_html[1];
    let options_html = `<option value="">None</option>`;
    if (option_array.length !== 0) {
        option_array.forEach(element => {
            options_html += `<option value="${element}">${element}</option>`;
        });
        return `${str0}${options_html}${str1}`;

    } else {
        //console.log("return statements----------");
        return ``;
    }

}

function showFiltersToResponse(result_array, invoke_source, div_id) {
    flights_data_for_fileration = result_array;
    var [class_of_service, carriers_set, arrival_times, departure_times, arrival_times_return, departure_times_return, total_price, num_of_stops] = [new Set(), new Set(), new Set(), new Set(), new Set(), new Set(), new Set(), new Set()];
    var flightType = false;
    if (result_array[0].flight_type == "roundtrip") {
        flightType = true;
    }
    for (let i = 0; i < result_array.length; i++) {
        const element = result_array[i];
        class_of_service.add(result_array[i].class_of_service);//get CLass of flight
        total_price.add(result_array[i].total_price);
        let flight_schedule_details = element.temp_departure_details.flight_schedule_details;
        num_of_stops.add(element.temp_departure_details.stops_details.length);//get number of stops
        for (let j = 0; j < flight_schedule_details.length; j++) {
            arrival_times.add(moment.utc(flight_schedule_details[j].arrivalTime).format('LT'));
            departure_times.add(moment.utc(flight_schedule_details[j].deptTime).format('LT'));
            carriers_set.add(flight_schedule_details[j].MarketingCarrier);

        }
        if (flightType) {
            let flight_schedule_details = element.temp_return_details.flight_schedule_details;
            num_of_stops.add(element.temp_return_details.stops_details.length);//get number of stops
            for (let k = 0; k < flight_schedule_details.length; k++) {
                arrival_times_return.add(moment.utc(flight_schedule_details[k].arrivalTime).format('LT'));
                departure_times_return.add(moment.utc(flight_schedule_details[k].deptTime).format('LT'));
                carriers_set.add(flight_schedule_details[k].MarketingCarrier);
            }

        }

    }
    let [carriers_array,
        class_of_service_array,
        arrival_times_array,
        departure_times_array,
        arrival_times_return_array,
        departure_times_return_array,
        total_price_array,
        num_of_stops_array] = [
            Array.from(carriers_set),
            Array.from(class_of_service),
            Array.from(arrival_times),
            Array.from(departure_times),
            Array.from(arrival_times_return),
            Array.from(departure_times_return),
            Array.from(total_price),
            Array.from(num_of_stops)
        ];
    

    let carrier_dd = renderDropDown`<div class="form-group"><label for="carrier_name">Carrier</label><div class="select-caret">
    <select id="carrier_name" onchange="applyFiltersOnMultipleFeilds('carrier')" name="carrier_name" class="custom-select">${carriers_array}</select></div></div>`;
    let departure_departure_dd = renderDropDown`<div class="form-group"><div class="select-caret">
    <select id="departure_time" onchange="applyFiltersOnMultipleFeilds('dep')"name="departure_time" class="custom-select">${departure_times_array}</select></div></div>`;
    let departure_arrival_dd = renderDropDown`<div class="form-group"><div class="select-caret">
    <select id="arrival_time" onchange="applyFiltersOnMultipleFeilds('arri')" name="arrival_time" class="disabled-dropdowns custom-select">${arrival_times_array}</select></div></div>`;
    let return_departure_dd = renderDropDown`<div class="form-group"><div class="select-caret">
    <select id="return_departure_time" onchange="applyFiltersOnMultipleFeilds('dep_ret')" name="return_departure_time" class="custom-select">${departure_times_return_array}</select></div></div>`;
    let return_arrival_dd = renderDropDown`<div class="form-group"><div class="select-caret">
    <select id="return_arrival_time" onchange="applyFiltersOnMultipleFeilds('arri_ret')"name="return_arrival_time" class="disabled-dropdowns custom-select">${arrival_times_return_array}</select></div></div>`;
    let stops_dd = renderDropDown`<div class="form-group"><label for="stops">Stops</label><div class="select-caret">
    <select id="stops" onchange="applyFiltersOnMultipleFeilds('num_stop')" name="stops" class="custom-select">${num_of_stops_array}</select></div></div>`;
    // let [lowest_price, highest_price] = [Math.min.apply(null, total_price_array), Math.max.apply(null, total_price_array)];
    let [lowest_price, highest_price] = [isNaN(Math.min.apply(null, total_price_array)) ? "0" : Math.min.apply(null, total_price_array), isNaN(Math.max.apply(null, total_price_array)) ? "0" : Math.max.apply(null, total_price_array)];

    var complete_html = `<div class="container closet-match-form">
    <div class="form-group">
        <label>Price</label>
        <div class="row">
            <div class="col-lg-6 col-md-6">
                <label for="max_price" class="color-fade">Max Price</label> 
                <input id="max_price" name="max_price" placeholder="$${highest_price}" type="text" class="form-control">
            </div>
            <div class="col-lg-6 col-md-6">
                <label for="min_price" class="color-fade">Min Price</label> 
                <input id="min_price" name="min_price" placeholder="$${lowest_price}" type="text" class="form-control">
            </div>
        </div>
    </div>${carrier_dd}<div class="form-group">
    <label>Outbound Time</label> 
    <div class="row time-row">
        <div class="col-lg-6 col-md-6">
            <label class="radio-inline"><input id="outbound_rd_0" type="radio" name="outbound_rd_" value ="dep" checked>Departure</label>
            ${departure_departure_dd}
        </div>
        <div class="col-lg-6 col-md-6">
            <label class="radio-inline"><input id="outbound_rd_1"  type="radio" name="outbound_rd_" value = "arr">Arrival</label>
            ${departure_arrival_dd}
        </div>
    </div>
  </div><div class="form-group return_chk_div" style="display: none">
  <label>Return Time</label> 
  <div class="row time-row">
    <div class="col-lg-6 col-md-6">
        <label class="radio-inline"><input id="return_rd_0" type="radio" name="return_rd_" value ="return_dep" checked>Departure</label>
        ${(departure_times_array ? return_departure_dd : "")}
    </div>
    <div class="col-lg-6 col-md-6">
        <label class="radio-inline"><input id="return_rd_1"  type="radio" name="return_rd_" value = "return_arr">Arrival</label>
        ${(arrival_times_return_array ? return_arrival_dd : "")}
    </div>
  </div>
  <div>
  </div>
</div>  ${stops_dd}<div class="form-group">
<button name="submit" type="submit" onclick = "applyFiltersOnResults('${invoke_source}', '${div_id}')" class="btn btn-primary smt-btn">Submit</button>
</div> 
</div>`;

    setTimeout(() => {
        // $('#arrival_time').addClass("disabled-dropdowns");
        // $('#return_arrival_time').addClass("disabled-dropdowns");

        $("#outbound_rd_0").click(function () {

            $('#departure_time').removeClass("disabled-dropdowns");
            $('#arrival_time').addClass("disabled-dropdowns");
            $('#arrival_time').val([]);


        });
        $("#outbound_rd_1").click(function () {

            $('#arrival_time').removeClass("disabled-dropdowns");
            $('#departure_time').addClass("disabled-dropdowns");
            $('#departure_time').val([]);

        });

        $("#return_rd_0").click(function () {

            $('#return_departure_time').removeClass("disabled-dropdowns");
            $('#return_arrival_time').addClass("disabled-dropdowns");
            $('#return_arrival_time').val([]);


        });
        $("#return_rd_1").click(function () {

            $('#return_arrival_time').addClass("disabled-dropdowns");
            $('#return_departure_time').removeClass("disabled-dropdowns");
            $('#return_departure_time').val([]);

        });
        $("#min_price").keyup(function () {
            setTimeout(() => {
                applyFiltersOnMultipleFeilds("min_price");

            }, 2000);

        });
        $("#max_price").keyup(function () {
            setTimeout(() => {
                applyFiltersOnMultipleFeilds("max_price");
            }, 2000);

        });
        if (flightType) {
            $('.return_chk_div').show();

        }
    }, 2000);

    return complete_html;
}

async function applyFiltersOnResults(invoke_source, div_id) {  
    let finally_filtered_array = flights_data_for_fileration;

    // let [low_pr, max_pr, carr, out_departure, out_arrival, return_departure, return_arrival, stops] = ["197.63", "500", "AA", "12:02 AM", "10:38 PM", "", "", "0"];
    let [low_pr, max_pr, carr, outbound_rd_, out_departure, out_arrival, return_rd_, return_departure, return_arrival, stops] = [

        $("#min_price").val(),
        $("#max_price").val(),
        $('#carrier_name option:selected').val(),
        $("input[type=radio][name=outbound_rd_]:checked").val() || "",
        $('#departure_time option:selected').val(),
        $('#arrival_time option:selected').val(),
        $("input[type=radio][name=return_rd_]:checked").val() || "",
        $('#return_departure_time option:selected').val(),
        $('#return_arrival_time option:selected').val(),
        $('#stops option:selected').val()]

    let pushed_flight_ids = [];
    var flightType = false;
    if (flights_data_for_fileration[0].flight_type == "roundtrip") {
        flightType = true;
        $('.return_chk_div').show();
    }
    
    if (max_pr) {
        finally_filtered_array = applyFiltersOnMaxPrice(finally_filtered_array, max_pr);
    }
   

    if (low_pr) {
        finally_filtered_array = applyFiltersOnLowPrice(finally_filtered_array, low_pr);
    }
    
    if (carr) {
        finally_filtered_array = applyFiltersOnCarrPrice(finally_filtered_array, carr);
    }
    
    if (outbound_rd_) {
        if (outbound_rd_ == "dep") {
            if (out_departure) {
                finally_filtered_array = applyFiltersOnOutDeparture(finally_filtered_array, out_departure);
            }
        }
        if (outbound_rd_ == "arr") {
            
            if (out_arrival) {
                finally_filtered_array = applyFiltersOnOutArrival(finally_filtered_array, out_arrival);
            }

        }

    }

   

    if (flightType) {
        
        if (return_rd_ == "return_dep") {
            if (return_departure) {
                finally_filtered_array = applyFiltersOnReturnDeparture(finally_filtered_array, return_departure);
            }
        }

        if (return_rd_ == "return_arr") {
            if (return_arrival) {
                finally_filtered_array = applyFiltersOnOutReturnArrival(finally_filtered_array, return_arrival);
            }
        }
    }
    
    if (stops) {
        finally_filtered_array = applyFiltersOnStops(finally_filtered_array, stops);
    }

    // return finally_filtered_array;
    //    let updated_flight_details =  applyFiltersOnResults2(flights_data_for_fileration);
    if (!finally_filtered_array.length == 0) {
        var html = await parse_flight_search_view(finally_filtered_array, div_id, invoke_source);
        appendChatData(html);

        $('.smt-btn').addClass("disabled-dropdowns");
        // $("#msg-body").append(html);
    } else {
        $("#msg-body").append(`
            <div class="msg-row" style=""><div class="user-msg receive"><div class="avator-icon">
            <img src="/images/avatar-img-01.png"></div>
            <p>No data according to your parameters</p></div></div>`);
    }


}

function applyFiltersOnLowPrice(result_array, low_pr) {
    let new_array = [];
    for (let i = 0; i < result_array.length; i++) {
        if (result_array[i].total_price <= low_pr) {
            new_array.push(result_array[i]);
        }
    }
    
    return new_array;
}

function applyFiltersOnMaxPrice(result_array, max_pr) {
    
    let new_array = [];
    for (let i = 0; i < result_array.length; i++) {
        if (result_array[i].total_price <= max_pr) {
            new_array.push(result_array[i]);

        }
    }
    
    return new_array;
}

function applyFiltersOnCarrPrice(result_array, carr) {
    let new_array = [];
    for (let i = 0; i < result_array.length; i++) {
        let flight_schedule_details = result_array[i].temp_departure_details.flight_schedule_details;
        if (carr == flight_schedule_details[0].MarketingCarrier) {
            new_array.push(result_array[i]);
        }

    }
    return new_array;
}

function applyFiltersOnOutDeparture(result_array, out_departure) {
    let new_array = [];
    for (let i = 0; i < result_array.length; i++) {
        let flight_schedule_details = result_array[i].temp_departure_details.flight_schedule_details;
        if (out_departure == moment.utc(flight_schedule_details[0].deptTime).format('LT')) {
            new_array.push(result_array[i]);
        }
    }

    return new_array;
}

function applyFiltersOnOutArrival(result_array, out_arrival) {
    let new_array = [];
    for (let i = 0; i < result_array.length; i++) {
        let flight_schedule_details = result_array[i].temp_departure_details.flight_schedule_details;
        if (out_arrival == moment.utc(flight_schedule_details[0].arrivalTime).format('LT')) {
            new_array.push(result_array[i]);
        }

    }
    return new_array;
}

function applyFiltersOnStops(result_array, stops) {
    let new_array = [];
    for (let i = 0; i < result_array.length; i++) {
        num_of_stops = result_array[i].temp_departure_details.stops_details.length;
        if (stops == num_of_stops) {
            new_array.push(result_array[i]);
        }
    }
    return new_array;
}

function applyFiltersOnReturnDeparture(result_array, return_departure) {
    let new_array = [];
    for (let i = 0; i < result_array.length; i++) {
        let flight_schedule_details = result_array[i].temp_return_details.flight_schedule_details;
        let num_of_stops = result_array[i].temp_departure_details.stops_details.length;
        if (return_departure == moment.utc(flight_schedule_details[num_of_stops].deptTime).format('LT')) {
            new_array.push(result_array[i]);
        }
    }
    return new_array;
}

function applyFiltersOnOutReturnArrival(result_array, return_arrival) {
    let new_array = [];
    for (let i = 0; i < result_array.length; i++) {
        let flight_schedule_details = result_array[i].temp_return_details.flight_schedule_details;
        let num_of_stops = result_array[i].temp_return_details.stops_details.length;
        if (return_arrival == moment.utc(flight_schedule_details[num_of_stops].arrivalTime).format('LT')) {
            new_array.push(result_array[i]);
        }

    }
    return new_array;
}

function applyFiltersOnMultipleFeilds(inputfrom) {
    if (!inputfrom) {
        return;
    }
    // debugger;
    let [low_pr, max_pr, carr, outbound_rd_, out_departure, out_arrival, return_rd_, return_departure, return_arrival, stops] = [
        $("#max_price").val(),
        $("#min_price").val(),
        $('#carrier_name option:selected').val(),
        $("input[type=radio][name=outbound_rd_]:checked").val() || "",
        $('#departure_time option:selected').val(),
        $('#arrival_time option:selected').val(),
        $("input[type=radio][name=return_rd_]:checked").val() || "",
        $('#return_departure_time option:selected').val(),
        $('#return_arrival_time option:selected').val(),
        $('#stops option:selected').val()]

    let result_array = flights_data_for_fileration;
    var flightType = false;
    if (result_array[0].flight_type == "roundtrip") {
        flightType = true;
    }

    // let [low_pr, max_pr, carr, out_departure, out_arrival, return_departure, return_arrival, stops] = ["375", "387", "", "", "", "", "", ""];
    var [class_of_service, carriers_set, arrival_times, departure_times, arrival_times_return, departure_times_return, total_price, number_of_stops] = [new Set(), new Set(), new Set(), new Set(), new Set(), new Set(), new Set(), new Set()];
    // this condition will check from which input field the function called and will entertain it
    if (inputfrom == "carrier") {
        for (let i = 0; i < result_array.length; i++) {
            let flight_schedule_details = result_array[i].temp_departure_details.flight_schedule_details;
            if (carr == flight_schedule_details[0].MarketingCarrier) {
                if (!max_pr && !low_pr) {
                    total_price.add(result_array[i].total_price);
                }

                if (!out_departure) {
                    let flight_schedule_details = result_array[i].temp_departure_details.flight_schedule_details;
                    departure_times.add(moment.utc(flight_schedule_details[0].deptTime).format('LT'));

                }
                if (!out_arrival) {
                    let flight_schedule_details = result_array[i].temp_departure_details.flight_schedule_details;
                    arrival_times.add(moment.utc(flight_schedule_details[0].arrivalTime).format('LT'));

                }
                if (flightType) {
                    if (!return_departure) {
                        let flight_schedule_details = result_array[i].temp_return_details.flight_schedule_details;
                        let num_of_stops = result_array[i].temp_return_details.stops_details.length;
                        departure_times_return.add(moment.utc(flight_schedule_details[num_of_stops].arrivalTime).format('LT'));

                    }
                    if (!return_arrival) {
                        let flight_schedule_details = result_array[i].temp_return_details.flight_schedule_details;
                        let num_of_stops = result_array[i].temp_return_details.stops_details.length;
                        arrival_times_return.add(moment.utc(flight_schedule_details[num_of_stops].arrivalTime).format('LT'));

                    }
                }
                if (!stops) {
                    let num_of_stops = result_array[i].temp_departure_details.stops_details.length;
                    number_of_stops.add(num_of_stops);
                }
            }
        }
        let [carriers_array,
            arrival_times_array,
            departure_times_array,
            arrival_times_return_array,
            departure_times_return_array,
            total_price_array,
            num_of_stops_array] = [
                Array.from(carriers_set),
                Array.from(arrival_times),
                Array.from(departure_times),
                Array.from(arrival_times_return),
                Array.from(departure_times_return),
                Array.from(total_price),
                Array.from(number_of_stops)
            ];
        // (carriers_array.length > 0)? appendOptionstoSelect("carrier_name", carriers_array):'';
        (departure_times_array.length > 0) ? appendOptionstoSelect("departure_time", departure_times_array) : '';
        (arrival_times_array.length > 0) ? appendOptionstoSelect("arrival_time", arrival_times_array) : '';
        (departure_times_return_array.length > 0) ? appendOptionstoSelect("return_departure_time", departure_times_return_array) : '';
        (arrival_times_return_array.length > 0) ? appendOptionstoSelect("return_arrival_time", arrival_times_return_array) : '';
        let [lowest_price, highest_price] = [isNaN(Math.min.apply(null, total_price_array)) ? "0" : Math.min.apply(null, total_price_array), isNaN(Math.max.apply(null, total_price_array)) ? "0" : Math.max.apply(null, total_price_array)];
        $('#max_price').attr("placeholder", highest_price);
        $('#min_price').attr("placeholder", lowest_price);
        // (total_price_array.length > 0)? appendOptionstoSelect("departure_time", departure_times_array):'';
        (num_of_stops_array.length > 0) ? appendOptionstoSelect("stops", num_of_stops_array) : '';

    }
    if (inputfrom == "dep") {
        for (let i = 0; i < result_array.length; i++) {
            let flight_schedule_details = result_array[i].temp_departure_details.flight_schedule_details;

            if (out_departure == moment.utc(flight_schedule_details[0].deptTime).format('LT')) {
                if (!max_pr && !low_pr) {
                    total_price.add(result_array[i].total_price);
                }
                if (!carr) {
                    carriers_set.add(flight_schedule_details[0].MarketingCarrier);
                }
                if (!out_arrival) {
                    let flight_schedule_details = result_array[i].temp_departure_details.flight_schedule_details;
                    arrival_times.add(moment.utc(flight_schedule_details[0].arrivalTime).format('LT'));

                }
                if (flightType) {
                    if (!return_departure) {
                        let flight_schedule_details = result_array[i].temp_return_details.flight_schedule_details;
                        let num_of_stops = result_array[i].temp_return_details.stops_details.length;
                        departure_times_return.add(moment.utc(flight_schedule_details[num_of_stops].deptTime).format('LT'));

                    }
                    if (!return_arrival) {
                        let flight_schedule_details = result_array[i].temp_return_details.flight_schedule_details;
                        let num_of_stops = result_array[i].temp_return_details.stops_details.length;
                        arrival_times_return.add(moment.utc(flight_schedule_details[num_of_stops].arrivalTime).format('LT'));

                    }
                }
                if (!stops) {
                    let num_of_stops = result_array[i].temp_departure_details.stops_details.length;
                    number_of_stops.add(num_of_stops);
                }

            }
        }
        let [carriers_array,
            arrival_times_array,
            departure_times_array,
            arrival_times_return_array,
            departure_times_return_array,
            total_price_array,
            num_of_stops_array] = [
                Array.from(carriers_set),
                Array.from(arrival_times),
                Array.from(departure_times),
                Array.from(arrival_times_return),
                Array.from(departure_times_return),
                Array.from(total_price),
                Array.from(number_of_stops)
            ];
        (carriers_array.length > 0) ? appendOptionstoSelect("carrier_name", carriers_array) : '';
        (arrival_times_array.length > 0) ? appendOptionstoSelect("arrival_time", arrival_times_array) : '';
        (departure_times_return_array.length > 0) ? appendOptionstoSelect("return_departure_time", departure_times_return_array) : '';
        (arrival_times_return_array.length > 0) ? appendOptionstoSelect("return_arrival_time", arrival_times_return_array) : '';
        // let [lowest_price, highest_price] = [Math.min.apply(null, total_price_array), Math.max.apply(null, total_price_array)];
        let [lowest_price, highest_price] = [isNaN(Math.min.apply(null, total_price_array)) ? "0" : Math.min.apply(null, total_price_array), isNaN(Math.max.apply(null, total_price_array)) ? "0" : Math.max.apply(null, total_price_array)];

        $('#max_price').attr("placeholder", highest_price);
        $('#min_price').attr("placeholder", lowest_price);
        (num_of_stops_array.length > 0) ? appendOptionstoSelect("stops", num_of_stops_array) : '';

    }
    if (inputfrom == "arri") {
        for (let i = 0; i < result_array.length; i++) {
            let flight_schedule_details = result_array[i].temp_departure_details.flight_schedule_details;
            if (out_arrival == moment.utc(flight_schedule_details[0].arrivalTime).format('LT')) {
                if (!max_pr && !low_pr) {
                    total_price.add(result_array[i].total_price);
                }

                if (!carr) {
                    carriers_set.add(flight_schedule_details[0].MarketingCarrier);
                }

                if (!out_departure) {
                    let flight_schedule_details = result_array[i].temp_departure_details.flight_schedule_details;
                    departure_times.add(moment.utc(flight_schedule_details[0].deptTime).format('LT'));

                }
                if (flightType) {
                    if (!return_departure) {
                        let flight_schedule_details = result_array[i].temp_return_details.flight_schedule_details;
                        let num_of_stops = result_array[i].temp_return_details.stops_details.length;
                        departure_times_return.add(moment.utc(flight_schedule_details[num_of_stops].deptTime).format('LT'));

                    }
                    if (!return_arrival) {
                        let flight_schedule_details = result_array[i].temp_return_details.flight_schedule_details;
                        let num_of_stops = result_array[i].temp_return_details.stops_details.length;
                        arrival_times_return.add(moment.utc(flight_schedule_details[num_of_stops].arrivalTime).format('LT'));

                    }
                }
                if (!stops) {
                    let num_of_stops = result_array[i].temp_departure_details.stops_details.length;
                    number_of_stops.add(num_of_stops);
                }
            }
        }

        let [carriers_array,
            arrival_times_array,
            departure_times_array,
            arrival_times_return_array,
            departure_times_return_array,
            total_price_array,
            num_of_stops_array] = [
                Array.from(carriers_set),
                Array.from(arrival_times),
                Array.from(departure_times),
                Array.from(arrival_times_return),
                Array.from(departure_times_return),
                Array.from(total_price),
                Array.from(number_of_stops)
            ];
        (carriers_array.length > 0) ? appendOptionstoSelect("carrier_name", carriers_array) : '';
        (departure_times_array.length > 0) ? appendOptionstoSelect("departure_time", departure_times_array) : '';
        (departure_times_return_array.length > 0) ? appendOptionstoSelect("return_departure_time", departure_times_return_array) : '';
        (arrival_times_return_array.length > 0) ? appendOptionstoSelect("return_arrival_time", arrival_times_return_array) : '';
        // let [lowest_price, highest_price] = [Math.min.apply(null, total_price_array), Math.max.apply(null, total_price_array)];
        let [lowest_price, highest_price] = [isNaN(Math.min.apply(null, total_price_array)) ? "0" : Math.min.apply(null, total_price_array), isNaN(Math.max.apply(null, total_price_array)) ? "0" : Math.max.apply(null, total_price_array)];

        $('#max_price').attr("placeholder", highest_price);
        $('#min_price').attr("placeholder", lowest_price);
        // (total_price_array.length > 0)? appendOptionstoSelect("departure_time", departure_times_array):'';
        (num_of_stops_array.length > 0) ? appendOptionstoSelect("stops", num_of_stops_array) : '';


    }
    if (inputfrom == "dep_ret") {
        for (let i = 0; i < result_array.length; i++) {
            let flight_schedule_details = result_array[i].temp_return_details.flight_schedule_details;
            let num_of_stops = result_array[i].temp_return_details.stops_details.length;
            if (flightType) {
                // if (out_arrival == moment.utc(flight_schedule_details[0].arrivalTime).format('LT')) {
                if (return_departure == moment.utc(flight_schedule_details[num_of_stops].deptTime).format('LT')) {

                    if (!max_pr && !low_pr) {
                        total_price.add(result_array[i].total_price);
                    }

                    if (!carr) {
                        carriers_set.add(flight_schedule_details[0].MarketingCarrier);
                    }

                    if (!out_departure) {
                        departure_times.add(moment.utc(flight_schedule_details[0].deptTime).format('LT'));

                    }
                    if (flightType) {
                        if (!return_arrival) {
                            arrival_times_return.add(moment.utc(flight_schedule_details[num_of_stops].arrivalTime).format('LT'));

                        }
                    }
                    if (!stops) {
                        let num_of_stops = result_array[i].temp_departure_details.stops_details.length;
                        number_of_stops.add(num_of_stops);
                    }
                }
            }
        }

        let [carriers_array,
            arrival_times_array,
            departure_times_array,
            arrival_times_return_array,
            departure_times_return_array,
            total_price_array,
            num_of_stops_array] = [
                Array.from(carriers_set),
                Array.from(arrival_times),
                Array.from(departure_times),
                Array.from(arrival_times_return),
                Array.from(departure_times_return),
                Array.from(total_price),
                Array.from(number_of_stops)
            ];
        (carriers_array.length > 0) ? appendOptionstoSelect("carrier_name", carriers_array) : '';
        (departure_times_array.length > 0) ? appendOptionstoSelect("departure_time", departure_times_array) : '';
        (arrival_times_array.length > 0) ? appendOptionstoSelect("arrival_time", arrival_times_array) : '';
        (arrival_times_return_array.length > 0) ? appendOptionstoSelect("return_arrival_time", arrival_times_return_array) : '';
        // let [lowest_price, highest_price] = [Math.min.apply(null, total_price_array), Math.max.apply(null, total_price_array)];
        let [lowest_price, highest_price] = [isNaN(Math.min.apply(null, total_price_array)) ? "0" : Math.min.apply(null, total_price_array), isNaN(Math.max.apply(null, total_price_array)) ? "0" : Math.max.apply(null, total_price_array)];

        $('#max_price').attr("placeholder", highest_price);
        $('#min_price').attr("placeholder", lowest_price);
        (num_of_stops_array.length > 0) ? appendOptionstoSelect("stops", num_of_stops_array) : '';

    }
    if (inputfrom == "arri_ret") {
        for (let i = 0; i < result_array.length; i++) {
            let flight_schedule_details = result_array[i].temp_return_details.flight_schedule_details;
            let num_of_stops = result_array[i].temp_return_details.stops_details.length;
            if (flightType) {
               
                if (return_arrival == moment.utc(flight_schedule_details[num_of_stops].arrivalTime).format('LT')) {

                    if (!max_pr && !low_pr) {
                        total_price.add(result_array[i].total_price);
                    }

                    if (!carr) {
                        carriers_set.add(flight_schedule_details[0].MarketingCarrier);
                    }

                    if (!out_departure) {
                        let flight_schedule_details = result_array[i].temp_departure_details.flight_schedule_details;
                        departure_times.add(moment.utc(flight_schedule_details[0].deptTime).format('LT'));

                    }
                    if (flightType) {

                        if (!return_departure) {

                            departure_times_return.add(moment.utc(flight_schedule_details[num_of_stops].deptTime).format('LT'));

                        }

                    }
                    if (!stops) {
                        let num_of_stops = result_array[i].temp_departure_details.stops_details.length;
                        number_of_stops.add(num_of_stops);
                    }
                }
            }
        }

        let [carriers_array,
            arrival_times_array,
            departure_times_array,
            arrival_times_return_array,
            departure_times_return_array,
            total_price_array,
            num_of_stops_array] = [
                Array.from(carriers_set),
                Array.from(arrival_times),
                Array.from(departure_times),
                Array.from(arrival_times_return),
                Array.from(departure_times_return),
                Array.from(total_price),
                Array.from(number_of_stops)
            ];
        (carriers_array.length > 0) ? appendOptionstoSelect("carrier_name", carriers_array) : '';
        (departure_times_array.length > 0) ? appendOptionstoSelect("departure_time", departure_times_array) : '';
        (arrival_times_array.length > 0) ? appendOptionstoSelect("arrival_time", arrival_times_array) : '';
        (departure_times_return_array.length > 0) ? appendOptionstoSelect("return_departure_time", departure_times_return_array) : '';
        // let [lowest_price, highest_price] = [Math.min.apply(null, total_price_array), Math.max.apply(null, total_price_array)];
        let [lowest_price, highest_price] = [isNaN(Math.min.apply(null, total_price_array)) ? "0" : Math.min.apply(null, total_price_array), isNaN(Math.max.apply(null, total_price_array)) ? "0" : Math.max.apply(null, total_price_array)];

        $('#max_price').attr("placeholder", highest_price);
        $('#min_price').attr("placeholder", lowest_price);
        (num_of_stops_array.length > 0) ? appendOptionstoSelect("stops", num_of_stops_array) : '';
        

    }
    if (inputfrom == "num_stop") {
        for (let i = 0; i < result_array.length; i++) {
            let flight_schedule_details = result_array[i].temp_departure_details.flight_schedule_details;
            let num_of_stops = result_array[i].temp_departure_details.stops_details.length;
            if (stops == num_of_stops) {
                // if (out_arrival == moment.utc(flight_schedule_details[0].arrivalTime).format('LT')) {


                if (!max_pr && !low_pr) {
                    total_price.add(result_array[i].total_price);
                }

                if (!carr) {
                    carriers_set.add(flight_schedule_details[0].MarketingCarrier);
                }

                if (!out_departure) {
                    let flight_schedule_details = result_array[i].temp_departure_details.flight_schedule_details;
                    departure_times.add(moment.utc(flight_schedule_details[0].deptTime).format('LT'));

                }
                if (!out_arrival) {
                    arrival_times.add(moment.utc(flight_schedule_details[0].arrivalTime).format('LT'));

                }
                if (flightType) {
                    if (!return_departure) {
                        let flight_schedule_details = result_array[i].temp_return_details.flight_schedule_details;
                        let num_of_stops = result_array[i].temp_return_details.stops_details.length;
                        departure_times_return.add(moment.utc(flight_schedule_details[num_of_stops].deptTime).format('LT'));

                    }
                    if (!return_arrival) {
                        let flight_schedule_details = result_array[i].temp_return_details.flight_schedule_details;
                        let num_of_stops = result_array[i].temp_return_details.stops_details.length;
                        arrival_times_return.add(moment.utc(flight_schedule_details[num_of_stops].arrivalTime).format('LT'));

                    }
                }

            }
        }

        let [carriers_array,
            arrival_times_array,
            departure_times_array,
            arrival_times_return_array,
            departure_times_return_array,
            total_price_array,
            num_of_stops_array] = [
                Array.from(carriers_set),
                Array.from(arrival_times),
                Array.from(departure_times),
                Array.from(arrival_times_return),
                Array.from(departure_times_return),
                Array.from(total_price),
                Array.from(number_of_stops)
            ];
        (carriers_array.length > 0) ? appendOptionstoSelect("carrier_name", carriers_array) : '';
        (departure_times_array.length > 0) ? appendOptionstoSelect("departure_time", departure_times_array) : '';
        (arrival_times_array.length > 0) ? appendOptionstoSelect("arrival_time", arrival_times_array) : '';
        (departure_times_return_array.length > 0) ? appendOptionstoSelect("return_departure_time", departure_times_return_array) : '';
        (arrival_times_return_array.length > 0) ? appendOptionstoSelect("return_arrival_time", arrival_times_return_array) : '';
        // let [lowest_price, highest_price] = [Math.min.apply(null, total_price_array), Math.max.apply(null, total_price_array)];
        let [lowest_price, highest_price] = [isNaN(Math.min.apply(null, total_price_array)) ? "0" : Math.min.apply(null, total_price_array), isNaN(Math.max.apply(null, total_price_array)) ? "0" : Math.max.apply(null, total_price_array)];

        $('#max_price').attr("placeholder", highest_price);
        $('#min_price').attr("placeholder", lowest_price);
        (num_of_stops_array.length > 0) ? appendOptionstoSelect("stops", num_of_stops_array) : '';
        

    }
    if (inputfrom == "min_price") {
        for (let i = 0; i < result_array.length; i++) {
            let flight_schedule_details = result_array[i].temp_departure_details.flight_schedule_details;
            let num_of_stops = result_array[i].temp_departure_details.stops_details.length;
            let total_pr = result_array[i].total_price;
            if (low_pr <= total_pr) {
                // if (out_arrival == moment.utc(flight_schedule_details[0].arrivalTime).format('LT')) {
                total_price.add(low_pr);
                if (!carr) {
                    carriers_set.add(flight_schedule_details[0].MarketingCarrier);
                }

                if (!out_departure) {
                    let flight_schedule_details = result_array[i].temp_departure_details.flight_schedule_details;
                    departure_times.add(moment.utc(flight_schedule_details[0].deptTime).format('LT'));

                }
                if (!out_arrival) {
                    let flight_schedule_details = result_array[i].temp_departure_details.flight_schedule_details;
                    arrival_times.add(moment.utc(flight_schedule_details[0].arrivalTime).format('LT'));

                }
                if (flightType) {
                    if (!return_departure) {
                        let flight_schedule_details = result_array[i].temp_return_details.flight_schedule_details;
                        let num_of_stops = result_array[i].temp_return_details.stops_details.length;
                        departure_times_return.add(moment.utc(flight_schedule_details[num_of_stops].deptTime).format('LT'));

                    }
                    if (!return_arrival) {
                        let flight_schedule_details = result_array[i].temp_return_details.flight_schedule_details;
                        let num_of_stops = result_array[i].temp_return_details.stops_details.length;
                        arrival_times_return.add(moment.utc(flight_schedule_details[num_of_stops].arrivalTime).format('LT'));

                    }
                }
                if (!stops) {
                    number_of_stops.add(num_of_stops);
                }

            }
        }

        let [carriers_array,
            arrival_times_array,
            departure_times_array,
            arrival_times_return_array,
            departure_times_return_array,
            total_price_array,
            num_of_stops_array] = [
                Array.from(carriers_set),
                Array.from(arrival_times),
                Array.from(departure_times),
                Array.from(arrival_times_return),
                Array.from(departure_times_return),
                Array.from(total_price),
                Array.from(number_of_stops)
            ];
        (carriers_array.length > 0) ? appendOptionstoSelect("carrier_name", carriers_array) : '';
        (departure_times_array.length > 0) ? appendOptionstoSelect("departure_time", departure_times_array) : '';
        (arrival_times_array.length > 0) ? appendOptionstoSelect("arrival_time", arrival_times_array) : '';
        (departure_times_return_array.length > 0) ? appendOptionstoSelect("return_departure_time", departure_times_return_array) : '';
        (arrival_times_return_array.length > 0) ? appendOptionstoSelect("return_arrival_time", arrival_times_return_array) : '';
        // let [lowest_price, highest_price] = [Math.min.apply(null, total_price_array), Math.max.apply(null, total_price_array)];
        let [lowest_price, highest_price] = [isNaN(Math.min.apply(null, total_price_array)) ? "0" : Math.min.apply(null, total_price_array), isNaN(Math.max.apply(null, total_price_array)) ? "0" : Math.max.apply(null, total_price_array)];

        $('#max_price').attr("placeholder", highest_price);
        (num_of_stops_array.length > 0) ? appendOptionstoSelect("stops", num_of_stops_array) : '';

    }
    if (inputfrom == "max_price") {
        for (let i = 0; i < result_array.length; i++) {
            let flight_schedule_details = result_array[i].temp_departure_details.flight_schedule_details;
            let num_of_stops = result_array[i].temp_departure_details.stops_details.length;
            let total_pr = result_array[i].total_price;
            if (max_pr <= total_pr) {
                // if (out_arrival == moment.utc(flight_schedule_details[0].arrivalTime).format('LT')) {
                total_price.add(max_pr);
                if (!carr) {
                    carriers_set.add(flight_schedule_details[0].MarketingCarrier);
                }

                if (!out_departure) {
                    let flight_schedule_details = result_array[i].temp_departure_details.flight_schedule_details;
                    departure_times.add(moment.utc(flight_schedule_details[0].deptTime).format('LT'));

                }
                if (!out_arrival) {
                    let flight_schedule_details = result_array[i].temp_departure_details.flight_schedule_details;
                    arrival_times.add(moment.utc(flight_schedule_details[0].arrivalTime).format('LT'));

                }
                if (flightType) {
                    if (!return_departure) {
                        let flight_schedule_details = result_array[i].temp_return_details.flight_schedule_details;
                        let num_of_stops = result_array[i].temp_return_details.stops_details.length;
                        departure_times_return.add(moment.utc(flight_schedule_details[num_of_stops].deptTime).format('LT'));

                    }
                    if (!return_arrival) {
                        let flight_schedule_details = result_array[i].temp_return_details.flight_schedule_details;
                        let num_of_stops = result_array[i].temp_return_details.stops_details.length;
                        arrival_times_return.add(moment.utc(flight_schedule_details[num_of_stops].arrivalTime).format('LT'));

                    }
                }
                if (!stops) {
                    number_of_stops.add(num_of_stops);
                }

            }
        }

        let [carriers_array,
            arrival_times_array,
            departure_times_array,
            arrival_times_return_array,
            departure_times_return_array,
            total_price_array,
            num_of_stops_array] = [
                Array.from(carriers_set),
                Array.from(arrival_times),
                Array.from(departure_times),
                Array.from(arrival_times_return),
                Array.from(departure_times_return),
                Array.from(total_price),
                Array.from(number_of_stops)
            ];
        (carriers_array.length > 0) ? appendOptionstoSelect("carrier_name", carriers_array) : '';
        (departure_times_array.length > 0) ? appendOptionstoSelect("departure_time", departure_times_array) : '';
        (arrival_times_array.length > 0) ? appendOptionstoSelect("arrival_time", arrival_times_array) : '';
        (departure_times_return_array.length > 0) ? appendOptionstoSelect("return_departure_time", departure_times_return_array) : '';
        (arrival_times_return_array.length > 0) ? appendOptionstoSelect("return_arrival_time", arrival_times_return_array) : '';
        // let [lowest_price, highest_price] = [Math.min.apply(null, total_price_array), Math.max.apply(null, total_price_array)];
        let [lowest_price, highest_price] = [isNaN(Math.min.apply(null, total_price_array)) ? "0" : Math.min.apply(null, total_price_array), isNaN(Math.max.apply(null, total_price_array)) ? "0" : Math.max.apply(null, total_price_array)];

        $('#min_price').attr("placeholder", lowest_price);
        (num_of_stops_array.length > 0) ? appendOptionstoSelect("stops", num_of_stops_array) : '';

    }
}

function appendOptionstoSelect(elemname, option_array) {
    $(`#${elemname}`).html('<option value="">None</option>');
    option_array.forEach(element => {
        $(`#${elemname}`).append(`<option value="${element}">
        ${element}
        </option>`);
    });

}

async function parse_flight_search_view(flight_details, div_id, invoke_source) {
    if (flight_details.length > 0) {


        var fare = "Fare";      // await watsonRoute.translate(null, "Fare", user_name);
        var select = "Select";        // await watsonRoute.translate(null, "Select", user_name);
        var number_of_legs = "Stop";      // await watsonRoute.translate(null, "Stop", user_name);
        var flight_option = "Option";        // await watsonRoute.translate(null, "Option", user_name);
        var duration = "Duration";      // await watsonRoute.translate(null, "Duration", user_name);
        var non_stop = "NONSTOP";       // await watsonRoute.translate(null, "NONSTOP", user_name);
        var preffered = "Preffered";     // await watsonRoute.translate(null, "Preffered", user_name);
        var overlay_trans = "Overlay";       // await watsonRoute.translate(null, "Overlay", user_name);
        // var fare = await translateFromClinetSide(`Fare`, (dialog) => { return dialog; });
        // var select = await translateFromClinetSide(`Select`, (dialog) => { return dialog; });
        // var number_of_legs = await translateFromClinetSide(`Stop`, (dialog) => { return dialog; });
        // var flight_option = await translateFromClinetSide(`Option`, (dialog) => { return dialog; });
        // var duration = await translateFromClinetSide(`Duration`, (dialog) => { return dialog; });
        // var non_stop = await translateFromClinetSide(`NONSTOP`, (dialog) => { return dialog; });
        // var preffered = await translateFromClinetSide(`Preffered`, (dialog) => { return dialog; });
        // var overlay_trans = await translateFromClinetSide(`Overlay`, (dialog) => { return dialog; });

        var html = `
        <div class="accordion-box-scroll" style="height: 350px; overflow: auto"> 
            <div class="accordion-box"> 
                <ul class="accordion-list">`;

        //Checking flight type
        var flight_type = flight_details[0].flight_type;

        if (flight_type === "oneway") {
            for (var i = 0; i < flight_details.length; i++) {
                var flight = flight_details[i];
                var stop_loc_details = ``;


                if(invoke_source === "availability" || invoke_source === "edit_pannel")
                {
                    var selection_button = `<button class="select-btn disableIt" onclick='selectedFlight("${flight_option}", ${flight.flight_id},"${invoke_source}","${div_id}"); addClosingClass("${flight.flight_id}");'> ${select} </button>`
                }
                else
                {
                    var selection_button = `<button class="select-btn disableIt" onclick='selectedFlight("Option", ${flight.flight_id}); addClosingClass("1");'> ${select} </button>`
                }



                if (flight.temp_departure_details.stops_details.length === 0) {
                    var stop_info = `<h5> ${non_stop} </h5>`;
                }
                else {
                    var stop_info = `<h5> ${number_of_legs} :<span> ${flight.temp_departure_details.stops_details.length} </span> </h5>`;
                }

                if (flight.temp_departure_details.stops_details.length > 0) {
                    for (var j = 0; j < flight.temp_departure_details.stops_details.length; j++) {
                        if (j === (flight.temp_departure_details.stops_details.length - 1)) {
                            stop_loc_details += `${flight.temp_departure_details.stops_details[j].stop_name}`;
                        }
                        else {
                            stop_loc_details += `${flight.temp_departure_details.stops_details[j].stop_name}, `;
                        }
                    }
                }

                html += `
                <li class="accordion-row" id="${flight.flight_id}">
                    <div class="right-fare"> 
                        <label> ${fare}: <span> ${flight.total_price} <b> $ </b> </span> </label>
                        ${selection_button}
                    </div>
                    <div class="flight-career"> 
                        ${stop_info} 
                    </div>
                    <div class="flight-option"> 
                        ${flight_option} # ${flight.flight_id}
                        <span class="service-class">  ${flight.class_of_service} </span>
                    </div>
                    <div class="option-row">
                        <a class="accordion-title" href="javascript:void(0)" onclick="removeClass('${flight.flight_id}')">
                            <div class="flight-duration-info">
                                <div class="flight-duration-column">
                                    <p><span class="flight-tm"> ${moment.utc(flight.temp_departure_details.departure_date_time).format('LT')} </span> - <span class="flight-tm"> ${moment.utc(flight.temp_departure_details.arrival_date_time).format('LT')} </span></p>
                                    <p><span class="flight-city"> ${flight.temp_departure_details.departure_city} </span> - <span class="flight-city"> ${flight.temp_departure_details.arrival_city} </span></p>
                                </div>
                                <div class="flight-duration-column strop-time">
                                    <div class="flight-career"> 
                                        ${stop_info} 
                                        ${stop_loc_details}
                                    </div>
                                    <span> (${flight.temp_departure_details.total_overlay_delay} hour(s) ${overlay_trans}) </span>
                                </div>
                            </div>
                        </a>
                        <div class="flight-box">`
                for (var j = 0; j < flight.temp_departure_details.flight_schedule_details.length; j++) {
                    if (flight.temp_departure_details.flight_schedule_details[j].preference_indicator) {
                        var preference = `<div class="preffered-tag">${preffered}</div>`;
                    }
                    else {
                        var preference = "";
                    }

                    html += `
                                <div class="flight-row">
                                    ${preference}
                                    <div class="flight-column">
                                        <label> ${flight.temp_departure_details.flight_schedule_details[j].MarketingCarrier}:</label>
                                        <span>${flight.temp_departure_details.flight_schedule_details[j].MarketingCarrier}-${flight.temp_departure_details.flight_schedule_details[j].MarketflightNumber}</span>
                                    </div>
                                    <div class="flight-column inline-column">
                                        <div class="center-flight-city">
                                            <span> <strong> ${flight.temp_departure_details.flight_schedule_details[j].deptCity} </strong> <br> ${moment.utc(flight.temp_departure_details.flight_schedule_details[j].departureDateTime).format('LT')} <br> ${moment.utc(flight.temp_departure_details.flight_schedule_details[j].departureDateTime).format('llll').split(' ')[0]} ${moment.utc(flight.temp_departure_details.flight_schedule_details[j].departureDateTime).format('ll')} </span>
                                            <span> <img src="/images/airplane-icon.png" alt="airplane-icon" border="0"> </span>
                                            <span> <strong>${flight.temp_departure_details.flight_schedule_details[j].arrivalCity}</strong> <br> ${moment.utc(flight.temp_departure_details.flight_schedule_details[j].arrivalDateTime).format('LT')} <br> ${moment.utc(flight.temp_departure_details.flight_schedule_details[j].arrivalDateTime).format('llll').split(' ')[0]} ${moment.utc(flight.temp_departure_details.flight_schedule_details[j].arrivalDateTime).format('ll')} </span>
                                        </div>
                                    </div>
                                    <div class="flight-column">
                                        <label> ${duration}: </label> 
                                        <span>${timeConvert(flight.temp_departure_details.flight_schedule_details[j].fligtElapsedTime)}</span>
                                    </div>
                                </div>
                                <div class="flight-row responsive-row"> 
                                    <div class="preffered-tag">${preffered}</div>
                                    <div class="flight-column">
                                        <div class="right-fare"> 
                                            <label> ${fare}: <span>${flight.total_price} <b> $ </b> </span></label>
                                        </div>
                                    <div class="flight-career"> 
                                        <h5> ${number_of_legs} :<span>${flight.temp_departure_details.stops_details.length}</span></h5>
                                    </div>
                                </div>
                            </div>`
                }
                `</div>
                    </div>
                </li>`;
            }
        }

        else if (flight_type === "roundtrip") {
            for (var i = 0; i < flight_details.length; i++) {
                var flight = flight_details[i];
                var stop_loc_details_dep = ``;
                var stop_loc_details_ret = ``;

                
                if(invoke_source === "availability" || invoke_source === "edit_pannel")
                {
                    var selection_button = `<button class="select-btn disableIt" onclick='selectedFlight("${flight_option}", ${flight.flight_id},"${invoke_source}","${div_id}"); addClosingClass("${flight.flight_id}");'> ${select} </button>`
                }
                else
                {
                    var selection_button = `<button class="select-btn disableIt" onclick='selectedFlight("Option", ${flight.flight_id}); addClosingClass("1");'> ${select} </button>`
                }


                if ((flight.temp_departure_details.stops_details).length === 0) {
                    var stop_info1 = `<h5> ${non_stop} </h5>`;
                }
                else {
                    var stop_info1 = `<h5> ${number_of_legs} :<span> ${flight.temp_departure_details.stops_details.length} </span> </h5>`;

                    for (var j = 0; j < flight.temp_departure_details.stops_details.length; j++) {
                        if (j === (flight.temp_departure_details.stops_details.length - 1)) {
                            stop_loc_details_dep += `${flight.temp_departure_details.stops_details[j].stop_name}`;
                        }
                        else {
                            stop_loc_details_dep += `${flight.temp_departure_details.stops_details[j].stop_name}, `;
                        }
                    }
                }

                if ((flight.temp_return_details.stops_details).length === 0) {
                    var stop_info2 = `<h5> ${non_stop} </h5>`;
                }
                else {
                    var stop_info2 = `<h5> ${number_of_legs} :<span> ${(flight.temp_return_details.stops_details).length} </span> </h5>`;

                    for (var j = 0; j < flight.temp_return_details.stops_details.length; j++) {
                        if (j === (flight.temp_return_details.stops_details.length - 1)) {
                            stop_loc_details_ret += `${flight.temp_return_details.stops_details[j].stop_name}`;
                        }
                        else {
                            stop_loc_details_ret += `${flight.temp_return_details.stops_details[j].stop_name}, `;
                        }
                    }
                }
                
                if(invoke_source === "availability" || invoke_source === "edit_pannel")
                {
                    var flight_selection = `<button class="select-btn disableIt" onclick='selectedFlight("${flight_option}", ${flight.flight_id},"${invoke_source}","${div_id}"); addClosingClass("${flight.flight_id}");'> ${select} </button>`
                }
                else
                {
                    var flight_selection = `<button class="select-btn disableIt" onclick='selectedFlight("Option", ${flight.flight_id}); addClosingClass("1");'> ${select} </button>`
                }

                //For departure
                html += `
                <li class="flight_options accordion-row" id="${flight.flight_id}">
                    <div class="right-fare"> 
                        <label> ${fare}: <span> ${flight.total_price} <b> $ </b> </span> </label>
                        ${flight_selection} 
                    </div>
                    <div class="flight-option"> 
                        ${flight_option} # ${flight.flight_id}
                        <span class="service-class">  ${flight.class_of_service} </span>
                    </div>`

                html += `
                    <div class="option-row">
                        <a class="accordion-title" href="javascript:void(0)" onclick="removeClass('${flight.flight_id}')">
                            <div class="flight-duration-info">
                                <div class="flight-duration-column">
                                    <p><span class="flight-tm"> ${moment.utc(flight.temp_departure_details.departure_date_time).format('LT')} </span> - <span class="flight-tm"> ${moment.utc(flight.temp_departure_details.arrival_date_time).format('LT')} </span></p>
                                    <p><span class="flight-city"> ${flight.temp_departure_details.departure_city} </span> - <span class="flight-city"> ${flight.temp_departure_details.arrival_city} </span></p>
                                </div>
                                <div class="flight-duration-column strop-time"> 
                                    <div class="flight-career"> 
                                        ${stop_info1}
                                        ${stop_loc_details_dep} 
                                    </div>
                                    <span> (${flight.temp_departure_details.total_overlay_delay} hour(s) ${overlay_trans}) </span>
                                </div>
                            </div>
                        </a>
                        <div class="flight-box">`
                for (var j = 0; j < flight.temp_departure_details.flight_schedule_details.length; j++) {

                    if (flight.temp_departure_details.flight_schedule_details[j].preference_indicator) {
                        var preference1 = `<div class="preffered-tag">${preffered}</div>`;
                    }
                    else {
                        var preference1 = "";
                    }

                    html += `
                                <div class="flight-row">
                                    ${preference1}
                                    <div class="flight-column">
                                        <label> ${flight.temp_departure_details.flight_schedule_details[j].MarketingCarrier}:</label>
                                        <span>${flight.temp_departure_details.flight_schedule_details[j].MarketingCarrier}-${flight.temp_departure_details.flight_schedule_details[j].MarketflightNumber}</span>
                                    </div>
                                    <div class="flight-column inline-column">
                                        <div class="center-flight-city">
                                            <span> <strong> ${flight.temp_departure_details.flight_schedule_details[j].deptCity} </strong> <br> ${moment.utc(flight.temp_departure_details.flight_schedule_details[j].departureDateTime).format('LT')} <br> ${moment.utc(flight.temp_departure_details.flight_schedule_details[j].departureDateTime).format('llll').split(' ')[0]} ${moment.utc(flight.temp_departure_details.flight_schedule_details[j].departureDateTime).format('ll')} </span>
                                            <span> <img src="/images/airplane-icon.png" alt="airplane-icon" border="0"> </span>
                                            <span> <strong>${flight.temp_departure_details.flight_schedule_details[j].arrivalCity}</strong> <br> ${moment.utc(flight.temp_departure_details.flight_schedule_details[j].arrivalDateTime).format('LT')} <br> ${moment.utc(flight.temp_departure_details.flight_schedule_details[j].arrivalDateTime).format('llll').split(' ')[0]} ${moment.utc(flight.temp_departure_details.flight_schedule_details[j].arrivalDateTime).format('ll')} </span>
                                        </div>
                                    </div>
                                    <div class="flight-column">
                                        <label> ${duration}: </label> 
                                        <span>${timeConvert(flight.temp_departure_details.flight_schedule_details[j].fligtElapsedTime)}</span>
                                    </div>
                                </div>
                                <div class="flight-row responsive-row"> 
                                    <div class="preffered-tag">
                                        ${preffered}
                                    </div>
                                    <div class="flight-column">
                                        <div class="right-fare"> 
                                            <label> ${fare}: <span>${flight.total_price} <b> $ </b> </span></label>
                                        </div>
                                        <div class="flight-career"> 
                                            <h5> ${number_of_legs} :<span>${flight.temp_departure_details.stops_details.length}</span></h5>
                                        </div>
                                    </div>
                                </div>`
                }
                `</div>
                    </div>
                </li>`

                //For return
                html += `
                <li class="flight_options accordion-row" id="${flight.flight_id}">
                    <div class="option-row">
                        <a class="accordion-title" href="javascript:void(0)" onclick="removeClass('${flight.flight_id}')">
                            <div class="flight-duration-info">
                                <div class="flight-duration-column">
                                    <p><span class="flight-tm"> ${moment.utc(flight.temp_return_details.departure_date_time).format('LT')} </span> - <span class="flight-tm"> ${moment.utc(flight.temp_return_details.arrival_date_time).format('LT')} </span></p>
                                    <p><span class="flight-city"> ${flight.temp_return_details.departure_city} </span> - <span class="flight-city"> ${flight.temp_return_details.arrival_city} </span></p>
                                </div>
                                <div class="flight-duration-column strop-time">
                                    <div class="flight-career"> 
                                        ${stop_info2} 
                                        ${stop_loc_details_ret}
                                    </div>
                                    <span> (${flight.temp_return_details.total_overlay_delay} hour(s) ${overlay_trans}) </span>
                                </div>
                            </div>
                        </a>
                        <div class="flight-box">`
                for (var k = 0; k < flight.temp_return_details.flight_schedule_details.length; k++) {

                    if (flight.temp_return_details.flight_schedule_details[k].preference_indicator) {
                        var preference2 = `<div class="preffered-tag">${preffered}</div>`;
                    }
                    else {
                        var preference2 = "";
                    }

                    html += `
                                <div class="flight-row">
                                    ${preference2}
                                    <div class="flight-column">
                                        <label> ${flight.temp_return_details.flight_schedule_details[k].MarketingCarrier}:</label>
                                        <span>${flight.temp_return_details.flight_schedule_details[k].MarketingCarrier}-${flight.temp_return_details.flight_schedule_details[k].MarketflightNumber}</span>
                                    </div>
                                    <div class="flight-column inline-column">
                                        <div class="center-flight-city">
                                            <span> <strong> ${flight.temp_return_details.flight_schedule_details[k].deptCity} </strong> <br> ${moment.utc(flight.temp_return_details.flight_schedule_details[k].departureDateTime).format('LT')} <br> ${moment.utc(flight.temp_return_details.flight_schedule_details[k].departureDateTime).format('llll').split(' ')[0]} ${moment.utc(flight.temp_return_details.flight_schedule_details[k].departureDateTime).format('ll')} </span>
                                            <span> <img src="/images/airplane-icon.png" alt="airplane-icon" border="0"> </span>
                                            <span> <strong>${flight.temp_return_details.flight_schedule_details[k].arrivalCity}</strong> <br> ${moment.utc(flight.temp_return_details.flight_schedule_details[k].arrivalDateTime).format('LT')} <br> ${moment.utc(flight.temp_return_details.flight_schedule_details[k].arrivalDateTime).format('llll').split(' ')[0]} ${moment.utc(flight.temp_return_details.flight_schedule_details[k].arrivalDateTime).format('ll')} </span>
                                        </div>
                                    </div>
                                    <div class="flight-column">
                                        <label> ${duration}: </label> 
                                        <span>${timeConvert(flight.temp_return_details.flight_schedule_details[k].fligtElapsedTime)}</span>
                                    </div>
                                </div>
                                <div class="flight-row responsive-row"> 
                                    <div class="preffered-tag">
                                        ${preffered}
                                    </div>
                                    <div class="flight-column">
                                        <div class="right-fare"> 
                                            <label> ${fare}: <span>${flight.total_price} <b> $ </b> </span></label>
                                        </div>
                                        <div class="flight-career"> 
                                            <h5> ${number_of_legs} :<span>${flight.temp_return_details.stops_details.length}</span></h5>
                                        </div>
                                    </div>
                                </div>`
                }
                `</div>
                    </div>
                </li>`
            }
        }

        html += `</ul></div></div>`;
    }
    return html;
}
//=================================Close Match task==== END=========================================//
//=================================Close Match task=======END======================================//