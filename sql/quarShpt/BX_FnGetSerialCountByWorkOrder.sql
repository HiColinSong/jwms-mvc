USE [BIOTRACK]
GO
/****** Object:  UserDefinedFunction [dbo].[BX_FnGetSerialCountByWorkOrder]    Script Date: 8/9/2018 9:17:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER FUNCTION [dbo].[BX_FnGetSerialCountByWorkOrder]
(
		@sWorkOrder			Varchar(20),
		@sShipToTarget		Varchar(3),
		@sStatusID		    Char(1) = NULL  --by default, received
)
RETURNS Int
AS
BEGIN
	-- Declare the return variable here
	DECLARE @nStentCount Int

    IF (@sStatusID='0')
        BEGIN
            select @nStentCount = Count(SerialNo)  
            from BX_SubconShipments 
            where workorder = @sWorkOrder 
            and ShipToTarget = @sShipToTarget 
        END
    ELSE
        BEGIN
            select @nStentCount = Count(SerialNo)  
            from BX_SubconShipments 
            where workorder = @sWorkOrder  
            and ShipToTarget = @sShipToTarget 
            And (@sStatusID IS NULL OR StatusID = @sStatusID)
        END

	RETURN ISNULL(@nStentCount,0)

END
