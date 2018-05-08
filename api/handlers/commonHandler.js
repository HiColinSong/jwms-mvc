'use strict';

// exports.getTransOrder=function(req,res){
// 	var data={};
// 	data.error=false;
// 	data.requestType="get";
// 	data.message='hello, packingHandler:'+req.params.orderNo+'';
// 	return res.status(200).send(data);
// }

const util = require('../config/util');
const sapSvc =require('../dbservices/sapService');
const sqlSvc =require('../dbservices/sqlService');
const dbPackingSvc =require('../dbservices/dbPackingSvc');
const dbCommonSvc=require('../dbservices/dbCommonSvc')
var material, eanCode;

exports.getMaterial=function(req,res){
	(async function () {
		try {
			material = await dbCommonSvc.getMaterialCode(req.params.eanCode)
			material = material.recordset[0];
			if (material){
				return res.status(200).send(material);
			} else {
				return res.status(200).send({error:true,message:"The Delivery Order "+req.params.orderNo+" doesn't exist!"});
			}
		} catch (error) {
			return res.status(200).send({error:true,message:error.message});
		}
	})()

};
exports.getPkgMtlList=function(req,res){
	(async function () {
		try {
			var list = await dbCommonSvc.getPkgMtlList();
			if (list&&list.recordset){
				return res.status(200).send(list.recordset);
			} else {
				return res.status(200).send({error:true,message:"The Package Material list cannot be loaded"});
			}
		} catch (error) {
			return res.status(200).send({error:true,message:error});
		}
	})()

};

exports.pgiUpdate=function(req,res){
	(async function () {
		try {
			var sapOrder = await sapSvc.getDeliveryOrder(req.body.orderNo);
			if (sapOrder.ET_DELIVERY_HEADER_STS&&
				sapOrder.ET_DELIVERY_HEADER_STS.length>0&&
				(sapOrder.ET_DELIVERY_HEADER_STS[0].WBSTK!=='C'||sapOrder.ET_DELIVERY_HEADER_STS[0].FKSTK!=='C')){
					throw new Error("Please confirm the picking and packing of the order!");
				}
			var ret = await sapSvc.pgiUpdate(req.body.orderNo,req.body.currentDate);
			if (ret&&(!ret.RETURN||ret.RETURN&&ret.RETURN.length===0)){
				return res.status(200).send({confirm:"success"});
			} else if (ret&&ret.RETURN&&ret.RETURN.length>0&&ret.RETURN[0].TYPE==='E'){
				return res.status(200).send({confirm:"fail",error:true,message:ret.RETURN[0].MESSAGE});
			} else {
				return res.status(200).send({confirm:"fail"});
			}
		} catch (error) {
			return res.status(400).send({error:true,message:error.message});
		}
	})()
};

exports.pgiReversal=function(req,res){
	(async function () {
		try {
			var ret = await sapSvc.pgiReversal(req.body.orderNo,req.body.currentDate);
			if (ret&&(!ret.RETURN||ret.RETURN&&ret.RETURN.length===0)){
				return res.status(200).send({confirm:"success"});
			} else if (ret&&ret.RETURN&&ret.RETURN.length>0&&ret.RETURN[0].TYPE==='E'){
				return res.status(200).send({confirm:"fail",error:true,message:ret.RETURN[0].MESSAGE});
			} else {
				return res.status(200).send({confirm:"fail"});
			}
		} catch (error) {
			return res.status(400).send({error:true,message:error});
		}
	})()
};


