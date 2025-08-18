import { EventBus } from '../EventBus';
import { Scene,Geom } from 'phaser';
import * as Phaser from 'phaser';

const WORLD_HEIGHT = 1200;
const WORLD_WIDTH = 1600;
const PLAYER_VELOCITY = 160;

export class Game extends Scene {
    player?: Phaser.Physics.Arcade.Sprite;
    floor?: Phaser.Physics.Arcade.Group;
    bombs?: Phaser.Physics.Arcade.Group;
    tables?: Phaser.Physics.Arcade.StaticGroup;
    chairs?: Phaser.Physics.Arcade.StaticGroup;
    popupText?: Phaser.GameObjects.Text;
    trees?: Phaser.Physics.Arcade.Group;
    // platforms?: Phaser.Physics.Arcade.StaticGroup;
    cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    score = 0;
    gameOver = false;
    direction: 'down' | 'left' | 'up' | 'right' = "down";
    state: 'idle' | 'walk' = 'idle';
    vx: number = 0; 
    vy: number = 0;
    isInside: boolean = false;

    darkZone?: Phaser.Geom.Rectangle;
    darkCarpet?: Phaser.GameObjects.Rectangle;
    darkZone2?: Phaser.Geom.Rectangle;
    darkCarpet2?: Phaser.GameObjects.Rectangle;

    static onPlayerEnterZone?: ((a:string) => void);
    static onPlayerExitZone?: (() => void);

    showPopup(){
        if(this.popupText){
            this.popupText.setVisible(true);
        }else{
            this.popupText = this.add.text(400,200,`hello bhaisahab`,{
                fontSize: '32px',
                color: '#ffffff',
                backgroundColor: '#000000', // Optional background color
                padding: { x: 10, y: 10 }, // Optional padding
                align: 'center'  
            }).setOrigin(0.5);
        }
    }
//     fun() {
//         if (Game.onPlayerEnterZone) {
//           console.log("Calling onPlayerEnterZone...");
//           Game.onPlayerEnterZone("a");
//       } else {
//           console.log("onPlayerEnterZone is undefined");
//       }
//       console.log("Player is inside the dark zone!");
//   }
 
    constructor ()
    {
        super('Game');
    }

    preload() {
        // this.load.image('floor', 'floor-tiles.png');
        this.load.image('floor', 'grassTile.jpg');
        this.load.image('home','./House/1.png')
        this.load.image('chair', 'chairFinal.png');
        this.load.image('chair-l', 'chairFinalL.png');
        this.load.image('tree', 'trees.png');
        this.load.image('fountain', 'fountain.png');
        this.load.image('bench', 'bench.png');
        this.load.image('bench-l', 'benchL.png');
        this.load.image('table','interiors_demo.png')

        this.load.spritesheet('assets', 'interiors_demo-1.png', {
            frameWidth: 32, // Width of each frame
            frameHeight: 32, // Height of each frame
        });

        this.load.spritesheet('assets-2', 'interiors_demo.png', {
            frameWidth: 32, // Width of each frame
            frameHeight: 32, // Height of each frame
            margin:2,
            spacing:2,
        });
        this.add.sprite(100, 100, 'assets', 0); // First frame
        this.add.sprite(150, 100, 'assets', 1); // Second frame
        

        this.load.image('table', 'tableAlone.png');
        // this.load.image('star', 'assets/star.png');
        // this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
        this.load.spritesheet('walk', 'Walk/walk.png', { frameWidth: 48, frameHeight: 64 });
        this.load.spritesheet('idle', 'Idle/idle.png', { frameWidth: 48, frameHeight: 64 });
    }

