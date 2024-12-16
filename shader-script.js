// Get the canvas element
const canvas = document.getElementById('shaderCanvas');
const gl = canvas.getContext('webgl');

// Resize the canvas to fit the screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// GLSL Fragment Shader Code
const fragmentShaderSource = `
precision mediump float;

uniform float iTime;
uniform vec2 iResolution;

#define t iTime
#define r iResolution.xy

void mainImage( out vec4 fragColor, in vec2 fragCoord ){
    vec3 c;
    float l, z = t;
    for(int i = 0; i < 3; i++) {
        vec2 uv, p = fragCoord.xy / r;
        uv = p;
        p -= 0.5;
        p.x *= r.x / r.y;
        z += 0.07;
        l = length(p);
        uv += p / l * (sin(z) + 1.0) * abs(sin(l * 9.0 - z - z));
        c[i] = 0.01 / length(mod(uv, 1.0) - 0.5);
    }
    fragColor = vec4(c / l, t);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

// GLSL Vertex Shader Code
const vertexShaderSource = `
attribute vec4 aPosition;
void main() {
    gl_Position = aPosition;
}
`;

// Compile Shader
function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Create Shaders
const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

// Create Shader Program
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
}

// Use Shader Program
gl.useProgram(program);

// Define Geometry
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1
]), gl.STATIC_DRAW);

// Bind Position Attribute
const positionLocation = gl.getAttribLocation(program, "aPosition");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// Set Uniform Locations
const iTimeLocation = gl.getUniformLocation(program, "iTime");
const iResolutionLocation = gl.getUniformLocation(program, "iResolution");

// Set Resolution
gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);

// Animation Loop
function render(time) {
    gl.uniform1f(iTimeLocation, time * 0.001); // Convert to seconds
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
}

// Adjust on Window Resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
});

// Start Rendering
gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
requestAnimationFrame(render);
