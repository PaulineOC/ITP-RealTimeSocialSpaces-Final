/*
 *
 * This uses code from a THREE.js Multiplayer boilerplate made by Or Fleisher:
 * https://github.com/juniorxsound/THREE.Multiplayer
 * Aidan Nelson, April 2020
 *
 */

class Scene {
  constructor() {
    //THREE scene
    this.webGLScene = new THREE.Scene();
    this.cssScene = new THREE.Scene();

    //Utility
    this.width = window.innerWidth;
    this.height = window.innerHeight * 0.9;

    // lerp value to be used when interpolating positions and rotations
    this.lerpValue = 0;

    //THREE Camera
    this.camera = new THREE.PerspectiveCamera(
      50,
      this.width / this.height,
      0.1,
      5000
    );
    this.camera.position.set(0, 3, 6);
    this.webGLScene.add(this.camera);

    // create an AudioListener and add it to the camera
    this.listener = new THREE.AudioListener();
    this.camera.add(this.listener);

    //THREE WebGL renderer
    this.webGLRenderer = createWebGLRenderer(this.width, this.height);

    //PAULINE CSS Renderer:
    this.CSSRenderer = createCSSRenderer(this.width, this.height),
    // this.CSSRenderer.setSize(10, 10);
    console.log(this.CSSRenderer);


    //Push the canvas to the DOM
    let domElement = document.getElementById("canvas-container");
    domElement.appendChild(this.webGLRenderer.domElement);
    domElement.appendChild(this.CSSRenderer.domElement);

    console.log('set some id');
    console.log(this.CSSRenderer.domElement);

    

    // DEBUGGING: Test 3D Page

    this.CSSRenderer.domElement.addEventListener('keydown',(ev) => {
      console.log(ev.key);
      if(ev.key === 'p'){

        console.log('in test');
      }
  } );






    create3DPage(
     this.webGLScene, 
     this.cssScene,
     15,
     5,
    new THREE.Vector3(10, 3, 3),
    new THREE.Vector3(0, 0, 0),
    'https://www.demo2s.com/javascript/javascript-three-js-creating-a-clickable-3d-rendering-of-a-webpage-ins.html');


    // Add Controls
    //PAULINE:
    this.controls = new FirstPersonControls(this.webGLScene, this.camera, this.webGLRenderer);
    this.controls2 = new MyControls(this.webGLScene, this.camera, this.webGLRenderer);

    //Setup event listeners for events and handle the states
    window.addEventListener("resize", (e) => this.onWindowResize(e), false);

    // Helpers
    this.webGLScene.add(new THREE.GridHelper(500, 500));
    this.webGLScene.add(new THREE.AxesHelper(10));

    this.addLights();
    createEnvironment(this.webGLScene);

    // Start the loop
    this.frameCount = 0;
    this.update();
  }

  //////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////
  // Lighting 💡

  addLights() {
    this.webGLScene.add(new THREE.AmbientLight(0xffffe6, 0.7));

    const pointlight = new THREE.PointLight(0xaaaaaa);
    pointlight.position.set(0,0,0);
    this.webGLScene.add(pointlight);

  }

  //////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////
  // Clients 👫

