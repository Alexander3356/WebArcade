

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

    //adatta il gioco a diverse risoluzioni (il codice è costruito per una risoluzione fissa di 1920x1080)
    scale: {
        mode: Phaser.Scale.FIT,  
        autoCenter: Phaser.Scale.CENTER_BOTH 
    },

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
    fps: {
        target: 60,   // numero di frame al secondo desiderato
        forceSetTimeOut: true // opzione che forza l’uso di setTimeout per un framerate più stabile
    }

};

//crea e avvia il gioco
const game = new Phaser.Game(config);