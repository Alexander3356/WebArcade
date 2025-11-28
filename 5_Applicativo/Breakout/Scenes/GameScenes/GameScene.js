
import { collisionePotenziamenti } from "./SimplePowerups.js";
import { attivaPallaDiFuoco } from "./PermanentPowerups.js";
import { togglePause } from "./PauseMenu.js";
import { pulsantiSceltaOver } from "./PauseMenu.js";
import { pulsantiSceltaOut } from "./PauseMenu.js";
import { ricominciaClick } from "./PauseMenu.js";
import { resettaGioco } from "./PauseMenu.js";
import { bossCheck } from "./Boss.js";
import { collisioneAttacco } from "./Boss.js";
import { collisioneBlocco } from "./Blocks.js";
import { generaBlocchi } from "./Blocks.js";


export default class GameScene extends Phaser.Scene { //il gioco principale

    constructor() {
        super({ key: 'GameScene' });
        this.paddle;
        this.ball;
        this.musica;
        this.ballAttached = true;
        this.difficolta = 0;
        this.timer = 3500;

        //movimento
        this.cursor;
        this.cursor2;
        this.lastDirection = "fermo";
        this.lastLeft = false;
        this.lastRight = false;

        //mattoni
        this.bricks;
        this.mattoniTexture = ["brick","brick2"];
        this.mattoni = [];

        //punteggio
        this.score = 0;
        this.text_score;

        //pausa
        this.pulsanti_pausa = [];
        this.pausa = false;
        this.testo_pausa = null; 

        //velocità pallina
        this.velocitaX = 0;
        this.velocitaY = 0;
        
        //potenziamenti
        this.powerups = [];
        this.timerCannone = 0;
        this.timerPaddleGrande = 0;
        this.timerPaddleCorto = 0;
        this.ingrandimento = false;
        this.scudo = null;
        this.scudo2 = null;
        this.timerScudo = 0;
        this.timerComandiInvertiti = 0;

        //potenziamenti permanenti
        this.blocchiAlPotenziamento = 10;
        this.blocchiDistrutti = 9;
        this.text_blocchiAlPotenziamento;
        this.text_blocchiDistrutti;
        this.sbloccoPotenziamento = 0;
        this.riempimentoBlocchiDistrutti;
        this.barraBlocchiAlPotenziamento;

        this.pallaDiFuoco = false;
        this.timerPallaDiFuoco = 0;
        this.barraPallaDiFuoco = null;
        this.riempimentoPallaDiFuoco;
        this.pallaDiFuocoAttiva = false;
        this.durataPallaDiFuoco = 10;
        this.ballLastXPosition;
        this.ballLastYPosition;
        this.ballLastLastXPosition;
        this.ballLastLastYPosition;
        this.scia;

        this.proiettile = false;
        this.timerProiettile = 0;
        this.frequenzaProiettile = 600;

        this.moltDamage = 1;

        this.calamita = true;

        //Boss 
        this.bossNumber = 1;
        this.bossInCorso = false;
        this.punteggioPerBoss = 5000;
        this.timerAttacco = 0;
        this.attacks = [];
        this.healt = 3;
        this.bossHealt = 3;
        this.attackDuration = 0;
        this.attackNumber = 0;
        this.spider = null;
        this.currentBossSprite = null;
        this.currentBossAnimation = null;

    }

