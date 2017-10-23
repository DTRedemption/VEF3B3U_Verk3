/* 5% Gerðu	eftirfarandi	tutorial	og	útskýrðu	kóðann	lauslega	með	comments	í	kóðanum	á	íslensku.	
https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial. My icelandic isn't very good but i'll try */


main();

function main() {
    const canvas = document.querySelector("#glCanvas");
    // Náum í webGL context
    const gl = canvas.getContext("webgl");

    // Ef webGL virka ekki á user tölvuni
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    // svart lit
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // hreinsa color buffer með litið sem við ákveðum á undan
    gl.clear(gl.COLOR_BUFFER_BIT);
}

                                                                                    /*    Part 2    */

//vertex shader forrit, náum í vertex staða með aVertexPosition og margfalda það með 2 4x4 matrices sem er uProjectionMatrix og umodelMatrix og útgildi er gl_position
const vsSource = `
    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;
//fragment shader forrit, fyrir hver sinum vertex shaderinn skráið staða og teiknað eitthvað form, við ákveðum hvaða lit hver pixla á að vera. Í þessi tilfellum er það hvít
const fsSource = `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `;


// Keyrið shader forrit til að látu WebGL vita hverning við viljum hann að teikna.

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // búa til shader forrit

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // ef villa, alert.

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}


// Búið til shader af gefið týpur, sendur inn sourceið og compilar hann.

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // sendur inn sourceið til shader objectið.

    gl.shaderSource(shader, source);

    // compile shader forritið

    gl.compileShader(shader);

    // Sjáum ef það tókst eða ekki.

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// setjið inn í variable til að kalla hann seinna.
const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

//við getum geyma öll input variables okkar hérna vegna þess að það er öll global variables og er fyrir sérstakur shader forrit.
const programInfo = {
    program: shaderProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    },
    uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
};

function initBuffers(gl) {

    // Búið til buffer fyrir staða rétthyrnings

    const positionBuffer = gl.createBuffer();

    // velja postionBuffer sem sá er að gefa út alla buffer aðgerð.

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Búið til fylki fyrir staða rétthyrnings.

    const positions = [
        1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        -1.0, -1.0,
    ];

    //Notaður Float32Array til að taka inn alla staðsetningum fyrir rétthyrningur og fylla inn bufferið.

    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW);

    return {
        position: positionBuffer,
    };
}

function drawScene(gl, programInfo, buffers) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // hreinsa lit aftur til svartur, fullt Ógagnsæ
    gl.clearDepth(1.0);                 // Hreinsa allt
    gl.enable(gl.DEPTH_TEST);           // Virkja depth testing
    gl.depthFunc(gl.LEQUAL);            // objects sem er nær fela objects sem er langt frá.

    // Hreinsa canvasinn áðum en við teiknum á hann.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Búið til "perspective matrix". 45 gráður sjón, við viljum bara sjá objects sem er á milli 0.1 til 100 einingar frá.

    const fieldOfView = 45 * Math.PI / 180;   // í Radíus
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    // Setjum teikningur staða á miðjum scena.
    const modelViewMatrix = mat4.create();

    // Fæara teikningur staða smá til að fá staður sem við vilja teikna rétthyrningur.

    mat4.translate(modelViewMatrix,     // áfangastaður fylkis
        modelViewMatrix,     // fylki til að þýða
        [-0.0, 0.0, -6.0]);  // magn til að þyða

    // Segjum WebGL Hverning við viljum taka út staðum gildir frá staða buffer til að setja inn í vertexPosition breytur 
    {
        const numComponents = 2;  // tekur out 2 gildi hvert skipti
        const type = gl.FLOAT;    // gögnið í bufferið er 32-bit float
        const normalize = false;  // við normaliza ekki.
        const stride = 0;         // númer af bytes til að ná frá einn hópar af breytur til næsta
        const offset = 0;         // Hversu margar bytes inní bufferið til að byrja frá.
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    // Segjum WebGL að nota forritið okkar til að teikna

    gl.useProgram(programInfo.program);

    // notað shader uniforms.

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    {
        const offset = 0;
        const vertexCount = 4;
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
}

                                                                /*    Part 3    */

//Rendera gradient sem hvert horn í rétthyrning er sér lit, litur er vistað inní fylki sem er sett yfir í floats or vistað inní bufferið.
const colors = [
    1.0, 1.0, 1.0, 1.0,    // hvít
    1.0, 0.0, 0.0, 1.0,    // rauða
    0.0, 1.0, 0.0, 1.0,    // grænn
    0.0, 0.0, 1.0, 1.0,    // blá
];

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

return {
    position: positionBuffer,
    color: colorBuffer,
};

//updatea vertex shaderið til að ná í réttum lit frá lit buffer.
const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

// Breyta fsSource til þess að við náum litum fyrir hver pixel við gerum það með því að ná gildi frá vColor.
const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

// bæta við kóðinn sem finnið staður fyrir litur og sett hann up fyrir shader forrit
const programInfo = {
    program: shaderProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },

    // Breyta drawScene() til að nota litum þegar við teiknum rétthyrningur
    //Segjum WebGL hverning hann á að ná í litur frá color bufferið og hent hann inn í vertexColor breytu.
    {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
}

                                                                                 /*    Part 4   */
//búið til breytu til að vista snúningum.

var squareRotation = 0.0;

//Breytum drawScene() til að keyra snúning á rétthyrning þegar hann er teiknað

mat4.rotate(modelViewMatrix,  // áfangastaður fyrir fylki
    modelViewMatrix,  // fylki sem snýr
    squareRotation,   // hversu mikið hann snýr með radíans
    [0, 0, 1]);       //  ás sem hann snýr í kring

    // bætum við breytu sem breytir snýr yfir tíma, hann skoðaði síðasti tíma hann hreyfist.
    var then = 0;
    
      // Teikna endalaust.
      function render(now) {
        now *= 0.001;  // breyta í sek.
        const deltaTime = now - then;
        then = now;
    
        //með requestAnimationFrame getum við sjáum render tíma í millisek og við breytum það í sek or dregum frá deltaTime sem er síðasta tíminn frameið var renderað.
        drawScene(gl, programInfo, buffers, deltaTime);
    
        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);

      //á endanum, bæta við breytu til að uppfæra squareRotation
      squareRotation += deltaTime;

                                                                        /*    Part 5   */
    // Staðum fyrir 3d teningur okkar.
        const positions = [
    // Framan
    -1.0, -1.0,  1.0,
    1.0, -1.0,  1.0,
    1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,
    
    // Bakvið
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
    1.0,  1.0, -1.0,
    1.0, -1.0, -1.0,
    
    // Yfir
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
    1.0,  1.0,  1.0,
    1.0,  1.0, -1.0,
    
    // Undir
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,
    
    // Hægri
    1.0, -1.0, -1.0,
    1.0,  1.0, -1.0,
    1.0,  1.0,  1.0,
    1.0, -1.0,  1.0,
    
    // Vinstri
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,
    ];  
    
    // breytum numComponents til að bæta við z-ás
    {   
        const numComponents = 3;

        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
      }
      //núna litum við hvert hlið af teningur
      const faceColors = [
        [1.0,  1.0,  1.0,  1.0],    // Framan: hvít
        [1.0,  0.0,  0.0,  1.0],    // Bakvið: rauð
        [0.0,  1.0,  0.0,  1.0],    // Yfir: Grænn
        [0.0,  0.0,  1.0,  1.0],    // Undir: Blá
        [1.0,  1.0,  0.0,  1.0],    // Hægri: Gulur
        [1.0,  0.0,  1.0,  1.0],    // Vinstri: Fjólublá
      ];
    
      // Breytum fylki með litur í töflu fyrir hornpunktar.

      var colors = [];
    
      for (var j = 0; j < faceColors.length; ++j) {
        const c = faceColors[j];
    
        // Endurtaka litum fjögur sinum fyrir hver fjögur hornpunktar af hliðum
        colors = colors.concat(c, c, c, c);
      }
    
      //byggjum element fylkið.
      const colorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    
      //fylkið skilgreinið hver hlið sem tvær þríhyrningur, með því að setja vísitölurnar inn í hornpunkta fylki til að tilgreina hver staðsetning hjá þríhyrningum.
    
      const indices = [
        0,  1,  2,      0,  2,  3,    // framan
        4,  5,  6,      4,  6,  7,    // bakvið
        8,  9,  10,     8,  10, 11,   // yfir
        12, 13, 14,     12, 14, 15,   // undan
        16, 17, 18,     16, 18, 19,   // hægri
        20, 21, 22,     20, 22, 23,   // vinstri
      ];
    
      // Núna getum við setja fylkið inn í GL.
    
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
          new Uint16Array(indices), gl.STATIC_DRAW);
    
      return {
        position: positionBuffer,
        color: colorBuffer,
        indices: indexBuffer,
      };

      // Segjum WebGL hvaða vísitölur hann á að nota til að vísitölu hornpunktar
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  

  
    {
      const vertexCount = 36;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

    //Breytum squareRotation í cubeRotation og bætum við annað snúning við x-ás.
    mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation * .7, [0, 1, 0]);
                                                                            /*    Part 6   */
    
    // Keyra áferð og loadað inn eitthvað mynd. Þegar myndinn er búið að loada, afritu hann inn í áferðinn.
    
    function loadTexture(gl, url) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
    
        //Setjum pixlar inn í áferð þegar mynd er að loada til þess að það er eitthvað "placeholder" þegar búinn að loada, setjum við mynd inn.
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]);  
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    width, height, border, srcFormat, srcType,
                    pixel);
    
        const image = new Image();
        image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                        srcFormat, srcType, image);
    
        //Við þurfum að kíkja ef mynd fylgir "power of 2" reglu.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Það fylgir reglu, generatea mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // Það fylgir ekki reglu, slökkva mips og settum wrapping til að festa hann í brúnir
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        };
        image.src = url;
    
        return texture;
    }
    
    function isPowerOf2(value) {
        return (value & (value - 1)) == 0;
    }
    
    // gl.NEAREST er leyfið.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Stoppum s-samræma wrappa.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // Stoppum t-samræma wrappa.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Núna er áferð tilbúinn fyrir notkun. Við þurfum að mappa áferð samræma til hornpunktar á hliðinn teningur, við skiptum um kóða fyrir lit breyting á hliðum teningum.
    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  
    const textureCoordinates = [
      // Framan
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Bakvið
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Yfir
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Undir
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Hægri
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Vinstri
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
    ];
  
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                  gl.STATIC_DRAW);
    //Við möppum áferð samræmum fyrir hliðum inn í buffer sem fylki við skrifum í.
    //Með textureCoord getum við segjum samræmum fyrir hver hornpunktur á hliðum.
    return {
      position: positionBuffer,
      textureCoord: textureCoordBuffer,
      indices: indexBuffer,
    };

    //Uppfæra Vertex shaderinn aftur til að taka inn gögn um áferð samræmum.
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
  `;
   //Þurfum líka að uppfæra fragment shaderinn til að ná í texel(pixlar sem er inn í áferð) frá vTextureCoord
   const fsSource = `
   varying highp vec2 vTextureCoord;

   uniform sampler2D uSampler;

   void main(void) {
     gl_FragColor = texture2D(uSampler, vTextureCoord);
   }
 `;

   // af því við breytum attribute og bætaða við uniform, þurfum við að kíkja hvar þeir eruð.
 const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
  };

  //Breytum drawScene(), taka út litum á áferð kóða.

    // Við viljum breyta áferð eining 0
    gl.activeTexture(gl.TEXTURE0);
    
      // Staðfesta áferð til áferð eining 0
      gl.bindTexture(gl.TEXTURE_2D, texture);
    
      // Segjum shaderinn að við staðfestaði áferði til áferð eining 0
      gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

                                                                                /*    Part 7   */

    // búið til fylki sem innihaldið normals fyrir allar hornpunktar sem byggja teningur okkar.
    // búið til buffer fyrir áferð normals okkar.                                                
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

    const vertexNormals = [
        // Framan
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,

        // Bakvið
        0.0,  0.0, -1.0,
        0.0,  0.0, -1.0,
        0.0,  0.0, -1.0,
        0.0,  0.0, -1.0,

        // Yfir
        0.0,  1.0,  0.0,
        0.0,  1.0,  0.0,
        0.0,  1.0,  0.0,
        0.0,  1.0,  0.0,

        // Undir
        0.0, -1.0,  0.0,
        0.0, -1.0,  0.0,
        0.0, -1.0,  0.0,
        0.0, -1.0,  0.0,

        // Hægri
        1.0,  0.0,  0.0,
        1.0,  0.0,  0.0,
        1.0,  0.0,  0.0,
        1.0,  0.0,  0.0,

        // Vinstri
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
                    gl.STATIC_DRAW);


    return {
        position: positionBuffer,
        normal: normalBuffer,
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
    };

    // Breytum drawScene() og bæta við normals fylki á shaderinn, núna getur shaderinn ná í gögn frá það.
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexNormal);
  }

  //Uppfæra kóðin sem byggjað uniform áferð til að búa til og senda til shaderinn normal fylki sem breyta normalið þegar teningur er að snúa með ljósinn.
  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

  //Uppfæra shaderinn til að búa til nýtt shading value fyrir hver áferð byggt á umhverfislýsingu og stefnuvirkt lýsing.
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.normalMatrix,
      false,
      normalMatrix);

      const vsSource = `
      attribute vec4 aVertexPosition;
      attribute vec3 aVertexNormal;
      attribute vec2 aTextureCoord;
  
      uniform mat4 uNormalMatrix;
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
  
      varying highp vec2 vTextureCoord;
      varying highp vec3 vLighting;
  
      void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vTextureCoord = aTextureCoord;
  
        // bætu við ljós effect
  
        highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
        highp vec3 directionalLightColor = vec3(1, 1, 1);
        highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));
  
        highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
  
        highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
        vLighting = ambientLight + (directionalLightColor * directional);
      }
    `;

    //Uppfæra fragment shaderinn fyrir nýum ljós gögn. Náum litið af texel og margfaldað litið með ljós gildi til að breyta litið á texel þegar ljósinn breytast
    const fsSource = `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    uniform sampler2D uSampler;

    void main(void) {
      highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

      gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    }
  `;

  //Finnið hvar aVertexNormal er og búið.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    }
}

                                                                        /*    Part 8   */

