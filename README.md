# AngularJS Integration For Kendo UI

## About angular-kendo

angular-kendo is a directive for AngularJS that runs an element through Kendo UI declarative initialization, allowing you to take full advantage of Kendo UI within the context of an AngularJS Application.

## Compatibility and Requirements

angular-kendo currently depends on the following libraries:

- [jQuery](http://www.jquery.com) v1.9.1
- [Kendo UI](http://www.kendoui.com) vCurrent
- [AngularJS](http://www.angularjs.org) v1.2.1+

angular-kendo has not been tested against any other versions of these libraries. You may find that versions other than these are compatible with angular-kendo, but we make no claims to support those version, nor can we troubleshoot issues that arise when using those versions.

## Source Code and Downloads

This repository contains the full source code in `angular-kendo.js`. To get a minified version, just run `grunt` with no arguments in the top directory and it will create `build/angular-kendo.min.js` (before that you need to run `npm install` if you haven't already).

## Documentation

Full documentation can be found on the [gh-pages site](http://kendo-labs.github.com/angular-kendo/) for this repo.

## Running unit tests
### Setup
Run the following commands before running test-cases for the first time:

1. `npm install` - This will install Bower globally and Karma test runner locally.
2. `bower install` - This will install components that are needed to run test-cases.

### Running
Tests can be run using following command: `karma start`

## How to Contribute

If you would like to contribute to angular-kendo's source code, please read the [guidelines for pull requests and contributions](CONTRIBUTING.md). Following these guidelines will help make your contributions easier to bring in to the next release.

## Getting Help

StackOverflow is a good place to start, but be sure to read the [documentation for Kendo UI](http://docs.kendoui.com), and of course the [AngularJS documentation](http://docs.angularjs.org/api/)

As a part of Kendo UI Labs, angular-kendo is intended to be a community-run project, and not an official part of any Kendo UI SKU (Web, DataViz, Mobile or Complete). As such, this project is not a supported part of Kendo UI, and is not covered under the support agreements for Kendo UI license holders. Please do not create support requests for this project, as these will be immediately closed and you'll be directed to post your question on a community forum.

## Release Notes

For change logs and release notes, see the [changelog](CHANGELOG.md) file.

## MIT License

Copyright © 2013 Telerik

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
