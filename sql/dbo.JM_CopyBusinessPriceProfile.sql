USE [JWMS_TEST]
GO
/****** Object:  StoredProcedure [dbo].[JM_CopyBusinessPriceProfile]    Script Date: 01/18/2019 08:54:38 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- ================================================================
-- Author:szq
-- Create date:17/01/2019
-- Description:复制商务价格
-- exec JM_CopyBusinessPriceProfile '支架系统',2018,12,2019,1
-- ================================================================
CREATE PROCEDURE [dbo].[JM_CopyBusinessPriceProfile] 
(
	@ProductTypeName nvarchar(50),
	@year int, 
	@month int,
	@yearTarget int, 
	@monthTarget int,
	@maintainerName nvarchar(50)
)
AS
BEGIN 
	declare @FID int
	declare @FHospID int
	declare @FHospNum nvarchar(255)
	declare @FHospName nvarchar(50)
	declare @FCustID int
	declare @DistributorCode nvarchar(50)
	declare @DistributorName nvarchar(50)
	declare @ProductTypeID int
	declare @CSPrice decimal(23, 10)
	declare @BARebate decimal(23, 10)
	declare @TTBoot decimal(23, 10)
	declare @Spromotion decimal(23, 10)
	declare @BTBGift decimal(23, 10)
	declare @BNHDAward decimal(23, 10)
	declare @Fnote nvarchar(100)
	declare @ItemType int
	
	DELETE FROM dbo.t_BOSDocument WHERE ItemType =1 and year = @yearTarget and month = @monthTarget AND ProductTypeName = @ProductTypeName
	  
	declare CUR_BUSINESSPRICE CURSOR
	FOR
	SELECT FHospID,FHospNum,FHospName,FCustID,DistributorCode,DistributorName,ProductTypeID,CSPrice,BARebate,TTBoot,Spromotion,BTBGift,Fnote,BNHDAward,ItemType FROM dbo.t_BOSDocument 
	where ItemType =1 and ProductTypeName = @ProductTypeName and Year = @year and Month = @month 
	
	open CUR_BUSINESSPRICE
	fetch next from CUR_BUSINESSPRICE into @FHospID,@FHospNum,@FHospName,@FCustID,@DistributorCode,@DistributorName,@ProductTypeID,@CSPrice,@BARebate,@TTBoot,@Spromotion,@BTBGift,@Fnote,@BNHDAward,@ItemType
		while @@fetch_status =0
			begin
				declare @P1 int  exec GetICMaxNum 't_BOSDocument', @P1 output select @FID = @P1 
				INSERT INTO dbo.t_BOSDocument(FID,FHospID,FHospNum,FHospName,FCustID,DistributorCode,DistributorName,ProductTypeID,ProductTypeName,Year,Month,CSPrice,BARebate,TTBoot,Spromotion,BTBGift,Fnote,BNHDAward,ItemType,maintainerName,FDate)
				VALUES (@FID,@FHospID,@FHospNum,@FHospName,@FCustID,@DistributorCode,@DistributorName,@ProductTypeID,@ProductTypeName,@yearTarget,@monthTarget,@CSPrice,@BARebate,@TTBoot,@Spromotion,@BTBGift,@Fnote,@BNHDAward,1,@maintainerName,GETDATE())
				fetch next from CUR_BUSINESSPRICE into @FHospID,@FHospNum,@FHospName,@FCustID,@DistributorCode,@DistributorName,@ProductTypeID,@CSPrice,@BARebate,@TTBoot,@Spromotion,@BTBGift,@Fnote,@BNHDAward,@ItemType
			END 
	close CUR_BUSINESSPRICE
	deallocate CUR_BUSINESSPRICE
	
		
	SELECT * FROM dbo.t_BOSDocument where ItemType =1 and year = @yearTarget and month = @monthTarget AND ProductTypeName = @ProductTypeName
END
