/* app.js (ปรับใหม่)
  - เพิ่มฟอร์มให้คนอื่นใส่: author, title, description, link
  - ถ้าใส่ลิงก์: ตรวจสอบรูปแบบด้วย URL และพยายามเช็คความสามารถเข้าถึง (HEAD fetch) ก่อนเพิ่ม
  - ถ้าลิงก์ไม่ผ่าน จะไม่เพิ่ม และแสดงข้อความผิดพลาด
  - ยังคงใช้ HOF: map, forEach, filter
*/

let nextId = 1;
const cards = [
    { id: nextId++, title: 'Welcome card', body: 'This is a starter card. Click fetch to add new cards!', image: 'https://picsum.photos/seed/welcome/600/400', author: 'System' }
];

// DOM refs
const grid = document.getElementById('cardsGrid');
const btnFetchRandom = document.getElementById('btn-fetch-random');
const btnFetch3 = document.getElementById('btn-fetch-3');
const btnOpenForm = document.getElementById('btn-open-form');

const modal = document.getElementById('modal');
const form = document.getElementById('custom-form');
const inputAuthor = document.getElementById('input-author');
const inputTitle = document.getElementById('input-title');
const inputDesc = document.getElementById('input-desc');
const inputLink = document.getElementById('input-link');
const formMsg = document.getElementById('form-msg');
const formSubmit = document.getElementById('form-submit');
const formCancel = document.getElementById('form-cancel');

// RENDER
function renderCards() {
    const nodes = cards.map(card => {
        const el = document.createElement('article');
        el.className = 'card';
        el.dataset.id = card.id;

        const img = document.createElement('img');
        img.className = 'thumb';
        img.alt = card.title;
        img.src = card.image || `https://picsum.photos/seed/card${card.id}/600/400`;

        const body = document.createElement('div');
        body.className = 'card-body';

        const title = document.createElement('h3');
        title.className = 'title';
        title.textContent = card.title;

        const desc = document.createElement('p');
        desc.className = 'desc';
        desc.textContent = card.body || '';

        // link (if present)
        let linkEl = null;
        if (card.link) {
            linkEl = document.createElement('a');
            linkEl.className = 'card-link';
            linkEl.href = card.link;
            linkEl.target = '_blank';
            linkEl.rel = 'noopener noreferrer';
            linkEl.textContent = card.link;
        }

        const byline = document.createElement('div');
        byline.className = 'byline';
        byline.textContent = card.author ? `โดย ${card.author}` : '';

        const meta = document.createElement('div');
        meta.className = 'meta';

        const small = document.createElement('div');
        small.className = 'small';
        small.textContent = `#${card.id}`;

        const actions = document.createElement('div');
        actions.className = 'actions';

        const btnRemove = document.createElement('button');
        btnRemove.className = 'pill remove';
        btnRemove.textContent = 'Remove';
        btnRemove.addEventListener('click', () => removeCard(card.id));

        actions.appendChild(btnRemove);
        meta.appendChild(small);
        meta.appendChild(actions);

        body.appendChild(title);
        body.appendChild(desc);
        if (linkEl) body.appendChild(linkEl);
        body.appendChild(byline);
        body.appendChild(meta);

        el.appendChild(img);
        el.appendChild(body);
        return el;
    });

    grid.innerHTML = '';
    nodes.forEach(n => grid.appendChild(n));
}

function removeCard(id) {
    const remaining = cards.filter(c => c.id !== id);
    cards.length = 0;
    remaining.forEach(c => cards.push(c));
    renderCards();
}

function addCard({ title = 'Untitled', body = '', image = '', link = '', author = '' } = {}) {
    cards.push({ id: nextId++, title, body, image, link, author });
    renderCards();
}

/* ---------------------------
   Validate URL and reachability
   - ถ้า input ว่าง -> ถือว่าไม่มีลิงก์ (optional)
   - ถ้ามี: ตรวจสองขั้นตอน
     1) รูปแบบด้วย URL constructor
     2) พยายาม fetch แบบ HEAD (timeout 5s) เพื่อเช็คว่า server ตอบ
   - หมายเหตุ CORS: บางเซิร์ฟเวอร์จะบล็อก HEAD/CORS ทำให้ fetch โดนบล็อกแม้ลิงก์จริง
     ในกรณีนั้น โค้ดจะถือว่า "ไม่ผ่าน" เพื่อความปลอดภัยตามคำขอของคุณ
----------------------------*/

