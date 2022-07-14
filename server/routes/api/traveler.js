//======================================== [Dependecies] ================================================//

//Route Main Dependecies
const { request, response, json }           =   require("express");
const express                               =   require("express");
const { route }                             =   require("./watson");
const router                                =   express.Router();

//Calling External APIs [Translation] Dependecies
const axios                                 =   require('axios');

//UUID Dependency
const { v4: uuidv4 }                        =   require('uuid');
const countryLocaleMap                      =   require("country-locale-map");

//Simple random number generator
const random                                =   require("simple-random-number-generator");

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
    
    user_details[req.session.user_name].languageCode = req.body.languageCode;
    user_details[req.session.user_name].prefferedLanguage = req.body.language;

    var response = { status : 1 };
    res.json(response);
});

//==================================== [Language Preference] =============================================//

let params = { min: 5, max: 76, integer: true };

//======================================= [Helping functions] ===========================================//

//A function for getting column fields against specific ID
async function getFormFeilds(id, current_session)
{           
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( `${process.env.IP}/api/merck/getRequiredFeilds`, { formTypeID : id }, session_handle_axios);
    return DBresponse.data.requiredFeilds;
}


//A function for getting traveler info (First Name, Last Name, Email) for traveler 1 only!
async function getTravelerInfo(userID, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( `${process.env.IP}/api/localQuery/query`, { queryAction : 'FetchData', requestType : "getTravelerInfo", userID : userID }, session_handle_axios);
    return DBresponse.data.record;
}

//A function for getting country code, This country code will be used by the phone field in form
async function getCountryCode(countryID, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( `${process.env.IP}/api/localQuery/query`, { queryAction : 'FetchData', requestType : "getCountryCode2Digits", countryID : countryID }, session_handle_axios);
    return DBresponse.data.record;
}

//This function is used to get the select fields from the DB for forms like  
async function getDataFromDB(requestType, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( `${process.env.IP}/api/localQuery/query`, { queryAction : 'FetchData', requestType : requestType }, session_handle_axios);
    return DBresponse.data.records[0];
}

//This function is used to update the data for a specific traveler in the database
async function updateData(obj, userID, travelerType, recordID, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( `${process.env.IP}/api/localQuery/query`, { queryAction : 'InsertData', action : 'updateData', data : obj, userID : userID, travelerType : travelerType, recordID : recordID }, session_handle_axios);
    return DBresponse.data.result;
}

//This function will insert the data about the traveler info into database
async function insertDB(obj, userID, travelerType, groupID, travelEventID, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( `${process.env.IP}/api/localQuery/query`, { queryAction : 'InsertData', action : "insertTravelerInfo", data : obj, userID : userID, travelerType : travelerType, groupID : groupID, travelEventID, travelEventID }, session_handle_axios);
    return DBresponse.data.result;
}

//This function will bring the travel Event ID for speicfic country and company ID for MERCK
async function getTravelEventID(companyID, countryID, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( `${process.env.IP}/api/localQuery/query`, { queryAction : 'FetchData', requestType : "getTravelEventID", companyID : companyID, countryID : countryID }, session_handle_axios);
    if(DBresponse.data && DBresponse.data.records)
    {
        if(DBresponse.data.numOfRecs != 0)
        {
            return DBresponse.data.records['0'][0]?.TravelEventID;
        }
        else
        {
            return 0;
        }
    }
}

//This will get the the least inserted traveler id from the database
async function getLatestFormID(current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( `${process.env.IP}/api/localQuery/query`, { queryAction : 'FetchData', requestType : "getLatestFormID" }, session_handle_axios);
    return DBresponse.data.records['0'][0][""];
}

//Getting records for the last inserted record 
async function getTravelerData(keyArray, recordID, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( `${process.env.IP}/api/localQuery/query`, { queryAction : 'FetchData', requestType : "getTravelerData", recordID : recordID, keyArray: keyArray }, session_handle_axios);
    return DBresponse.data.recordObj;
}

async function insertTravelerInfo(obj, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( `${process.env.IP}/api/save/saveData`, { dataType : "traveler", data : obj }, session_handle_axios);
    return DBresponse.data;
}

async function updateTravelerInfo(obj, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( `${process.env.IP}/api/save/saveData`, { dataType : "traveler", dataObj : obj, operation : "update" }, session_handle_axios);
    return DBresponse.data;
}

async function translateTextAPI(text, current_session)
{
    var languageCode = "en"; 
    let session_handle_axios = { headers: { cookie : current_session } };
    var APIResponse = await axios.post( process.env.IP + '/api/watson/tanslate', { from : "English", to : languageCode, text : text }, session_handle_axios);
    return APIResponse.data;
}

async function getTravelerProfileInfo(email, current_session)
{
    let session_handle_axios = { headers: { session_status : "initialize" } };
    var APIResponse = await axios.post( process.env.IP + '/api/sabre/searchProfileByEmail', { email : email }, session_handle_axios);
    return APIResponse.data;
}

async function findValue(array, objectKey)
{
    for (var i = 0; i < array.length; i++)
    {
        var tmpArray = Object.keys(array[i]);
        if(tmpArray[0] === objectKey)
        {
            var requiredValue = array[i][objectKey];
            break;
        }
    }

    if(requiredValue != undefined)
    {
        return requiredValue;
    }
    else
    {
        return null;
    }
}

async function insert_info(record_array, current_session)
{

    let session_handle_axios = { headers: { cookie : current_session } };
    var APIResponse = await axios.post( process.env.IP + '/api/travelerInformation/insertTravelerInfo', { recordArray : record_array }, session_handle_axios);
    return APIResponse.data;
}

async function evaluateAvailInfo(fieldsElementsArray, informationObject)
{
    var avail_info = [];
    var required_info = [];
    var final_obj = {};

    for(var i = 0; i < fieldsElementsArray.length; i++)
    {
        tmp_obj = {};
        
        //First Name
        if(fieldsElementsArray[i] === "First Name")
        {
            if(informationObject["first_name"] != undefined && informationObject["first_name"] != "")
            {
                tmp_obj["id"] = "FirstName";
                tmp_obj["value"] = informationObject["first_name"];
                avail_info.push(tmp_obj);
            }
            // else
            // {
            //     required_info.push("First Name");
            // }
        }

        //Last Name
        if(fieldsElementsArray[i] === "Last Name")
        {
            if(informationObject["last_name"] != undefined && informationObject["last_name"] != "")
            {
                tmp_obj["id"] = "LastName";
                tmp_obj["value"] = informationObject["last_name"];
                avail_info.push(tmp_obj);
            }
            // else
            // {
            //     required_info.push("Last Name");
            // }
        }

        //Email Address
        if(fieldsElementsArray[i] === "Email Address")
        {
            if(informationObject["email"] != undefined && informationObject["email"] != "")
            {
                tmp_obj["id"] = "Email";
                tmp_obj["value"] = informationObject["email"];
                avail_info.push(tmp_obj);
            }
        }

        //Mobile Phone
        if(fieldsElementsArray[i] === "Mobile Phone")
        {
            if(informationObject["telephone"] != undefined && informationObject["telephone"] != "")
            {
                tmp_obj["id"] = "Phone";
                tmp_obj["value"] = informationObject["telephone"];
                avail_info.push(tmp_obj);
            }
            // else
            // {
            //     required_info.push("Mobile Phone");
            // }
        }

        //Employee Number
        if(fieldsElementsArray[i] === "Employee Number" || fieldsElementsArray[i] === "MUID")
        {
            if(informationObject["employee_id"] != undefined && informationObject["employee_id"] != "")
            {
                tmp_obj["id"] = "EmployeeNumber";
                tmp_obj["value"] = informationObject["employee_id"];
                avail_info.push(tmp_obj);
            }
        //     else 
        //     {
        //         var sub_info_array = informationObject?.default_field_info;

        //         if(sub_info_array)
        //         {
        //             for(var l = 0; l < sub_info_array.length; l++)
        //             {
        //                 var current_obj = sub_info_array[l];

        //                 // var current_obj_keys_array = Object.keys(current_obj);
        //                 // var current_obj_values_array = Object.values(current_obj);

        //                 // if( current_obj_keys_array[l] == "UD27_EMPLOYEEID" )
        //                 // {
        //                 //     tmp_obj["id"] = "EmployeeNumber";
        //                 //     tmp_obj["value"] = current_obj_values_array[0];
        //                 //     avail_info.push(tmp_obj);
        //                 // }
        //             }
        //         }
        //    }
            else
            {
                required_info.push("Employee Number");
            }
        }

        //Legal Entity
        if(fieldsElementsArray[i] === "Legal Entity")
        {
            if(informationObject["employee_company"] != undefined && informationObject["employee_company"] != "")
            {
                tmp_obj["id"] = "CustomField1";
                tmp_obj["value"] = informationObject["employee_company"];
                avail_info.push(tmp_obj);
            }
            // else
            // {
            //     required_info.push("Legal Entity");
            // }
        }

        //Cost Center
        if(fieldsElementsArray[i] === "Cost Center")
        {
            var value_1 = await findValue(informationObject.default_field_info, "AvnetUS_CostCenter");
            var value_2 = await findValue(informationObject.default_field_info, "UD28_COSTCENTER");

            if(value_1 != undefined && value_1 != "" && value_1 != null)
            {
                tmp_obj["id"] = "CostCenter"; 
                tmp_obj["value"] = value_1; 
                avail_info.push(tmp_obj);
            }

            else if(value_2 != undefined && value_2 != "" && value_2 != null)
            {
                tmp_obj["id"] = "CostCenter";
                tmp_obj["value"] = value_2;
                avail_info.push(tmp_obj);
            }

            // else
            // {
            //     required_info.push("Cost Center");
            // }
        }

        if(fieldsElementsArray[i] === "Department Code")
        {
            var value = await findValue(informationObject.default_field_info, "UD32_DEPARTMENT");

            if(value != undefined && value != "" && value != null)
            {
                tmp_obj["id"] = "DepartmentID";
                tmp_obj["value"] = value;
                avail_info.push(tmp_obj);
            }
            // else
            // {
            //     required_info.push("Department Code");
            // }
        }

       if(fieldsElementsArray[i] === "Division")
       {
            var value = await findValue(informationObject.default_field_info, "UD29_DIVISION");

            if(value != undefined && value != "" && value != null)
            {
               tmp_obj["id"] = "Division";
               tmp_obj["value"] = value;
               avail_info.push(tmp_obj);
            }
            // else
            // {
            //     required_info.push("Division");
            // }
       }

       if(fieldsElementsArray[i] === "Business Unit" || fieldsElementsArray[i] === "Department Name")
       {
            var value = await findValue(informationObject.default_field_info, "UD35_BUSINESSUNIT2");
            if(value != undefined && value != "" && value != null)
            {
               tmp_obj["id"] = "Department";
               tmp_obj["value"] = value;
               avail_info.push(tmp_obj);
            }
            // else
            // {
            //     required_info.push("Business Unit");
            // }
       }

       if(fieldsElementsArray[i] === "Cost Objective")
       {
            var value_1 = await findValue(informationObject.default_field_info, "AvnetUS_CostCenter");
            var value_2 = await findValue(informationObject.default_field_info, "UD28_COSTCENTER");

            if(value_1 != undefined && value_1 != "" && value_1 != null)
            {
                tmp_obj["id"] = "CustomField1";  // As cost objective and legal entity are same
                tmp_obj["value"] = value_1; 
                avail_info.push(tmp_obj);
            }

            else if(value_2 != undefined && value_2 != "" && value_2 != null)
            {
                tmp_obj["id"] = "CustomField1"; // As cost objective and legal entity are same
                tmp_obj["value"] = value_2;
                avail_info.push(tmp_obj);
            }

            // else
            // {
            //     required_info.push("Cost Center");
            // }
       }

        if(fieldsElementsArray[i] === "CMG number")
        {
            tmp_obj["id"] = "CMGNumber";
            tmp_obj["value"] = "Null";
            //required_info.push("CMG number");
        }
    }

    final_obj["avail_info"] = avail_info;
    final_obj["required_info"] = required_info;

    return final_obj;
}

