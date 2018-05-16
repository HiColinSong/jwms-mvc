'use strict';
const util = require('../config/util');
const sapSvc =require('../dbservices/sapService');
const dbPickingSvc =require('../dbservices/dbPickingSvc');
var order,promise;
exports.getOrder=function(req,res){
	(async function () {
		try {
			var sapOrder = await sapSvc.getTransferOrder(req.body.orderNo,req.session.user.DefaultWH);
			var order = util.transferOrderConverter(sapOrder);
			//check status 
			if (order&&order.TONumber){
				// if (order.PickConfirmStatus==="X"){
				// 	throw new Error("The TO has been confirmed!");
				// }
	
				//insertOrUpdateDo, PackStart will be set if the HU List is empty, or ignore
				var params={
					TransferOrder:order.TONumber,
					Warehouse:order.Warehouse,
					TOCreationDate:order.TOCreationDate,
					TOCreationUser:order.TOCreationUser,
					DONumber:order.DONumber,
					Plant:order.plannedItems[0].Plant,
					ShipToCustomer:order.ShipToCustomer,
					PickConfirmStatus:order.PickConfirmStatus||0
				}
				var TOItemNumberList=[];
				var MaterialCodeList=[];
				var BatchNumberList=[];
				var VendorBatchList=[];
				var TOQuantityList=[];
				for (let i=0;i<order.plannedItems.length;i++){
					TOItemNumberList[i]=order.plannedItems[i].TOItemNumber;
					MaterialCodeList[i]=order.plannedItems[i].MaterialCode;
					BatchNumberList[i]=order.plannedItems[i].BatchNo;
					VendorBatchList[i]=order.plannedItems[i].VendorBatch;
					TOQuantityList[i]=order.plannedItems[i].TOQuantity||1;
				}
				params.TOItemNumberList = TOItemNumberList.join(',');
				params.MaterialCodeList = MaterialCodeList.join(',');
				params.BatchNumberList = BatchNumberList.join(',');
				params.VendorBatchList = VendorBatchList.join(',');
				params.TOQuantityList = TOQuantityList.join(',');
				let ret=await dbPickingSvc.InsertOrUpdateTO(params);
				ret = ret.recordset;
				if (ret.length>0){
					order.PickStart = ret[0].PickStart;
					order.PickComplete = ret[0].PickComplete||undefined;
					order.PickStatus = ret[0].PickStatus||undefined;
					order.Push2SAPStatus = ret[0].Push2SAPStatus||undefined;
					order.SAPRefNo = ret[0].SAPRefNo||undefined;
				}
	
				return res.status(200).send(order);
			} else {
				return res.status(200).send({error:true,message:"The Delivery Order "+req.body.orderNo+" doesn't exist!"});
			}
		} catch (error) {
			return res.status(400).send({error:true,message:error.message});
		}
	})()
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

exports.pickingReversals=function(req,res){
	(async function () {
		try {
			var sapOrder = await sapSvc.getTransferOrder(req.params.orderNo,req.session.user.DefaultWH);
			var order = util.transferOrderConverter(sapOrder);
			//check status 
			if (order&&order.TONumber&&order.PickConfirmStatus==="X"){
				throw new Error("Order has been confirmed and cannot be reversal!");
			}
			await sapSvc.PickingReversals(req.body.TONumber,req.session.user.DefaultWH);
			
			var params={
				TONumber:req.body.TONumber,
				PickStatus:"D",
				Push2SAPStatus:"R"
			} 
			var ret = await dbPickingSvc.setStatus(params);
			ret = ret.recordset[0];
			return res.status(200).send(ret);
		} catch (error) {
			return res.status(400).send({error:true,message:error.message});
		}
	})()
};

exports.setStatus=function(req,res){
	(async function () {
		try {
			var params={
				TONumber:req.body.TONumber,
				PickStart:req.body.PickStart||undefined,
				PickComplete:req.body.PickComplete||undefined,
				PickStatus:req.body.PickStatus||undefined,
				Push2SAPStatus:req.body.Push2SAPStatus||undefined,
				SAPRefNo:req.body.SAPRefNo||undefined,
			} 
			if (params.Push2SAPStatus==='C'){
				await sapSvc.confirmPicking(req.body.TONumber,req.session.user.DefaultWH,req.body.items);
			}
			var ret = await dbPickingSvc.setStatus(params);
			ret = ret.recordset[0];
			return res.status(200).send(ret);
		} catch (error) {
			return res.status(400).send({error:true,message:error.message});
		}
	})()
};

