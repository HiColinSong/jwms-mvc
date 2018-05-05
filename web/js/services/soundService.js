/*bx - services.js - Yadong Zhu 2017*/ (function() {
    'use strict';
    angular.module('bx.services')
    .service('soundSvc',['$timeout','ngAudio',function($timeout,ngAudio){
        var player;
        return {
            play:function(sound){
                
                if (sound==="badSound"){
                    ngAudio.load('../../media/badScan.mp3').play();
                } else {
                    player=ngAudio.load('../../media/goodScan.mp3')
                    player.play();
                    $timeout(function(){
                        player.stop();
                    },500);
                }
            }
        }

    }])
    ;
}());
