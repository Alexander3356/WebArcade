
import { generaBlocchi } from "./Blocks.js";
import { gameOver } from "./GameOver.js";

export function bossCheck(scene){

    if (scene.score >= scene.punteggioPerBoss){
        boss(scene);
    }
    
    if (!scene.bossInCorso) return;

    if (scene.timerAttacco <= 0 && scene.bossHealt > 0){
        if (scene.bossNumber == 1){
            boss1(scene);
        }
    } 

    if (scene.bossNumber == 1){
        if((scene.attackNumber == 1 || scene.attackNumber == 3)){
            boss1Attack1(scene);
        } else if (scene.attackNumber == 2 && scene.bossHealt > 0){
            boss1Attack2(scene);
        } 
        if (scene.bossHealt <= 0){ //morte boss
            if (scene.spider.y >= 960){
                scene.spider.setVelocityY(0);
                scene.spider.setAlpha(scene.attackDuration/600);
                if(scene.attackDuration <= 0){
                    scene.bossInCorso = false;
                    scene.ballAttached = true;
                    scene.ball.enableBody(true, scene.paddle.x, (scene.paddle.y -40), true, true);
                    scene.healtPoints.forEach((healtPoint) => {
                        healtPoint.destroy();
                    })
                    for(let x = 0; x < 4; x++){
                        generaBlocchi(scene);
                    }
                }
            }

        }
        if (scene.powerups.length > 0){
            scene.powerups.forEach((powerup) => {
                powerup.y += 4
                powerup.x += -4
                if (powerup.y > 1100){
                    powerup.destroy(); 
                }
            })
        }
        if (Math.random() < 0.02 && scene.bossHealt > 0){ //movimento boss
            if (Math.random() < 0.5 && scene.spider.x <= 1200){
                scene.spider.setVelocityX(200);
                scene.spider.play(scene.currentBossAnimation,true);
                scene.time.delayedCall(1200, () => {
                    scene.spider.setVelocityX(0);
                    scene.spider.stop();
                    scene.spider.setTexture(scene.currentBossSprite);
                });
            } else {
                if (scene.spider.x >= 700){
                    scene.spider.setVelocityX(-200);
                    scene.spider.play(scene.currentBossAnimation,true);
                    scene.time.delayedCall(1200, () => {
                        scene.spider.setVelocityX(0);
                        scene.spider.stop();
                        scene.spider.setTexture(scene.currentBossSprite);
                    });
                }
            }
        }
        

    }

    scene.timerAttacco--;
    scene.attackDuration--;
}

export function boss(scene){
    scene.bossInCorso = true;

    //vita giocatore
    scene.healt = 3;
    scene.healtPoints = [];
    for (let x = 0; x < scene.healt; x++){
        let heart = scene.physics.add.sprite(1700 + 60 * x, 50, 'heart').setScale(0.07);
        scene.healtPoints.push(heart)
    }

    scene.bossHealt = 3;
    scene.currentBossSprite = "spiderStill";
    scene.currentBossAnimation = "walkSpider";

    //disattiva tutti gli eventuali potenziamenti
    scene.ingrandimento = false;
    scene.timerCannone = 0;
    scene.timerPaddleGrande = 0;
    scene.timerPaddleCorto = 0;
    scene.timerScudo = 0;
    scene.timerComandiInvertiti = 0;
    scene.timerPallaDiFuoco = 0;

    //distrugge tutti i blocchi
    if (scene.mattoni.length != 0){
        scene.mattoni.forEach((mattone) => {
            mattone.disableBody(true, true);
        });
    }

    //distrugge tutti i potenziamenti che stanno cadendo
    if (scene.powerups.length > 0){
        scene.powerups.forEach((powerup) => {
            powerup.destroy();
        })
    }

    //distrugge la palla
    scene.ball.disableBody(true, true);

    if (scene.bossNumber == 1){
        scene.punteggioPerBoss = 99999999;
        scene.timerAttacco = 0;
        boss1(scene);
    }

    //fa partire la musica del boss 
    scene.tweens.add({ // Fade out della musica attuale
        targets: scene.musica,
        volume: 0,
        duration: 800,
        onComplete: () => {
            scene.musica.stop();

            // musica del boss
            scene.musica = scene.sound.add("boss", { loop: true, volume: 0 });
            scene.musica.play();

            // Fade in della nuova musica
            scene.tweens.add({
                targets: scene.musica,
                volume: 1,
                duration: 800
            });
        }
    });

}

