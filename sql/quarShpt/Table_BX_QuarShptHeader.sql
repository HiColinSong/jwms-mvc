USE [BIOTRACK]
GO

/****** Object:  Table [dbo].[BX_QuarShptHeader]    Script Date: 8/9/2018 6:20:56 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[BX_QuarShptHeader](
	[qsNo] [varchar](22) NOT NULL,
	[SubconPORefNo] [varchar](20) NOT NULL,
	[planBy] [varchar](20) NULL,
    [planOn] [datetime] NULL,
	[linkedDONUmber] [varchar](12)  NULL,
    [prepackConfirmOn] [datetime] NULL,
 CONSTRAINT [PK_BX_QuarShptHeader] PRIMARY KEY CLUSTERED 
(
	[qsNo] ASC,
	[SubconPORefNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO