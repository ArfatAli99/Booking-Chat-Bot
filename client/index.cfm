<!DOCTYPE html>
<html>
<head>
	<title> ATG-Booking Bot </title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="icon" type="image/png" href="img/1.png">

	<!--- Bootstrap css CDN --->
	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
	<!--- 	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous"> --->
	<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css">

	<!--- Datepicker css CDN --->
	<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.9.0/css/bootstrap-datepicker.min.css">

	<!--- Select 2 css CDN --->
	<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-beta.1/dist/css/select2.min.css" rel="stylesheet" /> 

	<!--- Date Time Picker --->
	<link rel="stylesheet" type="text/css" href="css/DateTimePicker.css">

	<!--- Phone Format Library --->
	<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.13/css/intlTelInput.css">

	<!--- 	Date Range Picker --->
	<link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/bootstrap.daterangepicker/2/daterangepicker.css" />

	<!--- custom css --->
	<link rel="stylesheet" type="text/css" href="css/chat-bot.css">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.3.2/jquery-confirm.min.css">


	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.3.2/jquery-confirm.min.css">

</head>
<body>

	<!-- 675113 // US -->
	<!-- 945161 // IN -->

	<!--- brandon.reynolds@milliporesigma.com (Traveler) 	--->
	<!--- marco.kohnke@merckgroup.com (Arranger) 			--->
	<!--- ajay.rao@merckgroup.com (Both)	 				--->

	<cfinclude template="umbrellaFaces.cfc">

	<!--- Getting traveler type --->
	<cfinvoke component="umbrellaFaces" method="getTravelerType" returnvariable="traveler_type">
		<cfinvokeargument name="user_email" value="brandon.reynolds@milliporesigma.com">
	</cfinvoke>

	<cfset user_details = {
		first_name : "William",
		last_name : "Never",
		user_email : "brandon.reynolds@milliporesigma.com",
		company_id : 20224,
		country_id : 12633,
		country_code : "US",
		user_id : 675113,
		preffered_language_code : "EN",
		preffered_language_name : "English",
		traveler_type : traveler_type
	  }>

	<button class='chat-button toggle-chat-box' onclick='session_set(<cfoutput>#serializeJSON(user_details)#</cfoutput>)' id='chat-launch-button'>
		<svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" class="WACLauncher__svg">
			<path d="M17.74,30,16,29l4-7h6a2,2,0,0,0,2-2V8a2,2,0,0,0-2-2H6A2,2,0,0,0,4,8V20a2,2,0,0,0,2,2h9v2H6a4,4,0,0,1-4-4V8A4,4,0,0,1,6,4H26a4,4,0,0,1,4,4V20a4,4,0,0,1-4,4H21.16Z"></path><path d="M8 10H24V12H8zM8 16H18V18H8z"></path>
		</svg>
	</button>
	
	<button class="chat-minimize-button minimize-chat-box" id="chat-minimize-button">
		<svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" class="WACLauncher__svg">
			<path d="M17.74,30,16,29l4-7h6a2,2,0,0,0,2-2V8a2,2,0,0,0-2-2H6A2,2,0,0,0,4,8V20a2,2,0,0,0,2,2h9v2H6a4,4,0,0,1-4-4V8A4,4,0,0,1,6,4H26a4,4,0,0,1,4,4V20a4,4,0,0,1-4,4H21.16Z"></path><path d="M8 10H24V12H8zM8 16H18V18H8z"></path>
		</svg>
	</button>
	
	<div class="chat-box" id='chat-box'>
		<div class="chat-head">

			<!-- Session Logout Alert -->
			<div class="chat-alert" id="chat-alert"></div>	

			<a href="#" class="chat-head-logo"><img src="img/atg-img.png"> Baldwin Booking Butler </a>
			<div class="right-head-controller">
				<span class="speaker-icon"><i class="fa fa-podcast" aria-hidden="true"></i></span>
				<a href="#" class="repeaticon" data-toggle="modal" data-target="#confrimation_modal"><i class="fa fa-repeat"></i></a>
				<a href="javascript:void(0);" class="close-chat toggle-chat-box minimize-chat-box">
					<i class="fa fa-minus"></i>
				</a>
			</div>
		</div>

		<div class="left-chat-panel" id="left-chat-panel">
			<h3 class="new-reservation-title translate_text"> New Reservation </h3>
			<div class="new-reservation" id="left-chat-panel-details"> </div>
			<!--- For Reservation Infromation --->
		</div>

		<div class="left-chat-panel" id="left-chat-panel-suggestion">
			<!--- For Reservation Suggestions --->
		</div>
		
		<div class="chat-body" id="chat-body">

			<div class="chat-loadding" id="chat-loadding" style="background: rgba(255, 255, 255, 0.6); position: absolute; width: 100%; text-align: center; height: calc(100% - 0px); top: 0; display: flex; align-items: center; justify-content: center; z-index: 99;"><img src="img/chat-loading-icon.gif"></div>
			<div class="translate-loader" id="translate-loadding" style="background: rgba(255, 255, 255, 0.6); position: absolute; width: 100%; text-align: center; height: calc(100% - 0px); top: 0; flex-wrap: wrap; flex-direction: column; align-items: center; justify-content: center; z-index: 99; display: none;">
				<img src="img/chat-loading-icon.gif">
				<h3> <span id="translating_text"> Applying Language Preferences </span> </h3>
			</div>
			<div class="msg-body" id="msg-body">
				<div id="heightDiv"></div>
			</div>
			
			<div class="gif-box gif-box-on">
				<!-- for mike gif -->
				<ul class="gif-list">
					<li>
						<a href="javascript:void(0);"  id="mic-off">
							<span><i class="fa fa-microphone-slash"></i></span>
							<img src="img/mic-loader.gif">
						</a>
					</li>
				</ul>
			</div>

			<div class="gif-box gif-box-off">
				<!-- for mike gif -->
				<ul class="gif-list">
					<li>
						<a href="">
							<img src="img/transcribText.gif">
						</a>
					</li>
				</ul>
			</div>

		</div>
		
		<div class="chat-footer" id="chat-footer">
			<div class="chat-input">
				<input type="text" class="chat-sm-input chat-input placeholder_translate" autocomplete="off" id="chat-input" name="" placeholder="Type something...">
				<input type="text" autocomplete="off" class="chat-sm-input chat-input placeholder_translate" id="DateAndTime" placeholder="Launch date time picker" style="display: none;" data-field="datetime">
				<input type="text" autocomplete="off" class="chat-sm-input chat-input placeholder_translate" id="Date" style="display: none;" placeholder="Launch date picker" data-field="date">
				<input type="text" autocomplete="off" class="chat-sm-input chat-input placeholder_translate" id="timeInput" style="display: none;" placeholder="Launch time picker" data-field="time">
				<input type="text" autocomplete="off" class="chat-sm-input chat-input placeholder_translate" id="demo" style="display: none;" placeholder="Launch Date Range Picker" />
			</div>
			<div class="chat-icons" id="chat-icons">
				<a href="javascript:void(0);" class="send-btn" id="send-btn" onclick="sendMessageBot()" disabled>
					<svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="24" height="24" viewBox="0 0 32 32" aria-hidden="true"><path d="M27.45,15.11l-22-11a1,1,0,0,0-1.08.12,1,1,0,0,0-.33,1L7,16,4,26.74A1,1,0,0,0,5,28a1,1,0,0,0,.45-.11l22-11a1,1,0,0,0,0-1.78Zm-20.9,10L8.76,17H18V15H8.76L6.55,6.89,24.76,16Z"></path></svg>
				</a>
				<a href="javascript:void(0);" class="voice-btn" id="mic-on" onclick="initiateSTT()"><i class="fa fa-microphone"></i></a>
				<!--- <a href="javascript:void(0);" class="voice-btn" id="mic-off"><i class="fa fa-microphone-slash"></i></a> --->
			</div>
		</div>

	</div>

	<!--- Modal for start over confirmation --->

	<div class="modal fade chat-modal" id="confrimation_modal" role="dialog">
		<div class="modal-dialog">
	    
	    	<div class="modal-content">
	        	<div class="modal-header">
	          		<h4 class="modal-title"> <span class="translate_text"> Chat start over warning! </span> </h4>
	        	</div>
	        	<div class="modal-body">
	          		<p> <span class="translate_text"> Are you sure to start over your chat session? </span> </p>
	        	</div>
	        	<div class="modal-footer">
	          		<button type="button" class="btn btn-primary" data-dismiss="modal"> <span class="translate_text"> No </span> </button>
	          		<button type="button" class="btn btn-danger" data-dismiss="modal" onclick="relauchChat()"> <span class="translate_text"> Yes </span> </button>
	        	</div>
	      	</div>

		</div>
	</div>

	<!--- Modal For Session Alert --->

	<div class="modal fade chat-modal" id="sessionAlert" role="dialog">
		<div class="modal-dialog">
	    
	    	<div class="modal-content">
	        	<div class="modal-header">
	          		<h4 class="modal-title"> <span id="translate_text"> Session In-Active </span>! </h4>
	        	</div>
	        	<div class="modal-body">
	          		<p> <span class="translate_text"> Your session will expire in  </span> <span id="remaining_time"> </span> <span id="translate_text">  seconds. Please send a message to keep the session alive </span>.</p>
	        	</div>
	        	<div class="modal-footer">
	          		<button type="button" class="btn btn-default" data-dismiss="modal" onclick="keepSessionAlive()"> <span id="translate_text"> Keep Session Alive </span> </button>
	        	</div>
	      	</div>

		</div>
	</div>

	<!--- Modal For Session Alert --->

	<!--- Modal For Flight Validation --->

	<div class="modal fade chat-modal" id="flight_validation" role="dialog">
		<div class="modal-dialog">
	    
	    	<div class="modal-content">
	        	<div class="modal-header">
	          		<h4 class="modal-title"> <span class="translate_text"> Validating Selected Flight </span>! </h4>
	        	</div>
	        	<div class="modal-body">
	          		<p id="flight_validation_result"> <img src="img/flight_valdiating.gif" style="width: 20%;"> <strong> <span class="translate_text"> Validating the selected flight. </span> </strong> </p>
	        		<p id="flight_validation_result_not_found"> <img src="img/flight_valdiating.gif" style="width: 20%;"> <strong> <span class="translate_text"> Flight not validated! Please select another one. </span> </strong> </p>
				</div>
	        	<div id="flight_validate_footer" class="modal-footer" style="display: none;">
	          		<button type="button" class="btn btn-default" data-dismiss="modal"> <span class="translate_text"> Close </span> </button>
	        	</div>
	      	</div>

		</div>
	</div>

	<!--- Modal For Flight Validation --->

	<!--- Modal For Hotel Validation --->

	<div class="modal fade chat-modal" id="hotel_validation" role="dialog">
		<div class="modal-dialog">
	    
	    	<div class="modal-content">
	        	<div class="modal-header">
	          		<h4 class="modal-title"> <span class="translate_text"> Validating Selected Room </span>! </h4>
	        	</div>
	        	<div class="modal-body">
	          		<p id="hotel_validation_result"> <img src="img/flight_valdiating.gif" style="width: 20%;"> <strong> <span class="translate_text"> Validating the selected room </span>. </strong> </p>
					<p id="hotel_validation_result_not_found"> <img src="img/flight_valdiating.gif" style="width: 20%;"> <strong> <span class="translate_text"> Room not validated! Please select another one </span>. </strong> </p>
	        	</div>
	        	<div id="hotel_validate_footer" class="modal-footer" style="display: none;">
	          		<button type="button" class="btn btn-default" data-dismiss="modal"> <span class="translate_text"> Close </span> </button>
	        	</div>
	      	</div>

		</div>
	</div>

	<!--- Modal For Hotel Validation --->

	<!--- Modal For Rental Car Validation --->

	<div class="modal fade chat-modal" id="vehicle_validation" role="dialog">
		<div class="modal-dialog">
	    
	    	<div class="modal-content">
	        	<div class="modal-header">
	          		<h4 class="modal-title"> <span class="translate_text"> Validating Selected Car </span>! </h4>
	        	</div>
	        	<div class="modal-body">
	          		<p id="vehicle_validation_result"> <img src="img/flight_valdiating.gif" style="width: 20%;"> <strong> <span class="translate_text"> Validating the Selected Car </span>. </strong> </p>
	        		<p id="vehicle_validation_result_not_found"> <img src="img/flight_valdiating.gif" style="width: 20%;"> <strong> <span class="translate_text"> Car not validated! Please select another one </span>. </strong> </p>
				</div>
	        	<div id="vehicle_validate_footer" class="modal-footer" style="display: none;">
	          		<button type="button" class="btn btn-default" data-dismiss="modal"> <span class="translate_text"> Close </span> </button>
	        	</div>
	      	</div>

		</div>
	</div>

	<!--- Modal For Rental Car Validation --->

	<!--- Modal For Session Expiration --->

	<div class="modal fade chat-modal" id="sessionExpire" role="dialog">
	    <div class="modal-dialog">
	    
	    	<div class="modal-content">
	        	<div class="modal-header">
	          		<h4 class="modal-title"> <span class="translate_text"> Session Expired </span>! </h4>
	        	</div>
	        	<div class="modal-body">
	          		<p> <span id="translate_text"> Your session has been in-active for some time or has reached its maximum allowed lifespan. The current session has automatically expired </span>. </p>
	        	</div>
	        	<div class="modal-footer">
	        		<button type="button" class="btn btn-success" data-dismiss="modal" onclick="relauchChat()"> <span id="translate_text"> Re-launch </span> </button>
	        	</div>
	      	</div>

	    </div>
	</div>

	<!--- Modal For Session Expiration --->

	<!--- Modal for voice STT alert --->

	<button type="button" class="btn btn-info btn-lg" data-toggle="modal" id="voiceAlert" data-target="#voiceRecognitionSupport" style="display:none">Open Modal</button>

	<div class="modal fade chat-modal" id="voiceRecognitionSupport" role="dialog">
  		<div class="modal-dialog">
    		<div class="modal-content">
      			<div class="modal-header">
        			<h4 class="modal-title"><span id="statement_12"> Error </span></h4>
      			</div>
      			<div class="modal-body">
        			<p> <span id="statement_17"> Current version only supports voice recognition with ENGLISH language </span>!</p>
      			</div>
      			<div class="modal-footer">
      				<button type="button" class="btn btn-primary" data-dismiss="modal"> <span id="statement_18"> Ok </span> </button>
      			</div>
    		</div>
  		</div>
	</div>

	<!--- Modal for voice STT alert --->

	<!--- Modal for voice STT error --->

	<button type="button" class="btn btn-info btn-lg" data-toggle="modal" id="voiceError" data-target="#voiceSTTError" style="display:none">Open Modal</button>

	<div class="modal fade chat-modal" id="voiceSTTError" role="dialog">
  		<div class="modal-dialog">
    		<div class="modal-content">
      			<div class="modal-header">
        			<h4 class="modal-title"><span id="statement_12"> Error </span></h4>
      			</div>
      			<div class="modal-body">
        			<p> <span id="statement_19"> Please speak again in loud and clear voice</span>! </p>
      			</div>
      			<div class="modal-footer">
      				<button type="button" class="btn btn-primary" data-dismiss="modal"> <span id="statement_18"> Ok </span> </button>
      			</div>
    		</div>
  		</div>
	</div>

	<!--- Modal for voice STT alert --->

	<!--- Modal for voice STT SSL error --->

	<button type="button" class="btn btn-info btn-lg" data-toggle="modal" id="voiceSSLError" data-target="#voiceSTTSSLError" style="display:none">Open Modal</button>

	<div class="modal fade chat-modal" id="voiceSTTSSLError" role="dialog">
  		<div class="modal-dialog">
    		<div class="modal-content">
      			<div class="modal-header">
        			<h4 class="modal-title"><span id="statement_12"> Error </span></h4>
      			</div>
      			<div class="modal-body">
        			<p> <span id="statement_20"> The application is not SSL secured. Voice Recognition Feature is disbaled</span>! </p>
      			</div>
      			<div class="modal-footer">
      				<button type="button" class="btn btn-primary" data-dismiss="modal"> <span id="statement_18"> Ok </span> </button>
      			</div>
    		</div>
  		</div>
	</div>

	<!--- Modal for voice STT SSL alert --->

	<!--- Modal for ATG Booking Bot error --->

	<div class="modal fade chat-modal" id="botError" role="dialog">
		<div class="modal-dialog">
	    
	    	<div class="modal-content">
	        	<div class="modal-header">
	          		<h4 class="modal-title"> Error ! </h4>
	        	</div>
	        	<div class="modal-body">
	          		<p> <span id="error_message"> </span> </p>
	        	</div>
	        	<div class="modal-footer">
	          		<button type="button" class="btn btn-default" data-dismiss="modal" onclick="relauchChat()">  Re-launch </button>
	        	</div>
	      	</div>

		</div>
	</div>

	<!--- Modal for ATG Booking Bot error --->

	<!--- Modal for Profile Not FOund --->

	<div class="modal fade chat-modal" id="profile_search_error" role="dialog">
		<div class="modal-dialog">
	    
	    	<div class="modal-content">
	        	<div class="modal-header">
	          		<h4 class="modal-title"> Error ! </h4>
	        	</div>
	        	<div class="modal-body">
	          		<p> <span> Profile not found on sabre. </span> </p>
	        	</div>
	        	<div class="modal-footer">
	          		<button type="button" class="btn btn-default" data-dismiss="modal" >  Close </button>
	        	</div>
	      	</div>

		</div>
	</div>

	<!--- Modal for ATG Booking Bot error --->

	<!--- Modal for Chat Ending --->

	<div class="modal fade chat-modal" id="chatEnd" role="dialog">
		<div class="modal-dialog">
	    
	    	<div class="modal-content">
	        	<!-- <div class="modal-header">
	          		<button type="button" class="close" data-dismiss="modal">&times;</button>
	          		<h4 class="modal-title"> Reservation Completed! </h4>
	        	</div> -->
	        	<div class="modal-body">
	        		<div> <button type="button" class="close-popup" data-dismiss="modal" onclick="close_popup()"> <i class="fa fa-times"></i> </button> </div>
	        		<div class="com-res-img">
	        			<img src="img/chat-loading-icon.gif">
	        		</div>
	        		<div class="com-resr-text" id="chat_close_message">
	        			
	        		</div>
	        	
	        	</div>
	        	<!-- <div class="modal-footer">
	          		<button type="button" class="btn btn-default" data-dismiss="modal">  Close </button>
	        	</div> -->
	      	</div>

		</div>
	</div>

	<!--- Modal for Chat Ending --->

	<!--- Modal for error if none of the concerned traveler have profile on GDS --->

	<button type="button" class="btn btn-info btn-lg" data-toggle="modal" id="concernedTravelerError" data-target="#noConTravError" style="display:none">Open Modal</button>

	<div class="modal fade chat-modal" id="noConTravError" role="dialog">
  		<div class="modal-dialog">
    		<div class="modal-content">
      			<div class="modal-header">
        			<h4 class="modal-title"><span id="statement_12"> Error </span></h4>
      			</div>
      			<div class="modal-body">
        			<p> <span id="statement_21"> None of your traveler have profile in our database</span>! </p>
      			</div>
      			<div class="modal-footer">
      				<button type="button" class="btn btn-primary" data-dismiss="modal" onclick="relauchChat()"> <span id="statement_16"> Re-launch </span> </button>
      			</div>
    		</div>
  		</div>
	</div>
  
