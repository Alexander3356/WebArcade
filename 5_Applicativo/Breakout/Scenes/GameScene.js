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
        this.blocchiAlPotenziamento = 1;
        this.blocchiDistrutti = 0;
        this.text_blocchiAlPotenziamento;
        this.text_blocchiDistrutti;
        this.sbloccoPotenziamento = 0;
        this.pallaDiFuoco = false;
        this.timerPallaDiFuoco = 0;
        this.barraPallaDiFuoco = null;
        this.riempimentoPallaDiFuoco;
        this.pallaDiFuocoAttiva = false;

    }

    preload() { //per caricare gli assets

        //immagini
        this.load.image('paddle', 'Assets/Images/paddle.png');
        this.load.image('ball', 'Assets/Images/ball2.png');
        this.load.image('brick', 'Assets/Images/brick1.png');
        this.load.image('brick2', 'Assets/Images/brick 2.png');
        this.load.image('powerup', 'Assets/Images/powerup.png');
        this.load.image('powerdown', 'Assets/Images/powerdown.png');
        this.load.image('barraPallaDiFuoco', 'Assets/Images/barraFuoco.png');
        this.load.image('pallaDiFuoco', 'Assets/Images/pallaDiFuoco.png')

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

        this.text_blocchiAlPotenziamento = this.add.text(1800, 800, this.blocchiAlPotenziamento, { fontSize: '32px', fill: 'rgb(255,255,255)' }).setDepth(5);
        this.text_blocchiDistrutti = this.add.text(1800, 850, this.blocchiDistrutti, { fontSize: '32px', fill: 'rgb(255,255,255)' }).setDepth(5);

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

        //barra per la palla di fuoco
        this.riempimentoPallaDiFuoco = this.add.rectangle(130, 860, 65, 125, 0xf55d42).setDepth(3).setOrigin(0.5, 1).setScale(1, 0);;

    }

    update() { //aggiorna lo stato del gioco ogni frame
        if (this.pausa == false) {
            //movimento del giocatore
            if((this.cursor.left.isDown || this.cursor2.left.isDown)){ 
                if(this.timerComandiInvertiti > 0){ //se c'è il depotenziamento dei comandi invertiti, inverte la velocità
                    this.paddle.setVelocityX(500)
                } else {
                    this.paddle.setVelocityX(-500);
                }
            } else if ((this.cursor.right.isDown || this.cursor2.right.isDown)){
                if(this.timerComandiInvertiti > 0){ //se c'è il depotenziamento dei comandi invertiti, inverte la velocità
                    this.paddle.setVelocityX(-500)
                } else {
                    this.paddle.setVelocityX(500);
                }
            } else {
                this.paddle.setVelocityX(0);
            }

            //depotenziamento comandi invvertiti
            if(this.timerComandiInvertiti > 0){
                this.timerComandiInvertiti--;
                if (this.timerComandiInvertiti == 0){
                    this.paddle.flipY = false;
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

            if (this.timer > 3600) {
                this.generaBlocchi();
                this.timer = 0;
                if (this.mattoni.length != 0){ //riporta i mattoni alla posizione originale
                    this.mattoni.forEach((mattone) => {
                        mattone.x = 476 + mattone.posizione * 88;
                        mattone.refreshBody();
                    });
                }
            } else if (this.timer > 3540 && (this.timer%2 == 1) ){ //per far tremare i blocchi prima di farli scendere
                if (this.mattoni.length != 0){
                    this.mattoni.forEach((mattone) => {
                        mattone.x += 3;
                        mattone.refreshBody();
                    });
                }
            } else if (this.timer > 3540 && (this.timer%2 == 0)){
                if (this.mattoni.length != 0){
                    this.mattoni.forEach((mattone) => {
                        mattone.x -= 3;
                        mattone.refreshBody();
                    });
                }
            }
            
            
            //controllo se la pallina è attaccata al paddle prima di far andare il timer
            if (this.ballAttached == false){ 
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
                this.timerPallaDiFuoco = 1800;
                this.barraPallaDiFuoco = this.physics.add.sprite(130, 800, 'barraPallaDiFuoco');
                this.barraPallaDiFuoco.setScale(2).setDepth(5);
            }

            if (this.timerPallaDiFuoco <= 3600 && this.barraPallaDiFuoco != null && this.pallaDiFuocoAttiva == false){
                this.riempimentoPallaDiFuoco.setScale(1, this.timerPallaDiFuoco/3600);
                this.timerPallaDiFuoco++;
            }

            if (this.pallaDiFuocoAttiva == true){
                this.riempimentoPallaDiFuoco.setScale(1, this.timerPallaDiFuoco/3600);
                this.timerPallaDiFuoco -= 20;
                if(!(this.ball.x <= 340 || this.ball.x >= 1580 || this.ball.y <= 30 || this.ball.y >= (this.paddle.y -50))){
                    this.ball.setVelocity(this.velocitaX, this.velocitaY);
                } else {
                    this.velocitaX = this.ball.body.velocity.x;
                    this.velocitaY = this.ball.body.velocity.y;
                }
                if (this.timerPallaDiFuoco <= 0){
                    this.pallaDiFuocoAttiva = false;
                    this.ball.setTexture("ball");
                }
            }


        } else {
            this.paddle.setVelocityX(0);
        }
    }

    attivaPallaDiFuoco(){
        if(this.timerPallaDiFuoco >= 3600 && this.ingrandimento == false){
            this.pallaDiFuocoAttiva = true;
            this.velocitaX = this.ball.body.velocity.x;
            this.velocitaY = this.ball.body.velocity.y;
            this.ball.setTexture("pallaDiFuoco");
        }
    }

    collisionePaddle(){
        let speed = 500

        let diff = this.ball.x - this.paddle.x;
        let vX = speed * (diff / (this.paddle.width / 2));

        vX = Phaser.Math.Clamp(vX, -450, 450); //limita la velocita a un intervallo tra -300 e 300

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
        brick.resistenza -= 1;

        if (brick.resistenza <= 0){
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

        this.score += 10;
        this.text_score.setText(this.score);
        if(this.blocchiDistrutti >= this.blocchiAlPotenziamento){
            this.blocchiDistrutti -= this.blocchiAlPotenziamento;
            this.sbloccoPotenziamento++;
            this.potenziamentiPermanenti();
        }
        this.text_blocchiAlPotenziamento.setText(this.blocchiAlPotenziamento);
        this.text_blocchiDistrutti.setText(this.blocchiDistrutti);
    }

    potenziamentiPermanenti(){
        if(this.sbloccoPotenziamento == 1){
            this.pallaDiFuoco = true;
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
            this.paddle.flipY = true;
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