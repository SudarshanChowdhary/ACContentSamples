"use strict";
var xmlData;
var imagesArray = [];
var selectedItem = 0;

$(document).ready(function() {
	$.ajax({
        type: "GET",
        url: "data.xml",
        dataType: "xml",
        success: function(xml){
            xmlData = $(xml);
            Init();
        },
        error: function(error){
            alert("Failed to load the interaction.");
        }
    });
});

function Init(){
	//Draw DOM
	$("#looped_slider").append("\
		<div id='thumbnail_bar'> \
			<div id='thumbnails_flex'></div> \
		</div>\
		<div id='image_pane' role='tabpanel' aria-label='Slide'></div> \
		<div id='controls'>\
			<div id='prev_but' class='prev' role='button' aria-label='Previous Button'></div>\
			<div id='next_but' class='next' role='button' aria-label='Next Button'></div>\
		</div>");
	$(xmlData).find("image").each(function(index){
		var tempFilename = $(this).attr("file");
		var tempAlt = $(this).find("altText").text();
		var tempCaption = $(this).find("caption").text();
		imagesArray.push([tempFilename,tempAlt,tempCaption]);
	});

	for(var i=0; i<imagesArray.length; i++){
		$("#thumbnails_flex").append("<div class='thumbnail_container' id='thumb_"+i+"' data-image-num='"+i+"'><img id='thumb_img_"+i+"' src='"+imagesArray[i][0]+"' class='thumbnail_image' alt=''/></div>").attr({"role":"tablist"});
		$("#thumb_"+i).on("click keydown", function(event){
			ItemSelect(Number($(this).attr("data-image-num")),event);	
		}).attr({
			"aria-label":"Slide " + i,
			"role":"tab"
		});
	}
	
	$("#prev_but").on("click keydown",function(event){
		if(selectedItem == 0){ 
			ItemSelect(imagesArray.length-1, event);
		}else{
			ItemSelect(selectedItem-1, event);
		}
	}).attr({
		"aria-label":"Previous Button",
		"tabindex":"0"
	});
	
	$("#next_but").on("click keydown",function(event){
		if(selectedItem == imagesArray.length - 1){ 
			ItemSelect(0, event);
		}else{
			ItemSelect(selectedItem+1, event);
		}
	}).attr({
		"aria-label":"Next Button",
		"tabindex":"0"
	});
	
	$(window).resize(function(){
		ItemSelect(selectedItem); //Redraw the caption boxes and stuff on resize
	});
	//Select frist item for init
	ItemSelect(0);
}

function ItemSelect(itemNum, event){
	var changeSelection = true;
	//console.log(event.target);
	if(arguments.length > 1){ //tis was fired by pressing on thumbnail
		if(event.type == "keydown"){ //Event fired using keyboard
			//console.log($(event.target));
			var tempItem = Number($(event.target).attr("data-image-num"));
			switch(event.keyCode){
				// ENTER / SPACE
				case 13:
				case 32:
					event.preventDefault();
					event.stopPropagation();
					break;
				// RIGHT / DOWN
				case 39:
				case 40:
					event.preventDefault();
					event.stopPropagation();
					if(tempItem == (imagesArray.length - 1)){
						itemNum = 0;
					}else{
						itemNum++;
					}
					$("#thumb_"+itemNum).focus();
					break;
				// LEFT / UP
				case 37:
				case 38:
					event.preventDefault();
					event.stopPropagation();
					
					if(tempItem == 0){
						itemNum = (imagesArray.length - 1);
					}else{
						itemNum--;
					}
					$("#thumb_"+itemNum).focus();
					break;
				// TAB
				case 32:
					event.preventDefault();
					event.stopPropagation();
					changeSelection = false; //dont't change selection when tabbed through hit
					break;
				// keypress is not case, exit
				default:
					return false;
			}
		}
	}
	
	if(changeSelection){
		selectedItem = itemNum; //save current item to root
		$("#image_pane").html("<div aria-labelledby='caption' id='image_group'><img src='" + imagesArray[itemNum][0] + "' alt='" + imagesArray[itemNum][1] +"' class='main_image'/><div id='caption_bar'><div id='caption'></div></div></div>");
		$(".thumbnail_container").each(function(){
			$(this).removeClass("selected_thumb").attr({
				"tabindex":"-1",
				"aria-selected":"false",
				"aria-expanded":"false"
			}).removeAttr("aria-controls").find("img").removeClass("img_shadow");
		});
		$("#thumb_"+itemNum).addClass("selected_thumb").attr({
			"tabindex":"0",
			"aria-selected":"true",
			"aria-controls":"image_pane",
			"aria-expanded":"true"
		}).find("img").addClass("img_shadow");
		$("#caption").html(imagesArray[itemNum][2]); //set text caption
		
		//Calculate the height of the image_group and elements
		var captionHeight = $("#caption").height();
		var windowHeight = $(window).height();
		var captionBarHeight = 50;
		
		if(captionHeight > 50){
			$("#caption_bar").css("height", captionHeight+"px")
			captionBarHeight = captionHeight;
		}
		var calcHeight = windowHeight - captionBarHeight - 140; //140 is the height of the thumbnail bar + image group + top/bottom padding
		
		$("#image_group").css("height", calcHeight + "px");
		
		//Add counters on buttons
		var prevItem = itemNum;
		var nextItem = itemNum + 2;
		var totalItems = imagesArray.length;
		
		if(itemNum == 0){
			prevItem = totalItems;
		}else if(itemNum == totalItems-1){
			nextItem = 1;
		}
		
		$("#prev_but").html("<span class='visually_hidden'>Previous (Slide " + prevItem + " of " + totalItems + ")</span>");
		$("#next_but").html("<span class='visually_hidden'>Next (Slide " + nextItem + " of " + totalItems + ")</span>");
	}
}