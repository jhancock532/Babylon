import { TransformNode, ShadowGenerator, Scene, Mesh, UniversalCamera, ArcRotateCamera, Vector3 } from "@babylonjs/core";

export class Player extends TransformNode {
    public camera;
    public scene: Scene;
    private _canvas;
    private _input;

    //Player
    public mesh: Mesh; //outer collisionbox of player
    
    constructor(assets, scene: Scene, shadowGenerator: ShadowGenerator, canvas, input) {
        super("player", scene);
        this.scene = scene;
        this._canvas = canvas;
        this._setupPlayerCamera();

        this.mesh = assets.mesh;
        this.mesh.parent = this;

        shadowGenerator.addShadowCaster(assets.mesh); //the player mesh will cast shadows

        this._input = input; //inputs we will get from inputController.ts
    }

    private _setupPlayerCamera() {
      var camera = new UniversalCamera("UniversalCamera", new Vector3(0, 0, -10), this.scene);

      // Targets the camera to a particular position. In this case the scene origin
      camera.setTarget(Vector3.Zero());
      camera.attachControl(this._canvas, true);
      camera.applyGravity = true;

      //Add the WASD keys for camera controls
      camera.keysUp.push(87);
      camera.keysDown.push(83);
      camera.keysLeft.push(65);
      camera.keysRight.push(68);

      // Attach the camera to the canvas
        //var camera4 = new ArcRotateCamera("arc", -Math.PI/2, Math.PI/2, 40, new Vector3(0,3,0), this.scene);
    }
}