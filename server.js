const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require("express-session");

 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));



 app.use(session({
 	secret:"bxuser",
 	resave:true,
 	saveUninitialized:true,
 	cookie:{
 		maxAge:3600000 //5 miniutes
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
app.get('/bxapi/packing/refresh-hu/:orderNo.json',auth.authCheck,packingHandler.refreshHu);
app.get('/bxapi/packing/get-pkg-material-list.json',auth.authCheck,packingHandler.getPkgMtlList);
app.post('/bxapi/packing/add-item.json',auth.authCheck,packingHandler.addItem);
app.post('/bxapi/packing/add-new-hu.json',auth.authCheck,packingHandler.addNewHu);
app.post('/bxapi/packing/remove-hu.json',auth.authCheck,packingHandler.removeHu);
app.post('/bxapi/packing/remove-item.json',auth.authCheck,packingHandler.removeItem);
app.post('/bxapi/packing/confirm.json',auth.authCheck,packingHandler.confirmPacking);

var pickingHandler = require('./controllers/pickingHandler');
app.post('/bxapi/picking/get-order.json',auth.authCheck,pickingHandler.getOrder);
app.get('/bxapi/picking/get-order/:orderNo.json',auth.authCheck,pickingHandler.getOrder);
app.get('/bxapi/picking/add-item/:orderNo/:serialNo.json',auth.authCheck,pickingHandler.addItem);
app.get('/bxapi/picking/remove-item/:orderNo/:serialNo.json',auth.authCheck,pickingHandler.removeItem);
app.get('/bxapi/picking/set-status/:orderNo/:status.json',auth.authCheck,pickingHandler.setStatus);

var rtgReceiptsHandler = require('./controllers/rtgReceiptsHandler');
app.get('/bxapi/rtgreceipts/get-order/:orderNo.json',auth.authCheck,rtgReceiptsHandler.getOrder);
app.get('/bxapi/rtgreceipts/add-item/:orderNo/:serialNo.json',auth.authCheck,rtgReceiptsHandler.addItem);
app.get('/bxapi/rtgreceipts/remove-item/:orderNo/:serialNo.json',auth.authCheck,rtgReceiptsHandler.removeItem);

var spoReceiptsHandler = require('./controllers/spoReceiptsHandler');
app.get('/bxapi/sporeceipts/get-order/:orderNo.json',auth.authCheck,spoReceiptsHandler.getOrder);
app.get('/bxapi/sporeceipts/add-item/:orderNo/:serialNo.json',auth.authCheck,spoReceiptsHandler.addItem);
app.get('/bxapi/sporeceipts/remove-item/:orderNo/:serialNo.json',auth.authCheck,spoReceiptsHandler.removeItem);

var commonHandler = require('./controllers/commonHandler');
app.get('/bxapi/find-material/:eanCode.json',auth.authCheck,commonHandler.getMaterial);


app.get('*', function(req, res){
   res.send({ERROR:'Sorry, this is an invalid URL.'});
});
// port must be set to 8080 because incoming http requests are routed from port 80 to port 8080
app.listen(8080, function () {
    console.log('Node app is running on port 8080');
});