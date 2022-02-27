let myMesh;

const wallThickness = 0.25;

const wallSettings = {
  wallExtrudeSettings: {
    steps: 1,
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0,
    bevelSize: 0,
    bevelSegments: 1,
    //Wall Thickness = bevel thickness
    bevelOffset: 0,
  },
  wallHeight: 6, 
  frontBackWallInteriorLength: 25,
  frontBackWallExteriorLength: 26,
  sideWallInteriorLength: 18,
  sideWallExteriorLength: 19,
  exteriorTexturePath: '../assets/brick.jpeg',
  backWallInteriorPos: {
    x: -0.5,
    z: -0.5,
  },
  backWallExteriorPos: {
    x: -1,
    z: -1,
  },
  frontWallInteriorPos: {
    x: -0.5,
    z: 18,
  },
  frontWallExteriorPos: {
    x: -1,
    z: 18.5,
  },
  leftWallInteriorPos: {
    x: 0,
    z: 0,
  },
  leftWallExteriorPos: {
    x: -0.5,
    z: -0.5,
  },
  rightWallInteriorPos: {
    x: 24.5,
    z: 0,
  },
  rightWallExteriorPos: {
    x: 25,
    z: -0.5,
  },
};

const frontWallDoorSettings =  {
  length: 3,
  height: 4,
  interiorDistanceFromWall: 10.5,
  exteriorDistanceFromWall: 11,
  distanceFromFloor: 0,
};

const frontWallWindowSettings = {
  length: 3,
  height: 1.5,
  interiorDistanceFromWall: 4,
  exteriorDistanceFromWall:4.5,
  distanceFromFloor: 1.75,
};

const sideWallWindowSettings = {
  distanceFromFloor: 1.75,
  length: 3,
  height: 1.5,
  window1: {
    interiorDistanceFromWall: 3,
    exteriorDistanceFromWall: 3.5,
  },
  window2: {
    interiorDistanceFromWall: 12,
    exteriorDistanceFromWall: 12.5,
  },
};

const floorSettings = {
  floorSize: {
    length: 24, 
    width: 18,
  },
  floorPosition: {
    x: 12,
    z: 9, 
  },
  rotation: -Math.PI / 2,
  color: 0xffff99,
};

function createEnvironment(scene) {
  console.log("Adding environment");

  let myGeometry = new THREE.SphereGeometry(3, 12, 12);
  let texture = new THREE.TextureLoader().load(wallSettings.exteriorTexturePath);
  let myMaterial = new THREE.MeshBasicMaterial({ map: texture });

  myMesh = new THREE.Mesh(myGeometry, myMaterial);
  myMesh.position.set(5, 2, 5);
  //scene.add(myMesh);

  scene.add(createFloor());
 
  //MeshPhongMaterial
  const exteriorWallTexture = new THREE.TextureLoader().load(wallSettings.exteriorTexturePath);
  const exteriorWallMaterial = new THREE.MeshPhongMaterial({ map: exteriorWallTexture });
  const interiorWallMaterial = new THREE.MeshPhongMaterial( { color: 0xeae3c9 } );
  exteriorWallMaterial.side = THREE.DoubleSide;
  interiorWallMaterial.side = THREE.DoubleSide;
  
  const frontBackWallMeshes = createFrontAndBackWall(exteriorWallMaterial, interiorWallMaterial);
  const { backWallExterior, backWallInterior, frontWallExterior, frontWallInterior } = frontBackWallMeshes;

  const sideWallMeshes = createSideWalls(exteriorWallMaterial, interiorWallMaterial);
  const { leftWallExterior, leftWallInterior, rightWallExterior, rightWallInterior } = sideWallMeshes;

  scene.add(backWallInterior);
  scene.add(backWallExterior);

  scene.add(frontWallInterior);
  scene.add(frontWallExterior);

  scene.add(leftWallInterior);
  scene.add(leftWallExterior);

  scene.add(rightWallInterior);
  scene.add(rightWallExterior);
}


