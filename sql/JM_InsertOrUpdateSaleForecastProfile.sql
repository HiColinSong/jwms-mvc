-- ================================================================  
-- Author:Colin  
-- Create date:25/12/2018  
-- Description:新增修改销售预测  
-- exec [JM_InsertOrUpdateSaleForecastProfile] -1,'2018-01-01','2018-02-01','263医院','支架系统','李明',3000.05,1000,'测试数据' ,'Colin' 
  
-- ================================================================  
ALTER PROCEDURE [dbo].[JM_InsertOrUpdateSaleForecastProfile]   
(  
 @FID int,  
 --@YearQuery int,   
 --@MonthQuery int,  
 @FDateFrom date,
 @FDateTo date,
 @FHospName nvarchar(50),  
 @ProductTypeName nvarchar(50),  
 @EmpName nvarchar(30),  
 @Aprice decimal(23, 10),  
 @Aamout decimal(23, 10),  
 @Fnote nvarchar(100),  
 @maintainerName nvarchar(50)  
)  
AS  
BEGIN  
 declare @FHospID int  
 declare @FHospNum nvarchar(255)  
 declare @ProductTypeID int  
 declare @EmpID int  
   
 select @FHospID = FItemID,@FHospNum = FNumber from t_Organization where (FNumber LIKE 'N%' OR FNumber LIKE 'S%') AND FName = @FHospName  
 select @ProductTypeID = FInterID from t_SubMessage where FTypeID = 10008 and FName = @ProductTypeName  
 select @EmpID = FItemID from t_Emp where FName = @EmpName  
  
IF (@FID != -1)  
	DELETE FROM t_BOSDocument WHERE ItemType = 3 And FID=@FID  --物理删除
--precondation
DELETE FROM t_BOSDocument WHERE ItemType = 3 And ProductTypeID=@ProductTypeID And FHospID=@FHospID And FEmpID=@EmpID And FDateFrom BETWEEN @FDateFrom AND @FDateTo  And FDateTo BETWEEN @FDateFrom AND @FDateTo

Declare @PreviousRangeDate1 Date=NULL
Declare @PreviousRangeDate2 Date=NULL
DECLARE @PreviousRangeID INT =NULL
Declare @LaterRangeDate1 Date=NULL
Declare @LaterRangeDate2 Date=NULL
DECLARE @LaterRangeID INT =NULL

Select  @PreviousRangeDate1=FDateFrom,@PreviousRangeDate2=FDateTo,@PreviousRangeID=FID	From t_BOSDocument Where ItemType = 3 And ProductTypeID=@ProductTypeID And FHospID=@FHospID And FEmpID=@EmpID And @FDateFrom>=FDateFrom And @FDateFrom<=FDateTo
Select  @LaterRangeDate1=FDateFrom,@LaterRangeDate2=FDateTo,@LaterRangeID=FID			From t_BOSDocument Where ItemType = 3 And ProductTypeID=@ProductTypeID And FHospID=@FHospID And FEmpID=@EmpID And @FDateTo>=FDateFrom And @FDateTo<=FDateTo


IF(@PreviousRangeDate1 IS NOT NULL )
BEGIN
	IF(@PreviousRangeDate1<@FDateFrom)	
	BEGIN
		UPDATE t_BOSDocument SET FDateTo=DATEADD(M,-1,@FDateFrom) WHERE FID=@PreviousRangeID
		IF (@PreviousRangeDate2>@FDateTo) 
		BEGIN	
			--分段了	
			declare @P11 int  exec GetICMaxNum 't_BOSDocument', @P11 output --select @FID = @P1   
			INSERT INTO dbo.t_BOSDocument(FID,FHospID,FHospNum,FHospName,ProductTypeID,ProductTypeName,FEmpID,FDateFrom,FDateTo,Aprice,Aamout,Fnote,ItemType,maintainerName,FDate)
			SELECT @P11,FHospID,FHospNum,FHospName,ProductTypeID,ProductTypeName,FEmpID,DATEADD(M,1,@FDateTo),@PreviousRangeDate2,Aprice,Aamout,Fnote,ItemType,maintainerName,FDate FROM t_BOSDocument WHERE FID=@PreviousRangeID
		END
	END
	ELSE 
		DELETE FROM t_BOSDocument WHERE FID=@PreviousRangeID
END

IF(@LaterRangeDate1 IS NOT NULL AND ( @PreviousRangeDate1 IS NULL OR( @PreviousRangeDate1 IS NOT NULL AND @PreviousRangeDate1<>@LaterRangeDate1)))
BEGIN
	IF(@LaterRangeDate2>@FDateTo)
		UPDATE t_BOSDocument SET FDateFrom=DATEADD(M,1,@FDateTo) WHERE  FID=@LaterRangeID
	ELSE
		DELETE FROM t_BOSDocument WHERE FID=@LaterRangeID	
END


  declare @P1 int  exec GetICMaxNum 't_BOSDocument', @P1 output select @FID = @P1   
  INSERT INTO dbo.t_BOSDocument(FID,FHospID,FHospNum,FHospName,ProductTypeID,ProductTypeName,FEmpID,FDateFrom,FDateTo,Aprice,Aamout,Fnote,ItemType,maintainerName,FDate)  
  VALUES (@P1,@FHospID,@FHospNum,@FHospName,@ProductTypeID,@ProductTypeName,@EmpID,@FDateFrom,@FDateTo,@Aprice,@Aamout,@Fnote,3,@maintainerName,GETDATE())  

    
 Select * from V_BOSDocument_SaleForecast --where year = @Year and month = @Month  
END  

