/*bx - services.js - Yadong Zhu 2017*/ (function() {
    'use strict';
    angular.module('bx.services')
     .service('soundSvc',[function(){
        var goodplayer=new Audio('../../media/goodScan.mp3');
        var badplayer=new Audio('../../media/badScan.mp3');
        return {
            play:function(sound){
                
                if (sound==="badSound"){
                    badplayer.play()
                } else {
                    goodplayer.play();
                }
            }
        }

    }])
    ;
}());
