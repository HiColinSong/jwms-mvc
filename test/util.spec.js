var assert = require('assert');
describe('delivery order converter', function() {
    it('convert original DO to the one with only required fields for packing', function() {
        var util = require('./../api/config/util');
        var sapDo = require('./do.json');
        var bxDo = util.deliveryOrderConverter(sapDo);
        console.log(bxDo);
      assert.equal([1,2,3].indexOf(4), -1);
    });
});
describe('transfer order converter', function() {
    it('convert original TO to the one with only required fields for picking', function() {
        var util = require('./../api/config/util');
        var sapTo = require('./to.json');
        var bxTo = util.transferOrderConverter(sapTo);
        console.log(bxTo);
      assert.equal([1,2,3].indexOf(4), -1);
    });
});