export function boss1(scene){
    if(scene.attackNumber == 0){
        scene.attackNumber = 1;
        scene.lastAttackNumber = 1;
        scene.timerAttacco = 200;
        scene.spider.setVisible(true).setActive(true);
    } else if (scene.attackNumber == 1 || scene.attackNumber == 3){ //attacco palline da evitare
        scene.attackDuration = 700;
        scene.timerAttacco = 900;
        for (let x = 0; x < 3; x++){
            let attack = null;
            if(scene.spider.x <= 900){
                attack = scene.physics.add.sprite(scene.spider.x + Math.random() * 100, 100, 'bossProjectile').setCollideWorldBounds(true).setBounce(1);
            } else {
                attack = scene.physics.add.sprite(scene.spider.x - Math.random() * 100, 100, 'bossProjectile').setCollideWorldBounds(true).setBounce(1);
            }

            let vX = Math.floor(Math.random() * 200);
            if (Math.random() < 0.5){
                attack.setVelocity(-100 -vX, -Math.sqrt(300*300 - vX*vX)*1.5);
            } else {
                attack.setVelocity(100 + vX, -Math.sqrt(300*300 - vX*vX)*1.5);
            }

            if(scene.attackNumber == 3 && x == 0){ //rende uno degli attacchi buoni
                attack.setTexture("bossProjectileGood");
                attack.isGood = true;
                attack.setVelocityY(attack.body.velocity.y * 1.80);
            }

            scene.attacks.push(attack);
        }
    } else if (scene.attackNumber == 2){ //attacco potenziamenti da evitare
        scene.attackDuration = 600;
        scene.timerAttacco = 800;
        if(scene.timerPaddleGrande > 0){
            scene.timerPaddleGrande = 40;
        }
    } 
}

export function boss1Attack1(scene){
    if (scene.attacks.length > 0){
        if (scene.attackDuration >= 0){
            scene.attacks.forEach((attack) => {
                attack.setScale(scene.attackDuration/700);
                if(attack.isGood == true && attack.hit == true && attack.y <= 100){
                    attack.destroy();
                    attack.hit = false;
                    if (scene.bossHealt == 2){
                        scene.currentBossAnimation = "walkSpider2";
                        scene.currentBossSprite = "spiderStill2";
                        scene.spider.stop();
                        scene.spider.setVelocityX(0);
                        scene.spider.setTexture("spiderStill2");
                    } else if (scene.bossHealt == 1){
                        scene.currentBossAnimation = "walkSpider3";
                        scene.currentBossSprite = "spiderStill3";
                        scene.spider.stop();
                        scene.spider.setVelocityX(0);
                        scene.spider.setTexture("spiderStill3");
                    } else if (scene.bossHealt == 0){
                        scene.currentBossSprite = "spiderStill4"; 
                        scene.spider.stop();
                        scene.spider.setVelocityX(0);
                        scene.spider.setTexture("spiderStill4");        
                        scene.spider.setVelocityY(700);        
                        scene.attackDuration = 600; 
                        scene.attacks.forEach((attack) => {
                            attack.destroy();
                        })
                        //fa partire la musica principale
                        scene.tweens.add({ // Fade out della musica attuale
                            targets: scene.musica,
                            volume: 0,
                            duration: 5000,
                            onComplete: () => {
                                scene.musica.stop();

                                // musica del gioco
                                scene.musica = scene.sound.add("gioco", { loop: true, volume: 0 });
                                scene.musica.play();

                                // Fade in della nuova musica
                                scene.tweens.add({
                                    targets: scene.musica,
                                    volume: 1,
                                    duration: 800
                                });
                            }
                        }); 
                    }
                }
            })
        } else {
            scene.attacks.forEach((attack) => {
                attack.destroy();
            })
            scene.lastAttackNumber = scene.attackNumber;
            scene.attackNumber = 2;
        }
    }
}

export function boss1Attack2(scene){
    if (scene.attackDuration >= 0){
        if(scene.attackDuration % 15 == 0){
            let powerup = scene.physics.add.sprite(800 + Math.random() * 1300, 50, 'powerup').setCollideWorldBounds(false);;
            powerup.tipo = "paddleLungo"; 
            scene.powerups.push(powerup);
        }
    } else {
        if (scene.lastAttackNumber == 3){
            scene.attackNumber = 1;
        } else {
            scene.attackNumber = 3;
        }
    }    
}



export function collisioneAttacco(scene, paddle, attack){
    if(attack.isGood == true){
        attack.hit = true;
        scene.bossHealt--;
         // Calcola la distanza tra il proiettile e il boss
        let dx = scene.spider.x - attack.x;
        let dy = scene.spider.y - attack.y;

        // Imposta la velocità lungo x e y in modo proporzionale alla distanza
        let speed = 1200; // puoi cambiare la velocità
        let magnitude = Math.sqrt(dx*dx + dy*dy);
        let vx = (dx / magnitude) * speed;
        let vy = (dy / magnitude) * speed;

        attack.setVelocity(vx, vy);
    } else {
        scene.healt--;
        scene.healtPoints[scene.healt].destroy();
        attack.destroy();
        if(scene.healt <= 0){
            gameOver(scene);
        }
    }
    
}