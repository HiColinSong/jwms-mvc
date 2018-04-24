var dbsvc=require('./config/sqlServie')

//test getMaterial Code
// var promise = dbsvc.getMaterialCode("00812917020015");
// promise.then(function(result){
//     // console.log("result=");
//     if (result.recordset.length>0){
//         console.dir(result.recordset[0].MaterialCode);
//     } else {
//         console.dir("materialCode cannot be found!");
//     }
// },function(err){
//     console.error(err);
// })
//end of getMaterial Code

//test create HU
// var params={
//     DONumber:'0800379642',
//     HUNumberList:'22034560237502345026,22034560237502345027,22034560237502345028,22034560237502345029,22034560237502345030',
//     PackMaterial:'m123456',
//     CreatedBy:'yadong',
//     CreatedOn:'20180423'
//   }
// var promise = dbsvc.createHandlingUnits(params);
// promise.then(function(result){
//     // console.log("result=");
//     console.dir(result);
// },function(err){
//     console.error(err);
// })
//end of test create HU


//test delete HUNumber
// var promise = dbsvc.deleteHandlingUnit("22034560237502345024");
// promise.then(function(result){
//     // console.log("result=");
//     console.dir(result);
// },function(err){
//     console.error(err);
// })
//end of test delete HUNumber

//test update packDetail Qty
// var params={
//     ScanQty:8,
//     DONumber:'0800379642',
//     HUNumber:'HU111',
//     MaterialCode:'m123-11',
//     BatchNo:'batch001',
//     PackBy:'yadong',
//     PackedOn:'20180423'
//   }
// var promise = dbsvc.updatePackingScanQty(params);
// promise.then(function(result){
//     // console.log("result=");
//     console.dir(result);
// },function(err){
//     console.error(err);
// })
//end of update packDetail Qty

//test deletePackingItem
// var params={
//     DONumber:'0800379642',
//     HUNumber:'HU111',
//     MaterialCode:'m123-11',
//     BatchNo:'batch001',
//     PackBy:'sean',
//     PackedOn:'20180422'
//   }
// var promise = dbsvc.deletePackingItem(params);
// promise.then(function(result){
//     // console.log("result=");
//     console.dir(result);
// },function(err){
//     console.error(err);
// })
//end of deletePackingItem

// test insert the scan item for packing
var info = {
    DONumber:'0800379642',
    HUNumber:'HU111',
    MaterialCode:'m123-11',
    BatchNo:'batch001',
    PackBy:'yadong',
    PackedOn:'20180422',
    FullScanCode:'20180423202018042320',
    Status:0,
    Qty:222,
}

var promise = dbsvc.packingScanItem(info);
promise.then(function(result){
    console.log("result=");
    console.dir(result);
},function(err){
    console.error(err);
})