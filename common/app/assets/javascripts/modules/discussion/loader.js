define([
    'ajax',
    'bonzo',
    'qwery',
    'modules/component',
    'modules/discussion/api',
    'modules/discussion/comments',
    'modules/discussion/comment-box',
    'modules/id'
], function(
    ajax,
    bonzo,
    qwery,
    Component,
    DiscussionApi,
    Comments,
    CommentBox,
    Id
) {

/**
 * We have a few rendering hacks in here
 * We'll move the rendering to the play app once we
 * have the discussion stack up that can read cookies
 * This is true for the comment-box / sigin / closed discussion
 * And also the premod / banned state of the user
 * @constructor
 * @extends Component
 * @param {Element=} context
 * @param {Object} mediator
 * @param {Object=} options
 */
var Loader = function(context, mediator, options) {
    this.context = context || document;
    this.mediator = mediator;
    this.setOptions(options);
};
Component.define(Loader);

/** @type {Element} */
Loader.prototype.context = null;

/** @type {Object.<string.*>} */
Loader.CONFIG = {
    componentClass: 'discussion',
    classes: {
        comments: 'discussion__comments',
        commentBox: 'discussion__comment-box',
        commentBoxBottom: 'discussion__comment-box--bottom',
        show: 'd-show-cta'
    }
};

/** @type {Comments} */
Loader.prototype.comments = null;

/** @type {CommentBox} */
Loader.prototype.commentBox = null;

/** @type {CommentBox} */
Loader.prototype.bottomCommentBox = null;

/** @override */
Loader.prototype.ready = function() {
    var id = this.getDiscussionId();

    // TODO (jamesgorrie): Move this into the Comments module
    this.getElem('comments').innerHTML = '<div class="preload-msg">Loading comments…<div class="is-updating"></div></div>';
    ajax({
        url: '/discussion'+ id +'.json'
    }).then(this.renderDiscussion.bind(this));
    bonzo(this.getElem('show')).remove();
};

/**
 * @param {Object} resp
 */
Loader.prototype.renderDiscussion = function(resp) {
    var commentsElem = this.getElem('comments');

    // comments
    commentsElem.innerHTML = resp.html;
    this.comments = new Comments(this.context, this.mediator, {
        initialShow: 2,
        discussionId: this.getDiscussionId()
    });
    this.comments.attachTo(commentsElem);

    this.comments.on('first-load', this.renderBottomCommentBox.bind(this));
    this.renderCommentBar();
};

/**
 * If discussion is closed -> render closed
 * If not signed in -> render signin,
 * Else render comment box
 */
Loader.prototype.renderCommentBar = function() {
    var user = Id.getUserFromCookie();

    if (this.getDiscussionClosed()) {
        this.renderDiscussionClosedMessage();
    } else if (!user) {
        this.renderSignin();
    } else {
        this.renderCommentBox();
    }
};

/** TODO: This logic will be moved to the Play app renderer */
Loader.prototype.renderDiscussionClosedMessage = function() {
    this.getElem('commentBox').innerHTML = '<div class="d-bar d-bar--closed">This discussion is closed for comments.</div>';
};

/** TODO: This logic will be moved to the Play app renderer */
Loader.prototype.renderSignin = function() {
    var url = Id.getUrl() +'/{1}?returnUrl='+ window.location.href;
    this.getElem('commentBox').innerHTML =
        '<div class="d-bar d-bar--signin">Open for comments. <a href="'+
            url.replace('{1}', 'signin') +'">Sign in</a> or '+
            '<a href="'+ url.replace('{1}', 'register') +'">create your Guardian account</a> '+
            'to join the discussion.'+
        '</div>';
};

/** TODO: This logic will be moved to the Play app renderer */
Loader.prototype.renderCommentBox = function() {
    var success = function(resp) {
        var user = resp.userProfile;
        // If this privateFields aren't there,
        // they're not the right person
        // More a sanity check than anything
        if (!user.privateFields) {
            this.renderSignin();
        } else if (!user.privateFields.canPostComment) {
            this.renderUserBanned();
        } else {
            this.commentBox = new CommentBox(this.context, this.mediator, {
                discussionId: this.getDiscussionId()
            });
            this.commentBox.render(this.getElem('commentBox'));
            if (!user.privateFields.isPremoderated) {
                bonzo(qwery('.d-comment-box__premod'), this.commentBox.elem).remove();
            }
        }
    };

    DiscussionApi
        .getUser()
        .then(success.bind(this));
};

Loader.prototype.renderBottomCommentBox = function() {
    var commentBoxElem = bonzo(this.commentBox.elem).clone()[0];
    bonzo(this.getElem('commentBoxBottom')).append(commentBoxElem);

    this.bottomCommentBox = new CommentBox(this.context, this.mediator, {
        discussionId: this.getDiscussionId()
    });
    this.bottomCommentBox.attachTo(commentBoxElem);
};

/**
 * @return {string}
 */
Loader.prototype.getDiscussionId = function() {
    return this.elem.getAttribute('data-discussion-id');
};

/**
 * @return {boolean}
 */
Loader.prototype.getDiscussionClosed = function() {
    return this.elem.getAttribute('data-discussion-closed') === 'true';
};

return Loader;

}); //define