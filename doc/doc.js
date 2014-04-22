(function(){

    var DEMOS = [
        { widget: "AutoComplete" },
        { widget: "Button" },
        { widget: "Calendar" },
        { widget: "ColorPicker" },
        { widget: "ComboBox" },
        { widget: "DatePicker" },
        { widget: "DateTimePicker" },
        { widget: "DropDownList" },
        { widget: "Editor" },
        { widget: "Grid" },
        { widget: "MaskedTextBox" },
        { widget: "Menu" },
        { widget: "Mobile" },
        { widget: "MultiSelect" },
        { widget: "Notification" },
        { widget: "NumericTextBox" },
        { widget: "PanelBar" },
        { widget: "ProgressBar" },
        { widget: "Scheduler" },
        { widget: "Slider" },
        { widget: "Sortable" },
        { widget: "Splitter" },
        { widget: "TabStrip" },
        { widget: "TimePicker" },
        { widget: "Tooltip" },
        { widget: "TreeView" },
        { widget: "Upload" },
        { widget: "Window" },
    ];

    var app = angular.module("DemoApp", [ "kendo.directives", "ngRoute" ]);

    app.controller("DemoController", [ "$scope", "$route", function($scope, $route){
        $scope.demos = DEMOS;
        $scope.$route = $route;
    }]);

    app.controller("HomeController", [ "$scope", function($scope){
        $scope.selection = 1;
        $scope.things = {
            data: [{ name: "Thing 1", id: 1 },
                   { name: "Thing 2", id: 2 },
                   { name: "Thing 3", id: 3 }]
        };
        $scope.thingsOptions = {
            dataSource: {
                data: [{ name: "Thing 1", id: 1 },
                       { name: "Thing 2", id: 2 },
                       { name: "Thing 3", id: 3 }]
            },
            dataTextField: "name",
            dataValueField: "id",
            optionLabel: "Select A Thing"
        };
        $scope.thingsChange = function(e) {
            console.log(e.sender.text());
        };
        $scope.products = new kendo.data.DataSource({
            transport: {
                read: "data/products.json"
            },
            pageSize: 5
        });
        $scope.column = {
            title: {
                text: "Site Visitors Stats /thousands/"
            },
            legend: {
                visible: false
            },
            seriesDefaults: {
                type: "column"
            },
            series: [{
                name: "Total Visits",
                data: [56000, 63000, 74000 ]
            },
                     {
                         name: "Unique visitors",
                         data: [52000, 34000, 23000 ]
                     }],
            valueAxis: {
                max: 100000,
                line: {
                    visible: false
                },
                minorGridLines: {
                    visible: true
                }
            },
            categoryAxis: {
                categories: ["Jan", "Feb", "Mar" ],
                majorGridLines: {
                    visible: false
                }
            },
            tooltip: {
                visible: true,
                template: "#= series.name #: #= value #"
            },
            chartArea: {
                background: ""
            }
        };
        $scope.pie = ({
            title: {
                position: "bottom",
                text: "Share of Internet Population Growth"
            },
            legend: {
                visible: false
            },
            chartArea: {
                background: ""
            },
            seriesDefaults: {
                labels: {
                    visible: true,
                    background: "transparent",
                    template: "#= category #: #= value#%"
                }
            },
            series: [{
                type: "pie",
                startAngle: 150,
                data: [{
                    category: "Asia",
                    value: 53.8,
                    color: "#9de219"
                },{
                    category: "Europe",
                    value: 16.1,
                    color: "#90cc38"
                },{
                    category: "Latin America",
                    value: 11.3,
                    color: "#068c35"
                },{
                    category: "Africa",
                    value: 9.6,
                    color: "#006634"
                },{
                    category: "Middle East",
                    value: 5.2,
                    color: "#004d38"
                },{
                    category: "North America",
                    value: 3.6,
                    color: "#033939"
                }]
            }],
            tooltip: {
                visible: true,
                format: "{0}%"
            }
        });
    }]);

    app.config([ "$routeProvider", function($routeProvider){
        DEMOS.forEach(function(x){
            var props = {
                templateUrl: "views/" + x.widget + ".html",
                widget: x.widget,
                title: x.widget
            };
            if (x.controller) props.controller = x.controller;
            $routeProvider.when("/" + x.widget, props);
        });
        $routeProvider.when("/", {
            templateUrl: "home.html",
            controller: "HomeController",
        });
    }]);

})();

function fixSampleCode() {
    $("pre.code").each(function(){
        this.setAttribute("ng-non-bindable", true);
        var code = $(this).data("code-id");
        if (code) {
            code = $("#" + code).html();
            code = code.replace(/^[\n\r]+/, "");
            code = code.replace(/(kendo-[a-z-]+)=\"\"/g, "$1");
            this.innerHTML = "";
            var text = document.createTextNode(code);
            this.appendChild(text);
        }
        Prism.highlightElement(this);
    });
}

$(document).ready(function(){
    var logo = $(".logolink");
    var pos = logo.offset();
    $(window).on("scroll", fixlogo);
    function fixlogo(ev){
        if ($(window).scrollTop() > pos.top) {
            logo.addClass("fixed");
        } else {
            logo.removeClass("fixed");
        }
    }
    fixlogo();
});
