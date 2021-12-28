<!-- For torn forums: https://ddormer.github.io/markdown-to-bbcode-site/ -->
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.2] - 2021-12-28
### Added
- Sanity check at startup for correct page
- Added update link to new github repo

### Fixed
- Not unhooking on 0 bucks
- Hooking even when on 0 bucks

### Changed
- `active` is set *in* `hook()` and `unHook()`, instead of before/after these functions
- Tampermonkey `@namespace` to `sportshead.dev`

### Removed
- Unneeded `getAction()` function

## [0.0.1] -  2021-12-26
### Added
- Fetch interceptor
- Hook/unhook system
- Buttons on beer tent
- Automatic bucks updating

[0.0.2]: https://github.com/sportshead/beer_glass/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/sportshead/beer_glass/releases/tag/v0.0.1
