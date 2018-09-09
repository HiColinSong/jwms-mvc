USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_SPGetSubConOrders]    Script Date: 9/9/2018 2:51:12 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
ALTER PROCEDURE [dbo].[BX_SPGetSubConOrders]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

 Select h.SubCOnPORefNo, h.PoDate, d.WorkOrder,w.batchNo,
		FullScanCode = (select top (1) FullScanCode from dbo.BX_SubconShipments where workorder=d.WorkOrder)
   from bx_subconPOHeader h,BX_SubConDetails d,WorkOrders w
   where ISNULL(h.IsComplete,'') = '' and  h.SubconPORefNo=d.SubconPORefNo and w.Project=d.WorkOrder
   order by h.SubconPORefNo

   /*
   Select SubCOnPORefNo, PoDate,ISNULL(SAPSTORefNo,'') as SAPSTORefNo 
   from bx_subconPOHeader 
   where ISNULL(IsComplete,'') = ''
   */

END
