
var game = new Phaser.Game(148*4, 91*4, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render  }, false, false);

function preload() {

	game.load.spritesheet('diver', 'diver_05.png', 128, 128);
	game.load.spritesheet('tiles', 'tile.png', 9,9,9);
	game.load.spritesheet('tiles_90x90', 'tile_90x90.png', 90,90,90);
	game.load.spritesheet('bubble', 'bubble.png', 8, 8);
	game.load.spritesheet('cloud', 'clouds.png', 124, 37);
	game.load.spritesheet('splash', 'splash.png', 37, 20);
	game.load.spritesheet('bubbleFont', 'font.png', 16,16);
}

//-----------------------------
var DEBUG_MODE = true;
//-----------------------------

var score = 0;

var animSeq;
var divingPlatform;
var poolSide;
var diver;
var waterLevel;
var poolBottom;
var GRAVITY=980;
var LEVEL_SWITCHING_REGULARITY = 4;
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
var multipliers;
var timeUnderwater;
var CustomSpr;
var canMoveToNextAnimation;
var bubbleText;
var levelText;
var level;
var levelTextBubbleLetters;
var scoreTextBubbleLetters;
var otherTextBubbleLetters;
var bubbleDict = { 	"A":33,"B":34,"C":35,"D":36,"E":37,"F":38, 
					"G":39,"H":40,"I":41,"J":42,"K":43,"L":44,
					"M":45,"N":46,"O":47,"P":48,"Q":49,"R":50, 
					"S":51,"T":52,"U":53,"V":54,"W":55,"X":56,
					"Y":57,"Z":58,
					"0":16,"1":17,"2":18,"3":19,"4":20,"5":21, 
					"6":22,"7":23,"8":24,"9":25,
				};

