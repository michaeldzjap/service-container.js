[![Build Status](https://travis-ci.org/michaeldzjap/container.js.svg?branch=master)](https://travis-ci.org/michaeldzjap/container.js)
![dependencies](https://img.shields.io/david/michaeldzjap/container.js.svg)
![dev dependencies](https://img.shields.io/david/dev/michaeldzjap/container.js.svg)
[![License](https://img.shields.io/npm/l/container.js.svg)](https://github.com/michaeldzjap/container.js/blob/master/LICENSE)

# container.js
The Laravel service container re-written in TypeScript

## About
This project is still in its early stages and hasn't yet been extensively tested for any practical purposes. It most likely is not production ready yet and you should be cautious using it as such. There are other more mature _JavaScript_ / _TypeScript_ DI projects around that have proven themselves to be reliable in practical use cases and I would stronly suggest using those instead of this for anything serious at this point. However, if you like the design of the _Laravel_ service container and are curious about how well it translates to the world of _JavaScript_ then this project would be interesting to trying out.

## What?
This project offers almost completely the same functionality as the original _Laravel_ service container. It has been implemented with the aim to be as close to the original version as possible. There are some differences, mainly due to the fact that _TypeScript_ and _PHP_ have key differences in their architectural philosophy. Most noticeably, _PHP_ has a quite extensive and mature reflection system, which _TypeScript_ just doesn't (and probably never will) have.
