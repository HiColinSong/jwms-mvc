USE [BIOTRACK]
GO
/****** Object:  Table [dbo].[BX_SubconShipments]    Script Date: 8/10/2018 2:51:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BX_SubconShipments](
	[SerialNo] [varchar](10) NOT NULL,
	[workorder] [varchar](20) NULL,
	[subConPo] [varchar](30) NULL,
	[SAPStoNumber] [varchar](20) NULL,
	[ShipToTarget] [varchar](3) NULL,
	[QASampleCategory] [varchar](12) NULL,
	[CreatedOn] [datetime] NULL,
	[CreatedBy] [varchar](20) NULL,
	[StatusID] [char](1) NULL,
	[FullScanCode] [varchar](50) NULL,
	[ReceivedOn] [datetime] NULL,
	[ReceivedBy] [varchar](20) NULL,
	[ModifiedBy] [varchar](20) NULL,
	[ModifiedOn] [datetime] NULL,
	[IsDeleted] [char](1) NULL,
 CONSTRAINT [PK_BX_SubconShipments] PRIMARY KEY CLUSTERED 
(
	[SerialNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[BX_SubconShipments] ADD  CONSTRAINT [DF_BX_SubconShipments_LastModifiedOn]  DEFAULT (getdate()) FOR [ModifiedOn]
GO
ALTER TABLE [dbo].[BX_SubconShipments] ADD  CONSTRAINT [DF_BX_SubconShipments_IsDeleted]  DEFAULT ('') FOR [IsDeleted]
GO
