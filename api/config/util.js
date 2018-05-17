'use strict';

//  var orders = {
//  	to:{
// 		toNo:"to123456",
// 		doNo:"do123456",
// 		customer:"c123456",
// 		customerName:"Andrew"
// 	},
// 	do:{
// 		"plannedItems": [
// 			{
// 				"DONumber": "0800379646",
// 				"MaterialCode": "BMXP-2208",
// 				"BatchNo": "W16120224",
// 				"VendorBatch": "W16120224",
// 				"DOItemNumber": "900001",
// 				"DOQuantity": 25,
// 				"ProductHierarchy": "100110011002100003",
// 				"EANCode": "8888893016139"
// 			},
// 			{
// 				"DONumber": "0800379646",
// 				"MaterialCode": "BMXP-2736",
// 				"BatchNo": "W16110620",
// 				"VendorBatch": "W16110620",
// 				"DOItemNumber": "900002",
// 				"DOQuantity": 13,
// 				"ProductHierarchy": "100110011002100003",
// 				"EANCode": "8888893016344"
// 			},
// 			{
// 				"DONumber": "0800379646",
// 				"MaterialCode": "BMXP-3533",
// 				"BatchNo": "W16110607",
// 				"VendorBatch": "W16110607",
// 				"DOItemNumber": "900003",
// 				"DOQuantity": 12,
// 				"ProductHierarchy": "100110011002100003",
// 				"EANCode": "8888893016498"
// 			}
// 		],
// 		"DONumber": "0800379646",
// 		"DOCreationUser": "S.CHAN",
// 		"DOCreationDate": "20170103",
// 		"ShipToCustomer": "0000032501",
// 		"plant": "3250",
// 		"warehouseNo": "Z01"
// 	},
// 	po:{
// 	 	poNo:"po345678",
// 		vendor:"v345678",
// 		vendorName:"Colin"
// 	 },
// 	 wo:{
// 		"woNo":"wo112233",
// 		"material":"m123456",
// 		"batchNo":"btn123456",
// 		"batchQuantity":19,
// 		"balanceQuantity":12
// 	}
//  }
//   var item ={
// 	  	serialNo:"180701",
// 		batchNo:"45678901",
// 		material:"1809-1234"
// 	  };


// exports.getOrder=function(orderNo,type){
// 	var order = orders[type];
// 	if (order){
// 		order[type+"No"]=orderNo;
// 	}
// 	return order;
// };

// exports.getItem=function(serialNo){
// 	var clone={};
// 	 Object.assign(clone,item);
// 	clone.serialNo=serialNo;
// 	return clone;
// };

exports.formatDateTime=function(dateString){
	let d=new Date(dateString);
	let formatDate =  d.getFullYear()+("0"+(d.getMonth()+1)).slice(-2)+("0"+d.getDate()).slice(-2);
	let formatTime = ("0"+d.getHours()).slice(-2)+("0"+d.getMinutes()).slice(-2)+("0"+d.getSeconds()).slice(-2);
	return {date:formatDate,time:formatTime}
}

 exports.cleanObject = function (object){
 	for (let key in object) {
	    if (object.hasOwnProperty(key)) {
		        if (Array.isArray(object[key])&&object[key].length===0){
		        	object[key]=undefined;
		        }
		    }
		}
		return object;
 }
