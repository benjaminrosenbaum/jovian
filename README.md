
# Jovian

A game in which you are a flying thing in the winds of a Jupiter-like planet, eating some other flying things and avoiding getting eaten by yet others.

Written in JavaScript (for the "client") and ScalaJS (for the "server"); the idea is for the server to actually move to a real back-end server running Scala, and for the game to become a MMORPG someday.

## Installation

[Install SBT](http://www.scala-sbt.org/download.html), e.g.:

    $ port install sbt

run sbt

    $ cd jovian
    $ sbt
    > run
    > exit

I thought there was a way to get sbt to serve the files itself as a web server, but I've forgotten how. So, run a web server locally, e.g.

    $ python -m SimpleHTTPServer & 
    $ open http://localhost:8000/

    