// Búið til video element sem við notum til að ná í video frames.

//true þegar vídeoið getur vera afritað til áferðinn.
var copyVideo = false;

//sett upp vídeoið
function setupVideo(url) {
  const video = document.createElement('video');

  var playing = false;
  var timeupdate = false;

  video.autoplay = true;
  video.muted = true;
  video.loop = true;

  // Bætum þessi tveir event listener til að athuga að vídeoin er til
  video.addEventListener('playing', function() {
     playing = true;
     checkReady();
  }, true);

  video.addEventListener('timeupdate', function() {
     timeupdate = true;
     checkReady();
  }, true);

  video.src = url;
  video.play();

  function checkReady() {
    if (playing && timeupdate) {
      copyVideo = true;
    }
  }

  return video;
}

function initTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    //Við bætum við pixla placeholder aftur fyrir vídeoið.

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  width, height, border, srcFormat, srcType,
                  pixel);
  
    // Slökkvum á mips og wrappa til brúnið til þess að það virka ásamt vídeo vídd
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  
    return texture;
  }

  // Svipað við onload fall fyrir myndinn nema við setjum vídeo í staðinn.
  function updateTexture(gl, texture, video) {
    const level = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, video);
  }

  //Við uppfærum rendera fyrir vídeoið, ef copyVideo er true þá er updateTexture() keyrt á undan við köllum drawScene fallið.
  var then = 0;
  
    
    function render(now) {
      now *= 0.001;  
      const deltaTime = now - then;
      then = now;
  
      if (copyVideo) {
        updateTexture(gl, texture, video);
      }
  
      drawScene(gl, programInfo, buffers, texture, deltaTime);
  
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    