    preload() { //per caricare gli assets

        //immagini
        this.load.image('paddle', 'Assets/Images/paddle.png');
        this.load.image('ball', 'Assets/Images/ball.png');
        this.load.image('brick', 'Assets/Images/brick1.png');
        this.load.image('brick2', 'Assets/Images/brick 2.png');
        this.load.image('powerup', 'Assets/Images/powerup.png');
        this.load.image('powerdown', 'Assets/Images/powerdown.png');
        this.load.image('barraDiRiempimento', 'Assets/Images/barraFuoco.png');
        this.load.image('pallaDiFuoco', 'Assets/Images/pallaDiFuoco.png')
        this.load.image("projectile", "Assets/Images/projectile.png")
        this.load.image("heart", "Assets/Images/healt.png")
        this.load.image("bossProjectile", "Assets/Images/bossBullet.png")
        this.load.image("bossProjectileGood", "Assets/Images/bossBulletGood.png")
        this.load.image("spiderStill", "Assets/Images/boss1/spiderStill.png")
        this.load.image("spiderWalk", "Assets/Images/boss1/spiderWalk.png")
        this.load.image("spiderStill2", "Assets/Images/boss1/spiderStill_2.png");
        this.load.image("spiderWalk2", "Assets/Images/boss1/spiderWalk_2.png");
        this.load.image("spiderStill3", "Assets/Images/boss1/spiderStill_3.png");
        this.load.image("spiderWalk3", "Assets/Images/boss1/spiderWalk_3.png");
        this.load.image("spiderStill4", "Assets/Images/boss1/spiderStill_4.png");



        //Suoni
        this.load.audio("click", "Assets/Sound/click.wav")
        this.load.audio("hit", "Assets/Sound/hit.wav")
        this.load.audio("powerup", "Assets/Sound/powerup.wav")
        this.load.audio("pause", "Assets/Sound/pause.mp3")
        this.load.audio("unpause", "Assets/Sound/unpause.mp3")

        //musica
        this.load.audio("gioco", "Assets/Music/gioco.mp3")
    }

