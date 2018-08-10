USE [BIOTRACK]
GO

/****** Object:  Table [dbo].[BX_QuarShptPlan]    Script Date: 8/9/2018 6:20:56 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[BX_QuarShptPlan](
	[qsNo] [varchar](22) NOT NULL,
	[SubconPORefNo] [varchar](20) NOT NULL,
	[workorder] [varchar](20) NOT NULL,
	[batchNo] [varchar](12) NOT NULL,
    [qty] [numeric](18, 0) NULL,
 CONSTRAINT [PK_BX_QuarShptPlan] PRIMARY KEY CLUSTERED 
(
	[qsNo] ASC,
	[SubconPORefNo] ASC,
	[workorder] ASC,
	[batchNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO