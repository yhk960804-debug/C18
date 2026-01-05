let correctCount = 0;

function allowDrop(ev){ ev.preventDefault();}
function drag(ev){ev.dataTransfer.setData("text", ev.target.id);}

function drop(ev, correctId){
  ev.preventDefault();
  let data = ev.dataTransfer.getData("text");
  let questionDiv = ev.target.closest(".question");
  let resultSpan = questionDiv.querySelector(".result");
  let msg = document.getElementById("message");

  if(data === correctId){
    ev.target.innerText = document.getElementById(data).innerText;
    ev.target.style.border = "2px solid #4CAF50";
    document.getElementById(data).classList.add("is-hidden");
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

  const results = document.getElementsByClassName("result");
  for (const r of results){ r.innerText = ""; }

  const options = document.getElementById("options").children;
  for (const o of options){ o.classList.remove("is-hidden"); }


  correctCount = 0;
  document.getElementById("message").innerText = "";
}

function asset(src){ return src; }

const BTN_HOME_RED       = "images/BTN_HOME_RED.png";
const BTN_HOME_YELLOW    = "images/BTN_HOME_YELLOW.png";
const BTN_RESTART_RED    = "images/BTN_RESTART_RED.png";
const BTN_RESTART_YELLOW = "images/BTN_RESTART_YELLOW.png";

function bindPressSwap(buttonEl, redSrc, yellowSrc) {
  const img = buttonEl?.querySelector("img");
  if (!buttonEl || !img) return;

  const preload = (src) => { const im = new Image(); im.src = asset(src); };
  preload(redSrc);
  preload(yellowSrc);

  const setRed = () => { img.src = asset(redSrc); };
  const setYellow = (e) => {

    if (e?.pointerType === "mouse" && e.button !== 0) return;
    img.src = asset(yellowSrc);
  };

  setRed();

  buttonEl.addEventListener("pointerdown", setYellow, { passive: true });
  buttonEl.addEventListener("pointerup", setRed, { passive: true });
  buttonEl.addEventListener("pointercancel", setRed, { passive: true });
  buttonEl.addEventListener("pointerleave", setRed, { passive: true });

  buttonEl.addEventListener("touchstart", () => setYellow(), { passive: true });
  buttonEl.addEventListener("touchend", setRed, { passive: true });
  buttonEl.addEventListener("touchcancel", setRed, { passive: true });

  buttonEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") setYellow(e);
  });
  buttonEl.addEventListener("keyup", (e) => {
    if (e.key === "Enter" || e.key === " ") setRed();
  });

  window.addEventListener("blur", setRed, { passive: true });
}

// ✅ 按钮元素（对应 HTML）
const btnBack = document.getElementById("btnBack");
const btnRestart = document.getElementById("btnRestart");

// ✅ 点击行为（一定要有，否则 restart 不会重置）
btnRestart?.addEventListener("click", resetGame);
btnBack?.addEventListener("click", () => history.back());

// ✅ 你指定的两行
bindPressSwap(btnBack, BTN_HOME_RED, BTN_HOME_YELLOW);
bindPressSwap(btnRestart, BTN_RESTART_RED, BTN_RESTART_YELLOW);
