document.addEventListener("DOMContentLoaded",
    function (){
        //console.log(document.cookie);
        var cellCount = 3;
        var selectedIndex = 2;
        var slideIndi=[1,9,1];
        var indicators;
        var event_link;
        var home_link;
        var about_link;
        var contact_link;
        var program_link;
        var live_past="live";
        function carousel_rotate(PrevNext){
            if (PrevNext==="next"){
                var nextCell = document.querySelector('.carousel-cell:nth-child('+selectedIndex+')');
                var currCell = document.querySelector('.carousel-cell:nth-child('+(selectedIndex-1)+')');
                nextCell.style.transform = "rotateY(0deg) translateZ(56vw) translateX(0)"; 
                currCell.style.transform = "rotateY(20deg) translateZ(26vw) translateX(-50vw)";

                slideIndi[selectedIndex-1]=9;
                slideIndi[selectedIndex-2]=1;
                indicators.style["grid-template-columns"] = slideIndi[0]+'fr '+slideIndi[1]+'fr '+slideIndi[2]+'fr';
            }
            if (PrevNext==="prev"){
                var prevCell = document.querySelector('.carousel-cell:nth-child('+selectedIndex+')');
                var currCell = document.querySelector('.carousel-cell:nth-child('+(selectedIndex+1)+')');
                prevCell.style.transform = "rotateY(0deg) translateZ(56vw) translateX(0)"; 
                currCell.style.transform = "rotateY(-20deg) translateZ(26vw) translateX(50vw)";

                slideIndi[selectedIndex-1]=9;
                slideIndi[selectedIndex]=1;
                indicators.style["grid-template-columns"] = slideIndi[0]+'fr '+slideIndi[1]+'fr '+slideIndi[2]+'fr';
            }
        }

        var fixing_navbar = function(){
            var home=document.querySelector("#home");
            home.setAttribute("homeornot","not");
        }
        var refixing_navbar = function(){
            var home=document.querySelector("#home");
            home.setAttribute("homeornot","home");
        }
        // Convenience function for inserting innerHTML for 'select'
        var insertHtml = function (selector, html) {
            var targetElem = document.querySelector(selector);
            targetElem.innerHTML = html;
        };
        var insertProperty = function (string, propName, propValue) {
            var propToReplace = "{{" + propName + "}}";
            string = string.replace(new RegExp(propToReplace, "g"), propValue);
            return string;
        };

        var event_carousel = function(){
            $ajaxUtils.sendGetRequest("data/events.json", function(eventsJson){
                $ajaxUtils.sendGetRequest("snippets/snippet_carousel.html", function(evenCarHtml){
                    var finalHtml="";
                    //console.log("eventJson value is ",eventsJson);
                    for (var i=eventsJson.length-1; i>eventsJson.length-4; i--){
                        var temp_evenCarHtml = evenCarHtml;
                        temp_evenCarHtml=insertProperty(temp_evenCarHtml,"eventName",eventsJson[i].eventName);

                        var event_date = new Date(eventsJson[i].date+", "+eventsJson[i].time);
                        var curr_date = new Date();
                        
                        if (event_date>=curr_date){
                            temp_evenCarHtml=insertProperty(temp_evenCarHtml,"buttonStart","");
                            temp_evenCarHtml=insertProperty(temp_evenCarHtml,"buttonEnd","");
                        }
                        else{
                            temp_evenCarHtml=insertProperty(temp_evenCarHtml,"buttonStart",'<button style="border: none; margin: 0; padding: 0; background-color: rgba(255, 255, 255, 0);">');
                            temp_evenCarHtml=insertProperty(temp_evenCarHtml,"buttonEnd",'</button>');
                        }
                        
                        finalHtml+=temp_evenCarHtml;
                    }
                    insertHtml(".event-carousel",finalHtml);
                    var carousel_events = document.querySelectorAll(".event-carousel .carousel-cell");
                    //console.log(carousel_events,event_date,curr_date)
                    for (var j=0; j<carousel_events.length; j++){
                        carousel_events[j].addEventListener("click",event_registration);
                    }


                }, false);
            });
        }

        var event_registration = function (){
            var selectedEventName = this.id;
            $ajaxUtils.sendGetRequest("data/events.json",
                function(resJson){
                    var selectedEventDetails;
                    for (var i=0; i<resJson.length; i++){
                        if (resJson[i].eventName===selectedEventName){
                            selectedEventDetails=resJson[i];
                            break;
                        }
                    }
                    //console.log(selectedEventDetails);
                    $ajaxUtils.sendGetRequest("snippets/snippet_event_registration.html",
                        function(res){
                            var final_html=res;
                            for (bit in selectedEventDetails){
                                final_html = insertProperty(final_html,bit,selectedEventDetails[bit]);
                            }
                            insertHtml("#snippet-adder",final_html);
                            fixing_navbar();
                            defining_links();
                            logo_link();
                            document.querySelector("#event-registration-back-logo").addEventListener("click",eventsDisplay);
                            document.querySelector("#event-registration-back-button").addEventListener("click",eventsDisplay);
                        },
                    false);
                }
            );
        }

        var events_lister = function(whichButton){
            var live_button=document.querySelector("#live-past_events #live-events");
            var past_button=document.querySelector("#live-past_events #past-events");
            if (whichButton==="live-events"){
                live_past="live";
                live_button.style["background"]="#F7DE60";
                live_button.style["color"]="rgba(51, 51, 51, 1)";
                
                past_button.style["background"]="#12191D";
                past_button.style["color"]="rgba(255, 255, 255, 0.5)";
            }
            else if (whichButton==="past-events"){
                live_past="past";
                past_button.style["background"]="#F7DE60";
                past_button.style["color"]="rgba(51, 51, 51, 1)";
                
                live_button.style["background"]="#12191D";
                live_button.style["color"]="rgba(255, 255, 255, 0.5)";
            }
            $ajaxUtils.sendGetRequest("data/events.json",
                function(resJson){
                    var final_html="";
                    $ajaxUtils.sendGetRequest("snippets/snippet_event_display.html",
                        function(event_temp){
                            for (var i=0; i<resJson.length; i++){
                                //console.log(resJson[i].date_time);
                                if (resJson[i].eventName.toLowerCase().indexOf(document.querySelector("#search-bar #search-input").value.toLowerCase()) !== -1){
                                    var event_date = new Date(resJson[i].date+", "+resJson[i].time);
                                    var curr_date = new Date();
                                    if (live_past==="live" && event_date>=curr_date){
                                        var event_temp_temp = insertProperty(event_temp,"eventName",resJson[i].eventName);
                                        event_temp_temp = insertProperty(event_temp_temp,"buttonStart",'');
                                        final_html+=insertProperty(event_temp_temp,"buttonEnd",'');
                                    }
                                    else if (live_past==="past" && event_date<curr_date){
                                        var event_temp_temp = insertProperty(event_temp,"eventName",resJson[i].eventName);
                                        event_temp_temp = insertProperty(event_temp_temp,"buttonStart",'<button style="border: none; margin: 0; padding: 0; background-color: rgba(255, 255, 255, 0);">');
                                        final_html+=insertProperty(event_temp_temp,"buttonEnd",'</button>');
                                    }
                                }                            
                            }
                            insertHtml("#events-view #events",final_html);
                            
                            var event_list=document.querySelectorAll("#events div img");
                            if (event_list.length==0){
                                document.querySelector("#events-view #events").style.display="block";
                                insertHtml("#events-view #events","<div id='no-events-found'>No events found</div>");
                            }
                            else{
                                document.querySelector("#events-view #events").style.display="grid";
                                if (live_past==="live"){
                                    for (var j=0; j<event_list.length; j++){
                                        event_list[j].addEventListener("click",event_registration);
                                    }
                                }
                                // else if (live_past==="past"){
                                //     for (var j=0; j<event_list.length; j++){
                                //         // event_list[j].addEventListener("click",event_glimpses);
                                //     }
                                // }
                            }
                            
                        },
                    false);                                                      
                }
        )}

        function liveHandler(){
            document.querySelector("#live-past_events #live-events").setAttribute("changeOnHover","0");
            events_lister("live-events");
            document.querySelector("#live-past_events #past-events").setAttribute("changeOnHover","1");
        }
        function pastHandler(){
            document.querySelector("#live-past_events #past-events").setAttribute("changeOnHover","0");
            events_lister("past-events");
            document.querySelector("#live-past_events #live-events").setAttribute("changeOnHover","1");
        }

        var eventsDisplay = function(){
            //console.log("Listened");
            $ajaxUtils.sendGetRequest("snippets/snippet_events.html",
                function(res1){
                    insertHtml("#snippet-adder",res1);
                    define_buttons();
                    fixing_navbar();
                    defining_links();
                    logo_link();
                    event_carousel();
                    event_link.style.color="rgba(247, 222, 96, 1)";
                    event_link.style["text-decoration-line"]="underline";
                    event_link.style["text-decoration"]="rgba(247, 222, 96, 1) underline !important";
                    event_link.style["text-underline-offset"]="0.8rem";
                    document.querySelector("body").style.background="rgba(19, 28, 33, 0.99)";
                    document.querySelector("#search-bar #search-input").addEventListener("input",events_lister);
                    document.querySelector("#live-past_events #live-events").addEventListener("click",liveHandler);
                    document.querySelector("#live-past_events #past-events").addEventListener("click",pastHandler);
                    if (live_past==="live"){
                        liveHandler();
                    }
                    else pastHandler();
                    events_lister();
                    
                },
            false);
        }
        var homeDisplay = function(){
            $ajaxUtils.sendGetRequest("/",
                function(res){
                    //console.log(res);
                    insertHtml("#snippet-adder",res);
                    define_buttons(true);
                    refixing_navbar();
                    defining_links();
                    logo_link();
                    home_link.style.color="rgba(247, 222, 96, 1)";
                    home_link.style["text-decoration-line"]="underline";
                    home_link.style["text-decoration"]="rgba(247, 222, 96, 1) underline !important";
                    home_link.style["text-underline-offset"]="0.8rem";
                    document.querySelector("body").style.background="white";
                    event_carousel();
                },
            false);
        }

        var logo_link = function(){
            document.querySelector("#home .navbar-brand img").addEventListener("click",homeDisplay);
        }
        logo_link();

        var contactDisplay = function(){
            $ajaxUtils.sendGetRequest("snippets/snippet_contact.html",
                function(res){
                    insertHtml("#snippet-adder",res);
                    fixing_navbar();
                    defining_links();
                    logo_link();
                    contact_link.style.color="rgba(247, 222, 96, 1)";
                    contact_link.style["text-decoration-line"]="underline";
                    contact_link.style["text-decoration"]="rgba(247, 222, 96, 1) underline !important";
                    contact_link.style["text-underline-offset"]="0.8rem";

                    document.querySelector("#contact-us").style.background="rgba(19, 28, 33, 0.99)";
                    document.querySelector("#contact-us hr").style.color="white";
                    document.querySelector("body").style.background="rgba(19, 28, 33, 0.99)";
                    var contactSubheading = document.querySelector("#contact-us h3");
                    contactSubheading.style.color = "white";

                },
            false);
        }

        var aboutDisplay = function(){
            $ajaxUtils.sendGetRequest("snippets/snippet_about.html",
                function(res){
                    insertHtml("#snippet-adder",res);
                    fixing_navbar();
                    defining_links();
                    logo_link();
                    about_link.style.color="rgba(247, 222, 96, 1)";
                    about_link.style["text-decoration-line"]="underline";
                    about_link.style["text-decoration"]="rgba(247, 222, 96, 1) underline !important";
                    about_link.style["text-underline-offset"]="0.8rem";
                    document.querySelector("body").style.background="rgba(19, 28, 33, 0.99)";
                    document.querySelector("#under-aboutus").style.color="white";
                    document.querySelector("div#main-2-text h3").style.color="white";
                    document.querySelector("div#main-2-text p").style.color="white";
                    document.querySelector("div#main-2").style.background="rgba(19, 28, 33, 0.99)";
                    $ajaxUtils.sendGetRequest("data/senior_members.json", function(sMemJson){
                        $ajaxUtils.sendGetRequest("snippets/snippet_about_senior_team.html", function(sastHtml){
                            var final_html='';
                            for (var i=0; i<sMemJson.length; i++){
                                var temp_sastHtml = sastHtml;
                                temp_sastHtml=insertProperty(temp_sastHtml,"name",sMemJson[i].Name);
                                temp_sastHtml=insertProperty(temp_sastHtml,"post",sMemJson[i].postHolder);
                                temp_sastHtml=insertProperty(temp_sastHtml,"branch_year",sMemJson[i].branch_year);
                                temp_sastHtml=insertProperty(temp_sastHtml,"linkedin_id",sMemJson[i].linkedinID);
                                temp_sastHtml=insertProperty(temp_sastHtml,"insta_id",sMemJson[i].instaID);
                                temp_sastHtml=insertProperty(temp_sastHtml,"email_id",sMemJson[i].emailID);
                                if (sMemJson[i].developer==="true"){
                                    temp_sastHtml=insertProperty(temp_sastHtml,"developed_by",'<div class="developed-by">Developed By</div>');
                                    temp_sastHtml=insertProperty(temp_sastHtml,"developer_attr",'developer="true"');
                                }
                                else{
                                    temp_sastHtml=insertProperty(temp_sastHtml,"developed_by",'');
                                    temp_sastHtml=insertProperty(temp_sastHtml,"developer_attr",'');
                                }
                                final_html+=temp_sastHtml;
                            }
                            insertHtml("#team #team-members", final_html);
                        }, false);
                    });

                    $ajaxUtils.sendGetRequest("data/members.json", function(memJson){
                        var rjHtml="";
                        var evmHtml="";
                        var techHtml="";
                        $ajaxUtils.sendGetRequest("snippets/snippet_about_team.html", function(memHtml){
                            for (var i=0; i<memJson.length; i++){
                                var temp_memHtml=memHtml;
                                if (memJson[i].department==="RJ"){
                                    temp_memHtml=insertProperty(temp_memHtml,"Name",memJson[i].Name);
                                    temp_memHtml=insertProperty(temp_memHtml,"position",memJson[i].position);
                                    rjHtml+=temp_memHtml;
                                }
                                else if (memJson[i].department==="EVM"){
                                    temp_memHtml=insertProperty(temp_memHtml,"Name",memJson[i].Name);
                                    temp_memHtml=insertProperty(temp_memHtml,"position",memJson[i].position);
                                    evmHtml+=temp_memHtml;
                                }
                                else{
                                    temp_memHtml=insertProperty(temp_memHtml,"Name",memJson[i].Name);
                                    temp_memHtml=insertProperty(temp_memHtml,"position",memJson[i].position);
                                    techHtml+=temp_memHtml;
                                }
                            }
                            insertHtml("#members-RJ",rjHtml);
                            insertHtml("#members-EVM",evmHtml);
                            insertHtml("#members-TECH",techHtml);
                        },false);
                    })
                },
            false);
        }

        function recordingsDispAreaActive(dispArea){
            dispArea.setAttribute("active","1");
            // dispArea.style["background-color"] = "rgba(19, 28, 33, 0.99)";
            // dispArea.style["height"]="90vh";
            // dispArea.style["width"]="90vw";
            // dispArea.style["position"] = "fixed";
            // dispArea.style["top"] = "5vh";
            // dispArea.style["left"] = "5vw";
            // dispArea.style["z-index"] = "99";
            // dispArea.style["box-shadow"] = "0px 0px 100vw 100vw rgb(0 0 0 / 71%)";
            // dispArea.style["border-radius"] = "1rem";
        }

        function recordingsDispAreaDisable(){
            var dispArea = document.querySelector(".program .description div#"+this.id);
            dispArea.setAttribute("active","0");
            // dispArea.style["background-color"] = "rgba(255, 255, 255, 0.000)";
            // dispArea.style["height"]="0";
            // dispArea.style["width"]="0";
            // dispArea.style["box-shadow"] = "none";
        }

        function recordingsDisplay(){
            var program_name=this.id;
            var dispArea = document.querySelector(".program .description div#"+program_name);
            //console.log(dispArea);
            recordingsDispAreaActive(dispArea);
            var closeBtn = document.querySelector(".program .description div#"+program_name+" button");
            closeBtn.addEventListener("click",recordingsDispAreaDisable);
        }


        function defining_links(){
            //console.log("Links Defined");
            event_link = document.querySelector("#evn-link");
            event_link.addEventListener("click", eventsDisplay);

            home_link = document.querySelector("#hom-link");
            home_link.addEventListener("click", homeDisplay);

            about_link = document.querySelector("#abt-link");
            about_link.addEventListener("click",aboutDisplay);

            contact_link = document.querySelector("#con-link");
            contact_link.addEventListener("click",contactDisplay);

            program_link = document.querySelector("#prg-link");
        }
        defining_links();


        function define_buttons(viewAllPresent){
            indicators=document.querySelector("div.indicators");
            var prevButton = document.querySelector('.bi-chevron-compact-left');
            prevButton.addEventListener('click', function() {
                selectedIndex--;
                if (selectedIndex<1){
                    selectedIndex=1;
                }
                //console.log(selectedIndex);
                carousel_rotate("prev");
            });

            var nextButton = document.querySelector('.bi-chevron-compact-right');
            nextButton.addEventListener('click', function() {
                selectedIndex++;
                if (selectedIndex>cellCount){
                    selectedIndex=3;
                }
                //console.log(selectedIndex);
                carousel_rotate("next");
            });
            if (viewAllPresent){
                var viewAllButton = document.querySelector("#events-view #view-all");
                //console.log(viewAllButton);
                viewAllButton.addEventListener("click",eventsDisplay);
            }
        }

        var define_footer_links = function(){
            document.querySelector("#f-hom-link").addEventListener("click",homeDisplay);
            document.querySelector("#f-abt-link").addEventListener("click",aboutDisplay);
            document.querySelector("#f-evn-link").addEventListener("click",eventsDisplay);
            document.querySelector("#f-con-link").addEventListener("click",contactDisplay);
        }
        define_footer_links();

        if (document.querySelector("#glimpses")){
            defining_links();
            fixing_navbar();
            logo_link();
            document.querySelector("body").style.background="rgba(19, 28, 33, 0.99)";
            event_link.style.color="rgba(247, 222, 96, 1)";
            event_link.style["text-decoration-line"]="underline";
            event_link.style["text-decoration"]="rgba(247, 222, 96, 1) underline !important";
            event_link.style["text-underline-offset"]="0.8rem";
            
            document.querySelector("#glimpses-back-logo").addEventListener("click",eventsDisplay);
            document.querySelector("#glimpses-back-button").addEventListener("click",eventsDisplay);
        }
        else if(document.querySelector("#programs")){
            fixing_navbar();
            defining_links();
            logo_link();
            program_link.style.color="rgba(247, 222, 96, 1)";
            program_link.style["text-decoration-line"]="underline";
            program_link.style["text-decoration"]="rgba(247, 222, 96, 1) underline !important";
            program_link.style["text-underline-offset"]="0.8rem";
            document.querySelector("body").style.background="rgba(19, 28, 33, 0.99)";

            var recordingBtns = document.querySelectorAll(".program .description button.recordings-audios.present");
            //console.log("Recording Buttons: ",recordingBtns);
            for (var i=0; i<recordingBtns.length; i++){
                recordingBtns[i].addEventListener("click",recordingsDisplay);
            }
        }
        else{
            define_buttons(true);
            event_carousel();
        }
    }
);