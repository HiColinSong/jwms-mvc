USE [BIOTRACK]
GO
/****** Object:  Table [dbo].[BX_SubConDetails]    Script Date: 8/10/2018 2:51:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BX_SubConDetails](
	[SubconPORefNo] [varchar](20) NOT NULL,
	[WorkOrder] [varchar](20) NOT NULL,
	[BESAQty] [int] NULL,
	[BITQty] [int] NULL,
	[QAQty] [int] NULL,
	[CreatedBy] [varchar](20) NULL,
	[CreatedOn] [date] NULL,
 CONSTRAINT [PK_BX_SubConDetails] PRIMARY KEY CLUSTERED 
(
	[SubconPORefNo] ASC,
	[WorkOrder] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
