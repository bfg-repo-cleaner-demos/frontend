define([
    'qwery',
    'bonzo',
    'ajax',
    'common',
    'utils/to-array',
    'modules/detect',
    'modules/onward/history'
], function (
    qwery,
    bonzo,
    ajax,
    common,
    toArray,
    detect,
    History
) {

    var mostPopularUrl = 'http://foo.com',
        container = document.querySelector('.trailblock'),
        history = new History().get().map(function(item) {
            return item.id;
        });

    function cleanUrl(url) {
        return '/' + url.split('/').slice(3).join('/');
    }

    function getTrailUrl(trail) {
        return cleanUrl(trail.querySelector('.trail__headline a').href);
    }

    function getTrails() {
        return toArray(qwery('.trailblock li', container));
    }

    function isInHistory(trailId) {
        return history.some(function(id){
            return trailId === id;
        });
    }

    function getHeadline(trail) {
        return trail.querySelector('.trail__headline a').innerHTML;
    }

    function isQuestion(trail) {
        return getHeadline(trail).indexOf('?') > -1;
    }

    function append(trail) {
        bonzo(trail).detach().appendTo(bonzo(qwery('ul:last-of-type', container)));
    }

    function prepend(trail) {
        bonzo(trail).detach().prependTo(bonzo(qwery('ul:first-of-type', container)));
    }

    function labelAsQuestion(trail) {
        trail.setAttribute('data-link-name', trail.getAttribute('data-link-name') + ' | question');
    }

    function cloneHeader()  {
        //I know... This is very dirty
        bonzo(document.getElementById('related-content-head'))
            .text('Read next')
            .clone()
            .text((document.querySelector('.more-on-this-story')) ? 'More on this story' : 'Related content')
            .insertAfter(getTrails()[0]);
    }

    function deportTrailToRight(trail) {

    }

    var Question = function () {

        var self = this;

        this.id = 'StoryPackageQuestion';
        this.expiry = '2013-11-30';
        this.audience = 0.1;
        this.description = 'Test effectiveness of question based trails in storypackages';
        this.canRun = function(config) {
            if(config.page.contentType === 'Article'){
                common.mediator.on('modules:related:loaded', function() {
                    getTrails().forEach(function(trail) {
                        if(isQuestion(trail)) {
                            labelAsQuestion(trail);
                        }
                    });
                });
                return true;
            } else {
                return false;
            }
        };
        this.variants = [
            {
                id: 'Read',
                test: function() {
                    common.mediator.on('modules:related:loaded', function() {
                        getTrails().forEach(function(trail) {
                            if(isInHistory(getTrailUrl(trail))) {
                                append(trail);
                            }
                        });
                        if(detect.getLayoutMode() === 'mobile') {
                            cloneHeader();
                        } else {
                            deportTrailToRight(getTrails()[0]);
                        }
                    });
                }
            },
            {
                id: 'Question',
                test: function() {
                    common.mediator.on('modules:related:loaded', function() {
                        getTrails().forEach(function(trail) {
                            if(isQuestion(trail)) {
                                prepend(trail);
                            }
                        });
                        cloneHeader();
                    });
                }
            },
            {
                id: 'Popular',
                test: function() {
                    common.mediator.on('modules:related:loaded', function() {
                        ajax({
                            url: mostPopularUrl,
                            type: 'json',
                            crossOrigin: true
                        }).then(
                            function(resp) {
                                if(resp && 'trails' in resp) {
                                    resp.trails.forEach(function(trail) {
                                        if(isInHistory(trail)) {
                                            append(trail);
                                        } else {
                                            prepend(trail);
                                        }
                                    });
                                }
                            },
                            function(req) {
                                common.mediator.emit('module:error', 'Failed to load most popular onward journey' + req, 'modules/experiments/tests/story-question.js');
                            }
                        );
                        cloneHeader();
                    });
                }
            },
            {
                id: 'All',
                test: function() {
                    common.mediator.on('modules:related:loaded', function() {
                        self.variants.forEach(function(variant){
                            if(variant.id === 'Read' || variant.id === 'Question') {
                                variant.test.call(self);
                            }
                        });
                    });
                }
            },
            {
                id: 'control',
                test: function() {
                    return true;
                }
            }
        ];
    };

    return Question;

});
