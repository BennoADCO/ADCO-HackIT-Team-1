// ================================================================
//  LOCATIONS - the places you can go
// ================================================================
//  One block per place. The word in the square brackets is its id -
//  that is what character files use in their "at" setting to say
//  where someone is standing.
//
//    name       - what the map calls it
//    background - the scene picture, shown once you walk in
//    x, y       - WHERE ITS PIN SITS ON THE TOWN MAP (Map.png), as a
//                 percentage across (x) and down (y) the picture.
//                 0,0 is the top-left corner. 100,100 is bottom-right.
//
//  TO ADD A PLACE
//    1. Drop the scene picture into  assest/Place/  (or assets/backgrounds/)
//    2. Copy one of the blocks below and change the id, the name and
//       the file name.
//    3. Guess an x/y, save, press F5, and see how close the glowing
//       pin lands to the spot you meant on the map. Nudge the numbers
//       until it sits right on top.
//
//  Scene pictures look best at about 16:9 (roughly twice as wide as
//  they are tall). They are scaled to fill the screen, so a little
//  off the edges gets cropped.
// ================================================================

LOCATIONS['mall'] = {
  name: 'The Shopping Centre',
  background: 'assets/backgrounds/shopping_Mall.png',
  x: 10, y: 14
};

LOCATIONS['gym'] = {
  name: 'The Gym',
  background: 'assest/Place/02_gym.png',
  x: 33, y: 10
};

LOCATIONS['cafe'] = {
  name: 'The Cafe',
  background: 'assest/Place/03_cafe.png',
  x: 51, y: 15
};

LOCATIONS['nightclub'] = {
  name: 'The Nightclub',
  background: 'assest/Place/04_nightclub.png',
  x: 80, y: 15
};

LOCATIONS['bar'] = {
  name: 'The Bar',
  background: 'assest/Place/05_bar.png',
  x: 86, y: 44
};

LOCATIONS['construction'] = {
  name: 'The Construction Site',
  background: 'assest/Place/06_construction.png',
  x: 12, y: 52
};

LOCATIONS['campus'] = {
  name: 'The Campus',
  background: 'assest/Place/07_campus.png',
  x: 36, y: 55
};

LOCATIONS['hospital'] = {
  name: 'The Hospital',
  background: 'assest/Place/08_hospital.png',
  x: 67, y: 51
};
