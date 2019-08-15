import { Component } from '@angular/core';
import { GAME_MODES, CONTROLS, COLORS, BOARD_SIZE } from './app.constants';
import { BestScoreManager } from './app.storage.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private interval: number;
  private tempDirection: number;
  private default_mode = 'classic';
  private isGameOver = false;

  public all_modes = GAME_MODES;
  public getKeys = Object.keys;
  public board = [];
  public obstacles = [];
  public score = 0;
  public showMenuChecker = false;
  public gameStarted = false;
  public newBestScore = false;
  public best_score = this.bestScoreService.retrieve();

  private snake = {
    direction: CONTROLS.LEFT,
    parts: [
      {
        x: -1,
        y: -1
      }
    ]
  };

  private fruit = {
    x: -1,
    y: -1
  }

  constructor(
    private bestScoreService: BestScoreManager
  ) {
    this.setBoard();
  }

  handleKeyboardEvents(e: KeyboardEvent){
    if (e.keyCode === CONTROLS.LEFT && this.snake.direction !== CONTROLS.RIGHT) {
      this.tempDirection = CONTROLS.LEFT;
    } else if (e.keyCode === CONTROLS.UP && this.snake.direction !== CONTROLS.DOWN) {
      this.tempDirection = CONTROLS.UP;
    } else if (e.keyCode === CONTROLS.RIGHT && this.snake.direction !== CONTROLS.LEFT) {
      this.tempDirection = CONTROLS.RIGHT;
    } else if (e.keyCode === CONTROLS.DOWN && this.snake.direction !== CONTROLS.UP) {
      this.tempDirection = CONTROLS.DOWN;
    }
  }

  setColors(col: number, row: number): string {
    if(this.isGameOver) {
      return COLORS.GAME_OVER;
    } else if (this.fruit.x === row && this.fruit.y === col) {
      return COLORS.FRUIT;
    } else if (this.snake.parts[0].x === row && this.snake.parts[0].y === col) {
      return COLORS.FRUIT;
    } else if ( this.board[col][row] === true) {
      return COLORS.BODY;
    // } else if (this.default_mode === 'obstacles' && this.checkObstacles(row, col)) {
    //   return COLORS.OBSTACLE;
    } else {
      return COLORS.BOARD;
    }
  }

  updatePositions(): void {
    let newHead = this.repositionHead();
    let me = this;

    if(this.boardCollision(newHead)) {
      return this.gameOver();
    }

    if(this.selfCollision(newHead)) {
      return this.gameOver();
    } else if (this.fruitCollision(newHead)) {
      this.eatFruit();
    }

    let oldTail = this.snake.parts.pop();
    this.board[oldTail.y][oldTail.x] = false;

    this.snake.parts.unshift(newHead);
    this.board[newHead.y][newHead.y] = true;

    this.snake.direction = this.tempDirection;

    setTimeout(() => {
      me.updatePositions();
    }, this.interval);
  }

  repositionHead(): any {
    let newHead = Object.assign({}, this.snake.parts[0]);

    if(this.tempDirection === CONTROLS.LEFT) {
      newHead.x -= 1;
    } else if (this.tempDirection === CONTROLS.RIGHT) {
      newHead.x += 1;
    } else if (this.tempDirection === CONTROLS.UP) {
      newHead.y -= 1;
    } else if(this.tempDirection === CONTROLS.DOWN) {
      newHead.y += 1;
    }

    return newHead;
  }

  setBoard(): void {
    this.board = [];

    for(var i = 0; i < BOARD_SIZE; i++) {
      this.board[i] = [];
      for(var j = 0; j < BOARD_SIZE; j++) {
        this.board[i][j] = false;
      }
    }
  }

  boardCollision(part: any): boolean {
    return part.x === BOARD_SIZE || part.x === -1 || part.y === BOARD_SIZE || part.y === -1;
  }

  selfCollision(part: any): boolean {
    return this.board[part.y][part.x] === true;
  }

  gameOver(): void {
    this.isGameOver = true;
    this.gameStarted = false;
    let me = this;

    if(this.score > this.best_score) {
      this.bestScoreService.store(this.score);
      this.best_score = this.score;
      this.newBestScore = true;
    }

    setTimeout(() => {
      me.isGameOver = false;
    }, 500);

    this.setBoard();
  }

  fruitCollision(part: any):boolean {
    return part.x === this.fruit.x && part.y === this.fruit.y;
  }

  eatFruit(): void {
    this.score++;

    let tail = Object.assign({}, this.snake.parts[this.snake.parts.length - 1]);

    this.snake.parts.push(tail);
    this.resetFruit();

    if(this.score % 5 === 0) {
      this.interval -= 15;
    }
  }

  randomNumber(): any {
    return Math.floor(Math.random() * BOARD_SIZE);
  }

  resetFruit(): void {
    let x = this.randomNumber();
    let y = this.randomNumber();

    if(this.board[y][x] === true) {
      return this.resetFruit();
    }

    this.fruit = {
      x: x,
      y: y
    };
  }

}
