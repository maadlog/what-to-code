GameBox = function()
    {
        this.lastFrameTime = Date.now();
        this.currentFrameTime = Date.now();
        this.timeElapsed = 0;
    }

Vector = function(_x,_y)
{
    this.x = _x;
    this.y = _y;
}

Vector.prototype.add = function(aVector)
{
    this.x += aVector.x;
    this.y += aVector.y;
}

Vector.prototype.mul = function(aScalar)
{
    return new Vector( this.x  * aScalar ,this.y * aScalar );
}

Vector.prototype.dot = function(aVector)
{
    return ( this.x  * aVector.x + this.y * aVector.y );
}

GameObject = function( position ,spritePath, frameWidth, frameHeight)
{
    this.sheet = new SpriteSheet(spritePath,frameWidth,frameHeight);
    this.sprite = new AnimatedSprite(this.sheet, Math.floor( 8 /*this.sheet.framesPerRow*/ / 2),0, 7 /*this.sheet.framesPerRow - 1*/);

    this.body = new Body(position, new Vector(20,0), this);

    this.GoingRight = true;

    this.SignalTurning = function()
    {
        this.GoingRight = !this.GoingRight;
        if ( this.GoingRight )
        {
            this.sprite = new AnimatedSprite(this.sheet, Math.floor( 8 /*this.sheet.framesPerRow*/ / 2),0, 7 /*this.sheet.framesPerRow - 1*/);
        }
        else
        {
            this.sprite = new AnimatedSprite(this.sheet, Math.floor( 8 /*this.sheet.framesPerRow*/ / 2),8, 15 /*this.sheet.framesPerRow - 1*/);
        }
    }

    this.update = function(timeElapsed)
    {
        this.sprite.update();
        this.body.update(timeElapsed);
    }

    this.draw = function()
    {
        this.sprite.draw(this.body.position);
    }
}

Body = function(_position, _speed, _gameObj)
{
    this.position = _position;
    this.speed = _speed;
    this.turning = false;
    this.gameObj = _gameObj;

    this.update = function(timeElapsed)
    {
        if ((this.position.x >= 400 || this.position.x <= 50) && !this.turning)
        {
            this.speed.x = -this.speed.x;
            this.turning = true;
            this.gameObj.SignalTurning();
        } else 
        {
            this.turning = false;
        }

        this.position.add( this.speed.mul( timeElapsed ) ) 
    }

}

SpriteSheet = function(path, frameWidth, frameHeight) {
  this.image = new Image();
  this.frameWidth = frameWidth;
  this.frameHeight = frameHeight;

  // calculate the number of frames in a row after the image loads
  var self = this;
  this.image.onload = function() {
    self.framesPerRow = Math.floor(self.image.width / self.frameWidth);
  };

  this.image.src = path;
}

AnimatedSprite = function (spritesheet, frameSpeed, startFrame, endFrame) {

  var animationSequence = [];  // array holding the order of the animation
  var currentFrame = 0;        // the current frame to draw
  var counter = 0;             // keep track of frame rate

  // start and end range for frames
  for (var frameNumber = startFrame; frameNumber <= endFrame; frameNumber++)
    animationSequence.push(frameNumber);

  /**
   * Update the animation
   */
   this.update = function() {

    // update to the next frame if it is time
    if (counter == (frameSpeed - 1))
      currentFrame = (currentFrame + 1) % animationSequence.length;

    // update the counter
    counter = (counter + 1) % frameSpeed;
  };

  /**
   * Draw the current frame
   * @param {vector2} x , y - X position to draw, Y position to draw
   */
  this.draw = function(position) {
    // get the row and col of the frame
    var row = Math.floor(animationSequence[currentFrame] / spritesheet.framesPerRow);
    var col = Math.floor(animationSequence[currentFrame] % spritesheet.framesPerRow);

    ctx.drawImage(
      spritesheet.image,
      col * spritesheet.frameWidth, row * spritesheet.frameHeight,
      spritesheet.frameWidth, spritesheet.frameHeight,
      position.x, position.y,
      spritesheet.frameWidth, spritesheet.frameHeight);
  };
}


GameBox.prototype.gameLoop = function()
{
    window.requestAnimationFrame(this.gameLoop.bind(this));
    this.lastFrameTime = this.currentFrameTime;
    this.currentFrameTime = Date.now();
    this.timeElapsed +=  this.currentFrameTime - this.lastFrameTime ;

    this.update(this.timeElapsed / 100); 
    this.render(this.timeElapsed / 100);
    this.timeElapsed = 0;
}
let canvasWidth = 600;
let canvasHeight = 600;
let canvasCenter = { x: canvasWidth / 2 ,y: canvasHeight / 2}

var ctx = {};
var pause = false;
var gameObj = {};

GameBox.prototype.update = function(timeElapsed)
{
    if (!pause)
    {
        gameObj.update(timeElapsed);
    }
}

GameBox.prototype.render= function(timeElapsed)
{

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    gameObj.draw();

    if(pause)
    {
        //pause screen
        ctx.globalAlpha = 0.2;
        ctx.fillRect(0,0,canvasWidth,canvasHeight);
        ctx.globalAlpha = 1.0;

        ctx.font = "30px Verdana";
        ctx.fillText("Pause",canvasCenter.x - 45,canvasCenter.y);
    }

    //Borders
    ctx.strokeStyle = '#000000';
    ctx.rect(0,0,600,600);
    ctx.stroke();
}

function Init(){
    var canvas = document.getElementById('canvas');
    ctx = canvas.getContext("2d");

    gameObj = new GameObject(
        new Vector(100,100),
        "./scott.png",
        108,
        140);

    var game = new GameBox();
    game.gameLoop();

}

document.addEventListener("visibilitychange", function(ev)
{
    pause = true;
});

document.addEventListener("click", function(ev)
{
    if (pause) { 
        pause = false ;
    }
});
