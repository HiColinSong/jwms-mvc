DECLARE @temp_DOItemNumber TABLE
        (
            workorder varchar(22),
            DOItemNumber char(6)
        );

DECLARE 
	@qsNo varchar(22)='B2018004102',
	@DONumber varchar(12)='0123456789',
	@workorderList varchar(8000)='210000066595,210000066596',
	@DOItemNumberList varchar(8000)='000001,000002',
    @nth int='',
    @DOItemNumber varchar(6)='',
    @workorder varchar(22)=''

SET @nth=1
    while 1=1
    BEGIN
        SET @workorder = (select dbo.nth_occur(@workorderList,',',@nth));
        IF LEN(ISNULL(@workorder, '')) = 0 break;
        SET @DOItemNumber = (select dbo.nth_occur(@DOItemNumberList,',',@nth));
        INSERT INTO @temp_DOItemNumber values(@workorder,@DOItemNumber)

    	SET @nth=@nth+1
        continue;
    END        
	select * from @temp_DOItemNumber
    INSERT INTO dbo.BX_PackDetails
    SELECT 
        newid(),
        @DONumber,
        h.HUNumber,
        w.Itemcode,
        w.batchno,
        s.SerialNo,
        s.ModifiedBy,
        Convert(datetime,s.ModifiedOn),
        1,
        s.FullScanCode,
        1,
        t.DOItemNumber,
        NULL
    FROM dbo.BX_SubconShipments s
         left outer join dbo.workorders w on s.workorder=w.Project
         left outer join dbo.BX_QuarShpt_PrepackHUnits h on s.HUNumber=h.HUNumber
         left outer join @temp_DOItemNumber t on t.workorder=s.workorder
    WHERE s.qsNo=@qsNo

