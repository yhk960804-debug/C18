let correctCount = 0;
const TOTAL_QUESTIONS = document.querySelectorAll(".blank").length;


function allowDrop(ev){ ev.preventDefault();}
function drag(ev){ev.dataTransfer.setData("text", ev.target.id);}

function drop(ev, correctId){
  ev.preventDefault();
  let data = ev.dataTransfer.getData("text");
  let questionDiv = ev.target.closest(".question");
  if (!questionDiv) return;
  let resultSpan = questionDiv.querySelector(".result");
  if (!resultSpan) return;
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

    if(correctCount === TOTAL_QUESTIONS){
      msg.innerText = "🎉 恭喜答对！🌟";
    }
    }else{
      msg.innerText = "🤔 想一想，再回答";
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

/* ===== 电脑端：原生拖拽时高亮答案框（不影响判题） ===== */
(function enableDesktopHover(){
  // 只在支持 hover 的设备启用（避免跟手机端重复）
  if (!window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches) return;

  document.querySelectorAll(".blank").forEach(b=>{
    b.addEventListener("dragenter", () => b.classList.add("hover"));
    b.addEventListener("dragleave", () => b.classList.remove("hover"));
    b.addEventListener("drop",      () => b.classList.remove("hover"));
  });
})();
  const blanks = document.querySelectorAll(".blank");

  blanks.forEach(b=>{
    b.addEventListener("dragenter", () => b.classList.add("hover"));
    b.addEventListener("dragleave", () => b.classList.remove("hover"));
    b.addEventListener("drop", () => b.classList.remove("hover"));
  });

/* ===== 手机端：触控拖拽（不影响电脑端原生 DnD） ===== */
(function enableTouchDrag(){
  const isTouch =
    ("ontouchstart" in window) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

  if (!isTouch) return; // ✅ 电脑端不做任何事

  const words = Array.from(document.querySelectorAll(".word"));

  // 从 ondrop="drop(event,'xxx')" 解析 correctId（不改 HTML）
  function getCorrectId(blankEl){
    const s = blankEl.getAttribute("ondrop") || "";
    const m = s.match(/drop\(event,'([^']+)'\)/);
    return m ? m[1] : "";
  }

  function applyDrop(wordId, blankEl){
    const correctId = getCorrectId(blankEl);
    if (!correctId) return;

    // 伪造 event，让你原本 drop(ev, correctId) 继续工作
    const fakeEvent = {
      preventDefault(){},
      target: blankEl,
      dataTransfer: { getData(){ return wordId; } }
    };
    drop(fakeEvent, correctId);
  }

  let activeWord = null, ghost = null, ox = 0, oy = 0, hoverBlank = null;

  function pt(e){
    const t = e.touches?.[0] || e.changedTouches?.[0];
    return t ? {x: t.clientX, y: t.clientY} : {x: e.clientX, y: e.clientY};
  }

  function setHoverBlank(b){
    if (hoverBlank === b) return;
    hoverBlank?.classList.remove("hover");
    hoverBlank = b;
    hoverBlank?.classList.add("hover");
  }

  function start(e){

    e.preventDefault();
    activeWord = e.currentTarget;

    // ✅ 仅手机触控拖拽时避免原生 draggable 干扰
    activeWord.draggable = false;

    const p = pt(e);
    const r = activeWord.getBoundingClientRect();
    ox = p.x - r.left;
    oy = p.y - r.top;

    ghost = activeWord.cloneNode(true);
    ghost.style.position = "fixed";
    ghost.style.left = (p.x - ox) + "px";
    ghost.style.top  = (p.y - oy) + "px";
    ghost.style.zIndex = 9999;
    ghost.style.opacity = "0.92";
    ghost.style.pointerEvents = "none";
    document.body.appendChild(ghost);

    // ✅ 关键：move/end 绑到 window，手指移出选项也不会丢事件
    window.addEventListener("touchmove", move, {passive:false});
    window.addEventListener("touchend", end, {passive:false});
    window.addEventListener("touchcancel", end, {passive:false});

  // 锁住拖动分身尺寸（只在手机横屏）
const isLandscapePhone = window.matchMedia("(max-width: 900px) and (orientation: landscape)").matches;
if (isLandscapePhone) {
  const r = activeWord.getBoundingClientRect();
  ghost.style.width = r.width + "px";
  ghost.style.height = r.height + "px";
  ghost.style.boxSizing = "border-box";
}
  }

  function move(e){
    if (!ghost) return;
    e.preventDefault();

    const p = pt(e);
    ghost.style.left = (p.x - ox) + "px";
    ghost.style.top  = (p.y - oy) + "px";

    const el = document.elementFromPoint(p.x, p.y);
    const blank = el?.closest?.(".blank") || null;
    setHoverBlank(blank);
  }

  function end(e){
    if (!ghost) return;
    e.preventDefault();

    const p = pt(e);
    const el = document.elementFromPoint(p.x, p.y);
    const blank = el?.closest?.(".blank") || null;

    if (blank && activeWord) {
      applyDrop(activeWord.id, blank);
    }

    ghost.remove();
    ghost = null;
    activeWord = null;
    setHoverBlank(null);

    window.removeEventListener("touchmove", move);
    window.removeEventListener("touchend", end);
    window.removeEventListener("touchcancel", end);
  }

  words.forEach(w=>{
    w.addEventListener("touchstart", start, {passive:false});
  });
})();

// ✅ 点击行为（一定要有，否则 restart 不会重置）
btnRestart?.addEventListener("click", resetGame);
btnBack?.addEventListener("click", () => history.back());

// ✅ 你指定的两行
bindPressSwap(btnBack, BTN_HOME_RED, BTN_HOME_YELLOW);
bindPressSwap(btnRestart, BTN_RESTART_RED, BTN_RESTART_YELLOW);

/* ===== 自动缩放：保证一页内显示（题目+message+按钮都在屏幕内） ===== */
(function fitToOneScreen(){
  const root = document.getElementById("fitRoot");
  const content = document.getElementById("fitContent");
  if (!root || !content) return;

  function applyFit(){
    // 先还原，测真实尺寸
    content.style.transform = "scale(1)";

    // 可用空间（视口内）
    const availW = root.clientWidth;
    const availH = root.clientHeight;

    // 内容本体实际尺寸
    const rect = content.getBoundingClientRect();
    const contentW = rect.width;
    const contentH = rect.height;

    if (contentW <= 0 || contentH <= 0) return;

    // 计算缩放比例：宽高都要塞进一屏
    const sW = availW / contentW;
    const sH = availH / contentH;
    const s = Math.min(1, sW, sH);

    content.style.transform = `scale(${s})`;
  }

  // 初次 + resize + 旋转
  window.addEventListener("load", applyFit, { passive: true });
  window.addEventListener("resize", applyFit, { passive: true });
  window.addEventListener("orientationchange", applyFit, { passive: true });

  // 若字体加载后高度变化，再补一次
  setTimeout(applyFit, 80);
  setTimeout(applyFit, 250);
})();