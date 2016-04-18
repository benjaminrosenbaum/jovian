enablePlugins(ScalaJSPlugin)

name := "Scala.js Jovian"

scalaVersion := "2.11.5" // or any other Scala version >= 2.10.2

scalaJSStage in Global := FastOptStage

libraryDependencies += "com.lihaoyi" %%% "utest" % "0.3.0" % "test"

testFrameworks += new TestFramework("utest.runner.Framework")

// not needed with jQuery: libraryDependencies += "org.scala-js" %%% "scalajs-dom" % "0.8.0"
//libraryDependencies += "be.doeraene" %%% "scalajs-jquery" % "0.8.0"

/*lazy val execScript = taskKey[Unit]("Execute the shell script")

execScript := {
  "yourshell.sh" !
}*/