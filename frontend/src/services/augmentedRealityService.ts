import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ARButton } from 'three/examples/jsm/webxr/ARButton';

class AugmentedRealityService {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.Renderer;
  private chichaMixModels: Record<string, THREE.Object3D> = {};

  constructor() {
    this.initializeAREnvironment();
  }

  private initializeAREnvironment() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;

    document.body.appendChild(ARButton.createButton(this.renderer));
  }

  async loadChichaMixModel(mixId: string, modelPath: string) {
    const loader = new GLTFLoader();

    return new Promise<THREE.Object3D>((resolve, reject) => {
      loader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene;
          this.chichaMixModels[mixId] = model;
          resolve(model);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  visualizeChichaMix(mixId: string, additionalFlavors?: string[]) {
    const baseModel = this.chichaMixModels[mixId];
    
    if (!baseModel) {
      throw new Error('Modèle de mélange non chargé');
    }

    // Personnalisation dynamique du modèle
    if (additionalFlavors) {
      additionalFlavors.forEach(flavor => {
        const flavorMarker = this.createFlavorMarker(flavor);
        baseModel.add(flavorMarker);
      });
    }

    this.scene.add(baseModel);
  }

  private createFlavorMarker(flavor: string): THREE.Object3D {
    const geometry = new THREE.SphereGeometry(0.1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: this.getFlavorColor(flavor) });
    return new THREE.Mesh(geometry, material);
  }

  private getFlavorColor(flavor: string): number {
    const flavorColors: Record<string, number> = {
      'menthe': 0x00FF00,
      'fruits': 0xFF0000,
      'classic': 0x0000FF,
      // Autres saveurs
    };
    return flavorColors[flavor] || 0xCCCCCC;
  }

  startARSession() {
    this.renderer.setAnimationLoop(() => {
      this.renderer.render(this.scene, this.camera);
    });
  }

  stopARSession() {
    this.renderer.setAnimationLoop(null);
    this.scene.clear();
  }
}

export default new AugmentedRealityService();
