[![Build Status](https://travis-ci.org/michaeldzjap/container.js.svg?branch=master)](https://travis-ci.org/michaeldzjap/container.js)
![dependencies](https://img.shields.io/david/michaeldzjap/container.js.svg)
![dev dependencies](https://img.shields.io/david/dev/michaeldzjap/container.js.svg)
[![License](https://img.shields.io/npm/l/container.js.svg)](https://github.com/michaeldzjap/container.js/blob/master/LICENSE)

# container.js
The Laravel service container re-written in TypeScript

## About
This project is still in its early stages and hasn't yet been extensively tested for any practical purposes. It most likely is not production ready yet and you should be cautious using it as such. There are other more mature _JavaScript_ / _TypeScript_ DI projects around that have proven themselves to be reliable in practical use cases and I would stronly suggest using those instead of this for anything serious at this point. However, if you like the design of the _Laravel_ service container and are curious about how well it translates to the world of _JavaScript_ then this project would be interesting to trying out.

This project offers almost completely the same functionality as the original _Laravel_ service container. It has been implemented with in mind the aim to be as close to the original version as possible. There are some differences, mainly due to the fact that _TypeScript_ and _PHP_ have key differences in their architectural philosophy. Most noticeably, _PHP_ has a quite extensive and mature reflection system, which _TypeScript_ just doesn't have (currently). In order to provide (almost exactly) the same dependency injection flexibility as the original project, this project uses an approach which combines the analysis of decorator metadata using [reflect-metadata](https://github.com/rbuckton/reflect-metadata) and script parsing using [cherow](https://github.com/cherow/cherow).

Documentation for this project is rather minimal at this point. However, the relevant tests from the rather extensive test suite of the original _Laravel_ version has been ported. This should give a good indication of what is possible. There is also an _example_ folder with some preliminary, basic examples.

## Considerations
Below are some important things to take into account when trying out this project for yourself.

### Environment requirements
This project currently only works in environments targeting _ES6_ or higher. Part of its internal dependency resolution mechanism relies on the `class` construct being available at runtime, which is not available in _ES5_ or lower. It should work both in the browser as well as _node_ environments.

### Binding to an interface
Since _TypeScript_ interfaces are compiled away and do not exist anymore at runtime, an alternative approach was needed to facilitate binding a certain implementation to a given interface / contract. The approach taken is largely borrowed from [Aurelia](https://aurelia.io), as this was found to be a quite elegant and minimally invasive workaround. See the test suite and examples for more details.

### Dependency injection inside ordinary functions

### Discerning ordinary functions from class definitions

## Short questions & answers
- Is this project _ES5_ compatible?

No, it isn't. It relies on the _ES6_ `class` construct being available at runtime. No plans to change this at the moment.

- Can you bind an implementation to an interface?

Yes, this is possible, albeit using a slight workaround (see the examples).
