export interface Horse {
  id: number
  name: string
  color: string
  condition: number // 1-100
}

export interface Round {
  id: number
  lap: number
  distance: number
  horses: Horse[]
  status: RoundStatus
}

export interface RaceResult {
  roundId: number
  lap: number
  distance: number
  rankings: Horse[]
}

export enum RoundStatus {
  Pending = 'pending',
  Running = 'running',
  Finished = 'finished',
}

export enum GameStatus {
  Idle = 'idle',
  Generated = 'generated',
  Running = 'running',
  Paused = 'paused',
  Finished = 'finished',
}
