
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScenes/GameScene.js';


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