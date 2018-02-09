"use strict"; //it's just how I roll

var imagesArray = []; //push images for preload
var ssContentArray = []; //Screen Steps content
var fgContentArray = []; //Fancy Grid content

//SS Functions
// On click thumbnail
function SSBlowUp(interaction,index){
	var imageTag =  "<img id='pop_image' src='" + ssContentArray[interaction][1][index][1] + "' alt='" + ssContentArray[interaction][1][index][3] + "'/>";
	$("#overlay_"+interaction).html("<div id='close'></div>" + imageTag + "<div id='caption_text'>"+ ssContentArray[interaction][1][index][0] +"</div>");
	if(ssContentArray[interaction][1][index][4] !== undefined){ //if max data-max-width-px set, set css attribute
		$('#pop_image').css({
			"height": ssContentArray[interaction][1][index][4]+"px",
		});
	}
	$("#overlay_"+interaction).fadeIn(400);
	var currentInteraction = $("#support_interaction_"+interaction);
	//Blur out background elements
	currentInteraction.find(".bullet_pane").addClass("blur_in");
	currentInteraction.find(".content_pane").addClass("blur_in_content_pane");
	currentInteraction.find(".support_intro").addClass("blur_in");
	currentInteraction.find(".support_outro").addClass("blur_in");
}

//On click full size, retract
function SSShrinkDown(interaction){
	$("#overlay_"+interaction).fadeOut(200, function(){
		var currentInteraction = $("#support_interaction_"+interaction);
		//Once overlay layer faded out, unblur bg elements
		currentInteraction.find(".bullet_pane").removeClass("blur_in");
		currentInteraction.find(".content_pane").removeClass("blur_in_content_pane");
		currentInteraction.find(".support_intro").removeClass("blur_in");
		currentInteraction.find(".support_outro").removeClass("blur_in");
	});
}

//On click list item
function SSSelection(interaction,index){ //When a li is clicked
	if(ssContentArray[interaction][1][index][1] !== null){ //If there is an image node draw thumbnail and add event listener for lightbox effect
		var imageTag =  "<img id='side_image' src='" + ssContentArray[interaction][1][index][1] + "' alt='" + ssContentArray[interaction][1][index][3] + "'/>";
		$("#content_pane_"+interaction).html("<div class='fader'><a onmousedown='SSBlowUp("+interaction+","+index+")' class='image_border'>" + imageTag + "</a></div>").find(".fader").fadeIn(400);
		if(ssContentArray[interaction][1][index][4] !== undefined){ //if max data-max-width-px set, set css attribute on image
			$('#side_image').css({"height": ssContentArray[interaction][1][index][4]+"px"});
		}
	}else{ //There is not an image node
		$("#content_pane_"+interaction).empty(); //No image, so empty prev value out of content pane
	}
	$("#list_bullet_"+interaction+"_"+index).removeClass("inactive active").addClass("active"); //Add active class to current selection
	if(CheckCompletion(ssContentArray,interaction,index)){ //Check if everything viewed, mark complete if required
		$("#support_outro_"+interaction).show(); //show outro message
	}
}

//SCORM Call if interaction marks complete
function CheckCompletion(theArray, interaction, index){
	theArray[interaction][1][index][2] = true; //Store visited state of this item
	var checkBit = true;
	for(var i=0; i<theArray[interaction][1].length; i++){ //Check to see if all pages have been viewed
		if(theArray[interaction][1][i][2] == false){ //At least one page has not been viewed
			checkBit = false;
			break;
		}
	}
	if(checkBit){//all nodes viewed, mark interaction complete if required and return true
		if(theArray[interaction][0] == "true"){//this interaction has been set to mark complete
			try{doMarkComplete();}catch(err){ //try marking complete if embedded directly within the page
				console.log("SCORM API not present on this page, trying parent..");
				try{parent.doMarkComplete();}catch(err){ //if failed, then maybe it's in iframe
					console.log("SCORM API not present on parent.  Not marked complete..");
				}
			}
		}
		return true;
	}
}

//FG Functions
function FGBlowUp(interaction,index){
	$("#fg_overlay_"+interaction).html("<div id='close' onmousedown='FGShrinkDown("+interaction+");'></div><div class='fg_content'>"+fgContentArray[interaction][1][index][1]+"</div>");
	$("#fg_overlay_"+interaction).fadeIn(400);
	var currentInteraction = $("#fancy_grid_"+interaction);
	//Blur out background elements
	currentInteraction.find(".grid_block_pane").addClass("blur_in");
	currentInteraction.find(".grid_content_pane").addClass("blur_in_content_pane");
	CheckCompletion(fgContentArray,interaction,index);
	$("#grid_block_item_" + interaction + "_" + index).addClass("answer_correct");
	
	//If there is a support interaction nested in here
	var nestedSupportHeight = $(".fg_content").find(".support_interaction").height();
	if(nestedSupportHeight != undefined){
		//console.log($(".fg_content").height());
		var initial_height = $(".fg_content").height()
		$(".fg_content").height(nestedSupportHeight);
		$(".fg_content").find(".support_interaction").css({
			"width":"100%",
			"height":"calc(100% - "+initial_height+"px)",
			"position":"relative",
			//"top":"50%",
			//"left":"50%",
			//"-webkit-transform":"translate(-50%,-50%)"
		});
	}
}

