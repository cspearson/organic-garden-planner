// Organic No-Till Garden Planner – Core App Logic
// Beginner-friendly • Photo or measurement based • Promotes organic & no-till

const PLANTS = [
  {
    id: 'lettuce',
    name: 'Lettuce (Leaf)',
    emoji: '🥬',
    difficulty: 'Very Easy',
    noTillNote: 'Perfect for mulched beds. Succession plant every 2 weeks. Barely disturbs soil.',
    spacing: '6–8 in',
    sun: 'Part sun to full',
    days: '30–45 days',
    companions: 'Carrots, radish, onions'
  },
  {
    id: 'radish',
    name: 'Radish',
    emoji: '🌶️',
    difficulty: 'Very Easy',
    noTillNote: 'Grows fast in shallow no-till beds. Great first crop while building soil.',
    spacing: '2–3 in',
    sun: 'Full sun',
    days: '25–35 days',
    companions: 'Lettuce, carrots, beans'
  },
  {
    id: 'beans',
    name: 'Bush Beans',
    emoji: '🫘',
    difficulty: 'Easy',
    noTillNote: 'Nitrogen fixers. Plant into warmed mulch after last frost. Leave roots in soil when done.',
    spacing: '4–6 in',
    sun: 'Full sun',
    days: '50–60 days',
    companions: 'Corn, squash, cucumbers'
  },
  {
    id: 'tomatoes',
    name: 'Tomato (Determinate)',
    emoji: '🍅',
    difficulty: 'Moderate',
    noTillNote: 'Deep mulch + strong support. Never till around roots. Feed with surface compost.',
    spacing: '18–24 in',
    sun: 'Full sun',
    days: '60–80 days',
    companions: 'Basil, carrots, marigold'
  },
  {
    id: 'zucchini',
    name: 'Zucchini / Summer Squash',
    emoji: '🥒',
    difficulty: 'Easy',
    noTillNote: 'Needs space & rich surface compost. Heavy mulch keeps soil cool and moist.',
    spacing: '24–36 in',
    sun: 'Full sun',
    days: '45–55 days',
    companions: 'Beans, corn, nasturtium'
  },
  {
    id: 'kale',
    name: 'Kale',
    emoji: '🥬',
    difficulty: 'Easy',
    noTillNote: 'Cold hardy. Thrives in no-till with consistent moisture and mulch.',
    spacing: '12–18 in',
    sun: 'Full to part',
    days: '50–65 days',
    companions: 'Beets, onions, herbs'
  },
  {
    id: 'basil',
    name: 'Basil',
    emoji: '🌿',
    difficulty: 'Easy',
    noTillNote: 'Great companion. Pinch often. Loves warm mulched soil. Protect from cold.',
    spacing: '8–12 in',
    sun: 'Full sun',
    days: '30–40 days',
    companions: 'Tomatoes, peppers'
  },
  {
    id: 'carrots',
    name: 'Carrots',
    emoji: '🥕',
    difficulty: 'Moderate',
    noTillNote: 'Need fine surface. Avoid heavy mulch until seedlings are up. No-till works once established.',
    spacing: '2–3 in',
    sun: 'Full sun',
    days: '60–75 days',
    companions: 'Onions, lettuce, radish'
  },
  {
    id: 'clover',
    name: 'White Clover (Cover)',
    emoji: '🍀',
    difficulty: 'Very Easy',
    noTillNote: 'Living mulch & nitrogen fixer. Plant between beds or as understory. Classic no-till ally.',
    spacing: 'Broadcast',
    sun: 'Full to part',
    days: 'Perennial',
    companions: 'Almost everything'
  },
  {
    id: 'garlic',
    name: 'Garlic',
    emoji: '🧄',
    difficulty: 'Easy',
    noTillNote: 'Plant in fall into mulched beds. Mulch heavily over winter. Harvest next summer.',
    spacing: '4–6 in',
    sun: 'Full sun',
    days: '240+ days',
    companions: 'Beets, lettuce, strawberries'
  }
];

// App state
let currentView = 'home';
let currentStep = 1;
let currentGarden = {
  name: '',
  zone: '6b',
  length: null,
  width: null,
  photo: null,
  beds: [],
  scale: null // pixels per foot when photo is used
};

