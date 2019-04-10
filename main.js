/**
 * Save songs
 * play other songs
 */

let playbtn = document.getElementById("play");
let pausebtn = document.getElementById("pause");
let file = document.getElementById("file");
let uploadForm = document.getElementById("uploadForm");
let uploadbtn = document.getElementById("uploadbtn");
let showFile = document.getElementById("showFile");
let uploadPopbtn = document.getElementById("uploadPopbtn");
let uploadpopup = document.getElementById("uploadpopup");
let byUrl = document.getElementById("byUrl");

let songsList = document.getElementById("songsList");

let songs = [];
let getFile;
let playing = false;
let upPop = false;

let currentAudio;
let getSong = localStorage.getItem("song");
if (getSong !== null) {
  currentAudio = getSong;
}

let play = () => {
  playing = true;
  currentAudio.play();
};

let pause = () => {
  playing = false;
  currentAudio.pause();
};

let toggle = () => {
  playing ? pause() : play();
  playbtn.classList.toggle("none");
  pausebtn.classList.toggle("none");
};

playbtn.addEventListener("click", () => {
  currentAudio.play();
  toggle();
}, false);
pausebtn.addEventListener("click", () => {
  currentAudio.pause();
  toggle();
}, false);

uploadbtn.addEventListener("click", () => {
  let newSong;
  let title;
  let artist;
  let temptitle
  if (getFile) {
    temptitle = getFile.name.slice(0, -4);
    newSong = getFile.name;
  }
  else if (byUrl.value !== "") {
    let url = byUrl.value;
    newSong = url.includes("drive.google") ? "http://docs.google.com/uc?export=open&id="+url.slice(-33) : url;
    temptitle = url.slice(0, 40);
  }
  else {
    console.log('No audio to upload.');
    return;
  }
  title = getTitle.value ? getTitle.value : temptitle;
  artist = getArtist.value ? getArtist.value : "unknown";
  playing = false;
  currentAudio = new Audio(newSong);
  songs.push({title: title, artist: artist, song: newSong});
  // ~store new songs~
  draw();
  closeAll();
}, false);

file.addEventListener("change", () => {
  getFile = file.files[0];
  showFile.textContent = getFile.name;
}, false);

let draw = () => {
  // ~get songs from storage~

  for (i in songs) {
    let dt = document.createElement("dt");
    let title = document.createTextNode(songs[i].title);
    dt.appendChild(title);
    let dd = document.createElement("dd");
    let artist = document.createTextNode(songs[i].artist);
    dd.appendChild(artist);
    dt.appendChild(dd);
    songsList.appendChild(dt);
  }
};

uploadPopbtn.addEventListener("click", () => {
  uploadpopup.classList.add("inlineBlock");
  upPop = true;
}, false);

let closeAll = () => {
  uploadpopup.classList.remove("inlineBlock");
  getTitle.value = "";
  getArtist.value = "";
  byUrl.value = "";
  upPop = false;
};

document.addEventListener("keydown", e => {
  if (e.keyCode == 27) {
    closeAll();
  }
}, false);

document.addEventListener("mousedown", e => {
  if (e.target.closest(".popup")) return;
  if (upPop) {closeAll();}
}, false);
