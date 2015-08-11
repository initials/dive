
var game = new Phaser.Game(148*4, 91*4, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render  }, false, false);

function preload() {

	game.load.spritesheet('diver', 'diver_05.png', 128, 128);
	game.load.spritesheet('tiles', 'tile.png', 9,9,9);
	game.load.spritesheet('bubble', 'bubble.png', 8, 8);

	
}

var score = 0;

var animSeq;
var divingPlatform;
var poolSide;
var diver;
var waterLevel;
var poolBottom;


var tweet;
var TWEET_PREAMBLE = 'https://twitter.com/intent/tweet?text=Summer time, lets dive ';
var TWEET_PROLOGUE = ' http://www.initialsgames.com/dive/ &hashtags=8bitsummer ';

// ---------- Set these to build level -------------
var diveHeight = 1035; 
var poolWidth = 2700;
var poolDepth = 900;

// ----------- calculate based on level

var jumpPoint;

var bubbles;

var timeUnderwater;

        

function create() {
	//--TWEET--------------------------------------------------------------------------------------
	tweet = document.getElementById('tweet');
	//alert(tweet.href);
	tweet.href = TWEET_PREAMBLE + score + TWEET_PROLOGUE;

	//this.tweetElement.href = this.TWEET_PREAMBLE + this.score + this.TWEET_PROLOGUE;
	//----------------------------------------------------------------------------------------

	poolSide = game.add.tileSprite(0, diveHeight, 900, 1800, 'tiles');
	game.physics.enable(poolSide, Phaser.Physics.ARCADE);
	poolSide.body.immovable = true;

	jumpPoint = poolSide.width + poolWidth;


	poolBottom = game.add.tileSprite(0, diveHeight + poolDepth, poolSide.width + poolWidth + 900, 180, 'tiles');
	game.physics.enable(poolBottom, Phaser.Physics.ARCADE);
	poolBottom.body.immovable = true;

	game.stage.backgroundColor = '#0073ef';

	score = 0;

	//add pointer for mobile touching.
	game.input.addPointer();

	divingPlatform = game.add.tileSprite(jumpPoint, 90, 900, 1800, 'tiles');
	game.physics.enable(divingPlatform, Phaser.Physics.ARCADE);
	divingPlatform.body.immovable = true;

	diver = game.add.sprite(0, 0, 'diver');
	game.physics.enable(diver, Phaser.Physics.ARCADE);

	animSeq = ['idle', 
	'run', 
	'swan', 
	'dive', 
	'enterWater',
	'glide',
	'swim',
	'exitWater',
	'breathe']


	diver.animations.add(animSeq[0], [81,82], 4, true);
	diver.animations.add(animSeq[1], [0,1,2,3,4,5], 16, true);
	diver.animations.add(animSeq[2], [7,8,9,10,11,12,13,14,15,16,17,18], 16, false);
	diver.animations.add(animSeq[3], [18,19,20,21,22,23,24,25,26,27], 16, false);
	diver.animations.add(animSeq[4], [28,29,30,31], 16, false);
	diver.animations.add(animSeq[5], [31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51], 16, true);
	diver.animations.add(animSeq[6], [44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64], 16, true);
	diver.animations.add(animSeq[7], [65,66,67,68,69,70,71,72], 16, false);
	diver.animations.add('fall', [7,26], 16, false);
	diver.animations.add(animSeq[8], [83,84], 2, true);
	diver.animations.add('hitFloor', [85,86,86,86,87], 16, false);
	
	diver.play('idle')
	diver.x = divingPlatform.x + divingPlatform.width - 90;
	diver.y = -30;
	diver.body.setSize(48, 48, 40, 50);
	diver.body.acceleration.y = 980;
	diver.body.maxVelocity.x = 1500;
	diver.body.maxVelocity.y = 1500;


    //diver.width = 48;
    //diver.height = 48;
    //diver.offsetX = 40;
    //diver.offsetY = 50;

    //new FlxLine(0, 0, new Vector2(0, Globals.diveHeight + Globals.poolDepth),
    //            new Vector2(9000, Globals.diveHeight + Globals.poolDepth),
    //            Color.White, 2);


    waterLevel = new Phaser.Line(0, diveHeight, 9000, diveHeight);

	bubbles = game.add.emitter(0, 0, 100);

    bubbles.makeParticles('bubble', [0, 1, 2, 3, 4, 5]);
    bubbles.gravity = -20;
	bubbles.width=20;
	bubbles.height=20;
	bubbles.minRotation = 0;
    bubbles.maxRotation = 0;

    game.input.justPressedRate = 25;
	
	game.world.setBounds(0, 0, poolSide.width + poolWidth + divingPlatform.width, 9000);
    game.camera.follow(diver);

    timeUnderwater=0;


}

