let port = "7070"
if (process.argv.length <= 2) {
	console.log("Usage: node server.js [dev/qas/prod] [port]");
	process.exit(-1);
} else if (process.argv.length > 2){
	let env = process.argv[2];
	require('./api/config/appConfig').getInstance().setEnv(env);
	if (process.argv.length > 3)
		port = process.argv[3];
}
 
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require("express-session");

 
app.use(bodyParser.json());
app.use(bodyParser.text({ type: 'text/html' }))
app.use(bodyParser.urlencoded({
    extended: true
}));

 app.use(session({
 	secret:"jmuser",
	 resave:true,
	 rolling:true,//reset expiration to the original maxAage on every response
 	saveUninitialized:true,
 	cookie:{
 		maxAge:1000*60*10 //ten mins
 	}

 }))
 
app.use('/', express.static(__dirname + '/web'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.get('/jmapi', function (req, res) {
   return res.send({message: 'hello, jmapi!' })
});
 
var auth=require('./api/handlers/authHandler');
app.get('/jmapi/check-login-status.json',auth.checkLoginStatus);
app.post('/jmapi/login.json',auth.login);
app.get('/jmapi/logout.json',auth.logout);
app.get('/db-info.json',auth.dbInfo);

var commonHandler = require('./api/handlers/commonHandler');
var businessPriceHandler = require('./api/handlers/businessPriceHandler');
var promotionDiscountHandler = require('./api/handlers/promotionDiscountHandler');
var saleForecastHandler = require('./api/handlers/saleForecastHandler');
var budgetAndIncomeReportHandler = require('./api/handlers/budgetAndIncomeReportHandler');
app.get('/jmapi/get-user-list.json',auth.adminCheck,commonHandler.getUserList);
app.post('/jmapi/get-business-price-list.json',auth.dataMaintenanceCheck,businessPriceHandler.getBusinessPriceList);
app.post('/jmapi/get-promotion-discount-list.json',auth.dataMaintenanceCheck,promotionDiscountHandler.getPromotionDiscountList);
app.get('/jmapi/get-product-type-list.json',auth.dataMaintenanceCheck,commonHandler.getProductTypeList);
app.get('/jmapi/get-agent-list.json',auth.dataMaintenanceCheck,commonHandler.getAgentList);
app.get('/jmapi/get-hospital-list.json',auth.dataMaintenanceCheck,commonHandler.getHospitalList);
app.get('/jmapi/get-saler-list.json',auth.dataMaintenanceCheck,saleForecastHandler.getSalerList);
app.post('/jmapi/add-edit-user.json',auth.adminCheck,commonHandler.addEditUser);
app.post('/jmapi/add-edit-business-price.json',auth.dataMaintenanceCheck,businessPriceHandler.addEditBusinessPrice);
app.post('/jmapi/copy-business-price.json',auth.dataMaintenanceCheck,businessPriceHandler.copyBusinessPrice);
app.post('/jmapi/copy-promotion-discount.json',auth.dataMaintenanceCheck,promotionDiscountHandler.copyPromotionDiscount);
app.post('/jmapi/copy-sale-forecast.json',auth.dataMaintenanceCheck,saleForecastHandler.copySaleForecast);
app.post('/jmapi/add-edit-promotion-discount.json',auth.dataMaintenanceCheck,promotionDiscountHandler.addEditPromotionDiscount);
app.post('/jmapi/delete-user.json',auth.adminCheck,commonHandler.deleteUser);
app.post('/jmapi/delete-business-price.json',auth.dataMaintenanceCheck,businessPriceHandler.deleteBusinessPrice);
app.post('/jmapi/delete-promotion-discount.json',auth.dataMaintenanceCheck,promotionDiscountHandler.deletePromotionDiscount);

app.post('/jmapi/get-sale-forecast-list.json',auth.adminCheck,saleForecastHandler.getSaleForecastList);
app.post('/jmapi/add-edit-sale-forecast.json',auth.adminCheck,saleForecastHandler.addEditSaleForecast);
app.post('/jmapi/delete-sale-forecast.json',auth.adminCheck,saleForecastHandler.deleteSaleForecast);
app.post('/jmapi/view-info-log.json',auth.authCheck,commonHandler.viewLog);
app.post('/jmapi/view-error-log.json',auth.authCheck,commonHandler.viewLog);
app.post('/jmapi/get-performance-report.json',auth.authCheck,commonHandler.getPerformanceReport);
app.post('/jmapi/get-budget-and-income-report.json',auth.adminCheck,budgetAndIncomeReportHandler.getBudgetAndIncomeReport);
app.post('/jmapi/get-budget-and-income-detail-report.json',auth.adminCheck,budgetAndIncomeReportHandler.getBudgetAndIncomeReport);
app.get('*', function(req, res){
   res.send({ERROR:'Sorry, '+req.originalUrl+' is an invalid URL.'});
});
app.listen(port, function () {
    console.log('Node app is running on port '+(port));
});