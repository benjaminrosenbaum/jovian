package com.benjaminrosenbaum.jovian

trait Motivated extends Position {
	val id: String
	val kind : String
	val vel : Vector
	val energy: Double
	def asMotile: Motile
}

trait Motivation {
	type Motivateds = Seq[Motivated]
	type Positions = List[Position]

	def apply(m: Motivated, visibles: Motivateds) : Vector
	def and(mo: Motivation) = new AndedMotivation(this, mo)
	def trumps (mo: Motivation) = new TrumpedMotivation(this, mo)
	def butOnlyWithin(top: Double, bottom: Double) = new RangeLimitedMotivation(this, new Span(top, bottom))
	def whileHealthy(atLeast: Double) = new EnergyLimitedMotivation(this, atLeast = atLeast)
	def whileSick(atMost: Double) = new EnergyLimitedMotivation(this, atMost = atMost)
	def ifAbove() = new RelativePositionConstrainedMotivation(this, true)
	def ifBelow() = new RelativePositionConstrainedMotivation(this, false)
}

class RelativePositionConstrainedMotivation(underlying: Motivation, ifAbove: Boolean) extends Motivation {
	def apply(m: Motivated, visibles: Motivateds) : Vector = underlying.apply(m, visibles.filter(v => ifAbove == (m.pos.y < v.pos.y)))
}

class EnergyLimitedMotivation(underlying: Motivation, atLeast: Double = 0, atMost: Double = 10000) extends Motivation {
	def apply(m: Motivated, visibles: Motivateds) : Vector = if (m.energy < atLeast || m.energy > atMost) Vector.NULL else underlying.apply(m, visibles)
}

class RangeLimitedMotivation(underlying: Motivation, verticalSpan: Span) extends Motivation {
	def apply(m: Motivated, visibles: Motivateds) : Vector = underlying.apply(m, visibles.filter(v => verticalSpan.contains(v.pos.y)))
}

class VerticalRangeLimitMotivation(underlying: Motivation, verticalSpan: Span)

abstract class CombinedMotivation(m1: Motivation, m2: Motivation) extends Motivation {
	def apply(m: Motivated, visibles: Motivateds) : Vector = combine(m1.apply(m, visibles), () => m2.apply(m, visibles))
	def combine(v1: Vector, v2: () => Vector) : Vector
}

class TrumpedMotivation(m1: Motivation, m2: Motivation) extends CombinedMotivation(m1, m2) {
	def combine(v1: Vector, v2: () => Vector) : Vector = if (v1.equals(Vector.NULL)) v2() else v1
}
class AndedMotivation(m1: Motivation, m2: Motivation) extends CombinedMotivation(m1, m2) {
	def combine(v1: Vector, v2: () => Vector) : Vector = v1.plus(v2())
}

case class Dimensionality(val direction: Vector, val getCoord: Position => Double)
object Dimensionality {
	val Vertical = Dimensionality(Vector(0, 1), p => p.pos.y)
	val Horizontal = Dimensionality(Vector(1, 0), p => p.pos.x)
}

class StayWithin(min: Double = 0, max: Double = 1000000, force: Double = 1.0, dim: Dimensionality = Dimensionality.Vertical) extends Motivation {
	assert(min < max)
	def nudge(whence: Double) = if (whence < min) force else if (whence > max) -force else 0
	def apply(m: Motivated, visibles: Motivateds) = dim.direction.scaled(nudge(dim.getCoord(m)))
}

abstract class Flocking(range: Double, kinds: Seq[String] = Nil) extends Motivation {  //TODO consider making range an Option, skipping this if absent 
	def flock(m: Motivated, ms: Motivateds): Motivateds = {
		val flockKinds = if (kinds == Nil) List(m.kind) else kinds 
		ms.filter(f => f.id != m.id && m.pos.isWithinManhattanDistanceOf(f, range) && flockKinds.contains(f.kind)) //TODO consider some kind of cached "motiles by type" in zone
	}
	
