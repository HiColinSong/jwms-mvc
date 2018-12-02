'use strict';

const sqlSvc=require("./sqlService");

  
  exports.getPerformanceReporterList=function(param){
    //dummy code
    let SFE_ImplantData=require("./../config/SFE_ImplantData.json");
    let salesPromotionData=require("./../config/salesPromotionData.json");
    let businessPrice=require("./../config/businessPrice.json");
    return {SFE_ImplantData:SFE_ImplantData,salesPromotionData:salesPromotionData,businessPrice:businessPrice,}
  }
  


