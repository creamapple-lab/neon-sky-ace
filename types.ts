
import { Vector3 } from 'three';

export interface Bullet {
  id: string;
  position: Vector3;
}

export type EnemyType = 'SCOUT' | 'STINGER' | 'INTERCEPTOR' | 'GHOST' | 'GOLIATH';

export interface Enemy {
  id: string;
  position: Vector3;
  speed: number;
  type: EnemyType;
  points: number;
  color: string;
}

export interface Explosion {
  id: string;
  position: Vector3;
  color: string;
  isMega?: boolean;
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
