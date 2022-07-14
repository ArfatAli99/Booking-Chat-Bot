<cfcomponent>

    <!---  
        This component:
        1.  Provides information about the Traveler stored in sabre GDS
        2.  Requries user email as input.
        3.  Returned infromation is used by baldwin booking butler.
    --->

    <cfset This.baldwin_server_url = "https://junipertest.atgtravel.com/bookingbot2">

    <cffunction name="travelerInformation">
        <cfargument name="user_email" required="true"/>

        <cfset api_request = { "user_email" : user_email }>

        <cfhttp 
        url="#This.baldwin_server_url#/api/travelerInformation/getTravelerInformation" 
        method="POST" 
        result="api_response">
            <cfhttpparam type="header" name="Content-Type" value="application/json" />
            <cfhttpparam type="header" name="session_status" value="initialize" />
            <cfhttpparam type="body" value="#SerializeJSON(api_request)#">
        </cfhttp>

        <cfset parsed_response = deserializeJSON(api_response.Filecontent)>
        <cfif parsed_response.status eq 200>
            <cfset traveler_information = parsed_response.avail_infromation>
        <cfelse>
            <cfset traveler_information = []>    
        </cfif>

        <cfreturn traveler_information />
    </cffunction>

</cfcomponent>