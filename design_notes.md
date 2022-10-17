# Design Notes

## Image recognition for Map image to Tile types
### 1st approach: image mean colour vs manually assigned colour
Compare the image's mean colour with each Tile's manually assigned colour. This worked almost well on normal google map images.

### 2nd approach: ranking of image pixel colour vs manually assigned colour
Compare all the image's pixels' colour with each Tile's manually assigned colour.
The most common Tile is assigned to the image. This worked pretty well on normal google map images.
