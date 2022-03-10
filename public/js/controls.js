console.log('Loaded MyControls');

class MyControls {
    constructor(scene, camera, renderer) {

        this.speechSynth = window.speechSynthesis;

        // set up my controls
        this.camera = camera;

        this.speed = 0;
        this.acceleration = 0;

        this.keys = {};

        document.body.addEventListener('keydown',(ev) => {
            console.log('in down');
            console.log(this.keys);
            this.keys[ev.key] = true;
            console.log(this.key);
        });

        document.body.addEventListener('keyup',(ev) => {
            console.log('in up');
            this.keys[ev.key] = false;
        });

        this.prevTime = performance.now();

        //Raycasting:
        this.raycaster = new THREE.Raycaster();
        this.speak = this.speak.bind(this);


    }

    update(scene, camera, experienceState){

        var time = performance.now();
        var rawDelta = (time - this.prevTime) / 1000;
        // clamp delta so lower frame rate clients don't end up way far away
        let delta = Math.min(rawDelta, 0.1);

        //Interact with art
    


        //Navigator - N for navigator
        if(this.keys["n"] && experienceState && !experienceState.isModalOpen){

            // set the raycaster to check downward from this point
            this.raycaster.set(origin, new THREE.Vector3(0, -1, 0));
            var intersectionsDown = this.raycaster.intersectObjects(scene.children)

            // console.log('Pressed N: cuing navigation');

            const distanceToBackWall = this.camera.position.z;
            const distanceToFrontWall = 18 - this.camera.position.z;
            const distanceToLeftWall = this.camera.position.x;
            const distanceToRightWall = 24.5 - this.camera.position.x

            const clicksToBackWall = distanceToBackWall;
            const clicksToFrontWall = distanceToFrontWall;
            const clicksToLeftWall = distanceToLeftWall;
            const clicksToRightWall = distanceToRightWall;

            console.log('camera pos:');

            // console.log(clicksToBackWall);
            // console.log(clicksToFrontWall);
            // console.log(clicksToLeftWall);
            // console.log(clicksToRightWall);


            this.snapCamera();


            this.nearPainting(scene);
        }

        this.prevTime = time;
        return {
            newScene: scene,
            newCamera: this.camera, 
            experienceState: experienceState
        };
    }

    snapCamera(){

        const currRotation = this.camera.rotation;
        //Preserve camera level
        this.camera.rotation.x = 0;
        this.camera.rotation.z = 0;

        if(currRotation.y < Math.PI/4 &&  currRotation.y > -Math.PI/4) 
            this.camera.rotation.y = 0;
        
        if(currRotation.y < 3*Math.PI/4 &&  currRotation.y > Math.PI/4) 
            this.camera.rotation.y = Math.PI/2;

        if(currRotation.y < -Math.PI/4 &&  currRotation.y > -3*Math.PI/4) 
            this.camera.rotation.y = -Math.PI/2;

        if(currRotation.y < -3*Math.PI/4 ||  currRotation.y > 3*Math.PI/4) 
            this.camera.rotation.y = Math.PI;
    }

    nearPainting(scene){
        console.log(scene);
        // const allChildren = this.scene.children.filter((item)=>{
        //     console.log(item.userData);
        //     return true;
        // });
    }

    speak (text) {
        if (this.speechSynth.speaking) {
            console.error("it's speaking already");
            return;
        }
        let utterThis = new SpeechSynthesisUtterance(text);
        // https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance
        
        // utterThis.lang = "de-de";
        // utterThis.pitch = 1.2;
        // utterThis.rate = 0.2;
        speechSynth.speak(utterThis);
    }
}

const openModal = (camera, scene, experienceState) => {
    document.getElementById('modal-background').classList.remove('hidden');
};

const closeModal = () => {
    document.getElementById('modal-background').classList.add('hidden');
    console.log('in close modal');
}