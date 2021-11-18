import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, Vector3, HemisphericLight, FreeCamera, Color4, Color3 } from "@babylonjs/core";
import { Environment } from "./environment";
import { Player } from "./characterController";

enum State { MENU = 0, LIBRARY = 1, HTML = 2 }

class App {
    // General Entire Application
    private _scene: Scene;
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    private _player: Player;

    //Game State Related
    public assets;
    private _environment;


    //Scene - related
    private _state: number = 0;
    private _menuScene: Scene;
    private _libraryScene: Scene;

    constructor() {
      // DOM set up
      this._canvas = this._createCanvas();
      this._setUpHTMLButtons();

      // initialize babylon scene and engine
      this._engine = new Engine(this._canvas, true);
      this._scene = new Scene(this._engine);

      // hide/show the Inspector
      window.addEventListener("keydown", (ev) => {
          // Shift+Ctrl
          if (ev.shiftKey && ev.ctrlKey) {
              if (this._scene.debugLayer.isVisible()) {
                  this._scene.debugLayer.hide();
              } else {
                  this._scene.debugLayer.show();
              }
          }
      });

      // run the main render loop
      this._main();
    }

    private _setUpHTMLButtons() {
      document.getElementById("start-button").onclick = event => {
        event.preventDefault();
        document.getElementById("main-menu").style.display = "none";
        this._goToGame();
      }

      //this._goToMainMenu();
    }

    private _createCanvas(): HTMLCanvasElement {

        //Commented out for development
        // document.documentElement.style["overflow"] = "hidden";
        // document.documentElement.style.overflow = "hidden";
        // document.documentElement.style.width = "100%";
        // document.documentElement.style.height = "100%";
        // document.documentElement.style.margin = "0";
        // document.documentElement.style.padding = "0";
        // document.body.style.overflow = "hidden";
        // document.body.style.width = "100%";
        // document.body.style.height = "100%";
        document.body.style.margin = "0";
        // document.body.style.padding = "0";

        //create the canvas html element and attach it to the webpage
        this._canvas = document.createElement("canvas");
        this._canvas.style.width = "100vw";
        this._canvas.style.height = "100vh";
        this._canvas.style.position = "fixed";
        this._canvas.style.top = "0";
        this._canvas.style.zIndex = "1";
        this._canvas.id = "gameCanvas";
        document.body.appendChild(this._canvas);

        return this._canvas;
    }

    private async _main(): Promise<void> {
        await this._goToMainMenu();

        let fpsDisplay = document.getElementById("fps");

        // Register a render loop to repeatedly render the scene
        this._engine.runRenderLoop(() => {
            switch (this._state) {
                case State.MENU:
                    this._scene.render();
                    break;
                case State.LIBRARY:
                    this._scene.render();
                    break;
                case State.HTML:
                  break;
                default: break;
            }
            fpsDisplay.innerHTML = this._engine.getFps().toFixed() + " fps";
        });

        //resize if the screen is resized/rotated
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }

    private async _goToMainMenu(){
        this._engine.displayLoadingUI();

        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0,0,0,1);

        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
        camera.setTarget(Vector3.Zero());

        //--SCENE FINISHED LOADING--
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();
        //lastly set the current state to the start state and set the scene to the start scene
        this._scene.dispose();
        this._scene = scene;
        this._state = State.MENU;
    }

    private async _setUpGame() {
        let scene = new Scene(this._engine);
        this._libraryScene = scene;

        scene.gravity = new Vector3(0, -0.15, 0);
        scene.collisionsEnabled = true;
        scene.clearColor = new Color4(0, 0, 0);

        this._player = new Player(scene, this._canvas);
    
        const environment = new Environment(scene);
        this._environment = environment;
        await this._environment.load();

        //playerMesh.intersectsMesh(this.scene.getMeshByName("playerMesh"))

        //await this._loadSceneAssets(scene);
    }

    /*
    private async _loadSceneAssets(scene){

      async function loadScene(){

        SceneLoader.ImportMeshAsync("", "/models/", "SimpleCell.glb").then((result) => {
          let cell = result.meshes[0];
          cell.position.x = 20;
          cell.scaling = new Vector3(5, 5, 5);
          cell.checkCollisions = true;

          //var cellMTL = new StandardMaterial("red",scene);
          //cellMTL.diffuseColor = new Color3(.8,.5,.5);
          //cell.material = cellMTL;
          //cell.isPickable = false;

          //const myMesh1 = scene.getMeshByName("myMesh_1");
          //myMesh1.rotation.y = Math.PI / 2;
        });

        var box = MeshBuilder.CreateBox("Small1", { width: 0.5, depth: 0.5, height: 0.25, faceColors: [new Color4(0,0,0,1), new Color4(0,0,0,1), new Color4(0,0,0,1), new Color4(0,0,0,1),new Color4(0,0,0,1), new Color4(0,0,0,1)] }, scene);
        box.position.y = 1.5;
        box.position.z = 1;

        var body = Mesh.CreateCylinder("body", 3, 2,2,0,0,scene);
        var bodymtl = new StandardMaterial("red",scene);
        bodymtl.diffuseColor = new Color3(.8,.5,.5);
        body.material = bodymtl;
        body.isPickable = false;
        body.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0)); // simulates the imported mesh's origin

        //parent the meshes
        box.parent = body;
        //body.parent = outer;

        return {
            mesh: body as Mesh
        }
        }
        return loadScene().then(assets=> {
            this.assets = assets;
        })

    }*/

    private async _initializeGameAsync(scene): Promise<void> {
        //temporary light to light the entire scene
        var light = new HemisphericLight("HemiLight", new Vector3(0, 1, 0.2), scene);
        light.diffuse = new Color3(0.8, 0.8, 0.8);
        //light.specular = new Color3(1, 0, 0);
        light.groundColor = new Color3(0, 0, 0);
        light.intensity = 0.2;
    }

    private async _goToGame(){
        this._setUpGame();

        var scene = this._libraryScene;

        //primitive character and setting
        await this._initializeGameAsync(scene);
        
        //--WHEN SCENE FINISHED LOADING--
        await scene.whenReadyAsync();

        //get rid of start scene, switch to gamescene and change states
        this._scene.dispose();
        this._state = State.LIBRARY;
        this._scene = scene;
        this._engine.hideLoadingUI();

        //the game is ready, attach control back
        
        //magic in case attaching control back doesn't work.
        //(<any>scene)._inputManager._onCanvasFocusObserver.callback();
    }
}
new App();