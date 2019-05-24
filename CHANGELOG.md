# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

<details>
    <summary>Unreleased changes. Click to see more.</summary>
    <ul>
        <li>`Collection` and `Arr` functionality are moved to a separate package.</li>
</details>

## [0.3.2] - 2019-05-24

## Changed

- Fresh build after updating dependencies.

## [0.3.1] - 2019-04-14

### Fixed

- Fix the declaration file path in _package.json_.

## [0.3.0] - 2019-04-14

### Added

- More elaborate testing of resolving logic is added.
- The ability to bind a resolving callback to an interface. Unlike _Laravel_, this only works if a service is explicitly bound to an interface.

### Changed

- Tagged services are now lazy loaded.

## [0.2.0] - 2019-02-20

### Changed

- _reflect-metadata_ is no longer bundled alongside _service-container.js_. Instead it is now necessary to install and import it yourself.

## [0.1.2] - 2019-02-09

### Fixed

- A bug when scanning the _AST_ for method parameters in _ES5_ mode.
