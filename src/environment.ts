import { Mesh, Scene, Vector3, SceneLoader } from "@babylonjs/core";

export class Environment {
  private _scene: Scene;

  constructor(scene: Scene) {
    this._scene = scene;
  }

  public async load() {
    var ground = Mesh.CreateBox("ground", 100, this._scene);
    ground.checkCollisions = true;
    ground.scaling = new Vector3(1,.02,1);
    ground.position.y = -100;



    SceneLoader.ImportMeshAsync("", "/models/", "Cell.babylon").then((result) => {

      //result.meshes.forEach(mesh => {
      //  mesh.isPickable = false;
      //  mesh.checkCollisions = true;
      //});
      let cell = result.meshes[0];
      cell.scaling = new Vector3(10, 10, 10);
      cell.checkCollisions = true;

      //mesh.isVisible = false;

      for (let a = 0; a < 3; a++) {
        for (let b = 0; b < 3; b++) {

        //TypeScript won't createInstance of an Abstract Mesh, define cell as Mesh.
        let instance = (cell as Mesh).createInstance("a_" + a + " b_" + b);

        instance.position.x = a * 20;
        instance.position.z = b * 20;
        instance.checkCollisions = true;
        instance.isPickable = false;
        }
      }

    });


  }
}