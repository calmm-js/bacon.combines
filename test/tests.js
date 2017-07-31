import * as Bacon from "baconjs"
import * as R     from "ramda"

import K, * as C  from "../dist/bacon.combines.cjs"

function show(x) {
  switch (typeof x) {
    case "string":
    case "object":
      return JSON.stringify(x)
    default:
      return `${x}`
  }
}

const objectConstant = {x: 1}
Bacon.constantError = e => Bacon.once(new Bacon.Error(e))

const testEq = (exprIn, expect) => {
  const expr = exprIn.replace(/[ \n]+/g, " ")
  it(`${expr} => ${show(expect)}`, done => {
    const actual = eval(`(C, K, Bacon, R, objectConstant) => ${expr}`)(
                          C, K, Bacon, R, objectConstant)
    const check = actual => {
      if (!R.equals(actual, expect))
        throw new Error(`Expected: ${show(expect)}, actual: ${show(actual)}`)
      done()
    }
    if (actual instanceof Bacon.Observable)
      actual.take(1).doError(check).onValue(check)
    else
      check(actual)
  })
}

describe("K", () => {
  testEq(`K()`, [])

  testEq(`K("a")`, ["a"])
  testEq(`K(Bacon.constant("a"))`, ["a"])

  testEq(`K("a", "b")`, ["a", "b"])
  testEq(`K("a", Bacon.constant("b"))`, ["a", "b"])
  testEq(`K(Bacon.constant("a"), "b")`, ["a", "b"])
  testEq(`K(Bacon.later(10,"a"), Bacon.later(2,"b"))`, ["a", "b"])

  testEq(`K("a", x => x + x)`, "aa")
  testEq(`K(Bacon.constant("a"), x => x + x)`, "aa")
  testEq(`K(Bacon.later(1,"a"), x => x + x)`, "aa")
  testEq(`K(Bacon.constant("a"), Bacon.constant(x => x + x))`, "aa")

  testEq(`K([1, {y: {z: Bacon.constant("x")}}, Bacon.constant(3)],
            R.prepend(4))`,
         [4, 1, {y: {z: "x"}}, 3])

  testEq(`K(Bacon.constantError("e"))`, "e")
  testEq(`K(Bacon.constantError("e"), x => x + x)`, "e")
  testEq(`K(Bacon.constant("f"), Bacon.constantError("e"))`, "e")

  /* TODO: equality check fails for now because Bacon.combineTemplate doesn't check for zero obs?
  testEq(`K(objectConstant,
            Bacon.constant(objectConstant),
            (o1, o2) => objectConstant === o1
                     && objectConstant === o2)`,
         true)

  */
})

describe("lift1", () => {
  testEq(`C.lift1(R.add(1))(2)`, 3)
  testEq(`C.lift1(R.add(1))(Bacon.constant(2))`, 3)
  testEq(`C.lift1(R.map(R.add(1)))([1,Bacon.constant(2),3])`, [2,3,4])
  testEq(`C.lift1(R.map(R.add(1)))([Bacon.constant(1),2,Bacon.constant(3)])`,
         [2,3,4])
})

describe("lift1Shallow", () => {
  testEq(`C.lift1Shallow(R.add(1))(2)`, 3)
})

describe("lift", () => {
  testEq(`C.lift(() => 42)()`, 42)
  testEq(`C.lift(R.add(1))(2)`, 3)
  testEq(`C.lift(R.add)(2, 3)`, 5)
  testEq(`C.lift(R.add)(2)(Bacon.constant(3))`, 5)
  testEq(`C.lift(R.add)(Bacon.constant(3), 2)`, 5)
  testEq(`C.lift(R.map)(Bacon.constant(R.add(1)),
                        [Bacon.constant(1),2,Bacon.constant(3)])`,
         [2,3,4])
})
