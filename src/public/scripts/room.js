let keyPressed = {};

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

function handleKeyDown(event){  
  if(keyPressed[event.code]){
    return;
  } 
  
  if(event.code === "KeyM" && event.ctrlKey){
    muteOrUnmuteMicrophone();
  } else 
  if(event.code === "KeyV" && event.ctrlKey){
    hideOrShowVideo();
  }

  keyPressed[event.code] = true;
}

function handleKeyUp(event){
  keyPressed[event.code] = false;
}

function copyRoomCodeToClipboard(){
  navigator.clipboard.writeText(ROOM_ID);
}