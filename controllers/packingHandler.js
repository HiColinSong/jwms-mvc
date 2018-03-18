'use strict';

// exports.getTransOrder=function(req,res){
// 	var data={};
// 	data.error=false;
// 	data.requestType="get";
// 	data.message='hello, packingHandler:'+req.params.orderNo+'';
// 	return res.status(200).send(data);
// }

const util = require('../config/util');
var order,orderNo,orderType,huNo,serialNo;

exports.getOrder=function(req,res){
	orderNo = req.params.orderNo;
	orderType = orderNo.substring(0,2);
	order = util.getOrder(orderNo,orderType);
	if (order){
		return res.status(200).send(order);
	} else {
		return res.status(200).send({error:true,message:"order "+orderNo+" doesn't exist!"});
	}
};

exports.addHuToOrder=function(req,res){

};

exports.removeHuFromOrder=function(req,res){

};

exports.addItemtoHu=function(req,res){

};

exports.removeItemtoHu=function(req,res){

};