function create() {

	//uncomment to restart
	//localStorage.removeItem('level');
	//localStorage.removeItem('score');
	
	game.stage.backgroundColor = '#0073ef';

	if (level>4)
	{
		diveHeight = 1035 + (Math.random() * level * 550); 
		poolWidth = 2700 + (Math.random() * level * 550);
		poolDepth = 900 + (Math.random() * level * 550);

		q = level % LEVEL_SWITCHING_REGULARITY;
		if (q==0)
		{
			game.stage.backgroundColor = '#697d93';
		}
		else if (q==1)
		{
			game.stage.backgroundColor = '#f29867';
		}
		else if (q==2)
		{
			game.stage.backgroundColor = '#f2e767';
		}
			
	}

	console.log("POOL CREATION STATS " + diveHeight + " " + poolWidth + " " + poolDepth)

	level = localStorage.getItem('level');

	if (level==null)
	{
		level=1;
		localStorage.setItem('level', level);
	}

	score = localStorage.getItem('score');
	console.log('saved score is: ' + score)

	if (score==null)
	{
		score=0;
		localStorage.setItem('score', score);
	}

	//console.log('level: '+level)
	
	//--TWEET--------------------------------------------------------------------------------------
	tweet = document.getElementById('tweet');
	//alert(tweet.href);
	tweet.href = TWEET_PREAMBLE + score + TWEET_PROLOGUE;

	//this.tweetElement.href = this.TWEET_PREAMBLE + this.score + this.TWEET_PROLOGUE;
	//----------------------------------------------------------------------------------------

	jumpPoint = poolSideWidth + poolWidth;

	for (i = 0; i < 7; i++) { 
	    cloud = game.add.sprite(jumpPoint + (Math.random() * (divingPlatformWidth)), Math.random() * 125, 'cloud');
		game.physics.enable(cloud, Phaser.Physics.ARCADE);
		cloud.body.velocity.x = Math.random() * 15;
		cloud.animations.frame = Math.floor(Math.random() * 10);
		
	}

	for (i = 0; i < 45; i++) { 
	    cloud = game.add.sprite((Math.random() * (jumpPoint)), Math.random() * (diveHeight - cloud.height), 'cloud');
		game.physics.enable(cloud, Phaser.Physics.ARCADE);
		cloud.body.velocity.x = Math.random() * 15;
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

	//score = 0;

	//add pointer for mobile touching.
	game.input.addPointer();

	divingPlatform = game.add.tileSprite(jumpPoint, skyGap, divingPlatformWidth, 1800, 'tiles');
	game.physics.enable(divingPlatform, Phaser.Physics.ARCADE);
	divingPlatform.body.immovable = true;


	diver = game.add.sprite(0, 0, 'diver');
	game.physics.enable(diver, Phaser.Physics.ARCADE);
	diver.body.setSize(48, 48, 40, 48);
	
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

	multipliers = game.add.emitter(0, 0, 100);
    multipliers.makeParticles('bubbleFont', [17,18,19,20,21]);
    multipliers.gravity = -20;
	multipliers.width=1;
	multipliers.height=1;
	multipliers.minRotation = 0;
    multipliers.maxRotation = 0;
	multipliers.setXSpeed(-20, 20);
    multipliers.setYSpeed(-105, 5);    

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

	var textStringForLevelStart = [44, 37, 54, 37, 44];

	var n = level.toString();
	var res = n.split("");
	//console.log(res);
	
	levelTextBubbleLetters = game.add.group();
	scoreTextBubbleLetters = game.add.group();
	otherTextBubbleLetters = game.add.group();

	for (var i = 0; i < 8; i++)
    {
        //  Note: alphaIncSpeed is a new property we're adding to Phaser.Sprite, not a pre-existing one
        levelText = levelTextBubbleLetters.create(150 + (i*16), 150, 'bubbleFont');
        levelText.fixedToCamera = true;
        game.physics.enable(levelText, Phaser.Physics.ARCADE);
        levelText.body.acceleration.y=(50 + (i * 30)) * -1;
        //levelText.scale = 2;

        levelText.frame = textStringForLevelStart[i];
        if (i>5)
        {
        	var j = parseInt(n[i-6]);
        	//console.log(j);
        	levelText.frame = 16+j;
        }
    }

    makeWord(10,10, 'SCORE 000000000');

	var words = "POOL HEIGHT " + diveHeight + "\nPOOL WIDTH " + poolWidth + "\nPOOL DEPTH " + poolDepth;
	
	makeOtherWord(150, 170, "POOL HEIGHT " + parseInt(diveHeight.toString()));
	makeOtherWord(150, 190, "POOL WIDTH " + parseInt(poolWidth.toString()));
	makeOtherWord(150, 210, "POOL DEPTH " + parseInt(poolDepth.toString()));

}

function makeWord(x,y,textString)
{
	var res = textString.split("");

	for (var i = 0; i < res.length; i++)
    {
        levelText = scoreTextBubbleLetters.create(x + (i*16), y, 'bubbleFont');
        levelText.fixedToCamera = true;
        game.physics.enable(levelText, Phaser.Physics.ARCADE);
        levelText.frame = bubbleDict[res[i]]
    }
}

function makeOtherWord(x,y,textString)
{
	var res = textString.split("");

	for (var i = 0; i < res.length; i++)
    {
        levelText = otherTextBubbleLetters.create(x + (i*16), y, 'bubbleFont');
        levelText.fixedToCamera = true;
        game.physics.enable(levelText, Phaser.Physics.ARCADE);
        levelText.frame = bubbleDict[res[i]];
        
        levelText.body.acceleration.x=((10 + y) + (i * 30)) * -1;

    }
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

	//game.debug.text(" Score: " + score + " Level:" + level, 15, 55, '#ffffff');


	if (DEBUG_MODE==true)
	{
		game.debug.body(diver);
		game.debug.spriteInfo(diver, 0, 100);
		game.debug.spriteBounds(diver);
		
		game.debug.text(diver.animations.currentAnim.name + " vel.x:" + Math.floor(diver.body.velocity.x) + 
			" vel.y:" + Math.floor(diver.body.velocity.y) + " acc.x:" + Math.floor(diver.body.acceleration.x) + 
			" acc.y:" + Math.floor(diver.body.acceleration.y) + " drag.x:" + Math.floor(diver.body.drag.x) + 
			" drag.y:" + Math.floor(diver.body.drag.y), 10, 10, '#ff0000');

		game.debug.text(Math.floor(diver.x) + " " + Math.floor(diver.y) + " " + diver.body.touching.down + " Score: " + score, 10, 50, '#ff0000');
		game.debug.text(Math.floor(diver.x) + " " + Math.floor(diver.y) + " " + diver.body.touching.down + " Score: " + score, 10, 50, '#ff0000');
		
	}
}

function calculateScore() {
	if (diver.animations.currentAnim.name=='swan')
	{
		score++;
	}
	tweet = document.getElementById('tweet');
	tweet.href = TWEET_PREAMBLE + score + TWEET_PROLOGUE;

	var n = score.toString();
	var res = n.split("");

	if (score!=0)
	{
		for (var i = 0; i < 9; i++)
		{
			scoreTextBubbleLetters.getChildAt(i+6).frame = 0;
		}
	}

	for (var i = 0; i < res.length; i++)
	{
		scoreTextBubbleLetters.getChildAt(i+6).frame = bubbleDict[res[i]];
	}

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

	multipliers.x = diver.body.x + diver.body.width/2;
	multipliers.y = diver.body.y ;

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
	else if (diver.animations.currentAnim.name=='swan')
	{
		if (diver.body.acceleration.x < -20) 
		{
			diver.body.acceleration.x += 3;	
		}		
		//diver.body.velocity.x += 1;
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

	if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) && DEBUG_MODE==true)
    {
        level = localStorage.getItem('level');
		level++;
		localStorage.setItem('level', level);
		localStorage.setItem('score', score);

		console.log("Debug - next level");

		game.state.restart();

    }

	if (game.input.keyboard.isDown(Phaser.Keyboard.UP) && DEBUG_MODE==true)
    {
		localStorage.removeItem('level');
		localStorage.removeItem('score');

		console.log("Debug - reset to level 1");


    }



	//if (game.input.mousePointer.isDown || game.input.touch.isDown || game.input.isDown || game.input.pointer1.isDown)
	if (game.input.mousePointer.justPressed())
	{
		var i = animSeq.indexOf(diver.animations.currentAnim.name);
		
		if (i<animSeq.length-2) {
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
			levelTextBubbleLetters.forEach(function(item) {
				item.fixedToCamera = false;
		        item.alpha = 0.5;
		        
		    });

			otherTextBubbleLetters.forEach(function(item) {
				item.fixedToCamera = false;
		        item.alpha = 0.5;
		        
		    });

			// start to run
			diver.body.acceleration.x += -120;
		}
		else if (diver.animations.currentAnim.name=='swan' && diver.body.touching.down )
		{
			//jump
			console.log("jump!");
			//diver.body.acceleration.x = 0;			

			//diver.body.velocity.x = 0;

			diver.body.velocity.y = -300;


			diver.body.drag.x = 50000;
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
			bubbles.start(true, 4000, null, 12);

			diver.body.drag.setTo(2350, 3500);
			diver.body.acceleration.setTo(0, 0);
		}
		else if (diver.animations.currentAnim.name=='swim' || diver.animations.currentAnim.name=='glide')
		{
			bubbles.start(true, 4000, null, 1);

			diver.body.velocity.y = 0;
			diver.body.drag.setTo(0, 0);
			diver.body.acceleration.setTo(0, -100);
		}

		else if (diver.animations.currentAnim.name=='breathe')
		{
			level = localStorage.getItem('level');
			level++;
			localStorage.setItem('level', level);
			localStorage.setItem('score', score);

			console.log("restarting from breathe");

			game.state.restart();
		}

		else if (diver.animations.currentAnim.name=='hitFloor')
		{
			console.log("restarting from hit Floor");
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