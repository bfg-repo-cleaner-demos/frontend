package controllers

import model.Cached
import common.JsonComponent
import play.api.mvc.Action
import play.api.libs.json.Json
import discussion.model.Comment

trait TopCommentsController extends DiscussionController {

  def topCommentsPageJson(shortUrl: String) = topCommentsPage(shortUrl)

  def topCommentsPage(shortUrl: String) = Action.async {
    implicit request =>
      val page = request.getQueryString("page").getOrElse("1")
      val commentPage = discussionApi.topCommentsFor(shortUrl, page)
      val blankComment = Comment(Json.parse("""{
        "id": 5,
        "body": "",
        "responses": [],
        "userProfile": {
          "userId": "",
          "displayName": "",
          "webUrl": "",
          "apiUrl": "",
          "avatar": "",
          "secureAvatarUrl": "",
          "badge": []
        },
        "isoDateTime": "2011-10-10T09:25:49Z",
        "status": "visible",
        "numRecommends": 0,
        "isHighlighted": false
      }"""))

      commentPage map {
        commentPage =>
          Cached(60) {
            if (request.isJson)
              JsonComponent(
                "html" -> views.html.fragments.topCommentsBody(commentPage, blankComment).toString,
                "hasMore" -> commentPage.hasMore,
                "currentPage" -> commentPage.currentPage
              )
            else
              Ok(views.html.comments(commentPage))
          }
      }
  }

}
