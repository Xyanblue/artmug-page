(function () {
  var ListControl = CMS.getWidget('list').control;
  var GalleryControl = createClass({
    getInitialState: function () { return { dragging: null, announcement: '' }; },
    items: function () {
      var value = this.props.value;
      return value && value.toJS ? value.toJS() : (value || []);
    },
    move: function (from, to) {
      var value = this.props.value;
      if (!value || !Number.isInteger(from) || !Number.isInteger(to) || from === to || from < 0 || to < 0 || from >= value.size || to >= value.size) return;
      var item = value.get(from);
      this.props.onChange(value.delete(from).insert(to, item));
      this.setState({ dragging: null, announcement: item.get('title', '작품') + ' : ' + (to + 1) + '번째로 이동했습니다.' });
    },
    render: function () {
      var self = this;
      if (!this.props.field.get('gallery_sortable')) return h(ListControl, this.props);
      var items = this.items();
      return h('div', { id: this.props.forID, className: 'gallery-editor' },
        h('p', {}, '원하는 위치로 드래그하세요. 화살표 버튼으로도 이동할 수 있습니다. 변경 후 상단 저장 버튼을 눌러주세요.'),
        h('p', { role: 'status', 'aria-live': 'polite' }, this.state.announcement),
        h('div', { className: 'gallery-order-grid' }, items.map(function (item, index) {
          var asset = item.image && self.props.getAsset ? self.props.getAsset(item.image) : item.image;
          return h('div', {
            key: index,
            className: 'gallery-order-card' + (self.state.dragging === index ? ' is-dragging' : ''),
            draggable: true,
            onDragStart: function (event) {
              event.dataTransfer.setData('text/plain', String(index));
              event.dataTransfer.effectAllowed = 'move';
              self.setState({ dragging: index });
            },
            onDragOver: function (event) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; },
            onDrop: function (event) { event.preventDefault(); self.move(self.state.dragging, index); },
            onDragEnd: function () { self.setState({ dragging: null }); }
          },
            asset ? h('img', { src: String(asset), alt: item.title || '제목 없는 작품', draggable: false }) : h('div', { className: 'gallery-empty-image' }, '이미지를 등록해주세요'),
            h('strong', {}, (index + 1) + '. ' + (item.title || '새 작품')),
            h('div', { className: 'gallery-order-buttons' },
              h('button', { type: 'button', disabled: index === 0, 'aria-label': (item.title || '작품') + ' 앞으로 이동', onClick: function () { self.move(index, index - 1); } }, '←'),
              h('button', { type: 'button', disabled: index === items.length - 1, 'aria-label': (item.title || '작품') + ' 뒤로 이동', onClick: function () { self.move(index, index + 1); } }, '→')));
        })),
        h('p', {}, '아래 목록에서 작품을 추가하거나 제목/이미지를 수정할 수 있습니다. 목록 순서와 위 썸네일 순서는 함께 변경됩니다.'),
        h(ListControl, Object.assign({}, this.props, { field: this.props.field.set('widget', 'list') })));
    }
  });
  var listWidget = CMS.getWidget('list');
  CMS.registerWidget({
    name: 'list',
    controlComponent: GalleryControl,
    previewComponent: listWidget.preview,
    schema: listWidget.schema,
    allowMapValue: listWidget.allowMapValue
  });
}());
