package model.commercial.travel

import org.joda.time.DateTime

object Fixtures {

  val untaggedOffers = List(
    Offer(0,
      Some("Southern Tanzania"),
      "http://www.guardianholidayoffers.co.uk/holiday/4980/southern-tanzania",
      "http://resource.guim.co.uk/travel/holiday-offers-micro/image?id=33679&type=ThreeColumn",
      "5595"
      , new DateTime(2014, 1, 12, 0, 0),
      Nil,
      List("Tanzania")),
    Offer(1,
      Some("Lake Maggiore, Orta & the Matterhorn"),
      "http://www.guardianholidayoffers.co.uk/holiday/3552/lake-maggiore-orta-and-the-matterhorn",
      "http://resource.guim.co.uk/travel/holiday-offers-micro/image?id=26842&type=ThreeColumn",
      "979",
      new DateTime(2014, 4, 29, 0, 0),
      Nil,
      List("Italy", "Switzerland")),
    Offer(2,
      Some("Horse riding holiday for intermediate and experienced riders"),
      "http://www.guardianholidayoffers.co.uk/holiday/5037/horse-riding-holiday-for-intermediate-and-experienced-riders",
      "http://resource.guim.co.uk/travel/holiday-offers-micro/image?id=33819&type=ThreeColumn",
      "1284",
      new DateTime(2013, 11, 2, 0, 0),
      Nil,
      List("France"))
  )

  val offers = List(
    Offer(0,
      Some("Southern Tanzania"),
      "http://www.guardianholidayoffers.co.uk/holiday/4980/southern-tanzania",
      "http://resource.guim.co.uk/travel/holiday-offers-micro/image?id=33679&type=ThreeColumn",
      "5595"
      , new DateTime(2014, 1, 12, 0, 0),
      List(Keyword("travel/tanzania", "Tanzania")),
      List("Tanzania")),
    Offer(1,
      Some("Lake Maggiore, Orta & the Matterhorn"),
      "http://www.guardianholidayoffers.co.uk/holiday/3552/lake-maggiore-orta-and-the-matterhorn",
      "http://resource.guim.co.uk/travel/holiday-offers-micro/image?id=26842&type=ThreeColumn",
      "979",
      new DateTime(2014, 4, 29, 0, 0),
      List(Keyword("travel/italy", "Italy"), Keyword("travel/switzerland", "Switzerland")),
      List("Italy", "Switzerland")),
    Offer(2,
      Some("Horse riding holiday for intermediate and experienced riders"),
      "http://www.guardianholidayoffers.co.uk/holiday/5037/horse-riding-holiday-for-intermediate-and-experienced-riders",
      "http://resource.guim.co.uk/travel/holiday-offers-micro/image?id=33819&type=ThreeColumn",
      "1284",
      new DateTime(2013, 11, 2, 0, 0),
      List(Keyword("travel/france", "France")),
      List("France"))
  )

}
