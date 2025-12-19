
import { collisioneBlocco } from "./Blocks.js";

export function potenziamentiPermanenti(scene){
    if(scene.sbloccoPotenziamento == 1){ //sblocca potenziamento palla di fuoco
        scene.pallaDiFuoco = true;
        scene.blocchiAlPotenziamento = 30;
    } else if (scene.sbloccoPotenziamento == 2){ //sblocca potenziamento proiettile
        scene.proiettile = true;
        scene.blocchiAlPotenziamento = 50;
    } else if (scene.sbloccoPotenziamento == 3){ // + danno
        scene.moltDamage += 1;
        scene.blocchiAlPotenziamento = 80;
    } else if (scene.sbloccoPotenziamento == 4){ //sblocca potenziamento calamita
        scene.calamita = true;
        scene.blocchiAlPotenziamento = 120;
    } else if (scene.sbloccoPotenziamento == 5){
        scene.durataPallaDiFuoco = 20; //la palla di fuoco dura il doppio
        scene.blocchiAlPotenziamento = 3;
    } else if (scene.sbloccoPotenziamento == 6){ //proiettile spara più frequentemente
        scene.frequenzaProiettile = 300;
        scene.blocchiAlPotenziamento = 150;
    } else if (scene.sbloccoPotenziamento >= 7){ // + danno
        scene.moltDamage += 1;
        if (scene.pallaDiFuocoAttiva == true){ 
            //la palla di fuoco ha piu danno della palla normale
            scene.blocchiAlPotenziamento = 100 * scene.moltDamage/20;
        } else{
            scene.blocchiAlPotenziamento = 100 * scene.moltDamage;
        }
    } 
}

export function attivaPallaDiFuoco(scene){ 
    if(scene.timerPallaDiFuoco >= 3600 && scene.ingrandimento == false && scene.timerCannone <= 0){
        scene.cameras.main.shake(3000, 0.001);
        scene.pallaDiFuocoAttiva = true;
        scene.oldMoltDamage = scene.moltDamage;
        scene.moltDamage = 20;
        scene.velocitaX = scene.ball.body.velocity.x;
        scene.velocitaY = scene.ball.body.velocity.y;
        scene.ballLastXPosition = scene.ball.x;
        scene.ballLastYPosition = scene.ball.y;
        scene.ballLastLastXPosition = scene.ballLastXPosition;
        scene.ballLastLastYPosition = scene.ballLastYPosition;
        scene.scia = scene.physics.add.sprite(scene.ballLastXPosition,scene.ballLastYPosition, 'pallaDiFuoco').setAlpha(0.3);
        scene.scia2 = scene.physics.add.sprite(scene.ballLastXPosition,scene.ballLastYPosition, 'pallaDiFuoco').setAlpha(0.3);
        scene.ball.setTexture("pallaDiFuoco");
    }
}

export function permanentPowerupCheck(scene){
    //potenziamento palla di fuoco
    if(scene.pallaDiFuoco == true){
        scene.pallaDiFuoco = false;
        scene.timerPallaDiFuoco = 3400;
        scene.barraPallaDiFuoco = scene.physics.add.sprite(130, 800, 'barraDiRiempimento');
        scene.barraPallaDiFuoco.setScale(0.5).setDepth(5);
    }

    if (scene.timerPallaDiFuoco < 3600 && scene.barraPallaDiFuoco != null && scene.pallaDiFuocoAttiva == false){
        scene.riempimentoPallaDiFuoco.setScale(1, scene.timerPallaDiFuoco/3600);
        scene.timerPallaDiFuoco++;
    }

    if (scene.pallaDiFuocoAttiva == true){
        scene.riempimentoPallaDiFuoco.setScale(1, scene.timerPallaDiFuoco/3600);
        scene.timerPallaDiFuoco -= scene.durataPallaDiFuoco;
        if(!(scene.ball.x <= 340 || scene.ball.x >= 1580 || scene.ball.y <= 18 || scene.ball.y >= (scene.paddle.y -50))){
            scene.ball.setVelocity(scene.velocitaX, scene.velocitaY);
        } else {
            scene.velocitaX = scene.ball.body.velocity.x;
            scene.velocitaY = scene.ball.body.velocity.y;
        }

        if (scene.timerPallaDiFuoco <= 0){
            scene.pallaDiFuocoAttiva = false;
            scene.ball.setTexture("ball");
            scene.barraPallaDiFuoco.x = 130;
            scene.scia.destroy();
            scene.scia2.destroy();
            scene.moltDamage = scene.oldMoltDamage;
        }
        
        scene.scia.setPosition(scene.ballLastXPosition, scene.ballLastYPosition);
        scene.scia2.setPosition(scene.ballLastLastXPosition, scene.ballLastLastYPosition);
        scene.ballLastLastXPosition = scene.ballLastXPosition;
        scene.ballLastLastYPosition = scene.ballLastYPosition;
        scene.ballLastXPosition = scene.ball.x;
        scene.ballLastYPosition = scene.ball.y;
    }

    //potenziamento proiettile
    if (scene.proiettile == true && scene.bossInCorso == false){
        if (scene.timerProiettile >= scene.frequenzaProiettile){
            scene.projectile = scene.physics.add.sprite(scene.paddle.x,(scene.paddle.y -40), 'projectile').setScale(2);
            scene.projectile.isNotBall = true;
            scene.physics.add.collider(scene.projectile, scene.bricks, (projectile, brick) => { collisioneBlocco(scene, projectile, brick); scene.projectile.destroy();});
            scene.projectile.setVelocity(0, -500); 
            scene.timerProiettile = 0;
        }
        scene.timerProiettile++;
    }
}


