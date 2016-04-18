package com.benjaminrosenbaum.jovian
import scala.scalajs.js
import scala.scalajs.js.Dynamic
import scala.scalajs.js.annotation._
import scala.annotation.meta.field
import scala.math._
import js.JSConverters._

trait Identity {
	def id : String
	def kind : String
	def nature : Nature = Natures.get(kind)
}

@JSExport
case class Motile (
				@(JSExport @field) override val id: String,
				@(JSExport @field) override val kind: String, 
				@(JSExport @field) override val nature: Nature,
				@(JSExport @field) val energy: Double,
				@(JSExport @field) val fertility: Double,
				@(JSExport @field) val acc: Vector = Vector.NULL,
				@(JSExport @field) val vel: Vector = Vector.NULL,
				@(JSExport @field) val rawPos: Point = Point.ORIGIN) 
		extends Identity with Position with Colliding with Motivated {
		
	@JSExport override val pos = rawPos.constrainToPlane  //TODO constrain to plane?

//Console.println(s"created Scala motile $id at pos $pos, vel $vel, acc $acc")	

	lazy val size = nature.size
	lazy val strength = nature.size //for now, strength is just size
	lazy val damage = strength / 5 //for now, damage done is just 20% of strength
	lazy val maxSpeed = nature.kinetics.maxSpeed
	lazy val maxForce = nature.kinetics.maxForce
	lazy val maxEnergy = nature.life.maxEnergy
	lazy val healing = nature.life.healing
	lazy val nutrition = nature.life.nutrition
	lazy val friction = nature.kinetics.friction
	lazy val box = new Square(pos, size)

	def addEnergy(e : Double) = copy(energy = min(energy + e, maxEnergy))
	def addFertility(f : Double) = copy(fertility = min(fertility + f, 100)) //maxfertility is always 100 for now
	def moveTo(p: Point) = copy(rawPos = p)
	def setVelocity(v: Vector) = copy(vel = v.capMagnitudeAt(maxSpeed))
	def addVelocity(v: Vector) = setVelocity(vel.plus(v))
	def setAcceleration(a: Vector) = copy(acc = a.capMagnitudeAt(maxForce))
	def addAcceleration(a: Vector) = setAcceleration(acc.plus(a))

	def nourish(nutrition: Double) = //addEnergy(nutrition).addFertility(max(0, nutrition - 15)/4) 
	{
		val energized = addEnergy(nutrition)
		val fertilizer = max(0, nutrition - 15) / 4
		val fertilized = energized.addFertility(fertilizer)
		Console.println("Added " + fertilizer + " fertility to " + id + " from " + nutrition + " nutrition, result = " + fertilized.fertility)
		fertilized
	}
	def wound(damage: Double) = addEnergy(-damage) 

	private def push = addVelocity(acc)
	private def glide = moveTo(pos.plus(vel))
	private def heal = addEnergy(healing)
	def step = push.glide.heal
	
	def inEnvironment(wind: Vector) = {
		//hack to stand in for zones of wind at edges later
		//val depthIntoLeftBorder = max(0, Plane.Buffer - pos.x)/Plane.Buffer
		//val depthIntoRightBorder = max(0, pos.x - Plane.Width + Plane.Buffer)/Plane.Buffer * -1
		val borderWind = Vector(Plane.intoLeft(pos.x) - Plane.intoRight(pos.x), -Plane.intoBottom(pos.y)).scaled(8) //	, depthIntoBorder).scaled(8)

		val drag = vel.scaled(-friction * acc.magnitude)
		addAcceleration(drag).addVelocity(wind.plus(borderWind)) //TODO remove borderwind
	}
	
	//a one-time push to velocity, costing energy in proportion to the force used
	def lungeTowards(p: Point) = {
		val force = min(maxForce, energy)
		val v = pos.to(p).scaledTo(force)
		setVelocity(v).addEnergy(-force)
	}

	def canEat(c: Colliding): Boolean = nature.edibleKinds.contains(c.kind)

	def motivated(ms: Seq[Motile]) = setAcceleration(nature.motivation(this, ms)) 
	val asMotile = this
}

@JSExport 
object MotileFactory {
	//TODO remove this when all in scala?
	@JSExport
	def create(id: String, kind: String, acc: Vector, vel: Vector, rawPos: Point, energy: Double, fertility: Double) =
		new Motile(id, kind, Natures.get(kind), energy, fertility, acc, vel, rawPos)
		
}


