#pragma phaserTemplate(shaderName)

precision mediump float;

uniform float time;

varying vec2 outTexCoord;

void mainImage( out vec4 fragColor, in vec2 texCoord )
{
    // FATTORE DI RALLENTAMENTO: 0.3 = 30% della velocità originale
    float slowFactor = 0.3;
    float slowedTime = time * slowFactor;
    
    vec2 uv = (texCoord-0.5)*8.0;
    float i0=1.0;
    float i1=1.0;
    float i2=1.0;
    float i4=0.0;
    
    for(int s=0;s<7;s++)
    {
        vec2 r;
        // Usa slowedTime invece di time
        r=vec2(cos(uv.y*i0-i4+slowedTime/i1),sin(uv.x*i0-i4+slowedTime/i1))/i2;
        r+=vec2(-r.y,r.x)*0.3;
        uv.xy+=r;

        i0*=1.93;
        i1*=1.15;
        i2*=1.7;
        i4+=0.05+0.1*slowedTime*i1; // Usa slowedTime qui
    }
    
    // Crea variazioni solo di blu
    // Usa le onde per creare diverse intensità di blu
    float blue1 = sin(uv.x - slowedTime) * 0.5 + 0.5;
    float blue2 = sin(uv.y + slowedTime) * 0.5 + 0.5;
    float blue3 = sin((uv.x + uv.y + sin(slowedTime * 0.5)) * 0.5) * 0.5 + 0.5;
    
    // Combina le onde per creare variazioni interessanti di blu
    // blue1 domina, blue2 e blue3 aggiungono dettagli
    float blueIntensity = blue1 * 0.6 + blue2 * 0.3 + blue3 * 0.1;
    
    // Aggiungi un po' di profondità con il canale verde molto tenue
    float greenTint = blue2 * 0.1; // Solo una leggera sfumatura verde
    
    // Crea diverse tonalità di blu
    float r = 0.0;                 // Rosso a zero
    float g = greenTint * 0.3;     // Verde molto tenue (per profondità)
    float b = blueIntensity;       // Blu principale
    
    // Aumenta il contrasto dei blu
    b = pow(b, 1.2); // Esponenziale per blu più vividi
    
    // TRASPARENZA: 0.3 = 30% di opacità
    float transparency = 0.3;
    fragColor = vec4(r, g, b, transparency);
}

void main(void)
{
    mainImage(gl_FragColor, outTexCoord);
}