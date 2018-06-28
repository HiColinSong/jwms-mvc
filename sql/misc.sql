  -- replace part of the value
update [dbo].[BX_SubconShipments] 
SET FullScanCode = REPLACE(FullScanCode, '01088888930189661720062710W18060005', '01088888930189661720061310W18060005')
WHERE subConPo='2100180611'  
-- revert scanned barcode back
update [dbo].[BX_SubconShipments] set StatusID='5' where subConPo='2100180611'
update dbo.BX_SubConPOHeader set isComplete = NULL where SubconPORefNo='2100180611'

-- add full barcode
update [dbo].[BX_SubconShipments] set FullScanCode='01088888930189661720062710W18060005|21'+SerialNo 
where subConPo='2100180611'