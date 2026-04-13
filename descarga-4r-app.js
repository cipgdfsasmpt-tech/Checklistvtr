// Extraído de descarga-4rodas.html — scripts inline removidos para eliminar unsafe-inline da CSP


  // ── PROTEÇÃO ANTI-DUPLICATA ─────────────────────────────────────────────
  function jaEnviado(chave) {
    try {
      var reg = JSON.parse(localStorage.getItem('cipgd_enviados') || '{}');
      var agora = Date.now();
      Object.keys(reg).forEach(function(k) { if (agora - reg[k] > 60000) delete reg[k]; });
      if (reg[chave]) { localStorage.setItem('cipgd_enviados', JSON.stringify(reg)); return true; }
      reg[chave] = agora;
      localStorage.setItem('cipgd_enviados', JSON.stringify(reg));
      return false;
    } catch(e) { return false; }
  }

  var isIphone = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  // ── CARREGA DADOS DA CARGA ───────────────────────────────────────────────
  var carga = null;
  try { carga = JSON.parse(localStorage.getItem('cipgd_carga_4rodas')); } catch(e) {}

  if (!carga || !carga.Prefixo) {
    // Sem carga ativa — redireciona
    alert('Nenhuma carga ativa encontrada para 4 Rodas. Faça o checklist primeiro.');
    history.back();
  }

  // ── HELPER: status badge ─────────────────────────────────────────────────
  var OK_VALS = ['OK','Cheio','3/4','2/4'];
  function setBadge(id, val) {
    var el = document.getElementById(id);
    if (!el) return;
    var isOk = OK_VALS.indexOf(val) >= 0;
    el.className = 'status-badge ' + (isOk ? 'ok' : 'bad');
    el.textContent = (isOk ? '✔ ' : '✘ ') + (val || '—');
  }

  function setVal(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val || '—';
  }

  // ── PREENCHE CAMPOS SOMENTE LEITURA ─────────────────────────────────────
  if (carga) {
    setVal('v_DataHora',    carga.DataHora);
    setVal('v_Nome',        carga.Nome);
    setVal('v_Graduacao',   carga.Graduacao);
    setVal('v_Cadastro',    carga.Cadastro);
    setVal('v_Comandante',  carga.Comandante);
    setVal('v_Prefixo',     carga.Prefixo);
    setVal('v_KmInicial',   carga.Km_inicial);

    setBadge('v_Oleo',        carga.Oleo);
    setBadge('v_Agua',        carga.Agua);
    setBadge('v_Combustivel', carga.Combustivel);
    setBadge('v_Freio',       carga.Freio);
    setBadge('v_Chaparia',    carga.Chaparia);
    setBadge('v_Plotagem',    carga.Plotagem);
    setBadge('v_Farois',      carga.Farois);
    setBadge('v_Giroflex',    carga.Giroflex);
    setBadge('v_Estofados',   carga.Estofados);
    setBadge('v_Ferramentas', carga.Ferramentas);
    setBadge('v_Pneus',       carga.Pneus);

    if (carga.Observacoes && carga.Observacoes.trim()) {
      document.getElementById('sec-obs-carga').style.display = 'block';
      setVal('v_Observacoes', carga.Observacoes.trim());
    }
  }

  // ── DATA E HORA DA DESCARGA ──────────────────────────────────────────────
  document.getElementById('DataHoraDescarga').value = new Date().toLocaleString('pt-BR');

  // ── VALIDAÇÃO KM FINAL ───────────────────────────────────────────────────
  var kmInput = document.getElementById('Km_final');
  var kmErr   = document.getElementById('err_Km_final');

  kmInput.addEventListener('input', function() {
    kmInput.classList.remove('error');
    kmErr.classList.remove('show');
    // Só aceita números
    this.value = this.value.replace(/[^0-9]/g, '');
  });

  function validarKm() {
    var km = parseInt(kmInput.value);
    var kmIni = parseInt(carga ? carga.Km_inicial : 0);
    if (!kmInput.value || isNaN(km) || km <= 0) {
      kmInput.classList.add('error');
      kmErr.textContent = 'Informe o Km final (maior que zero)';
      kmErr.classList.add('show');
      return false;
    }
    if (km > 999999) {
      kmInput.classList.add('error');
      kmErr.textContent = 'Km parece inválido. Verifique o valor.';
      kmErr.classList.add('show');
      return false;
    }
    if (kmIni > 0 && km < kmIni) {
      kmInput.classList.add('error');
      kmErr.textContent = 'Km final (' + km + ') não pode ser menor que o Km inicial (' + kmIni + ')';
      kmErr.classList.add('show');
      return false;
    }
    return true;
  }

  // ── ENVIO ────────────────────────────────────────────────────────────────
  document.getElementById('btn-enviar').addEventListener('click', function() {
    if (!validarKm()) {
      kmInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    var dataDesc = document.getElementById('DataHoraDescarga').value;
    var kmFinal  = kmInput.value;

    // Monta payload para planilha
    // Envia todos os dados da carga + campos da descarga
    // O script vai buscar a linha pelo Cadastro+KmInicial+Prefixo e reescrever tudo
    var payload = Object.assign({}, carga, {
      Tipo:             'DESCARGA',
      DataHoraDescarga: dataDesc,
      Km_final:         kmFinal
    });


    var _chaveEnvio = 'desc4R_' + (carga.Prefixo||'') + '_' + (carga.Km_inicial||'') + '_' + (carga.DataHora||'');
    if (jaEnviado(_chaveEnvio)) {
      showToast('⚠️ Esta descarga já foi enviada. Evitando duplicata.');
      return;
    }

    enviarOuEnfileirar(payload, 'cipgd_4rodas_desc_queue', CIPGD_CONFIG.URL_4RODAS);

    // Monta mensagem WhatsApp — modelo simplificado conforme solicitado
    var SEP = '━━━━━━━━━━━━━━━━━━━━';
    var kmRod = parseInt(kmFinal) - parseInt(carga.Km_inicial || 0);
    var L = [];
    L.push(SEP);
    L.push('🔑 *DESCARGA 4 RODAS*');
    L.push('       *CIPGd-FSA*');
    L.push(SEP);
    L.push('');
    L.push('📅 Descarga: ' + dataDesc);
    L.push('👤 Mot: ' + (carga.Graduacao||'') + ' *' + (carga.Nome||'').trim() + '*' + (carga.Cadastro ? '  Mat: *' + (carga.Cadastro||'').trim() + '*' : ''));
    L.push('📍 Viatura: *' + carga.Prefixo + '*');
    L.push('');
    L.push('📊 Km Final:    *' + kmFinal + '*');
    L.push('🛣️ Km Rodados:  *' + (kmRod >= 0 ? kmRod : '—') + ' km*');
    L.push(SEP);

    // URL compatível com Android e iPhone
    var waText = encodeURIComponent(L.join('\n'));
    var url = isIphone
      ? 'whatsapp://send?text=' + waText
      : 'https://api.whatsapp.com/send?text=' + waText;

    // Remove carga ativa ANTES de abrir WhatsApp
    try { localStorage.removeItem('cipgd_carga_4rodas'); } catch(e) {}

    if (isIphone) {
      window.location.href = url;
    } else {
      window.open(url, '_blank');
      setTimeout(function() { window.location.replace('./index.html'); }, 1200);
    }
  });