//  conver SAP Delivery Order into BX friendly DO, i.e. only output necessary fields with meaningful field name
 var sapFields = require('./sapFields.json');
 exports.deliveryOrderConverter = function (deliveryOrder){
	 var _do = {plannedItems:[]};
	 var headerFields=sapFields.deliveryOrderHeaderFields;
	 var headerSTSFields=sapFields.deliveryOrderHeaderSTSFields;
	 var itemFields=sapFields.deliveryOrderItemFields;
	 var itemSTSFields=sapFields.deliveryOrderItemSTSFields;
	 var header,doItems,doItem;
	 if (deliveryOrder.ET_DELIVERY_HEADER&&deliveryOrder.ET_DELIVERY_HEADER.length>0){
		 header = deliveryOrder.ET_DELIVERY_HEADER[0];
	 	for (let key in headerFields) {
			_do[key]=header[headerFields[key]];
		 }
	 }
	 if (deliveryOrder.ET_DELIVERY_HEADER_STS&&deliveryOrder.ET_DELIVERY_HEADER_STS.length>0){
		 header = deliveryOrder.ET_DELIVERY_HEADER_STS[0];
	 	for (let key in headerSTSFields) {
			_do[key]=header[headerSTSFields[key]];
		 }
	 }
	 if (deliveryOrder.ET_DELIVERY_ITEM&&deliveryOrder.ET_DELIVERY_ITEM.length>0){
		 doItems = deliveryOrder.ET_DELIVERY_ITEM;
		 _do.totalPlannedQty=0;
		for (let i = 0; i < doItems.length; i++) {
			doItem = doItems[i];
			_do.plannedItems.push({});
			for (let key in itemFields) {
				_do.plannedItems[i][key]=doItem[itemFields[key]];
				// if (_do.plannedItems[i][key]&&(typeof _do.plannedItems[i][key] ==="string"))
				// 	 _do.plannedItems[i][key]=_do.plannedItems[i][key].replace(/^0+/, ''); //remove leading 0s
					
				if (_do.plannedItems[i][key]&&(key ==="DOQuantity")){
					_do.plannedItems[i][key]=parseInt(_do.plannedItems[i][key]);
					_do.totalPlannedQty+=_do.plannedItems[i][key];
				}
			}
		}
	 }
	 if (deliveryOrder.ET_DELIVERY_ITEM_STS&&deliveryOrder.ET_DELIVERY_ITEM_STS.length>0){
		 doItems = deliveryOrder.ET_DELIVERY_ITEM_STS;
		for (let i = 0; i < doItems.length; i++) {
			doItem = doItems[i];
			_do.plannedItems.push({});
			for (let key in itemSTSFields) {
				 _do.plannedItems[i][key]=doItem[itemSTSFields[key]];
			}
		}
	 }
	 //find enduser code
	 if (deliveryOrder.ET_DELIVERY_PARTNER&&deliveryOrder.ET_DELIVERY_PARTNER.length>0){
		doItems = deliveryOrder.ET_DELIVERY_PARTNER;
		for (let i = 0; i < doItems.length; i++) {
			if(doItems[i].PARVW==="ZE"){
				_do.endUser=doItems[i].KUNNR;
			}
		}
	 }
	 return _do;
 }
 exports.transferOrderConverter = function (transferOrder){
	 var _to = {plannedItems:[]};
	 var transferOrderFields=sapFields.transferOrderFields;
	 var headerFields=sapFields.transferOrderHeaderFields;
	 var itemFields=sapFields.transferOrderItemFields;
	 var header,items,item;
	 if (transferOrder){
	 	for (let key in transferOrderFields) {
			_to[key]=transferOrder[transferOrderFields[key]];
		 }
	 }
	 if (transferOrder.TOHEADERDATA&&transferOrder.TOHEADERDATA.length>0){
		 header = transferOrder.TOHEADERDATA[0];
	 	for (let key in headerFields) {
			_to[key]=header[headerFields[key]];
		 }
	 }
	 if (transferOrder.TOITEMDATA&&transferOrder.TOITEMDATA.length>0){
		 items = transferOrder.TOITEMDATA;
		for (let i = 0; i < items.length; i++) {
			item = items[i];
			_to.plannedItems.push({});
			for (let key in itemFields) {
				_to.plannedItems[i][key]=item[itemFields[key]];
				// if (_to.plannedItems[i][key]&&(typeof _to.plannedItems[i][key]==="string"))
				// 	_to.plannedItems[i][key]=_to.plannedItems[i][key].replace(/^0+/, '');//remove leading 0s
				if (_to.plannedItems[i][key]&&(key ==="TOQuantity"))
					_to.plannedItems[i][key]=parseInt(_to.plannedItems[i][key]);
			}
		}
	}
	return _to;
}

 //for DO order items, remove the item that misses BatchNo or MaterialCode or DOQuantity is 0
exports.removeIncompleteItem = function (items){
	if (items.length>0){
		for (let i = 0; i < items.length;) {
			if (!items[i].BatchNo||!items[i].MaterialCode||!items[i].DOQuantity===0){
				items.splice(i,1);
			} else {
				i++;
			}
		}
	}
}
 //for DO order items, remove the item that misses BatchNo or MaterialCode or DOQuantity is 0
exports.trimValues = function (list){
	if (list.length>0){
		for (let i = 0; i < list.length; i++) {
			for (let key in list[i]) {
				if (list[i][key]&&typeof list[i][key] ==="string")
				list[i][key]=list[i][key].trim();
			 }
		}
	}
}

//get SNUpdate Params
exports.getTransParams = function(order,TRANS){
	const HUList = order.HUList;
	const scannedItems = order.scannedItems;
	var args = {IT_BX_STOCK:[]};
	if (HUList&&HUList.length>0){
		for (let i = 0; i < HUList.length; i++) {
			const hu = HUList[i];
			for (let j = 0; j < hu.scannedItems.length; j++) {
				const item = hu.scannedItems[j];
				if (item.SerialNo){
					args.IT_BX_STOCK.push({
						TRANS:TRANS,
						WERKS:order.plannedItems[0].Plant,
						MATNR:item.MaterialCode,
						CHARG: item.BatchNo,
						SERIAL:item.SerialNo,
						DOCNO: item.HUNumber,
						ENDCUST:order.endUser,
						BXDATE:this.formatDateTime(item.PackedOn).date,
						BXTIME:this.formatDateTime(item.PackedOn).time,
						BXUSER:item.PackBy
					});
				}
			}
		}
	} else if (scannedItems){
		for (let j = 0; j < scannedItems.length; j++) {
			const item = scannedItems[j];
			if (item.SerialNo){
				args.IT_BX_STOCK.push({
					TRANS:TRANS,
					WERKS:order.plannedItems[0].Plant,
					MATNR:item.MaterialCode,
					CHARG: item.BatchNo,
					SERIAL:item.SerialNo,
					DOCNO: order.DONumber,
					ENDCUST:order.endUser,
					BXDATE:this.formatDateTime(item.PackedOn||item.ReceivedOn).date,
					BXTIME:this.formatDateTime(item.PackedOn||item.ReceivedOn).time,
					BXUSER:item.PackBy||item.ReceiptBy
				});
			}
		}
	}
	return args
}


