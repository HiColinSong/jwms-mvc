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
				for (let i=0;i<piDoc.items.length;i++){
					itemNoList[i]=piDoc.items[i].item;
					materialList[i]=piDoc.items[i].MaterialCode;
					batchList[i]=piDoc.items[i].BatchNo;
				}
				params.itemNoList = itemNoList.join(',');
				params.materialList = materialList.join(',');
				params.batchList = batchList.join(',');
				let ret=await dbCountingSvc.InsertOrUpdateCountingIM(params);
				ret = ret.recordsets;

				if (ret.length>0){
					piDoc.extraItems=ret[0];
				}
				if (ret.length>1){
					piDoc.scannedItems= ret[1];
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
			await dbCountingSvc.deleteIMItemById(req.body.itemId);
			let scannedItems = await dbCountingSvc.getIMScannedItems(req.body.docNo,req.body.fiscalYear);
			scannedItems=scannedItems.recordset;
			util.trimValues(scannedItems);
			let extraItems = await dbCountingSvc.getIMExtraItems(req.body.docNo,req.body.fiscalYear);
			extraItems=extraItems.recordset;
			let data={scannedItems:scannedItems,extraItems:extraItems}
			return res.status(200).send(data);
		} catch (error) {
			return res.status(400).send([{error:true,message:error}]);
		}
	})()
};
exports.refresh=function(req,res){
	(async function () {
		try {
			let scannedItems = await dbCountingSvc.getIMScannedItems(req.body.docNo,req.body.fiscalYear);
			scannedItems=scannedItems.recordset;
			util.trimValues(scannedItems);
			let extraItems = await dbCountingSvc.getIMExtraItems(req.body.docNo,req.body.fiscalYear);
			extraItems=extraItems.recordset;
			let data={scannedItems:scannedItems,extraItems:extraItems}
			return res.status(200).send(data);
		} catch (error) {
			return res.status(200).send([{error:true,message:error}]);
		}
	})()
};
exports.confirm=function(req,res){
	(async function () {
		try {
			let sapDoc = await sapSvc.getCountingImDoc(req.body.docNo,req.body.fiscalYear);
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