async function getCurrentUserID(email, current_session)
{
    
    let session_handle_axios    =   { headers: { cookie : current_session } };
    var DBresponse              =   await axios.post( `${process.env.IP}/api/localQuery/query`, { queryAction : 'FetchData', requestType : "getCurrentUserID", email : email }, session_handle_axios);
    var records                 =   DBresponse?.data?.record;

    if( records && records.length > 0 )
    {
        return records[0];
    }
    else
    {
        return null;
    }
}

//======================================= [Helping functions] ===========================================//

//====================================== [Route Implementation] =========================================//

//Get the traveler informaiton and other asssets to show the form to the client
router.post('/verifyInformation', async (req, res) => {

    if(!user_details[req.session.user_name])
    {
        user_details[req.session.user_name] = {};
        user_details[req.session.user_name].required_information = [];
    }
    else
    {
        user_details[req.session.user_name].required_information = [];
    }

    var purpose             =   req.body.purpose;
    var response            =   {};
    
    if(purpose === "initialize")
    {
        //To create a unique group ID for each scenario
        var temp_user_id                                        =   req.body.data.userID;
        var email                                               =   req.body.data.travelerEmail;
        var user_info                                           =   await getCurrentUserID(email, req.headers.cookie);
        var user_first_name                                     =   user_info.ez_fname;
        var user_last_name                                      =   user_info.ez_lname;
        user_details[req.session.user_name].sessionID           =   req.body.data.sessionID; 
        user_details[req.session.user_name].groupID             =   uuidv4();  
        user_details[req.session.user_name].userID              =   user_info.ez_user_id;
        user_details[req.session.user_name].countryID           =   req.body.data.countryID;
        user_details[req.session.user_name].companyID           =   req.body.data.companyID;
        user_details[req.session.user_name].travelEventID       =   await getTravelEventID(user_details[req.session.user_name].companyID, user_details[req.session.user_name].countryID, req.headers.cookie);
        user_details[req.session.user_name].country2DigitsCode  =   await getCountryCode(user_details[req.session.user_name].countryID, req.headers.cookie);

        if(req.body.data.arrangerID != null)
        {
            user_details[req.session.user_name].arrangerID = req.body.data.arrangerID;
        }
        else
        {
            user_details[req.session.user_name].arrangerID = user_details[req.session.user_name].userID
        }

        if(user_details[req.session.user_name].userID != null)
        {
            var currentTraveler                                     =   req.body.data.currentTraveller;
            var requiredFormID                                      =   req.body.data.formTypeID;
            user_details[req.session.user_name].travelerType        =   req.body.data.travelerType;
            user_details[req.session.user_name].numOfTravelers      =   1; // if num of sets is open just uncomment the code and remove 1. req.body.data.numOfTravelers;
            user_details[req.session.user_name].tripPurpose         =   req.body.data.tripPurpose;
            

            if(user_details[req.session.user_name].country2DigitsCode === undefined && user_details[req.session.user_name].country2DigitsCode === null)
            {
                user_details[req.session.user_name].country2DigitsCode = 'US';
            }

            //Getting input fields form traveler against the requested form ID     
            var optionsArray    =   await getFormFeilds(requiredFormID, req.headers.cookie);

            //Here we will make a call to get the traveler infromation
            var traveler_profile_information = await getTravelerProfileInfo(email, req.headers.cookie);
            
            if(temp_user_id == "1048362")
            {
                traveler_profile_information.profile_details.first_name = "Darrin";
                traveler_profile_information.profile_details.last_name = "Deck";
            }
            else if(temp_user_id == "1048365")
            {
                traveler_profile_information.profile_details.first_name = "Howie";
                traveler_profile_information.profile_details.last_name = "Honeycut";
            }
            else if(temp_user_id == "1048367")
            {
                traveler_profile_information.profile_details.first_name = "Charles";
                traveler_profile_information.profile_details.last_name = "Leonard";
            }
            else if(temp_user_id == "1048369")
            {
                traveler_profile_information.profile_details.first_name = "Stacy";
                traveler_profile_information.profile_details.last_name = "Berlatt";
            }
            
            if(traveler_profile_information.status != 404)
            {
                var info_details    =   traveler_profile_information.profile_details;

                //Evaluating the available information
                var result_object = await evaluateAvailInfo(optionsArray, info_details);
                user_details[req.session.user_name].currentTravelerProfileDetails = result_object;
                user_details[req.session.user_name].required_information = result_object.required_info;
                avail_infromation = result_object.avail_info;

                module.exports.current_traveler_info = user_details[req.session.user_name].currentTravelerProfileDetails;
            }
            else
            {
                //var response = { status : 404, message : "Sabre Web Services are currently down. Please try again later." };
                //Here we know the profile is not found, so all the data is now required.
                user_details[req.session.user_name].required_information = optionsArray;
            }

            //Here we are checking if the profile is not found, then the traveler data is required to be filled.
            //If the required information array is not empty then the bot should give either form or error.
            //If the required informtion array is empty than it will first save the data and then move on.  
            if((user_details[req.session.user_name].required_information).length != 0)
            {
                // ***** [ If prefferd language is ENGLISH ] ******
                if(user_details[req.session.user_name].prefferedLanguage === "English")
                {
                    //Creating form for getting traveler information
                    var form = `<div class='msg-row'><div class='user-msg receive'><p>I could not find the following infromation from your profile.</p></div></div>`;
                    form += `<div class="panel panel-default"><div class="panel-body travel-form-body">`;
                    for(var i = 0; i < (user_details[req.session.user_name].required_information).length; i++)
                    {
                        if((user_details[req.session.user_name].required_information)[i] === "First Name")
                        {
                            form += `<div class="form-group travel-form-group" id="FirstName_error_belowLine"><label for="FirstName"> First Name: </label><input type="text" autocomplete="off" class="form-control travel_info_insert" id="FirstName" value=""  onfocusout="validateField('string', 'FirstName', this.value)"> <span class="required-alert" id="FirstName_error_text_chars" style="display:none"> Only chracters are allowed. </span> <span class="required-alert" id="FirstName_error_text_chars_numbers" style="display:none"> Only chracters & numbers are allowed. </span> <span class="required-alert" id="FirstName_error_text_invalid_mail" style="display:none"> Invalid email. </span> <span class="required-alert" id="FirstName_error_text_numbers" style="display:none"> Only numbers are allowed. </span> <span class="required-alert" id="FirstName_error_text_incomplete_field" style="display:none"> Please fill this field. </span> </div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "Last Name")
                        {
                            form += `<div class="form-group travel-form-group" id="LastName_error_belowLine"><label for="LastName"> Last Name: </label><input type="text" autocomplete="off" class="form-control travel_info_insert" id="LastName" value="" onfocusout="validateField('string', 'LastName', this.value)"> <span class="required-alert" id="LastName_error_text_chars" style="display:none"> Only chracters are allowed. </span> <span class="required-alert" id="LastName_error_text_chars_numbers" style="display:none"> Only chracters & numbers are allowed. </span> <span class="required-alert" id="LastName_error_text_invalid_mail" style="display:none"> Invalid email. </span> <span class="required-alert" id="LastName_error_text_numbers" style="display:none"> Only numbers are allowed. </span> <span class="required-alert" id="LastName_error_text_incomplete_field" style="display:none"> Please fill this field. </span> </div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "Email Address")
                        {
                            form += `<div class="form-group travel-form-group" id="Email_error_belowLine"><label for="Email"> Email: </label><input type="email" autocomplete="off" class="form-control travel_info_insert" id="Email" value="" onfocusout="validateField('email', 'Email', this.value)"> <span class="required-alert" id="Email_error_text_chars" style="display:none"> Only chracters are allowed. </span> <span class="required-alert" id="Email_error_text_chars_numbers" style="display:none"> Only chracters & numbers are allowed. </span> <span class="required-alert" id="Email_error_text_invalid_mail" style="display:none"> Invalid email. </span> <span class="required-alert" id="Email_error_text_numbers" style="display:none"> Only numbers are allowed. </span> <span class="required-alert" id="Email_error_text_incomplete_field" style="display:none"> Please fill this field. </span> </div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "Mobile Phone")
                        {
                            form += `<div class="form-group travel-form-group" id="Phone_error_belowLine"><label for="Phone"> Phone: </label><input type="text" autocomplete="off" class="form-control travel_info_insert phone_number" id="Phone" value="" onfocusout="validateField('phone', 'Phone', this.value)"> <span class="required-alert" id="Phone_error_text_chars" style="display:none"> Only chracters are allowed. </span> <span class="required-alert" id="Phone_error_text_chars_numbers" style="display:none"> Only chracters & numbers are allowed. </span> <span class="required-alert" id="Phone_error_text_invalid_mail" style="display:none"> Invalid email. </span> <span class="required-alert" id="Phone_error_text_numbers" style="display:none"> Only numbers are allowed. </span> <span class="required-alert" id="Phone_error_text_incomplete_field" style="display:none"> Please fill this field. </span> </div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "Legal Entity")
                        {
                            form += `<div class="form-group travel-form-group" id="CustomField1_error_belowLine"><label for="CustomField1"> Legal Entity: </label><select class="selectOptions travel_info_insert" id="CustomField1">`;
                            var getLegalEntities = await getDataFromDB("legalEntity", req.headers.cookie);
                            for(var j = 0; j < getLegalEntities.length; j++)
                            {
                                form += `<option value="${getLegalEntities[j].ez_legal_entity_value}"> ${getLegalEntities[j].ez_legal_entity_value} </option>`;
                            }
                            form += `</select><span class="required-alert" id="CustomField1_error_text"></span></div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "Business Unit" || (user_details[req.session.user_name].required_information)[i] === "Department Name")
                        {
                            form += `<div class="form-group travel-form-group" id="Department_error_belowLine"><label for="Department"> Department: </label><select class="selectOptions travel_info_insert" id="Department">`;
                            var getDepartment = await getDataFromDB("department", req.headers.cookie);
                            for(var j = 0; j < getDepartment.length; j++)
                            {
                                form += `<option value="${getDepartment[j].ez_business_unit_value}"> ${getDepartment[j].ez_business_unit_value} </option>`;
                            }
                            form += `</select><span class="required-alert" id="Department_error_text"></span></div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "Division")
                        {
                            form += `<div class="form-group travel-form-group" id="Division_error_belowLine"><label for="Division"> Division: </label><select class="selectOptions travel_info_insert" id="Division">`;
                            var getDivision = await getDataFromDB("division", req.headers.cookie);
                            for(var j = 0; j < getDivision.length; j++)
                            {
                                form += `<option value="${getDivision[j].ez_division_value}"> ${getDivision[j].ez_division_value} </option>`;
                            }
                            form += `</select><span class="required-alert" id="Division_error_text"></span></div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "Department Code")
                        {
                            form += `<div class="form-group travel-form-group" id="DepartmentID_error_belowLine"><label for="DepartmentID"> Department Code: </label><select class="selectOptions travel_info_insert" id="DepartmentID">`;
                            var getDepartmentCode = await getDataFromDB("departmentID", req.headers.cookie);
                            for(var j = 0; j < getDepartmentCode.length; j++)
                            {
                                form += `<option value="${getDepartmentCode[j].ez_department_code_value}"> ${getDepartmentCode[j].ez_department_code_value} </option>`;
                            }
                            form += `</select><span class="required-alert" id="DepartmentID_error_text"></span></div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "Cost Center")
                        {
                            form += `<div class="form-group travel-form-group" id="CostCenter_error_belowLine"><label for="CostCenter"> Cost Center: </label><input type="text" autocomplete="off" class="form-control travel_info_insert" id="CostCenter" value="" onfocusout="validateField('numeric', 'CostCenter', this.value)"> <span class="required-alert" id="CostCenter_error_text_chars" style="display:none"> Only chracters are allowed. </span> <span class="required-alert" id="CostCenter_error_text_chars_numbers" style="display:none"> Only chracters & numbers are allowed. </span> <span class="required-alert" id="CostCenter_error_text_invalid_mail" style="display:none"> Invalid email. </span> <span class="required-alert" id="CostCenter_error_text_numbers" style="display:none"> Only numbers are allowed. </span> <span class="required-alert" id="CostCenter_error_text_incomplete_field" style="display:none"> Please fill this field. </span> </div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "MUID" || (user_details[req.session.user_name].required_information)[i] === "Employee Number")
                        {
                            form += `<div class="form-group travel-form-group" id="EmployeeNumber_error_belowLine"><label for="EmployeeNumber"> Employee ID: </label><input type="text" autocomplete="off" class="form-control travel_info_insert" id="EmployeeNumber" value="" onfocusout="validateField('numeric', 'EmployeeNumber', this.value)"> <span class="required-alert" id="EmployeeNumber_error_text_chars" style="display:none"> Only chracters are allowed. </span> <span class="required-alert" id="EmployeeNumber_error_text_chars_numbers" style="display:none"> Only chracters & numbers are allowed. </span> <span class="required-alert" id="EmployeeNumber_error_text_invalid_mail" style="display:none"> Invalid email. </span> <span class="required-alert" id="EmployeeNumber_error_text_numbers" style="display:none"> Only numbers are allowed. </span> <span class="required-alert" id="EmployeeNumber_error_text_incomplete_field" style="display:none"> Please fill this field. </span> </div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "CMG number")
                        {
                            form += `<div class="form-group travel-form-group" id="CMGNumber_error_belowLine"><label for="CMGNumber"> CMG Number: </label><input type="text" autocomplete="off" class="form-control travel_info_insert" id="CMGNumber" value="" onfocusout="validateField('numeric', 'CMGNumber', this.value)"> <span class="required-alert" id="CMGNumber_error_text_chars" style="display:none"> Only chracters are allowed. </span> <span class="required-alert" id="CMGNumber_error_text_chars_numbers" style="display:none"> Only chracters & numbers are allowed. </span> <span class="required-alert" id="CMGNumber_error_text_invalid_mail" style="display:none"> Invalid email. </span> <span class="required-alert" id="CMGNumber_error_text_numbers" style="display:none"> Only numbers are allowed. </span> <span class="required-alert" id="CMGNumber_error_text_incomplete_field" style="display:none"> Please fill this field. </span> </div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "Cost Objective")
                        {
                            form += `<div class="form-group travel-form-group" id="CostCenter_error_belowLine"><label for="CostCenter"> Cost Objective: </label><input type="text" autocomplete="off" class="form-control travel_info_insert" id="CostCenter" value="" onfocusout="validateField('numeric', 'CostCenter', this.value)"> <span class="required-alert" id="CostCenter_error_text_chars" style="display:none"> Only chracters are allowed. </span> <span class="required-alert" id="CostCenter_error_text_chars_numbers" style="display:none"> Only chracters & numbers are allowed. </span> <span class="required-alert" id="CostCenter_error_text_invalid_mail" style="display:none"> Invalid email. </span> <span class="required-alert" id="CostCenter_error_text_numbers" style="display:none"> Only numbers are allowed. </span> <span class="required-alert" id="CostCenter_error_text_incomplete_field" style="display:none"> Please fill this field. </span> </div>`;
                        }
                    }
                    form += `<div class="form-group travel-form-group"><button type="button" class="btn btn-default disableIt" onclick="insertTravelerInfo();"> OK </button></div></div></div>`; 
                }

                // ***** [ If preffered language is NOT ENGLISH ] ******
                else
                {
                    //Creating form for getting traveler information
                    var form = `<div class='msg-row'><div class='user-msg receive'><p>${await translateTextAPI("I could not find the following infromation from your profile", req.headers.cookie)}.</p></div></div>`;
                    form += `<div class="panel panel-default"><div class="panel-body travel-form-body">`;
                    for(var i = 0; i < (user_details[req.session.user_name].required_information).length; i++)
                    {
                        if((user_details[req.session.user_name].required_information)[i] === "First Name")
                        {
                            form += `<div class="form-group travel-form-group" id="FirstName_error_belowLine"><label for="FirstName"> ${await translateTextAPI("First Name", req.headers.cookie)}: </label><input type="text" autocomplete="off" class="form-control travel_info_insert" id="FirstName" value=""  onfocusout="validateField('string', 'FirstName', this.value)"> <span class="required-alert" id="FirstName_error_text_chars" style="display:none"> ${await translateTextAPI("Only chracters are allowed.", req.headers.cookie)} </span> <span class="required-alert" id="FirstName_error_text_chars_numbers" style="display:none"> ${await translateTextAPI("Only chracters & numbers are allowed.", req.headers.cookie)} </span> <span class="required-alert" id="FirstName_error_text_invalid_mail" style="display:none"> ${ await translateTextAPI("Invalid email.", req.headers.cookie) } </span> <span class="required-alert" id="FirstName_error_text_numbers" style="display:none"> ${await translateTextAPI("Only numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="FirstName_error_text_incomplete_field" style="display:none"> ${await translateTextAPI("Please fill this field.", req.headers.cookie) } </span> </div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "Last Name")
                        {
                            form += `<div class="form-group travel-form-group" id="LastName_error_belowLine"><label for="LastName"> ${await translateTextAPI("Last Name", req.headers.cookie)}: </label><input type="text" autocomplete="off" class="form-control travel_info_insert" id="LastName" value="" onfocusout="validateField('string', 'LastName', this.value)"> <span class="required-alert" id="LastName_error_text_chars" style="display:none"> ${await translateTextAPI("Only chracters are allowed.", req.headers.cookie)} </span> <span class="required-alert" id="LastName_error_text_chars_numbers" style="display:none"> ${await translateTextAPI("Only chracters & numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="LastName_error_text_invalid_mail" style="display:none"> ${await translateTextAPI("Invalid email.", req.headers.cookie) } </span> <span class="required-alert" id="LastName_error_text_numbers" style="display:none"> ${await translateTextAPI("Only numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="LastName_error_text_incomplete_field" style="display:none"> ${await translateTextAPI("Please fill this field.", req.headers.cookie) } </span> </div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "Email Address")
                        {
                            form += `<div class="form-group travel-form-group" id="Email_error_belowLine"><label for="Email"> ${await translateTextAPI("Email", req.headers.cookie)}: </label><input type="email" autocomplete="off" class="form-control travel_info_insert" id="Email" value="" onfocusout="validateField('email', 'Email', this.value)"> <span class="required-alert" id="Email_error_text_chars" style="display:none"> ${await translateTextAPI("Only chracters are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="Email_error_text_chars_numbers" style="display:none"> ${await translateTextAPI("Only chracters & numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="Email_error_text_invalid_mail" style="display:none"> ${await translateTextAPI("Invalid email.", req.headers.cookie)} </span> <span class="required-alert" id="Email_error_text_numbers" style="display:none"> ${await translateTextAPI("Only numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="Email_error_text_incomplete_field" style="display:none"> ${await translateTextAPI("Please fill this field.", req.headers.cookie) } </span> </div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "Mobile Phone")
                        {
                            form += `<div class="form-group travel-form-group" id="Phone_error_belowLine"><label for="Phone"> ${await translateTextAPI("Phone", req.headers.cookie)}: </label><input type="text" autocomplete="off" class="form-control travel_info_insert" id="Phone" value="" onfocusout="validateField('phone', 'Phone', this.value)"> <span class="required-alert" id="Phone_error_text_chars" style="display:none"> ${await translateTextAPI("Only chracters are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="Phone_error_text_chars_numbers" style="display:none"> ${ await translateTextAPI("Only chracters & numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="Phone_error_text_invalid_mail" style="display:none"> ${ await translateTextAPI("Invalid email.", req.headers.cookie) } </span> <span class="required-alert" id="Phone_error_text_numbers" style="display:none"> ${ await translateTextAPI("Only numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="Phone_error_text_incomplete_field" style="display:none"> ${ await translateTextAPI("Please fill this field.", req.headers.cookie) } </span> </div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "Legal Entity")
                        {
                            form += `<div class="form-group travel-form-group" id="CustomField1_error_belowLine"><label for="CustomField1"> ${await translateTextAPI("Legal Entity", req.headers.cookie)}: </label><select class="selectOptions travel_info_insert" id="CustomField1">`;
                            var getLegalEntities = await getDataFromDB("legalEntity", req.headers.cookie);
                            for(var j = 0; j < getLegalEntities.length; j++)
                            {
                                form += `<option value="${await translateTextAPI(getLegalEntities[j].ez_legal_entity_value, req.headers.cookie)}"> ${await translateTextAPI(getLegalEntities[j].ez_legal_entity_value, req.headers.cookie)} </option>`;
                            }
                            form += `</select><span class="required-alert" id="CustomField1_error_text"></span></div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "Business Unit" || (user_details[req.session.user_name].required_information)[i] === "Department Name")
                        {
                            form += `<div class="form-group travel-form-group" id="Department_error_belowLine"><label for="Department"> ${await translateTextAPI("Department", req.headers.cookie)}: </label><select class="selectOptions travel_info_insert" id="Department">`;
                            var getDepartment = await getDataFromDB("department", req.headers.cookie);
                            for(var j = 0; j < getDepartment.length; j++)
                            {
                                form += `<option value="${await translateTextAPI(getDepartment[j].ez_business_unit_value, req.headers.cookie)}"> ${await translateTextAPI(getDepartment[j].ez_business_unit_value, req.headers.cookie)} </option>`;
                            }
                            form += `</select><span class="required-alert" id="Department_error_text"></span></div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "Division")
                        {
                            form += `<div class="form-group travel-form-group" id="Division_error_belowLine"><label for="Division"> ${await translateTextAPI("Division", req.headers.cookie)}: </label><select class="selectOptions travel_info_insert" id="Division">`;
                            var getDivision = await getDataFromDB("division", req.headers.cookie);
                            for(var j = 0; j < getDivision.length; j++)
                            {
                                form += `<option value="${await translateTextAPI(getDivision[j].ez_division_value, req.headers.cookie)}"> ${await translateTextAPI(getDivision[j].ez_division_value, req.headers.cookie)} </option>`;
                            }
                            form += `</select><span class="required-alert" id="Division_error_text"></span></div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "Department Code")
                        {
                            form += `<div class="form-group travel-form-group" id="DepartmentID_error_belowLine"><label for="DepartmentID"> ${await translateTextAPI("Department Code", req.headers.cookie)}: </label><select class="selectOptions travel_info_insert" id="DepartmentID">`;
                            var getDepartmentCode = await getDataFromDB("departmentID", req.headers.cookie);
                            for(var j = 0; j < getDepartmentCode.length; j++)
                            {
                                form += `<option value="${await translateTextAPI(getDepartmentCode[j].ez_department_code_value, req.headers.cookie)}"> ${await translateTextAPI(getDepartmentCode[j].ez_department_code_value, req.headers.cookie)} </option>`;
                            }
                            form += `</select><span class="required-alert" id="DepartmentID_error_text"></span></div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "Cost Center")
                        {
                            form += `<div class="form-group travel-form-group" id="CostCenter_error_belowLine"><label for="CostCenter"> ${await translateTextAPI("Cost Center", req.headers.cookie)}: </label><input type="text" autocomplete="off" class="form-control travel_info_insert" id="CostCenter" value="" onfocusout="validateField('numeric', 'CostCenter', this.value)"> <span class="required-alert" id="CostCenter_error_text_chars" style="display:none"> ${ await translateTextAPI("Only chracters are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="CostCenter_error_text_chars_numbers" style="display:none"> ${ await translateTextAPI("Only chracters & numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="CostCenter_error_text_invalid_mail" style="display:none"> ${ await translateTextAPI("Invalid email.", req.headers.cookie) } </span> <span class="required-alert" id="CostCenter_error_text_numbers" style="display:none"> ${ await translateTextAPI("Only numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="CostCenter_error_text_incomplete_field" style="display:none"> ${ await translateTextAPI("Please fill this field.", req.headers.cookie) } </span> </div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "MUID" || (user_details[req.session.user_name].required_information)[i] === "Employee Number")
                        {
                            form += `<div class="form-group travel-form-group" id="EmployeeNumber_error_belowLine"><label for="EmployeeNumber"> ${await translateTextAPI("Employee Number", req.headers.cookie)} / MUID :</label><input type="text" autocomplete="off" class="form-control travel_info_insert" id="EmployeeNumber" value="" onfocusout="validateField('numeric', 'EmployeeNumber', this.value)"> <span class="required-alert" id="EmployeeNumber_error_text_chars" style="display:none"> ${ await translateTextAPI("Only chracters are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="EmployeeNumber_error_text_chars_numbers" style="display:none"> ${ await translateTextAPI("Only chracters & numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="EmployeeNumber_error_text_invalid_mail" style="display:none"> ${ await translateTextAPI("Invalid email.", req.headers.cookie) } </span> <span class="required-alert" id="EmployeeNumber_error_text_numbers" style="display:none"> ${ await translateTextAPI("Only numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="EmployeeNumber_error_text_incomplete_field" style="display:none"> ${ await translateTextAPI("Please fill this field.", req.headers.cookie) } </span> </div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "CMG number")
                        {
                            form += `<div class="form-group travel-form-group" id="CMGNumber_error_belowLine"><label for="CMGNumber"> ${await translateTextAPI("CMG Number", req.headers.cookie)}: </label><input type="text" autocomplete="off" class="form-control travel_info_insert" id="CMGNumber" value="" onfocusout="validateField('numeric', 'CMGNumber', this.value)"> <span class="required-alert" id="CMGNumber_error_text_chars" style="display:none"> ${await translateTextAPI("Only chracters are allowed.", req.headers.cookie)} </span> <span class="required-alert" id="CMGNumber_error_text_chars_numbers" style="display:none"> ${ await translateTextAPI("Only chracters & numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="CMGNumber_error_text_invalid_mail" style="display:none"> ${ await translateTextAPI("Invalid email.", req.headers.cookie) } </span> <span class="required-alert" id="CMGNumber_error_text_numbers" style="display:none"> ${ await translateTextAPI("Only numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="CMGNumber_error_text_incomplete_field" style="display:none"> ${ await translateTextAPI("Please fill this field.", req.headers.cookie) } </span> </div>`;
                        }
                        else if((user_details[req.session.user_name].required_information)[i] === "Cost Objective")
                        {
                            form += `<div class="form-group travel-form-group" id="UseDefaultCostCenter_error_belowLine"><label for="UseDefaultCostCenter"> ${await translateTextAPI("Cost Objective", req.headers.cookie)}: </label><input type="text" autocomplete="off" class="form-control travel_info_insert" id="UseDefaultCostCenter" value="" onfocusout="validateField('numeric', 'UseDefaultCostCenter', this.value)"> <span class="required-alert" id="UseDefaultCostCenter_error_text_chars" style="display:none"> ${ await translateTextAPI("Only chracters are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="UseDefaultCostCenter_error_text_chars_numbers" style="display:none"> ${ await translateTextAPI("Only chracters & numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="UseDefaultCostCenter_error_text_invalid_mail" style="display:none"> ${ await translateTextAPI("Invalid email.", req.headers.cookie) } </span> <span class="required-alert" id="UseDefaultCostCenter_error_text_numbers" style="display:none"> ${ await translateTextAPI("Only numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="UseDefaultCostCenter_error_text_incomplete_field" style="display:none"> ${ await translateTextAPI("Please fill this field.", req.headers.cookie) } </span> </div>`;
                        }
                    }
                    form += `<div class="form-group travel-form-group"><button type="button" class="btn btn-default disableIt" onclick="insertTravelerInfo();"> OK </button></div></div></div>`; 
                }
                
                var response = { responseType : "informationForm", form: form, country_code: user_details[req.session.user_name].country2DigitsCode, email : email, user_first_name : user_first_name, user_last_name : user_last_name };
            }
            else
            {
                var insert_status = await insert_info(avail_infromation, req.headers.cookie);

                if(insert_status.action == "Move_Further")
                {

                    //The below code is depreceated
                    if(user_details[req.session.user_name].prefferedLanguage === "English")
                    {
                        var unique_num = random(params);
                        var textToShow = `<div class='msg-row'><div class='user-msg receive'><p>Your profile information is fetched from travelers database. <button type="button" class="btn btn-success btn-sm" data-toggle="modal" data-target="#profileInfo${unique_num}">View Profile Information</button></p></div></div>`;
                        var modal_body = `<div class="modal fade profile-info-modal" id="profileInfo${unique_num}" role="dialog" data-backdrop="false"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal">&times;</button><h4 class="modal-title">Profile Information</h4></div><div class="modal-body">`;
                        for(var i = 0; i < avail_infromation.length; i++)
                        {
                            if(avail_infromation[i].id == "FirstName")
                            {
                                modal_body += `<p> <label> First Name :</label> ${avail_infromation[i].value}  </p>`;
                            }

                            if(avail_infromation[i].id == "LastName")
                            {
                                modal_body += `<p> <label> Last Name :</label> ${avail_infromation[i].value}  </p>`;
                            }

                            if(avail_infromation[i].id == "Email")
                            {
                                modal_body += `<p> <label> Email :</label> ${avail_infromation[i].value}  </p>`;
                            }

                            if(avail_infromation[i].id == "Phone")
                            {
                                modal_body += `<p> <label> Phone :</label> ${avail_infromation[i].value}  </p>`;
                            }
                        }
                        modal_body += `</div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>`;
                    }
                    else
                    {
                        var unique_num = random(params);
                        var textToShow = `<div class='msg-row'><div class='user-msg receive'><p>${await translateTextAPI("Your profile information is fetched from travelers database", req.headers.cookie)}. <button type="button" class="btn btn-success btn-sm" data-toggle="modal" data-target="#profileInfo${unique_num}"> ${ await translateTextAPI('View Profile Information', req.headers.cookie)}</button></p></div></div>`;
                        var modal_body = `<div class="modal fade" id="profileInfo${unique_num}" role="dialog" data-backdrop="false"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal">&times;</button><h4 class="modal-title"> ${await translateTextAPI('Profile Information', req.headers.cookie)}</h4></div><div class="modal-body">`;
                        for(var i = 0; i < avail_infromation.length; i++)
                        {
                            if(avail_infromation[i].id == "FirstName")
                            {
                                modal_body += `<p> ${await translateTextAPI('First Name', req.headers.cookie)} : ${avail_infromation[i].value} </p>`;
                            }

                            if(avail_infromation[i].id == "LastName")
                            {
                                modal_body += `<p> ${await translateTextAPI('Last Name', req.headers.cookie)} : ${avail_infromation[i].value} </p>`;
                            }

                            if(avail_infromation[i].id == "Email")
                            {
                                modal_body += `<p> ${await translateTextAPI('Email', req.headers.cookie)} : ${avail_infromation[i].value} </p>`;
                            }

                            if(avail_infromation[i].id == "Phone")
                            {
                                modal_body += `<p> ${await translateTextAPI('Phone', req.headers.cookie)} : ${avail_infromation[i].value} </p>`;
                            }
                        }
                        modal_body += `</div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal"> ${await translateTextAPI("Close", req.headers.cookie)}</button></div></div></div></div>`;
                    }
                    //var response = { responseType : "action", action : "Move_Further", textToShow: textToShow, modal_body: modal_body };

                    //making UI for the left side of the chatbot
                    if(avail_infromation != null && avail_infromation != undefined && avail_infromation.length != 0)
                    {
                        var travelerInfromationArray = avail_infromation;

                        if(user_details[req.session.user_name].prefferedLanguage == "English")
                        {
                            var html = `<div class="chat-panel travel-info"> <div class="chat-panel-header"> <h3>TRAVELER INFORMATION</h3> </div> <div class="chat-panel-body"> <p><span>First Name:</span> ${travelerInfromationArray[0].value} </p> <p><span>Last Name:</span> ${travelerInfromationArray[1].value} </p> <p><span>E-mail:</span> ${ travelerInfromationArray[2].value } </p> <p><span>Phone Number:</span>${ travelerInfromationArray[3].value } </p> <p><span>Employee Number:</span> ${ travelerInfromationArray[4].value } </p> </div> </div>`;
                        }
                        else
                        {
                            var html = `<div class="chat-panel"> <div class="chat-panel-header"> <h3>${await translateTextAPI('TRAVELER INFORMATION', req.headers.cookie)}</h3> </div> <div class="chat-panel-body"> <p><span>${await translateTextAPI('First Name', req.headers.cookie)}:</span> ${travelerInfromationArray[0].value} </p> <p><span>${await translateTextAPI('Last Name', req.headers.cookie)}:</span> ${travelerInfromationArray[1].value} </p> <p><span>${await translateTextAPI('E-mail', req.headers.cookie)}:</span> ${travelerInfromationArray[2].value} </p> <p><span>${await translateTextAPI('Phone Number', req.headers.cookie)}:</span>${ travelerInfromationArray[3].value } </p> <p><span>${await translateTextAPI('Employee Number', req.headers.cookie)}:</span> ${ travelerInfromationArray[4].value } </p> </div> </div>`;
                        }
                        var response = { status: 200, responseType : "action", action : "Move_Further", textToShow : html };
                    }
                }
            }
        }
        else
        {
            var response = { status : 404 };
        }
    }

    res.json(response);
});

//Will insert the data into DB and show the ensure values to the travler
router.post('/insertTravelerInfo', async (req, res) => {

    if(!user_details[req.session.user_name])
    {
        user_details[req.session.user_name] = {};
        user_details[req.session.user_name].available_infromation = [];
    }
    else
    {
        user_details[req.session.user_name].available_infromation = [];
    }

    var travelerInfoObj = {};
    
    var info_array = req.body.recordArray;

    for(var i = 0; i < info_array.length; i++)
    { 
        tmp_obj = {};
        tmp_obj[info_array[i].id] = info_array[i].value;
        (user_details[req.session.user_name].available_infromation).push(tmp_obj);
    }

    //Making traveler information object
    for (var i = 0; i < (user_details[req.session.user_name].available_infromation).length; i++)
    {
        var tmp_array = Object.keys((user_details[req.session.user_name].available_infromation)[i]);
        travelerInfoObj[tmp_array[0]] = (user_details[req.session.user_name].available_infromation)[i][tmp_array[0]];
    }

    if(user_details[req.session.user_name].numOfTravelers == 1)
    {   
        travelerInfoObj['TravelEventID'] = user_details[req.session.user_name].travelEventID;
        travelerInfoObj['TripPurposeID'] = user_details[req.session.user_name].tripPurpose == 'null' ? null:user_details[req.session.user_name].tripPurpose;
        travelerInfoObj['GroupID'] = "null";
        travelerInfoObj['ez_user_id_SubmittedBy'] = user_details[req.session.user_name].arrangerID;
        travelerInfoObj['ez_user_id_Traveler'] = (user_details[req.session.user_name].userID).toString();
    }
    else
    {
        travelerInfoObj['GroupID'] = user_details[req.session.user_name].groupID;
        travelerInfoObj['TravelEventID'] = user_details[req.session.user_name].travelEventID;
        travelerInfoObj['TripPurposeID'] = user_details[req.session.user_name].tripPurpose == 'null' ? null:user_details[req.session.user_name].tripPurpose;
        travelerInfoObj['ez_user_id_SubmittedBy'] = user_details[req.session.user_name].userID;
        travelerInfoObj['ez_user_id_Traveler'] = user_details[req.session.user_name].userID;
    }

    //Storing the traveler infromtion to server
    var insertInfo = await insertTravelerInfo(travelerInfoObj, req.headers.cookie);

    if(insertInfo.status === 1)
    {
        var response = { responseType : "action", action : "Move_Further" };
    }

    res.json(response);
});

//Will update the record in the database
router.post('/editTravelerInfo', async (req, res) => {

    //Getting request from the traveler
    var purpose = req.body.purpose;

    if(purpose === "initialize")
    {

        // ***** [ If preffered language is ENGLISH ] *****
        if(user_details[req.session.user_name].prefferedLanguage === "English")
        {
            //Creating form for updating traveler information
            var form = `<div class="panel panel-default"><div class="panel-body travel-form-body">`;
            for(var i = 0; i < objKeysArray.length; i++)
            {
                if(objKeysArray[i] === "FirstName")
                {
                    form += `<div class="form-group travel-form-group" id="FirstName_error_belowLine"><label for="FirstName"> First Name: </label><input type="text" autocomplete="off" class="form-control travel_info_update" id="FirstName" value="${travelerDataObject[objKeysArray[i]]}" onfocusout="validateField('string', 'FirstName', this.value)"> <span class="required-alert" id="FirstName_error_text_chars" style="display:none"> Only chracters are allowed. </span> <span class="required-alert" id="FirstName_error_text_chars_numbers" style="display:none"> Only chracters & numbers are allowed. </span> <span class="required-alert" id="FirstName_error_text_invalid_mail" style="display:none"> Invalid email. </span> <span class="required-alert" id="FirstName_error_text_numbers" style="display:none"> Only numbers are allowed. </span> <span class="required-alert" id="FirstName_error_text_incomplete_field" style="display:none"> Please fill this field. </span> </div>`;
                }
                else if(objKeysArray[i] === "LastName")
                {
                    form += `<div class="form-group travel-form-group" id="LastName_error_belowLine"><label for="LastName"> Last Name: </label><input type="text" autocomplete="off" class="form-control travel_info_update" id="LastName" value="${travelerDataObject[objKeysArray[i]]}" onfocusout="validateField('string', 'LastName', this.value)"> <span class="required-alert" id="LastName_error_text_chars" style="display:none"> Only chracters are allowed. </span> <span class="required-alert" id="LastName_error_text_chars_numbers" style="display:none"> Only chracters & numbers are allowed. </span> <span class="required-alert" id="LastName_error_text_invalid_mail" style="display:none"> Invalid email. </span> <span class="required-alert" id="LastName_error_text_numbers" style="display:none"> Only numbers are allowed. </span> <span class="required-alert" id="LastName_error_text_incomplete_field" style="display:none"> Please fill this field. </span> </div>`;
                }
                else if(objKeysArray[i] === "Email")
                {
                    form += `<div class="form-group travel-form-group" id="Email_error_belowLine"><label for="Email"> Email: </label><input type="email" autocomplete="off" class="form-control travel_info_update" id="Email" value="${travelerDataObject[objKeysArray[i]]}" onfocusout="validateField('email', 'Email', this.value)"> <span class="required-alert" id="Email_error_text_chars" style="display:none"> Only chracters are allowed. </span> <span class="required-alert" id="Email_error_text_chars_numbers" style="display:none"> Only chracters & numbers are allowed. </span> <span class="required-alert" id="Email_error_text_invalid_mail" style="display:none"> Invalid email. </span> <span class="required-alert" id="Email_error_text_numbers" style="display:none"> Only numbers are allowed. </span> <span class="required-alert" id="Email_error_text_incomplete_field" style="display:none"> Please fill this field. </span> </div>`;
                }
                else if(objKeysArray[i] === "Phone")
                {
                    form += `<div class="form-group travel-form-group" id="Phone_error_belowLine"><label for="Phone"> Phone: </label><input type="text" autocomplete="off" class="form-control travel_info_update" id="Phone" value="${travelerDataObject[objKeysArray[i]]}" onfocusout="validateField('phone', 'Phone', this.value)"> <span class="required-alert" id="Phone_error_text_chars" style="display:none"> Only chracters are allowed. </span> <span class="required-alert" id="Phone_error_text_chars_numbers" style="display:none"> Only chracters & numbers are allowed. </span> <span class="required-alert" id="Phone_error_text_invalid_mail" style="display:none"> Invalid email. </span> <span class="required-alert" id="Phone_error_text_numbers" style="display:none"> Only numbers are allowed. </span> <span class="required-alert" id="Phone_error_text_incomplete_field" style="display:none"> Please fill this field. </span> </div>`;
                }
                else if(objKeysArray[i] === "CustomField1")
                {
                    form += `<div class="form-group travel-form-group"><label for="CustomField1"> Legal Entity: </label><select class="selectOptions travel_info_update" id="CustomField1">`;
                    var getLegalEntities = await getDataFromDB("legalEntity", req.headers.cookie);
                    for(var j = 0; j < getLegalEntities.length; j++)
                    {
                        var selected = ((getLegalEntities[j].ez_legal_entity_value == travelerDataObject[objKeysArray[i]]) ? 'selected' : '');
                        form += `<option value="${getLegalEntities[j].ez_legal_entity_value}" ${selected}> ${getLegalEntities[j].ez_legal_entity_value} </option>`;
                    }
                    form += `</select><span class="required-alert" id="CustomField1_error_text"></span></div>`;
                }
                else if(objKeysArray[i] === "Department")
                {
                    form += `<div class="form-group travel-form-group"><label for="Department"> Department: </label><select class="selectOptions travel_info_update" id="Department">`;
                    var getDepartment = await getDataFromDB("department", req.headers.cookie);
                    for(var j = 0; j < getDepartment.length; j++)
                    {
                        var selected = ((getDepartment[j].ez_business_unit_value == travelerDataObject[objKeysArray[i]]) ? 'selected' : '');
                        form += `<option value="${getDepartment[j].ez_business_unit_value}" ${selected}> ${getDepartment[j].ez_business_unit_value} </option>`;
                    }
                    form += `</select><span class="required-alert" id="Department_error_text"></span></div>`;
                }
                else if(objKeysArray[i] === "Division")
                {
                    form += `<div class="form-group travel-form-group"><label for="Division"> Division: </label><select class="selectOptions travel_info_update" id="Division">`;
                    var getDivision = await getDataFromDB("division", req.headers.cookie);
                    for(var j = 0; j < getDivision.length; j++)
                    {
                        var selected = ((getDivision[j].ez_division_value == travelerDataObject[objKeysArray[i]]) ? 'selected' : '');
                        form += `<option value="${getDivision[j].ez_division_value}" ${selected}> ${getDivision[j].ez_division_value} </option>`;
                    }
                    form += `</select><span class="required-alert" id="Division_error_text"></span></div>`;
                }
                else if(objKeysArray[i] === "DepartmentID")
                {
                    form += `<div class="form-group travel-form-group"><label for="DepartmentID"> Department Code: </label><select class="selectOptions travel_info_update" id="DepartmentID">`;
                    var getDepartmentCode = await getDataFromDB("departmentID", req.headers.cookie);
                    for(var j = 0; j < getDepartmentCode.length; j++)
                    {
                        var selected = ((getDepartmentCode[j].ez_department_code_value == travelerDataObject[objKeysArray[i]]) ? 'selected' : '');
                        form += `<option value="${getDepartmentCode[j].ez_department_code_value}" ${selected}> ${getDepartmentCode[j].ez_department_code_value} </option>`;
                    }
                    form += `</select><span class="required-alert" id="DepartmentID_error_text"></span></div>`;
                }
                else if(objKeysArray[i] === "CostCenter")
                {
                    form += `<div class="form-group travel-form-group" id="CostCenter_error_belowLine"><label for="CostCenter"> Cost Center: </label><input type="text" autocomplete="off" class="form-control travel_info_update" id="CostCenter" value="${travelerDataObject[objKeysArray[i]]}" onfocusout="validateField('numeric', 'CostCenter', this.value)"> <span class="required-alert" id="CostCenter_error_text_chars" style="display:none"> Only chracters are allowed. </span> <span class="required-alert" id="CostCenter_error_text_chars_numbers" style="display:none"> Only chracters & numbers are allowed. </span> <span class="required-alert" id="CostCenter_error_text_invalid_mail" style="display:none"> Invalid email. </span> <span class="required-alert" id="CostCenter_error_text_numbers" style="display:none"> Only numbers are allowed. </span> <span class="required-alert" id="CostCenter_error_text_incomplete_field" style="display:none"> Please fill this field. </span> </div>`;
                }
                else if(objKeysArray[i] === "EmployeeNumber")
                {
                    form += `<div class="form-group travel-form-group" id="EmployeeNumber_error_belowLine"><label for="EmployeeNumber"> Employee ID:</label><input type="text" autocomplete="off" class="form-control travel_info_update" id="EmployeeNumber" value="${travelerDataObject[objKeysArray[i]]}" onfocusout="validateField('numeric', 'EmployeeNumber', this.value)"> <span class="required-alert" id="EmployeeNumber_error_text_chars" style="display:none"> Only chracters are allowed. </span> <span class="required-alert" id="EmployeeNumber_error_text_chars_numbers" style="display:none"> Only chracters & numbers are allowed. </span> <span class="required-alert" id="EmployeeNumber_error_text_invalid_mail" style="display:none"> Invalid email. </span> <span class="required-alert" id="EmployeeNumber_error_text_numbers" style="display:none"> Only numbers are allowed. </span> <span class="required-alert" id="EmployeeNumber_error_text_incomplete_field" style="display:none"> Please fill this field. </span> </div>`;
                }
                else if(objKeysArray[i] === "CMGNumber")
                {
                    form += `<div class="form-group travel-form-group" id="CMGNumber_error_belowLine"><label for="CMGNumber"> CMG Number: </label><input type="text" autocomplete="off" class="form-control travel_info_update" id="CMGNumber" value="${travelerDataObject[objKeysArray[i]]}" onfocusout="validateField('numeric', 'CMGNumber', this.value)"> <span class="required-alert" id="CMGNumber_error_text_chars" style="display:none"> Only chracters are allowed. </span> <span class="required-alert" id="CMGNumber_error_text_chars_numbers" style="display:none"> Only chracters & numbers are allowed. </span> <span class="required-alert" id="CMGNumber_error_text_invalid_mail" style="display:none"> Invalid email. </span> <span class="required-alert" id="CMGNumber_error_text_numbers" style="display:none"> Only numbers are allowed. </span> <span class="required-alert" id="CMGNumber_error_text_incomplete_field" style="display:none"> Please fill this field. </span> </div>`;
                }
                else if(objKeysArray[i] === "UseDefaultCostCenter")
                {
                    form += `<div class="form-group travel-form-group" id="UseDefaultCostCenter_error_belowLine"><label for="UseDefaultCostCenter"> Cost Objective: </label><input type="text" autocomplete="off" class="form-control travel_info_update" id="UseDefaultCostCenter" value="${travelerDataObject[objKeysArray[i]]}" onfocusout="validateField('numeric', 'UseDefaultCostCenter', this.value)"> <span class="required-alert" id="CMGNumber_error_text_chars" style="display:none"> Only chracters are allowed. </span> <span class="required-alert" id="CMGNumber_error_text_chars_numbers" style="display:none"> Only chracters & numbers are allowed. </span> <span class="required-alert" id="CMGNumber_error_text_invalid_mail" style="display:none"> Invalid email. </span> <span class="required-alert" id="CMGNumber_error_text_numbers" style="display:none"> Only numbers are allowed. </span> <span class="required-alert" id="CMGNumber_error_text_incomplete_field" style="display:none"> Please fill this field. </span> </div>`;
                }
            }
            form += `<div class="form-group travel-form-group"><button type="update" class="btn btn-default disableIt" onclick="updateTravelerInfo()"> Ensure </button></div></div></div>`;
        }

        // ***** [ If preffered language is NOT ENGLISH ] *****
        else
        {
            //Creating form for updating traveler information
            var form = `<div class="panel panel-default"><div class="panel-body travel-form-body">`;
            for(var i = 0; i < objKeysArray.length; i++)
            {
                if(objKeysArray[i] === "FirstName")
                {
                    form += `<div class="form-group travel-form-group" id="FirstName_error_belowLine"><label for="FirstName"> ${await translateTextAPI("First Name", req.headers.cookie)}: </label><input type="text" autocomplete="off" class="form-control travel_info_update" id="FirstName" value="${travelerDataObject[objKeysArray[i]]}" onfocusout="validateField('string', 'FirstName', this.value)"> <span class="required-alert" id="FirstName_error_text_chars" style="display:none"> ${await translateTextAPI("Only chracters are allowed.", req.headers.cookie)} </span> <span class="required-alert" id="FirstName_error_text_chars_numbers" style="display:none"> ${await translateTextAPI("Only chracters & numbers are allowed.", req.headers.cookie)} </span> <span class="required-alert" id="FirstName_error_text_invalid_mail" style="display:none"> ${ await translateTextAPI("Invalid email.", req.headers.cookie) } </span> <span class="required-alert" id="FirstName_error_text_numbers" style="display:none"> ${await translateTextAPI("Only numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="FirstName_error_text_incomplete_field" style="display:none"> ${await translateTextAPI("Please fill this field.", req.headers.cookie) } </span> </div>`;
                }
                else if(objKeysArray[i] === "LastName")
                {
                    form += `<div class="form-group travel-form-group" id="LastName_error_belowLine"><label for="LastName"> ${await translateTextAPI("Last Name", req.headers.cookie)}: </label><input type="text" autocomplete="off" class="form-control travel_info_update" id="LastName" value="${travelerDataObject[objKeysArray[i]]}" onfocusout="validateField('string', 'LastName', this.value)"> <span class="required-alert" id="LastName_error_text_chars" style="display:none"> ${await translateTextAPI("Only chracters are allowed.", req.headers.cookie)} </span> <span class="required-alert" id="LastName_error_text_chars_numbers" style="display:none"> ${await translateTextAPI("Only chracters & numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="LastName_error_text_invalid_mail" style="display:none"> ${await translateTextAPI("Invalid email.", req.headers.cookie) } </span> <span class="required-alert" id="LastName_error_text_numbers" style="display:none"> ${await translateTextAPI("Only numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="LastName_error_text_incomplete_field" style="display:none"> ${await translateTextAPI("Please fill this field.", req.headers.cookie) } </span> </div>`;
                }
                else if(objKeysArray[i] === "Email")
                {
                    form += `<div class="form-group travel-form-group" id="Email_error_belowLine"><label for="Email"> ${await translateTextAPI("Email", req.headers.cookie)}: </label><input type="email" autocomplete="off" class="form-control travel_info_update" id="Email" value="${travelerDataObject[objKeysArray[i]]}" onfocusout="validateField('email', 'Email', this.value)"> <span class="required-alert" id="Email_error_text_chars" style="display:none"> ${await translateTextAPI("Only chracters are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="Email_error_text_chars_numbers" style="display:none"> ${await translateTextAPI("Only chracters & numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="Email_error_text_invalid_mail" style="display:none"> ${await translateTextAPI("Invalid email.", req.headers.cookie)} </span> <span class="required-alert" id="Email_error_text_numbers" style="display:none"> ${await translateTextAPI("Only numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="Email_error_text_incomplete_field" style="display:none"> ${await translateTextAPI("Please fill this field.", req.headers.cookie) } </span> </div>`;
                }
                else if(objKeysArray[i] === "Phone")
                {
                    form += `<div class="form-group travel-form-group" id="Phone_error_belowLine"><label for="Phone"> ${await translateTextAPI("Phone", req.headers.cookie)}: </label><input type="text" autocomplete="off" class="form-control travel_info_update" id="Phone" value="${travelerDataObject[objKeysArray[i]]}" onfocusout="validateField('phone', 'Phone', this.value)"> <span class="required-alert" id="Phone_error_text_chars" style="display:none"> ${await translateTextAPI("Only chracters are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="Phone_error_text_chars_numbers" style="display:none"> ${ await translateTextAPI("Only chracters & numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="Phone_error_text_invalid_mail" style="display:none"> ${ await translateTextAPI("Invalid email.", req.headers.cookie) } </span> <span class="required-alert" id="Phone_error_text_numbers" style="display:none"> ${ await translateTextAPI("Only numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="Phone_error_text_incomplete_field" style="display:none"> ${ await translateTextAPI("Please fill this field.", req.headers.cookie) } </span> </div>`;
                }
                else if(objKeysArray[i] === "CustomField1")
                {
                    form += `<div class="form-group travel-form-group"><label for="CustomField1"> ${await translateTextAPI("Legal Entity", req.headers.cookie)}: </label><select class="selectOptions travel_info_update" id="CustomField1">`;
                    var getLegalEntities = await getDataFromDB("legalEntity", req.headers.cookie);
                    for(var j = 0; j < getLegalEntities.length; j++)
                    {
                        var selected = ((getLegalEntities[j].ez_legal_entity_value == travelerDataObject[objKeysArray[i]]) ? 'selected' : '');
                        form += `<option value="${getLegalEntities[j].ez_legal_entity_value}" ${selected}> ${getLegalEntities[j].ez_legal_entity_value} </option>`;
                    }
                    form += `</select><span class="required-alert" id="CustomField1_error_text"></span></div>`;
                }
                else if(objKeysArray[i] === "Department")
                {
                    form += `<div class="form-group travel-form-group"><label for="Department"> ${await translateTextAPI("Department", req.headers.cookie)}: </label><select class="selectOptions travel_info_update" id="Department">`;
                    var getDepartment = await getDataFromDB("department", req.headers.cookie);
                    for(var j = 0; j < getDepartment.length; j++)
                    {
                        var selected = ((getDepartment[j].ez_business_unit_value == travelerDataObject[objKeysArray[i]]) ? 'selected' : '');
                        form += `<option value="${getDepartment[j].ez_business_unit_value}" ${selected}> ${getDepartment[j].ez_business_unit_value} </option>`;
                    }
                    form += `</select><span class="required-alert" id="Department_error_text"></span></div>`;
                }
                else if(objKeysArray[i] === "Division")
                {
                    form += `<div class="form-group travel-form-group"><label for="Division"> ${await translateTextAPI("Division", req.headers.cookie)}: </label><select class="selectOptions travel_info_update" id="Division">`;
                    var getDivision = await getDataFromDB("division", req.headers.cookie);
                    for(var j = 0; j < getDivision.length; j++)
                    {
                        var selected = ((getDivision[j].ez_division_value == travelerDataObject[objKeysArray[i]]) ? 'selected' : '');
                        form += `<option value="${getDivision[j].ez_division_value}" ${selected}> ${getDivision[j].ez_division_value} </option>`;
                    }
                    form += `</select><span class="required-alert" id="Division_error_text"></span></div>`;
                }
                else if(objKeysArray[i] === "DepartmentID")
                {
                    form += `<div class="form-group travel-form-group"><label for="DepartmentID"> ${await translateTextAPI("Department Code", req.headers.cookie)}: </label><select class="selectOptions travel_info_update" id="DepartmentID">`;
                    var getDepartmentCode = await getDataFromDB("departmentID", req.headers.cookie);
                    for(var j = 0; j < getDepartmentCode.length; j++)
                    {
                        var selected = ((getDepartmentCode[j].ez_department_code_value == travelerDataObject[objKeysArray[i]]) ? 'selected' : '');
                        form += `<option value="${getDepartmentCode[j].ez_department_code_value}" ${selected}> ${getDepartmentCode[j].ez_department_code_value} </option>`;
                    }
                    form += `</select><span class="required-alert" id="DepartmentID_error_text"></span></div>`;
                }
                else if(objKeysArray[i] === "CostCenter")
                {
                    form += `<div class="form-group travel-form-group" id="CostCenter_error_belowLine"><label for="CostCenter"> ${await translateTextAPI("Cost Center", req.headers.cookie)}: </label><input type="text" autocomplete="off" class="form-control travel_info_update" id="CostCenter" value="${travelerDataObject[objKeysArray[i]]}" onfocusout="validateField('numeric', 'CostCenter', this.value)"> <span class="required-alert" id="CostCenter_error_text_chars" style="display:none"> ${ await translateTextAPI("Only chracters are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="CostCenter_error_text_chars_numbers" style="display:none"> ${ await translateTextAPI("Only chracters & numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="CostCenter_error_text_invalid_mail" style="display:none"> ${ await translateTextAPI("Invalid email.", req.headers.cookie) } </span> <span class="required-alert" id="CostCenter_error_text_numbers" style="display:none"> ${ await translateTextAPI("Only numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="CostCenter_error_text_incomplete_field" style="display:none"> ${ await translateTextAPI("Please fill this field.", req.headers.cookie) } </span> </div>`;
                }
                else if(objKeysArray[i] === "EmployeeNumber")
                {
                    form += `<div class="form-group travel-form-group" id="EmployeeNumber_error_belowLine"><label for="EmployeeNumber"> ${await translateTextAPI("Employee Number", req.headers.cookie)} / MUID:</label><input type="text" autocomplete="off" class="form-control travel_info_update" id="EmployeeNumber" value="${travelerDataObject[objKeysArray[i]]}" onfocusout="validateField('numeric', 'EmployeeNumber', this.value)"> <span class="required-alert" id="EmployeeNumber_error_text_chars" style="display:none"> ${ await translateTextAPI("Only chracters are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="EmployeeNumber_error_text_chars_numbers" style="display:none"> ${ await translateTextAPI("Only chracters & numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="EmployeeNumber_error_text_invalid_mail" style="display:none"> ${ await translateTextAPI("Invalid email.", req.headers.cookie) } </span> <span class="required-alert" id="EmployeeNumber_error_text_numbers" style="display:none"> ${ await translateTextAPI("Only numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="EmployeeNumber_error_text_incomplete_field" style="display:none"> ${ await translateTextAPI("Please fill this field.", req.headers.cookie) } </span> </div>`;
                }
                else if(objKeysArray[i] === "CMGNumber")
                {
                    form += `<div class="form-group travel-form-group" id="CMGNumber_error_belowLine"><label for="CMGNumber"> ${await translateTextAPI("CMG Number", req.headers.cookie)}: </label><input type="text" autocomplete="off" class="form-control travel_info_update" id="CMGNumber" value="${travelerDataObject[objKeysArray[i]]}" onfocusout="validateField('numeric', 'CMGNumber', this.value)"> <span class="required-alert" id="CMGNumber_error_text_chars" style="display:none"> ${await translateTextAPI("Only chracters are allowed.", req.headers.cookie)} </span> <span class="required-alert" id="CMGNumber_error_text_chars_numbers" style="display:none"> ${ await translateTextAPI("Only chracters & numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="CMGNumber_error_text_invalid_mail" style="display:none"> ${ await translateTextAPI("Invalid email.", req.headers.cookie) } </span> <span class="required-alert" id="CMGNumber_error_text_numbers" style="display:none"> ${ await translateTextAPI("Only numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="CMGNumber_error_text_incomplete_field" style="display:none"> ${ await translateTextAPI("Please fill this field.", req.headers.cookie) } </span> </div>`;
                }
                else if(objKeysArray[i] === "UseDefaultCostCenter")
                {
                    form += `<div class="form-group travel-form-group" id="UseDefaultCostCenter_error_belowLine"><label for="UseDefaultCostCenter"> ${await translateTextAPI("Cost Objective", req.headers.cookie)}: </label><input type="text" autocomplete="off" class="form-control travel_info_update" id="UseDefaultCostCenter" value="${travelerDataObject[objKeysArray[i]]}" onfocusout="validateField('numeric', 'UseDefaultCostCenter', this.value)"> <span class="required-alert" id="UseDefaultCostCenter_error_text_chars" style="display:none"> ${ await translateTextAPI("Only chracters are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="UseDefaultCostCenter_error_text_chars_numbers" style="display:none"> ${ await translateTextAPI("Only chracters & numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="UseDefaultCostCenter_error_text_invalid_mail" style="display:none"> ${ await translateTextAPI("Invalid email.", req.headers.cookie) } </span> <span class="required-alert" id="UseDefaultCostCenter_error_text_numbers" style="display:none"> ${ await translateTextAPI("Only numbers are allowed.", req.headers.cookie) } </span> <span class="required-alert" id="UseDefaultCostCenter_error_text_incomplete_field" style="display:none"> ${ await translateTextAPI("Please fill this field.", req.headers.cookie) } </span> </div>`;
                }
            }
            form += `<div class="form-group travel-form-group"><button type="update" class="btn btn-default disableIt" onclick="updateTravelerInfo()"> ${await translateTextAPI("Ensure", req.headers.cookie)} </button></div></div></div>`;
        }
        
        //Making payload to send back to the client
        var response = { responseType : "updateForm", form : form };
    }

    else if(purpose === "update_records")
    {
        var data_obj = {};
        var dataArray = req.body.data;

        var updatedTravelerInfoObj = {};

        for (var i = 0; i < dataArray.length; i++)
        {
            updatedTravelerInfoObj[`${dataArray[i].id}`] = `${dataArray[i].value}`;
        }

        for (var i = 0; i < dataArray.length; i++)
        {
            data_obj[`${dataArray[i].id}`] = dataArray[i].value;
        }

        if(user_details[req.session.user_name].numOfTravelers > 1)
        {
            data_obj['GroupID'] = user_details[req.session.user_name].groupID;
        }
        else
        {
            data_obj['GroupID'] = "null";
        }

        data_obj['TravelEventID'] = user_details[req.session.user_name].travelEventID;
        data_obj['TripPurposeID'] = user_details[req.session.user_name].tripPurpose == 'null' ? null:user_details[req.session.user_name].tripPurpose;
        data_obj['ez_user_id_SubmittedBy'] = user_details[req.session.user_name].userID;
        data_obj['ez_user_id_Traveler'] = user_details[req.session.user_name].userID;

        var infoUpdate = await updateTravelerInfo(data_obj, req.headers.cookie);

        if(infoUpdate.status === 1)
        {
            response = { responseType : "update_records", status : 1 };
        }
        else
        {
            response = { responseType : "update_records", status : 0 };
        }
    }

    //Sending response back to the traveler
    res.json(response);
});

router.get('/currentTravelerDetails', async (req,res) => {

    if(user_details[req.session.user_name].currentTravelerProfileDetails != null)
    {
        var detail_array = (user_details[req.session.user_name].currentTravelerProfileDetails).avail_info;
        if(detail_array.length != 0)
        {
            var first_name = (user_details[req.session.user_name].currentTravelerProfileDetails).avail_info[0].value;
            var last_name = (user_details[req.session.user_name].currentTravelerProfileDetails).avail_info[1].value;
            var response = { first_name : first_name, last_name : last_name, userID : user_details[req.session.user_name].userID };
        }
    }
    
    res.json(response);
});

router.post('/getTravelerInformation', async (req, res) => {
    
    var email = req.body.user_email;

    if( email )
    {   
        //Getting input fields form traveler against the requested form ID     
        var optionsArray = [ "First Name", "Last Name", "Email Address", "Mobile Phone", "MUID", "CMG number", "Cost Objective" ];

        //Here we will make a call to get the traveler infromation
        var traveler_profile_information = await getTravelerProfileInfo(email);
        var info_details    =   traveler_profile_information.profile_details;

        if( Object.entries(info_details).length > 0 )
        {
            var result_object = await evaluateAvailInfo(optionsArray, info_details);
            var avail_infromation = result_object.avail_info;

            var response = { status: 200, avail_infromation : avail_infromation };
        }
        else
        {
            var response = { status : 404, message: "No profile found." };
        }
    }
    else
    {
        var response = { status : 404, message: "Email not found." };
    }
    
    res.json(response);

});

//==================================== [Route Implementation] ===========================================//

module.exports = router;