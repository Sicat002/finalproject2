  // Import the THREE.js library for 3D rendering and animations
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// Import OrbitControls to allow interactive camera movement
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import Stats from "https://cdnjs.cloudflare.com/ajax/libs/stats.js/r17/Stats.min.js";
import { AsciiEffect } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/effects/AsciiEffect.js";
import dat from "https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/+esm";

// Once everything is loaded, we run our Three.js setup.
function init() {
    var stats = initStats();

    // Create scene, camera, and renderer
    var scene = new THREE.Scene();
     scene.background = new THREE.Color(0x000000); // Deep dark purple


    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
    var webGLRenderer = new THREE.WebGLRenderer();
    webGLRenderer.setClearColor(new THREE.Color(0x000000, 1.0));
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);

    // Set camera position
    camera.position.set(20, 40, 110);
    camera.lookAt(new THREE.Vector3(20, 30, 0));

    // Add renderer output to HTML
    document.getElementById("WebGL-output").appendChild(webGLRenderer.domElement);

    var controls = {
        size: 10,
        transparent: true,
        opacity: 0.6,
        color: 0xffffff,
        sizeAttenuation: true,
        redraw: function () {
            clearPointClouds();
            createPointClouds();
        }
    };

    var gui = new dat.GUI();
    gui.add(controls, 'size', 0.1, 20).step(0.1).onChange(controls.redraw);
    gui.add(controls, 'transparent').onChange(controls.redraw);
    gui.add(controls, 'opacity', 0, 1).step(0.05).onChange(controls.redraw);
    gui.addColor(controls, 'color').onChange(controls.redraw);
    gui.add(controls, 'sizeAttenuation').onChange(controls.redraw);

    function clearPointClouds() {
        scene.children.forEach(child => {
            if (child instanceof THREE.Points) scene.remove(child);
        });
    }

    function createPointCloud(texture, size, transparent, opacity, sizeAttenuation, color) {
        var geometry = new THREE.BufferGeometry();
        var positions = [];
        var velocities = [];

        var range = 150;
        for (var i = 0; i < 100; i++) {
            var x = Math.random() * range - range / 2;
            var y = Math.random() * range * 1.5;
            var z = Math.random() * range - range / 2;

            positions.push(x, y, z);
            velocities.push((Math.random() - 0.5) / 3, 0.1 + Math.random() / 5, (Math.random() - 0.5) / 3);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

        var material = new THREE.PointsMaterial({
            size: size,
            transparent: transparent,
            opacity: opacity,
            map: texture,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: sizeAttenuation,
            color: new THREE.Color(color)
        });

        var pointCloud = new THREE.Points(geometry, material);
        scene.add(pointCloud);
    }

    function createPointClouds() {
        var loader = new THREE.TextureLoader();
        var textures = [
            loader.load("o.png"),
            loader.load("y.png"),
            loader.load("gg.png"),
            loader.load("o.png")
        ];

        textures.forEach(texture => {
            createPointCloud(texture, controls.size, controls.transparent, controls.opacity, controls.sizeAttenuation, controls.color);
        });
    }

    function render() {
        stats.update();

        scene.children.forEach(child => {
            if (child instanceof THREE.Points) {
                var positions = child.geometry.attributes.position.array;
                var velocities = child.geometry.attributes.velocity.array;

                for (let i = 0; i < positions.length; i += 3) {
                    positions[i] += velocities[i];     // X movement
                    positions[i + 1] -= velocities[i + 1]; // Y movement
                    positions[i + 2] += velocities[i + 2]; // Z movement

                    // Reset particle when reaching the bottom
                    if (positions[i + 1] < 0) positions[i + 1] = 60;
                    if (positions[i] < -20 || positions[i] > 20) velocities[i] *= -1;
                    if (positions[i + 2] < -20 || positions[i + 2] > 20) velocities[i + 2] *= -1;
                }

                child.geometry.attributes.position.needsUpdate = true;
            }
        });

        requestAnimationFrame(render);
        webGLRenderer.render(scene, camera);
    }

    function initStats() {
        var stats = new Stats();
        stats.setMode(0);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.getElementById("Stats-output").appendChild(stats.domElement);
        return stats;
    }

    controls.redraw();
    render();
}

window.onload = init;
