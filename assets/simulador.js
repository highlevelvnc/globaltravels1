const flows = {
  viagem: {
    label: 'Viagem / pacote',
    travelers: ['1 pessoa', 'Casal', 'Família', 'Grupo de amigos'],
    destinations: ['Portugal / Lisboa', 'Paris', 'Disney / Orlando', 'Destino de neve', 'Outro destino'],
    next: 'Validar datas, composição do grupo, hotel e estrutura do pacote.',
    team: 'A equipe pode sugerir roteiro, categoria de hospedagem e formato ideal do atendimento.'
  },
  passagens: {
    label: 'Passagens aéreas',
    travelers: ['1 passageiro', 'Casal', 'Família', 'Grupo'],
    destinations: ['Portugal', 'Irlanda', 'Estados Unidos', 'Outro destino'],
    next: 'Confirmar cidade de saída, datas aproximadas e flexibilidade para emissão.',
    team: 'A equipe compara rotas, bagagem e alternativas de tarifa.'
  },
  intercambio: {
    label: 'Intercâmbio',
    travelers: ['Adulto', 'Universitário', 'Teen', 'Executivo'],
    destinations: ['Irlanda', 'Malta', 'Canadá', 'Austrália', 'Outro destino'],
    next: 'Entender cidade, duração desejada e formato de curso para montar a proposta.',
    team: 'A equipe cruza programa, cidade, escola e orçamento informado.'
  },
  estudos: {
    label: 'Estudar ou morar fora',
    travelers: ['Curso técnico', 'Graduação', 'Pós / mestrado', 'Plano de mudança'],
    destinations: ['Portugal', 'Irlanda', 'Estados Unidos', 'Outro destino'],
    next: 'Ler objetivo acadêmico, prazo e maturidade do plano antes de propor caminhos.',
    team: 'A equipe organiza um direcionamento mais consultivo, com leitura de perfil e possibilidades.'
  }
};

const state = {
  intent: 'viagem',
  tripStyle: 'Essencial',
  baggage: 'Só mala de mão',
  budgetMode: 'orçamento total'
};

const travelers = document.getElementById('travelers');
const destination = document.getElementById('destination');
const otherDestinationWrap = document.getElementById('otherDestinationWrap');
const otherDestination = document.getElementById('otherDestination');
const summaryList = document.getElementById('summaryList');
const briefPreview = document.getElementById('briefPreview');
const nextStep = document.getElementById('nextStep');
const teamAction = document.getElementById('teamAction');
const whatsButton = document.getElementById('whatsButton');
const compareButton = document.getElementById('compareButton');
const progressFill = document.getElementById('progressFill');
const progressLabel = document.getElementById('progressLabel');

const fieldIds = ['when','courseType','englishLevel','studyGoal','studyArea','budgetValue','budgetCurrency','name','contact','notes'];
fieldIds.forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', () => {
      state[id] = el.value.trim();
      updateSummary();
    });
    el.addEventListener('change', () => {
      state[id] = el.value.trim();
      updateSummary();
    });
  }
});

otherDestination.addEventListener('input', () => {
  state.otherDestination = otherDestination.value.trim();
  updateSummary();
});

function fillSelect(select, items, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>` + items.map(item => `<option>${item}</option>`).join('');
}

function setActive(group, value) {
  document.querySelectorAll(`[data-group="${group}"]`).forEach(btn => {
    const isActive = btn.dataset.value === value;
    btn.classList.toggle('active', isActive);
    if (btn.classList.contains('switch-chip')) btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function applyIntent(intent) {
  state.intent = intent;
  setActive('intent', intent);
  const flow = flows[intent];
  fillSelect(travelers, flow.travelers, 'Selecione o perfil');
  fillSelect(destination, flow.destinations, 'Selecione o destino');
  travelers.value = '';
  destination.value = '';
  state.travelers = '';
  state.destination = '';
  state.otherDestination = '';
  otherDestination.value = '';
  otherDestinationWrap.style.display = 'none';

  document.querySelectorAll('.intent-block').forEach(block => block.classList.remove('show'));
  const blockId = intent === 'viagem' ? 'viagemBlock' : intent === 'passagens' ? 'passagensBlock' : intent === 'intercambio' ? 'intercambioBlock' : 'estudosBlock';
  document.getElementById(blockId)?.classList.add('show');

  nextStep.textContent = flow.next;
  teamAction.textContent = flow.team;
  compareButton.href = `https://wa.me/351910346159?text=${encodeURIComponent(`Olá, quero comparar opções para ${flow.label.toLowerCase()}.`)}`;
  updateSummary();
}

travelers.addEventListener('change', () => {
  state.travelers = travelers.value;
  updateSummary();
});

