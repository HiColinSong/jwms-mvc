const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require("express-session");

 
app.use(bodyParser.json());

// parse various different custom JSON types as JSON
// app.use(bodyParser.json({ type: 'application/*+json' }))
// parse some custom thing into a Buffer
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))
// parse an HTML body into a string
app.use(bodyParser.text({ type: 'text/html' }))
app.use(bodyParser.urlencoded({
    extended: true
}));



 app.use(session({
 	secret:"bxuser",
 	resave:true,
 	saveUninitialized:true,
 	cookie:{
 		maxAge:3600000 //1 hour
 	}

 }))
 
// default route
// app.get('/', function (req, res) {
//     return res.send({message: 'hello, Biosensors bxapi!' })
// });

app.use('/', express.static(__dirname + '/web'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.get('/bxapi', function (req, res) {
   return res.send({message: 'hello, bxapi!' })
});
 
var auth=require('./api/handlers/authHandler');
// app.get('/bxapi/transOrder/:orderNo.json',auth.authCheck,packingHandler.getTransOrder);
app.get('/bxapi/check-login-status.json',auth.checkLoginStatus);
app.post('/bxapi/login.json',auth.login);
app.get('/bxapi/logout.json',auth.logout);

var packingHandler = require('./api/handlers/packingHandler');
app.get('/bxapi/packing/get-order/:orderNo.json',auth.authCheck,packingHandler.getOrder);
app.get('/bxapi/packing/refresh-hu/:orderNo.json',auth.authCheck,packingHandler.refreshHu);
app.get('/bxapi/packing/get-pkg-material-list.json',auth.authCheck,packingHandler.getPkgMtlList);
app.post('/bxapi/packing/add-item.json',auth.authCheck,packingHandler.addItem);
app.post('/bxapi/packing/add-new-hu.json',auth.authCheck,packingHandler.addNewHu);
app.post('/bxapi/packing/remove-hu.json',auth.authCheck,packingHandler.removeHu);
app.post('/bxapi/packing/remove-item.json',auth.authCheck,packingHandler.removeItem);
app.post('/bxapi/packing/confirm.json',auth.authCheck,packingHandler.confirmPacking);

var pickingHandler = require('./api/handlers/pickingHandler');
app.post('/bxapi/picking/get-order.json',auth.authCheck,pickingHandler.getOrder);
app.get('/bxapi/picking/get-order/:orderNo.json',auth.authCheck,pickingHandler.getOrder);
app.get('/bxapi/picking/add-item/:orderNo/:serialNo.json',auth.authCheck,pickingHandler.addItem);
app.get('/bxapi/picking/remove-item/:orderNo/:serialNo.json',auth.authCheck,pickingHandler.removeItem);
app.get('/bxapi/picking/set-status/:orderNo/:status.json',auth.authCheck,pickingHandler.setStatus);

var rtgReceiptsHandler = require('./api/handlers/rtgReceiptsHandler');
app.get('/bxapi/rtgreceipts/get-order/:orderNo.json',auth.authCheck,rtgReceiptsHandler.getOrder);
app.get('/bxapi/rtgreceipts/add-item/:orderNo/:serialNo.json',auth.authCheck,rtgReceiptsHandler.addItem);
app.get('/bxapi/rtgreceipts/remove-item/:orderNo/:serialNo.json',auth.authCheck,rtgReceiptsHandler.removeItem);

var spoReceiptsHandler = require('./api/handlers/spoReceiptsHandler');
app.get('/bxapi/sporeceipts/get-order/:orderNo.json',auth.authCheck,spoReceiptsHandler.getOrder);
app.get('/bxapi/sporeceipts/add-item/:orderNo/:serialNo.json',auth.authCheck,spoReceiptsHandler.addItem);
app.get('/bxapi/sporeceipts/remove-item/:orderNo/:serialNo.json',auth.authCheck,spoReceiptsHandler.removeItem);

var commonHandler = require('./api/handlers/commonHandler');
app.get('/bxapi/find-material/:eanCode.json',auth.authCheck,commonHandler.getMaterial);


app.get('*', function(req, res){
   res.send({ERROR:'Sorry, this is an invalid URL.'});
});
// port must be set to 8080 because incoming http requests are routed from port 80 to port 8080
app.listen(8080, function () {
    console.log('Node app is running on port 8080');
});