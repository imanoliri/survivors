# Design Notes

## Image recognition for Map image to Tile types
### 1st approach: image mean colour vs manually assigned colour
Compare the image's mean colour with each Tile's manually assigned colour. This worked almost well on normal google map images.

### 2nd approach: ranking of image pixel colour vs manually assigned colour
Compare all the image's pixels' colour with each Tile's manually assigned colour.
The most common Tile is assigned to the image. This worked pretty well on normal google map images.


## Automation
### Automated steps in the Game flow
- [ ] Game setup
- [x] Generate TileMap
- [ ] Add TileMap to game file
- [x] Play rounds until game end:
  - [x] Pull event card
  - [ ] Play event card
  - [ ] Each player plays its turn:
    - [ ] Declare scavengers
    - [x] Pull player card
    - [ ] Play player card
    - [ ] Automatic resource production
    - [ ] Activities:
      - [ ] Build
      - [ ] Produce resources
      - [ ] Gather
      - [ ] Look for survivors
      - [ ] Create/disband an attack party
      - [ ] Move-attack an already existing attack party
    - [ ] Resource consumption:
      - [ ] 1 food & 1 water for each survivor -> if not enough, 1 dies
      - [ ] 1 medicine for each wounded -> if not enough, 1 dies
    - [ ] Update victory points
    - [x] check game end
  - [ ] Other factions (if any) play their turn
  - [ ] Radiation/sandstorm or other nature effects play
