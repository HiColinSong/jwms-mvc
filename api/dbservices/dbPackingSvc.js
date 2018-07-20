'use strict';
const sqlSvc=require("./sqlService");
const dbSvc=require("./dbCommonSvc");

//when retrieving the DO from SAP, initialze the BX db
exports.InsertScanItem=function(info){
  var params={
    DONumber:{type:'sql.VarChar(12)',value:info.DONumber},
    EANCode:{type:'sql.VarChar(16)',value:info.EANCode},
    HUNumber:{type:'sql.VarChar(20)',value:info.HUNumber},
    MaterialCode:{type:'sql.VarChar(18)',value:info.MaterialCode},
    BatchNo:{type:'sql.VarChar(20)',value:info.BatchNo},
    BinNumber:{type:'sql.VarChar(20)',value:info.BinNumber},
    PackBy:{type:'sql.VarChar(20)',value:info.PackBy},
    PackedOn:{type:'sql.VarChar(22)',value:info.PackedOn},
    FullScanCode:{type:'sql.VarChar(60)',value:info.FullScanCode},
    Status:{type:'sql.Char(1)',value:info.Status},
    Qty:{type:'sql.Int',value:info.Qty}
  }
  if (info.SerialNo){
    params.SerialNo={type:'sql.VarChar(10)',value:info.SerialNo};
  }
  return sqlSvc.callStoredProcedure("dbo.InsertOrUpdatePacking",params)
}

//insert DO into SAP_DOHeader and SAP_DODetail in BX
  exports.InsertOrUpdateDO=function(info){
    var params={
      DONumber:{type:"sql.VarChar(12)",value:info.DONumber},
      DOCreationDate:{type:'sql.VarChar(10)',value:info.DOCreationDate},
      DOCreationUser:{type:'sql.VarChar(20)',value:info.DOCreationUser},
      Plant:{type:'sql.VarChar(4)',value:info.ShippingPoint},
      ShipToCustomer:{type:'sql.VarChar(8)',value:info.ShipToCustomer},
      DOStatus:{type:'sql.Char(1)',value:info.DOStatus},
      PackStart:{type:'sql.VarChar(22)',value:info.PackStart},
      DOItemNumberList:{type:'sql.VarChar(3500)',value:info.DOItemNumberList},
      MaterialCodeList:{type:'sql.VarChar(8000)',value:info.MaterialCodeList},
      BatchNumberList:{type:'sql.VarChar(5500)',value:info.BatchNumberList},
      VendorBatchList:{type:'sql.VarChar(8000)',value:info.VendorBatchList},
      DOQuantityList:{type:'sql.VarChar(2000)',value:info.DOQuantityList}
    }
    return sqlSvc.callStoredProcedure("dbo.InsertOrUpdateDO",params)
  }
