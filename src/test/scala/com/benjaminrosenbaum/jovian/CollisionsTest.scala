package com.benjaminrosenbaum.jovian

import utest._
import scala.scalajs.js
import scala.scalajs.js.Dynamic
import scala.math._

object CollisionsTest extends TestSuite {
  
	//class TestMotile (override val getId : String, override val getStrength: Double) extends Motile  
	
	def tests = TestSuite { 
		'threewayCollision {

			val expectedVelocities = Map ("A" -> Vector(0.0, 1.0), 
									      "B" -> Vector(-0.06066017177982119, 1.0606601717798212),
									      "C" -> Vector(2.1925695879998877, 1.5962847939999438),
									      "D" -> Vector(0.0, -3.0))

			val expectedEnergies = Map ("A" -> 45, "B" -> 62, "C" -> 88, "D" -> 112)

			val sA = new Square(new Point(5.0, 8.0), 4.0)
			val sB = new Square(new Point(3.0, 10.0), 2.0)
			val sC = new Square(new Point(5.0, 11.0), 2.0)
			val sD = new Square(new Point(15.0, 1.0), 1.0)

			def testMotile(id: String, box: Square, v: Vector, e: Double, nutrition: Double = 10, relations: Map[String, List[String]] = Map() ) = {
				val testLife = Natures.get("Beast").life.copy(nutrition = nutrition)
				val testNature = Natures.get("Beast").copy(size = box.side, relations = relations, life = testLife)
				new Motile(id = id, vel = v, rawPos = box.center, kind = id, nature = testNature, energy = e, fertility = 0)
			}

			val A = testMotile("A", sA, Vector(0.0,   1.0), 45, nutrition = 10, Map("eats" -> List("B")) )
			val B = testMotile("B", sB, Vector(1.0,   0.0), 62.8 )
			val C = testMotile("C", sC, Vector(1.0,  -1.0), 88 )
			val D = testMotile("D", sD, Vector(0.0,  -3.0), 112 )

			'touching {
				val touching = A.allTouching(List(B,C,D))
				val str = rep(touching)
				assert("BC" == str)
			}
			'collisionResolver {
				val cl = new CollisionResolver(List(D, C, A, B), 1.0)
				'orderTuple {
					val tuple = A.orderTuple
					assert(tuple == (-4.0, 8.0, -5.0, "A"))
				}
				'sorted { 
					val str = rep(cl.sorted)
					assert("ABCD" == str)
				}
				'collisions {
					val str = repr(cl.collisions)
					assert("A->B,A->C,B->C" == str)
				}
				'byBonked {
					val str = repre(cl.collisionsByBonked)
					assert("B:A->B;C:A->C,B->C" == str)
				}
				'depthOfPenetration {
					'AB {
						val depth = sA.depthOfPenetration(sB)
						assert(depth == 3.0/2)
					}
					'BC {
						val depth = sB.depthOfPenetration(sC)
						assert(depth == 4.0/3)
					}
					'AC {
						val depth = sA.depthOfPenetration(sC)
						assert(depth == 2.0)
					}

				}
				'collisionDeltaVee {
					val effect = cl.collisionsByBonked.get(B).getOrElse(List())(0).deltaVee
					val expectedSlope = new Vector(-2.0, 2.0)
					val expectedEffect = expectedSlope.scaledTo(3.0/2.0)
					assert(sA.center.to(sB.center).equals(expectedSlope))
					assert(effect.equals(expectedEffect))
				}

			}

			val (collisions, colliders) : (List[Collision], List[Colliding]) = CollisionResolution.getCollisionsAndCollidables(List(B, D, C, A), 1.0)
			def find(colliders: List[Colliding], key: String) = colliders.find(c => c.id == key).getOrElse(
														throw new Exception(s"Collidable $key not found in" + colliders))
			
			def checkResult(key: String) = {
				val found = find(colliders, key)
			
				val actualVelocity = found.vel
				val expectedVelocity = expectedVelocities(key)
				assert(actualVelocity.equals(expectedVelocity))

				val actualEnergy = found.energy
				val expectedEnergy = expectedEnergies(key)
				assert(actualEnergy == expectedEnergy)
			}

			def rep(cs: Seq[Colliding]) = cs.map(c => c.id).mkString
			def repr(cs: Seq[Collision]) = cs.map(c => c.bonker.id + "->" + c.bonked.id).mkString(",") //TODO why name conflict with rep?
			def repre(m: Map[Colliding, List[Collision]]) = m.toSeq.sortBy(_._1.id).map({ case (k,v) => k.id + ":" + repr(v) }).mkString(";") 

			'A { checkResult("A") }
			'B { checkResult("B") }
			'C { checkResult("C") }
			'D { checkResult("D") }

			'canEat { 
				val supper = A.nature.edibleKinds
				assert(supper == List("B"))
				assert(A.canEat(B)) 
			}

			'chomping {
				val expectedDamage = sA.side / 5;
				assert(expectedDamage == (4.0 / 5) );
				val collision = collisions.filter(c => c.bonker.id == "A" && c.bonked.id == "B")(0)
				assert(collision.isChomping)
				assert(!collision.isKill)	
			}

			'devouring {
				val F = testMotile("F", new Square(new Point(5.0, -4.0), 10.0), Vector.NULL, 10, nutrition = 0, Map("eats" -> List("G")) )
				val G = testMotile("G", new Square(new Point(6.0, -5.0), 5.0), Vector.NULL, 1.9, nutrition = 115 )
				val fStats = (F.damage, F.energy, F.fertility) 
				assert(fStats == (2.0, 10, 0))

				val (collisions, colliders) = CollisionResolution.getCollisionsAndCollidables(List(G, F), 3.0)
				assert(collisions.size == 1)

				val F2 = find(colliders, "F")
				val fStatsAfter = (F2.damage, F2.energy, F2.asMotile.fertility)
				assert(fStatsAfter == (2, 100, 25))
				assert(colliders.size == 1) //G done got et
			}

		}
  }
}
