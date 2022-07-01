// 遊戲開始前畫面
const gameStart = {
    key: 'gameStart',
    preload: function(){
        this.load.image('floor','./image/bg/floor.png');
        this.load.image('background','./image/bg/background.png');
        this.load.image('architecture','./image/bg/architecture.png');
        this.load.image('sky','./image/bg/sky.png');
        this.load.image('logoStart','./image/logoStart.png');
        this.load.image('logo','./image/logo.png');  
    },
    create: function(){
        // 資源載入完成，加入遊戲物件及相關設定
        this.sky = this.add.tileSprite(cw/2, ch/2, cw, ch,'sky');
        this.floor = this.add.tileSprite(cw/2, ch, cw, ch,'floor');
        this.background = this.add.tileSprite(cw/2, ch/2, cw, ch,'background');
        this.architecture = this.add.tileSprite(cw/2, ch/2, cw, ch,'architecture');

        this.logo = this.add.image(cw/2, ch/2 + 100,'logo');
        this.logo.setScale(0.50);

        this.logoStart = this.add.image(cw/2, ch/2 - 150,'logoStart');
        this.logoStart.setScale(0.65);
        this.logoStart.setInteractive();

        //點擊圖像，開始進行遊戲
        this.logoStart.on('pointerdown',()=>{
            this.scene.start('gamePlay')
        })
    },

    update: function(){

    }
}