let canvasState = {
  tool: 'bed',
  isDrawing: false,
  startX: 0,
  startY: 0,
  beds: [],
  photoImg: null,
  scaleMode: false,
  scalePoints: []
};

// DOM helpers
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showView(viewId) {
  $$('.view').forEach(v => v.classList.remove('active'));
  const target = $(`#view-${viewId}`);
  if (target) {
    target.classList.add('active');
    currentView = viewId;
  }
  $$('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewId);
  });
}

function showStep(stepNum) {
  $$('.step').forEach(s => s.classList.remove('active'));
  const step = $(`.step[data-step="${stepNum}"]`);
  if (step) {
    step.classList.add('active');
    currentStep = stepNum;
  }
}

function initNavigation() {
  $$('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (view === 'setup') {
        showView('setup');
        showStep(1);
      } else {
        showView(view);
        if (view === 'plants') renderPlants();
        if (view === 'my-gardens') renderSavedGardens();
      }
    });
  });

  $$('.feature-card').forEach(card => {
    card.addEventListener('click', () => {
      const action = card.dataset.action;
      if (action === 'new-garden') {
        showView('setup');
        showStep(1);
      } else if (action === 'learn') {
        showView('learn');
      } else if (action === 'plants') {
        showView('plants');
        renderPlants();
      } else if (action === 'my-gardens') {
        showView('my-gardens');
        renderSavedGardens();
      }
    });
  });

  $$('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const back = btn.dataset.back || 'home';
      showView(back);
    });
  });

  $$('.next-step').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = parseInt(btn.dataset.next, 10);
      if (currentStep === 1) {
        currentGarden.name = $('#garden-name').value.trim() || 'My Garden';
        currentGarden.zone = $('#garden-zone').value || '6b';
      }
      if (currentStep === 2) {
        currentGarden.length = parseFloat($('#space-length').value) || null;
        currentGarden.width = parseFloat($('#space-width').value) || null;
      }
      showStep(next);
    });
  });

  $('#create-garden-btn')?.addEventListener('click', () => {
    createGardenPlan();
  });

  $('#space-photo')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        currentGarden.photo = ev.target.result;
        // Visual feedback
        const label = document.querySelector('.photo-upload span');
        if (label) label.textContent = '✓ Photo loaded – continue to set scale in designer';
      };
      reader.readAsDataURL(file);
    }
  });
}

function renderPlants() {
  const container = $('#plant-list');
  if (!container) return;
  container.innerHTML = PLANTS.map(p => `
    <div class="plant-card">
      <div class="plant-emoji">${p.emoji}</div>
      <div class="plant-info">
        <h4>${p.name}</h4>
        <p>${p.spacing} • ${p.sun} • ${p.days}</p>
        <p class="notill-note">${p.noTillNote}</p>
        <p class="companions"><em>Companions:</em> ${p.companions}</p>
        <span class="tag">${p.difficulty}</span>
      </div>
    </div>
  `).join('');
}

function renderSavedGardens() {
  const container = $('#saved-gardens');
  const saved = JSON.parse(localStorage.getItem('organicGardens') || '[]');
  if (saved.length === 0) {
    container.innerHTML = '<p class="empty-state">No gardens saved yet. Create your first one!</p>';
    return;
  }
  container.innerHTML = saved.map((g, i) => `
    <div class="content-card garden-item" data-index="${i}">
      <h3>${g.name}</h3>
      <p>Zone ${g.zone} • ${g.length || '?'} × ${g.width || '?'} ft • ${g.beds?.length || 0} beds</p>
      <p class="date">Created ${new Date(g.created).toLocaleDateString()}</p>
    </div>
  `).join('');
}

function createGardenPlan() {
  if (!currentGarden.name) currentGarden.name = $('#garden-name')?.value || 'My Garden';
  currentGarden.created = Date.now();
  currentGarden.beds = [];

  const saved = JSON.parse(localStorage.getItem('organicGardens') || '[]');
  saved.unshift({ ...currentGarden });
  localStorage.setItem('organicGardens', JSON.stringify(saved.slice(0, 20)));

  $('#designer-title').textContent = currentGarden.name;
  showView('designer');
  initCanvas();
}

