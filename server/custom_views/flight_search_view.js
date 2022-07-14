var moment          =   require('moment');
var watsonRoute     =   require('../routes/api/watson');

class FlightSearcResult {

    timeConvert(n) {
        var num = n;
        var hours = (num / 60);
        var rhours = Math.floor(hours);
        var minutes = (hours - rhours) * 60;
        var rminutes = Math.round(minutes);
        return rhours + " H(s) and " + rminutes + " M(s)";
    }

    async parse_flight_search_view( flight_details, div_id, invoke_source, user_name )
    {
        if(flight_details.length > 0)
        {
            var fare                    =   await watsonRoute.translate(null, "Fare", user_name);
            var select                  =   await watsonRoute.translate(null, "Select", user_name);
            var number_of_legs          =   await watsonRoute.translate(null, "Stop", user_name);
            var flight_option           =   await watsonRoute.translate(null, "Option", user_name);
            var duration                =   await watsonRoute.translate(null, "Duration", user_name);
            var non_stop                =   await watsonRoute.translate(null, "NONSTOP", user_name);
            var preffered               =   await watsonRoute.translate(null, "Preffered", user_name);
            var overlay_trans           =   await watsonRoute.translate(null, "Overlay", user_name);

            var html = `
            <div class="accordion-box-scroll" style="height: 350px; overflow: auto"> 
                <div class="accordion-box"> 
                    <ul class="accordion-list">`;

            //Checking flight type
            var flight_type = flight_details[0].flight_type;

            if( flight_type === "oneway" )
            {
                for(var i = 0; i < flight_details.length; i++)
                {
                    var flight              =   flight_details[i];
                    var stop_loc_details    =   ``;

                    if(invoke_source === "edit_pannel")
                    {
                        var selection_button = `<button class="select-btn disableIt" onclick='selectedFlight("${ flight_option }", ${flight.flight_id},"edit_pannel","${div_id}"); addClosingClass("${flight.flight_id}");'> ${ select } </button>`
                    }
                    else if(invoke_source === "availability")
                    {
                        var selection_button = `<button class="select-btn disableIt" onclick='selectedFlight("${ flight_option }", ${flight.flight_id},"availability","${div_id}"); addClosingClass("${flight.flight_id}");'> ${ select } </button>`
                    }
                    else
                    {
                        var selection_button = `<button class="select-btn disableIt" onclick='selectedFlight("${ flight_option }", ${ flight.flight_id }); addClosingClass("${ flight.flight_id }");'> ${ select } </button>`;
                    }

                    if(flight.temp_departure_details.stops_details.length === 0)
                    {
                        var stop_info = `<h5> ${non_stop} </h5>`;
                    }
                    else
                    {
                        var stop_info = `<h5> ${number_of_legs} :<span> ${flight.temp_departure_details.stops_details.length} </span> </h5>`;
                    }

                    if( flight.temp_departure_details.stops_details.length > 0 )
                    {
                        for(var j = 0; j < flight.temp_departure_details.stops_details.length; j++)
                        {
                            if( j === (flight.temp_departure_details.stops_details.length - 1) )
                            {
                                stop_loc_details += `${flight.temp_departure_details.stops_details[j].stop_name}`;
                            }
                            else
                            {
                                stop_loc_details += `${flight.temp_departure_details.stops_details[j].stop_name}, `;
                            }
                        }
                    }

                    html += `
                    <li class="accordion-row" id="${ flight.flight_id }">
                        <div class="right-fare"> 
                            <label> ${ fare }: <span> ${ flight.total_price } <b> $ </b> </span> </label>
                            ${ selection_button }
                        </div>
                        <div class="flight-career"> 
                            ${ stop_info } 
                        </div>
                        <div class="flight-option"> 
                            ${ flight_option } # ${ flight.flight_id }
                            <span class="service-class">  ${ flight.class_of_service } </span>
                        </div>
                        <div class="option-row">
                            <a class="accordion-title" href="javascript:void(0)" onclick="removeClass('${ flight.flight_id }')">
                                <div class="flight-duration-info">
                                    <div class="flight-duration-column">
                                        <p><span class="flight-tm"> ${moment.utc(flight.temp_departure_details.departure_date_time).format('LT')} </span> - <span class="flight-tm"> ${moment.utc(flight.temp_departure_details.arrival_date_time).format('LT')} </span></p>
                                        <p><span class="flight-city"> ${ flight.temp_departure_details.departure_city } </span> - <span class="flight-city"> ${ flight.temp_departure_details.arrival_city } </span></p>
                                    </div>
                                    <div class="flight-duration-column strop-time">
                                        <div class="flight-career"> 
                                            ${ stop_info } 
                                            ${ stop_loc_details }
                                        </div>
                                        <span> (${ flight.temp_departure_details.total_overlay_delay } hour(s) ${ overlay_trans }) </span>
                                    </div>
                                </div>
                            </a>
                            <div class="flight-box">`
                                for(var j = 0; j < flight.temp_departure_details.flight_schedule_details.length; j++)
                                {
                                    if(flight.temp_departure_details.flight_schedule_details[j].preference_indicator)
                                    {
                                        var preference = `<div class="preffered-tag">${preffered}</div>`;
                                    }
                                    else
                                    {
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
                                            <span>${this.timeConvert(flight.temp_departure_details.flight_schedule_details[j].fligtElapsedTime)}</span>
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

            else if( flight_type === "roundtrip" )
            {
                for( var i = 0; i < flight_details.length; i++ )
                {
                    var flight                  =   flight_details[i];
                    var stop_loc_details_dep    =   ``;
                    var stop_loc_details_ret    =   ``;

                    if(invoke_source === "edit_pannel")
                    {
                        var selection_button = `<button class="select-btn disableIt" onclick='selectedFlight("${ flight_option }", ${ flight.flight_id },"edit_pannel","${div_id}"); addClosingClass("${ flight.flight_id }");'> ${ select } </button>`
                    }
                    else if(invoke_source === "availability")
                    {
                        var selection_button = `<button class="select-btn disableIt" onclick='selectedFlight("${ flight_option }", ${ flight.flight_id },"availability","${div_id}"); addClosingClass("${ flight.flight_id }");'> ${ select } </button>`
                    }
                    else
                    {
                        var selection_button = `<button class="select-btn disableIt" onclick='selectedFlight("${ flight_option }", ${ flight.flight_id }); addClosingClass("${ flight.flight_id }");'> ${ select } </button>`;
                    }

                    if( ( flight.temp_departure_details.stops_details ).length === 0 )
                    {
                        var stop_info1 = `<h5> ${non_stop} </h5>`;
                    }
                    else
                    {
                        var stop_info1 = `<h5> ${number_of_legs} :<span> ${flight.temp_departure_details.stops_details.length} </span> </h5>`;
                        
                        for(var j = 0; j < flight.temp_departure_details.stops_details.length; j++)
                        {
                            if( j === (flight.temp_departure_details.stops_details.length - 1) )
                            {
                                stop_loc_details_dep += `${ flight.temp_departure_details.stops_details[j].stop_name }`;
                            }
                            else
                            {
                                stop_loc_details_dep += `${ flight.temp_departure_details.stops_details[j].stop_name }, `;
                            }
                        }
                    }

                    if( ( flight.temp_return_details.stops_details ).length === 0 )
                    {
                        var stop_info2 = `<h5> ${non_stop} </h5>`;
                    }
                    else
                    {
                        var stop_info2 = `<h5> ${number_of_legs} :<span> ${ ( flight.temp_return_details.stops_details ).length } </span> </h5>`;
                        
                        for(var j = 0; j < flight.temp_return_details.stops_details.length; j++)
                        {
                            if( j === (flight.temp_return_details.stops_details.length - 1) )
                            {
                                stop_loc_details_ret += `${ flight.temp_return_details.stops_details[j].stop_name }`;
                            }
                            else
                            {
                                stop_loc_details_ret += `${ flight.temp_return_details.stops_details[j].stop_name }, `;
                            }
                        }
                    }

                    if(invoke_source === "edit_pannel")
                    {
                        var flight_selection = `<button class="select-btn disableIt" onclick='selectedFlight("${ flight_option }", ${ flight.flight_id },"edit_pannel","${div_id}"); addClosingClass("${ flight.flight_id }");'> ${ select } </button>`
                    }
                    else if(invoke_source === "availability")
                    {
                        var flight_selection = `<button class="select-btn disableIt" onclick='selectedFlight("${ flight_option }", ${ flight.flight_id },"availability","${div_id}"); addClosingClass("${ flight.flight_id }");'> ${ select } </button>`
                    }
                    else
                    {
                        var flight_selection = `<button class="select-btn disableIt" onclick='selectedFlight("${ flight_option }", ${ flight.flight_id }); addClosingClass("${ flight.flight_id }");'> ${ select } </button>`;
                    }

                    //For departure
                    html += `
                    <li class="flight_options accordion-row" id="${ flight.flight_id }">
                        <div class="right-fare"> 
                            <label> ${ fare }: <span> ${ flight.total_price } <b> $ </b> </span> </label>
                            ${ flight_selection } 
                        </div>
                        <div class="flight-option"> 
                            ${ flight_option } # ${ flight.flight_id }
                            <span class="service-class">  ${ flight.class_of_service } </span>
                        </div>`

                        html += `
                        <div class="option-row">
                            <a class="accordion-title" href="javascript:void(0)" onclick="removeClass('${ flight.flight_id }')">
                                <div class="flight-duration-info">
                                    <div class="flight-duration-column">
                                        <p><span class="flight-tm"> ${moment.utc(flight.temp_departure_details.departure_date_time).format('LT')} </span> - <span class="flight-tm"> ${moment.utc(flight.temp_departure_details.arrival_date_time).format('LT')} </span></p>
                                        <p><span class="flight-city"> ${ flight.temp_departure_details.departure_city } </span> - <span class="flight-city"> ${ flight.temp_departure_details.arrival_city } </span></p>
                                    </div>
                                    <div class="flight-duration-column strop-time"> 
                                        <div class="flight-career"> 
                                            ${ stop_info1 }
                                            ${ stop_loc_details_dep } 
                                        </div>
                                        <span> (${ flight.temp_departure_details.total_overlay_delay } hour(s) ${ overlay_trans }) </span>
                                    </div>
                                </div>
                            </a>
                            <div class="flight-box">`
                                for(var j = 0; j < flight.temp_departure_details.flight_schedule_details.length; j++)
                                {

                                    if(flight.temp_departure_details.flight_schedule_details[j].preference_indicator)
                                    {
                                        var preference1 = `<div class="preffered-tag">${preffered}</div>`;
                                    }
                                    else
                                    {
                                        var preference1 = "";
                                    }

                                    html += `
                                    <div class="flight-row">
                                        ${ preference1 }
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
                                            <span>${this.timeConvert(flight.temp_departure_details.flight_schedule_details[j].fligtElapsedTime)}</span>
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
                    <li class="flight_options accordion-row" id="${ flight.flight_id }">
                        <div class="option-row">
                            <a class="accordion-title" href="javascript:void(0)" onclick="removeClass('${ flight.flight_id }')">
                                <div class="flight-duration-info">
                                    <div class="flight-duration-column">
                                        <p><span class="flight-tm"> ${moment.utc(flight.temp_return_details.departure_date_time).format('LT')} </span> - <span class="flight-tm"> ${moment.utc(flight.temp_return_details.arrival_date_time).format('LT')} </span></p>
                                        <p><span class="flight-city"> ${ flight.temp_return_details.arrival_city } </span> - <span class="flight-city"> ${ flight.temp_return_details.departure_city } </span></p>
                                    </div>
                                    <div class="flight-duration-column strop-time">
                                        <div class="flight-career"> 
                                            ${ stop_info2 } 
                                            ${ stop_loc_details_ret }
                                        </div>
                                        <span> (${ flight.temp_return_details.total_overlay_delay } hour(s) ${ overlay_trans }) </span>
                                    </div>
                                </div>
                            </a>
                            <div class="flight-box">`
                                for(var k = 0; k < flight.temp_return_details.flight_schedule_details.length; k++)
                                {

                                    if(flight.temp_return_details.flight_schedule_details[k].preference_indicator)
                                    {
                                        var preference2 = `<div class="preffered-tag">${preffered}</div>`;
                                    }
                                    else
                                    {
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
                                            <span>${this.timeConvert(flight.temp_return_details.flight_schedule_details[k].fligtElapsedTime)}</span>
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

        
        else
        {

            if(invoke_source === "edit_pannel")
            {
                var decision_buttons = `<button type='button' class='btn btn-default disableIt' onclick='noflightavailable_edit("yes","${div_id}"); disableButtons();'> ${ await watsonRoute.translate(null, "Yes", user_name) } </button>  <button type='button' class='btn btn-default disableIt' onclick='noflightavailable_edit("no","${div_id}"); disableButtons();'> ${ await watsonRoute.translate(null, "No", user_name) } </button>`;
            }
            else if(invoke_source === "availability")
            {
                var decision_buttons = ` <button type='button' class='btn btn-default disableIt' onclick='noflightavailable("y_mknew"); disableButtons();'> ${ await watsonRoute.translate(null, "Yes", user_name) } </button>  <button type='button' class='btn btn-default disableIt' onclick='noflightavailable("n_mknew"); disableButtons();'> ${ await watsonRoute.translate(null, "No", user_name) } </button>`;
            }
            else
            {
                var decision_buttons = `<button type='button' class='btn btn-default disableIt' onclick='message("yes"); disableButtons();'> ${ await watsonRoute.translate(null, "Yes", user_name) } </button>  <button type='button' class='btn btn-default disableIt' onclick='message("no"); disableButtons();'> ${ await watsonRoute.translate(null, "No", user_name) } </button>`;
            }

            var html = `
            <div class='msg-row'>
                <div class='user-msg receive'>
                    <p> ${ await watsonRoute.translate(null, "No flight found", user_name) }! ${ await watsonRoute.translate(null, "Do you want to make new reservation", user_name) }? </p>
                </div>
            </div>
            <div class='msg-row select'>
                <p> ${decision_buttons} </p> 
            </div>`
        }

        return html;

    }
}

module.exports = FlightSearcResult;