USE [BIOTRACK]
GO
/****** Object:  UserDefinedFunction [dbo].[BX_FnGetReceivedSerialCountByWorkOrder]    Script Date: 17-Jun-18 2:49:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[BX_FnGetSerialCountByWorkOrder]
(
		@sWorkOrder			Varchar(20),
		@sShipToTarget		Varchar(3),
		@sStatusID		    Char(1) = 6  --by default, received
)
RETURNS Int
AS
BEGIN
	-- Declare the return variable here
	DECLARE @nStentCount Int

	select @nStentCount = Count(SerialNo)  
	from BX_SubconShipments 
	where workorder = @sWorkOrder and ShipToTarget = @sShipToTarget And StatusID = @sStatusID

	RETURN ISNULL(@nStentCount,0)

END
