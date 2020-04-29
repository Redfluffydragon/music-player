/**
 * Save songs uploaded, for offline

https://drive.google.com/open?id=1AUR-uvIKe4gDWCPweBMEWgchS3x6H9Yj
 */
// localStorage.clear();

let playbtn = document.getElementById('play');
let pausebtn = document.getElementById('pause');
let playPause = document.getElementById('playPause');

let file = document.getElementById('file');
let uploadForm = document.getElementById('uploadForm');
let uploadbtn = document.getElementById('uploadbtn');
let showFile = document.getElementById('showFile');
let uploadPopbtn = document.getElementById('uploadPopbtn');
let uploadpopup = document.getElementById('uploadpopup');
let byUrl = document.getElementById('byUrl');

let contextMenu = document.getElementById('contextMenu');
let editSong = document.getElementById('editSong');
let editTitle = document.getElementById('editTitle');
let editArtist = document.getElementById('editArtist');

let songsList = document.getElementById('songsList');
let getList = songsList.getElementsByClassName('dt');

let seeSong = document.getElementById('seeSong');

let timeIndicate = document.getElementById('timeIndicate');
let trackTime = document.getElementById('trackTime');
let doneGone = document.getElementById('doneGone');
let seeTime = document.getElementById('seeTime');

let isMobile = (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);

let preloaded = [
  {title: 'Time to Say Goodbye (Acoustic)', artist: 'Jeff Williams', song: 'test.mp3'},
  {title: 'The Longing (cover)', artist: 'Patty Gurdy', song: 'Patty Gurdy - The Longing (cover).mp3'}
];

let getFile;
let upPop = false;
let popup = false;
let seeSongs;

let passSong;

let currentAudio = document.getElementById('currentAudio');

let gotchem = (item, defalt, type=localStorage) => {
  let getem = type.getItem(item);
  if (getem !== null && JSON.parse(getem) !== undefined) { return JSON.parse(getem); }
  return defalt;
};

let songs = gotchem('songs', preloaded);
let saveTime = gotchem('saveTime', 0);
let unplayed = gotchem('unplayed', songs);
let next = gotchem('next', 'next');
let loop = gotchem('loop', true);
let lmode = gotchem('lmode', true);
let currentSong = gotchem('currentSong', 0);
if (currentSong > songs.length-1) {
  currentSong = 0;
}

let indicator = () => {
  requestAnimationFrame(() => {
    let percent = 100 * (currentAudio.currentTime/currentAudio.duration);
    doneGone.style.width = percent + '%';
    timeIndicate.style.marginLeft = doneGone.offsetWidth + 'px';
  });
  seeTime.textContent = `${toMinutes(currentAudio.currentTime)}/${toMinutes(currentAudio.duration)}`
};

let draw = () => {
  currentAudio.src = songs[currentSong].song;
  currentAudio.addEventListener('loadedmetadata', () => {//show correct place on reload and open
    currentAudio.currentTime = saveTime;
    indicator();
  }, false);

  songsList.innerHTML = '';
  for (i in songs) {
    let dt = document.createElement('dt');
    let title = songs[i].title+'<br><em>'+songs[i].artist+'</em>';
    dt.innerHTML = title;
    dt.className = 'dt';
    songsList.appendChild(dt);
  }
  seeSong.textContent = songs[currentSong].title;
  getList[currentSong].setAttribute('selected', true);
};

