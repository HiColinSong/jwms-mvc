'use strict';
const util = require('../config/util');
const sapSvc =require('../dbservices/sapService');
var order,promise;
exports.getOrder=function(req,res){
	// order = util.getOrder(req.params.orderNo,req.params.orderNo.substring(0,2));
	// if (order){
	// 	return res.status(200).send(order);
	// } else {
	// 	return res.status(200).send({error:true,message:"order "+orderNo+" doesn't exist!"});
	// }

	promise = sapSvc.getTransferOrder(req.body.orderNo,req.body.warehouseNo);
	promise.then(function(data){
		return res.status(200).send(util.cleanObject(data));
	},function (err){
		return res.status(200).send({error:true,message:err});
	})
};

exports.addItem=function(req,res){
	order = util.getOrder(req.params.orderNo,req.params.orderNo.substring(0,2));
	var item;
	if (order){
        item = util.getItem(req.params.serialNo);
        order.items=order.items||[];
		order.items.push(item);
		return res.status(200).send(order);
	} else {
		return res.status(200).send({error:true,message:"Item "+serialNo+" can't be added to hu"});
	}
};

exports.removeItem=function(req,res){
	order = util.getOrder(req.params.orderNo,req.params.orderNo.substring(0,2));
	var hu,item;
	if (order){
        for (var i = 0; i < order.items.length; i++) {
          if (order.items[i].serialNo === req.params.serialNo) {
            order.items.splice(i, 1);
            break;
          }
        };
		return res.status(200).send(order);
	} else {
		return res.status(200).send({error:true,message:"Item "+serialNo+" can't be added to order"});
	}
};

exports.setStatus=function(req,res){
	order = util.getOrder(req.params.orderNo,req.params.orderNo.substring(0,2));
	var status=req.params.status;
	if (order){
		order.pickingStatus=(status!=='reset')?status:undefined;
		return res.status(200).send(order);
	} else {
		return res.status(200).send({error:true,message:"order "+orderNo+" doesn't exist!"});
	}
};

