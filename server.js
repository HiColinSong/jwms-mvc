let port = "7070"
if (process.argv.length <= 2) {
	console.log("Usage: node server.js [dev/qas/prod] [port]");
	process.exit(-1);
} else if (process.argv.length > 2){
	let env = process.argv[2];
	require('./api/config/appConfig').getInstance().setEnv(env);
	// console.log(JSON.stringify(require('./api/config/appConfig').getInstance().getSapConnParam(),null,2));
	// console.log(JSON.stringify(require('./api/config/appConfig').getInstance().getSqlConnParam(),null,2));
	if (process.argv.length > 3)
		port = process.argv[3];
}
 
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

var reservationHandler = require('./api/handlers/reservationHandler');
app.post('/bxapi/reservation/get-doc.json',auth.authCheck,reservationHandler.getResvDoc);
app.post('/bxapi/reservation/add-item.json',auth.authCheck,reservationHandler.addItem);
app.post('/bxapi/reservation/remove-item.json',auth.authCheck,reservationHandler.removeItem);
app.post('/bxapi/reservation/confirm.json',auth.authCheck,reservationHandler.confirmReservation);
app.post('/bxapi/reservation/reversal.json',auth.authCheck,reservationHandler.reservationReversal);

var rtgReceiptsHandler = require('./api/handlers/rtgReceiptsHandler');
app.post('/bxapi/rtgreceipts/get-order.json',auth.authCheck,rtgReceiptsHandler.getOrder);
app.post('/bxapi/rtgreceipts/add-item.json',auth.authCheck,rtgReceiptsHandler.addItem);
app.post('/bxapi/rtgreceipts/remove-item.json',auth.authCheck,rtgReceiptsHandler.removeItem);
app.post('/bxapi/rtgreceipts/confirm.json',auth.authCheck,rtgReceiptsHandler.confirmRga);
app.post('/bxapi/rtgReceipts/reversal.json',auth.authCheck,rtgReceiptsHandler.rgaReversal);
app.post('/bxapi/rtgReceipts/refresh-scanned-items.json',auth.authCheck,rtgReceiptsHandler.refreshScannedItems);

var spoReceiptsHandler = require('./api/handlers/spoReceiptsHandler');
app.post('/bxapi/sporeceipts/update-return.json',auth.authCheck,spoReceiptsHandler.updateReturn);
// app.post('/bxapi/sporeceipts/get-pending-list.json',auth.authCheck,spoReceiptsHandler.getPendingList);
app.get('/bxapi/sporeceipts/get-qa-category-list.json',auth.authCheck,spoReceiptsHandler.getQASampleCategoryList);
app.get('/bxapi/sporeceipts/get-subcon-order-list.json',auth.authCheck,spoReceiptsHandler.getSubconOrderList);
app.post('/bxapi/sporeceipts/get-subcon-work-order-info.json',auth.authCheck,spoReceiptsHandler.getSubconWorkOrderInfo);
app.post('/bxapi/sporeceipts/confirm.json',auth.authCheck,spoReceiptsHandler.completeSubconReceipt);
// app.post('/bxapi/sporeceipts/partial-release.json',auth.authCheck,spoReceiptsHandler.partialRelease);
app.post('/bxapi/sporeceipts/get-pending-list.json',auth.authCheck,spoReceiptsHandler.getScanPendingList);
// app.get('/bxapi/sporeceipts/add-item/:orderNo/:serialNo.json',auth.authCheck,spoReceiptsHandler.addItem);
// app.get('/bxapi/sporeceipts/remove-item/:orderNo/:serialNo.json',auth.authCheck,spoReceiptsHandler.removeItem);

var commonHandler = require('./api/handlers/commonHandler');
app.get('/bxapi/find-material/:eanCode.json',auth.authCheck,commonHandler.getMaterial);
app.post('/bxapi/find-customer-name.json',auth.authCheck,commonHandler.getCustomerName);
app.get('/bxapi/get-user-list.json',auth.adminCheck,commonHandler.getUserList);
app.post('/bxapi/add-edit-user.json',auth.adminCheck,commonHandler.addEditUser);
app.post('/bxapi/delete-user.json',auth.adminCheck,commonHandler.deleteUser);
app.post('/bxapi/view-log.json',auth.authCheck,commonHandler.viewLog);

var qrsmtHandler = require('./api/handlers/qrsmtHandler');
app.post('/bxapi/qrsmt/get-subcon-work-order-for-planner.json',auth.authCheck,qrsmtHandler.getSubconWorkOrderForPlanner);
app.post('/bxapi/qrsmt/save-plan.json',auth.authCheck,qrsmtHandler.saveQuarShptPlan);
app.post('/bxapi/qrsmt/get-prepack-order.json',auth.authCheck,qrsmtHandler.getPrepackOrder);
app.post('/bxapi/qrsmt/add-new-hu.json',auth.authCheck,qrsmtHandler.addNewHu);
app.post('/bxapi/qrsmt/add-item.json',auth.authCheck,qrsmtHandler.addItem);
// app.post('/bxapi/qrsmt/refresh-scanned-items.json',auth.authCheck,qrsmtHandler.getPrepackOrder);
app.get('/bxapi/qrsmt/refresh-hu/:orderNo.json',auth.authCheck,qrsmtHandler.refreshHu);


app.get('*', function(req, res){
   res.send({ERROR:'Sorry, '+req.originalUrl+' is an invalid URL.'});
});
app.listen(port, function () {
    console.log('Node app is running on port '+(port));
});