USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[InsertOrUpdatePacking]    Script Date: 24-Apr-18 6:24:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[InsertOrUpdatePacking] 
(
	@DONumber varchar(12),
	@HUNumber varchar(20),
    @MaterialCode varchar(18),
    @BatChNo varchar(20),
    @SerialNo varchar(8)=NULL,
    @PackBy varchar(20),
    @PackedOn varchar(10),
    @Status char(1),
    @FullScanCode varchar(60),
    @Qty int=1
)
AS
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
        IF EXISTS (select * from dbo.SAP_DOHeader where DONumber=@DONumber and DOStatus=1)
            -- RAISERROR with severity 11-19 will cause execution to   
            -- jump to the CATCH block.  
            RAISERROR ('Error:Packing is already confirmed', -- Message text.  
                    16, -- Severity.  
                    1 -- State.  
                    );  
        IF NOT EXISTS (select * from dbo.SAP_DODetail 
                        where   DONumber=@DONumber and 
                                MaterialCode=@MaterialCode and 
                                BatchNumber=@BatchNo)
            RAISERROR ('Error:Material/Batch cannot be found in Delivery order',16,1 ); 
        IF EXISTS (select * from dbo.BX_PackHeader where DONumber=@DONumber and PackStatus=1)
            RAISERROR ('Error:Packing is already completed',16,1 );  
        IF NOT EXISTS (select * from dbo.BX_PackHUnits where DONumber=@DONumber and HUNumber=@HUNumber)
            RAISERROR ('Error:Handling Unit cannot be found.',16,1 );  
 

        DECLARE @actualQty int,@planQty int
        SET @actualQty =(select sum(ScanQty) from dbo.BX_PackDetails  
                        where   DONumber=@DONumber and 
								MaterialCode=@MaterialCode and 
                                BatchNo=@BatchNo)
        SET @planQty=(select DOQuantity from dbo.SAP_DODetail 
                        where   DONumber=@DONumber and 
								MaterialCode=@MaterialCode and 
                                BatchNumber=@BatchNo)

        IF (@planQty-@actualQty-@Qty<0)
            RAISERROR ('Error:Exceed planned quantity.',16,1 );  

        IF EXISTS (select * from dbo.BX_PackDetails where SerialNo=@SerialNo)
            RAISERROR ('Error:Serial Number exists!',16,1 ); 

        IF EXISTS (SELECT DONumber from dbo.BX_PackDetails 
                    WHERE	DONumber=@DONumber and 
                            HUNumber=@HUNumber and 
                            MaterialCode=@MaterialCode and 
                            BatchNo=@BatchNo and 
                            PackBy=@PackBy and
                            PackedOn=@PackedOn)
		BEGIN
			UPDATE dbo.BX_PackDetails 
				SET ScanQty = @Qty+ ScanQty
			WHERE	DONumber=@DONumber and 
                    HUNumber=@HUNumber and 
                    MaterialCode=@MaterialCode and 
                    BatchNo=@BatchNo and 
                    PackBy=@PackBy and
                    PackedOn=@PackedOn
		END
	ELSE
		INSERT INTO dbo.BX_PackDetails
			VALUES (newid(),@DONumber,@HUNumber,@MaterialCode,@BatchNo,@SerialNo,@PackBy,Convert(datetime,@PackedOn),@Status,@FullScanCode,@Qty)

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

