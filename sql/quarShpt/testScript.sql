EXECUTE [dbo].[BX_InserOrUpdateQuarShptPlan] 
	@qsNo ='B2018004101',
	@planOn ='2018-08-10:13:33:00',
	@planBy ='yd.zhu',
    @SubconPORefNo ='B20180041',
    @workorderList ='210000066596,210000078391,210000081717',
    @batchNoList ='W18070115,W18070116,W18070117',
    @qtyList='100,150,200'



 --did it by checking SET IMPLICIT_TRANSACTIONS check-box from Options. To navigate to Options Select Tools>Options>Query Execution>SQL Server>ANSI in your Microsoft SQL Server Management Studio.