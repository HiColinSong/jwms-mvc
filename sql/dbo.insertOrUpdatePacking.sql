USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[InsertOrUpdatePacking]    Script Date: 19/7/2018 7:38:23 PM ******/
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
    @SerialNo varchar(10) = NULL,
    @PackBy varchar(20),
    @PackedOn varchar(22),
    @Status char(1),
    @FullScanCode varchar(60),
    @Qty int = 1
)
AS
DECLARE @effectiveBatch int = 180601 --change this if the effective batch changes

DECLARE @DOItemNumber char(6),@batchDate int,@isSerialNoRequired char(1)
IF (@BinNumber IS NULL)
	SET @BinNumber = 'DEFAULT BIN'
BEGIN
    BEGIN TRY  
		
        --if material code is not passed in and it can't be found in table SAP_EANCodes per the passed EANCode
        IF (@MaterialCode is NULL) AND NOT EXISTS (SELECT MaterialCode from dbo.SAP_EANCodes where EANCode=@EANCode)
        RAISERROR ('Error:Material Code cannot be found',16,1 );  

        --find material code and assign the value
        IF (@MaterialCode is NULL) 
            BEGIN
                --SET @MaterialCode = (SELECT MaterialCode from dbo.SAP_EANCodes where EANCode=@EANCode)
				SELECT @MaterialCode=MaterialCode,@Qty=ConversionUnits from dbo.SAP_EANCodes where EANCode=@EANCode
            END

            --define a temp table for finding the doItemNumber
            DECLARE @temp_item TABLE
                    (
                        DONumber varchar(12),
                        DOItemNumber char(6),
                        EANCode varchar(16),
                        MaterialCode varchar(18),
                        BatchNo varchar(20),
                        SerialNo varchar(10),
                        ActualQty int,
                        PlanQty int
                    );

            -- insert the values into the temp table with Material code, planQty
            INSERT INTO @temp_item 
                SELECT @DONumber,DOItemNumber,@EANCode,@MaterialCode,@BatchNo,@SerialNo,0,DOQuantity
                FROM dbo.SAP_DODetail
                WHERE DONumber = @DONumber and MaterialCode = @MaterialCode and BatchNumber = @BatchNo

            IF NOT EXISTS (SELECT 1 from @temp_item)
            RAISERROR ('Error:Material/Batch cannot be found in Delivery order',16,1 ); 

            -- Find DOItemNumber
             DECLARE @actualQty int = 0,@planQty int
			 
			 WHILE EXISTS (SELECT 1 from @temp_item)
			 BEGIN
				SELECT TOP 1 @DOItemNumber = DOItemNumber,@planQty = PlanQTY,@MaterialCode=MaterialCode  from @temp_item
				SELECT @actualQty = sum(ScanQty) from BX_PackDetails 
				where DONumber = @DONumber and BatchNo = @BatchNo and MaterialCode = @MaterialCode and DOItemNumber = @DOItemNumber
				SELECT @actualQty=ISNULL(@actualQty,0)
				
                -- if the scanned qty plus new qty exceed the plan qty, delete the top 1 record and loop again
				IF(@actualQty+@Qty>@planQty) 
					BEGIN
						DELETE TOP (1) FROM @temp_item 
						SET @DOItemNumber = NULL
					END
				ELSE
					BREAK  --found DOItemNumber, no need to loop
				 CONTINUE
			 END

            if (@DOItemNumber is NULL)
                RAISERROR ('Error:Exceed planned quantity.',16,1 );  

        -- check if the serial no is required if it is null
		IF (@SerialNo IS NULL) 
            BEGIN
		        BEGIN TRY
                --check if the the serial no is enabled for the material
                IF (CAST(SUBSTRING(@BatchNo,2,6) AS INT) - @effectiveBatch>0)
                    SELECT @isSerialNoRequired=EnableSerialNo FROM dbo.SAP_Materials WHERE ItemCode=@MaterialCode
		        END TRY
                BEGIN CATCH
                    print 'BATCH NO does not follow X180602xxxx format';
                END CATCH
                IF (@isSerialNoRequired='X')
                     RAISERROR ('Error:Serial Number is required',16,1 );
            END

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

        --check if the serialNo is valid
      /* EXEC dbo.SP_IsValidSerialNo 
                @sFullScanCode=@FullScanCode, 
                @sTransactionType='OUT',
                @sSerialNo=@SerialNo,
                @sMaterialCode=@MaterialCode,
                @sBatchNo = @BatchNo                    
*/
        IF (@SerialNo is NULL) AND 
            EXISTS (SELECT DONumber from dbo.BX_PackDetails 
                    WHERE	SerialNo is NULL AND
                            DONumber=@DONumber and 
                            DOItemNumber=@DOItemNumber and
                            HUNumber=@HUNumber and 
                            MaterialCode=@MaterialCode and 
                            BatchNo=@BatchNo and 
							BinNumber=@BinNumber and 
                            PackBy=@PackBy and
                            PackedOn=@PackedOn)
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

