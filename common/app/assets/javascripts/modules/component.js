define([
    'bean',
    'qwery',
    'bonzo'
], function(
    bean,
    qwery,
    bonzo
) {

/**
 * TODO (jamesgorrie):
 * * ERROR HANDLING!
 * * Find a way to run the Component constructor manually,
 *   Perhaps in the create method somewhere.
 * @constructor
 */
var Component = function() {};

/**
 * This object is an interface and meant to be overridden
 * mostly used for absttracting CSS classes.
 * This makes for easy testing, less duplication of string variables,
 * and hopefully, one day, in string compilation
 * @type {Object.<string.*>}
 */
Component.CONFIG = {
    templateName: 'component',
    componentClass: 'component',
    containerClass: 'component-container',
    classes: {},
    elements: {}
};

/** @type {Element|null} */
Component.prototype.context = null;

/** @type {Element|null} */
Component.prototype.elem = null;

/** @type {Object|string|null} */
Component.prototype.template = null;

/** @type {Object.<string.Element>} */
Component.prototype.elems = null;

/** @type {Object.<string.*>} */
Component.prototype.options = null;

/** @type {Object.<string.*>} */
Component.prototype.defaultOptions = {};

/**
 * Uses the CONFIG.componentClass
 * TODO (jamesgorrie): accept strings etc Also what to do with multiple objects?
 * @param {Element|string=} elem (optional)
 */
Component.prototype.attachTo = function(elem) {
    this.elems = {};

    elem = (elem && elem.nodeType === 1) ? [elem] : qwery('.'+ this.conf().componentClass, this.context);

    if (elem.length === 0) { throw new ComponentError('No element of type "'+ '.'+ this.conf().componentClass +'" to attach to.'); }
    this.elem = elem[0];
    this.ready();
};

/**
 * Uses the CONFIG.templateName
 * @param {Element=} parent (optional)
 */
Component.prototype.render = function(parent) {
    var conf = this.conf(),
        template = bonzo.create(document.getElementById('tmpl-'+ conf.templateName).innerHTML)[0],
        container = parent || document;

    this.elems = {};
    bonzo(container).append(template);
    this.elem = template;
    this.ready();
};

/**
 * Once the render / decorate methods have been called
 * This is where you could do your event binding
 * This function is made to be overridden
 */
Component.prototype.ready = function() {};

/**
 * Once we're done with it, remove event bindings etc
 */
Component.prototype.dispose = function() {};

/**
 * @param {string} eventName
 * @param {Element|Function} elem if ommited which is also handler
 * @param {Function} handler
 */
Component.prototype.on = function(eventName, elem, handler) {
    if (typeof elem === 'function') {
        handler = elem;
        bean.on(this.elem, eventName, handler.bind(this));
    } else {
        elem = !elem.length ? [elem] : elem;
        bean.on(this.elem, eventName, elem, handler.bind(this));
    }
};

/**
 * @param {string} eventName
 * @param {Object=} args (optional)
 */
Component.prototype.emit = function(eventName, args) {
    bean.fire(this.elem, eventName, args);
};

/**
 * TODO: After working on comments, wondering if this should support NodeLists
 * @param {string} elemName this corresponds to CONFIG.classes
 */
Component.prototype.getElem = function(elemName) {
    if (this.elems[elemName]) { return this.elems[elemName]; }
    var elem = qwery(this.getClass(elemName), this.elem)[0];
    this.elems[elemName] = elem;
    return elem;
};

/**
 * @param {string} eventName
 * @param {boolean} sansDot
 * @return {string}
 */
Component.prototype.getClass = function(elemName, sansDot) {
    var config = this.conf();
    return (sansDot ? '' : '.') + config.classes[elemName] || null;
};

/**
 * @return {Object}
 */
Component.prototype.conf = function() {
    return this.constructor.CONFIG;
};

/**
 * @param {Object} options
 */
Component.prototype.setOptions = function(options) {
    options = options || {};
    this.options = {};
    for (var prop in this.defaultOptions) {
        this.options[prop] = options[prop] || this.defaultOptions[prop];
    }
};

/**
 * @param {Function} child
 */
Component.define = function(child) {
    function Tmp() {}
    Tmp.prototype = Component.prototype;
    child.prototype = new Tmp();
    child.prototype.constructor = child;
};




/** @contructor */
function ComponentError(message) {
    return new Error('Component: '+ message);
}

return Component;

});