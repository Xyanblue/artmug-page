/* ===================================================
   app.js : 화면(UI) + iframe 통신 + 초기 구동
   (의존: data.js, render.js)
   =================================================== */

// ---------- 신청 폼 ----------
function copyForm() {
  var a1 = document.getElementById("v_nick").value || "-";
  var a2 = document.getElementById("v_type").value || "-";
  var a3 = document.getElementById("v_ref").value || "-";
  var a4 = document.getElementById("v_etc").value || "-";
  var E = "\n";
  var res =
    "[신청 양식]" +
    E +
    E +
    "1. 활동 닉네임: " +
    a1 +
    E +
    "2. 신청 타입: " +
    a2 +
    E +
    E +
    "3. 자료 및 레퍼런스: " +
    E +
    a3 +
    E +
    E +
    "4. 기타 요구사항: " +
    E +
    a4;
  var ta = document.createElement("textarea");
  ta.value = res;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
  alert("✨ 양식이 성공적으로 복사되었습니다!");
}

// ---------- 초기화 함수 ----------
function resetForm() {
  if (confirm("작성 중인 내용을 모두 지우시겠습니까?")) {
    document.getElementById("orderForm").reset();
  }
}

// ---------- 상하 스크롤 이동 기능  ----------
function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href").substring(1);
      let absoluteOffset = 0;

      if (targetId === "top") {
        absoluteOffset = 0;
      } else {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();
          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
          absoluteOffset = rect.top + scrollTop - 20;
        }
      }

      window.scrollTo({ top: absoluteOffset, behavior: "smooth" });

      window.parent.postMessage(
        {
          type: "scrollTo",
          offset: absoluteOffset,
        },
        "*",
      );
    });
  });
}

// ---------- 이미지 원본 보기 (새 창) ----------
// TODO: document.write -> dom api로 수정 예정
function openImageViewer(url, title) {
  const newWindow = window.open();
  newWindow.document.write(`
        <html>
            <head>
                <title>${title} - 원본 보기</title>
                <style>
                    body { 
                        margin: 0; 
                        background-color: #000; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        height: 100vh; 
                        overflow: hidden;
                    }
                    img { 
                        max-width: 100%; 
                        max-height: 100%; 
                        object-fit: contain; 
                        cursor: zoom-out;
                        animation: fadeIn 0.3s ease-in-out;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                </style>
            </head>
            <body onclick="window.close()">
                <img src="${url}" alt="${title}">
            </body>
        </html>
    `);
  newWindow.document.close();
}

// ---------- iframe 높이 전달 ----------

let rafPending = false;
let lastSentHeight = null;

function sendHeightIfChanged() {
  const height = document.documentElement.scrollHeight;
  if (height !== lastSentHeight) {
    lastSentHeight = height;
    window.parent.postMessage({ type: "setHeight", height: height }, "*");
  }
  rafPending = false;
}

const resizeObserver = new ResizeObserver(() => {
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(sendHeightIfChanged);
  }
});

resizeObserver.observe(document.body);

// ---------- Netlify Identity (초대 수락용) ----------

// Identity 설정 (초대 수락용)
function initNetlifyIdentity() {
    if (window.netlifyIdentity) {
        window.netlifyIdentity.on("init", user => {
            if (!user) {
                window.netlifyIdentity.on("login", () => { document.location.href = "/admin/"; });
            }
        });
    }
}

// ---------- 초기 구동 ----------
initAnchorScroll();
initNetlifyIdentity();

// 초기 구동
window.onload = async () => {
    const gallerySettings = await loadGallerySettings();
    renderContents('gallery', 'gallery-root', false, gallerySettings);
    renderContents('videos', 'video-root', true);
};
