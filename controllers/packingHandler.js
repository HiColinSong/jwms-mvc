'use strict';

// exports.getTransOrder=function(req,res){
// 	var data={};
// 	data.error=false;
// 	data.requestType="get";
// 	data.message='hello, packingHandler:'+req.params.orderNo+'';
// 	return res.status(200).send(data);
// }

const util = require('../config/util');
const sapSvc =require('../config/sapService');
var sapOrder, order,promise,orderNo,orderType,huNo,serialNo;

exports.getOrder=function(req,res){
	(async function () {
		try {
			sapOrder = await sapSvc.getDeliveryOrder(req.params.orderNo);
			order = util.deliveryOrderConverter(sapOrder);
			util.removeIncompleteItem(order.items);
			if (order&&order.DONumber){
				return res.status(200).send(order);
			} else {
				return res.status(200).send({error:true,message:"The Delivery Order "+req.params.orderNo+" doesn't exist!"});
			}
		} catch (error) {
			return res.status(200).send({error:true,message:error});
		}
	})()

};

exports.addHuToOrder=function(req,res){
	orderNo = req.params.orderNo;
	orderType = orderNo.substring(0,2);
	order = util.getOrder(orderNo,orderType);
	if (order){
		huNo = req.params.huNo
		order.HUList = order.HUList||[];
		order.HUList.push({name:huNo,barcode:huNo,items:[]})
		return res.status(200).send(order);
	} else {
		return res.status(200).send({error:true,message:"HU "+huNo+" can't be added to Order"});
	}
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
