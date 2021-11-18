import { TransformNode, ShadowGenerator, Scene, Mesh, UniversalCamera, ArcRotateCamera, Vector3, FreeCamera, SpotLight, Color3 } from "@babylonjs/core";

export class Player extends TransformNode {
    public camera;
    public scene: Scene;
    private _canvas;
    private _input;

    //Player
    public mesh: Mesh; //outer collisionbox of player
    
    constructor(scene: Scene, canvas) {
        super("player", scene);
        this._scene = scene;
        this._canvas = canvas;
        this._setupPlayerCamera(scene);
    }

    private _setupPlayerCamera(scene: Scene) {

        let camera = new FreeCamera("FreeCamera", new Vector3(0, 60, 15), scene);

        //var playerLight = new PointLight("pointLight", new Vector3(0, 0, 0), scene);
        //playerLight.parent = camera;
        //playerLight.intensity = 100;

        let spotLight = new SpotLight("playerSpotlight", new Vector3(0, 0, 0),
            new Vector3(0, 0, 1), Math.PI/2, 10, scene);

        spotLight.intensity = 6.0;
        spotLight.diffuse = new Color3(1, 1, 0.9);
        spotLight.range = 100;
        spotLight.falloffType = 3;
        spotLight.parent = camera;

        // Targets the camera to a particular position. In this case the scene origin
        camera.setTarget(Vector3.Zero());
        camera.attachControl(this._canvas, true);
        camera.applyGravity = true;
        //camera.speed = 0.1;
        camera.minZ = 0.01;

        camera.inputs.addMouseWheel();

        //Makes the camera fall even when not moving.
        (<any>camera)._needMoveForGravity = true;

        camera.ellipsoid = new Vector3(2, 5, 2);
        camera.checkCollisions = true;

        let playerMesh = Mesh.CreateBox("playerMesh", 2, scene);
        playerMesh.checkCollisions = false;
        playerMesh.parent = camera;

        //Add the WASD keys to camera controls
        camera.keysUp.push(87);
        camera.keysDown.push(83);
        camera.keysLeft.push(65);
        camera.keysRight.push(68);

        scene.activeCamera = camera;
        scene.activeCamera.attachControl(this._canvas, true);
    }
}