    create() {
        this.gameOver = false;

        //  A simple background for our game
        this.add.image(0, 0, 'floor');
        this.add.tileSprite(
            WORLD_WIDTH / 2, // Center the tile sprite horizontally
            WORLD_HEIGHT / 2, // Center the tile sprite vertically
            WORLD_WIDTH*2, // Full width of the world
            WORLD_HEIGHT*2, // Full height of the world
            'floor' // Key of the floor texture
        ).setScale(0.5);
        

        //  The platforms group contains the ground and the 2 ledges we can jump on
        this.tables = this.physics.add.staticGroup();
        this.chairs = this.physics.add.staticGroup(); 
        //  Here we create the ground.
        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        // this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();


      

        // Debug physics bodies 
        // this.physics.world.createDebugGraphic();
    


        // this.tables    
        this.tables.create(600, 380, "table").setScale(2)?.setSize(100,76).setOffset(-25,-15);
        this.chairs.create(700, 380, "assets",7).setScale(2).refreshBody()?.setSize(20,24);
        this.chairs.create(500, 380, "assets",5).setScale(2).refreshBody()?.setSize(20,24);
        this.chairs.create(1200, 600, "fountain").setScale(1).refreshBody()?.setSize(20,24);
        this.chairs.create(1350, 600, "bench").setScale(0.25).refreshBody()?.setSize(20,24);
        this.chairs.create(1050, 600, "bench-l").setScale(0.25).refreshBody()?.setSize(20,24);
        this.chairs.create(100,100, "home").setScale(1).refreshBody()?.setSize(20,24);

        
            //  Now let's create some ledges
        this.player = this.physics.add.sprite(100, 100, "player");
        this.player.setCollideWorldBounds(true);     

         // Carpet for room 1
         this.darkZone = new Geom.Rectangle(400, 250, 400, 300);
         this.darkCarpet = this.add.rectangle(600, 380, 400, 280, 0x000002, 0.5);
         this.physics.add.existing(this.darkCarpet, true);
         (this.darkCarpet.body as Phaser.Physics.Arcade.Body).setSize(280, 280);
         // carper for room 2
         this.darkZone2 = new Geom.Rectangle(1000, 400, 400, 280);
         this.darkCarpet2 = this.add.rectangle(1200, 600, 400, 280, 0x000002, 0.5);
         this.physics.add.existing(this.darkCarpet2, true);
         (this.darkCarpet2.body as Phaser.Physics.Arcade.Body).setSize(280, 280);
         (this.darkCarpet2.body as Phaser.Physics.Arcade.Body).setOffset(60, 0); 
        // Add overlap check
        
        this.physics.add.overlap(this.player, this.darkZone as any, () => {
            Game.onPlayerEnterZone?.("table"); 
            this.isInside  = true;
        }, undefined, this);

        this.physics.add.overlap(this.player, this.darkZone2 as any, () => {
            Game.onPlayerEnterZone?.("fountain"); 
            console.log("andar hua");
            this.isInside  = true;
        }, undefined, this);
        
       
        this.trees = this.physics.add.group();
        
        // Add trees horizontally
        for (let i = 0; i < 13; i++) {
            const tree = this.trees.create(40 + (i * 100), 30, 'tree');
            tree.setScale(0.5);
            tree.refreshBody();
        }
        
        // Add trees vertically
        for (let i = 0; i < 13; i++) {
            const tree = this.trees.create(40, 30 + (i * 100), 'tree');
            tree.setScale(0.5);
            tree.refreshBody();
        }
        
        
        // The player: GameObjects.Sprite and its settings
        // this.player = this.physics.add.sprite(50, 50, 'idle');
        this.player.setScale(1.5);
        this.player.body?.setSize(16, 16);
        this.player.body?.setOffset(16, 28);
        // this.tables.body?.setSize(16,16);
        // this.chairs.body?.setSize(16,16);
        //  Player physics properties. Give the little guy a slight bounce.
        this.player.setBounce(0.2);
        this.cameras.main.setBackgroundColor("#dadada")
        this.cameras.main.setBackgroundColor("#fff")

        
        //  Our player animations, turning, walking left and walking right.        
        this.anims.create({
            key: 'idle_down',
            frames: this.anims.generateFrameNumbers('idle', { start: 0, end: 7 }),
            frameRate: 12,
            repeat: -1,
        });
        this.anims.create({
            key: 'idle_left',
            frames: this.anims.generateFrameNumbers('idle', { start: 8, end: 15 }),
            frameRate: 12,
            repeat: -1,
        });
        this.anims.create({
            key: 'idle_right',
            frames: this.anims.generateFrameNumbers('idle', { start: 40, end: 47 }),
            frameRate: 12,
            repeat: -1,
        });
        this.anims.create({
            key: 'idle_up',
            frames: this.anims.generateFrameNumbers('idle', { start: 24, end: 31 }),
            frameRate: 12,
            repeat: -1,
        });
        this.anims.create({
            key: 'walk_down',
            frames: this.anims.generateFrameNumbers('walk', { start: 0, end: 7 }),
            frameRate: 12,
            repeat: -1,
        });
        this.anims.create({
            key: 'walk_left',
            frames: this.anims.generateFrameNumbers('walk', { start: 8, end: 15 }),
            frameRate: 12,
            repeat: -1,
        });
        this.anims.create({
            key: 'walk_right',
            frames: this.anims.generateFrameNumbers('walk', { start: 40, end: 47 }),
            frameRate: 12,
            repeat: -1,
        });
        this.anims.create({
            key: 'walk_up',
            frames: this.anims.generateFrameNumbers('walk', { start: 24, end: 31 }),
            frameRate: 12,
            repeat: -1,
        });

        //  Input Events
        this.cursors = this.input.keyboard?.createCursorKeys();
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.player.setCollideWorldBounds();


        //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
       

        // this.stars.children.iterate(function (child) {

        //     //  Give each star a slightly different bounce
        //     return child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        // });

        this.bombs = this.physics.add.group();

        //  The score

        //  Collide the player and the stars with the platforms
        this.physics.add.collider(this.player, this.tables);
        this.physics.add.collider(this.player, this.chairs);


        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        // this.physics.add.overlap(this.player, this.stars, this.collectStar, undefined, this);

        // Set up camera to follow player
        this.cameras.main.setZoom(window.innerHeight / 600);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Set camera bounds to prevent it from moving outside the game world
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

        EventBus.emit('current-scene-ready', this);
    }

    

