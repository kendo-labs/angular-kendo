var express 	= require('express'),
    Resource 	= require('express-resource'),
    fs		= require('fs'),
    app     	= module.exports = express();

// Configuration
app.configure(function(){
    app.use(express.logger('[:date] :method :url :status - :response-time ms'));
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/..'));

    app.get('/', function(req, res) {
        fs.readFile(__dirname + '/../index.html', 'utf8', function(err, text){
            res.send(text);
        });
    });
    
});

app.listen(3000);

console.log("Express server listening on port 3000");
