/**
 * Save songs uploaded, for offline - might not be possible without a mac of some sort
 * I think I can save them in firebase, which would be alright (at least no ads? is that worth it?)

https://drive.google.com/open?id=1AUR-uvIKe4gDWCPweBMEWgchS3x6H9Yj
https://drive.google.com/open?id=17rRW4IOaSCzdKFcyraTlQ8z7m3bmX5aU
 */

"use strict"

const playbtn = document.getElementById('play');
const pausebtn = document.getElementById('pause');
const playPause = document.getElementById('playPause');

const file = document.getElementById('file');
const uploadForm = document.getElementById('uploadForm');
const uploadbtn = document.getElementById('uploadbtn');
const showFile = document.getElementById('showFile');
const uploadPopbtn = document.getElementById('uploadPopbtn');
const uploadpopup = document.getElementById('uploadpopup');
const byUrl = document.getElementById('byUrl');

const contextMenu = document.getElementById('contextMenu');
const editSong = document.getElementById('editSong');
const editTitle = document.getElementById('editTitle');
const editArtist = document.getElementById('editArtist');

const songsList = document.getElementById('songsList');
const getList = songsList.getElementsByClassName('dt');

const seeSong = document.getElementById('seeSong');

const timeIndicate = document.getElementById('timeIndicate');
const trackTime = document.getElementById('trackTime');
const doneGone = document.getElementById('doneGone');
const seeTime = document.getElementById('seeTime');

const adjustAudio = document.getElementById('adjustAudio');
const showAudioLevel = document.getElementById('showAudioLevel');
const audioSlider = document.getElementById('audioSlider');

//guess whether it's a mobile device based on whether or not it has a window orientation value
let isMobile = (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);

//for testing
let preloaded = [
  {title: 'Time to Say Goodbye (Acoustic)', artist: 'Jeff Williams', song: 'test.mp3'},
  {title: 'The Longing (cover)', artist: 'Patty Gurdy', song: 'Patty Gurdy - The Longing (cover).mp3'}
];

let getFile;
let upPop = false;
let popup = false;
let editPop = false;
let seeSongs;

let passSong;

const currentAudio = document.getElementById('currentAudio');

//for getting things out of localStorage 
function gotchem(item, defalt, type=localStorage) {
  let getem = type.getItem(item);
  if (getem !== null && JSON.parse(getem) !== undefined) { return JSON.parse(getem); }
  return defalt;
};

let songs = gotchem('songs', preloaded);
let saveTime = gotchem('saveTime', 0);
let unplayed = gotchem('unplayed', songs);
let next = gotchem('next', 'next');
let loop = gotchem('loop', true);
let lmode = gotchem('lmode', true); //light mode bool
let volume = gotchem('volume', 1);
let currentSong = gotchem('currentSong', 0);
if (currentSong > songs.length-1) {
  currentSong = 0;
}

//move the song time indicator and update the song time
function indicator() {
  requestAnimationFrame(() => {
    let percent = 100 * (currentAudio.currentTime/currentAudio.duration);
    doneGone.style.width = percent + '%';
    timeIndicate.style.marginLeft = doneGone.offsetWidth + 'px';
  });
  seeTime.textContent = `${toMinutes(currentAudio.currentTime)}/${toMinutes(currentAudio.duration)}`
};

//set up song list and place in song, and set volume to saved level
function draw() {
  currentAudio.src = songs[currentSong].song;
  currentAudio.addEventListener('loadedmetadata', () => {//show correct place on reload and open
    currentAudio.currentTime = saveTime;
    indicator();
  }, false);

  //re-generate song list display
  songsList.innerHTML = '';
  for (let i of songs) {
    let dt = document.createElement('dt');
    let title = `${i.title}<br><em>${i.artist}</em>`;
    dt.innerHTML = title;
    dt.className = 'dt';
    songsList.appendChild(dt);
  }
  seeSong.textContent = songs[currentSong].title;
  getList[currentSong].setAttribute('selected', true);

  currentAudio.volume = volume;
  showAudioLevel.style.width = volume*100 + '%';

  if (!lmode) {
    switchMode(true);
  }
};

