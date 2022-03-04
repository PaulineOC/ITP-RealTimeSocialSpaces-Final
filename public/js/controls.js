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
        
        createModal(scene, camera, renderer);
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

            if(experienceState.isModalOpen){
                closeModal(avatar, scene, experienceState);
            }
            
            return {
                ...experienceState,
                isModalOpen: false,
            };
        }
        return experienceState;
    }
}

const createModal = (camera, scene, experienceState) => {
    const modalBackground = document.createElement('div');
    modalBackground.classList.add('modalBackground');
    modalBackground.id = 'modal-background';

    const modalContent = document.createElement('div');
    modalContent.classList.add('modalContent');

    const iFrame = document.createElement('iframe');
    iFrame.classList.add('iframe');

    //TEST: 
    // TODO 
    // iFrame.src = experienceState.modalLink;
    iFrame.src  = 'https://349xov.csb.app/';

    modalContent.appendChild(iFrame);
    modalBackground.appendChild(modalContent);
    document.body.append(modalBackground);

    modalBackground.classList.add('hidden');
}

const openModal = (camera, scene, experienceState) => {
    document.getElementById('modal-background').classList.remove('hidden');
};

const closeModal = () => {
    document.getElementById('modal-background').classList.add('hidden');
    console.log('in close modal');

}
