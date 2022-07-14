var moment          =   require('moment');
var watsonRoute     =   require('../routes/api/watson');

class PreviousReservations {

    async flights(flight_details, record_type, r_id = 0, user_name) 
    {
        if( flight_details.length > 0 && flight_details.length != undefined && flight_details.length != "" && flight_details !== undefined )
        {

            if(flight_details.length == 2 && flight_details[0].origin == flight_details[1].destinat)
            {
                var dated0  =   moment(moment.utc(flight_details[0].FlightDepartureDate));
                var datea1  =   moment(moment.utc(flight_details[1].FlightArrivalDate));
                var diff0   =   datea1.diff(dated0,'days');
                
                var html = `
                <div class="chat-panel" id='${record_type+''+r_id}'> 
                    <div class="panel-alert">
                        Please click on highlighted below 
                        <a href="javascript:void(0)" onclick="stopEditing('${record_type+''+r_id}')">
                            <i class="fa fa-check"></i>
                        </a>
                    </div>
                    <div class="chat-panel-header"> 
                        <div class="chat-aero-info">
                            <div class="inner-chat-aero-info">
                                <span class="left-date">
                                    <p id="${record_type+''+r_id}_round1_d_time" >
                                        ${moment.utc(flight_details[0].FlightDepartureDate).format('LT')}
                                    </p>
                                    <strong class="flight-sm-date" onclick="message('dep_return')">
                                        <span id="${record_type+''+r_id}_0_dep">
                                            ${flight_details[0].FlightDepartureDate ? moment.utc(flight_details[0].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightDepartureDate).format('ll'): 'N/A'}
                                        </span>
                                    </strong>
                                </span>
                                <div class="center-location">
                                    <i class="fa fa-plane"></i>
                                    <div class="location-stops" id="${record_type+''+r_id}_round_0_stops_icon">
                                        <strong id ="${record_type+''+r_id}_round_0_stops_total"> 
                                            ${ await watsonRoute.translate(null, "NONSTOP", user_name) } 
                                        </strong>
                                        <p></p>
                                        <div class="sm-locate-alerts" id="${record_type+''+r_id}_round_0_stops">
                                           <p> 
                                                ${await watsonRoute.translate(null, "Direct Flight (non-stop)", user_name) } 
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <span class="left-date right" >
                                    <p id="${record_type+''+r_id}_round1_a_time">
                                        ${moment.utc(flight_details[0].FlightArrivalDate).format('LT')} 
                                    </p>
                                    <strong class="flight-sm-date" onclick="message('dep_return')">
                                        <span id="${record_type+''+r_id}_0_arr">
                                            ${flight_details[0].FlightArrivalDate ? moment.utc(flight_details[0].FlightArrivalDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightArrivalDate).format('ll'): 'N/A'}
                                        </span> 
                                    </strong>
                                </span>
                                <div class="right-edit-dropdown">
                                    <a href="javascript:void(0)" class="edit_drop" onclick="editPreviousReservation('${record_type}','${r_id}');">
                                        <i class="fa fa-pencil"></i>
                                    </a>
                                    <a href="javascript:void(0)" class="edit_drop" onclick="deleditPreviousReservation('${record_type+''+r_id}','Flight');" data-toggle="modal" data-target="#myModal">
                                        <i class="fa fa-trash"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <h3 onclick="message('flight')"  class="ailine-name" id="${record_type+''+r_id}_round0_airline_name">${flight_details[0].airline_code} | ${flight_details[0].airline_name}</h3> 
                        <p class="hotel-state" id="${record_type+''+r_id}round_d_flight" style="display:none;">
                            Flight: A1357
                        </p> 
                    </div> 
                    <div class="chat-panel-body"> 
                        <p>
                            <span class="city"> ${flight_details[0].origin} </span>
                            ${flight_details[0].FlightDepartureCity} 
                        </p> 
                        <p>
                            <span class="city"> ${flight_details[0].destinat} </span>
                            ${flight_details[0].FlightArrivalCity} 
                        </p> 
                        <input type="hidden" id="${record_type+''+r_id}_diff" value="${diff0}"/>
                    </div> 
                    <div class="chat-panel-header"> 
                        <div class="chat-aero-info back">
                            <div class="inner-chat-aero-info">
                                <span class="left-date">
                                    <p id="${record_type+''+r_id}_round2_a_time" >
                                        ${moment.utc(flight_details[1].FlightArrivalDate).format('LT')} 
                                    </p>
                                    <strong class="flight-sm-date" onclick="message('dep_return')">
                                        <span id="${record_type+''+r_id}_1_dep"> ${flight_details[1].FlightDepartureDate ? moment.utc(flight_details[1].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[1].FlightDepartureDate).format('ll'): 'N/A'} </span>
                                    </strong>
                                </span>
                                <div class="center-location">
                                    <i class="fa fa-plane"></i>
                                    <div class="location-stops" id="${record_type+''+r_id}_round_1_stops_icon">
                                        <strong id ="${record_type+''+r_id}_round_1_stops_total"> 
                                            ${ await watsonRoute.translate(null, "NONSTOP", user_name) } </i>
                                        </strong>
                                        <p></p>
                                        <div class="sm-locate-alerts" id="${record_type+''+r_id}_round_1_stops">
                                            <p> 
                                                ${ await watsonRoute.translate(null, "Direct Flight (non-stop)", user_name) } 
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <span class="left-date right">
                                    <p id="${record_type+''+r_id}_round2_d_time" >
                                        ${moment.utc(flight_details[1].FlightDepartureDate).format('LT')} 
                                    </p>
                                    <strong class="flight-sm-date" onclick="message('dep_return')">
                                        <span id="${record_type+''+r_id}_1_arr">${flight_details[1].FlightArrivalDate ? moment.utc(flight_details[1].FlightArrivalDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[1].FlightArrivalDate).format('ll'): 'N/A'}</span>
                                    </strong>
                                </span>
                            </div>
                        </div>
                        <h3 class="ailine-name" id="${record_type+''+r_id}_round1_airline_name">${flight_details[1].airline_code} | ${flight_details[1].airline_name}</h3> 
                        <p class="hotel-state" id="${record_type+''+r_id}round_a_flight" style="display:none;">
                            Flight: A1357
                        </p> 
                    </div> 
                    <div class="chat-panel-body">
                        <p>
                            <span class="city"> ${ flight_details[1].destinat } </span>
                            ${flight_details[1].FlightArrivalCity} 
                        </p> 
                        <p>
                            <span class="city"> ${ flight_details[1].origin } </span>
                            ${flight_details[1].FlightDepartureCity}
                        </p> 
                    </div> 

                    <p class="price-tag" id="${record_type+''+r_id}_totalprice" style="display:none;">
                        <strong>
                            Total Price: <span></span>
                        </strong>
                    </p>

                </div>`;
            }
            else
            {
                var html = `
                <div class="chat-panel" id='${record_type+''+r_id}'> 
                    <div class="panel-alert">
                        Please click on highlighted below 
                        <a href="javascript:void(0)" onclick="stopEditing('${record_type+''+r_id}')">
                            <i class="fa fa-check"></i>
                        </a>
                    </div>
                    <div class="chat-panel-header"> 
                        <div class="chat-aero-info">
                            <div class="inner-chat-aero-info">
                                <span class="left-date" >
                                    <p id="${record_type+''+r_id}_one_d_time">
                                        ${moment.utc(flight_details[0].FlightDepartureDate).format('LT')} 
                                    </p>
                                    <strong class="flight-sm-date" onclick="message('dep_0')">
                                        <span id="${record_type+''+r_id}one_0_dep"> ${flight_details[0].FlightDepartureDate ? moment.utc(flight_details[0].FlightDepartureDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightDepartureDate).format('ll'): 'N/A'} </span>
                                    </strong>
                                </span>
                                <div class="center-location">
                                    <i class="fa fa-plane"></i>
                                    <div class="location-stops" id="${record_type+''+r_id}_one_stops_icon">
                                        <strong id ="${record_type+''+r_id}_one_0_stops_total"> 
                                            ${ await watsonRoute.translate(null, "NONSTOP", user_name) } 
                                        </strong>
                                        <p></p>
                                        <div class="sm-locate-alerts" id="${record_type+''+r_id}_one_0_stops">
                                            <p> 
                                                ${ await watsonRoute.translate(null, "Direct Flight (non-stop)", user_name) } 
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <span class="left-date right">
                                    <p id="${record_type+''+r_id}_one_a_time">
                                        ${moment.utc(flight_details[0].FlightArrivalDate).format('LT')} 
                                    </p>
                                    <strong class="flight-sm-date" onclick="message('dep_0')">
                                        <span id="${record_type+''+r_id}one_0_arr">${flight_details[0].FlightArrivalDate ? moment.utc(flight_details[0].FlightArrivalDate).format('llll').split(' ')[0]+' '+moment.utc(flight_details[0].FlightArrivalDate).format('ll'): 'N/A'}</span>
                                    </strong>
                                </span>
                                <div class="right-edit-dropdown">
                                    <a href="javascript:void(0)" onclick="editPreviousReservation('${record_type}','${r_id}');">
                                        <i class="fa fa-pencil"></i>
                                    </a>
                                    <a href="javascript:void(0)" onclick="deleditPreviousReservation('${record_type+''+r_id}','Flight');">
                                        <i class="fa fa-trash"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <h3 onclick="message('flight')" class="ailine-name" id="${record_type+''+r_id}one_0_airline_name" >${flight_details[0].airline_code} | ${flight_details[0].airline_name}</h3> 
                        <p class="hotel-state" id="${record_type+''+r_id}_flight" style="display:none;">
                            Flight: A1357
                        </p> 
                    </div> 
                    <div class="chat-panel-body"> 
                        <p>
                            <span class="city"> ${flight_details[0].origin} </span>
                            ${flight_details[0].FlightDepartureCity} 
                        </p> 
                        <p>
                            <span class="city"> ${flight_details[0].destinat} </span>
                            ${flight_details[0].FlightArrivalCity} 
                        </p> 
                    </div>
                    <p class="price-tag"> 
                        <span id="${record_type+''+r_id}_totalprice" style="display:none;">
                            <strong>
                                Total Price:
                            </strong>
                        </span>    
                    </p> 
                </div>`;
            }

        }

        return html;

    }
};

module.exports = PreviousReservations;