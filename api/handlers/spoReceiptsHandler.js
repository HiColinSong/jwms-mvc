'use strict';
const util = require('../config/util');
const dbCommonSvc=require('../dbservices/dbCommonSvc');
exports.getPendingList=function(req,res){
	(async function () {
		try {
			var param={
					sShip2Target:req.body.sShip2Target,
					sQACategory:req.body.sQACategory
				}
			var list = await dbCommonSvc.getSubconPendingList(param);
			if (list&&list.recordset){
				return res.status(200).send(list.recordset);
			} else {
				return res.status(200).send([{error:true,message:"Operation Failed!"}]);
			}
		} catch (error) {
			return res.status(400).send([{error:true,message:error.message}]);
		}
	})()
};
exports.getQASampleCategoryList=function(req,res){
	(async function () {
		try {
			var list = await dbCommonSvc.getQASampleCategoryList();
			if (list&&list.recordset){
				return res.status(200).send(list.recordset);
			} else {
				return res.status(200).send({error:true,message:"The QA Sample Category list cannot be loaded"});
			}
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
			var list = await dbCommonSvc.updateSubConReturns(param);
			if (list&&list.recordset){
				return res.status(200).send(list.recordset[0][""][0]);//return serial number
			} else {
				return res.status(200).send([{error:true,message:"Operation Failed!"}]);
			}
		} catch (error) {
			return res.status(400).send([{error:true,message:error.message}]);
		}
	})()

};

exports.removeItem=function(req,res){

};

exports.setStatus=function(req,res){

};
