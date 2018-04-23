'use strict';

 var orders = {
 	to:{
		toNo:"to123456",
		doNo:"do123456",
		customer:"c123456",
		customerName:"Andrew"
	},
	do:{
		doNo:"do234567",
		customer:"c234567",
		customerName:"Brian"
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
	 var _do = {items:[]};
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
			_do.items.push({});
			for (let key in itemFields) {
				 _do.items[i][key]=doItem[itemFields[key]];
			}
		}
	 }
	 if (deliveryOrder.ET_DELIVERY_ITEM_STS&&deliveryOrder.ET_DELIVERY_ITEM_STS.length>0){
		 doItems = deliveryOrder.ET_DELIVERY_ITEM_STS;
		for (let i = 0; i < doItems.length; i++) {
			doItem = doItems[i];
			_do.items.push({});
			for (let key in itemSTSFields) {
				 _do.items[i][key]=doItem[itemSTSFields[key]];
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

