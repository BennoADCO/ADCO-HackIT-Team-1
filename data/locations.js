// ================================================================
//  LOCATIONS - the places you can go
// ================================================================
//  One block per place. The word in the square brackets is its id -
//  that is what character files use to say where someone is standing.
//
//    name       - what the map calls it
//    background - OPTIONAL. A picture, from the assets/places folder.
//                 Leave it out and the colour below is used instead,
//                 so a place works fine with no art at all.
//    colour     - the flat colour shown while the picture loads, or
//                 instead of it if there is no picture.
//    x, y       - WHERE ITS PIN SITS ON THE TOWN MAP (assets/places/map.png),
//                 as a percentage across (x) and down (y) the picture.
//                 0,0 is the top-left corner. 100,100 is bottom-right.
//
//  THE PICTURE FILES ARE NAMED AFTER THE ID. The Gym is 'gym', so its
//  picture is assets/places/gym.png. Keep that up and nobody has to
//  remember a second set of names.
//
//  TO ADD A PLACE
//    1. Copy one of the blocks below.
//    2. Change the id, the name and the colour.
//    3. Drop a picture into assets/places/ named after the new id, and
//       point "background" at it. Or leave that line out for now.
//    4. Guess an x/y, save, press F5, and see how close the glowing
//       pin lands to the spot you meant on the map. Nudge the numbers
//       until it sits right on top.
//
//  Scene pictures look best at about 16:9 (roughly twice as wide as
//  they are tall). They are scaled to fill the screen, so a little
//  off the edges gets cropped.
// ================================================================


LOCATIONS['mall'] = {
  name: 'The Shopping Centre',
  background: 'assets/places/mall.png',
  colour: '#4a4660',
  x: 10, y: 14
};

LOCATIONS['gym'] = {
  name: 'The Gym',
  background: 'assets/places/gym.png',
  colour: '#5a4a4a',
  x: 33, y: 10
};

LOCATIONS['coffee_shop'] = {
  name: 'The Coffee Shop',
  background: 'assets/places/coffee_shop.png',
  colour: '#6b4a34',
  x: 51, y: 15
};

LOCATIONS['club'] = {
  name: 'The Club',
  background: 'assets/places/club.png',
  colour: '#3a2a5c',
  x: 80, y: 15
};

LOCATIONS['bar'] = {
  name: 'The Bar',
  background: 'assets/places/bar.png',
  colour: '#5c2f3c',
  x: 86, y: 44
};

LOCATIONS['construction_site'] = {
  name: 'The Construction Site',
  background: 'assets/places/construction_site.png',
  colour: '#7a5f2a',
  x: 12, y: 52
};

LOCATIONS['uni_campus'] = {
  name: 'Uni Campus',
  background: 'assets/places/uni_campus.png',
  colour: '#3f5742',
  x: 36, y: 55
};

LOCATIONS['hospital'] = {
  name: 'The Hospital',
  background: 'assets/places/hospital.png',
  colour: '#3d5a66',
  x: 67, y: 51
};
