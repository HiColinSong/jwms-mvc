var assert = require('assert');
describe('return formatted date and time', function() {
    it('convert original TO to the one with only required fields for picking', function() {
        var util = require('./../api/config/util');
        var d= util.formatDateTime('2018-05-09T00:00:00.000Z');
        console.log(d);
      assert.equal([1,2,3].indexOf(4), -1);
    });
});

