'use strict';
const util = require('../config/util');
const sapSvc =require('../dbservices/sapService');
const dbSpoReceiptsSvc=require('../dbservices/dbSpoReceiptsSvc');
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

exports.removeItem=function(req,res){

};

exports.setStatus=function(req,res){

};
