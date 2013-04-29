angular.module('kendo.directives').factory('utils',
  function() {
    return {
      // simplistic reduce function
      reduce: function(obj, cb, memo) {
        angular.forEach(obj, function(value, key) {
          memo = cb.call(value, memo, value, key);
        });
        return memo;
      }
    };
  }
);