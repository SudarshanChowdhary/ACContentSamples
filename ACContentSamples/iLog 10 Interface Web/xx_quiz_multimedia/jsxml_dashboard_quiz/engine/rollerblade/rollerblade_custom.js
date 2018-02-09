(function () {

	var Rollerblade = (function(){

		function Rollerblade(element, options) {

			var _ = this;

			_.settings = $.extend($.fn.rollerblade.defaults, options);
			_.container = $(element);
			_.image = _.container.find('img');
			_.oldX = 0;
			_.oldDiff = null; 
			_.lastMove = "none";
			_.lastMoveConstant = "none";
			_.previousX = 0;
			_.i = 0;
			_.iAuto = 0;
			_.sensitivity = _.settings.sensitivity;
			_.mobileRate = _.settings.sensitivity / 3;
			_.images = _.settings.imageArray;
            _.onSpin = _.settings.onSpin;
            _.onSpinStart = _.settings.onSpinStart;
            _.onSpinStop = _.settings.onSpinStop;
			_.preloadImages = [];
			_.timer = null;
			_.touchOnThis = false;
			_.init();
		}

		Rollerblade.prototype.init = function() {

			var _ = this;

			if (_.settings.auto === true) {

				_.auto(_.sensitivity);
				
			} else {
				// Test for smartphone browser. 
				// Source : http://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-handheld-device-in-jquery
				if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		 			_.touchIsMoving();
				} else if(_.settings.drag === true ){
					_.drag();
					_.image.addClass('rollerblade-drag');
				} else if (_.settings.drag === false) {
					_.mouseIsMoving();
				}
			}
			_.preload(_.images);

		}

		Rollerblade.prototype.preload = function(imageArray) {

			var _ = this;

			if (!_.preloadImages.list) {
		        _.preloadImages.list = [];
		    }
		    for (var i = 0; i < imageArray.length; i++) {
		        var img = new Image();
		        img.onload = function() {
		            var index = _.preloadImages.list.indexOf(this);
		            if (index !== -1) {
		                // remove this one from the array once it's loaded
		                // for memory consumption reasons
		                _.preloadImages.splice(index, 1);
		            }
		        }
		        _.preloadImages.list.push(img);
		        img.src = imageArray[i];
		    }

		}

		Rollerblade.prototype.increment = function() {

			var _ = this;

			_.iAuto++;

			if (_.iAuto >= _.images.length) {
				_.iAuto = 0;
			}

            _.image.attr('src', _.images[_.iAuto]);
            
            // Custom set parent tracker
            _.container.data("image_number", _.iAuto+1);
			
		}

		Rollerblade.prototype.decrement = function() {

			var _ = this;
	
			_.iAuto--;

			if (_.iAuto < 0) {
				_.iAuto = _.images.length -1;
			}

            _.image.attr('src', _.images[_.iAuto]);
            
            // Custom set parent tracker
            _.container.data("image_number", _.iAuto+1);
			
		}

		Rollerblade.prototype.auto = function(speed) {

			var _ = this;

			_.timer = setInterval(function() {

				_.iAuto++;

				if (_.iAuto >= _.images.length) {
					_.iAuto = 0;
				}
                _.image.attr('src', _.images[_.iAuto]);
                
                // Custom set parent tracker
                _.container.data("image_number",  _.iAuto+1);
				
			}, speed);
		}

		Rollerblade.prototype.autoStop = function() {

			var _ = this;

			 clearInterval(_.timer);
		}

		Rollerblade.prototype.drag = function() {

			var _ = this;
			var dragging = false;

			document.ondragstart = function () { return false; };

			_.image.mousedown(function(e) {
				e.preventDefault;
				if (!dragging) {
					dragging = true;
                    
                    // Custom
                    _.onSpinStart();
				}
			});

			$("body").mousemove(function(e) {
				e.preventDefault;
				if (dragging) {
					var xcoord = e.clientX;
                    
					_.changeLogic(xcoord, _.sensitivity);
                    
                    // Custom
                    _.onSpin();
                    
				}
			});

			$("body").mouseup(function(e) {
				e.preventDefault;
				if(dragging) {
					dragging = false;
                    
                    // Custom
                    _.onSpinStop();
				}
			});
		}


		Rollerblade.prototype.mouseIsMoving = function() {

			var _ = this;

			$("body").mousemove(function(e) {

				var xcoord = e.pageX;
				var deviceRate = _.sensitivity;

				_.changeLogic(xcoord, deviceRate);

			});
		}

		Rollerblade.prototype.touchIsMoving = function() {

			var _ = this;

			_.container.on('touchstart', function() {

				_.touchOnThis = true;

			});

			$(window).on('touchmove', function(ev) {

				var e = ev.originalEvent;
				var xcoord = e.pageX;
				var deviceRate = _.mobileRate;

				if (_.touchOnThis) {
					
					_.changeLogic(xcoord, deviceRate);
				}
				

			});

			$(window).on('touchend', function() {
				_.touchOnThis = false;
			});
		}

		Rollerblade.prototype.changeLogic = function(xcoord, deviceRate) {

			var _ = this;

			if(_.oldDiff === null) {
			// If this is the first move, set _.oldDiff to
			// the current x coordinate and call the rotate method
			// at this current coordinate.
			_.oldDiff = xcoord;
			_.rotate(xcoord);

			}

			// Set the last direction moved for use in the
			// conditionals below.
			if( xcoord > _.oldDiff ) {
				_.lastMoveConstant = 'right';
			} else if (xcoord < _.oldDiff ) {
				_.lastMoveConstant = 'left';
			};
			

			if ( xcoord > _.previousX && _.lastMoveConstant === 'left' ) {
				// If moving right AND the last move was to the left, reset
				// oldDiff to current x position and iterate i by 1 to fix
				// image repition bug.

				_.oldDiff = xcoord;
				_.i++;
				

			} else if ( xcoord < _.previousX && _.lastMoveConstant === 'right' ) {
				// If moving left AND the last move was to the right, reset
				// oldDiff to current x position and de-iterate i by 1 to fix
				// image repition bug.

				_.oldDiff = xcoord;
				_.i--;
			
			}

			// Only call the rotate method when amount of pixels traveled
			// is greater than the specified rate.
			if (Math.abs(xcoord - _.oldDiff) > deviceRate) {

				_.rotate(xcoord);

				_.oldDiff = xcoord;
			}

			_.previousX = xcoord;

		}

		Rollerblade.prototype.rotate = function(xcoord) {

			var _ = this;

			if(xcoord > _.oldX) {
				// moving right.

				if(_.lastMove === 'left') {
					// Fixes glitch when changing directions.
					_.i++;
				} 

				if(_.i > _.images.length) {
					if (!_.settings.edgeStop) {
						_.i = 0;
					} else {
						_.i = _.images.length;
					}
				}

                _.image.attr('src', _.images[_.i]);
                
                // Custom set parent tracker
                _.container.data("image_number", _.i+1);

				if (_.i >= _.images.length) {
					if (!_.settings.edgeStop) {
						_.i = 0;
					} else {
						_.i = _.images.length;
					}
				} else {
					_.i++;
				}

				// Record last move direction.
				_.lastMove = 'right';

			} else if( xcoord < _.oldX ) {
				// moving left.

				if(_.lastMove === 'right') {
					// Fixes glitch when changing directions.
					_.i--;
				}

				if(_.i < 0) {
					if (!_.settings.edgeStop) {
						_.i = _.images.length;
					} else {
						_.i = 0;
					}
				}

                _.image.attr('src', _.images[_.i]);
                
                // Custom set parent tracker
                _.container.data("image_number", _.i+1);

				if (_.i <= 0) {
					if (!_.settings.edgeStop) {
						_.i = _.images.length;
					} else {
						_.i = 0;
					}
				} else {
					_.i--;
				}

				// Record last move direction.
				_.lastMove = 'left';

			}
            

			// Record the last x position for use when the method is called again.
			_.oldX = xcoord;

		}
        
        // Custom
        Rollerblade.prototype.rotateTo = function(i) {
            
            var _ = this;
            
            // Check if the value is out of bounds (greater)
            if (i > _.images.length) {
                if (!_.settings.edgeStop) {
                    i = 0;
                } else {
                    i = _.images.length;
                }
            }
            
            // Check if the value is out of bounds (lesser)
            if (i < 0) {
                if (!_.settings.edgeStop) {
                    i = _.images.length;
                } else {
                    i = 0;
                }
            }
            
            // Show the new image
            _.image.attr('src', _.images[i]);
            _.i = i;
            
            
            // Set parent tracker
            _.container.data("image_number", i+1);
            
            // Set values back to default
            _.oldX = 0;
            _.oldDiff = null;
            _.lastMove = "none";
            _.lastMoveConstant = "none";
            _.previousX = 0;
            
        }

		return Rollerblade;

	})();

	$.fn.rollerblade = function (options) {
		var instance;

		instance = this.data('rollerblade');
		if (!instance) {
			return this.each(function() {
				return $(this).data('rollerblade', new Rollerblade(this, options));
			});
		}
		if (options === true) return instance;
		if ($.type(options) === 'string') instance[options]();
		return this;
	};

	$.fn.rollerblade.defaults = {
		imageArray : [],
		sensitivity: 10,
		drag : true,
		auto : false,
		edgeStop : false,
        
        // Custom
        onSpin : function(){},
        onSpinStart : function(){},
        onSpinStop : function(){}
	};

}).call(this);

