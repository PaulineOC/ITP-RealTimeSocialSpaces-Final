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
  exteriorWallTexture.wrapS = THREE.RepeatWrapping;
  exteriorWallTexture.wrapT = THREE.RepeatWrapping;
  exteriorWallTexture.repeat.set(1,1);

  const exteriorWallMaterial = new THREE.MeshPhongMaterial({ map: exteriorWallTexture });

  const interiorWallMaterial = new THREE.MeshPhongMaterial( { color: 0xeae3c9 } );
  exteriorWallMaterial.side = THREE.DoubleSide;
  interiorWallMaterial.side = THREE.DoubleSide;
  
  const frontBackWallMeshes = createFrontAndBackWall(exteriorWallMaterial, interiorWallMaterial);
  const { backWallExterior, backWallInterior, frontWallExterior, frontWallInterior } = frontBackWallMeshes;

  const sideWallMeshes = createSideWalls(exteriorWallMaterial, interiorWallMaterial);
  const { leftWallExterior, leftWallInterior, rightWallExterior, rightWallInterior } = sideWallMeshes;

  const allPaintings = createPaintings();
  const { Honeywell, Nellis, Rogers } = allPaintings;

  scene.add(backWallInterior);
  scene.add(backWallExterior);

  scene.add(frontWallInterior);
  scene.add(frontWallExterior);

  scene.add(leftWallInterior);
  scene.add(leftWallExterior);

  scene.add(rightWallInterior);
  scene.add(rightWallExterior);

  scene.add(Honeywell);
  scene.add(Nellis);
  scene.add(Rogers);

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
  backWallExteriorMesh.userData.id = 'backWallExterior';
  backWallExteriorMesh.userData.type = 'exterior-wall';

  const backWallInteriorMesh = new THREE.Mesh(backWallInteriorGeometry, interiorMaterial);
  backWallInteriorMesh.userData.id = 'backWallInterior';
  backWallInteriorMesh.userData.type = 'interior-wall';

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
  frontWallInteriorMesh.userData.id = 'frontWallInterior';
  frontWallInteriorMesh.userData.type = 'interior-wall';
  frontWallInteriorMesh.position.set(wallSettings.frontWallInteriorPos.x,0,wallSettings.frontWallInteriorPos.z);

  const frontWallExteriorGeometry = new THREE.ExtrudeBufferGeometry(frontWallExteriorShape, wallSettings.wallExtrudeSettings);
  const frontWallExteriorMesh = new THREE.Mesh(frontWallExteriorGeometry, exteriorMaterial);
  frontWallExteriorMesh.userData.type = 'exterior-wall';

  frontWallExteriorMesh.position.set(wallSettings.frontWallExteriorPos.x,0,wallSettings.frontWallExteriorPos.z);

  return {
    backWallExterior: backWallExteriorMesh,
    backWallInterior: backWallInteriorMesh,
    frontWallExterior: frontWallExteriorMesh,
    frontWallInterior: frontWallInteriorMesh,
  };
}

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
  leftSideWallInteriorMesh.userData.id = 'leftSideWallInterior';
  leftSideWallInteriorMesh.userData.type = 'interior-wall';
  leftSideWallInteriorMesh.rotation.set(0, Math.PI * -0.5,0);
  leftSideWallInteriorMesh.position.set(wallSettings.leftWallInteriorPos.x,0,wallSettings.leftWallInteriorPos.z);


  leftSideWallExteriorMesh.userData.id = 'leftSideWallExterior';
  leftSideWallExteriorMesh.userData.type = 'exterior-wall';
  leftSideWallExteriorMesh.rotation.set(0, Math.PI * -0.5,0);
  leftSideWallExteriorMesh.position.set(wallSettings.leftWallExteriorPos.x,0,wallSettings.leftWallExteriorPos.z);

  const rightWallInteriorMesh = leftSideWallInteriorMesh.clone();
  rightWallInteriorMesh.userData.id = 'rightWallInterior';
  rightWallInteriorMesh.userData.type = 'interior-wall';

  rightWallInteriorMesh.position.set(wallSettings.rightWallInteriorPos.x,0,wallSettings.rightWallInteriorPos.z);

  const rightWallExteriorMesh = leftSideWallExteriorMesh.clone();
  rightWallExteriorMesh.userData.id = 'rightSideWallExterior';
  rightWallExteriorMesh.userData.type = 'exterior-wall';
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
}

function createPaintings(scene){
  let textureHoneywell = new THREE.TextureLoader().load('../assets/Honeywell.png',);
  let materialHoneywelll = new THREE.MeshBasicMaterial({ map: textureHoneywell });

  let textureNellis = new THREE.TextureLoader().load('../assets/Nellis.png',);
  let materialNellis = new THREE.MeshBasicMaterial({ map: textureNellis });

  let textureRogers = new THREE.TextureLoader().load('../assets/Rogers.png',);
  let materialRogers = new THREE.MeshBasicMaterial({ map: textureRogers });

  const Honeywell = createPaintingMesh(
    6,
    4.291, 
    0.5,
    {x: 11.5, y: 2.5, z: 0.25},
    {x: 0, y: 0, z: 0},
    materialHoneywelll,
  );
  Honeywell.userData.id = 'honeywell';
  Honeywell.userData.type = 'painting';

  const Nellis = createPaintingMesh(
    5,
    4.189, 
    0.5,
    {x: 0.25, y: 2.5, z: 9},
    {x: 0, y: Math.PI/2, z: 0},
    materialNellis,
  );
  Nellis.userData.id = 'nellis';
  Nellis.userData.type = 'painting';

  const Rogers = createPaintingMesh(
    2.6887,
    4, 
    0.5,
    {x: 23.75, y: 2.5, z: 9},
    {x: 0, y: -Math.PI/2, z: 0},
    materialRogers,
  );

  Rogers.userData.id = 'rogers';
  Rogers.userData.type = 'painting';


  return {
    Honeywell, 
    Nellis,
    Rogers
  };

}

function createPaintingMesh(w, h, d,  position, rotation, material) {

  var boxMaterials = [
    new THREE.MeshBasicMaterial( { color: 0xffffff } ),
    new THREE.MeshBasicMaterial( { color: 0xffffff } ),
    new THREE.MeshBasicMaterial( { color: 0xffffff } ),
    new THREE.MeshBasicMaterial( { color: 0xffffff } ),
    material,
    new THREE.MeshBasicMaterial( { color: 0xffffff } ),
  ];

  const geometry = new THREE.BoxGeometry( w, h, d);
  var mesh = new THREE.Mesh(geometry, boxMaterials);

  mesh.position.x = position.x;
  mesh.position.y = position.y;
  mesh.position.z = position.z;

  mesh.rotation.x = rotation.x;
  mesh.rotation.y = rotation.y;
  mesh.rotation.z = rotation.z;
  return mesh;

}

function createPlane(w, h, position, rotation, material) {
  material.side = THREE.DoubleSide;

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

function updateEnvironment(scene) {
  myMesh.position.x += 0.01;
}
