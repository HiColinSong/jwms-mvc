/**
 * Created by Yadong on 14/4/2018.
 */
(function() {
    "use strict";

    var scanItemSvc, bxService, httpBackend;

    describe("Service ->", function() {
        beforeEach(module(
            'ngResource',
            'bx.services'
        ));

        beforeEach(inject(function(_scanItemSvc_, _bxService_, $httpBackend) {
            scanItemSvc = _scanItemSvc_;
            bxService = _bxService_;
            httpBackend = $httpBackend;
        }));

        
        it ('scanItemSvc -> should resolve GS barcode string', function() {
            var barcode_full = '01088888930163991714111310W131004584'+String.fromCharCode(29)+"211803W189"; 
            var barcode_EAN = '0108888893016399'; 
            var barcode_EAN2 = '0208888893016399';
            var barcode_EAN_bad = '1208888893016399';
            var barcode_Expiry = '17141113'; 
            var barcode_batchNo = '10W131004584'; 
            var barcode_serialNo = '211803W189'; 
            var gs=String.fromCharCode(29);
            
            // var bInfo=scanItemSvc.resolveBarcode(barcode_full);
            // expect(bInfo).toEqual({"isValid":true,"EANCode":"08888893016399","expiry":"141113","batchNo":"W131004584","serialNo":"1803W189"});
            // // expect(bInfo.isValid).toBeFalsy();
            // bInfo=scanItemSvc.resolveBarcode(barcode_EAN+barcode_batchNo);
            // expect(bInfo).toEqual({"isValid":true,"EANCode":"08888893016399","batchNo":"W131004584"});
            
            // bInfo=scanItemSvc.resolveBarcode(barcode_EAN2+barcode_batchNo+gs+barcode_serialNo+gs+barcode_Expiry);
            // expect(bInfo).toEqual({"isValid":true,"EANCode":"08888893016399","expiry":"141113","batchNo":"W131004584","serialNo":"1803W189"});
            
            // bInfo=scanItemSvc.resolveBarcode(barcode_batchNo+gs+barcode_serialNo+gs+barcode_Expiry+barcode_EAN);
            // expect(bInfo).toEqual({"isValid":true,"EANCode":"08888893016399","expiry":"141113","batchNo":"W131004584","serialNo":"1803W189"});
           
            // bInfo=scanItemSvc.resolveBarcode(barcode_batchNo+gs+barcode_serialNo+gs+barcode_Expiry);
            // expect(bInfo).toEqual({"isValid":true,"expiry":"141113","batchNo":"W131004584","serialNo":"1803W189"});
          
            // bInfo=scanItemSvc.resolveBarcode(barcode_batchNo+gs+barcode_serialNo+gs+barcode_Expiry+barcode_EAN_bad);
            // expect(bInfo.isValid).toBeFalsy();


            // bInfo=scanItemSvc.resolveBarcode(barcode_EAN2,barcode_serialNo+gs+barcode_Expiry);
            // expect(bInfo).toEqual({"isValid":true,"EANCode":"08888893016399","expiry":"141113","serialNo":"1803W189"});
            // console.log(JSON.stringify(bInfo));

            
        });
        it ('scanItemSvc -> should resolve non-GS barcode string', function() {
            // var bInfo=scanItemSvc.resolveBarcode("01088888930163991714111310W131004584");
            // expect(bInfo).toEqual({"isValid":true,"EANCode":"08888893016399","expiry":"141113","batchNo":"W131004584"});

            // bInfo=scanItemSvc.resolveBarcode("01088888930163991714111310W13100458","211803W189");
            // expect(bInfo).toEqual({"isValid":true,"EANCode":"08888893016399","expiry":"141113","batchNo":"W13100458","serialNo":"1803W189"});

            // bInfo=scanItemSvc.resolveBarcode("01088888930163991714111310W13100458");
            // expect(bInfo).toEqual({"isValid":true,"EANCode":"08888893016399","expiry":"141113","batchNo":"W13100458"});

            // bInfo=scanItemSvc.resolveBarcode("010888889301639917141113","10W13100458");
            // expect(bInfo).toEqual({"isValid":true,"EANCode":"08888893016399","expiry":"141113","batchNo":"W13100458"});


            // console.log(JSON.stringify(bInfo));
        });

        

    });
})();