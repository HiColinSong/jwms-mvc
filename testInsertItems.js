var dbsvc=require('./config/sqlServie')
var info = {
    DONumber:'0800379642',
    HUNumber:'HU111-1',
    MaterialCode:'m123-11',
    BatchNo:'batch001',
    PackBy:'yadong',
    PackedOn:'20180423',
    FullScanCode:'20180423202018042320',
    Status:0,
    Qty:60,
}

var promise = dbsvc.packingScanItem(info);
promise.then(function(result){
    console.log("result=");
    console.dir(result);
},function(err){
    console.error(err);
})