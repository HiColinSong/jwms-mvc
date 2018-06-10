USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_UpdateResvStatus]    Script Date: 5-June-18 12:58:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[BX_UpdateResvStatus] 
(
	@Warehouse varchar(6),
	@ResvNumber varchar(12),
    @PostedOn varchar(22)=NULL,
    @PostedBy varchar(30)=NULL,
	@Push2SAPStatus char(1)=NULL,
	@PostingStatus char(1)=NULL,
	@SAPRefNo nvarchar(20)=NULL
)
AS
/**
This SP will update status in SAP_RESVHeader and BX_ResvHeader status 
when starting or completing Picking 
   
*/
BEGIN
    BEGIN TRANSACTION;
    SAVE TRANSACTION MySavePoint;

    BEGIN TRY
        IF (@PostingStatus IS NOT NULL)
			UPDATE dbo.SAP_RESVHeader 
				SET PostingStatus  = @PostingStatus
			WHERE	ResvOrder = @ResvNumber and Warehouse = @Warehouse
        
        IF (@PostedOn IS NOT NULL) OR 
           (@PostedBy IS NOT NULL) OR 
           (@Push2SAPStatus IS NOT NULL) OR 
           (@SAPRefNo IS NOT NULL) 
           BEGIN
                UPDATE dbo.BX_ResvHeader 
                    SET PostedOn  = IIF(@PostedOn IS NULL,PostedOn,Convert(datetime,@PostedOn)),
                        PostedBy  = IIF(@PostedBy IS NULL,PostedBy,@PostedBy),
                        Push2SAPStatus  = IIF(@Push2SAPStatus IS NULL,Push2SAPStatus,@Push2SAPStatus),
                        SAPRefNo  = IIF(@SAPRefNo IS NULL,SAPRefNo,@SAPRefNo)
                WHERE	ResvNumber = @ResvNumber
                IF @@ROWCOUNT=0
                    INSERT INTO dbo.BX_ResvHeader 
                        VALUES(@ResvNumber,
                            @Push2SAPStatus,
                            @SAPRefNo,
                            Convert(datetime,@PostedOn),
                            @PostedBy)
            END
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION MySavePoint; -- rollback to MySavePoint
        END
    END CATCH
    COMMIT TRANSACTION 
	SELECT * FROM dbo.BX_ResvHeader WHERE ResvNumber=@ResvNumber
END;