</div>
	<!--- Modal for voice STT SSL alert --->

 	<div id="dtBox"></div>
</body>
</html>

<cfoutput>
	<!--- Adding library files --->
	<!--- jQuery file  version : 3.5.1 --->

	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>

	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.3.1/jquery.cookie.min.js" type="text/javascript"></script>

	<!--- Bootstrap js files version : 3.3.7 --->
	<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
	<!--- 	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script> --->
	
	<!--- Phone Format Library --->
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.13/js/intlTelInput.js"></script>
	
	<!--- Phone Format Library (Helping File) --->
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.13/js/utils.min.js"></script>

	<!--- Owl Slider ---> 
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js"></script>

	<!--- Bootstrap Datepicker --->
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.9.0/js/bootstrap-datepicker.min.js"></script>

	<!--- <!--- Bootstrap Timepicker --->
	<script type="text/javascript" src="js/clockpicker.js"></script> --->

	<!--- Moment Js Library for Date Formatting --->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>

	<!--- Date and Time Picker --->
	<script type="text/javascript" src="js/DateTimePicker.js"></script>
	
	<!--- webRTC file --->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/RecordRTC/5.6.1/RecordRTC.js"></script>
	<!--- <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/webrtc-adapter/6.1.4/adapter.js"></script> --->

	<!--- Font Awsome for Mic Icons  --->
	<script src="https://use.fontawesome.com/64ae084c7a.js"></script>
	
	<!--- application module --->
	<!--- <script language="javascript" src="js/chatbot.js"> --->
	<script type="text/javascript" src="js/chat-bot.js"></script>

	<!--- fstDropDown js File --->
	<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-beta.1/dist/js/select2.min.js"></script>

	<!--- 	Date Range Picker --->
	<script type="text/javascript" src="//cdn.jsdelivr.net/bootstrap.daterangepicker/2/daterangepicker.js"></script>

	<!--- Input Mask Jquery --->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.mask/1.14.11/jquery.mask.js"></script>
	<!--- <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.maskedinput/1.4.1/jquery.maskedinput.js"></script> --->
		<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.3.2/jquery-confirm.min.js"></script>
			<script type="text/javascript" src="js/notify.min.js"></script>

	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.3.2/jquery-confirm.min.js"></script>
 	<script type="text/javascript" src="js/notify.min.js"></script>

</cfoutput>