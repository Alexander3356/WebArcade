

class MenuScene extends Phaser.Scene { //menu di gioco
    constructor() {
        super({ key: 'MenuScene' });
        this.pulsanti = [];
        this.pulsanti_tutorial = [];
        this.text = [];
        this.conta = 0;
        this.first_time = true;
    }

    preload() { //per caricare gli assets
        this.load.image('tutorial1', 'Assets/Images/tutorial1.png');
        this.load.image('tutorial2', 'Assets/Images/tutorial2.png');
        this.load.image('tutorial3', 'Assets/Images/tutorial3.png');
        this.load.text("leaderboard", "Assets/leaderboard.txt")
    }

    create() {
        let colore_sfondo = 'rgb(45, 84, 112)'

        this.cameras.main.setBackgroundColor(colore_sfondo);

        // Variabili per gestire il delay e l'animazione dei pulsanti
        this.playHoverTimer = null;
        this.playFadeTween = null;
        

        //pulsanti
        this.pulsanti.push(this.playbutton = this.add.rectangle(960, 500, 1920, 80, 0xe1e810).setInteractive()
        .on('pointerdown', () => this.giocaClick())); 

        this.pulsanti.push(this.twoplayerbutton = this.add.rectangle(960, 600, 1920, 80, 0xe1e810).setInteractive());
        this.pulsanti.push(this.leaderboardbutton = this.add.rectangle(960, 700, 1920, 80, 0xe1e810).setInteractive()
        .on('pointerdown', () => this.leaderboardClick())); 

        this.pulsanti.push(this.exitbutton = this.add.rectangle(960, 800, 1920, 80, 0xe1e810).setInteractive());

        this.pulsanti.forEach((pulsante) => {
            pulsante.setOrigin(0.5, 0.5);

            //rende il pulsante invisibile ma non del tutto così può ancora essere rilevato dal mouse
            pulsante.setAlpha(0.001); 

            pulsante.setInteractive({ useHandCursor: true});
            pulsante.on('pointerover', () => this.buttonOver(pulsante) );
            pulsante.on('pointerout', () => this.buttonOut(pulsante));
        });
        

        //testo dei pulsanti
        this.text.push(this.add.text(960, 250, 'BREAKOUT', { fontSize: '70px', fill: 'rgb(0,0,0)' }));
        this.text.push(this.add.text(960, 500, 'GIOCA', { fontSize: '50px', fill: 'rgb(0,0,0)' }));
        this.text.push(this.add.text(960, 600, '2 GIOCATORI', { fontSize: '50px', fill: 'rgb(0,0,0)' }));
        this.text.push(this.add.text(960, 700, 'LEADERBOARD', { fontSize: '50px', fill: 'rgb(0,0,0)' }));
        this.text.push(this.add.text(960, 800, 'ESCI', { fontSize: '50px', fill: 'rgb(0,0,0)' }));

        //imposta tutti i testi al centro della pagina
        this.text.forEach((testo) => {
            testo.setOrigin(0.5, 0.5);
        });


    }

    giocaClick(){
        if (this.first_time == true){
            this.disabilitaPulsanti();
            this.add.text(960, 450, 'È LA PRIMA VOLTA CHE GIOCHI?', { fontSize: '50px', fill: 'rgb(0,0,0)' }).setOrigin(0.5, 0.5);

            //pulsanti di scelta
            let pulsante_si = this.add.text(500, 620, 'SÌ', { fontSize: '50px', fill: 'rgb(0,0,0)' }).setOrigin(0.5, 0.5)
            .setInteractive()
            .on("pointerover", () => this.pulsantiSceltaOver(pulsante_si) )
            .on('pointerout', () => this.pulsantiSceltaOut(pulsante_si) )
            .on('pointerdown', () => this.tutorial() );
            let pulsante_no = this.add.text(1420, 620, 'NO', { fontSize: '50px', fill: 'rgb(0,0,0)' }).setOrigin(0.5, 0.5)
            .setInteractive()
            .on("pointerover", () => this.pulsantiSceltaOver(pulsante_no) )
            .on('pointerout', () => this.pulsantiSceltaOut(pulsante_no) )
            .on('pointerdown', () => this.noClick() );
        } else {
            this.scene.start('GameScene');
        }
    }

