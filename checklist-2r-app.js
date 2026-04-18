// Extraído de checklist-2rodas.html — scripts inline removidos para eliminar unsafe-inline da CSP

  document.getElementById('DataHora').value = new Date().toLocaleString('pt-BR');

  // ── PROTEÇÃO ANTI-DUPLICATA ─────────────────────────────────────────────
  // Gera chave única para este envio. Se já enviado nos últimos 60s, bloqueia.
  function jaEnviado(chave) {
    try {
      var reg = JSON.parse(localStorage.getItem('cipgd_enviados') || '{}');
      var agora = Date.now();
      // Limpar entradas com mais de 60 segundos
      Object.keys(reg).forEach(function(k) { if (agora - reg[k] > 60000) delete reg[k]; });
      if (reg[chave]) {
        localStorage.setItem('cipgd_enviados', JSON.stringify(reg));
        return true; // já enviado
      }
      reg[chave] = agora;
      localStorage.setItem('cipgd_enviados', JSON.stringify(reg));
      return false;
    } catch(e) { return false; }
  }

  var isIphone = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  var STORE_KEY = 'cipgd_2rodas_v1';
  function loadStore() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch(e) { return {}; } }
  function saveStore(s) { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch(e) {} }
  function addToList(store, key, val) {
    val = (val || '').trim(); if (!val) return;
    if (!store[key]) store[key] = [];
    var i = store[key].indexOf(val); if (i > -1) store[key].splice(i, 1);
    store[key].unshift(val);
    if (store[key].length > 10) store[key] = store[key].slice(0, 10);
  }
  function fillDatalist(id, items) {
    var dl = document.getElementById('list-' + id); if (!dl || !items) return;
    dl.innerHTML = '';
    items.forEach(function(v) { var o = document.createElement('option'); o.value = v; dl.appendChild(o); });
  }
  function restoreField(id, val) { var el = document.getElementById(id); if (el && val) el.value = val; }
  function renderChips(store) {
    var wrap = document.getElementById('obs-chips');
    var list = store['Observacoes'] || [];
    if (!list.length) { wrap.classList.remove('show'); return; }
    wrap.classList.add('show');
    wrap.innerHTML = '<span class="chip-label">Recentes:</span>';
    list.slice(0, 5).forEach(function(v) {
      var c = document.createElement('span'); c.className = 'chip';
      c.textContent = v; c.title = v;
      c.addEventListener('click', function() { document.getElementById('Observacoes').value = v; });
      wrap.appendChild(c);
    });
  }

  (function init() {
    var s = loadStore();
    ['Nome','Cadastro','Comandante'].forEach(function(id) { fillDatalist(id, s[id]); restoreField(id, s[id] && s[id][0]); });
    if (s.Graduacao) restoreField('Graduacao', s.Graduacao);
    if (s.Prefixo)   restoreField('Prefixo', s.Prefixo);
    renderChips(s);
  })();

  document.querySelectorAll('.status-select').forEach(function(sel) {
    sel.addEventListener('change', function() {
      var v = this.value; this.className = 'status-select';
      if (['OK','Sem Vazamento','Cheio','3/4','2/4'].indexOf(v) >= 0) this.classList.add('status-ok');
      else if (v) this.classList.add('status-bad');
    });
  });

  // ── VALIDAÇÃO ──────────────────────────────────────────────────────────────
  function mostrarErro(id, msg) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.outline = '2px solid #ef4444';
    el.style.boxShadow = '0 0 0 3px rgba(239,68,68,.25)';
    var err = document.getElementById('err_' + id);
    if (!err) {
      err = document.createElement('span');
      err.id = 'err_' + id;
      err.style.cssText = 'color:#ef4444;font-size:.72rem;margin-top:.2rem;display:block;';
      el.parentNode.appendChild(err);
    }
    err.textContent = msg;
    el.addEventListener('input', function limpar() {
      el.style.outline = ''; el.style.boxShadow = '';
      if (err) err.textContent = '';
    }, { once: true });
    el.addEventListener('change', function limpar() {
      el.style.outline = ''; el.style.boxShadow = '';
      if (err) err.textContent = '';
    }, { once: true });
  }

  function validarFormulario(dados) {
    var erros = [];
    if (!dados.Nome || !dados.Nome.trim())         { mostrarErro('Nome','Informe o nome do militar'); erros.push('Nome'); }
    if (!dados.Graduacao)                           { mostrarErro('Graduacao','Selecione a graduação'); erros.push('Graduacao'); }
    if (!dados.Cadastro || !dados.Cadastro.trim())  { mostrarErro('Cadastro','Informe o nº do cadastro'); erros.push('Cadastro'); }
    if (!dados.Comandante||!dados.Comandante.trim()){ mostrarErro('Comandante','Informe o nome do comandante'); erros.push('Comandante'); }
    if (!dados.Prefixo)                             { mostrarErro('Prefixo','Selecione a viatura'); erros.push('Prefixo'); }
    var km = parseInt(dados.KmInicial);
    if (!dados.KmInicial || isNaN(km) || km <= 0)  { mostrarErro('KmInicial','Informe o Km inicial (maior que zero)'); erros.push('KmInicial'); }
    else if (km > 999999)                           { mostrarErro('KmInicial','Km parece inválido. Verifique o valor.'); erros.push('KmInicial'); }
    ['NivelOleo','VazamentoOleo','NivelCombustivel','FluidoFreio',
     'PinturaPlotagem','FaroisSetas','Giroflex','Estofados','Jante','Pneus'].forEach(function(id) {
      if (!dados[id]) { mostrarErro(id,'Selecione o status'); erros.push(id); }
    });
    return erros;
  }


  // iPhone: ao retornar do WhatsApp, redireciona para index
  window.addEventListener('pageshow', function(e) {
    if (e.persisted && isIphone) {
      window.location.replace('./index.html');
    }
  });

  document.getElementById('checklistForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var dados = {};
    for (var i = 0; i < e.target.elements.length; i++) {
      var el = e.target.elements[i]; if (el.id) dados[el.id] = el.value;
    }

    var erros = validarFormulario(dados);
    if (erros.length > 0) {
      var primeiro = document.getElementById(erros[0]);
      if (primeiro) primeiro.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    var s = loadStore();
    ['Nome','Cadastro','Comandante','Observacoes'].forEach(function(k) { addToList(s, k, dados[k]); });
    s.Graduacao = dados.Graduacao; s.Prefixo = dados.Prefixo;
    saveStore(s);

    // Salva carga ativa para descarga posterior
    try { localStorage.setItem('cipgd_carga_2rodas', JSON.stringify(dados)); } catch(e) {}

    // Envia para planilha

    var _chaveEnvio = 'carga2R_' + (dados.Prefixo||'') + '_' + (dados.KmInicial||'') + '_' + (dados.DataHora||'');
    if (jaEnviado(_chaveEnvio)) {
      showToast('⚠️ Este checklist já foi enviado. Evitando duplicata.');
      if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
      return;
    }

    enviarOuEnfileirar(dados, 'cipgd_2rodas_queue', CIPGD_CONFIG.URL_2RODAS);

    function st(v) {
      return ['OK','Sem Vazamento','Cheio','3/4','2/4'].indexOf(v) >= 0 ? '✅ ' + v : '❌ ' + v;
    }
    var SEP = '━━━━━━━━━━━━━━━━━━━━';
    var L = [];
    L.push(SEP);
    L.push('🏍️ *CHECKLIST 2 RODAS*');
    L.push('       *CIPGd-FSA*');
    L.push(SEP); L.push('');
    L.push('📅 ' + dados.DataHora);
    L.push('👤 Mot: ' + dados.Graduacao + ' *' + dados.Nome.trim() + '*' + (dados.Cadastro ? '  Mat: *' + dados.Cadastro.trim() + '*' : ''));
    L.push('🧑‍✈️ Cmt: ' + dados.Comandante);
    L.push('📍 Viatura: *' + dados.Prefixo + '*');
    L.push('📊 Km Inicial: ' + dados.KmInicial); L.push('');
    L.push('┌─ 🛢️ *FLUIDOS*');
    L.push('├ Óleo: ' + st(dados.NivelOleo));
    L.push('├ Vazamento: ' + st(dados.VazamentoOleo));
    L.push('├ Combustível: ' + st(dados.NivelCombustivel));
    L.push('└ Freio: ' + st(dados.FluidoFreio)); L.push('');
    L.push('┌─ 🔧 *ESTRUTURA*');
    L.push('├ Pintura/Plot.: ' + st(dados.PinturaPlotagem));
    L.push('├ Faróis e Setas: ' + st(dados.FaroisSetas));
    L.push('├ Giroflex: ' + st(dados.Giroflex));
    L.push('├ Estofados: ' + st(dados.Estofados));
    L.push('├ Jante: ' + st(dados.Jante));
    L.push('└ Pneus: ' + st(dados.Pneus));
    if (dados.Observacoes && dados.Observacoes.trim()) {
      L.push(''); L.push('📝 *OBS:*');
      dados.Observacoes.trim().split('\n').forEach(function(l) { if (l.trim()) L.push('. ' + l.trim()); });
    }
    L.push(''); L.push(SEP);
    var waText = encodeURIComponent(L.join('\n'));
    var url = isIphone
      ? 'whatsapp://send?text=' + waText
      : 'https://api.whatsapp.com/send?text=' + waText;
    if (isIphone) { window.location.href = url; }
    else { window.open(url, '_blank'); setTimeout(function(){ window.location.replace('./index.html'); }, 1200); }
  });
