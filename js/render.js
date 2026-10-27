/* ===================================================
   render.js : 갤러리 / 영상 렌더링
   (의존: data.js, app.js의 openImageViewer · sendHeightIfChanged)
   =================================================== */

// ---------- 갤러리 슬라이더 ----------

function createGallerySlider(root, perPage) {
  const items = Array.from(root.querySelectorAll(".img-item"));
  if (!items.length) return;

  perPage = Math.max(1, parseInt(perPage, 10) || 1);
  if (items.length <= perPage) return;

  root.innerHTML = "";
  root.classList.add("gallery-slider-active"); // 부모 그리드 해제 → 폭 100% 확보

  const swiperEl = document.createElement("div");
  swiperEl.className = "swiper gallery-slider";

  const wrapper = document.createElement("div");
  wrapper.className = "swiper-wrapper";
  // slide 생성
  for (let i = 0; i < items.length; i += perPage) {
    const pageItems = items.slice(i, i + perPage);

    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    const page = document.createElement("div");
    page.className = "gallery-slide-page";
    page.style.setProperty("--per-page", perPage);

    pageItems.forEach((item) => page.appendChild(item));

    for (let k = pageItems.length; k < perPage; k++) {
      const ghost = document.createElement("div");
      ghost.className = "img-item is-ghost";
      page.appendChild(ghost);
    }

    slide.appendChild(page);
    wrapper.appendChild(slide);
  }

  swiperEl.appendChild(wrapper);
  root.appendChild(swiperEl);

  // 컨트롤(버튼+페이지네이션)을 별도로 분리하고 커스텀 클래스 부착
  const controls = document.createElement("div");
  controls.className = "gallery-slider-controls";

  const prev = document.createElement("div");
  prev.className = "gallery-slider-button gallery-slider-prev";

  const next = document.createElement("div");
  next.className = "gallery-slider-button gallery-slider-next";

  const pagination = document.createElement("div");
  pagination.className = "gallery-slider-pagination";

  controls.appendChild(prev);
  controls.appendChild(pagination);
  controls.appendChild(next);
  root.appendChild(controls);

  new Swiper(swiperEl, {
    slidesPerView: 1,
    spaceBetween: 20,
    autoHeight: false,
    loop: items.length >= perPage * 2,
    navigation: { prevEl: prev, nextEl: next },
    pagination: { el: pagination, clickable: true },
  });

  requestAnimationFrame(sendHeightIfChanged);
}


// GitHub API를 통해 데이터를 직접 불러오는 함수
async function renderContents(folder, targetId, isVideo = false, gallerySettings = DEFAULT_GALLERY_DISPLAY) {
    const root = document.getElementById(targetId);
    try {
        let items;
        if (!isVideo) {
            const base = isLocalPreview ? 'content' : `https://raw.githubusercontent.com/${USER_NAME}/${REPO_NAME}/main/content`;
            const groups = await Promise.all(['vertical', 'horizontal'].map(async orientation => {
                const response = await fetch(`${base}/gallery-${orientation}.json`, { cache: 'no-store' });
                if (!response.ok) throw new Error('일러스트 목록을 불러오지 못했습니다.');
                const data = await response.json();
                return data.items.map(item => ({ ...item, orientation }));
            }));
            items = groups.flat();
        } else if (isLocalPreview) {
            const localRes = await fetch(`data/all-${folder}.json`);
            if (!localRes.ok) throw new Error('로컬 데이터 파일을 찾을 수 없습니다. node merge-data.js를 실행해주세요.');
            items = await localRes.json();
        } else {
            const listRes = await fetch(`https://api.github.com/repos/${USER_NAME}/${REPO_NAME}/contents/content/${folder}`);
            if (!listRes.ok) throw new Error('폴더를 찾을 수 없습니다.');

            const files = await listRes.json();
            const jsonFiles = files.filter(f => f.name.endsWith('.json'));
            items = await Promise.all(jsonFiles.map(async (file) => {
                const dataRes = await fetch(file.download_url);
                return dataRes.json();
            }));
        }

        if (!isVideo) {
            const verticalRoot = document.getElementById('vertical-gallery-root');
            const horizontalRoot = document.getElementById('horizontal-gallery-root');

            const githubRawBase = `https://raw.githubusercontent.com/${USER_NAME}/${REPO_NAME}/main`;

            const loadTasks = items.map(item => {
                const imageSrc = item.image.startsWith('http')
                    ? item.image
                    : (isLocalPreview ? item.image : `${githubRawBase}${item.image}`);

                const imgItem = document.createElement('div');
                imgItem.className = 'img-item';

                const link = document.createElement('a');
                link.href = 'javascript:void(0);';
                link.style.display = 'block';
                link.onclick = () => openImageViewer(imageSrc, item.title);

                const imgTag = document.createElement('img');
                imgTag.alt = item.title;
                imgTag.style.width = '100%';
                imgTag.style.display = 'block';

                link.appendChild(imgTag);
                imgItem.appendChild(link);

                const orientation = (item.orientation || 'vertical').toLowerCase();

                const loadPromise = new Promise((resolve) => {
                    imgTag.onload = () => resolve();
                    imgTag.onerror = () => resolve();
                    imgTag.src = imageSrc;
                });

                return { imgItem, orientation, loadPromise };
            });

            await Promise.all(loadTasks.map(t => t.loadPromise));

            verticalRoot.innerHTML = '';
            horizontalRoot.innerHTML = '';
            loadTasks.forEach(({ imgItem, orientation }) => {
                (orientation === 'horizontal' ? horizontalRoot : verticalRoot).appendChild(imgItem);
            });
            if (gallerySettings.vertical_display === 'slider') createGallerySlider(verticalRoot, gallerySettings.vertical_slides_per_view);
            if (gallerySettings.horizontal_display === 'slider') createGallerySlider(horizontalRoot, gallerySettings.horizontal_slides_per_view);

            document.getElementById('gallery-root').classList.add('gallery-ready');
            requestAnimationFrame(sendHeightIfChanged);
        } else {
            root.innerHTML = '';
            for (const item of items) {
                const vId = getVid(item.url);
                const thumbUrl = `https://img.youtube.com/vi/${vId}/maxresdefault.jpg`;

                root.innerHTML += `
                    <a href="${item.url}" target="_blank" class="video-item">
                        <div class="video-thumb" style="background-image: url('${thumbUrl}');">
                            <div class="play-icon">▶</div>
                        </div>
                        <p class="video-title">${item.title}</p>
                    </a>`;
            }
        }
    } catch (err) {
        console.error(err);
        root.innerHTML = '<p class="loading-msg">데이터를 불러오는 중 오류가 발생했습니다.</p>';
    }
}
