package com.benjaminrosenbaum.jovian

//TODO move to Spwaning.scala
class MotileDensity(val motiles: Seq[Motile], val area: Double) {
	assert(area > 0)
	lazy val numberByKind: Map[String, Int] = motiles.groupBy(m => m.kind).mapValues(_.size).withDefaultValue(0) //TODO more efficient, could be O(N)
	def densityOf(kind: String) : Double = numberByKind(kind) / area
	def roomForMore(kind: String, maxDensity: Double) = densityOf(kind) < maxDensity
}