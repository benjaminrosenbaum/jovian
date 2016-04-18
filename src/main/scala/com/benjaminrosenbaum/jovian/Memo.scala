package com.benjaminrosenbaum.jovian

/**
 * Generic way to create memoized functions (even recursive and multiple-arg ones)

 Taken from com.github.pathikrit.scalgos
 usage: val c: (Int, Int) ==> BigInt = Memo {
    case (_, 0) => 1
    case (n, r) if r > n/2 => c(n, n - r)
    case (n, r) => c(n - 1, r - 1) + c(n - 1, r)
  }   
 *  
 * @param f the function to memoize
 * @tparam I input to f
 * @tparam K the keys we should use in cache instead of I
 * @tparam O output of f
 */
case class Memo[I <% K, K, O](f: I => O) extends (I => O) {
  import scala.collection.mutable.{Map => Dict}
  val cache = Dict.empty[K, O]
  override def apply(x: I) = cache getOrElseUpdate (x, f(x))
}

object Memo {
  /**
   * Type of a simple memoized function e.g. when I = K
   */
  type ==>[I, O] = Memo[I, I, O]
}

/*
another option, from stackoverflow:
case class Memo[A,B](f: A => B) extends (A => B) {
  private val cache = mutable.Map.empty[A, B]
  def apply(x: A) = cache getOrElseUpdate (x, f(x))
}
*/