'use strict';
const util = require('../config/util');
const dbCommonSvc=require('../dbservices/dbCommonSvc');
exports.getOrder=function(req,res){
	promise = sapSvc.getPurchaseOrder(req.params.orderNo);
	promise.then(function(data){
		return res.status(200).send(util.cleanObject(data));
	},function (err){
		return res.status(200).send({error:true,message:err});
	})
};

exports.updateReturn=function(req,res){
	(async function () {
		try {
			var param={
					sFullScanCode:req.body.sFullScanCode,
					sReturnToTarget:req.body.sReturnToTarget,
					sLogonUser:req.session.user.UserID,
					sQACategory:req.body.sQACategory,
					dCurrDate:new Date(req.body.dCurrDate)
				}
			var list = await dbCommonSvc.updateSubConReturns(param);
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

exports.removeItem=function(req,res){

};

exports.setStatus=function(req,res){

};
