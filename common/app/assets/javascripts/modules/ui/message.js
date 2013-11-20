define([
    "$",
    "bean",
    "utils/storage",
    "modules/userPrefs"
], function (
    $,
    bean,
    storage,
    userPrefs
) {

    function Message(id) {
            
        var self = this;

        this.prefs = 'message.' + id;
        this.header = $('#header');
        this.copy = $('.js-site-message-copy');
        this.container = $('.site-message');

        bean.on(document, 'click', '.js-site-message-close', function(e) {
            self.acknowledge();
        });
    }

    Message.prototype.show = function(message) {
        this.copy.html(message);
        this.header.addClass('js-site-message');
        this.container.removeClass('u-h');
    };
    
    Message.prototype.hasSeen = function() {
        return !!userPrefs.get(this.prefs);
    };

    Message.prototype.remember = function() {
        userPrefs.set(this.prefs, true);
    };
    
    Message.prototype.acknowledge = function() {
        this.remember();
        this.hide();
    };
   
    Message.prototype.hide = function() {
        this.header.removeClass('js-site-message');
        this.container.addClass('u-h');
    };
    
    return Message;
});