// ---------- Canvas Designer ----------
function initCanvas() {
  const canvas = $('#garden-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const container = $('#canvas-container');
  const width = container.clientWidth || 360;

  canvas.width = width * devicePixelRatio;
  canvas.height = 380 * devicePixelRatio;
  canvas.style.width = width + 'px';
  canvas.style.height = '380px';
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

  canvasState.beds = currentGarden.beds || [];
  canvasState.photoImg = null;
  canvasState.scaleMode = false;
  canvasState.scalePoints = [];

  if (currentGarden.photo) {
    const img = new Image();
    img.onload = () => {
      canvasState.photoImg = img;
      // Ask user to set scale
      canvasState.scaleMode = true;
      redraw();
      alert('Photo loaded!\n\nTap two points on the photo that you know the real distance between (for example the ends of a fence or a known 10 ft length). Then enter the real distance in feet.');
    };
    img.src = currentGarden.photo;
  } else {
    redraw();
  }

  // Tool buttons
  $$('.tool-btn').forEach(btn => {
    btn.onclick = () => {
      const tool = btn.dataset.tool;
      if (tool === 'delete') {
        if (canvasState.beds.length > 0) {
          canvasState.beds.pop();
          currentGarden.beds = canvasState.beds;
          persistBeds();
          redraw();
          updateSuggestions();
        }
        return;
      }
      if (tool === 'clear') {
        if (canvasState.beds.length > 0 && confirm('Clear all beds?')) {
          canvasState.beds = [];
          currentGarden.beds = [];
          persistBeds();
          redraw();
          updateSuggestions();
        }
        return;
      }
      $$('.tool-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      canvasState.tool = tool;
      if (tool === 'scale') {
        canvasState.scaleMode = true;
        canvasState.scalePoints = [];
        alert('Tap two points on the photo that you know the real distance between, then enter the distance in feet.');
      }
    };
  });

  // Make "Add Bed" active by default
  const bedBtn = document.querySelector('.tool-btn[data-tool="bed"]');
  if (bedBtn) bedBtn.classList.add('active');

  // Pointer events for drawing beds
  let start = null;

  canvas.onpointerdown = (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (canvasState.scaleMode) {
      canvasState.scalePoints.push({ x, y });
      redraw();
      if (canvasState.scalePoints.length === 2) {
        const distPx = Math.hypot(
          canvasState.scalePoints[1].x - canvasState.scalePoints[0].x,
          canvasState.scalePoints[1].y - canvasState.scalePoints[0].y
        );
        const realFt = parseFloat(prompt('What is the real distance between those two points (in feet)?', '10'));
        if (realFt && realFt > 0) {
          currentGarden.scale = distPx / realFt; // pixels per foot
          canvasState.scaleMode = false;
          canvasState.scalePoints = [];
          alert(`Scale set: ${currentGarden.scale.toFixed(1)} pixels per foot.\nYou can now draw beds.`);
        } else {
          canvasState.scalePoints = [];
        }
        redraw();
      }
      return;
    }

    if (canvasState.tool === 'bed') {
      start = { x, y };
      canvasState.isDrawing = true;
    }
  };

  canvas.onpointermove = (e) => {
    if (!canvasState.isDrawing || !start) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    redraw();
    // Preview rectangle
    ctx.strokeStyle = '#2d6a4f';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(start.x, start.y, x - start.x, y - start.y);
    ctx.setLineDash([]);
  };

  canvas.onpointerup = (e) => {
    if (!canvasState.isDrawing || !start) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const w = Math.abs(x - start.x);
    const h = Math.abs(y - start.y);
    if (w > 20 && h > 20) {
      const bed = {
        x: Math.min(start.x, x),
        y: Math.min(start.y, y),
        w,
        h,
        // Convert to feet if scale known
        lengthFt: currentGarden.scale ? (w / currentGarden.scale).toFixed(1) : null,
        widthFt: currentGarden.scale ? (h / currentGarden.scale).toFixed(1) : null
      };
      canvasState.beds.push(bed);
      currentGarden.beds = canvasState.beds;
      // Persist
      const saved = JSON.parse(localStorage.getItem('organicGardens') || '[]');
      if (saved[0] && saved[0].name === currentGarden.name) {
        saved[0].beds = currentGarden.beds;
        localStorage.setItem('organicGardens', JSON.stringify(saved));
      }
    }
    canvasState.isDrawing = false;
    start = null;
    redraw();
    updateSuggestions();
  };

  canvas.onpointerleave = () => {
    canvasState.isDrawing = false;
    start = null;
  };

  updateSuggestions();
}

function persistBeds() {
  const saved = JSON.parse(localStorage.getItem('organicGardens') || '[]');
  if (saved[0] && saved[0].name === currentGarden.name) {
    saved[0].beds = currentGarden.beds;
    localStorage.setItem('organicGardens', JSON.stringify(saved));
  }
}

function updateSuggestions() {
  const box = $('#bed-suggestions');
  if (!box) return;
  if (canvasState.beds.length === 0) {
    box.classList.add('hidden');
    box.innerHTML = '';
    return;
  }
  const last = canvasState.beds[canvasState.beds.length - 1];
  const area = (last.lengthFt && last.widthFt)
    ? (parseFloat(last.lengthFt) * parseFloat(last.widthFt)).toFixed(0)
    : null;

  let recs = [];
  if (area) {
    if (area < 15) recs = ['Lettuce (Leaf)', 'Radish', 'Basil', 'Carrots'];
    else if (area < 40) recs = ['Bush Beans', 'Kale', 'Lettuce', 'Basil', 'Garlic'];
    else recs = ['Tomato (Determinate)', 'Zucchini / Summer Squash', 'Bush Beans', 'Kale', 'White Clover (Cover)'];
  } else {
    recs = ['Lettuce', 'Radish', 'Bush Beans', 'Kale – great starter no-till crops'];
  }

  box.classList.remove('hidden');
  box.innerHTML = `
    <strong>Bed ${canvasState.beds.length} suggestions</strong>
    ${area ? `<span class="area">(~${area} sq ft)</span>` : ''}
    <p>${recs.join(' • ')}</p>
    <small>All of these work well with surface compost + mulch and minimal soil disturbance.</small>
  `;
}

function redraw() {
  const canvas = $('#garden-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width / devicePixelRatio;
  const h = canvas.height / devicePixelRatio;

  ctx.clearRect(0, 0, w, h);

  // Background
  if (canvasState.photoImg) {
    // Draw photo covering the canvas (simple contain/cover)
    const img = canvasState.photoImg;
    const scale = Math.max(w / img.width, h / img.height);
    const iw = img.width * scale;
    const ih = img.height * scale;
    const ox = (w - iw) / 2;
    const oy = (h - ih) / 2;
    ctx.drawImage(img, ox, oy, iw, ih);
  } else {
    // Grid background for measurement mode
    ctx.fillStyle = '#d4c4a8';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    const step = 20;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    // Dimension label
    if (currentGarden.length && currentGarden.width) {
      ctx.fillStyle = 'rgba(30,58,26,0.7)';
      ctx.font = '13px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${currentGarden.length} ft × ${currentGarden.width} ft  •  No-till beds`, w / 2, 24);
    }
  }

  // Draw existing beds
  canvasState.beds.forEach((bed, i) => {
    ctx.fillStyle = 'rgba(45, 106, 79, 0.35)';
    ctx.fillRect(bed.x, bed.y, bed.w, bed.h);
    ctx.strokeStyle = '#1b4332';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(bed.x, bed.y, bed.w, bed.h);

    // Label
    ctx.fillStyle = '#1b4332';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'left';
    const label = bed.lengthFt && bed.widthFt
      ? `Bed ${i + 1}: ${bed.lengthFt}×${bed.widthFt} ft`
      : `Bed ${i + 1}`;
    ctx.fillText(label, bed.x + 6, bed.y + 16);
  });

  // Scale points preview
  if (canvasState.scalePoints.length) {
    ctx.fillStyle = '#d4a017';
    canvasState.scalePoints.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fill();
    });
    if (canvasState.scalePoints.length === 2) {
      ctx.strokeStyle = '#d4a017';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvasState.scalePoints[0].x, canvasState.scalePoints[0].y);
      ctx.lineTo(canvasState.scalePoints[1].x, canvasState.scalePoints[1].y);
      ctx.stroke();
    }
  }

  // Help text when empty
  if (canvasState.beds.length === 0 && !canvasState.scaleMode) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Drag to draw a permanent no-till bed', w / 2, h / 2);
    ctx.font = '12px system-ui';
    ctx.fillText('Keep paths for walking — never walk on beds', w / 2, h / 2 + 22);
  }
}

// PWA install
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

// Init
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  renderPlants();
});
