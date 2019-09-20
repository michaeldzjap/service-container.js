![NPM Version](https://img.shields.io/npm/v/service-container.js.svg?branch=master)
![downloads](https://img.shields.io/npm/dt/service-container.js.svg)
[![Build Status](https://travis-ci.org/michaeldzjap/service-container.js.svg?branch=master)](https://travis-ci.org/michaeldzjap/service-container.js)
![dependencies](https://img.shields.io/david/michaeldzjap/service-container.js.svg)
![dev dependencies](https://img.shields.io/david/dev/michaeldzjap/service-container.js.svg)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![codecov](https://codecov.io/gh/michaeldzjap/service-container.js/branch/master/graph/badge.svg)](https://codecov.io/gh/michaeldzjap/service-container.js)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=michaeldzjap_service-container.js&metric=alert_status)](https://sonarcloud.io/dashboard?id=michaeldzjap_service-container.js)
[![License](https://img.shields.io/npm/l/service-container.js.svg)](https://github.com/michaeldzjap/service-container.js/blob/master/LICENSE)

# service-container.js
The Laravel service container re-written in TypeScript

## About
This project is still in its early stages and hasn't been extensively tested for real use purposes yet. It most likely is not production ready and you should be cautious using it as such. There are other more mature _JavaScript_ / _TypeScript_ DI projects around that are more reliable for any practical use cases and I would strongly suggest using one of them instead of this project for anything serious at this point. However, if you like the design of the _Laravel_ service container and are curious about how well it translates to the world of _JavaScript_ then this project will be interesting to give a go.

This project offers almost completely the same functionality as the original _Laravel_ service container. It has been implemented with in mind the aim to be as close to the original version as possible. There are some differences, mainly due to the fact that _TypeScript_ and _PHP_ have key differences in their architectural design. Most noticeably, _PHP_ has a quite extensive and mature reflection system, which _TypeScript_ lacks (currently). In order to provide (almost exactly) the same dependency injection flexibility as the original _Laravel_ service container, this project uses an approach which combines the analysis of decorator metadata using [reflect-metadata](https://github.com/rbuckton/reflect-metadata) and script parsing using [meriyah](https://github.com/meriyah/meriyah).

Documentation for this project is rather minimal at this point. However, almost all tests from the rather extensive test suite of the original _Laravel_ version have been ported. This should give a good indication of what is possible. There is also an _example_ folder with some preliminary, basic examples.

## Installation

This package is available through _npm_:

```
npm install --save service-container.js
```

In addition, it is necessary to install the _reflect-metadata_ package:

```
npm install --save reflect-metadata
```

and import it as soon as possible in the entry point of your app (e.g. index.ts or app.ts).

## Considerations
Below are some important things to consider when trying out this project for yourself.

### Environment requirements
This project should work in both browser and _node_ environments targeting _ES5_ or higher.

### Dependency injection
In order to be able to inject any dependencies defined in a class constructor you need to decorate the relevant class definition like so:

```ts
import {injectable} from 'service-container.js';

@injectable()
class MyClass {

    private _dependency: MyDependency;

    public constructor(dependency: MyDependency) {
        this._dependency = dependency;
    }

}
```

This will cause _reflect-metadata_ to emit its type metadata and also will trigger all the necessary class definition parsing behind the scenes.

### Binding to an interface
Since _TypeScript_ interfaces are compiled away and do not exist anymore at runtime, an alternative approach was needed to facilitate binding a certain implementation to a given interface / contract. The approach taken is largely borrowed from [Aurelia](https://aurelia.io), as this was found to be a quite elegant and minimally invasive workaround. See the test suite and examples for more details.

### Dependency injection and ordinary functions
The original _Laravel_ container does allow for this by passing a closure as the first argument to `container.call()`. However, since this project relies on _reflect-metada_ for type deduction and _reflect-metada_ only emits metadata for decorated class definitions, dependency injection only works for class methods (i.e. not for ordinary functions).

### Discerning ordinary functions from class definitions
This is a little bit tricky, because in _JavaScript_ there really is no difference between the two at runtime. One option would be to use parsing to determine the real nature of a target. At the moment a different, more efficient, but less robust method is used. This partly relies on the convention that the first character of a class name is always in uppercase.

## Short questions & answers
- Is this project _ES5_ compatible?

Yes. Both _ESNext_ as well as _ES5_ are supported.

- Can you bind an implementation to an interface?

Yes, this is possible, albeit using a slight workaround (see the examples).

- Do I have to use _TypeScript_?

Yes, at the moment this project only works with _TypeScript_.

- Why is _reflect-metadata_ not just imported in the source for _service-container_ itself?

Because _reflect-metadata_ affects things at a global scope and therefore, it should only be imported once and only once. Hence, importing _reflect-metadata_ internally would be fine if _service-container.js_ is your only dependency that requires its use. However, if you use _service-container.js_ in conjunction with another package / library that requires _reflect-metadata_ you would run into trouble.

## Examples
To run the examples you'll have to perform the following steps:

1. Clone this repository
2. **Build the project**: from the root directory execute `npm run build`
3. **Build the examples**: from the _/example_ folder execute `npm run build`

The built examples now are available in the _/example/dist_ folder. Note that running the built examples doesn't really do much. It is more meant to illustrate how you would go about building your own projects on top of _service-container.js_. The source code for the examples should give you an idea about some use cases for _service-container.js_.
