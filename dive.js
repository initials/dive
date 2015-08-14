
var game = new Phaser.Game(148*4, 91*4, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render  }, false, false);

function preload() {

	game.load.spritesheet('diver', 'diver_05.png', 128, 128);
	game.load.spritesheet('tiles', 'tile.png', 9,9,9);
	game.load.spritesheet('tiles_90x90', 'tile_90x90.png', 90,90,90);
	
	game.load.spritesheet('bubble', 'bubble.png', 8, 8);
	game.load.spritesheet('cloud', 'clouds.png', 124, 37);
	game.load.spritesheet('splash', 'splash.png', 37, 20);
	game.load.image('bubbleFont', 'font.png');

	
	
}

var score = 0;

var animSeq;
var divingPlatform;
var poolSide;
var diver;
var waterLevel;
var poolBottom;
var GRAVITY=980;
var splashSprite;


var tweet;
var TWEET_PREAMBLE = 'https://twitter.com/intent/tweet?text=Summer time, lets dive ';
var TWEET_PROLOGUE = ' http://www.initialsgames.com/dive/ &hashtags=8bitsummer ';

// ---------- Set these to build level -------------
var diveHeight = 1035; 
var poolWidth = 2700;
var poolDepth = 900;

var divingPlatformWidth = 900;
var poolSideWidth = 900;
var skyGap = 270;

// ----------- calculate based on level

var jumpPoint;

var bubbles;

var timeUnderwater;

var CustomSpr;

var canMoveToNextAnimation;

var bubbleText;

var level;

