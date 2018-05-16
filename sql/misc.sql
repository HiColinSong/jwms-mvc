DECLARE
	@DONumber varchar(12)='0800401225',
	@EANCode varchar(16)='02888893016290',
	@HUNumber varchar(20)='118051600000',
    @MaterialCode varchar(18)='LAH25018P',
    @BatchNo varchar(20)='P2H40709A',
	@BinNumber varchar(20)= NULL,
	@SerialNo varchar(8)=NULL,
    @PackBy varchar(20)='yd.zh',
    @PackedOn varchar(10)='20180516',
    @Status char(1)='0',
    @FullScanCode varchar(60)='01028888930162901714111310P2H40709A',
    @Qty int= 1


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
		IF (@SerialNo IS NULL) AND (CAST(SUBSTRING(@BatchNo,2,6) AS INT) - @effectiveBatch>0)
            BEGIN
                --check if the the serial no is enabled for the material
                SELECT @isSerialNoRequired=EnableSerialNo FROM dbo.SAP_Materials WHERE ItemCode=@MaterialCode
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
