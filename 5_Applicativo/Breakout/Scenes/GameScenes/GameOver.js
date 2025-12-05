

export function gameOver(scene){

    scene.gameover = true;
    scene.velocitaX = scene.ball.body.velocity.x;
    scene.velocitaY = scene.ball.body.velocity.y;
    scene.ball.setVelocity(0,0);


     //crea un velo per oscurare lo schermo
    if (!scene.veil) {
        scene.veil = scene.add.graphics({ x: 0, y: 0 });
        scene.veil.setDepth(10);
        scene.veil.setScrollFactor(0);
    }

    scene.veil.clear(); // rimuove il contenuto grafico del veil precedente, se esiste

    scene.veil.fillStyle(0x000000, 0.7);
    scene.veil.alpha = 0;
    scene.veil.fillRect(0, 0, 1920, 1080);


    // Tween per il fade-in del veil
    scene.tweens.add({
        targets: scene.veil,
        alpha: 1,
        duration: 1000, // 1 secondo
        ease: 'Linear',
    });

    scene.testo_gameoverPunteggio.setText('PUNTEGGIO: ' + scene.score);

     // Tween per scritte e pulsanti
     const elements = [
        scene.testo_gameover,
        scene.inputDisplay,
        scene.testo_gameoverPunteggio,
        ...(scene.pulsanti_gameover || [])
    ];

    elements.forEach((el, index) => {
        el.setAlpha(0).disableInteractive();
        scene.tweens.add({
            targets: el,
            alpha: 1,
            delay: 80 + index * 100, // ritardo tra gli elementi
            duration: 500,
            onComplete: () => el.setInteractive()
        });
    });


}



export function saveScore(scene){
    if(scene.inputText != "" && scene.punteggioSalvato == false){
        scene.punteggioSalvato = true;
        let punteggi = scene.cache.text.get('leaderboard'); 
        let arrayPunteggi = punteggi.split("\n").map(riga => riga.replace("\r", ""));
        let inserito = false;
        for(let i = 0; i < arrayPunteggi.length; i++){
            let parti = arrayPunteggi[i].split(" ");
            let numero = parseInt(parti[parti.length - 1]);
            if (scene.score >= numero){
                arrayPunteggi.splice(i, 0, scene.inputText + " " + scene.score);
                inserito = true;
                break
            }
        }

        if(!inserito){
            arrayPunteggi.push(scene.inputText + " " + scene.score);
        }

        if(arrayPunteggi.length > 10){
            arrayPunteggi.splice(10,1)
        }

        scene.cache.text.remove('leaderboard');
        scene.cache.text.add('leaderboard', arrayPunteggi.join('\n'));

        // Invia al server (fatto con AI)
        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'server.php', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onload = function() {
            if(xhr.status === 200) {
                console.log('Punteggio salvato sul server');
            } else {
                console.error('Errore server:', xhr.status);
                // Fallback a localStorage
                localStorage.setItem('leaderboard_backup', arrayPunteggi.join('\n'));
            }
        };
        
        xhr.onerror = function() {
            console.error('Server offline');
            localStorage.setItem('leaderboard_backup', arrayPunteggi.join('\n'));
        };
        
        xhr.send(JSON.stringify({
            nome: scene.inputText,
            punteggio: scene.score,
            leaderboard: arrayPunteggi.join('\n')
        }));
    }

    
}