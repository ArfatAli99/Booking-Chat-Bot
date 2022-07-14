//======================================== [Dependecies] ================================================//

//Route Main Dependecies
const express               =   require("express");
const router                =   express.Router();

//Calling External APIs [Translation] Dependecies
const axios                 =   require('axios');

//======================================== [Dependecies] ================================================//

//=================================== [Setting Custom Variables] ========================================//

//var access_token = null;
//var assignedRoles = [];

var user_details = {};

//Access token remain valid for 1 days, So after 1 days we will demand for new
setTimeout(()=>{ accessToken = null; }, 3599);

//=================================== [Setting Custom Variables] ========================================//

//======================================= [Helping functions] ===========================================//

async function getAccessToken()
{
    var umbrella_endpoint = `https://${process.env.UMBRELLA_CLIENTID}:${process.env.UMBRELLA_SECRET}@hurricane.umbrellanet.ch/uf-test/oauth/token?grant_type=client_credentials`;

    try
    {
        var api_response = await axios.post(umbrella_endpoint);

        if(api_response != null && api_response != "" && api_response != undefined)
        {
            
            var access_token = api_response.data.access_token;
            
            if(access_token != undefined && access_token != "" && access_token != null)
            {                
                return access_token;
            }
            else
            {
                return null;
            }
        }
        else
        {
            return null;
        }
    }
    catch(error)
    {
        console.log(error);
        return null;
    }
}

async function searchProfileByEmail(email)
{
    var umbrella_endpoint = `https://hurricane.umbrellanet.ch/uf-test/api/v1/profiles/travellers?q=${email}&scope=EMAIL`;

    var access_token = await getAccessToken();

    var header_info = {
        headers: {
            'Authorization': `Bearer ${access_token}` 
        }
    }
    
    try
    {
        var api_response = await axios.get(umbrella_endpoint, header_info);

        if(api_response != null && api_response != undefined && api_response != "")
        {
            if(api_response.data != null && api_response.data != "" && api_response.data != undefined)
            {
                if(api_response.data.results != null && api_response.data.results != "" && api_response.data.results != undefined)
                {
                    var profileSearchResultArray = api_response.data.results;
                    var required_uuid = profileSearchResultArray[0].uuid;
                    return required_uuid;
                }
                else
                {
                    return null;
                }
            }
            else
            {
                return null;
            }
        }
        else
        {
            return null;
        }
    }
    catch(error)
    {
        return null;
    }
}

async function searchProfileByEmployeeID(employee_id)
{
    var umbrella_endpoint = `https://hurricane.umbrellanet.ch/uf-test/api/v1/profiles/travellers?q=${employee_id}&scope=GENERIC_FIELD&p=UD27EmployeeID`;
    var access_token = await getAccessToken();

    var header_info = {
        headers: {
            'Authorization': `Bearer ${access_token}` 
        }
    }
    
    try
    {
        var api_response = await axios.get(umbrella_endpoint, header_info);
    }
    catch(error)
    {
        console.log(error);
    }

    if(api_response.response != null)
    {
        if(api_response.data != undefined)
        {
            var profileSearchResultArray = api_response.data.results;
        }
        else
        {
            return null;
        }   
    }
    else
    {
        return null;
    }

    if(profileSearchResultArray != undefined)
    {
        var latest_data = profileSearchResultArray[(profileSearchResultArray.length - 1)].uuid;
        return latest_data;
    }
    else 
    {
        return null;
    }
}

async function getProfileInfo(UUID)
{
    var umbrella_endpoint = `https://hurricane.umbrellanet.ch/uf-test/api/v1/profiles/traveller/${UUID}`;
    
    var access_token = await getAccessToken();
    
    if(access_token != null)
    {
        var header_info = { headers: { 'Authorization': `Bearer ${access_token}` } }

        try
        {
            var api_response = null;
            api_response = await axios.get(umbrella_endpoint, header_info);

            if(api_response.data.uuid != undefined)
            {
                return api_response.data;
            }
            else
            {
                return null;
            }
        }
        catch(error)
        {
            console.log(error);
            return null;
        }
    }
}