//insert Handlig Units list
  exports.createHandlingUnits=function(info){
    if (info.Domain=='BESA'){
      info.Domain='BBV'
    }
    var params={
      DONumber:{type:"sql.VarChar(12)",value:info.DONumber},
      NumToCreate:{type:'sql.Int',value:info.NumToCreate},
      PackMaterial:{type:'sql.VarChar(18)',value:info.PackMaterial},
      CreatedBy:{type:'sql.VarChar(20)',value:info.CreatedBy},
      BUnit:{type:'sql.VarChar(10)',value:info.Domain},
      CreatedOn:{type:'sql.VarChar(22)',value:info.CreatedOn}
    }
    return sqlSvc.callStoredProcedure("dbo.InsertHandlingUnits",params)
  }
  //Delete a Handling Unit
  exports.deleteHandlingUnit=function(info){
    var params={
      DONumber:{type:"sql.VarChar(12)",value:info.DONumber},
      HUNumber:{type:'sql.VarChar(20)',value:info.HUNumber}
    }
    return sqlSvc.callStoredProcedure("dbo.DeleteHandlingUnit",params)
  }
  //update quantity in BX_PackDetail --this is bad operation because user can update to more than planned qty
  exports.updateScanQty=function(info){
    var stmt = "update dbo.BX_PackDetails SET ScanQty = @ScanQty WHERE DONumber=@DONumber and HUNumber=@HUNumber and MaterialCode=@MaterialCode and BatchNo=@BatchNo and PackBy=@PackBy and PackedOn=@PackedOn and SerialNo is null";
    return sqlSvc.sqlQuery(stmt,getParamTypes(),info)
  }
  //Delete packing detail item
  exports.deletePackingItem=function(info){
    var stmt=stmt = "delete from dbo.BX_PackDetails WHERE DONumber=@DONumber and HUNumber=@HUNumber and MaterialCode=@MaterialCode and BatchNo=@BatchNo and PackBy=@PackBy and PackedOn=@PackedOn and SerialNo";
    if (info.serialNo){
      stmt += "@SerialNo";
    } else {
      stmt += " is null";
    }
    return sqlSvc.sqlQuery(stmt,dbSvc.getParamTypes(),info)
  }
  //Delete packing detail item
  exports.deletePackingItemByKey=function(RowKey){
    var stmt = "delete from dbo.BX_PackDetails WHERE RowKey='"+RowKey+"'";
    return sqlSvc.sqlQuery(stmt)
  }

  //get scanned items for packing
  exports.getScannedItems=function(DONumber){
    var stmt = "select * from dbo.BX_PackDetails where DONumber=@DONumber";
    let paramTypes={DONumber:'sql.VarChar(12)'};
    let paramValues={DONumber:DONumber};
    return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  }
  //get scanned items for packing
  exports.getScannedItemsWithWorkOrder=function(DONumber,SubconPO){
    // var stmt = "select * from dbo.BX_PackDetails where DONumber=@DONumber";
    var stmt = "select p.*,s.workorder from dbo.BX_PackDetails p,dbo.BX_SubconShipments s where p.DONumber=@DONumber and s.subConPo=@SubconPO and p.SerialNo =s.SerialNo";
    let paramTypes={DONumber:'sql.VarChar(12)',SubconPO:'sql.VarChar(30)'};
    let paramValues={DONumber:DONumber,SubconPO:SubconPO};
    return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  }
  //get PackHeader
  exports.getPackHeader=function(DONumber){
    var stmt = "select * from dbo.BX_PackHeader where DONumber=@DONumber";
    let paramTypes={DONumber:'sql.VarChar(12)'};
    let paramValues={DONumber:DONumber};
    return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  }
  //get PackHUnits
  exports.getPackHUnits=function(DONumber){
    var stmt = "select * from dbo.BX_PackHUnits where DONumber=@DONumber";
    let paramTypes={DONumber:'sql.VarChar(12)'};
    let paramValues={DONumber:DONumber};
    return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  }
  //get PackHUnits
  exports.getPackDetails=function(DONumber){
    var stmt = "select * from dbo.BX_PackDetails where DONumber=@DONumber";
    let paramTypes={DONumber:'sql.VarChar(12)'};
    let paramValues={DONumber:DONumber};
    return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  }

  
  exports.getHuAndPackDetails=function(DONumber){
    var params={
      DONumber:{type:"sql.VarChar(12)",value:DONumber}
    }
    return sqlSvc.callStoredProcedure("dbo.BX_GetHandlingUnitAndScannedItems",params)
  }

  exports.confirmPacking=function(DONumber,PackComplete){
    var stmt = "update dbo.BX_PackHeader Set PackComplete=Convert(datetime,@PackComplete),PackStatus=2,Push2SAPStatus='C' where DONumber=@DONumber";
    let paramTypes={DONumber:'sql.VarChar(12)',PackComplete:'sql.VarChar(10)'};
    let paramValues={DONumber:DONumber,PackComplete:PackComplete};
    return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  }

  exports.packingReversal=function(DONumber){
    var params={
      DONumber:{type:"sql.VarChar(12)",value:DONumber}
    }
    return sqlSvc.callStoredProcedure("dbo.BX_PackingReversal",params)
  }