  // add a client meshes, a video element and  canvas for three.js video texture
  addClient(id) {
    let videoMaterial = makeVideoMaterial(id);
    let otherMat = new THREE.MeshNormalMaterial();

    let head = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), [otherMat,otherMat,otherMat,otherMat,otherMat,videoMaterial]);

    // set position of head before adding to parent object


    // https://threejs.org/docs/index.html#api/en/objects/Group
    var group = new THREE.Group();
    group.add(head);

    //PAULINE: set Y position
    group.position.set(0, 0.25, 0);

    // add group to scene
    this.webGLScene.add(group);

    peers[id].group = group;
    
    peers[id].previousPosition = new THREE.Vector3();
    peers[id].previousRotation = new THREE.Quaternion();
    peers[id].desiredPosition = new THREE.Vector3();
    peers[id].desiredRotation = new THREE.Quaternion();
  }

  removeClient(id) {
    this.webGLScene.remove(peers[id].group);
  }

  // overloaded function can deal with new info or not
  updateClientPositions(clientProperties) {
    this.lerpValue = 0;
    for (let id in clientProperties) {
      if (id != mySocket.id) {
        peers[id].previousPosition.copy(peers[id].group.position);
        peers[id].previousRotation.copy(peers[id].group.quaternion);
        peers[id].desiredPosition = new THREE.Vector3().fromArray(
          clientProperties[id].position
        );
        peers[id].desiredRotation = new THREE.Quaternion().fromArray(
          clientProperties[id].rotation
        );
      }
    }
  }

  interpolatePositions() {
    this.lerpValue += 0.1; // updates are sent roughly every 1/5 second == 10 frames
    for (let id in peers) {
      if (peers[id].group) {
        peers[id].group.position.lerpVectors(peers[id].previousPosition,peers[id].desiredPosition, this.lerpValue);
        peers[id].group.quaternion.slerpQuaternions(peers[id].previousRotation,peers[id].desiredRotation, this.lerpValue);
      }
    }
  }

  updateClientVolumes() {
    for (let id in peers) {
      let audioEl = document.getElementById(id + "_audio");
      if (audioEl && peers[id].group) {
        let distSquared = this.camera.position.distanceToSquared(
          peers[id].group.position
        );

        if (distSquared > 500) {
          audioEl.volume = 0;
        } else {
          // from lucasio here: https://discourse.threejs.org/t/positionalaudio-setmediastreamsource-with-webrtc-question-not-hearing-any-sound/14301/29
          let volume = Math.min(1, 10 / distSquared);
          audioEl.volume = volume;
        }
      }
    }
  }

  //////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////
  // Interaction 🤾‍♀️

  getPlayerPosition() {
    // TODO: use quaternion or are euler angles fine here?
    return [
      [
        this.camera.position.x,
        this.camera.position.y,
        this.camera.position.z,
      ],
      [
        this.camera.quaternion._x,
        this.camera.quaternion._y,
        this.camera.quaternion._z,
        this.camera.quaternion._w,
      ],
    ];
  }

  //////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////
  // Rendering 🎥

  update() {
    requestAnimationFrame(() => this.update());
    this.frameCount++;

    updateEnvironment();

    if (this.frameCount % 25 === 0) {
      this.updateClientVolumes();
    }

    this.interpolatePositions();


    this.renderWebGL();
    this.renderCSS3D();

    //Controls:
    this.controls.update();
    this.controls2.update();
  }

  renderWebGL() {
    this.webGLRenderer.render(this.webGLScene, this.camera);
  }

  renderCSS3D() {
    this.CSSRenderer.render(this.cssScene, this.camera);
  }

  //////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////
  // Event Handlers 🍽

  onWindowResize(e) {
    this.width = window.innerWidth;
    this.height = Math.floor(window.innerHeight * 0.9);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.webGLRenderer.setSize(this.width, this.height);
  }
}


//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// Utilities

function makeVideoMaterial(id) {
  let videoElement = document.getElementById(id + "_video");
  let videoTexture = new THREE.VideoTexture(videoElement);

  let videoMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture,
    overdraw: true,
    side: THREE.DoubleSide,
  });

  return videoMaterial;
}



function createPlane(w, h, position, rotation) {
  var material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    opacity: 0.0,
    side: THREE.DoubleSide
  });
  var geometry = new THREE.PlaneGeometry(w, h);
  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = position.x;
  mesh.position.y = position.y;
  mesh.position.z = position.z;

  mesh.rotation.x = rotation.x;
  mesh.rotation.y = rotation.y;
  mesh.rotation.z = rotation.z;
  return mesh;
}





// DEBUGGING CSS3D Render

function createWebGLRenderer(width, height) {
  var webGLRenderer = new THREE.WebGLRenderer({
    alpha: true,
    antialiasing: true
  });
  //Alice Blue = ECF8FF (similar to light blue)
  webGLRenderer.setClearColor(0xECF8FF);
  webGLRenderer.setSize(width, height);
  // glRenderer.setPixelRatio(window.devicePixelRatio);
  webGLRenderer.domElement.style.position = 'absolute';
  webGLRenderer.domElement.style.zIndex = 1;
  webGLRenderer.domElement.style.top = 0;
  return webGLRenderer;
}


function createCSSRenderer(width, height) {
  var cssRenderer = new THREE.CSS3DRenderer();
  cssRenderer.setSize(width, height);
  cssRenderer.domElement.style.position = 'absolute';
  cssRenderer.domElement.style.zIndex = 10;
  cssRenderer.domElement.style.top = 0;
  cssRenderer.domElement.style.pointerEvents = "none";
  return cssRenderer;
}

function createCSSObject(w, h, position, rotation, url) {
  const iframe = document.createElement( 'iframe' );
  iframe.width = '150px';
  iframe.height = '150x';
  iframe.style.border = '0px';
  iframe.src = url;

  iframe.onclick = () => {
    console.log('click in iframe');
  }
  iframe.addEventListener('keydown', () => {
    console.log('in iframe keydown');
  });

  var CSSObject = new THREE.CSS3DObject(iframe);
  CSSObject.position.x = position.x;
  CSSObject.position.y = position.y;
  CSSObject.position.z = position.z;

  CSSObject.rotation.x = rotation.x;
  CSSObject.rotation.y = rotation.y;
  CSSObject.rotation.z = rotation.z;


  CSSObject.element.onclick = function(event) {
    event.preventDefault();
     console.log("HTML page clicked!");
  }
  return CSSObject;
}

function create3DPage(webGLScene, cssScene, w, h, position, rotation, url) {
  var plane = createPlane(
      w, h,
      position,
      rotation);
      webGLScene.add(plane);
  var cssObject = createCSSObject(
      w, h,
      position,
      rotation,
      url);
  cssScene.add(cssObject);

  console.log(cssScene);
}