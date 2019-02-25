/*  
Auth: Colin  
Create:2019/1/23  
用于绑定区分多个经销商的医院客户信息  
2019/2/25 改为时间段的 Colin
*/  
Alter View V_BOSDocument_HospOk  
As  
select t3.FYear As FYearOk,t3.FMonth As FMonthOk,t1.*,  
CAse when LEN(t2.FNumber)=10 then LEFT(t2.FNumber,9) Else t2.FNumber End FHospNumOk,  
CAse when charindex('-',t2.FName)<>0  then LEFT(t2.FName,charindex('-',t2.FName)-1) Else t2.FName End FHospNameOk   
From t_BOSDocument t1   
INNER JOIN V_Hospitals t2 On t1.FHospID=t2.FItemID  
INNER JOIN A_YearMonthDay T3 On t3.FDateFrom Between t1.FDateFrom And t1.FDateTo

select * from V_BOSDocument_HospOk where FYearOk=2019 and FMonthOk=1 