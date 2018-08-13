USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_GetPrepackHandlingUnitAndScannedItems]    Script Date: 8/14/2018 1:44:13 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Ya Dong Zhu
-- Create date: 28 Apr,2018
-- Description:	return two sets of record
-- =============================================
ALTER PROCEDURE [dbo].[BX_GetPrepackHandlingUnitAndScannedItems] 
	-- Add the parameters for the stored procedure here
	@qsNo varchar(22)
AS
BEGIN
    select * from dbo.BX_QuarShpt_PrepackHUnits where qsNo=@qsNo

	select s.SerialNo,s.workorder,s.HUNumber,s.FullScanCode,w.batchno,w.Itemcode 
    from dbo.BX_SubconShipments s,dbo.WorkOrders w
    where s.workorder=w.Project and  qsNO=@qsNo
END

