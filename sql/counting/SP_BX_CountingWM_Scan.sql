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

DECLARE @countingWmId int

BEGIN
    BEGIN TRY  
		
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
                        totalStock int,
                        scanQty int
                    );
             INSERT INTO @temp_item 
				SELECT c.id,c.storageBin,c.storageLoc,@MaterialCode,@BatchNo,c.plant,c.totalStock,ISNULL(sum(s.qty),0) as scanQty
                FROM dbo.BX_CountingWM c left outer join dbo.BX_CountingWM_Scan s on c.id=s.countingWmId
                WHERE material = @MaterialCode and batch = @BatchNo 
				group by c.id,c.storageBin,c.storageLoc,c.plant,c.totalStock

             DECLARE @remainningRecord int,@remainningQty int
             SELECT  @remainningRecord=count(countingWmId) from  @temp_item  
             IF (@remainningRecord>0)
                BEGIN
                    WHILE   @remainningRecord>0
                    BEGIN
                        SET @Qty=(SELECT)
                        UPDATE 
                        SET @remainningRecord=@remainningRecord-1
                    END
                END
            ELSE
--            IF @countingWmId IS NULL
                BEGIN
                    INSERT INTO [dbo].[BX_CountingWM] (docNo,warehouse,material,batch) VALUES (@docNo,@warehouse,@MaterialCode,@BatchNo)
                    SET @countingWmId=SCOPE_IDENTITY();  --assign the id of the new record
                    --RAISERROR ('Error:Material/Batch cannot be found!',16,1 ); 
                END

            
      
        IF (@SerialNo is NOT NULL) AND  
            EXISTS (select 1 from BX_CountingWM_Scan s, BX_CountingWM c 
                where serialNo=@SerialNo and  
                    s.countingWmId=c.id AND
                    c.docNo=@docNo AND 
                    c.warehouse=@warehouse
                )
            RAISERROR ('Error:Serial Number exists!',16,1 ); 

		INSERT INTO dbo.BX_CountingWM_Scan (countingWmId,qty,fullScanCode,serialNo,countBy,countOn)
			VALUES (@countingWmId,@Qty,@FullScanCode,@SerialNo,@countBy,Convert(datetime,@countOn))

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

