
import { Vector3 } from 'three';

export interface Bullet {
  id: string;
  position: Vector3;
}

export interface Enemy {
  id: string;
  position: Vector3;
  speed: number;
}

export interface Explosion {
  id: string;
  position: Vector3;
  particles: {
    velocity: Vector3;
    position: Vector3;
  }[];
  life: number;
}

export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER'
}
