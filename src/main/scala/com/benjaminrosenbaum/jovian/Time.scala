package com.benjaminrosenbaum.jovian
import scala.scalajs.js
import scala.scalajs.js.annotation._
import js.JSConverters._

class TimeEngine(val motiles: List[Motile], val wind: Vector, val elasticity: Double) {
	def step : Seq[Motile] = {
		val (collisions, resultantColliders) = CollisionResolution.getCollisionsAndCollidables(motiles, elasticity)
		val resultantMotiles = resultantColliders.map(c => c.asMotile)
		//TODO to improve performance, prepare data structure optimized for search by kind and distance... 
		resultantMotiles.map(m => m.motivated(resultantMotiles).inEnvironment(wind).step)
	}
}

@JSExport
object TimeEngine {
	@JSExport def step(motiles: js.Array[Motile], wind: Vector, elasticity: Double = 3.0) : js.Array[Motile] = 
	{
		val t = new TimeEngine(motiles.toArray.toList, wind, elasticity)
		t.step.toJSArray
	}
}
