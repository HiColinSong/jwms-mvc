USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[SpGetSubconReceiptsSerialsBySubconOrder]    Script Date: 8/18/2018 12:14:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Ya Dong Zhu>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SpGetSubconReceiptsSerialsBySubconOrder]
		@sShip2Target	Varchar(3),   -- SGW - BIT Warehouse, CHW - BESA Warehouse, SGQ - BIT QA
		@sSubCOnPORefNo	Varchar(20)
AS
BEGIN

	SET NOCOUNT ON;
			
	Select WorkOrder, FullScanCode, SerialNo, CreatedBy, CreatedOn, StatusID
	--Select * 
	from   BX_SubconShipments
	where	(StatusID = 5 OR StatusID = 6)
			AND ShipToTarget = @sShip2Target 
			AND subConPo = @sSubCOnPORefNo

END


