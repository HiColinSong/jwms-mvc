
CREATE VIEW dbo.V_BOSDocument_SaleForecast  
AS  
SELECT     t1.FID, t1.FClassTypeID, t1.FHospNum, t1.FHospName, t1.FHospID, t1.FCustID, t1.DistributorCode, t1.DistributorName, t1.ProductTypeID, t1.ProductTypeName, 
--t1.Year, t1.Month,
 t1.FDateFrom,t1.FDateTo,
 t1.CSPrice,  t1.BARebate, t1.TTBoot, t1.Spromotion, t1.FDecimal4, t1.BTBGift, t1.BNHDAward, t1.Ssample, t1.ODActivity, t1.Aprice, t1.Aamout, t1.Fnote, t1.FEmpID, t1.FDate, t1.ApproverID, t1.ApproveDate,   
                      t1.ItemType, t1.maintainerId, t1.maintainerName, emp.FName AS FEmpName  
FROM         dbo.t_BOSDocument AS t1 INNER JOIN  
                      dbo.t_Emp AS emp ON t1.FEmpID = emp.FItemID  
WHERE     (t1.ItemType = 3)  