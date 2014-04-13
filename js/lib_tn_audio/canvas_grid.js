define([
    
    'jQuery',
    'jQueryUI'
    
], function (
        
    $

) {

    var Grids = {
     
        buildVertical : function (gridPixelSize, color, beats, div) {
            var canvas = $('#'+div+'').get(0);
            var ctx = canvas.getContext("2d");

            ctx.lineWidth = 0.5;
            ctx.strokeStyle = color;


            // horizontal grid lines
//            for(var i = 0; i <= 0; i = i + gridPixelSize) {//canvas.height
//                ctx.beginPath();
//                ctx.moveTo(0, i);
//                ctx.lineTo(canvas.width, i);
//                if(i % parseInt( gridPixelSize * beats ) == 0) {
//                    ctx.lineWidth = 2;
//                } else {
//                    ctx.lineWidth = 0.5;
//                }
//                ctx.closePath();
//                ctx.stroke();
//            }

            // vertical grid lines
            for(var j = 0; j <= canvas.width; j = j + gridPixelSize) {
                ctx.beginPath();
                ctx.moveTo(j, 0);
                ctx.lineTo(j, canvas.height);
                if(j % parseInt(gap) === 0) {
                    ctx.lineWidth = 1;
                } else {
                    ctx.lineWidth = 0.5;
                }
                ctx.closePath();
                ctx.stroke();
            }
            return true;
        }
    }
    
    return Grids;

});