    //disabilita i pulsanti del menu
    disabilitaPulsanti(){ 
        //disabilita animazioni di hover dei pulsanti
        if (this.playHoverTimer) {
            this.playHoverTimer.remove();
            this.playHoverTimer = null;
        }
        if (this.playFadeTween) {
            this.playFadeTween.stop();
            this.playFadeTween = null;
        }
        //disabilito i testi e i pulsanti
        for(let x = 1; x < 5; x++){
            this.text[x].setAlpha(0);
        }
        this.pulsanti.forEach((pulsante) => {
            pulsante.setAlpha(0);
            pulsante.disableInteractive();
        });
    }

    pulsantiSceltaOver(pulsante){
        pulsante.setStyle({ fontSize: '55px', });
    }

    pulsantiSceltaOut(pulsante){
        pulsante.setStyle({ fontSize: '50px', });
    }

    leaderboardClick(){
        this.text[0].setAlpha(0); //rende trasparente la scritta "BREAKOUT"
        this.disabilitaPulsanti();

        //legge il file da cache.text che è uno ogetto che contiene i file caricati
        let punteggi = this.cache.text.get('leaderboard'); 

        //salva i punteggi in un array, per ogni elemento dell'array rimuove anche eventuali carriage return
        //per evitare spazi maggiori tra punteggi quando verranno stampati
        let arrayPunteggi = punteggi.split("\n").map(riga => riga.replace("\r", ""));

        let text_punteggi = [];
        text_punteggi.push(this.add.text(960, 100, 'LEADERBOARD', { fontSize: '70px', fill: 'rgb(0,0,0)' }).setOrigin(0.5, 0.5));

        let conta = 0;
        arrayPunteggi.forEach((testo) => {
            text_punteggi.push(this.add.text(960, 200 + conta, testo, { fontSize: '50px', fill: 'rgb(0,0,0)' }).setOrigin(0.5, 0.5));
            conta += 70;
        });
    }

    noClick(){
        this.first_time = false;
        this.scene.start('GameScene');
    }

    tutorial(){
        this.conta = 0;
        this.pulsanti_tutorial = [];

        this.cameras.main.setBackgroundColor('rgb(0, 0, 0)');
        this.pulsanti_tutorial.push(this.tutorialButton1 = this.add.image(960, 500, "tutorial1"));
        this.pulsanti_tutorial.push(this.tutorialButton2 = this.add.image(960, 500, "tutorial2"));
        this.pulsanti_tutorial.push(this.tutorialButton3 = this.add.image(960, 500, "tutorial3"));

        this.pulsanti_tutorial.forEach((pulsante) => {
            pulsante.setInteractive();
            pulsante.on('pointerdown', () => this.skip()); 
            pulsante.setOrigin(0.5, 0.5);
            pulsante.setAlpha(0);
        });

        this.pulsanti_tutorial[this.conta].setAlpha(1);
    }

    skip(){
        if (this.conta >= 2){
            this.pulsanti_tutorial[this.conta].setAlpha(0);
            this.scene.start('GameScene');
        } else {
            this.pulsanti_tutorial[this.conta].setAlpha(0);
            this.conta++;
            this.pulsanti_tutorial[this.conta].setAlpha(1);
        }
    }

    buttonOver(pulsante){
        // Previene più timer o tween insieme
        if (this.playHoverTimer || this.playFadeTween) return;

        //animazione di hover dei pulsanti (fatto con AI)
        this.playHoverTimer = this.time.delayedCall(50, () => {
            this.playFadeTween = this.tweens.add({
                targets: pulsante,
                alpha: 1,
                duration: 50,
                ease: 'Linear',
                onComplete: () => {
                    this.playFadeTween = null; // pulizia
                }
            });
            this.playHoverTimer = null; // pulizia
        });
    }

