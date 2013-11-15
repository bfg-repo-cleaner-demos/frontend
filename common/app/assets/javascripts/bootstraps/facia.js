define([
    // Common libraries
    'common',
    'bonzo',
    // Modules
    'modules/detect',
    'modules/facia/popular',
    'modules/facia/collection-show-more',
    'modules/facia/container-toggle',
    'modules/sport/football/fixtures',
    'modules/sport/cricket'
], function (
    common,
    bonzo,
    detect,
    popular,
    CollectionShowMore,
    ContainerToggle,
    FootballFixtures,
    cricket
    ) {

    var hiddenCollections = {},
        modules = {


        showCollectionShowMore: function () {
            common.mediator.on('page:front:ready', function(config, context) {
                common.$g('.container', context).each(function(container) {
                    common.$g('.js-collection--show-more', container).each(function(collection) {
                        var collectionShowMore = new CollectionShowMore(collection);
                        hiddenCollections[container.getAttribute('data-id')] = collectionShowMore;
                        collectionShowMore.addShowMore();
                    });
                });
            });
        },

        showContainerToggle: function () {
            common.mediator.on('page:front:ready', function(config, context) {
                common.$g('.js-container--toggle', context).each(function(container) {
                    new ContainerToggle(container)
                        .addToggle();
                });
            });
        },

        showFootballFixtures: function(path) {
            common.mediator.on('page:front:ready', function(config, context) {
                if (config.page.edition === 'UK' && (config.page.pageId === "" || config.page.pageId === "sport")) {
                    // wrap the return sports stats component in an 'item'
                    var prependTo = bonzo(bonzo.create('<li class="item item--sport-stats item--sport-stats-tall"></li>'));
                    common.mediator.on('modules:footballfixtures:render', function() {
                        var $container = common.$g('.container--news[data-id$="/sport/regular-stories"]', context),
                            $collection = common.$g('.collection', $container[0]);
                        common.$g('.item:first-child', $collection[0])
                            // add empty item
                            .after(prependTo);
                        $collection.removeClass('collection--without-sport-stats')
                            .addClass('collection--with-sport-stats');
                        // remove the last two items
                        var hiddenCollection = hiddenCollections[$container.attr('data-id')];
                        if (hiddenCollection) {
                            var $items = common.$g('.item:nth-last-child(-n+2)', $collection[0])
                                            .remove();
                            hiddenCollection.addExtraItems($items);
                        }
                    });
                    new FootballFixtures({
                        prependTo: prependTo,
                        attachMethod: 'append',
                        competitions: ['500', '510', '100', '400'],
                        contextual: false,
                        expandable: true,
                        numVisible: config.page.pageId === "" ? 3 : 5
                    }).init();
                }
            });
        },

        showPopular: function () {
            common.mediator.on('page:front:ready', function(config, context) {
                popular.render(config);
            });
        },

        showCricket: function(){
            common.mediator.on('page:front:ready', function(config, context) {
                cricket.cricketTrail(config, context);
            });
        }

    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.showCollectionShowMore();
            modules.showContainerToggle();
            modules.showFootballFixtures();
            modules.showPopular();
        }
        common.mediator.emit("page:front:ready", config, context);
    };

    return {
        init: ready
    };

});
