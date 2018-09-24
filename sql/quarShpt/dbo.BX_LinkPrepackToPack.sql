USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_LinkPrepackToPack]    Script Date: 22-May-18 4:57:58 PM ******/
-- do the link: when workorderList is not null
-- do the unlink when workorderList is NULL

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[BX_LinkPrepackToPack] 
(
	@qsNo varchar(22),
	@DONumber varchar(12),
	@workorderList varchar(8000)= NULL, --if NULL, will do the unlink
	@DOItemNumberList varchar(8000)= NULL
)
AS
--copy subcon items to pack
--copy prepack handling unit to pack handling unit
--define a temp table for finding the doItemNumber

DELETE FROM BX_PackDetails WHERE DONumber=@DONumber
DELETE FROM BX_PackHUnits WHERE  DONumber=@DONumber
UPDATE BX_QuarShptHeader SET linkedDONumber=NULL WHERE qsNo=@qsNo


IF (@workorderList IS NOT NULL)  
    BEGIN          
        DECLARE @temp_DOItemNumber TABLE
        (
            workorder varchar(22),
            DOItemNumber char(6)
        );

        DECLARE 
            @nth int,
            @DOItemNumber varchar (6),
            @workorder varchar (22)

        --insert workOrders and DOItems into temp table
        SET @nth=1
            while 1=1
            BEGIN
                SET @workorder = (select dbo.nth_occur(@workorderList,',',@nth));
                IF LEN(ISNULL(@workorder, '')) = 0 break;
                SET @DOItemNumber = (select dbo.nth_occur(@DOItemNumberList,',',@nth));
                INSERT INTO @temp_DOItemNumber values(@workorder,@DOItemNumber)

                SET @nth=@nth+1
                continue;
            END   -- end of while loop 

        --copy the prepack Handling Unit Number into pack one 
        INSERT INTO BX_PackHUnits
        SELECT  @DONumber,HUNumber,PackMaterial,CreatedBy,CreatedOn
		FROM BX_QuarShpt_PrepackHUnits
        WHERE qsNO=@qsNo

        --copy the prepack items  into pack table 
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

        UPDATE BX_QuarShptHeader SET linkedDONumber=@DONumber WHERE qsNo=@qsNo
    END     


    