// ---------- DOM References ----------
const cardGrid = document.getElementById('cardGrid');

// Local dataset (for higher-order functions)
const localData = [
  { id: 1, title: 'Sunrise at Beach', desc: 'A quiet morning by the sea', img: 'https://images.unsplash.com/photo-1501973801540-537f08ccae7b?auto=format&fit=crop&w=800&q=60' },
  { id: 2, title: 'City Skyline', desc: 'Evening lights', img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=60' },
  { id: 3, title: 'Misty Forest', desc: 'Walk through the fog', img: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=60' }
];

let addedCards = []; // State

// ---------- Utilities ----------
function createCardNode({ id, title, desc, img }) {
  const el = document.createElement('article');
  el.className = 'card';
  el.dataset.id = id;

  el.innerHTML = `
    <img class="thumb" alt="${escapeHtml(title)}" src="${escapeHtml(img)}" loading="lazy">
    <div>
      <div class="title">${escapeHtml(title)}</div>
      <div class="meta">${escapeHtml(desc)}</div>
    </div>
  `;

  return el;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ---------- Higher-order function demo ----------
function addLocalCards() {
  const nextIdBase = (addedCards.length ? addedCards[addedCards.length - 1].id : 100);

  const newItems = localData.map((item, idx) => ({
    id: nextIdBase + idx + 1,
    title: item.title + ' — copy ' + (addedCards.length + idx + 1),
    desc: item.desc,
    img: item.img
  }))
    .filter(i => i.id % 2 === 1); // Example: keep only odd IDs

  addedCards = addedCards.concat(newItems);

  newItems.forEach(item => {
    const node = createCardNode(item);
    cardGrid.prepend(node);
  });
}

// ---------- Fetch API demo ----------
async function loadFromFetch() {
  const btn = document.getElementById('load-fetch');
  btn.disabled = true;
  btn.textContent = 'Loading...';

  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/photos?_limit=6');
    if (!res.ok) throw new Error('Network error');
    const photos = await res.json();

    const fetchedItems = photos.map(p => ({
      id: p.id,
      title: p.title.substring(0, 40),
      desc: 'From FetchAPI — album ' + p.albumId,
      img: p.thumbnailUrl.replace('150', '300')
    }));

    const notAdded = fetchedItems.filter(fi => !addedCards.some(a => a.id === fi.id));

    addedCards = addedCards.concat(notAdded);
    notAdded.forEach(item => cardGrid.appendChild(createCardNode(item)));
  } catch (err) {
    console.error(err);
    alert('Failed to load from API — check console');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Load from Fetch API';
  }
}

// ---------- Clear ----------
function clearAll() {
  addedCards = [];
  cardGrid.innerHTML = '';
}

// ---------- Wire Events ----------
document.getElementById('add-local').addEventListener('click', addLocalCards);
document.getElementById('load-fetch').addEventListener('click', loadFromFetch);
document.getElementById('clear').addEventListener('click', clearAll);

// ---------- Initial seed card ----------
(function seed() {
  const seed = {
    id: 0,
    title: 'Welcome — ทดลองคลิกได้',
    desc: 'กด Add card หรือ Load from Fetch API เพื่อเพิ่มการ์ด',
    img: 'https://images.unsplash.com/photo-1506976785307-8732e854ad76?auto=format&fit=crop&w=800&q=60'
  };
  addedCards.push(seed);
  cardGrid.appendChild(createCardNode(seed));
})();
