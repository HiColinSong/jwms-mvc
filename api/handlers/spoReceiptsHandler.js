'use strict';
const util = require('../config/util');
const sapSvc =require('../dbservices/sapService');
const dbSpoReceiptsSvc=require('../dbservices/dbSpoReceiptsSvc');
const dbPackingSvc =require('../dbservices/dbPackingSvc');

const dummyData =require('../dummyData/data.json'); //dummy code

exports.getSubconOrderList=function(req,res){
	(async function () {
		try {
			var list = await dbSpoReceiptsSvc.getSubconOrders();
			list = list.recordset;
			var orders = [];
			let previous = '';
			//merge the duplicate subconPO into one element in the array
			if (list&&list.length>0){
				for (let i = 0; i < list.length; i++) {
					const order = list[i];
					if (order.SubCOnPORefNo!==previous){
						order.woNos=[order.WorkOrder];
						order.WorkOrder=undefined;
						// orders.push(order);
						order.fullScanCodeList=[order.FullScanCode];
						order.FullScanCode=undefined;
						orders.push(order);
					} else {
						orders[orders.length-1].woNos.push(order.WorkOrder);
						orders[orders.length-1].fullScanCodeList.push(order.FullScanCode);
					}
					previous=order.SubCOnPORefNo;
				}
			}
			orders.push(dummyData.subconOrder); //dummy code
			return res.status(200).send(orders);
		} catch (error) {
			return res.status(400).send([{error:true,message:error.message}]);
		}
	})()
};
exports.getSubconWorkOrderInfo=function(req,res){
	(async function () {
		try {
			var data = {};
			var list = await dbSpoReceiptsSvc.getSubconWorkOrders(req.body.orderNo);
			data.workOrders = list.recordset;
			if (req.session.user.UserRole==='DocControlQA'){ //only load pendingList for DocControlQA Role.
				var subconPO = (data.workOrders.length>0)?data.workOrders[0].SubConPoRefNo:"";
				list = await dbSpoReceiptsSvc.getSubconPendingList(subconPO,'SGW');
				data.bitPendingList = list.recordset;
				list = await dbSpoReceiptsSvc.getSubconPendingList(subconPO,'SGQ');
				data.qasPendingList = list.recordset;
			}
			//dummy code
			if (req.body.orderNo==='B12345678'){
				data={};
				data.workOrders = dummyData.workOrders;
			}
			//end dummy code

			return res.status(200).send(data);
		} catch (error) {
			return res.status(400).send({error:true,message:error.message});
		}
	})()
};
exports.getScanPendingList=function(req,res){
	(async function () {
		try {
			let data = {};
			let list = await dbSpoReceiptsSvc.getSubconPendingList(req.body.subconPO,req.body.ShipToTarget);
			data.pendingList = list.recordset;
			return res.status(200).send(data);
		} catch (error) {
			return res.status(400).send({error:true,message:error.message});
		}
	})()
};
// exports.getPendingList=function(req,res){
// 	(async function () {
// 		try {
// 			var list = await dbSpoReceiptsSvc.getSubconPendingList(req.body.sShip2Target);
// 			return res.status(200).send(list.recordset);
// 		} catch (error) {
// 			return res.status(400).send([{error:true,message:error.message}]);
// 		}
// 	})()
// };
exports.getQASampleCategoryList=function(req,res){
	(async function () {
		try {
			var list = await dbSpoReceiptsSvc.getQASampleCategoryList();
			return res.status(200).send(list.recordset);
		} catch (error) {
			return res.status(200).send({error:true,message:error});
		}
	})()
};

exports.updateReturn=function(req,res){
	(async function () {
		try {
			var param={
					sFullScanCode:req.body.sFullScanCode,
					sReturnToTarget:req.body.sReturnToTarget,
					sLogonUser:req.session.user.UserID,
					sQACategory:req.body.sQACategory,
					sOverWritePreviousScan:req.body.sOverWritePreviousScan
				}
			var list = await dbSpoReceiptsSvc.updateSubConReturns(param);
			
			var data = {};
			// var list = await dbSpoReceiptsSvc.getSubconWorkOrders(req.body.orderNo);
			// data.workOrders = list.recordset;
			// list = await dbSpoReceiptsSvc.getSubconPendingList(req.body.orderNo,'SGW');
			// data.bitPendingList = list.recordset;
			// list = await dbSpoReceiptsSvc.getSubconPendingList(req.body.orderNo,'SGQ');
			// data.qasPendingList = list.recordset;

			return res.status(200).send(data);//return serial number
		} catch (error) {
			return res.status(400).send({error:error,message:error.message,errorCode:error.number});
		}
	})()
};

