USE [JWMS_TEST]
GO
/****** Object:  StoredProcedure [dbo].[JM_InsertOrUpdatePromotionDiscountProfile]    Script Date: 29/12/2018 2:36:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- ================================================================
-- Author:szq
-- Create date:29/12/2018
-- Description:新增修改促销折扣
-- exec JM_InsertOrUpdatePromotionDiscountProfile 1,2018,8,'威海市立医院','支架系统'，11.11,22.22,'测试数据'
-- ================================================================
CREATE PROCEDURE [dbo].[JM_InsertOrUpdatePromotionDiscountProfile] 
(
	@FID int,
	@Year int, 
	@Month int,
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
	
	select @FHospID = FItemID,@FHospNum = FNumber from t_Organization where FNumber LIKE '%[ABCDEFGHIJKLMNOPQRSTUVWXYZ]%' and FName = @FHospName
	select @ProductTypeID = FInterID from t_SubMessage where FTypeID = 10008 and FName = @ProductTypeName

	IF (@FID != -1)
		BEGIN
			UPDATE dbo.t_BOSDocument 
				SET FHospID = @FHospID,
					FHospNum = @FHospNum,
					FHospName = @FHospName,
					ProductTypeID  = @ProductTypeID,
					ProductTypeName = @ProductTypeName,
					Year = @Year,
					Month  = @Month,
					Ssample = @Ssample,
					Fnote = @Fnote,
					ODActivity  = @ODActivity,
					maintainerName = @maintainerName,
					FDate = GETDATE()
			WHERE	FID = @FID
		END
	ELSE
		BEGIN
		declare @P1 int  exec GetICMaxNum 't_BOSDocument', @P1 output select @FID = @P1 
		INSERT INTO dbo.t_BOSDocument(FID,FHospID,FHospNum,FHospName,ProductTypeID,ProductTypeName,Year,Month,Ssample,ODActivity,Fnote,ItemType,maintainerName,FDate)
			VALUES (@FID,@FHospID,@FHospNum,@FHospName,@ProductTypeID,@ProductTypeName,@Year,@Month,@Ssample,@ODActivity,@Fnote,2,@maintainerName,GETDATE())
		END
		
	SELECT * FROM dbo.t_BOSDocument where ItemType =2 and year = @Year and month = @Month
END
