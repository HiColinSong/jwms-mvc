USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_CountingIM_Scan]    Script Date: 10-Oct-18 10:02:13 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[BX_Scan_CountingIM] 
(
	@docNo varchar(12),
	@fiscalYear char(4),
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

DECLARE @countingImId int

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

           SELECT top (1) @countingImId = id from dbo.BX_CountingIM 
           WHERE docNo=@docNo AND
                 fiscalYear=@fiscalYear AND
                 MaterialCode=@MaterialCode AND
                 BatchNo=@BatchNo 


            IF @countingImId IS NULL
                RAISERROR ('Error:Material/Batch cannot be found!',16,1 ); 

            
      
        IF (@SerialNo is NOT NULL) AND  
            EXISTS (select 1 from BX_CountingIM_Scan s, BX_CountingIM c 
                where serialNo=@SerialNo and  
                    s.countingImId=c.id AND
                    c.docNo=@docNo AND 
                    c.fiscalYear=@fiscalYear
               )
            RAISERROR ('Error:Serial Number exists!',16,1 ); 

		INSERT INTO dbo.BX_CountingIM_Scan (countingImId,qty,fullScanCode,serialNo,countBy,countOn)
			VALUES (@countingImId,@Qty,@FullScanCode,@SerialNo,@countBy,Convert(datetime,@countOn))

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

