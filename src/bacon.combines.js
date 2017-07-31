import Bacon from "baconjs"
const Observable = Bacon.Observable
import {
  arityN,
  identicalU,
  isArray,
  isObject
} from "infestines"

function countArray(template) {
  let c = 0
  for (let i=0, n=template.length; i<n; ++i)
    c += count(template[i])
  return c
}

function countObject(template) {
  let c = 0
  for (const k in template)
    c += count(template[k])
  return c
}

function countTemplate(template) {
  if (isArray(template))
    return countArray(template)
  else if (isObject(template))
    return countObject(template)
  else
    return 0
}

function count(template) {
  if (template instanceof Observable)
    return 1
  else
    return countTemplate(template)
}

function invoke(xs) {
  if (!(xs instanceof Array))
    return xs

  const nm1 = xs.length-1
  const f = xs[nm1]
  return f instanceof Function
    ? f.apply(void 0, xs.slice(0, nm1))
    : xs
}

const applyLast = args => { 
  if (isArray(args)) {
    const last = args[args.length - 1]
    if (last instanceof Function) {
      return last.apply(null, args.slice(0, -1))
    }
  }
  return args
}

const combine = template => 
  Bacon.combineTemplate(template)
    .map(applyLast)
    .skipDuplicates(identicalU)

export const lift1Shallow = fn => x =>
  x instanceof Observable ? x.map(fn).skipDuplicates(identicalU) : fn(x)

export const lift1 = fn => x => {
  if (x instanceof Observable) {
    return x.map(fn).skipDuplicates(identicalU)
  }
  const n = countTemplate(x)
  if (0 === n)
    return fn(x)
  return combine([x, fn])
}

export function lift(fn) {
  const fnN = fn.length
  switch (fnN) {
    case 0: return fn
    case 1: return lift1(fn)
    default: return arityN(fnN, function () {
      const xsN = arguments.length, xs = Array(xsN)
      for (let i=0; i<xsN; ++i)
        xs[i] = arguments[i]
      const n = countArray(xs)
      if (0 === n)
        return fn.apply(null, xs)
      xs.push(fn)
      return combine(xs)
    })
  }
}

export default function (...template) {
  const n = countArray(template)
  switch (n) {
    case 0: return invoke(template)
    case 1: return (template.length === 2 &&
                    template[0] instanceof Observable &&
                    template[1] instanceof Function
                    ? template[0].map(template[1]).skipDuplicates(identicalU)
                    : combine(template))
    default: return combine(template)
  }
}