//dummy code
exports.updateReturn=function(req,res){
	(async function () {
		try {
			var data = {},amount=0;
			if (!isNaN(req.body.sFullScanCode)){
				amount=parseInt(req.body.sFullScanCode)
			} else if (req.body.sFullScanCode==="reset"){
				dummyData.workOrders=Object.assign([],dummyData.originalWorkOrders);
				dummyData.prepackOrder.plannedItems=undefined;
				dummyData.prepackOrder.HUList=undefined;
				dummyData.prepackOrder.DONumber=undefined;
				dummyData.prepackOrder.confirmStatus=undefined;
				dummyData.prepackOrder.linkToSapStatus = undefined;
				dummyData.prepackOrder.linkSapOrder = undefined;
				dummyData.sapOrders[0].HUList=[];
			}
			if (amount>0){
				for (let i = 0; i < dummyData.workOrders.length; i++) {
					const wo = dummyData.workOrders[i];
					if (wo.nRcptSGWQty<wo.nPlanSGWQty){
						wo.nRcptSGWQty=Math.min(amount,wo.nPlanSGWQty);
						wo.nRcptSGQQty=wo.nPlanSGQQty;
						break
					}
				}
				// if (dummyData.workOrders[0].nRcptSGWQty<dummyData.workOrders[0].nPlanSGWQty){
				// 	dummyData.workOrders[0].nRcptSGWQty=Math.min(amount,dummyData.workOrders[0].nPlanSGWQty);
				// 	dummyData.workOrders[0].nRcptSGQQty=dummyData.workOrders[0].nPlanSGQQty;
				// } else if (dummyData.workOrders[1].nRcptSGWQty<100){
				// 	dummyData.workOrders[1].nRcptSGWQty=Math.min(amount,100);
				// 	dummyData.workOrders[1].nRcptSGQQty=10;
				// } else  if (dummyData.workOrders[2].nRcptSGWQty<200){
				// 	dummyData.workOrders[2].nRcptSGWQty=Math.min(amount,200);
				// 	dummyData.workOrders[2].nRcptSGQQty=20;
				// } 
			}
			return res.status(200).send(data);//return serial number
		} catch (error) {
			return res.status(400).send({error:error,message:error.message,errorCode:error.number});
		}
	})()
};
//end dummy data

exports.completeSubconReceipt=function(req,res){
	(async function () {
		try {
			var list = await dbSpoReceiptsSvc.CheckAndCompleteSubConReceipt(req.body.orderNo);
			list = list.recordset;
			//call custom bapi to udpate SAP
			let args = {IT_BX_STOCK:[]};
			for (let j = 0; j < list.length; j++) {
				const item = list[j];
				args.IT_BX_STOCK.push({
					TRANS:"GR1",
					WERKS:item.PlantCode,
					MATNR:item.Itemcode,
					CHARG: item.batchno,
					SERIAL:item.SerialNo,
					DOCNO: item.PostingDocument,
					ENDCUST:item.ShipToTarget,
					BXDATE:util.formatDateTime().date,
					BXTIME:util.formatDateTime().time,
					BXUSER:req.session.user.UserID
				});
			}
			if (args.IT_BX_STOCK.length>0)
				await sapSvc.serialNoUpdate(args);
			return res.status(200).send({confirm:"success"});
		} catch (error) {
			return res.status(400).send([{error:true,message:error.message}]);
		}
	})()
};

//dummy code
exports.completeSubconReceipt=function(req,res){
	(async function () {
		try {
			console.log(req.body.orderNo);
			for (let i = 0; i < req.body.releasedOrders.length; i++) {
				const ro = req.body.releasedOrders[i];
				for (let j = 0; j < dummyData.workOrders.length; j++) {
					const wo = dummyData.workOrders[j];
					if (ro===wo.WorkOrder){
						wo.lotReleased=true;
					}
				}
			}
			let data={workOrders:dummyData.workOrders,confirm:"success"}
			return res.status(200).send(data);
		} catch (error) {
			return res.status(400).send([{error:true,message:error.message}]);
		}
	})()
};
// exports.partialRelease=function(req,res){
// 	(async function () {
// 		try {
// 			var list = await dbPackingSvc.getScannedItemsWithWorkOrder(req.body.orderNo,req.body.subconPO);
// 			list = list.recordset;
// 			//call custom bapi to udpate SAP
// 			let args = {IT_BX_STOCK:[]};
// 			for (let j = 0; j < list.length; j++) {
// 				const item = list[j];
// 				args.IT_BX_STOCK.push({
// 					TRANS:"GR1",
// 					WERKS:'2100',
// 					MATNR:item.MaterialCode,
// 					CHARG: item.BatchNo,
// 					SERIAL:item.SerialNo,
// 					DOCNO: item.workorder,
// 					ENDCUST:'SGW',
// 					BXDATE:util.formatDateTime().date,
// 					BXTIME:util.formatDateTime().time,
// 					BXUSER:req.session.user.UserID
// 				});
// 			}
// 			if (args.IT_BX_STOCK.length>0)
// 				await sapSvc.serialNoUpdate(args);
// 			return res.status(200).send({confirm:"success"});
// 		} catch (error) {
// 			return res.status(400).send([{error:true,message:error.message}]);
// 		}
// 	})()
// };

exports.removeItem=function(req,res){

};

exports.setStatus=function(req,res){

};
