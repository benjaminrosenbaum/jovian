package com.benjaminrosenbaum.jovian

import utest._

object GeometryTest extends TestSuite {
  
	val a = new Point(-3, 7)
	val b = new Point(9, -9)
	val c = new Point(1, -15)
	val d = new Point(-9, 7)
	val e = new Point(3, 7)
	val f = new Point(2, -4)
	val g = new Point(10, -16)
	val h = new Point(8, 6)
	val all = List(a,b,c,d,e,f,g,h)
	val vAB = new Vector(12, -16)
	val vABm5 = new Vector(3, -4)


	def tests = TestSuite { 
		'addPoints {
			val p: Point = new Point(3,4)
			val q: Point = new Point(4,3)
			val expected: Point = new Point(7,7)
		  	assert(p.plus(q).equals(expected))
		}
		'scaledPoint {
			val p = new Point(3,4)
			val expected = new Point(1.5, 2)
			assert(p.scaled(0.5).equals(expected))
		}
		'averageOfPoints {
			val points = List(new Point(1,1), new Point(3,1), new Point(1,-1), new Point(3,-1))
			val actual = Point.centerOf(points)
    		assert(actual.equals(new Point(2,0)))
		}
		'averageOfNoPoints {
			val points = List()
			val actual = Point.centerOf(points)
    		assert(actual.equals(Point.ORIGIN))
		}
		'vectorBetweenPoints {
			assert(a.to(b).equals(vAB))
		}
		'addVectorToPoint {
			val p = new Point(100,100)
			val v = new Vector(-3,-4)
			assert(p.plus(v).equals(new Point(97, 96)))
		}
		'distanceBetweenPoints {
			assert(a.distanceTo(b).equals(20))
		}
		'vectorScaledTo {
			assert(vAB.scaledTo(5).equals(vABm5))
		}
		'withinManhattanDistance {
			val dist = e.to(h).manhattanDist
			assert(dist == 6)
		}
		'allWithinManhattanDistance {
			val expected = List(a,d,e,f,h)
			val actual = a.allWithinManhattanDistanceOf(all, 16)
			assert(expected == actual)
		}
		'ranges {
			val s12 = new Span(1.0,2.0)
			val s03 = new Span(0.0,3.0)
			val s35 = new Span(3.0,5.0)
			val s46 = new Span(4.0,6.0)
			def yes(s1: Span, s2: Span) = assert(s1.intersects(s2) && s2.intersects(s1))
			def no(s1: Span, s2: Span) = assert(!s1.intersects(s2) && !s2.intersects(s1))
			* - { yes(s03, s12) }
			* - { no(s12, s35) }
			* - { no(s12, s46) }
			* - { yes(s03, s35) }
			* - { no(s03, s46) }
			* - { yes(s35, s46) }
		}
		'intersectingSquares {
			val A = new Square(new Point(1.0,4.0), 2.0)
			val B = new Square(new Point(3.0,4.0), 4.0)
			val C = new Square(new Point(3.0,4.0), 2.0)
			val D = new Square(new Point(5.0,6.0), 2.0)
			val E = new Square(new Point(6.0,1.0), 2.0)
			val F = new Square(new Point(8.0,4.0), 2.0)
			def yes(s1: Square, s2: Square) = assert(s1.intersects(s2) && s2.intersects(s1))
			def no (s1: Square, s2: Square) = assert(!s1.intersects(s2) && !s2.intersects(s1))
			* - { yes(A, B) }
			* - { yes(A, C) }
			* - { no(A, D) }
			* - { no(A, E) }
			* - { no(A, F) }
			* - { yes(B, B) }
			* - { yes(B, C) }
			* - { yes(B, D) }
			* - { yes(B, E) }
			* - { no(B, F) }
			* - { yes(C, D) }
			* - { no(C, E) }
			* - { no(C, F) }
			* - { no(D, E) }
			* - { no(D, F) }
			* - { no(E, F) }
		}
		'changeDirectionBy
		{
			val v1 = new Vector(3,4)
			val v2 = new Vector(-12,2)
			val v3 = new Vector(3,2)
			val resultant = new Vector(-3,4)
			assert(v1.changeDirectionBy(List(v2,v3)).equals(resultant))
		}
  }
}
