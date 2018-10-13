USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_CountingWM_Scan]    Script Date: 10-Oct-18 10:02:13 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[BX_Scan_CountingWM] 
(
	@docNo varchar(12),
	@warehouse char(3),
	@EANCode varchar(16),
    @MaterialCode varchar(18)=NULL,
    @BatchNo varchar(20),
    @SerialNo varchar(10) = NULL,
    @countBy varchar(20),
    @countOn varchar(22),
    @FullScanCode varchar(60),
    @Qty int = 1
)
AS

BEGIN
    BEGIN TRY  
        IF (@SerialNo is NOT NULL) AND  
            EXISTS (select 1 from BX_CountingWM_Scan s, BX_CountingWM c 
                where serialNo=@SerialNo and  
                    s.countingWmId=c.id AND
                    c.docNo=@docNo AND 
                    c.warehouse=@warehouse
                )
            RAISERROR ('Error:Serial Number exists!',16,1 ); 
		
        --if material code is not passed in and it can't be found in table SAP_EANCodes per the passed EANCode
        IF (@MaterialCode is NULL) AND NOT EXISTS (SELECT MaterialCode from dbo.SAP_EANCodes where EANCode=@EANCode)
        RAISERROR ('Error:Material Code cannot be found',16,1 );  

        --find material code and assign the value
        IF (@MaterialCode is NULL) 
            BEGIN
				SELECT @MaterialCode=MaterialCode,@Qty=@Qty*ConversionUnits from dbo.SAP_EANCodes where EANCode=@EANCode
            END

            --define a temp table for finding the storage bin and storage location
            DECLARE @temp_item TABLE
                    (
                        countingWmId int,
                        storageBin varchar (20),
                        storageLoc varchar (20),
                        material varchar(18),
                        batch varchar(20),
                        plant varchar(10),
                        totalStock int
                    );
             INSERT INTO @temp_item 
				SELECT id,storageBin,storageLoc,@MaterialCode,@BatchNo,plant,totalStock
                FROM dbo.BX_CountingWM
                WHERE material = @MaterialCode and batch = @BatchNo 
				

             DECLARE @countingWmId int,@remainningRecord int,@remainningQty int=@Qty,@scanQty int,@scannedQty int,@totalStock int
             SELECT  @remainningRecord=count(countingWmId) from  @temp_item  
           
           IF @remainningRecord = 0 --the scanned item is not in the pi document
                BEGIN
                    INSERT INTO dbo.BX_CountingWM (docNo,warehouse,material,batch) 
                        VALUES (@docNo,@warehouse,@MaterialCode,@BatchNo)

                    INSERT INTO dbo.BX_CountingWM_Scan (countingWmId,qty,fullScanCode,serialNo,countBy,countOn)
			            VALUES (SCOPE_IDENTITY(),@remainningQty,@FullScanCode,@SerialNo,@countBy,Convert(datetime,@countOn))
                    --RAISERROR ('Error:Material/Batch cannot be found!',16,1 ); 
                END
            ELSE 
                BEGIN
                    WHILE   @remainningRecord>0
                    BEGIN
                        IF  @remainningRecord=1 --last record
                            BEGIN
                                IF @remainningQty>0
                                INSERT INTO dbo.BX_CountingWM_Scan (countingWmId,qty,fullScanCode,serialNo,countBy,countOn)
			                        SELECT TOP(1) countingWmId,@remainningQty,@FullScanCode,@SerialNo,@countBy,Convert(datetime,@countOn)
                                    FROM @temp_item
                            END
                        ELSE 
                            BEGIN
                                SELECT TOP(1) @countingWmId=countingWmId,@totalStock=totalStock FROM @temp_item;
                                SET @scannedQty=ISNULL((SELECT sum(qty) FROM dbo.BX_CountingWM_Scan WHERE countingWmId=@countingWmId),0);
                                SELECT @scanQty=(case when (@totalStock-@scannedQty)>@remainningQty then @remainningQty else (@totalStock-@scannedQty) end) 
                                SELECT @remainningQty=@remainningQty-@scanQty;
                                IF @scanQty>0
                                    INSERT INTO dbo.BX_CountingWM_Scan (countingWmId,qty,fullScanCode,serialNo,countBy,countOn)
                                        VALUES (@countingWmId,@scanQty,@FullScanCode,@SerialNo,@countBy,Convert(datetime,@countOn))
                                DELETE TOP (1) FROM @temp_item 
                            END
                        SET @remainningRecord=@remainningRecord-1
                    END
                END
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
	--SELECT * FROM dbo.BX_RgaDetails where DONumber=@DONumber

END

