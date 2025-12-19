export default class MenuScene extends Phaser.Scene { //menu di gioco
    constructor() {
        super({ key: 'MenuScene' });
        this.pulsanti = [];
        this.pulsanti_tutorial = [];
        this.text = [];
        this.conta = 0;
        this.first_time = true;
    }

    preload() { //per caricare gli assets
        this.load.image('tutorial1', 'Assets/Images/Tutorial/tutorial_1.png');
        this.load.image('tutorial2', 'Assets/Images/Tutorial/tutorial_2.png');
        this.load.image('tutorial3', 'Assets/Images/Tutorial/tutorial_3.png');
        this.load.image('tutorial4', 'Assets/Images/Tutorial/tutorial_4.png');
        this.load.text("leaderboard", "Assets/leaderboard.txt")
        this.load.audio("click", "Assets/Sound/click.wav")

        //sfondo
        this.load.glsl('marble', 'Assets/Shaders/marble.frag');
        this.load.glsl('marble2', 'Assets/Shaders/marble2.frag');
    }

    create() {
        let colore_sfondo = 'rgb(45, 84, 112)'

        this.cameras.main.setBackgroundColor(colore_sfondo);

        // Variabili per gestire il delay e l'animazione dei pulsanti
        this.playHoverTimer = null;
        this.playFadeTween = null;
        

        //pulsanti
        this.pulsanti.push(this.playbutton = this.add.rectangle(960, 500, 1920, 80, 0xe1e810)
        .setInteractive()
        .on('pointerdown', () => {
            this.sound.play("click"); 
            this.giocaClick() 
        })); 

        this.pulsanti.push(this.twoplayerbutton = this.add.rectangle(960, 600, 1920, 80, 0xe1e810).setInteractive());
        this.pulsanti.push(this.leaderboardbutton = this.add.rectangle(960, 700, 1920, 80, 0xe1e810).setInteractive()
        .on('pointerdown', () => {this.sound.play("click"); this.leaderboardClick()})); 

        this.pulsanti.push(this.exitbutton = this.add.rectangle(960, 800, 1920, 80, 0xe1e810).setInteractive()
        .on('pointerdown', () => {this.sound.play("click"); this.esciClick()})); 

        this.pulsanti.forEach((pulsante) => {
            pulsante.setOrigin(0.5, 0.5);

            //rende il pulsante invisibile ma non del tutto così può ancora essere rilevato dal mouse
            pulsante.setAlpha(0.001); 

            pulsante.setInteractive({ useHandCursor: true});
            pulsante.on('pointerover', () => this.buttonOver(pulsante) );
            pulsante.on('pointerout', () => this.buttonOut(pulsante));
        });
        

        //testo dei pulsanti
        this.text.push(this.add.text(960, 250, 'BREAKOUT', { fontSize: '70px', fill: 'rgb(0,0,0)' }));
        this.text.push(this.add.text(960, 500, 'GIOCA', { fontSize: '50px', fill: 'rgb(0,0,0)' }));
        this.text.push(this.add.text(960, 600, '2 GIOCATORI', { fontSize: '50px', fill: 'rgb(0,0,0)' }));
        this.text.push(this.add.text(960, 700, 'LEADERBOARD', { fontSize: '50px', fill: 'rgb(0,0,0)' }));
        this.text.push(this.add.text(960, 800, 'ESCI', { fontSize: '50px', fill: 'rgb(0,0,0)' }));

        //imposta tutti i testi al centro della pagina
        this.text.forEach((testo) => {
            testo.setOrigin(0.5, 0.5);
            testo.setDepth(5);
        });


        //sfondo
        this.marble = this.add.shader('marble', 960, 540, 1920, 1080);
        this.marble2 = this.add.shader('marble2', 960, 540, 1920, 1080).setVisible(false).setActive(false);

    }

    

    giocaClick(){
        if (this.first_time == true){
            this.disabilitaPulsanti();
            this.add.text(960, 450, 'È LA PRIMA VOLTA CHE GIOCHI?', { fontSize: '50px', fill: 'rgb(0,0,0)' }).setOrigin(0.5, 0.5);

            //pulsanti di scelta
            let pulsante_si = this.add.text(500, 620, 'SÌ', { fontSize: '50px', fill: 'rgb(0,0,0)' }).setOrigin(0.5, 0.5)
            .setInteractive()
            .on("pointerover", () => this.pulsantiSceltaOver(pulsante_si) )
            .on('pointerout', () => this.pulsantiSceltaOut(pulsante_si) )
            .on('pointerdown', () => {this.sound.play("click"); this.tutorial() });
            let pulsante_no = this.add.text(1420, 620, 'NO', { fontSize: '50px', fill: 'rgb(0,0,0)' }).setOrigin(0.5, 0.5)
            .setInteractive()
            .on("pointerover", () => this.pulsantiSceltaOver(pulsante_no) )
            .on('pointerout', () => this.pulsantiSceltaOut(pulsante_no) )
            .on('pointerdown', () => {this.sound.play("click"); this.noClick()} );
        } else {
            this.scene.start('GameScene');
        }
    }

    //disabilita i pulsanti del menu
    disabilitaPulsanti(){ 
        //disabilita animazioni di hover dei pulsanti
        if (this.playHoverTimer) {
            this.playHoverTimer.remove();
            this.playHoverTimer = null;
        }
        if (this.playFadeTween) {
            this.playFadeTween.stop();
            this.playFadeTween = null;
        }
        //disabilito i testi e i pulsanti
        for(let x = 1; x < 5; x++){
            this.text[x].setAlpha(0);
        }
        this.pulsanti.forEach((pulsante) => {
            pulsante.setAlpha(0);
            pulsante.disableInteractive();
        });
    }

    exitLeaderboard(punteggi){
        //nasconde le critte della leaderboard
        punteggi.forEach((punteggio) => {
            punteggio.setAlpha(0);
        });

        //abilito i testi e i pulsanti
        for(let x = 0; x < 5; x++){
            this.text[x].setAlpha(1);
        }
        this.pulsanti.forEach((pulsante) => {
            pulsante.setAlpha(0.001);
            pulsante.setInteractive();
        });


    }

    pulsantiSceltaOver(pulsante){
        pulsante.setStyle({ fontSize: '55px', });
    }

    pulsantiSceltaOut(pulsante){
        pulsante.setStyle({ fontSize: '50px', });
    }

    leaderboardClick(){
        this.text[0].setAlpha(0); //rende trasparente la scritta "BREAKOUT"
        this.disabilitaPulsanti();

        //legge il file da cache.text che è uno ogetto che contiene i file caricati
        let punteggi;
    
        try { //Fatto con AI
            // Versione sincrona (bloccante ma semplice)
            let xhr = new XMLHttpRequest();
            xhr.open('GET', 'server.php', false); // false = sincrono
            xhr.send();
            
            if(xhr.status === 200 && xhr.responseText.trim() !== "") {
                punteggi = xhr.responseText;
                // Aggiorna anche la cache locale
                this.cache.text.remove('leaderboard');
                this.cache.text.add('leaderboard', punteggi);
            } else {
                throw new Error('Server non risponde');
            }
        } catch(e) {
            console.log("Server offline, uso cache locale:", e);
            punteggi = this.cache.text.get('leaderboard') || "Nessun punteggio salvato";
        }

        //salva i punteggi in un array, per ogni elemento dell'array rimuove anche eventuali carriage return
        //per evitare spazi maggiori tra punteggi quando verranno stampati
        let arrayPunteggi = punteggi.split("\n").map(riga => riga.replace("\r", ""));

        let text_punteggi = [];
        text_punteggi.push(this.add.text(960, 100, 'LEADERBOARD', { fontSize: '70px', fill: 'rgb(0,0,0)' }).setOrigin(0.5, 0.5));

        let conta = 0;
        arrayPunteggi.forEach((testo) => {
            text_punteggi.push(this.add.text(960, 200 + conta, testo, { fontSize: '50px', fill: 'rgb(0,0,0)' }).setOrigin(0.5, 0.5));
            conta += 70;
        });

        let pulsante_indietro = this.add.text(1700, 900, 'INDIETRO', { fontSize: '50px', fill: 'rgb(0,0,0)' }).setOrigin(0.5, 0.5)
            .setInteractive()
            .on("pointerover", () => this.pulsantiSceltaOver(pulsante_indietro) )
            .on('pointerout', () => this.pulsantiSceltaOut(pulsante_indietro) )
            .on('pointerdown', () => {this.sound.play("click"); pulsante_indietro.disableInteractive(); pulsante_indietro.setAlpha(0); this.exitLeaderboard(text_punteggi) });
    }


    noClick(){
        this.first_time = false;
        this.scene.start('GameScene');
    }

    tutorial(){
        this.conta = 0;
        this.pulsanti_tutorial = [];
        this.marble.setActive(false).setVisible(false);
        this.marble2.setActive(true).setVisible(true).setDepth(8);

        this.add.rectangle(0, 0, 1920, 1080, 0x404040).setOrigin(0,0).setDepth(7);
        this.add.text(960, 200, 'TUTORIAL', { fontSize: '110px', fill: 'rgb(255,255,255)' }).setOrigin(0.5, 0.5).setDepth(10);
        this.pulsanti_tutorial.push(this.tutorialButton1 = this.add.image(960, 650, "tutorial1").setScale(1.5).setDepth(10));
        this.pulsanti_tutorial.push(this.tutorialButton2 = this.add.image(960, 650, "tutorial2").setScale(1.5).setDepth(10));
        this.pulsanti_tutorial.push(this.tutorialButton3 = this.add.image(960, 650, "tutorial3").setScale(1.5).setDepth(10));
        this.pulsanti_tutorial.push(this.tutorialButton4 = this.add.image(960, 650, "tutorial4").setScale(1.5).setDepth(10));

        this.pulsanti_tutorial.forEach((pulsante) => {
            pulsante.setInteractive();
            pulsante.on('pointerdown', () => this.skip()); 
            pulsante.setOrigin(0.5, 0.5);
            pulsante.setAlpha(0);
        });

        this.pulsanti_tutorial[this.conta].setAlpha(1);
    }

    skip(){
        if (this.conta >= 3){
            this.pulsanti_tutorial[this.conta].setAlpha(0);
            this.scene.start('GameScene');
        } else {
            this.pulsanti_tutorial[this.conta].setAlpha(0);
            this.conta++;
            this.pulsanti_tutorial[this.conta].setAlpha(1);
        }
    }

    esciClick(){
        window.location.href = 'https://google.com';
    }

    buttonOver(pulsante){
        // Previene più timer o tween insieme
        if (this.playHoverTimer || this.playFadeTween) return;

        this.playHoverTimer = this.time.delayedCall(20, () => {
            this.playFadeTween = this.tweens.add({
                targets: pulsante,
                alpha: 1,
                duration: 50,
                ease: 'Linear',
                onComplete: () => {
                    this.playFadeTween = null; // pulizia
                }
            });
            this.playHoverTimer = null; // pulizia
        });
    }

    buttonOut(pulsante){
        
        if (this.playHoverTimer) {
            this.playHoverTimer.remove();
            this.playHoverTimer = null;
        }

        if (this.playFadeTween) { // Se sta facendo il fade-in, stoppa e resetta alpha
            this.playFadeTween.stop();
            this.playFadeTween = null;
        }
        
        this.tweens.add({ // Torna invisibile 
            targets: pulsante,
            alpha: 0.001,
            duration: 100,
            ease: 'Linear'
        });
    }

}
