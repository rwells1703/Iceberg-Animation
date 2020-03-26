// Create new html5 canvas and wegbl context
function createCanvas() {
    canvas = document.getElementById("webCanvas");
    
    var canvasStyle = getComputedStyle(canvas);
    canvas.width = parseInt(canvasStyle.getPropertyValue('width'), 10);
    canvas.height = parseInt(canvasStyle.getPropertyValue('height'), 10);

    gl = canvas.getContext("webgl");

    // Size the viewport according to the canvas size
    gl.viewport(0,0,canvas.width,canvas.height);
}

// Create a new shader of the specified type
function createShader(type, source) {
    var shader = gl.createShader(type);
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader failed to compile", gl.getShaderInfoLog(shader));
        return false;
    }
    
    return shader;
}

// Create a program using a vertex and fragment shader
function createProgram(vertexShader, fragmentShader) {
    var program = gl.createProgram();
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    
    gl.linkProgram(program);
    
    return program;
}

// Prepare the attributes in the program to be interfaced by the rest of the program
function prepareAttributes() {
    positionElements = 2; // 2 position elements per vertice (x, y)
    colorElements = 4; // 4 color elements per vertice (red, green, blue, alpha)
    totalElements = positionElements + colorElements; // The total number of elements per vertice (in this case 2 + 4)
    
    positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribPointer(positionAttributeLocation, positionElements, gl.FLOAT, gl.FALSE, totalElements * Float32Array.BYTES_PER_ELEMENT, 0);
    
    colorAttributeLocation = gl.getAttribLocation(program, "a_vert_color");
    gl.vertexAttribPointer(colorAttributeLocation, colorElements, gl.FLOAT, gl.FALSE, totalElements * Float32Array.BYTES_PER_ELEMENT, positionElements * Float32Array.BYTES_PER_ELEMENT);
    
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.enableVertexAttribArray(colorAttributeLocation);
}

// Keeps drawing triangles until we run out of vertices
function drawTriangles(vertices) {
    if (vertices.length >= totalElements) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length/totalElements);
    }
}

function createIceberg() {
    var colorTip = [255/255, 255/255, 255/255, 255/255];
    var colorBase = [51/255, 225/255, 225/255, 255/255];

    var speedVariation = 0.003;
    var horizontalVariationTip = 0.05;
    var horizontalVariationBase = 0.25;
    var verticalVariationTip = 0.3;
    var verticalVariationBase = 0.05;

    var verticalPos = 2 * (Math.random() - 0.5);
    var horizontalPos = Math.round(Math.random());
    if (horizontalPos == 0) {
        horizontalPos = -1;
    }
    
    var speed = (speedVariation*(Math.random()-0.5)) * horizontalPos * -1;
    var topPoint = [horizontalPos+(2*(Math.random()-0.5)*horizontalVariationTip), verticalPos+(Math.random()*verticalVariationTip)].concat(colorTip);
    var leftPoint = [horizontalPos-(Math.random()*horizontalVariationBase), verticalPos-(Math.random()*verticalVariationBase)].concat(colorBase);
    var rightPoint = [horizontalPos+(Math.random()*horizontalVariationBase), verticalPos-(Math.random()*verticalVariationBase)].concat(colorBase);
    
    return {'topPoint':topPoint, 'leftPoint':leftPoint, 'rightPoint':rightPoint, 'speed':speed};
}

// Render loop called every frame update
function render() {
    gl.useProgram(program);
    
    // Clears the screen and temporary buffers
    gl.clearColor(215/255, 235/255, 255/255, 255/255);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    var maxIcebergs = 70;

    // Create new icebergs
    while (icebergs.length < maxIcebergs)
    {
        icebergs.push(createIceberg());
    }

    // Move and render existing icebergs
    var vertices = [];

    var i = 0;
    while (i < icebergs.length) {
        icebergs[i].topPoint[0] += icebergs[i].speed;
        icebergs[i].leftPoint[0] += icebergs[i].speed;
        icebergs[i].rightPoint[0] += icebergs[i].speed;

        if (icebergs[i].rightPoint[0] < -1.2 || icebergs[i].leftPoint[0] > 1.2)
        {
            icebergs.splice(i, 1);
        }

        vertices = vertices.concat(icebergs[i].topPoint);
        vertices = vertices.concat(icebergs[i].leftPoint);
        vertices = vertices.concat(icebergs[i].rightPoint);

        i += 1;
    }

    // Draws the vertices declared in main
    drawTriangles(vertices);

    // Render the next frame
    requestAnimationFrame(render);
}

// Main, run on page load
function main() {
    createCanvas();
    
    vertexShader = createShader(gl.VERTEX_SHADER, document.getElementById("vertexShader").text);
    fragmentShader = createShader(gl.FRAGMENT_SHADER, document.getElementById("fragmentShader").text);
    
    program = createProgram(vertexShader, fragmentShader);
    
    vertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
    
    prepareAttributes();

    icebergs = [];

    // Begins the render loop
    requestAnimationFrame(render);
}

main();