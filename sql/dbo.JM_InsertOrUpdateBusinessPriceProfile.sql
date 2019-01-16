USE [JWMS_TEST]
GO
/****** Object:  StoredProcedure [dbo].[JM_InsertOrUpdateBusinessPriceProfile]    Script Date: 29/12/2018 2:36:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- ================================================================
-- Author:szq
-- Create date:29/12/2018
-- Description:新增修改商务价格
-- exec JM_InsertOrUpdateBusinessPriceProfile 1,2018,8,'威海市立医院','安徽融合','支架系统'，11.11,22.22,33.33,44.44,55.55,66.66,'测试数据'
-- ================================================================
CREATE PROCEDURE [dbo].[JM_InsertOrUpdateBusinessPriceProfile] 
(
	@FID int,
	@Year int, 
	@Month int,
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
		BEGIN
			UPDATE dbo.t_BOSDocument 
				SET FHospID = @FHospID,
					FHospNum = @FHospNum,
					FHospName = @FHospName,
					FCustID  = @FCustID,
					DistributorCode = @DistributorCode,
					DistributorName = @DistributorName,
					ProductTypeID  = @ProductTypeID,
					ProductTypeName = @ProductTypeName,
					Year = @Year,
					Month  = @Month,
					CSPrice = @CSPrice,
					BARebate = @BARebate,
					TTBoot  = @TTBoot,
					Spromotion = @Spromotion,
					BTBGift = @BTBGift,
					Fnote = @Fnote,
					BNHDAward  = @BNHDAward,
					maintainerName = @maintainerName,
					FDate = GETDATE()
			WHERE	FID = @FID
		END
	ELSE
		BEGIN
		declare @P1 int  exec GetICMaxNum 't_BOSDocument', @P1 output select @FID = @P1 
		INSERT INTO dbo.t_BOSDocument(FID,FHospID,FHospNum,FHospName,FCustID,DistributorCode,DistributorName,ProductTypeID,ProductTypeName,Year,Month,CSPrice,BARebate,TTBoot,Spromotion,BTBGift,Fnote,BNHDAward,ItemType,maintainerName,FDate)
			VALUES (@FID,@FHospID,@FHospNum,@FHospName,@FCustID,@DistributorCode,@DistributorName,@ProductTypeID,@ProductTypeName,@Year,@Month,@CSPrice,@BARebate,@TTBoot,@Spromotion,@BTBGift,@Fnote,@BNHDAward,1,@maintainerName,GETDATE())
		END
	SELECT * FROM dbo.t_BOSDocument where ItemType =1 and year = @Year and month = @Month
END
