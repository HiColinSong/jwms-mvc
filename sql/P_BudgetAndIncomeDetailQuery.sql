--exec P_BudgetAndIncomeDetailQuery '2017','12'  ,'支架系统',''  
--2019/1/6    
--Colin     
ALTER PROC P_BudgetAndIncomeDetailQuery(    
@Year int =2017,    
@Month int=12 ,
@LB VARCHAR(50)='',
@HospName varchar(80)=''
)    
As    
SET NOCOUNT ON
SELECT          
top 20                                      
t1.FEmpID As FSalerID ,T2.FName AS FSalerName,                               
0 As FMgrID,'' AS FMgrName,                                            
--医院 Info                                            
t1.FHospID,                                            
T4.FNumber AS FHospNum,                                            
 CAse when LEN(T4.FNumber)=10 then LEFT(T4.FNumber,9) Else T4.FNumber End FHospNumOk,                                                
 CAse when charindex('-',T4.FName)<>0  then LEFT(T4.FName,charindex('-',T4.FName)-1) Else T4.FName End FHospNameOk ,                                               
 ISNULL(Prov.FName,ISNULL(t4.FProvince,'')) AS FProvince,                                          
ISNULL(City.FName,isnull(t4.FCity ,''))AS FCity,                           
ISNULL(HospLev.FName,isnull(t4.F_113 ,''))AS FHospLevelName,                                          
--客户 Info                                            
 t1.FCustID ,                                            
 T3.FNumber AS FCustNum,                                             
 ISNULL(t5.FName,t3.FName) AS FCustNameOk,                                              
 Left(ISNULL(t5.FName,t3.FName),6)  AS FCustNameShort ,                                            
 t1.FAreaID,Area.FName AS FAreaName,                       
 t1.FBigAreaID,BigArea.FName AS FBigAreaName,                     
 ''  As FBigAreaMgr,                    
 ''  As FDirector,               
 t1.FswEmpID ,    swEmp.FName As FswEmpName,                                                                    
 t1.FQty  As ActSaleQty,  
--Business Price  
Bprice.CSPrice,Bprice.BARebate,Bprice.TTBoot,  
Bprice.CSPrice+Bprice.BARebate+Bprice.TTBoot As CSTotalPrice1 ,  
--Discount Price  
Dprice.Spromotion, Bprice.CSPrice+Bprice.BARebate+Bprice.TTBoot -Dprice.Spromotion    As STotalPrice1,  
Dprice.BTBGift ,Dprice.BNHDAward ,Dprice.Ssample ,Dprice.ODActivity, --Rates  
(Bprice.CSPrice+Bprice.BARebate+Bprice.TTBoot -Dprice.Spromotion) * Dprice.BTBGift * Dprice.BNHDAward * Dprice.Ssample  * Dprice.ODActivity  As ActTotalPrice,  
 --Forecast Price&Qty  
(Bprice.CSPrice+Bprice.BARebate+Bprice.TTBoot -Dprice.Spromotion) * Dprice.BTBGift * Dprice.BNHDAward * Dprice.Ssample  * Dprice.ODActivity * t1.FQty As ActTotalIncome,  
--Acutal Income  
Fprice.Aprice, Fprice.Aamout, Fprice.Aprice*Fprice.Aamout AS ATotalIncome  
from t_JWsaleEntry t1   
Inner Join t_JWsale jwSale On  t1.FID=jwSale.FID  
Left JOIN t_Emp T2 ON T1.FEmpID=T2.FItemID                                            
Left JOIN t_Organization T3 ON T3.FItemID=T1.FCustID                                            
Left JOIN t_Organization T4 ON T1.FHospID=T4.FItemID                                            
Left Join a_Cust t5 On t1.FCustID=t5.FCustID And t5.FDef=1                                            
Left Join t_SubMessage Area On T1.FAreaID=Area.FInterID                                      
Left Join t_SubMessage BigArea On T1.FBigAreaID=BigArea.FInterID                      
Left join CN_ProvinceCity prov On t4.FProvinceID= Prov.FID                                    
Left Join CN_ProvinceCity City On t4.FCityID=City.FID                          
Left Join t_Emp swEmp On swEmp.FItemID=t1.FswEmpID              
Left Join t_submessage HospLev on t4.F_113=HospLev.FInterID and HospLev.FParentID=10003    

Inner Join t_SubMessage LB On LB.FParentID=10008 And jwSale.FLB=LB.FInterID
  
Left Join t_BOSDocument BPrice On BPrice.ItemType=1 And t1.FHospID=BPrice.FHospID And t1.FCustID=BPrice.FCustID And jwSale.FLB=BPrice.ProductTypeID And jwSale.FYear=BPrice.Year And jwSale.FMonth=BPrice.Month  
Left Join t_BOSDocument DPrice On DPrice.ItemType=2 And t1.FHospID=DPrice.FHospID  And jwSale.FLB=DPrice.ProductTypeID And jwSale.FYear=DPrice.Year And jwSale.FMonth=DPrice.Month  
Left Join t_BOSDocument FPrice On FPrice.ItemType=3 And t1.FHospID=FPrice.FHospID  And jwSale.FLB=FPrice.ProductTypeID And t1.FEmpID=FPrice.FEmpID And jwSale.FYear=FPrice.Year And jwSale.FMonth=FPrice.Month  
Where jwSale.FYear=@Year And jwSale.FMonth=@Month And jwSale.FVersion='终稿版' 
And (LB.FName=@LB  OR @LB='')
and (T4.FName=@HospName OR @HospName='') 
   
   
   
SET NOCOUNT OFF
   
   
   