package model.diagnostics

import common.Logging
import java.util.concurrent.ConcurrentHashMap
import com.google.common.util.concurrent.AtomicDouble
import scala.collection.convert.Wrappers

object Metric extends Logging {

  private lazy val metrics  = Wrappers.JConcurrentMapWrapper(new ConcurrentHashMap[String, AtomicDouble]())

  def increment(prefix: String) = {
    if (!metrics.contains(prefix)) {
      metrics.put(prefix, new AtomicDouble(0))
    }
    metrics(prefix).getAndAdd(1)
  } 

  def count(prefix: String) {
    metrics(prefix).doubleValue()
  }
  
  // For the purpose of creating alarms we are more interested in increases in the average
  // number of errors over a minute.
  def averages = {
    val snapshot = metrics.toMap
    val total = snapshot.values.map(_.doubleValue()).sum
    snapshot.map(m => m._1 -> m._2.doubleValue() / total)
  }
  
  def reset() = metrics.clear()
}
