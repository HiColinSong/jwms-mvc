USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_PrepackScanItem]    Script Date: 19/7/2018 7:38:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[BX_PrepackScanItem] 
(
	@qsNo varchar(22),
	@HUNumber varchar(20),
    @sFullScanCode Varchar(60),
    @ModifiedBy varchar(20),
    @ModifiedOn varchar(22)
)
AS

BEGIN
   UPDATE Bx_SubConShipments 
        SET StatusID = 7,
            qsNO=@qsNo,  
            HUNumber=@HUNumber,
            ModifiedBy = @ModifiedBy,
            ModifiedOn = Convert(datetime,ModifiedOn)
    WHERE	FullScanCode = @sFullScanCode AND StatusID<>7
    IF @@ROWCOUNT = 0  
        RAISERROR ('Error:Item cannot be found or is already scanned!',16,1 ); 

	-- select s.SerialNo,s.workorder,s.HUNumber,w.batchno,w.Itemcode from dbo.BX_SubconShipments s,dbo.WorkOrders w
    -- where s.workorder=w.Project and  qsNO=@qsNo

END

