// controls implementation from https://github.com/yorb-club/YORB2020
// includes simple collision detection
// just add meshes to layer 3 to have them become collidable!

class FirstPersonControls {
    constructor(scene, camera, renderer, experienceState) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        //Pauline Variables
        this.experienceState = experienceState;
        this.speechSynth = window.speechSynthesis;
        this.keys = {};



        this.paused = false

        this.cameraHeight = 1.5

        this.raycaster = new THREE.Raycaster()

        this.setupControls()
        this.setupCollisionDetection()

        this.velocity.y = 0

        this.gravity = true;  // we'll change this once we click 'Enter'

        // variables for drag controls
        this.onPointerDownPointerX = 0
        this.onPointerDownPointerY = 0
        this.lon = 180
        this.lat = 0
        this.phi = 0
        this.theta = 0;
        this.isUserInteracting = false
        this.camera.target = new THREE.Vector3(0, 0, 0);

        this.snapCamera = this.snapCamera.bind(this);
        this.setRaycast = this.setRaycast.bind(this);
        this.setClosestPainting = this.setClosestPainting.bind(this);

        this.canInteractWithPainting  = this.canInteractWithPainting.bind(this);

    }

    pause() {
        this.paused = true
    }
    resume() {
        this.paused = false
    }

    // Set up pointer lock controls and corresponding event listeners
    setupControls() {
        let jumpSpeed = 12

        this.moveForward = false
        this.moveBackward = false
        this.moveLeft = false
        this.moveRight = false
        this.canJump = false

        this.prevTime = performance.now()
        this.velocity = new THREE.Vector3()
        this.direction = new THREE.Vector3()

        document.addEventListener(
            'keydown',
            (event) => {
                switch (event.keyCode) {
                    case 38: // up
                    case 87: // w
                        this.moveForward = true
                        break

                    case 37: // left
                    case 65: // a
                        this.moveLeft = true
                        break

                    case 40: // down
                    case 83: // s
                        this.moveBackward = true
                        break

                    case 39: // right
                    case 68: // d
                        this.moveRight = true
                        break;
                }
                this.keys[event.key] = true;
            
            },
        )

        document.addEventListener(
            'keyup',
            (event) => {
                switch (event.keyCode) {
                    case 38: // up
                    case 87: // w
                        this.moveForward = false
                        break

                    case 37: // left
                    case 65: // a
                        this.moveLeft = false
                        break

                    case 40: // down
                    case 83: // s
                        this.moveBackward = false
                        break

                    case 39: // right
                    case 68: // d
                        this.moveRight = false
                        break

                }
                this.keys[event.key] = false;
            },
            false
        )


        this.renderer.domElement.addEventListener(
            'mousedown',
            (e) => {
                this.onDocumentMouseDown(e)
            },
            false
        )
        this.renderer.domElement.addEventListener(
            'mousemove',
            (e) => {
                this.onDocumentMouseMove(e)
            },
            false
        )
        this.renderer.domElement.addEventListener(
            'mouseup',
            (e) => {
                this.onDocumentMouseUp(e)
            },
            false
        )
    }

    // clear control state every time we reenter the game
    clearControls() {
        this.moveForward = false
        this.moveBackward = false
        this.moveLeft = false
        this.moveRight = false
        this.canJump = false
        this.velocity.x = 0
        this.velocity.z = 0
        this.velocity.y = 0
    }

    update(camera, scene, frameCount) {

        this.detectCollisions();

        this.myControls(frameCount);

        this.updateControls(camera, scene, frameCount);

    }

    myControls(frameCount){

        if (this.keys[" "] && !this.experienceState.isModalOpen && this.experienceState.canOpenModal){
            console.log('Pressed SPACE: Opening modal');

            const workName = this.experienceState.closestPainting.object.userData.id;
            console.log(workName);
            openModal(workName);
            this.experienceState.isModalOpen = true;
        }

        //Close Modal
        if (this.keys["Escape"] && this.experienceState.isModalOpen) {
            console.log('Pressed ESC: Closing modal ');
            closeModal();
            this.experienceState.isModalOpen = false;
        }

        //Navigator - N for navigator
        if(this.keys["n"] && !this.experienceState.isModalOpen && !this.experienceState.isAlreadySpeaking){
            this.experienceState.isAlreadySpeaking = true;

            console.log('Pressed N: cueing navigation');

            this.snapCamera();

            this.setClosestPainting();

            if(!this.experienceState.closestPainting){
                return;
            }
            const { distance, object} = this.experienceState.closestPainting;

            // const distanceToBackWall = this.camera.position.z;
            // const distanceToFrontWall = 18 - this.camera.position.z;
            // const distanceToLeftWall = this.camera.position.x;
            // const distanceToRightWall = 24.5 - this.camera.position.x


            const { canOpenModal, currentlyFacingWall }  = this.experienceState;

            if(canOpenModal){
                const title = object.userData.id
                this.speak(`You are close enough to interact with the ${title} work. Press SPACE to learn more.`);
            }
            else{

                const artToWallText = {
                    back: 'the honeywell work',
                    left: 'the nellis work',
                    right: 'the rogers work',
                    front: 'the doorway'
                };
                const clickDistance = 1.75;
                let dist = Math.ceil(distance/clickDistance);
                
                const text = `You are currently facing the ${currentlyFacingWall} wall with ${artToWallText[currentlyFacingWall]}.
                It is about ${dist} forward clicks away`;
                this.speak(text);
            }

        }

        if(frameCount % 25 === 0){
            //Raycast for paintings
            this.setClosestPainting();
        }

    }


    //PAULINE:
    snapCamera(){
        console.log("Snapping Camera");
        const currRotation = this.camera.rotation;
        //Preserve camera level
        this.camera.rotation.x = 0;
        this.camera.rotation.z = 0;

    
        if(currRotation.y < Math.PI/4 &&  currRotation.y > -Math.PI/4){
            this.camera.rotation.y = 0;
            console.log('Snapping to back wall');
            this.experienceState.currentlyFacingWall = 'back';
        }
        
        if(currRotation.y < 3*Math.PI/4 &&  currRotation.y > Math.PI/4){
            console.log('Snapping to left wall');
            this.camera.rotation.y = Math.PI/2;
            this.experienceState.currentlyFacingWall = 'left';
        }

        if(currRotation.y < -Math.PI/4 &&  currRotation.y > -3*Math.PI/4){
            console.log('Snapping to right wall');
            this.camera.rotation.y = -Math.PI/2;
            this.experienceState.currentlyFacingWall = 'right';
        }

        if(currRotation.y < -3*Math.PI/4 ||  currRotation.y > 3*Math.PI/4){
            console.log('Snapping to front wall');
            this.camera.rotation.y = Math.PI;
            this.experienceState.currentlyFacingWall = 'front';
        }

        // TODO: Relculate long/lat
        // this.lon = (this.onPointerDownPointerX - event.clientX) * -0.3 + this.onPointerDownLon;
        // this.lat = (event.clientY - this.onPointerDownPointerY) * -0.3 + this.onPointerDownLat;

       // this.computeCameraOrientation();
    }

    setClosestPainting(){

        const raycast = new THREE.Raycaster();

        var matrix = new THREE.Matrix4()
        matrix.extractRotation(this.camera.matrix);
        var backwardDir = new THREE.Vector3(0, 0, 1).applyMatrix4(matrix);
        var forwardDir = backwardDir.clone().negate();

        const allPaintings = [];

        raycast.set(this.camera.position, forwardDir);
        const allIntersections = raycast.intersectObjects(this.scene.children);
        allIntersections.forEach((item)=>{
            if(item.object.userData.type === 'painting'){
                allPaintings.push(item);
            }
        });
        this.experienceState.closestPainting = allPaintings[0] ?? null;
        this.experienceState.canOpenModal = this.canInteractWithPainting(this.experienceState.closestPainting);
    }

    canInteractWithPainting(painting){
        if(painting === null || undefined) return false;
        const { distance } = painting;

        if(distance <= 8.5){

            const title = painting.object.userData.id;
            if(!this.experienceState.canOpenModal && !this.experienceState.isModalOpen){
                this.speak(`You are close enough to interact with the ${title} work. Press SPACE to learn more.`);
            }
            //Trigger speaking
            return true;
        }
        return false;
    }


    setRaycast(){

        const raycast = new THREE.Raycaster();

        var matrix = new THREE.Matrix4()
        matrix.extractRotation(this.camera.matrix);
        var backwardDir = new THREE.Vector3(0, 0, 1).applyMatrix4(matrix);
        var forwardDir = backwardDir.clone().negate();
        var rightDir = forwardDir.clone().cross(new THREE.Vector3(0, 1, 0)).normalize();
        var leftDir = rightDir.clone().negate();

        const allDirs = [ backwardDir, forwardDir, rightDir, leftDir];

        const allInteriorWalls = [];
        const allPaintings = [];

        for(let i = 0; i < allDirs.length; i++){
            raycast.set(this.camera.position, allDirs[i]);
            const allIntersections = raycast.intersectObjects(this.scene.children);
            allIntersections.forEach((item)=>{
                if(item.object.userData.type === 'interior-wall'){
                    allInteriorWalls.push(item);
                }
                if(item.object.userData.type === 'painting'){
                    allPaintings.push(item);
                }
            });
        }

        let closestPainting = null;
        if(allPaintings.length === 1){
            allPaintings[0];
        }

        if(allPaintings.length > 1){
            closestPainting = allPaintings.sort((eleA, eleB)=>{
                return eleA.distance - eleB.distance;
            })[0];
        }

        this.experienceState.closestPainting = closestPainting;

    }

    speak (text) {

        if (this.speechSynth.isSpeaking) {
            this.experienceState.isAlreadySpeaking = true;
            console.error("Already speaking");
            return;
        }
        let utterThis = new SpeechSynthesisUtterance(text);
        // https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance
        
        // utterThis.lang = "de-de";
        // utterThis.pitch = 1.2;
        // utterThis.rate = 0.2;
        this.speechSynth.speak(utterThis);

        utterThis.onend = () => {
            console.log('Done speaking');
            this.experienceState.isAlreadySpeaking = false;;
        }

    }

    // Original code

    getCollidables() {
        let collidableMeshList = []
        this.scene.traverse(function (object) {
            if (object.isMesh) {
                collidableMeshList.push(object)
            }
        })
        return collidableMeshList
    }

    // update for these controls, which are unfortunately not included in the controls directly...
    // see: https://github.com/mrdoob/three.js/issues/5566
    updateControls(camera, scene, frameCount) {

        let speed = 100;
        
        //PAULINE: Don't move if the modal is open
        if(this.experienceState && this.experienceState.isModalOpen){
            speed = 0;
        }

        var time = performance.now()
        var rawDelta = (time - this.prevTime) / 1000
        // clamp delta so lower frame rate clients don't end up way far away
        let delta = Math.min(rawDelta, 0.1)

        this.velocity.x -= this.velocity.x * 10.0 * delta
        this.velocity.z -= this.velocity.z * 10.0 * delta

        this.direction.z = Number(this.moveForward) - Number(this.moveBackward)
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft)
        this.direction.normalize() // this ensures consistent this.movements in all this.directions

        if (this.moveForward || this.moveBackward) {
            this.velocity.z -= this.direction.z * speed * delta
        }

        if (this.moveLeft || this.moveRight) {
            this.velocity.x -= this.direction.x * speed * delta
        }

        // left-right movement
        if ((this.velocity.x > 0 && !this.obstacles.left) || (this.velocity.x < 0 && !this.obstacles.right)) {
            this.camera.translateX(-this.velocity.x * delta)
        }

        // front-back movement
        if ((this.velocity.z > 0 && !this.obstacles.backward) || (this.velocity.z < 0 && !this.obstacles.forward)) {
            this.camera.position.add(this.getCameraForwardDirAlongXZPlane().multiplyScalar(-this.velocity.z * delta))
        }

        // up-down movement
        // origin point from which we cast a ray downwards
        // var origin = this.controls.getObject().position.clone()
        let origin = this.camera.position.clone()
        origin.set(origin.x, origin.y - this.cameraHeight, origin.z) // set origin to floor level

        // set the raycaster to check downward from this point
        this.raycaster.set(origin, new THREE.Vector3(0, -1, 0))

        var intersectionsDown = this.raycaster.intersectObjects(this.getCollidables())
        var onObject = intersectionsDown.length > 0 && intersectionsDown[0].distance < 0.25
        // Here we talkin bout gravity...
        // this.velocity.y -= 9.8 * 8.0 * delta; // 100.0 = mass

        // For double-jumping!
        if (this.camera.position.y > 1.7 && this.gravity) {
            // less gravity like when we begin
            this.gravity = 2.0
        } else if (this.camera.position.y <= 1.7 && this.gravity) {
            this.gravity = 8.0 // original value
        }

        // If gravity has been activated (like after pressing Enter)...
        if (this.gravity) {
            // Add gravity
            this.velocity.y -= 9.8 * this.gravity * delta // 100.0 = mass
        } else {
            // Otherwise don't and we stay suspended on the Y axis
            this.velocity.y = 0;
        }

        if (onObject === true) {
            this.velocity.y = Math.max(0, this.velocity.y)
            this.canJump = true
        }

        this.camera.position.y += this.velocity.y * delta

        if (this.camera.position.y < this.cameraHeight) {
            this.velocity.y = 0
            this.camera.position.y = this.cameraHeight
            this.canJump = true
        }

        this.prevTime = time;
    }



    getCameraForwardDirAlongXZPlane() {
        let forwardDir = new THREE.Vector3(0, 0, -1)
        // apply the camera's current rotation to that direction vector:
        forwardDir.applyQuaternion(this.camera.quaternion)

        let forwardAlongXZPlane = new THREE.Vector3(forwardDir.x, 0, forwardDir.z)
        forwardAlongXZPlane.normalize()

        return forwardAlongXZPlane
    }

    //==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
    //==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
    // Collision Detection 🤾‍♀️

    /*
     * setupCollisionDetection()
     *
     * Description:
     * This function sets up collision detection:
     * 	- creates this.collidableMeshList which will be populated by this.loadFloorModel function
     * 	- creates this.obstacles object which will be queried by player controls before performing movement
     * 	- generates arrays of collision detection points, from which we will perform raycasts in this.detectCollisions()
     *
     */
    setupCollisionDetection() {
        this.obstacles = {
            forward: false,
            backward: false,
            right: false,
            left: false,
        }
    }

    /*
     * detectCollisions()
     *
     * based on method shown here:
     * https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/Collision-Detection.html
     *
     * Description:
     * 1. Creates THREE.Vector3 objects representing the current forward, left, right, backward direction of the character.
     * 2. For each side of the cube,
     * 		- uses the collision detection points created in this.setupCollisionDetection()
     *		- sends a ray out from each point in the direction set up above
     * 		- if any one of the rays hits an object, set this.obstacles.SIDE (i.e. right or left) to true
     * 3. Give this.obstacles object to this.controls
     *
     * To Do: setup helper function to avoid repetitive code
     */
    detectCollisions() {
        // reset obstacles:
        this.obstacles = {
            forward: false,
            backward: false,
            right: false,
            left: false,
        }

        // TODO only use XZ components of forward DIR in case we are looking up or down while travelling forward
        // NOTE: THREE.PlayerControls seems to be backwards (i.e. the 'forward' controls go backwards)...
        // Weird, but this function respects those directions for the sake of not having to make conversions
        // https://github.com/mrdoob/three.js/issues/1606
        var matrix = new THREE.Matrix4()
        matrix.extractRotation(this.camera.matrix)
        var backwardDir = new THREE.Vector3(0, 0, 1).applyMatrix4(matrix)
        var forwardDir = backwardDir.clone().negate()
        var rightDir = forwardDir.clone().cross(new THREE.Vector3(0, 1, 0)).normalize()
        var leftDir = rightDir.clone().negate()

        // TODO more points around avatar so we can't be inside of walls
        // let pt = this.controls.getObject().position.clone()
        let pt = this.camera.position.clone()

        this.forwardCollisionDetectionPoints = [pt]
        this.backwardCollisionDetectionPoints = [pt]
        this.rightCollisionDetectionPoints = [pt]
        this.leftCollisionDetectionPoints = [pt]

        // check forward
        this.obstacles.forward = this.checkCollisions(this.forwardCollisionDetectionPoints, forwardDir)
        this.obstacles.backward = this.checkCollisions(this.backwardCollisionDetectionPoints, backwardDir)
        this.obstacles.left = this.checkCollisions(this.leftCollisionDetectionPoints, leftDir)
        this.obstacles.right = this.checkCollisions(this.rightCollisionDetectionPoints, rightDir)

        
    }

    checkCollisions(pts, dir) {
        // distance at which a collision will be detected and movement stopped (this should be greater than the movement speed per frame...)
        var detectCollisionDistance = 1

        for (var i = 0; i < pts.length; i++) {
            var pt = pts[i].clone()

            this.raycaster.set(pt, dir)
            this.raycaster.layers.set(3)
            var collisions = this.raycaster.intersectObjects(this.getCollidables())

            if (collisions.length > 0 && collisions[0].distance < detectCollisionDistance) {
                return true
            }
        }
        return false
    }

    onDocumentMouseDown(event) {
        this.onPointerDownPointerX = event.clientX
        this.onPointerDownPointerY = event.clientY
        this.onPointerDownLon = this.lon
        this.onPointerDownLat = this.lat
        this.isUserInteracting = true
    }

    onDocumentMouseMove(event) {
        if (this.isUserInteracting) {
            this.lon = (this.onPointerDownPointerX - event.clientX) * -0.3 + this.onPointerDownLon
            this.lat = (event.clientY - this.onPointerDownPointerY) * -0.3 + this.onPointerDownLat
            this.computeCameraOrientation()
        }
    }

    onDocumentMouseUp(event) {
        this.isUserInteracting = false
    }

    computeCameraOrientation() {
        this.lat = Math.max(-85, Math.min(85, this.lat))
        this.phi = THREE.Math.degToRad(90 - this.lat)
        this.theta = THREE.Math.degToRad(this.lon)
        this.camera.target.x = 500 * Math.sin(this.phi) * Math.cos(this.theta)
        this.camera.target.y = 500 * Math.cos(this.phi)
        this.camera.target.z = 500 * Math.sin(this.phi) * Math.sin(this.theta)
        this.camera.lookAt(this.camera.target)
    }
}//end of class

const openModal = (title) => {
    document.getElementById(title).classList.remove('hidden');
    document.getElementById('modal-background').classList.remove('hidden');
};

const closeModal = () => {
    document.getElementById('honeywell').classList.add('hidden');
    document.getElementById('nellis').classList.add('hidden');
    document.getElementById('rogers').classList.add('hidden');
    document.getElementById('modal-background').classList.add('hidden');
}
