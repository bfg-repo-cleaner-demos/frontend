import common.{CommercialMetrics, Jobs}
import conf.RequestMeasurementMetrics
import dev.DevParametersLifecycle
import model.commercial.masterclasses.MasterClassAgent
import model.commercial.jobs.JobsAgent
import model.commercial.travel.OffersAgent
import play.api.mvc.WithFilters
import play.api.{Application => PlayApp, GlobalSettings}

trait CommercialLifecycle extends GlobalSettings {

  override def onStart(app: PlayApp) {
    super.onStart(app)

    Jobs.deschedule("TravelOffersRefreshJob")
    Jobs.deschedule("JobsRefreshJob")
    Jobs.deschedule("MasterClassRefreshJob")

    OffersAgent.refresh()
    JobsAgent.refresh()
    MasterClassAgent.refresh()

    // fire every 15 mins
    Jobs.schedule("TravelOffersRefreshJob", "0 2/15 * * * ?", CommercialMetrics.TravelOffersLoadTimingMetric) {
      OffersAgent.refresh()
    }

    // fire at 3 mins past every hour
    Jobs.schedule("JobsRefreshJob", "0 3 * * * ?", CommercialMetrics.JobsLoadTimingMetric) {
      JobsAgent.refresh()
    }

    // fire every 15 minutes
    Jobs.schedule("MasterClassRefreshJob", "0 4/15 * * * ?", CommercialMetrics.MasterClassesLoadTimingMetric) {
      MasterClassAgent.refresh()
    }

  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("TravelOffersRefreshJob")
    Jobs.deschedule("JobsRefreshJob")
    Jobs.deschedule("MasterClassRefreshJob")
    super.onStop(app)
  }
}

object Global
  extends WithFilters(RequestMeasurementMetrics.asFilters: _*)
  with CommercialLifecycle
  with DevParametersLifecycle
