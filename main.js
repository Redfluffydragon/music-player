/**
 * Save songs
 * play other songs
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

let songs = [{title: 'Time to Say Goodbye (Acoustic)', artist: 'John Williams', song: 'test.mp3'}];
let getFile;
let playing = false;
let upPop = false;

let saveTime;
let currentAudio = new Audio(songs[0].song);

const gotchem = (item, defalt, type=localStorage) => {
  let getem = type.getItem(item);
  if (getem !== null && JSON.parse(getem) !== undefined) {
    return JSON.parse(getem);
  }
  else {
    return defalt;
  }
};

const draw = () => {
  // ~get songs from storage~

  saveTime = gotchem('saveTime', 0);
  songsList.innerHTML = '';
  for (i in songs) {
    let dt = document.createElement('dt');
    let title = document.createTextNode(songs[i].title);
    let dd = document.createElement('dd');
    let artist = document.createTextNode(songs[i].artist);
    dt.appendChild(title);
    dd.appendChild(artist);
    dt.appendChild(dd);
    songsList.appendChild(dt);
  }
  seeSong.textContent = songs[0].title;
  clickList();
};

function clickList() {
  let getList = songsList.getElementsByTagName('dt');
  let removeArtist = songsList.getElementsByTagName('dd');
  for (let i = 0; i < getList.length; i++) {
    getList[i].addEventListener('click', () => {
      let tempName = getList[i].textContent.replace(removeArtist[i].textContent, '');
      let tempSong;
      for (j in songs) {
        if (songs[j].title === tempName) {
          tempSong = new Audio(songs[j].song);
        }
      }
      let wasPlaying = false;
      pause();
      if (playing) { wasPlaying = true;}
      if (currentAudio.src !== tempSong.src) {
        saveTime = 0;
        currentAudio = tempSong;
        wasPlaying = false;
      };
      if (!wasPlaying) { play(); }
      seeSong.textContent = tempName;
      console.log(currentAudio.duration);
    }, false);
  }
};

draw();

const play = () => {
  playing = true;
  currentAudio.currentTime = saveTime;
  currentAudio.play();
  playbtn.classList.add('none');
  pausebtn.classList.remove('none');
};

const pause = () => {
  playing = false;
  currentAudio.pause();
  saveTime = currentAudio.currentTime;
  pausebtn.classList.add('none');
  playbtn.classList.remove('none');
};

const toggle = () => {
  playing ? pause() : play();
};

playPause.addEventListener('click', () => {
  toggle();
  playPause.blur();
}, false);

uploadbtn.addEventListener('click', () => {
  let newSong;
  let title;
  let artist;
  let temptitle;
  if (getFile) {
    temptitle = getFile.name.slice(0, -4);
    newSong = getFile.name;
  }
  else if (byUrl.value !== '') {
    let url = byUrl.value;
    newSong = url.includes('drive.google') ? 'http://docs.google.com/uc?export=open&id='+url.slice(-33) : url;
    temptitle = url.slice(0, 40);
    check = new Audio(newSong);
    console.log(check);
    if (!check.GET) {
      alert('No file found');
      return;
    }
  }
  else {
    console.log('No audio to upload.');
    return;
  }
  title = getTitle.value ? getTitle.value : temptitle;
  artist = getArtist.value ? getArtist.value : 'unknown';
  playing = false;
  songs.push({title: title, artist: artist, song: newSong});
  // ~store new songs~
  draw();
  closeAll();
}, false);

file.addEventListener('change', () => {
  getFile = file.files[0];
  showFile.textContent = getFile.name;
  byUrl.disabled = true;
}, false);

uploadPopbtn.addEventListener('click', () => {
  uploadpopup.classList.add('inlineBlock');
  upPop = true;
}, false);

const closeAll = () => {
  uploadpopup.classList.remove('inlineBlock');
  getTitle.value = '';
  getArtist.value = '';
  byUrl.value = '';
  byUrl.disabled = false;
  showFile.textContent = 'No file chosen';
  upPop = false;
};

document.addEventListener('keydown', e => {
  if (e.keyCode === 27) { closeAll(); }
  if (e.keyCode === 32 && !upPop) { toggle(); }
}, false);


document.addEventListener('mousedown', e => {
  if (e.target.closest('.popup')) return;
  if (upPop) {closeAll();}
}, false);

window.addEventListener('beforeunload', () => {
  saveTime = currentAudio.currentTime;
  localStorage.setItem('saveTime', JSON.stringify(saveTime));
}, false);
