package com.benjaminrosenbaum.jovian
import scala.scalajs.js
import scala.scalajs.js.annotation._
import scala.annotation.meta.field
import scala.math._


//TODO decouple from spawning
object Plane { 
	val Width = 1500 
	val Height = 1800 
	val Buffer = 30
	val XSpan = new Span(0, Width)
	val YSpan = new Span(0, Height)

	def intoBottom(y : Double) = max(0, Buffer - (Height - y))/Buffer
	def intoRight(x : Double) = max(0, Buffer - (Width - x))/Buffer
	def intoLeft(x: Double) = max(0, Buffer - x)/Buffer
		
} 

abstract class Coords[T <: Coords[T]] (val x : Double, val y: Double) {
	//type T <: Coords

	val epsilon = 0.00001
	def copy(x : Double = x, y : Double = y) : T
	def plus[U <: Coords[U]](c: Coords[U]) = copy(c.x + x, c.y + y)
	def scaled(factor: Double) = copy(x * factor, y * factor)
	def equals(c: Coords[T]) = abs(x - c.x) + abs(y - c.y) < epsilon
	override def toString(): String = "(" + x + "," + y + ")"  	

	//this Coords object acts as the default object
	def averageAmong(ps : Seq[T]) : T = {
		val scale = if (ps.length == 0)  1.0 else (1.0 / ps.length)     
		val sum = ps.fold(this)((a, b) => a.plus(b))		 
		sum.scaled(scale)
	}
}

@JSExport
class Vector (
	@(JSExport @field) override val x : Double, 
	@(JSExport @field) override val y: Double) extends Coords[Vector](x,y) {
	//type T = Vector
	override def copy(x : Double = x, y : Double = y) = new Vector(x, y)
	def magnitude = sqrt(x * x + y * y);  //TODO memoize?
	def theta = atan2(y, x) - Pi/2
	def manhattanDist = abs(x) + abs(y)

	//vector between 0 and 1 in magnitude, for multiplying
	def normalized = if (equals(Vector.NULL)) Vector.NULL else scaled(1.0 / magnitude)
	def scaledTo(mag: Double) = normalized.scaled(mag);
	def capMagnitudeAt(mag: Double) = if (magnitude > mag) scaledTo(mag) else this  //NOTE possible performance optimization comparing w/square of mag

	//sum all the vectors, normalize to initial speed
	def changeDirectionBy(vs: Seq[Vector]) = vs.foldLeft(this)((v1,v2) => v1.plus(v2)).scaledTo(magnitude)
	
}

trait Position { 
	def pos : Point 
	//def to(p: Position) : Vector = pos.to(p)
}

@JSExport 
class Point (
	@(JSExport @field) override val x : Double, 
	@(JSExport @field) override val y: Double) extends Coords[Point](x,y) with Position {
	//type T = Point
	override def copy(x : Double = x, y : Double = y) = new Point(x, y)
	def to(p: Position) = new Vector(p.pos.x - x, p.pos.y - y)
	def distanceTo(p: Position) = if (equals(p.pos)) 0 else to(p).magnitude
	def isWithinManhattanDistanceOf[T <: Position](p : T, dist: Double) = to(p).manhattanDist <= dist
	def allWithinManhattanDistanceOf[T <: Position](ps : Seq[T], dist: Double) = ps.filter(isWithinManhattanDistanceOf(_, dist))
	override def pos = this

	def constrainToPlane : Point = 
		if (Plane.XSpan.contains(x) && Plane.YSpan.contains(y)) this else copy( (x + Plane.Width) % Plane.Width, min(max(0, y),Plane.Height))
}


//the line y = mx + b
abstract class Line (val m: Double, val b: Double) {
	def yFor(x: Double) = m * x + b
	def intersects(other : Line) = m == other.m;
	def intersectsAt(other: Line) : Option[Point] = 
		if (!intersects(other)) None
		else {
			val x = (other.b - b)/(m - other.m)	
			Some(new Point(x, yFor(x)))
		}
}

class Span(val lower: Double, val higher: Double) {
	assert(lower <= higher)
	def contains(d: Double): Boolean = d >= lower && d <= higher
	def contains(s: Span): Boolean = contains(s.lower) || contains(s.higher)
	def intersects(s: Span) =  contains(s) || s.contains(this)
	override def toString: String = lower + " -> " + higher
}


@JSExport
class Square (@(JSExport @field) val center: Point, @(JSExport @field) val side: Double ) {
	@JSExport val top    = center.y + side/2;
	@JSExport val left   = center.x - side/2;
	@JSExport val bottom = center.y - side/2;
	@JSExport val right  = center.x + side/2;
	val xSpan = new Span(left, right)
	val ySpan = new Span(bottom, top)
	def copy(center: Point = center, side: Double = side) = new Square(center, side)
	def contains(p: Point) : Boolean = p.x >= left && p.x <= right && p.y <= top && p.y >= bottom
	def intersects(s: Square) : Boolean = xSpan.intersects(s.xSpan) && ySpan.intersects(s.ySpan) 
	def manhattanDistTo(s: Square) : Double = center.to(s.center).manhattanDist
	def depthOfPenetration(s: Square): Double = {
		val d = manhattanDistTo(s)               //a ratio of how far "in" a colliding square has gotten
		if (d == 0) 0 else (side + s.side)/d     //touching at corners is 1, touching sides is 2, halfway in laterally is 4
	}
	override def toString: String = s"($left,$bottom)-($right,$top)"
}

object Point {
	val ORIGIN = new Point(0,0)
	def centerOf(ps : Seq[Point]) : Point = ORIGIN.averageAmong(ps)
	def apply(x: Double, y: Double): Point = new Point(x, y)
}

object Position {
	def centerOf(ps: Seq[Position]) : Point = Point.centerOf(ps.map(p => p.pos))
}

object Vector {
	val NULL = new Vector(0,0)
	def averageOf(vs : Seq[Vector]) : Vector = NULL.averageAmong(vs)
	def apply(x: Double, y: Double): Vector = new Vector(x, y)
}