    buttonOut(pulsante){

        //animazione di hover dei pulsanti (fatto con AI)
        if (this.playHoverTimer) {
            this.playHoverTimer.remove();
            this.playHoverTimer = null;
        }

        if (this.playFadeTween) { // Se sta facendo il fade-in, stoppa e resetta alpha
            this.playFadeTween.stop();
            this.playFadeTween = null;
        }
        
        this.tweens.add({ // Torna quasi invisibile subito
            targets: pulsante,
            alpha: 0.001,
            duration: 100,
            ease: 'Linear'
        });
    }

}




class GameScene extends Phaser.Scene { //il gioco principale

    constructor() {
        super({ key: 'GameScene' });
        this.paddle;
        this.ball;
        this.cursor;
        this.cursor2;
        this.ballAttached = true;
        this.difficolta = 0;
        this.timer = 3500;
        this.bricks;
        this.mattoniTexture = ["brick","brick2"];
        this.mattoni = [];
        this.score = 0;
        this.text_score;
        this.pulsanti_pausa = [];
        this.pausa = false;
        this.testo_pausa = null; 
        this.velocitaX = 0;
        this.velocitaY = 0;
    }

    preload() { //per caricare gli assets
        this.load.image('paddle', 'Assets/Images/paddle.png');
        this.load.image('ball', 'Assets/Images/ball.png');
        this.load.image('brick', 'Assets/Images/brick.png');
        this.load.image('brick2', 'Assets/Images/brick2.png');
    }

    create() { //setup degli oggetti e il loro comportamento

        //resetta array e variabili
        this.mattoni = []; 
        this.pulsanti_pausa = [];
        this.ballAttached = true;
        this.pausa = false;
        this.velocitaX = 0;
        this.velocitaY = 0;

        //lo sprite viene creato alla posizione (900, 150) 
        //e gli vengono assegnate proprieta fisiche con "this.physics.add.sprite"
        this.paddle = this.physics.add.sprite(900, 900, 'paddle');
        this.paddle.setScale(1); //ridimensiona il paddle

        //il paddle viene impostato per collidere con i bordi dello schermo
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

        //controlla se viene premuto il pulsante ESC
        this.input.keyboard.on('keydown-ESC', () => {
            this.togglePause();
        });

        //crea la scritta per il punteggio
        this.add.text(16, 16, 'PUNTI', { fontSize: '32px', fill: 'rgb(255,255,255)' });
        this.text_score = this.add.text(16, 40, '0', { fontSize: '32px', fill: 'rgb(255,255,255)' });

        this.ball = this.physics.add.sprite(this.paddle.x,(this.paddle.y -40), 'ball');
        this.ball.setScale(0.2);
        this.ball.setBounce(1);

        this.ball.setCollideWorldBounds(true);

        //creiamo una collisione tra paddle e ball, .bind(this) serve a far si che this punti ancora a GameScene 
        this.physics.add.collider(this.paddle, this.ball, this.collisionePaddle.bind(this));


        this.bricks = this.physics.add.staticGroup();
        this.physics.add.collider(this.ball, this.bricks, this.collisioneBlocco.bind(this));


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
        .on('pointerdown', () => this.togglePause()));
        this.pulsanti_pausa.push(this.pulsante_ricomincia = this.add.text(960, 550, 'RICOMINCIA', { fontSize: '50px', fill: 'rgb(255,255,255)' }).setOrigin(0.5, 0.5)
        .on('pointerdown', () => this.ricominciaClick()));
        this.pulsanti_pausa.push(this.pulsante_menu = this.add.text(960, 650, 'TORNA AL MENU', { fontSize: '50px', fill: 'rgb(255,255,255)' }).setOrigin(0.5, 0.5)
        .on('pointerdown', () => this.resettaGioco()));


        this.pulsanti_pausa.forEach((pulsante) => {
            pulsante
            .disableInteractive()
            .setOrigin(0.5, 0.5)
            .on("pointerover", () => this.pulsantiSceltaOver(pulsante) )
            .on('pointerout', () => this.pulsantiSceltaOut(pulsante) )
            .setDepth(11)
            .setAlpha(0);
        });



