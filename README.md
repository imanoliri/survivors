# Survivors
The party survival board and card game

See the word documentation in `documentation/"Survivors - the party survival board and card game.pdf"`.

## How to play the game
1. Copy `data/game.xlsx` to main directory.
2. Open it in google drive and export as a google sheet document. This will be where all the players will play together as if it were a board.
3. Make sure that the google sheet is public ("anybody with a link" can see it), so that the programm can access it.
4. Prepare configuration .json files (new google sheet id code should be copied to `game.json`>"game_spreadsheet_id").
5. Run script: `play.py`.
6. The programm will generate a new TileMap for the selected map in `maps/tilemaps/<game-of-the-map>.xslx`. You should copy it to `game.gsheet`>"UI".
7. Start playing following the program's instructions. It will deal turn events and player cards for you, but you will have to gather resources, build, and do everything else manually in `game.gsheet`>"UI".
8. The program will automatically detect when the game is finished.