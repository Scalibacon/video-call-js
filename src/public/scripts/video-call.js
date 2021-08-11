const videoGrid = document.getElementById('video-grid');
const peers = {};
const socket = io('/');
let myStreamTracks;

//necessário executar peerjs --port 3001 no servidor
const myPeer = new Peer(undefined, {
  host: '/',
  port: 3001
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
    console.log('Outro peer me enviou call')
    call.answer(myStream); // envia minha stream
    const video = document.createElement('video');
    video.setAttribute('id', call.peer);
    call.on('stream', peerVideoStream => { // quando recebe stream
      addVideoStream(video, peerVideoStream, call.peer);
    });
  });  

  socket.on('peer-connected', peerId => {
    console.log('Conectando com novo peer...')
    connectToNewPeer(peerId, myStream);
  })
  
  socket.on('connect-with-old-peers', peersList => { 
    console.log('Conectando com peers já conectados...')   
    for(let i in peersList){
      if(i === socket.id) 
        continue;
  
      connectToNewPeer(peersList[i], myStream)
    }
  })

  socket.on('peer-disconnected', peerId => {
    if(peers[peerId]) peers[peerId].close()
  })
}

//adiciona uma stream de áudio/vídeo num elemento video
function addVideoStream(video, stream, peerId){
  console.log(peerId)
  video.srcObject = stream;

  video.addEventListener('loadedmetadata', () => {
    video.play();
  });

  //addVideoToScreen(video, peerId)
  videoGrid.append(video);
}

//fazer calls com outros peers
function connectToNewPeer(peerId, stream){
  const call = myPeer.call(peerId, stream); //conecta com outro peer pelo id dele

  // retirado pois estava duplicando os vídeos dos outros peers
  // const video = document.createElement('video');
  // video.setAttribute("id", peerId);
  // recebe stream de outro peer
  // call.on('stream', peerVideoStream => {
  //   addVideoStream(video, peerVideoStream);
  // });

  call.on('close', () => {
    const peerVideo = document.getElementById(peerId);
    if(peerVideo) peerVideo.remove();
  })

  peers[peerId] = call;
}

function copyRoomCodeToClipboard(){
  navigator.clipboard.writeText(ROOM_ID);
}

function muteOrUnmuteMicrophone(event){
  if(!myStreamTracks){
    return;
  }

  myStreamTracks.getAudioTracks()[0].enabled = !myStreamTracks.getAudioTracks()[0].enabled;

  const micContainer = document.getElementById('mic-container');

  if(myStreamTracks.getAudioTracks()[0].enabled){
    micContainer.classList.remove('icon-disabled');
  } else {
    micContainer.classList.add('icon-disabled');
  }
}

function hideOrShowVideo(event){
  if(!myStreamTracks){
    return;
  }

  myStreamTracks.getVideoTracks()[0].enabled = !myStreamTracks.getVideoTracks()[0].enabled;

  const camContainer = document.getElementById('cam-container');

  if(myStreamTracks.getVideoTracks()[0].enabled){
    camContainer.classList.remove('icon-disabled');
  } else {
    camContainer.classList.add('icon-disabled');
  }
}