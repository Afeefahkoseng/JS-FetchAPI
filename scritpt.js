// DOM refs
fetchBtn.disabled = true;
fetchBtn.textContent = 'Loading...';

try{
const res = await fetch('https://jsonplaceholder.typicode.com/photos?_limit=6');
if(!res.ok) throw new Error('Network error');
const photos = await res.json();

// map: convert API shape to our card shape
const fetchedItems = photos.map(p => ({
id: p.id,
title: p.title.substring(0,40),
desc: 'From FetchAPI — album ' + p.albumId,
img: p.thumbnailUrl.replace('150','300')
}));

// filter out duplicates
const notAdded = fetchedItems.filter(fi => !addedCards.some(a => a.id === fi.id));

notAdded.forEach(item => {
addedCards.push(item);
cardGrid.appendChild(createCardNode(item));
});
}catch(err){
console.error(err);
alert('Failed to load from API — check console');
}finally{
fetchBtn.disabled = false;
fetchBtn.textContent = 'Load from Fetch API';
}
}

function clearAll(){
addedCards = [];
cardGrid.innerHTML = '';
}

// Seed an initial card
(function seed(){
const seed = {id: 0, title: 'Welcome — ทดลองคลิกได้', desc: 'กด Add card หรือ Load from Fetch API เพื่อเพิ่มการ์ด', img: 'https://images.unsplash.com/photo-1506976785307-8732e854ad76?auto=format&fit=crop&w=800&q=60'};
addedCards.push(seed);
cardGrid.appendChild(createCardNode(seed));
})();

// Event listeners
addBtn.addEventListener('click', addLocalCards);
fetchBtn.addEventListener('click', loadFromFetch);
clearBtn.addEventListener('click', clearAll);