	def averageOf(m: Motivated, ms: Motivateds, fn: (Motivated, Motivated) => Vector) = Vector.averageOf(flock(m, ms).map(f => fn(m, f)))
}
 
class CohereWithFlock (range: Double, force: Double, kinds: Seq[String] = Nil, minRange: Option[Double] = None) extends Flocking(range, kinds) {
	def towardsCenter(m: Motivated, ms: Motivateds) = if (ms == Nil) Vector.NULL else m.pos.to(Position.centerOf(flock(m, ms)))
	def nullIfTooClose(v: Vector) : Option[Vector] = for { r: Double <- minRange if v.manhattanDist < r } yield Vector.NULL
	def apply(m: Motivated, ms: Motivateds) = {
		val v = towardsCenter(m, flock(m, ms))
		nullIfTooClose(v) getOrElse v.scaledTo(force)  
	}
}

class SeparateFromFlock (range: Double, force: Double, kinds: Seq[String] = Nil) extends Flocking(range, kinds) {
	def separation = (m: Motivated, f: Motivated) => f.pos.to(m).normalized
  	def apply(m: Motivated, ms: Motivateds) =  averageOf(m, ms, separation).scaled(force)
}

class AlignWithFlock (range: Double, force: Double, kinds: Seq[String] = Nil) extends Flocking(range, kinds) {
	def apply(m: Motivated, ms: Motivateds) = averageOf(m, ms, (m, f) => f.vel).scaledTo(force)
}

class Hunt (range: Double, force: Double, kinds: Seq[String]) extends CohereWithFlock(range, force, kinds) {
	def nearest(m: Motivated, ms: Motivateds) = ms.sortBy(f => -f.pos.to(m).manhattanDist).take(1)
	override def flock(m: Motivated, ms: Motivateds): Motivateds = nearest(m, super.flock(m, ms))
}

class Flee (range: Double, force: Double, kinds: Seq[String]) extends Hunt(range, force, kinds) {
	override def apply(m: Motivated, visibles: Motivateds) = super.apply(m, visibles).scaled(-1); //simply the opposite of hunt
}

class Quiescence extends Motivation {
	def apply(m: Motivated, visibles: Motivateds) = Vector.NULL
}

object CohereWithFlock {
	def apply(range: Double, force: Double) = new CohereWithFlock(range, force, Nil, None)
	def apply(range: Double, force: Double, kinds: Seq[String]) = new CohereWithFlock(range, force, kinds, None)
	def apply(range: Double, force: Double, minRange: Double) = new CohereWithFlock(range, force, Nil, Some(minRange))
	def apply(range: Double, force: Double, kinds: Seq[String], minRange: Double) = new CohereWithFlock(range, force, kinds, Some(minRange))
}
 
object SeparateFromFlock {
	def apply(range: Double, force: Double, kinds: Seq[String] = Nil) = new SeparateFromFlock(range, force, kinds)
}

object AlignWithFlock {
	def apply(range: Double, force: Double, kinds: Seq[String] = Nil) = new AlignWithFlock(range, force, kinds)
}

object StayWithin {
	def apply(top: Double = 0, bottom: Double = 1000000, force: Double = 1.0) = new StayWithin(top, bottom, force)
}


object AvoidHorizontalPlaneEdges {
	def apply(buffer: Double = 50, force: Double = 1.0) = new StayWithin(buffer, Plane.Width - buffer, force, Dimensionality.Horizontal)
}

object Hunt {
	def apply(kinds: Seq[String], range: Double, force: Double) = new Hunt(range, force, kinds)
	def apply(kind: String, range: Double, force: Double) = new Hunt(range, force, List(kind))
}

object Flee {
	def apply(kinds: Seq[String], range: Double, force: Double) = new Flee(range, force, kinds)
	def apply(kind: String, range: Double, force: Double) = new Flee(range, force, List(kind))
}
