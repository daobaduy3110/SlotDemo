# 🎰 Phaser Slot Demo

This is a simple slot machine demo built using **Phaser 3**. The game features two main scenes and interactive slot mechanics, including turbo and auto modes.

## 🕹️ User Guide

### 🎬 Loading Scene
- Loads all game assets.
- Once loading is complete, a **Start** button will appear.
- Clicking the Start button transitions to the Game Scene.

### 🎮 Game Scene
- Contains:
  - **Slot Board** with 5 reels × 3 rows of symbols.
  - **Spin Button** to start the spin.
  - **Turbo Button** to speed up spin animations (toggle on/off).
  - **Auto Button** to auto-play spins continuously (toggle on/off).
  - **Information Bar** for displaying win results.

#### 🧾 Information Bar
- Displays the **win amount for each win line**.
- Shows the **total win amount** for the current spin.

#### 🎡 Gameplay
- Press **Spin** to spin the board.
- Pressing **Spin again during a spin** will skip the animation and show the result immediately.
- Pressing the **Spacebar** acts the same as the Spin button.
- **Winlines** are calculated after the spin:
  - A valid winline has at least **3 consecutive matching symbols**, starting from **Reel 1** (leftmost).
- Spin results are **randomized locally** (no server required).

## ⚙️ Project Configuration

- **Phaser Version**: 3.88.2  
- **Design Resolution**: 1280 × 720  
- Configurable parameters are located in `GameConfig.js`:
  - `GAMECFG`
  - `SPINCFG`
  - `TURBOSPINCFG`

---

Have fun spinning! 🎉