function create() {

	level = localStorage.getItem('level');
	
	//--TWEET--------------------------------------------------------------------------------------
	tweet = document.getElementById('tweet');
	//alert(tweet.href);
	tweet.href = TWEET_PREAMBLE + score + TWEET_PROLOGUE;

	//this.tweetElement.href = this.TWEET_PREAMBLE + this.score + this.TWEET_PROLOGUE;
	//----------------------------------------------------------------------------------------

	game.stage.backgroundColor = '#0073ef';

	jumpPoint = poolSideWidth + poolWidth;

	for (i = 0; i < 7; i++) { 
	    cloud = game.add.sprite(jumpPoint + (Math.random() * (divingPlatformWidth)), Math.random() * 125, 'cloud');
		game.physics.enable(cloud, Phaser.Physics.ARCADE);
		cloud.body.velocity.x = Math.random() * 15;
		//cloud.fixedToCamera = true;

		//cloud.scrollFactorX = 0.1;
		//cloud.scrollFactorY = 0.1;

		cloud.animations.frame = Math.floor(Math.random() * 10);
		
	}

	for (i = 0; i < 45; i++) { 
	    cloud = game.add.sprite((Math.random() * (jumpPoint)), Math.random() * (diveHeight - cloud.height), 'cloud');
		game.physics.enable(cloud, Phaser.Physics.ARCADE);
		cloud.body.velocity.x = Math.random() * 15;
		//cloud.fixedToCamera = true;
		
		//cloud.scrollFactorX = 0.1;
		//cloud.scrollFactorY = 0.1;

		cloud.animations.frame = Math.floor(Math.random() * 10);

	}


	poolTile = game.add.tileSprite(0, diveHeight, poolSideWidth + poolWidth + 900, poolDepth + 9, 'tiles_90x90');
	poolTile.alpha = 0.3225;

	poolSide = game.add.tileSprite(0, diveHeight, poolSideWidth, 1800, 'tiles');
	game.physics.enable(poolSide, Phaser.Physics.ARCADE);
	poolSide.body.immovable = true;

	poolBottom = game.add.tileSprite(0, diveHeight + poolDepth, poolSide.width + poolWidth + 900, 180, 'tiles');
	game.physics.enable(poolBottom, Phaser.Physics.ARCADE);
	poolBottom.body.immovable = true;

	score = 0;

	//add pointer for mobile touching.
	game.input.addPointer();

	divingPlatform = game.add.tileSprite(jumpPoint, skyGap, divingPlatformWidth, 1800, 'tiles');
	game.physics.enable(divingPlatform, Phaser.Physics.ARCADE);
	divingPlatform.body.immovable = true;


	diver = game.add.sprite(0, 0, 'diver');
	game.physics.enable(diver, Phaser.Physics.ARCADE);
	diver.body.setSize(48, 48, 40, 50);
	
	animSeq = ['idle', 
	'run', 
	'swan', 
	'dive', 
	'enterWater',
	'glide',
	'swim',
	'exitWater',
	'breathe', 'hitFloor']


	diver.animations.add(animSeq[0], [81,82], 4, true);
	runAnim = diver.animations.add(animSeq[1], [0,1,2,3,4,5], 8, true);
	runAnim.onComplete.add(runFaster, this);

	diver.animations.add(animSeq[1] + "Faster", [0,1,2,3,4,5], 16, true);


	swanAnim = diver.animations.add(animSeq[2], [7,8,9,10,11,12,13,14,15,16,17,18], 16, false);
	swanAnim.onComplete.add(enableNextAnimation, this);

	diver.animations.add(animSeq[3], [18,19,20,21,22,23,24,25,26,27], 16, false);
	enterWaterAnim = diver.animations.add(animSeq[4], [28,29,30,31], 16, false);

	enterWaterAnim.onComplete.add(moveToNextAnimation, this);


	diver.animations.add(animSeq[5], [31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51], 16, true);
	diver.animations.add(animSeq[6], [44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64], 16, true);

	exitWaterAnim = diver.animations.add(animSeq[7], [65,66,67,68,69,70,71,72], 16, false);
	exitWaterAnim.onComplete.add(moveToNextAnimation, this);

	diver.animations.add('fall', [7,26], 16, false);
	diver.animations.add(animSeq[8], [83,84], 2, true);
	diver.animations.add(animSeq[9], [85,86,86,86,87], 16, false);
	
	diver.play('idle')
	diver.x = divingPlatform.x + divingPlatform.width - 90;
	diver.y = skyGap - 96;
	
	diver.body.acceleration.y = GRAVITY;
	diver.body.maxVelocity.x = 900;
	diver.body.maxVelocity.y = 900;

    waterLevel = new Phaser.Line(0, diveHeight, 9000, diveHeight);


	bubbles = game.add.emitter(0, 0, 100);

    bubbles.makeParticles('bubble', [0, 1, 2, 3, 4, 5]);
    bubbles.gravity = -20;
	bubbles.width=40;
	bubbles.height=40;
	bubbles.minRotation = 0;
    bubbles.maxRotation = 0;
	bubbles.setXSpeed(-20, 20);
    bubbles.setYSpeed(-15, -55);


    game.input.justPressedRate = 25;
	
	game.world.setBounds(0, 0, poolSide.width + poolWidth + divingPlatform.width, 9000);
    game.camera.follow(diver);

    timeUnderwater=0;

    canMoveToNextAnimation=true;


	splashSprite = game.add.sprite(-100, -100, 'splash');

/*
	bubbleText = game.add.retroFont('bubbleFont', 16, 16, Phaser.RetroFont.TEXT_SET1);
	bubbleText.text = "Perfect Entry!";
    bubbleText.align = Phaser.RetroFont.ALIGN_CENTER;
    bubbleText.multiLine = true;
    bubbleText.autoUpperCase = false;
*/
}

function moveToNextAnimation(sprite, animation) 
{
	var i = animSeq.indexOf(diver.animations.currentAnim.name);
	if (i<animSeq.length-1) {
		diver.play(animSeq[i+1]);
	}
	if (diver.animations.currentAnim.name=='glide')
	{
		diver.body.drag.setTo(0, 0);
	}
	else if (diver.animations.currentAnim.name=='breathe')
	{
		diver.y = diveHeight-72 ;

	}

}

function enableNextAnimation(sprite, animation) 
{
	canMoveToNextAnimation=true;
}

