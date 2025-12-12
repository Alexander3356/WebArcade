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
    
    // MANTIENI CONTRASTO ma con valori bassi:
    float gray1 = sin(uv.x - slowedTime) * 0.4 + 0.1;      // Range: -0.3 a 0.5
    float gray2 = sin(uv.y + slowedTime) * 0.35 + 0.12;    // Range: -0.23 a 0.47
    float gray3 = sin((uv.x + uv.y + sin(slowedTime * 0.5)) * 0.5) * 0.3 + 0.15;

    // Combina
    float grayIntensity = gray1 * 0.4 + gray2 * 0.35 + gray3 * 0.25;

    // AUMENTA IL CONTRASTO invece di ridurre la luminosità:
    grayIntensity = (grayIntensity - 0.5) * 1.5 + 0.5; // Aumenta contrasto 1.5x

    // Ora sposta verso il basso mantenendo il contrasto:
    grayIntensity = grayIntensity * 0.4; // Riduci luminosità

    // Range finale con buon contrasto:
    grayIntensity = 0.1 + grayIntensity * 0.6; // Range: 0.1-0.7 (scuro ma visibile)
    
    // Per la scala di grigi, tutti e tre i canali RGB hanno lo stesso valore
    float r = grayIntensity;
    float g = grayIntensity;
    float b = grayIntensity;
    
    // TRASPARENZA: 0.25 = 25% di opacità
    float transparency = 0.25;
    fragColor = vec4(r, g, b, transparency);
}

void main(void)
{
    mainImage(gl_FragColor, outTexCoord);
}