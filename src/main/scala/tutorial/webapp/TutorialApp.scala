package tutorial.webapp

import scala.scalajs.js.JSApp
//import org.scalajs.jquery.jQuery
import scala.scalajs.js.annotation._

object TutorialApp extends JSApp {
  def main(): Unit = {
 	println("ugh")
 	//jQuery("body").append("<p>Goodbye Cruel World</p>")
  }

	@JSExport
	def addClickedMessage(): Unit = {
//	   	jQuery("body").append("<p>You clicked the button!!</p>")
	}

	@JSExport
	def foo(): String = "argh"
}



