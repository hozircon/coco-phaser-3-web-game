const config = {
    type: Phaser.AUTO,
    width: cw,       //遊戲視窗寬
    height: ch,      //遊戲視窗高
    parent: 'app',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 700
            },
            // debug: true,
        },
    },
    dom: {
        createContainer: true
    },
    scene: [gameStart,gamePlay]
}

const game = new Phaser.Game(config);