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
	 rolling:true,//reset expiration to the original maxAage on every response
 	saveUninitialized:true,
 	cookie:{
 		maxAge:1000*60*10 //ten mins
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
// var info = require('./db-config/.db-config.json');
app.get('/bxapi/check-login-status.json',auth.checkLoginStatus);
app.post('/bxapi/login.json',auth.login);
app.get('/bxapi/logout.json',auth.logout);
app.get('/db-info.json',auth.dbInfo);

var packingHandler = require('./api/handlers/packingHandler');
// app.get('/bxapi/packing/get-order/:orderNo.json',auth.authCheck,packingHandler.getOrder);
app.post('/bxapi/packing/get-order.json',auth.authCheck,packingHandler.getOrder);
app.get('/bxapi/packing/refresh-hu/:orderNo.json',auth.authCheck,packingHandler.refreshHu);
app.get('/bxapi/packing/get-pkg-material-list.json',auth.authCheck,packingHandler.getPkgMtlList);
app.post('/bxapi/packing/add-item.json',auth.authCheck,packingHandler.addItem);
app.post('/bxapi/packing/add-new-hu.json',auth.authCheck,packingHandler.addNewHu);
app.post('/bxapi/packing/remove-hu.json',auth.authCheck,packingHandler.removeHu);
app.post('/bxapi/packing/remove-item.json',auth.authCheck,packingHandler.removeItem);
app.post('/bxapi/packing/confirm.json',auth.authCheck,packingHandler.confirmPacking);
app.get('/bxapi/packing/reversal/:orderNo.json',auth.authCheck,packingHandler.reversal);

app.post('/bxapi/pgi/update.json',auth.authCheck,packingHandler.pgiUpdate);
app.post('/bxapi/pgi/reversals.json',auth.authCheck,packingHandler.pgiReversal);

var pickingHandler = require('./api/handlers/pickingHandler');
app.post('/bxapi/picking/get-order.json',auth.authCheck,pickingHandler.getOrder);
app.get('/bxapi/picking/add-item/:orderNo/:serialNo.json',auth.authCheck,pickingHandler.addItem);
app.get('/bxapi/picking/remove-item/:orderNo/:serialNo.json',auth.authCheck,pickingHandler.removeItem);
app.post('/bxapi/picking/set-status.json',auth.authCheck,pickingHandler.setStatus);
// app.get('/bxapi/picking/reversal/:orderNo.json',auth.authCheck,pickingHandler.pickingReversals);

var pickingReversalsHandler = require('./api/handlers/pickingReversalsHandler');
app.post('/bxapi/picking-reversals/get-order.json',auth.authCheck,pickingReversalsHandler.getOrder);
app.post('/bxapi/picking-reversals/reversals.json',auth.authCheck,pickingReversalsHandler.pickingReversals);

var rtgReceiptsHandler = require('./api/handlers/rtgReceiptsHandler');
app.post('/bxapi/rtgreceipts/get-order.json',auth.authCheck,rtgReceiptsHandler.getOrder);
app.post('/bxapi/rtgreceipts/add-item.json',auth.authCheck,rtgReceiptsHandler.addItem);
app.post('/bxapi/rtgreceipts/remove-item.json',auth.authCheck,rtgReceiptsHandler.removeItem);
app.post('/bxapi/rtgreceipts/confirm.json',auth.authCheck,rtgReceiptsHandler.confirmRga);
app.post('/bxapi/rtgReceipts/reversal.json',auth.authCheck,rtgReceiptsHandler.rgaReversal);

var spoReceiptsHandler = require('./api/handlers/spoReceiptsHandler');
app.post('/bxapi/sporeceipts/update-return.json',auth.authCheck,spoReceiptsHandler.updateReturn);
app.post('/bxapi/sporeceipts/get-pending-list.json',auth.authCheck,spoReceiptsHandler.getPendingList);
app.get('/bxapi/sporeceipts/get-qa-category-list.json',auth.authCheck,spoReceiptsHandler.getQASampleCategoryList);
// app.get('/bxapi/sporeceipts/add-item/:orderNo/:serialNo.json',auth.authCheck,spoReceiptsHandler.addItem);
// app.get('/bxapi/sporeceipts/remove-item/:orderNo/:serialNo.json',auth.authCheck,spoReceiptsHandler.removeItem);

var commonHandler = require('./api/handlers/commonHandler');
app.get('/bxapi/find-material/:eanCode.json',auth.authCheck,commonHandler.getMaterial);
app.post('/bxapi/find-customer-name.json',auth.authCheck,commonHandler.getCustomerName);


app.get('*', function(req, res){
   res.send({ERROR:'Sorry, this is an invalid URL.'});
});
// port must be set to 7070 because incoming http requests are routed from port 80 to port 8080
app.listen(process.env.PORT||7070, function () {
    console.log('Node app is running on port '+(process.env.PORT||7070));
});