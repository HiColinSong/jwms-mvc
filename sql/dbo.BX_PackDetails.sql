USE [BIOTRACK]
GO

ALTER TABLE [dbo].[BX_PackDetails] DROP CONSTRAINT [DF__BX_PackDe__Balan__37C5420D]
GO

ALTER TABLE [dbo].[BX_PackDetails] DROP CONSTRAINT [DF_BX_PackDetails_RowKey]
GO

/****** Object:  Table [dbo].[BX_PackDetails]    Script Date: 29-Apr-18 7:37:38 PM ******/
DROP TABLE [dbo].[BX_PackDetails]
GO

/****** Object:  Table [dbo].[BX_PackDetails]    Script Date: 29-Apr-18 7:37:38 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[BX_PackDetails](
	[RowKey] [uniqueidentifier] NOT NULL,
	[DONumber] [varchar](12) NULL,
	[HUNumber] [varchar](20) NULL,
	[MaterialCode] [varchar](18) NULL,
	[BatchNo] [varchar](20) NULL,
	[SerialNo] [varchar](8) NULL,
	[PackBy] [varchar](20) NULL,
	[PackedOn] [datetime] NULL,
	[Status] [char](1) NULL,
	[FullScanCode] [varchar](60) NULL,
	[ScanQty] [int] NOT NULL,
	[DOItemNumber] [char](6) NULL,
	[BinNumber] [varchar](20) NULL,
 CONSTRAINT [PK_BX_PackDetails] PRIMARY KEY CLUSTERED 
(
	[RowKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[BX_PackDetails] ADD  CONSTRAINT [DF_BX_PackDetails_RowKey]  DEFAULT (newid()) FOR [RowKey]
GO

ALTER TABLE [dbo].[BX_PackDetails] ADD  DEFAULT ((1)) FOR [ScanQty]
GO