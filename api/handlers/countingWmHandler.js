'use strict';
const util = require('../config/util');
const sapSvc =require('../dbservices/sapService');
const dbResvSvc =require('../dbservices/dbReservationSvc');
const dummyData =require('../dummyData/data.json');
var resvDoc,promise;
exports.getPiDoc=function(req,res){
	(async function () {
		try {
			let sapDoc = await sapSvc.getCountingWmDoc(req.body.docNo,req.session.user.DefaultWH);
			let piDoc = util.countingWmDocConverter(sapDoc);
			//check status 
			// 	//insert data to dbo.SAP_RESVHeader, dbo.SAP_RESVDetail
			// 	var params={
			// 		Warehouse:req.session.user.DefaultWH,
			// 		ResvOrder:piDoc.ResvNo,
			// 		ResvOrderDate:piDoc.CreatedOn,
			// 		ResvCreaedBy:piDoc.CreatedBy,
			// 		DONumber:piDoc.DONumber,
			// 		Plant:piDoc.plannedItems[0].Plant,
			// 		PostingStatus:'0' //Incomplete
			// 	}
			// 	var ResvItemNumberList=[];
			// 	var MaterialCodeList=[];
			// 	var BatchNumberList=[];
			// 	var VendorBatchList=[];
			// 	var ResvQuantityList=[];
			// 	for (let i=0;i<piDoc.plannedItems.length;i++){
			// 		ResvItemNumberList[i]=piDoc.plannedItems[i].ResvItemNumber;
			// 		MaterialCodeList[i]=piDoc.plannedItems[i].MaterialCode;
			// 		BatchNumberList[i]=piDoc.plannedItems[i].BatchNo;
			// 		VendorBatchList[i]=piDoc.plannedItems[i].VendorBatch;
			// 		ResvQuantityList[i]=piDoc.plannedItems[i].Quantity||1;
			// 	}
			// 	params.ResvItemNumberList = ResvItemNumberList.join(',');
			// 	params.MaterialCodeList = MaterialCodeList.join(',');
			// 	params.BatchNumberList = BatchNumberList.join(',');
			// 	params.VendorBatchList = VendorBatchList.join(',');
			// 	params.ResvQuantityList = ResvQuantityList.join(',');
			// 	let ret=await dbResvSvc.InsertOrUpdateResv(params);
			// 	ret = ret.recordsets;
			// 	if (ret.length>0&&ret[0].length>0){
			// 		piDoc.Push2SAPStatus = ret[0][0].Push2SAPStatus||undefined;
			// 		piDoc.SAPRefNo = ret[0][0].SAPRefNo||undefined;
			// 		piDoc.postedOn = ret[0][0].postedOn||undefined;
			// 		piDoc.postedBy = ret[0][0].postedBy||undefined;
			// 	}
			// 	if (ret.length>1){
			// 		piDoc.scannedItems= ret[1];
			// 		util.trimValues(piDoc.scannedItems);
			// 	}
				// piDoc.scannedItems=dummyData.CountingImSscannedItems;
	
				return res.status(200).send(piDoc);

		} catch (error) {
			return res.status(400).send({error:true,message:error.message||error});
		}
	})()
};

exports.addItem=function(req,res){
	(async function () {
		var info=req.body,params={};
		params.ResvNumber=info.orderNo;
		params.EANCode=info.EANCode;
		params.MaterialCode=info.MaterialCode;
		params.BatchNo=info.BatchNo;
		// params.DOItemNumber=info.itemNumber;
		params.Qty = info.Qty||1;
		if (info.SerialNo){
			params.SerialNo=info.SerialNo;
			params.Qty = 1;
		} 
		params.PostBy=req.session.user.UserID;
		params.PostOn=info.scannedOn;
		params.Status = info.Status
		params.FullScanCode = info.FullScanCode;

		try {
			var scannedItems = await dbResvSvc.InsertScanItem(params);
			scannedItems=scannedItems.recordset;
			util.trimValues(scannedItems);
			return res.status(200).send(scannedItems);
		} catch (error) {
			return res.status(400).send([{error:true,message:error}]);
		}
	})()
};

exports.removeItem=function(req,res){
	(async function () {
		try {
			await dbResvSvc.deleteItemByKey(req.body.RowKey);
			var scannedItems = await dbResvSvc.getScannedItems(req.body.orderNo);
			scannedItems=scannedItems.recordset;
			util.trimValues(scannedItems);
			return res.status(200).send(scannedItems);
		} catch (error) {
			return res.status(400).send([{error:true,message:error}]);
		}
	})()
};
exports.refresh=function(req,res){
	(async function () {
		try {
			var scannedItems = await dbResvSvc.getScannedItems(req.body.orderNo);
			scannedItems=scannedItems.recordset;
			return res.status(200).send(scannedItems);
		} catch (error) {
			return res.status(200).send([{error:true,message:error}]);
		}
	})()
};
exports.confirmReservation=function(req,res){
	(async function () {
		try {
			let sapDoc = await sapSvc.getReservationDoc(req.body.resvNo);
			let resvDoc = util.reservationConverter(sapDoc);
			for (let i = 0; i < resvDoc.plannedItems.length; i++) {
				const item =  resvDoc.plannedItems[i];
				for (let j = 0; j < req.body.postingItemsIndexes.length; j++) {
					const idx = req.body.postingItemsIndexes[j];
					if (i===idx){
						item.posting=true;
						break;
					}
				}
				
			}
			
			let ret = await sapSvc.reservation(resvDoc,req.body.postedOn);

			let args = util.getTransParams(req.body.order,"RSV",req.session.user.UserID);
			if (args.IT_BX_STOCK.length>0)
				await sapSvc.serialNoUpdate(args);
			let info={
				Warehouse:req.session.user.DefaultWH,
				ResvNumber:req.body.order.ResvNo,
				PostedOn:req.body.postedOn,
				PostedBy:req.session.user.UserID,
				PostingStatus:'C',
				Push2SAPStatus:'C',
			}
			let status=await dbResvSvc.setStatus(info);
			return res.status(200).send({confirm:"success",status:status.recordset[0]});
		} catch (error) {
			return res.status(400).send({error:true,message:error.message||error});
		}
	})()
};

exports.reservationReversal=function(req,res){
	(async function () {
		try {
			// var sapOrder = await sapSvc.getDeliveryOrder(req.body.orderNo);
			// var order = util.deliveryOrderConverter(sapOrder);
			
			// if (!order.DONumber){
			// 	throw new Error("The RGA "+req.body.orderNo+" doesn't exist.");
			// }
			
			// if (order.pgiStatus!=="C"){
			// 	throw new Error("The Document hasn't been PGR yet.");
			// }
			// var ret = await sapSvc.pgrReversal(req.body.orderNo,order.DeliveryType,req.body.currentDate);
			// //update the SN in sap
			// var scannedItems = await dbRtgReceiptSvc.getScannedItems(req.body.orderNo);
			// order.scannedItems = scannedItems.recordset;
			// util.trimValues(order.scannedItems);
			// var args = util.getTransParams(order,"RGAX");
			// if (args.IT_BX_STOCK.length>0)
			// 	await sapSvc.serialNoUpdate(args);
			var info={
				Warehouse:req.session.user.DefaultWH,
				ResvNumber:req.body.orderNo,
				PostedOn:req.body.postedOn,
				PostedBy:req.session.user.UserID,
				PostingStatus:'R',
				Push2SAPStatus:'R',
			}
			var status=await dbResvSvc.setStatus(info);
			return res.status(200).send({confirm:"success"});
		} catch (error) {
			return res.status(400).send({error:true,message:error.message||error});
		}
	})()
}

