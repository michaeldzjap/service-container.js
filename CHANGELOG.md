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

## [0.2.0] - 2019-02-20

### Changed

- _reflect-metadata_ is no longer bundled alongside _service-container.js_. Instead it is now necessary to install and import it yourself.

## [0.1.2] - 2019-02-09

### Fixed

- A bug when scanning the _AST_ for method parameters in _ES5_ mode.
