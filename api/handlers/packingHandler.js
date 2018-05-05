'use strict';

const util = require('../config/util');
const sapSvc =require('../dbservices/sapService');
const sqlSvc =require('../dbservices/sqlService');
const dbPackingSvc =require('../dbservices/dbPackingSvc');
const dbCommonSvc=require('../dbservices/dbCommonSvc');
var Promise = require('Promise').default;

var addScannedItemsToHUList=function(huList,scannedItems){
	for (let i=0;i<huList.length;i++){
		huList[i].scannedItems=huList[i].scannedItems||[];
		for (let j=0;j<scannedItems.length;j++){
				if (scannedItems[j].HUNumber===huList[i].HUNumber){
					huList[i].scannedItems.push(scannedItems[j]);
				}
		}
	}	
	return huList;
}
var getUpdatedHuAndScanItemList=function(orderNo){
	return new Promise(function(resolve,reject){
		dbPackingSvc.getHuAndPackDetails(orderNo)
		.then(function(result){
			var huList,scannedItems;
			if (result&&result.recordsets.length>0){
				huList=result.recordsets[0],scannedItems;
				if (result.recordsets.length>1){
					scannedItems=result.recordsets[1];
					huList=addScannedItemsToHUList(huList,scannedItems)
				}
			}
			resolve(huList||[]);
		},function(err){
			reject(err);
		});
	});
}

