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

--insert EAN Code
insert into dbo.SAP_EANCodes values('04543660018009','LAH35018P', 1)
insert into dbo.SAP_EANCodes values('04543660017965','LAH25018P', 1)

			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGW',NULL) as nPlanSGWQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGQ',NULL) as nPlanSGQQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGW',5) as nPendingSGWQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGQ',5) as nPendingSGQQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGW',6) as nRcptSGWQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGQ',6) as nRcptSGQQty


select 
  count(case when shipToTarget = 'SGW' then 1 else null end) as nPlanSGWQty,
  count(case when shipToTarget = 'SGQ' then 1 else null end) as nPlanSGQQty,
  count(case when shipToTarget = 'SGW' AND StatusID=5 then 1 else null end) as nPendingSGWQty,
  count(case when shipToTarget = 'SGQ' AND StatusID=5 then 1 else null end) as nPendingSGQQty,
  count(case when shipToTarget = 'SGW' AND StatusID=6 then 1 else null end) as nRcptSGWQty,
  count(case when shipToTarget = 'SGQ' AND StatusID=6 then 1 else null end) as nRcptSGQQty

	from BX_SubconShipments 
	where workorder = @sWorkOrder   