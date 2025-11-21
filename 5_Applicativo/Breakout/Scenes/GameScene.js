import MenuScene from './MenuScene.js';

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

        //mattoni
        this.bricks;
        this.mattoniTexture = ["brick","brick2"];
        this.mattoni = [];

        //punteggio
        this.score = 4900;
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
        this.durataPallaDiFuoco = 20;
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
        this.load.image("heart", "Assets/Images/heart.png")
        this.load.image("bossProjectile", "Assets/Images/bossBullet.png")

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
            this.togglePause();
        });

        //controlla se viene premuto il pulsante SPACE (per la palla di fuoco)
        this.input.keyboard.on('keydown-SPACE', () => {
            this.attivaPallaDiFuoco();
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
        this.physics.add.collider(this.ball, this.bricks, this.collisioneBlocco.bind(this)); //overlap permette di colpire più blocchi nello stesso frame

        for (let x = 0; x < 4; x++){
            this.generaBlocchi();
        }

        //testo per la pausa
        this.testo_pausa = this.add.text(960, 250, 'PAUSA', { fontSize: '75px', fill: 'rgb(255,255,255)' })
        .setOrigin(0.5, 0.5)
        .setDepth(11)
        .setAlpha(0);

        //pulsanti per il menu di pausa
        this.pulsanti_pausa.push(this.pulsante_riprendi = this.add.text(960, 450, 'RIPRENDI', { fontSize: '50px', fill: 'rgb(255,255,255)' }).setOrigin(0.5, 0.5)
        .on('pointerdown', () => {this.togglePause()}));
        this.pulsanti_pausa.push(this.pulsante_ricomincia = this.add.text(960, 550, 'RICOMINCIA', { fontSize: '50px', fill: 'rgb(255,255,255)' }).setOrigin(0.5, 0.5)
        .on('pointerdown', () => {this.sound.play("click");this.ricominciaClick()}));
        this.pulsanti_pausa.push(this.pulsante_menu = this.add.text(960, 650, 'TORNA AL MENU', { fontSize: '50px', fill: 'rgb(255,255,255)' }).setOrigin(0.5, 0.5)
        .on('pointerdown', () => {this.sound.play("click"); this.resettaGioco()}));


        this.pulsanti_pausa.forEach((pulsante) => {
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

        // aggiungi collisione con la pallina e i bordi
        this.physics.add.collider(this.ball, leftBorder);
        this.physics.add.collider(this.ball, rightBorder);
        this.physics.add.collider(this.paddle, leftBorder);
        this.physics.add.collider(this.paddle, rightBorder);
                
        //collisione paddle e powerup
        this.physics.add.collider(this.paddle, this.powerups, this.collisionePotenziamenti.bind(this));

        //collisione paddle e attacchi boss
        this.physics.add.collider(this.paddle, this.attacks, this.collisioneAttacco.bind(this));

        //barra per la palla di fuoco
        this.riempimentoPallaDiFuoco = this.add.rectangle(130, 860, 60, 125, 0xf55d42).setDepth(3).setOrigin(0.5, 1).setScale(1, 0);

        //barra potenziamenti permanenti
        this.riempimentoBlocchiDistrutti = this.add.rectangle(1790, 860, 60, 125, 0xebdb34).setDepth(3).setOrigin(0.5, 1).setScale(1, 0);
        this.barraBlocchiAlPotenziamento = this.physics.add.sprite(1790, 800, 'barraDiRiempimento');
        this.barraBlocchiAlPotenziamento.setScale(2).setDepth(5);
    }

    update() { //aggiorna lo stato del gioco ogni frame
        if (this.pausa == false) {
            //movimento del giocatore
            if((this.cursor.left.isDown || this.cursor2.left.isDown)){ 
                if(this.timerComandiInvertiti > 0){ //se c'è il depotenziamento dei comandi invertiti, inverte la velocità
                    this.lastDirection = 1;
                } else {
                    this.lastDirection = -1;
                }
            } else if ((this.cursor.right.isDown || this.cursor2.right.isDown)){
                if(this.timerComandiInvertiti > 0){ //se c'è il depotenziamento dei comandi invertiti, inverte la velocità
                    this.lastDirection = -1;
                } else {
                    this.lastDirection = 1;
                }
            } else if ((this.cursor.right.isDown || this.cursor2.right.isDown) && (this.cursor.left.isDown || this.cursor2.left.isDown)){
                //se sia sinistra che destra sono premuti, lastDirection rimane uguale
            } else{
                //se nulla è premuto, si ferma
                this.lastDirection = 0;
            }

            if (this.lastDirection == -1) {
                this.paddle.setVelocityX(-700);
            } else if (this.lastDirection == 1) {
                this.paddle.setVelocityX(700);
            } else {
                this.paddle.setVelocityX(0);
            }

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
                this.generaBlocchi();
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
                    if(this.calamita == true && powerup.y > 750 && (Math.abs(powerup.x - this.paddle.x) < 120) && powerup.tipo != "paddleCorto" && powerup.tipo != "ComandiInvertiti" && powerup.tipo != "piuBlocchi" && this.bossInCorso == false){
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
                    this.physics.add.collider(this.projectile, this.bricks, (projectile, brick) => {this.collisioneBlocco(projectile, brick); this.projectile.destroy();});
                    this.projectile.setVelocity(0, -500); 
                    this.timerProiettile = 0;
                }
                this.timerProiettile++;
            }


            //Boss
            if (this.score >= this.punteggioPerBoss){
                this.boss();
            }

            if(this.bossInCorso == true){
                if (this.timerAttacco <= 0){
                    if (this.bossNumber == 1){
                        this.boss1();
                    }
                } 
                if (this.bossNumber == 1){
                    if(this.attackNumber == 1){
                        if (this.attacks.length > 0){
                            if (this.attackDuration >= 0){
                                this.attacks.forEach((attack) => {
                                    attack.setScale(this.attackDuration/800);
                                })
                            } else {
                                this.attacks.forEach((attack) => {
                                    attack.destroy();
                                })
                                this.attackNumber = 2;
                            }
                        }
                    }
                    if(this.attackNumber == 2){
                            if (this.attackDuration >= 0){
                                if(this.attackDuration % 15 == 0){
                                    let powerup = this.physics.add.sprite(800 + Math.random() * 1300, 50, 'powerup').setCollideWorldBounds(false);;
                                    powerup.tipo = "paddleLungo"; 
                                    this.powerups.push(powerup);
                                }
                            } else {
                                this.attackNumber = 1;
                            }    
                        }
                    }
                    if (this.powerups.length > 0){
                        this.powerups.forEach((powerup) => {
                            powerup.y += 4
                            powerup.x += -4
                            if (powerup.y > 1100){
                                powerup.destroy(); 
                            }
                        })
                    }
                }
                this.timerAttacco--;
                this.attackDuration--;
        } else {
            this.paddle.setVelocityX(0);
        }
    }

    attivaPallaDiFuoco(){
        if(this.timerPallaDiFuoco >= 3600 && this.ingrandimento == false){
            this.cameras.main.shake(3000, 0.001);
            this.pallaDiFuocoAttiva = true;
            this.velocitaX = this.ball.body.velocity.x;
            this.velocitaY = this.ball.body.velocity.y;
            this.ballLastXPosition = this.ball.x;
            this.ballLastYPosition = this.ball.y;
            this.ballLastLastXPosition = this.ballLastXPosition;
            this.ballLastLastYPosition = this.ballLastYPosition;
            this.scia = this.physics.add.sprite(this.ballLastXPosition,this.ballLastYPosition, 'pallaDiFuoco').setAlpha(0.3);
            this.scia2 = this.physics.add.sprite(this.ballLastXPosition,this.ballLastYPosition, 'pallaDiFuoco').setAlpha(0.3);
            this.ball.setTexture("pallaDiFuoco");
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

    collisioneBlocco(ball, brick){
        this.sound.play("hit");
        if (this.ball.potenziamento == "cannoneAttivo") {
            this.ball.setPosition(this.paddle.x, this.paddle.y - 40);
            this.ball.setVelocity(0, -1500);
        }
        if(this.ingrandimento == true){
            let punteggio = 0;
            this.ingrandimento = false;
            this.ball.setScale(1);
            brick.resistenza = 0;
            this.bricks.children.iterate((altroBlocco) => {
                if (!altroBlocco.active || altroBlocco === brick) return;
    
                const dx = Math.abs(altroBlocco.x - brick.x);
                const dy = Math.abs(altroBlocco.y - brick.y);
                
                // margine per considerare i blocchi vicini
                const distanzaX = brick.displayWidth + 2;
                const distanzaY = brick.displayHeight + 2;
    
                // Se il blocco è vicino (orizzontale, verticale o diagonale)
                if (dx <= distanzaX && dy <= distanzaY) {
                    punteggio += 10 * altroBlocco.resistenza;
                    this.blocchiDistrutti++;
                    altroBlocco.disableBody(true, true);
                }
            });
            this.score += punteggio;
        }
        brick.resistenza -= 1 * this.moltDamage;

        if (brick.resistenza <= 0){

            if (brick.resistenza < 0){ // se il blocco ha resistenza minore di 0, toglie i punti che verranno attribuiti dopo per gli strati distrutti
                this.score += 10 * brick.resistenza;
            }

            this.blocchiDistrutti++;
            let casuale = Math.random() * 100;
            if (casuale <= 20){
                this.generaPotenziamento(brick);
            }
            brick.disableBody(true, true); //rimuove il blocco
        } else {
            brick.setTexture(this.mattoniTexture[brick.resistenza - 1])
        }
        
        if (Math.abs(ball.body.velocity.y) < 800) { //aumenta la velocità quando colpisce un blocco
            ball.setVelocityY(ball.body.velocity.y * 1.05);
        }

        this.score += 10 * this.moltDamage;
        this.text_score.setText(this.score);

        if(this.blocchiDistrutti >= this.blocchiAlPotenziamento){ //Controllo quota per potenziamenti permanenti
            this.blocchiDistrutti -= this.blocchiAlPotenziamento;
            this.sbloccoPotenziamento++;
            this.potenziamentiPermanenti();
        }
        this.text_blocchiAlPotenziamento.setText(this.blocchiAlPotenziamento);
        this.text_blocchiDistrutti.setText(this.blocchiDistrutti);
        this.riempimentoBlocchiDistrutti.setScale(1, this.blocchiDistrutti/this.blocchiAlPotenziamento);
    }

    potenziamentiPermanenti(){
        if(this.sbloccoPotenziamento == 1){ //sblocca potenziamento palla di fuoco
            this.pallaDiFuoco = true;
            this.blocchiAlPotenziamento = 1;
        } else if (this.sbloccoPotenziamento == 2){ //sblocca potenziamento proiettile
            this.proiettile = true;
            this.blocchiAlPotenziamento = 2;
        } else if (this.sbloccoPotenziamento == 3){ // + danno
            this.moltDamage += 1;
            this.blocchiAlPotenziamento = 3;
        } else if (this.sbloccoPotenziamento == 4){ //sblocca potenziamento calamita
            this.calamita = true;
            this.blocchiAlPotenziamento = 3;
        } else if (this.sbloccoPotenziamento == 5){
            this.durataPallaDiFuoco = 10; //la palla di fuoco dura il doppio
            this.blocchiAlPotenziamento = 3;
        } else if (this.sbloccoPotenziamento == 6){ //proiettile spara più frequentemente
            this.frequenzaProiettile = 300;
            this.blocchiAlPotenziamento = 3;
        } else if (this.sbloccoPotenziamento >= 7){ // + danno
            this.moltDamage += 1;
            this.blocchiAlPotenziamento = 3 * this.moltDamage;
        } 
    }

    collisionePotenziamenti(paddle, powerup){
        this.sound.play("powerup");
        if (powerup.tipo == "ingrandimento" && this.pallaDiFuocoAttiva == false){
            this.ball.setScale(3);
            this.ingrandimento = true;
        } else if (powerup.tipo == "cannone"){
            this.timerCannone = 300;
            this.ball.potenziamento = "cannone";
        } else if (powerup.tipo == "paddleLungo"){
            this.timerPaddleGrande = 3000;
            this.timerPaddleCorto = 0;
            paddle.setScale(1.5,1);
        } else if (powerup.tipo == "scudo"){
            if (!this.scudo) { // se non esiste già uno scudo non ne crea uno nuovo, ma resetta il timer
                this.scudo = this.add.rectangle(960, 950, 1320, 20, 0x42ddf5);
                this.scudo2 = this.add.rectangle(960, 950, 1320, 16, 0xffffff);
                this.physics.add.existing(this.scudo, true);
                this.physics.add.existing(this.scudo2, true);
                this.timerScudo = 4000;

                // aggiungi collisione con la pallina e lo scudo
                this.physics.add.collider(this.ball, this.scudo);
            } else {
                this.timerScudo = 4000;
            }
            
        } else if (powerup.tipo == "paddleCorto"){
            this.timerPaddleCorto = 3000;
            this.timerPaddleGrande = 0;
            paddle.setScale(0.7,1);
        } else if (powerup.tipo == "piuBlocchi"){
            this.generaBlocchi();
            this.generaBlocchi();
        } else if (powerup.tipo == "comandiInvertiti"){
            this.timerComandiInvertiti = 400;
            this.tweens.add({ //ruota il paddle
                targets: this.paddle,
                angle: 180,         // ruota fino a 180 gradi
                duration: 200,      //per 800 millisecondi
                ease: 'Linear'
            });
        }
        powerup.destroy();
    }

    generaBlocchi(){
        if (this.mattoni.length != 0){
            this.mattoni.forEach((mattone) => {
                mattone.y += 30;
                mattone.refreshBody();
            });
        }
        if (this.difficolta == 0){
            for (let x = 0; x < 12; x++){
                let brick;
                let casuale = Math.random() * 100;

                //20% di probabilita che il blocco abbia 2 di resistenza
                if (casuale < 80){ 
                    brick = this.bricks.create(476 + x * 88, 15, "brick");
                    brick.resistenza = 1;
                } else {
                    brick = this.bricks.create(476 + x * 88, 15, "brick2");
                    brick.resistenza = 2;
                }
                
                brick.posizione = x; //mi segno la posizione originale nell'array del blocco
                brick.setScale(1);
                brick.refreshBody(); //per aggiornare la hitbox, serve per i corpi statici
                this.mattoni.push(brick);
            }
        }

    }

    generaPotenziamento(brick){
        let casuale = Math.random() * 100;
        let powerup = "";
        if (casuale <= 15){
            powerup = this.physics.add.sprite(brick.x, brick.y, 'powerup');
            powerup.tipo = "ingrandimento"; 
        } else if (casuale <= 30 && casuale > 15){
            powerup = this.physics.add.sprite(brick.x, brick.y, 'powerup');
            powerup.tipo = "cannone"; 
        } else if (casuale <= 45 && casuale > 30){
            powerup = this.physics.add.sprite(brick.x, brick.y, 'powerup');
            powerup.tipo = "paddleLungo"; 
        } else if (casuale <= 60 && casuale > 45){
            powerup = this.physics.add.sprite(brick.x, brick.y, 'powerup');
            powerup.tipo = "scudo"; 
        } else if (casuale <= 74 && casuale > 60){
            powerup = this.physics.add.sprite(brick.x, brick.y, 'powerdown');
            powerup.tipo = "paddleCorto"; 
        } else if (casuale <= 87 && casuale > 74){
            powerup = this.physics.add.sprite(brick.x, brick.y, 'powerdown');
            powerup.tipo = "piuBlocchi"; 
        } else if (casuale <= 100 && casuale > 87){
            powerup = this.physics.add.sprite(brick.x, brick.y, 'powerdown');
            powerup.tipo = "comandiInvertiti"; 
        }
        this.powerups.push(powerup);
        

    }

    boss(){
        this.bossInCorso = true;
        this.healt = 3;

        //disattiva tutti gli eventuali potenziamenti
        this.ingrandimento = false;
        this.timerCannone = 0;
        this.timerPaddleGrande = 0;
        this.timerPaddleCorto = 0;
        this.timerScudo = 0;
        this.timerComandiInvertiti = 0;
        this.timerPallaDiFuoco = 0;

        //distrugge tutti i blocchi
        if (this.mattoni.length != 0){
            this.mattoni.forEach((mattone) => {
                mattone.disableBody(true, true);
            });
        }

        //distrugge tutti i potenziamenti che stanno cadendo
        if (this.powerups.length > 0){
            this.powerups.forEach((powerup) => {
                powerup.destroy();
            })
        }

        //distrugge la palla
        this.ball.disableBody(true, true);

        if (this.bossNumber == 1){
            this.punteggioPerBoss = 12000;
            this.timerAttacco = 0;
            this.boss1();
        }


    }

    boss1(){
        if(this.attackNumber == 0){
            this.attackNumber = 1;
        } else if (this.attackNumber == 1){ //attacco palline da evitare
            this.attackDuration = 800;
            this.timerAttacco = 1000;
            for (let x = 0; x < 3; x++){
                let attack = this.physics.add.sprite(Math.random() * 900 + 350, 100, 'bossProjectile').setCollideWorldBounds(true).setBounce(1);
                let vX = Math.floor(Math.random() * 80);
                if (Math.random() * 2 < 0.5){
                    attack.setVelocity(-100 -vX, -Math.sqrt(300*300 - vX*vX));
                } else {
                    attack.setVelocity(100 + vX, -Math.sqrt(300*300 - vX*vX));
                }
                this.attacks.push(attack);
            }
        } else if (this.attackNumber == 2){ //attacco potenziamenti da evitare
            this.attackDuration = 1200;
            this.timerAttacco = 1500;
        }
    }

    collisioneAttacco(){

    }

    togglePause(){//attiva la pausa
        this.sound.play("pause"); 
        if (this.pausa == false){
            this.pausa = true;
            this.velocitaX = this.ball.body.velocity.x;
            this.velocitaY = this.ball.body.velocity.y;
            this.ball.setVelocity(0,0);
        } else {
            this.pausa = false;
            this.ball.setVelocity(this.velocitaX,this.velocitaY);
        }
        this.menuPausa();
    }

    menuPausa() {//menu di pausa

        //crea un velo per oscurare lo schermo
        if (!this.veil) {
            this.veil = this.add.graphics({ x: 0, y: 0 });
            this.veil.setDepth(10);
            this.veil.setScrollFactor(0);
        }
    
        this.veil.clear(); // rimuove il contenuto grafico del veil precedente
    
        if (this.pausa) {
            this.veil.fillStyle(0x000000, 0.5);
            this.testo_pausa.setAlpha(1).setInteractive();
            this.pulsanti_pausa.forEach((pulsante) => {
                pulsante
                .setAlpha(1)
                .setInteractive();
            });
        } else {
            this.sound.play("unpause"); 
            this.veil.fillStyle(0x000000, 0);
            this.pulsanti_pausa.forEach((pulsante) => {
                pulsante
                .setAlpha(0)
                .disableInteractive();
            });
            this.testo_pausa.setAlpha(0).disableInteractive();
        }
    
        this.veil.fillRect(0, 0, 1920, 1080);
    }

    pulsantiSceltaOver(pulsante){
        pulsante.setStyle({ fontSize: '55px', });
    }

    pulsantiSceltaOut(pulsante){
        pulsante.setStyle({ fontSize: '50px', });
    }

    ricominciaClick(){
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
             physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
             scene: [MenuScene, GameScene]
         };

         new Phaser.Game(config);
    }

}