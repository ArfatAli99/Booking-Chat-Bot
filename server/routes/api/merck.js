//======================================== [Dependecies] ================================================//

//Route Main Dependecies
const { request }           =   require("express");
const express               =   require("express");
const router                =   express.Router();

//======================================== [Dependecies] ================================================//

//==================================== [Route Implementation] ===========================================//

router.post('/getFormTypes', async (req, res)=>{

    var countryID = req.body.countryID;
    var formTypesNames = [];
    var formType = null;
    var relativeFormFeildsIDs = [];
    //Getting the number of countries for MERCK ATG
    const listOfCountries = (JSONFILE.countries).length;
    for(var i = 0; i < listOfCountries; i++)
	{
        if(JSONFILE.countries[i].countryID === countryID)
        {
            //Getting FormTypesID
            var formTypesID = JSONFILE.countries[i].form_types.id;
            formType = "Employee";
            
            //Getting Form Types Names
            var formTypes = JSONFILE.form_types[(formTypesID-1)].types;

            //Getting typeDetails
            var formTypesDetails = JSONFILE.form_types[(formTypesID-1)].types_details;

            //getting related form feilds ids
            for(var k = 0; k < formTypesDetails.length; k++)
            {
                relativeFormFeildsIDs.push(formTypesDetails[k].input_feilds.id);
            }
            break;
        }   
    }

    var result = {
        formType : formType,
        formTypeNames : formTypes,
        formTypesInputDetails : relativeFormFeildsIDs
    }
    res.json(result);
});


router.post('/getRequiredFeilds', async (req, res)=>{

    var fromFeildsID = req.body.formTypeID;
    
    if(fromFeildsID === 4)
    {
        var requiredFeilds = ['First Name','Last Name','Email Address','Mobile Phone','Employee Number','Cost Center','Department Name','Department Code'];
    }
    else if(fromFeildsID === 3)
    {
        var requiredFeilds = ['First Name','Last Name','Email Address','Mobile Phone','Legal Entity','Business Unit','Division','Department Code','CMG number','Cost Objective'];
    }
    else if(fromFeildsID === 2)
    {
        var requiredFeilds = ['First Name','Last Name','Email Address','Mobile Phone','Legal Entity','Business Unit','Division','Department Code','MUID','CMG number','Cost Objective'];
    }
    else
    {
        var requiredFeilds = ['First Name','Last Name','Email Address','Mobile Phone','MUID','CMG number','Cost Objective'];
    }

    var result = { requiredFeilds : requiredFeilds };

    // var requiredFeilds = JSONFILE.required_feilds[(fromFeildsID - 1)].input_feilds;
    // var result = { requiredFeilds : requiredFeilds }
    
    res.json(result);
});

//==================================== [Route Implementation] ===========================================//

//========================================== [Route DB] =================================================//