// render used for debug only.
function render() {

	//game.debug.body(diver);
	game.debug.text(diver.animations.currentAnim.name + " " + diver.body.velocity.x + " " + diver.body.velocity.y, 10, 10)
	game.debug.text(diver.x + " " + diver.y, 10, 50)
	
	game.debug.geom(waterLevel);
    //game.debug.lineInfo(waterLevel, 32, 32);



}


function update() 
{
	if (timeUnderwater>1 && timeUnderwater<120)
	{
		bubbles.start(true, 2000, null, 2);
	}

	bubbles.x = diver.body.x + diver.body.width/2;
	bubbles.y = diver.body.y + diver.body.height/2;

	game.physics.arcade.collide(diver, divingPlatform, collisionHandler, null, this);
	game.physics.arcade.collide(diver, poolSide, collisionHandler, null, this);
	game.physics.arcade.collide(diver, poolBottom, collisionHandler, null, this);

	//find out if diver is underwater

	if (diver.body.y > diveHeight)
	{
		timeUnderwater++;
		
		//diver.body.velocity.setTo(0, 0);
		diver.body.acceleration.setTo(0, 0);

	}
	else if (diver.animations.currentAnim.name=='swim' || diver.animations.currentAnim.name=='glide')
	{
		diver.body.velocity.y = 0;

	}


	//if (game.input.mousePointer.isDown || game.input.touch.isDown || game.input.isDown || game.input.pointer1.isDown)
	if (game.input.mousePointer.justPressed())
	{
		var i = animSeq.indexOf(diver.animations.currentAnim.name);
		
		if (i<animSeq.length) {
			if (diver.animations.currentAnim.name=='swim') 
			{
				if (diver.body.x < 901) {
					console.log('swim ++')
					diver.play(animSeq[i+1]);
				}
			}
			else
			{
				console.log('everything else ++' + i)
				diver.play(animSeq[i+1]);
			}

			
		}

		if (diver.animations.currentAnim.name=='run')
		{
			// start to run
			diver.body.acceleration.x += -120;
		}
		else if (diver.animations.currentAnim.name=='swan')
		{
			//jump
			diver.body.velocity.y = -300;
			diver.body.drag.y = 100;

		}
		else if (diver.animations.currentAnim.name=='enterWater')
		{
			diver.body.drag.setTo(350, 2500);
		}
		else if (diver.animations.currentAnim.name=='swim' || diver.animations.currentAnim.name=='glide')
		{
			diver.body.velocity.setTo(-90, -200);
			diver.body.drag.setTo(0, 0);
			//diver.body.acceleration.setTo(0, -100);

		}

	}

	
	

}


function collisionHandler (obj1, obj2) {

    //game.stage.backgroundColor = '#992d2d';

}



function submitHighScore () {


}

function listener () {
	// if (!chickenFeed.animations.getAnimation("feed").isPlaying) {
	// 	timesFed += 1;
	// }
	// chickenFeed.animations.play('feed', 12, false);
	// if (timesFed==2) s.setText("Achievement Earned: Fed chickens twice");
	// else if (timesFed==5) s.setText("Achievement Earned: Farmer In Training - Fed chickens five times");
	// else if (timesFed==10) s.setText("Achievement Earned: Semi-pro farmer - Fed chickens ten times");
	// else if (timesFed==50) s.setText("Achievement Earned: Pro Farmer - Fed chickens fifty times");	
	// else if (timesFed==100) s.setText("Achievement Earned: Serious Business - Fed chickens one hundred times");
	// else s.setText("");	
}

	
function httpGet(theUrl)
{
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}