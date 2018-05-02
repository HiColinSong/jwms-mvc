USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[InsertOrUpdatePacking]    Script Date: 01-May-18 10:24:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[InsertOrUpdatePacking] 
(
	@DONumber varchar(12),
	@EANCode varchar(16),
	@HUNumber varchar(20),
    @MaterialCode varchar(18)=NULL,
    @BatchNo varchar(20),
	@BinNumber varchar(20) = NULL,
    @SerialNo varchar(8) = NULL,
    @PackBy varchar(20),
    @PackedOn varchar(10),
    @Status char(1),
    @FullScanCode varchar(60),
    @Qty int = 1
)
AS
DECLARE @DOItemNumber char(6)
IF (@BinNumber IS NULL)
	SET @BinNumber = 'DEFAULT BIN'
/**insert or update for table BX_PackDetails
    do the following check
    1. Check DOStatus in SAP_DOHeader
    2. Check PackStatus in BX_PackHeader
    3. Check HandlingUnit exist in BX_PackHUnits
    4. if MaterialCode and BatchNo combination exists in SAP_DODetail
    5. if Total ScanQty of the M/B combination is less than the DOQuantity in SAP_DODetail
    6. if SerialNo is not null,check if NOT EXIST in the table

    if Passed Check, do Insert/Update
    else return error message
    if Exist (DONumber=@DONumber,HUNumber=@HUNumber,BatchNo=@BatchNo,PackBy=@PackBy,
              PackedOn=@PackedOn,SerialNo=null,@SerialNo=null)
              Update BalancedQty
    else  insert record.
*/
BEGIN
    BEGIN TRY  
        --if material code is not passed in and it can't be found in table SAP_EANCodes per the passed EANCode
        IF (@MaterialCode is NULL) AND NOT EXISTS (SELECT MaterialCode from dbo.SAP_EANCodes where EANCode=@EANCode)
        RAISERROR ('Material Code cannot be found',16,1 );  

        --find material code and assign the value
        IF (@MaterialCode is NULL) 
            BEGIN
                SET @MaterialCode = (SELECT MaterialCode from dbo.SAP_EANCodes where EANCode=@EANCode)
            END

            --define a temp table for finding the doItemNumber
            DECLARE @temp_item TABLE
                    (
                        DONumber varchar(12),
                        DOItemNumber char(6),
                        EANCode varchar(16),
                        MaterialCode varchar(18),
                        BatchNo varchar(20),
                        SerialNo varchar(8),
                        ActualQty int,
                        PlanQty int
                    );

            -- insert the values into the temp table with Material code, planQty
            INSERT INTO @temp_item 
                SELECT @DONumber,DOItemNumber,@EANCode,@MaterialCode,@BatchNo,@SerialNo,0,DOQuantity
                FROM dbo.SAP_DODetail
                WHERE DONumber = @DONumber and MaterialCode = @MaterialCode and BatchNumber = @BatchNo

            IF NOT EXISTS (SELECT * from @temp_item)
            RAISERROR ('Error:Material/Batch cannot be found in Delivery order',16,1 ); 

            --update the temp table with the actual scanned qty by sum in the BX_packDetails
            UPDATE m
            SET m.ActualQty = c.scanSum
            FROM @temp_item m,
            (
            SELECT SUM(ScanQty) scanSum
            FROM dbo.BX_PackDetails a, dbo.SAP_DODetail b
            Where a.DOItemNumber=b.DOItemNumber and a.DONumber=b.DONumber and a.BatchNo = b.BatchNumber and a.MaterialCode=b.MaterialCode
            and a.DONumber = @DONumber and a.BatchNo = @BatchNo and a.MaterialCode = (select top 1 MaterialCode from @temp_item)
            GROUP BY a.DOItemNumber	
            ) c 

            --find the first available DOItemNumber that can be used for inserting the scan item
            SET @DOItemNumber = (select top 1 DOItemNumber from @temp_item where PlanQty>=ActualQty+@Qty)
            if (@DOItemNumber is NULL)
                RAISERROR ('Error:Exceed planned quantity.',16,1 );  


        IF EXISTS (select * from dbo.SAP_DOHeader where DONumber=@DONumber and DOStatus=1)
            -- RAISERROR with severity 11-19 will cause execution to   
            -- jump to the CATCH block.  
            RAISERROR ('Error:Packing is already confirmed', -- Message text.  
                    16, -- Severity.  
                    1 -- State.  
                    );  
        
        IF EXISTS (select * from dbo.BX_PackHeader where DONumber=@DONumber and PackStatus=2)
            RAISERROR ('Error:Packing is already completed',16,1 );  
        IF NOT EXISTS (select * from dbo.BX_PackHUnits where DONumber=@DONumber and HUNumber=@HUNumber)
            RAISERROR ('Error:Handling Unit cannot be found.',16,1 );  
 

        IF EXISTS (select * from dbo.BX_PackDetails where SerialNo=@SerialNo)
            RAISERROR ('Error:Serial Number exists!',16,1 ); 

        IF EXISTS (SELECT DONumber from dbo.BX_PackDetails 
                    WHERE	DONumber=@DONumber and 
                            DOItemNumber=@DOItemNumber and
                            HUNumber=@HUNumber and 
                            MaterialCode=@MaterialCode and 
                            BatchNo=@BatchNo and 
							BinNumber=@BinNumber and 
                            PackBy=@PackBy and
                            PackedOn=@PackedOn and 
							SerialNo is NULL) AND (@SerialNo is NULL)
		BEGIN
			UPDATE dbo.BX_PackDetails 
				SET ScanQty = @Qty+ ScanQty
			WHERE	DONumber=@DONumber and 
                    DOItemNumber=@DOItemNumber and
                    HUNumber=@HUNumber and 
                    MaterialCode=@MaterialCode and 
                    BatchNo=@BatchNo and 
					BinNumber=@BinNumber and 
                    PackBy=@PackBy and
                    PackedOn=@PackedOn and 
					SerialNo is NULL
		END
	ELSE
		INSERT INTO dbo.BX_PackDetails
			VALUES (newid(),@DONumber,@HUNumber,@MaterialCode,@BatchNo,@SerialNo,@PackBy,Convert(datetime,@PackedOn),@Status,@FullScanCode,@Qty,@DOItemNumber,@BinNumber)

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
	--return freshed items detail
	SELECT * FROM dbo.BX_PackDetails where DONumber=@DONumber

END

