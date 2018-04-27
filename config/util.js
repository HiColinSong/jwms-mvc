'use strict';

 var orders = {
 	to:{
		toNo:"to123456",
		doNo:"do123456",
		customer:"c123456",
		customerName:"Andrew"
	},
	do:{
		"plannedItems": [
			{
				"DONumber": "0800379646",
				"MaterialCode": "BMXP-2208",
				"BatchNo": "W16120224",
				"VendorBatch": "W16120224",
				"DOItemNumber": "900001",
				"DOQuantity": 25,
				"ProductHierarchy": "100110011002100003",
				"EANCode": "8888893016139"
			},
			{
				"DONumber": "0800379646",
				"MaterialCode": "BMXP-2736",
				"BatchNo": "W16110620",
				"VendorBatch": "W16110620",
				"DOItemNumber": "900002",
				"DOQuantity": 13,
				"ProductHierarchy": "100110011002100003",
				"EANCode": "8888893016344"
			},
			{
				"DONumber": "0800379646",
				"MaterialCode": "BMXP-3533",
				"BatchNo": "W16110607",
				"VendorBatch": "W16110607",
				"DOItemNumber": "900003",
				"DOQuantity": 12,
				"ProductHierarchy": "100110011002100003",
				"EANCode": "8888893016498"
			}
		],
		"DONumber": "0800379646",
		"DOCreationUser": "S.CHAN",
		"DOCreationDate": "20170103",
		"ShipToCustomer": "0000032501",
		"plant": "3250",
		"warehouseNo": "Z01"
	},
	po:{
	 	poNo:"po345678",
		vendor:"v345678",
		vendorName:"Colin"
	 },
	 wo:{
		"woNo":"wo112233",
		"material":"m123456",
		"batchNo":"btn123456",
		"batchQuantity":19,
		"balanceQuantity":12
	}
 }
  var item ={
	  	serialNo:"180701",
		batchNo:"45678901",
		material:"1809-1234"
	  };


exports.getOrder=function(orderNo,type){
	var order = orders[type];
	if (order){
		order[type+"No"]=orderNo;
	}
	return order;
};

exports.getItem=function(serialNo){
	var clone={};
	 Object.assign(clone,item);
	clone.serialNo=serialNo;
	return clone;
};
 
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
		for (let i = 0; i < doItems.length; i++) {
			doItem = doItems[i];
			_do.plannedItems.push({});
			for (let key in itemFields) {
				 _do.plannedItems[i][key]=doItem[itemFields[key]];
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
	 return _do;
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