async function getEmail(id, count, current_session)
{
    let session_handle_axios = { headers: { cookie : current_session } };
    var DBresponse = await axios.post( process.env.IP + '/api/localQuery/query', { queryAction : 'FetchData', userID : id, requestType : "getUserEmailByID" }, session_handle_axios);
    
    if(DBresponse.data && DBresponse.data.record)
    {
        return DBresponse.data.record[0].ez_email;
    }
    else
    {
        //Call the function again to complete the request
        if(count < 5)
        {
            getEmail(id, count++, current_session);
        }
        else
        {
           return null; 
        }
    }
}

//======================================= [Helping functions] ===========================================//

//====================================== [Route Implementation] =========================================//

router.post('/searchProfile', async (req, res) => {

    var employeeID = req.body.employeeID;
    var profileID = await searchProfileByEmployeeID(employeeID);
    
    if(profileID != null)
    {
        var profileInformation = await getProfileInfo(profileID);
    }
    else
    {
        var response = { status : "404", message : "Profile not found!" };        
    }

    if(profileInformation != null)
    {
        if(profileInformation.data != undefined)
        {
            var response = { status : "200", details : profileInformation };
        }
    }
    else
    {
        var response = { status : "404", message : "Profile details not found!" };  
    }

    res.json(response);
});

router.post('/checkAssignedRoles', async (req, res) => {

    var email = null;
    var userID = req.body.userID;

    if(userID == "1048364" || userID == "1048366" || userID == "1048368" || userID == "1048370")
    {
        email = "aphrodite.siokou@merckgroup.com"
    }
    else
    {
        //Getting the required email from the logged in user.
        var email = await getEmail(userID,0,req.headers.cookie);
    }

    if(email != null && email != "" && email != undefined)
    {
        //Profile ID (uuid) is received from umbrella faces
        var profileID = await searchProfileByEmail(email);

        if(profileID != null && profileID != "" && profileID != undefined)
        {
            //Getting Profile Information
            var profileInformation = await getProfileInfo(profileID);

            if(profileInformation != null)
            {
                if(profileInformation.data != null && profileInformation.data != undefined && profileInformation.data != "")
                {
                    if(profileInformation.data.roles != null && profileInformation.data.roles != "" && profileInformation.data.roles != undefined)
                    {  
                        if(profileInformation.data.roles.arranger != null && profileInformation.data.roles.arranger != "" && profileInformation.data.roles.arranger != undefined)
                        {

                            if(!user_details[req.session.user_name])
                            {
                                user_details[req.session.user_name] = {};
                                user_details[req.session.user_name].assignedRoles = null;
                            }

                            //This variable is used in the route: verifyAssignedRoles
                            user_details[req.session.user_name].assignedRoles = profileInformation.data.roles;
                            
                            var response = { status : "200", arrangerRole : profileInformation.data.roles.arranger, travelerRole : profileInformation.data.roles.arranger };
                        }
                    }
                    else
                    {
                        var response = { status : "404", message : "Profile details not found on umbrella faces!"};
                    }
                }
                else
                {
                    var response = { status : "404", message : "Profile details not found on umbrella faces!"};
                }
            }
            else
            {
                var response = { status : "404", message : "Profile details not found on umbrella faces!"};
            }
        }
        else
        {
            var response = { status : "404", message : "Profile not found on umbrella faces!" };     
        }
    }
    else
    {
        var response = { status : "404", message : "Email not found!" };
    }

    res.json(response);
});

router.post('/verifyAssignedRoles', async (req, res) => {

    if(!user_details[req.session.user_name])
    {
        user_details[req.session.user_name] = {};
        user_details[req.session.user_name].assignedRoles = null;
    }

    if(user_details[req.session.user_name].assignedRoles != null)
    {
        if(user_details[req.session.user_name].assignedRoles['traveller'])
        {
            var response = { status : 1 }
        }
        else
        {
            var response = { status : 0 }
        }
    }
    else
    {
        var response = { status : 0 }
    }
    
    res.json(response)
});

//====================================== [Route Implementation] =========================================//

module.exports = router;