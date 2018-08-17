USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_SPGetSubConOrders]    Script Date: 8/10/2018 2:51:30 PM ******/
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
