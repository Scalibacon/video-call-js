function handleEnterRoom(event){
  event.preventDefault();
  
  const roomId = document.getElementById("roomId").value;
  window.location.href = `/${roomId}`;
}

function handleCreateRoom(){
  window.location.href = "/room";
}