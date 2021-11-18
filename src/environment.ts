import { Mesh, Scene, Vector3, SceneLoader } from "@babylonjs/core";

export class Environment {
  private _scene: Scene;
  private _cellMesh: Mesh;
  private _doorwayMesh: Mesh;
  private _bookshelfMesh: Mesh;
  private _vestibuleMesh: Mesh;
  private _vestibuleWithHoleMesh: Mesh;

  constructor(scene: Scene) {
    this._scene = scene;
    this._cellMesh = null;
    this._doorwayMesh = null;
    this._bookshelfMesh = null;
  }

  private async _loadModels(){
    await SceneLoader.ImportMeshAsync("", "/models/", "Cell.babylon").then((result) => {
      let cell = result.meshes[0] as Mesh;
      cell.scaling = new Vector3(10, 10, 10);
      cell.checkCollisions = false;
      cell.isVisible = false;
      this._cellMesh = cell;
    });

    await SceneLoader.ImportMeshAsync("", "/models/", "Doorway.babylon").then((result) => {
      let doorway = result.meshes[0] as Mesh;
      doorway.scaling = new Vector3(1, 10, 12);
      doorway.checkCollisions = false;
      doorway.isVisible = false;
      this._doorwayMesh = doorway;
    });

    await SceneLoader.ImportMeshAsync("", "/models/", "Bookshelf.babylon").then((result) => {
      let bookshelf = result.meshes[0] as Mesh;
      bookshelf.scaling = new Vector3(2, 20, 24);
      bookshelf.checkCollisions = false;
      bookshelf.isVisible = false;
      this._bookshelfMesh = bookshelf;
    });

    await SceneLoader.ImportMeshAsync("", "/models/", "BasicVestibule.babylon").then((result) => {
      let mesh = result.meshes[0] as Mesh;
      mesh.scaling = new Vector3(18, 1, 20);
      mesh.checkCollisions = false;
      mesh.isVisible = false;
      this._vestibuleMesh = mesh;
    });

    /*
    await SceneLoader.ImportMeshAsync("", "/models/", "VestibuleWithHole.babylon").then((result) => {
      let mesh = result.meshes[0] as Mesh;
      mesh.scaling = new Vector3(10, 1, 20);
      mesh.checkCollisions = false;
      mesh.isVisible = false;
      this._vestibuleWithHoleMesh = mesh;
    });
    */
  }

  private _updateLibraryInstances(){
    //if (this.mesh.intersectsMesh(this.scene.getMeshByName("festivalTrigger"))) {
    //}
  }

  public async load() {
    
    var ground = Mesh.CreateBox("ground", 100, this._scene);
    ground.checkCollisions = true;
    ground.scaling = new Vector3(1,.02,1);
    ground.position.y = -100;

    let box = Mesh.CreateBox("box", 10, this._scene);
    box.checkCollisions = false;
    box.position.y = -100;

    await this._loadModels();

    let radius = 33; //23m for the cell, plus 10m for vestibule

    //Looping with polar coords could make neater math?
    let hexagonSideTranslations = [
      [0, Math.cos(Math.PI / 6)],
      [1.5 * Math.sin(Math.PI / 6), 0.5 * Math.cos(Math.PI / 6)],
      [1.5 * Math.sin(Math.PI / 6), -0.5 * Math.cos(Math.PI / 6)],
      [0, -1 * Math.cos(Math.PI / 6)],
      [-1.5 * Math.sin(Math.PI / 6), -0.5 * Math.cos(Math.PI / 6)],
      [-1.5 * Math.sin(Math.PI / 6), 0.5 * Math.cos(Math.PI / 6)]
    ]

    //A minimum of 4 layers required for final design with this wall height.

    //0 is book, 1 is door
    let cellWallPatterns = [
      [ [0, 1, 0, 0, 1, 0],
        [0, 0, 1, 0, 1, 0],
        [0, 1, 1, 0, 0, 0] ],
      [ [0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1],
        [0, 0, 1, 0, 0, 1] ],
      [ [0, 1, 0, 0, 0, 1],
        [0, 1, 0, 0, 1, 0],
        [0, 0, 0, 0, 1, 1] ]
    ];

    //0 is no vestibule, 1 is floor vestibule, 2 is ladder vestibule
    let cellVestibulePatterns = [
      [ [0, 1, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0, 0] ],
      [ [0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 1] ],
      [ [0, 1, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1] ]
    ]

    for (let l = 0; l < 8; l++) {
      for (let a = 0; a < 3; a++) {
        for (let b = -3; b < 3; b++) {
          let instance = this._cellMesh.createInstance("a_" + a + " b_" + b);

          let cellCenterX = radius * Math.cos(Math.PI / 6) * (b - a + 2);
          let cellCenterZ = radius * 1.5 * (a + b);

          instance.position.x = cellCenterX;
          instance.position.z = cellCenterZ;

          instance.position.y = l * 20;

          instance.checkCollisions = true;
          instance.isPickable = false;

          for (let s = 0; s < 6; s++) {

            //Add the cell walls
            if (cellWallPatterns[(a + 300) % 3][(b + 300) % 3][s] === 0) {
              //Create a bookshelf
              let instance = this._bookshelfMesh.createInstance("s_" + s);
              instance.rotation.y = -s * Math.PI / 3 + Math.PI;
        
              instance.position.x = cellCenterX + (radius-10) * hexagonSideTranslations[s][1];
              instance.position.y = 11 + l * 20;
              instance.position.z = cellCenterZ + (radius-10) * hexagonSideTranslations[s][0];
              
              instance.checkCollisions = true;
              instance.isPickable = false;
            } else {
              //Create a doorway
              let instance = this._doorwayMesh.createInstance("s_" + s);
              instance.rotation.y = -s * Math.PI / 3;
        
              instance.position.x = cellCenterX + (radius-10) * hexagonSideTranslations[s][1];
              instance.position.y = 11 + l * 20;
              instance.position.z = cellCenterZ + (radius-10) * hexagonSideTranslations[s][0];
              
              instance.checkCollisions = true;
              instance.isPickable = false;
            }

            //Add the cell vestibule
            if (cellVestibulePatterns[(a + 300) % 3][(b + 300) % 3][s] !== 0){

              if (cellVestibulePatterns[(a + 300) % 3][(b + 300) % 3][s] === 1){
                let instance = this._vestibuleMesh.createInstance("v_" + a + " " + b + " " + s);
                instance.rotation.y = -s * Math.PI / 3;
          
                instance.position.x = cellCenterX + (radius) * hexagonSideTranslations[s][1];
                instance.position.y = 0.5 + l * 20;
                instance.position.z = cellCenterZ + (radius) * hexagonSideTranslations[s][0];
                
                instance.checkCollisions = true;
                instance.isPickable = false;
              } else {
                let instance = this._vestibuleWithHoleMesh.createInstance("vh_" + a + " " + b + " " + s);
                instance.rotation.y = -s * Math.PI / 3;
          
                instance.position.x = cellCenterX + (radius) * hexagonSideTranslations[s][1];
                instance.position.y = 11;
                instance.position.z = cellCenterZ + (radius) * hexagonSideTranslations[s][0];
                
                instance.checkCollisions = true;
                instance.isPickable = false;
              }
            }

          }
        }
      }
    }

    this._scene.registerBeforeRender(() => {
      this._updateLibraryInstances();
    })
  }
}