USE [JWMS_TEST]
GO
/****** Object:  StoredProcedure [dbo].[JM_CopySaleForecastProfile]    Script Date: 01/21/2019 08:54:38 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- ================================================================
-- Author:szq
-- Create date:21/01/2019
-- Description:复制促销折扣
-- exec JM_CopySaleForecastProfile '支架系统',2018,12,2019,1
-- ================================================================
CREATE PROCEDURE [dbo].[JM_CopySaleForecastProfile] 
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
	declare @FEmpID int
	declare @FHospNum nvarchar(255)
	declare @FHospName nvarchar(50)
	declare @ProductTypeID int
	declare @Aprice decimal(23, 10)
	declare @Aamout decimal(23, 10)
	declare @Fnote nvarchar(100)
	declare @ItemType int
	
	DELETE FROM dbo.t_BOSDocument WHERE ItemType =3 and year = @yearTarget and month = @monthTarget AND ProductTypeName = @ProductTypeName
	  
	declare CUR_BUSINESSPRICE CURSOR
	FOR
	SELECT FHospID,FHospNum,FHospName,FEmpID,ProductTypeID,Aprice,Aamout,Fnote,ItemType FROM dbo.t_BOSDocument 
	where ItemType =3 and ProductTypeName = @ProductTypeName and Year = @year and Month = @month 
	
	open CUR_BUSINESSPRICE
	fetch next from CUR_BUSINESSPRICE into @FHospID,@FHospNum,@FHospName,@FEmpID,@ProductTypeID,@Aprice,@Aamout,@Fnote,@ItemType
		while @@fetch_status =0
			begin
				declare @P1 int  exec GetICMaxNum 't_BOSDocument', @P1 output select @FID = @P1 
				INSERT INTO dbo.t_BOSDocument(FID,FHospID,FHospNum,FHospName,FEmpID,ProductTypeID,ProductTypeName,Year,Month,Aprice,Aamout,Fnote,ItemType,maintainerName,FDate)
				VALUES (@FID,@FHospID,@FHospNum,@FHospName,@FEmpID,@ProductTypeID,@ProductTypeName,@yearTarget,@monthTarget,@Aprice,@Aamout,@Fnote,3,@maintainerName,GETDATE())
				fetch next from CUR_BUSINESSPRICE into @FHospID,@FHospNum,@FHospName,@FEmpID,@ProductTypeID,@Aprice,@Aamout,@Fnote,@ItemType
			END 
	close CUR_BUSINESSPRICE
	deallocate CUR_BUSINESSPRICE
	
		
	SELECT * FROM dbo.t_BOSDocument where ItemType =2 and year = @yearTarget and month = @monthTarget AND ProductTypeName = @ProductTypeName
END