    create() { //setup degli oggetti e il loro comportamento

        //resetta array e variabili
        this.mattoni = []; 
        this.pulsanti_pausa = [];
        this.ballAttached = true;
        this.pausa = false;
        this.velocitaX = 0;
        this.velocitaY = 0;

        //fa partire la musica
        this.musica = this.sound.add("gioco");
        this.musica.loop = true;
        this.musica.play();

        //lo sprite viene creato alla posizione (900, 880) 
        //e gli vengono assegnate proprieta fisiche con "this.physics.add.sprite"
        this.paddle = this.physics.add.sprite(900, 880, 'paddle');
        this.paddle.setScale(1); //ridimensiona il paddle

        //il paddle viene impostato per collidere con i bordi dello schermo
        this.physics.world.setBounds(300, 0, 1320, 1080);
        this.paddle.setCollideWorldBounds(true);
        
        //viene impostato come immobile, cosi che non si sposta quando colpisce la pallina
        this.paddle.setImmovable(true);

        //questo oggetto permette al paddle di muoversi utlizzando le frecce
        this.cursor = this.input.keyboard.createCursorKeys();

        //questo oggetto permette al paddle di muoversi utlizzando "A" e "D"
        this.cursor2 = this.input.keyboard.addKeys(
            {
            right:Phaser.Input.Keyboard.KeyCodes.D,
            left:Phaser.Input.Keyboard.KeyCodes.A,
            }
        );

        //controlla se viene premuto il pulsante ESC (per la pausa)
        this.input.keyboard.on('keydown-ESC', () => {
            togglePause(this);
        });

        //controlla se viene premuto il pulsante SPACE (per la palla di fuoco)
        this.input.keyboard.on('keydown-SPACE', () => {
            attivaPallaDiFuoco(this);
        });

        //crea la scritta per il punteggio
        this.add.text(16, 16, 'PUNTEGGIO', { fontSize: '32px', fill: 'rgb(255,255,255)' }).setDepth(5);
        this.text_score = this.add.text(16, 40, '0', { fontSize: '32px', fill: 'rgb(255,255,255)' }).setDepth(5);

        this.text_blocchiAlPotenziamento = this.add.text(1790, 700, this.blocchiAlPotenziamento, { fontSize: '32px', fill: 'rgb(255,255,255)' }).setDepth(5).setOrigin(0.5, 0);        
        this.text_blocchiDistrutti = this.add.text(1790, 870, this.blocchiDistrutti, { fontSize: '32px', fill: 'rgb(255,255,255)' }).setDepth(6).setOrigin(0.5, 0);        

        //crea la pallina
        this.ball = this.physics.add.sprite(this.paddle.x,(this.paddle.y -40), 'ball');
        this.ball.setScale(1);
        this.ball.setBounce(1);

        this.ball.setCollideWorldBounds(true);

        //creiamo una collisione tra paddle e ball, .bind(this) serve a far si che this punti ancora a GameScene 
        this.physics.add.collider(this.paddle, this.ball, this.collisionePaddle.bind(this));


        this.bricks = this.physics.add.staticGroup();
        this.physics.add.collider(this.ball, this.bricks, (ball, bricks) => collisioneBlocco(this, ball, bricks)); //overlap permette di colpire più blocchi nello stesso frame

        for (let x = 0; x < 4; x++){
            generaBlocchi(this);
        }

        //testo per la pausa
        this.testo_pausa = this.add.text(960, 250, 'PAUSA', { fontSize: '75px', fill: 'rgb(255,255,255)' })
        .setOrigin(0.5, 0.5)
        .setDepth(11)
        .setAlpha(0);

        //pulsanti per il menu di pausa
        this.pulsanti_pausa.push(this.pulsante_riprendi = this.add.text(960, 450, 'RIPRENDI', { fontSize: '50px', fill: 'rgb(255,255,255)' }).setOrigin(0.5, 0.5)
        .on('pointerdown', () => {togglePause(this)}));
        this.pulsanti_pausa.push(this.pulsante_ricomincia = this.add.text(960, 550, 'RICOMINCIA', { fontSize: '50px', fill: 'rgb(255,255,255)' }).setOrigin(0.5, 0.5)
        .on('pointerdown', () => {this.sound.play("click");ricominciaClick(this)}));
        this.pulsanti_pausa.push(this.pulsante_menu = this.add.text(960, 650, 'TORNA AL MENU', { fontSize: '50px', fill: 'rgb(255,255,255)' }).setOrigin(0.5, 0.5)
        .on('pointerdown', () => {this.sound.play("click"); resettaGioco(this)}));


        this.pulsanti_pausa.forEach((pulsante) => {
            pulsante
            .disableInteractive()
            .setOrigin(0.5, 0.5)
            .on("pointerover", () => pulsantiSceltaOver(this, pulsante) )
            .on('pointerout', () => pulsantiSceltaOut(this, pulsante) )
            .setDepth(11)
            .setAlpha(0);
        });


        // bordi ai lati dello schermo
        this.borders = this.physics.add.staticGroup();

        // bordo sinistro
        let leftBorder = this.add.rectangle(150, 540, 300, 1080, 0x101010);
        this.physics.add.existing(leftBorder, true); //trasforma un oggetto in un corpo fisico

        // bordo destro
        let rightBorder = this.add.rectangle(1770, 540, 300, 1080, 0x101010);
        this.physics.add.existing(rightBorder, true);

        // aggiungi collisione con la pallina e i bordi
        this.physics.add.collider(this.ball, leftBorder);
        this.physics.add.collider(this.ball, rightBorder);
        this.physics.add.collider(this.paddle, leftBorder);
        this.physics.add.collider(this.paddle, rightBorder);
                
        //collisione paddle e powerup
        this.physics.add.collider(this.paddle, this.powerups, (paddle, powerup) => collisionePotenziamenti(this, paddle, powerup));

        //collisione paddle e attacchi boss
        this.physics.add.collider(this.paddle, this.attacks, (paddle, attack) => collisioneAttacco(this, paddle, attack));

        //barra per la palla di fuoco
        this.riempimentoPallaDiFuoco = this.add.rectangle(130, 860, 60, 125, 0xf55d42).setDepth(3).setOrigin(0.5, 1).setScale(1, 0);

        //barra potenziamenti permanenti
        this.riempimentoBlocchiDistrutti = this.add.rectangle(1790, 860, 60, 125, 0xebdb34).setDepth(3).setOrigin(0.5, 1).setScale(1, 0);
        this.barraBlocchiAlPotenziamento = this.physics.add.sprite(1790, 800, 'barraDiRiempimento');
        this.barraBlocchiAlPotenziamento.setScale(2).setDepth(5);

        //animazione boss1
        this.spider = this.physics.add.sprite(1000, 50, 'spiderStill').setScale(2).setVisible(false).setActive(false);;

        this.spider.anims.create({
            key: 'walkSpider',
            frames: [{ key: 'spiderStill' }, { key: 'spiderWalk' }],
            frameRate: 12,
            repeat: -1
        });
        this.spider.anims.create({
            key: 'walkSpider2',
            frames: [{ key: 'spiderStill2' }, { key: 'spiderWalk2' }],
            frameRate: 12,
            repeat: -1
        });
        this.spider.anims.create({
            key: 'walkSpider3',
            frames: [{ key: 'spiderStill3' }, { key: 'spiderWalk3' }],
            frameRate: 12,
            repeat: -1
        });


    }

