'use strict';
const util = require('../config/util');
const sapSvc =require('../dbservices/sapService');
const dbCountingSvc =require('../dbservices/dbCountingSvc');
var resvDoc,promise;
exports.getPiDoc=function(req,res){
	(async function () {
		try {
			let sapDoc = await sapSvc.getCountingWmDoc(req.body.docNo,req.session.user.DefaultWH);
			let piDoc = util.countingWmDocConverter(sapDoc,req.body.verNo,true);
				// insert data to dbo.BX_CountingWM
				let params={
					docNo:piDoc.docNo,
					verNo:piDoc.verNo,
					warehouse:req.session.user.DefaultWH
				}
				let storageBinList=[];
				let materialList=[];
				let batchList=[];
				for (let i=0;i<piDoc.items.length;i++){
					storageBinList[i]=piDoc.items[i].storageBin;
					materialList[i]=piDoc.items[i].MaterialCode;
					batchList[i]=piDoc.items[i].BatchNo;
				}
				params.storageBinList = storageBinList.join(',');
				params.materialList = materialList.join(',');
				params.batchList = batchList.join(',');
				let ret=await dbCountingSvc.InsertOrUpdateCountingWM(params);
				ret = ret.recordsets;

				if (ret.length>0){
					piDoc.extraItems=ret[0];
				}
				if (ret.length>1){
					piDoc.entryCounts= ret[1];
				}
				if (ret.length>2){
					piDoc.scannedItems= ret[2];
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
		params.verNo=info.verNo;
		params.warehouse=req.session.user.DefaultWH,
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
			await dbCountingSvc.InsertWmScanItem(params)
			return res.status(200).send({confirm:"success"});
		} catch (error) {
			return res.status(400).send([{error:true,message:error}]);
		}
	})()
};

exports.removeItem=function(req,res){
	(async function () {
		try {
			let ret = await dbCountingSvc.deleteWMItemById(req.body.docNo,req.body.verNo,req.session.user.DefaultWH,req.body.itemId);
			ret = ret.recordsets;
			let extraItems = (ret.length>0)?ret[0]:[];
			let entryCounts = (ret.length>1)?ret[1]:[];
			let scannedItems =(ret.length>2)?ret[2]:[];
			util.trimValues(scannedItems);
			let data={scannedItems:scannedItems,extraItems:extraItems,entryCounts:entryCounts}
			return res.status(200).send(data);


		} catch (error) {
			return res.status(400).send([{error:true,message:error}]);
		}
	})()
};
exports.refresh=function(req,res){
	(async function () {
		try {
			let ret = await dbCountingSvc.CountingWMRefreshCounts(req.body.docNo,req.body.verNo,req.session.user.DefaultWH);
			ret = ret.recordsets;
			let extraItems = (ret.length>0)?ret[0]:[];
			let entryCounts = (ret.length>1)?ret[1]:[];
			let scannedItems =(ret.length>2)?ret[2]:[];
			util.trimValues(scannedItems);
			let data={scannedItems:scannedItems,extraItems:extraItems,entryCounts:entryCounts}
			return res.status(200).send(data);
		} catch (error) {
			return res.status(200).send([{error:true,message:error}]);
		}
	})()
};
exports.confirm=function(req,res){
	(async function () {
		try {
			let sapDoc = await sapSvc.getCountingWmDoc(req.body.docNo,req.session.user.DefaultWH);
			let piDoc = util.countingWmDocConverter(sapDoc,req.body.verNo,false);
			let entryCounts=await dbCountingSvc.getWMEntryCount(req.body.docNo,req.session.user.DefaultWH);
			entryCounts=entryCounts.recordset;//entryCounts holds the total counts for each Bin/Mat/Batch (sum of storLoc)
			//split entry counts into different storage location
			//find the entries with same storage Bin, materialCode and batch number but different storage location
			//assign counts to all the storLoc entries with maximum their total stock but the last one, 
			//and the assign the remainning to the last one			
			let entriesWithDiffStorLoc,lastEntry;
			if (entryCounts.length>0&&piDoc.items&&piDoc.items.length>0){
				for (let i = 0; i < entryCounts.length; i++) {
					entriesWithDiffStorLoc=[];
					const ec = entryCounts[i];
					for (let j = 0; j < piDoc.items.length; j++) {
						const item = piDoc.items[j];
						if (ec.storageBin===item.storageBin&&
						 	ec.MaterialCode===item.MaterialCode&&
						 	ec.BatchNo===item.BatchNo){
								if (entriesWithDiffStorLoc.length===0){
									item.ScanQty=ec.entryCount;
								} else {
									lastEntry=entriesWithDiffStorLoc[entriesWithDiffStorLoc.length-1];
									item.ScanQty=Math.max((lastEntry.ScanQty-lastEntry.totalStock),0);
									lastEntry.ScanQty=Math.min(lastEntry.ScanQty,lastEntry.totalStock);
								}
								entriesWithDiffStorLoc.push(item);
						}
					}
				}
			}
			
			let ret = await sapSvc.countingWM(piDoc.items);

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
