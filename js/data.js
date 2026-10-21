/* ===================================================
   data.js : 설정 + 유틸 + 데이터 로딩
   =================================================== */

// ------------ 설정

const USER_NAME = "xyanblue";
const REPO_NAME = "artmug-page";
const isLocalPreview = ["localhost", "127.0.0.1", "::1"].includes(
  window.location.hostname,
);
const DEFAULT_GALLERY_DISPLAY = {
  vertical_display: "slider",
  vertical_slides_per_view: 2,
  horizontal_display: "slider",
  horizontal_slides_per_view: 1,
};

// ------------ 유틸

// 유튜브 ID 추출 로직
function getVid(url) {
  const reg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const m = url.match(reg);
  return m && m[2].length === 11 ? m[2] : null;
}

// ------------- 데이터 로딩

async function loadGallerySettings() {
  try {
    let data;
    if (isLocalPreview) {
      const res = await fetch("content/gallery-settings.json");
      if (!res.ok) throw new Error("로컬 설정 파일을 찾을 수 없습니다.");
      data = await res.json();
    } else {
      const rawUrl = `https://raw.githubusercontent.com/${USER_NAME}/${REPO_NAME}/main/content/gallery-settings.json`;
      const res = await fetch(rawUrl);
      if (!res.ok) throw new Error("설정 파일을 찾을 수 없습니다.");
      data = await res.json();
    }
    return { ...DEFAULT_GALLERY_DISPLAY, ...data };
  } catch (err) {
    console.error("갤러리 설정 로드 실패, 기본값 사용:", err);
    return DEFAULT_GALLERY_DISPLAY;
  }
}
