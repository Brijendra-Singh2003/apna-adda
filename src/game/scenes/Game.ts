import { EventBus } from '../EventBus';
import { GameObjects, Scene } from 'phaser';
import * as Phaser from 'phaser';

const WORLD_HEIGHT = 1200;
const WORLD_WIDTH = 1600;
const PLAYER_VELOCITY = 160;

export class Game extends Scene {
    player?: Phaser.Physics.Arcade.Sprite;
    // stars?: Phaser.Physics.Arcade.Group;
    bombs?: Phaser.Physics.Arcade.Group;
    tables?: Phaser.Physics.Arcade.StaticGroup;
    // platforms?: Phaser.Physics.Arcade.StaticGroup;
    cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    score = 0;
    gameOver = false;
    scoreText?: GameObjects.Text;
    vx: number = 0;
    vy: number = 0;

    onMove?: ((x: number, y: number) => void);
    
    constructor ()
    {
        super('Game');
    }

    preload() {
        this.load.image('floor', 'assets/floor.png');
        // this.load.image('ground', 'assets/platform.png');
        this.load.image('table', 'assets/table.png');
        // this.load.image('star', 'assets/star.png');
        // this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        this.gameOver = false;

        
        //  A simple background for our game
        // this.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'floor').setScale(4);

        //  The platforms group contains the ground and the 2 ledges we can jump on
        this.tables = this.physics.add.staticGroup();

        //  Here we create the ground.
        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        // this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        //  Now let's create some ledges
        this.tables.create(600, 400, "table").setScale(0.375).refreshBody();

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
        // this.stars = this.physics.add.group({
        //     key: 'star',
        //     repeat: 11,
        //     setXY: { x: 7, y: 100, stepX: 70 }
        // });

        // this.stars.children.iterate(function (child) {

        //     //  Give each star a slightly different bounce
        //     return child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        // });

        this.bombs = this.physics.add.group();

        //  The score
        this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px' });

        //  Collide the player and the stars with the platforms
        this.physics.add.collider(this.player, this.tables);

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        // this.physics.add.overlap(this.player, this.stars, this.collectStar, undefined, this);

        // Set up camera to follow player
        this.cameras.main.setZoom(window.innerHeight / 600);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Set camera bounds to prevent it from moving outside the game world
        // this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

        EventBus.emit('current-scene-ready', this);
    }

    update() {
        if (this.gameOver || !this.player || !this.cursors) {
            return;
        }

        this.vx = 0;
        this.vy = 0;

        if (this.cursors.left.isDown) {
            this.player.anims.play('left', true);
            
            // if(this.player.x > 0) 
                this.vx = -PLAYER_VELOCITY;
            // else this.player.x = 0;
        }
        else if (this.cursors.right.isDown) {
            this.player.anims.play('right', true);

            // if(this.player.x < WORLD_WIDTH) 
                this.vx = PLAYER_VELOCITY;
            // else this.player.x = WORLD_WIDTH;
        }
        else {
            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown) {
            // if(this.player.y > 0) 
                this.vy = -PLAYER_VELOCITY;
            // else this.player.y = 0;
        }
        else if (this.cursors.down.isDown) {
            // if(this.player.y < WORLD_HEIGHT) 
                this.vy = PLAYER_VELOCITY;
            // else this.player.y = WORLD_HEIGHT;
        }

        if(this.vx && this.vy) {
            this.vx *= Math.SQRT1_2;
            this.vy *= Math.SQRT1_2;
        }

        this.player.setVelocityX(this.vx * PLAYER_VELOCITY);
        this.player.setVelocityY(this.vy * PLAYER_VELOCITY);

        this.onMove && this.onMove(this.player.x, this.player.y);

        this.player.setVelocity(this.vx, this.vy);
    }


    changeScene() {
        this.scene.start('GameOver');
    }
}
