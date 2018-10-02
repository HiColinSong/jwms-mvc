USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_AutoRcptSubConSerialNos]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[BX_AutoRcptSubConSerialNos]
		@sSubConPORefNo		Varchar(20),
		@sShipToTarget		Varchar(3) = 'CHW'
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	Update S1
	set StatusID = 6
	From  BX_SubconShipments S1	
			Left Outer Join StentsByFG F on F.stntserial = S1.SerialNo 
			Left Outer Join BX_SubConDetails S2 on S2.WorkOrder = s1.workorder  
	where  S2.SubconPORefNo = @sSubConPORefNo AND ShipToTarget = @sShipToTarget

	RETURN (@@RowCount)

END
GO
/****** Object:  StoredProcedure [dbo].[BX_CheckAndCompleteSubCOnReceipt]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO










-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[BX_CheckAndCompleteSubCOnReceipt]
		@sSubCOnPORefNo		Varchar(20)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE	@nPlanSGWQty	Int
	DECLARE	@nPlanSGQQty	Int
	DECLARE	@nPlanCHWQty	Int

	DECLARE	@nRcptSGWQty	Int = 0
	DECLARE	@nRcptSGQQty	Int = 0
	DECLARE	@nRcptCHWQty	Int = 0
	
	DECLARE	@nReturnValue		Int
	DECLARE	@nUpdatedCHWCount	Int = 0
	DECLARE	@sErrorMessages		Varchar(300) = ''
	DECLARE	@sSAPSTORefNo		Varchar(20) = ''

	DECLARE @sOpenSubConPORefNo	varchar(20) 
	-- DECLARE @sSubConPORefNo	varchar(20) = '2100180606'
	DECLARE	@sSubConPOStatus	char(1)

	BEGIN TRY

		SELECT	@sSubConPOStatus = ISNULL(IsComplete,'')
		FROM	BX_SubConPOHeader 
		where SubconPORefNo = @sSubCOnPORefNo

		IF @sSubConPOStatus <> ''
			BEGIN
				SET @sErrorMessages = 'Error : This SubCon PO is already Processed/Completed ' ;
				-- THROW 51000, @sErrorMessages, 1;
				RAISERROR (@sErrorMessages ,16,1 );
			END

		SELECT	
			@nPlanCHWQty = sum(ISNULL(BESAQty,0)) ,
			@nPlanSGWQty = sum(ISNULL(BITQty,0)) ,
			@nPlanSGQQty = sum(ISNULL(QAQty,0)) 
		FROM	BX_SubConDetails 
		WHERE	SubConPoRefNo = @sSubCOnPORefNo
		GROUP by subconPORefNo

		Select	 -- * 
			@sOpenSubConPORefNo = D.SubConPoRefNo,
			--@nPlanSGWQty = SUM(CASE WHEN ISNULL(S.ShiptoTarget,'') = 'SGW' AND StatusID = 5 THEN 1 ELSE 0 END ), 
			--@nPlanSGQQty = SUM(CASE WHEN ISNULL(S.ShiptoTarget,'') = 'SGQ' AND StatusID = 5 THEN 1 ELSE 0 END ), 
			--@nPlanCHWQty = SUM(CASE WHEN ISNULL(S.ShiptoTarget,'') = 'CHW' AND StatusID = 5 THEN 1 ELSE 0 END ), 

			@nRcptSGWQty = SUM(CASE WHEN ISNULL(S.ShiptoTarget,'') = 'SGW' AND StatusID = 6 THEN 1 ELSE 0 END ), 
			@nRcptSGQQty = SUM(CASE WHEN ISNULL(S.ShiptoTarget,'') = 'SGQ' AND StatusID = 6 THEN 1 ELSE 0 END ), 
			@nRcptCHWQty = SUM(CASE WHEN ISNULL(S.ShiptoTarget,'') = 'CHW' AND StatusID = 6 THEN 1 ELSE 0 END )
		from [BX_SubConDetails]  D 
				Left Outer Join bx_subconPOHeader H on H.[SubconPORefNo] = d.[SubconPORefNo] 
				Left Outer Join BX_SubconShipments S on S.workorder = D.workOrder 
					 AND StatusID In (6)
		where D.SubConPoRefNo = @sSubCOnPORefNo
		Group by  D.SubConPoRefNo

		-- Check if any subcon Qty is assigned for BESA and No STO Assigned against Subcon PO
		--IF @nPlanCHWQty > 0 
		--BEGIN
		--	SELECT  -- @sSAPSTORefNo = CASE WHEN ISNULL(H.SAPSTORefNo ,'')
		--		@sSAPSTORefNo = CASE WHEN ISNULL(H.SAPSTORefNo ,'') = '' THEN '-' ELSE H.SAPSTORefNo END 
		--	FROM	BX_SubConDetails D 
		--			left Outer Join BX_SubConPOHeader H on H.SubconPORefNo = D.SubconPORefNo 
		--	where H.SubconPORefNo = @sSubCOnPORefNo


		--	IF @sSAPSTORefNo = ''
		--	BEGIN
		--		SET @sErrorMessages = 'Error : STO Number not Assigned Yet, Completion not Allowed' ;
		--		-- THROW 51000, @sErrorMessages, 1;
		--		RAISERROR (@sErrorMessages ,16,1 );
		--	END
		--END

		--IF @nPlanSGWQty+ @nPlanSGQQty <> @nRcptSGWQty+@nRcptSGQQty
		--BEGIN
		--	SET @sErrorMessages = 'Error : Receiving for BIT & QA Samples still in Progress.... ' ;
		--	-- THROW 51000, @sErrorMessages, 1;
		--	RAISERROR (@sErrorMessages ,16,1 );
		--END
		--ELSE
		BEGIN
			-- Do Auto Receive for BESA Serial Nos 
				EXEC @nUpdatedCHWCount = BX_AutoRcptSubConSerialNos @sSubCOnPORefNo, 'CHW'   
		END

		Update BX_SubConPOHeader 
		set IsComplete = 'X'
		where SubconPORefNo = @sSubCOnPORefNo
	END TRY

	BEGIN CATCH
			DECLARE @sTriggerAlert  Int = 0 ;
			-- THROW 51000, @sErrorMessages, 1;
			RAISERROR (@sErrorMessages ,16,1 );

	END CATCH

	-- If every Check is OK, return list of Serial Nos with relevant Documnet Ref.
	SELECT	S2.SubconPORefNo,ISNULL(H.SAPSTORefNo,'') as SAPSTORefNo, S2.WorkOrder,
		S1.SerialNo , W.batchno ,W.Itemcode,  S1.ShipToTarget,
		CASE WHEN Left(S1.shiptoTarget,2) = 'SG' THEN '2100' ELSE '3250' END as PlantCode ,
		CASE WHEN Left(S1.shiptoTarget,2) = 'SG' THEN S2.WorkOrder ELSE ISNULL(S2.WorkOrder,'') END as PostingDocument
	from	BX_SubconShipments S1	
			Left Outer Join StentsByFG F on F.stntserial = S1.SerialNo 
			Left Outer Join BX_SubConDetails S2 on S2.WorkOrder = s1.workorder 
			Left Outer Join BX_SubConPOHeader  H on  H.SubconPORefNo = S2.SubconPORefNo 
			Left Outer Join WorkOrders W on ltrim(Rtrim(W.Project)) = Ltrim(Rtrim(s1.workorder)) 
	where  S2.SubconPORefNo = @sSubCOnPORefNo


	-- Select @nReturnValue = CASE WHEN @nPlanSGWQty + @nPlanSGQQty = @nRcptSGWQty+@nRcptSGQQty THEN 0 ELSE -1 END   -- 0 Success, -1 : Error
END
GO
/****** Object:  StoredProcedure [dbo].[BX_CheckAndCompleteSubCOnReceipt_Ali]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO










-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[BX_CheckAndCompleteSubCOnReceipt_Ali]
		@sSubCOnPORefNo		Varchar(20)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE	@nPlanSGWQty	Int
	DECLARE	@nPlanSGQQty	Int
	DECLARE	@nPlanCHWQty	Int

	DECLARE	@nRcptSGWQty	Int = 0
	DECLARE	@nRcptSGQQty	Int = 0
	DECLARE	@nRcptCHWQty	Int = 0
	
	DECLARE	@nReturnValue		Int
	DECLARE	@nUpdatedCHWCount	Int = 0
	DECLARE	@sErrorMessages		Varchar(300) = ''
	DECLARE	@sSAPSTORefNo		Varchar(20) = ''

	DECLARE @sOpenSubConPORefNo	varchar(20) 
	-- DECLARE @sSubConPORefNo	varchar(20) = '2100180606'
	DECLARE	@sSubConPOStatus	char(1)

	BEGIN TRY

		SELECT	@sSubConPOStatus = ISNULL(IsComplete,'')
		FROM	BX_SubConPOHeader 
		where SubconPORefNo = @sSubCOnPORefNo

		IF @sSubConPOStatus <> ''
			BEGIN
				SET @sErrorMessages = 'Error : This SubCon PO is already Processed/Completed ' ;
				-- THROW 51000, @sErrorMessages, 1;
				RAISERROR (@sErrorMessages ,16,1 );
			END

		SELECT	
			@nPlanCHWQty = sum(ISNULL(BESAQty,0)) ,
			@nPlanSGWQty = sum(ISNULL(BITQty,0)) ,
			@nPlanSGQQty = sum(ISNULL(QAQty,0)) 
		FROM	BX_SubConDetails 
		WHERE	SubConPoRefNo = @sSubCOnPORefNo
		GROUP by subconPORefNo

		Select	 -- * 
			@sOpenSubConPORefNo = D.SubConPoRefNo,
			--@nPlanSGWQty = SUM(CASE WHEN ISNULL(S.ShiptoTarget,'') = 'SGW' AND StatusID = 5 THEN 1 ELSE 0 END ), 
			--@nPlanSGQQty = SUM(CASE WHEN ISNULL(S.ShiptoTarget,'') = 'SGQ' AND StatusID = 5 THEN 1 ELSE 0 END ), 
			--@nPlanCHWQty = SUM(CASE WHEN ISNULL(S.ShiptoTarget,'') = 'CHW' AND StatusID = 5 THEN 1 ELSE 0 END ), 

			@nRcptSGWQty = SUM(CASE WHEN ISNULL(S.ShiptoTarget,'') = 'SGW' AND StatusID = 6 THEN 1 ELSE 0 END ), 
			@nRcptSGQQty = SUM(CASE WHEN ISNULL(S.ShiptoTarget,'') = 'SGQ' AND StatusID = 6 THEN 1 ELSE 0 END ), 
			@nRcptCHWQty = SUM(CASE WHEN ISNULL(S.ShiptoTarget,'') = 'CHW' AND StatusID = 6 THEN 1 ELSE 0 END )
		from [BX_SubConDetails]  D 
				Left Outer Join bx_subconPOHeader H on H.[SubconPORefNo] = d.[SubconPORefNo] 
				Left Outer Join BX_SubconShipments S on S.workorder = D.workOrder 
					 AND StatusID In (6)
		where D.SubConPoRefNo = @sSubCOnPORefNo
		Group by  D.SubConPoRefNo

		-- Check if any subcon Qty is assigned for BESA and No STO Assigned against Subcon PO
		IF @nPlanCHWQty > 0 
		BEGIN
			SELECT  -- @sSAPSTORefNo = CASE WHEN ISNULL(H.SAPSTORefNo ,'')
				@sSAPSTORefNo = CASE WHEN ISNULL(H.SAPSTORefNo ,'') = '' THEN '-' ELSE H.SAPSTORefNo END 
			FROM	BX_SubConDetails D 
					left Outer Join BX_SubConPOHeader H on H.SubconPORefNo = D.SubconPORefNo 
			where H.SubconPORefNo = @sSubCOnPORefNo


			IF @sSAPSTORefNo = ''
			BEGIN
				SET @sErrorMessages = 'Error : STO Number not Assigned Yet, Completion not Allowed' ;
				-- THROW 51000, @sErrorMessages, 1;
				RAISERROR (@sErrorMessages ,16,1 );
			END
		END

		IF @nPlanSGWQty+ @nPlanSGQQty <> @nRcptSGWQty+@nRcptSGQQty
		BEGIN
			SET @sErrorMessages = 'Error : Receiving for BIT & QA Samples still in Progress.... ' ;
			-- THROW 51000, @sErrorMessages, 1;
			RAISERROR (@sErrorMessages ,16,1 );
		END
		ELSE
		BEGIN
			-- Do Auto Receive for BESA Serial Nos 
				EXEC @nUpdatedCHWCount = BX_AutoRcptSubConSerialNos @sSubCOnPORefNo, 'CHW'   
		END

		Update BX_SubConPOHeader 
		set IsComplete = 'X'
		where SubconPORefNo = @sSubCOnPORefNo
	END TRY

	BEGIN CATCH
			DECLARE @sTriggerAlert  Int = 0 ;
			-- THROW 51000, @sErrorMessages, 1;
			RAISERROR (@sErrorMessages ,16,1 );

	END CATCH

	-- If every Check is OK, return list of Serial Nos with relevant Documnet Ref.
	SELECT	S2.SubconPORefNo,ISNULL(H.SAPSTORefNo,'') as SAPSTORefNo, S2.WorkOrder,
		S1.SerialNo , W.batchno ,W.Itemcode,  S1.ShipToTarget,
		CASE WHEN Left(S1.shiptoTarget,2) = 'SG' THEN '2100' ELSE '3250' END as PlantCode ,
		CASE WHEN Left(S1.shiptoTarget,2) = 'SG' THEN S2.WorkOrder ELSE ISNULL(S2.WorkOrder,'') END as PostingDocument
	from	BX_SubconShipments S1	
			Left Outer Join StentsByFG F on F.stntserial = S1.SerialNo 
			Left Outer Join BX_SubConDetails S2 on S2.WorkOrder = s1.workorder 
			Left Outer Join BX_SubConPOHeader  H on  H.SubconPORefNo = S2.SubconPORefNo 
			Left Outer Join WorkOrders W on ltrim(Rtrim(W.Project)) = Ltrim(Rtrim(s1.workorder)) 
	where  S2.SubconPORefNo = @sSubCOnPORefNo


	-- Select @nReturnValue = CASE WHEN @nPlanSGWQty + @nPlanSGQQty = @nRcptSGWQty+@nRcptSGQQty THEN 0 ELSE -1 END   -- 0 Success, -1 : Error
END
GO
/****** Object:  StoredProcedure [dbo].[BX_CheckMultipleTOStatus]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[BX_CheckMultipleTOStatus] 
(
	@TONumberList varchar(1200)
)
AS

DECLARE @TONumber char(12),@nth int=1
DECLARE @temp_TONumber TABLE
        (
            TONumber varchar(12)
        );
BEGIN
    while 1=1
    BEGIN
        SET @TONumber = (select dbo.nth_occur(@TONumberList,',',@nth));
        IF LEN(ISNULL(@TONumber, '')) = 0 break;

        IF NOT EXISTS (SELECT 1 FROM dbo.BX_PickHeader WHERE TONumber=@TONumber AND PickStart IS NOT NULL)
        INSERT INTO @temp_TONumber values(@TONumber);
        SET @nth=@nth+1;
    END            
	--return the TONumbers that don't have PickStart status
	SELECT TONumber FROM @temp_TONumber
END
GO
/****** Object:  StoredProcedure [dbo].[BX_GetHandlingUnitAndScannedItems]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Ya Dong Zhu
-- Create date: 28 Apr,2018
-- Description:	return two sets of record
-- =============================================
CREATE PROCEDURE [dbo].[BX_GetHandlingUnitAndScannedItems] 
	-- Add the parameters for the stored procedure here
	@DONumber varchar(12)
AS
BEGIN
	select * from dbo.BX_PackHUnits where DONumber=@DONumber
	select * from dbo.BX_PackDetails where DONumber=@DONumber
END
GO
/****** Object:  StoredProcedure [dbo].[BX_InsertOrUpdateResv]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[BX_InsertOrUpdateResv] 
(
	@Warehouse varchar(6),
	@ResvOrder varchar(12),
	@ResvOrderDate varchar(10),
	@ResvCreaedBy varchar(20),
	@Plant varchar(4)=NULL,
	@PostingStatus char(1),
    @ResvItemNumberList varchar(3500),
    @MaterialCodeList varchar(8000),
    @BatchNumberList varchar(5500),
    @VendorBatchList varchar(8000),
    @ResvQuantityList varchar(2000)
)
AS
--insert or update for table SAP_RESVHeader
BEGIN
	IF EXISTS (SELECT ResvOrder from dbo.SAP_RESVHeader where ResvOrder = @ResvOrder and Warehouse = @Warehouse)
		BEGIN
			UPDATE dbo.SAP_RESVHeader 
				SET ResvOrderDate = Convert(datetime,@ResvOrderDate),
					ResvCreaedBy = @ResvCreaedBy,
					Plant = @Plant,
					PostingStatus  = @PostingStatus
			WHERE	ResvOrder = @ResvOrder AND
					Warehouse = @Warehouse
		END
	ELSE
		INSERT INTO dbo.SAP_RESVHeader(Warehouse,ResvOrder,ResvOrderDate,ResvCreaedBy,Plant,PostingStatus)
			VALUES (@Warehouse,@ResvOrder,Convert(datetime,@ResvOrderDate),@ResvCreaedBy,@Plant,@PostingStatus)

--insert  table SAP_RESVDetail
DECLARE 
    @nth int,
    @ResvItemNumber varchar (6),
    @MaterialCode varchar (18),
    @BatchNumber varchar (10),
    @VendorBatch varchar (20),
    @ResvQuantity varchar (22)


SET @nth=1
    while 1=1
    BEGIN
        SET @ResvItemNumber = (select dbo.nth_occur(@ResvItemNumberList,',',@nth));
        IF LEN(ISNULL(@ResvItemNumber, '')) = 0 break;
        SET @MaterialCode = (select dbo.nth_occur(@MaterialCodeList,',',@nth));
        SET @BatchNumber = (select dbo.nth_occur(@BatchNumberList,',',@nth));
        SET @VendorBatch = (select dbo.nth_occur(@VendorBatchList,',',@nth));
        SET @ResvQuantity = (select dbo.nth_occur(@ResvQuantityList,',',@nth));

		--delete old records and insert new one
		DELETE FROM dbo.SAP_RESVDetail WHERE Warehouse = @Warehouse AND ResvOrder = @ResvOrder and ResvItemNumber=@ResvItemNumber

        INSERT INTO dbo.SAP_RESVDetail(Warehouse,ResvOrder,ResvItemNumber,MaterialCode,BatchNumber,VendorBatch,ResvQuantity)
         VALUES (@Warehouse,@ResvOrder,@ResvItemNumber,@MaterialCode,@BatchNumber,@VendorBatch, CAST(@ResvQuantity AS NUMERIC(18,4)))

		SET @nth=@nth+1
        continue;
    END
	SELECT * FROM dbo.BX_ResvHeader WHERE ResvNumber=@ResvOrder
	SELECT * FROM dbo.BX_ResvDetails where ResvNumber=@ResvOrder
    PRINT 'insert or update of ResvHeader and ResvDetail done!'
	END
GO
/****** Object:  StoredProcedure [dbo].[BX_InsertOrUpdateResvDetails]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[BX_InsertOrUpdateResvDetails] 
(
	@ResvNumber varchar(12),
	@EANCode varchar(16),
    @MaterialCode varchar(18)=NULL,
    @BatchNo varchar(20),
    @SerialNo varchar(10) = NULL,
    @PostBy varchar(20),
    @PostOn varchar(22),
    @Status char(1),
    @FullScanCode varchar(60),
    @Qty int = 1
)
AS
DECLARE @effectiveBatch int = 180601 --change this if the effective batch changes

DECLARE @ResvItemNumber char(6),@batchDate int,@isSerialNoRequired char(1)
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

            --define a temp table for finding the ResvItemNumber
            DECLARE @temp_item TABLE
                    (
                        ResvNumber varchar(12),
                        ResvItemNumber char(6),
                        EANCode varchar(16),
                        MaterialCode varchar(18),
                        BatchNo varchar(20),
                        SerialNo varchar(10),
                        ActualQty int,
                        PlanQty int
                    );

            -- insert the values into the temp table with Material code, planQty
            INSERT INTO @temp_item 
                SELECT @ResvNumber,ResvItemNumber,@EANCode,@MaterialCode,@BatchNo,@SerialNo,0,ResvQuantity
                FROM dbo.SAP_RESVDetail
                WHERE ResvOrder = @ResvNumber and MaterialCode = @MaterialCode and BatchNumber = @BatchNo

            IF NOT EXISTS (SELECT 1 from @temp_item)
            RAISERROR ('Error:Material/Batch cannot be found in Delivery order',16,1 ); 

            -- Find ResvItemNumber
             DECLARE @actualQty int = 0,@planQty int
			 
			 WHILE EXISTS (SELECT 1 from @temp_item)
			 BEGIN
				SELECT TOP 1 @ResvItemNumber = ResvItemNumber,@planQty = PlanQTY,@MaterialCode=MaterialCode  from @temp_item
				
                SELECT @actualQty = sum(ScanQty) from dbo.BX_ResvDetails 
				where ResvNumber = @ResvNumber and BatchNo = @BatchNo and MaterialCode = @MaterialCode and ResvItemNumber = @ResvItemNumber
				
                SELECT @actualQty=ISNULL(@actualQty,0)
				
                -- if the scanned qty plus new qty exceed the plan qty, delete the top 1 record and loop again
				IF(@actualQty+@Qty>@planQty) 
					BEGIN
						DELETE TOP (1) FROM @temp_item 
						SET @ResvItemNumber = NULL
					END
				ELSE
					BREAK  --found ResvItemNumber, no need to loop
				 CONTINUE
			 END

            if (@ResvItemNumber is NULL)
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

        IF EXISTS (select * from dbo.SAP_RESVHeader where ResvOrder=@ResvNumber and PostingStatus='C')
            -- RAISERROR with severity 11-19 will cause execution to   
            -- jump to the CATCH block.  
            RAISERROR ('Error:Reservation is already done', -- Message text.  
                    16, -- Severity.  
                    1 -- State.  
                    );  
        
        IF EXISTS (select * from dbo.BX_ResvHeader where ResvNumber=@ResvNumber and Push2SAPStatus='C')
            RAISERROR ('Error:Reservation is already completed',16,1 );  

        IF EXISTS (select * from dbo.BX_ResvDetails where SerialNo=@SerialNo)
            RAISERROR ('Error:Serial Number exists!',16,1 ); 

        --check if the serialNo is valid
    --    EXEC dbo.SP_IsValidSerialNo 
    --             @sFullScanCode=@FullScanCode, 
    --             @sTransactionType='OUT',
    --             @sSerialNo=@SerialNo,
    --             @sMaterialCode=@MaterialCode,
    --             @sBatchNo = @BatchNo                    

        IF (@SerialNo is NULL) AND 
            EXISTS (SELECT ResvNumber from dbo.BX_ResvDetails 
                    WHERE	SerialNo is NULL AND
                            ResvNumber=@ResvNumber and 
                            ResvItemNumber=@ResvItemNumber and
                            MaterialCode=@MaterialCode and 
                            BatchNo=@BatchNo and 
                            PostBy=@PostBy and
                            PostOn=@PostOn)
		BEGIN
			UPDATE dbo.BX_ResvDetails 
				SET ScanQty = @Qty+ ScanQty
			WHERE	ResvNumber=@ResvNumber and 
                    ResvItemNumber=@ResvItemNumber and
                    MaterialCode=@MaterialCode and 
                    BatchNo=@BatchNo and 
                    PostBy=@PostBy and
                    PostOn=@PostOn and 
					SerialNo is NULL
		END
	ELSE
		INSERT INTO dbo.BX_ResvDetails
			VALUES (newid(),@ResvNumber,@ResvItemNumber,@MaterialCode,@BatchNo,@SerialNo,@Qty,@PostBy,Convert(datetime,@PostOn),@Status,@FullScanCode)

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
	SELECT * FROM dbo.BX_ResvDetails where ResvNumber=@ResvNumber

END

GO
/****** Object:  StoredProcedure [dbo].[BX_InsertOrUpdateRga]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[BX_InsertOrUpdateRga] 
(
	@DONumber varchar(12),
	@EANCode varchar(16),
    @MaterialCode varchar(18)=NULL,
    @BatchNo varchar(20),
    @SerialNo varchar(10) = NULL,
    @ReceiptBy varchar(20),
    @ReceivedOn varchar(22),
    @Status char(1),
    @FullScanCode varchar(60),
    @Qty int = 1
)
AS
DECLARE @effectiveBatch int = 180600 --change this if the effective batch changes

DECLARE @DOItemNumber char(6),@batchDate int,@isSerialNoRequired char(1)

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
				SELECT @actualQty = sum(ScanQty) from dbo.BX_RgaDetails 
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
		--IF (@SerialNo IS NULL) AND (CAST(SUBSTRING(@BatchNo,2,6) AS INT) - @effectiveBatch>0)
  --          BEGIN
  --              --check if the the serial no is enabled for the material
  --              SELECT @isSerialNoRequired=EnableSerialNo FROM dbo.SAP_Materials WHERE ItemCode=@MaterialCode
  --              IF (@isSerialNoRequired='X')
  --                   RAISERROR ('Error:Serial Number is required',16,1 );
  --          END
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
        
        IF EXISTS (select * from dbo.BX_RgaDetails where SerialNo=@SerialNo)
            RAISERROR ('Error:Serial Number exists!',16,1 ); 

 --       IF (@SerialNo is NULL) AND 
 --           EXISTS (SELECT DONumber from dbo.BX_RgaDetails 
 --                   WHERE	SerialNo is NULL AND
 --                           DONumber=@DONumber and 
 --                           DOItemNumber=@DOItemNumber and
 --                           MaterialCode=@MaterialCode and 
 --                           BatchNo=@BatchNo and 
 --                           ReceiptBy=@ReceiptBy and
 --                           ReceivedOn=@ReceivedOn)
	--	BEGIN
	--		UPDATE dbo.BX_RgaDetails 
	--			SET ScanQty = @Qty+ ScanQty
	--		WHERE	DONumber=@DONumber and 
 --                   DOItemNumber=@DOItemNumber and
 --                   MaterialCode=@MaterialCode and 
 --                   BatchNo=@BatchNo and 
 --                   ReceiptBy=@ReceiptBy and
 --                   ReceivedOn=@ReceivedOn and 
	--				SerialNo is NULL
	--	END
	--ELSE
		INSERT INTO dbo.BX_RgaDetails
			VALUES (newid(),@DONumber,@MaterialCode,@BatchNo,@SerialNo,@ReceiptBy,Convert(datetime,@ReceivedOn),@Status,@FullScanCode,@Qty,@DOItemNumber)

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

GO
/****** Object:  StoredProcedure [dbo].[BX_InsertOrUpdateTO]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[BX_InsertOrUpdateTO] 
(
	@TransferOrder varchar(12),
	@Warehouse varchar(6),
	@TOCreationDate varchar(10),
	@TOCreationUser varchar(20),
	@Plant varchar(4),
	@DONumber varchar(12),
	@ShipToCustomer varchar(12)=NULL,
	@PickConfirmStatus char(1)=0,
    @TOItemNumberList varchar(3500),
    @MaterialCodeList varchar(8000),
    @BatchNumberList varchar(5500),
    @VendorBatchList varchar(8000),
    @TOQuantityList varchar(2000)
)
AS
--insert or update for table SAP_TOHeader
BEGIN
	IF EXISTS (SELECT TransferOrder from dbo.SAP_TOHeader where TransferOrder = @TransferOrder )
		BEGIN
			UPDATE dbo.SAP_TOHeader 
				SET TOCreationDate	 = Convert(datetime,@TOCreationDate) ,
					TOCreationUser = @TOCreationUser ,
					DoNumber = @DONumber,
					Plant = @Plant ,
					ShipToCustomer	 = @ShipToCustomer ,
					PickConfirmStatus  = @PickConfirmStatus
			WHERE	TransferOrder = @TransferOrder
		END
	ELSE
		INSERT INTO dbo.SAP_TOHeader(TransferOrder,Warehouse,TOCreationDate,TOCreationUser,DONumber,Plant,ShipToCustomer,PickConfirmStatus)
			VALUES (@TransferOrder,@Warehouse,Convert(datetime,@TOCreationDate),@TOCreationUser,@DONumber,@Plant,@ShipToCustomer,@PickConfirmStatus)

--insert or update for table SAP_TODetail
DECLARE 
    @nth int,
    @TOItemNumber varchar (6),
    @MaterialCode varchar (18),
    @BatchNumber varchar (10),
    @VendorBatch varchar (20),
    @TOQuantity varchar (22)

SET @nth=1
    while 1=1
    BEGIN
        SET @TOItemNumber = (select dbo.nth_occur(@TOItemNumberList,',',@nth));
        IF LEN(ISNULL(@TOItemNumber, '')) = 0 break;
        SET @MaterialCode = (select dbo.nth_occur(@MaterialCodeList,',',@nth));
        SET @BatchNumber = (select dbo.nth_occur(@BatchNumberList,',',@nth));
        SET @VendorBatch = (select dbo.nth_occur(@VendorBatchList,',',@nth));
        SET @TOQuantity = (select dbo.nth_occur(@TOQuantityList,',',@nth));

		--delete old records and insert new one
		DELETE FROM dbo.SAP_TODetail WHERE TransferOrder = @TransferOrder and TOItemNumber=@TOItemNumber

        INSERT INTO dbo.SAP_TODetail(TransferOrder,Warehouse,TOItemNumber,MaterialCode,BatchNumber,VendorBatch,TOQuantity)
            VALUES (@TransferOrder,@Warehouse,@TOItemNumber,@MaterialCode,@BatchNumber,@VendorBatch, CAST(@TOQuantity AS NUMERIC(18,4)))

		SET @nth=@nth+1
        continue;
    END
	SELECT * FROM [BIOTRACK].[dbo].[BX_PickHeader] WHERE TONumber=@TransferOrder
    PRINT 'insert or update of TOHeader and TODetail done!'
	END
GO
/****** Object:  StoredProcedure [dbo].[BX_InsertOrUpdateUserProfile]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[BX_InsertOrUpdateUserProfile] 
(
	@UserID varchar(20),
	@DefaultWH varchar(3),
	@Domain varchar(20),
	@UserRole varchar(20) = 'normal',--could be "admin" or "superAdmin"
	@isActive char(1)
)
AS
--insert or update for table BX_UserProfile
BEGIN
	IF EXISTS (SELECT UserID from dbo.BX_UserProfile where UserID = @UserID )
		BEGIN
			UPDATE dbo.BX_UserProfile 
				SET DefaultWH = @DefaultWH,
					Domain = @Domain,
					UserRole = @UserRole,
					isActive  = @isActive
			WHERE	UserID = @UserID
		END
	ELSE
		INSERT INTO dbo.BX_UserProfile
			VALUES (@UserID,@DefaultWH,@Domain,@UserRole,@isActive)

	SELECT * FROM dbo.BX_UserProfile where Domain = @Domain 

END
GO
/****** Object:  StoredProcedure [dbo].[BX_LoadSubConOrderDetails]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[BX_LoadSubConOrderDetails]

AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	DECLARE	@sErrorMessages	nvarchar(500)

	BEGIN TRY
	  Insert into BX_SubConPOHeader (SubconPORefNo ,podate ,sapstorefno,CreatedBy ,CreatedOn )
	  select distinct subconPORefNo, getdate(),'','biotrack',getdate()
	  From [TmpSubConPODetail]
	  where subconporefNo Not in (Select SubconPORefNo from bx_subconpoheader) 

	  Insert into BX_SubConDetails (subconporefno, WorkOrder , BESAQty, BITQty, QAqty ) 
	  select subconporefno, WorkOrder ,ISNULL(BESAQty,0) ,ISNULL(BITQty,0) ,ISNULL(QAqty,0)
	  from [TmpSubConPODetail] 
	  where subconpoRefNO+'@'+workorder NOT IN ( Select subconpoRefNO+'@'+workorder from BX_SubConDetails )

		UPDATE S 
		SET S.subConPo = D.SubconPORefNo 
		FROM BX_SubconShipments S
				Left Outer Join BX_SubConDetails D on D.WorkOrder = S.workorder 
		WHERE ISNULL(subconPO,'') = ''  and ISNULL(D.subconPoRefNo,'') <> ''

	END TRY
	BEGIN CATCH
			DECLARE @sTriggerAlert  Int = 0 ;
			-- THROW 51000, @sErrorMessages, 1;
			RAISERROR (@sErrorMessages ,16,1 );
	END CATCH
END
GO
/****** Object:  StoredProcedure [dbo].[BX_RgaInsertOrUpdateDO]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[BX_RgaInsertOrUpdateDO] 
(
	@DONumber varchar(12),
	@DOCreationDate varchar(22),
	@DOCreationUser varchar(20),
	@Plant varchar(4),
	@ShipToCustomer varchar(12)=NULL,
	@DOStatus char(1),
    @DOItemNumberList varchar(3500),
    @MaterialCodeList varchar(8000),
    @BatchNumberList varchar(5500),
    @VendorBatchList varchar(8000),
    @DOQuantityList varchar(2000)
)
AS
--insert or update for table SAP_DOHeader
BEGIN
	IF EXISTS (SELECT DONumber from dbo.SAP_DOHeader where DONumber = @DONumber )
		BEGIN
			UPDATE dbo.SAP_DOHeader 
				SET DOCreationDate	 = Convert(datetime,@DOCreationDate) ,
					DOCreationUser = @DOCreationUser ,
					Plant = @Plant ,
					ShipToCustomer	 = @ShipToCustomer ,
					DOStatus  = @DOStatus
			WHERE	DONumber = @DONumber
		END
	ELSE
		INSERT INTO dbo.SAP_DOHeader(DONumber,DOCreationDate,DOCreationUser,Plant,ShipToCustomer,DOStatus)
			VALUES (@DONumber,Convert(datetime,@DOCreationDate),@DOCreationUser,@Plant,@ShipToCustomer,@DOStatus)

--insert or update for table SAP_DODetail
DECLARE 
    @nth int,
    @DOItemNumber varchar (6),
    @MaterialCode varchar (18),
    @BatchNumber varchar (10),
    @VendorBatch varchar (20),
    @DOQuantity varchar (22)
    --@uncompleted bit;

SET @nth=1
    --@uncompleted='true';
    while 1=1
    BEGIN
        SET @DOItemNumber = (select dbo.nth_occur(@DOItemNumberList,',',@nth));
        IF LEN(ISNULL(@DOItemNumber, '')) = 0 break;
        SET @MaterialCode = (select dbo.nth_occur(@MaterialCodeList,',',@nth));
        SET @BatchNumber = (select dbo.nth_occur(@BatchNumberList,',',@nth));
        SET @VendorBatch = (select dbo.nth_occur(@VendorBatchList,',',@nth));
        SET @DOQuantity = (select dbo.nth_occur(@DOQuantityList,',',@nth));

		--delete old records and insert new one
		DELETE FROM dbo.SAP_DODetail WHERE DONumber = @DONumber and DOItemNumber=@DOItemNumber

        INSERT INTO dbo.SAP_DODetail(DONumber,DOItemNumber,MaterialCode,BatchNumber,VendorBatch,DOQuantity)
         VALUES (@DONumber,@DOItemNumber,@MaterialCode,@BatchNumber,@VendorBatch, CAST(@DOQuantity AS NUMERIC(18,4)))

		SET @nth=@nth+1
        continue;
    END
	SELECT * FROM dbo.BX_RgaDetails where DONumber=@DONumber
    PRINT 'insert or update of DOHeader and DODetail done!'
	END
GO
/****** Object:  StoredProcedure [dbo].[BX_SPGetSubConOrders]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[BX_SPGetSubConOrders]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

   Select h.SubCOnPORefNo, h.PoDate,ISNULL(h.SAPSTORefNo,'') as SAPSTORefNo, d.WorkOrder,
		FullScanCode = (select top (1) FullScanCode from dbo.BX_SubconShipments where workorder=d.WorkOrder)
   from bx_subconPOHeader h,BX_SubConDetails d
   where ISNULL(h.IsComplete,'') = '' and  h.SubconPORefNo=d.SubconPORefNo
   order by h.SubconPORefNo

   /*
   Select SubCOnPORefNo, PoDate,ISNULL(SAPSTORefNo,'') as SAPSTORefNo 
   from bx_subconPOHeader 
   where ISNULL(IsComplete,'') = ''
   */

