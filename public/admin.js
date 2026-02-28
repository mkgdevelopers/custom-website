const canvas = document.getElementById('canvas');
const layerList = document.getElementById('layer-list');
const saveStatus = document.getElementById('save-status');

const state = {
  layout: null,
  selectedId: null,
  drag: null
};

const byId = id => document.getElementById(id);

function makeId(type) {
  return `${type}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultElement(type) {
  const base = {
    id: makeId(type),
    type,
    text: `${type} text`,
    x: 60,
    y: 60,
    width: 280,
    height: 80,
    style: {
      color: '#111827',
      fontSize: 28,
      fontWeight: 600,
      padding: 8,
      background: '#ffffff',
      borderRadius: 10,
      textAlign: 'left'
    }
  };

  if (type === 'paragraph') base.style.fontSize = 18;
  if (type === 'button') {
    base.text = 'Click me';
    base.style.background = '#2563eb';
    base.style.color = '#ffffff';
    base.style.textAlign = 'center';
  }
  if (type === 'image') {
    base.text = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1000';
    base.style.background = 'transparent';
  }

  return base;
}

function applyGlobalInputs() {
  const { global } = state.layout;
  byId('site-title').value = state.layout.siteTitle || '';
  byId('global-bg').value = global.background;
  byId('global-text').value = global.textColor;
  byId('global-accent').value = global.accentColor;
  byId('global-font').value = global.fontFamily;
  byId('global-gradient').value = global.heroGradient;
  byId('global-max-width').value = global.maxWidth;
}

function updateSelectedInputs() {
  const selected = state.layout.elements.find(el => el.id === state.selectedId);
  if (!selected) return;

  byId('el-text').value = selected.text;
  byId('el-color').value = selected.style.color;
  byId('el-bg').value = selected.style.background.startsWith('#') ? selected.style.background : '#ffffff';
  byId('el-size').value = selected.style.fontSize;
  byId('el-weight').value = selected.style.fontWeight;
  byId('el-width').value = selected.width;
  byId('el-height').value = selected.height;
  byId('el-x').value = selected.x;
  byId('el-y').value = selected.y;
  byId('el-radius').value = selected.style.borderRadius;
  byId('el-align').value = selected.style.textAlign || 'left';
}

function renderLayers() {
  layerList.innerHTML = '';

  state.layout.elements
    .slice()
    .reverse()
    .forEach(el => {
      const item = document.createElement('div');
      item.className = `layer-item ${el.id === state.selectedId ? 'active' : ''}`;
      item.textContent = `${el.type.toUpperCase()} • ${el.id}`;
      item.onclick = () => {
        state.selectedId = el.id;
        renderCanvas();
      };
      layerList.appendChild(item);
    });
}

function renderElement(el) {
  const node = document.createElement(el.type === 'button' ? 'button' : 'div');
  node.className = `canvas-element ${state.selectedId === el.id ? 'selected' : ''}`;
  node.dataset.id = el.id;
  node.style.left = `${el.x}px`;
  node.style.top = `${el.y}px`;
  node.style.width = `${el.width}px`;
  node.style.height = `${el.height}px`;
  node.style.color = el.style.color;
  node.style.background = el.style.background;
  node.style.fontSize = `${el.style.fontSize}px`;
  node.style.fontWeight = el.style.fontWeight;
  node.style.borderRadius = `${el.style.borderRadius}px`;
  node.style.padding = `${el.style.padding || 8}px`;
  node.style.textAlign = el.style.textAlign;
  node.style.border = el.type === 'button' ? '0' : 'none';

  if (el.type === 'image') {
    node.innerHTML = `<img src="${el.text}" alt="custom" style="width:100%;height:100%;object-fit:cover;border-radius:${el.style.borderRadius}px;" />`;
  } else {
    node.textContent = el.text;
  }

  node.onmousedown = event => {
    state.selectedId = el.id;
    state.drag = {
      id: el.id,
      offsetX: event.clientX - el.x,
      offsetY: event.clientY - el.y
    };
    renderCanvas();
  };

  node.onclick = event => {
    event.stopPropagation();
    state.selectedId = el.id;
    renderCanvas();
  };

  return node;
}

function renderCanvas() {
  const { global } = state.layout;
  canvas.style.background = global.heroGradient;
  canvas.style.color = global.textColor;
  canvas.style.fontFamily = global.fontFamily;
  canvas.style.maxWidth = `${global.maxWidth}px`;

  canvas.innerHTML = '';
  state.layout.elements.forEach(el => canvas.appendChild(renderElement(el)));
  renderLayers();
  updateSelectedInputs();
}

function selectedElement() {
  return state.layout.elements.find(el => el.id === state.selectedId);
}

function wireInputs() {
  byId('site-title').oninput = e => (state.layout.siteTitle = e.target.value);
  byId('global-bg').oninput = e => (state.layout.global.background = e.target.value);
  byId('global-text').oninput = e => {
    state.layout.global.textColor = e.target.value;
    renderCanvas();
  };
  byId('global-accent').oninput = e => (state.layout.global.accentColor = e.target.value);
  byId('global-font').onchange = e => {
    state.layout.global.fontFamily = e.target.value;
    renderCanvas();
  };
  byId('global-gradient').oninput = e => {
    state.layout.global.heroGradient = e.target.value;
    renderCanvas();
  };
  byId('global-max-width').oninput = e => {
    state.layout.global.maxWidth = Number(e.target.value) || 1200;
    renderCanvas();
  };

  const updateSelected = updater => {
    const el = selectedElement();
    if (!el) return;
    updater(el);
    renderCanvas();
  };

  byId('el-text').oninput = e => updateSelected(el => (el.text = e.target.value));
  byId('el-color').oninput = e => updateSelected(el => (el.style.color = e.target.value));
  byId('el-bg').oninput = e => updateSelected(el => (el.style.background = e.target.value));
  byId('el-size').oninput = e => updateSelected(el => (el.style.fontSize = Number(e.target.value) || 16));
  byId('el-weight').oninput = e => updateSelected(el => (el.style.fontWeight = Number(e.target.value) || 400));
  byId('el-width').oninput = e => updateSelected(el => (el.width = Number(e.target.value) || el.width));
  byId('el-height').oninput = e => updateSelected(el => (el.height = Number(e.target.value) || el.height));
  byId('el-x').oninput = e => updateSelected(el => (el.x = Math.max(0, Number(e.target.value) || 0)));
  byId('el-y').oninput = e => updateSelected(el => (el.y = Math.max(0, Number(e.target.value) || 0)));
  byId('el-radius').oninput = e => updateSelected(el => (el.style.borderRadius = Number(e.target.value) || 0));
  byId('el-align').onchange = e => updateSelected(el => (el.style.textAlign = e.target.value));

  document.querySelectorAll('[data-add]').forEach(button => {
    button.onclick = () => {
      const element = defaultElement(button.dataset.add);
      state.layout.elements.push(element);
      state.selectedId = element.id;
      renderCanvas();
    };
  });

  byId('duplicate-element').onclick = () => {
    const el = selectedElement();
    if (!el) return;
    const clone = JSON.parse(JSON.stringify(el));
    clone.id = makeId(el.type);
    clone.x += 30;
    clone.y += 30;
    state.layout.elements.push(clone);
    state.selectedId = clone.id;
    renderCanvas();
  };

  byId('delete-element').onclick = () => {
    if (!state.selectedId) return;
    state.layout.elements = state.layout.elements.filter(el => el.id !== state.selectedId);
    state.selectedId = state.layout.elements[0]?.id || null;
    renderCanvas();
  };

  byId('save-layout').onclick = saveLayout;

  canvas.onmousedown = event => {
    if (event.target === canvas) {
      state.selectedId = null;
      renderCanvas();
    }
  };

  window.onmousemove = event => {
    if (!state.drag) return;
    const el = state.layout.elements.find(item => item.id === state.drag.id);
    if (!el) return;
    el.x = Math.max(0, event.clientX - state.drag.offsetX);
    el.y = Math.max(0, event.clientY - state.drag.offsetY);
    renderCanvas();
  };

  window.onmouseup = () => {
    state.drag = null;
  };
}

async function saveLayout() {
  saveStatus.textContent = 'Saving...';
  const res = await fetch('/api/layout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state.layout)
  });

  if (!res.ok) {
    const err = await res.json();
    saveStatus.textContent = `Error: ${err.error}`;
    return;
  }

  saveStatus.textContent = `Saved at ${new Date().toLocaleTimeString()}`;
}

async function boot() {
  const res = await fetch('/api/layout');
  state.layout = await res.json();
  state.selectedId = state.layout.elements[0]?.id ?? null;
  applyGlobalInputs();
  wireInputs();
  renderCanvas();
}

boot();
