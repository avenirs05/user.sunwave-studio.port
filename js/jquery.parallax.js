// jquery.parallax.js
// 2.0
// Stephen Band
//
// Project and documentation site:
// webdev.stephband.info/jparallax/
//
// Repository:
// github.com/stephband/jparallax

(function(jQuery, undefined) {
	// VAR
	var debug = true,
	    
	    options = {
	    	mouseport:     'body',  // jQuery object or selector of DOM node to use as mouseport
	    	xparallax:     true,    // boolean | 0-1 | 'npx' | 'n%'
	    	yparallax:     true,    //
	    	xorigin:       0,     // 0-1 - Sets default alignment. Only has effect when parallax values are something other than 1 (or true, or '100%')
	    	yorigin:       0,     //
	    	decay:         0.9,    // 0-1 (0 instant, 1 forever) - Sets rate of decay curve for catching up with target mouse position
	    	frameDuration: 30,      // Int (milliseconds)
	    	freezeClass:   'freeze' // String - Class added to layer when frozen
	    },
	
	    value = {
	    	left: 0,
	    	top: 0,
	    	middle: 0.5,
	    	center: 0.5,
	    	right: 1,
	    	bottom: 1
	    },
	
	    rpx = /^\d+\s?px$/,
	    rpercent = /^\d+\s?%$/,
	    
	    win = jQuery(window),
	    doc = jQuery(document),
	    mouse = [100, 100];
	
	var Timer = (function(){
		var debug = false;
		
		// Shim for requestAnimationFrame, falling back to timer. See:
		// see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
		var requestFrame = (function(){
		    	return (
		    		window.requestAnimationFrame ||
		    		window.webkitRequestAnimationFrame ||
		    		window.mozRequestAnimationFrame ||
		    		window.oRequestAnimationFrame ||
		    		window.msRequestAnimationFrame ||
		    		function(fn, node){
		    			return window.setTimeout(function(){
		    				fn();
		    			}, 25);
		    		}
		    	);
		    })();
		
		function Timer() {
			var callbacks = [],
				nextFrame;
			
			function noop() {}
			
			function frame(){
				var cbs = callbacks.slice(0),
				    l = cbs.length,
				    i = -1;
				
				if (debug) { console.log('timer frame()', l); }
				
				while(++i < l) { cbs[i].call(this); }
				requestFrame(nextFrame);
			}
			
			function start() {
				if (debug) { console.log('timer start()'); }
				this.start = noop;
				this.stop = stop;
				nextFrame = frame;
				requestFrame(nextFrame);
			}
			
			function stop() {
				if (debug) { console.log('timer stop()'); }
				this.start = start;
				this.stop = noop;
				nextFrame = noop;
			}
			
			this.callbacks = callbacks;
			this.start = start;
			this.stop = stop;
		}

		Timer.prototype = {
			add: function(fn) {
				var callbacks = this.callbacks,
				    l = callbacks.length;
				
				// Check to see if this callback is already in the list.
				// Don't add it twice.
				while (l--) {
					if (callbacks[l] === fn) { return; }
				}
				
				this.callbacks.push(fn);
				if (debug) { console.log('timer add()', this.callbacks.length); }
			},
		
			remove: function(fn) {
				var callbacks = this.callbacks,
				    l = callbacks.length;
				
				// Remove all instances of this callback.
				while (l--) {
					if (callbacks[l] === fn) { callbacks.splice(l, 1); }
				}
				
				if (debug) { console.log('timer remove()', this.callbacks.length); }
				
				if (callbacks.length === 0) { this.stop(); }
			}
		};
		
		return Timer;
	})();
	
	function parseCoord(x) {
		return (rpercent.exec(x)) ? parseFloat(x)/100 : x;
	}
	
	function parseBool(x) {
		return typeof x === "boolean" ? x : !!( parseFloat(x) ) ;
	}
	
	function portData(port) {
		var events = {
		    	'mouseenter.parallax': mouseenter,
		    	'mouseleave.parallax': mouseleave
		    },
		    winEvents = {
		    	'resize.parallax': resize
		    },
		    data = {
		    	elem: port,
		    	events: events,
		    	winEvents: winEvents,
		    	timer: new Timer()
		    },
		    layers, size, offset;
		
		function updatePointer() {
			data.pointer = getPointer(mouse, [true, true], offset, size);
		}
		
		function resize() {
			size = getSize(port);
			offset = getOffset(port);
			data.threshold = getThreshold(size);
		}
		
		function mouseenter() {
			data.timer.add(updatePointer);
		}
		
		function mouseleave(e) {
			data.timer.remove(updatePointer);
			data.pointer = getPointer([e.pageX, e.pageY], [true, true], offset, size);
		}

		win.on(winEvents);
		port.on(events);
		
		resize();
		
		return data;
	}
	
	function getData(elem, name, fn) {
		var data = elem.data(name);
		
		if (!data) {
			data = fn ? fn(elem) : {} ;
			elem.data(name, data);
		}
		
		return data;
	}
	
	function getPointer(mouse, parallax, offset, size){
		var pointer = [],
		    x = 2;
		
		while (x--) {
			pointer[x] = (mouse[x] - offset[x]) / size[x] ;
			pointer[x] = pointer[x] < 0 ? 0 : pointer[x] > 1 ? 1 : pointer[x] ;
		}
		
		return pointer;
	}
	
	function getSize(elem) {
		return [elem.width(), elem.height()];
	}
	
	function getOffset(elem) {
		var offset = elem.offset() || {left: 0, top: 0},
			borderLeft = elem.css('borderLeftStyle') === 'none' ? 0 : parseInt(elem.css('borderLeftWidth'), 10),
			borderTop = elem.css('borderTopStyle') === 'none' ? 0 : parseInt(elem.css('borderTopWidth'), 10),
			paddingLeft = parseInt(elem.css('paddingLeft'), 10),
			paddingTop = parseInt(elem.css('paddingTop'), 10);
		
		return [offset.left + borderLeft + paddingLeft, offset.top + borderTop + paddingTop];
	}
	
	function getThreshold(size) {
		return [1/size[0], 1/size[1]];
	}
	
	function layerSize(elem, x, y) {
		return [x || elem.outerWidth(), y || elem.outerHeight()];
	}
	
	function layerOrigin(xo, yo) {
		var o = [xo, yo],
			i = 2,
			origin = [];
		
		while (i--) {
			origin[i] = typeof o[i] === 'string' ?
				o[i] === undefined ?
					1 :
					value[origin[i]] || parseCoord(origin[i]) :
				o[i] ;
		}
		
		return origin;
	}
	
	function layerPx(xp, yp) {
		return [rpx.test(xp), rpx.test(yp)];
	}
	
	function layerParallax(xp, yp, px) {
		var p = [xp, yp],
		    i = 2,
		    parallax = [];
		
		while (i--) {
			parallax[i] = px[i] ?
				parseInt(p[i], 10) :
				parallax[i] = p[i] === true ? 1 : parseCoord(p[i]) ;
		}
		
		return parallax;
	}
	
	function layerOffset(parallax, px, origin, size) {
		var i = 2,
		    offset = [];
		
		while (i--) {
			offset[i] = px[i] ?
				origin[i] * (size[i] - parallax[i]) :
				parallax[i] ? origin[i] * ( 1 - parallax[i] ) : 0 ;
		}
		
		return offset;
	}
	
	function layerPosition(px, origin) {
		var i = 2,
		    position = [];
		
		while (i--) {
			if (px[i]) {
				// Set css position constant
				//position[i] = origin[i] * 100 + '%';
			}
			else {
			
			}
		}
		
		return position;
	}
	
	function layerPointer(elem, parallax, px, offset, size) {
		var viewport = elem.offsetParent(),
			pos = elem.position(),
			position = [],
			pointer = [],
			i = 2;
		
		// Reverse calculate ratio from elem's current position
		while (i--) {
			position[i] = px[i] ?
				// TODO: reverse calculation for pixel case
				0 :
				pos[i === 0 ? 'left' : 'top'] / (viewport[i === 0 ? 'outerWidth' : 'outerHeight']() - size[i]) ;
			
			pointer[i] = (position[i] - offset[i]) / parallax[i] ;
		}
		
		return pointer;
	}
	
	function layerCss(parallax, px, offset, size, position, pointer) {
		var pos = [],
		    cssPosition,
		    cssMargin,
		    x = 2,
		    css = {};
		
		while (x--) {
			if (parallax[x]) {
				pos[x] = parallax[x] * pointer[x] + offset[x];
				
				// We're working in pixels
				if (px[x]) {
					//cssPosition = position[x];
					cssMargin = pos[x] * -1;
				}
				// We're working by ratio
				else {
					//cssPosition = pos[x] * 100 + '%';
					cssMargin = pos[x] * size[x] * -1;
				}
				
				// Fill in css object
				if (x === 0) {
					css.left = cssPosition;
					css.marginLeft = cssMargin;
				}
				else {
					css.top = cssPosition;
					css.marginTop = cssMargin;
				}
			}
		}
		
		return css;
	}
	
	function pointerOffTarget(targetPointer, prevPointer, threshold, decay, parallax, targetFn, updateFn) {
		var pointer, x;
		
		if ((!parallax[0] || Math.abs(targetPointer[0] - prevPointer[0]) < threshold[0]) &&
		    (!parallax[1] || Math.abs(targetPointer[1] - prevPointer[1]) < threshold[1])) {
		    // Pointer has hit the target
		    if (targetFn) { targetFn(); }
		    return updateFn(targetPointer);
		}
		
		// Pointer is nowhere near the target
		pointer = [];
		x = 2;
		
		while (x--) {
			if (parallax[x]) {
				pointer[x] = targetPointer[x] + decay * (prevPointer[x] - targetPointer[x]);
			}
		}
			
		return updateFn(pointer);
	}
	
	function pointerOnTarget(targetPointer, prevPointer, threshold, decay, parallax, targetFn, updateFn) {
		// Don't bother updating if the pointer hasn't changed.
		if (targetPointer[0] === prevPointer[0] && targetPointer[1] === prevPointer[1]) {
			return;
		}
		
		return updateFn(targetPointer);
	}
	
	function unport(elem, events, winEvents) {
		elem.off(events).removeData('parallax_port');
		win.off(winEvents);
	}
	
	function unparallax(node, port, events) {
		port.elem.off(events);
		
		// Remove this node from layers
		port.layers = port.layers.not(node);
		
		// If port.layers is empty, destroy the port
		if (port.layers.length === 0) {
			unport(port.elem, port.events, port.winEvents);
		}
	}
	
	function unstyle(parallax) {
		var css = {};
		
		if (parallax[0]) {
			css.left = '';
			css.marginLeft = '';
		}
		
		if (parallax[1]) {
			css.top = '';
			css.marginTop = '';
		}
		
		elem.css(css);
	}
	
	jQuery.fn.parallax = function(o){
		var options = jQuery.extend({}, jQuery.fn.parallax.options, o),
		    args = arguments,
		    elem = options.mouseport instanceof jQuery ?
		    	options.mouseport :
		    	jQuery(options.mouseport) ,
		    port = getData(elem, 'parallax_port', portData),
		    timer = port.timer;
		
		return this.each(function(i) {
			var node      = this,
			    elem      = jQuery(this),
			    opts      = args[i + 1] ? jQuery.extend({}, options, args[i + 1]) : options,
			    decay     = opts.decay,
			    size      = layerSize(elem, opts.width, opts.height),
			    origin    = layerOrigin(opts.xorigin, opts.yorigin),
			    px        = layerPx(opts.xparallax, opts.yparallax),
			    parallax  = layerParallax(opts.xparallax, opts.yparallax, px),
			    offset    = layerOffset(parallax, px, origin, size),
			    position  = layerPosition(px, origin),
			    pointer   = layerPointer(elem, parallax, px, offset, size),
			    pointerFn = pointerOffTarget,
			    targetFn  = targetInside,
			    events = {
			    	'mouseenter.parallax': function mouseenter(e) {
			    		pointerFn = pointerOffTarget;
			    		targetFn = targetInside;
			    		timer.add(frame);
			    		timer.start();
			    	},
			    	'mouseleave.parallax': function mouseleave(e) {
			    		// Make the layer come to rest at it's limit with inertia
			    		pointerFn = pointerOffTarget;
			    		// Stop the timer when the the pointer hits target
			    		targetFn = targetOutside;
			    	}
			    };
			
			function updateCss(newPointer) {
				var css = layerCss(parallax, px, offset, size, position, newPointer);
				elem.css(css);
				pointer = newPointer;
			}
			
			function frame() {
				pointerFn(port.pointer, pointer, port.threshold, decay, parallax, targetFn, updateCss);
			}
			
			function targetInside() {
				// Pointer hits the target pointer inside the port
				pointerFn = pointerOnTarget;
			}
			
			function targetOutside() {
				// Pointer hits the target pointer outside the port
				timer.remove(frame);
			}
			
			
			if (jQuery.data(node, 'parallax')) {
				elem.unparallax();
			}
			
			jQuery.data(node, 'parallax', {
				port: port,
				events: events,
				parallax: parallax
			});
			
			port.elem.on(events);
			port.layers = port.layers? port.layers.add(node): jQuery(node);
			
			/*function freeze() {
				freeze = true;
			}
			
			function unfreeze() {
				freeze = false;
			}*/
			
			/*jQuery.event.add(this, 'freeze.parallax', freeze);
			jQuery.event.add(this, 'unfreeze.parallax', unfreeze);*/
		});
	};
	
	jQuery.fn.unparallax = function(bool) {
		return this.each(function() {
			var data = jQuery.data(this, 'parallax');
			
			// This elem is not parallaxed
			if (!data) { return; }
			
			jQuery.removeData(this, 'parallax');
			unparallax(this, data.port, data.events);
			if (bool) { unstyle(data.parallax); }
		});
	};
	
	jQuery.fn.parallax.options = options;
	
	// Pick up and store mouse position on document: IE does not register
	// mousemove on window.
	doc.on('mousemove.parallax', function(e){
		mouse = [e.pageX, e.pageY];
	});
}(jQuery));
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJqcXVlcnkucGFyYWxsYXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8ganF1ZXJ5LnBhcmFsbGF4LmpzXHJcbi8vIDIuMFxyXG4vLyBTdGVwaGVuIEJhbmRcclxuLy9cclxuLy8gUHJvamVjdCBhbmQgZG9jdW1lbnRhdGlvbiBzaXRlOlxyXG4vLyB3ZWJkZXYuc3RlcGhiYW5kLmluZm8vanBhcmFsbGF4L1xyXG4vL1xyXG4vLyBSZXBvc2l0b3J5OlxyXG4vLyBnaXRodWIuY29tL3N0ZXBoYmFuZC9qcGFyYWxsYXhcclxuXHJcbihmdW5jdGlvbihqUXVlcnksIHVuZGVmaW5lZCkge1xyXG5cdC8vIFZBUlxyXG5cdHZhciBkZWJ1ZyA9IHRydWUsXHJcblx0ICAgIFxyXG5cdCAgICBvcHRpb25zID0ge1xyXG5cdCAgICBcdG1vdXNlcG9ydDogICAgICdib2R5JywgIC8vIGpRdWVyeSBvYmplY3Qgb3Igc2VsZWN0b3Igb2YgRE9NIG5vZGUgdG8gdXNlIGFzIG1vdXNlcG9ydFxyXG5cdCAgICBcdHhwYXJhbGxheDogICAgIHRydWUsICAgIC8vIGJvb2xlYW4gfCAwLTEgfCAnbnB4JyB8ICduJSdcclxuXHQgICAgXHR5cGFyYWxsYXg6ICAgICB0cnVlLCAgICAvL1xyXG5cdCAgICBcdHhvcmlnaW46ICAgICAgIDAsICAgICAvLyAwLTEgLSBTZXRzIGRlZmF1bHQgYWxpZ25tZW50LiBPbmx5IGhhcyBlZmZlY3Qgd2hlbiBwYXJhbGxheCB2YWx1ZXMgYXJlIHNvbWV0aGluZyBvdGhlciB0aGFuIDEgKG9yIHRydWUsIG9yICcxMDAlJylcclxuXHQgICAgXHR5b3JpZ2luOiAgICAgICAwLCAgICAgLy9cclxuXHQgICAgXHRkZWNheTogICAgICAgICAwLjksICAgIC8vIDAtMSAoMCBpbnN0YW50LCAxIGZvcmV2ZXIpIC0gU2V0cyByYXRlIG9mIGRlY2F5IGN1cnZlIGZvciBjYXRjaGluZyB1cCB3aXRoIHRhcmdldCBtb3VzZSBwb3NpdGlvblxyXG5cdCAgICBcdGZyYW1lRHVyYXRpb246IDMwLCAgICAgIC8vIEludCAobWlsbGlzZWNvbmRzKVxyXG5cdCAgICBcdGZyZWV6ZUNsYXNzOiAgICdmcmVlemUnIC8vIFN0cmluZyAtIENsYXNzIGFkZGVkIHRvIGxheWVyIHdoZW4gZnJvemVuXHJcblx0ICAgIH0sXHJcblx0XHJcblx0ICAgIHZhbHVlID0ge1xyXG5cdCAgICBcdGxlZnQ6IDAsXHJcblx0ICAgIFx0dG9wOiAwLFxyXG5cdCAgICBcdG1pZGRsZTogMC41LFxyXG5cdCAgICBcdGNlbnRlcjogMC41LFxyXG5cdCAgICBcdHJpZ2h0OiAxLFxyXG5cdCAgICBcdGJvdHRvbTogMVxyXG5cdCAgICB9LFxyXG5cdFxyXG5cdCAgICBycHggPSAvXlxcZCtcXHM/cHgkLyxcclxuXHQgICAgcnBlcmNlbnQgPSAvXlxcZCtcXHM/JSQvLFxyXG5cdCAgICBcclxuXHQgICAgd2luID0galF1ZXJ5KHdpbmRvdyksXHJcblx0ICAgIGRvYyA9IGpRdWVyeShkb2N1bWVudCksXHJcblx0ICAgIG1vdXNlID0gWzEwMCwgMTAwXTtcclxuXHRcclxuXHR2YXIgVGltZXIgPSAoZnVuY3Rpb24oKXtcclxuXHRcdHZhciBkZWJ1ZyA9IGZhbHNlO1xyXG5cdFx0XHJcblx0XHQvLyBTaGltIGZvciByZXF1ZXN0QW5pbWF0aW9uRnJhbWUsIGZhbGxpbmcgYmFjayB0byB0aW1lci4gU2VlOlxyXG5cdFx0Ly8gc2VlIGh0dHA6Ly9wYXVsaXJpc2guY29tLzIwMTEvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1hbmltYXRpbmcvXHJcblx0XHR2YXIgcmVxdWVzdEZyYW1lID0gKGZ1bmN0aW9uKCl7XHJcblx0XHQgICAgXHRyZXR1cm4gKFxyXG5cdFx0ICAgIFx0XHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XHJcblx0XHQgICAgXHRcdHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcclxuXHRcdCAgICBcdFx0d2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG5cdFx0ICAgIFx0XHR3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG5cdFx0ICAgIFx0XHR3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcclxuXHRcdCAgICBcdFx0ZnVuY3Rpb24oZm4sIG5vZGUpe1xyXG5cdFx0ICAgIFx0XHRcdHJldHVybiB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG5cdFx0ICAgIFx0XHRcdFx0Zm4oKTtcclxuXHRcdCAgICBcdFx0XHR9LCAyNSk7XHJcblx0XHQgICAgXHRcdH1cclxuXHRcdCAgICBcdCk7XHJcblx0XHQgICAgfSkoKTtcclxuXHRcdFxyXG5cdFx0ZnVuY3Rpb24gVGltZXIoKSB7XHJcblx0XHRcdHZhciBjYWxsYmFja3MgPSBbXSxcclxuXHRcdFx0XHRuZXh0RnJhbWU7XHJcblx0XHRcdFxyXG5cdFx0XHRmdW5jdGlvbiBub29wKCkge31cclxuXHRcdFx0XHJcblx0XHRcdGZ1bmN0aW9uIGZyYW1lKCl7XHJcblx0XHRcdFx0dmFyIGNicyA9IGNhbGxiYWNrcy5zbGljZSgwKSxcclxuXHRcdFx0XHQgICAgbCA9IGNicy5sZW5ndGgsXHJcblx0XHRcdFx0ICAgIGkgPSAtMTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAoZGVidWcpIHsgY29uc29sZS5sb2coJ3RpbWVyIGZyYW1lKCknLCBsKTsgfVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHdoaWxlKCsraSA8IGwpIHsgY2JzW2ldLmNhbGwodGhpcyk7IH1cclxuXHRcdFx0XHRyZXF1ZXN0RnJhbWUobmV4dEZyYW1lKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0ZnVuY3Rpb24gc3RhcnQoKSB7XHJcblx0XHRcdFx0aWYgKGRlYnVnKSB7IGNvbnNvbGUubG9nKCd0aW1lciBzdGFydCgpJyk7IH1cclxuXHRcdFx0XHR0aGlzLnN0YXJ0ID0gbm9vcDtcclxuXHRcdFx0XHR0aGlzLnN0b3AgPSBzdG9wO1xyXG5cdFx0XHRcdG5leHRGcmFtZSA9IGZyYW1lO1xyXG5cdFx0XHRcdHJlcXVlc3RGcmFtZShuZXh0RnJhbWUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRmdW5jdGlvbiBzdG9wKCkge1xyXG5cdFx0XHRcdGlmIChkZWJ1ZykgeyBjb25zb2xlLmxvZygndGltZXIgc3RvcCgpJyk7IH1cclxuXHRcdFx0XHR0aGlzLnN0YXJ0ID0gc3RhcnQ7XHJcblx0XHRcdFx0dGhpcy5zdG9wID0gbm9vcDtcclxuXHRcdFx0XHRuZXh0RnJhbWUgPSBub29wO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmNhbGxiYWNrcyA9IGNhbGxiYWNrcztcclxuXHRcdFx0dGhpcy5zdGFydCA9IHN0YXJ0O1xyXG5cdFx0XHR0aGlzLnN0b3AgPSBzdG9wO1xyXG5cdFx0fVxyXG5cclxuXHRcdFRpbWVyLnByb3RvdHlwZSA9IHtcclxuXHRcdFx0YWRkOiBmdW5jdGlvbihmbikge1xyXG5cdFx0XHRcdHZhciBjYWxsYmFja3MgPSB0aGlzLmNhbGxiYWNrcyxcclxuXHRcdFx0XHQgICAgbCA9IGNhbGxiYWNrcy5sZW5ndGg7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Ly8gQ2hlY2sgdG8gc2VlIGlmIHRoaXMgY2FsbGJhY2sgaXMgYWxyZWFkeSBpbiB0aGUgbGlzdC5cclxuXHRcdFx0XHQvLyBEb24ndCBhZGQgaXQgdHdpY2UuXHJcblx0XHRcdFx0d2hpbGUgKGwtLSkge1xyXG5cdFx0XHRcdFx0aWYgKGNhbGxiYWNrc1tsXSA9PT0gZm4pIHsgcmV0dXJuOyB9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuY2FsbGJhY2tzLnB1c2goZm4pO1xyXG5cdFx0XHRcdGlmIChkZWJ1ZykgeyBjb25zb2xlLmxvZygndGltZXIgYWRkKCknLCB0aGlzLmNhbGxiYWNrcy5sZW5ndGgpOyB9XHJcblx0XHRcdH0sXHJcblx0XHRcclxuXHRcdFx0cmVtb3ZlOiBmdW5jdGlvbihmbikge1xyXG5cdFx0XHRcdHZhciBjYWxsYmFja3MgPSB0aGlzLmNhbGxiYWNrcyxcclxuXHRcdFx0XHQgICAgbCA9IGNhbGxiYWNrcy5sZW5ndGg7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Ly8gUmVtb3ZlIGFsbCBpbnN0YW5jZXMgb2YgdGhpcyBjYWxsYmFjay5cclxuXHRcdFx0XHR3aGlsZSAobC0tKSB7XHJcblx0XHRcdFx0XHRpZiAoY2FsbGJhY2tzW2xdID09PSBmbikgeyBjYWxsYmFja3Muc3BsaWNlKGwsIDEpOyB9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmIChkZWJ1ZykgeyBjb25zb2xlLmxvZygndGltZXIgcmVtb3ZlKCknLCB0aGlzLmNhbGxiYWNrcy5sZW5ndGgpOyB9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYgKGNhbGxiYWNrcy5sZW5ndGggPT09IDApIHsgdGhpcy5zdG9wKCk7IH1cclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIFRpbWVyO1xyXG5cdH0pKCk7XHJcblx0XHJcblx0ZnVuY3Rpb24gcGFyc2VDb29yZCh4KSB7XHJcblx0XHRyZXR1cm4gKHJwZXJjZW50LmV4ZWMoeCkpID8gcGFyc2VGbG9hdCh4KS8xMDAgOiB4O1xyXG5cdH1cclxuXHRcclxuXHRmdW5jdGlvbiBwYXJzZUJvb2woeCkge1xyXG5cdFx0cmV0dXJuIHR5cGVvZiB4ID09PSBcImJvb2xlYW5cIiA/IHggOiAhISggcGFyc2VGbG9hdCh4KSApIDtcclxuXHR9XHJcblx0XHJcblx0ZnVuY3Rpb24gcG9ydERhdGEocG9ydCkge1xyXG5cdFx0dmFyIGV2ZW50cyA9IHtcclxuXHRcdCAgICBcdCdtb3VzZWVudGVyLnBhcmFsbGF4JzogbW91c2VlbnRlcixcclxuXHRcdCAgICBcdCdtb3VzZWxlYXZlLnBhcmFsbGF4JzogbW91c2VsZWF2ZVxyXG5cdFx0ICAgIH0sXHJcblx0XHQgICAgd2luRXZlbnRzID0ge1xyXG5cdFx0ICAgIFx0J3Jlc2l6ZS5wYXJhbGxheCc6IHJlc2l6ZVxyXG5cdFx0ICAgIH0sXHJcblx0XHQgICAgZGF0YSA9IHtcclxuXHRcdCAgICBcdGVsZW06IHBvcnQsXHJcblx0XHQgICAgXHRldmVudHM6IGV2ZW50cyxcclxuXHRcdCAgICBcdHdpbkV2ZW50czogd2luRXZlbnRzLFxyXG5cdFx0ICAgIFx0dGltZXI6IG5ldyBUaW1lcigpXHJcblx0XHQgICAgfSxcclxuXHRcdCAgICBsYXllcnMsIHNpemUsIG9mZnNldDtcclxuXHRcdFxyXG5cdFx0ZnVuY3Rpb24gdXBkYXRlUG9pbnRlcigpIHtcclxuXHRcdFx0ZGF0YS5wb2ludGVyID0gZ2V0UG9pbnRlcihtb3VzZSwgW3RydWUsIHRydWVdLCBvZmZzZXQsIHNpemUpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRmdW5jdGlvbiByZXNpemUoKSB7XHJcblx0XHRcdHNpemUgPSBnZXRTaXplKHBvcnQpO1xyXG5cdFx0XHRvZmZzZXQgPSBnZXRPZmZzZXQocG9ydCk7XHJcblx0XHRcdGRhdGEudGhyZXNob2xkID0gZ2V0VGhyZXNob2xkKHNpemUpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRmdW5jdGlvbiBtb3VzZWVudGVyKCkge1xyXG5cdFx0XHRkYXRhLnRpbWVyLmFkZCh1cGRhdGVQb2ludGVyKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0ZnVuY3Rpb24gbW91c2VsZWF2ZShlKSB7XHJcblx0XHRcdGRhdGEudGltZXIucmVtb3ZlKHVwZGF0ZVBvaW50ZXIpO1xyXG5cdFx0XHRkYXRhLnBvaW50ZXIgPSBnZXRQb2ludGVyKFtlLnBhZ2VYLCBlLnBhZ2VZXSwgW3RydWUsIHRydWVdLCBvZmZzZXQsIHNpemUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHdpbi5vbih3aW5FdmVudHMpO1xyXG5cdFx0cG9ydC5vbihldmVudHMpO1xyXG5cdFx0XHJcblx0XHRyZXNpemUoKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIGRhdGE7XHJcblx0fVxyXG5cdFxyXG5cdGZ1bmN0aW9uIGdldERhdGEoZWxlbSwgbmFtZSwgZm4pIHtcclxuXHRcdHZhciBkYXRhID0gZWxlbS5kYXRhKG5hbWUpO1xyXG5cdFx0XHJcblx0XHRpZiAoIWRhdGEpIHtcclxuXHRcdFx0ZGF0YSA9IGZuID8gZm4oZWxlbSkgOiB7fSA7XHJcblx0XHRcdGVsZW0uZGF0YShuYW1lLCBkYXRhKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIGRhdGE7XHJcblx0fVxyXG5cdFxyXG5cdGZ1bmN0aW9uIGdldFBvaW50ZXIobW91c2UsIHBhcmFsbGF4LCBvZmZzZXQsIHNpemUpe1xyXG5cdFx0dmFyIHBvaW50ZXIgPSBbXSxcclxuXHRcdCAgICB4ID0gMjtcclxuXHRcdFxyXG5cdFx0d2hpbGUgKHgtLSkge1xyXG5cdFx0XHRwb2ludGVyW3hdID0gKG1vdXNlW3hdIC0gb2Zmc2V0W3hdKSAvIHNpemVbeF0gO1xyXG5cdFx0XHRwb2ludGVyW3hdID0gcG9pbnRlclt4XSA8IDAgPyAwIDogcG9pbnRlclt4XSA+IDEgPyAxIDogcG9pbnRlclt4XSA7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiBwb2ludGVyO1xyXG5cdH1cclxuXHRcclxuXHRmdW5jdGlvbiBnZXRTaXplKGVsZW0pIHtcclxuXHRcdHJldHVybiBbZWxlbS53aWR0aCgpLCBlbGVtLmhlaWdodCgpXTtcclxuXHR9XHJcblx0XHJcblx0ZnVuY3Rpb24gZ2V0T2Zmc2V0KGVsZW0pIHtcclxuXHRcdHZhciBvZmZzZXQgPSBlbGVtLm9mZnNldCgpIHx8IHtsZWZ0OiAwLCB0b3A6IDB9LFxyXG5cdFx0XHRib3JkZXJMZWZ0ID0gZWxlbS5jc3MoJ2JvcmRlckxlZnRTdHlsZScpID09PSAnbm9uZScgPyAwIDogcGFyc2VJbnQoZWxlbS5jc3MoJ2JvcmRlckxlZnRXaWR0aCcpLCAxMCksXHJcblx0XHRcdGJvcmRlclRvcCA9IGVsZW0uY3NzKCdib3JkZXJUb3BTdHlsZScpID09PSAnbm9uZScgPyAwIDogcGFyc2VJbnQoZWxlbS5jc3MoJ2JvcmRlclRvcFdpZHRoJyksIDEwKSxcclxuXHRcdFx0cGFkZGluZ0xlZnQgPSBwYXJzZUludChlbGVtLmNzcygncGFkZGluZ0xlZnQnKSwgMTApLFxyXG5cdFx0XHRwYWRkaW5nVG9wID0gcGFyc2VJbnQoZWxlbS5jc3MoJ3BhZGRpbmdUb3AnKSwgMTApO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gW29mZnNldC5sZWZ0ICsgYm9yZGVyTGVmdCArIHBhZGRpbmdMZWZ0LCBvZmZzZXQudG9wICsgYm9yZGVyVG9wICsgcGFkZGluZ1RvcF07XHJcblx0fVxyXG5cdFxyXG5cdGZ1bmN0aW9uIGdldFRocmVzaG9sZChzaXplKSB7XHJcblx0XHRyZXR1cm4gWzEvc2l6ZVswXSwgMS9zaXplWzFdXTtcclxuXHR9XHJcblx0XHJcblx0ZnVuY3Rpb24gbGF5ZXJTaXplKGVsZW0sIHgsIHkpIHtcclxuXHRcdHJldHVybiBbeCB8fCBlbGVtLm91dGVyV2lkdGgoKSwgeSB8fCBlbGVtLm91dGVySGVpZ2h0KCldO1xyXG5cdH1cclxuXHRcclxuXHRmdW5jdGlvbiBsYXllck9yaWdpbih4bywgeW8pIHtcclxuXHRcdHZhciBvID0gW3hvLCB5b10sXHJcblx0XHRcdGkgPSAyLFxyXG5cdFx0XHRvcmlnaW4gPSBbXTtcclxuXHRcdFxyXG5cdFx0d2hpbGUgKGktLSkge1xyXG5cdFx0XHRvcmlnaW5baV0gPSB0eXBlb2Ygb1tpXSA9PT0gJ3N0cmluZycgP1xyXG5cdFx0XHRcdG9baV0gPT09IHVuZGVmaW5lZCA/XHJcblx0XHRcdFx0XHQxIDpcclxuXHRcdFx0XHRcdHZhbHVlW29yaWdpbltpXV0gfHwgcGFyc2VDb29yZChvcmlnaW5baV0pIDpcclxuXHRcdFx0XHRvW2ldIDtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIG9yaWdpbjtcclxuXHR9XHJcblx0XHJcblx0ZnVuY3Rpb24gbGF5ZXJQeCh4cCwgeXApIHtcclxuXHRcdHJldHVybiBbcnB4LnRlc3QoeHApLCBycHgudGVzdCh5cCldO1xyXG5cdH1cclxuXHRcclxuXHRmdW5jdGlvbiBsYXllclBhcmFsbGF4KHhwLCB5cCwgcHgpIHtcclxuXHRcdHZhciBwID0gW3hwLCB5cF0sXHJcblx0XHQgICAgaSA9IDIsXHJcblx0XHQgICAgcGFyYWxsYXggPSBbXTtcclxuXHRcdFxyXG5cdFx0d2hpbGUgKGktLSkge1xyXG5cdFx0XHRwYXJhbGxheFtpXSA9IHB4W2ldID9cclxuXHRcdFx0XHRwYXJzZUludChwW2ldLCAxMCkgOlxyXG5cdFx0XHRcdHBhcmFsbGF4W2ldID0gcFtpXSA9PT0gdHJ1ZSA/IDEgOiBwYXJzZUNvb3JkKHBbaV0pIDtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHBhcmFsbGF4O1xyXG5cdH1cclxuXHRcclxuXHRmdW5jdGlvbiBsYXllck9mZnNldChwYXJhbGxheCwgcHgsIG9yaWdpbiwgc2l6ZSkge1xyXG5cdFx0dmFyIGkgPSAyLFxyXG5cdFx0ICAgIG9mZnNldCA9IFtdO1xyXG5cdFx0XHJcblx0XHR3aGlsZSAoaS0tKSB7XHJcblx0XHRcdG9mZnNldFtpXSA9IHB4W2ldID9cclxuXHRcdFx0XHRvcmlnaW5baV0gKiAoc2l6ZVtpXSAtIHBhcmFsbGF4W2ldKSA6XHJcblx0XHRcdFx0cGFyYWxsYXhbaV0gPyBvcmlnaW5baV0gKiAoIDEgLSBwYXJhbGxheFtpXSApIDogMCA7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiBvZmZzZXQ7XHJcblx0fVxyXG5cdFxyXG5cdGZ1bmN0aW9uIGxheWVyUG9zaXRpb24ocHgsIG9yaWdpbikge1xyXG5cdFx0dmFyIGkgPSAyLFxyXG5cdFx0ICAgIHBvc2l0aW9uID0gW107XHJcblx0XHRcclxuXHRcdHdoaWxlIChpLS0pIHtcclxuXHRcdFx0aWYgKHB4W2ldKSB7XHJcblx0XHRcdFx0Ly8gU2V0IGNzcyBwb3NpdGlvbiBjb25zdGFudFxyXG5cdFx0XHRcdC8vcG9zaXRpb25baV0gPSBvcmlnaW5baV0gKiAxMDAgKyAnJSc7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiBwb3NpdGlvbjtcclxuXHR9XHJcblx0XHJcblx0ZnVuY3Rpb24gbGF5ZXJQb2ludGVyKGVsZW0sIHBhcmFsbGF4LCBweCwgb2Zmc2V0LCBzaXplKSB7XHJcblx0XHR2YXIgdmlld3BvcnQgPSBlbGVtLm9mZnNldFBhcmVudCgpLFxyXG5cdFx0XHRwb3MgPSBlbGVtLnBvc2l0aW9uKCksXHJcblx0XHRcdHBvc2l0aW9uID0gW10sXHJcblx0XHRcdHBvaW50ZXIgPSBbXSxcclxuXHRcdFx0aSA9IDI7XHJcblx0XHRcclxuXHRcdC8vIFJldmVyc2UgY2FsY3VsYXRlIHJhdGlvIGZyb20gZWxlbSdzIGN1cnJlbnQgcG9zaXRpb25cclxuXHRcdHdoaWxlIChpLS0pIHtcclxuXHRcdFx0cG9zaXRpb25baV0gPSBweFtpXSA/XHJcblx0XHRcdFx0Ly8gVE9ETzogcmV2ZXJzZSBjYWxjdWxhdGlvbiBmb3IgcGl4ZWwgY2FzZVxyXG5cdFx0XHRcdDAgOlxyXG5cdFx0XHRcdHBvc1tpID09PSAwID8gJ2xlZnQnIDogJ3RvcCddIC8gKHZpZXdwb3J0W2kgPT09IDAgPyAnb3V0ZXJXaWR0aCcgOiAnb3V0ZXJIZWlnaHQnXSgpIC0gc2l6ZVtpXSkgO1xyXG5cdFx0XHRcclxuXHRcdFx0cG9pbnRlcltpXSA9IChwb3NpdGlvbltpXSAtIG9mZnNldFtpXSkgLyBwYXJhbGxheFtpXSA7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiBwb2ludGVyO1xyXG5cdH1cclxuXHRcclxuXHRmdW5jdGlvbiBsYXllckNzcyhwYXJhbGxheCwgcHgsIG9mZnNldCwgc2l6ZSwgcG9zaXRpb24sIHBvaW50ZXIpIHtcclxuXHRcdHZhciBwb3MgPSBbXSxcclxuXHRcdCAgICBjc3NQb3NpdGlvbixcclxuXHRcdCAgICBjc3NNYXJnaW4sXHJcblx0XHQgICAgeCA9IDIsXHJcblx0XHQgICAgY3NzID0ge307XHJcblx0XHRcclxuXHRcdHdoaWxlICh4LS0pIHtcclxuXHRcdFx0aWYgKHBhcmFsbGF4W3hdKSB7XHJcblx0XHRcdFx0cG9zW3hdID0gcGFyYWxsYXhbeF0gKiBwb2ludGVyW3hdICsgb2Zmc2V0W3hdO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdC8vIFdlJ3JlIHdvcmtpbmcgaW4gcGl4ZWxzXHJcblx0XHRcdFx0aWYgKHB4W3hdKSB7XHJcblx0XHRcdFx0XHQvL2Nzc1Bvc2l0aW9uID0gcG9zaXRpb25beF07XHJcblx0XHRcdFx0XHRjc3NNYXJnaW4gPSBwb3NbeF0gKiAtMTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Ly8gV2UncmUgd29ya2luZyBieSByYXRpb1xyXG5cdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0Ly9jc3NQb3NpdGlvbiA9IHBvc1t4XSAqIDEwMCArICclJztcclxuXHRcdFx0XHRcdGNzc01hcmdpbiA9IHBvc1t4XSAqIHNpemVbeF0gKiAtMTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Ly8gRmlsbCBpbiBjc3Mgb2JqZWN0XHJcblx0XHRcdFx0aWYgKHggPT09IDApIHtcclxuXHRcdFx0XHRcdGNzcy5sZWZ0ID0gY3NzUG9zaXRpb247XHJcblx0XHRcdFx0XHRjc3MubWFyZ2luTGVmdCA9IGNzc01hcmdpbjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRjc3MudG9wID0gY3NzUG9zaXRpb247XHJcblx0XHRcdFx0XHRjc3MubWFyZ2luVG9wID0gY3NzTWFyZ2luO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gY3NzO1xyXG5cdH1cclxuXHRcclxuXHRmdW5jdGlvbiBwb2ludGVyT2ZmVGFyZ2V0KHRhcmdldFBvaW50ZXIsIHByZXZQb2ludGVyLCB0aHJlc2hvbGQsIGRlY2F5LCBwYXJhbGxheCwgdGFyZ2V0Rm4sIHVwZGF0ZUZuKSB7XHJcblx0XHR2YXIgcG9pbnRlciwgeDtcclxuXHRcdFxyXG5cdFx0aWYgKCghcGFyYWxsYXhbMF0gfHwgTWF0aC5hYnModGFyZ2V0UG9pbnRlclswXSAtIHByZXZQb2ludGVyWzBdKSA8IHRocmVzaG9sZFswXSkgJiZcclxuXHRcdCAgICAoIXBhcmFsbGF4WzFdIHx8IE1hdGguYWJzKHRhcmdldFBvaW50ZXJbMV0gLSBwcmV2UG9pbnRlclsxXSkgPCB0aHJlc2hvbGRbMV0pKSB7XHJcblx0XHQgICAgLy8gUG9pbnRlciBoYXMgaGl0IHRoZSB0YXJnZXRcclxuXHRcdCAgICBpZiAodGFyZ2V0Rm4pIHsgdGFyZ2V0Rm4oKTsgfVxyXG5cdFx0ICAgIHJldHVybiB1cGRhdGVGbih0YXJnZXRQb2ludGVyKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gUG9pbnRlciBpcyBub3doZXJlIG5lYXIgdGhlIHRhcmdldFxyXG5cdFx0cG9pbnRlciA9IFtdO1xyXG5cdFx0eCA9IDI7XHJcblx0XHRcclxuXHRcdHdoaWxlICh4LS0pIHtcclxuXHRcdFx0aWYgKHBhcmFsbGF4W3hdKSB7XHJcblx0XHRcdFx0cG9pbnRlclt4XSA9IHRhcmdldFBvaW50ZXJbeF0gKyBkZWNheSAqIChwcmV2UG9pbnRlclt4XSAtIHRhcmdldFBvaW50ZXJbeF0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcdFxyXG5cdFx0cmV0dXJuIHVwZGF0ZUZuKHBvaW50ZXIpO1xyXG5cdH1cclxuXHRcclxuXHRmdW5jdGlvbiBwb2ludGVyT25UYXJnZXQodGFyZ2V0UG9pbnRlciwgcHJldlBvaW50ZXIsIHRocmVzaG9sZCwgZGVjYXksIHBhcmFsbGF4LCB0YXJnZXRGbiwgdXBkYXRlRm4pIHtcclxuXHRcdC8vIERvbid0IGJvdGhlciB1cGRhdGluZyBpZiB0aGUgcG9pbnRlciBoYXNuJ3QgY2hhbmdlZC5cclxuXHRcdGlmICh0YXJnZXRQb2ludGVyWzBdID09PSBwcmV2UG9pbnRlclswXSAmJiB0YXJnZXRQb2ludGVyWzFdID09PSBwcmV2UG9pbnRlclsxXSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiB1cGRhdGVGbih0YXJnZXRQb2ludGVyKTtcclxuXHR9XHJcblx0XHJcblx0ZnVuY3Rpb24gdW5wb3J0KGVsZW0sIGV2ZW50cywgd2luRXZlbnRzKSB7XHJcblx0XHRlbGVtLm9mZihldmVudHMpLnJlbW92ZURhdGEoJ3BhcmFsbGF4X3BvcnQnKTtcclxuXHRcdHdpbi5vZmYod2luRXZlbnRzKTtcclxuXHR9XHJcblx0XHJcblx0ZnVuY3Rpb24gdW5wYXJhbGxheChub2RlLCBwb3J0LCBldmVudHMpIHtcclxuXHRcdHBvcnQuZWxlbS5vZmYoZXZlbnRzKTtcclxuXHRcdFxyXG5cdFx0Ly8gUmVtb3ZlIHRoaXMgbm9kZSBmcm9tIGxheWVyc1xyXG5cdFx0cG9ydC5sYXllcnMgPSBwb3J0LmxheWVycy5ub3Qobm9kZSk7XHJcblx0XHRcclxuXHRcdC8vIElmIHBvcnQubGF5ZXJzIGlzIGVtcHR5LCBkZXN0cm95IHRoZSBwb3J0XHJcblx0XHRpZiAocG9ydC5sYXllcnMubGVuZ3RoID09PSAwKSB7XHJcblx0XHRcdHVucG9ydChwb3J0LmVsZW0sIHBvcnQuZXZlbnRzLCBwb3J0LndpbkV2ZW50cyk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGZ1bmN0aW9uIHVuc3R5bGUocGFyYWxsYXgpIHtcclxuXHRcdHZhciBjc3MgPSB7fTtcclxuXHRcdFxyXG5cdFx0aWYgKHBhcmFsbGF4WzBdKSB7XHJcblx0XHRcdGNzcy5sZWZ0ID0gJyc7XHJcblx0XHRcdGNzcy5tYXJnaW5MZWZ0ID0gJyc7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmIChwYXJhbGxheFsxXSkge1xyXG5cdFx0XHRjc3MudG9wID0gJyc7XHJcblx0XHRcdGNzcy5tYXJnaW5Ub3AgPSAnJztcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0ZWxlbS5jc3MoY3NzKTtcclxuXHR9XHJcblx0XHJcblx0alF1ZXJ5LmZuLnBhcmFsbGF4ID0gZnVuY3Rpb24obyl7XHJcblx0XHR2YXIgb3B0aW9ucyA9IGpRdWVyeS5leHRlbmQoe30sIGpRdWVyeS5mbi5wYXJhbGxheC5vcHRpb25zLCBvKSxcclxuXHRcdCAgICBhcmdzID0gYXJndW1lbnRzLFxyXG5cdFx0ICAgIGVsZW0gPSBvcHRpb25zLm1vdXNlcG9ydCBpbnN0YW5jZW9mIGpRdWVyeSA/XHJcblx0XHQgICAgXHRvcHRpb25zLm1vdXNlcG9ydCA6XHJcblx0XHQgICAgXHRqUXVlcnkob3B0aW9ucy5tb3VzZXBvcnQpICxcclxuXHRcdCAgICBwb3J0ID0gZ2V0RGF0YShlbGVtLCAncGFyYWxsYXhfcG9ydCcsIHBvcnREYXRhKSxcclxuXHRcdCAgICB0aW1lciA9IHBvcnQudGltZXI7XHJcblx0XHRcclxuXHRcdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oaSkge1xyXG5cdFx0XHR2YXIgbm9kZSAgICAgID0gdGhpcyxcclxuXHRcdFx0ICAgIGVsZW0gICAgICA9IGpRdWVyeSh0aGlzKSxcclxuXHRcdFx0ICAgIG9wdHMgICAgICA9IGFyZ3NbaSArIDFdID8galF1ZXJ5LmV4dGVuZCh7fSwgb3B0aW9ucywgYXJnc1tpICsgMV0pIDogb3B0aW9ucyxcclxuXHRcdFx0ICAgIGRlY2F5ICAgICA9IG9wdHMuZGVjYXksXHJcblx0XHRcdCAgICBzaXplICAgICAgPSBsYXllclNpemUoZWxlbSwgb3B0cy53aWR0aCwgb3B0cy5oZWlnaHQpLFxyXG5cdFx0XHQgICAgb3JpZ2luICAgID0gbGF5ZXJPcmlnaW4ob3B0cy54b3JpZ2luLCBvcHRzLnlvcmlnaW4pLFxyXG5cdFx0XHQgICAgcHggICAgICAgID0gbGF5ZXJQeChvcHRzLnhwYXJhbGxheCwgb3B0cy55cGFyYWxsYXgpLFxyXG5cdFx0XHQgICAgcGFyYWxsYXggID0gbGF5ZXJQYXJhbGxheChvcHRzLnhwYXJhbGxheCwgb3B0cy55cGFyYWxsYXgsIHB4KSxcclxuXHRcdFx0ICAgIG9mZnNldCAgICA9IGxheWVyT2Zmc2V0KHBhcmFsbGF4LCBweCwgb3JpZ2luLCBzaXplKSxcclxuXHRcdFx0ICAgIHBvc2l0aW9uICA9IGxheWVyUG9zaXRpb24ocHgsIG9yaWdpbiksXHJcblx0XHRcdCAgICBwb2ludGVyICAgPSBsYXllclBvaW50ZXIoZWxlbSwgcGFyYWxsYXgsIHB4LCBvZmZzZXQsIHNpemUpLFxyXG5cdFx0XHQgICAgcG9pbnRlckZuID0gcG9pbnRlck9mZlRhcmdldCxcclxuXHRcdFx0ICAgIHRhcmdldEZuICA9IHRhcmdldEluc2lkZSxcclxuXHRcdFx0ICAgIGV2ZW50cyA9IHtcclxuXHRcdFx0ICAgIFx0J21vdXNlZW50ZXIucGFyYWxsYXgnOiBmdW5jdGlvbiBtb3VzZWVudGVyKGUpIHtcclxuXHRcdFx0ICAgIFx0XHRwb2ludGVyRm4gPSBwb2ludGVyT2ZmVGFyZ2V0O1xyXG5cdFx0XHQgICAgXHRcdHRhcmdldEZuID0gdGFyZ2V0SW5zaWRlO1xyXG5cdFx0XHQgICAgXHRcdHRpbWVyLmFkZChmcmFtZSk7XHJcblx0XHRcdCAgICBcdFx0dGltZXIuc3RhcnQoKTtcclxuXHRcdFx0ICAgIFx0fSxcclxuXHRcdFx0ICAgIFx0J21vdXNlbGVhdmUucGFyYWxsYXgnOiBmdW5jdGlvbiBtb3VzZWxlYXZlKGUpIHtcclxuXHRcdFx0ICAgIFx0XHQvLyBNYWtlIHRoZSBsYXllciBjb21lIHRvIHJlc3QgYXQgaXQncyBsaW1pdCB3aXRoIGluZXJ0aWFcclxuXHRcdFx0ICAgIFx0XHRwb2ludGVyRm4gPSBwb2ludGVyT2ZmVGFyZ2V0O1xyXG5cdFx0XHQgICAgXHRcdC8vIFN0b3AgdGhlIHRpbWVyIHdoZW4gdGhlIHRoZSBwb2ludGVyIGhpdHMgdGFyZ2V0XHJcblx0XHRcdCAgICBcdFx0dGFyZ2V0Rm4gPSB0YXJnZXRPdXRzaWRlO1xyXG5cdFx0XHQgICAgXHR9XHJcblx0XHRcdCAgICB9O1xyXG5cdFx0XHRcclxuXHRcdFx0ZnVuY3Rpb24gdXBkYXRlQ3NzKG5ld1BvaW50ZXIpIHtcclxuXHRcdFx0XHR2YXIgY3NzID0gbGF5ZXJDc3MocGFyYWxsYXgsIHB4LCBvZmZzZXQsIHNpemUsIHBvc2l0aW9uLCBuZXdQb2ludGVyKTtcclxuXHRcdFx0XHRlbGVtLmNzcyhjc3MpO1xyXG5cdFx0XHRcdHBvaW50ZXIgPSBuZXdQb2ludGVyO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRmdW5jdGlvbiBmcmFtZSgpIHtcclxuXHRcdFx0XHRwb2ludGVyRm4ocG9ydC5wb2ludGVyLCBwb2ludGVyLCBwb3J0LnRocmVzaG9sZCwgZGVjYXksIHBhcmFsbGF4LCB0YXJnZXRGbiwgdXBkYXRlQ3NzKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0ZnVuY3Rpb24gdGFyZ2V0SW5zaWRlKCkge1xyXG5cdFx0XHRcdC8vIFBvaW50ZXIgaGl0cyB0aGUgdGFyZ2V0IHBvaW50ZXIgaW5zaWRlIHRoZSBwb3J0XHJcblx0XHRcdFx0cG9pbnRlckZuID0gcG9pbnRlck9uVGFyZ2V0O1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRmdW5jdGlvbiB0YXJnZXRPdXRzaWRlKCkge1xyXG5cdFx0XHRcdC8vIFBvaW50ZXIgaGl0cyB0aGUgdGFyZ2V0IHBvaW50ZXIgb3V0c2lkZSB0aGUgcG9ydFxyXG5cdFx0XHRcdHRpbWVyLnJlbW92ZShmcmFtZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAoalF1ZXJ5LmRhdGEobm9kZSwgJ3BhcmFsbGF4JykpIHtcclxuXHRcdFx0XHRlbGVtLnVucGFyYWxsYXgoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0alF1ZXJ5LmRhdGEobm9kZSwgJ3BhcmFsbGF4Jywge1xyXG5cdFx0XHRcdHBvcnQ6IHBvcnQsXHJcblx0XHRcdFx0ZXZlbnRzOiBldmVudHMsXHJcblx0XHRcdFx0cGFyYWxsYXg6IHBhcmFsbGF4XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRcclxuXHRcdFx0cG9ydC5lbGVtLm9uKGV2ZW50cyk7XHJcblx0XHRcdHBvcnQubGF5ZXJzID0gcG9ydC5sYXllcnM/IHBvcnQubGF5ZXJzLmFkZChub2RlKTogalF1ZXJ5KG5vZGUpO1xyXG5cdFx0XHRcclxuXHRcdFx0LypmdW5jdGlvbiBmcmVlemUoKSB7XHJcblx0XHRcdFx0ZnJlZXplID0gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0ZnVuY3Rpb24gdW5mcmVlemUoKSB7XHJcblx0XHRcdFx0ZnJlZXplID0gZmFsc2U7XHJcblx0XHRcdH0qL1xyXG5cdFx0XHRcclxuXHRcdFx0LypqUXVlcnkuZXZlbnQuYWRkKHRoaXMsICdmcmVlemUucGFyYWxsYXgnLCBmcmVlemUpO1xyXG5cdFx0XHRqUXVlcnkuZXZlbnQuYWRkKHRoaXMsICd1bmZyZWV6ZS5wYXJhbGxheCcsIHVuZnJlZXplKTsqL1xyXG5cdFx0fSk7XHJcblx0fTtcclxuXHRcclxuXHRqUXVlcnkuZm4udW5wYXJhbGxheCA9IGZ1bmN0aW9uKGJvb2wpIHtcclxuXHRcdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhciBkYXRhID0galF1ZXJ5LmRhdGEodGhpcywgJ3BhcmFsbGF4Jyk7XHJcblx0XHRcdFxyXG5cdFx0XHQvLyBUaGlzIGVsZW0gaXMgbm90IHBhcmFsbGF4ZWRcclxuXHRcdFx0aWYgKCFkYXRhKSB7IHJldHVybjsgfVxyXG5cdFx0XHRcclxuXHRcdFx0alF1ZXJ5LnJlbW92ZURhdGEodGhpcywgJ3BhcmFsbGF4Jyk7XHJcblx0XHRcdHVucGFyYWxsYXgodGhpcywgZGF0YS5wb3J0LCBkYXRhLmV2ZW50cyk7XHJcblx0XHRcdGlmIChib29sKSB7IHVuc3R5bGUoZGF0YS5wYXJhbGxheCk7IH1cclxuXHRcdH0pO1xyXG5cdH07XHJcblx0XHJcblx0alF1ZXJ5LmZuLnBhcmFsbGF4Lm9wdGlvbnMgPSBvcHRpb25zO1xyXG5cdFxyXG5cdC8vIFBpY2sgdXAgYW5kIHN0b3JlIG1vdXNlIHBvc2l0aW9uIG9uIGRvY3VtZW50OiBJRSBkb2VzIG5vdCByZWdpc3RlclxyXG5cdC8vIG1vdXNlbW92ZSBvbiB3aW5kb3cuXHJcblx0ZG9jLm9uKCdtb3VzZW1vdmUucGFyYWxsYXgnLCBmdW5jdGlvbihlKXtcclxuXHRcdG1vdXNlID0gW2UucGFnZVgsIGUucGFnZVldO1xyXG5cdH0pO1xyXG59KGpRdWVyeSkpOyJdLCJmaWxlIjoianF1ZXJ5LnBhcmFsbGF4LmpzIn0=
