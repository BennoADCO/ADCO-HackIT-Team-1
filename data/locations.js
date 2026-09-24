// ================================================================
//  LOCATIONS - the places you can go
// ================================================================
//  One block per place. The word in the square brackets is its id -
//  that is what character files use in their "at" setting to say
//  where someone is standing.
//
//    name       - what the map calls it
//    background - the picture, from the assets/backgrounds folder
//
//  TO ADD A PLACE
//    1. Drop the picture into  assets/backgrounds/
//    2. Copy one of the blocks below and change the id, the name and
//       the file name.
//    3. Save, then press F5 in the browser. It appears on the map.
//
//  Pictures look best at about 16:9 (roughly twice as wide as they are
//  tall). They are scaled to fill the screen, so a little off the edges
//  gets cropped.
// ================================================================

LOCATIONS['mall'] = {
  name: 'The Shopping Centre',
  background: 'assets/backgrounds/shopping_Mall.png'
};