    update() {
        if (this.gameOver || !this.player || !this.cursors) {
            return;
        }

        this.vx = 0;
        this.vy = 0;
        
        if (this.cursors.up.isDown) {
            this.vy = -PLAYER_VELOCITY;
            this.direction = "up";
        }
        else if (this.cursors.down.isDown) {
            this.vy = PLAYER_VELOCITY;
            this.direction = "down";
        }
        
        if (this.cursors.left.isDown) {
            this.vx = -PLAYER_VELOCITY;
            this.direction = "left";
        }
        else if (this.cursors.right.isDown) {
            this.vx = PLAYER_VELOCITY;
            this.direction = "right";
        }

        if(this.vx && this.vy) {
            this.vx *= Math.SQRT1_2;
            this.vy *= Math.SQRT1_2;
        }

        this.state = (this.vx || this.vy) ? "walk" : "idle";
        this.player.anims.play(this.state + '_' + this.direction, true);

        this.player.setVelocity(this.vx, this.vy);

        if(this?.darkZone?.contains(this.player.x,this.player.y) || this?.darkZone2?.contains(this.player.x,this.player.y)){
            if(this.isInside){
                return;
            }
            this.isInside = true;
            if(Game.onPlayerEnterZone){
                // this.showPopup();
                console.log("bye");
                if(this?.darkZone?.contains(this.player.x,this.player.y)){
                    Game.onPlayerEnterZone("table");    
                }else{
                    Game.onPlayerEnterZone("fountain");
                }
            }

        }else{
            if(!this.isInside){
                return;
            }else{
                // this.popupText.setVisible(false);
                if(Game.onPlayerExitZone) {
                    Game.onPlayerExitZone();
                }
                this.isInside = false;
            }
        }

    
    }

    changeScene() {
        this.scene.start('GameOver');
    }
    
}
