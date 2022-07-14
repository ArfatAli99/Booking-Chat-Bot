<cfcomponent>

    <!---  
        This component:
        1.  Provides information about the Traveler Role (Traveler, Arranger, Both)
        2.  Requries user email as input.
        3.  Returned infromation is used by baldwin booking butler.
        4.  Traveler type = 0 (Traveler)
        5.  Traveler type = 1 (Arranger)
        6.  Traveler type = 2 (Both)
    --->

    <cfset This.UMBRELLA_CLIENTID = "bf650562-9dfa-452a-8a18-41a9b427ece7">
    <cfset This.UMBRELLA_SECRET = "e5775de8-4dad-4cb5-a368-9a1560a21a3a">

    <cffunction name="getTravelerType">

        <cfargument name="user_email" required="true"/>
        
        <!--- Uncomment it after umbrella issue resolved --->

        <!--- <cfset access_token = #getAccessToken()#> --->
        <!--- <cfif access_token neq "null"> --->
        <cfif 1 neq 1>

            <cfset profile_id = #searchProfileByEmail(user_email, access_token)#>

            <cfif profile_id eq 0>
                <cfset traveler_type = 0>
            <cfelse>
                <cfset traveler_type = #getProfileInfo(profile_id, access_token)#>  
            </cfif>
        
        <cfelse>
        
             <cfset traveler_type = 0>   
        
        </cfif>

        <!--- Delete it after umbrella issue resolved --->
        <cfset traveler_type = 0> 

        <cfreturn traveler_type />
    
    </cffunction>

    <cffunction name="getAccessToken">
        <cfhttp 
            url="https://#This.UMBRELLA_CLIENTID#:#This.UMBRELLA_SECRET#@hurricane.umbrellanet.ch/uf-test/oauth/token?grant_type=client_credentials" 
            method="POST" 
            result="api_response">
            <cfhttpparam type="header" name="Content-Type" value="application/json" />
        </cfhttp>

        <cftry>
            
            <cfset token_details = deserializeJSON(api_response.Filecontent) />
            <cfset token = "#token.access_token#">
        
        <cfcatch type="any">
        
            <cfset token = "null">
        
        </cfcatch>
        </cftry>
    
        <cfreturn token>
    
    </cffunction>

    <cffunction name="searchProfileByEmail">
        
        <cfargument name="user_email" required="true"/>
        <cfargument name="access_token" required="true"/>

        <cfhttp 
            url="https://hurricane.umbrellanet.ch/uf-test/api/v1/profiles/travellers?q=#user_email#&scope=EMAIL" 
            method="GET" 
            result="api_response">
            <cfhttpparam type="header" name="Authorization" value="Bearer #access_token#" />
        </cfhttp>

        <cftry>
            
            <cfset parsed_response = deserializeJSON(api_response.Filecontent) />
            <cfset searched_profiles = #parsed_response.results#>
            
            <cfif ArrayLen(searched_profiles) eq 0 >
                <cfset profile_id = 0>
            <cfelse>
                <cfset profile_id = searched_profiles[1].uuid>
            </cfif>
        
        <cfcatch type="any">
        
            <cfset profile_id = 0>
        
        </cfcatch>
        </cftry>
        
        <cfreturn profile_id>
        
    </cffunction>

    <cffunction name="getProfileInfo">
        <cfargument name="profile_id" required="true"/>
        <cfargument name="access_token" required="true"/>

        <cfhttp 
            url="https://hurricane.umbrellanet.ch/uf-test/api/v1/profiles/traveller/#profile_id#" 
            method="GET" 
            result="api_response">
            <cfhttpparam type="header" name="Authorization" value="Bearer #access_token#" />
        </cfhttp>

        <cfset parsed_response = deserializeJSON(api_response.Filecontent) />
        <cfset profile_roles = parsed_response.data.roles>

        <cfset arranger_role = profile_roles.arranger>
        <cfset traveler_role = profile_roles.traveller>

        <cfif arranger_role eq "NO" && traveler_role eq "YES">
            <cfset traveler_type = 0>
        <cfelseif arranger_role eq "YES" && traveler_role eq "NO">    
            <cfset traveler_type = 1>
        <cfelse>
            <cfset traveler_type = 2>    
        </cfif>

        <cfreturn traveler_type>
    </cffunction>

</cfcomponent>