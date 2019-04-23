/**
 * Save songs uploaded
 * Firebase?
 * 
https://drive.google.com/open?id=1AUR-uvIKe4gDWCPweBMEWgchS3x6H9Yj
 */

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

let songsList = document.getElementById('songsList');

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

let songs = [];
let unplayed = [];
let getFile;
let upPop = false;
let next = 'next';
let loop = true;
let currentSong = 0;

let saveTime;
let currentAudio = document.createElement('audio');
document.body.appendChild(currentAudio);

let gotchem = (item, defalt, type=localStorage) => {
  let getem = type.getItem(item);
  if (getem !== null && JSON.parse(getem) !== undefined) {
    return JSON.parse(getem);
  }
  return defalt;
};

let onStart = () => {
  currentSong = gotchem('currentSong', 0);
  saveTime = gotchem('saveTime', 0);
  songs = gotchem('songs', preloaded);
  unplayed = gotchem('unplayed', songs);
}
onStart();

let draw = () => {
  currentAudio.src = songs[currentSong].song;  
  songsList.innerHTML = '';
  for (i in songs) {
    let dt = document.createElement('dt');
    let title = document.createTextNode(songs[i].title);
    let dd = document.createElement('dd');
    let artist = document.createTextNode(songs[i].artist);
    dt.appendChild(title);
    dd.appendChild(artist);
    dt.className = 'dt';
    songsList.appendChild(dt);
    songsList.appendChild(dd);
  }
  seeSong.textContent = songs[currentSong].title;
  clickList();
};

let clickList = () => {
  let getList = songsList.getElementsByTagName('dt');
  let removeArtist = songsList.getElementsByTagName('dd');
  for (let i = 0; i < getList.length; i++) {
    if (i === currentSong) {
      getList[i].style.backgroundColor = 'rgba(255, 0, 0, .5)';
    }
    getList[i].addEventListener('click', e => {
      for (let h = 0; h < getList.length; h++) {
        getList[h].style.backgroundColor = '';
      }
      getList[i].style.backgroundColor = 'rgba(255, 0, 0, .5)';
      let tempName = getList[i].textContent.replace(removeArtist[i].textContent, '');
      let findName = getList[i].textContent;
      let tempSong;
      for (j in songs) {
        if (songs[j].title+songs[j].artist === findName) {
          tempSong = songs[j].song;
        }
      }
      if (songs[currentSong].song !== tempSong) {
        for (let i = 0; i < songs.length; i++) {
          if (tempName === songs[i].title) {
            currentSong = i;
            localStorage.setItem('currentSong', JSON.stringify(currentSong));
          }
        }
        saveTime = 0;
        currentAudio.src = songs[currentSong].song;
        currentAudio.currentTime = saveTime;
        currentAudio.load();
        play();
      }
      else { toggle(); }
      seeSong.textContent = tempName;
    }, false);
  }
};

draw();

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
  return minutes + ':' + seconds;
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

uploadbtn.addEventListener('click', () => {
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
    let xhr = new XMLHttpRequest();
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
      console.log(xhr.response);
      audioCtx.decodeAudioData(audioData, function(buffer) {
        myBuffer = buffer;
        songLength = buffer.duration;
        source.buffer = myBuffer;
        source.playbackRate.value = playbackControl.value;
        source.connect(audioCtx.destination);
        source.loop = true;

        loopstartControl.setAttribute('max', Math.floor(songLength));
        loopendControl.setAttribute('max', Math.floor(songLength));
      });
    }
    xhr.open("GET", "test.mp3", true);
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
  }
  else {
    temptitle = getFile.name.slice(0, -4);
    tempartist = 'unknown';
  }
  getTitle.value = temptitle;
  getArtist.value = tempartist;
  byUrl.disabled = true;
}, false);

//open the upload modal
uploadPopbtn.addEventListener('click', () => {
  uploadpopup.classList.add('inlineBlock');
  shadow.classList.remove('none');
  upPop = true;
}, false);

currentAudio.addEventListener('timeupdate', () => {
  requestAnimationFrame(()=> {
    let percent = 100 * (currentAudio.currentTime/currentAudio.duration);
    doneGone.style.width = percent + '%';
    timeIndicate.style.marginLeft = doneGone.offsetWidth + 'px';
  });
  seeTime.textContent = `${toMinutes(currentAudio.currentTime)}/${toMinutes(currentAudio.duration)}`
}, false);

let moveIndicator = e => {
  e.preventDefault();
  let clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
  let newTime = clientX - trackTime.offsetLeft;
  timePercent = newTime/trackTime.offsetWidth;
  saveTime = timePercent*currentAudio.duration;
  currentAudio.currentTime = saveTime;
};

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
    getList[i].style.backgroundColor = i === currentSong ? 'rgba(255, 0, 0, .5)' : '';
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
  shadow.classList.add('none');
  getTitle.value = '';
  getArtist.value = '';
  temptitle = '';
  tempartist = 'unknown';
  byUrl.value = '';
  byUrl.disabled = false;
  showFile.textContent = 'No file chosen';
  upPop = false;
};

document.addEventListener('keydown', e => {
  if (e.keyCode === 27) { closeAll(); }
  if (e.keyCode === 32 && !upPop) { toggle(); }
  if (e.keyCode === 176) {}//skip to next track
  if (e.keyCode === 177) {}//skip backwards
}, false);

document.addEventListener(whichDown, e => {
  if (e.target.closest('.popup')) return;
  if (upPop) {closeAll();}
}, false);

window.addEventListener('beforeunload', () => {
  saveTime = currentAudio.currentTime;
  localStorage.setItem('saveTime', JSON.stringify(saveTime));
}, false);

document.getElementById('clearall').addEventListener('click', () => {
  localStorage.clear();
  sessionStorage.clear();
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

function downloadFile(file) {
  let xhr = new XMLHttpRequest();
  let blob;
  xhr.responseType = 'blob';
  xhr.onreadystatechange = function(e) {
    console.log('state changed');
    if (xhr.state > 2) {
      console.log('new state');
    }
  };
  xhr.onload = function() {
    if (xhr.status === 200) {
      console.log('File gotten');
      blob = xhr.response;
      console.log(xhr.response);
      // ~store in indexedDB
    }
  };
  xhr.onerror = function(e) {
    console.log(e, 'error');
  }
  console.log(xhr);
  xhr.open('GET', file, true);
}