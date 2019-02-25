-- ================================================================  
-- Author:szq  
-- Create date:29/12/2018  
-- Description:新增修改促销折扣  
-- exec JM_InsertOrUpdatePromotionDiscountProfile 1,2018,8,'威海市立医院','支架系统'，11.11,22.22,'测试数据'  
-- ================================================================  
alter PROCEDURE [dbo].[JM_InsertOrUpdatePromotionDiscountProfile]   
(  
 @FID int,  
 --@Year int,   
 --@Month int,  
  @FDateFrom date,
 @FDateTo date,
 @FHospName nvarchar(50),  
 @ProductTypeName nvarchar(50),  
 @Ssample decimal(23, 10),  
 @ODActivity decimal(23, 10),  
 @Fnote nvarchar(100),  
 @maintainerName nvarchar(50)  
)  
AS  
BEGIN  
 declare @FHospID int  
 declare @FHospNum nvarchar(255)  
 declare @ProductTypeID int  
   
 select @FHospID = FItemID,@FHospNum = FNumber from t_Organization where (FNumber LIKE 'N%' OR FNumber LIKE 'S%') AND FName = @FHospName  
 select @ProductTypeID = FInterID from t_SubMessage where FTypeID = 10008 and FName = @ProductTypeName  
  
IF (@FID != -1)  
	DELETE FROM t_BOSDocument WHERE ItemType = 2 And FID=@FID  --物理删除
--precondation
DELETE FROM t_BOSDocument WHERE ItemType = 2 And ProductTypeID=@ProductTypeID And FHospID=@FHospID And FDateFrom BETWEEN @FDateFrom AND @FDateTo  And FDateTo BETWEEN @FDateFrom AND @FDateTo

Declare @PreviousRangeDate1 Date=NULL
Declare @PreviousRangeDate2 Date=NULL
DECLARE @PreviousRangeID INT =NULL
Declare @LaterRangeDate1 Date=NULL
Declare @LaterRangeDate2 Date=NULL
DECLARE @LaterRangeID INT =NULL

Select  @PreviousRangeDate1=FDateFrom,@PreviousRangeDate2=FDateTo,@PreviousRangeID=FID	From t_BOSDocument Where ItemType = 2 And ProductTypeID=@ProductTypeID And FHospID=@FHospID  And @FDateFrom>=FDateFrom And @FDateFrom<=FDateTo
Select  @LaterRangeDate1=FDateFrom,@LaterRangeDate2=FDateTo,@LaterRangeID=FID			From t_BOSDocument Where ItemType = 2 And ProductTypeID=@ProductTypeID And FHospID=@FHospID  And @FDateTo>=FDateFrom And @FDateTo<=FDateTo

IF(@PreviousRangeDate1 IS NOT NULL )
BEGIN
	IF(@PreviousRangeDate1<@FDateFrom)	
	BEGIN
		UPDATE t_BOSDocument SET FDateTo=DATEADD(M,-1,@FDateFrom) WHERE FID=@PreviousRangeID
		IF (@PreviousRangeDate2>@FDateTo) 
		BEGIN	
			--分段了	
			declare @P11 int  exec GetICMaxNum 't_BOSDocument', @P11 output --select @FID = @P1   
			INSERT INTO dbo.t_BOSDocument(FID,FHospID,FHospNum,FHospName,ProductTypeID,ProductTypeName,FDateFrom,FDateTo,Ssample,ODActivity,Fnote,ItemType,maintainerName,FDate)			
			SELECT @P11,FHospID,FHospNum,FHospName,ProductTypeID,ProductTypeName,DATEADD(M,1,@FDateTo),@PreviousRangeDate2,Ssample,ODActivity,Fnote,ItemType,maintainerName,FDate FROM t_BOSDocument WHERE FID=@PreviousRangeID
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
INSERT INTO dbo.t_BOSDocument(FID,FHospID,FHospNum,FHospName,ProductTypeID,ProductTypeName,FDateFrom,FDateTo,Ssample,ODActivity,Fnote,ItemType,maintainerName,FDate)  
   VALUES (@FID,@FHospID,@FHospNum,@FHospName,@ProductTypeID,@ProductTypeName,@FDateFrom,@FDateTo,@Ssample,@ODActivity,@Fnote,2,@maintainerName,GETDATE()) 
   
 Select * from t_BOSDocument WHERE ItemType = 2 
  
END  