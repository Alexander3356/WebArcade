
let paddle;
let ball;
let cursor;
let cursor2;
let ballAttached = true;
let difficolta = 0;
let timer = 0;
let bricks;
let mattoniTexture = ["brick","brick2"];
let mattoni = [];

    
function preload() { //per caricare gli assets
    this.load.image('paddle', 'Assets/Images/paddle.png');
    this.load.image('ball', 'Assets/Images/ball.png');
    this.load.image('brick', 'Assets/Images/brick.png');
    this.load.image('brick2', 'Assets/Images/brick2.png');
}

function create() { //setup degli oggetti e il loro comportamento

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

    ball = this.physics.add.sprite(paddle.x,(paddle.y -40), 'ball');
    ball.setScale(0.2);
    ball.setBounce(1);

    ball.setCollideWorldBounds(true);
    this.physics.add.collider(paddle, ball, collisionePaddle);


    bricks = this.physics.add.staticGroup();
    this.physics.add.collider(ball, bricks, collisioneBlocco);


    for (let x = 0; x < 4; x++){
        generaBlocchi();
    }

    //bordi



}

function update(){ //aggiorna lo stato del gioco ogni frame

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
        generaBlocchi();
        timer = 0;
    }
    
    if (ballAttached == false){
        timer++;
    }

    //per evitare che la pallina si blocchi a rimbalzare in orizzontale all'infinito
    if ((Math.abs(ball.body.velocity.y) < 70) && ballAttached == false){
        ball.setVelocityY(-80);
    }
    
}

function collisionePaddle(){
    let diff = ball.x - paddle.x;
    let vX = 300 * (diff / (paddle.width / 2));

    vX = Phaser.Math.Clamp(vX, -300, 300); //limita la velocita a un intervallo tra -300 e 300

    let vY = Math.sqrt(300 * 300 - vX * vX);
    
    if (Math.abs(ball.body.velocity.y) < 100){
        vY = 100;
    }

    ball.setVelocity(vX, -vY);

}

function collisioneBlocco(ball, brick){
    brick.resistenza -= 1;

    if (brick.resistenza <= 0){
        brick.disableBody(true, true); //rimuove il blocco
    } else {
        brick.setTexture(mattoniTexture[brick.resistenza - 1])
    }

}

function generaBlocchi(){
    
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

            brick.setScale(0.2);
            brick.refreshBody(); //per aggiornare la hitbox, serve per i corpi statici
            mattoni.push(brick);
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

    //configurazione del motore fisico
    physics: {
        default: "arcade", // viene usato il sistema di fisica "arcade" (adatto a giochi 2d)
        arcade: {
            gravity: {y:0}, // nessuna gravita verticale (gli oggetti non cadranno)
            debug:true, //disabilita i contorni delle collisioni
        },
    },

    //specifica le funzioni da usare nei vari momenti di gioco,
    // (caricare le risorse, creare gli oggetti e aggiornare le posizioni degli oggetti)
    scene:{
        preload:preload, 
        create:create,
        update:update
    },

};

//crea e avvia il gioco
const game = new Phaser.Game(config);