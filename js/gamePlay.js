var element;

const gamePlay = {
    key: 'gamePlay',
    preload: function(){
        //加載地圖物件
        this.load.image('floor','./image/bg/floor.png');
        this.load.image('background','./image/bg/background.png');
        this.load.image('architecture','./image/bg/architecture.png');
        this.load.image('sky','./image/bg/sky.png');

        //加載畫面物件(HP)
        this.load.image('HP','./image/HP.png');

        //加載遊戲結束視窗
        this.load.html("form", "./html/form.html");

        //加載遊戲畫面移動物件
        this.load.spritesheet('user','./image/player.png',{frameWidth: 400,frameHeight: 384});          //玩家控制角色
            //怪物群組1
        this.load.spritesheet('monsAme','./image/mons1.png',{frameWidth: 420,frameHeight: 563});        //地面行走
        this.load.spritesheet('monsIna','./image/mons2.png',{frameWidth: 375,frameHeight: 375});        //半空漂浮1
        this.load.spritesheet('monsAmeJump1','./image/mons1.png',{frameWidth: 420,frameHeight: 563});   //跳躍型
        this.load.spritesheet('monsInaBig','./image/mons3.png',{frameWidth: 400,frameHeight: 447});     //半空漂浮2
            //怪物群組2
        this.load.spritesheet('monsSaSa','./image/mons7.png',{frameWidth: 380,frameHeight: 375});       //地面行走
        this.load.spritesheet('monsAmeJump','./image/mons1.png',{frameWidth: 420,frameHeight: 563});    //跳躍型
        this.load.spritesheet('monsSuba','./image/mons6.png',{frameWidth: 538,frameHeight: 533});       //半空漂浮1
        this.load.spritesheet('monsAmeBee','./image/mons5.png',{frameWidth: 489,frameHeight: 563});     //半空漂浮2
            //怪物群組3 : 難度3時出現
        this.load.spritesheet('monsSaSaRun','./image/mons31.png',{frameWidth: 365,frameHeight: 261});   //地面行走
        this.load.spritesheet('monsKiara','./image/mons32.png',{frameWidth: 363,frameHeight: 341});     //半空漂浮1
        this.load.spritesheet('monsSaSaFall','./image/mons33.png',{frameWidth: 252,frameHeight: 225});  //墜落型態1
        this.load.spritesheet('monsAmeFall','./image/mons34.png',{frameWidth: 534,frameHeight: 463});   //墜落型態2

        this.monsterArr = [];    // 存放所有怪物實體
        this.monsterArr2 = [];   
        this.monsterArr3 = [];   

        this.masIdx = 0;         // 怪物索引
        this.masIdx2 = 1;        
        this.masIdx3 = 1;        

        //初始化
        this.bgSpeed = 1.0;     //背景基本移動速度
        this.TimeStep = 0;      //遊戲時間
        this.hitCount = 5;      //生命值
        this.gameStop = false;
        this.HardMode = false;  //是否開啟難度3模式
    },
    create: function(){
        // 資源載入完成，加入遊戲物件及相關設定(大小、位置)
        this.sky = this.add.tileSprite(cw/2, ch/2, cw, ch,'sky');
        this.floor = this.add.tileSprite(cw/2, ch, cw, ch,'floor');
        this.background = this.add.tileSprite(cw/2, ch/2, cw, ch,'background');
        this.architecture = this.add.tileSprite(cw/2, ch/2, cw, ch,'architecture');
        this.floor.setSize(cw, 70);

        this.timeText = this.add.text(25, ch - 46, `TIME: ${this.TimeStep}`, { fontSize: '22px', fill: '#FFFFFF' });
        this.SpeedText = this.add.text(155, ch - 46, `SPEED: ${this.bgSpeed}`, { fontSize: '22px', fill: '#FFFFFF' });
        this.hitText = this.add.text(10, 35, `HP:`, { fontSize: '35px', fill: '#fa7705' });

        // HP物件設定 : 建立生命值物件，當HP減少時依序移除生命物件
        const HPs = [];
        for(var i = 0 ; i < this.hitCount ;i++){
            var Hp = this.add.image(40 + ((i+1) * 75), 50, 'HP');
            HPs.push(Hp);
        }
        function HpDestroy(index){
            HPs[index].destroy();
        }

        // 遊戲計時器與難度設計邏輯
        let gametime = setInterval(()=>{
            if(!this.gameStop){
                this.TimeStep++;
                //重新設定文字
                this.timeText.setText(`TIME: ${this.TimeStep}`);
                this.SpeedText.setText(`SPEED: ${this.bgSpeed}`);
                if(this.TimeStep >= 40){
                    this.HardMode = true;
                    this.bgSpeed = 3;
                }else if(this.TimeStep >= 30  ){
                    this.bgSpeed = 2.5;
                }else if(this.TimeStep >= 20  ){
                    this.bgSpeed = 2;
                }else if(this.TimeStep >= 10){
                    this.bgSpeed = 1.5;
                }
            }
        }, 1000);

        //加入玩家控制物件及相關設定(大小、位置及物理引擎係數)
        this.user = this.physics.add.sprite(100,400, 'user').setImmovable();
        this.user.setCollideWorldBounds(true);
        this.user.body.allowGravity = false;
        this.user.setScale(0.35);
        this.user.setSize(300, 280, 1,0);
        this.user.setBounce(0.1);
        this.user.setPushable = true;

        //物理引擎係數設定 > 批次設定怪物物件  * 注意此處設定是怪物「不」受墜落效果，並且碰撞「不」移動
        const addPhysics = GameObject =>{
            this.physics.add.existing(GameObject);
            GameObject.body.immovable = true;
            GameObject.body.moves = false;
        }

        //怪物群組參數
        const masPos = [
            {name: 'monsAme', x: cw + 100 , y: 588 },
            {name: 'monsAmeJump1', x: cw + 250 , y: 408 },
            {name: 'monsIna', x: cw + 150, y: 420},
            {name: 'monsInaBig', x: cw + 300, y: 300},
        ]
        const masPos2 = [
            {name: 'monsSaSa', x: cw + 100, y: 600},
            {name: 'monsAmeJump', x: cw + 150 , y: 408},
            {name: 'monsSuba', x: cw + 200, y: 400},
            {name: 'monsAmeBee', x: cw + 250, y: 300},
        ]
        const masPos3 = [
            {name: 'monsSaSaRun', x: cw + 100, y: 600},
            {name: 'monsKiara', x: cw + 150 , y: 408},
            {name: 'monsSaSaFall', x: cw + 500, y: 400},
            {name: 'monsAmeFall', x: cw + 250, y: 300},
        ]

        //碰撞機制邏輯設定
        const hittest = (player, mons) => {
            // 1. 碰撞後重製怪物位置(X座標)，並且HP物件減少
            mons.x = cw + 200;
            this.hitCount -=1;
            if(this.hitCount >= 0){
                HpDestroy.call(HPs,this.hitCount);
            }

            // 2. 更新masidx係數(怪物出動id) > 出動該怪物群組內的隨機怪物
            for(let i = 0; i < 4;i++){
                if(this.monsterArr[i].texture.key == mons.texture.key){
                    this.masIdx = getRandom(this.monsterArr.length - 1, 0);
                }else if(this.monsterArr2[i].texture.key == mons.texture.key){
                    this.masIdx2 = getRandom(this.monsterArr2.length - 1, 0);
                }else if(this.monsterArr3[i].texture.key == mons.texture.key){
                    this.masIdx3 = getRandom(this.monsterArr3.length - 1, 0);
                }
            }

            /*   3. 是否達成遊戲結束規則
                 Y : 遊戲暫停 > api request (post to table player) > 出現遊戲結束視窗 >
                 遊戲結束視窗輸入暱稱 > api request (post to table ranking)               */
            if(this.hitCount == 0){
                this.gameStop = true;
                clearInterval(gametime);
                TimeStep = this.TimeStep;
                element = this.add.dom(cw/2, ch/2).createFromCache('form');
                element.addListener('click');
                element.on('click', function (event) {
                    if (event.target.name === 'SendButton') {
                        window.location.reload();
                    }
                })
            }
        }

        //決定怪物出動順序邏輯設定
        for (let i = 0; i < 4; i++) {
            // 將masPos的怪物以隨機方式，放置到新陣列mons內，如此每次遊戲重新載入設定時，mons1~mons4會對應不同的怪物(monsB、C同理)
            let BoolIdx = getRandom(3-i, 0);
            let BoolIdx2 = getRandom(3-i, 0);
            let BoolIdx3 = getRandom(3-i, 0);
            this['mons'+ i] = this.physics.add.sprite(masPos[BoolIdx].x, masPos[BoolIdx].y,  masPos[BoolIdx].name);
            this['monsB'+ i] = this.physics.add.sprite(masPos2[BoolIdx2].x, masPos2[BoolIdx2].y,  masPos2[BoolIdx2].name);
            this['monsC'+ i] = this.physics.add.sprite(masPos3[BoolIdx3].x, masPos3[BoolIdx3].y,  masPos3[BoolIdx3].name);

            //針對不同怪物設定其視覺大小與碰撞判定大小
                //怪物群1設定
            if(this['mons'+ i].texture.key == 'monsAme' ){
                this['mons'+i].setScale(0.30);
                this['mons'+i].body.setSize(290,500,1,1);
            }else if(this['mons'+ i].texture.key == 'monsAmeJump1' ){
                this['mons'+i].setScale(0.25);
                this['mons'+i].body.setSize(290,450,1,0);
            }else if(this['mons'+ i].texture.key == 'monsIna' ){
                this['mons'+i].setScale(0.30);
                this['mons'+i].body.setSize(230,290,1,0);
            }else if(this['mons'+ i].texture.key == 'monsInaBig'){
                this['mons'+i].setScale(0.40);
                this['mons'+i].body.setSize(330,330,1,0);
            }
                //怪物群2設定
            if(this['monsB'+ i].texture.key == 'monsSaSa' ){
                this['monsB'+i].setScale(0.30);
                this['monsB'+i].body.setSize(270,280,1,1);
            }else if(this['monsB'+ i].texture.key == 'monsAmeJump' ){
                this['monsB'+i].setScale(0.25);
                this['monsB'+i].body.setSize(290,450,1,0);
            }else if(this['monsB'+ i].texture.key == 'monsSuba' ){
                this['monsB'+i].setScale(0.25);
                this['monsB'+i].body.setSize(300,480,1,1);
            }else if(this['monsB'+ i].texture.key == 'monsAmeBee'){
                this['monsB'+i].setScale(0.35);
                this['monsB'+i].body.setSize(350,480,1,1);
            }
                //怪物群3設定
            if(this['monsC'+ i].texture.key == 'monsSaSaRun'){
                this['monsC'+i].setScale(0.4);
                this['monsC'+i].body.setSize(270,200,1,1);
            }else if(this['monsC'+ i].texture.key == 'monsKiara' ){
                this['monsC'+i].setScale(0.4);
                this['monsC'+i].body.setSize(260,280,1,0);
            }else if(this['monsC'+ i].texture.key == 'monsSaSaFall' ){
                this['monsC'+i].setScale(0.45);
                this['monsC'+i].body.setSize(200,200,1,1);
            }else if(this['monsC'+ i].texture.key == 'monsAmeFall'){
                this['monsC'+i].setScale(0.30);
                this['monsC'+i].body.setSize(430,480,1,1);
            }

            this.monsterArr.push(this['mons'+ i]);
            this.monsterArr2.push(this['monsB'+ i]);
            this.monsterArr3.push(this['monsC'+ i]);

            // 使用addPhysics()進行怪物物件的物理引擎設定   【注意】跳躍型怪物要保持物理墜落與彈跳效果，因此不設定addPhysics
            if(this['mons'+ i].texture.key != 'monsAmeJump1'){
                addPhysics(this['mons'+i]);
            }
            if(this['monsB'+ i].texture.key != 'monsAmeJump'){
                addPhysics(this['monsB'+i]);
            }
            // 【注意】所有monsC怪物皆設定為非墜落實體，monsC中的墜落怪物原理是透過物件Y值增減來進行移動效果，而非跳躍型的物理墜落
            addPhysics(this['monsC'+i]);

            this.physics.add.collider(this.user, this['mons'+i], hittest);
            this.physics.add.collider(this.user, this['monsB'+i], hittest);
            this.physics.add.collider(this.user, this['monsC'+i], hittest);

            /*移除已編入過的怪物編號，ex.  i = 0 , idx = 2 (0~3) : mons0 = masPos[2] , mosPos[0 1 2 3] -> mosPos[0 1 3]
                                        i = 1 , idx = 2 (0~2) : mons1 = masPos[3] , mosPos[0 1 3]   -> mosPos[0 1]
                                        i = 2 , idx = 0 (0~1) : mons2 = masPos[0] , mosPos[0 1]     -> mosPos[1]
                                        i = 3 , idx = 0 (0)   : mons3 = masPos[1] , mosPos[1]       -> mosPos[]
             */
            masPos.splice(BoolIdx,1);
            masPos2.splice(BoolIdx2,1);
            masPos3.splice(BoolIdx3,1);
        }

        //地板的實體化設定(碰撞彈跳事件)
        addPhysics(this.floor);
        this.physics.add.collider(this.user, this.floor);
        
        //動畫影格參數設定 (每張圖片不同，只能個別設定)
        this.anims.create({
            key:'run',
            frames:this.anims.generateFrameNumbers('user',{start:0, end:7 }),
            frameRate: 10,
            repeat: -1
         })
         this.anims.create({
            key:'mons1_run',
            frames:this.anims.generateFrameNumbers('monsAme',{start:0, end:6 }),
            frameRate: 14,
            repeat: -1 
        })
        this.anims.create({
            key:'mons2_run',
            frames:this.anims.generateFrameNumbers('monsAmeJump1',{start:0, end:6 }),
            frameRate: 14,
            repeat: -1
            })
         this.anims.create({
            key:'mons3_run',
            frames:this.anims.generateFrameNumbers('monsIna',{start:0, end:8 }),
            frameRate: 15,
            repeat: -1
         })
         this.anims.create({
            key:'mons4_run',
            frames:this.anims.generateFrameNumbers('monsInaBig',{start:0, end:7 }),
            frameRate: 14,
            repeat: -1
         })
         
        //monster2
         this.anims.create({
            key:'mons5_run',
            frames:this.anims.generateFrameNumbers('monsSaSa',{start:0, end:11 }),
            frameRate: 12,
            repeat: -1 
        })
        this.anims.create({
            key:'mons6_run',
            frames:this.anims.generateFrameNumbers('monsAmeJump',{start:0, end:6 }),
            frameRate: 14,
            repeat: -1
            })
         this.anims.create({
            key:'mons7_run',
            frames:this.anims.generateFrameNumbers('monsSuba',{start:0, end:5 }),
            frameRate: 14,
            repeat: -1
         })
         this.anims.create({
            key:'mons8_run',
            frames:this.anims.generateFrameNumbers('monsAmeBee',{start:0, end:4 }),
            frameRate: 18,
            repeat: -1
         })

        //monster3
        this.anims.create({
            key:'mons9_run',
            frames:this.anims.generateFrameNumbers('monsSaSaRun',{start:0, end:2 }),
            frameRate: 10,
            repeat: -1
            })
        this.anims.create({
            key:'mons10_run',
            frames:this.anims.generateFrameNumbers('monsKiara',{start:0, end:2 }),
            frameRate: 10,
            repeat: -1
            })
        this.anims.create({
            key:'mons11_run',
            frames:this.anims.generateFrameNumbers('monsSaSaFall',{start:0, end:3 }),
            frameRate: 12,
            repeat: -1
            })
        this.anims.create({
            key:'mons12_run',
            frames:this.anims.generateFrameNumbers('monsAmeFall',{start:0, end:4 }),
            frameRate: 15,
            repeat: -1
            })

         this.user.anims.play('run', true);

        //怪物物件設定動畫效果、跳躍型怪物設定物理引擎效果(彈跳係數)
         for(let j = 0; j < 4; j++){

             if(this['mons'+j].texture.key == 'monsAme'){
                this['mons'+j].anims.play('mons1_run', true);
             }else if(this['mons'+j].texture.key == 'monsAmeJump1'){        //跳躍型:動畫效果、地板碰撞效果、彈跳係數
                this['mons'+j].anims.play('mons2_run', true);
                this.physics.add.collider(this['mons'+j], this.floor);
                this['mons'+j].setCollideWorldBounds(true);
                this['mons'+j].setBounce(0.99,1);
             }else if(this['mons'+j].texture.key == 'monsIna'){
                this['mons'+j].anims.play('mons3_run', true);
             }else if(this['mons'+j].texture.key == 'monsInaBig'){
                this['mons'+j].anims.play('mons4_run', true);
             }

             //怪物群組2
             if(this['monsB'+j].texture.key == 'monsSaSa'){
                this['monsB'+j].anims.play('mons5_run', true);
             }else if(this['monsB'+j].texture.key == 'monsAmeJump'){
                this['monsB'+j].anims.play('mons6_run', true);
                this.physics.add.collider(this['monsB'+j], this.floor);     //跳躍型:動畫效果、地板碰撞效果、彈跳係數
                this['monsB'+j].setCollideWorldBounds(true);
                this['monsB'+j].setBounce(0.99,1);
             }else if(this['monsB'+j].texture.key == 'monsSuba'){
                this['monsB'+j].anims.play('mons7_run', true);
             }else if(this['monsB'+j].texture.key == 'monsAmeBee'){
                this['monsB'+j].anims.play('mons8_run', true);
             }

             //怪物群組3
             if(this['monsC'+j].texture.key == 'monsSaSaRun'){
                this['monsC'+j].anims.play('mons9_run', true);
             }else if(this['monsC'+j].texture.key == 'monsKiara'){
                this['monsC'+j].anims.play('mons10_run', true);
             }else if(this['monsC'+j].texture.key == 'monsSaSaFall'){
                this['monsC'+j].anims.play('mons11_run', true);
             }else if(this['monsC'+j].texture.key == 'monsAmeFall'){
                this['monsC'+j].anims.play('mons12_run', true);
             }
         }

        //開啟世界左右界限限制
         this.physics.world.checkCollision.left = false;
         this.physics.world.checkCollision.right = false;
    },
    update: function(){

        if(this.gameStop) return;
        //地圖物件移動
        this.sky.tilePositionX += 3 * this.bgSpeed;
        this.architecture.tilePositionX += 2 * this.bgSpeed;
        this.background.tilePositionX += 1 * this.bgSpeed;
        //怪物群組1、2 物件移動
        this.monsterArr[this.masIdx].x -= 5 * this.bgSpeed;
        this.monsterArr2[this.masIdx2].x -= 5 * this.bgSpeed;

        //怪物位置相關設定 (無碰撞時的位置初始化 )
        for (let i = 0; i < this.monsterArr.length; i++) {
            // 怪物群組1
            if(this.monsterArr[i].x <= -100 ){
                this.monsterArr[i].x = cw + 300;
                if(this.monsterArr[i].texture.key=='monsAmeJump1'){
                    this.monsterArr[i].y = getRandom(400,100); 
                }else if(this.monsterArr[i].texture.key !='monsAme'){
                    this.monsterArr[i].y = getRandom(500,100); 
                }
                this.masIdx = getRandom(this.monsterArr.length - 1, 0);
            }
            // 怪物群組2
            if(this.monsterArr2[i].x <= -100){
                this.monsterArr2[i].x = cw + 300;
                if(this.monsterArr2[i].texture.key=='monsAmeJump'){
                    this.monsterArr2[i].y = getRandom(400,100);
                }else if(this.monsterArr2[i].texture.key !='monsSaSa'){
                    this.monsterArr2[i].y = getRandom(500,100);
                }
                this.masIdx2 = getRandom(this.monsterArr2.length - 1, 0);
            }
            // 困難模式 : 怪物群組3
            if(this.HardMode){
                if( this.monsterArr3[this.masIdx3].texture.key == 'monsSaSaRun' || this.monsterArr3[this.masIdx3].texture.key=='monsKiara'){
                    this.monsterArr3[this.masIdx3].x -= 3;
                    this.monsterArr3[this.masIdx3].y -= 0;
                    if(this.monsterArr3[i].x <= -100){
                        this.monsterArr3[i].x = cw + getRandom(400, 100);
                        if(this.monsterArr3[this.masIdx3].texture.key=='monsKiara'){
                            this.monsterArr3[i].y = getRandom(300,50);
                        }
                        this.masIdx3 = getRandom(this.monsterArr3.length - 1, 0);
                    }
                }else if(this.monsterArr3[this.masIdx3].texture.key=='monsSaSaFall' || this.monsterArr3[this.masIdx3].texture.key=='monsAmeFall'){
                    this.monsterArr3[this.masIdx3].x -= 0;
                    this.monsterArr3[this.masIdx3].y += 2;
                    if(this.monsterArr3[i].y >= 800){
                        this.monsterArr3[i].x = getRandom(cw - 50, 30);
                        this.monsterArr3[i].y = -100;
                        this.masIdx3 = getRandom(this.monsterArr3.length - 1, 0);
                    }
                }
            }
        }

        //鍵盤控制設定(玩家角色)
        const keyboard = this.input.keyboard.createCursorKeys();
        if(keyboard.right.isDown && this.user.x < cw){
            if(keyboard.up.isDown){
                this.user.x += user_speed; 
                this.user.y -= user_speed;
            }else if(keyboard.down.isDown){
                this.user.x += user_speed; 
                this.user.y += user_speed;
            }else{
            this.user.x += user_speed;            
            }
            this.user.flipX = false;
        }else if(keyboard.left.isDown && this.user.x > 0){
            if(keyboard.up.isDown){
                this.user.x -= user_speed; 
                this.user.y -= user_speed;
            }else if(keyboard.down.isDown){
                this.user.x -= user_speed; 
                this.user.y += user_speed;
            }else{
            this.user.x -= user_speed;            
            }
            this.user.flipX = true;
        }else if(keyboard.up.isDown){
            this.user.y -= user_speed;
        }else if(keyboard.down.isDown){
            this.user.y += user_speed;
        }else{
            this.user.flipX = false;
        }
    }
}
