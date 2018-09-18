USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[dbo.BX_PrepackScanItemByBatch]    Script Date: 9/9/2018 6:20:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[dbo.BX_PrepackScanItemByBatch] 
(
	@subConPo varchar(20),
	@qsNo varchar(22),
	@HUNumber varchar(20),
	@batchNo varchar(18),
    @sFullScanCode Varchar(60),
    @ModifiedBy varchar(20),
    @ModifiedOn varchar(22),
    @sQty Int
)
AS
DECLARE
    -- @workOrder varchar(20),
    @quarShptPlanQty int,
    @scannedQty int,
    @availableQty int
BEGIN
    --find plan quantity and the statusID of the item
    BEGIN TRY
    SELECT @quarShptPlanQty=sum(qty) FROM BX_QuarShptPlan 
            WHERE  batchNo=@batchNo and SubconPORefNo=@subConPo;

    SELECT @scannedQty=count(serialNo)  FROM BX_SubconShipments s LEFT OUTER JOIN WorkOrders w on w.Project=s.workorder
            WHERE s.subConPo=@subConPo AND w.batchNo=@batchNo AND s.StatusID=7
            
    SELECT @availableQty=count(serialNo) FROM BX_SubconShipments s LEFT OUTER JOIN WorkOrders w on w.Project=s.workorder
	        WHERE s.subConPo=@subConPo AND w.batchNo=@batchNo AND s.StatusID=5 and s.ShipToTarget='SGW'   

    IF (@scannedQty+@sQty>@quarShptPlanQty)
        RAISERROR ('Error:Exceed the planned quantity!',16,1 ); 
    ELSE IF (@sQty>@availableQty)
         RAISERROR ('Error:No Enough quantity for assignment!',16,1 ); 


   UPDATE S
        SET StatusID = 7,
            qsNO=@qsNo,  
            HUNumber=@HUNumber,
            ModifiedBy = @ModifiedBy,
            ModifiedOn = Convert(datetime,ModifiedOn)
    WHERE	S.SerialNo IN (
                    SELECT TOP (@sQty)  S.SerialNo 
                        FROM	BX_SubconShipments S
                        Left Outer Join WorkOrders W on W.Project = S.workorder 
                        -- Left Outer Join SAP_EANCodes E on E.EANCode = SUBSTRING(@sFullScanCode,3,14)
            WHERE	S.subConPo=@subConPo AND W.batchNo=@batchNo AND S.StatusID=5 and S.ShipToTarget='SGW'
            Order by S.SerialNo
            )
    
    END TRY
    BEGIN CATCH  
        DECLARE @ErrorMessage NVARCHAR(4000);  
        DECLARE @ErrorSeverity INT;  
        DECLARE @ErrorState INT;  

        SELECT   
            @ErrorMessage = ERROR_MESSAGE(),  
            @ErrorSeverity = ERROR_SEVERITY(),  
            @ErrorState = ERROR_STATE();  

        RAISERROR (@ErrorMessage, -- Message text.  
                @ErrorSeverity, -- Severity.  
                @ErrorState -- State.  
                );  
    END CATCH; 
END

