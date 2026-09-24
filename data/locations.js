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
//    mapX, mapY - where its pin sits on the town map. See below.
//
//  THE PICTURE FILES ARE NAMED AFTER THE ID. The Gym is 'gym', so its
//  picture is assets/places/gym.png. Keep that up and nobody has to
//  remember a second set of names.
//
//  ----------------------------------------------------------------
//  WHERE THE PINS GO  (mapX and mapY)
//  ----------------------------------------------------------------
//  The map picture is assets/places/map.png, and the pins are already
//  drawn onto it. mapX and mapY say where the CLICKABLE spot sits on
//  top of each drawn pin.
//
//  Both are percentages across the picture, NOT pixels - so they stay
//  put whatever size the window is.
//    mapX: 0 is the far left,  100 is the far right
//    mapY: 0 is the very top,  100 is the very bottom
//
//  TO MOVE A PIN: nudge the numbers a little and press F5. Bigger mapX
//  moves it right, bigger mapY moves it down. One unit is about 15
//  pixels across, or 6 down.
//
//  A place with no mapX/mapY will not appear on the map at all, and
//  the game will say so in the red problems panel.
//  ----------------------------------------------------------------
//
//  TO ADD A PLACE
//    1. Copy one of the blocks below.
//    2. Change the id, the name and the colour.
//    3. Drop a picture into assets/places/ named after the new id, and
//       point "background" at it. Or leave that line out for now.
//    4. Give it a mapX and mapY so it has somewhere to sit on the map.
//    5. Save, then press F5 in the browser. It appears on the map.
//
//  Scene pictures look best at about 16:9 (roughly twice as wide as
//  they are tall). They are scaled to fill the screen, so a little
//  off the edges gets cropped.
// ================================================================


LOCATIONS['mall'] = {
  name: 'The Shopping Arcade',
  background: 'assets/places/mall.png',
  colour: '#4a4660',
  mapX: 9.9,
  mapY: 14.7
};

LOCATIONS['gym'] = {
  name: 'The Gym',
  background: 'assets/places/gym.png',
  colour: '#5a4a4a',
  mapX: 32.8,
  mapY: 10.4
};

LOCATIONS['coffee_shop'] = {
  name: 'The Cafe',
  background: 'assets/places/coffee_shop.png',
  colour: '#6b4a34',
  mapX: 51.2,
  mapY: 14.7
};

LOCATIONS['club'] = {
  name: 'The Nightclub',
  background: 'assets/places/club.png',
  colour: '#3a2a5c',
  mapX: 80.8,
  mapY: 14.7
};

LOCATIONS['bar'] = {
  name: 'The Bar',
  background: 'assets/places/bar.png',
  colour: '#5c2f3c',
  mapX: 85.6,
  mapY: 43.6
};

LOCATIONS['construction_site'] = {
  name: 'The Construction Site',
  background: 'assets/places/construction_site.png',
  colour: '#7a5f2a',
  mapX: 11.5,
  mapY: 54.0
};

LOCATIONS['uni_campus'] = {
  name: 'The University',
  background: 'assets/places/uni_campus.png',
  colour: '#3f5742',
  mapX: 36.0,
  mapY: 55.1
};

LOCATIONS['hospital'] = {
  name: 'The Hospital',
  background: 'assets/places/hospital.png',
  colour: '#3d5a66',
  mapX: 67.3,
  mapY: 51.0
};
