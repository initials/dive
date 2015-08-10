
var game = new Phaser.Game(148*4, 91*4, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render  }, false, false);

function preload() {

	game.load.spritesheet('diver', 'diver_05.png', 128, 128);
	game.load.spritesheet('tiles', 'tile.png', 9,9,9);

	
}

var score = 0;

var animSeq;
var divingBlock;
var diver;

var tweet;
var TWEET_PREAMBLE = 'https://twitter.com/intent/tweet?text=Summer time, lets dive ';
var TWEET_PROLOGUE = ' http://www.initialsgames.com/dive/ &hashtags=8bitsummer ';

// ---------- Set these to build level -------------
var diveHeight = 1000; 
var poolWidth = 1500;
var poolDepth = 700;

// ----------- calculate based on level

var jumpPoint;
        

function create() {
	//--TWEET--------------------------------------------------------------------------------------
	tweet = document.getElementById('tweet');
	//alert(tweet.href);
	tweet.href = TWEET_PREAMBLE + score + TWEET_PROLOGUE;

	//this.tweetElement.href = this.TWEET_PREAMBLE + this.score + this.TWEET_PROLOGUE;
	//----------------------------------------------------------------------------------------

	game.stage.backgroundColor = '#0073ef';


	score = 0;

	//add pointer for mobile touching.
	game.input.addPointer();

	divingBlock = game.add.tileSprite(1300, 328, 270, 180, 'tiles');
	game.physics.enable(divingBlock, Phaser.Physics.ARCADE);
	divingBlock.body.immovable = true;



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
	diver.x = 1475;
	diver.y = 200;
	diver.body.setSize(48, 48, 40, 50);
	diver.body.acceleration.y = 980;
	diver.body.maxVelocity.x = 2000;

    //diver.width = 48;
    //diver.height = 48;
    //diver.offsetX = 40;
    //diver.offsetY = 50;

    game.input.justPressedRate = 25;
	
	game.world.setBounds(0, 0, 9000, 9000);
    game.camera.follow(diver);

}

// render used for debug only.
function render() {

	game.debug.body(diver);
	game.debug.text(diver.animations.currentAnim.name + " " + diver.body.velocity.y, 10,10)


}


function update() 
{
	game.physics.arcade.collide(diver, divingBlock, collisionHandler, null, this);

	//if (game.input.mousePointer.isDown || game.input.touch.isDown || game.input.isDown || game.input.pointer1.isDown)
	if (game.input.mousePointer.justPressed())
	{
		

		var i = animSeq.indexOf(diver.animations.currentAnim.name);
		if (i<animSeq.length)
			diver.play(animSeq[i+1]);

		if (diver.animations.currentAnim.name=='run')
		{
			diver.body.acceleration.x += -120;
		}
		else if (diver.animations.currentAnim.name=='swan')
		{
			diver.body.velocity.y = -300;
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