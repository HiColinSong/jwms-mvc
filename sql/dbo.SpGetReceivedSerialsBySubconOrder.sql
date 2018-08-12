USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[SpGetReceivedSerialsBySubconOrder]    Script Date: 12-Aug-18 5:13:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Ya Dong Zhu>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
ALTER PROCEDURE [dbo].[SpGetReceivedSerialsBySubconOrder]
		@sShip2Target	Varchar(3),   -- SGW - BIT Warehouse, CHW - BESA Warehouse, SGQ - BIT QA, QRS - BIT Quarantine Shipment
		@sSubCOnPORefNo	Varchar(20)
AS
DECLARE @statusId CHAR(1) = 6,
		@shipTarget Varchar(3) = @sShip2Target
BEGIN

	SET NOCOUNT ON;
	IF (@sShip2Target='QRS') 
		BEGIN
			SET @statusId=7;
			SET @shipTarget='SGW';
		END
			
	SELECT s.workorder, s.SerialNo,w.batchno,w.Itemcode,s.CreatedBy,s.CreatedOn
	FROM   BX_SubconShipments s LEFT JOIN dbo.WorkOrders w ON s.workorder=w.Project
	WHERE	StatusID = @statusId
			AND ShipToTarget = @shipTarget 
			AND subConPo = @sSubCOnPORefNo

END