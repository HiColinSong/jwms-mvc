USE [BIOTRACK]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER TABLE dbo.BX_PackDetails
  ADD BalanceQty int;


INSERT INTO dbo.SAP_DOHeader values ('0800379646','20180421','yd.zhu','0003562','1234',0)

select * from dbo.SAP_DODetail

select * from dbo.SAP_DOHeader

select * from dbo.SAP_DODetail a,dbo.SAP_DOHeader b where a.DONumber='0800379646'

select dbo.nth_occur('abc,def,ghi',',',1)

EXEC dbo.InsertOrUpdateDO 
	@DONumber='0800379642',
	@DOCreationDate='20180423',
	@DOCreationUser='yadong.zhu',
	@Plant='3334',
	@ShipToCustomer='44453',
	@DOStatus='1',
    @DOItemNumberList = "doi001,doi002,doi003",
    @MaterialCodeList = "m123-11,m123-22,m123-33",
    @BatchNumberList = "batch001,batch002,batch003",
    @VendorBatchList = "vb001,vb002,vb003",
    @DOQuantityList = "21,22,23"


BEGIN TRY  
    -- RAISERROR with severity 11-19 will cause execution to   
    -- jump to the CATCH block.  
    RAISERROR ('Error raised in TRY block.', -- Message text.  
               16, -- Severity.  
               1 -- State.  
               );  
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


EXEC dbo.InsertHandlingUnits
	@DONumber='0800379642',
	@HUNumberList = '22034560237502345023,22034560237502345024,22034560237502345025',
	@PackMaterial='m123-11',
	@CreatedBy='yadong.zhu',
	@CreatedOn='20180422'


	select sum(BalanceQty)+1 from dbo.BX_PackDetails where DONumber='0800379646'
	select * from dbo.BX_PackDetails where DONumber='0800379642'
	INSERT INTO dbo.BX_PackDetails values (newid(),'0800379642','HU111','m123-11','batch001',NULL,'yadong','20180422',0,NULL,13)

	select * from dbo.SAP_DODetail where DONumber='0800379642'

	select ((sum(a.BalanceQty)+12)-b.DOQuantity) from dbo.BX_PackDetails a,dbo.SAP_DODetail b 
                        where   a.DONumber='0800379642' and 
                                b.DONumber='0800379642' and 
                                a.MaterialCode='m123-11' and 
                                b.MaterialCode='m123-11' and 
                                a.BatchNo='batch001' and 
                                b.BatchNumber='batch001'

	select * from dbo.BX_PackDetails a,dbo.SAP_DODetail b 
                        where   a.DONumber='0800379642' and 
                                b.DONumber='0800379642' and 
                                a.MaterialCode='m123-11' and 
                                b.MaterialCode='m123-11' and 
                                a.BatchNo='batch001' and 
                                b.BatchNumber='batch001'

	DECLARE @v1 int,@v2 int, @v3 int
	SET @v1=(select sum(BalanceQty) from dbo.BX_PackDetails  
                        where   DONumber='0800379642' and 
								MaterialCode='m123-11' and 
                                BatchNo='batch001')
								
			SET @v2=(select DOQuantity from dbo.SAP_DODetail 
                        where   DONumber='0800379642' and 
								MaterialCode='m123-11' and 
                                BatchNumber='batch001')
			SET @v3=8

			select (@v1+@v3-@v2)

			DECLARE @sn varchar(8),@SerialNo varchar(8)=NULL
			--SET @SerialNo='181316AA';

			select * from dbo.BX_PackDetails where DONumber='0800379647' and SerialNo=@SerialNo


EXEC dbo.InsertOrUpdatePacking 
	@DONumber='0800379642',
	@HUNumber='HU111',
    @MaterialCode='m123-11',
    @BatChNo='batch001',
    @SerialNo=NULL,
    @PackBy='sean',
    @PackedOn='20180422',
    @Status=0,
    @FullScanCode=NULL,
    @Qty=1

	SELECT * from dbo.BX_PackDetails 
                    WHERE	DONumber='0800379642' and 
                            HUNumber='HU111' and 
                            MaterialCode='m123-11' and 
                            BatchNo='batch001' and 
                            PackBy='yadong' and
                            PackedOn='20180422'

	select sum(BalanceQty) from dbo.BX_PackDetails  
                        where   DONumber='0800379642' and 
								MaterialCode='m123-11' and 
                                BatchNo='batch001'
select DOQuantity from dbo.SAP_DODetail 
                        where   DONumber='0800379642' and 
								MaterialCode='m123-11' and 
                                BatchNumber='batch001'

	IF EXISTS (select * from dbo.BX_PackHeader where DONumber='0800379642' and PackStatus=1) 
		print 'true'
	ELSE
		print 'false'

		select * from dbo.SAP_DOHeader where DONumber='0800379642' and DOStatus=1
		update  dbo.SAP_DOHeader set DOSTatus=0 where DONumber='0800379642'

		select * from dbo.BX_PackHUnits where DONumber='0800379642' and HUNumber='HU111'
		insert into dbo.BX_PackHUnits values('0800379642','HU111','111-222','yadong','20180209')            


