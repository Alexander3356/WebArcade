

export function togglePause(scene){//attiva la pausa
    scene.sound.play("pause"); 
    if (scene.pausa == false){
        scene.pausa = true;
        scene.velocitaX = scene.ball.body.velocity.x;
        scene.velocitaY = scene.ball.body.velocity.y;
        scene.ball.setVelocity(0,0);
    } else {
        scene.pausa = false;
        scene.ball.setVelocity(scene.velocitaX,scene.velocitaY);
    }
    menuPausa(scene);
}

export function menuPausa(scene) {//menu di pausa

    //crea un velo per oscurare lo schermo
    if (!scene.veil) {
        scene.veil = scene.add.graphics({ x: 0, y: 0 });
        scene.veil.setDepth(10);
        scene.veil.setScrollFactor(0);
    }

    scene.veil.clear(); // rimuove il contenuto grafico del veil precedente

    if (scene.pausa) { //Attiva i pulsanti di pausa
        scene.veil.fillStyle(0x000000, 0.5);
        scene.testo_pausa.setAlpha(1).setInteractive();
        scene.pulsanti_pausa.forEach((pulsante) => {
            pulsante
            .setAlpha(1)
            .setInteractive();
        });
    } else { //disattiva i pulsanti di pausa
        scene.sound.play("unpause"); 
        scene.veil.fillStyle(0x000000, 0);
        scene.pulsanti_pausa.forEach((pulsante) => {
            pulsante
            .setAlpha(0)
            .disableInteractive();
        });
        scene.testo_pausa.setAlpha(0).disableInteractive();
    }

    scene.veil.fillRect(0, 0, 1920, 1080);
}

