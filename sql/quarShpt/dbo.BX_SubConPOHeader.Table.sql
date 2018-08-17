USE [BIOTRACK]
GO
/****** Object:  Table [dbo].[BX_SubConPOHeader]    Script Date: 8/10/2018 2:51:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BX_SubConPOHeader](
	[SubconPORefNo] [varchar](20) NOT NULL,
	[PODate] [date] NULL,
	[SAPSTORefNo] [varchar](20) NULL,
	[CreatedBy] [varchar](20) NULL,
	[CreatedOn] [date] NULL,
	[STOAssignedBy] [varchar](20) NULL,
	[STOAssignedOn] [date] NULL,
	[IsComplete] [char](1) NULL,
 CONSTRAINT [PK_BX_SubConPOHeader] PRIMARY KEY CLUSTERED 
(
	[SubconPORefNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
