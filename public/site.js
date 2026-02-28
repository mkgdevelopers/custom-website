const container = document.getElementById('rendered-site');

function createElement(el) {
  const node = document.createElement(el.type === 'button' ? 'button' : 'div');
  node.className = 'site-element';
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
  node.style.textAlign = el.style.textAlign || 'left';
  node.style.border = el.type === 'button' ? '0' : 'none';

  if (el.type === 'image') {
    node.innerHTML = `<img src="${el.text}" alt="${el.id}" style="width:100%;height:100%;object-fit:cover;border-radius:${el.style.borderRadius}px;"/>`;
  } else {
    node.textContent = el.text;
  }

  return node;
}

async function renderSite() {
  const res = await fetch('/api/layout');
  const layout = await res.json();

  document.title = layout.siteTitle;
  container.style.background = layout.global.background;
  container.style.color = layout.global.textColor;
  container.style.fontFamily = layout.global.fontFamily;
  container.style.maxWidth = `${layout.global.maxWidth}px`;
  container.innerHTML = '';

  layout.elements.forEach(el => container.appendChild(createElement(el)));
}

renderSite();
