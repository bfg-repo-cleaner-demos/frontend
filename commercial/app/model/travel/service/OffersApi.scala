package model.travel.service

import play.api.libs.ws.WS
import scala.concurrent.Future
import common.ExecutionContexts
import scala.xml.XML
import model.travel.Offer

object OffersApi extends ExecutionContexts {

  def getAllOffers: Future[Seq[Offer]] = {
    WS.url("http://extranet.gho.red2.co.uk/Offers/XmlOffers") get() map {
      response =>
        (XML.loadString(response.body) \\ "offer").zipWithIndex map {
          case (xml, idx) => Offer(idx, xml)
        }
    }
  }

}
