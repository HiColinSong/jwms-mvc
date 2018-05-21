'use strict';

// // const util = require('../config/util');
// const sapSvc =require('../dbservices/sapService');
// const sqlSvc =require('../dbservices/sqlService');
// // const dbPackingSvc =require('../dbservices/dbPackingSvc');
const dbCommonSvc=require('../dbservices/dbCommonSvc')
const sapSvc =require('../dbservices/sapService');
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
exports.getCustomerName=function(req,res){
	(async function () {
		try {
			var customer = await sapSvc.getCustomerDetail(req.body.ShipToCustomer);
			return res.status(200).send({customerName:customer.CUSTOMERADDRESS.NAME});
		} catch (error) {
			return res.status(200).send({error:true,message:error.message});
		}
	})()
};