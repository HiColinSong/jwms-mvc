USE [BIOTRACK]
GO
/****** Object:  UserDefinedFunction [dbo].[BX_FnGetSerialCountByWorkOrder]    Script Date: 8/10/2018 8:30:17 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER FUNCTION [dbo].[BX_FnGetSerialCountByWorkOrder]
(
		@sWorkOrder			Varchar(20),
		@sShipToTarget		Varchar(3),
		@sStatusID1		    Char(1) = NULL,  
		@sStatusID2		    Char(1) = NULL,  
		@sStatusID3		    Char(1) = NULL  
)
RETURNS Int
AS
BEGIN
	-- Declare the return variable here
	DECLARE @nStentCount Int

    IF (@sStatusID1='0' or @sStatusID1 is NULL)
        BEGIN
            select @nStentCount = Count(SerialNo)  
            from BX_SubconShipments 
            where workorder = @sWorkOrder 
            and ShipToTarget = @sShipToTarget 
        END
    ELSE IF (@sStatusID2 IS NULL AND @sStatusID3 is NULL)
        BEGIN
            select @nStentCount = Count(SerialNo)  
            from BX_SubconShipments 
            where workorder = @sWorkOrder  
            and ShipToTarget = @sShipToTarget 
            And StatusID = @sStatusID1
        END
    ELSE IF (@sStatusID3 is NULL)
        BEGIN
            select @nStentCount = Count(SerialNo)  
            from BX_SubconShipments 
            where workorder = @sWorkOrder  
            and ShipToTarget = @sShipToTarget 
            And (StatusID = @sStatusID1 OR StatusID = @sStatusID2)
        END
    ELSE 
        BEGIN
            select @nStentCount = Count(SerialNo)  
            from BX_SubconShipments 
            where workorder = @sWorkOrder  
            and ShipToTarget = @sShipToTarget 
            And (StatusID = @sStatusID1 OR StatusID = @sStatusID2 OR  StatusID = @sStatusID3)
        END
  

	RETURN ISNULL(@nStentCount,0)

END
