USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[SpGetSubConIssuedSerialNos]    Script Date: 8/10/2018 2:51:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SpGetSubConIssuedSerialNos]
		@sSubConPO		Varchar(20),
		@sShip2Target	Varchar(3)   -- SGW - BIT Warehouse, CHW - BESA Warehouse, SGQ - BIT QA
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
			
	Select WorkOrder, SubCOnPo, SerialNo, CreatedBy, CreatedOn 
	from   BX_SubconShipments
	where	subConPo = @sSubConPO
			AND ShipToTarget = @sShip2Target 

END

GO
