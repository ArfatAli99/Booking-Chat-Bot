//======================================== [Dependecies] ================================================//

//Route Main Dependecies
const { request, response } =   require("express");
const express               =   require("express");
const { route }             =   require("./watson");
const router                =   express.Router();

//Directory Accessing Dependency
var fs                      =   require('fs');
const path                  =   require("path");
const { resolve }           =   require("path");

//======================================== [Dependecies] ================================================//

var currentLogFilePath = null;

//====================================== [Helping functions] ============================================//

async function mainStorageDirectory()
{
    const rootPath = path.join(__dirname, '../../');
    const logSavingDir = path.join(rootPath, 'Chatbot_Logs');
    if (!fs.existsSync(logSavingDir))
    { 
        try{
            await fs.mkdirSync(logSavingDir);
            return true;
        }
        catch(error)
        {
            return false;
        }
    }
    else
    {
        return true;
    }
}

async function userFolder(userid)
{
    if(userid)
    {
        var userID = userid.toString();
        var directoryName = `Traveler_${userID}`;
        const rootPath = path.join(__dirname, '../../Chatbot_Logs/');
        const logSavingDir = path.join(rootPath, directoryName);    

        if (!fs.existsSync(logSavingDir)){
            try
            {
                await fs.mkdirSync(logSavingDir);
                return true;
            } 
            catch(error)
            {
                
                return false;
            }
        }
        else
        {
            return true;
        }
    }
    
}

async function createJsonFile(userid, fileName)
{
    var userID = userid.toString();
    var directoryName = `Traveler_${userID}/`;
    const name = fileName;
    const rootPath = path.join(__dirname, `../../Chatbot_Logs/${directoryName}`); 
    try{
        await fs.writeFileSync(`${rootPath}${name}.json`, `[ \n {"Process" : "Conversation Started"}, `);
        currentLogFilePath = `${rootPath}${name}.json`;
        return true;
    }catch(error)
    {
        
        return false;   
    }
}

async function writeLog(utterance, from)
{

    if(currentLogFilePath != null)
    {
        var comingData = { Text : utterance, from : from };
        var dataToAppend = JSON.stringify(comingData);

        try{
            var status = await fs.appendFile(currentLogFilePath, `\n${dataToAppend},`, function(error) { if(error) { return false; } });
            return status;
        }
        catch(error)
        {
            return false;
        }
    }
    else
    {
        console.log("Logger path is null!");
    }
}

async function closefile()
{
    if(currentLogFilePath)
    {
        try{
            await fs.appendFile(currentLogFilePath, `\n {"Process" : "Conversation Ended"} \n]`, function(error)
            {
                if(error)
                {
                    return false;
                }
                else
                {
                    currentLogFilePath = null;
                    return true;
                }
            });
            return true;
        }catch(error)
        {
            return false;
        }
    }
    else
    {
        console.log("No log file is currenlty opened!");
    }
    
}

//====================================== [Helping functions] ============================================//

//==================================== [Route Implementation] ===========================================//

router.post('/makeLog', async (req, res) => {
    var action = req.body.action;

    if(action === "initialize")
    {
        var userID = req.body.userID;
        var sessionID = req.body.sessionID;
        var datetime = new Date();
        var fileName = `${datetime.toISOString().slice(0,10)}_${sessionID}`;

        //Checking if main storage exists
        var mainStorageExistance = await mainStorageDirectory();
        if(mainStorageExistance)
        {
            //Checking correspondin user id directory exists
            var userFolderExistance = await userFolder(userID);
            
            if(userFolderExistance)
            {
                //Create file for saving the conversation log
                var fileCreationStatus = await createJsonFile(userID, fileName);
                if(fileCreationStatus)
                {
                    result = { Status : `Success ! Log file initialized.` };
                }
                else
                {
                    result = { Status : "Error ! File cannot be created." }
                }
            }
            else
            {
                result = { Status : "Error ! Required directory cannot be made." }
            }
        }
        else
        {
            result = { Status : "Error ! Required directory cannot be made." }
        }

        //make main directory for storing the conversation data.
        //make per user id directory and store the json file in it.
        //make a file with date on it as json.
        
        res.json(result);
    }
    else if(action === "updateJsonFile")
    {
        var utterance = req.body.utterance;
        var from = req.body.from;
        var operationStatus =  await writeLog(utterance, from);
        if(operationStatus)
        {
            result = { Status : "Success! Log updated succesfully." };
        }
        else
        {
            result = { Status : "Error! Log not updated." };
        }
        res.json(result);
    }
    else if(action === "closeJsonFile")
    {
        var operationStatus =  await closefile();
        if(operationStatus)
        {
            result = { Status : "Success! Log updated succesfully." };
        }
        else
        {
            result = { Status : "Error! Log not updated." };
        }
        res.json(result);
    }
});

//==================================== [Route Implementation] ===========================================//

module.exports = router;