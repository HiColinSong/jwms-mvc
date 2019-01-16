-- ================================================================
-- Author:Colin
-- Create date:25/12/2018
-- Description:新增修改销售预测
-- exec [JM_InsertOrUpdateSaleForecastProfile] 1,2018,12,'威海市立医院','支架系统',3000.05,1000,'测试数据'

-- ================================================================
ALTER PROCEDURE [dbo].[JM_InsertOrUpdateSaleForecastProfile] 
(
	@FID int,
	@Year int, 
	@Month int,
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
		BEGIN
			UPDATE dbo.t_BOSDocument 
				SET FHospID = @FHospID,
					FHospNum = @FHospNum,
					FHospName = @FHospName,
					ProductTypeID  = @ProductTypeID,
					ProductTypeName = @ProductTypeName,
					FEmpID=@EmpID,
					Year = @Year,
					Month  = @Month,
					Aprice = @Aprice,
					Fnote = @Fnote,
					Aamout  = @Aamout,
					maintainerName = @maintainerName,
					FDate = GETDATE()
			WHERE	FID = @FID
		END
	ELSE
		BEGIN
		declare @P1 int  exec GetICMaxNum 't_BOSDocument', @P1 output select @FID = @P1 
		INSERT INTO dbo.t_BOSDocument(FID,FHospID,FHospNum,FHospName,ProductTypeID,ProductTypeName,FEmpID,Year,Month,Aprice,Aamout,Fnote,ItemType,maintainerName,FDate)
			VALUES (@P1,@FHospID,@FHospNum,@FHospName,@ProductTypeID,@ProductTypeName,@EmpID,@Year,@Month,@Aprice,@Aamout,@Fnote,3,@maintainerName,GETDATE())
		--INSERT INTO dbo.t_BOSDocument(FID,
		--			FClassTypeID,FCustID,DistributorCode,DistributorName,CSPrice,BARebate,TTBoot
		--			,[Spromotion]
		--		  ,[FDecimal4]
		--		  ,[BTBGift]
		--		  ,[BNHDAward]
		--		  ,[Ssample]
		--		  ,[ODActivity],FEmpID,ApproverID,
		--	FHospID,FHospNum,FHospName,ProductTypeID,ProductTypeName,Year,Month,Aprice,Aamout,Fnote,ItemType)
		--	VALUES (@P1,
		--			1,1,1,'',1,1,1,1,1,1,1,1,1,1,1,
		--	@FHospID,@FHospNum,@FHospName,@ProductTypeID,@ProductTypeName,@Year,@Month,@Aprice,@Aamout,@Fnote,3)
		END
		
	--SELECT * FROM dbo.t_BOSDocument where ItemType =3
	select * from V_BOSDocument_SaleForecast where year = @Year and month = @Month
END
