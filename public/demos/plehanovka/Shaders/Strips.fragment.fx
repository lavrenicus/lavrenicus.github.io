precision highp float;

// Varying
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;

// Uniforms
uniform mat4 world;
uniform vec3 stripesColor;

// Refs
uniform vec3 cameraPosition;
uniform sampler2D textureSampler;

void main(void) {
    vec3 vLightPosition = vec3(0,20,10);

    // World values
    vec3 vPositionW = vec3(world * vec4(vPosition, 1.0));
    vec3 vNormalW = normalize(vec3(world * vec4(vNormal, 0.0)));
    vec3 viewDirectionW = normalize(cameraPosition - vPositionW);

    // Light
    vec3 lightVectorW = normalize(vLightPosition - vPositionW);
    vec3 color = vec3(texture2D(textureSampler, vUV/5.0).b);

    // diffuse
    float ndl = max(0., dot(vNormalW, lightVectorW));


    gl_FragColor = vec4(color + stripesColor, 1.);
}