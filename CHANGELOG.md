# Changelog for dets

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
