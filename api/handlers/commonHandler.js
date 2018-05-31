'use strict';

// // const util = require('../config/util');
// const sapSvc =require('../dbservices/sapService');
// const sqlSvc =require('../dbservices/sqlService');
// // const dbPackingSvc =require('../dbservices/dbPackingSvc');
const dbCommonSvc=require('../dbservices/dbCommonSvc')
const sapSvc =require('../dbservices/sapService');
var Promise = require('Promise').default
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

exports.getUserList=function(req,res){
	(async function () {
		try {
			var list = await dbCommonSvc.getUserList(req.session.user.Domain);
			return res.status(200).send(list.recordset);
		} catch (error) {
			return res.status(200).send({error:true,message:error.message});
		}
	})()
};

exports.addEditUser=function(req,res){
	(async function () {
		try {
			var list = await dbCommonSvc.insertOrUpdateUserProfile(req.body.user);
			return res.status(200).send(list.recordset);
		} catch (error) {
			return res.status(200).send({error:true,message:error.message});
		}
	})()
};
exports.deleteUser=function(req,res){
	(async function () {
		try {
			await dbCommonSvc.deleteUserProfile(req.body.user.UserID);
			var list = await dbCommonSvc.getUserList(req.session.user.Domain);
			return res.status(200).send(list.recordset);
		} catch (error) {
			return res.status(200).send({error:true,message:error.message});
		}
	})()
};
exports.viewLog=function(req,res){
	var lineReader = require('reverse-line-reader');
	var maxLine = 50;
	var i=0,logs=[];
	var promise = new Promise(function(resolve,reject){
		try {
			lineReader.eachLine('logs/filelog-error.log', function(line, last) {
				// console.log(line);
				// console.log(last);
				try {
					logs.push(JSON.parse(line));
				} catch (error) {
					console.log("JSON.parse error:"+error+", Skipped the log in line "+(i+1)+":"+line);
				}
				i++;
				if (i===maxLine||last) {
					resolve(logs);
					return false; // stop reading
				}
			});
		} catch (error) {
			reject(error);
		}
	});
	promise.then(function(logs){
		return res.status(200).send(logs);
	},function(err){
		return res.status(400).send({error:true,message:err});
	})
};