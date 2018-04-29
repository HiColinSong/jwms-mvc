var dbPackingSvc=require('./dbservices/dbPackingSvc')
var dbCommonSvc=require('./dbservices/dbCommonSvc')

var params;

var output = function(promise){
    promise.then(function(result){
        console.log(JSON.stringify(result,null,2));
        // console.log(JSON.stringify(result.recordset,null,2));
    },function(err){
        console.error(err);
    })
}

//test getMaterial Code.
var testGetMaterialCode=function(){
    output(dbCommonSvc.getMaterialCode("08888893016139"));
}
//end of getMaterial Code

//test create HU
var testCreateHandlingUnits=function(){
    params={
        DONumber:'0800379642',
        HUNumberList:'2203456023750234522',
        // HUNumberList:'22034560237502345126,22034560237502345127,22034560237502345128,22034560237502345129,22034560237502345030',
        PackMaterial:'m123456',
        CreatedBy:'yadong',
        CreatedOn:'20180423'
      }
    output(dbPackingSvc.createHandlingUnits(params));
}
//end of test create HU


//test delete HUNumber
var testDeleteHandlingUnit=function(){
    output(dbPackingSvc.deleteHandlingUnit("0800379647","HU123"));
}
//end of test delete HUNumber

//test deletePackingItem
var testDeletePackingItem=function(){
    params={
        DONumber:'0800379642',
        HUNumber:'HU111',
        MaterialCode:'m123-11',
        BatchNo:'batch001',
        PackBy:'sean',
        PackedOn:'20180422'
        }
    output(dbPackingSvc.deletePackingItem(params));
}
//end of deletePackingItem

// test insert the scan item for packing
var testInsertScanItem=function(){
    params = {
        DONumber:'0800379642',
        HUNumber:'HU111',
        MaterialCode:'m123-11',
        BatchNo:'batch001',
        PackBy:'yadong',
        PackedOn:'20180422',
        FullScanCode:'20180423202018042320',
        Status:0,
        Qty:2,
    }
    output(dbPackingSvc.InsertScanItem(params));
}
// end of test insert the scan item for packing
//test getMaterial Code.
var testGetScannedItems=function(){
    output(dbPackingSvc.getScannedItems("0800379642"));
}
var testGetHuAndPackDetails=function(){
    output(dbPackingSvc.getHuAndPackDetails("0800401204"));
}
//end of getMaterial Code
//test getPkgMaterial list.
var testGetPkgMtl=function(){
    output(dbPackingSvc.getPkgMtlList());
}
//end of GetPkgMaterial list

var testGetPackHUnits=function(){
    output(dbPackingSvc.getPackHUnits('0800379646'));
}

var testGetPackDetails=function(){
    output(dbPackingSvc.getPackDetails('0800379646'));
}

var testGetUserProfile=function(){
    output(dbCommonSvc.getUserProfile('yd.zhu'));
}

var testDeleteUserProfile=function(){
    output(dbCommonSvc.deleteUserProfile('yd.zhu1'));
}
var testInsertOrUpdateUserProfile=function(){
    let user={
        UserID:'yd.zhu1',
        DefaultWH:'Z01',
        Domain:'BITSG',
        UserRole:'superAdmin',
        isActive:1
    }
    output(dbCommonSvc.insertOrUpdateUserProfile(user));
}

//run from command line: node testCases.js
testDeleteUserProfile();