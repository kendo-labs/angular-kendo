(function($, window) {
    var dojo = window.dojo = {
        url: "http://trykendoui.telerik.com/",
        cdnRoot: '//cdn.kendostatic.com/2014.1.416',
        postSnippet: function (snippet, baseUrl) {
            snippet = dojo.addBaseRedirectTag(snippet, baseUrl);
            snippet = dojo.addConsoleScript(snippet);
            snippet = dojo.fixLineEndings(snippet);
            var form = $('<form method="post" action="' + dojo.url + '" target="_blank" />').hide().appendTo(document.body);
            $("<input name='snippet'>").val(snippet).appendTo(form);

            form.submit();
        },
        addBaseRedirectTag: function (code, baseUrl) {
            return code.replace(
                '<head>',
                '<head>\n' +
                    '    <base href="' + baseUrl + '">\n' +
                    '    <style>html { font-size: 12px; font-family: Arial, Helvetica, sans-serif; }</style>'
            );
        },
        addConsoleScript: function (code) {
            if(code.indexOf("kendoConsole") !== -1) {
            	var styleReference = '\t<link rel="stylesheet" href="../../content/shared/styles/examples-offline.css">\n';
                var scriptReference = '\t<script src="../../content/shared/js/console.js"></script>\n';
                code = code.replace("</head>", styleReference + scriptReference + "</head>");
            }
            return code;
        },
        fixLineEndings: function (code) {
            return code.replace(/\n/g, "&#10;");
        }
    };
})(jQuery, window);
