'use strict';
const util = require('../config/util');
const sapSvc =require('../dbservices/sapService');
const dbQuarShptSvc=require('../dbservices/dbQuarShptSvc');

var Promise = require('Promise').default;
exports.getSubconWorkOrderForPlanner=function(req,res){
	(async function () {
		try {
			var data = {};
			var list = await dbQuarShptSvc.getQuarShptPlan(req.body.orderNo);
			data.plans = util.rebuildQuarShptPlan(list.recordset);
			// data.workOrders=dummyData.workOrders;
			return res.status(200).send(data);
		} catch (error) {
			return res.status(400).send({error:true,message:error.message});
		}
	})()
};

exports.saveQuarShptPlan=function(req,res){
	(async function () {
		try {
			// dummyData.workOrders=req.body.workOrders;
			var params={
				qsNo:req.body.plan.qsNo,
				subconPORefNo:req.body.plan.subconPORefNo,
				planOn:req.body.plan.planOn,
				planBy:req.session.user.UserID
			}
			var workorderList=[];
			var batchNoList=[];
			var qtyList=[];
			for (let i=0;i<req.body.plan.workOrders.length;i++){
				workorderList[i]=req.body.plan.workOrders[i].workOrder;
				batchNoList[i]=req.body.plan.workOrders[i].batchNo;
				qtyList[i]=req.body.plan.workOrders[i].planQty.toString();
			}
			params.workorderList = workorderList.join(',');
			params.batchNoList = batchNoList.join(',');
			params.qtyList = qtyList.join(',');
			await dbQuarShptSvc.saveQuarShptPlan(params);
			return res.status(200).send({confirm:"success"});
		} catch (error) {
			return res.status(400).send({error:true,message:error.message});
		}
	})()
};

