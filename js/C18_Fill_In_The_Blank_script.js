let correctCount = 0;

function allowDrop(ev){
  ev.preventDefault();
}

function drag(ev){
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev, correctId){
  ev.preventDefault();
  let data = ev.dataTransfer.getData("text");
  let questionDiv = ev.target.closest(".question");
  let resultSpan = questionDiv.querySelector(".result");
  let msg = document.getElementById("message");

  if(data === correctId){
    ev.target.innerText = document.getElementById(data).innerText;
    ev.target.style.border = "2px solid #4CAF50";
    document.getElementById(data).style.display = "none";
    resultSpan.innerText = "✅";
    msg.innerText = "";

    if(!ev.target.classList.contains("done")){
      ev.target.classList.add("done");
      correctCount++;
    }

    if(correctCount === 5){
      msg.innerText = "🎉 完全答对！🌟";
    }
  }else{
    msg.innerText = "🤔 想一想，再回答 🤍";
  }
}

function resetGame(){
  let blanks = document.getElementsByClassName("blank");
  for(let b of blanks){
    b.innerText = "";
    b.style.border = "2px dashed #999";
    b.classList.remove("done");
  }

  let results = document.getElementsByClassName("result");
  for(let r of results){
    r.innerText = "";
  }

  let options = document.getElementById("options").children;
  for(let o of options){
    o.style.display = "inline-block";
  }

  correctCount = 0;
  document.getElementById("message").innerText = "";
}

function goBack(){
  window.history.back();
}
