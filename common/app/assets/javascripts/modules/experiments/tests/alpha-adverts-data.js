/*global guardian */
define([
    'qwery',
    'bonzo',
    'modules/detect',
    'modules/analytics/adverts',
    'modules/adverts/sticky'
], function (qwery, bonzo, detect, inview, Sticky) {

    var AlphaAdvertsData = function () {

        var self = this,
            nParagraphs = '10',
            inlineTmp = '<div class="ad-slot ad-slot--inline"><div class="ad-container"></div></div>',
            mpuTemp = '<div class="ad-slot ad-slot--mpu-banner-ad" data-link-name="ad slot mpu-banner-ad" data-median="Middle1" data-extended="Middle1"><div class="ad-container"></div></div>',
            supportsSticky = detect.hasCSSSupport('position', 'sticky'),
            supportsFixed  = detect.hasCSSSupport('position', 'fixed', true);

        this.id = 'AlphaAdvertsData';
        this.expiry = '2013-11-30';
        this.audience = 0.01;
        this.description = 'Test new advert formats for alpha release';
        this.canRun = function(config) {
            if(config.page.contentType === 'Article') {
                return true;
            } else {
                return false;
            }
        };
        this.variants = [
            {
                id: 'Inline', //Article A
                test: function(context, isBoth) {
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha1.com';
                    var article = document.getElementsByClassName('js-article__container')[0];
                    bonzo(qwery('p:nth-of-type('+ nParagraphs +'n)'), article).each(function(el, i) {
                        var cls = (i % 2 === 0) ? 'is-odd' : 'is-even',
                            inviewName =  (isBoth) ? 'Both:Every '+ nParagraphs +'th para' : 'Inline:Every '+ nParagraphs +'th para';
                        bonzo(bonzo.create(inlineTmp)).attr({
                            'data-inview-name' : inviewName,
                            'data-inview-advert' : 'true',
                            'data-base' : 'Top2',
                            'data-median' : 'Middle',
                            'data-extended' : 'Middle'
                        }).addClass(cls).insertAfter(this);
                    });
                    inview(document);
                    return true;
                }
            },
            {
                id: 'Adhesive', //Article B
                test: function(context, isBoth) {
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha2.com';
                    var viewport = detect.getLayoutMode(),
                        inviewName,
                        s;
                    if(viewport === 'mobile' || viewport === 'tablet' && detect.getOrientation() === 'portrait') {
                        inviewName = (isBoth) ? 'Both:Top banner' : 'Adhesive:Top banner';
                        bonzo(qwery('.ad-slot--top-banner-ad')).attr('data-inview-name', inviewName);
                        bonzo(qwery('.parts__head')).addClass('is-sticky');
                        if(!supportsSticky && supportsFixed) {
                            s = new Sticky({
                                elCls: 'ad-slot--top-banner-ad',
                                id: 'Top2'
                            });
                        }
                    } else {
                        inviewName = (isBoth) ? 'Both:MPU' : 'Adhesive:MPU';
                        document.getElementsByClassName('js-mpu-ad-slot')[0].appendChild(bonzo.create(mpuTemp)[0]);
                        bonzo(qwery('.ad-slot--mpu-banner-ad')).attr('data-inview-name', inviewName);
                        if(!supportsSticky && supportsFixed) {
                            s = new Sticky({
                                elCls: 'js-mpu-ad-slot',
                                id: 'mpu-ad-slot'
                            });
                        }
                    }
                    inview(document);
                    return true;
                }
            },
            {
                id: 'Both',  //Article C
                test: function() {
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha3.com';
                    document.body.className += ' test-inline-adverts--on';
                    self.variants.forEach(function(variant){
                        if(variant.id === 'Inline' || variant.id === 'Adhesive') {
                            variant.test.call(self, {}, true);
                        }
                    });
                    return true;
                }
            },
            {
                id: 'control', //Article D
                test: function() {
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha.com';
                    return true;
                }
            }
        ];
    };

    return AlphaAdvertsData;

});
