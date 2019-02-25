-- ================================================================  
-- Author:szq  
-- Create date:29/12/2018  
-- Description:新增修改商务价格  
-- exec JM_InsertOrUpdateBusinessPriceProfile 1,2018,8,'威海市立医院','安徽融合','支架系统'，11.11,22.22,33.33,44.44,55.55,66.66,'测试数据'  
-- ================================================================  
alter PROCEDURE [dbo].[JM_InsertOrUpdateBusinessPriceProfile]   
(  
 @FID int,  
 @FDateFrom date,
 @FDateTo date,  
 @FHospName nvarchar(50),  
 @DistributorName nvarchar(50),  
 @ProductTypeName nvarchar(50),  
 @CSPrice decimal(23, 10),  
 @BARebate decimal(23, 10),  
 @TTBoot decimal(23, 10),  
 @Spromotion decimal(23, 10),  
 @BTBGift decimal(23, 10),  
 @BNHDAward decimal(23, 10),  
 @Fnote nvarchar(100),  
 @maintainerName nvarchar(50)  
)  
AS  
BEGIN  
 declare @FHospID int  
 declare @FHospNum nvarchar(255)  
 declare @DistributorCode nvarchar(50)  
 declare @FCustID int  
 declare @ProductTypeID int  
   
 select @FHospID = FItemID,@FHospNum = FNumber from t_Organization where FNumber LIKE '%[ABCDEFGHIJKLMNOPQRSTUVWXYZ]%' and FName = @FHospName  
 select @FCustID = FItemID,@DistributorCode = FNumber from t_Organization where FNumber not LIKE '%[ABCDEFGHIJKLMNOPQRSTUVWXYZ]%' and FName = @DistributorName  
 select @ProductTypeID = FInterID from t_SubMessage where FTypeID = 10008 and FName = @ProductTypeName  
  
IF (@FID != -1)  
	DELETE FROM t_BOSDocument WHERE ItemType = 1 And FID=@FID  --物理删除
--precondation
DELETE FROM t_BOSDocument WHERE ItemType = 1 And ProductTypeID=@ProductTypeID And FHospID=@FHospID And FCustID=@FCustID And FDateFrom BETWEEN @FDateFrom AND @FDateTo  And FDateTo BETWEEN @FDateFrom AND @FDateTo

Declare @PreviousRangeDate1 Date=NULL
Declare @PreviousRangeDate2 Date=NULL
DECLARE @PreviousRangeID INT =NULL
Declare @LaterRangeDate1 Date=NULL
Declare @LaterRangeDate2 Date=NULL
DECLARE @LaterRangeID INT =NULL

Select  @PreviousRangeDate1=FDateFrom,@PreviousRangeDate2=FDateTo,@PreviousRangeID=FID	From t_BOSDocument Where ItemType = 1 And ProductTypeID=@ProductTypeID And FHospID=@FHospID And FCustID=@FCustID And @FDateFrom>=FDateFrom And @FDateFrom<=FDateTo
Select  @LaterRangeDate1=FDateFrom,@LaterRangeDate2=FDateTo,@LaterRangeID=FID			From t_BOSDocument Where ItemType = 1 And ProductTypeID=@ProductTypeID And FHospID=@FHospID And FCustID=@FCustID And @FDateTo>=FDateFrom And @FDateTo<=FDateTo

IF(@PreviousRangeDate1 IS NOT NULL )
BEGIN
	IF(@PreviousRangeDate1<@FDateFrom)	
	BEGIN
		UPDATE t_BOSDocument SET FDateTo=DATEADD(M,-1,@FDateFrom) WHERE FID=@PreviousRangeID
		IF (@PreviousRangeDate2>@FDateTo) 
		BEGIN	
			--分段了	
			declare @P11 int  exec GetICMaxNum 't_BOSDocument', @P11 output --select @FID = @P1   			
			INSERT INTO dbo.t_BOSDocument(FID,FHospID,FHospNum,FHospName,FCustID,DistributorCode,DistributorName,ProductTypeID,ProductTypeName,FDateFrom,FDateTo,CSPrice,BARebate,TTBoot,Spromotion,BTBGift,Fnote,BNHDAward,ItemType,maintainerName,FDate)  
			SELECT @P11,FHospID,FHospNum,FHospName,FCustID,DistributorCode,DistributorName,ProductTypeID,ProductTypeName,DATEADD(M,1,@FDateTo),@PreviousRangeDate2,CSPrice,BARebate,TTBoot,Spromotion,BTBGift,Fnote,BNHDAward,ItemType,maintainerName,FDate  FROM t_BOSDocument WHERE FID=@PreviousRangeID
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
  INSERT INTO dbo.t_BOSDocument(FID,FHospID,FHospNum,FHospName,FCustID,DistributorCode,DistributorName,ProductTypeID,ProductTypeName,FDateFrom,FDateTo,CSPrice,BARebate,TTBoot,Spromotion,BTBGift,Fnote,BNHDAward,ItemType,maintainerName,FDate)  
   VALUES (@FID,@FHospID,@FHospNum,@FHospName,@FCustID,@DistributorCode,@DistributorName,@ProductTypeID,@ProductTypeName,@FDateFrom,@FDateTo,@CSPrice,@BARebate,@TTBoot,@Spromotion,@BTBGift,@Fnote,@BNHDAward,1,@maintainerName,GETDATE())  
    
 SELECT * FROM dbo.t_BOSDocument where ItemType =1   
END  