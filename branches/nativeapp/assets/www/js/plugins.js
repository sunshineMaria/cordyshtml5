// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; try { args.callee = f.caller } catch(e) {}; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};

// make it safe to use console.log always
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());


// place any jQuery/helper plugins in here, instead of separate, slower script files.

(function($) {
	

	$.event.special.ihold = {
		setup: function(data, namespaces, eventHandle) {
			
		},
		teardown: function(namespaces) {
			
		},
		add: function(handleObj) {
			// $(handleObj.selector)
			
			/*var startTime, endTime;
			var gbMove = false;

			$(this).on('touchstart mousedown', handleObj.selector, function(e) {
				e.preventDefault();
				startTime = new Date().getTime();
				gbMove = false;
			})
				.on('touchmove', handleObj.selector, function(e) {
					e.preventDefault();
					gbMove = true;
				})

				.on('touchend mouseup mouseleave', handleObj.selector, function(e) {
					e.preventDefault();
					e.stopPropagation();
					endTime = new Date().getTime();
					if(!gbMove && (endTime-startTime) / 1000 > .75) {
						handleObj.handler(e);
					}
				});*/
			
			$(this).hammer().on('hold', handleObj.handler);///*, 'li'*/, self.ui.serverList.longPress
		},
		remove: function(handleObj) {
			// not implemented yet
			//throw new Error('This method is not implemented yet.');
			
			$(this).hammer().off('hold', handleObj.handler);
		},
		_default: function(event) {
			
		}
	};
	
	
}) (jQuery)