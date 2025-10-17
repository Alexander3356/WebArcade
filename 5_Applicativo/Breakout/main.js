
let paddle;
let ball;
let cursor;
let cursor2;
let ballAttached = true;
let difficolta = 0;
let timer = 3500;
let bricks;
let mattoniTexture = ["brick","brick2"];
let mattoni = [];
let score = 0;
let text_score;



class MenuScene extends Phaser.Scene { //menu di gioco
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        let colore_sfondo = 'rgb(45, 84, 112)'

        this.cameras.main.setBackgroundColor(colore_sfondo);

        // Variabili per gestire il delay e l'animazione dei pulsanti
        this.playHoverTimer = null;
        this.playFadeTween = null;
        

        //pulsanti
        let pulsanti = [];
        pulsanti.push(this.playbutton = this.add.rectangle(960, 500, 1920, 80, 0xe1e810).setInteractive()
        .on('pointerdown', () => this.giocaClick())); //pulsante gioca

        pulsanti.push(this.twoplayerbutton = this.add.rectangle(960, 600, 1920, 80, 0xe1e810).setInteractive());
        pulsanti.push(this.leaderboardbutton = this.add.rectangle(960, 700, 1920, 80, 0xe1e810).setInteractive());
        pulsanti.push(this.exitbutton = this.add.rectangle(960, 800, 1920, 80, 0xe1e810).setInteractive());

        pulsanti.forEach((pulsante) => {
            pulsante.setOrigin(0.5, 0.5);

            //rende il pulsante invisibile ma non del tutto così può ancora essere rilevato dal mouse
            pulsante.setAlpha(0.001); 

            pulsante.setInteractive({ useHandCursor: true});
            pulsante.on('pointerover', () => this.buttonOver(pulsante) );
            pulsante.on('pointerout', () => this.buttonOut(pulsante));
        });
        

        //testo dei pulsanti
        let text = [];
        text.push(this.add.text(960, 250, 'BREAKOUT', { fontSize: '70px', fill: 'rgb(0,0,0)' }));
        text.push(this.add.text(960, 500, 'GIOCA', { fontSize: '50px', fill: 'rgb(0,0,0)' }));
        text.push(this.add.text(960, 600, '2 GIOCATORI', { fontSize: '50px', fill: 'rgb(0,0,0)' }));
        text.push(this.add.text(960, 700, 'LEADERBOARD', { fontSize: '50px', fill: 'rgb(0,0,0)' }));
        text.push(this.add.text(960, 800, 'ESCI', { fontSize: '50px', fill: 'rgb(0,0,0)' }));

