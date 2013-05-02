// Description: Sequence Swipe module
// Author: Stephan Fowler

define([
    'common',
    'swipeview',
    'bean',
    'bonzo',
    'ajax'
], function(
    common,
    SwipeView,
    bean,
    bonzo,
    ajax
) {

    function $(selector, context) {
        if (typeof selector === 'string'){
            context = context || document;
            return bonzo(context.querySelectorAll(selector));
        } else {
            return bonzo(selector);
        }
    }

    function extend(destination, source) {
        for (var property in source) {
            destination[property] = source[property];
        }
        return destination;
    }

    function isEmptyObj(obj) {
        for(var i in obj) {
            return false;
        }
        return true;
    }

    function normalizeUrl(url) {
        var a = document.createElement('a');
        a.href = url;
        a = a.pathname + a.search;
        a = a.indexOf('/') === 0 ? a : '/' + a; // because IE doesn't return a leading '/'
        return a;
    }

    var deBounce = (function () {
        var timers = {};
        return function (fn, time, key) {
            key = key || 1;
            clearTimeout(timers[key]);
            timers[key] = setTimeout(fn, time);
        };
    }());

    var uid = (function () {
        var i = 0;
        return {
            set: function (n) { i = n; },
            nxt: function () { return i += 1; },
            get: function () { return i; }
        };
    }());

    function mod(x, m) {
        return ((x % m) + m) % m;
    }

    function mod3(x) {
        return mod(x, 3);
    }

    var module = function (useropts) {

        var
            // general purpose do-nothing function
            noop = function () {},
            opts = extend(
                {
                    // Swipe container element
                    swipeContainer: undefined,

                    // Callback after a pane is loaded (including hidden panes); use for fancy js-managed rendering.
                    afterLoad: noop,

                    // Callback before any pane is made visible.
                    beforeShow: noop,

                    // Callback after a pane is made visible; use for analytics events, social buttons, etc.
                    afterShow: noop,

                    // CSS selector for anchors that should initiate an ajax+pushState reload.
                    linkSelector: '',

                    // The CSS selector for the element in each pane that should receive the ajax'd in content
                    bodySelector: '*',

                    // The name of the query param sent wth Ajax page-fragment requests
                    queryParam: 'frag_width',

                    // Initial sequence
                    sequence: [],

                    // CSS selector for a spinner/busy indicator
                    loadingIndicator: undefined
                },
                useropts
            ),

            swipeContainer = $(opts.swipeContainer),

            // Private vars
            androidVersion,
            body = $('body'),
            throttle,
            cache = {},
            canonicalLink = $('link[rel=canonical]'),
            config, // the current pane's config
            contentArea = swipeContainer[0],
            contentAreaTop = swipeContainer.offset().top,
            sequencePos = -1,
            sequence = [],
            sequenceLookup,
            sequenceLen = 0,
            sequenceChecksum,
            supportsHistory = false,
            supportsTransitions = false,
            inSequence = false,
            initialised,
            initialPage,
            initiatedBy = 'initial',
            noHistoryPush,
            visiblePane = $('#swipepages-inner > #swipepage-1', contentArea)[0],
            pageData,
            panes,
            paneNow = 1,
            paneThen = 1,
            vendorPrefixes = ['ms', 'Khtml', 'O', 'Moz', 'Webkit', ''],
            visiblePaneMargin = 0,
            hiddenPaneMargin = 0;

        function load(o) {
            var
                url = o.url,
                el = o.container,
                callback = o.callback || noop,
                spec,
                rx,
                i;
            if (url && el) {
                el.dataset = el.dataset || {};
                el.dataset.url = url;
                    
                // Ask the cache
                spec = cache[url];

                // Is cached ?
                if (spec) {
                    populate(el, spec);
                    common.mediator.emit('module:swipenav:pane:loaded', el);
                    callback();
                }
                else {
                    $(el).addClass('pending');
                    ajax({
                        url: url,
                        method: 'get',
                        type: 'jsonp',
                        jsonpCallbackName: 'swipePreload',
                        success: function (spec) {
                            $(el).removeClass('pending');
                            if (spec && spec.html && spec.config) {
                                // Only use if response still corresponds to the required content for this el
                                if (el.dataset.url === url) {
                                    populate(el, spec);
                                    cache[url] = spec;
                                    common.mediator.emit('module:swipenav:pane:loaded', el);
                                    callback();
                                }
                            } else {
                                spec = {
                                    html: '<div class="swipepage-msg">Oops. This page might be broken?</div>',
                                    config: {}
                                };
                                populate(el, spec);
                            }
                        }
                    });
                    if (o.showSpinner) {
                        spinner.show();
                    }
                }
            }
        }

        function populate(el, spec) {
            el.querySelector(opts.bodySelector).innerHTML = spec.html;
            spinner.hide();
            opts.afterLoad(el);
        }

        // Make the contentArea height equal to the visiblePane height. (We view the latter through the former.)
        function updateHeight() {
            var height = $('*:first-child', visiblePane).offset().height; // NB visiblePane has height:100% set by swipeview, so we look within it
            if (height) {
                $(contentArea).css('height', height + visiblePaneMargin + 'px');
            }
        }

        // Fire post load actions
        function doAfterShow (el) {
            var url,
                div,
                pos;

            updateHeight();
            throttle = false;

            if (initialPage) {
                initialPage = false;
                config = {
                    referrer: document.referrer
                };
                /*
                if (supportsHistory) {
                    ? create cache obj from the initial page from .parts__body and the config obj
                }
                */
            }
            else {
                url = el.dataset.url;
                setSequencePos(url);

                config = (cache[url] || {}).config || {};
                config.referrer = window.location.href; // works because we havent yet push'd the new URL

                if (config.webTitle) {
                    div = document.createElement('div');
                    div.innerHTML = config.webTitle; // resolves html entities
                    document.title = div.firstChild.nodeValue;
                }

                if (!noHistoryPush) {
                    var state = {
                        id: uid.nxt(),
                        sequencePos: sequencePos
                    };
                    doHistoryPush(state, document.title, url);
                }
                noHistoryPush = false;

                // Update canonical tag using pushed location
                canonicalLink.attr('href', window.location.href);
            }

            // Add swipe info & api to the config
            config.swipe = {
                visiblePane: el,
                initiatedBy: initiatedBy,
                api: api
            };

            // Fire the main aftershow callback
            opts.afterShow(config);
        }

        var spinner = (function () {
            var
                el = $(opts.loadingIndicator),
                obj = {};
            if(el.length) {
                obj.show = function () {
                    el.show();
                };
                obj.hide = function () {
                    el.hide();
                };
            }
            else {
                obj.show = obj.hide = noop;
            }
            return obj;
        }());

        function setSequencePos(url) {
            sequencePos = posInSequence(normalizeUrl(url));
            inSequence = (sequencePos > -1);
        }

        function posInSequence(url) {
            url = sequenceLookup[normalizeUrl(url)];
            return url ? url.pos : -1;
        }

        function urlInSequence(pos) {
            return pos > -1 && pos < sequenceLen ? sequence[pos].url : sequence[0].url;
        }

        function setSequence(arr) {
            var len = arr.length,
                pos,
                i;

            if (len >= 3) {
                sequence = arr;
                sequenceLen = len;
                sequenceLookup = {};
                window.console.log('Sequence:');
                for (i = 0; i < len; i += 1) {
                    arr[i].pos = i;
                    sequenceLookup[arr[i].url] = arr[i];
                    window.console.log(i + " " + arr[i].url);
                }
                setSequencePos(window.location.href);
                cache = {};
            }
        }

        function gotoUrl(url, dir) {
            var pos = posInSequence(url);
            if (normalizeUrl(window.location.pathname) === url) {
                dir = 0; // load back into visible pane
            }
            else if (typeof dir === 'undefined') {
                dir = pos > -1 && pos < sequencePos ? -1 : 1;
            }
            preparePane({
                url: url,
                dir: dir,
                slideIn: true
            });
        }

        function getAdjacentUrl(dir) {
            // dir = 1 : right
            // dir = -1 : left

            if (dir === 0) {
                return urlInSequence(sequencePos);
            }
            // Cases where we've got next/prev overrides in the current page's data
            else if (config.nextUrl && dir === 1) {
                return config.nextUrl;
            }
            else if (config.prevUrl && dir === -1) {
                return config.prevUrl;
            }
            // Cases where we've got an sequence position already
            else if (sequencePos > -1 && inSequence) {
                return urlInSequence(mod(sequencePos + dir, sequenceLen));
            }
            else if (sequencePos > -1 && !inSequence) {
                // We're displaying a non-sequence page; have current-sequence-page to the left, next-sequence-page to right
                return urlInSequence(mod(sequencePos + (dir === 1 ? 1 : 0), sequenceLen));
            }
            // Cases where we've NOT yet got an sequence position
            else if (dir === 1) {
                return urlInSequence(1);
            }
            else {
                return urlInSequence(0);
            }
        }

        function throttledSlideIn(dir) {
            if (!throttle) {
                throttle = true;
                slideInPane(dir);
            }
        }

        function validateClick(event) {
            var link = event.currentTarget;
            // Middle click, cmd click, and ctrl click should open links in a new tab as normal.
            if (event.which > 1 || event.metaKey || event.ctrlKey) { return; }
            // Ignore cross origin links
            if (location.protocol !== link.protocol || location.host !== link.host) { return; }
            // Ignore anchors on the same page
            if (link.hash && link.href.replace(link.hash, '') === location.href.replace(location.hash, '')) { return; }
            return true;
        }

        function gotoSequencePage(pos) {
            var dir;
            if (pos !== sequencePos && pos < sequenceLen) {
                dir = pos < sequencePos ? -1 : 1;
                sequencePos = pos;
                gotoUrl(urlInSequence(pos), dir);
            }
        }

        function doHistoryPush(state, title, url) {
            window.history.pushState(state, title, url);
        }

        function genChecksum(s) {
            var i;
            var chk = 0x12345678;
            for (i = 0; i < s.length; i++) {
                chk += (s.charCodeAt(i) * i);
            }
            return chk;
        }

        function preparePane(o) {
            var
                dir = o.dir || 0, // 1 is right, -1 is left.
                url = o.url,
                doSlideIn = !!o.slideIn,
                el;

            if (!url) {
                url = getAdjacentUrl(dir);
            }
            url = normalizeUrl(url); // normalize

            el = panes.masterPages[mod3(paneNow + dir)];
            
            // Only load if not already loaded into this pane, or cache has been flushed
            if (el.dataset.url !== url || isEmptyObj(cache)) {
                //el.querySelector(opts.bodySelector).innerHTML = ''; // Apparently this is better at preventing memory leaks that jQuert's .empty()
                load({
                    url: url,
                    container: el,
                    showSpinner: doSlideIn,
                    callback: function () {
                        // before slideInPane, confirm that this pane hasn't had its url changed since the request was made
                        if (doSlideIn && el.dataset.url === url) {
                            slideInPane(dir);
                        }
                    }
                });
            }
            else if (doSlideIn) {
                slideInPane(dir);
            }
        }

        function slideInPane(dir) {
            switch(dir) {
                case 1:
                    panes.next();
                    break;
                case -1:
                    panes.prev();
                    break;
                default:
                    common.mediator.emit('module:swipenav:pane:loaded', visiblePane);
            }
        }

        function loadSidePanes() {
            preparePane({
                dir: 1
            });
            preparePane({
                dir: -1
            });
        }

        // This'll be the public api
        var api = {
            setSequence: setSequence,

            loadSidePanes: loadSidePanes,

            getSequence: function(){
                return sequence;
            },

            gotoSequencePage: function(pos, type){
                initiatedBy = type ? type.toString() : 'position';
                gotoSequencePage(pos, type);
            },

            gotoUrl: function(url, type){
                initiatedBy = type ? type.toString() : 'link';
                gotoUrl(url);
            },

            gotoNext: function(type){
                initiatedBy = type ? type.toString() : 'screen_arrow';
                throttledSlideIn( 1);
            },

            gotoPrev: function(type){
                initiatedBy = type ? type.toString() : 'screen_arrow';
                throttledSlideIn(-1);
            }
        };

        // MAIN: Render the initial content

        // Detect capabilities
        if (window.history && history.pushState) {
            supportsHistory = true;
            // Revert supportsHistory for Android <= 4.0, unless it's Chrome/Firefox browser
            androidVersion = window.navigator.userAgent.match(/Android\s+([\d\.]+)/i);
            if (androidVersion && parseFloat(androidVersion[1]) <= 4.1) {
                supportsHistory = !!window.navigator.userAgent.match(/(Chrome|Firefox)/i);
            }
        }
        if (!supportsHistory) {
            return;
        }

        // Tests for vendor specific prop
        while(vendorPrefixes.length) {
            if (vendorPrefixes.pop() + 'Transition' in document.body.style) {
                supportsTransitions = true;
                break;
            }
        }
        if (!supportsTransitions) {
            return;
        }

        initialPage = normalizeUrl(window.location.href);

        setSequence(opts.sequence);

        // SwipeView init
        panes = new SwipeView(contentArea, {});

        panes.onFlip(function () {
            paneNow = mod3(panes.pageIndex+1);
            if (paneThen !== paneNow) {
                // shuffle down the pane we've just left
                $(panes.masterPages[paneThen]).css('marginTop', hiddenPaneMargin);
                visiblePaneMargin = hiddenPaneMargin;

                paneThen = paneNow;
                visiblePane = panes.masterPages[paneNow];

                common.mediator.emit('module:swipenav:pane:loaded', visiblePane);
            }
        });

        panes.onMoveOut(function () {
            initiatedBy = 'swipe';
        });

        // Identify and decorate the initially visible pane
        visiblePane = panes.masterPages[1];
        visiblePane.dataset.url = normalizeUrl(window.location.href);

        // Set a body class. Might be useful.
        body.addClass('has-swipe');

        common.mediator.on('module:swipenav:pane:loaded', function(el){
            if(el === visiblePane && !$(el).hasClass('pending')) {
                doAfterShow(el);
            }
        });

        // Bind clicks
        if (opts.linkSelector){
            bean.on(document, 'click', opts.linkSelector, function (e) {
                var
                    url;
                if (!validateClick(e)) { return true; }
                e.preventDefault();
                url = normalizeUrl($(this).attr('href'));
                if (url === normalizeUrl(window.location.href)) {
                    // Force a complete reload if the link is for the current page
                    window.location.reload(true);
                }
                else {
                    initiatedBy = 'link';
                    gotoUrl(url);
                }
            });
        }

        // Fix pane margins, so sidepanes come in at their top
        bean.on(window, 'scroll', function () {
            hiddenPaneMargin = Math.max( 0, body.scrollTop() - contentAreaTop );

            if( hiddenPaneMargin < visiblePaneMargin ) {
                // We've scrolled up over the offset; reset all margins and jump to topmost scroll
                $(panes.masterPages[mod3(paneNow)]).css(  'marginTop', 0);
                $(panes.masterPages[mod3(paneNow+1)]).css('marginTop', 0);
                $(panes.masterPages[mod3(paneNow-1)]).css('marginTop', 0);
                // And reset the scroll
                body.scrollTop( contentAreaTop );
                visiblePaneMargin = 0;
                hiddenPaneMargin = 0;
            }
            else {
                // We've scrolled down; push L/R sidepanes down to level of current pane
                $(panes.masterPages[mod3(paneNow+1)]).css('marginTop', hiddenPaneMargin);
                $(panes.masterPages[mod3(paneNow-1)]).css('marginTop', hiddenPaneMargin);
            }
        });

        bean.on(document, 'keydown', function (e) {
            initiatedBy = 'keyboard_arrow';
            switch(e.keyCode) {
                case 37: throttledSlideIn(-1);
                    break;
                case 39: throttledSlideIn(1);
                    break;
            }
        });

        // Bind back/forward button behavior
        window.onpopstate = function (event) {
            var
                state = event.state,
                popId,
                dir;
            // Ignore inital popstate that some browsers fire on page load
            if (!state) { return; }
            initiatedBy = 'browser_history';
            popId = state.id ? state.id : -1;
            // Deduce the bac/fwd pop direction
            dir = popId < uid.get() ? -1 : 1;
            uid.set(popId);
            // Prevent a history stats from being pushed
            noHistoryPush = true;
            sequencePos = state.sequencePos;
            // Reveal the newly poped location
            gotoUrl(normalizeUrl(window.location.href), dir);
        };

        // Set a periodic height adjustment for the content area. Necessary to account for diverse heights of side-panes as they slide in, and dynamic page elements.
        setInterval(function(){
            updateHeight();
        }, 509); // Prime number, for good luck

        common.mediator.emit('module:swipenav:pane:loaded', visiblePane);

        // Return an API
        return api;

    };

    return module;

});