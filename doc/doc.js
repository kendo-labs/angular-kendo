var URLPREFIX = "./doc/";

(function(){

    var WEB_DEMOS = [
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
        { widget: "Window" },
    ];

    var DOCS = [
        { page: "basics", title: "Basic usage", controller: "BasicDocsController" },
        { page: "datasource", title: "Data source vs. Angular" },
        { page: "events", title: "Global events" }
    ];

    var app = angular.module("DemoApp", [ "kendo.directives", "ngRoute", "ngSanitize" ]);

    app.config([ "$routeProvider", function($routeProvider){
        WEB_DEMOS.forEach(function(x){
            var props = {
                templateUrl: URLPREFIX + "web/" + x.widget + ".html",
                widget: x.widget,
                title: x.widget
            };
            if (x.controller) props.controller = x.controller;
            $routeProvider.when("/" + x.widget, props);
        });
        DOCS.forEach(function(x){
            var props = {
                templateUrl: URLPREFIX + "docs/" + x.page + ".html",
                page: x.page,
                title: x.title
            };
            if (x.controller) props.controller = x.controller;
            $routeProvider.when("/" + x.page, props);
        });
        $routeProvider.when("/", {
            templateUrl: URLPREFIX + "home.html",
        });
    }]);

    app.controller("DemoController", [ "$scope", "$route", function($scope, $route){
        $scope.webDemos = WEB_DEMOS;
        $scope.docPages = DOCS;
        $scope.$route = $route;
        $scope.URLPREFIX = URLPREFIX;
        $scope.SHOW_SOURCE = URLPREFIX + "web/show-source.html";
        var mustFade = false;
        $scope.$on("kendoRendered", function(){
            if (mustFade) {
                $("#pageview").css({ visibility: "visible", display: "none" });
                $("#pageview").fadeIn();
                mustFade = false;
            }
        });
        $scope.$on("$routeChangeStart", function(){
            $("#pageview").fadeOut();
        });
        $scope.$on("$viewContentLoaded", function(){
            $("html, body").scrollTop(0);
            mustFade = true;
        });
    }]);

    app.controller("BasicDocsController", [ "$scope", function($scope){
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
                read: URLPREFIX + "data/products.json"
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
        $scope.pie = {
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
        };
    }]);

})();

function getCode(id) {
    return $("#" + id).html().replace(/^<!--\s*|\s*-->$/g, "");
}

function makeHtmlForDojo(args) {
    function indent(spacing) {
        return function(str) {
            return str.replace(/^[\n\r]+|\s*$/g, "")
                .split(/[\n\r]+/)
                .map(function(line){ return spacing + line })
                .join("\n");
        };
    }
    var js = "";
    if (args.js) {
        js = args.js.map(indent("      ")).join("\n\n");
        js = "    <script>\n" + js + "\n    </script>";
    }
    var html = "";
    if (args.html) {
        html = args.html.map(indent("    ")).join("\n\n");
    }
    return getCode("html-for-dojo")
        .replace(/\$JS/g, js)
        .replace(/\$HTML/g, html)
        .replace(/\$CDNROOT/g, dojo.cdnRoot);
}

function fixSampleCode() {
    $("pre.code").each(function(){
        this.setAttribute("ng-non-bindable", true);
        var code = $(this).data("code-id");
        if (code) {
            code = getCode(code);
            code = code.replace(/^[\n\r]+/, "");
            code = code.replace(/(kendo-[a-z-]+)=\"\"/g, "$1");
            this.innerHTML = "";
            var text = document.createTextNode(code);
            this.appendChild(text);
        }
        Prism.highlightElement(this);
    });
    $("div.includeHtml").each(function(){
        var id = $(this).data("code-id");
        $(this).html(getCode(id));
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

$(document).on("click", ".try-kendo", function(ev){
    var btn = $(ev.target);
    var js = btn.data("js");
    var html = btn.data("html");
    if (js) {
        js = js.split(",").map(getCode);
    }
    if (html) {
        html = html.split(",").map(getCode);
    }
    var code = makeHtmlForDojo({ js: js, html: html });
    dojo.postSnippet(code, window.location.href);
});
