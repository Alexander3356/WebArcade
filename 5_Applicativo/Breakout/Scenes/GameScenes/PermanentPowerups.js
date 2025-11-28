
export function potenziamentiPermanenti(scene){
    if(scene.sbloccoPotenziamento == 1){ //sblocca potenziamento palla di fuoco
        scene.pallaDiFuoco = true;
        scene.blocchiAlPotenziamento = 1;
    } else if (scene.sbloccoPotenziamento == 2){ //sblocca potenziamento proiettile
        scene.proiettile = true;
        scene.blocchiAlPotenziamento = 2;
    } else if (scene.sbloccoPotenziamento == 3){ // + danno
        scene.moltDamage += 1;
        scene.blocchiAlPotenziamento = 3;
    } else if (scene.sbloccoPotenziamento == 4){ //sblocca potenziamento calamita
        scene.calamita = true;
        scene.blocchiAlPotenziamento = 3;
    } else if (scene.sbloccoPotenziamento == 5){
        scene.durataPallaDiFuoco = 20; //la palla di fuoco dura il doppio
        scene.blocchiAlPotenziamento = 3;
    } else if (scene.sbloccoPotenziamento == 6){ //proiettile spara più frequentemente
        scene.frequenzaProiettile = 300;
        scene.blocchiAlPotenziamento = 3;
    } else if (scene.sbloccoPotenziamento >= 7){ // + danno
        scene.moltDamage += 1;
        scene.blocchiAlPotenziamento = 3 * scene.moltDamage;
    } 
}

export function attivaPallaDiFuoco(scene){ 
    if(scene.timerPallaDiFuoco >= 3600 && scene.ingrandimento == false){
        scene.cameras.main.shake(3000, 0.001);
        scene.pallaDiFuocoAttiva = true;
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