END
GO
/****** Object:  StoredProcedure [dbo].[BX_SPGetSubconWorkOrders]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO









-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[BX_SPGetSubconWorkOrders]
		@sSubCOnPORefNo		Varchar(20) = NULL,
		@sFullScanCode		Varchar(60) = NULL
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	DECLARE	@nPlanSGWQty	Int
	DECLARE	@nPlanSGQQty	Int
	DECLARE	@nPlanCHWQty	Int

	DECLARE	@nRcptSGWQty	Int = 0
	DECLARE	@nRcptSGQQty	Int = 0
	DECLARE	@nRcptCHWQty	Int = 0
	DECLARE	@sOpenSubConPORefNo	Varchar(20)=''
	DECLARE	@sErrorMessages		Varchar(300)=''
	DECLARE	@sScanCode4Search	Varchar(60)

	SET @sScanCode4Search = @sFullScanCode + '%'

	IF (@sSubCOnPORefNo is NULL)
	   BEGIN
	    -- Below set of codes commented on 22.Jul.2018 , Ali 
		--SELECT @sSubCOnPORefNo = h.SubconPORefNo 
		--FROM dbo.BX_SubconShipments s, bx_subconPOHeader h
		--WHERE s.FullScanCode=@sFullScanCode and
		--      ISNULL(h.IsComplete,'') = '' and  
		--	  h.SubconPORefNo=s.subConPo
		--IF (@sSubCOnPORefNo is NULL OR @sSubCOnPORefNo='')
		--	BEGIN
		--		SET @sErrorMessages = 'Error : Subcon PO cannot be found!' ;
		--		--THROW 51000, @sErrorMessages, 1;
		--		RAISERROR (@sErrorMessages,16,1 ); 
		--	END
		-- End of  Block for commented Lines, 22.Jul.2018, Ali


		SELECT TOP 1 @sSubCOnPORefNo = h.SubconPORefNo 
		FROM dbo.BX_SubconShipments s, bx_subconPOHeader h
		WHERE s.FullScanCode like @sScanCode4Search  and
		      ISNULL(h.IsComplete,'') = '' and  
			  h.SubconPORefNo=s.subConPo
		IF (@sSubCOnPORefNo is NULL OR @sSubCOnPORefNo='')
			BEGIN
				SET @sErrorMessages = 'Error : Subcon PO cannot be found!' ;
				--THROW 51000, @sErrorMessages, 1;
				RAISERROR (@sErrorMessages,16,1 ); 
			END

	   END

		--SELECT	
		--	@nPlanCHWQty = sum(ISNULL(BESAQty,0)) ,
		--	@nPlanSGWQty = sum(ISNULL(BITQty,0)) ,
		--	@nPlanSGQQty = sum(ISNULL(QAQty,0)) 
		--FROM	BX_SubConDetails 
		--WHERE	SubConPoRefNo = @sSubCOnPORefNo
		--GROUP by subconPORefNo

		Select	 -- * 
			-- @sOpenSubConPORefNo = 
			D.SubConPoRefNo,
			D.WorkOrder,
			FullScanCode = (select top (1) FullScanCode from dbo.BX_SubconShipments where workorder=D.WorkOrder),
			-- @nPlanCHWQty = 
			--sum(ISNULL(D.BESAQty,0))  as nPlanCHWQty,
			-- @nPlanSGWQty =  
			--sum(ISNULL(D.BITQty,0)) as nPlanSGWQty ,
			-- @nPlanSGQQty = 
			--sum(ISNULL(D.QAQty,0)) as nPlanSGQQty ,

			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'CHW',NULL) as nPlanCHWQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGW',NULL) as nPlanSGWQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGQ',NULL) as nPlanSGQQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'CHW',5) as nPendingCHWQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGW',5) as nPendingSGWQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGQ',5) as nPendingSGQQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'CHW',6) as nRcptCHWQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGW',6) as nRcptSGWQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGQ',6) as nRcptSGQQty
		from [BX_SubConDetails]  D 
				Left Outer Join bx_subconPOHeader H on H.[SubconPORefNo] = d.[SubconPORefNo] 
		where D.SubConPoRefNo = @sSubCOnPORefNo
		Group by  D.SubConPoRefNo,D.WorkOrder 

END
GO
/****** Object:  StoredProcedure [dbo].[BX_UpdateDOStatus]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[BX_UpdateDOStatus] 
(
	@DONumber varchar(12),
	@DOStatus char(1)=NULL,
    @PackStart varchar(22)=NULL,
    @PackComplete varchar(22)=NULL,
	@PackStatus char(1)=NULL,
	@Push2SAPStatus char(1)=NULL,
	@SAPRefNo nvarchar(20)=NULL
)
AS
/**
This SP will update status in SAP_DOHeader and BX_PackHeader status 
when completing packing ,packing reversal or RGA
   
*/
BEGIN
    BEGIN TRANSACTION;
    SAVE TRANSACTION MySavePoint;

    BEGIN TRY
        IF (@DOStatus IS NOT NULL)
			UPDATE dbo.SAP_DOHeader 
				SET DOStatus  = @DOStatus
			WHERE	DONumber = @DONumber
        
        IF (@PackStart IS NOT NULL) OR 
           (@PackComplete IS NOT NULL) OR 
           (@PackStatus IS NOT NULL) OR 
           (@Push2SAPStatus IS NOT NULL) OR 
           (@SAPRefNo IS NOT NULL) 
           BEGIN
                UPDATE dbo.BX_PackHeader 
                     SET PackStart  = CASE WHEN ISNULL(@PackStart,'') = '' THEN PackStart ELSE Convert(datetime,@PackStart) END,
					 PackComplete  = CASE WHEN ISNULL(@PackComplete,'') = '' THEN PackComplete ELSE Convert(datetime,@PackComplete) END,
					 PackStatus  =  ISNULL(@PackStatus,PackStatus) ,
					 Push2SAPStatus  = ISNULL(@Push2SAPStatus,Push2SAPStatus) ,
					  SAPRefNo  = ISNULL(@SAPRefNo,SAPRefNo) 

                    --SET PackStart  = Convert((datetime,@PackStart)) -- IIF(@PackStart IS NULL,PackStart,Convert(datetime,@PackStart)),
                    --    PackComplete  = IIF(@PackComplete IS NULL,PackComplete,Convert(datetime,@PackComplete)),
                    --    PackStatus  = IIF(@PackStatus IS NULL,PackStatus,@PackStatus),
                    --    Push2SAPStatus  = IIF(@Push2SAPStatus IS NULL,Push2SAPStatus,@Push2SAPStatus),
                    --    SAPRefNo  = IIF(@SAPRefNo IS NULL,SAPRefNo,@SAPRefNo)
                WHERE	DONumber = @DONumber
                IF @@ROWCOUNT=0
                    INSERT INTO dbo.BX_PackHeader 
                        VALUES(@DONumber,
                            Convert(datetime,@PackStart),
                            Convert(datetime,@PackComplete),
                            @PackStatus,
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
/****** Object:  StoredProcedure [dbo].[BX_UpdateResvStatus]    Script Date: 01-Oct-18 8:40:31 PM ******/
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
					SET PostedOn = CASE WHEN ISNULL(@PostedOn,'') =	'' THEN PostedOn ELSE Convert(datetime,@PostedOn) END ,
						PostedBy = ISNULL(@PostedBy,PostedBy),
						Push2SAPStatus = ISNULL(@Push2SAPStatus,Push2SAPStatus),
						SAPRefNo = ISNULL(@SAPRefNo,SAPRefNo)
                    --SET PostedOn  = IIF(@PostedOn IS NULL,PostedOn,Convert(datetime,@PostedOn)),
                    --    PostedBy  = IIF(@PostedBy IS NULL,PostedBy,@PostedBy),
                    --    Push2SAPStatus  = IIF(@Push2SAPStatus IS NULL,Push2SAPStatus,@Push2SAPStatus),
                    --    SAPRefNo  = IIF(@SAPRefNo IS NULL,SAPRefNo,@SAPRefNo)
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
GO
/****** Object:  StoredProcedure [dbo].[BX_UpdateTOStatus]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[BX_UpdateTOStatus] 
(
	@TONumber varchar(12),
	@PickConfirmStatus char(1)=NULL,
    @PickStart varchar(22)=NULL,
    @PickComplete varchar(22)=NULL,
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
                     SET PickStart  = CASE WHEN ISNULL(@PickStart,'') = '' THEN PickStart ELSE Convert(datetime,@PickStart) END,
					 PickComplete  = CASE WHEN ISNULL(@PickComplete,'') = '' THEN PickComplete ELSE Convert(datetime,@PickComplete) END,
					 PickStatus  =  ISNULL(@PickStatus,PickStatus) ,
					 Push2SAPStatus  = ISNULL(@Push2SAPStatus,Push2SAPStatus) ,
					  SAPRefNo  = ISNULL(@SAPRefNo,SAPRefNo) 
					 ---- IIF(@PickStart IS NULL,PickStart,Convert(datetime,@PickStart)),
      --                  PickComplete  = IIF(@PickComplete IS NULL,PickComplete,Convert(datetime,@PickComplete)),
      --                  PickStatus  = IIF(@PickStatus IS NULL,PickStatus,@PickStatus),
      --                  Push2SAPStatus  = IIF(@Push2SAPStatus IS NULL,Push2SAPStatus,@Push2SAPStatus),
      --                  SAPRefNo  = IIF(@SAPRefNo IS NULL,SAPRefNo,@SAPRefNo)
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
	SELECT * FROM dbo.BX_PickHeader WHERE TONumber=@TONumber
END;
GO
/****** Object:  StoredProcedure [dbo].[DeleteHandlingUnit]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE PROCEDURE [dbo].[DeleteHandlingUnit] 
(
	@DONumber varchar(12),
	@HUNumber varchar(20)
)
AS
/**delete for table BX_PackHUnits
    do the following check
    1. Check if there is any scanned item in this HU
   
*/
BEGIN
    BEGIN TRANSACTION;
    SAVE TRANSACTION MySavePoint;
    BEGIN TRY  
        DELETE from dbo.BX_PackDetails where DONumber=@DONumber and HUNumber=@HUNumber
		DELETE FROM dbo.BX_PackHUnits where HUNumber=@HUNumber;
    END TRY  
    BEGIN CATCH
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION MySavePoint; -- rollback to MySavePoint
        END
    END CATCH
    COMMIT TRANSACTION 
	--return freshed items detail
	SELECT * FROM dbo.BX_PackHUnits where DONumber=@DONumber
    --SELECT * from dbo.BX_PackDetails where DONumber=@DONumber and HUNumber=@HUNumber
END

GO
/****** Object:  StoredProcedure [dbo].[GetData4ElectronicForm]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




CREATE Procedure [dbo].[GetData4ElectronicForm]
			@sSearchKey		Varchar(20),
			@nStentType		Int
AS


SELECT	ROW_NUMBER() Over (Order by ss.stntserial) as SeqNumber,
		ss.fgwono,
		ss.stwono, 
		wo.itemcode,
		wo.batchno as StentBatch,
		case 
			when stenttype = 1 then 'Normal'
			when stenttype = 2 then 'Dummy'
		end as StentType,
		case 
			when stenttype = 2 then -1       -- Setup
			when stenttype = 1 then 9999	 --ISNULL(right(DC.systemId,2),99999)  -- AMPC Machine Nos..
		end as Category,
		
		ISNULL((Case when (charindex('_',reverse(DC.SystemID))) = 0  then '' Else RIGHT(DC.SystemID,charindex('_',reverse(DC.SystemID))-1) End),'')   as ampc,
		ISNULL(SS.StntSerial,'') as StntSerial, 
		ISNULL(stntwt.prewt,0) as PreWt, 
		ISNULL(stntwt.fifteenwt,0) as FifteenWt, 
		ISNULL(stntwt.postwt,0) as PostWt,
		ISNULL(DC.FormulationVialID, 0 ) as VialNo, 
		isnull(DC.dose_ug,0) as UVDose, 
		isnull(DC.drugConcentration_ug1ul,0) as Formulation,
		SS.Inspnstatus , SS.Inspncode ,
		ISNULL(Dc.len_mm,ISNULL(DC.doseDefiningLen_mm,0)) as StntLength,
		ISNULL(DC.formulationLotId, '') as FormlnBatch,

		ISNULL(dc02.FormulationLot,'') as HDrFormlnBatch,
		ISNULL(dc02.MaxDrugConc ,0) as HDrMaxDrugConc,
		ISNULL(dc02.MinDrugConc ,0) as HDrMinDrugConc,
		ISNULL(dc02.StLength ,0) as HDrStentLength,
		ISNULL(dc02.StModel ,'') as HDrStentModel,
		
		ISNULL((select max(ic.itemclass) from Itemclassifications ic where wo.itemcode like ic.prefix+'%'), '') as ItemClass,
		ISNULL(cast(left(I.class05,(patindex('%mm%',I.class05)-1)) as numeric(5,2)),0.0) as ItemStntLength
		
FROM	StentSerials SS  LEFT OUTER JOIN
		(	select stntserial, 
				SUM(Case	when coating = 1 then finalwt else 0 end) as PreWt,
				suM(Case	when coating = 2 then finalwt else 0 end) as FifteenWt,
				sum(Case	when coating = 3 then finalwt else 0 end) as PostWt
			from stentfinalweights
			group by stntserial ) StntWt  on SS.stntserial = StntWt.StntSerial
		LEFT OUTER JOIN AmpcData DC on DC.stentid = stntwt.stntserial
		LEFT OUTER JOIN WorkOrders Wo on ltrim(rtrim(Wo.project)) = ltrim(rtrim(SS.stwono))
		left outer join ItemMaster I on I.itemcode = wo.itemcode
		LEFT OUTER JOIN 
		(	select -- *
				ShoporderID, 
				MIN(drugconcentration_ug1ul) as MinDrugConc,
				MAX(drugconcentration_ug1ul) as MaxDrugConc, 
				max(formulationLotID) as FormulationLot, 
				max(len_mm) as StLength,
				MAX(modelName) as StModel
			from AmpcData 
			group by shopOrderId ) DC02 on ltrim(rtrim(DC02.shopOrderId)) = ltrim(rtrim(wo.batchno ))
WHERE	(Wo.Project = @sSearchKey or wo.batchno = @sSearchKey)
		AND	(@nStentType = 0 or (@nStentType > 0 AND StentType = @nStentType))
ORDER by SS.stntserial 


GO
/****** Object:  StoredProcedure [dbo].[GetProductHierarchy]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Ashruf Ali
-- Create date: 02 - August - 2016
-- Description:	<Get List of Product Line for SubAssembly Materials
-- =============================================
CREATE PROCEDURE [dbo].[GetProductHierarchy]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	select PrdHierarchy, PHDesc from SAP_ProductHierarchy
	where PrdHierarchy IN ( Select distinct ProdHierarchy from SAP_Materials Where MtlType = 'HALB' )

END

GO
/****** Object:  StoredProcedure [dbo].[GetWeighingCycleParameter]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <27-July-2016>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[GetWeighingCycleParameter]
	@sWorkOrder			Varchar(20),
	@nPreOrPostCoat		Int     -- 1. PreCoat,  2. 15Min Dryp, 3.Post Dry,
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	
	SET NOCOUNT ON;
	
	DECLARE	@nWeighingCyle	Int
	
	DECLARE	@nPreWeighingCyle		Int
	DECLARE	@nPostWeighingCyle		Int
	DECLARE	@n15MinDryWeighingCyle	Int
	
	DECLARE	@sProductHierarchy	Varchar(18)
	DECLARE	@nCoatCycleValue	Int

	-- Select @nWeighingCyle = Case When @nPreOrPostCote = 1 then 1 Else 1 END
	
	
	select @sProductHierarchy = M.ProdHierarchy   
	From WorkOrders  W 
			Left Outer Join SAP_Materials M on M.ItemCode = W.Itemcode 
	where W.Project =  @sWorkOrder
	
	SELECT @sProductHierarchy = ISNULL(@sProductHierarchy,'*')

-- Check Values for Specific Work Order	
	
	Select Top 1 
		@nPreWeighingCyle = PreCoatCycle ,
		@nPostWeighingCyle = PostDryCycle ,
		@n15MinDryWeighingCyle = FifteenMinDryCycle 
	from WeighingCycleParameter 
	where WorkOrder = @sWorkOrder
	Order by ProductLine desc ,WorkOrder desc

	SELECT @nCoatCycleValue = 
			CASE @nPreOrPostCoat
				WHEN 1 THEN @nPreWeighingCyle
				WHEN 2 THEN @n15MinDryWeighingCyle
				WHEN 3 THEN @nPostWeighingCyle
				ELSE 0
			END 
			-- AS WeighingCount
-- 
	IF 	ISNULL(@nCoatCycleValue,0) = 0 
	BEGIN
		select Top 1 
			@nPreWeighingCyle = PreCoatCycle ,
			@nPostWeighingCyle = PostDryCycle ,
			@n15MinDryWeighingCyle = FifteenMinDryCycle 
		from WeighingCycleParameter 
		where  ProductLine = @sProductHierarchy
		Order by ProductLine desc ,WorkOrder desc

		SELECT @nCoatCycleValue = 
			CASE @nPreOrPostCoat
				WHEN 1 THEN @nPreWeighingCyle
				WHEN 2 THEN @n15MinDryWeighingCyle
				WHEN 3 THEN @nPostWeighingCyle
				ELSE 1
			END 
	END
	
	SELECT ISNULL(@nCoatCycleValue,1) as WeighingCount
	
    -- Insert statements for procedure here
	-- SELECT ISNULL(@nWeighingCyle,2) as WeighingCount
END





GO
/****** Object:  StoredProcedure [dbo].[GetWorkOrderDetails]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE Procedure [dbo].[GetWorkOrderDetails]
		@sSearchKey		Varchar(20)

AS

	SET @sSearchKey = @sSearchKey + '%'

	SELECT distinct ZZ.*,
			case FrmDrugRatioPostWt when 0 then 0 else (NormDose * (1 - FrmDrugRatioPostWt)/ FrmDrugRatioPostWt) end as 'NomPLAPostWt', 
			case FrmDrugRatioFifteenWt when 0 then 0 else (NormDose * (1 - FrmDrugRatioFifteenWt)/ FrmDrugRatioFifteenWt) end as 'NomPLAFifteenWt', 
			case FrmDrugRatioPostWt when 0 then 0 else (NormDose + (NormDose * (1 - FrmDrugRatioPostWt)/ FrmDrugRatioPostWt)) end as 'NomTotalPostWt', 
			case FrmDrugRatioFifteenWt when 0 then 0 else (NormDose + (NormDose * (1 - FrmDrugRatioFifteenWt)/ FrmDrugRatioFifteenWt)) end as 'NomTotalFifteenWt'

	from 
	(
		SELECT	w.project as Project,
				w.project as WorkOrderNo,
				W.wodate as StartDate,
				ISNULL(w.itemcode,'') as Itemcode,
				ISNULL(w.batchno,'') as BatchNo,
				ISNULL(I.description,'') as ItemDescription,
				ISNULL(H.len_mm,H.doseDefiningLen_mm ) as StntLength,
				ISNULL(H.formulationLotId, '') as FormlnBatch,
				ISNULL((select max(ic.itemclass) from Itemclassifications ic where w.itemcode like ic.prefix+'%'), '') as ItemClass,
				ISNULL(cast(left(I.class05,(patindex('%mm%',I.class05)-1)) as numeric(5,2)),0.0) as ItemStntLength,
				w.PlanQty as QtyActual,
				w.Quantity as QtyCompleted,   -- QtyBudget,
				w.wodate as StartTime,
				ISNULL(sd.prefix,'') as SerialPrefix,
				ISNULL(sd.suffix,'') as SerialSuffix,
				NormDose = (select max(dose) from NomDoseSpec where slength = isnull(H.len_mm,doseDefiningLen_mm)) , 
				ISNULL(( select  round(AVG(drugconcentration_ug1ul),4)
						from dbo.AmpcData D where D.ShopOrderId = w.BatchNo ),0) as FConcentration,
				ISNULL(( select  round(AVG(dose_ug),4)
						from dbo.AmpcData D 
								Left outer join stentSerials S on D.StentId = S.stntserial 
						where D.ShopOrderId = w.BatchNo and S.stenttype = 1 ),0) as Actual_AvgDose,
				ISNULL(( select  round(AVG(dose_ug),4)
						from dbo.AmpcData D 
								Left outer join stentSerials S on D.StentId  = S.stntserial 
						where D.ShopOrderId = w.BatchNo and S.stenttype = 2 ),0) as Dummy_AvgDose,

				ISNULL((select  (round(AVG( case when (F.fifteenwt - F.prewt) = 0 then 0 else (D.dose_ug/((F.fifteenwt - F.prewt) * 1000))END ),4,2))
						from dbo.AmpcData D 
								Left outer join VwElectronicForm  F on D.StentId = F.stntserial 
						where D.ShopOrderId = w.BatchNo and F.stenttype = 'DUMMY'),0) as  FrmDrugRatioFifteenWt,


			
				ISNULL((Am.FormnDrugRatio),0) as FrmDrugRatioPostWt,

			
				ISNULL((select  round(MIN(((F.fifteenwt - F.prewt) * 1000)),4,2)
						from dbo.AmpcData D 
								Left outer join VwElectronicForm  F on D.stentId = F.stntserial 
						where D.ShopOrderId = w.BatchNo ),0) as  MinimumFifteenWt,

				ISNULL((select  round(MIN(((F.postwt - F.prewt) * 1000)),4,2)
						from dbo.AmpcData D 
								Left outer join VwElectronicForm  F on D.stentId = F.stntserial 
						where D.ShopOrderId = w.BatchNo and F.stenttype = 'NORMAL'),0) as  MinimumPostWt,

				ISNULL((select  round(MAX(((F.fifteenwt - F.prewt) * 1000)),4,2)
						from dbo.AmpcData D 
								Left outer join VwElectronicForm  F on D.StentId = F.stntserial 
						where D.ShopOrderId = w.BatchNo ),0) as  MaximumFifteenWt,

				ISNULL((select  round(MAX(((F.postwt - F.prewt) * 1000)),4,2)
						from dbo.AmpcData D 
								Left outer join VwElectronicForm  F on D.stentId = F.stntserial 
						where D.ShopOrderId = w.BatchNo and F.stenttype = 'NORMAL'),0) as  MaximumPostWt,

				ISNULL((select  count(F.fifteenwt)
						from dbo.AmpcData D 
								Left outer join VwElectronicForm  F on D.StentId = F.stntserial 
						where D.ShopOrderId = w.BatchNo ),0) as  TotalWeightedFifteenWt,

				ISNULL((select  count(F.postwt)
						from dbo.AmpcData D 
								Left outer join VwElectronicForm  F on D.StentId = F.stntserial 
						where D.ShopOrderId = w.BatchNo  and F.stenttype = 'NORMAL'),0) as  TotalWeightedPostWt,

				ISNULL((select  round(case when avg(F.fifteenwt - F.prewt) = 0 then 0 else ((stdev((F.fifteenwt - F.prewt) * 1000)) / (avg((F.fifteenwt - F.prewt) * 1000))) end ,4,2)
						from dbo.AmpcData D 
								Left outer join VwElectronicForm  F on D.StentId = F.stntserial 
						where D.ShopOrderId = w.BatchNo ),0) as  RelStdDevFifteenWt,

				ISNULL((select round(case when avg(F.postwt - F.prewt) = 0 then 0 else ((stdev((F.postwt - F.prewt) * 1000)) / (avg((F.postwt - F.prewt) * 1000))) end ,4,2)
						from dbo.AmpcData D 
								Left outer join VwElectronicForm  F on D.StentId = F.stntserial 
						where D.ShopOrderId = w.BatchNo  and F.stenttype = 'NORMAL'),0) as  RelStdDevPostWt,

				ISNULL((SELECT	AVG(M.NetWt) FROM (
									SELECT MIN(c1) AS NetWt FROM (
												SELECT TOP 50 PERCENT ((round(F.fifteenwt,2,2) - round(F.prewt,2,2)) * 1000) AS c1 
												FROM	VwElectronicForm  F  where F.fgwono =  w.project 
														and ((F.fifteenwt - F.prewt) * 1000)  > 0 
									ORDER BY c1 DESC) tbl1  --where c1 <>  0 
									UNION ALL
									SELECT MAX( c1 ) AS NetWt FROM (
													SELECT TOP 50 PERCENT ((round(F.fifteenwt,2,2) - round(F.prewt,2,2)) * 1000)  AS c1 
													FROM	VwElectronicForm  F where F.fgwono =  w.project 
															and ((F.fifteenwt - F.prewt) * 1000) > 0
									ORDER BY c1) tbl2 --where c1 >  0 
									) M ),0) as MedianFifteenWt,

				ISNULL((SELECT	AVG(M.NetWt) FROM (
									SELECT MIN(c1) AS NetWt FROM (
												SELECT TOP 50 PERCENT ((round(F.postwt,2,2) - round(F.prewt,2,2)) * 1000) AS c1 
												FROM	VwElectronicForm  F  where F.stwono =  w.project and F.stenttype = 'NORMAL'
														and ((F.postwt - F.prewt) * 1000)  > 0 
									ORDER BY c1 DESC) tbl1  --where c1 <>  0 
									UNION ALL
									SELECT MAX( c1 ) AS NetWt FROM (
													SELECT TOP 50 PERCENT ((round(F.postwt,2,2) - round(F.prewt,2,2)) * 1000)  AS c1 
													FROM	VwElectronicForm  F where F.stwono =  w.project and F.stenttype = 'NORMAL'
															and ((F.postwt - F.prewt) * 1000) > 0
									ORDER BY c1) tbl2 --where c1 >  0 
									) M ),0) as MedianPostWt,

				TotalGood = ISNULL((select count(stntserial) from StentSerials where stwono = W.project and inspnstatus = 1 ),0),
				TotalBad = ISNULL((select count(stntserial) from StentSerials where stwono = W.project and inspnstatus = 0 ),0),
				TotalCount = ISNULL((select count(stntserial) from StentSerials where stwono = W.project and stenttype = 1 and status = 1),0),
				TotalDummyCount = ISNULL((select count(stntserial) from StentSerials where stwono = W.project and stenttype = 2 and status = 1),0)

		from	WorkOrders w	left outer join ItemMaster I on I.itemcode = w.itemcode 
								LEFT OUTER JOIN SerialsDefinition sd on ltrim(rtrim(sd.prdline)) = ltrim(rtrim(I.class03))
								LEFT OUTER JOIN AmpcData H on H.ShopOrderId = w.BatchNo
								LEFT OUTER JOIN ElectronicSheetH Am on Am.wono = w.Project 
								
		WHERE	w.Project like @sSearchKey  or w.batchno  like @sSearchKey 
) ZZ


GO
/****** Object:  StoredProcedure [dbo].[InsertHandlingUnits]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[InsertHandlingUnits] 
(
	@DONumber varchar(12),
	@NumToCreate int,
    @PackMaterial varchar(18),
    @CreatedBy varchar(20),
    @BUnit varchar(10),
    @CreatedOn varchar(22)
)
AS
--insert or update for table BX_PackHUnits
DECLARE 
    @nth int,
    @LatestHUNumber bigint,
    @HUNumber bigint,
    @Prefix char(1)
    select @Prefix=Prefix,@LatestHUNumber=LatestHUNumber from dbo.BX_LatestPackHUnits where BUnit=@BUnit
    SET @HUNumber = CAST(@Prefix+SUBSTRING(@CreatedOn,3,6)+'00000' AS bigint);
    IF (@HUNumber<=@LatestHUNumber)
      SET @HUNumber = @LatestHUNumber+1;

SET @nth=1
    while 1=1
    BEGIN
 --       IF NOT EXISTS (SELECT HUNumber from dbo.BX_PackHUnits where HUNumber = @HUNumber)
            INSERT INTO dbo.BX_PackHUnits(DONumber,HUNumber,PackMaterial,CreatedBy,CreatedOn)
                VALUES (@DONumber,@HUNumber,@PackMaterial,@CreatedBy,Convert(datetime,@CreatedOn))
        IF (@nth=@NumToCreate) break;
		SET @nth=@nth+1
		SET @HUNumber=@HUNumber+1

        continue;
    END
    UPDATE dbo.BX_LatestPackHUnits SET LatestHUNumber=@HUNumber WHERE BUnit=@BUnit

	SELECT * FROM dbo.BX_PackHUnits where DONumber = @DONumber
    --Print 'insert  BX_PackHUnits done!'
GO
/****** Object:  StoredProcedure [dbo].[InsertOrUpdateDO]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[InsertOrUpdateDO] 
(
	@DONumber varchar(12),
	@DOCreationDate varchar(10),
	@DOCreationUser varchar(20),
	@Plant varchar(4),
	@ShipToCustomer varchar(12),
	@DOStatus char(1),
	@PackStart varchar(22),
	@SAPRefNo varchar(20)=NULL,
    @DOItemNumberList varchar(3500),
    @MaterialCodeList varchar(8000),
    @BatchNumberList varchar(5500),
    @VendorBatchList varchar(8000),
    @DOQuantityList varchar(2000)
)
AS
--insert or update for table SAP_DOHeader
BEGIN
	IF EXISTS (SELECT DONumber from dbo.SAP_DOHeader where DONumber = @DONumber )
		BEGIN
			UPDATE dbo.SAP_DOHeader 
				SET DOCreationDate	 = Convert(datetime,@DOCreationDate) ,
					DOCreationUser = @DOCreationUser ,
					Plant = @Plant ,
					ShipToCustomer	 = @ShipToCustomer ,
					DOStatus  = @DOStatus
			WHERE	DONumber = @DONumber
		END
	ELSE
		INSERT INTO dbo.SAP_DOHeader(DONumber,DOCreationDate,DOCreationUser,Plant,ShipToCustomer,DOStatus)
			VALUES (@DONumber,Convert(datetime,@DOCreationDate),@DOCreationUser,@Plant,@ShipToCustomer,@DOStatus)

--insert record to PackHeader with PackStart if HU List is empty
	IF NOT EXISTS (SELECT DONumber from dbo.BX_PackHUnits where DONumber = @DONumber )
	BEGIN
		DELETE FROM dbo.BX_PackHeader WHERE DONumber = @DONumber
		INSERT INTO dbo.BX_PackHeader (DONumber,PackStart,PackStatus,SAPRefNo)
			VALUES (@DONumber,Convert(datetime,@PackStart),1,@SAPRefNo)
	END

--insert or update for table SAP_DODetail
DECLARE 
    @nth int,
    @DOItemNumber varchar (6),
    @MaterialCode varchar (18),
    @BatchNumber varchar (10),
    @VendorBatch varchar (20),
    @DOQuantity varchar (22)
    --@uncompleted bit;

SET @nth=1
    --@uncompleted='true';
    while 1=1
    BEGIN
        SET @DOItemNumber = (select dbo.nth_occur(@DOItemNumberList,',',@nth));
        IF LEN(ISNULL(@DOItemNumber, '')) = 0 break;
        SET @MaterialCode = (select dbo.nth_occur(@MaterialCodeList,',',@nth));
        SET @BatchNumber = (select dbo.nth_occur(@BatchNumberList,',',@nth));
        SET @VendorBatch = (select dbo.nth_occur(@VendorBatchList,',',@nth));
        SET @DOQuantity = (select dbo.nth_occur(@DOQuantityList,',',@nth));

		--delete old records and insert new one
		DELETE FROM dbo.SAP_DODetail WHERE DONumber = @DONumber and DOItemNumber=@DOItemNumber

        INSERT INTO dbo.SAP_DODetail(DONumber,DOItemNumber,MaterialCode,BatchNumber,VendorBatch,DOQuantity)
         VALUES (@DONumber,@DOItemNumber,@MaterialCode,@BatchNumber,@VendorBatch, CAST(@DOQuantity AS NUMERIC(18,4)))

		SET @nth=@nth+1
        continue;
    END

    PRINT 'insert or update of DOHeader and DODetail done!'
	END
GO
/****** Object:  StoredProcedure [dbo].[InsertOrUpdatePacking]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[InsertOrUpdatePacking] 
(
	@DONumber varchar(12),
	@EANCode varchar(20),
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
                        EANCode varchar(20),
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
 --       IF (@SerialNo is NULL) AND 
 --           EXISTS (SELECT DONumber from dbo.BX_PackDetails 
 --                   WHERE	SerialNo is NULL AND
 --                           DONumber=@DONumber and 
 --                           DOItemNumber=@DOItemNumber and
 --                           HUNumber=@HUNumber and 
 --                           MaterialCode=@MaterialCode and 
 --                           BatchNo=@BatchNo and 
	--						BinNumber=@BinNumber and 
 --                           PackBy=@PackBy and
 --                           PackedOn=@PackedOn)
	--	BEGIN
	--		UPDATE dbo.BX_PackDetails 
	--			SET ScanQty = @Qty+ ScanQty
	--		WHERE	DONumber=@DONumber and 
 --                   DOItemNumber=@DOItemNumber and
 --                   HUNumber=@HUNumber and 
 --                   MaterialCode=@MaterialCode and 
 --                   BatchNo=@BatchNo and 
	--				BinNumber=@BinNumber and 
 --                   PackBy=@PackBy and
 --                   PackedOn=@PackedOn and 
	--				SerialNo is NULL
	--	END
	--ELSE
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
	--SELECT * FROM dbo.BX_PackDetails where DONumber=@DONumber

END

GO
/****** Object:  StoredProcedure [dbo].[InsertOrUpdateWO]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE Procedure [dbo].[InsertOrUpdateWO]
		@Project	Varchar(20),
		@WoDate		Varchar(10),
		@ItemCode	varchar(30),
		@ActualQty	Numeric(18,0),
		@PlanQty	Numeric(18,0),
		@BatchNo	varchar(12)
AS



	IF EXISTS (SELECT project from WorkOrders where Project = @Project )
		BEGIN
			UPDATE WorkOrders 
				SET wodate	 = Convert(datetime,@WoDate) ,
					Itemcode = @ItemCode ,
					Quantity = @ActualQty ,
					PlanQty	 = @PlanQty ,
					batchno  = @BatchNo
			WHERE	Project = @Project
		END
	ELSE
		INSERT INTO WorkOrders(Project,wodate,itemcode,quantity,planqty,batchno)
			VALUES (@project,Convert(datetime,@WoDate),@itemcode,@actualQty,@PlanQty,@BatchNo)
			

GO
/****** Object:  StoredProcedure [dbo].[IsValidScanCodes]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO






-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[IsValidScanCodes]
		@sWorkOrder			varchar(20),
		@sScanCode1			Varchar(60),
		@sScanCode2			Varchar(60),
		@sOperation			Varchar(12)

AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	DECLARE	@IsValidSerials		Int
	DECLARE	@sErrorMessages		Varchar(300) = ''
	DECLARE	@nErrorNumber		Int = 0
	DECLARE	@sExistingSerial	Varchar(12)
	DECLARE	@sSerialNo			Varchar(12)
	DECLARE		@sIsUDIDisabled		Int = 0
	DECLARE		@sScanCodeType		Char(1) = 'S'   --  S - Short Code (Only Serial No),  L - Long Code (Full UDI Code)

	DECLARE	@nAutoAssignedFG	Int = 0

	SET	@sSerialNo = Right(ltrim(Rtrim(@sScanCode1)),9)


	Select @sExistingSerial = Srlno1 
	from OperationLogs
	where Srlno1 =  @sSerialNo AND oprn = @sOperation


	SET	@sSerialNo = Right(ltrim(Rtrim(@sScanCode1)),9)

	SET @nAutoAssignedFG = dbo.[FnIsAutoAssignAllowed] (@sWorkOrder)    --  = 1 :  Chroma - Scan both Same barcodes, 0 otherwise

	Select @sExistingSerial = Srlno1 
	from OperationLogs
	where Srlno1 =  @sSerialNo AND oprn = @sOperation
			-- AND [status] = @nAcceptOrReject

	 Select @sIsUDIDisabled = dbo.[IsUDIExceptionExists] (@sworkOrder)

	 SET @sScanCodeType =	CASE 
								WHEN   (ISNULL(@sIsUDIDisabled,0)  = 1 OR @sOperation = 'CRMP' ) 
								THEN 'S' 
								ELSE 'L' 
							END

	--If @sScanCodeType = 'L'
	--	BEGIN
	--		SET @nBoxFullScanCode = CASE WHEN len(@sscancode1) > len(@sscancode2) THEN @sScanCode1 ELSE @sScanCode2 END
	--	END
	--ELSE
	--	SET @nBoxFullScanCode =  @sScanCode1

	SET @IsValidSerials = 
	CASE	WHEN ( @sScanCodeType = 'S'  AND @nAutoAssignedFG = 0 )    -- Non UDI , Scan Short Barcode Label
				 AND ( @sScanCode1 <> @sScanCode2  OR (Len(@sScanCode1) > 9 OR Len(@sScanCode2) > 9 ))
				THEN 0
				ELSE 
					CASE	WHEN (@sScanCodeType = 'L' AND @nAutoAssignedFG = 0 )  -- UDI, Scan Long & Short Barcode Labels except Chroma 
									AND NOT (Right(@sScanCode1,9) = Right(@sScanCode2,9) AND len(@sScanCode1) <> Len(@sScanCode2))
							THEN 0
							ELSE 
								CASE WHEN (@sScanCodeType = 'L' AND @nAutoAssignedFG = 1 )  -- UDI, Scan Both Long/short  Barcode Labels for  Chroma
											AND  (@sScanCode1 <> @sScanCode2 )
									THEN 0 
									ELSE 1
								END
					END
		END

	--SET @IsValidSerials = 
	--CASE	WHEN ( @sScanCodeType = 'S' )
	--			 AND ( @sScanCode1 <> @sScanCode2  OR (Len(@sScanCode1) > 9 OR Len(@sScanCode2) > 9 ))
	--			THEN 0
	--			ELSE 
	--				CASE	WHEN (@sScanCodeType = 'L')
	--								AND NOT (Right(@sScanCode1,9) = Right(@sScanCode2,9) AND len(@sScanCode1) <> Len(@sScanCode2))
	--						THEN 0
	--						ELSE 1
	--				END
	--	END

	if @IsValidSerials = 0 AND ISNULL(@sExistingSerial,'') = ''
		BEGIN
			SET @nErrorNumber = -999
			SET @sErrorMessages =  'Error : Mismatched Scanning, Try again... ' ;
			-- THROW 51000, @sErrorMessages, 1;
			-- RAISERROR (@sErrorMessages ,16,1 );
		END	
	ELSE
		BEGIN
			SET @sExistingSerial = NULL
			SELECT	@sExistingSerial = stntserial 
			FROM	StentsByFG 
			WHERE	stntserial = Right(@sScanCode1,9) and fgwono = @sWorkOrder
					-- AND [status] = @nAcceptOrReject
			IF ISNULL(@sExistingSerial,'') = '' 
			BEGIN
				SET @nErrorNumber = -999
				SET @sErrorMessages =  'Error :Serial No ' + Right(@sScanCode1,9) + ' does not exists for this Workorder '  ;
			END 					
		END
	--SET @IsValidSerials = 
	--	CASE	WHEN @sOperation = 'CRMP' AND ( @sScanCode1 <> @sScanCode2  OR (Len(@sScanCode1) > 9 OR Len(@sScanCode2) > 9 ))
	--			THEN 0
	--			ELSE 
	--				CASE	WHEN (@sOperation = 'SEAL' OR @sOperation = 'BOX')
	--								AND NOT (Right(@sScanCode1,9) = Right(@sScanCode2,9) AND len(@sScanCode1) <> Len(@sScanCode2))
	--						THEN 0
	--						ELSE 1
	--				END
	--	END
	--if @IsValidSerials = 0 AND ISNULL(@sExistingSerial,'') = ''
	--	BEGIN
	--		SET @nErrorNumber = -999
	--		SET @sErrorMessages =  'Error : Mismatched Scanning, Try again... ' ;
	--	END
	--ELSE
	--	BEGIN
	--		SET @sExistingSerial = NULL
	--		SELECT	@sExistingSerial = stntserial 
	--		FROM	StentsByFG 
	--		WHERE	stntserial = Right(@sScanCode1,9) and fgwono = @sWorkOrder
	--				-- AND [status] = @nAcceptOrReject
	--		IF ISNULL(@sExistingSerial,'') = '' 
	--		BEGIN
	--			SET @nErrorNumber = -999
	--			SET @sErrorMessages =  'Error :Serial No ' + Right(@sScanCode1,9) + ' does not exists for this Workorder '  ;
	--		END 
	--	END		
	SELECT Case WHEN @sErrorMessages = '' THEN 0 ELSE -999 END as ErrorNumbers, @sErrorMessages as ErrorMessage 				
END
GO
/****** Object:  StoredProcedure [dbo].[PT_CreateDataReadLogDetail]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[PT_CreateDataReadLogDetail]
		@nSequenceNo		Int,
		@sHDRRowKey			Varchar(50)=NULL,
		@sDataFromMachine	Varchar(500)
AS
BEGIN

	SET NOCOUNT ON;
	
	Insert into PT_ReaderDataLog (TestDataHdrKey,LineSequence, [ReaderText]) 
		VALUES (@sHDRRowKey,@nSequenceNo, @sDataFromMachine)

END

GO
/****** Object:  StoredProcedure [dbo].[PT_CreateTestDataLogItems]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE  [dbo].[PT_CreateTestDataLogItems] 
		@sLogHdrRowKey	uniqueidentifier,
		@sItemBatch		Varchar(20),
		@sItemSerial	Varchar(12)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE	@nNextSeqnNo	Int = 0

	SELECT	@nNextSeqnNo  = MAX(SequenceNo) 
	FROM	PT_TestDataLogItems
	WHERE	-- TestHdrID = @sLogHdrRowKey  AND
			 BatchNo = @sItemBatch 

	SET @nNextSeqnNo = ISNULL(@nNextSeqnNo,0) + 1
	Insert into PT_TestDataLogItems (TestHdrID,BatchNo,SequenceNo,SerialNo)
	SELECT @sLogHdrRowKey,@sItemBatch , @nNextSeqnNo, @sItemSerial 

END
GO
/****** Object:  StoredProcedure [dbo].[PT_GetBurstReasonCode]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Ashruf >
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[PT_GetBurstReasonCode]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	SELECT [BurstReadonID] as ReasonCode
			,[BurstReasonDesc] as ReasonDesc
	 FROM  [PT_BurstReasonCodes]
	where isActive = 1 
END
GO
/****** Object:  StoredProcedure [dbo].[PT_GetPT1000Data4Reporting]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





--EXEC  [PT_GetPT1000Data4Reporting]  '' , '180907305'


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[PT_GetPT1000Data4Reporting] 
		@sBatchNo		Varchar(20),
		@sSerialNo		Varchar(10)='',
		@sTestType		Varchar(12)=''

AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	SELECT	I.BatchNo ,
			I.SerialNo,
			I.SequenceNo ,
			M.ItemCode ,
			M.ItemDesc ,
			H.EquipmentID ,
			H.BurstReason ,
			B.BurstReasonDesc ,
			H.Remarks,
			H.TestType, 
			ISNULL(TT.TestTypeDesc,'') as TestTypeDesc, 
			-- H.SerialNo,
			H.SingleWall,
			H.SterileType,
			H.TubingPart,
			H.CreatedBy, 
			H.ModifiedOn,
			D.LineSequence ,
			D.ReaderText 
	  FROM  PT_TestDataLogItems I
			left Outer Join	 [PT_ReaderDataLog] D on D.TestDataHdrKey = I.TestHdrID
			Left Outer Join  PT_TestDataLogHDR H On D.TestDataHdrKey = H.RowKey
			left Outer Join WorkOrders W on W.batchno = I.BatchNo 
			Left Outer Join SAP_Materials M on M.ItemCode = W.Itemcode  
			left Outer Join PT_BurstReasonCodes B on B.BurstReadonID = H.BurstReason
			Left Outer Join PT_TestTypes TT on TT.TestTypeID = H.TestType 
	--where D.rowkey =  'FDCEE984-A832-4DF1-816C-9EC44B633B4A'
	where	(ISNULL(@sBatchNo,'') = '' OR I.BatchNo = @sBatchNo)
			AND (ISNULL(@sTestType,'') = '' OR H.TestType = @sTestType )
			AND (ISNULL(@sSerialNo,'') = '' OR I.SerialNo = @sSerialNo )
			And D.LineSequence > 10
	order by I.BatchNo, I.SequenceNo, D.LineSequence 


END
GO
/****** Object:  StoredProcedure [dbo].[PT_GetTestTypes]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Ashruf >
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[PT_GetTestTypes]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	SELECT [TestTypeID] as TestTypeCode
			,[TestTypeDesc] as TestTypeDesc
	 FROM  [PT_TestTypes]
	where isActive = 1 
END
GO
/****** Object:  StoredProcedure [dbo].[PT_InitializeDataReadUpdates]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[PT_InitializeDataReadUpdates]
		@sRowKey			Varchar(50)=NULL,
		@sCurrentUser		Varchar(30)='',
		@sEquipmentID		Varchar(20),
		@sTestType			Varchar(12),

		@sBatchNo1			Varchar(20)='',
		@sBatchNo2			Varchar(20)='',
		@sBatchNo3			Varchar(20)='',
		@sBatchNo4			Varchar(20)='',
		@sBatchNo5			Varchar(20)='',
		@sSerialNo1			Varchar(10)='',
		@sSerialNo2			Varchar(10)='',
		@sSerialNo3			Varchar(10)='',
		@sSerialNo4			Varchar(10)='',
		@sSerialNo5			Varchar(10)='',

		@sSterileType		Varchar(30),
		@sTubingMaterial	Varchar(20),
		@sSingleWall		Varchar(30),
		@sBurstReason		Varchar(12),
		@sRemarks			nvarchar(300) = ''
AS
BEGIN

	SET NOCOUNT ON;
	DECLARE	@uRowKey		uniqueidentifier
	DECLARE	@nLoopCount		Int = 1

	if ISNULL(@sRowKey,'') = ''
		BEGIN
			SET		@uRowKey = NEWID()
			Insert into PT_TestDataLogHDR (
					 RowKey
					,[EquipmentID]
					--,[BatchNo]
					--,[SerialNo]
					,[TubingPart]
					,[SingleWall]
					,[SterileType]
					,[CreatedOn]
					,[CreatedBy]
					,[ModifiedOn]
					,[ModifiedBy]
					,ProcessStatus
					)
			VALUES (@uRowKey, @sEquipmentID,@sTubingMaterial ,@sSingleWall,@sSterileType ,GETDATE(),@sCurrentUser ,GETDATE(),@sCurrentUser, -1 )
			SET @sRowKey = Cast(@uRowKey as Varchar(50))
		
			if @sbatchno1 <> '' 
				exec dbo.[PT_CreateTestDataLogItems] @uRowKey, @sBatchNo1 ,@sSerialNo1 
			if @sBatchNo2 <> ''
				exec dbo.[PT_CreateTestDataLogItems] @uRowKey, @sBatchNo2 ,@sSerialNo2 
			if @sBatchNo3 <> ''
				exec dbo.[PT_CreateTestDataLogItems] @uRowKey, @sBatchNo3 ,@sSerialNo3 
			if @sBatchNo4 <> ''
				exec dbo.[PT_CreateTestDataLogItems] @uRowKey, @sBatchNo4 ,@sSerialNo4 
			if @sBatchNo5 <> ''
				exec dbo.[PT_CreateTestDataLogItems] @uRowKey, @sBatchNo5 ,@sSerialNo5
		END
	ELSE
		BEGIN
			Update PT_TestDataLogHDR
				SET ProcessStatus = 1 ,  -- Completed
					BurstReason = @sBurstReason ,
					Remarks = @sRemarks 
			WHERE	cast(rowkey as Varchar(50)) = @sRowKey 
		END

		
		SELECT  ISNULL(@sRowKey,'')  as NewRowKey

END


GO
/****** Object:  StoredProcedure [dbo].[PT_SPGetWorkOrderDetails]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO






-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[PT_SPGetWorkOrderDetails]
		@sProductSerialNo		Varchar(10)=NULL,
		@sBatchOrWorkOrder		Varchar(30)=NULL
AS
BEGIN

	SET NOCOUNT ON;
	DECLARE		@sSelectedSrialNo		Varchar(10)=''
	DECLARE		@sSelectedBatchNo		Varchar(20)=''

	BEGIN TRY 
		if  ISNULL(@sProductSerialNo,'') <> ''
			BEGIN
				Select @sSelectedSrialNo = F.stntserial, 
						@sSelectedBatchNo = F.fgwono  
				from StentsByFG  F
				WHERE	F.stntserial = @sProductSerialNo 
			END


		SET @sSelectedSrialNo = ISNULL(@sSelectedSrialNo,'')
		SET @sSelectedBatchNo =  CASE WHEN ISNULL(@sSelectedBatchNo,'') = '' THEN @sBatchOrWorkOrder ELSE @sSelectedBatchNo END 

		if  (ISNULL(@sSelectedBatchNo,'') = '' AND ISNULL(@sSelectedSrialNo,'') = '' )
			BEGIN
			RAISERROR ('Serial No/Batch No Doesnot Exists', 16, 1 )  ;
			END
		ELSE
			BEGIN	
			SELECT	@sSelectedSrialNo as SerialNo, W.Project as WorkOrder, W.ItemCode as Material,W.batchno ,
					M.ItemDesc as MaterialDesc
			From	WorkOrders W 
					Left Outer Join SAP_Materials M on M.ItemCode = W.Itemcode 
			where	ltrim(rtrim(w.batchno )) = @sSelectedBatchNo
				OR ltrim(rtrim(w.Project)) = @sSelectedBatchNo
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


        RAISERROR (@ErrorMessage, -- Message text.  
                @ErrorSeverity, -- Severity.  
                @ErrorState -- State.  
                );  
    END CATCH; 
END
GO
/****** Object:  StoredProcedure [dbo].[SP_AssignStents2FinalWorkOrder]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_AssignStents2FinalWorkOrder]
		@sInitialStentSerial		varchar(20),
		-- @sStentBatch				Varchar(20) = NULL,
		@sFinalWorkOrder			Varchar(20) ,
		@nToBeAssignedCount				Int ,
		@sLogonUserID				Varchar(30)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE	@sStentBatch		Varchar(20)

	Select  @sStentBatch = Stbatch 
	From stentSerials 
	where stntserial = @sInitialStentSerial

-- 180419493	1		210000085581	W18040344

Select	cast(1 as bit) as Assign,
		ZZ.SerialNo,
		@sFinalWorkOrder as FinalWorkOrder,
		@sLogonUserID as LogonUser
From
(
	SELECT	row_number() over (partition by stwono order by StntSerial ) as seqnum ,
			 stntserial as SerialNo,
			--@sFinalWorkOrder as FinalWordOrder,
			'' as FinalWordOrder,
			'' as LogonUser
			-- @sLogonUserID as LogonUser
	from stentSerials 
	where stntserial >=  @sInitialStentSerial
		AND stbatch = @sStentBatch
		and [Status] = 1 
		and StentType = 1 
		AND stntserial NOT IN (
					SELECT F.stntserial  
					FROM	StentsByFG F 
								Left Outer Join stentSerials S on S.stntserial = F.stntserial 
					WHERE s.stbatch = @sStentBatch )

) ZZ		
where ZZ.seqnum <= @nToBeAssignedCount

END
GO
/****** Object:  StoredProcedure [dbo].[SP_AutoAssignStentSerial2FG]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO









-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	Auto Assign Stent Serial for those items, where there is NO Coating Process, Serial Nos generated @ FG LEvel
-- =============================================
CREATE PROCEDURE [dbo].[SP_AutoAssignStentSerial2FG]
		-- @sInitialStentSerial		varchar(20),
		-- @sStentBatch				Varchar(20) = NULL,
		@sFinalWorkOrder			Varchar(20) ,
		@nToBeAssignedCount				Int ,
		@sLogonUserID				Varchar(30)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE	@sInitialStentSerial	varchar(20)
	DECLARE	@sStentBatch			Varchar(20)


	IF dbo.[FnIsAutoAssignAllowed](@sFinalWorkOrder ) = 1    -- Check if the Final Workorder is without Coating Process (e.g Chroma)
	BEGIN
		Select  Top 1  
				@sStentBatch = Stbatch ,
				@sInitialStentSerial = stntserial 
		From stentSerials 
		where stwono = @sFinalWorkOrder 
		order by stwono ,stntserial
	 
	-- 180419493	1		210000085581	W18040344
		-- Select * from stentSerials where stwono = '210000084468'
	
		if ISNULL(@sInitialStentSerial,'') <> ''
		BEGIN
			--  Select top 10 * from StentsByFG 
			Insert into StentsByFG (stntserial ,fgwono ,assignedby ,assignedon ,status )
			Select	
					-- cast(1 as bit) as Assign,
					ZZ.SerialNo,
					@sFinalWorkOrder as FinalWorkOrder,
					@sLogonUserID as LogonUser,
					getdate(), 1
			From
			(
				SELECT	row_number() over (partition by stwono order by StntSerial ) as seqnum ,
						 stntserial as SerialNo,
						--@sFinalWorkOrder as FinalWordOrder,
						'' as FinalWordOrder,
						'' as LogonUser
						-- @sLogonUserID as LogonUser
				from stentSerials 
				where stntserial >=  @sInitialStentSerial
					AND stwono = @sFinalWorkOrder 
					and [Status] = 1 
					and StentType = 1 
					AND stntserial NOT IN (
								SELECT F.stntserial  
								FROM	StentsByFG F 
											Left Outer Join stentSerials S on S.stntserial = F.stntserial 
								WHERE s.stwono  = @sFinalWorkOrder )   -- For Chroma, Both Stent & FG Serials are same, No Coating Workorder exist

			) ZZ		
			where ZZ.seqnum <= @nToBeAssignedCount

			-- Generate CRMP operation for those without Coating Process ( Chroma )

			Insert into OperationLogs (Wono,Oprn,Srlno1,srlno2,status,crby,crdt,mdby,mddt,shipto )
			Select fgwono, 'CRMP',stntserial,stntserial, 1,'biotrack',getdate(),'biotrack',getdate(),0
			from stentsbyFG
			where fgwono = @sFinalWorkOrder
				AND stntserial NOT IN (Select srlno1 from OperationLogs where fgwono = @sFinalWorkOrder AND oprn = 'CRMP' )

		END
	END
END
GO
/****** Object:  StoredProcedure [dbo].[SP_CheckAndCreateSubConPO]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_CheckAndCreateSubConPO]
		@sSubConPONumber	Varchar(20),
		--@sSubConPOLine		Varchar(6),
		--@sBatchNumber		Varchar(10) = NULL,
		--@sBatchQty			Int,
		@sLogonUser			Varchar(30),
		@sCheckOnly			Char(1)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE	@sCurrPONumber		Varchar(20)
	DECLARE	@sCurrPoLineNo		Varchar(6)
	DECLARE	@sCurrBatch			Varchar(10)
	DECLARE	@sCurrBatchQty		Int
	DECLARE	@sCurrStatus		Char(1)
	DECLARE	@sErrorMessages		Varchar(300) = ''
	DECLARE	@nErrorCount		Int = 0

	BEGIN TRY
		Select	@sCurrPONumber = PoNumber, 
				@sCurrPoLineNo = PoLineNO,
				@sCurrBatch = BatchNo,
				@sCurrBatchQty = BatchQty, 
				@sCurrStatus = StatusID
		From	SAP_SubConPO 
		where	PoNumber = @sSubConPONumber 

		IF ISNULL(@sCurrPONumber,'') = ''
		BEGIN
			if @sCheckOnly = 'X'
				BEGIN
					SET @sErrorMessages = N'Error : PO Number Does not Exists' + ISNULL(@sSubConPONumber,'')  ;
					SET @nErrorCount = @nErrorCount + 1;
					-- THROW 51000, @sErrorMessages, 1;
					RAISERROR (@sErrorMessages ,16,1 );
				END
			ELSE
				BEGIN
					Insert into SAP_SubConPO (PONumber,POLineNo,BatchNo,BatchQty,StatusID,Createdon,CreatedBy) 
					SELECT @sSubConPONumber , '000000','' ,0 ,0,getdate(),''
				END
		END
	END TRY
	BEGIN CATCH
		SET @nErrorCount = ERROR_NUMBER()
		SET @sErrorMessages = ERROR_MESSAGE();
	END CATCH
	SELECT @nErrorCount as ErrorCount, @sErrorMessages as ErrorMessages,@sCurrPONumber as PONumber 
END
GO
/****** Object:  StoredProcedure [dbo].[SP_DecodeBoxBarcode]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_DecodeBoxBarcode]
		@sScanCode		Varchar(60),
		@sFieldType		Int = 21      -- 01 - EAN Code, 10 - BatchNo, 17 - ExpiryDate, 21 - Serial No 
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE		@sOutPutValue	Varchar(30)

	SET	@sOutPutValue =  
		CASE	WHEN	Len(@sScanCode) <= 10  THEN @sScanCode 
				WHEN	Len(@sscancode) > 10 and Left(Right(@sScanCode,11),2) = '21' THEN Right(@sScanCode,9)
				ELSE	@sScanCode
		END 

    -- Insert statements for procedure here
	SELECT @sOutPutValue as DecodedValue
END	
GO
/****** Object:  StoredProcedure [dbo].[sp_DisplayAllAMPCs]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




CREATE procedure [dbo].[sp_DisplayAllAMPCs] @FGWoNo varchar(12)    -- sp_DisplayAllAMPCs 'Z60480020653'
AS

DECLARE @ampc VARCHAR(500)		

SELECT    @ampc =  ISNULL(@ampc + ',', '') + cast(cast(a.ampc as int) as varchar(3))
	FROM (	Select distinct top 50 cast(ampc as int) as ampc 
			from	VwElectronicForm  
			where	(stwono=@FGWoNo or StentBatch = @FGWoNo)  
					and ampc <> 99999 
					AND ISNULL(ampc,'') <> ''
			order by cast(ampc as int)) a	
	order by ampc	-- fgwono='Z60480014304' and
 
SELECT  ampcresult = ISNULL(@ampc,'')

--select * from vwelectronicform order by cast(ampc as int)
--Select distinct top 10 cast(ampc as int) from VwElectronicForm  where  stwono='Z60480020653' and ampc <> 99999 order by cast(ampc as int)





GO
/****** Object:  StoredProcedure [dbo].[SP_GenerateDummySerials]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_GenerateDummySerials]
		@sWorkOrder			Varchar(20),
		@sBatchNo			Varchar(10)

AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE	@nTotalDummyCount		Int = 15
	DECLARE @sDummySerialString		Varchar(20)
	DECLARE	@nSerialToBeCreated		Int

	SET @nSerialToBeCreated = 1
	WHILE @nSerialToBeCreated <= @nTotalDummyCount
	BEGIN
		SET @sDummySerialString =  ltrim(rtrim(@sBatchNo)) +'-' + Right('00' + Cast(@nSerialToBeCreated as Varchar(3)),2)
		INSERT INTO StentSerials(stntserial,status,stwono,stbatch,stenttype,createdby,createddate,modifiedby,modifieddate,pcount) 
				VALUES (@sDummySerialString,1,@sWorkOrder,@sBatchNo,2,'', getdate(),'', getdate(), '0') 
    -- Insert statements for procedure here
		SET @nSerialToBeCreated = @nSerialToBeCreated + 1
	END
END
GO
/****** Object:  StoredProcedure [dbo].[SP_GetCoatedStentSerialNos_zz]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_GetCoatedStentSerialNos_zz]
		@sWorkOrderNo	Varchar(20)
AS

select	stntserial as SerialNo,
		stbatch as BatchNo
from	stentSerials 
where  stwono = @sWorkOrderNo or stbatch = @sWorkOrderNo
Order by stntserial 


GO
/****** Object:  StoredProcedure [dbo].[SP_GetDetailsOnSerialNo]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_GetDetailsOnSerialNo]
		@sStentSerial		varchar(20) 
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	SELECT stntserial as SerialNo,
			stwono as StentWorkOrder,
			stbatch as StentBatch
	from stentSerials 
	where stntserial =  @sStentSerial and [Status] = 1 and StentType = 1 
		
END
GO
/****** Object:  StoredProcedure [dbo].[SP_GetListofScannedSerials]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO






-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_GetListofScannedSerials]
		@sWorkOrder			Varchar(20),
		@sOperation			Varchar(12)='',
		@sAcceptOrReject	Int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	DECLARE	@sErrorMessages	Varchar(100)	

	BEGIN TRY

	if @sAcceptOrReject = 1
	BEGIN
		select	O.srlno1 as [Serial No], 
				b.userid   as [Scanned By],
				convert(varchar,O.crdt) as [Scanned Date],
			CASE  ISNULL(S.ShipToTarget,'') 
					WHEN 'SGW' THEN 'Singapore - SGW'
					WHEN 'SGQ' THEN 'QA - SGQ'
					WHEN 'CHW' THEN 'BESA - CHW'
					ELSE ''
			END as Ship2Target
		-- srlno1 as [Serial No],  srlno2,wono 
		from OperationLogs O 
			Left Outer Join BX_SubconShipments S on S.workorder = O.wono 
					and S.SerialNo = O.srlno1 
					AND O.oprn  = 'BOX'
			left outer join Users b on O.crby=b.userid
		where O.Oprn = @sOperation
		and  O.wono= @sWorkOrder
		AND	 O.status = @sAcceptOrReject
		order by O.crdt desc
	END
	IF @sAcceptOrReject = 0
	BEGIN
		select	O.srlno1 as [Serial No], 
		b.userid   as [Rejected By],
		convert(varchar,O.mddt) as [Rejected On],
		O.reascd1 as [Reason Code], 
		c.dsca as [Description ],
		CASE  ISNULL(S.ShipToTarget,'') 
			WHEN 'SGW' THEN 'Singapore - SGW'
			WHEN 'SGQ' THEN 'QA - SGQ'
			WHEN 'CHW' THEN 'BESA - CHW'
			ELSE ''
		END as Ship2Target
		-- srlno1 as [Serial No],  srlno2,wono 
		from OperationLogs O 
			Left Outer Join BX_SubconShipments S on S.workorder = O.wono 
					and S.SerialNo = O.srlno1 
					AND O.oprn  = 'BOX'
			left outer join Users b on O.mdby=b.userid
			left outer join Reasons c on  c.rejcd = O.reascd1 
		where O.Oprn = @sOperation
			and  O.wono= @sWorkOrder
			AND	 O.status = @sAcceptOrReject
		order by O.crdt desc
	END

	END TRY
	BEGIN CATCH
			DECLARE @sTriggerAlert  Int = 0 ;
			SET @sErrorMessages = ERROR_MESSAGE ()
			-- THROW 51000, @sErrorMessages, 1;
			-- RAISERROR (@sErrorMessages ,16,1 );
			 -- Select -999 as ErrorNumber, @sErrorMessages as ErrorMessage
	END CATCH

	--Select (CASE WHEN ISNULL(@sErrorMessages,'') = '' THEN 0 ELSE -999 END) as ErrorNumber, 
	--		@sErrorMessages as ErrorMessage

END
GO
/****** Object:  StoredProcedure [dbo].[SP_GetUDIData4LabelPrint]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_GetUDIData4LabelPrint]
		@sWorkOrderNo	Varchar(20)
AS

select	w.Itemcode,
		l.pn,
		l.ref,
		l.diameter,
		l.length,
		l.barcode as GTIN,
		l.shelflife,
		SF.stntserial ,
		SF.fgwono ,
		ss.pickid ,
		L.type ,
		l.version as LblVersion
		
from	StentsByFG SF 
			Left outer join WorkOrders W on w.Project = SF.fgwono 
			Left Outer Join stentSerials ss on ss.stntserial = SF.stntserial
			LEFT Outer Join labelMaster L on ltrim(rtrim(L.pn)) = ltrim(rtrim(w.Itemcode ))
where  ss.StentType = 1   --and l.pn is not NULL
		AND sf.fgwono = @sWorkOrderNo


GO
/****** Object:  StoredProcedure [dbo].[SP_IsValidSerialNo]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_IsValidSerialNo]
		@sFullScanCode			Varchar(60),
		@sTransactionType		Varchar(3),   -- 'IN' - Inbound , 'OUT' - Outbound
		@sSerialNo				Varchar(10),
		@sMaterialCode			Varchar(18),
		@sBatchNo				Varchar(10)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE	@sFGSerialNo		Varchar(10)
	DECLARE	@sFGWorkOrder		Varchar(20)
	DECLARE	@sFGBatchNo		Varchar(10)
	DECLARE	@sFGMaterial		Varchar(18)
	

	DECLARE	@sErrorMessages	Varchar(300)
	DECLARE	@nErrorCount	Int

	SET		@nErrorCount = 0
	SET		@sErrorMessages = ''
	BEGIN TRY
		Select	@sFGSerialNo = F.stntserial ,
				@sFGMaterial = W.Itemcode ,
				@sFGBatchNo  = W.batchno 
		From	StentsByFG F
					Left Outer Join WorkOrders W On ltrim(Rtrim(W.Project)) = ltrim(Rtrim(F.FgWoNo))
		where	F.StntSerial = @sSerialNo AND F.status = 1 

		IF (IsNULL(@sFGMaterial,'') <> @sMaterialCode OR ISNULL(@sFGBatchNo,'') <> @sBatchNo )
			BEGIN
				SET @sErrorMessages = 'Error : Material or Batch No doesnot match with Serial No ' ;
				-- THROW 51000, @sErrorMessages, 1;
				RAISERROR (@sErrorMessages ,16,1 ); 
			END
		ELSE
			BEGIN
				IF IsNULL(@sFGSerialNo,'') = ''
					BEGIN
						SET @sErrorMessages = 'Error : Serial No does not Exists' ;
						-- THROW 51000, @sErrorMessages, 1;
						RAISERROR (@sErrorMessages ,16,1 );
					END
			END
	END TRY

	BEGIN CATCH
			DECLARE @sTriggerAlert  Int = 0 ;
			-- THROW 51000, @sErrorMessages, 1;
			RAISERROR (@sErrorMessages ,16,1 );
	END CATCH
	Select 1 as ValidSerialNo
END

GO
/****** Object:  StoredProcedure [dbo].[SP_UDIGenerateSerialNos]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

















-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_UDIGenerateSerialNos]
		@sWorkOrder				Varchar(20),
		@sBatchNo				Varchar(10),
		@nRequiredSerialCount	Int,
		@sCurrentUser			Varchar(30) = ''

AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
 	SET NOCOUNT ON;

	DECLARE	@sSetLockStatus	Int
	--DECLARE @sDigit01	CHAR(1)
	--DECLARE @SDigit02	CHAR(1)
	--DECLARE @SDigit03	CHAR(1)
	--DECLARE @SDigit04	CHAR(1)
	DECLARE	@nNextNewNumber		Int
	DECLARE	@nCalYear			Int
	DECLARE	@nCalMonth			Int
	DECLARE	@sNewSerialString	Varchar(10)

	DECLARE	@nNextChar	Int
	DECLARE	@nRemainingCount	Int 
	DECLARE	@sStrCalMonth		Char(1)

	DECLARE	@nBatchYear			Int
	DECLARE	@nBatchMonth		Int

BEGIN TRY


	--SET @nBatchYear = CASE WHEN Left(@sBatchNo,1) = 'W' THEN SUBSTRING(@sBatchNo, 2,2) ELSE Year(Getdate()) END
	--SET @nBatchMonth = CASE WHEN Left(@sBatchNo,1) = 'W' THEN SUBSTRING(@sBatchNo, 4,2) ELSE Month(Getdate()) END


	SET @nBatchYear =  Cast(SUBSTRING(@sBatchNo, 2,2) as Int)
	SET @nBatchMonth = Cast(SUBSTRING(@sBatchNo, 4,2)  as Int)


	Select	
			@nCalYear = CalYear,
			@nCalMonth = CalMonth
	from	SerialNoControl 
	where	CalYear = @nBatchYear and Calmonth = @nBatchMonth 
		-- CalYear = Year(Getdate()) and CalMonth = Month(GetDate())

	SET @sSetLockStatus = 0

	if @nCalYear is NULL AND @nCalMonth is NULL
	BEGIN
		SET @nCalYear = ISNULL(@nCalYear,@nBatchYear)
		SET @nCalMonth = ISNULL(@nCalMonth,@nBatchMonth)
		Insert into SerialNoControl(CalYear, CalMonth,LastUsedSerial) 	
				Values ( @nBatchYear, @nBatchMonth,0)
	END

	IF @nBatchYear >= 18 AND @nBatchMonth  >= 6      -- Substring(@sBatchNo,2,4) = '1806'
	BEGIN
		exec dbo.SPSetLock4SerialGenerations @sworkOrder,@sCurrentUser, @nCalYear , @nCalMonth, 'X',@sSetLockStatus OUTPUT



	-- Select @SDigit01, @SDigit02,@SDigit03,@SDigit04
		IF ISNULL(@sSetLockStatus,0) = 1
		BEGIN

		-- Serial No. Format : YYMXXXXX ( YY-Year, M-Month, XXXXX - 5 Digit running number
		-- Setting Month Digit to Alphabet,  if it exceeds single Digit
			--SET @sStrCalMonth = 
			--(CASE @nCalMonth 
			--	WHEN 10 THEN 'A'
			--	WHEN 11 THEN 'B'
			--	WHEN 12 THEN 'C'
			--	ELSE cast(@nCalMonth as CHAR(1)) END )

			SET @nRemainingCount =  @nRequiredSerialCount
			SELECT @nNextNewNumber =  dbo.[FnUDIGetLastUsedSerialNo](@nCalYear ,@nCalMonth )
			WHILE @nRemainingCount > 0
				BEGIN
				
					SET @nNextNewNumber = @nNextNewNumber + 1

					-- Below Block is Used for Alpha Numeric Serial Nos.. 
					--Select @nNextChar = dbo.FnGetNextSerialNoSeqn(@sDigit04)
					--SET @sDigit04 = CHAR(@nNextChar)
					--if @nNextChar = 48 
					--BEGIN
					--	Select @nNextChar =  dbo.FnGetNextSerialNoSeqn(@sDigit03)
					--	SET @sDigit03 = CHAR(@nNextChar)
					--	if @nNextChar = 48 
					--	BEGIN
					--		Select @nNextChar = dbo.FnGetNextSerialNoSeqn(@sDigit02)
					--		SET @sDigit02 = CHAR(@nNextChar)
					--		if @nNextChar = 48 
					--		BEGIN
					--			Select @nNextChar =  dbo.FnGetNextSerialNoSeqn(@sDigit01)
					--			SET @sDigit01 = CHAR(@nNextChar)
					--		END
					--	END
					--END
					
					-- SET @sNewSerialString = Right('00' + Cast(@nCalYear as Varchar(4)),2) + @sStrCalMonth + Right('00000' + Cast(@nNextNewNumber as Varchar(5)),5)

					SET @sNewSerialString = Right('00' + Cast(@nCalYear as Varchar(4)),2) + Right('00' + Cast(@nCalMonth as Varchar(2)),2) + Right('00000' + Cast(@nNextNewNumber as Varchar(5)),5)

					INSERT	INTO StentSerials(stntserial,status,stwono,stbatch,stenttype,createdby,createddate,modifiedby,modifieddate,pcount) 
							VALUES (@sNewSerialString,1,@sWorkOrder,@sBatchNo,1,'', getdate(),'', getdate(), '0')

					UPDATE	SerialNoControl 
							SET LastUsedSerial = @nNextNewNumber
					WHERE CalYear = @nCalYear and CalMonth = @nCalMonth

					SET @nRemainingCount = @nRemainingCount - 1
				END
				EXEC dbo.SPSetLock4SerialGenerations @sworkOrder,@sCurrentUser, @nCalYear , @nCalMonth, '',@sSetLockStatus OUTPUT

				UPDATE	StentsWOMaster 
				SET		actualqty = @nRequiredSerialCount ,modifiedby='', modifieddate=getdate() 
				WHERE	stwono = @sworkOrder
				IF @@ROWCOUNT = 0
					INSERT INTO StentsWOMaster(stwono,planqty,actualqty,modifiedby,modifieddate) 
							VALUES (@sworkOrder,@nRequiredSerialCount,@nRequiredSerialCount,'', getdate())
		END
				-- Print Right('00'+ Cast(@nCalYear as varchar(4)),2) + Right('00'+ CAST(@nCalMonth as VARCHAR(4)),2)+ @sDigit01+@sDigit02+@sDigit03+@sDigit04 
	END
END TRY
BEGIN CATCH  
	INSERT INTO [dbo].[DBProceduresErrorLogs]
           ([ProcedureName]
           ,[ErrorNumber]
           ,[ErrorMessage]
           ,[WorkOrderNo])
    SELECT  
		ERROR_PROCEDURE() AS ErrorProcedure  
        ,ERROR_NUMBER() AS ErrorNumber  
        ,ERROR_MESSAGE() AS ErrorMessage  
		, @sWorkOrder as WorkOrder

END CATCH;  
END

GO
/****** Object:  StoredProcedure [dbo].[SP_UDIGenerateSerialNos_zz]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO






-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_UDIGenerateSerialNos_zz]
		@sWorkOrder				Varchar(20),
		@sBatchNo				Varchar(10),
		@nRequiredSerialCount	Int,
		@sCurrentUser			Varchar(30) = ''

AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
 	SET NOCOUNT ON;

	DECLARE	@sSetLockStatus	Int
	--DECLARE @sDigit01	CHAR(1)
	--DECLARE @SDigit02	CHAR(1)
	--DECLARE @SDigit03	CHAR(1)
	--DECLARE @SDigit04	CHAR(1)
	DECLARE	@nNextNewNumber		Int
	DECLARE	@nCalYear			Int
	DECLARE	@nCalMonth			Int
	DECLARE	@sNewSerialString	Varchar(10)

	DECLARE	@nNextChar	Int
	DECLARE	@nRemainingCount	Int 
	DECLARE	@sStrCalMonth		Char(1)
	Select	
			@nCalYear = CalYear,
			@nCalMonth = CalMonth
	from	SerialNoControl 
	where CalYear = Year(Getdate()) and CalMonth = Month(GetDate())

	SET @sSetLockStatus = 0

	if @nCalYear is NULL AND @nCalMonth is NULL
	BEGIN
		SET @nCalYear = ISNULL(@nCalYear,Year(Getdate()))
		SET @nCalMonth = ISNULL(@nCalMonth,Month(GetDate()))
		Insert into SerialNoControl(CalYear, CalMonth,LastUsedSerial) 	
				Values ( Year(GetDate()), Month(GetDate()),0)
	END

	exec dbo.SPSetLock4SerialGenerations @sworkOrder,@sCurrentUser, @nCalYear , @nCalMonth, 'X',@sSetLockStatus OUTPUT



	-- Select @SDigit01, @SDigit02,@SDigit03,@SDigit04
		IF ISNULL(@sSetLockStatus,0) = 1
		BEGIN

		-- Serial No. Format : YYMXXXXX ( YY-Year, M-Month, XXXXX - 5 Digit running number
		-- Setting Month Digit to Alphabet,  if it exceeds single Digit
			SET @sStrCalMonth = 
			(CASE @nCalMonth 
				WHEN 10 THEN 'A'
				WHEN 11 THEN 'B'
				WHEN 12 THEN 'C'
				ELSE cast(@nCalMonth as CHAR(1)) END )

			SET @nRemainingCount =  @nRequiredSerialCount
			SELECT @nNextNewNumber =  dbo.[FnUDIGetLastUsedSerialNo](@nCalYear ,@nCalMonth )
			WHILE @nRemainingCount > 0
				BEGIN
				
					SET @nNextNewNumber = @nNextNewNumber + 1

					-- Below Block is Used for Alpha Numeric Serial Nos.. 
					--Select @nNextChar = dbo.FnGetNextSerialNoSeqn(@sDigit04)
					--SET @sDigit04 = CHAR(@nNextChar)
					--if @nNextChar = 48 
					--BEGIN
					--	Select @nNextChar =  dbo.FnGetNextSerialNoSeqn(@sDigit03)
					--	SET @sDigit03 = CHAR(@nNextChar)
					--	if @nNextChar = 48 
					--	BEGIN
					--		Select @nNextChar = dbo.FnGetNextSerialNoSeqn(@sDigit02)
					--		SET @sDigit02 = CHAR(@nNextChar)
					--		if @nNextChar = 48 
					--		BEGIN
					--			Select @nNextChar =  dbo.FnGetNextSerialNoSeqn(@sDigit01)
					--			SET @sDigit01 = CHAR(@nNextChar)
					--		END
					--	END
					--END
					SET @sNewSerialString = Right('00' + Cast(@nCalYear as Varchar(2)),2) + @sStrCalMonth + Right('00000' + Cast(@nNextNewNumber as Varchar(5)),5)

					INSERT	INTO StentSerials(stntserial,status,stwono,stbatch,stenttype,createdby,createddate,modifiedby,modifieddate,pcount) 
							VALUES (@sNewSerialString,1,@sWorkOrder,@sBatchNo,1,'', getdate(),'', getdate(), '0')

					UPDATE	SerialNoControl 
							SET LastUsedSerial = @nNextNewNumber
					WHERE CalYear = @nCalYear and CalMonth = @nCalMonth

					SET @nRemainingCount = @nRemainingCount - 1
				END
				EXEC dbo.SPSetLock4SerialGenerations @sworkOrder,@sCurrentUser, @nCalYear , @nCalMonth, '',@sSetLockStatus OUTPUT
				-- Print Right('00'+ Cast(@nCalYear as varchar(4)),2) + Right('00'+ CAST(@nCalMonth as VARCHAR(4)),2)+ @sDigit01+@sDigit02+@sDigit03+@sDigit04 
		END
END


GO
/****** Object:  StoredProcedure [dbo].[SP_UpdateShip2TargetBySerialNo]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_UpdateShip2TargetBySerialNo]
		@sWorkOrder			Varchar(20),
		@sSerialNo			Varchar(10),
		@sShipToTarget		Varchar(20),
		@sOperation			Varchar(12),
		@sScanByUser		Varchar(30)

AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	DECLARE	@sErrorMessages	Varchar(100)	

	BEGIN TRY
		if @sOperation = 'BOX' 
		BEGIN
			Update [BX_SubconShipments]
			SET		[ShipToTarget] = Right(@sShipToTarget,3),
					ModifiedOn = getdate(),
					ModifiedBy = @sScanByUser
			where SerialNo = @sSerialNo
					AND WorkOrder = @sWorkOrder
		END

		IF @@ROWCOUNT <= 0
		BEGIN
			SET @sErrorMessages = 'No Changes were Updated. Check Operation/Serial No'
		END
	END TRY
	BEGIN CATCH
			DECLARE @sTriggerAlert  Int = 0 ;
			SET @sErrorMessages = ERROR_MESSAGE ()
			-- THROW 51000, @sErrorMessages, 1;
			-- RAISERROR (@sErrorMessages ,16,1 );
			 -- Select -999 as ErrorNumber, @sErrorMessages as ErrorMessage
	END CATCH

	Select (CASE WHEN ISNULL(@sErrorMessages,'') = '' THEN 0 ELSE -999 END) as ErrorNumber, 
			@sErrorMessages as ErrorMessage

END
GO
/****** Object:  StoredProcedure [dbo].[SP_ValidateFinalLineScanning]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_ValidateFinalLineScanning]
		@sWorkOrder			Varchar(20),
		@sScanCode1			Varchar(60),
		@sScanCode2			Varchar(60),
		@sShipToTarget		Varchar(20),
		@nAcceptOrReject	Int = 1,
		@sOperation			Varchar(12),
		@sScanByUser		Varchar(30),
		@sRejectReason		Varchar(100) = ''
		-- @nInternalScan		Int = 0
AS
BEGIN

	-- wono,srlno1,srlno2,oprn,status,crby,crdt
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.

	SET NOCOUNT ON;
	
	DECLARE		@sErrorMessages		Varchar(400)
	DECLARE		@sSerialNo			Varchar(10)
	DECLARE		@nShipToStatus		Int 
	DECLARE		@sExistingSerial	Varchar(10)
	DECLARE		@sIsUDIDisabled		Int = 0
	DECLARE		@sScanCodeType		Char(1) = 'S'   --  S - Short Code (Only Serial No),  L - Long Code (Full UDI Code)
	DECLARE		@nAutoAssignedFG	Int = 0

	DECLARE		@nBoxFullScanCode	Varchar(60)

	--DECLARE		@sTmpSerial1		Varchar(20)
	--DECLARE		@sTmpSerial2		Varchar(20)
	DECLARE		@IsValidSerials		Int
	DECLARE		@nTotalScannedQty	Int
BEGIN TRY
	SELECT	@nShipToStatus = 
			CASE Right(@sShipToTarget,3)
				WHEN 'SGW'	THEN 1
				WHEN 'SGQ'	THEN 2
				WHEN 'CHW'	THEN 3
				WHEN 'QBB'	THEN 9
				ELSE 0
			END
	SET @nAutoAssignedFG = dbo.[FnIsAutoAssignAllowed] (@sWorkOrder)    --  = 1 :  Chroma - Scan both Same barcodes, 0 otherwise

	SET	@sSerialNo = Right(ltrim(Rtrim(@sScanCode1)),9)

	Select @sExistingSerial = Srlno1 
	from OperationLogs
	where Srlno1 =  @sSerialNo AND oprn = @sOperation
			-- AND [status] = @nAcceptOrReject

	 Select @sIsUDIDisabled = dbo.[IsUDIExceptionExists] (@sworkOrder)

	--IF @nInternalScan = 0   -- Checking for Internal Switch
	--BEGIN
		SET @sScanCodeType =	CASE 
								WHEN   (ISNULL(@sIsUDIDisabled,0)  = 1 OR @sOperation = 'CRMP' ) 
								THEN 'S' 
								ELSE 'L' 
							END

		--SET @IsValidSerials = 
		--CASE	WHEN ( @sOperation = 'CRMP' )
		--			 AND ( @sScanCode1 <> @sScanCode2  OR (Len(@sScanCode1) > 9 OR Len(@sScanCode2) > 9 ))
		--			THEN 0
		--			ELSE 
		--				CASE	WHEN (@sOperation = 'SEAL' OR @sOperation = 'BOX')
		--								AND NOT (Right(@sScanCode1,9) = Right(@sScanCode2,9) AND len(@sScanCode1) <> Len(@sScanCode2))
		--						THEN 0
		--						ELSE 1
		--				END
		--	END

		If @sScanCodeType = 'L'
		--	BEGIN
		--		SET @nBoxFullScanCode = CASE	WHEN len(@sscancode1) > len(@sscancode2) 
		--										THEN @sScanCode1 
		--										ELSE @sScanCode2 
		--								END
		--	END
		--ELSE
		--	BEGIN
		--		SET @nBoxFullScanCode =  @sScanCode1
		--	END

		SET @nBoxFullScanCode = CASE	WHEN len(@sScanCode1) > len(@sScanCode2) 
										THEN @sScanCode1 
										ELSE @sScanCode2 
								END

		IF Len(@nBoxFullScanCode) > 35 AND PATINDEX('%|21%',@nBoxFullScancode) = 0  
		BEGIN
			SET @nBoxFullScanCode = substring(@nBoxFullScanCode,1,len(@nBoxFullScanCode)-11)+ '|21'+ @sSerialNo
		END
	

		SET @IsValidSerials = 
		CASE	WHEN ( @sScanCodeType = 'S'  AND @nAutoAssignedFG = 0 )    -- Non UDI , Scan Short Barcode Label
					 AND ( @sScanCode1 <> @sScanCode2  OR (Len(@sScanCode1) > 9 OR Len(@sScanCode2) > 9 ))
					THEN 0
					ELSE 
						CASE	WHEN (@sScanCodeType = 'L' AND @nAutoAssignedFG = 0 )  -- UDI, Scan Long & Short Barcode Labels except Chroma 
										AND NOT (Right(@sScanCode1,9) = Right(@sScanCode2,9) AND len(@sScanCode1) <> Len(@sScanCode2))
								THEN 0
								ELSE 
									CASE WHEN (@sScanCodeType = 'L' AND @nAutoAssignedFG = 1 )  -- UDI, Scan same Long/short  Barcode Labels for both - Chroma
												AND  (@sScanCode1 <> @sScanCode2 )
										THEN 0 
										ELSE 1
									END
						END
			END

		if @IsValidSerials = 0 AND ISNULL(@sExistingSerial,'') = ''
		BEGIN
			SET @sErrorMessages =  'Error : Mismatched Scanning, Try again... ' ;
			-- THROW 51000, @sErrorMessages, 1;
			RAISERROR (@sErrorMessages ,16,1 );
		END							
		-- To Check scanned Qty exceeds Work Order Qty

		--select @nTotalScannedQty = count(wono) 
		--From	OperationLogs 
		--where oprn = @sOperation and wono= @sWorkOrder 

		SET @sExistingSerial = NULL
		Select @sExistingSerial = Srlno1 
		from OperationLogs
		where Srlno1 =  @sSerialNo AND oprn = @sOperation
				AND [status] = @nAcceptOrReject

		if ISNULL(@sExistingSerial,'') <> ''
		BEGIN
			SET @sErrorMessages =  'Error : Serial No aleady Scanned for this Operation : ' + ISNULL(@sExistingSerial,'') ;
			-- THROW 51000, @sErrorMessages, 1;
			RAISERROR (@sErrorMessages ,16,1 );
		END
	-- END   -- Checking for Internal Switch
	Update OperationLogs 
		SET [Status] = @nAcceptOrReject,
			reascd1 = ISNULL(@sRejectReason,''),
			reascd2 = ISNULL(@sRejectReason,''),
			mddt = getdate(),
			mdby = @sScanByUser
		where ltrim(rtrim(wono)) = @sWorkOrder 
				AND srlno1 = @sSerialNo 
				AND oprn = @sOperation
	IF @@ROWCOUNT <= 0 
	BEGIN
		Insert into OperationLogs(wono,srlno1,srlno2,oprn,[status],reascd1,reascd2, crby,crdt,mdby,mddt) 
		Select  @sWorkOrder , 
				@sSerialNo,
				@sSerialNo,
				@sOperation,
				@nAcceptOrReject,
				@sRejectReason,
				@sRejectReason,
				@sScanByUser ,
				getdate() ,
				@sScanByUser ,
				getdate() 
	END
	-- Create Records for Subcon PO Receipts
IF @sOperation = 'BOX'
BEGIN


	Update [BX_SubconShipments]
	SET	[ShipToTarget] = Right(@sShipToTarget,3),
		ModifiedOn = getdate(),
		ModifiedBy = @sScanByUser,
		IsDeleted = CASE WHEN @nAcceptOrReject = 1 THEN '' ELSE 'X' END
	where SerialNo = @sSerialNo
			AND WorkOrder = @sWorkOrder

	IF @@ROWCOUNT <= 0
	BEGIN
		Insert Into [BX_SubconShipments] (
			[SerialNo]
		  ,[workorder]
		  ,[subConPo]
		  ,[SAPStoNumber]
		  ,[ShipToTarget]
		  ,[QASampleCategory]
		  ,[CreatedOn]
		  ,[CreatedBy]
		  ,[ModifiedOn]
		  ,[ModifiedBy]
		  ,[StatusID]
		  ,[FullScanCode]
		  ,IsDeleted
		  )
	  		Select  
				@sSerialNo,
				@sWorkOrder , 
				'',
				'',
				Right(@sShipToTarget,3),
				'' ,
				getdate() ,
				@sScanByUser,
				getdate() ,
				@sScanByUser,
				5,
				-- '01'+ E.EanCode +'17'+ Right(Convert(varchar(8),ISNULL(B.ExpiryDate,getdate()),112),6) + '10' + W.batchno +'|21'+ @sSerialNo ,
				@nBoxFullScanCode,
				CASE WHEN @nAcceptOrReject = 0 THEN '' ELSE 'X' END
			From WorkOrders W 
					Left Outer Join SAP_EANCodes E on E.MaterialCode = W.Itemcode
					Left Outer Join SAP_Batches B on B.material = W.ItemCode AND B.batchNo = W.batchno
			Where ltrim(rtrim(W.Project)) = @sWorkOrder 
	END
END
-- 01088888930186901720061310W18060003|21180612957
END TRY
	BEGIN CATCH
			DECLARE @sTriggerAlert  Int = 0 ;
			SET @sErrorMessages = ERROR_MESSAGE ()
			-- THROW 51000, @sErrorMessages, 1;
			-- RAISERROR (@sErrorMessages ,16,1 );
			 -- Select -999 as ErrorNumber, @sErrorMessages as ErrorMessage
	END CATCH

	Select (CASE WHEN ISNULL(@sErrorMessages,'') = '' THEN 0 ELSE -999 END) as ErrorNumber, ISNULL(@sErrorMessages,'') as ErrorMessage
END
GO
/****** Object:  StoredProcedure [dbo].[SP_ValidateFinalLineScanning_2018SEP18]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_ValidateFinalLineScanning_2018SEP18]
		@sWorkOrder			Varchar(20),
		@sScanCode1			Varchar(60),
		@sScanCode2			Varchar(60),
		@sShipToTarget		Varchar(20),
		@nAcceptOrReject	Int = 1,
		@sOperation			Varchar(12),
		@sScanByUser		Varchar(30),
		@sRejectReason		Varchar(100) = ''
AS
BEGIN

	-- wono,srlno1,srlno2,oprn,status,crby,crdt
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.

	SET NOCOUNT ON;
	
	DECLARE		@sErrorMessages		Varchar(400)
	DECLARE		@sSerialNo			Varchar(10)
	DECLARE		@nShipToStatus		Int 
	DECLARE		@sExistingSerial	Varchar(10)
	DECLARE		@sIsUDIDisabled		Int = 0
	DECLARE		@sScanCodeType		Char(1) = 'S'   --  S - Short Code (Only Serial No),  L - Long Code (Full UDI Code)
	DECLARE		@nAutoAssignedFG	Int = 0
	DECLARE		@nCheck4ValidScan	Int = 0

	DECLARE		@nBoxFullScanCode	Varchar(60)

	--DECLARE		@sTmpSerial1		Varchar(20)
	--DECLARE		@sTmpSerial2		Varchar(20)
	DECLARE		@IsValidSerials		Int
	DECLARE		@nTotalScannedQty	Int
BEGIN TRY
	SELECT	@nShipToStatus = 
			CASE Right(@sShipToTarget,3)
				WHEN 'SGW'	THEN 1
				WHEN 'SGQ'	THEN 2
				WHEN 'CHW'	THEN 3
				WHEN 'QBB'	THEN 9
				ELSE 0
			END
	SET @nAutoAssignedFG = dbo.[FnIsAutoAssignAllowed] (@sWorkOrder)    --  = 1 :  Chroma - Scan both Same barcodes, 0 otherwise

	SET	@sSerialNo = Right(ltrim(Rtrim(@sScanCode1)),9)

	Select @sExistingSerial = Srlno1 
	from OperationLogs
	where Srlno1 =  @sSerialNo AND oprn = @sOperation
			-- AND [status] = @nAcceptOrReject

	 Select @sIsUDIDisabled = dbo.[IsUDIExceptionExists] (@sworkOrder)

	 SET @sScanCodeType =	CASE 
								WHEN   (ISNULL(@sIsUDIDisabled,0)  = 1 OR @sOperation = 'CRMP' ) 
								THEN 'S' 
								ELSE 'L' 
							END

	--SET @IsValidSerials = 
	--CASE	WHEN ( @sOperation = 'CRMP' )
	--			 AND ( @sScanCode1 <> @sScanCode2  OR (Len(@sScanCode1) > 9 OR Len(@sScanCode2) > 9 ))
	--			THEN 0
	--			ELSE 
	--				CASE	WHEN (@sOperation = 'SEAL' OR @sOperation = 'BOX')
	--								AND NOT (Right(@sScanCode1,9) = Right(@sScanCode2,9) AND len(@sScanCode1) <> Len(@sScanCode2))
	--						THEN 0
	--						ELSE 1
	--				END
	--	END

	If @sScanCodeType = 'L'
	--	BEGIN
	--		SET @nBoxFullScanCode = CASE	WHEN len(@sscancode1) > len(@sscancode2) 
	--										THEN @sScanCode1 
	--										ELSE @sScanCode2 
	--								END
	--	END
	--ELSE
	--	BEGIN
	--		SET @nBoxFullScanCode =  @sScanCode1
	--	END

	SET @nBoxFullScanCode = CASE	WHEN len(@sScanCode1) > len(@sScanCode2) 
									THEN @sScanCode1 
									ELSE @sScanCode2 
							END

	IF Len(@nBoxFullScanCode) > 35 AND PATINDEX('%|21%',@nBoxFullScancode) = 0  
	BEGIN
		SET @nBoxFullScanCode = substring(@nBoxFullScanCode,1,len(@nBoxFullScanCode)-11)+ '|21'+ @sSerialNo
	END
	
	-- S.20180917
	IF @sScanCodeType = 'L'
	BEGIN
		SET @nCheck4ValidScan  = dbo.BX_FnCheck4ValidScanCode (@nBoxFullScanCode )
	END
	-- E.20180917
	SET @IsValidSerials = 
	CASE	WHEN ( @sScanCodeType = 'S'  AND @nAutoAssignedFG = 0 )    -- Non UDI , Scan Short Barcode Label
				 AND ( @sScanCode1 <> @sScanCode2  OR (Len(@sScanCode1) > 9 OR Len(@sScanCode2) > 9 ))
				THEN 0
				ELSE 
					CASE	WHEN (@sScanCodeType = 'L' AND @nAutoAssignedFG = 0 )  -- UDI, Scan Long & Short Barcode Labels except Chroma 
									AND NOT (( Right(@sScanCode1,9) = Right(@sScanCode2,9 ) AND @nCheck4ValidScan = 1) 
									AND len(@sScanCode1) <> Len(@sScanCode2))
									
							THEN 0
							ELSE 
								CASE WHEN (@sScanCodeType = 'L' AND @nAutoAssignedFG = 1 )  -- UDI, Scan same Long/short  Barcode Labels for both - Chroma
											AND  (@sScanCode1 <> @sScanCode2 )
											AND  @nCheck4ValidScan = 0  -- S.20180918
									THEN 0 
									ELSE 1
								END
					END
		END

	if @IsValidSerials = 0 AND ISNULL(@sExistingSerial,'') = ''
	BEGIN
		SET @sErrorMessages =  'Error : Mismatched Scanning, Try again... ' ;
		-- THROW 51000, @sErrorMessages, 1;
		RAISERROR (@sErrorMessages ,16,1 );
	END							
	-- To Check scanned Qty exceeds Work Order Qty

	--select @nTotalScannedQty = count(wono) 
	--From	OperationLogs 
	--where oprn = @sOperation and wono= @sWorkOrder 

	SET @sExistingSerial = NULL
	Select @sExistingSerial = Srlno1 
	from OperationLogs
	where Srlno1 =  @sSerialNo AND oprn = @sOperation
			AND [status] = @nAcceptOrReject

	if ISNULL(@sExistingSerial,'') <> ''
	BEGIN
		SET @sErrorMessages =  'Error : Serial No aleady Scanned for this Operation : ' + ISNULL(@sExistingSerial,'') ;
		-- THROW 51000, @sErrorMessages, 1;
		RAISERROR (@sErrorMessages ,16,1 );
	END

	Update OperationLogs 
		SET [Status] = @nAcceptOrReject,
			reascd1 = ISNULL(@sRejectReason,''),
			reascd2 = ISNULL(@sRejectReason,''),
			mddt = getdate(),
			mdby = @sScanByUser
		where ltrim(rtrim(wono)) = @sWorkOrder 
				AND srlno1 = @sSerialNo 
				AND oprn = @sOperation
	IF @@ROWCOUNT <= 0 
	BEGIN
		Insert into OperationLogs(wono,srlno1,srlno2,oprn,[status],reascd1,reascd2, crby,crdt,mdby,mddt) 
		Select  @sWorkOrder , 
				@sSerialNo,
				@sSerialNo,
				@sOperation,
				@nAcceptOrReject,
				@sRejectReason,
				@sRejectReason,
				@sScanByUser ,
				getdate() ,
				@sScanByUser ,
				getdate() 
	END
	-- Create Records for Subcon PO Receipts
IF @sOperation = 'BOX'
BEGIN


	Update [BX_SubconShipments]
	SET	[ShipToTarget] = Right(@sShipToTarget,3),
		ModifiedOn = getdate(),
		ModifiedBy = @sScanByUser,
		IsDeleted = CASE WHEN @nAcceptOrReject = 1 THEN '' ELSE 'X' END
	where SerialNo = @sSerialNo
			AND WorkOrder = @sWorkOrder

	IF @@ROWCOUNT <= 0
	BEGIN
		Insert Into [BX_SubconShipments] (
			[SerialNo]
		  ,[workorder]
		  ,[subConPo]
		  ,[SAPStoNumber]
		  ,[ShipToTarget]
		  ,[QASampleCategory]
		  ,[CreatedOn]
		  ,[CreatedBy]
		  ,[ModifiedOn]
		  ,[ModifiedBy]
		  ,[StatusID]
		  ,[FullScanCode]
		  ,IsDeleted
		  )
	  		Select  
				@sSerialNo,
				@sWorkOrder , 
				'',
				'',
				Right(@sShipToTarget,3),
				'' ,
				getdate() ,
				@sScanByUser,
				getdate() ,
				@sScanByUser,
				5,
				-- '01'+ E.EanCode +'17'+ Right(Convert(varchar(8),ISNULL(B.ExpiryDate,getdate()),112),6) + '10' + W.batchno +'|21'+ @sSerialNo ,
				@nBoxFullScanCode,
				CASE WHEN @nAcceptOrReject = 0 THEN '' ELSE 'X' END
			From WorkOrders W 
					Left Outer Join SAP_EANCodes E on E.MaterialCode = W.Itemcode
					Left Outer Join SAP_Batches B on B.material = W.ItemCode AND B.batchNo = W.batchno
			Where ltrim(rtrim(W.Project)) = @sWorkOrder 
	END
END
-- 01088888930186901720061310W18060003|21180612957
END TRY
	BEGIN CATCH
			DECLARE @sTriggerAlert  Int = 0 ;
			SET @sErrorMessages = ERROR_MESSAGE ()
			-- THROW 51000, @sErrorMessages, 1;
			-- RAISERROR (@sErrorMessages ,16,1 );
			 -- Select -999 as ErrorNumber, @sErrorMessages as ErrorMessage
	END CATCH

	Select (CASE WHEN ISNULL(@sErrorMessages,'') = '' THEN 0 ELSE -999 END) as ErrorNumber, ISNULL(@sErrorMessages,'') as ErrorMessage
END
GO
/****** Object:  StoredProcedure [dbo].[SPCheckAndGenerateSerialNos]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
















-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SPCheckAndGenerateSerialNos]
	@sWorkOrder				varchar(20)
	--@sBatchNo				Varchar(10)=NULL,
	--@sItemCode				Varchar(20)=NULL
	-- @nRequiredSerialCount	Int OUTPUT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE	@nIsSerialNoRequied			Int
	DECLARE	@nExistingSerialCount		Int = 0
	DECLARE	@nToBeGeneratedCount		Int = 0
	DECLARE	@nWorkOrderPlanQty			Int = 0
	DECLARE	@sStentBatchNo				Varchar(10)

BEGIN TRY
	Select @nIsSerialNoRequied = [dbo].[FnIsSerialNoRequired] (@sWorkOrder )
	IF @nIsSerialNoRequied = 1
	BEGIN

		SELECT	@nWorkOrderPlanQty = W.PlanQty,
				@sStentBatchNo = w.batchno
		FROM	WorkOrders W
		WHERE	W.Project = @sWorkOrder 
	
		IF @nWorkOrderPlanQty > 0 
		BEGIN 
			SELECT	@nExistingSerialCount = COUNT(stntserial) 
			FROM	StentSerials 
			WHERE	stwono = @sWorkOrder
				AND	status=1 and stenttype=1
		END
		SET @nToBeGeneratedCount = ISNULL(@nWorkOrderPlanQty,0) - ISNULL(@nExistingSerialCount,0)
		-- Print  @nToBeGeneratedCount
		IF  @nToBeGeneratedCount > 0 
				-- @nToBeGeneratedCount > 0  AND Left(@sStentBatchNo,1) = 'W'  AND Substring(@sStentBatchNo,2,4) = '1806'
				-- @nToBeGeneratedCount > 0  Change to this condition from 1st June
		BEGIN
			EXEC [SP_UDIGenerateSerialNos] @sWorkOrder,@sStentBatchNo,@nToBeGeneratedCount,''
			Exec SP_GenerateDummySerials @sWorkOrder,@sStentBatchNo
			EXEC [SP_AutoAssignStentSerial2FG] @sWorkOrder, @nToBeGeneratedCount, 'biotrack'   --- For Chroma
			INSERT INTO [dbo].[DBProceduresErrorLogs]
				   ([ProcedureName]
				   ,[ErrorNumber]
				   ,[ErrorMessage]
				   ,[WorkOrderNo])
			SELECT  
				'SPCheckAndGenerateSerialNos' AS ErrorProcedure  
				,0 AS ErrorNumber  
				, Cast(@nToBeGeneratedCount as Varchar(6)) + ' Serial Nos. Generated with No Errors' AS ErrorMessage  
				, @sWorkOrder as WorkOrder
		END
	END
END TRY
BEGIN CATCH  
	INSERT INTO [dbo].[DBProceduresErrorLogs]
           ([ProcedureName]
           ,[ErrorNumber]
           ,[ErrorMessage]
           ,[WorkOrderNo])
    SELECT  
		ERROR_PROCEDURE() AS ErrorProcedure  
        ,ERROR_NUMBER() AS ErrorNumber  
        ,ERROR_MESSAGE() AS ErrorMessage  
		, @sWorkOrder as WorkOrder

END CATCH;  

END

GO
/****** Object:  StoredProcedure [dbo].[SPCheckAndGenerateSerialNos_zz]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SPCheckAndGenerateSerialNos_zz]
	-- Add the parameters for the stored procedure here
	@sWorkOrder		varchar(20),
	@sBatchNo		Varchar(10)=NULL,
	@sItemCode		Varchar(20)=NULL
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	IF LEFT(@sItemCode,5) = '11070' or LEFT(@sItemCode,5) = '11071'
	BEGIN
		INSERT INTO stentSerials (
								stntserial,
								Status,
								rejcd,
								stwono,
								stbatch ,
								StentType,
								fgwono,
								inspnstatus,
								inspncode, 
								inspnby,
								inspndate,
								CreatedBy,
								CreatedDate,
								ModifiedBy,
								ModifiedDate ,
								PCount )
		SELECT	stntserial+'@'+fgwono,
				1,
				'',
				fgwono,
				@sBatchNo,
				1,
				'',
				-1,
				'',
				'',
				NULL,
				'',
				GETDATE(),
				'',
				GETDATE(),
				0
	FROM StentsByFG s1
	WHERE s1.fgwono = @sWorkOrder 
			AND	 stntserial+'@'+fgwono NOT IN (
												select	stntserial 
												from	stentSerials 
												where	stwono  = @sWorkOrder )
	END

END

GO
/****** Object:  StoredProcedure [dbo].[SPCheckAndUpdateFinalLineOperations]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SPCheckAndUpdateFinalLineOperations]
		@sFirstSerial			Varchar(60),
		@sSecondSerial			Varchar(60),  
		@sOperationNo			Varchar(3),
		@sWorkOrderNo			Varchar(20),
		@sLogonUser				Varchar(20),
		@sShip2Target			Varchar(3) = NULL,
		@sOverWritePreviousScan	Varchar(1) = ''
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE	@sSerialNo		Varchar(10)
	DECLARE	@sWorkOrder		Varchar(20)
	DECLARE	@sSubConPo		Varchar(12)
	DECLARE	@sShipToTarget	Varchar(12)
	DECLARE	@sSAPSTONumber	Varchar(12)
	DECLARE	@sStatusCode	Varchar(12)

	DECLARE	@sErrorMessages	Varchar(300)
	DECLARE	@nErrorCount	Int
	DECLARE	@sReturnToTarget	varchar(3)
	DECLARE	@sQACategory		varchar(3)

	SET		@nErrorCount = 0
	SET		@sErrorMessages = ''
	BEGIN TRY

		If Ltrim(Rtrim(@sFirstSerial)) <> Ltrim(Rtrim(@sSecondSerial))
		BEGIN
			SET @sErrorMessages = 'Error : Serial Nos does not Match' ;
			-- THROW 51000, @sErrorMessages, 1;
			RAISERROR (@sErrorMessages ,16,1 );
		END

       SELECT	@sSerialNo = stntserial 
	   FROM		StentsByFG  
	   WHERE	stntserial = @sFirstSerial 
				and fgwono = @sWorkOrderNo

		IF ISNULL(@sSerialNo,'') = ''
		BEGIN
			SET @sErrorMessages = 'Error : Serial No does not exists for this Work Order' ;
			-- THROW 51000, @sErrorMessages, 1;
			RAISERROR (@sErrorMessages ,16,1 );
		END

		Select	@sSerialNo = SerialNo,
				@sWorkOrder = WorkOrder,
				@sSubConPO = SubConPO,
				@sSAPSTONumber = SAPSTONumber ,
				@sShipToTarget = ShipToTarget ,
				@sStatusCode = StatusID 
		From	BX_SubConShipments
		-- where	FullScanCode = @sFullScanCode
				-- AND StatusID = 5
		IF IsNULL(@sSerialNo,'') = ''
			BEGIN
				SET @sErrorMessages = 'Error : Serial No does not exist in SubCon Operations' ;
				-- THROW 51000, @sErrorMessages, 1;
				RAISERROR (@sErrorMessages ,16,1 );
			END
		ELSE
			BEGIN
				IF @sStatusCode <> 5  
					BEGIN
						SET @sErrorMessages = 'Error : Serial No already Scanned for ' + ISNULL(@sShipToTarget,'');
						-- THROW 51000, @sErrorMessages, 1;
						RAISERROR (@sErrorMessages ,16,1 );
					END
				ELSE
					BEGIN
						IF @sStatusCode = 5 AND ISNULL(@sReturnToTarget,'') <> ISNULL(@sShipToTarget,'')   
							BEGIN
								SET @sErrorMessages = 'Error : This Serial No assigned for ' + ISNULL(@sShipToTarget,'') ;
								-- THROW 51000, @sErrorMessages, 1;
								RAISERROR (@sErrorMessages ,16,1 );
							END
						ELSE
							BEGIN
								Update Bx_SubConShipments 
									SET StatusID = 6 ,   -- Received from SubCOn
										ReceivedON = Getdate(),
										QASampleCategory = ISNULL(@sQACategory,'') ,
										ReceivedBy = @sLogonUser
								--WHERE	FullScanCode = @sFullScanCode 
							END
					END
			END
	END TRY

	BEGIN CATCH
			DECLARE @sTriggerAlert  Int = 0 ;
			-- THROW 51000, @sErrorMessages, 1;
			RAISERROR (@sErrorMessages ,16,1 );
	END CATCH
	SELECT @sSerialNo as SerialNo,@sWorkOrder as workOrder,@sSubConPo as subConPO,@sSAPSTONumber  as SAPSTONumber
END

GO
/****** Object:  StoredProcedure [dbo].[SPCreateSubConIssues]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SPCreateSubConIssues]
		@sFullScanCode			Varchar(60),
		@sReturnToTarget		Varchar(3),   -- SGW - BIT Warehouse, CHW - BESA Warehouse, SGQ - BIT QA
		@sAssignedSubConPO		Varchar(20),
		@sLogonUser				Varchar(20)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE	@sSerialNo			Varchar(10)
	DECLARE	@sScannedSerialNo	Varchar(10)
	DECLARE	@sWorkOrder		Varchar(20)
	DECLARE	@sSubConPo		Varchar(12)
	DECLARE	@sShipToTarget	Varchar(12)
	DECLARE	@sSAPSTONumber	Varchar(12)
	DECLARE	@sStatusCode	Varchar(12)
	DECLARE	@sGSCharacter as char(1)

	DECLARE	@sErrorMessages	NVarchar(500) = ''
	DECLARE	@nErrorCount	Int
	DECLARE @nGSPosition	Int = 0 

	SET		@nErrorCount = 0
	SET		@sErrorMessages = ''

	BEGIN TRY

	SET @sGSCharacter = CHAR(29)
	select @nGSPosition = PATINDEX('%'+@sGSCharacter + '%', @sFullScanCode )

	SELECT @sScannedSerialNo = 
			CASE WHEN ISNULL(@nGSPosition,0) > 0 THEN SUBSTRING(@sFullScanCode,@nGSPosition+3,Len(@sFullscancode)) ELSE '' END

		SET @sSerialNo = ''
		Select	@sSerialNo = S1.stntserial, 
				@sworkorder = S1.fgwono
		from	StentsByFG S1
		where	S1.stntserial = @sScannedSerialNo
				And s1.status = 1
		IF IsNULL(@sSerialNo,'') =  ''
			BEGIN
				SET @sErrorMessages = N'Error : Serial No Doesnot exists' 
				SET @nErrorCount = @nErrorCount + 1;
				--  THROW 51000, @sErrorMessages, 1;
				RAISERROR (@sErrorMessages ,16,1 );
			END
		SET @sSerialNo = ''
		Select	@sSerialNo = SerialNo,
				@sWorkOrder = WorkOrder,
				@sSubConPO = SubConPO,
				@sSAPSTONumber = SAPSTONumber ,
				@sShipToTarget = ShipToTarget ,
				@sStatusCode = StatusID 
		From	BX_SubConShipments
		where	SerialNo = @sScannedSerialNo
		IF IsNULL(@sSerialNo,'') <> ''
			BEGIN
				SET @sErrorMessages = N'Error : Serial already Scanned under ' + ISNULL(@sShipToTarget,'')  ;
				SET @nErrorCount = @nErrorCount + 1;
				-- THROW 51000, @sErrorMessages, 1;
				RAISERROR (@sErrorMessages ,16,1 );
			END
		ELSE
			BEGIN
				Insert into BX_SubconShipments (SerialNo ,WorkOrder,subConPo ,SAPStoNumber,ShipToTarget ,CreatedOn ,CreatedBy ,StatusID ,FullScanCode )
				SELECT @sScannedSerialNo , @sWorkOrder , @sAssignedSubConPO,'',@sReturnToTarget,getdate(),@sLogonUser,5,@sFullScanCode 
				SET @nErrorCount = 0
				SET @sErrorMessages = ''
			END
	END TRY

	BEGIN CATCH
		SET @nErrorCount = ERROR_NUMBER()
		SET @sErrorMessages = ERROR_MESSAGE();
		--THROW 51000, @sErrorMessages, 1;
		-- SELECT @nErrorCount as ErrorCount, @sErrorMessages as ErrorMessages,@sSerialNo as SerialNo
	END CATCH
	SELECT @nErrorCount as ErrorCount, @sErrorMessages as ErrorMessages,@sSerialNo as SerialNo
END






GO
/****** Object:  StoredProcedure [dbo].[sPGeneratePickIDReference]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[sPGeneratePickIDReference]
	-- Add the parameters for the stored procedure here
	@sSerialNo	Varchar(12),
	@sItemCode	Varchar(30)
AS
BEGIN
	SET NOCOUNT ON;

	-- Declare the return variable here
	DECLARE @Char01	Varchar(1), @char02	varchar(1), @Char03	Varchar(1), @Char04	Varchar(1)
	DECLARE @Num01	int, @Num02	int, @Num03	int , @Num04	int
	DECLARE	@NewPickID	Varchar(4)

	SET @NewPickID = ''
	-- Add the T-SQL statements to compute the return value here
	IF LEFT(@sItemCode,5) = '11070' or LEFT(@sItemCode,5) = '11071'
	BEGIN
		SELECT Top 1 
				@char01 = char01 ,
				@char02 = char02 ,
				@char03 = char03 ,
				@char04 = char04 
		FROM PickIDReference
		
		SET @Num01 = ASCII(@char01)
		SET @Num02 = ASCII(@char02)
		SET @Num03 = ASCII(@char03)
		SET @Num04 = ASCII(@char04)+ 1
		
		if @Num04 > 57						-- Reaches Character "9"
			BEGIN
				SET @Num04 = 49				-- Reset to 1
				SET @Num03 = @Num03 + 1
				if @Num03 > 57				-- Reaches Character "9"
				BEGIN
					SET @Num03 = 49			-- Reset to 1
					SET @Num02 = @Num02 +1
					if @Num02 = 79			-- Ignore Character "O"
						SET @Num02 = @Num02 + 1
					if @Num02 > 90			-- Reaches Character "Z"
					BEGIN
						SET @Num02 = 65		-- Reset to "A"
						SET @Num01 = @Num01 +1
					END
				END
			END
		
		SET @char01 = CHAR(@Num01)
		SET @char02 = CHAR(@Num02)
		SET @char03 = CHAR(@Num03)
		SET @char04 = CHAR(@Num04)
		 
		SET @NewPickID = @char01+@char02+@char03+@char04
		Update PickIDReference 
			SET	char01 =  @char01,
				char02 =  @char02,
				char03 =  @char03,
				char04 =  @char04
		
		Update stentSerials 
			SET	pickid = @NewPickID 
		WHERE	stentSerials.stntserial = @sSerialNo 
		
		-- Return the result of the function
		-- RETURN @NewPickID

		-- Insert statements for procedure here
	END
	SELECT ISNULL(@NewPickID,'')
END



GO
/****** Object:  StoredProcedure [dbo].[sPGenerateSerials4FG]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[sPGenerateSerials4FG]
	-- Add the parameters for the stored procedure here
	@sFGWorkOrder	varchar(20),
	@sFGBatchNo		Varchar(10),
	@sUserID		varchar (12),
	@sFGItemCode	Varchar(30)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	IF LEFT(@sFGItemCode,5) = '11070' or LEFT(@sFGItemCode,5) = '11071'
	BEGIN
		INSERT INTO stentSerials (
								stntserial,
								Status,
								rejcd,
								stwono,
								stbatch ,
								StentType,
								fgwono,
								inspnstatus,
								inspncode, 
								inspnby,
								inspndate,
								CreatedBy,
								CreatedDate,
								ModifiedBy,
								ModifiedDate ,
								PCount )
		SELECT	stntserial+'@'+fgwono,
				1,
				'',
				fgwono,
				@sFGBatchNo,
				1,
				'',
				-1,
				'',
				'',
				NULL,
				@sUserID,
				GETDATE(),
				@sUserID,
				GETDATE(),
				0
	FROM StentsByFG s1
	WHERE s1.fgwono = @sFGWorkOrder 
			AND	 stntserial+'@'+fgwono NOT IN (
												select	stntserial 
												from	stentSerials 
												where	stwono  = @sFGWorkOrder )
	END

END

GO
/****** Object:  StoredProcedure [dbo].[SpGetPendingReceiptsSerials]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SpGetPendingReceiptsSerials]
		@sShip2Target	Varchar(3)   -- SGW - BIT Warehouse, CHW - BESA Warehouse, SGQ - BIT QA
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
			
	--Select WorkOrder, SubCOnPo, SerialNo, CreatedBy, CreatedOn 
	Select * 
	from   BX_SubconShipments
	where	StatusID = 5
			AND ShipToTarget = @sShip2Target 

END


GO
/****** Object:  StoredProcedure [dbo].[SpGetPendingReceiptsSerialsBySubconOrder]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SpGetPendingReceiptsSerialsBySubconOrder]
		@sShip2Target	Varchar(3),   -- SGW - BIT Warehouse, CHW - BESA Warehouse, SGQ - BIT QA
		@sSubCOnPORefNo	Varchar(20)
AS
BEGIN

	SET NOCOUNT ON;
			
	Select WorkOrder, FullScanCode, SerialNo, CreatedBy, CreatedOn 
	--Select * 
	from   BX_SubconShipments
	where	StatusID = 5
			AND ShipToTarget = @sShip2Target 
			AND subConPo = @sSubCOnPORefNo

END


GO
/****** Object:  StoredProcedure [dbo].[SPGetShippedSerialsCount]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SPGetShippedSerialsCount]
		@sSubConPO		Varchar(20)

AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE	@nBITCount	Int
	DECLARE	@nBESACount	Int
	DECLARE	@nQACount	Int

	Select 
			@nBITCount = SUM(CASE WHEN ShipToTarget = 'SGW' THEN 1 ELSE 0 END) ,
			@nBESACount = SUM(CASE WHEN ShipToTarget = 'CHW' THEN 1 ELSE 0 END) ,
			@nQACount = SUM(CASE WHEN ShipToTarget = 'SGQ' THEN 1 ELSE 0 END)
	From BX_SubconShipments
	Where	workorder = @sSubConPO    -- Need to Change from WorkOrder to SUbConPO 
	
	Select	ISNULL(@sSubConPO,''),
			ISNULL(@nBITCount,0) as BITCount, 
			ISNULL(@nBESACount,0) as BESACount, 
			ISNULL(@nQACount,0) as QACount

END


GO
/****** Object:  StoredProcedure [dbo].[SpGetSubConIssuedSerialNos]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SpGetSubConIssuedSerialNos]
		@sSubConPO		Varchar(20),
		@sShip2Target	Varchar(3)   -- SGW - BIT Warehouse, CHW - BESA Warehouse, SGQ - BIT QA
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
			
	Select WorkOrder, SubCOnPo, SerialNo, CreatedBy, CreatedOn 
	from   BX_SubconShipments
	where	subConPo = @sSubConPO
			AND ShipToTarget = @sShip2Target 

END

GO
/****** Object:  StoredProcedure [dbo].[SPSetLock4SerialGenerations]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE PROCEDURE [dbo].[SPSetLock4SerialGenerations]
(
		@sWorkOrder		Varchar(20),
		@sCurrentUser	Varchar(30),
		@nCYear			Int,
		@nCMonth		Int,
		@sSetOrReset	Char(1),
		@sLockSetStatus	Int	OUTPUT
)

AS
BEGIN
	-- Declare the return variable here
	DECLARE @sCurrLockStatus	Char(1)
	DECLARE	@nLockSuccess		Int = 0

BEGIN TRY	
	IF @sSetOrReset = 'X'
		BEGIN
			if @nCYear = 0 AND @nCMonth = 0
			BEGIN
				Insert into SerialNoControl(CalYear, CalMonth,Digit01,Digit02,Digit03,Digit04,LastUpdateOn,LockStatus,LockedBy,LockedOn,LockKey) 	
				Values ( Year(GetDate()), Month(GetDate()),0,0,0,1,Getdate(),'','',Getdate(),'' )
			END

			Select @sCurrLockStatus = LockStatus 
			from SerialNoControl 
			where CalYear = @nCYear  and CalMonth = @nCMonth   
	
			If ISNULL(@sCurrLockStatus,'') =  ''
				BEGIN
					Update SerialNoControl
						SET LockStatus = 'X', 
							LockedBy = @sCurrentUser,
							LockedOn = Getdate(),
							LockKey = @sWorkOrder
					WHERE	CalYear = @nCYear and CalMonth = @nCMonth
					SET @nLockSuccess = 1
				END
			ELSE
				BEGIN
					SET @nLockSuccess = 0
				END
		END
	ELSE
		BEGIN
			Update SerialNoControl
				SET LockStatus = '', 
					LockedBy = '',
					LockedOn = NULL,
					LockKey = ''
			WHERE	CalYear = @nCYear and CalMonth = @nCMonth
			SET @nLockSuccess = 1
		END

	SELECT @sLockSetStatus = ISNULL(@nLockSuccess,0)
END TRY
BEGIN CATCH  
	INSERT INTO [dbo].[DBProceduresErrorLogs]
           ([ProcedureName]
           ,[ErrorNumber]
           ,[ErrorMessage]
           ,[WorkOrderNo])
    SELECT  
		ERROR_PROCEDURE() AS ErrorProcedure  
        ,ERROR_NUMBER() AS ErrorNumber  
        ,ERROR_MESSAGE() AS ErrorMessage  
		, @sWorkOrder as WorkOrder

END CATCH;  
END
		

GO
/****** Object:  StoredProcedure [dbo].[SPUpdateSubConReturns]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO






-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SPUpdateSubConReturns]
		@sFullScanCode			Varchar(60),
		@sReturnToTarget		Varchar(3),   -- SGW - BIT Warehouse, CHW - BESA Warehouse, SGQ - BIT QA
		@sLogonUser				Varchar(20),
		@sQACategory			Varchar(12) = NULL,
		@sOverWritePreviousScan	Varchar(1) = '',    -- X to overwrite existing values with new scanned values
		@dCurrDate				datetime=NULL
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE	@sSerialNo			Varchar(10)
	DECLARE	@sWorkOrder			Varchar(20)
	DECLARE	@sSubConPo			Varchar(12)
	DECLARE	@sShipToTarget		Varchar(12)
	DECLARE	@sSAPSTONumber		Varchar(12)
	DECLARE	@sStatusCode		Varchar(12)
	DECLARE @sCurrentQACategory	Varchar(12)


	DECLARE	@sErrorMessages	Varchar(300)
	DECLARE	@nErrorCount	Int

	SET		@nErrorCount = 0
	SET		@sErrorMessages = ''
	BEGIN TRY
		Select	@sSerialNo = SerialNo,
				@sWorkOrder = WorkOrder,
				@sSubConPO = SubConPO,
				@sSAPSTONumber = SAPSTONumber ,
				@sShipToTarget = ShipToTarget ,
				@sCurrentQACategory = QAsampleCategory ,
				@sStatusCode = StatusID 
		From	BX_SubConShipments
		where	FullScanCode = @sFullScanCode
				-- AND StatusID = 5
		IF IsNULL(@sSerialNo,'') = ''
			BEGIN
				SET @sErrorMessages = 'Error : Serial No does not exist in SubCon Operations' ;
				-- THROW 51000, @sErrorMessages, 1;
				RAISERROR (@sErrorMessages ,16,1 );
			END
		ELSE
			BEGIN
                IF @sOverWritePreviousScan = 'X' OR (@sStatusCode = 5 AND @sShipToTarget =   @sReturnToTarget)
                    BEGIN
                        Update Bx_SubConShipments 
                            SET StatusID = 6 ,   -- Received from SubCOn
                                ReceivedON = Getdate(),
                                ShipToTarget = @sReturnToTarget,
                                QASampleCategory = ISNULL(@sQACategory,'') ,
                                ReceivedBy = @sLogonUser
                        WHERE	FullScanCode = @sFullScanCode 
                    END
                ELSE  -- @sOverWritePreviousScan <> 'X'
                    BEGIN
                        IF @sStatusCode <> 5
                            BEGIN
                                IF @sCurrentQACategory = @sQACategory AND @sShipToTarget =   @sReturnToTarget 
                                    BEGIN
                                        SET @sErrorMessages = 'Error : Serial No already Scanned for ' + ISNULL(@sShipToTarget,'') ;
                                        -- THROW 51000, @sErrorMessages, 1;
										RAISERROR (@sErrorMessages ,16,1 );
                                    END
                                ELSE
                                    BEGIN
                                        SET @sErrorMessages = 'Error : Serial No already Scanned for ' + ISNULL(@sShipToTarget,'') + ' / ' +  ISNULL(@sCurrentQACategory,'');
                                        -- THROW 55500, @sErrorMessages, 1;
										RAISERROR (@sErrorMessages ,16,1 );
                                    END
                            END
                        ELSE  -- @sStatusCode = 5 AND ISNULL(@sReturnToTarget,'') <> ISNULL(@sShipToTarget,'') 
                            BEGIN
								SET @sErrorMessages = 'Error : This Serial No assigned for ' + ISNULL(@sShipToTarget,'') ;
								-- THROW 51000, @sErrorMessages, 1;
								RAISERROR (@sErrorMessages ,16,1 );
							END
                    END
/*
				IF @sStatusCode <> 5  AND @sOverWritePreviousScan <> 'X'
					BEGIN
						IF @sCurrentQACategory = @sQACategory AND @sShipToTarget =   @sReturnToTarget 
							BEGIN
								SET @sErrorMessages = 'Error : Serial No already Scanned for ' + ISNULL(@sShipToTarget,'') ;
								-- THROW 51000, @sErrorMessages, 1;
								RAISERROR (@sErrorMessages ,16,1 );
							END
						ELSE
							BEGIN
								SET @sErrorMessages = 'Error : Serial No already Scanned for ' + ISNULL(@sShipToTarget,'') + ' / ' +  ISNULL(@sCurrentQACategory,'');
								-- THROW 55500, @sErrorMessages, 1;
								RAISERROR (@sErrorMessages ,16,1 );
							END
					END
				ELSE
					BEGIN
						IF @sStatusCode = 5 AND ISNULL(@sReturnToTarget,'') <> ISNULL(@sShipToTarget,'')   
							BEGIN
								SET @sErrorMessages = 'Error : This Serial No assigned for ' + ISNULL(@sShipToTarget,'') ;
								-- THROW 51000, @sErrorMessages, 1;
								RAISERROR (@sErrorMessages ,16,1 );
							END
						ELSE
							BEGIN
								Update Bx_SubConShipments 
									SET StatusID = 6 ,   -- Received from SubCOn
										ReceivedON = Getdate(),
										QASampleCategory = ISNULL(@sQACategory,'') ,
										ReceivedBy = @sLogonUser
								WHERE	FullScanCode = @sFullScanCode 
							END
					END
*/
			END
	END TRY

	BEGIN CATCH
			DECLARE @sTriggerAlert  Int = 0 ;
			-- THROW 51000, @sErrorMessages, 1;
			RAISERROR (@sErrorMessages ,16,1 );
	END CATCH
	SELECT @sSerialNo as SerialNo,@sWorkOrder as workOrder,@sSubConPo as subConPO,@sSAPSTONumber  as SAPSTONumber
END

GO
/****** Object:  StoredProcedure [dbo].[zz_SP_ValidateFinalLineScanning]    Script Date: 01-Oct-18 8:40:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO














-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[zz_SP_ValidateFinalLineScanning]
		@sWorkOrder			Varchar(20),
		@sScanCode1			Varchar(60),
		@sScanCode2			Varchar(60),
		@sShipToTarget		Varchar(20),
		@nAcceptOrReject	Int = 1,
		@sOperation			Varchar(12),
		@sScanByUser		Varchar(30),
		@sRejectReason		Varchar(100) = ''
AS
BEGIN

	-- wono,srlno1,srlno2,oprn,status,crby,crdt
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.

	SET NOCOUNT ON;
	
	DECLARE		@sErrorMessages	Varchar(400)
	DECLARE		@sSerialNo		Varchar(10)
	DECLARE		@nShipToStatus	Int 
	DECLARE		@sExistingSerial	Varchar(10)

	--DECLARE		@sTmpSerial1		Varchar(20)
	--DECLARE		@sTmpSerial2		Varchar(20)
	DECLARE		@IsValidSerials		Int
	DECLARE		@nTotalScannedQty	Int
BEGIN TRY
	SELECT	@nShipToStatus = 
			CASE Right(@sShipToTarget,3)
				WHEN 'SGW'	THEN 1
				WHEN 'SGQ'	THEN 2
				WHEN 'CHW'	THEN 3
				WHEN 'QBB'	THEN 9
				ELSE 0
			END

	SET	@sSerialNo = Right(ltrim(Rtrim(@sScanCode1)),9)

	Select @sExistingSerial = Srlno1 
	from OperationLogs
	where Srlno1 =  @sSerialNo AND oprn = @sOperation
			-- AND [status] = @nAcceptOrReject

	

	SET @IsValidSerials = 
	CASE	WHEN @sOperation = 'CRMP' AND ( @sScanCode1 <> @sScanCode2  OR (Len(@sScanCode1) > 9 OR Len(@sScanCode2) > 9 ))
				THEN 0
				ELSE 
					CASE	WHEN (@sOperation = 'SEAL' OR @sOperation = 'BOX')
									AND NOT (Right(@sScanCode1,9) = Right(@sScanCode2,9) AND len(@sScanCode1) <> Len(@sScanCode2))
							THEN 0
							ELSE 1
					END
		END
	if @IsValidSerials = 0 AND ISNULL(@sExistingSerial,'') = ''
	BEGIN
		SET @sErrorMessages =  'Error : Mismatched Scanning, Try again... ' ;
		-- THROW 51000, @sErrorMessages, 1;
		RAISERROR (@sErrorMessages ,16,1 );
	END							
	-- To Check scanned Qty exceeds Work Order Qty

	--select @nTotalScannedQty = count(wono) 
	--From	OperationLogs 
	--where oprn = @sOperation and wono= @sWorkOrder 

	SET @sExistingSerial = NULL
	Select @sExistingSerial = Srlno1 
	from OperationLogs
	where Srlno1 =  @sSerialNo AND oprn = @sOperation
			AND [status] = @nAcceptOrReject

	if ISNULL(@sExistingSerial,'') <> ''
	BEGIN
		SET @sErrorMessages =  'Error : Serial No aleady Scanned for this Operation : ' + ISNULL(@sExistingSerial,'') ;
		-- THROW 51000, @sErrorMessages, 1;
		RAISERROR (@sErrorMessages ,16,1 );
	END

	Update OperationLogs 
		SET [Status] = @nAcceptOrReject,
			reascd1 = ISNULL(@sRejectReason,''),
			reascd2 = ISNULL(@sRejectReason,''),
			mddt = getdate(),
			mdby = @sScanByUser
		where ltrim(rtrim(wono)) = @sWorkOrder 
				AND srlno1 = @sSerialNo 
				AND oprn = @sOperation
	IF @@ROWCOUNT <= 0 
	BEGIN
		Insert into OperationLogs(wono,srlno1,srlno2,oprn,[status],reascd1,reascd2, crby,crdt,mdby,mddt) 
		Select  @sWorkOrder , 
				@sSerialNo,
				@sSerialNo,
				@sOperation,
				@nAcceptOrReject,
				@sRejectReason,
				@sRejectReason,
				@sScanByUser ,
				getdate() ,
				@sScanByUser ,
				getdate() 
	END
	-- Create Records for Subcon PO Receipts
IF @sOperation = 'BOX'
BEGIN

	Update [BX_SubconShipments]
	SET	[ShipToTarget] = Right(@sShipToTarget,3),
		ModifiedOn = getdate(),
		ModifiedBy = @sScanByUser,
		IsDeleted = CASE WHEN @nAcceptOrReject = 1 THEN '' ELSE 'X' END
	where SerialNo = @sSerialNo
			AND WorkOrder = @sWorkOrder

	IF @@ROWCOUNT <= 0
	BEGIN
		Insert Into [BX_SubconShipments] (
			[SerialNo]
		  ,[workorder]
		  ,[subConPo]
		  ,[SAPStoNumber]
		  ,[ShipToTarget]
		  ,[QASampleCategory]
		  ,[CreatedOn]
		  ,[CreatedBy]
		  ,[ModifiedOn]
		  ,[ModifiedBy]
		  ,[StatusID]
		  ,[FullScanCode]
		  ,IsDeleted
		  )
	  		Select  
				@sSerialNo,
				@sWorkOrder , 
				'',
				'',
				Right(@sShipToTarget,3),
				'' ,
				getdate() ,
				@sScanByUser,
				getdate() ,
				@sScanByUser,
				5,
				-- Concat('01',E.EanCode,'17', Right(Convert(varchar(8),ISNULL(B.ExpiryDate,getdate()),112),6),'10',W.batchno,'|21',@sSerialNo ),
				'01'+ E.EanCode +'17'+ Right(Convert(varchar(8),ISNULL(B.ExpiryDate,getdate()),112),6) + '10' + W.batchno +'|21'+ @sSerialNo ,
				CASE WHEN @nAcceptOrReject = 0 THEN '' ELSE 'X' END
			From WorkOrders W 
					Left Outer Join SAP_EANCodes E on E.MaterialCode = W.Itemcode
					Left Outer Join SAP_Batches B on B.material = W.ItemCode AND B.batchNo = W.batchno
			Where ltrim(rtrim(W.Project)) = @sWorkOrder 
	END
END
-- 01088888930186901720061310W18060003|21180612957
END TRY
	BEGIN CATCH
			DECLARE @sTriggerAlert  Int = 0 ;
			SET @sErrorMessages = ERROR_MESSAGE ()
			-- THROW 51000, @sErrorMessages, 1;
			-- RAISERROR (@sErrorMessages ,16,1 );
			 -- Select -999 as ErrorNumber, @sErrorMessages as ErrorMessage
	END CATCH

	Select (CASE WHEN ISNULL(@sErrorMessages,'') = '' THEN 0 ELSE -999 END) as ErrorNumber, ISNULL(@sErrorMessages,'') as ErrorMessage
END
GO
