package com.benjaminrosenbaum.jovian

import utest._
import scala.math._

object MotivationTest extends TestSuite {
	var lastId = 0; //i guess this mutable is ok in a test...

	class TestMotivated(val pos: Point, val kind: String = "Foo", val vel : Vector = Vector.NULL) extends Motivated {
		val id: String = { lastId = (lastId + 1); kind + "#" + lastId;  }
		val energy: Double = 10
		def asMotile = ???
	} 
	
	class ConstantMotivation(fixed: Vector) extends Motivation {
		def apply(m: Motivated, visibles: Motivateds) = fixed
	}

	val m = new TestMotivated(Point.ORIGIN)

	def tests = TestSuite {
		val down = new Vector(0, 1)
		val right = new Vector(1, 0)
		val goDown = new ConstantMotivation(down)
		val goRight = new ConstantMotivation(right)

		'motivate {
			val expected = down
			val result = goDown.apply(m, Nil)
			assert(expected.equals(result))
		}

		'and {
			val expected = new Vector(1, 1)
			val result = (goDown and goRight).apply(m, Nil)
			assert(expected.equals(result))
		}

		'trumps {
			val downWins = (goDown trumps goRight).apply(m, Nil)
			val rightWins = (goRight trumps goDown).apply(m, Nil)
			assert(downWins.equals(down))
			assert(rightWins.equals(right))
		}

		val cross = List(new Point(-2,3),new Point(2,-1), new Point(1,2), new Point(-1,0)).map(p => new TestMotivated(p, vel = Point.ORIGIN.to(p)))
		val subject = new TestMotivated(new Point(-1, 2))
		'cohesionExcludingSomeFlockers {
			val motivation = CohereWithFlock(kinds = List("Foo"), range = 3, force = sqrt(2))
			val coherence = motivation(subject, cross)
			assert(coherence.equals(Vector(1,-1)))
		}
		'cohesionTooNearCenter {
			val motivation = CohereWithFlock(kinds = List("Foo"), range = 3, force = 5, minRange = 3)
			val coherence = motivation(subject, cross)
		    assert(Vector.NULL.equals(coherence))
		}
		'separation {
			val motivation = SeparateFromFlock(kinds = List("Foo"), range = 10, force = 10)
			val separation = motivation(subject, cross)
			assert(separation.equals(Vector(-2.5, 2.5)))
		}

		'alignment {
			val motivation = new AlignWithFlock(range = 10, force = 10)
			val alignment = motivation(subject, cross)
			assert(alignment.equals(Vector(0, 10)))
		}
		'stayAbove {
			val motivation = StayWithin(top = 5, force = 3)
			val push = motivation(subject, cross)
			assert(push.equals(Vector(0, 3)))
		}
		'stayBelow {
			val motivation = StayWithin(bottom = 1, force = 3)
			val push = motivation(subject, cross)
			assert(push.equals(Vector(0, -3)))
		}
		'avoidLeftEdge {
			val motivation = AvoidHorizontalPlaneEdges(buffer = 10, force = 3)
			val push = motivation(new TestMotivated(new Point(5, 5)), Nil)
			assert(push.equals(Vector(3, 0)))
		}
		'avoidRightEdge {
			val motivation = AvoidHorizontalPlaneEdges(buffer = 10, force = 3)
			val push = motivation(new TestMotivated(new Point(Plane.Width - 9, 0)), Nil)
			assert(push.equals(Vector(-3, 0)))
		}
	}	
}