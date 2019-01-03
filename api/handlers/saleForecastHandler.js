'use strict';

const dbSaleForecastSvc=require('../dbservices/dbSaleForecastSvc')
var Promise = require('Promise').default
exports.getSaleForecastList=function(req,res){
	(async function () {
		try {
			var list = await dbSaleForecastSvc.getSaleForecastList();
			return res.status(200).send(list.recordset);
		} catch (error) {
			return res.status(200).send({error:true,message:error.message});
		}
	})()
};

exports.deleteSaleForecast=function(req,res){	
	(async function () {
		try {
			await dbSaleForecastSvc.deleteSaleForecastProfile(req.body.saleForecast.FID);
			var list = await dbSaleForecastSvc.getSaleForecastList();
			return res.status(200).send(list.recordset);
		} catch (error) {
			return res.status(200).send({error:true,message:error.message});
		}
	})()
};


exports.addEditSaleForecast=function(req,res){
	(async function () {
		try {
			var list = await dbSaleForecastSvc.insertOrUpdateSaleForecastProfile(req.body.saleForecast);
			// var list = await dbCommonSvc.insertOrUpdateUserProfile(req.body.user);
			return res.status(200).send(list.recordset);
		} catch (error) {
			return res.status(200).send({error:true,message:error.message});
		}
	})()
};


exports.getProductTypeList=function(req,res){
	(async function () {
		try {
			var list = await dbSaleForecastSvc.getProductTypeList();
			return res.status(200).send(list.recordset);
		} catch (error) {
			return res.status(200).send({error:true,message:error.message});
		}
	})()
};

// exports.getAgentList=function(req,res){
// 	(async function () {
// 		try {
// 			var list = await dbSaleForecastSvc.getAgentList();
// 			return res.status(200).send(list.recordset);
// 		} catch (error) {
// 			return res.status(200).send({error:true,message:error.message});
// 		}
// 	})()
// };

exports.getHospitalList=function(req,res){
	(async function () {
		try {
			var list = await dbSaleForecastSvc.getHospitalList();
			return res.status(200).send(list.recordset);
		} catch (error) {
			return res.status(200).send({error:true,message:error.message});
		}
	})()
};

exports.getSalerList=function(req,res){
	(async function () {
		try {
			var list = await dbSaleForecastSvc.getSalerList();
			return res.status(200).send(list.recordset);
		} catch (error) {
			return res.status(200).send({error:true,message:error.message});
		}
	})()
};