var prepackOrder=dummyData.prepackOrder;
exports.getPrepackOrder=function(req,res){
	(async function () {
		try {
			var list = await dbQuarShptSvc.getQuarShptPlan(req.body.orderNo);
			// data.plans = util.rebuildQuarShptPlan(list.recordset);
			list=list.recordset;
			let order={plannedItems:[]};
			for (let i = 0; i < list.length; i++) {
				const wo = list[i];
				if (wo.planQty>0&&!wo.prepackConfirmOn){
					order.plannedItems.push({
						"DONumber": wo.qsNo,
						"MaterialCode": wo.materialCode,
						"BatchNo": wo.batchNo,
						"DOItemNumber": wo.workOrder,
						"workOrder": wo.workOrder,
						"DOQuantity": wo.planQty,
						"ScanQty": 0
					})
				}
			}
			if (order.plannedItems.length>0){
				order.DONumber=order.plannedItems[0].DONumber;
				order.subconPORefNo=order.plannedItems[0].subconPORefNo;
			} else {
				throw new Error("There is no quarantine shipment plan for this subcon PO: "+req.body.orderNo);
			}
			return res.status(200).send(order);
		} catch (error) {
			return res.status(400).send({error:true,message:error.message});
		}
	})()
};
exports.refreshHu=function(req,res){
	(async function () {
		try {
			var huList = prepackOrder.HUList;
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
exports.addNewHu=function(req,res){
	(async function () {
		var params={
			qsNo:req.body.DONumber,
			// HUNumberList:newHu.join(','),
			NumToCreate:req.body.NumOfHu,
			PackMaterial:req.body.MaterialCode,
			CreatedBy:req.session.user.UserID,
			Domain:req.session.user.Domain,
			CreatedOn:req.body.createdOn
		}
		try {
			var huList = await dbQuarShptSvc.createHandlingUnits(params);
			huList=huList.recordset;
			var scannedItems = await dbQuarShptSvc.getPrepackDetails(req.body.DONumber);
			scannedItems=scannedItems.recordset;
			util.trimValues(scannedItems)
			huList=addScannedItemsToHUList(huList,scannedItems);
			
			return res.status(200).send(prepackOrder.HUList);
		} catch (error) {
			return res.status(200).send({error:true,message:error});
		}
	})()
};
exports.removeHu=function(req,res){
	(async function () {
		try {
			var params={
				qsNo:req.body.DONumber,
				HUNumber:req.body.HUNumber
			}
			var huList = await dbQuarShptSvc.deleteHandlingUnit(params);
			huList=huList.recordset;
			var scannedItems = await dbQuarShptSvc.getPrepackDetails(req.body.DONumber);
			scannedItems=scannedItems.recordset;
			util.trimValues(scannedItems);
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
		params.sFullScanCode=info.sFullScanCode;
		params.PackBy=req.session.user.UserID;
		params.PackedOn=info.scannedOn;

		try {
			let scannedItems = await dbQuarShptSvc.prepackScanItem(params);
			return res.status(200).send([]);
		} catch (error) {
			return res.status(200).send([{error:true,message:error}]);
		}
	})()
};

var getUpdatedHuAndScanItemList=function(qsNo){
	return new Promise(function(resolve,reject){
		dbQuarShptSvc.getHuAndPrepackDetails(qsNo)
		.then(function(result){
			var huList,scannedItems;
			if (result&&result.recordsets.length>0){
				huList=result.recordsets[0],scannedItems;
				if (result.recordsets.length>1){
					scannedItems=result.recordsets[1];
					util.trimValues(scannedItems);
					huList=addScannedItemsToHUList(huList,scannedItems)
				}
			}
			resolve(huList||[]);
		},function(err){
			reject(err);
		});
	});
}
exports.removeItem=function(req,res){
	(async function () {
		try {
			await dbQuarShptSvc.removePrepackScanItem(req.body.fullScanCode);
			var huList = await getUpdatedHuAndScanItemList(req.body.orderNo);
			return res.status(200).send(huList);
		} catch (error) {
			return res.status(200).send([{error:true,message:error}]);
		}
	})()
};
exports.confirmPacking=function(req,res){
	(async function () {
		var args,info,ret;
		try {
			prepackOrder.confirmStatus = "C";
			//update subcon PO status
			dummyData.subconOrder.quarShptConfirmStatus="C";
			let data={order:prepackOrder,confirm:"success"};
			return res.status(200).send(data);
		} catch (error) {
			return res.status(400).send({error:true,message:error.message||error});
		}
	})()
};

exports.linkToSapDo=function(req,res){
	(async function () {
		var order;
		try {
			console.log("SubconOrder:"+req.body.subconOrderNo);
			console.log("DONumber:"+req.body.DONumber);
			if (req.body.DONumber==='D123456789'){
				for (let i = 0; i < dummyData.sapOrders.length; i++) {
					let DO = dummyData.sapOrders[i];
					if (DO.DONumber===req.body.DONumber){
						DO.HUList=prepackOrder.HUList;
						prepackOrder.linkToSapStatus = "C";
						prepackOrder.linkSapOrder = DO.DONumber;
						break;
					}
				}

			} else if (req.body.DONumber==='D987654321'){
				throw new Error("The configuration of the SAP DO "+req.body.DONumber+" doesn't match the Pre-Packing Order! ");
			} else {
				throw new Error("The SAP DO "+req.body.DONumber+" can't be found! ");
			}
			let data={order:prepackOrder,confirm:"success"};
			return res.status(200).send(data);
		} catch (error) {
			return res.status(400).send({error:true,message:error.message||error});
		}
	})()
};

exports.unlinkSapDo=function(req,res){
	(async function () {
		var order;
		try {
			console.log("SubconOrder:"+req.body.subconOrderNo);
			console.log("DONumber:"+req.body.DONumber);
			if (req.body.DONumber==='D123456789'){
				dummyData.sapOrders[0].HUList=[];
				prepackOrder.linkToSapStatus = undefined;
				prepackOrder.linkSapOrder = undefined;
			} 
			let data={order:prepackOrder,confirm:"success"};
			return res.status(200).send(data);
		} catch (error) {
			return res.status(400).send({error:true,message:error.message||error});
		}
	})()
};