        //imposta tutti i testi al centro della pagina
        text.forEach((testo) => {
            testo.setOrigin(0.5, 0.5);
        });


    }

    giocaClick(){
        this.scene.start('GameScene');
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
    }

    preload() { //per caricare gli assets
        this.load.image('paddle', 'Assets/Images/paddle.png');
        this.load.image('ball', 'Assets/Images/ball.png');
        this.load.image('brick', 'Assets/Images/brick.png');
        this.load.image('brick2', 'Assets/Images/brick2.png');
    }

    create() { //setup degli oggetti e il loro comportamento

        //lo sprite viene creato alla posizione (900, 150) 
        //e gli vengono assegnate proprieta fisiche con "this.physics.add.sprite"
        paddle = this.physics.add.sprite(900, 900, 'paddle');
        paddle.setScale(1); //ridimensiona il paddle

        //il paddle viene impostato per collidere con i bordi dello schermo
        paddle.setCollideWorldBounds(true);
        
        //viene impostato come immobile, cosi che non si sposta quando colpisce la pallina
        paddle.setImmovable(true);

        //questo oggetto permette al paddle di muoversi utlizzando le frecce
        cursor = this.input.keyboard.createCursorKeys();

        //questo oggetto permette al paddle di muoversi utlizzando "A" e "D"
        cursor2 = this.input.keyboard.addKeys(
            {
            right:Phaser.Input.Keyboard.KeyCodes.D,
            left:Phaser.Input.Keyboard.KeyCodes.A
            }
        );

        //crea la scritta per il punteggio
        this.add.text(16, 16, 'PUNTI', { fontSize: '32px', fill: 'rgb(255,255,255)' });
        text_score = this.add.text(16, 40, '0', { fontSize: '32px', fill: 'rgb(255,255,255)' });

        ball = this.physics.add.sprite(paddle.x,(paddle.y -40), 'ball');
        ball.setScale(0.2);
        ball.setBounce(1);

        ball.setCollideWorldBounds(true);
        this.physics.add.collider(paddle, ball, this.collisionePaddle);


        bricks = this.physics.add.staticGroup();
        this.physics.add.collider(ball, bricks, this.collisioneBlocco);


        for (let x = 0; x < 4; x++){
            this.generaBlocchi();
        }

        //bordi

    }

    update() { //aggiorna lo stato del gioco ogni frame

        //movimento del giocatore
        if(cursor.left.isDown || cursor2.left.isDown){ 
            paddle.setVelocityX(-300);
        } else if (cursor.right.isDown || cursor2.right.isDown){
            paddle.setVelocityX(300);
        } else {
            paddle.setVelocityX(0);
        }

        //lancio pallina
        if (ballAttached == true && (cursor.left.isDown || cursor2.left.isDown)) {
            ballAttached = false;
            let vX = Math.floor(Math.random() * 200);
            ball.setVelocity(-100 - vX, -Math.sqrt(300*300 - vX*vX));
        }

        if (ballAttached == true && (cursor.right.isDown || cursor2.right.isDown)) {
            ballAttached = false;
            let vX = Math.floor(Math.random() * 200);
            ball.setVelocity(100 + vX, -Math.sqrt(300*300 - vX*vX));
        }
        
        //generazione blocchi (ogni minuto)
        if (timer > 3600) {
            this.generaBlocchi();
            timer = 0;
            if (mattoni.length != 0){ //riposrta i mattoni alla posizione originale
                mattoni.forEach((mattone) => {
                    mattone.x = 520 + mattone.posizione * 80;
                    mattone.refreshBody();
                });
            }
        } else if (timer > 3540 && (timer%2 == 1)){ //per far tremare i blocchi prima di farli scendere
            if (mattoni.length != 0){
                mattoni.forEach((mattone) => {
                    mattone.x += 3;
                    mattone.refreshBody();
                });
            }
        } else if (timer > 3540 && (timer%2 == 0)){
            if (mattoni.length != 0){
                mattoni.forEach((mattone) => {
                    mattone.x -= 3;
                    mattone.refreshBody();
                });
            }
        }
        
        if (ballAttached == false){ //controllo se la pallina è attaccata al paddle prima di far andare il timer
            timer++;
        }

        //per evitare che la pallina si blocchi a rimbalzare in orizzontale all'infinito
        if ((Math.abs(ball.body.velocity.y) < 70) && ballAttached == false){
            ball.setVelocityY(-80);
        }
        
    }


    collisionePaddle(){
        let diff = ball.x - paddle.x;
        let vX = 300 * (diff / (paddle.width / 2));

        vX = Phaser.Math.Clamp(vX, -300, 300); //limita la velocita a un intervallo tra -300 e 300

        let vY = Math.sqrt(300 * 300 - vX * vX);
        
        if (Math.abs(ball.body.velocity.y) < 200){
            vY = 200;
        }

        ball.setVelocity(vX, -vY);

    }

    collisioneBlocco(ball, brick){
        brick.resistenza -= 1;

        if (brick.resistenza <= 0){
            brick.disableBody(true, true); //rimuove il blocco
        } else {
            brick.setTexture(mattoniTexture[brick.resistenza - 1])
        }

        if (ball.body.velocity.y < 300) { //aumenta la velocità quando colpisce un blocco
            ball.setVelocityY(ball.body.velocity.y + 10)
        } 

        score += 10;
        text_score.setText(score);
        

    }

    generaBlocchi(){
        
        if (mattoni.length != 0){
            mattoni.forEach((mattone) => {
                mattone.y += 25;
                mattone.refreshBody();
            });
        }
        if (difficolta == 0){
            for (let x = 0; x < 12; x++){
                let brick;
                let casuale = Math.random() * 100;

                //20% di probabilita che il blocco abbia 2 di resistenza
                if (casuale < 80){ 
                    brick = bricks.create(520 + x * 80, 15, "brick");
                    brick.resistenza = 1;
                } else {
                    brick = bricks.create(520 + x * 80, 15, "brick2");
                    brick.resistenza = 2;
                }
                
                brick.posizione = x; //mi segno la posizione originale nell'array del blocco
                brick.setScale(0.2);
                brick.refreshBody(); //per aggiornare la hitbox, serve per i corpi statici
                mattoni.push(brick);
            }
        }

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
            debug:true, //disabilita i contorni delle collisioni
        },
    },

    //scene del gioco
    scene: [MenuScene, GameScene],

};

//crea e avvia il gioco
const game = new Phaser.Game(config);