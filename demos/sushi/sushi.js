(function(angular){

    var app = angular.module("SushiApp", [ "kendo.directives", "ngRoute" ]);

    app.config([ "$routeProvider", "$sceDelegateProvider", function(routeProvider, sceDelegateProvider){
        // required so we can run in simulator
        sceDelegateProvider.resourceUrlWhitelist([ "**" ]);

        routeProvider
            .when("/", {
                templateUrl: "./views/home.html",
                controller: "HomeController",
            })
            .when("/details/:itemId", {
                templateUrl: "./views/details.html",
                controller: "DetailsController",
            })
            .when("/menu", {
                templateUrl: "./views/menu.html",
                controller: "MenuController",
            })
            .when("/cart", {
                templateUrl: "./views/cart.html",
                controller: "CartController",
            })
            .when("/account", {
                templateUrl: "./views/account.html",
                controller: "AccountController",
            })
            .when("/about", {
                templateUrl: "./views/about.html",
                controller: "AboutController",
            })
            .when("/done", {
                templateUrl: "./views/done.html",
                controller: "DoneController",
            })
        ;
    }]);

    app.controller("SushiController", [ "$scope", "$route", "$location", function($scope, $route, $location){
        $scope.pool = {};

        $scope.route = $route;

        $scope.sushiData = new kendo.data.DataSource({
            transport: {
                read: {
                    url: "./menu.json",
                    dataType: "json"
                }
            }
        });

        $scope.getItem = function(id) {
            return $scope.sushiData.get(id);
        };

        var templateCache = {};

        $scope.template = function(id) {
            if (templateCache[id])
                return templateCache[id];
            var html = $("#" + id).html();
            var tmpl = function() {
                return html;
            };
            templateCache[id] = tmpl;
            return tmpl;
        };

        $scope.added = new kendo.data.ObservableArray([]);

        $scope.addToCart = function(item) {
            var ordered = item.get("ordered") || 0;
            ordered++;
            item.set("ordered", ordered);
            if (ordered == 1) {
                $scope.added.push(item);
            }
        };

        $scope.removeItem = function(item) {
            if (item.ordered > 0) {
                item.set("ordered", 0);
                var index = $scope.added.indexOf(item);
                $scope.added.splice(index, 1);
            }
        };

        $scope.total = function() {
            var sum = 0;
            $scope.added.forEach(function(item){
                sum += item.price * item.ordered;
            });
            return sum;
        };

        $scope.$on("$routeChangeSuccess", function(ev){
            var path = $location.path();
            (function crap(){
                if (!$scope.tabStrip)
                    return setTimeout(crap, 100);
                $scope.tabStrip.switchByFullUrl(path.replace(/^\//, "#"));
            })();
        });

        // adjust the main view vertical padding to account for header and footer
        function adjustView() {
            $("#mainView").css({
                paddingTop: $("header").height(),
                paddingBottom: $("footer").height()
            });
        }
        $scope.$on("kendoRendered", adjustView);
        $(window).resize(adjustView);
    }]);

    app.controller("HomeController", [ "$scope", function($scope){
        $scope.pool.viewTitle = "Kendo + Angular Sushi";
        $scope.sushiData.group([]);
        $scope.sushiData.filter({ field: "featured", operator: "eq", value: true});
    }]);

    app.controller("DetailsController", [ "$scope", "$routeParams", function($scope, routeParams){
        $scope.pool.viewTitle = "Item details";
        $scope.item = $scope.getItem(routeParams.itemId);
    }]);

    app.controller("MenuController", [ "$scope", function($scope){
        $scope.pool.viewTitle = "Menu";
        $scope.sushiData.filter([]);
        $scope.sushiData.group({field: "category"});
    }]);

    app.controller("CartController", [ "$scope", "$timeout", function($scope, $timeout){
        $scope.pool.viewTitle = "Cart";
        $scope.checkout = function() {
            $timeout(function(){
                $scope.added.forEach(function(item){
                    item.set("ordered", 0);
                });
                $scope.added.splice(0, $scope.added.length);
            }, 400);
        };
    }]);

    app.controller("AccountController", [ "$scope", function($scope){
        $scope.pool.viewTitle = "Account";
    }]);

    app.controller("AboutController", [ "$scope", function($scope){
        $scope.pool.viewTitle = "About";
    }]);

    app.controller("DoneController", [ "$scope", function($scope){
        $scope.pool.viewTitle = "Done";
    }]);

})(window.angular);
