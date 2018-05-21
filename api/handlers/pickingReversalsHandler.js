'use strict';
const util = require('../config/util');
const logger = require("../config/logger");
const sapSvc =require('../dbservices/sapService');
const dbPickingSvc =require('../dbservices/dbPickingSvc');
var order,promise;
exports.getOrder=function(req,res){
	(async function () {
		try {
			var sapOrder = await sapSvc.getTransferOrder(req.body.orderNo,req.session.user.DefaultWH);
			var order = util.transferOrderConverter(sapOrder);
			//check status 
			if (order&&order.TONumber){
				// if (order.PickConfirmStatus==="X"){
				// 	throw new Error("The TO has been confirmed!");
				// }
				return res.status(200).send(order);
			} else {
				return res.status(200).send({error:true,message:"The Transfer Order "+req.body.orderNo+" doesn't exist!"});
			}
		} catch (error) {
			return res.status(400).send({error:true,message:error.message});
		}
	})()
};


exports.pickingReversals=function(req,res){
	(async function () {
		try {

			var ret = await sapSvc.PickingReversals(req.body.order,req.session.user.DefaultWH);
			logger.debug({handler:"PickingReversals",function:"pickingReversals",params:req.body.order,ret:ret,message:"Picking Reversals call success!"});
			var params={
				TONumber:req.body.TONumber,
				PickStatus:"D",
				Push2SAPStatus:"R"
			} 
			var result = await dbPickingSvc.setStatus(params);
			result = result.recordset[0];
			return res.status(200).send({confirm:"success"});
		} catch (error) {
			logger.error({handler:"PickingReversals",function:"pickingReversals",params:req.body.order,ret:ret,message:error.message});
			return res.status(400).send({error:true,message:error.message});
		}
	})()
};