function createFrontAndBackWall(exteriorMaterial, interiorMaterial){

  const interiorWallShape = new THREE.Shape().moveTo(0, 0)
  .lineTo(0, wallSettings.wallHeight)
  .lineTo(wallSettings.frontBackWallInteriorLength, wallSettings.wallHeight)
  .lineTo(wallSettings.frontBackWallInteriorLength, 0)
  .lineTo(0, 0);

  const exteriorWallShape = new THREE.Shape().moveTo(0, 0)
  .lineTo(0, wallSettings.wallHeight)
  .lineTo(wallSettings.frontBackWallExteriorLength, wallSettings.wallHeight)
  .lineTo(wallSettings.frontBackWallExteriorLength, 0)
  .lineTo(0, 0);

  //Back Wall
  const backWallInteriorGeometry = new THREE.ExtrudeBufferGeometry(interiorWallShape, wallSettings.wallExtrudeSettings);
  const backWallExteriorGeometry = new THREE.ExtrudeBufferGeometry(exteriorWallShape, wallSettings.wallExtrudeSettings);

  const backWallExteriorMesh = new THREE.Mesh(backWallExteriorGeometry, exteriorMaterial);
  const backWallInteriorMesh = new THREE.Mesh(backWallInteriorGeometry, interiorMaterial);

  backWallExteriorMesh.position.set(wallSettings.backWallExteriorPos.x,0,wallSettings.backWallExteriorPos.z);
  backWallInteriorMesh.position.set(wallSettings.backWallInteriorPos.x,0,wallSettings.backWallInteriorPos.z);

  //Front Wall

  const frontWallInteriorShape = interiorWallShape.clone();
  const frontWallExteriorShape = exteriorWallShape.clone();

  frontWallInteriorShape.holes.push(createDoor(
    frontWallDoorSettings.interiorDistanceFromWall,
    frontWallDoorSettings.distanceFromFloor,
    frontWallDoorSettings.length,
    frontWallDoorSettings.height,
  ));

  frontWallExteriorShape.holes.push(createDoor(
    frontWallDoorSettings.exteriorDistanceFromWall,
    frontWallDoorSettings.distanceFromFloor,
    frontWallDoorSettings.length,
    frontWallDoorSettings.height,
  ));

  frontWallInteriorShape.holes.push(createWindow(
    frontWallWindowSettings.interiorDistanceFromWall,
    frontWallWindowSettings.distanceFromFloor,
    frontWallWindowSettings.length,
    frontWallWindowSettings.height,
  ));

  frontWallExteriorShape.holes.push(createWindow(
    frontWallWindowSettings.exteriorDistanceFromWall,
    frontWallWindowSettings.distanceFromFloor,
    frontWallWindowSettings.length,
    frontWallWindowSettings.height,
  ));


  const frontWallInteriorGeometry = new THREE.ExtrudeBufferGeometry(frontWallInteriorShape, wallSettings.wallExtrudeSettings);
  const frontWallInteriorMesh = new THREE.Mesh(frontWallInteriorGeometry, interiorMaterial);
  frontWallInteriorMesh.position.set(wallSettings.frontWallInteriorPos.x,0,wallSettings.frontWallInteriorPos.z);

  const frontWallExteriorGeometry = new THREE.ExtrudeBufferGeometry(frontWallExteriorShape, wallSettings.wallExtrudeSettings);
  const frontWallExteriorMesh = new THREE.Mesh(frontWallExteriorGeometry, exteriorMaterial);
  frontWallExteriorMesh.position.set(wallSettings.frontWallExteriorPos.x,0,wallSettings.frontWallExteriorPos.z);

  return {
    backWallExterior: backWallExteriorMesh,
    backWallInterior: backWallInteriorMesh,
    frontWallExterior: frontWallExteriorMesh,
    frontWallInterior: frontWallInteriorMesh,
  };
};


function createDoor(startingX, startingY, length, height){
  const doorway = new THREE.Path();
  
  doorway.moveTo(startingX, startingY);
  doorway.lineTo(startingX, startingY + height);
  doorway.lineTo(startingX + length, startingY + height);
  doorway.lineTo(startingX + length, startingY);
  doorway.lineTo(startingX, startingY);

  return doorway;
}

function createWindow(startingX, startingY, length, height){
  const window = new THREE.Path();

  window.moveTo(startingX, startingY);
  window.lineTo(startingX, startingY + height);
  window.lineTo(startingX + length, startingY + height);
  window.lineTo(startingX + length, startingY);
  window.lineTo(startingX, startingY);

  return window;
}


