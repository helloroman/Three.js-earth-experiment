(function() {

    "use strict";

    var HEIGHT, WIDTH;
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, WIDTH / HEIGHT, 1, 10000);
    var renderer = new THREE.WebGLRenderer({canvas: document.getElementById('myCanvas'), antialias: true, alpha: true});
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(WIDTH, HEIGHT);

    // global vars
    var ambientLight, hemisphereLight, shadowLight, shadowLight2;


    function flipCoin() {
        var flip = Math.floor(Math.random()*2);

        if (flip === 1) {
            return Math.ceil(Math.random() * -700) -400;
        } else {
            return Math.ceil(Math.random() * 500) + 200;
        }
    }


    function handleWindowResize() {
        HEIGHT = window.innerHeight;
        WIDTH = window.innerWidth;
        renderer.setSize(WIDTH, HEIGHT);
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
    }

    function createLights() {
        ambientLight = new THREE.AmbientLight(0xE5D5D5);
        ambientLight.intensity = 0.5;
        hemisphereLight = new THREE.HemisphereLight(0x2F586D, 0x0E4A6D, .7);
        shadowLight = new THREE.DirectionalLight(0xE5CC20, .8);
        shadowLight2 = new THREE.DirectionalLight(0x136D69, 1);



        shadowLight.position.set(200, -350, 0);
        shadowLight2.position.set(-200,500,10);

        shadowLight.castShadow = true;
        shadowLight2.castShadow = true;

        shadowLight.shadow.camera.left = -1400;
        shadowLight.shadow.camera.right = 1400;
        shadowLight.shadow.camera.top = 1400;
        shadowLight.shadow.camera.bottom = -1400;
        shadowLight.shadow.camera.near = 1;
        shadowLight.shadow.camera.far = 1000;

        shadowLight.shadow.mapSize.width = 2048;
        shadowLight.shadow.mapSize.height = 2048;

        scene.add(ambientLight, hemisphereLight, shadowLight, shadowLight2);
    }

    var CreateDistantStars = function() {
        var particleCount = 10000,
            geom = new THREE.Geometry(),
            mat = new THREE.PointsMaterial({
                color: 0xffffff,
                size: 1
            });

        for (var p = 0; p < particleCount; p++){
            var pX = Math.random() * 3000 - 1500,
                pY = Math.random() * 3000 - 1500,
                pZ = flipCoin(),
                particle = new THREE.Vector3(pX, pY, pZ);

            geom.vertices.push(particle);
        }

        this.mesh = new THREE.Points(geom, mat);
    };

    var CreateCloseStars = function() {
        this.mesh = new THREE.Object3D();
        var geom = new THREE.SphereGeometry(2,6,6);
        this.mat = new THREE.MeshPhongMaterial({
            shininess: 100,
            specular: 0xffffff,
            transparent: true
        });

        var star;
        var startCount = 155;

        for (var i = 0; i < startCount; i++) {
            star = new THREE.Mesh(geom, this.mat);
            star.position.x = Math.random() * (WIDTH + 1) - WIDTH/2;
            star.position.y = Math.random() * (HEIGHT + 1) - HEIGHT/2;
            star.position.z = Math.floor(Math.random() * (1200 - 1)) - 1500;
            star.scale.set(.5,.5,.5);
            this.mesh.add( star );
        }
    };

    var closeStars;
    var distantStars

    function createCosmos() {
        distantStars = new CreateDistantStars();
        closeStars = new CreateCloseStars();
        closeStars.mesh.position.set(0,0,0);
        distantStars.mesh.position.set(0,0,0);
        scene.add(distantStars.mesh, closeStars.mesh);
    }

    var Cloud = function() {
        this.mesh = new THREE.Object3D();

        var geom = new THREE.DodecahedronGeometry(4,0);
        var mat = new THREE.MeshPhongMaterial({
            color: 0xD0E3EE,
            shininess: 10,
            shadng: THREE.FlatShading
        });

        var nBlocs = 5+Math.floor(Math.random()*7);

        for (var i = 0; i < nBlocs; i++) {
            var m = new THREE.Mesh(geom, mat);

            m.position.x = Math.sin(i)*3;
            m.position.y = Math.random()*1.1;
            m.position.z = Math.random()*0.7;
            m.rotation.y = Math.random()*Math.PI*1.5;
            m.rotation.z = Math.random()*Math.PI*1.5;

            var s = .3 + Math.random() * .3;
            m.scale.set(s,s,s);

            m.castShadow = true;

            this.mesh.add(m);
        }
    };

    var Sky = function() {
        this.mesh = new THREE.Object3D();

        var Pivot = function() {
            this.mesh = new THREE.Object3D();
            this.mesh.position.set(0,0,0);
        };

        this.mesh.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));

        this.nClouds = 23;

        var stepAngle = Math.PI*2 / this.nClouds;

        for(var i = 0; i<this.nClouds; i++) {
            var p = new Pivot();

            var c = new Cloud();

            var a = stepAngle*i;
            var h = 62 + Math.random()*5;

            c.mesh.position.y = Math.sin(a)*h;
            c.mesh.position.x = Math.cos(a)*h;

            // rotate the clouds facing the surface of planet
            c.mesh.rotation.z = a + Math.PI/2;

            var s = Math.random() * 2;
            c.mesh.scale.set(s,s,s);

            p.mesh.add( c.mesh );

            p.mesh.rotation.x = (Math.PI/180)*(Math.random()*360);
            p.mesh.rotation.y = -(Math.PI/180)*(Math.random()*360);
            p.mesh.rotation.z = (Math.PI/180)*(Math.random()*360);

            this.mesh.add ( p.mesh );
        }


    };

    var sky;

    function createSky() {
        sky = new Sky();
        sky.mesh.position.set(0,0,0);
        earth.mesh.add(sky.mesh);
    }

    var Earth = function() {
        this.mesh = new THREE.Object3D();

        // create earthSphere with ocean color
        var geom = new THREE.OctahedronGeometry(55, 2);
        var mat = new THREE.MeshPhongMaterial({
            shininess: 15,
            color: 0x004D6D,
            shading: THREE.FlatShading
        });
        var earthSphere = new THREE.Mesh(geom, mat);

        earthSphere.receiveShadow = true;


        //create northPole
        var northPoleGeom = new THREE.SphereGeometry(35,5,5);

        northPoleGeom.vertices[0].y -= 2;
        northPoleGeom.vertices[7].y += 5;
        northPoleGeom.vertices[8].y += 5;
        northPoleGeom.vertices[9].y += 5;
        northPoleGeom.vertices[10].y += 5;
        northPoleGeom.vertices[11].y += 5;

        var northPoleMat = new THREE.MeshPhongMaterial({
            shininess: 15,
            color: 0xF7F7F3,
            shading: THREE.FlatShading
        });

        var northPole = new THREE.Mesh(northPoleGeom, northPoleMat);
        northPole.position.set(0, 24, 0);


        //create southPole
        var southPoleGeom = new THREE.SphereGeometry(35,5,5);

        southPoleGeom.vertices[0].y -= 2;
        southPoleGeom.vertices[7].y += 5;
        southPoleGeom.vertices[8].y += 5;
        southPoleGeom.vertices[9].y += 5;
        southPoleGeom.vertices[10].y += 5;
        southPoleGeom.vertices[11].y += 5;

        southPoleGeom.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI));

        var southPoleMat = new THREE.MeshPhongMaterial({
            shininess: 15,
            color: 0xF7F7F3,
            shading: THREE.FlatShading
        });

        var southPole = new THREE.Mesh(southPoleGeom, southPoleMat)
        southPole.position.set(0, -24, 0);

        // create continent
        var contiGeom = new THREE.DodecahedronGeometry(25,1);

        contiGeom.mergeVertices();

        var l = contiGeom.vertices.length;

        for(var i = 0; i<l; i++) {
            var v = contiGeom.vertices[i];

            if( i < l/2 ) {
                v.y -= 5;
                v.z += Math.random()*5;
                v.x += Math.random()*5;
            } else {
                v.y += 7;
                v.z -= Math.random()*5;
                v.x -= Math.random()*5;
            }
        }

        contiGeom.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI));

        var contiMat = new THREE.MeshPhongMaterial({
            shininess: 15,
            color: 0x129B40,
            shading: THREE.FlatShading
        });

        var continent1 = new THREE.Mesh(contiGeom, contiMat);
        continent1.position.set(0,10,33);

        var continent2 = new THREE.Mesh(contiGeom, contiMat);
        continent2.position.set(0, -3, -33);
        continent2.rotation.x = (Math.PI/180)*6;

        var continent3 = new THREE.Mesh(contiGeom, contiMat);
        continent3.position.set(30, 15, 0);
        continent3.rotation.x = (Math.PI/180)*180;

        var continent4 = new THREE.Mesh(contiGeom, contiMat);
        continent4.position.set(28, -15, 0);
        continent4.rotation.x = (Math.PI/180)*270;
        continent4.rotation.y = (Math.PI/180)*50;

        var continent5 = new THREE.Mesh(contiGeom, contiMat);
        continent5.position.set(28, 0, 20);
        continent5.rotation.x = (Math.PI/180)*270;

        var continent6 = new THREE.Mesh(contiGeom, contiMat);
        continent6.position.set(-28, 20, 0);
        continent6.rotation.x = (Math.PI/180)*30;

        var atmopshereSphere = new THREE.SphereGeometry(75,20,20);
        var atmosphereMaterial = new THREE.MeshPhongMaterial({
            shininess: 100,
            shading: THREE.SmoothShading,
            color: 0x109EB4,
            transparent: true,
            opacity: .12
        });

        var atmosphere = new THREE.Mesh(atmopshereSphere, atmosphereMaterial);

        northPole.receiveShadow = true;
        southPole.receiveShadow = true;
        continent1.receiveShadow = true;
        continent2.receiveShadow = true;
        continent3.receiveShadow = true;
        continent4.receiveShadow = true;
        continent5.receiveShadow = true;
        continent6.receiveShadow = true;

        this.mesh.add( earthSphere, northPole, southPole, continent1, continent2, continent3, continent4, continent5, continent6, atmosphere);
    };


    var earth;

    function createEarth() {
        earth = new Earth();
        earth.mesh.position.set(0, 0, -150);
        scene.add(earth.mesh);
    }

    var Sputnik = function() {
        this.mesh = new THREE.Object3D();
        this.pivot = new THREE.Object3D();


        var mainModuleGeom = new THREE.CylinderGeometry(17, 13, 50, 7, 1);
        var mainModuleMat = new THREE.MeshPhongMaterial({
            shininess: 100,
            color: 0xB2B8AF,
            shading: THREE.FlatShading
        });

        var mainModule = new THREE.Mesh(mainModuleGeom, mainModuleMat);

        var wingsGeom = new THREE.BoxGeometry(300,20,1,11,1,1);

        for(var i = 0; i < wingsGeom.vertices.length; i++) {
            if (i % 2 === 0) {
                wingsGeom.vertices[i].z += 5;
            } else {
                wingsGeom.vertices[i].z -= 5;
            }
        }

        var wingsMat = new THREE.MeshPhongMaterial({
            shininess: 100,
            color: 0xD3C545,
            shading: THREE.FlatShading
        });


        var wings = new THREE.Mesh( wingsGeom, wingsMat ) ;
        wings.position.set(0,0,0);

        var antenaGeom = new THREE.CylinderGeometry(40, 10, 20, 10);


        var antenaMat = new THREE.MeshPhongMaterial({
            shininess: 100,
            color: 0xAED3BE,
            shading: THREE.FlatShading
        });

        var antena = new THREE.Mesh(antenaGeom, antenaMat);
        antena.position.y = 35;



        this.mesh.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/3));
        this.mesh.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI/3));

        this.mesh.scale.set(0.1,0.1,0.1);
        this.mesh.add( mainModule, wings, antena );

        this.pivot.add(this.mesh);

    };

    var sputnik;

    function createSatelites() {
        sputnik = new Sputnik();
        sputnik.mesh.position.set(-100,0,-100);
        earth.mesh.add(sputnik.pivot);
    }




    function initScene() {
        // var axisHelper = new THREE.AxisHelper( 1000 );
        // scene.add( axisHelper );


        camera.position.set(0, 40, 130);
        camera.rotation.x -= (Math.PI/180) * 7;
        createLights();
        createCosmos();
        createEarth();
        createSky();

        createSatelites();

        render();
    }

    function render() {
        closeStars.mesh.rotation.y += 0.00003;
        closeStars.mat.opacity = (Math.sin(Date.now() * 0.001))/2 + 0.5;
        distantStars.mesh.rotation.y += 0.00002;
        distantStars.mesh.rotation.x += 0.00003;
        distantStars.mesh.rotation.z += 0.00003;
        earth.mesh.rotation.y += 0.002;
        sky.mesh.rotation.y -= 0.0003;
        sky.mesh.rotation.z += 0.0003;

        sputnik.pivot.rotation.y -= 0.01;
        sputnik.pivot.rotation.x -= 0.001;
        // sputnik.pivot.rotation.z += 0.008;




        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    window.onload = initScene;
    window.addEventListener('resize', handleWindowResize, false);



})();
