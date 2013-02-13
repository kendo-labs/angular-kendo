chrome.app.runtime.onLaunched.addListener(function() {
  
  // create a new window and position it with a fixed size
  var win = chrome.app.window.create('index.html', {
    width: 1024,
    height: 870,
    minWidth:900,
    minHeight:800,
    left:500,
    top:500
  });

});
