[![npm version](https://badge.fury.io/js/bacon.combines.svg)](http://badge.fury.io/js/bacon.combines)
[![Bower version](https://badge.fury.io/bo/bacon.combines.svg)](https://badge.fury.io/bo/bacon.combines)
[![Build Status](https://travis-ci.org/calmm-js/bacon.combines.svg?branch=master)](https://travis-ci.org/calmm-js/bacon.combines)
[![Code Coverage](https://img.shields.io/codecov/c/github/calmm-js/bacon.combines/master.svg)](https://codecov.io/github/calmm-js/bacon.combines?branch=master)
[![](https://david-dm.org/calmm-js/bacon.combines.svg)](https://david-dm.org/calmm-js/bacon.combines)
[![](https://david-dm.org/calmm-js/bacon.combines/dev-status.svg)](https://david-dm.org/calmm-js/bacon.combines?type=dev)

TODO: convert doc from Kefir version

The default export of this library

```js
import K from "bacon.combines"
```

is a special purpose [Bacon](https://baconjs.github.io/) observable
combinator designed for combining properties for a sink that accepts both
observables and constant values such as VDOM extended to accept observables.

Unlike typical observable combinators, when `K` is invoked with only constants
(no observables), then the result is computed immediately and returned as a
plain value.  This optimization eliminates redundant observables.

The basic semantics of `K` can be described as

```js
K(x1, ..., xN, fn) === combine([x1, ..., xN], fn).skipDuplicates(identical)
```

where [`combineWith`](http://rpominov.github.io/kefir/#combine)
and [`skipDuplicates`](http://rpominov.github.io/kefir/#skip-duplicates) come
from Kefir and [`identical`](http://ramdajs.com/docs/#identical)
from [Ramda](http://ramdajs.com/).  Duplicates are skipped, because that can
reduce unnecessary updates.  Ramda's `identical` provides a semantics of
equality that works well within the context of embedding properties to VDOM.

Unlike with [`combine`](http://rpominov.github.io/kefir/#combine), any argument
of `K` is allowed to be
* a constant,
* an observable (including the combiner function), or
* an array or object containing observables.

In other words, `K` also provides functionality similar
to
[`combineTemplate`](https://github.com/baconjs/bacon.js#bacon-combinetemplate).

Note: `K` is carefully optimized for space&mdash;if you write equivalent
combinations using Kefir's own operators, they will likely take more memory.
