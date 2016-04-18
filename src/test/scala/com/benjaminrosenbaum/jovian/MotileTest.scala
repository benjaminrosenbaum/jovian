package com.benjaminrosenbaum.jovian

import utest._

object MotileTest extends TestSuite {
		
		def testMotile(testMaxSpeed: Double = 0.0, testMaxForce: Double = 2.0) = {
			val testKinetics = Natures.get("Beast").kinetics.copy(maxSpeed = testMaxSpeed, maxForce = testMaxForce)
			val testNature = Natures.get("Beast").copy(kinetics = testKinetics)
			new Motile(id = "test-motile", kind = "Beast", nature = testNature, energy = 100, fertility = 0)
		}
    
    def tests = TestSuite { 
		'bindBeastNorthhwest {
			val endPoint = testMotile(testMaxSpeed = 1000).moveTo(new Point(10, 10)).setVelocity(new Vector(-20, -20)).step.pos
			assert(endPoint.equals(new Point(Plane.Width-10, 0)))
		}
		'ordinaryMove { 
			val endPoint = testMotile(testMaxSpeed = 1000).moveTo(new Point(90,90)).setVelocity(new Vector(10, -10)).step.pos
			assert(endPoint.equals(new Point(100, 80)))
		}
		'limitedSpeedMove {
			val endPoint = testMotile(testMaxSpeed = 50).moveTo(new Point(100,100)).setVelocity(new Vector(60, 80)).step.pos
			assert(endPoint.equals(new Point(130, 140)))	
		}
		'step {
			val before = testMotile(testMaxSpeed = 5, testMaxForce = 20).copy(id = "Stepper").moveTo(new Point(100,100))
												.setAcceleration(new Vector(-9, -12))
												.setVelocity(new Vector(3, 4))
			val m = before.step
			val p = m.pos
			val v = m.vel
			val a = m.acc

			assert(a.equals(new Vector(-9, -12)))
			assert(v.equals(new Vector(-3, -4)))
			assert(p.equals(before.pos.plus(v)))
			assert(p.equals(new Point(97,96)))
		}

		'wound {
			val before = testMotile()
			val eAfter = before.wound(10).energy
			assert(eAfter == 90)
		}

		'nourish {
			val before = testMotile()
			val after = before.wound(10).nourish(35)
			val results = (after.energy, after.fertility)
			assert(results == (100, 5))

		}
	}
}