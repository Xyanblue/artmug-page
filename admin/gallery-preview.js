(function () {
  var GalleryPreview = createClass({
    getInitialState: function () {
      return { page: 0, settings: { vertical_slides_per_view: 2, horizontal_slides_per_view: 1 } };
    },
    componentDidMount: function () {
      this.active = true;
      fetch('../content/gallery-settings.json', { cache: 'no-store' })
        .then(function (response) {
          if (!response.ok) throw new Error('설정 로드 실패');
          return response.json();
        })
        .then(function (settings) { if (this.active) this.setState({ settings: settings }); }.bind(this))
        .catch(function () { /* Use the site's default page sizes if unavailable. */ });
    },
    componentWillUnmount: function () { this.active = false; },
    render: function () {
      var self = this;
      var orientation = this.props.entry.get('collection') === 'gallery_horizontal' || this.props.entry.get('slug') === 'horizontal' ? 'horizontal' : 'vertical';
      var value = this.props.entry.getIn(['data', 'items']);
      var items = value && value.toJS ? value.toJS() : (value || []);
      var perPage = Math.min(3, Math.max(1, parseInt(this.state.settings[orientation + '_slides_per_view'], 10) || 1));
      var total = Math.ceil(items.length / perPage);
      var page = Math.min(this.state.page, Math.max(0, total - 1));
      function move(delta) {
        self.setState({ page: total ? (page + delta + total) % total : 0 });
      }
      return h('section', {
        className: 'gallery-preview',
        'aria-label': '일러스트 슬라이드 미리보기',
        tabIndex: 0,
        onKeyDown: function (event) {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
          }
        },
        onTouchStart: function (event) { self.touchX = event.touches[0].clientX; },
        onTouchEnd: function (event) {
          if (self.touchX == null) return;
          var distance = event.changedTouches[0].clientX - self.touchX;
          self.touchX = null;
          if (Math.abs(distance) > 50) move(distance < 0 ? 1 : -1);
        }
      },
        h('h2', {}, orientation === 'vertical' ? '세로형 일러스트' : '가로형 일러스트'),
        h('p', { className: 'gallery-preview-help' }, '편집 중인 순서로 표시됩니다. 좌우 버튼이나 방향키로 확인하세요.'),
        items.length ? h('div', { className: 'gallery-preview-page', style: { gridTemplateColumns: 'repeat(' + perPage + ', minmax(0, 1fr))' } },
          items.slice(page * perPage, (page + 1) * perPage).map(function (item, index) {
            var asset = item.image ? self.props.getAsset(item.image) : null;
            return h('figure', { key: page * perPage + index },
              asset ? h('img', { src: String(asset), alt: item.title || '제목 없는 작품' }) : h('p', {}, '이미지를 등록해주세요'),
              h('figcaption', {}, item.title || '새 작품'));
          })) : h('p', {}, '등록된 작품이 없습니다.'),
        h('nav', { className: 'gallery-preview-controls', 'aria-label': '슬라이드 이동' },
          h('button', { type: 'button', disabled: total <= 1, onClick: function () { move(-1); }, 'aria-label': '이전 슬라이드' }, '←'),
          h('span', { role: 'status', 'aria-live': 'polite' }, total ? (page + 1) + ' / ' + total : '0 / 0'),
          h('button', { type: 'button', disabled: total <= 1, onClick: function () { move(1); }, 'aria-label': '다음 슬라이드' }, '→')));
    }
  });
  CMS.registerPreviewTemplate('vertical', GalleryPreview);
  CMS.registerPreviewTemplate('horizontal', GalleryPreview);
}());
