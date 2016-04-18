package com.benjaminrosenbaum.jovian
import scala.scalajs.js
import scala.scalajs.js.Dynamic
import scala.scalajs.js.annotation._
import scala.annotation.meta.field
import scala.math._
import js.JSConverters._

trait Effectual[T] {
	type Effect = T => List[T]
}

trait Colliding {

	val id: String
	val kind: String
	val strength: Double
	val box: Square
	val vel: Vector
	val energy: Double
	val damage: Double
	val nutrition: Double

	def orderTuple : Tuple4[Double, Double, Double, String] =  (-strength, box.center.y, -box.center.x, id) //note y+ = high
	def touches(other: Colliding) = box.intersects(other.box)
	def allTouching(others : List[Colliding]) = others.filter(c => touches(c))
	def addVelocity(v: Vector) : Colliding
	def nourish(e: Double) : Colliding
	def wound(damage: Double) : Colliding
	def canEat(c: Colliding): Boolean 
	def asMotile: Motile
}

@JSExport
class Collision (
		@(JSExport @field)val bonker : Colliding, 
		@(JSExport @field)val bonked : Colliding,
		@(JSExport @field)val elasticity: Double) extends Effectual[Colliding] {	

	//for calculation of chomping
	val isChomping = bonker.canEat(bonked)
	lazy val damage = min(bonker.damage, bonked.energy)
	lazy val isKill = damage >= bonked.energy

	//for calculation of shoving
	def deltaVee = bonker.box.center.to(bonked.box.center).scaledTo(elasticity * bonker.box.depthOfPenetration(bonked.box))

	//effects
	lazy val chomp : Effect = c => if (isKill) List(c.nourish(bonked.nutrition)) else List(c)
	lazy val chomped : Effect = c => if (isKill) Nil else List(c.wound(damage))
	lazy val shoved : Effect = c => List(c.addVelocity(deltaVee))

	def bonkedEffects : List[Effect]  =  if (isChomping) List(shoved, chomped) else List(shoved) 
	def bonkerEffects : List[Effect]  =  if (isChomping) List(chomp) else Nil
}

@JSExport
class CollisionResolution(
		@(JSExport @field)val collidables : js.Array[Colliding],
		@(JSExport @field)val collisions : js.Array[Collision])

class CollisionResolver(val unsorted : Seq[Colliding], val elasticity: Double = 3.0) extends Effectual[Colliding] {
	type CMap = Map[Colliding, List[Collision]] 

	val sorted : Seq[Colliding] = unsorted.sortBy(c => c.orderTuple)
	val collisions : List[Collision] = collisionsIn(sorted)
	def collisionMapBy(key: Collision => Colliding) = collisions.groupBy(key).withDefaultValue(List())
	val collisionsByBonked = collisionMapBy(c => c.bonked)
	val collisionsByBonker = collisionMapBy(c => c.bonker)

	def collisionsIn(colliders: Seq[Colliding]) : List[Collision] = {
	
		def collisionsWithHead(colliders: Seq[Colliding]) : List[Collision] = colliders match {
			case Nil => Nil
			case head :: tail => head.allTouching(tail).map(c => new Collision(head, c, elasticity)) //implies that colliders is sorted with bonkers before bonked
		}

		colliders match {
			case Nil => Nil
			case head :: tail => collisionsWithHead(colliders) ::: collisionsIn(tail)
		}
	}

	def effectsOn(c: Colliding): List[Effect] = 
		collisionsByBonked(c).flatMap(_.bonkedEffects) ++ collisionsByBonker(c).flatMap(_.bonkerEffects)
	
	
	def applyEffect(colliders: List[Colliding], effect: Effect) : List[Colliding] = colliders.flatMap(effect)
	def applyEffects(collider: Colliding) : List[Colliding] = effectsOn(collider).foldLeft(List(collider))(applyEffect)
			//accumulate bonks from each collision, applying each effect in turn	
			//TODO consider uniting the apply mechanisms here & in Lifecycle resolution... really just phases of effect builders flatmapping...						

	def resultantColliders : Seq[Colliding] = sorted.flatMap(applyEffects);
	
}

@JSExport
object CollisionResolution {
	@JSExport def resolve(colliders: js.Array[Colliding], elasticity: Double = 3.0) : js.Array[Colliding] = {	
		val (collisions, resultantColliders) = getCollisionsAndCollidables(colliders.toArray.toList, elasticity)
		//val cList = new CollisionResolver(colliders.toArray.toList, elasticity);
		//cList.resultantColliders.toJSArray
		resultantColliders.toJSArray
	}

	def getCollisionsAndCollidables (colliders: List[Colliding], elasticity: Double) : (List[Collision], Seq[Colliding])  = {
		val cList = new CollisionResolver(colliders, elasticity);
		(cList.collisions, cList.resultantColliders)
	}
}








