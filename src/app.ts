import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, Color4, FreeCamera } from "@babylonjs/core";
import { sceneUboDeclaration } from "@babylonjs/core/Shaders/ShadersInclude/sceneUboDeclaration";
import { Button } from "@babylonjs/inspector/components/Button";

enum State { START = 0, GAME = 1, LOSE = 2, CUTSCNENE = 3}
class App {
    private _scene: Scene;
    private _cutScene: Scene;
    private _gameScene: Scene;
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    private _state: number = 0;

    constructor() {
        // create the canvas html element and attach it to the webpage
        var canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);

        // initialize babylon scene and engine
        this._canvas = this._createCanvas();
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);
        this._cutScene = new Scene(this._engine);
        this._gameScene = new Scene(this._engine);

        var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this._scene);
        camera.attachControl(canvas, true);
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), this._scene);
        var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, this._scene);

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === 'i') {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                } else {
                    this._scene.debugLayer.show();
                }
            }
        });

        this._main();
    }

    private async _main(): Promise<void> {
        await this._goToStart();

        // run the main render loop
        this._engine.runRenderLoop(() => {
            switch (this._state) {
                case State.START:
                    this._scene.render();
                    break;
                case State.CUTSCNENE:
                    this._scene.render();
                case State.GAME:
                    this._scene.render();
                case State.LOSE:
                    this._scene.render();
                default: break;
            }
        });

        window.addEventListener('resize', ()=> {
            this._engine.resize();
        })
    }

    private async _goToStart() {
        this._engine.displayLoadingUI();
        
        // scene setup
        this._scene.detachControl();
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0, 0, 0, 1);

        // camera setup
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
        camera.setTarget(Vector3.Zero());

        // Scene finished loading
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI(); // when the scene is ready, hide loading

        // Lastly set the current state
        this._scene.dispose();
        this._scene = scene;
        this._state = State.START;
    }

    private async _goToLose(): Promise<void> {
        this._engine.displayLoadingUI();

        // scene setup
        this._scene.detachControl();
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0, 0, 0,1);

        // camera setup
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
        camera.setTarget(Vector3.Zero());

        // Scene finished loading
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI(); // when the scene is ready, hide loading

        // Lastly set the current state
        this._scene.dispose();
        this._scene = scene;
        this._state = State.LOSE;        
    }

    private async _goToCutScene(): Promise<void> {
        this._engine.displayLoadingUI();
        // scene setup
        this._scene.detachControl();
        this._cutScene = new Scene(this._engine);
        this._cutScene.clearColor = new Color4(0, 0, 0, 1);

        // camera setup
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this._cutScene);
        camera.setTarget(Vector3.Zero());

        // Scene finished loading
        await this._cutScene.whenReadyAsync();
        this._cutScene.dispose();
        this._state = State.CUTSCNENE;
        this._scene = this._cutScene;

        // start loading and setting up the game during this scene
        let finishedLoading = false;
        await this._setUpGame().then(res => {
            finishedLoading = true;
        })
    }

    private async _setUpGame() {
        // create scene
        let scene = new Scene(this._engine);
        this._gameScene = scene;

        // TODO: load assets
        // create environment
        // const environment = new Environment(scene);

    }

    private async _goToGame() {
        this._scene.detachControl();
        let scene = this._gameScene;

        scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098); // a color that fit the overall color scheme better
        let camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);
        camera.setTarget(Vector3.Zero());
        
        //temporary scene objects
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
    
        //get rid of start scene, switch to gamescene and change states
        this._scene.dispose();
        this._state = State.GAME;
        this._scene = scene;
        this._engine.hideLoadingUI();
        //the game is ready, attach control back
        this._scene.attachControl();
    }

    //set up the canvas
    private _createCanvas(): HTMLCanvasElement {

        //Commented out for development
        document.documentElement.style["overflow"] = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.documentElement.style.width = "100%";
        document.documentElement.style.height = "100%";
        document.documentElement.style.margin = "0";
        document.documentElement.style.padding = "0";
        document.body.style.overflow = "hidden";
        document.body.style.width = "100%";
        document.body.style.height = "100%";
        document.body.style.margin = "0";
        document.body.style.padding = "0";

        //create the canvas html element and attach it to the webpage
        this._canvas = document.createElement("canvas");
        this._canvas.style.width = "100%";
        this._canvas.style.height = "100%";
        this._canvas.id = "gameCanvas";
        document.body.appendChild(this._canvas);

        return this._canvas;
    }
}
new App();