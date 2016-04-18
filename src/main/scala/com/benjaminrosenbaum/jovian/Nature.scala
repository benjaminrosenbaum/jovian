package com.benjaminrosenbaum.jovian
import scala.math._

case class Life (val maxEnergy: Double, val nutrition: Double = 0, val healing: Double = 0) 
//object Life { def apply(maxEnergy: Double, healing: Double = 0, nutrition: Double = 0) = new Life(maxEnergy, healing, nutrition); }
case class Spawning (val spawnChance : Double, val spawnCap: Double)
//object Spawning { def apply(spawnChance : Double, spawnCap: Double) = Some(new Spawning(spawnChance, spawnCap)); }
case class Kinetics (val maxSpeed: Double = 0, val maxForce: Double, val friction: Double)
case class Nature (
	 val size : Double, 
	 val kinetics: Kinetics, 
	 val life: Life, 
	 val spawning: Spawning = Spawning(0, 0), 
	 val motivation: Motivation = new Quiescence(),
	 val relations: Map[String, List[String]] = Map()) {
	 def edibleKinds: List[String] = relations.get("eats").getOrElse(List()) 
} 

//serialize as json see http://stackoverflow.com/questions/8054018/what-json-library-to-use-in-scala

object Natures {

	val playerSize = 22.0;

	val map : Map[String, Nature] = Map (
		"Beast" -> new Nature(size = playerSize, 
								kinetics = Kinetics(maxSpeed = 5, maxForce = 2, friction = 0.2),
								life = Life(healing = 0.02, maxEnergy = 100, nutrition = 0),
								relations = Map("eats" -> List("Flutterbye", "Ralava", "Frillist", "Kledge"))),
		"Flutterbye" -> new Nature(size = 8.0, 
								kinetics = Kinetics(maxSpeed = 1, maxForce = 1, friction = 0.013),
								spawning = Spawning(spawnChance = 0.015, spawnCap = 55), 
								life = Life(maxEnergy = 3, healing = 0.02, nutrition = 2),
								relations = Map(),
								motivation = 
									CohereWithFlock(range = 500, force = 0.09, minRange = 10) 
									and SeparateFromFlock(range = 30, force = 0.2)
									and StayWithin(top = 100, bottom = 800)
								),
		"Bumbler" -> new Nature(size = 16.0, 
								kinetics = Kinetics(maxSpeed = 0.5, maxForce = 0.5, friction = 0.03),
								spawning = Spawning(spawnChance = 0.05, spawnCap = 4), 
								life = Life(maxEnergy = 150, healing = 0.1, nutrition = 5),
								relations = Map("eats" -> List("Flutterbye")),
								motivation = StayWithin(top = 100, bottom = 500) and
											 CohereWithFlock(range = 800, force = 0.2, minRange = 25) and 
											 SeparateFromFlock(range = 30, force = 0.3) and
											 AlignWithFlock(range = 150, force = 0.5)
								),
		"Willicker" -> new Nature(size = 32.0, 
								kinetics = Kinetics(maxSpeed = 0.1, maxForce = 0.1, friction = 0.01),
								spawning = Spawning(spawnChance = 0.005, spawnCap = 10), 
								life = Life(maxEnergy = 20, healing = 0.02, nutrition = 100),
								relations = Map("eats" ->  List("Viprish")),
								motivation =
									CohereWithFlock(range = 1800, force = 0.3) and SeparateFromFlock(range = 800, force = 0.5)
								),
		"Viprish" -> new Nature (size = 25.0, 
								 kinetics = Kinetics(maxSpeed = 2.0, maxForce = 3.0, friction = 0.3), 
								 spawning = Spawning(spawnChance = 0.005, spawnCap = 2), 
								 life = Life(maxEnergy = 20, nutrition = 10),
								 relations = Map("eats" -> List("Beast")),
								 motivation = Hunt("Beast", range = 1000, force = 0.5) butOnlyWithin(150, 1200)
								 				trumps StayWithin(top = 200, bottom = 1000)
								),
		"Ralava" -> new Nature(size = playerSize, 
								kinetics = Kinetics(maxSpeed = 5.8, maxForce = 2, friction = 0.05),
								spawning = Spawning(spawnChance = 0.05, spawnCap = 4), 
								life = Life(maxEnergy = 40, healing = 0.01, nutrition = 20),
								relations = Map("eats" -> List("Bumbler", "Beast", "Frillist")),
								motivation =  Hunt(List("Beast"), force = 0.8, range = 500) ifAbove() butOnlyWithin(800, 1200)
											  and Flee("Beast", force = 0.3, range = 50) ifBelow()
											  trumps StayWithin(top = 800, bottom = 1500)
											  trumps  Hunt(List("Bumbler", "Frillist"), force = 0.3, range = 400) butOnlyWithin(800, 1200)
											  trumps SeparateFromFlock(range = 800, force = 0.5)
								),	
		"Frillist" -> new Nature(size = 20, 
								 kinetics = Kinetics(maxSpeed = 4.2, maxForce = 1.9, friction = 0.1),
								 spawning = Spawning(spawnChance = 0.005, spawnCap = 4), 
								 life = Life(maxEnergy = 10, healing = 0.03, nutrition = 35),
								 relations = Map("eats" -> List("Flutterbye", "Bumbler")),
								 motivation = StayWithin(top = 750, bottom = 1500)
								 			  trumps Hunt("Flutterbye", range = 25, force = 1.5)
								 			  trumps Flee(List("Beast", "Ralava", "Frillist", "Bumbler"), range = 60, force = 1.8)
								 			  	 and CohereWithFlock(range = 400, force = 0.2, List("Bumbler"))
								 			  	 and SeparateFromFlock(range = 200, force = 0.3)
								 			  	 and AvoidHorizontalPlaneEdges(buffer = 80, force = 2)
								 ),
		"Kledge" -> new Nature(size = 62.0, 
								kinetics = Kinetics(maxSpeed = 0.3, maxForce = 0.1, friction = 0.2),
								spawning = Spawning(spawnChance = 0.05, spawnCap = 10), 
								life = Life(maxEnergy = 200, healing = 0.02, nutrition = 1),
								relations = Map(),
								motivation = StayWithin(top = 900, bottom = 950) 
											 trumps CohereWithFlock(range = 800, force = 0.5) 
											 		and SeparateFromFlock(range = 1800, force = 0.3)
								),
		"Devastroph" -> new Nature (size = 23.0,  //size: 23, maxSpeed: 4, maxForce: 3.2, spawnChance: 0.01, spawnCap: 4
								 kinetics = Kinetics(maxSpeed = 6.0, maxForce = 3.800, friction = 0.1), 
								 spawning = Spawning(spawnChance = 0.01, spawnCap = 4), 
								 life = Life(maxEnergy = 40, nutrition = 10),
								 relations = Map("eats" -> List("Beast")),
								 motivation = Hunt("Beast", range = 1000, force = 0.5) butOnlyWithin(1200, 5000)
								 				trumps StayWithin(top = 1200, bottom = 5000)
								)
	)

	def get(kind : String) : Nature = map(kind)
}
