
let paddle;
let cursor;
let cursor2;

    
function preload() { //per caricare gli assets
    this.load.image('paddle', 'Assets/Images/paddle.png');
    this.load.image('ball', 'Assets/Images/ball.png');
    this.load.image('brick', 'Assets/Images/brick.png');
}

function create() { //setup degli oggetti e il loro comportamento

    //lo sprite viene creato alla posizione (900, 150) 
    //e gli vengono assegnate proprieta fisiche con "this.physics.add.sprite"
    paddle = this.physics.add.sprite(900, 950, 'paddle');
    paddle.setScale(0.2); //ridimensiona il paddle

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
            debug:false, //disabilita i contorni delle collisioni
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