import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MainMenu extends Scene
{
    background!: GameObjects.Image;
    logo!: GameObjects.Image;
    title!: GameObjects.Text;
    logoTween!: Phaser.Tweens.Tween | null;
    userName!: string;

    constructor ()
    {
        super('MainMenu');
    }
    setUserName(name: string) {
        this.userName = name;
      }

    create ()
    {
        this.background = this.add.image(400, 300, 'background');

        this.logo = this.add.image(400, 240, 'logo').setDepth(100);

        this.title = this.add.text(400, 360, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        EventBus.emit('current-scene-ready', this);
    }
    
    changeScene ()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start('Game');
    }

    moveLogo (vueCallback: ({ x, y }: { x: number, y: number }) => void)
    {
        if (this.logoTween)
        {
            if (this.logoTween.isPlaying())
            {
                this.logoTween.pause();
            }
            else
            {
                this.logoTween.play();
            }
        } 
        else
        {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (vueCallback)
                    {
                        vueCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y)
                        });
                    }
                }
            });
        }
    }
}