function runFaster(sprite, animation) 
{
	diver.animations.currentAnim.speed=16;
}

function render() {
	game.debug.geom(waterLevel, '#ffffff');

	/*
	game.debug.body(diver);
	game.debug.spriteInfo(diver, 0, 100);
	game.debug.spriteBounds(diver);
	
	game.debug.text(diver.animations.currentAnim.name + " v.x:" + Math.floor(diver.body.velocity.x) + 
		" v.y:" + Math.floor(diver.body.velocity.y) + " a.x:" + Math.floor(diver.body.acceleration.x) + 
		" a.y:" + Math.floor(diver.body.acceleration.y) + " d.x:" + Math.floor(diver.body.drag.x) + 
		" d.y:" + Math.floor(diver.body.drag.y), 10, 10, '#ff0000');

	game.debug.text(Math.floor(diver.x) + " " + Math.floor(diver.y) + " " + diver.body.touching.down + " Score: " + score, 10, 50, '#ff0000');
	
	game.debug.text(" Score: " + score + " Level:" + level, 15, 15, '#ffffff');

	game.debug.text(Math.floor(diver.x) + " " + Math.floor(diver.y) + " " + diver.body.touching.down + " Score: " + score, 10, 50, '#ff0000');
	*/
}

function calculateScore() {
	if (diver.animations.currentAnim.name=='swan')
	{
		score++;
	}
	tweet = document.getElementById('tweet');
	tweet.href = TWEET_PREAMBLE + score + TWEET_PROLOGUE;

}

function update() 
{

	calculateScore();


	if (timeUnderwater>1 && timeUnderwater<40)
	{
		bubbles.start(true, 2000, null, 2);
	}

	bubbles.x = diver.body.x + diver.body.width/2;
	bubbles.y = diver.body.y + diver.body.height/2;

	game.physics.arcade.collide(diver, divingPlatform, hitPlatform, null, this);
	game.physics.arcade.collide(diver, poolSide, hitSide, null, this);
	game.physics.arcade.collide(diver, poolBottom, hitBottomOfPool, null, this);

	game.physics.arcade.collide(bubbles, poolSide, killParticle, null, this);

	//bubbles.forEachAlive(checkCollision, this);

	//find out if diver is underwater

	if (diver.body.y > diveHeight - diver.body.height/2)
	{
		timeUnderwater++;
		//diver.body.velocity.setTo(0, 0);
	}
	else if (diver.animations.currentAnim.name=='swim' || diver.animations.currentAnim.name=='glide')
	{
		diver.body.velocity.y = 0;
		diver.body.acceleration.setTo(0, 0);

		if (game.input.mousePointer.justPressed())
		{
			console.log('swimswim')
			diver.body.acceleration.setTo(-1140, 0);
			diver.body.drag.setTo(125, 125);
		}

	}
	if (splashSprite.alpha>0.09)
		splashSprite.alpha -= 0.0251;

	if (timeUnderwater==1)
	{
		//game.time.advancedTiming = true;
    	//game.time.desiredFps = 20;
    	//game.time.slowMotion = 3.0;

		splashSprite.x = diver.body.x;
		splashSprite.y = waterLevel.y - splashSprite.height;
		splashSprite.alpha = 1.0;

		console.log('!-- Has entered Water --!\nCurrent Anim: ' + diver.animations.currentAnim.name + ' Frame: ' + diver.animations.currentAnim.frame );

		if (diver.animations.currentAnim.name=='dive' && diver.animations.currentAnim.frame == 27)
		{
			score+=100;
			console.log('Perfect Entry');
		}

		var i = animSeq.indexOf(diver.animations.currentAnim.name);
		if (i<3)
		{
			diver.play(animSeq[4]);
		}
	}

	//if (game.input.mousePointer.isDown || game.input.touch.isDown || game.input.isDown || game.input.pointer1.isDown)
	if (game.input.mousePointer.justPressed())
	{
		var i = animSeq.indexOf(diver.animations.currentAnim.name);
		
		if (i<animSeq.length-1) {
			if (diver.animations.currentAnim.name=='swim') 
			{
				if (diver.body.x < 901) {
					console.log('swim ++')
					diver.play(animSeq[i+1]);
				}
			}
			else if (diver.animations.currentAnim.name=='dive')
			{
				if (timeUnderwater>1)
				{
					console.log('dive ++')
					diver.play(animSeq[i+1]);
				}
			} 
			else
			{
				console.log('everything else ++' + i)
				if (canMoveToNextAnimation==true)
					diver.play(animSeq[i+1]);
			}
		}

		if (diver.animations.currentAnim.name=='run')
		{
			// start to run
			diver.body.acceleration.x += -120;
		}
		else if (diver.animations.currentAnim.name=='swan' && diver.body.touching.down )
		{
			//jump
			console.log("jump!");
			diver.body.velocity.y = -300;
			diver.body.drag.y = 100;

			diver.body.setSize(48, 30, 40, 50);

			canMoveToNextAnimation=false;
		}
		else if (diver.animations.currentAnim.name=='dive')
		{
			diver.body.setSize(48, 48, 40, 50);
		}
		else if (diver.animations.currentAnim.name=='enterWater')
		{
			diver.body.drag.setTo(2350, 3500);
			diver.body.acceleration.setTo(0, 0);
		}
		else if (diver.animations.currentAnim.name=='swim' || diver.animations.currentAnim.name=='glide')
		{
			diver.body.velocity.y = 0;
			diver.body.drag.setTo(0, 0);
			diver.body.acceleration.setTo(0, -100);
		}
		else if (diver.animations.currentAnim.name=='hitFloor' || diver.animations.currentAnim.name=='breathe')
		{
			level = localStorage.getItem('level');
			level++;
			localStorage.setItem('level', level);

			game.state.restart();
		}
		

	}
}

