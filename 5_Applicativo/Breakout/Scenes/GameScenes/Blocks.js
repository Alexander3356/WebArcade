import { generaPotenziamento } from "./SimplePowerups.js";
import { potenziamentiPermanenti } from "./PermanentPowerups.js";


export function  collisioneBlocco(scene, ball, brick){
    scene.sound.play("hit");
    if (scene.ball.potenziamento == "cannoneAttivo") {
        scene.ball.setPosition(scene.paddle.x, scene.paddle.y - 40);
        scene.ball.setVelocity(0, -1500);
    }
    if(scene.ingrandimento == true){
        let punteggio = 0;
        scene.ingrandimento = false;
        scene.ball.setScale(1);
        brick.resistenza = 0;
        scene.bricks.children.iterate((altroBlocco) => {
            if (!altroBlocco.active || altroBlocco === brick) return;

            const dx = Math.abs(altroBlocco.x - brick.x);
            const dy = Math.abs(altroBlocco.y - brick.y);
            
            // margine per considerare i blocchi vicini
            const distanzaX = brick.displayWidth + 2;
            const distanzaY = brick.displayHeight + 2;

            // Se il blocco è vicino (orizzontale, verticale o diagonale)
            if (dx <= distanzaX && dy <= distanzaY) {
                punteggio += 10 * altroBlocco.resistenza;
                scene.blocchiDistrutti++;
                altroBlocco.disableBody(true, true);
            }
        });
        scene.score += punteggio;
    }
    brick.resistenza -= 1 * scene.moltDamage;

    if (brick.resistenza <= 0){

        if (brick.resistenza < 0){ // se il blocco ha resistenza minore di 0, toglie i punti che verranno attribuiti dopo per gli strati distrutti
            scene.score += 10 * brick.resistenza;
        }

        scene.blocchiDistrutti++;
        let casuale = Math.random() * 100;
        if (casuale <= 20){
            generaPotenziamento(scene, brick);
        }
        brick.disableBody(true, true); //rimuove il blocco
    } else {
        brick.setTexture(scene.mattoniTexture[brick.resistenza - 1])
    }
    
    if (Math.abs(ball.body.velocity.y) < 800) { //aumenta la velocità quando colpisce un blocco
        ball.setVelocityY(ball.body.velocity.y * 1.05);
    }

    scene.score += 10 * scene.moltDamage;
    scene.text_score.setText(scene.score);

    if(scene.blocchiDistrutti >= scene.blocchiAlPotenziamento){ //Controllo quota per potenziamenti permanenti
        scene.blocchiDistrutti -= scene.blocchiAlPotenziamento;
        scene.sbloccoPotenziamento++;
        potenziamentiPermanenti(scene);
    }
    scene.text_blocchiAlPotenziamento.setText(scene.blocchiAlPotenziamento);
    scene.text_blocchiDistrutti.setText(scene.blocchiDistrutti);
    scene.riempimentoBlocchiDistrutti.setScale(1, scene.blocchiDistrutti/scene.blocchiAlPotenziamento);
}




export function generaBlocchi(scene){
    if (scene.mattoni.length != 0){
        scene.mattoni.forEach((mattone) => {
            mattone.y += 30;
            mattone.refreshBody();
        });
    }
    if (scene.difficolta == 0){
        for (let x = 0; x < 12; x++){
            let brick;
            let casuale = Math.random() * 100;

            //20% di probabilita che il blocco abbia 2 di resistenza
            if (casuale < 80){ 
                brick = scene.bricks.create(476 + x * 88, 15, "brick");
                brick.resistenza = 1;
            } else {
                brick = scene.bricks.create(476 + x * 88, 15, "brick2");
                brick.resistenza = 2;
            }
            
            brick.posizione = x; //mi segno la posizione originale nell'array del blocco
            brick.setScale(1);
            brick.refreshBody(); //per aggiornare la hitbox, serve per i corpi statici
            scene.mattoni.push(brick);
        }
    }

}