    update() { //aggiorna lo stato del gioco ogni frame
        if (this.pausa == false) {
            //movimento giocatore
            if (this.lastLeft === undefined) this.lastLeft = false;
            if (this.lastRight === undefined) this.lastRight = false;

            // Lettura tasti attuali
            let leftDown = this.cursor.left.isDown || this.cursor2.left.isDown;
            let rightDown = this.cursor.right.isDown || this.cursor2.right.isDown;

            // Cambio direzione basato sull'ultimo tasto premuto
            if (leftDown && rightDown) {
                // Se entrambi premuti, controlliamo quale è stato premuto per ultimo
                if (!this.lastLeft && leftDown) {
                    // ultimo tasto premuto è sinistra
                    this.lastDirection = (this.timerComandiInvertiti > 0) ? 1 : -1;
                } else if (!this.lastRight && rightDown) {
                    // ultimo tasto premuto è destra
                    this.lastDirection = (this.timerComandiInvertiti > 0) ? -1 : 1;
                }
            } else if (leftDown) {
                this.lastDirection = (this.timerComandiInvertiti > 0) ? 1 : -1;
            } else if (rightDown) {
                this.lastDirection = (this.timerComandiInvertiti > 0) ? -1 : 1;
            } else {
                this.lastDirection = 0;
            }

            // Applica velocità
            this.paddle.setVelocityX(this.lastDirection * 700);

            // Aggiorna stato dei tasti per il prossimo frame
            this.lastLeft = leftDown;
            this.lastRight = rightDown;

            //depotenziamento comandi invvertiti
            if(this.timerComandiInvertiti > 0){
                this.timerComandiInvertiti--;
                if (this.timerComandiInvertiti == 0){
                    this.tweens.add({ //ruota il paddle
                        targets: this.paddle,
                        angle: 0,         // ruota fino a 0 gradi
                        duration: 200,      //per 200 millisecondi
                        ease: 'Linear'
                    });
                }
            }

            //lancio pallina
            if (this.ballAttached == true && (this.cursor.left.isDown || this.cursor2.left.isDown)) {
                this.ballAttached = false;
                let vX = Math.floor(Math.random() * 200);
                this.ball.setVelocity(-100 - vX, -Math.sqrt(300*300 - vX*vX));
            }

            if (this.ballAttached == true && (this.cursor.right.isDown || this.cursor2.right.isDown)) {
                this.ballAttached = false;
                let vX = Math.floor(Math.random() * 200);
                this.ball.setVelocity(100 + vX, -Math.sqrt(300*300 - vX*vX));
            }
            
            //generazione blocchi (ogni minuto)
            let generaNuoviBlocchi = 2000;
            if (this.timer > generaNuoviBlocchi) {
                generaBlocchi(this);
                this.timer = 0;
                if (this.mattoni.length != 0){ //riporta i mattoni alla posizione originale
                    this.mattoni.forEach((mattone) => {
                        mattone.x = 476 + mattone.posizione * 88;
                        mattone.refreshBody();
                    });
                }
            } else if (this.timer > (generaNuoviBlocchi-60) && (this.timer%2 == 1) ){ //per far tremare i blocchi prima di farli scendere
                if (this.mattoni.length != 0){
                    this.mattoni.forEach((mattone) => {
                        mattone.x += 3;
                        mattone.refreshBody();
                    });
                }
            } else if (this.timer > (generaNuoviBlocchi-60) && (this.timer%2 == 0)){
                if (this.mattoni.length != 0){
                    this.mattoni.forEach((mattone) => {
                        mattone.x -= 3;
                        mattone.refreshBody();
                    });
                }
            }
            
            
            //controllo se la pallina è attaccata al paddle prima di far andare il timer
            if (this.ballAttached == false && this.bossInCorso == false){ 
                this.timer++;
            }

            //per evitare che la pallina si blocchi a rimbalzare in orizzontale all'infinito
            if ((Math.abs(this.ball.body.velocity.y) < 70) && this.ballAttached == false){
                this.ball.setVelocityY(-80);
            }

        
            //muove i powerup verso il basso se ce ne sono
            if (this.powerups.length > 0){
                this.powerups.forEach((powerup) => {
                    powerup.y += 3
                    if (powerup.y > 1100){
                        powerup.destroy(); 
                    }
                    if(this.calamita == true && powerup.y > 750 && (Math.abs(powerup.x - this.paddle.x) < 120) && powerup.tipo != "paddleCorto" && powerup.tipo != "comandiInvertiti" && powerup.tipo != "piuBlocchi" && this.bossInCorso == false){
                        if ((powerup.x - this.paddle.x) <= -5){
                            if (powerup.y > 800){ //calamita più forte se sta per cadere giù il potenziamento
                                powerup.x += 5;
                            }
                            powerup.x += 5;
                        } else if ((powerup.x - this.paddle.x) >= 5){
                            if (powerup.y > 800){
                                powerup.x -= 5;
                            }
                            powerup.x -= 5;
                        } else {
                            powerup.x = this.paddle.x;
                        }
                    }
                })
            }

            // Attiva il potenziamento cannone
            if (this.ball.potenziamento == "cannone") {
                this.ball.potenziamento = "cannoneAttivo";
                this.ball.setPosition(this.paddle.x, this.paddle.y - 40);
                this.ball.setVelocity(0, -1500); 
            }

            if(this.ball.potenziamento == "cannoneAttivo" && this.ball.y <= 20){
                this.ball.setPosition(this.paddle.x, this.paddle.y - 40);
                this.ball.setVelocity(0, -1500); 
            }

            if (this.timerCannone == 0 && this.ball.potenziamento == "cannoneAttivo"){
                this.ball.potenziamento = null;
                this.ballAttached = true;
                this.ball.setVelocity(0,0);
                this.ball.setPosition(this.paddle.x, this.paddle.y - 40);
            }

            if (this.ball.potenziamento == "cannoneAttivo"){
                this.timerCannone -= 1;
            }

            //potenziamento paddle grande
            if (this.timerPaddleGrande > 0) {
                this.timerPaddleGrande--;
                
                if(this.timerPaddleGrande <= 40){
                    if(this.timerPaddleGrande%2 == 1){
                        this.paddle.setAlpha(0.5)
                    } else {
                        this.paddle.setAlpha(1)
                    }
                }

                if (this.timerPaddleGrande <= 0) {
                    this.paddle.setScale(1);
                    this.paddle.setAlpha(1)
                }
            }

            //depotenziamento paddle piccolo
            if (this.timerPaddleCorto > 0) {
                this.timerPaddleCorto--;
                
                if(this.timerPaddleCorto <= 40){
                    if(this.timerPaddleCorto%2 == 1){
                        this.paddle.setAlpha(0.5)
                    } else {
                        this.paddle.setAlpha(1)
                    }
                }

                if (this.timerPaddleCorto <= 0) {
                    this.paddle.setScale(1);
                    this.paddle.setAlpha(1)
                }
            }

            //potenziamento scudo
            if (this.timerScudo > 0) {
                this.timerScudo--;
                
                if(this.timerScudo <= 40){
                    if(this.timerScudo%2 == 1){
                        this.scudo.setAlpha(0.5)
                        this.scudo2.setAlpha(0.5)
                    } else {
                        this.scudo.setAlpha(1)
                        this.scudo2.setAlpha(1)
                    }
                } else if (this.timerScudo > 40 && this.ball.y >= 920){
                    this.timerScudo = 40;
                }
            } 
            if (this.timerScudo <= 0) {
                if (this.scudo) {
                    this.scudo.destroy();
                    this.scudo = null;
                }
                if (this.scudo2) {
                    this.scudo2.destroy();
                    this.scudo2 = null;
                }
            }

            //potenziamento palla di fuoco
            if(this.pallaDiFuoco == true){
                this.pallaDiFuoco = false;
                this.timerPallaDiFuoco = 3400;
                this.barraPallaDiFuoco = this.physics.add.sprite(130, 800, 'barraDiRiempimento');
                this.barraPallaDiFuoco.setScale(2).setDepth(5);
            }

            if (this.timerPallaDiFuoco < 3600 && this.barraPallaDiFuoco != null && this.pallaDiFuocoAttiva == false){
                this.riempimentoPallaDiFuoco.setScale(1, this.timerPallaDiFuoco/3600);
                this.timerPallaDiFuoco++;
            }

            if (this.pallaDiFuocoAttiva == true){
                this.riempimentoPallaDiFuoco.setScale(1, this.timerPallaDiFuoco/3600);
                this.timerPallaDiFuoco -= this.durataPallaDiFuoco;
                if(!(this.ball.x <= 340 || this.ball.x >= 1580 || this.ball.y <= 18 || this.ball.y >= (this.paddle.y -50))){
                    this.ball.setVelocity(this.velocitaX, this.velocitaY);
                } else {
                    this.velocitaX = this.ball.body.velocity.x;
                    this.velocitaY = this.ball.body.velocity.y;
                }

                if (this.timerPallaDiFuoco <= 0){
                    this.pallaDiFuocoAttiva = false;
                    this.ball.setTexture("ball");
                    this.barraPallaDiFuoco.x = 130;
                    this.scia.destroy();
                    this.scia2.destroy();
                }
                
                this.scia.setPosition(this.ballLastXPosition, this.ballLastYPosition);
                this.scia2.setPosition(this.ballLastLastXPosition, this.ballLastLastYPosition);
                this.ballLastLastXPosition = this.ballLastXPosition;
                this.ballLastLastYPosition = this.ballLastYPosition;
                this.ballLastXPosition = this.ball.x;
                this.ballLastYPosition = this.ball.y;
            }

            //potenziamento proiettile
            if (this.proiettile == true && this.bossInCorso == false){
                if (this.timerProiettile >= this.frequenzaProiettile){
                    this.projectile = this.physics.add.sprite(this.paddle.x,(this.paddle.y -40), 'projectile');
                    this.physics.add.collider(this.projectile, this.bricks, (projectile, brick) => { collisioneBlocco(this, projectile, brick); this.projectile.destroy();});
                    this.projectile.setVelocity(0, -500); 
                    this.timerProiettile = 0;
                }
                this.timerProiettile++;
            }


            //Boss
            bossCheck(this);
            
        } else {
            this.paddle.setVelocityX(0);
        }
    }

    

    collisionePaddle(){
        let speed = 650

        let diff = this.ball.x - this.paddle.x;
        let vX = speed * (diff / (this.paddle.width / 2));

        vX = Phaser.Math.Clamp(vX, -600, 600); //limita la velocita a un intervallo tra -450 e 450

        let vY = Math.sqrt(speed * speed - vX * vX);

        this.ball.setVelocity(vX, -vY);

    }

    






}