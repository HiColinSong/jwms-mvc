
CREATE PROCEDURE [dbo].[BX_UpdateTOStatus] 
(
	@TONumber varchar(12),
	@PickConfirmStatus char(1)=NULL,
    @PickStart varchar(10)=NULL,
    @PickComplete varchar(10)=NULL,
	@PickStatus char(1)=NULL,
	@Push2SAPStatus char(1)=NULL,
	@SAPRefNo nvarchar(20)=NULL
)
AS
/**
This SP will update status in SAP_TOHeader and BX_PickHeader status 
when starting or completing Picking 
   
*/
BEGIN
    BEGIN TRANSACTION;
    SAVE TRANSACTION MySavePoint;

    BEGIN TRY
        IF (@PickConfirmStatus IS NOT NULL)
			UPDATE dbo.SAP_TOHeader 
				SET PickConfirmStatus  = @PickConfirmStatus
			WHERE	TransferOrder = @TONumber
        
        IF (@PickStart IS NOT NULL) OR 
           (@PickComplete IS NOT NULL) OR 
           (@PickStatus IS NOT NULL) OR 
           (@Push2SAPStatus IS NOT NULL) OR 
           (@SAPRefNo IS NOT NULL) 
           BEGIN
                UPDATE dbo.BX_PickHeader 
                    SET PickStart  = IIF(@PickStart IS NULL,PickStart,Convert(datetime,@PickStart)),
                        PickComplete  = IIF(@PickComplete IS NULL,PickComplete,Convert(datetime,@PickComplete)),
                        PickStatus  = IIF(@PickStatus IS NULL,PickStatus,@PickStatus),
                        Push2SAPStatus  = IIF(@Push2SAPStatus IS NULL,Push2SAPStatus,@Push2SAPStatus),
                        SAPRefNo  = IIF(@SAPRefNo IS NULL,SAPRefNo,@SAPRefNo)
                WHERE	TONumber = @TONumber
                IF @@ROWCOUNT=0
                    INSERT INTO dbo.BX_PickHeader 
                        VALUES(@TONumber,
                            Convert(datetime,@PickStart),
                            Convert(datetime,@PickComplete),
                            @PickStatus,
                            @Push2SAPStatus,
                            @SAPRefNo)
            END
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION MySavePoint; -- rollback to MySavePoint
        END
    END CATCH
    COMMIT TRANSACTION 
END;

GO


