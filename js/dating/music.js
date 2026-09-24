// ================================================================
//  BACKGROUND MUSIC
// ================================================================
//  Plays the mp3 files from the "Background Music for Visual Novels
//  vol.1" folder, one after another, for as long as the game is open.
//
//  TO CHANGE THE MUSIC
//    - Add, remove or reorder a line in MUSIC_TRACKS below. Each one
//      is a file path to an mp3 in that folder.
//    - Change MUSIC_VOLUME. 0 is silent, 1 is full volume.
//
//  Browsers refuse to play sound until the player has clicked or
//  pressed a key on the page at least once - every site works this
//  way, it is not a bug here. So the music starts on the very first
//  click or key press, whatever it is, and the little speaker button
//  in the corner mutes it again if it is not wanted.
// ================================================================

var MUSIC_VOLUME = 0.35;

var MUSIC_TRACKS = [
  "Background Music for Visual Novels vol.1/acoustic chill.mp3",
  "Background Music for Visual Novels vol.1/bar evening.mp3",
  "Background Music for Visual Novels vol.1/battlefield desolate.mp3",
  "Background Music for Visual Novels vol.1/city modern.mp3",
  "Background Music for Visual Novels vol.1/city modern 2.mp3",
  "Background Music for Visual Novels vol.1/darkness dangerous.mp3",
  "Background Music for Visual Novels vol.1/goofy guy.mp3",
  "Background Music for Visual Novels vol.1/moonlight chill.mp3",
  "Background Music for Visual Novels vol.1/moonlight disturbing.mp3",
  "Background Music for Visual Novels vol.1/piano lofi.mp3"
];

var musicPlayer = null;    // the <audio> element, made once
var musicTrackIndex = 0;   // which song in the list is playing
var musicMuted = false;
var musicStarted = false;  // true once the first track has been asked to play

// Called once, when the game starts.
function setUpMusic() {
  try {
    musicPlayer = document.createElement('audio');
    musicPlayer.volume = MUSIC_VOLUME;

    // When one track ends, move on to the next, and loop back to the
    // start of the list once we run out.
    musicPlayer.addEventListener('ended', function () {
      musicTrackIndex = (musicTrackIndex + 1) % MUSIC_TRACKS.length;
      playCurrentTrack();
    });

    // Start on a random song, so it is not the same one every time
    // the game is opened.
    musicTrackIndex = Math.floor(Math.random() * MUSIC_TRACKS.length);

    document.addEventListener('click', beginMusicOnce);
    document.addEventListener('keydown', beginMusicOnce);
  } catch (err) {
    // No <audio> support on this computer - the game still plays, just silent.
  }

  var button = document.getElementById('music-toggle');
  if (button) {
    button.onclick = function (event) {
      event.stopPropagation();   // don't also count as the "start music" click
      toggleMusic();
    };
  }
}

// The very first click or key press anywhere on the page.
function beginMusicOnce() {
  document.removeEventListener('click', beginMusicOnce);
  document.removeEventListener('keydown', beginMusicOnce);
  if (musicStarted) { return; }
  musicStarted = true;
  playCurrentTrack();
}

function playCurrentTrack() {
  if (!musicPlayer || musicMuted) { return; }
  try {
    musicPlayer.src = MUSIC_TRACKS[musicTrackIndex];
    musicPlayer.play();
  } catch (err) {
    // Playback blocked, or the file is missing - just stay quiet.
  }
}

// The speaker button in the corner.
function toggleMusic() {
  musicMuted = !musicMuted;
  var button = document.getElementById('music-toggle');

  if (musicMuted) {
    if (musicPlayer) { musicPlayer.pause(); }
    if (button) { button.textContent = '🔇'; }   // muted speaker
    return;
  }

  if (button) { button.textContent = '🔊'; }     // loud speaker
  if (!musicStarted) {
    beginMusicOnce();
  } else if (musicPlayer) {
    try { musicPlayer.play(); } catch (err) {}
  }
}
