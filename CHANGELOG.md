# 0.5.2

* Add version number to top of minified file ((issue #50)[https://github.com/kendo-labs/angular-kendo/issues/50])
* Update Kendo UI version in demos to 2013.2.716
* Add initial view value to widgets with ng-model binding ((issue #53)[https://github.com/kendo-labs/angular-kendo/pull/53])
* Change DataSource delcaration to literal on demos so all DropDowns show optionLabel ((issue #57)[https://github.com/kendo-labs/angular-kendo/issues/57]

# 0.5.1

* Minified file is fixed (issue #26)
* Safe apply added (issue #27)

# 0.5.0

### Revamp of API to provide deeper integration with AngularJS.

* Changed directive to `kendo-widget-name` instead of `data-role` declaration
* Configuration options object can now be passed from $scope using `k-options` attribute
* Events are declared with a preceding `k-on` as attributes and take in a `kendoEvent` argument to capture the fired event from Kendo UI
* All widgets now work with `ng-model` for two way binding to scope
* A widget reference can be assigned to a scope variable by passing the name into the primary directive attribute

# .0.0.1

Initial release is a passthrough for Kendo UI declarative initialization using a simple directive.