function hitSide (obj1, obj2) {

	// first check to see if diver can climb out of water.
	console.log('hit side diver.x:' + diver.x + ' diver.y:'+diver.y);
	if (diver.body.y < diveHeight - diver.body.height/2) {
		diver.play('exitWater');
		diver.y = diveHeight-72 ;
	}
	else
	{
		if (diver.animations.currentAnim.name!='hitFloor' )
		{
			diver.body.setSize(48, 48, 40, 50);

			diver.body.acceleration.x=0;
			diver.body.acceleration.y=GRAVITY;
			
			diver.body.velocity.setTo(2,0);
			
			diver.play("hitFloor");
			diver.body.drag.setTo(1, 0);
			
			bubbles.start(true, 2000, null, 30);

			diver.x += 3;
		}
	}
}

function hitPlatform (obj1, obj2) {
	
	//console.log('hit platform');

	if (animSeq.indexOf(diver.animations.currentAnim.name) > 1)
	{
		diver.body.setSize(48, 48, 40, 50);
		diver.y -= 18;
		diver.play("hitFloor");
		diver.body.velocity.x=0;
		diver.body.velocity.y=0;
		diver.body.acceleration.x=0;
		diver.body.acceleration.y=0;
			
	}

}

function hitBottomOfPool (obj1, obj2) {

	if (diver.animations.currentAnim.name!='hitFloor' )
	{
		diver.play("hitFloor");
		
		diver.body.setSize(48, 48, 40, 50);

		diver.body.acceleration.x=0;
		diver.body.acceleration.y=GRAVITY;
		diver.body.velocity.x=0;
		diver.body.velocity.y=0;
		
		bubbles.start(true, -1, null, 30);
	}
	
	
}

function killParticle (obj1, obj2) {
	//console.log("kill particle");
	//obj2.kill();
	//obj2.scale = 5;
	//obj2.tint = Math.random() * 0xffffff;
	//obj1.tint = Math.random() * 0xffffff;
}



function submitHighScore () {


}

function listener () {
}

	
function httpGet(theUrl)
{
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}