const gallery = document.getElementById('gallery');
const loadCardsBtn = document.getElementById('loadCardsBtn');
const addCardBtn = document.getElementById('addCardBtn');

let cards = [];

// ฟังก์ชันสร้าง card element
function renderCards(list) {
  gallery.innerHTML = '';
  list.map(card => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="${card.url}" alt="${card.title}">
      <h3>${card.title}</h3>
    `;
    gallery.appendChild(div);
  });
}

// โหลดการ์ดตัวอย่างจาก API
async function loadSampleCards() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/photos?_limit=5');
    const data = await res.json();
    cards = data.map(d => ({
      title: d.title,
      url: d.thumbnailUrl
    }));
    renderCards(cards);
  } catch (err) {
    console.error(err);
    alert('โหลดการ์ดล้มเหลว');
  }
}

// เพิ่มการ์ดใหม่
function addCard() {
  const title = prompt('กรุณากรอกชื่อการ์ด:');
  if (!title) return;

  const url = prompt('กรุณากรอก URL รูป (ว่างได้):') || 'https://via.placeholder.com/150';
  const newCard = { title, url };
  cards.unshift(newCard);
  renderCards(cards);
}

loadCardsBtn.addEventListener('click', loadSampleCards);
addCardBtn.addEventListener('click', addCard);
