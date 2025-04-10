# Changelog for dets

## 0.16.8

- Fixed diffing of interfaces with changed inheritance

## 0.16.7

- Fixed bundling issue leading to CLI crash at startup (#52)

## 0.16.6

- Fixed issue with handling exported namespace modules

## 0.16.5

- Fixed issue with dot in names for generated declaration file (#51) by @longlostbro
- Updated dependencies
- Updated to use `vitest` instead of `jest`

## 0.16.4

- Fixed unnecessary duplications
- Fixed removal of mixed in function properties
- Updated to keep internal `typeof` references

## 0.16.3

- Fixed handling of spread operator (#48)

## 0.16.2

- Fixed resolution of import nodes (#46)

## 0.16.1

- Fixed issue with empty properties of classes (#44)

## 0.16.0

- Fixed passing on `--module-declaration` CLI flag (#42)
- Improved support for JS files (#41)

## 0.15.1

- Added `public` modifier
- Added optional modifiers to constructor declarations

## 0.15.0

- Removed Node 14 compatibility

## 0.14.2

- Added support for missing TypeScript property declarations

## 0.14.1

- Fixed issue with TypeScript 5.3 not considering externals
- Added full support for triple-slash directives (#14)

## 0.14.0

- Updated dependencies
- Fixed issue with undefined behavior in case of unknown symbols
- Updated `retrieveTypings` to be async in nature returning a `Promise`
- Updated `generateDeclaration` to be async in nature returning a `Promise`
- Added new modern plugin API with multi lifecycle capabilities

## 0.13.0

- Updated dependencies
- Changed minimum supported version of Node.js to 14.18
- Changed build system from ncc to esbuild
- Removed compatibility with TypeScript 3
- Added compatibility with TypeScript 5

## 0.12.4

- Fixed issue with exports of non-exported `typeof` objects
- Fixed issue with computed indexers

## 0.12.3

- Fixed an issue with named tuples declaring functions

## 0.12.2

- Improved comment serialization
- Updated to use `createNodeArray` from `factory`
- Added support for the `satisfies` operator

## 0.12.1

- Updated dependencies
- Fixed issue with function overload
- Fixed missing comments for interface-defined functions

## 0.12.0

- Improved type inference of default values
- Added `module-declaration` CLI option
- Added `noModuleDeclaration` context option

## 0.11.2

- Fixed issue with named tuples (#34)

## 0.11.1

- Updated license year
- Updated dependencies
- Support for namespace export

## 0.11.0

- Updated dependencies
- Improved the pipeline
- Support for rest type nodes
- Support for array literals
- Renamed `master` to `main`
- Added `retrieveTypings` API
- Added guards to support older versions of TypeScript

## 0.10.2

- Updated dependencies
- Fixed issue with processing body-less modules

## 0.10.1

- Improved documentation tag stringification
- Fixed potentially undefined access of symbol

## 0.10.0

- Updated dependencies
- Support for declaration merging of externals
- Added support for lifecycle plugins

## 0.9.3

- Fixed a bug to omit documentation when inferring types (#21)
- Updated dependencies

## 0.9.2

- Fixed a bug when using `typeof` of an import statement

## 0.9.1

- Include all declarations to determine the comments
- Added `@dets_ignore` to explicitly ignore properties

## 0.9.0

- Added drop of `@ignore` properties (can be disabled)
- Added support for `@dets_preserve` comment to disable `@ignore` behavior in place
- Added support for `@dets_removeprop` and `@dets_removeclause` comments

## 0.8.1

- Updated log levels to include `disabled`
- Moved `main` field to use pre-bundled version
- Corrected `types` field

## 0.8.0

- Added support for tags in comments (#19)
- Added log levels with custom log provider support (#18)
- Added more verbose logging to node context

## 0.7.2

- Fixed handling of missing properties

## 0.7.1

- Updated dependencies
- Fixed handling of incomplete props (#17)

## 0.7.0

- Updated dependencies
- Added support for TypeScript 4

## 0.6.0

- Updated dependencies
- Added import equals declaration
- Added support for ref comments (#14)

## 0.5.5

- Ignore floating import nodes

## 0.5.4

- Fixed problem with default export in ambient modules
- Improved support for default (class) export

## 0.5.3

- Fixed invalid file references

## 0.5.2

- Fixed referencing of indirect symbols
- Improved usage of default imports

## 0.5.1

- Fixed undefined `typeof` declaration

## 0.5.0

- Improved preservation of overloads in interfaces
- Fixed type location when re-exporting (#11)
- Fixed potential name collisions when importing (#10)

## 0.4.2

- Fixed general truncation in certain cases
- Added support for `global.d.ts` files (#8)
- Lazy install TypeScript for CLI commands

## 0.4.1

- Fixed truncation of inferred object literals
- Fixed included default exports of module

## 0.4.0

- Enhanced the module resolution for imports
- Provide dets with peer dependency to TypeScript

## 0.3.3

- Updated dependencies
- Added support for default arguments

## 0.3.2

- Implemented support for `get` accessors
- Implemented support for `set` accessors
- Added support for the `readonly` keyword

## 0.3.1

- Fixed duplicated type parameters in decl. merging scenarios

## 0.3.0

- Improved resolution of interface merging
- Enhanced default CLI settings
- Support for tuples
- Support for enums

## 0.2.0

- Support for dynamically placed imports
- Support array and object destructuring
- Rewrote the engine for improved resolution
- Enhanced accuracy of generated declaration

## 0.1.5

- Added support for extends and implements in classes

## 0.1.4

- Fixed issue with exported class
- Improved treatment of default generics

## 0.1.3

- Support constructor calls
- Included support for exported default functions (#2)

## 0.1.2

- Improved potential recursion problem
- Improved support for exporting classes (#1)

## 0.1.1

- Added more test cases
- Improved readme file
- Smaller cosmetic improvements

## 0.1.0

- Initial Release
