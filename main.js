/**
 * Save songs
 * play other songs after current song ends
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

let songs = [{title: 'Time to Say Goodbye (Acoustic)', artist: 'John Williams', song: 'test.mp3'}];
let getFile;
let playing = false;
let upPop = false;
let next = 'next';
let currentSong = 0;

let saveTime;
let currentAudio = document.createElement('audio');
document.body.appendChild(currentAudio);

const nextTrack = {
  'next': () => {

  },
  'shuffle': () => {},
  'random': () => {}
}

const gotchem = (item, defalt, type=localStorage) => {
  let getem = type.getItem(item);
  if (getem !== null && JSON.parse(getem) !== undefined) {
    return JSON.parse(getem);
  }
  else {
    return defalt;
  }
};

const onStart = () => {
  currentSong = gotchem('currentSong', 0);
  songs = gotchem('songs', [{title: 'Time to Say Goodbye (Acoustic)', artist: 'John Williams', song: 'test.mp3'}]);
  saveTime = gotchem('saveTime', 0);
}
onStart();

const draw = () => {
  currentAudio.src = songs[currentSong].song;  
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
  seeSong.textContent = songs[currentSong].title;
  clickList();
};

function clickList() {
  let getList = songsList.getElementsByTagName('dt');
  let removeArtist = songsList.getElementsByTagName('dd');
  for (let i = 0; i < getList.length; i++) {
    getList[i].addEventListener('click', () => {
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
        play();
      }
      else { toggle(); }
      seeSong.textContent = tempName;
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

function toMinutes(time) {
  let minutes = Math.trunc(time/60);
  let seconds = Math.round((Math.trunc(time-minutes*60)/100)*100);
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  return minutes + ':' + seconds;
}

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
  /* if (byUrl.value !== '') {
    let url = byUrl.value;
    newSong = url.includes('drive.google') ? 'http://docs.google.com/uc?export=open&id='+url.slice(-33) : url;
    temptitle = url.slice(0, 40);
  }
  else  */if (getFile) {
    newSong = getFile.name;
  }
  else {
    return;
  }
  title = getTitle.value ? getTitle.value : temptitle;
  artist = getArtist.value ? getArtist.value : tempartist;
  playing = false;
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

function moveIndicator(e) {
  e.preventDefault();
  let newTime = e.clientX - trackTime.offsetLeft;
  timePercent = newTime/trackTime.offsetWidth;
  saveTime = timePercent*currentAudio.duration;
  currentAudio.currentTime = saveTime;
};

trackTime.addEventListener('click', moveIndicator, false);

timeIndicate.addEventListener('mousedown', e => {
  document.addEventListener('mousemove', moveIndicator, false);
}, false);

document.addEventListener('mouseup', e => {
  document.removeEventListener('mousemove', moveIndicator, false);
}, false);

currentAudio.addEventListener('onended', () => {
  nextTrack[next]();
}, false);

const closeAll = () => {
  uploadpopup.classList.remove('inlineBlock');
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
}, false);


document.addEventListener('mousedown', e => {
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