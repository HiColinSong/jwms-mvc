--exec P_BudgetAndIncomeDetailQuery '2019','1'  ,'支架系统','平顶山152医院-汇达通合'      
--exec P_BudgetAndIncomeDetailQuery '2019','1'  ,'支架系统',''     
/*    
Auth: Colin         
Create：2019/1/6        
2019/2/25 modify: 价格由折扣比例还未实际扣减值；由于具体年月改为时间段

*/    
alter PROC P_BudgetAndIncomeDetailQuery(        
@Year int ,        
@Month int ,    
@LB VARCHAR(50)='',    
@HospName varchar(80)=''    
)        
As        
SET NOCOUNT ON    
if @Year <>2019    
 Set @Year=2019    
SELECT              
--top 300                                          
t1.FEmpID As FSalerID ,T2.FName AS FSalerName,                                   
0 As FMgrID,mgr.FName AS FMgrName,    
LB.FName AS  ProductTypeName,                         
--医院 Info                                                
t1.FHospID,                                                
HospOk.FHospNum, HospOk.FHospNumOk,     
HospOk.FHospName,HospOk.FHospNameOk ,    
HospOk.FProvince, HospOk.FCity,HospOk.FHospLevelName,    
--客户 Info                                                
 t1.FCustID ,                                                
 T3.FNumber AS FCustNum,                                                 
 ISNULL(t5.FName,t3.FName) AS FCustNameOk,                                                  
 Left(ISNULL(t5.FName,t3.FName),6)  AS FCustNameShort ,                                                
 t1.FAreaID,Area.FName AS FAreaName,                           
 t1.FBigAreaID,BigArea.FName AS FBigAreaName,                         
  BigAreaEmp.FName  As FBigAreaMgr,                        
 ''  As FDirector,                   
 t1.FswEmpID ,    swEmp.FName As FswEmpName,                                                                        
 t1.FQty  As ActSaleQty,      
--Business Price      
Bprice.CSPrice,Bprice.BARebate,Bprice.TTBoot,      
Bprice.CSPrice+Bprice.BARebate+Bprice.TTBoot As CSTotalPrice1 ,      
Bprice.Spromotion    
--Discount Price      
/*    
2019-01-22    
Dprice.Spromotion ---这个字段的维护放到上面商务价格里了，应该在促销中维护    
*/    
, Bprice.CSPrice+Bprice.BARebate+Bprice.TTBoot +Bprice.Spromotion  As STotalPrice1,      
Bprice.BTBGift ,Bprice.BNHDAward ,Dprice.Ssample ,Dprice.ODActivity, --Rates      
(Bprice.CSPrice+Bprice.BARebate+Bprice.TTBoot +Bprice.Spromotion) + Bprice.BTBGift + Bprice.BNHDAward + Dprice.Ssample  + Dprice.ODActivity  As ActTotalPrice,      
 --Forecast Price&Qty      
((Bprice.CSPrice+Bprice.BARebate+Bprice.TTBoot +Bprice.Spromotion) + Bprice.BTBGift + Bprice.BNHDAward + Dprice.Ssample  + Dprice.ODActivity )* t1.FQty As ActTotalIncome,      
--Acutal Income      
Fprice.Aprice, Fprice.Aamout, Fprice.Aprice*Fprice.Aamout AS ATotalIncome      
from t_JWsaleEntry t1       
Inner Join t_JWsale jwSale On  t1.FID=jwSale.FID      
Left JOIN t_Emp T2 ON T1.FEmpID=T2.FItemID                                                
Left JOIN t_Organization T3 ON T3.FItemID=T1.FCustID                                                
Inner JOIN     
(    
 select t2.FItemID, t2.Fnumber FHospNum,t2.FName AS FHospName,T2.FProvince,T2.FCity,T2.FHospLevelName,    
 CAse when LEN(t2.FNumber)=10 then LEFT(t2.FNumber,9) Else t2.FNumber End FHospNumOk,    
 CAse when charindex('-',t2.FName)<>0  then LEFT(t2.FName,charindex('-',t2.FName)-1) Else t2.FName End FHospNameOk     
 From V_Hospitals t2     
) HospOk   ON T1.FHospID=HospOk.FItemID                                                
Left Join a_Cust t5 On t1.FCustID=t5.FCustID And t5.FDef=1                                                
Left Join t_SubMessage Area On T1.FAreaID=Area.FInterID                                          
Left Join t_SubMessage BigArea On T1.FBigAreaID=BigArea.FInterID                                           
Left Join t_Emp swEmp On swEmp.FItemID=t1.FswEmpID                  
Inner Join t_SubMessage LB On LB.FParentID=10008 And jwSale.FLB=LB.FInterID    
    
Left Join                                      
( --各个区域、在职区域经理表（不包括南北中国区）                                      
 Select  t1.Fgw FAreaID,MAX(t2.FEmp2) As FMgrID                                      
 From a_qygl t1                                      
 Left Join a_qyglEntryJL t2 On t1.FID=t2.FID And t2.FOnDuty=1        
 Group By t1.Fgw                                      
) AreaMgr On AreaMgr.FAreaID=t1.FAreaID                         
Left Join t_Emp Mgr on Mgr.FItemID =AreaMgr.FMgrID                         
Left Join                      
(                      
 Select  t1.FnbqGw FBigAreaID,MAX(t2.FEmp2) As FBigAreaMgrID                                      
  From t_Nbqgl t1                                      
  Left Join t_NbqglEntryNB t2 On t1.FID=t2.FID And t2.FOnDuty=1                          
  Where t1.FgwType='2' --大区经理                                   
  Group By t1.FnbqGw                        
) BigAreaMgr On BigAreaMgr.FBigAreaID=t1.FBigAreaID     
Left Join t_Emp BigAreaEmp on BigAreaEmp.FItemID =BigAreaMgr.FBigAreaMgrID       
    
Left Join V_BOSDocument_HospOk BPrice On BPrice.ItemType=1 And HospOk.FHospNumOk=BPrice.FHospNumOk And t1.FCustID=BPrice.FCustID And jwSale.FLB=BPrice.ProductTypeID And jwSale.FYear=BPrice.FYearOk And jwSale.FMonth=BPrice.FMonthOk      
Left Join V_BOSDocument_HospOk DPrice On DPrice.ItemType=2 And HospOk.FHospNumOk=DPrice.FHospNumOk  And jwSale.FLB=DPrice.ProductTypeID And jwSale.FYear=DPrice.FYearOk And jwSale.FMonth=DPrice.FMonthOk      
Left Join V_BOSDocument_HospOk FPrice On FPrice.ItemType=3 And HospOk.FHospNumOk=FPrice.FHospNumOk  And jwSale.FLB=FPrice.ProductTypeID And t1.FEmpID=FPrice.FEmpID And jwSale.FYear=FPrice.FYearOk And jwSale.FMonth=FPrice.FMonthOk      
Where jwSale.FYear=@Year And jwSale.FMonth=@Month And jwSale.FVersion='终稿版'     
And (LB.FName=@LB  OR @LB='')    
and (HospOk.FHospName=@HospName OR HospOk.FHospNameOk=@HospName OR @HospName='')     
       
       
       
SET NOCOUNT OFF    
       