//On click full size, retract
function FGShrinkDown(interaction){
	$("#fg_overlay_"+interaction).fadeOut(200, function(){
		var currentInteraction = $("#fancy_grid_"+interaction);
		//Once overlay layer faded out, unblur bg elements
		currentInteraction.find(".grid_block_pane").removeClass("blur_in");
		currentInteraction.find(".grid_content_pane").removeClass("blur_in_content_pane");

	});
}

//Utilities
function isOdd(num){return num % 2;} //returns true if number is odd

//onready initialize interactions in this page/iframe
$(document).ready(function(){
	//Preload images
	$("img").each(function(){
		imagesArray.push(new Image());
		imagesArray[imagesArray.length-1].src = $(this).attr("src");
	});

	//Initialize Screen Steps Interaction
	$(".support_interaction").each(function(index){ //For each interaction on this page
		var currInteraction = $(this);
		var isMarkComplete = currInteraction.attr("data-mark-complete"); //Get mark complete status
		var tempArray = []; //Contains each interaction's elements
		var outroText = currInteraction.find(".support_outro").attr({"id":"support_outro_"+index}).detach(); //Remove outro text node so it can be added back at end
		currInteraction.attr({ //add unique id to this interaction
			"id":"support_interaction_"+index
		});
		currInteraction.find(".list_item").each(function(){ //find each list-item beneath this interaction
			var currentItem = $(this);
			tempArray.push([ //push into the ssContentArray
				currentItem.find(".list_title").html(), 					// [0] get title
				currentItem.find(".list_image").find("img").attr("src"), 	// [1] image src
				false,														// [2] has been visited
				currentItem.find(".list_image").find("img").attr("alt"),	// [3] alt text
				currentItem.find(".list_image").attr("data-image-height-px")]);// [4] max width attribute
		}).remove(); //remove this object from dom
		ssContentArray.push([isMarkComplete,tempArray]); //Push this node's contents into array
		currInteraction.append("<div id='bullet_pane_"+index+"' class='bullet_pane'></div>"); //add pane that will contain content
		currInteraction.append(outroText); //Add closing text back
		currInteraction.append("<div id='content_pane_"+index+"' class='content_pane'></div><div id='overlay_"+index+"' class='overlay' onmousedown='SSShrinkDown("+index+");'></div>"); //finally, add content pane
		for(var i=0; i<ssContentArray[index][1].length; i++){ //For each list item, draw corresponding <li>
			$('#bullet_pane_'+index).append("<div id='list_bullet_"+index+"_"+i+"' class='list_bullet inactive' onmousedown='SSSelection("+index+","+i+")'>" + ssContentArray[index][1][i][0] + "</div>");
		};
	});//.fadeIn("fast"); //All elements drawn, so show the stage (removed hidden state to allow easier edit)
	
	//Initialize Fancy Grid Interaction
	$(".fancy_grid").each(function(index){ //For each interaction on this page
		var currInteraction = $(this);
		var isMarkComplete = currInteraction.attr("data-mark-complete"); //Get mark complete status
		var tempArray = []; //Contains each interaction's elements
		
		currInteraction.attr({ //add unique id to this interaction
			"id":"fancy_grid_"+index
		});
		currInteraction.find(".grid_item").each(function(){ //find each list-item beneath this interaction
			var currentItem = $(this);
			tempArray.push([currentItem.find(".grid_block").html(),currentItem.find(".grid_content").html(), false]); //push into the ssContentArray
			// [0] block image and title
			// [1] block content
			// [2] has been visited
		}).remove(); //remove this object from dom
		fgContentArray.push([isMarkComplete,tempArray]); //Push this node's contents into array
		
		currInteraction.append("<div id='grid_block_pane_"+index+"' class='grid_block_pane'></div><div id='fg_overlay_"+index+"' class='fg_overlay'></div>"); //add pane that will contain content
		
		var numItems = fgContentArray[index][1].length;
		for(var i=0; i<numItems; i++){ //For each list item, draw corresponding <li>
			$('#grid_block_pane_'+index).append("<div id='grid_block_item_"+index+"_"+i+"' class='grid_block' onmousedown='FGBlowUp("+index+","+i+")'>" + fgContentArray[index][1][i][0] + "</div>");
		};
		
		var isTall = false; //Is this a single or double stacked row
		if(!isOdd(numItems) && numItems >2){ //if there even number of items and there are more than 2, create a second row on render
			isTall = true; //is tall
			$('#grid_block_pane_'+index).css({
				"width": (((numItems/2)*170)-40)+"px",
				"height": "335px"
			});
		}else{ //There is only a single row
			$('#grid_block_pane_'+index).css({
				"width": ((numItems*170)-40)+"px",
				"height": "170px"
			});
		}
		var currXposition = 0; //Hold x position so that we can change starting x coord on second row
		for(var i=0; i<numItems; i++){
			var topDist = 0; //First row of items has 0 top position
			if(i == numItems/2 && numItems > 2){ //Starting second row so reset X position
				currXposition = 0;
			}
			if(isTall && i >= (numItems/2)){ //second row, so change top to 180px
				topDist = 180;
			}
			$("#grid_block_item_"+index+"_"+i).css({
				"left": (currXposition*170)+"px",
				"top": topDist+"px"
			});
			currXposition++;
		}
	});//.fadeIn("fast"); //All elements drawn, so show the stage (removed hidden state to allow easier edit)
});