destination.addEventListener('change', () => {
  state.destination = destination.value;
  const isOther = destination.value === 'Outro destino';
  otherDestinationWrap.style.display = isOther ? 'block' : 'none';
  if (!isOther) state.otherDestination = '';
  updateSummary();
});

document.querySelectorAll('[data-group="intent"]').forEach(btn => {
  btn.addEventListener('click', () => applyIntent(btn.dataset.value));
});

document.querySelectorAll('[data-group="tripStyle"]').forEach(btn => {
  btn.addEventListener('click', () => {
    state.tripStyle = btn.dataset.value;
    setActive('tripStyle', state.tripStyle);
    updateSummary();
  });
});

document.querySelectorAll('[data-group="baggage"]').forEach(btn => {
  btn.addEventListener('click', () => {
    state.baggage = btn.dataset.value;
    setActive('baggage', state.baggage);
    updateSummary();
  });
});

document.querySelectorAll('[data-group="budgetMode"]').forEach(btn => {
  btn.addEventListener('click', () => {
    state.budgetMode = btn.dataset.value;
    setActive('budgetMode', state.budgetMode);
    updateSummary();
  });
});

function displayDestination() {
  if (state.destination === 'Outro destino') return state.otherDestination || 'Outro destino';
  return state.destination || '—';
}

function currencyLabel() {
  const value = state.budgetValue || '—';
  const currency = state.budgetCurrency || 'EUR';
  return value === '—' ? '—' : `${currency} ${value} (${state.budgetMode || 'orçamento total'})`;
}

function summaryRows() {
  const rows = [
    ['Objetivo', flows[state.intent].label],
    ['Perfil', state.travelers || '—'],
    ['Destino', displayDestination()],
    ['Quando pretende começar', state.when || '—'],
    ['Orçamento informado', currencyLabel()]
  ];

  if (state.intent === 'viagem') rows.push(['Estilo desejado', state.tripStyle]);
  if (state.intent === 'passagens') rows.push(['Bagagem', state.baggage]);
  if (state.intent === 'intercambio') {
    rows.push(['Tipo de programa', state.courseType || '—']);
    rows.push(['Nível atual', state.englishLevel || '—']);
  }
  if (state.intent === 'estudos') {
    rows.push(['Objetivo acadêmico', state.studyGoal || '—']);
    rows.push(['Área de interesse', state.studyArea || '—']);
  }
  return rows;
}

function buildBrief() {
  const lines = [
    `Objetivo: ${flows[state.intent].label}`,
    `Perfil: ${state.travelers || '—'}`,
    `Destino: ${displayDestination()}`,
    `Quando pretende começar: ${state.when || '—'}`,
    `Orçamento informado: ${currencyLabel()}`
  ];
  if (state.intent === 'viagem') lines.push(`Estilo desejado: ${state.tripStyle}`);
  if (state.intent === 'passagens') lines.push(`Bagagem: ${state.baggage}`);
  if (state.intent === 'intercambio') {
    lines.push(`Tipo de programa: ${state.courseType || '—'}`);
    lines.push(`Nível atual: ${state.englishLevel || '—'}`);
  }
  if (state.intent === 'estudos') {
    lines.push(`Objetivo acadêmico: ${state.studyGoal || '—'}`);
    lines.push(`Área de interesse: ${state.studyArea || '—'}`);
  }
  if (state.name) lines.push(`Nome: ${state.name}`);
  if (state.contact) lines.push(`Contato: ${state.contact}`);
  if (state.notes) lines.push(`Observações: ${state.notes}`);
  return lines.join('\n');
}

function updateProgress() {
  const checks = [state.intent, state.travelers, displayDestination() !== '—', state.when, state.budgetValue, state.budgetCurrency];
  if (state.intent === 'intercambio') checks.push(state.courseType, state.englishLevel);
  if (state.intent === 'estudos') checks.push(state.studyGoal, state.studyArea);
  const total = checks.length;
  const done = checks.filter(Boolean).length;
  const pct = Math.max(20, Math.round((done / total) * 100));
  progressFill.style.width = `${pct}%`;
  progressLabel.textContent = `${pct}% completo`;
}

function updateSummary() {
  summaryList.innerHTML = summaryRows().map(([label, value]) => `
    <div class="summary-row">
      <small>${label}</small>
      <strong>${value}</strong>
    </div>
  `).join('');

  const brief = buildBrief();
  briefPreview.textContent = brief;
  whatsButton.href = `https://wa.me/351910346159?text=${encodeURIComponent(`Olá, quero atendimento da Global Travel.\n\n${brief}`)}`;
  updateProgress();
}

applyIntent('viagem');
setActive('tripStyle', state.tripStyle);
setActive('baggage', state.baggage);
setActive('budgetMode', state.budgetMode);
updateSummary();
