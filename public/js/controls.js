console.log('hello controls');

class MyControls {
    constructor(scene, camera, renderer) {
        // set up my controls
        this.camera = camera;

        this.speed = 0;
        this.acceleration = 0;

        this.keys = {};

        document.body.addEventListener('keydown',(ev) => {
            this.keys[ev.key] = true;
        } )
        document.body.addEventListener('keyup',(ev) => {
            this.keys[ev.key] = false;
        } )
    }

    update(avatar, scene){

        if (this.keys["h"]) {
            console.log('Pressed H: Opening fake ');
           
        }
       
    }
}