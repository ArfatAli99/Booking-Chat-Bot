var moment          =   require('moment');
var watsonRoute     =   require('../routes/api/watson');

class HotelSearcResult {

    async parse_hotel_search_view( hotel_details, div_id, invoke_source, user_name )
    {
        var html = ``;

        //If hotel(s) found
        if( hotel_details.length > 0 )
        {
            html += `
            <div class='hotel_detail_div' style='height: 400px; overflow: auto'>
                <div class='hotel-secton'>`;
            
                for(var i = 0; i < hotel_details.length; i++)
                {
                    var hotel = hotel_details[i];

                    //Hotel preference
                    if( hotel.preference_indicator )
                    {
                        var preference_check = `<div class="preffered-tag"> ${ await watsonRoute.translate(null, "Preferred", user_name) } </div>`;
                    }
                    else
                    {
                        var preference_check = ``;
                    }

                    //Hotel price
                    if( hotel.starting_from )
                    {
                        var hotel_price = `${ await watsonRoute.translate(null, "Starting From", user_name) } $ ${hotel.starting_from} ${ await watsonRoute.translate(null, "per night", user_name) }`;
                    }
                    else
                    {
                        var hotel_price = ` ${ await watsonRoute.translate(null, "Price Not Provided", user_name) } `;
                    }

                    //Hotel informtion tab (Main Tab)
                    html += `
                    <div class='hotel-row'>
                        ${ preference_check }
                        <div class='hotel-column left'>
                            <div class="inner-left-text">
                                <div class='hotel-text'>
                                    <h3> ${hotel.hotel_name} </h3>
                                    <p><i class='fa fa-phone'></i> ${hotel.hotel_phone}</p>
                                    <p><i class='fa fa-location-arrow'></i>  ${hotel.hotel_address} </p>
                                    <span> ${hotel_price}</span>
                                </div>
                            </div>
                            <div class="inner-right-button">
                                <div class="read-more">`;

                                //Modal trigger for room information
                                if( hotel.room_details.length != 0 )
                                {
                                    html += `<button type='button' class='btn btn-sm btn-success' data-toggle='modal' data-target='#hotel_rooms${i}'> ${ await watsonRoute.translate(null, "Show Room Details", user_name) } </button>`;
                                }

                                //Modal trigger for hotel amenities
                                if( hotel.amenities_array.length != 0 )
                                {
                                    html += `<button type='button' class='btn btn-sm btn-success' data-toggle='modal' data-target='#hotel_amenities${i}'> ${ await watsonRoute.translate(null, "Show Hotel Amenities", user_name) } </button>`;
                                }

                                //Modal trigger for hotel image
                                if( hotel.hotel_image )
                                {
                                    html +=   `<button type='button' class='btn btn-sm btn-success' data-toggle='modal' data-target='#hotel_image${i}'> ${ await watsonRoute.translate(null, "Show Hotel's Lobby View", user_name) } </button>`;
                                }

                                html += `
                                </div>
                            </div>
                        </div>
                    </div>`;

                    //Modals Html

                    //Modal 1 (Hotel Rooms Details)
                    html += `
                    <div class='modal fade' id='hotel_rooms${i}' role='dialog' data-backdrop="false">
                        <div class='modal-dialog'>
                            <div class='modal-content'>
                                <div class='modal-header'>
                                    <button type='button' class='close' data-dismiss='modal'>&times;</button>
                                    <h4 class='modal-title'> ${hotel.hotel_name}'s ${ await watsonRoute.translate(null, "Room Details", user_name) } </h4>
                                </div>
                                <div class='modal-body'>
                                    <ul>`;

                                    if( hotel.room_details.length > 0 )
                                    {
                                        for (var j = 0; j < hotel.room_details.length; j++)
                                        {
                                            var room_details = hotel.room_details[j];

                                            //Room Type
                                            if( room_details.room_type )
                                            {
                                                var roomType = await watsonRoute.translate(null, room_details.room_type, user_name);
                                            }
                                            else
                                            {
                                                var roomType = `${ await watsonRoute.translate(null, "Not Provided", user_name) }`;
                                            }

                                            //Room Amenities
                                            var room_amenities = `<ul>`;
                                            for(var t = 0; t < room_details['room_amenities_list'].length; t++)
                                            {
                                                room_amenities += `<li> ${ await watsonRoute.translate(null, room_details['room_amenities_list'][t], user_name) } </li>`;
                                            }
                                            room_amenities += `</ul>`;

                                            //Card Details
                                            var card_details = `<ul>`;
                                            for(var t = 0; t < room_details['accepted_card_options'].length; t++)
                                            {
                                                card_details += `<li> ${ await watsonRoute.translate(null, room_details['accepted_card_options'][t], user_name) } </li>`;
                                            }
                                            card_details += `</ul>`;

                                            //Rate Plan Distribution
                                            if( room_details['rate_plan_distribution'].length > 0 )
                                            {
                                                var rate_plan = `
                                                <table class="table table-bordered"> 
                                                    <tr> 
                                                        <th> ${ await watsonRoute.translate(null, "From", user_name) } </th> 
                                                        <th> ${ await watsonRoute.translate(null, "To", user_name) } </th> 
                                                        <th> ${ await watsonRoute.translate(null, "Amount", user_name) } </th> 
                                                    </tr>`;

                                                for(var t = 0; t < room_details['rate_plan_distribution'].length; t++)
                                                {
                                                    rate_plan += `
                                                    <tr> 
                                                        <td> ${(room_details['rate_plan_distribution'][t].from_date).replace('-', '/').replace('-', '/') } </td>  
                                                        <td> ${ (room_details['rate_plan_distribution'][t].upto_date).replace('-', '/').replace('-', '/') } </td>  
                                                        <td> ${room_details['rate_plan_distribution'][t].amount } </td>  
                                                    </tr>`
                                                }

                                                rate_plan += `
                                                </table>`;
                                            }
                                            else
                                            {
                                                var rate_plan = `<p> Not Provided </p>`
                                            }

                                            if(invoke_source == "edit_pannel")
                                            {
                                                var check_in_date   =   ( hotel != undefined ) ? hotel.checkInDate.replace('-','/') : 'empty';
                                                var check_out_date  =   ( hotel != undefined ) ? hotel.checkOutDate.replace('-','/') : 'empty';

                                                var hotel_selection_button = `<button type="button" class="btn btn-sm btn-success room-button" data-dismiss='modal' 
                                                onclick="check_hotel_price('${room_details.rate_key_index}','${invoke_source}','${div_id}','${check_in_date}','${check_out_date}','${hotel.hotel_name}','${hotel.hotelCity}','${room_details.room_rate}');" > ${ await watsonRoute.translate(null, "Select", user_name) } </button>`;
                                            }
                                            else
                                            {
                                                var hotel_selection_button = `<button type="button" class="btn btn-sm btn-success room-button" data-dismiss='modal' onclick="check_hotel_price('${room_details.rate_key_index}','${invoke_source}','${div_id}');" > ${ await watsonRoute.translate(null, "Select", user_name) } </button>`;
                                            }

                                            //Hickory
                                            if( room_details.rate_plan_code && room_details.rate_plan_code === 'HFH' )
                                            {
                                                var hickory_icon_plan_code = `<span><img src='images/hickory.png'></span>`;
                                            }
                                            else
                                            {
                                                var hickory_icon_plan_code = ``;
                                            }
                                            
                                            html += `
                                            <table class='table table-condensed'>
                                                <tr>
                                                    <td> </td>
                                                    <td> ${hickory_icon_plan_code} </td>
                                                </tr>
                                                <tr> 
                                                    <td> ${ await watsonRoute.translate(null, "Room Type", user_name) } </td> 
                                                    <td> ${room_details.room_type} </td> 
                                                </tr> 
                                                <tr> 
                                                    <td> ${ await watsonRoute.translate(null, "Bed Type", user_name) } </td> 
                                                    <td> ${room_details.bed_type} </td> 
                                                </tr> 
                                                <tr> 
                                                    <td> ${ await watsonRoute.translate(null, "Fare", user_name) } </td> 
                                                    <td> $ ${room_details.room_rate} </td> 
                                                </tr> 
                                                <tr> 
                                                    <td> ${ await watsonRoute.translate(null, "Room Description", user_name) } </td> 
                                                    <td> ${room_details.room_description} </td> 
                                                </tr> 
                                                <tr> 
                                                    <td> ${ await watsonRoute.translate(null, "Room Amenities", user_name) } </td> 
                                                    <td> ${room_amenities} </td> 
                                                </tr> 
                                                <tr> 
                                                    <td> ${ await watsonRoute.translate(null, "Accepted Cards", user_name) } </td> 
                                                    <td> ${card_details} </td> 
                                                </tr> 
                                                <tr> 
                                                    <td> ${ await watsonRoute.translate(null, "Rate Distribution", user_name) } </td> 
                                                    <td> ${ rate_plan } </td> 
                                                </tr> 
                                                <tr> 
                                                    <td colspan="2"> ${hotel_selection_button} </td> 
                                                </tr> 
                                            </table>`;  
                                            
                                        }
                                    }
                                    else
                                    {
                                        html += `${ await watsonRoute.translate(null, "No room details available", user_name) }.`;
                                    }

                                    html += `
                                    </ul>
                                </div>
                                <div class='modal-footer'>
                                    <button type='button' class='btn btn-default' data-dismiss='modal'> ${ await watsonRoute.translate(null, "Close", user_name) } </button>
                                </div>
                            </div>
                        </div>
                    </div>`; 

                    //Modal 2 (Hotel amenities)
                    html += `
                    <div class='modal fade' id='hotel_amenities${i}' role='dialog' data-backdrop="false">
                        <div class='modal-dialog'>
                            <div class='modal-content'> 
                                <div class='modal-header'>
                                    <button type='button' class='close' data-dismiss='modal'>&times;</button>
                                    <h4 class='modal-title'> ${hotel.hotel_name}'s ${ await watsonRoute.translate(null, "Amenities", user_name) } </h4>
                                </div>
                                <div class='modal-body'>
                                    <ul>`;                
                                        if( hotel.amenities_array.length > 0 )
                                        {
                                            for( var k = 0; k < hotel.amenities_array.length; k++ )
                                            {
                                                html += `<li> ${await watsonRoute.translate(null, hotel.amenities_array[k], user_name)} </li>`;
                                            }
                                        }
                                        else
                                        {
                                            html += `${ await watsonRoute.translate(null, "No aminities provided", user_name) }.`;
                                        }
                                    html += `
                                    </ul>
                                </div>
                                <div class='modal-footer'>
                                    <button type='button' class='btn btn-default' data-dismiss='modal'> ${ await watsonRoute.translate(null, "Close", user_name) } </button>
                                </div>
                            </div>
                        </div>
                    </div>`;
                    
                    //Modal 3 (Hotel image view)
                    html += `
                    <div class='modal fade' id='hotel_image${i}' role='dialog' data-backdrop="false">
                        <div class='modal-dialog'>
                            <div class='modal-content'>
                                <div class='modal-header'>
                                    <button type='button' class='close' data-dismiss='modal'>&times;</button>
                                    <h4 class='modal-title'> ${hotel.hotel_name}'s ${ await watsonRoute.translate(null, "Lobbys View", user_name) } </h4>
                                </div>
                                <div class='modal-body'>
                                    <p> <img src="${hotel.hotel_image}" width="570" height="400" alt="Lobby View"> </p>
                                </div>
                                <div class='modal-footer'>
                                    <button type='button' class='btn btn-default' data-dismiss='modal'> ${ await watsonRoute.translate(null, "Close", user_name) } </button>
                                </div>
                            </div>
                        </div>
                    </div>`; 
                }
            html += `
            </div>`;        
        }

        // If no hotel found
        else
        {
            var button_details = ``;

            if(invoke_source == "edit_pannel")
            {
                button_details += `<button type='button' class='btn btn-default disableIt' onclick='nohotelfound_edit("yes","${div_id}"); disableButtons();'> ${ await watsonRoute.translate(null, "Yes", user_name) } </button> <button type='button' class='btn btn-default disableIt' onclick='nohotelfound_edit("no","${div_id}"); disableButtons();'> ${ await watsonRoute.translate(null, "No", user_name) } </button>`;
            }
            else if(invoke_source = "availability")
            {
                button_details += `<button type='button' class='btn btn-default disableIt' onclick='noAvailaablehotelfound("y_mknew"); disableButtons();'> ${ await watsonRoute.translate(null, "Yes", user_name) } </button> <button type='button' class='btn btn-default disableIt' onclick='noAvailaablehotelfound("n_mknew"); disableButtons();'> ${ await watsonRoute.translate(null, "No", user_name) } </button>`;
            }
            else
            {
                button_details += `<button type='button' class='btn btn-default disableIt' onclick='message("yes"); disableButtons();'> ${ await watsonRoute.translate(null, "Yes", user_name) } </button> <button type='button' class='btn btn-default disableIt' onclick='message("no"); disableButtons();'> ${ await watsonRoute.translate(null, "No", user_name) } </button>`;
            }

            html += `
            <div class='msg-row'>
                <div class='user-msg receive'>
                    <p> ${ await watsonRoute.translate(null, "No hotel found", user_name) } !  ${ await watsonRoute.translate(null, "Do you want to make new reservation", user_name) } ? </p>
                </div>
            </div>
            <div class='msg-row select'>
                <p>
                    ${button_details}
                </p> 
            </div>`;
        }

        return html;
    }
}

module.exports = HotelSearcResult;