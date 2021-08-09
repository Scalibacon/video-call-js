const videoGrid = document.getElementById('video-grid');
const peers = {};
const socket = io('/');
let myStreamTracks;

//necessário executar peerjs --port 3001 no servidor
const myPeer = new Peer(undefined, {
  host: '/',
  port: 3001
});

const myVideo = document.createElement('video');
myVideo.setAttribute('class', 'user');
myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(myStream => {
  myStreamTracks = myStream;
  setupVideoCall(myStream);
})

function setupVideoCall(myStream){
  console.log(ROOM_ID)
  addVideoStream(myVideo, myStream);   

  socket.emit('join-room', ROOM_ID, myPeer.id);

  // quando receber calls de outros
  myPeer.on('call', call => {
    console.log('Outro peer me enviou call')
    call.answer(myStream);
    const video = document.createElement('video');
    video.setAttribute('id', call.peer);
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    });
  });  

  socket.on('user-connected', userId => {
    console.log('Conectando com novo usuário...')
    connectToNewUser(userId, myStream);
  })
  
  socket.on('connect-with-old-users', usersList => { 
    console.log('Conectando com usuários já conectados...')   
    for(let i in usersList){
      if(i === socket.id) 
        continue;
  
      connectToNewUser(usersList[i], myStream)
    }
  })

  socket.on('user-disconnected', userId => {
    if(peers[userId]) peers[userId].close()
  })
}

//adiciona uma stream de áudio/vídeo num elemento video
function addVideoStream(video, stream){
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}

//fazer calls com outros
function connectToNewUser(userId, stream){
  console.log(userId);
  const call = myPeer.call(userId, stream); //conecta com outro peer pelo id dele

  // retirado pois estava duplicando os vídeos dos outros peers
  // const video = document.createElement('video');
  // video.setAttribute("id", userId);
  // recebe stream de outro peer
  // call.on('stream', userVideoStream => {
  //   addVideoStream(video, userVideoStream);
  // });

  call.on('close', () => {
    const userVideo = document.getElementById(userId);
    if(userVideo) userVideo.remove();
  })

  peers[userId] = call;
}

function copyRoomCodeToClipboard(){
  navigator.clipboard.writeText(ROOM_ID);
}

function muteOrUnmuteMicrophone(event){
  myStreamTracks.getAudioTracks()[0].enabled = !myStreamTracks.getAudioTracks()[0].enabled;
}

function hideOrShowVideo(event){
  console.log(myStreamTracks)
  myStreamTracks.getVideoTracks()[0].enabled = !myStreamTracks.getVideoTracks()[0].enabled;
}