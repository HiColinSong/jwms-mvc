const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require("express-session");

 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
 app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

 app.use(session({
 	secret:"bxuser",
 	resave:true,
 	saveUninitialized:true,
 	cookie:{
 		maxAge:300000 //5 miniutes
 	}

 }))
 
// default route
app.get('/', function (req, res) {
    return res.send({message: 'hello, Biosensors bxapi!' })
});
 
var auth=require('./controllers/authHandler');
// app.get('/bxapi/transOrder/:orderNo.json',auth.authCheck,packingHandler.getTransOrder);
app.get('/bxapi/check-login-status.json',auth.checkLoginStatus);
app.post('/bxapi/login.json',auth.login);
app.get('/bxapi/logout.json',auth.logout);

var packingHandler = require('./controllers/packingHandler');
app.get('/bxapi/packing/get-order/:orderNo.json',auth.authCheck,packingHandler.getOrder);
app.get('/bxapi/packing/add-hu-to-order/:orderNo/:huNo.json',auth.authCheck,packingHandler.addHuToOrder);
app.get('/bxapi/packing/remove-hu-from-order/:orderNo/:huNo.json',auth.authCheck,packingHandler.removeHuFromOrder);
app.get('/bxapi/packing/add-item-to-hu/:orderNo/:huNo/:serialNo.json',auth.authCheck,packingHandler.addItemtoHu);
app.get('/bxapi/packing/remove-item-from-hu/:orderNo/:huNo/:serialNo.json',auth.authCheck,packingHandler.removeItemtoHu);

var pickingHandler = require('./controllers/pickingHandler');
app.get('/bxapi/picking/get-order/:orderNo.json',auth.authCheck,pickingHandler.getOrder);
app.get('/bxapi/picking/add-item/:orderNo/:serialNo.json',auth.authCheck,pickingHandler.addItem);
app.get('/bxapi/picking/remove-item/:orderNo/:serialNo.json',auth.authCheck,pickingHandler.removeItem);
app.get('/bxapi/picking/set-status/:orderNo/:status.json',auth.authCheck,pickingHandler.setStatus);

var poReceiptsHandler = require('./controllers/poReceiptsHandler');
app.get('/bxapi/poreceipts/get-order/:orderNo.json',auth.authCheck,poReceiptsHandler.getOrder);
app.get('/bxapi/poreceipts/add-item/:orderNo/:serialNo.json',auth.authCheck,poReceiptsHandler.addItem);
app.get('/bxapi/poreceipts/remove-item/:orderNo/:serialNo.json',auth.authCheck,poReceiptsHandler.removeItem);

var woReceiptsHandler = require('./controllers/woReceiptsHandler');
app.get('/bxapi/woreceipts/get-order/:orderNo.json',auth.authCheck,woReceiptsHandler.getOrder);
app.get('/bxapi/woreceipts/add-item/:orderNo/:serialNo.json',auth.authCheck,woReceiptsHandler.addItem);
app.get('/bxapi/woreceipts/remove-item/:orderNo/:serialNo.json',auth.authCheck,woReceiptsHandler.removeItem);


app.get('*', function(req, res){
   res.send('Sorry, this is an invalid URL.');
});
// port must be set to 8080 because incoming http requests are routed from port 80 to port 8080
app.listen(8080, function () {
    console.log('Node app is running on port 8080');
});