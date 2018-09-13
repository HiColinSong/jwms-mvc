USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_PrepackScanItem]    Script Date: 9/9/2018 6:20:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[BX_PrepackScanItem] 
(
	@qsNo varchar(22),
	@HUNumber varchar(20),
	@batchNo varchar(18),
    @sFullScanCode Varchar(60),
    @ModifiedBy varchar(20),
    @ModifiedOn varchar(22)
)
AS
DECLARE
    @workOrder varchar(20),
    @quarShptPlanQty int,
    @scannedQty int,
    @itemStatusID char(1) --hold the StatusID for the item with the passed sFullScanCode
BEGIN
    --find plan quantity and the statusID of the item
    BEGIN TRY
    select 
        @workOrder=p.workorder,
        @quarShptPlanQty=p.qty,
        @itemStatusID=s.StatusID
    from BX_SubconShipments s 
    left outer join BX_QuarShptPlan p on p.workorder=s.workorder
    where s.FullScanCode=@sFullScanCode and p.qsNo=@qsNo and ShipToTarget='SGW' 
    
    IF @@ROWCOUNT=0
        RAISERROR ('Error:Item cannot be found!',16,1 ); 
    ELSE IF @itemStatusID=7
        RAISERROR ('Error:Item is already scanned!',16,1 ); 
    ELSE IF @itemStatusID=6
			RAISERROR ('Error:Item is already scanned for Subcon Receipt!',16,1 ); 

    --find the quantity already scanned for the item
    SELECT @scannedQty=count(SerialNo)   
    FROM BX_SubconShipments
	where workorder=@workOrder and 
          FullScanCode like '%'+@batchNo+'%' and 
          qsNO=@qsNo and StatusID='7'
    IF (@scannedQty>=@quarShptPlanQty)
        RAISERROR ('Error:Exceed the planned quantity!',16,1 ); 

   UPDATE Bx_SubConShipments 
        SET StatusID = 7,
            qsNO=@qsNo,  
            HUNumber=@HUNumber,
            ModifiedBy = @ModifiedBy,
            ModifiedOn = Convert(datetime,ModifiedOn)
    WHERE	FullScanCode = @sFullScanCode AND StatusID=5
    END TRY
    BEGIN CATCH  
        DECLARE @ErrorMessage NVARCHAR(4000);  
        DECLARE @ErrorSeverity INT;  
        DECLARE @ErrorState INT;  

        SELECT   
            @ErrorMessage = ERROR_MESSAGE(),  
            @ErrorSeverity = ERROR_SEVERITY(),  
            @ErrorState = ERROR_STATE();  

        -- Use RAISERROR inside the CATCH block to return error  
        -- information about the original error that caused  
        -- execution to jump to the CATCH block.  
        RAISERROR (@ErrorMessage, -- Message text.  
                @ErrorSeverity, -- Severity.  
                @ErrorState -- State.  
                );  
    END CATCH; 
END

