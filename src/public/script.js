const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const peers = {};

const myPeer = new Peer(undefined, {
  host: '/',
  port: 3001
});

const myVideo = document.createElement('video');
myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream);

  //receber calls de outros
  myPeer.on('call', call => {
    console.log('me ligaro')
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    });
  });

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream);
  })
})

socket.on('user-disconnected', userId => {
  if(peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
})

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
  const call = myPeer.call(userId, stream); //conecta com outro peer pelo id dele
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    console.log('liguei prum otaro')
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove();
  })

  peers[userId] = call;
}