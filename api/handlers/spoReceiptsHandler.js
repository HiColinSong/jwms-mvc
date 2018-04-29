'use strict';
const util = require('../config/util');
const sapSvc =require('../dbservices/sapService');
exports.getOrder=function(req,res){
	promise = sapSvc.getPurchaseOrder(req.params.orderNo);
	promise.then(function(data){
		return res.status(200).send(util.cleanObject(data));
	},function (err){
		return res.status(200).send({error:true,message:err});
	})
};

exports.addItem=function(req,res){

};

exports.removeItem=function(req,res){

};

exports.setStatus=function(req,res){

};
