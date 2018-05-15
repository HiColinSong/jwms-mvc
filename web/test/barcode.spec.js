/**
 * Created by Yadong on 14/4/2018.
 */
(function() {
    "use strict";
    var barcode;
    describe("Service ->", function() {
        beforeEach(inject(function() {
            barcode = new Barcode();
        }));
        
        it ('scanItemSvc -> should resolve GS barcode string', function() {
            barcode.barcode1 = '01088888930163991714111310W131004584';
            barcode.parseBarcode();
            // barcode.checkInfoComplete();
            console.log("barcode="+JSON.stringify(barcode,null,2));
            barcode.reset(); 
            barcode.barcode1 = '01088888930163991714111310W191004584'+String.fromCharCode(29)+"211803W189";
            barcode.parseBarcode();
            barcode.reset();
            console.log("barcode="+JSON.stringify(barcode,null,2));
        });
        it ('scanItemSvc -> should trading product', function() {
            barcode.barcode1 = '010454366001796517180630300110P2H40709A';
            barcode.parseBarcode();
            // barcode.checkInfoComplete();
            console.log("barcode="+JSON.stringify(barcode,null,2));
        });

    });
})();