        //bordi

    }

    update() { //aggiorna lo stato del gioco ogni frame

        //movimento del giocatore
        if((this.cursor.left.isDown || this.cursor2.left.isDown) && this.pausa == false){ 
            this.paddle.setVelocityX(-300);
        } else if ((this.cursor.right.isDown || this.cursor2.right.isDown) && this.pausa == false){
            this.paddle.setVelocityX(300);
        } else {
            this.paddle.setVelocityX(0);
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
        if (this.pausa == false){
            if (this.timer > 3600) {
                this.generaBlocchi();
                this.timer = 0;
                if (this.mattoni.length != 0){ //riporta i mattoni alla posizione originale
                    this.mattoni.forEach((mattone) => {
                        mattone.x = 520 + mattone.posizione * 80;
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
        }
        
        //controllo se la pallina è attaccata al paddle prima di far andare il timer
        if (this.ballAttached == false && this.pausa == false){ 
            this.timer++;
        }

        //per evitare che la pallina si blocchi a rimbalzare in orizzontale all'infinito
        if ((Math.abs(this.ball.body.velocity.y) < 70) && this.ballAttached == false && this.pausa == false){
            this.ball.setVelocityY(-80);
        }
        
    }


    collisionePaddle(){
        let diff = this.ball.x - this.paddle.x;
        let vX = 300 * (diff / (this.paddle.width / 2));

        vX = Phaser.Math.Clamp(vX, -300, 300); //limita la velocita a un intervallo tra -300 e 300

        let vY = Math.sqrt(300 * 300 - vX * vX);
        
        if (Math.abs(this.ball.body.velocity.y) < 200){
            vY = 200;
        }

        this.ball.setVelocity(vX, -vY);

    }

    collisioneBlocco(ball, brick){
        brick.resistenza -= 1;

        if (brick.resistenza <= 0){
            brick.disableBody(true, true); //rimuove il blocco
        } else {
            brick.setTexture(this.mattoniTexture[brick.resistenza - 1])
        }

        if (ball.body.velocity.y < 300) { //aumenta la velocità quando colpisce un blocco
            ball.setVelocityY(ball.body.velocity.y + 10)
        } 

        this.score += 10;
        this.text_score.setText(this.score);
    }

    generaBlocchi(){
        
        if (this.mattoni.length != 0){
            this.mattoni.forEach((mattone) => {
                mattone.y += 25;
                mattone.refreshBody();
            });
        }
        if (this.difficolta == 0){
            for (let x = 0; x < 12; x++){
                let brick;
                let casuale = Math.random() * 100;

                //20% di probabilita che il blocco abbia 2 di resistenza
                if (casuale < 80){ 
                    brick = this.bricks.create(520 + x * 80, 15, "brick");
                    brick.resistenza = 1;
                } else {
                    brick = this.bricks.create(520 + x * 80, 15, "brick2");
                    brick.resistenza = 2;
                }
                
                brick.posizione = x; //mi segno la posizione originale nell'array del blocco
                brick.setScale(0.2);
                brick.refreshBody(); //per aggiornare la hitbox, serve per i corpi statici
                this.mattoni.push(brick);
            }
        }

    }

    togglePause(){//attiva la pausa
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


//qui viene creato l'oggetto "config" che contiene tutte le impostazioni del gioco
const config = {

    //
    type:Phaser.AUTO, 

    //altezza e larghezza del canvas del gioco
    width:1920,
    height:1030,

    backgroundColor: 'rgb(30,30,30)',

    //configurazione del motore fisico
    physics: {
        default: "arcade", // viene usato il sistema di fisica "arcade" (adatto a giochi 2d)
        arcade: {
            gravity: {y:0}, // nessuna gravita verticale (gli oggetti non cadranno)
            debug:false, //disabilita i contorni delle collisioni
        },
    },

    //scene del gioco
    scene: [MenuScene, GameScene],

};

//crea e avvia il gioco
const game = new Phaser.Game(config);