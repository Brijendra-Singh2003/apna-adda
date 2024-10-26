import { EventBus } from '../EventBus';
import { GameObjects, Scene } from 'phaser';

const WORLD_HEIGHT = 1200;
const WORLD_WIDTH = 1600;
const PLAYER_VELOCITY = 160;

export class Game extends Scene {
    player?: Phaser.Physics.Arcade.Sprite;
    stars?: Phaser.Physics.Arcade.Group;
    bombs?: Phaser.Physics.Arcade.Group;
    platforms?: Phaser.Physics.Arcade.StaticGroup;
    cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    score = 0;
    gameOver = false;
    scoreText?: GameObjects.Text;

    onMove?: ((x: number, y: number) => void);
    
    constructor ()
    {
        super('Game');
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        this.gameOver = false;

        //  A simple background for our game
        this.add.image(400, 300, 'sky');
        this.add.image(1200, 300, 'sky');
        this.add.image(400, 900, 'sky');
        this.add.image(1200, 900, 'sky');

        //  The platforms group contains the ground and the 2 ledges we can jump on
        this.platforms = this.physics.add.staticGroup();

        //  Here we create the ground.
        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        //  Now let's create some ledges
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');

        // The player: GameObjects.Sprite and its settings
        this.player = this.physics.add.sprite(100, 450, 'dude');

        //  Player physics properties. Give the little guy a slight bounce.
        this.player.setBounce(0.2);

        //  Our player animations, turning, walking left and walking right.
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        //  Input Events
        this.cursors = this.input.keyboard?.createCursorKeys();

        //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 7, y: 100, stepX: 70 }
        });

        this.stars.children.iterate(function (child) {

            //  Give each star a slightly different bounce
            return child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        });

        this.bombs = this.physics.add.group();

        //  The score
        this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px' });

        //  Collide the player and the stars with the platforms
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        this.physics.add.overlap(this.player, this.stars, this.collectStar, undefined, this);

        this.physics.add.collider(this.player, this.bombs, this.hitBomb, undefined, this);

        // Set up camera to follow player
        this.cameras.main.setZoom(window.innerHeight / 600);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Set camera bounds to prevent it from moving outside the game world
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

        EventBus.emit('current-scene-ready', this);
    }

    update() {
        if (this.gameOver || !this.player) {
            return;
        }

        let vx = 0;
        let vy = 0;

        if (this.cursors.left.isDown) {
            this.player.anims.play('left', true);
            
            if(this.player.x > 0) vx = -1;
            else this.player.x = 0;
        }
        else if (this.cursors.right.isDown) {
            this.player.anims.play('right', true);

            if(this.player.x < WORLD_WIDTH) vx = 1;
            else this.player.x = WORLD_WIDTH;
        }
        else {
            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown) {
            if(this.player.y > 0) vy = -1;
            else this.player.y = 0;
        }
        else if (this.cursors.down.isDown) {
            if(this.player.y < WORLD_HEIGHT) vy = 1;
            else this.player.y = WORLD_HEIGHT;
        }

        if(vx && vy) {
            vx *= Math.SQRT1_2;
            vy *= Math.SQRT1_2;
        }

        this.player.setVelocityX(vx * PLAYER_VELOCITY);
        this.player.setVelocityY(vy * PLAYER_VELOCITY);

        this.onMove && this.onMove(this.player.x, this.player.y);

        // if (this.cursors.up.isDown && this.player.body.touching.down) {
        //     this.player.setVelocityY(-330);
        // }
    }

    collectStar(player: any, star: any) {
        star.disableBody(true, true);

        //  Add and update the score
        this.score += 10;
        this.scoreText?.setText('Score: ' + this.score);

        if (this.stars?.countActive(true) === 0) {
            //  A new batch of stars to collect
            this.stars.children.iterate(function (child: any) {

                child.enableBody(true, child.x, 0, true, true);

            });

            const x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

            const bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            bomb.allowGravity = false;

        }
    }

    hitBomb(player: any, bomb: any) {
        this.physics.pause();

        player.setTint(0xff0000);

        player.anims.play('turn');

        this.gameOver = true;

        this.changeScene();
    }

    changeScene() {
        this.scene.start('GameOver');
    }
}