function createSideWalls(exteriorMaterial, interiorMaterial){
  const interiorWallShape = new THREE.Shape().moveTo(0, 0)
  .lineTo(0, wallSettings.wallHeight)
  .lineTo(wallSettings.sideWallInteriorLength, wallSettings.wallHeight)
  .lineTo(wallSettings.sideWallInteriorLength, 0)
  .lineTo(0, 0);

  const exteriorWallShape = new THREE.Shape().moveTo(0, 0)
  .lineTo(0, wallSettings.wallHeight)
  .lineTo(wallSettings.sideWallExteriorLength, wallSettings.wallHeight)
  .lineTo(wallSettings.sideWallExteriorLength, 0)
  .lineTo(0, 0);

  interiorWallShape.holes.push(createWindow(
    sideWallWindowSettings.window1.interiorDistanceFromWall,
    sideWallWindowSettings.distanceFromFloor,
    sideWallWindowSettings.length,
    sideWallWindowSettings.height,
  ));

  interiorWallShape.holes.push(createWindow(
    sideWallWindowSettings.window2.interiorDistanceFromWall,
    sideWallWindowSettings.distanceFromFloor,
    sideWallWindowSettings.length,
    sideWallWindowSettings.height,
  ));

  exteriorWallShape.holes.push(createWindow(
    sideWallWindowSettings.window1.exteriorDistanceFromWall,
    sideWallWindowSettings.distanceFromFloor,
    sideWallWindowSettings.length,
    sideWallWindowSettings.height,
  ));

  exteriorWallShape.holes.push(createWindow(
    sideWallWindowSettings.window2.exteriorDistanceFromWall,
    sideWallWindowSettings.distanceFromFloor,
    sideWallWindowSettings.length,
    sideWallWindowSettings.height,
  ));

  const interiorWallGeometry = new THREE.ExtrudeBufferGeometry(interiorWallShape, wallSettings.wallExtrudeSettings);
  const exteriorWallGeometry = new THREE.ExtrudeBufferGeometry(exteriorWallShape, wallSettings.wallExtrudeSettings);

  const leftSideWallInteriorMesh = new THREE.Mesh(interiorWallGeometry, new THREE.MeshPhongMaterial( { color: 0x00ff00 } ));
  const leftSideWallExteriorMesh = new THREE.Mesh(exteriorWallGeometry, exteriorMaterial);

  leftSideWallInteriorMesh.rotation.set(0, Math.PI * -0.5,0);
  leftSideWallInteriorMesh.position.set(wallSettings.leftWallInteriorPos.x,0,wallSettings.leftWallInteriorPos.z);

  leftSideWallExteriorMesh.rotation.set(0, Math.PI * -0.5,0);
  leftSideWallExteriorMesh.position.set(wallSettings.leftWallExteriorPos.x,0,wallSettings.leftWallExteriorPos.z);

  const rightWallInteriorMesh = leftSideWallInteriorMesh.clone();
  rightWallInteriorMesh.position.set(wallSettings.rightWallInteriorPos.x,0,wallSettings.rightWallInteriorPos.z);

  const rightWallExteriorMesh = leftSideWallExteriorMesh.clone();
  rightWallExteriorMesh.position.set(wallSettings.rightWallExteriorPos.x,0,wallSettings.rightWallExteriorPos.z);

  return {
    leftWallExterior: leftSideWallExteriorMesh,
    leftWallInterior: leftSideWallInteriorMesh,
    rightWallInterior: rightWallInteriorMesh,
    rightWallExterior: rightWallExteriorMesh,
  };

}


function createFloor() {
  const ground = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(floorSettings.floorSize.length,floorSettings.floorSize.width), 
    new THREE.MeshStandardMaterial({ color: floorSettings.color }));
  ground.rotateX(floorSettings.rotation);
  ground.position.set(floorSettings.floorPosition.x, 0, floorSettings.floorPosition.z);
  return ground;
};


function updateEnvironment(scene) {
  myMesh.position.x += 0.01;
}


//Test code: 
function sideWallWithWindow(){

  const group = new THREE.Group();

  const rectLength = 24;
  const rectWidth = 6;

  const mainWall = new THREE.Shape().moveTo(0, 0).lineTo(0, rectWidth).lineTo(rectLength, rectWidth).lineTo(rectLength, 0).lineTo(0, 0);

  // Window Hole
  const window = new THREE.Path();
  const windowLength = 3;
  const windowHeight = 2;

  const windowDistanceFromWall = 2;
  const windowDistanceFromFloor = 1;

  window.moveTo(windowDistanceFromWall,windowDistanceFromFloor);
  window.lineTo(windowDistanceFromWall,windowDistanceFromFloor+windowHeight);
  window.lineTo(windowDistanceFromWall+windowLength, windowDistanceFromFloor+windowHeight );
  window.lineTo(windowDistanceFromWall+windowLength,windowDistanceFromFloor );
  window.lineTo(windowDistanceFromWall, windowDistanceFromFloor);

  mainWall.holes.push(window);

  const extrudeSettings = {
    depth: 0.25,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 5,
    bevelThickness: 1,
    bevelSize: 0,
    bevelOffset: 0,
  };

  const geometry = new THREE.ExtrudeBufferGeometry(mainWall, extrudeSettings);
  // geometry.center();
  // geometry.rotateX(Math.PI * -0.5);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x00ff00,
  });
  material.side = THREE.DoubleSide;

  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

return group  ;
}