const JSONFILE = { "use_cases" : "MERCK ATG REQUEST", "countries" : [ { "countryID" : "12117", "form_types" : { "id" : 1 } }, { "countryID" : "12075", "form_types" : { "id" : 1 } }, { "countryID" : "11988", "form_types" : { "id" : 1 } }, { "countryID" : "12060", "form_types" : { "id" : 2 } }, { "countryID" : "12636", "form_types" : { "id" : 3 } }, { "countryID" : "12135", "form_types" : { "id" : 3 } }, { "countryID" : "12021", "form_types" : { "id" : 4 } }, { "countryID" : "12267", "form_types" : { "id" : 4 } }, { "countryID" : "12264", "form_types" : { "id" : 4 } }, { "countryID" : "12279", "form_types" : { "id" : 4 } }, { "countryID" : "12309", "form_types" : { "id" : 4 } }, { "countryID" : "12321", "form_types" : { "id" : 4 } }, { "countryID" : "12450", "form_types" : { "id" : 4 } }, { "countryID" : "12483", "form_types" : { "id" : 4 } }, { "countryID" : "12495", "form_types" : { "id" : 4 } }, { "countryID" : "12510", "form_types" : { "id" : 4 } }, { "countryID" : "12564", "form_types" : { "id" : 4 } }, { "countryID" : "11955", "form_types" : { "id" : 4 } }, { "countryID" : "12669", "form_types" : { "id" : 4 } }, { "countryID" : "12273", "form_types" : { "id" : 5 } }, { "countryID" : "12453", "form_types" : { "id" : 6 } }, { "countryID" : "12633", "form_types" : { "id" : 7 } }, { "countryID" : "12678", "form_types" : { "id" : 7 } }, { "countryID" : "12132", "form_types" : { "id" : 7 } }, { "countryID" : "12192", "form_types" : { "id" : 7 } }, { "countryID" : "12351", "form_types" : { "id" : 7 } }, { "countryID" : "12597", "form_types" : { "id" : 7 } }, { "countryID" : "11991", "form_types" : { "id" : 7 } }, { "countryID" : "12249", "form_types" : { "id" : 7 } }, { "countryID" : "12408", "form_types" : { "id" : 7 } }, { "countryID" : "12465", "form_types" : { "id" : 7 } }, { "countryID" : "12525", "form_types" : { "id" : 7 } }, { "countryID" : "12582", "form_types" : { "id" : 7 } }, { "countryID" : "12018", "form_types" : { "id" : 7 } }, { "countryID" : "12306", "form_types" : { "id" : 7 } }, { "countryID" : "12426", "form_types" : { "id" : 7 } }, { "countryID" : "12090", "form_types" : { "id" : 7 } }, { "countryID" : "12141", "form_types" : { "id" : 7 } }, { "countryID" : "12231", "form_types" : { "id" : 7 } }, { "countryID" : "12486", "form_types" : { "id" : 7 } }, { "countryID" : "12606", "form_types" : { "id" : 7 } }, { "countryID" : "12657", "form_types" : { "id" : 7 } }, { "countryID" : "12393", "form_types" : { "id" : 7 } }, { "countryID" : "12171", "form_types" : { "id" : 7 } }, { "countryID" : "12471", "form_types" : { "id" : 7 } }, { "countryID" : "12627", "form_types" : { "id" : 7 } }, { "countryID" : "12246", "form_types" : { "id" : 7 } }, { "countryID" : "12405", "form_types" : { "id" : 7 } }, { "countryID" : "12504", "form_types" : { "id" : 7 } }, { "countryID" : "12258", "form_types" : { "id" : 7 } }, { "countryID" : "12615", "form_types" : { "id" : 7 } }, { "countryID" : "12012", "form_types" : { "id" : 7 } }, { "countryID" : "12252", "form_types" : { "id" : 7 } }, { "countryID" : "12432", "form_types" : { "id" : 7 } }, { "countryID" : "12150", "form_types" : { "id" : 7 } }, { "countryID" : "12039", "form_types" : { "id" : 7 } }, { "countryID" : "12282", "form_types" : { "id" : 7 } }, { "countryID" : "12531", "form_types" : { "id" : 7 } }, { "countryID" : "12537", "form_types" : { "id" : 7 } }, { "countryID" : "12285", "form_types" : { "id" : 7 } }, { "countryID" : "12084", "form_types" : { "id" : 7 } }, { "countryID" : "11982", "form_types" : { "id" : 7 } }, { "countryID" : "12456", "form_types" : { "id" : 7 } }, { "countryID" : "12255", "form_types" : { "id" : 7 } }, { "countryID" : "12078", "form_types" : { "id" : 7 } }, { "countryID" : "12153", "form_types" : { "id" : 7 } }, { "countryID" : "12522", "form_types" : { "id" : 7 } }, { "countryID" : "12123", "form_types" : { "id" : 7 } }, { "countryID" : "12156", "form_types" : { "id" : 7 } }, { "countryID" : "12435", "form_types" : { "id" : 7 } }, { "countryID" : "12345", "form_types" : { "id" : 7 } }, { "countryID" : "12339", "form_types" : { "id" : 7 } }, { "countryID" : "12240", "form_types" : { "id" : 7 } }, { "countryID" : "12693", "form_types" : { "id" : 7 } }, { "countryID" : "12138", "form_types" : { "id" : 7 } }, { "countryID" : "12114", "form_types" : { "id" : 8 } }, { "countryID" : "12219", "form_types" : { "id" : 9 } }, { "countryID" : "12213", "form_types" : { "id" : 10 } }, { "countryID" : "11976", "form_types" : { "id" : 10 } }, { "countryID" : "12411", "form_types" : { "id" : 10 } }, { "countryID" : "12093", "form_types" : { "id" : 10 } } ], "form_types" : [ { "id" : 1, "types" : [ "employee", "external_employee", "guest" ], "types_details" : [ { "type_name" : "employee", "input_feilds" : { "id" : 1 } }, { "type_name" : "external_employee", "input_feilds" : { "id" : 2 } }, { "type_name" : "guest", "input_feilds" : { "id" : 3 } } ] }, { "id" : 2, "types" : [ "employee", "external_employee", "guest" ], "types_details" : [ { "type_name" : "employee", "input_feilds" : { "id" : 4 } }, { "type_name" : "external_employee", "input_feilds" : { "id" : 5 } }, { "type_name" : "guest", "input_feilds" : { "id" : 6 } } ] }, { "id" : 3, "types" : [ "employee", "external_employee", "guest" ], "types_details" : [ { "type_name" : "employee", "input_feilds" : { "id" : 7 } }, { "type_name" : "external_employee", "input_feilds" : { "id" : 8 } }, { "type_name" : "guest", "input_feilds" : { "id" : 9 } } ] }, { "id" : 4, "types" : [ "general" ], "types_details" : [ { "type_name" : "general", "input_feilds" : { "id" : 10 } } ] }, { "id" : 5, "types" : [ "employee", "external_employee", "guest" ], "types_details" : [ { "type_name" : "employee", "input_feilds" : { "id" : 11 } }, { "type_name" : "external_employee", "input_feilds" : { "id" : 12 } }, { "type_name" : "guest", "input_feilds" : { "id" : 13 } } ] }, { "id" : 6, "types" : [ "employee", "external_employee", "guest" ], "types_details" : [ { "type_name" : "employee", "input_feilds" : { "id" : 14 } }, { "type_name" : "external_employee", "input_feilds" : { "id" : 15 } }, { "type_name" : "guest", "input_feilds" : { "id" : 16 } } ] }, { "id" : 7, "types" : [ "employee", "external_employee", "guest" ], "types_details" : [ { "type_name" : "employee", "input_feilds" : { "id" : 17 } }, { "type_name" : "external_employee", "input_feilds" : { "id" : 18 } }, { "type_name" : "guest", "input_feilds" : { "id" : 19 } } ] }, { "id" : 8, "types" : [ "general" ], "types_details" : [ { "type_name" : "general", "input_feilds" : { "id" : 20 } } ] }, { "id" : 9, "types" : [ "employee", "external_employee", "guest" ], "types_details" : [ { "type_name" : "employee", "input_feilds" : { "id" : 21 } }, { "type_name" : "external_employee", "input_feilds" : { "id" : 22 } }, { "type_name" : "guest", "input_feilds" : { "id" : 23 } } ] }, { "id" : 10, "types" : [ "general" ], "types_details" : [ { "type_name" : "general", "input_feilds" : { "id" : 24 } } ] }, ], "required_feilds" : [ { "id" : 1, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","MUID","CMG number","Cost Objective"] }, { "id" : 2, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","Legal Entity","Business Unit","Division","Department Code","MUID","CMG number","Cost Objective"] }, { "id" : 3, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","Legal Entity","Business Unit","Division","Department Code","CMG number","Cost Objective"] }, { "id" : 4, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","MUID","General Ledger"], }, { "id" : 5, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","Legal Entity","Business Unit","Division","Department Code","MUID","Cost Center","General Ledger"], }, { "id" : 6, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","Legal Entity","Business Unit","Division","Department Code","Cost Center","General Ledger"], }, { "id" : 7, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","MUID"], }, { "id" : 8, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","Legal Entity","Business Unit","Division","Department Code","MUID","Cost Center"], }, { "id" : 9, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","Legal Entity","Business Unit","Division","Department Code","Cost Center"], }, { "id" : 10, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","Employee Number","Cost Center","Department Name","Department Code"], }, { "id" : 11, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","Legal Entity","Business Unit","Division","Department Code","MUID","Cost Center"], }, { "id" : 12, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","Legal Entity","Business Unit","Division","Department Code","MUID","Cost Center"], }, { "id" : 13, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","Legal Entity","Business Unit","Division","Department Code","Cost Center"], }, { "id" : 14, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","MUID"], }, { "id" : 15, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","Legal Entity","Business Unit","Division","Department Code","MUID","Cost Center"], }, { "id" : 16, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","Legal Entity","Business Unit","Division","Department Code","Cost Center"], }, { "id" : 17, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","MUID"], }, { "id" : 18, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","Legal Entity","Business Unit","Division","Department Code","MUID","Cost Center"] }, { "id" : 19, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","Legal Entity","Business Unit","Division","Department Code","Cost Center"], }, { "id" : 20, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","Employee Number","Cost Center","Department Name","Department Code"], }, { "id" : 21, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","MUID"], }, { "id" : 22, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","Legal Entity","Business Unit","Division","Department Code","MUID","Cost Center"], }, { "id" : 23, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone","Legal Entity","Business Unit","Division","Department Code", "Cost Center"], }, { "id" : 24, "input_feilds" : ["First Name","Last Name","Email Address","Mobile Phone"], }, ] };

//========================================== [Route DB] =================================================//

module.exports = router;