import { generaBlocchi } from "./Blocks.js";

export function generaPotenziamento(scene, brick){
    let casuale = Math.random() * 100;
    let powerup = "";
    if (casuale <= 15){
        powerup = scene.physics.add.sprite(brick.x, brick.y, 'powerup');
        powerup.tipo = "ingrandimento"; 
    } else if (casuale <= 30 && casuale > 15){
        powerup = scene.physics.add.sprite(brick.x, brick.y, 'powerup');
        powerup.tipo = "cannone"; 
    } else if (casuale <= 45 && casuale > 30){
        powerup = scene.physics.add.sprite(brick.x, brick.y, 'powerup');
        powerup.tipo = "paddleLungo"; 
    } else if (casuale <= 60 && casuale > 45){
        powerup = scene.physics.add.sprite(brick.x, brick.y, 'powerup');
        powerup.tipo = "scudo"; 
    } else if (casuale <= 74 && casuale > 60){
        powerup = scene.physics.add.sprite(brick.x, brick.y, 'powerdown');
        powerup.tipo = "paddleCorto"; 
    } else if (casuale <= 87 && casuale > 74){
        powerup = scene.physics.add.sprite(brick.x, brick.y, 'powerdown');
        powerup.tipo = "piuBlocchi"; 
    } else if (casuale <= 100 && casuale > 87){
        powerup = scene.physics.add.sprite(brick.x, brick.y, 'powerdown');
        powerup.tipo = "comandiInvertiti"; 
    }
    scene.powerups.push(powerup);
    
}

export function collisionePotenziamenti(scene, paddle, powerup){
    scene.sound.play("powerup");
    if (powerup.tipo == "ingrandimento" && scene.pallaDiFuocoAttiva == false){
        scene.ball.setScale(3);
        scene.ingrandimento = true;
    } else if (powerup.tipo == "cannone"){
        scene.timerCannone = 300;
        scene.ball.potenziamento = "cannone";
    } else if (powerup.tipo == "paddleLungo"){
        scene.timerPaddleGrande = 3000;
        scene.timerPaddleCorto = 0;
        paddle.setScale(1.5,1);
    } else if (powerup.tipo == "scudo"){
        if (!scene.scudo) { // se non esiste già uno scudo non ne crea uno nuovo, ma resetta il timer
            scene.scudo = scene.add.rectangle(960, 950, 1320, 20, 0x42ddf5);
            scene.scudo2 = scene.add.rectangle(960, 950, 1320, 16, 0xffffff);
            scene.physics.add.existing(scene.scudo, true);
            scene.physics.add.existing(scene.scudo2, true);
            scene.timerScudo = 4000;

            // aggiungi collisione con la pallina e lo scudo
            scene.physics.add.collider(scene.ball, scene.scudo);
        } else {
            scene.timerScudo = 4000;
        }
        
    } else if (powerup.tipo == "paddleCorto"){
        scene.timerPaddleCorto = 3000;
        scene.timerPaddleGrande = 0;
        paddle.setScale(0.7,1);
    } else if (powerup.tipo == "piuBlocchi"){
        generaBlocchi(scene);
        generaBlocchi(scene);
    } else if (powerup.tipo == "comandiInvertiti"){
        scene.timerComandiInvertiti = 400;
        scene.tweens.add({ //ruota il paddle
            targets: scene.paddle,
            angle: 180,         // ruota fino a 180 gradi
            duration: 200,      //per 800 millisecondi
            ease: 'Linear'
        });
    }
    powerup.destroy();
}