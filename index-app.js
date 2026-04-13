// Extraído de index.html — scripts inline removidos para eliminar unsafe-inline da CSP

(function() {
  var el = document.getElementById('app-version');
  if (el && typeof CIPGD_CONFIG !== 'undefined' && CIPGD_CONFIG.VERSAO) {
    el.textContent = CIPGD_CONFIG.VERSAO;
  }
})();


  // Registra Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(function(){});
  }

  // Banner de instalação Android/Chrome
  var deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-banner').classList.add('show');
  });

  document.getElementById('btn-install').addEventListener('click', function() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function() {
      deferredPrompt = null;
      document.getElementById('install-banner').classList.remove('show');
    });
  });

  window.addEventListener('appinstalled', function() {
    document.getElementById('install-banner').classList.remove('show');
  });

  // Dica iOS (Safari, não instalado ainda)
  var isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  var isStandalone = window.navigator.standalone === true;
  if (isIos && !isStandalone) {
    document.getElementById('ios-hint').classList.add('show');
  }


(function() {
  var el = document.getElementById('app-version');
  if (el && typeof CIPGD_CONFIG !== 'undefined' && CIPGD_CONFIG.VERSAO) {
    el.textContent = CIPGD_CONFIG.VERSAO;
  }
})();


  // ── VERIFICA CARGAS ATIVAS E PENDENTES ──────────────────────────────────
  document.addEventListener('DOMContentLoaded', async function() {
    var section = document.getElementById('descarga-section');
    var cardsEl = document.getElementById('descarga-cards');
    var temDescarga = false;

    // Verifica carga 4 rodas
    try {
      var c4 = JSON.parse(localStorage.getItem('cipgd_carga_4rodas'));
      if (c4 && c4.Prefixo) {
        temDescarga = true;
        var card = document.createElement('a');
        card.className = 'card card-descarga';
        card.href = 'descarga-4rodas.html';
        card.innerHTML =
          '<div class="card-icon">🔑</div>' +
          '<div class="card-body">' +
            '<div class="card-tag">Descarga · 4 Rodas</div>' +
            '<div class="card-title">' + c4.Prefixo + '</div>' +
            '<div class="card-desc">Mot: ' + (c4.Graduacao||'') + ' ' + (c4.Nome||'') + ' &middot; Km ini: ' + (c4.Km_inicial||'') + '</div>' +
          '</div>' +
          '<div class="card-arrow" style="color:#22c55e">›</div>';
        cardsEl.appendChild(card);
      }
    } catch(e) {}

    // Verifica carga 2 rodas
    try {
      var c2 = JSON.parse(localStorage.getItem('cipgd_carga_2rodas'));
      if (c2 && c2.Prefixo) {
        temDescarga = true;
        var card2 = document.createElement('a');
        card2.className = 'card card-descarga';
        card2.href = 'descarga-2rodas.html';
        card2.innerHTML =
          '<div class="card-icon">🔑</div>' +
          '<div class="card-body">' +
            '<div class="card-tag">Descarga · 2 Rodas</div>' +
            '<div class="card-title">' + c2.Prefixo + '</div>' +
            '<div class="card-desc">Mot: ' + (c2.Graduacao||'') + ' ' + (c2.Nome||'') + ' &middot; Km ini: ' + (c2.KmInicial||'') + '</div>' +
          '</div>' +
          '<div class="card-arrow" style="color:#22c55e">›</div>';
        cardsEl.appendChild(card2);
      }
    } catch(e) {}

    if (temDescarga) section.style.display = 'block';

    // Banner de pendentes (manter funcionalidade existente)
    var total = await contarPendentes();
    if (total > 0) {
      var wrap = document.querySelector('.cards');
      var banner = document.createElement('div');
      banner.style.cssText = [
        'margin-top:1rem',
        'background:rgba(239,68,68,0.1)',
        'border:1px solid rgba(239,68,68,0.35)',
        'border-radius:12px',
        'padding:.9rem 1.1rem',
        'display:flex','align-items:center','gap:.75rem',
        'animation:fadeUp .4s ease both'
      ].join(';');
      banner.innerHTML =
        '<span style="flex:1;font-size:.78rem;color:#e2e8f0;line-height:1.5">' +
        '⚠️ <strong style="color:#e8b834">' + total + ' registro' + (total>1?'s':'') + ' pendente' + (total>1?'s':'') + '</strong>' +
        ' — abra o checklist correspondente com internet ativa e toque em <strong style="color:#e8b834">Reenviar</strong>.</span>';
      if (wrap) wrap.after(banner);
    }
  });
