// app.js
//  - ใช้ higher-order functions: map, filter, reduce, และฟังก์ชันที่คืนค่าฟังก์ชัน
//  - ใช้ Fetch API เพื่อ GET ตัวอย่าง card และ POST เมื่อเพิ่มการ์ด

const API_BASE = 'https://jsonplaceholder.typicode.com/photos';
const LIMIT = 8;

const galleryEl = document.getElementById('gallery');
const fetchBtn = document.getElementById('fetchBtn');
const addForm = document.getElementById('addForm');
const searchInput = document.getElementById('searchInput');
const statsBtn = document.getElementById('statsBtn');

let cards = []; // local state: array of card objects { id, title, url, thumbnailUrl }

// --------- Higher-order helper: returns a function that creates a DOM card from an item ----------
function makeCardFactory() {
  // ฟังก์ชันนี้ "คืนค่า" ฟังก์ชัน (higher-order)
  return function createCardElement(item) {
    const div = document.createElement('article');
    div.className = 'card';
    div.dataset.id = item.id;

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    const img = document.createElement('img');
    img.alt = item.title || 'card image';
    img.src = item.thumbnailUrl || item.url || `https://via.placeholder.com/600x400?text=${encodeURIComponent(item.title || 'No+Image')}`;
    thumb.appendChild(img);

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = item.title;

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `#id ${item.id}`;

    const actions = document.createElement('div');
    actions.className = 'actions';
    const removeBtn = document.createElement('button');
    removeBtn.className = 'small-btn';
    removeBtn.textContent = 'ลบ';
    removeBtn.addEventListener('click', () => {
      removeCardById(item.id);
    });

    actions.appendChild(removeBtn);

    div.appendChild(thumb);
    div.appendChild(title);
    div.appendChild(meta);
    div.appendChild(actions);
    return div;
  };
}

// ---------- Render helpers ----------
const cardFactory = makeCardFactory();

function renderList(list) {
  // ใช้ map เพื่อแปลง data -> DOM elements (higher-order)
  const elements = list.map(cardFactory);
  galleryEl.innerHTML = ''; // clear
  elements.forEach(el => galleryEl.appendChild(el));
}

// ---------- CRUD helpers ----------
function addCardLocal(card) {
  cards = [card, ...cards]; // prepend new card
  renderList(cards);
}

function removeCardById(id) {
  cards = cards.filter(c => String(c.id) !== String(id)); // filter (higher-order)
  renderList(cards);
}

// ---------- Fetch API (GET sample) ----------
async function loadSampleCards() {
  try {
    fetchBtn.disabled = true;
    fetchBtn.textContent = 'Loading...';
    const res = await fetch(`${API_BASE}?_limit=${LIMIT}`);
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();

    // normalize: map raw -> shape we want
    // ใช้ map (higher-order) เพื่อ transform
    const normalized = data.map(d => ({
      id: d.id,
      title: d.title,
      url: d.url,
      thumbnailUrl: d.thumbnailUrl
    }));

    // สลับลำดับด้วย reduce เป็นตัวอย่างการใช้ reduce (not necessary แต่โชว์แนวคิด)
    // ตัวอย่าง: สร้าง object ที่นับความยาวชื่อทั้งหมด
    const nameLengthSum = normalized.reduce((acc, cur) => acc + (cur.title?.length || 0), 0);

    // เก็บใน state และ render
    cards = normalized;
    renderList(cards);

    console.log(`Loaded ${cards.length} cards. Total title chars: ${nameLengthSum}`);
  } catch (err) {
    console.error(err);
    alert('เกิดข้อผิดพลาดขณะโหลดการ์ด');
  } finally {
    fetchBtn.disabled = false;
    fetchBtn.textContent = 'Load sample cards';
  }
}

// ---------- Fetch API (POST) when user adds a card ----------
async function postNewCard(payload) {
  // JSONPlaceholder จะคืนค่า object ที่ "สร้าง" โดยไม่จริงจัง แต่เป็นตัวอย่างที่ดี
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to post new card');
  return res.json();
}

// ---------- Form submit: create new card ----------
addForm.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const title = document.getElementById('titleInput').value.trim();
  const url = document.getElementById('urlInput').value.trim();

  if (!title) return alert('กรุณากรอกชื่อการ์ด');

  const newPayload = {
    title,
    url: url || `https://via.placeholder.com/600x400?text=${encodeURIComponent(title)}`,
    thumbnailUrl: url || `https://via.placeholder.com/300x180?text=${encodeURIComponent(title)}`,
    albumId: 1
  };

  try {
    const created = await postNewCard(newPayload);
    // JSONPlaceholder ให้ id ปลอมกลับมา (usually 500+). ใช้ id ที่ได้
    // แล้วเพิ่มลงใน state แล้ว render
    addCardLocal({
      id: created.id || Date.now(),
      title: created.title,
      url: created.url,
      thumbnailUrl: created.thumbnailUrl
    });

    addForm.reset();
  } catch (err) {
    console.error(err);
    alert('เพิ่มการ์ดไม่สำเร็จ');
  }
});

// ---------- Search: filter cards by title ----------
searchInput.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  if (!q) {
    renderList(cards);
    return;
  }
  // ใช้ filter (higher-order)
  const filtered = cards.filter(c => c.title.toLowerCase().includes(q));
  renderList(filtered);
});

// ---------- Stats button: show some info using reduce ----------
statsBtn.addEventListener('click', () => {
  // ตัวอย่าง: นับไล่ความยาวชื่อเฉลี่ย และจำนวนปุ่ม
  if (!cards.length) return alert('ไม่มีการ์ดในหน้า');

  const total = cards.length;
  const avgTitleLen = Math.round(cards.reduce((a, b) => a + (b.title?.length || 0), 0) / total);

  alert(`สถิติการ์ด:\n- จำนวนการ์ด: ${total}\n- ความยาวชื่อเฉลี่ย: ${avgTitleLen} ตัวอักษร`);
});

// ---------- Init ----------
(function init() {
  // โหลดตัวอย่างแบบอัตโนมัติเล็กน้อย (ไม่จำเป็น) — แต่ผู้เรียนสามารถกดปุ่มเองได้
  // ด้านล่างคือการโหลดอัตโนมัติแบบเป็นทางเลือก:
  // loadSampleCards();
})();
