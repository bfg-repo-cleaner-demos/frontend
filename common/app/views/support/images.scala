package views.support

import model.{ImageElement, ImageContainer, ImageAsset}
import conf.Switches.ImageServerSwitch
import java.net.URI
import conf.Configuration

case class Profile(prefix: String, width: Option[Int] = None, height: Option[Int] = None, compression: Int = 10) {

  def elementFor(image: ImageContainer): Option[ImageAsset] = {
    val sortedCorps = image.imageCrops.sortBy(_.width)
    width.flatMap{ desiredWidth =>
      sortedCorps.find(_.width >= desiredWidth)
    }.orElse(image.largestImage)
  }

  def bestFor(image: ImageContainer): Option[String] =
    elementFor(image).flatMap(_.url).map{ url => ImgSrc(url, this) }


  def captionFor(image: ImageContainer): Option[String] =
    elementFor(image).flatMap(_.altText)
}

// Configuration of our different image profiles
object Contributor extends Profile("c", Some(140), Some(140), 70) {}
object GalleryLargeImage extends Profile("gli", Some(1024), None, 70) {}
object GalleryLargeTrail extends Profile("glt", Some(480), Some(288), 70) {}
object GallerySmallTrail extends Profile("gst", Some(280), Some(168), 70) {}
object FeaturedTrail extends Profile("f", Some(640), None, 70) {}
object ArticleMainPicture extends Profile("a", Some(640), None, 70) {}
object FrontItem extends Profile("fi", Some(300), None, 70) {}
object FrontItemMobile extends Profile("fi-mobile", Some(140), None, 70) {}
object FrontItemMain extends Profile("fim", Some(620), None, 70) {}
object FrontItemMainMobile extends Profile("fim-mobile", Some(300), None, 70) {}
object LargeThumbnail extends Profile("thumb", Some(220), None, 70)

// Just degrade the image quality without adjusting the width/height
object Naked extends Profile("n", None, None, 70) {}

object Profile {
  lazy val all = Seq(
    Contributor,
    GalleryLargeImage,
    GalleryLargeTrail,
    GallerySmallTrail,
    FeaturedTrail,
    Naked,
    ArticleMainPicture,
    FrontItem,
    FrontItemMobile,
    FrontItemMain,
    FrontItemMainMobile,
	LargeThumbnail
  )
}


object ImgSrc {

  val imageHost = "http://localhost:9001"// Configuration.images.path

  def apply(url: String, imageType: Profile): String = {
    val uri = new URI(url.trim)

    val isSupportedImage =
      uri.getHost == "static.guim.co.uk" &&
      !uri.getPath.toLowerCase().endsWith(".gif")

    if (isSupportedImage) {
      s"$imageHost/${imageType.prefix}${uri.getPath}"
    } else s"${url}"
  }
}

