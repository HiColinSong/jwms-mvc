'use strict';
const util = require('../config/util');
// const dbCommonSvc=require('../dbservices/dbCommonSvc');
const dbSpoReceiptsSvc=require('../dbservices/dbSpoReceiptsSvc');
exports.getSubconOrderList=function(req,res){
	(async function () {
		try {
			var list = await dbSpoReceiptsSvc.getSubconOrders();
			return res.status(200).send(list.recordset);
		} catch (error) {
			return res.status(400).send([{error:true,message:error.message}]);
		}
	})()
};
exports.getSubconWorkOrderInfo=function(req,res){
	(async function () {
		try {
			var data = {};
			var list = await dbSpoReceiptsSvc.getSubconWorkOrders(req.body.orderNo);
			data.workOrders = list.recordset;
			list = await dbSpoReceiptsSvc.getSubconPendingList(req.body.orderNo,'SGW');
			data.bitPendingList = list.recordset;
			list = await dbSpoReceiptsSvc.getSubconPendingList(req.body.orderNo,'SGQ');
			data.qasPendingList = list.recordset;
			return res.status(200).send(data);
		} catch (error) {
			return res.status(400).send({error:true,message:error.message});
		}
	})()
};
exports.getPendingList=function(req,res){
	(async function () {
		try {
			var list = await dbSpoReceiptsSvc.getSubconPendingList(req.body.sShip2Target);
			return res.status(200).send(list.recordset);
		} catch (error) {
			return res.status(400).send([{error:true,message:error.message}]);
		}
	})()
};
exports.getQASampleCategoryList=function(req,res){
	(async function () {
		try {
			var list = await dbSpoReceiptsSvc.getQASampleCategoryList();
			return res.status(200).send(list.recordset);
		} catch (error) {
			return res.status(200).send({error:true,message:error});
		}
	})()
};

exports.updateReturn=function(req,res){
	(async function () {
		try {
			var param={
					sFullScanCode:req.body.sFullScanCode,
					sReturnToTarget:req.body.sReturnToTarget,
					sLogonUser:req.session.user.UserID,
					sQACategory:req.body.sQACategory
					// ,
					// dCurrDate:new Date(req.body.dCurrDate)
				}
			var list = await dbSpoReceiptsSvc.updateSubConReturns(param);
			
			var data = {};
			var list = await dbSpoReceiptsSvc.getSubconWorkOrders(req.body.orderNo);
			data.workOrders = list.recordset;
			list = await dbSpoReceiptsSvc.getSubconPendingList(req.body.orderNo,'SGW');
			data.bitPendingList = list.recordset;
			list = await dbSpoReceiptsSvc.getSubconPendingList(req.body.orderNo,'SGQ');
			data.qasPendingList = list.recordset;

			return res.status(200).send(list.recordset);//return serial number
		} catch (error) {
			return res.status(400).send([{error:true,message:error.message}]);
		}
	})()
};

exports.completeSubconReceipt=function(req,res){
	(async function () {
		try {
			var list = await dbSpoReceiptsSvc.CheckAndCompleteSubConReceipt(req.body.orderNo);
			return res.status(200).send(list.recordset);//return serial number
		} catch (error) {
			return res.status(400).send([{error:true,message:error.message}]);
		}
	})()
};

exports.removeItem=function(req,res){

};

exports.setStatus=function(req,res){

};