//to click on a song and have it play, and also changes context menu just for the song list (on every click)
function clickList() {
  songsList.addEventListener('click', e => {
    for (let i of getList) {
      i.setAttribute('selected', false);
    }
    e.target.setAttribute('selected', true);
    
    let findName = e.target.innerHTML.split('<br>')[0];
    let tempSong;
    for (let j of songs) { //get song by title
      if (j.title === findName) {
        tempSong = j;
      }
    }
    if (songs[currentSong] !== tempSong) { //switch and play
      currentSong = songs.indexOf(tempSong);
      localStorage.setItem('currentSong', JSON.stringify(currentSong));
      saveTime = 0;
      currentAudio.currentTime = saveTime;
      currentAudio.src = songs[currentSong].song;
      currentAudio.load();
      play();
    }
    else { toggle(); } //don't switch, and toggle
    seeSong.textContent = findName;
  }, false);
  songsList.addEventListener('contextmenu', e => {
    e.preventDefault();
    contextMenu.classList.remove('none');
    contextMenu.style.top = e.clientY+'px';
    contextMenu.style.left = e.clientX+'px';
    passSong = e.target.innerHTML.split('<br>');
  }, false);
};

//for the custom songlist context menu
contextMenu.addEventListener('click', e => {
  let t = e.target.textContent;
  if (t === 'Rename') {
    popup = true;
    editPop = true;
    contextMenu.classList.add('none');
    editSong.classList.add('inlineBlock');
    editTitle.value = passSong[0];
    editArtist.value = passSong[1].replace(/<|em|>|\//g, '');
  }
  else if (t === 'Delete') {
    contextMenu.classList.add('none');
    let delConf = confirm('Delete this track?');
    if (delConf) {
      for (let i of songs) {
        if (i.title === passSong[0]) {
          songs.splice(songs.indexOf(i), 1); //there might be a better way to do this than indexOf
          localStorage.setItem('songs', JSON.stringify(songs));
          saveTime = currentAudio.currentTime;
          draw();
          return;
        }
      }
    }
  }
}, false);
// contextMenu.addEventListener('contextmenu', e => { e.preventDefault(); }, false); //not sure if this is needed

//switch dark/light modes for the songlist - doesn't play nice with class-based colors (have to do it in js 'cause css won't order stuff the way I want it to)
function switchList() {
  for (let i of getList) {
    i.setAttribute('lmode', lmode);
  }
}

//draw stuff and set up clicking on the songlist
function onStart() {
  draw();
  clickList();
}
window.addEventListener('load', onStart, false);
window.addEventListener('resize', indicator, false); //move the time indicator so it still lines up right

//switch button image, set title and place in song, and play
function play() {
  currentAudio.currentTime = saveTime;
  currentAudio.play();
  playbtn.classList.add('none');
  pausebtn.classList.remove('none');
  document.title = `${songs[currentSong].title} - Musicorae`;
};

//switch button image, pause and save the place in song
function pause() {
  currentAudio.pause();
  saveTime = currentAudio.currentTime;
  pausebtn.classList.add('none');
  playbtn.classList.remove('none');
};

//toggle play and pause
const toggle = () => currentAudio.paused ? play() : pause();

//convert seconds to a time in minutes and seconds
function toMinutes(time) {
  let minutes = Math.trunc(time/60);
  let seconds = Math.round((Math.trunc(time-minutes*60)/100)*100);
  if (seconds < 10) { seconds = '0' + seconds; }
  return isNaN(seconds) ? '0:00' : minutes+':'+seconds;
}

//for outside media controls
currentAudio.addEventListener('play', () => {
  playbtn.classList.add('none');
  pausebtn.classList.remove('none');
}, false);
currentAudio.addEventListener('pause', () => {
  saveTime = currentAudio.currentTime;
  pausebtn.classList.add('none');
  playbtn.classList.remove('none');
}, false);

//play/pause button
playPause.addEventListener('click', () => {
  toggle();
  playPause.blur();
}, false);

let temptitle;
let tempartist;

//add a new song to the songs array
uploadbtn.addEventListener('click', () => {
  let newSong;
  let title;
  let artist;
  if (byUrl.value !== '') {
    let url = byUrl.value;
    newSong = url.includes('drive.google') ? 'http://docs.google.com/uc?export=open&id='+url.slice(-33) : url; //arbitrary google drive stuff
    temptitle = url.slice(0, 40); //get the first 40 characters as a title in case they don't type anything in
  }
  else if (getFile) {
    newSong = getFile.name;
    fileToArrBuf(getFile);
  }
  else { return; }
  title = getTitle.value ? getTitle.value : temptitle;
  artist = getArtist.value ? getArtist.value : tempartist;
  songs.push({title: title, artist: artist, song: newSong});
  localStorage.setItem('songs', JSON.stringify(songs));
  draw();
  closeAll();
}, false);

//try to get title and artist when a file is picked
file.addEventListener('change', () => {
  getFile = file.files[0];
  showFile.textContent = getFile.name;
  let getnames = (getFile.name.slice(0, -4)).split(' - ');
  if (getnames[1] !== undefined) {
    temptitle = getnames[1];
    tempartist = getnames[0];
    getArtist.value = tempartist;
  }
  else {
    temptitle = getFile.name.slice(0, -4);
    tempartist = 'unknown';
  }
  getTitle.value = temptitle;
  byUrl.disabled = true;
}, false);

//open the upload modal
uploadPopbtn.addEventListener('click', () => {
  uploadpopup.classList.add('inlineBlock');
  shadow.classList.remove('none');
  upPop = true;
  popup = true;
}, false);

//function for scrubbing around in a song
function moveIndicator(e) {
  e.preventDefault();
  let clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
  let newTime = clientX - trackTime.offsetLeft;
  let timePercent = newTime/trackTime.offsetWidth;
  saveTime = timePercent*currentAudio.duration || 0;
  currentAudio.currentTime = saveTime;
};

//function for dragging to adjust sound
function audioMoveIndicator(e) {
  e.preventDefault();
  let clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
  let newVolume = clientX - adjustAudio.offsetLeft;
  let volumePercent = Math.round(Math.max(0, Math.min(newVolume/adjustAudio.offsetWidth, 1))*100)/100;
  showAudioLevel.style.width = volumePercent*100 + '%';
  currentAudio.volume = volumePercent;
  volume = volumePercent;
  localStorage.setItem('volume', JSON.stringify(volumePercent));
};

//update the thingambob that shows where you are in the song every time the song advances
currentAudio.addEventListener('timeupdate', indicator, false);

//for scrubbing to make it work with mouse and touch
let whichDown = isMobile ? 'touchstart' : 'mousedown';
let whichMove = isMobile ? 'touchmove' : 'mousemove';
let whichUp = isMobile ? 'touchend' : 'mouseup';

//click/tap to place in track
trackTime.addEventListener('click', moveIndicator, false);
adjustAudio.addEventListener('click', audioMoveIndicator, false);

//drag to place in track and drag to adjust sound
timeIndicate.addEventListener(whichDown, e => { document.addEventListener(whichMove, moveIndicator, {passive: false}); }, false);
adjustAudio.addEventListener(whichDown, e => { document.addEventListener(whichMove, audioMoveIndicator, {passive: false}); }, false);

//remove them for performance
document.addEventListener(whichUp, e => { 
  document.removeEventListener(whichMove, moveIndicator, {passive: false});
  document.removeEventListener(whichMove, audioMoveIndicator, {passive: false});
}, false);

//get the next song from the current list of songs (for non-repeat and randomization)
function setNextSong(list=songs) {
  saveTime = 0;
  currentAudio.currentTime = saveTime;
  currentAudio.src = list[currentSong].song;
  seeSong.textContent = list[currentSong].title;
  let getList = songsList.getElementsByTagName('dt');
  for (let i of getList) {
    i.setAttribute('selected', songs.indexOf(i) === currentSong ? true : false);
  }

  play();
}

//different functions for shuffle, random, etc
const nextTrack = {
  'next': () => {
    currentSong++;
    if (loop && songs[currentSong] === undefined) {
      currentSong = 0;
    }
    setNextSong();
  },
  'shuffle': () => {
    unplayed.splice(currentSong, 1);//might not work
    currentSong = Math.round(Math.random()*unplayed.length-1);
    setNextSong(unplayed);
  },
  'random': () => {
    currentSong = Math.round(Math.random() * songs.length-1);
    setNextSong();
  }
};

currentAudio.addEventListener('ended', nextTrack[next], false);

//to close all modals & stuff
function closeAll() {
  uploadpopup.classList.remove('inlineBlock');
  editSong.classList.remove('inlineBlock');
  contextMenu.classList.add('none');
  shadow.classList.add('none');
  if (upPop) {
    getTitle.value = '';
    getArtist.value = '';
    temptitle = '';
    tempartist = '';
    byUrl.value = '';
    byUrl.disabled = false;
    showFile.textContent = 'No file chosen';
  }
  if (editPop) {
    for (let i of songs) {
      if (passSong[0] === i.title) {
        if (editTitle.value !== '') { i.title = editTitle.value; }
        if (editArtist.value !== '') { i.artist = editArtist.value; }
        localStorage.setItem('songs', JSON.stringify(songs));
        saveTime = currentAudio.currentTime;
        draw();
      }
    }
  }
  upPop = false;
  popup = false;
};

//switch light and dark modes
function switchMode(setup=false) {
  if (!setup) {
    lmode = lmode ? false : true;
    localStorage.setItem('lmode', JSON.stringify(lmode));
  }
  switchList();
  everything.classList.toggle('reverse');
  playbtn.classList.toggle('invert');
  pausebtn.classList.toggle('invert');
  showAudioLevel.classList.toggle('invert');
}

//keyboard shortcuts
document.addEventListener('keydown', e => {
  let k = e.keyCode;
  if (k === 27) { closeAll(); }
  if (!popup) {
    if (k === 32) { toggle(); }
    if (k === 77) {switchMode();}
    if (k === 176) {nextTrack[next]();} //skip to next track
    if (k === 177) { //skip backwards
      if (currentAudio.currentTime > 1) { //check where others cut off
        currentAudio.currentTime = 0;
      }
    }
    if (k === 39) {currentAudio.currentTime += 5;}
    if (k === 37) {currentAudio.currentTime -= 5;}
  }
}, false);

//close modals and custom context menu
document.addEventListener(whichDown, e => {
  if (!e.target.closest('.popup')) {
    if (popup) {closeAll();}
  }
  if (!e.target.closest('#contextMenu')) {
    contextMenu.classList.add('none');
  }
}, false);

//most click actions
document.addEventListener('click', e => {
  let t = e.target;
  if (t.matches('#closeEdit')) { closeAll(); }
  if (t.matches('#modebtn')) {switchMode();}
  if (t.matches('#songsbtn')) {
    seeSongs ? songsList.style.display = 'none' : songsList.style.display = 'initial';
    seeSongs = seeSongs ? false : true;
  }
  if (!t.closest('#songsList') && window.innerWidth <= 420) {
    // if (seeSongs) {songsList.style.display = 'none';}
  }
}, false);

//save the song and timestamp before unloading
function beforeUnload() {
  saveTime = currentAudio.currentTime;
  localStorage.setItem('saveTime', JSON.stringify(saveTime));
  localStorage.setItem('currentSong', JSON.stringify(currentSong));
}
window.addEventListener('beforeunload', beforeUnload, false);

//clear localStorage and everything - just for testing
document.getElementById('clearall').addEventListener('click', () => {
  currentSong = 0;
  localStorage.clear();
  sessionStorage.clear();
  window.removeEventListener('beforeunload', beforeUnload, false);
  location.reload();
  console.log('Cleared!');
}, false);

//indexedDB stuff I don't fully understand
let db;
function createStore() {
  window.indexedDB;
  IDBTransaction = window.IDBTransaction;
  dbVersion = 1;

  let request = indexedDB.open("songs", dbVersion);
  request.onsuccess = e => {
    console.log("Success creating/accessing IndexedDB database");
    db = request.result;

    db.onerror = e => {
      console.log("Error creating/accessing IndexedDB database");
    };
  };
  request.onerror = e => {
    console.log("Error in request creating/accessing IndexedDB database");    
  }

  request.onupgradeneeded = e => {
    db = e.target.result;
    createObjectStore(e.target.result);
    console.log('upgrade needed')
  };

  console.log('Creating objectStore');
  dataBase.createObjectStore("songs");

};

function fileToArrBuf(fileT) {
  var xhr = new XMLHttpRequest();

  xhr.responseType = 'blob';
  xhr.onload = function() {
    console.log(xhr.response);
    const toStore = blobToArraybuffer(xhr.response);
    console.log(toStore);
    // ~store in IndexedDB~
  }
  xhr.onerror = function(e) {
    console.log(e, 'error');
  }
  xhr.open('GET', fileT, true);
  xhr.send();
}

function blobToArraybuffer(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('loadend', e => {
      resolve(reader.result);
    })
    reader.addEventListener('error', reject);
    reader.readAsArrayBuffer(blob);
  });
}