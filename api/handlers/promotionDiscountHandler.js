'use strict';

const dbPromotionDiscountSvc=require('../dbservices/dbPromotionDiscountSvc')
var Promise = require('Promise').default
exports.getPromotionDiscountList=function(req,res){
	(async function () {
		try {
			var list = await dbPromotionDiscountSvc.getPromotionDiscountList();
			return res.status(200).send(list.recordset);
		} catch (error) {
			return res.status(200).send({error:true,message:error.message});
		}
	})()
};

exports.deletePromotionDiscount=function(req,res){
	(async function () {
		try {
			await dbPromotionDiscountSvc.deletePromotionDiscount(req.body.promotionDiscount.FID);
			var list = await dbPromotionDiscountSvc.getPromotionDiscountList();
			return res.status(200).send(list.recordset);
		} catch (error) {
			return res.status(200).send({error:true,message:error.message});
		}
	})()
};


exports.addEditPromotionDiscount=function(req,res){
	(async function () {
		try {
			var list = await dbPromotionDiscountSvc.addPromotionDiscount(req.body.promotionDiscount);
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
			var list = await dbBusinessPriceSvc.getProductTypeList();
			return res.status(200).send(list.recordset);
		} catch (error) {
			return res.status(200).send({error:true,message:error.message});
		}
	})()
};

exports.getAgentList=function(req,res){
	(async function () {
		try {
			var list = await dbBusinessPriceSvc.getAgentList();
			return res.status(200).send(list.recordset);
		} catch (error) {
			return res.status(200).send({error:true,message:error.message});
		}
	})()
};

exports.getHospitalList=function(req,res){
	(async function () {
		try {
			var list = await dbBusinessPriceSvc.getHospitalList();
			return res.status(200).send(list.recordset);
		} catch (error) {
			return res.status(200).send({error:true,message:error.message});
		}
	})()
};