let clickList = () => {
  songsList.addEventListener('click', e => {
    for (let i = 0; i < getList.length; i++) {
      getList[i].setAttribute('selected', false);
    }
    e.target.setAttribute('selected', true);
    
    let findName = e.target.innerHTML.split('<br>')[0];
    let tempSong;
    for (let j in songs) { //get song by title
      if (songs[j].title === findName) {
        tempSong = songs[j];
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
      for (let i in songs) {
        if (songs[i].title === passSong[0]) {
          songs.splice(i, 1);
          localStorage.setItem('songs', JSON.stringify(songs));
          saveTime = currentAudio.currentTime;
          draw();
          return;
        }
      }
    }
  }
}, false);
contextMenu.addEventListener('contextmenu', e => { e.preventDefault(); }, false);

let switchList = () => {
  for (let i = 0; i < getList.length; i++) {
    getList[i].setAttribute('lmode', lmode);
  }
}

let onStart = () => {
  draw();
  clickList();
}
window.addEventListener('load', onStart, false);
window.addEventListener('resize', indicator, false);


let play = () => {
  currentAudio.currentTime = saveTime;
  currentAudio.play();
  playbtn.classList.add('none');
  pausebtn.classList.remove('none');
};

let pause = () => {
  currentAudio.pause();
  saveTime = currentAudio.currentTime;
  pausebtn.classList.add('none');
  playbtn.classList.remove('none');
};

let toggle = () => currentAudio.paused ? play() : pause();

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

playPause.addEventListener('click', () => {
  toggle();
  playPause.blur();
}, false);

let temptitle;
let tempartist;

uploadbtn.addEventListener('click', () => { //upload a new song
  let newSong;
  let title;
  let artist;
  if (byUrl.value !== '') {
    let url = byUrl.value;
    newSong = url.includes('drive.google') ? 'http://docs.google.com/uc?export=open&id='+url.slice(-33) : url;
    temptitle = url.slice(0, 40);
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

//when a file is picked
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

let moveIndicator = e => {
  e.preventDefault();
  let clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
  let newTime = clientX - trackTime.offsetLeft;
  timePercent = newTime/trackTime.offsetWidth;
  saveTime = timePercent*currentAudio.duration;
  currentAudio.currentTime = saveTime;
};

currentAudio.addEventListener('timeupdate', indicator, false);

//for scrubbing
let whichDown = isMobile ? 'touchstart' : 'mousedown';
let whichMove = isMobile ? 'touchmove' : 'mousemove';
let whichUp = isMobile ? 'touchend' : 'mouseup';

//click/tap to place in track
trackTime.addEventListener('click', moveIndicator, false);

//drag to place in track
timeIndicate.addEventListener(whichDown, e => { document.addEventListener(whichMove, moveIndicator, {passive: false}); }, false);
document.addEventListener(whichUp, e => { document.removeEventListener(whichMove, moveIndicator, {passive: false}); }, false);

function setNextSong(list=songs) {
  saveTime = 0;
  currentAudio.currentTime = saveTime;
  currentAudio.src = list[currentSong].song;
  seeSong.textContent = list[currentSong].title;
  let getList = songsList.getElementsByTagName('dt');
  for (let i = 0; i < getList.length; i++) {
    getList[i].setAttribute('selected', i === currentSong ? true : false);
  }
  play();
}

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
}

currentAudio.addEventListener('ended', nextTrack[next], false);

const closeAll = () => {
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
    for (let i in songs) {
      if (passSong[0] === songs[i].title) {
        if (editTitle.value !== '') { songs[i].title = editTitle.value; }
        if (editArtist.value !== '') { songs[i].artist = editArtist.value; }
        localStorage.setItem('songs', JSON.stringify(songs));
        saveTime = currentAudio.currentTime;
        draw();
      }
    }
  }
  upPop = false;
  popup = false;
};

let switchMode = () => {
  lmode = lmode ? false : true;
  switchList();
  everything.classList.toggle('reverse');
  playbtn.classList.toggle('invert');
  pausebtn.classList.toggle('invert');
}

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

document.addEventListener(whichDown, e => {
  if (!e.target.closest('.popup')) {
    if (popup) {closeAll();}
  }
  if (!e.target.closest('#contextMenu')) {
    contextMenu.classList.add('none');
  }
}, false);

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

function beforeUnload() {
  saveTime = currentAudio.currentTime;
  localStorage.setItem('saveTime', JSON.stringify(saveTime));
  localStorage.setItem('currentSong', JSON.stringify(currentSong));
}

window.addEventListener('beforeunload', beforeUnload, false);

document.getElementById('clearall').addEventListener('click', () => {
  currentSong = 0;
  localStorage.clear();
  sessionStorage.clear();
  window.removeEventListener('beforeunload', beforeUnload, false);
  location.reload();
  console.log('Cleared!');
}, false);

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
    console.log("Error creating/accessing IndexedDB database");    
  }

  request.onupgradeneeded = e => {
    db = e.target.result;
    createObjectStore(e.target.result);
    console.log('upgrade needed')
  };

  console.log('Creating objectStore');
  dataBase.createObjectStore("songs");

};

function fileToArrBuf(filet) {
  var xhr = new XMLHttpRequest();

  xhr.responseType = 'arraybuffer';
  xhr.onload = function() {
    console.log(xhr.response);
    // ~store in IndexedDB~
  }
  xhr.onerror = function(e) {
    console.log(e, 'error');
  }
  xhr.open('GET', filet, true);
  xhr.send();
}