CustomSprite = function (game, x, y, key, frame) {

    Phaser.Sprite.call(this, game, x, y, key, frame);

};

Phaser.Particle.prototype = Object.create(Phaser.Sprite.prototype);
Phaser.Particle.prototype.constructor = Phaser.Particle;

Phaser.Particle.prototype.update = function() {

};

