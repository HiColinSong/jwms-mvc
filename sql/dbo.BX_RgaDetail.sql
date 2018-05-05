USE [BIOTRACK]
GO

/****** Object:  Table [dbo].[BX_RgaDetails]    Script Date: 05-May-18 10:54:32 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[BX_RgaDetails](
	[RowKey] [uniqueidentifier] NOT NULL,
	[DONumber] [varchar](12) NULL,
	[MaterialCode] [varchar](18) NULL,
	[BatchNo] [varchar](20) NULL,
	[SerialNo] [varchar](8) NULL,
	[ReceiptBy] [varchar](20) NULL,
	[ReceivedOn] [datetime] NULL,
	[Status] [char](1) NULL,
	[FullScanCode] [varchar](60) NULL,
	[ScanQty] [int] NOT NULL,
	[DOItemNumber] [char](6) NULL,
 CONSTRAINT [PK_BX_RgaDetails] PRIMARY KEY CLUSTERED 
(
	[RowKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[BX_RgaDetails] ADD  CONSTRAINT [DF_BX_RgaDetails_RowKey]  DEFAULT (newid()) FOR [RowKey]
GO

ALTER TABLE [dbo].[BX_RgaDetails] ADD  DEFAULT ((1)) FOR [ScanQty]
GO


