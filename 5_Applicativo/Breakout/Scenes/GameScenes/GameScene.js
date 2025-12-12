
import * as SimplePowerups from "./SimplePowerups.js";
import * as PermanentPowerups from "./PermanentPowerups.js";
import * as Pause from "./PauseMenu.js";
import * as Boss from "./Boss.js";
import * as Blocks from "./Blocks.js";
import * as GameOver from "./GameOver.js";

import MenuScene from '../MenuScene.js';

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
        this.inputEnabled = true;

        //mattoni
        this.bricks;
        this.mattoniTexture = ["brick","brick2","brick3","brick4","brick5","brick6"];
        this.mattoni = [];

        //punteggio
        this.score = 0;
        this.text_score;
        this.punteggioSalvato;

        //pausa
        this.pulsanti_pausa = [];
        this.pausa = false;
        this.testo_pausa = null; 

        //gameover
        this.gameover = false;
        this.pulsanti_gameover = [];
        this.testo_pausa = null;
        this.inputText = ""; 

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
        this.blocchiAlPotenziamento = 15;
        this.blocchiDistrutti = 0;
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
        this.oldMoltDamage = 1;

        this.calamita = false;

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
        this.load.image('brick', 'Assets/Images/Bricks/brick1.png');
        this.load.image('brick2', 'Assets/Images/Bricks/brick2.png');
        this.load.image('brick3', 'Assets/Images/Bricks/brick3.png');
        this.load.image('brick4', 'Assets/Images/Bricks/brick4.png');
        this.load.image('brick5', 'Assets/Images/Bricks/brick5.png');
        this.load.image('brick6', 'Assets/Images/Bricks/brick6.png');
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
        this.load.audio("boss", "Assets/Music/boss.mp3")

        //text
        this.load.text("leaderboard", "Assets/leaderboard.txt")

    }

    create() { //setup degli oggetti e il loro comportamento

        //resetta array e variabili
        this.mattoni = []; 
        this.pulsanti_pausa = [];
        this.pulsanti_gameover = [];
        this.ballAttached = true;
        this.pausa = false;
        this.gameover = false;
        this.punteggioSalvato = false;
        this.velocitaX = 0;
        this.velocitaY = 0;
        this.score = 0;
        this.blocchiAlPotenziamento = 15;
        this.blocchiDistrutti = 0;
        this.sbloccoPotenziamento = 0;
        this.bossNumber = 1;
        this.bossInCorso = false;
        this.punteggioPerBoss = 5000;
        this.calamita = false;
        this.proiettile = false;

        //fa partire la musica
        this.musica = this.sound.add("gioco");
        this.musica.loop = true;
        this.musica.play();

        //lo sprite viene creato alla posizione (900, 880) 
        //e gli vengono assegnate proprieta fisiche con "this.physics.add.sprite"
        this.paddle = this.physics.add.sprite(945, 880, 'paddle');
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
            Pause.togglePause(this);
        });

        //controlla se viene premuto il pulsante SPACE (per la palla di fuoco)
        this.input.keyboard.on('keydown-SPACE', () => {
            PermanentPowerups.attivaPallaDiFuoco(this);
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
        this.physics.add.collider(this.ball, this.bricks, (ball, bricks) => Blocks.collisioneBlocco(this, ball, bricks)); //overlap permette di colpire più blocchi nello stesso frame

        for (let x = 0; x < 4; x++){
            Blocks.generaBlocchi(this);
        }

        //testo per la pausa
        this.testo_pausa = this.add.text(960, 250, 'PAUSA', { fontSize: '75px', fill: 'rgb(255,255,255)' })
        .setOrigin(0.5, 0.5)
        .setDepth(11)
        .setAlpha(0);

        //pulsanti per il menu di pausa
        this.pulsanti_pausa.push(this.pulsante_riprendi = this.add.text(960, 450, 'RIPRENDI', { fontSize: '50px', fill: 'rgb(255,255,255)' }).setOrigin(0.5, 0.5)
        .on('pointerdown', () => {Pause.togglePause(this)}));
        this.pulsanti_pausa.push(this.pulsante_ricomincia = this.add.text(960, 550, 'RICOMINCIA', { fontSize: '50px', fill: 'rgb(255,255,255)' }).setOrigin(0.5, 0.5)
        .on('pointerdown', () => {this.sound.play("click"); this.ricominciaClick(this)}));
        this.pulsanti_pausa.push(this.pulsante_menu = this.add.text(960, 650, 'TORNA AL MENU', { fontSize: '50px', fill: 'rgb(255,255,255)' }).setOrigin(0.5, 0.5)
        .on('pointerdown', () => {this.sound.play("click"); this.resettaGioco(this)}));


        this.pulsanti_pausa.forEach((pulsante) => {
            pulsante
            .disableInteractive()
            .setOrigin(0.5, 0.5)
            .on("pointerover", () => this.pulsantiSceltaOver(pulsante) )
            .on('pointerout', () => this.pulsantiSceltaOut(pulsante) )
            .setDepth(11)
            .setAlpha(0);
        });

        //testo per il gameover
        this.testo_gameover = this.add.text(960, 200, 'GAME OVER', { fontSize: '75px', fill: 'rgb(255,255,255)' })
        .setOrigin(0.5, 0.5)
        .setDepth(11)
        .setAlpha(0);
        this.testo_gameoverPunteggio = this.add.text(960, 280, 'PUNTEGGIO: ', { fontSize: '45px', fill: 'rgb(255,255,255)' })
        .setOrigin(0.5, 0.5)
        .setDepth(11)
        .setAlpha(0);

        //testo per inserire il nome del giocatore
        this.inputText = "";
        this.inputDisplay = this.add.text(960, 470, "NOME: ", {fontSize: "40px",color: "#ffffff"})
        .setOrigin(0.5, 0.5)
        .setDepth(11)
        .setAlpha(0);

        // cursore lampeggiante
        this.cursorVisible = true;
        this.cursorTimer = this.time.addEvent({
            delay: 500,
            callback: () => {
                if (this.gameover) { // lampeggia solo c'è il gameover
                    this.cursorVisible = !this.cursorVisible;
                    this.updateInputDisplay();
                }
            },
            loop: true
        });

        // Permette all'utente di scrivere il proprio nome
        this.input.keyboard.on("keydown", (event) => {
            if (this.gameover) { // solo se c'è il gameover
                this.handleTyping(event);
            }
        });

        //pulsanti per il menu di gameover
        this.pulsanti_gameover.push(this.pulsante_salvaPunteggio = this.add.text(960, 540, 'SALVA PUNTEGGIO', { fontSize: '50px', fill: 'rgb(255,255,255)' }).setOrigin(0.5, 0.5)
        .on('pointerdown', () => {GameOver.saveScore(this)}));
        this.pulsanti_gameover.push(this.pulsante_ricomincia = this.add.text(960, 700, 'RICOMINCIA', { fontSize: '50px', fill: 'rgb(255,255,255)' }).setOrigin(0.5, 0.5)
        .on('pointerdown', () => {this.sound.play("click"); this.ricominciaClick(this)}));
        this.pulsanti_gameover.push(this.pulsante_menu = this.add.text(960, 800, 'TORNA AL MENU', { fontSize: '50px', fill: 'rgb(255,255,255)' }).setOrigin(0.5, 0.5)
        .on('pointerdown', () => {this.sound.play("click"); this.resettaGioco(this)}));

        this.pulsanti_gameover.forEach((pulsante) => {
            pulsante
            .disableInteractive()
            .setOrigin(0.5, 0.5)
            .on("pointerover", () => this.pulsantiSceltaOver(pulsante) )
            .on('pointerout', () => this.pulsantiSceltaOut(pulsante) )
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

        //linea tratteggiata che segna il limite per i blocchi
        for(let x = -3; x <= 1870; x += 48){
            this.add.rectangle(300 + x, 3 + 30 * 22, 30, 5, 50).setOrigin(0, 0.5).setDepth(-1).setFillStyle(0x878787, 0.1);
        }

        // aggiungi collisione con la pallina e i bordi
        this.physics.add.collider(this.ball, leftBorder);
        this.physics.add.collider(this.ball, rightBorder);
        this.physics.add.collider(this.paddle, leftBorder);
        this.physics.add.collider(this.paddle, rightBorder);
                
        //collisione paddle e powerup
        this.physics.add.collider(this.paddle, this.powerups, (paddle, powerup) => SimplePowerups.collisionePotenziamenti(this, paddle, powerup));

        //collisione paddle e attacchi boss
        this.physics.add.collider(this.paddle, this.attacks, (paddle, attack) => Boss.collisioneAttacco(this, paddle, attack));

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
        if (this.pausa == false && this.gameover == false) {
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
            if(this.inputEnabled == true){
                this.paddle.setVelocityX(this.lastDirection * 700);
            }

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
            if (this.ballAttached == true && (this.cursor.left.isDown || this.cursor2.left.isDown) && this.inputEnabled == true) {
                this.ballAttached = false;
                let vX = Math.floor(Math.random() * 200);
                this.ball.setVelocity(-100 - vX, -Math.sqrt(300*300 - vX*vX));
            }

            if (this.ballAttached == true && (this.cursor.right.isDown || this.cursor2.right.isDown)&& this.inputEnabled == true) {
                this.ballAttached = false;
                let vX = Math.floor(Math.random() * 200);
                this.ball.setVelocity(100 + vX, -Math.sqrt(300*300 - vX*vX));
            }
            
            //controllo se la pallina è attaccata al paddle prima di far andare il timer
            if (this.ballAttached == false && this.bossInCorso == false){ 
                this.timer++;
            }

            //per evitare che la pallina si blocchi a rimbalzare in orizzontale all'infinito
            if ((Math.abs(this.ball.body.velocity.y) < 70) && this.ballAttached == false){
                this.ball.setVelocityY(-80);
            }

            //controlla se la pallina scende sotto al paddle
            if (this.ball.y > 1050){
                this.paddle.setPosition(950, 880);
                this.paddle.setVelocityX(0);
                this.blocchiDistrutti = 0;
                this.ball.potenziamento = null;
                this.ball.setVelocity(0,0);
                this.ballAttached = true;
                this.ball.setPosition(945, 840);
                this.text_blocchiDistrutti.setText(this.blocchiDistrutti);
                this.riempimentoBlocchiDistrutti.setScale(1, 0);

                this.inputEnabled = false; // variabile custom

                //lfa lampeggiare il paddle e impedisce l'input del giocatore
                this.tweens.add({
                    targets: this.paddle,
                    duration: 20,        
                    repeat: 20,           
                    yoyo: true,
                    alpha: { from: 1, to: 0.2 },  
                    onComplete: () => {
                        this.paddle.alpha = 1;
                        this.inputEnabled = true;
                    }
                });
            }

            //generazione blocchi
            Blocks.blockCheck(this);
        
            //powerup semplici
            SimplePowerups.simplePowerupCheck(this);

            //Powerup permanenti
            PermanentPowerups.permanentPowerupCheck(this);

            //Boss
            Boss.bossCheck(this);
            

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

    handleTyping(event) {
        const key = event.key;
    
        if (key === "Backspace") {
            this.inputText = this.inputText.slice(0, -1);
            this.updateInputDisplay();
            return;
        }
    
        // Blocca tasti speciali
        if (key.length > 1) return;
    
        // Aggiunge caratteri 
        if (this.inputText.length < 10) {
            this.inputText += key;
            this.updateInputDisplay();
        }
    }

    updateInputDisplay() {
        let cursorChar = this.cursorVisible ? "|" : " ";
        this.inputDisplay.setText("NOME: " + this.inputText + cursorChar);
    }


    pulsantiSceltaOver(pulsante){
        pulsante.setStyle({ fontSize: '55px', });
    }
    
    pulsantiSceltaOut(pulsante){
        pulsante.setStyle({ fontSize: '50px', });
    }
    
    ricominciaClick(){
        if (this.veil) {
            this.veil.destroy();
            this.veil = null;
        }
        this.scene.restart();
    }
    
    resettaGioco(){
         // Distrugge l'istanza del gioco
         this.game.destroy(true); 
    
         // Ricrea il gioco 
         const config = {
             type: Phaser.AUTO,
             width: 1920,
             height: 1030,
             backgroundColor: 'rgb(30,30,30)',
             scale: {
                mode: Phaser.Scale.FIT,  
                autoCenter: Phaser.Scale.CENTER_BOTH 
            },
             physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
             scene: [MenuScene, GameScene]
         };
    
         new Phaser.Game(config);
    }






}