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
var sapOrder, order,promise,orderNo,orderType,huNo,serialNo;

exports.getOrder=function(req,res){
	(async function () {
		try {
			sapOrder = await sapSvc.getDeliveryOrder(req.params.orderNo);
			order = util.deliveryOrderConverter(sapOrder);
			util.removeIncompleteItem(order.plannedItems);
			var huList = await dbPackingSvc.getPackHUnits(order.DONumber);
			huList=huList.recordset;
			var scannedItems = await dbPackingSvc.getPackDetails(order.DONumber);
			scannedItems=scannedItems.recordset;

			order.HUList=order.HUList||[];
			for (let i=0;i<huList.length;i++){
				  huList[i].scannedItems=huList[i].scannedItems||[];
					order.HUList.push(huList[i]);
					for (let j=0;j<scannedItems.length;j++){
							if (scannedItems[j].HUNumber===huList[i].HUNumber){
								huList[i].scannedItems.push(scannedItems[j]);
							}
					}
			}

			if (order&&order.DONumber){
				return res.status(200).send(order);
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



exports.addNewHu=function(req,res){
	(async function () {
		var date,newHu=[];
		for (var i=0;i<req.body.NumOfHu;i++){
			date=new Date();
			newHu.push(date.getTime()+i.toString())
		}
		var params={
			DONumber:req.body.DONumber,
			HUNumberList:newHu.join(','),
			PackMaterial:req.body.MaterialCode,
			CreatedBy:req.session.user,
			CreatedOn:req.body.createdOn
		}
		try {
			var huList = await dbPackingSvc.createHandlingUnits(params);
			if (huList&&huList.recordset){
				return res.status(200).send(huList.recordset);
			} else {
				return res.status(200).send({error:true,message:"The new handling units cannot be loaded"});
			}
		} catch (error) {
			return res.status(200).send({error:true,message:error});
		}
	})()


	// orderNo = req.params.orderNo;
	// orderType = orderNo.substring(0,2);
	// order = util.getOrder(orderNo,orderType);
	// if (order){
	// 	huNo = req.params.huNo
	// 	order.HUList = order.HUList||[];
	// 	order.HUList.push({name:huNo,barcode:huNo,items:[]})
	// 	return res.status(200).send(order);
	// } else {
	// 	return res.status(200).send({error:true,message:"HU "+huNo+" can't be added to Order"});
	// }
};

exports.removeHuFromOrder=function(req,res){
	orderNo = req.params.orderNo;
	orderType = orderNo.substring(0,2);
	order = util.getOrder(orderNo,orderType);
	if (order){
		huNo = req.params.huNo
		order.HUList = order.HUList||[];
		for (var i = 0; i < order.HUList.length; i++) {
          if (order.HUList[i].barcode === huNo) {
            order.HUList.splice(i, 1);
            break;
          }
        }
		return res.status(200).send(order);
	} else {
		return res.status(200).send({error:true,message:"HU "+huNo+" can't be removed from the Order"});
	}
};

exports.addItemtoHu=function(req,res){
	order = util.getOrder(req.params.orderNo,req.params.orderNo.substring(0,2));
	var hu,item;
	if (order){
		huNo = req.params.huNo;
		for (var i = 0; i < order.HUList.length; i++) {
	        if (order.HUList[i].barcode === huNo) {
	            hu=order.HUList[i];
	          }
          }
        item = util.getItem(req.params.serialNo);
		hu.items.push(item);
		return res.status(200).send(order);
	} else {
		return res.status(200).send({error:true,message:"Item "+serialNo+" can't be added to hu"});
	}
};

exports.removeItemtoHu=function(req,res){
	order = util.getOrder(req.params.orderNo,req.params.orderNo.substring(0,2));
	var hu,item;
	if (order){
		huNo = req.params.huNo;
		for (var i = 0; i < order.HUList.length; i++) {
	        if (order.HUList[i].barcode === huNo) {
	            hu=order.HUList[i];
	          }
          }
        for (var i = 0; i < hu.items.length; i++) {
          if (hu.items[i].serialNo === req.params.serialNo) {
            hu.items.splice(i, 1);
            break;
          }
        };
		return res.status(200).send(order);
	} else {
		return res.status(200).send({error:true,message:"Item "+serialNo+" can't be added to hu"});
	}
};
