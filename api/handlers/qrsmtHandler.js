'use strict';
const util = require('../config/util');
const sapSvc =require('../dbservices/sapService');
const dbQuarShptSvc=require('../dbservices/dbQuarShptSvc');

var Promise = require('Promise').default;
exports.getSubconWorkOrderForPlanner=function(req,res){
	(async function () {
		try {
			var data = {};
			var list = await dbQuarShptSvc.getQuarShptPlan(req.body.qsNo);
			data.plans = util.rebuildQuarShptPlan(list.recordset);
			return res.status(200).send(data);
		} catch (error) {
			return res.status(400).send({error:true,message:error.message});
		}
	})()
};

exports.saveQuarShptPlan=function(req,res){
	(async function () {
		try {
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

exports.getPrepackOrder=function(req,res){
	(async function () {
		try {
			let list = await dbQuarShptSvc.getQuarShptPlan(req.body.qsNo);
			let orders=util.buildPrepackOrder(list.recordset)
			for (let i = 0; i < orders.length; i++) {
				const order = orders[i];
				order.HUList = await getUpdatedHuAndScanItemList(order.qsNo);
			}
			return res.status(200).send(orders);
		} catch (error) {
			return res.status(400).send({error:true,message:error.message});
		}
	})()
};
exports.refreshHu=function(req,res){
	(async function () {
		try {
			var huList = await getUpdatedHuAndScanItemList(req.params.orderNo);
			return res.status(200).send(huList);
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
		params.DONumber=info.qsNo;
		params.HUNumber=info.HUNumber;
		params.sFullScanCode=info.sFullScanCode;
		params.PackBy=req.session.user.UserID;
		params.PackedOn=info.scannedOn;
		params.batchNo=info.batchNo;

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
exports.confirmPrepacking=function(req,res){
	(async function () {
		var args,info,ret;
		try {
			var scannedItems = await dbQuarShptSvc.getPrepackDetails(req.body.qsNo);
			scannedItems = scannedItems.recordset;
			//call custom bapi to udpate SAP
			let args = {IT_BX_STOCK:[]};
			for (let j = 0; j < scannedItems.length; j++) {
				const item = scannedItems[j];
				args.IT_BX_STOCK.push({
					TRANS:"GR1",
					WERKS:'2100',
					MATNR:item.MaterialCode,
					CHARG: item.BatchNo,
					SERIAL:item.SerialNo,
					DOCNO: item.workorder,
					ENDCUST:'SGW',
					BXDATE:util.formatDateTime().date,
					BXTIME:util.formatDateTime().time,
					BXUSER:req.session.user.UserID
				});
			}
			if (args.IT_BX_STOCK.length>0)
				await sapSvc.serialNoUpdate(args);

			let params={
				qsNo:req.body.qsNo,
				SubconPORefNo:req.body.SubconPORefNo,
				planBy:req.session.user.UserID,
				planOn:req.body.planOn,
				prepackConfirmOn:req.body.prepackConfirmOn,
			}
			let status=await dbQuarShptSvc.updateQuarShptStatus(params);

			return res.status(200).send({status:status.recordset,confirm:"success"});
		} catch (error) {
			return res.status(400).send([{error:true,message:error.message}]);
		}
	})()
};

exports.linkToSapDo=function(req,res){
	(async function () {
		try {
			let sapOrder = await sapSvc.getDeliveryOrder(req.body.DONumber);
			let order = util.deliveryOrderConverter(sapOrder);
			if (order&&order.DONumber){
				util.removeIncompleteItem(order.plannedItems);
			} else {
				throw new Error("The Delivery Order "+req.body.DONumber+" doesn't exist!");
			}
			let list = await dbQuarShptSvc.getQuarShptPlan(req.body.subconPORefNo);
			let prepackOrders=util.buildPrepackOrder(list.recordset)
			let prepackOrder;
			for (let i = 0; i < prepackOrders.length; i++) {
				const element = prepackOrders[i];
				if (element.qsNo===req.body.qsNo){
					prepackOrder=element;
					break;
				}
			}
			let match,workorderList=[],DOItemNumberList=[];
			if (order.plannedItems.length===prepackOrder.plannedItems.length){
				for (let i = 0; i < order.plannedItems.length; i++) {
					match=false;
					const dpi = order.plannedItems[i];
					for (let j = 0; j < prepackOrder.plannedItems.length; j++) {
						const ppi = prepackOrder.plannedItems[j];
						//compare material,batch and qty of two planned items
						if (dpi.MaterialCode===ppi.MaterialCode&&
							dpi.BatchNo===ppi.BatchNo&&
							dpi.DOQuantity===ppi.DOQuantity	){
								workorderList.push(ppi.workOrder);
								DOItemNumberList.push(dpi.DOItemNumber);
								match=true;
								break;
							}
					}
					if (!match){
						throw new Error("The configuration of the SAP DO "+req.body.DONumber+" doesn't match the Pre-Packing Order! ");
					}				
				}
			} else {
				throw new Error("The configuration of the SAP DO "+req.body.DONumber+" doesn't match the Pre-Packing Order! ");
			}
			//the sap order and prepack order matches, copy data from prepack to sap do
			let params={
				qsNo:prepackOrder.qsNo,
				DONumber:order.DONumber,
				workorderList:workorderList.join(","),
				DOItemNumberList:DOItemNumberList.join(","),
			}
			await dbQuarShptSvc.linkPrepackToPack(params);
			return res.status(200).send({confirm:"success"});
		} catch (error) {
			return res.status(400).send({error:true,message:error.message||error});
		}
	})()
};

exports.unlinkSapDo=function(req,res){
	(async function () {
		try {
			let sapOrder = await sapSvc.getDeliveryOrder(req.body.DONumber);
			let order = util.deliveryOrderConverter(sapOrder);
			
			if (order&&order.DONumber)
				util.removeIncompleteItem(order.plannedItems);
			if (order.confirmStatus==='C'){
				throw new Error("The SAP Packing DO "+req.body.DONumber+" has been confirmed!")
			}
			let params={
				qsNo:req.body.qsNo,
				DONumber:req.body.DONumber
			}
			await dbQuarShptSvc.linkPrepackToPack(params);
			return res.status(200).send({confirm:"success"});
			
		} catch (error) {
			return res.status(400).send({error:true,message:error.message||error});
		}
	})()
};