const videoGrid = document.getElementById('video-grid');
const peers = {};
let socket = io('/');

let myStreamTracks;

const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: SERVER_PORT
});

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(myStream => {
  myStreamTracks = myStream;
  setupVideoCall(myStream);
})

function setupVideoCall(myStream){  
  const myVideo = document.createElement('video');
  myVideo.setAttribute('class', 'user');
  myVideo.muted = true;

  addVideoStream(myVideo, myStream, myPeer.id);   

  socket.emit('join-room', ROOM_ID, myPeer.id);

  // quando receber calls de outros
  myPeer.on('call', call => {
    console.log('Outro peer me enviou call: ' + call.peer)
    call.answer(myStream); // envia minha stream
    const video = document.createElement('video');    
    call.on('stream', peerVideoStream => { // quando recebe stream
      addVideoStream(video, peerVideoStream, call.peer);
    });
  });  

  socket.on('peer-connected', peerId => {
    console.log('Conectando com novo peer: ' + peerId);
    connectToNewPeer(peerId, myStream);
  })
  
  socket.on('connect-with-old-peers', peersList => { 
    console.log('Conectando com peers já conectados...') 
    for(let i in peersList){
      if(i === socket.id) 
        continue;
  
      connectToNewPeer(peersList[i].peerId, myStream)
    }
  })

  socket.on('peer-disconnected', peerId => {
    if(peers[peerId]) peers[peerId].close()
  })

  socket.on('peer-mute', (peerId) => {
    mutePeer(peerId);
  })

  socket.on('peer-unmute', (peerId) => {
    unmutePeer(peerId);
  })

  socket.on('peer-close-camera', (peerId) => {
    hidePeerVideo(peerId);
  })

  socket.on('peer-open-camera', (peerId) => {
    showPeerVideo(peerId);
  })
}

//adiciona uma stream de áudio/vídeo num elemento video
function addVideoStream(video, stream, peerId){
  if(document.getElementById(peerId)){
    return;
  }
  
  const container = document.createElement('div');

  const videoStatusSection = document.createElement('section');
  const imgMuted = document.createElement('img');
  imgMuted.src = '../assets/muted.png';
  imgMuted.classList.add('muted');

  const imgCamOff = document.createElement('img');
  imgCamOff.src = '../assets/cam-off.png';
  imgCamOff.classList.add('cam-off');

  videoStatusSection.append(imgMuted);
  videoStatusSection.append(imgCamOff);

  video.setAttribute('id', peerId);
  video.srcObject = stream;

  video.addEventListener('loadedmetadata', () => {
    video.play();
  });

  container.append(video);
  container.append(videoStatusSection);

  videoGrid.append(container);
}

//fazer calls com outros peers
function connectToNewPeer(peerId, stream){
  const call = myPeer.call(peerId, stream); //conecta com outro peer pelo id dele

  call.on('close', () => {
    removePeerVideo(peerId);
  })

  peers[peerId] = call;
}

function muteOrUnmuteMicrophone(){
  if(!myStreamTracks){
    return;
  }

  myStreamTracks.getAudioTracks()[0].enabled = !myStreamTracks.getAudioTracks()[0].enabled;

  const micContainer = document.getElementById('mic-container');

  if(myStreamTracks.getAudioTracks()[0].enabled){
    socket.emit('unmute');
    micContainer.classList.remove('icon-disabled');
  } else {
    socket.emit('mute');
    micContainer.classList.add('icon-disabled');
  }
}

function hideOrShowVideo(){
  if(!myStreamTracks){
    return;
  }

  myStreamTracks.getVideoTracks()[0].enabled = !myStreamTracks.getVideoTracks()[0].enabled;

  const camContainer = document.getElementById('cam-container');

  if(myStreamTracks.getVideoTracks()[0].enabled){
    socket.emit('open-camera');
    camContainer.classList.remove('icon-disabled');
  } else {
    socket.emit('close-camera');
    camContainer.classList.add('icon-disabled');
  }
}

function removePeerVideo(peerId){
  const peerVideoContainer = document.getElementById(peerId).parentElement;
  if(peerVideoContainer) {
    peerVideoContainer.remove();
  }
}

function mutePeer(peerId){
  console.log('peer muted: ' + peerId)

  const peerVideoContainer = document.getElementById(peerId).parentElement;
  const imgMuted = peerVideoContainer.querySelector('.muted');
  imgMuted.style.display = "block";
}

function unmutePeer(peerId){
  console.log('peer unmuted: ' + peerId)

  const peerVideoContainer = document.getElementById(peerId).parentElement;
  const imgMuted = peerVideoContainer.querySelector('.muted');
  imgMuted.style.display = "none";
}

function hidePeerVideo(peerId){
  console.log('peer closed camera: ' + peerId)

  const peerVideoContainer = document.getElementById(peerId).parentElement;
  const imgCamOff = peerVideoContainer.querySelector('.cam-off');
  imgCamOff.style.display = "block";
}

function showPeerVideo(peerId){
  console.log('peer opened camera: ' + peerId)

  const peerVideoContainer = document.getElementById(peerId).parentElement;
  const imgCamOff = peerVideoContainer.querySelector('.cam-off');
  imgCamOff.style.display = "none";
}