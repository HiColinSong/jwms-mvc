'use strict';
const util = require('../config/util');
const sapSvc =require('../dbservices/sapService');
const dbSpoReceiptsSvc=require('../dbservices/dbSpoReceiptsSvc');
const dbPackingSvc =require('../dbservices/dbPackingSvc');

var dummyData =require('../dummyData/data.json'); //dummy code
exports.getSubconWorkOrderForPlanner=function(req,res){
	(async function () {
		try {
			var data = {};
			// var list = await dbSpoReceiptsSvc.getSubconWorkOrders(req.body.orderNo);
			// data.workOrders = list.recordset;
			data.workOrders=dummyData.workOrders;
			return res.status(200).send(data);
		} catch (error) {
			return res.status(400).send({error:true,message:error.message});
		}
	})()
};

exports.saveQuarShptPlan=function(req,res){
	(async function () {
		try {
			dummyData.workOrders=req.body.workOrders;
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
			prepackOrder.DONumber=dummyData.workOrders[0].SubConPoRefNo;
			prepackOrder.plannedItems=[];
			let j=0
			for (let i = 0; i < dummyData.workOrders.length; i++) {
				const wo = dummyData.workOrders[i];
				if (wo.nPlanQuarQty>0){
					prepackOrder.plannedItems[j++]={
						"DONumber": wo.SubConPoRefNo,
						"MaterialCode": wo.MaterialCode,
						"BatchNo": wo.BatchNo,
						"DOItemNumber": "0".repeat(5-j.toString().length)+j.toString(),
						"DOQuantity": wo.nPlanQuarQty,
						"EANCode": wo.EANCode,
						"ScanQty": 1
					}
				}
				
			}
			// prepackOrder.HUList=[]

			return res.status(200).send(prepackOrder);
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
			// var huList = await dbPackingSvc.createHandlingUnits(params);
			// huList=huList.recordset;
			// var scannedItems = await dbPackingSvc.getPackDetails(req.body.DONumber);
			// scannedItems=scannedItems.recordset;
			// util.trimValues(scannedItems)
			// huList=addScannedItemsToHUList(huList,scannedItems);
			let hu = {};
			prepackOrder.HUList=prepackOrder.HUList||[]
			let n = prepackOrder.HUList.length;
			for (let i = 0; i < params.NumToCreate; i++) {
				hu={
					DONumber:params.DONumber,
					HUNumber:"1180729000"+("0".repeat(2-(n+i).toString().length)+(i+n+1).toString()),
					PackMaterial: params.PackMaterial,
					Domain:req.session.user.Domain,
					CreatedBy:req.session.user.UserID,
					CreatedOn:req.body.createdOn,
					scannedItems:[]
				}
				prepackOrder.HUList.push(hu);
			}
			return res.status(200).send(prepackOrder.HUList);
		} catch (error) {
			return res.status(200).send({error:true,message:error});
		}
	})()
};

exports.addItem=function(req,res){
	(async function () {
		// console.time("Packing Insert");
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
			// var scannedItems = await dbPackingSvc.InsertScanItem(params);
			var scannedItems=[];
			// scannedItems=scannedItems.recordset;
			// util.trimValues(scannedItems);
			// var huList = await dbPackingSvc.getPackHUnits(params.DONumber);
			// huList = addScannedItemsToHUList(huList.recordset,scannedItems);
			// if (huList){
			// 	return res.status(200).send(huList);
			// } else {
			// 	return res.status(200).send([{error:true,message:"failed to insert the scan item"}]);
			// }
			// console.timeEnd("Packing Insert");

			for (let i = 0; i < prepackOrder.HUList.length; i++) {
				const hu = prepackOrder.HUList[i];
				if (prepackOrder.plannedItems.length>i){
					const pitem = prepackOrder.plannedItems[i];
					scannedItems=[
						{
							"DONumber": prepackOrder.DONumber,
							"HUNumber": hu.HUNumber,
							"MaterialCode": pitem.MaterialCode,
							"BatchNo": pitem.BatchNo,
							"SerialNo": null,
							"PackBy": req.session.user.UserID,
							"PackedOn": params.PackedOn,
							"ScanQty":pitem.DOQuantity,
							"DOItemNumber":pitem.DOItemNumber,
							"BinNumber": "DEFAULT BIN"
						}
					];
					hu.scannedItems=scannedItems;
				}
			}
			//update workorder quantities


			return res.status(200).send([]);
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
			let data={order:prepackOrder,confirm:"success"};
			return res.status(200).send(data);
		} catch (error) {
			// logger.add(winston.transports.File, { filename: 'error-logs.log' });
			logger.error({handler:"PackingHandler",function:"confirmPacking",params:args,ret:ret,error:error});
			// logger.debug({handler:"PackingHandler",function:"confirmPacking",params:args,ret:ret,error:error});
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