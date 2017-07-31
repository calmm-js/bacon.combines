'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Bacon = _interopDefault(require('baconjs'));
var infestines = require('infestines');

var Observable = Bacon.Observable;
function countArray(template) {
  var c = 0;
  for (var i = 0, n = template.length; i < n; ++i) {
    c += count(template[i]);
  }return c;
}

function countObject(template) {
  var c = 0;
  for (var k in template) {
    c += count(template[k]);
  }return c;
}

function countTemplate(template) {
  if (infestines.isArray(template)) return countArray(template);else if (infestines.isObject(template)) return countObject(template);else return 0;
}

function count(template) {
  if (template instanceof Observable) return 1;else return countTemplate(template);
}

function invoke(xs) {
  if (!(xs instanceof Array)) return xs;

  var nm1 = xs.length - 1;
  var f = xs[nm1];
  return f instanceof Function ? f.apply(void 0, xs.slice(0, nm1)) : xs;
}

var applyLast = function applyLast(args) {
  if (infestines.isArray(args)) {
    var last = args[args.length - 1];
    if (last instanceof Function) {
      return last.apply(null, args.slice(0, -1));
    }
  }
  return args;
};

var combine = function combine(template) {
  return Bacon.combineTemplate(template).map(applyLast).skipDuplicates(infestines.identicalU);
};

var lift1Shallow = function lift1Shallow(fn) {
  return function (x) {
    return x instanceof Observable ? x.map(fn).skipDuplicates(infestines.identicalU) : fn(x);
  };
};

var lift1 = function lift1(fn) {
  return function (x) {
    if (x instanceof Observable) {
      return x.map(fn).skipDuplicates(infestines.identicalU);
    }
    var n = countTemplate(x);
    if (0 === n) return fn(x);
    return combine([x, fn]);
  };
};

function lift(fn) {
  var fnN = fn.length;
  switch (fnN) {
    case 0:
      return fn;
    case 1:
      return lift1(fn);
    default:
      return infestines.arityN(fnN, function () {
        var xsN = arguments.length,
            xs = Array(xsN);
        for (var i = 0; i < xsN; ++i) {
          xs[i] = arguments[i];
        }var n = countArray(xs);
        if (0 === n) return fn.apply(null, xs);
        xs.push(fn);
        return combine(xs);
      });
  }
}

var bacon_combines = function () {
  for (var _len = arguments.length, template = Array(_len), _key = 0; _key < _len; _key++) {
    template[_key] = arguments[_key];
  }

  var n = countArray(template);
  switch (n) {
    case 0:
      return invoke(template);
    case 1:
      return template.length === 2 && template[0] instanceof Observable && template[1] instanceof Function ? template[0].map(template[1]).skipDuplicates(infestines.identicalU) : combine(template);
    default:
      return combine(template);
  }
};

exports.lift1Shallow = lift1Shallow;
exports.lift1 = lift1;
exports.lift = lift;
exports['default'] = bacon_combines;
