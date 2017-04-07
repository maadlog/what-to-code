GameBox = function()
{
    this.lastFrameTime = Date.now();
    this.currentFrameTime = Date.now();
    this.timeElapsed = 0;

    this.gameObjects = [];
}

GameBox.prototype.gameLoop = function()
{
   window.requestAnimationFrame(this.gameLoop.bind(this));
   this.lastFrameTime = this.currentFrameTime;
   this.currentFrameTime = Date.now();
   this.timeElapsed +=  this.currentFrameTime - this.lastFrameTime ;
   this.update(this.timeElapsed / 100); //modify data which is used to render
   this.render();
}

//GAME DATA

var ctx;
var canvasWidth;
var canvasHeight;

Point = function(init_x,init_y)
{
    this.x= init_x;
    this.y= init_y;

    this.dueTime = 0;
    this.vectorPath = { length: 100, angle: Math.PI };
}

Point.prototype.update = function(timeElapsed)
{
    if(this.dueTime > 10000)
    {
        var min_negative_x = this.x * (-1);
        var max_positive_x = canvasWidth - this.x;

        var min_negative_y = this.y * (-1);
        var max_positive_y = canvasHeight - this.y;

        var angle = getRandom(0, 2);
        this.vectorPath.angle = Math.PI * angle;

        var vect_x = Math.sin(this.vectorPath.angle) * this.vectorPath.length;
        var vect_y = Math.cos(this.vectorPath.angle) * this.vectorPath.length;

        if(vect_x <= 0)
        {
            this.x += Math.max(min_negative_x,vect_x);    
        } else {
            this.x += Math.min(vect_x,max_positive_x);    
        }
        
        if(vect_y <= 0)
        {
            this.y += Math.max(min_negative_y,vect_y);    
        } else {
            this.y += Math.min(vect_y,max_positive_y);    
        }

        this.dueTime = 0;
    }
    else
    {
        this.dueTime += timeElapsed;
    }
    

};

Point.prototype.render = function()
{
    ctx.beginPath();
    ctx.arc(this.x, this.y, 6, 0, 2 * Math.PI, true);
    ctx.fill();
};

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}


// GAME DATA END

GameBox.prototype.register = function(aGameObject) {
    this.gameObjects.push(aGameObject);
};

GameBox.prototype.update = function(timeElapsed)
{
    this.gameObjects.forEach( function (value,index,array) {
            value.update(timeElapsed);
        });
}

GameBox.prototype.render= function()
{
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    this.gameObjects.forEach( function (value,index,array) {
        value.render();
    });

    ctx.resetTransform();
}

function Init(){
    var canvas = document.getElementById('canvas')
    ctx = canvas.getContext("2d");
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    var game = new GameBox();

    var point = new Point(250,250);

    game.register(point);

    game.gameLoop();
}