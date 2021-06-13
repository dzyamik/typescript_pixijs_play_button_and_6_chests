import * as PIXI from "pixi.js";
import { TransitionType } from "../transition/transition";
import { AbstractGameScene } from "../scene/scene";

export interface SceneTransition {
    /**
     * Initializes the transition, can be called multiple times.
     * @param app 
     * @param type 
     * @param sceneContainer 
     */
    init(sceneContainer: PIXI.Container): void;
    update(delta: number, callback: () => void): void;
}

/**
 * Scene wrapper interface.
 */
export interface SceneSettings {
    index: number;
    name: string,
    gameScene: AbstractGameScene;
    fadeInTransition: SceneTransition;
    fadeOutTransition: SceneTransition;
}

/**
 * Manages game scenes.
 */
export class Engine {
    private sceneSettings: SceneSettings[];
    private app: PIXI.Application;
    private currentScene: SceneSettings;

    private mainScene: SceneSettings;
    private bonusScene: SceneSettings;

    constructor(app: PIXI.Application, scenes: SceneSettings[]) {
        this.app = app;
        this.sceneSettings = scenes;
        this.sceneSettings.forEach((sceneSettings: SceneSettings) => {
            sceneSettings.gameScene.init(this.app, this.sceneSwitcher);
        });

        this.mainScene = scenes[ 0 ];
        this.bonusScene = scenes[ 1 ];

        this.createScene(this.mainScene);
        this.createScene(this.bonusScene);

        this.currentScene = this.mainScene;

        this.setupScene(this.currentScene.gameScene.getSceneContainer());
    }

    /**
     * Scene switching mechanism. Finalizes the currenst scene and setups 
     * the target scene.
     * @memberof Engine
     */
    sceneSwitcher = (sceneName: string) => {
        this.currentScene.gameScene.setFinalizing(() => {
            const scene = this.sceneSettings.find((sceneSettings: SceneSettings) => {
                return sceneSettings.name === sceneName;
            });
            console.error(sceneName);

            if (scene) {
                this.setupScene(scene.gameScene.getSceneContainer());
                this.currentScene = scene;
            } else {
                console.error("SCENE NOT FOUND: " + sceneName);
            }
        });
    }

    /**
     * Adds a scene to the PIXI.APP.STAGE, removing all previous children.
     * @param sceneSettings 
     */
    setupScene(sceneContainer: PIXI.Container) {
        // TODO: update it keeping all scenes in pool - no need to overload everything every time
        this.app.stage.removeChildren();
        // const sceneContainer = new PIXI.Container();
        // this.app.stage.addChild(sceneContainer);
        this.app.stage.addChild(sceneContainer);

        // const gameScene: AbstractGameScene = sceneSettings.gameScene;

        // gameScene.setup(sceneContainer);

        // sceneSettings.fadeInTransition.init(sceneContainer);
        // sceneSettings.fadeOutTransition.init(sceneContainer);

        // gameScene.fadeInTransition = sceneSettings.fadeOutTransition;
        // gameScene.fadeOutTransition = sceneSettings.fadeInTransition;
    }

    createScene(sceneSettings: SceneSettings) {
        const gameScene: AbstractGameScene = sceneSettings.gameScene;
        gameScene.setup(gameScene.getSceneContainer());

        sceneSettings.fadeInTransition.init(gameScene.getSceneContainer());
        sceneSettings.fadeOutTransition.init(gameScene.getSceneContainer());

        gameScene.fadeInTransition = sceneSettings.fadeOutTransition;
        gameScene.fadeOutTransition = sceneSettings.fadeInTransition;
    }

    /**
     * PIXI.APP update loop.
     * @param delta 
     */
    update(delta: number) {
        this.currentScene.gameScene.update(delta);
    }

}