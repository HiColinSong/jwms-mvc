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
				SELECT c.id,c.storageBin,c.storageLoc,'BFR1-3508','W17040490D',c.plant,c.totalStock,ISNULL(sum(s.qty),0) as scanQty
                FROM dbo.BX_CountingWM c left outer join dbo.BX_CountingWM_Scan s on c.id=s.countingWmId
                WHERE material = 'BFR1-3508' and batch = 'W17040490D' 
				group by c.id,c.storageBin,c.storageLoc,c.plant,c.totalStock

				select * from @temp_item



EXEC [dbo].[BX_Scan_CountingWM] 
	@docNo ='9000007563',
	@warehouse ='Z01',
	@EANCode='08888893014692',
    @MaterialCode ='BFR1-3508',
    @BatchNo ='W17040490D',
    @SerialNo = '18101021',
    @countBy ='yd.zhu',
    @countOn ='20181020 10:10:11',
    @FullScanCode='01088888930146921720042310W17040490D',
    @Qty = 32


	select * from BX_CountingWM_Scan
  