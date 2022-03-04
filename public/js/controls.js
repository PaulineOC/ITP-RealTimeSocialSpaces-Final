console.log('Loaded MyControls');

class MyControls {
    constructor(scene, camera, renderer) {
        // set up my controls
        this.camera = camera;

        this.speed = 0;
        this.acceleration = 0;

        this.keys = {};

        document.body.addEventListener('keydown',(ev) => {
            this.keys[ev.key] = true;
        });

        document.body.addEventListener('keyup',(ev) => {
            this.keys[ev.key] = false;
        });
    }

    update(avatar, scene, experienceState){
        if (this.keys[" "]) {
            console.log('Pressed SPACE: Opening modal');

            if(!experienceState.isModalOpen){
                openModal(avatar, scene, experienceState);
            }
            
            return {
                ...experienceState,
                isModalOpen: true,
            };
        }

        if (this.keys["Escape"]) {
            console.log('Pressed ESC: Closing modal ');
            return {
                ...experienceState,
                isModalOpen: false,
            };
        }
        return experienceState;
    }
}

// function createCssObject(w, h, position, rotation, url) {
//     var html = [
//       '<div id="MAINPARENT"style="width:' + w + 'px; height:' + h + 'px;">',
//       '<iframe src="' + url + '" width="' + w + '" height="' + h + '">',
//       '</iframe>',
//       '</div>'
//     ].join('\n');
//     var div = document.createElement('div');
//     $(div).html(html);
//     var cssObject = new THREE.CSS3DObject(div);
//     cssObject.position.x = position.x;
//     cssObject.position.y = position.y;
//     cssObject.position.z = position.z;
//     cssObject.rotation.x = rotation.x;
//     cssObject.rotation.y = rotation.y;
//     cssObject.rotation.z = rotation.z;
//     cssObject.element.onclick = function() {
//       console.log("element clicked!");
//     }
//     return cssObject;
//   }

const openModal = (camera, scene, experienceState) => {

    const modalBackground = document.createElement('div');
    modalBackground.classList.add('modalBackground');

    // iFrameParent.classList.add('modal');

    const iFrame = document.createElement('iframe');
    iFrame.classList.add('modal');

    modalBackground.appendChild(iFrame);

    document.body.append(modalBackground);
};