USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[SpGetPendingReceiptsSerialsBySubconOrder]    Script Date: 17-Jul-18 5:13:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
ALTER PROCEDURE [dbo].[SpGetPendingReceiptsSerialsBySubconOrder]
		@sShip2Target	Varchar(3),   -- SGW - BIT Warehouse, CHW - BESA Warehouse, SGQ - BIT QA
		@sSubCOnPORefNo	Varchar(20)
AS
BEGIN

	SET NOCOUNT ON;
			
	Select WorkOrder, FullScanCode, SerialNo, CreatedBy, CreatedOn 
	--Select * 
	from   BX_SubconShipments
	where	StatusID = 5
			AND ShipToTarget = @sShip2Target 
			AND subConPo = @sSubCOnPORefNo

END


