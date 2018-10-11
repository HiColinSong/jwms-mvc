'use strict';
const util = require('../config/util');
const sapSvc =require('../dbservices/sapService');
const dbCountingSvc =require('../dbservices/dbCountingSvc');
exports.getPiDoc=function(req,res){
	(async function () {
		try {
			let sapDoc = await sapSvc.getCountingImDoc(req.body.docNo,req.body.fiscalYear);
			let piDoc = util.countingImDocConverter(sapDoc);
				// insert data to dbo.BX_CountingIM
				var params={
					docNo:piDoc.docNo,
					fiscalYear:piDoc.fiscalYear,
				}
				var itemNoList=[];
				var materialList=[];
				var batchList=[];
				var plantList=[];
				for (let i=0;i<piDoc.items.length;i++){
					itemNoList[i]=piDoc.items[i].item;
					materialList[i]=piDoc.items[i].MaterialCode;
					batchList[i]=piDoc.items[i].BatchNo;
					plantList[i]=piDoc.items[i].Plant;
				}
				params.itemNoList = itemNoList.join(',');
				params.materialList = materialList.join(',');
				params.batchList = batchList.join(',');
				params.plantList = plantList.join(',');
				let ret=await dbCountingSvc.InsertOrUpdateCountingIM(params);
				ret = ret.recordsets;

				if (ret.length>0){
					piDoc.scannedItems= ret[0];
					util.trimValues(piDoc.scannedItems);
				}
				return res.status(200).send(piDoc);

		} catch (error) {
			return res.status(400).send({error:true,message:error.message||error});
		}
	})()
};

exports.addItem=function(req,res){
	(async function () {
		var info=req.body,params={};
		params.docNo=info.orderNo;
		params.fiscalYear=info.fiscalYear;
		params.EANCode=info.EANCode;
		params.MaterialCode=info.MaterialCode;
		params.BatchNo=info.BatchNo;
		params.Qty = info.Qty||1;
		if (info.SerialNo){
			params.SerialNo=info.SerialNo;
			params.Qty = 1;
		} 
		params.countBy=req.session.user.UserID;
		params.countOn=info.scannedOn;
		params.FullScanCode = info.FullScanCode;

		try {
			await dbCountingSvc.InsertImScanItem(params)
			return res.status(200).send({confirm:"success"});
		} catch (error) {
			return res.status(400).send([{error:true,message:error}]);
		}
	})()
};

exports.removeItem=function(req,res){
	(async function () {
		try {
			await dbCountingSvc.deleteWMItemById(req.body.itemId);
			let scannedItems = await dbCountingSvc.getWMScannedItems(req.body.docNo,req.session.user.DefaultWH);
			scannedItems=scannedItems.recordset;
			return res.status(200).send(scannedItems);
		} catch (error) {
			return res.status(400).send([{error:true,message:error}]);
		}
	})()
};
exports.refresh=function(req,res){
	(async function () {
		try {
			let scannedItems = await dbCountingSvc.getWMScannedItems(req.body.docNo,req.session.user.DefaultWH);
			scannedItems=scannedItems.recordset;
			return res.status(200).send(scannedItems);
		} catch (error) {
			return res.status(200).send([{error:true,message:error}]);
		}
	})()
};
exports.confirm=function(req,res){
	(async function () {
		try {
			let sapDoc = await sapSvc.getCountingImDoc(req.body.docNo,req.session.user.DefaultWH);
			let piDoc = util.countingImDocConverter(sapDoc);
		
			
			
			let ret = await sapSvc.countingIM(piDoc);

			// let args = util.getTransParams(req.body.order,"RSV",req.session.user.UserID);
			// if (args.IT_BX_STOCK.length>0)
			// 	await sapSvc.serialNoUpdate(args);
			// let info={
			// 	Warehouse:req.session.user.DefaultWH,
			// 	ResvNumber:req.body.order.ResvNo,
			// 	PostedOn:req.body.postedOn,
			// 	PostedBy:req.session.user.UserID,
			// 	PostingStatus:'C',
			// 	Push2SAPStatus:'C',
			// }
			// let status=await dbResvSvc.setStatus(info);
			return res.status(200).send({confirm:"success"});
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