exports.getOrder=function(req,res){
	(async function () {
		try {
			var sapOrder = await sapSvc.getDeliveryOrder(req.body.orderNo);
			var order = util.deliveryOrderConverter(sapOrder);
			//todo: check status 
			
			if (order&&order.DONumber){
				util.removeIncompleteItem(order.plannedItems);
				if (order.confirmStatus!=="A"&&order.confirmStatus){
					throw new Error("Invalid Order Status. Order Status is "+order.confirmStatus);
				}
	
				//insertOrUpdateDo, PackStart will be set if the HU List is empty, or ignore
				var params={
					DONumber:order.DONumber,
					DOCreationDate:order.DOCreationDate,
					DOCreationUser:order.DOCreationUser,
					Plant:order.ShippingPoint,
					ShipToCustomer:order.ShipToCustomer,
					DOStatus:order.DOStatus,
					PackStart:req.body.PackStart
				}
				var DOItemNumberList=[];
				var MaterialCodeList=[];
				var BatchNumberList=[];
				var VendorBatchList=[];
				var DOQuantityList=[];
				for (let i=0;i<order.plannedItems.length;i++){
					DOItemNumberList[i]=order.plannedItems[i].DOItemNumber;
					MaterialCodeList[i]=order.plannedItems[i].MaterialCode;
					BatchNumberList[i]=order.plannedItems[i].BatchNo;
					VendorBatchList[i]=order.plannedItems[i].VendorBatch;
					DOQuantityList[i]=order.plannedItems[i].DOQuantity.toString();
				}
				params.DOItemNumberList = DOItemNumberList.join(',');
				params.MaterialCodeList = MaterialCodeList.join(',');
				params.BatchNumberList = BatchNumberList.join(',');
				params.VendorBatchList = VendorBatchList.join(',');
				params.DOQuantityList = DOQuantityList.join(',');
				await dbPackingSvc.InsertOrUpdateDO(params);
	
				order.HUList = await getUpdatedHuAndScanItemList(order.DONumber);
				return res.status(200).send(order);
			} else {
				return res.status(200).send({error:true,message:"The Delivery Order "+req.body.orderNo+" doesn't exist!"});
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


//create new HU
exports.addNewHu=function(req,res){
	(async function () {
		var date,newHu=[];
		for (var i=0;i<req.body.NumOfHu;i++){
			date=new Date();
			newHu.push(date.getTime()+i.toString())
		}
		var params={
			DONumber:req.body.DONumber,
			// HUNumberList:newHu.join(','),
			NumToCreate:req.body.NumOfHu,
			PackMaterial:req.body.MaterialCode,
			CreatedBy:req.session.user.UserID,
			Domain:req.session.user.Domain,
			CreatedOn:req.body.createdOn
		}
		try {
			var huList = await dbPackingSvc.createHandlingUnits(params);
			huList=huList.recordset;
			var scannedItems = await dbPackingSvc.getPackDetails(req.body.DONumber);
			scannedItems=scannedItems.recordset;
			huList=addScannedItemsToHUList(huList,scannedItems);
			return res.status(200).send(huList);
		} catch (error) {
			return res.status(200).send({error:true,message:error});
		}
	})()
};

exports.removeHu=function(req,res){
	(async function () {
		try {
			var params={
				DONumber:req.body.DONumber,
				HUNumber:req.body.HUNumber
			}
			var huList = await dbPackingSvc.deleteHandlingUnit(params);
			huList=huList.recordset;
			var scannedItems = await dbPackingSvc.getPackDetails(req.body.DONumber);
			scannedItems=scannedItems.recordset;
			huList=addScannedItemsToHUList(huList,scannedItems);
			return res.status(200).send(huList);
		} catch (error) {
			return res.status(200).send([{error:true,message:error}]);
		}
	})()
};

exports.addItem=function(req,res){
	(async function () {
		var info=req.body,params={};
		params.DONumber=info.orderNo;
		params.HUNumber=info.HUNumber;
		params.EANCode=info.EANCode;
		params.MaterialCode=info.MaterialCode;
		params.BatchNo=info.BatchNo;
		// params.DOItemNumber=info.itemNumber;
		params.Qty = info.Qty||1;
		if (info.SerialNo){
			params.SerialNo=info.SerialNo;
			params.Qty = 1;
		} 
		params.PackBy=req.session.user.UserID;
		params.PackedOn=info.scannedOn;
		params.Status = info.Status
		params.FullScanCode = info.FullScanCode;
		params.BinNumber = info.BinNumber;

		try {
			var scannedItems = await dbPackingSvc.InsertScanItem(params);
			scannedItems=scannedItems.recordset;
			var huList = await dbPackingSvc.getPackHUnits(params.DONumber);
			huList = addScannedItemsToHUList(huList.recordset,scannedItems);
			if (huList){
				return res.status(200).send(huList);
			} else {
				return res.status(200).send([{error:true,message:"failed to insert the scan item"}]);
			}
		} catch (error) {
			return res.status(200).send([{error:true,message:error}]);
		}
	})()
};

exports.removeItem=function(req,res){
	(async function () {
		try {
			await dbPackingSvc.deletePackingItemByKey(req.body.RowKey);
			var huList = await getUpdatedHuAndScanItemList(req.body.orderNo);
			return res.status(200).send(huList);
		} catch (error) {
			return res.status(200).send([{error:true,message:error}]);
		}
	})()
};

exports.refreshHu=function(req,res){
	(async function () {
		try {
			var huList = await getUpdatedHuAndScanItemList(req.params.orderNo);
			if (huList){
				return res.status(200).send(huList);
			} else {
				return res.status(200).send([{error:true,message:"failed to refresh the scan item"}]);
			}
		} catch (error) {
			return res.status(200).send([{error:true,message:error}]);
		}
	})()
};

exports.confirmPacking=function(req,res){
	(async function () {
		try {
			var ret = await sapSvc.confirmPacking(req.body.order);
			if (ret&&(!ret.RETURN||ret.RETURN&&ret.RETURN.length===0)){
				await dbPackingSvc.confirmPacking(req.body.order.DONumber,req.body.PackComplete);
				return res.status(200).send({confirm:"success"});
			} else if (ret&&ret.RETURN&&ret.RETURN.length>0&&ret.RETURN[0].TYPE==='E'){
				return res.status(200).send({confirm:"fail",error:true,message:ret.RETURN[0].MESSAGE});
			} else {
				return res.status(200).send({confirm:"fail"});
			}
		} catch (error) {
			return res.status(200).send({error:true,message:error});
		}
	})()
};
exports.reversal=function(req,res){
	var ret;
	(async function () {
		try {
			var sapOrder = await sapSvc.getDeliveryOrder(req.params.orderNo);
			if (sapOrder.ET_HU_HEADER&&sapOrder.ET_HU_HEADER.length>0){
				for (let i = 0; i < sapOrder.ET_HU_HEADER.length; i++) {
					const hu = sapOrder.ET_HU_HEADER[i];
					if (hu.EXIDV){
						ret = await sapSvc.packingReversal(req.params.orderNo,hu.EXIDV);
					}
				}
			}
			if (ret&&(!ret.RETURN||ret.RETURN&&ret.RETURN.length===0)){
				//delete from dbo.BX_PackDetails,dbo.BX_PackHeader,dbo.BX_PackUnits,dbo.SAP_DODetail,dbo.SAP_DOHeader
				await dbPackingSvc.packingReversal(req.body.order.DONumber);
				return res.status(200).send({confirm:"success"});
			} else if (ret&&ret.RETURN&&ret.RETURN.length>0&&ret.RETURN[0].TYPE==='E'){
				return res.status(200).send({confirm:"fail",error:true,message:ret.RETURN[0].MESSAGE});
			} else {
				return res.status(200).send({confirm:"fail"});
			}
		} catch (error) {
			return res.status(200).send({error:true,message:error});
		}
	})()
};