function isValidUrlFormat(value) {
    try {
        const u = new URL(value);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (e) {
        return false;
    }
}

async function isUrlReachable(url, timeoutMs = 5000) {
    // use HEAD to be lightweight; fallback to GET if server doesn't allow HEAD
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), timeoutMs);
    try {
        // try HEAD first
        let res = await fetch(url, { method: 'HEAD', mode: 'cors', signal: controller.signal });
        clearTimeout(to);
        // treat 2xx-3xx as OK
        return res.ok;
    } catch (err) {
        // maybe HEAD blocked by server; try GET as fallback (still may fail due to CORS)
        clearTimeout(to);
        const controller2 = new AbortController();
        const to2 = setTimeout(() => controller2.abort(), timeoutMs);
        try {
            const res2 = await fetch(url, { method: 'GET', mode: 'cors', signal: controller2.signal });
            clearTimeout(to2);
            return res2.ok;
        } catch (err2) {
            clearTimeout(to2);
            // If fetch fails (network/CORS/timeout), we consider unreachable
            return false;
        }
    }
}

/* ---------------------------
   Form handling: เมื่อกด submit
   - ถ้าใส่ลิงก์: ตรวจ format -> แล้วเช็ค reachability -> ถ้าไม่ผ่าน จะแจ้ง error และไม่เพิ่ม
   - ปิด/เปิด modal
----------------------------*/

btnOpenForm.addEventListener('click', () => {
    openModal();
});

formCancel.addEventListener('click', () => {
    closeModal();
});

function openModal() {
    formMsg.textContent = '';
    modal.classList.remove('hidden');
    inputTitle.focus();
}

function closeModal() {
    modal.classList.add('hidden');
    form.reset();
}

/* small helper to disable/enable form during async check */
function setFormBusy(busy = true) {
    formSubmit.disabled = busy;
    formMsg.textContent = busy ? 'กำลังตรวจสอบลิงก์...' : '';
}

form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    formMsg.textContent = '';
    const author = inputAuthor.value.trim();
    const title = inputTitle.value.trim();
    const body = inputDesc.value.trim();
    const link = inputLink.value.trim();

    if (!title) {
        formMsg.textContent = 'กรุณากรอกหัวข้อ (Title) ก่อน';
        return;
    }

    if (link) {
        // เริ่มการตรวจสอบลิงก์
        if (!isValidUrlFormat(link)) {
            formMsg.textContent = 'รูปแบบ URL ไม่ถูกต้อง — ต้องขึ้นต้นด้วย http:// หรือ https://';
            return;
        }

        try {
            setFormBusy(true);
            const ok = await isUrlReachable(link, 5000);
            setFormBusy(false);
            if (!ok) {
                formMsg.textContent = 'ไม่สามารถเข้าถึงลิงก์ได้ (server ตอบไม่สำเร็จ / ถูกบล็อกด้วย CORS) — กรุณาตรวจสอบหรืาลองลิงก์อื่น';
                return;
            }
        } catch (err) {
            setFormBusy(false);
            formMsg.textContent = 'เกิดข้อผิดพลาดระหว่างตรวจสอบลิงก์';
            return;
        }
    }

    // ถ้าผ่านทั้งหมด เพิ่มการ์ด
    // ถ้าไม่มีภาพ เราจะไม่บังคับ — ให้ใช้ภาพสุ่ม
    addCard({
        title,
        body,
        image: link ? `https://api.allorigins.win/raw?url=${encodeURIComponent(link)}` : '', // NOTE: placeholder; image may be remote
        link: link || '',
        author: author || 'Guest'
    });

    formMsg.style.color = 'green';
    formMsg.textContent = 'เพิ่มการ์ดเรียบร้อยแล้ว';
    setTimeout(() => {
        formMsg.style.color = '#b00020';
        closeModal();
    }, 900);
});

/* ---------------------------
   Fetch examples (เดิม)
----------------------------*/

async function fetchRandomPhotoAndAdd() {
    try {
        const randomId = Math.floor(Math.random() * 5000) + 1;
        const res = await fetch(`https://jsonplaceholder.typicode.com/photos/${randomId}`);
        if (!res.ok) throw new Error('Fetch failed: ' + res.status);
        const data = await res.json();
        addCard({ title: data.title || 'Fetched card', body: 'Fetched via Fetch API', image: data.url, author: 'Remote' });
    } catch (err) {
        console.error(err);
        addCard({ title: 'Fetch error', body: 'Could not fetch remote photo — check network.', author: 'System' });
    }
}

async function fetchSeveralAndAdd(count = 3) {
    try {
        const start = Math.floor(Math.random() * 4800) + 1;
        const res = await fetch(`https://jsonplaceholder.typicode.com/photos?_start=${start}&_limit=${count}`);
        if (!res.ok) throw new Error('Fetch failed: ' + res.status);
        const list = await res.json();
        const newCards = list.map(item => ({
            title: item.title,
            body: `Photo id ${item.id} — fetched`,
            image: item.url,
            author: 'Remote'
        }));
        newCards.forEach(c => addCard(c));
    } catch (err) {
        console.error(err);
        addCard({ title: 'Fetch error', body: 'Could not fetch multiple items.', author: 'System' });
    }
}

/* UI wiring */
btnFetchRandom.addEventListener('click', fetchRandomPhotoAndAdd);
btnFetch3.addEventListener('click', () => fetchSeveralAndAdd(3));

/* initial render */
renderCards();
