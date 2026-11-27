/* Nakano & Rodrigues · prévia da abertura.
   Sem innerHTML (a CSP usa Trusted Types): tudo montado com createElement. */
(function () {
  'use strict';
  var parado = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var abre = document.querySelector('.abre');
  var topo = document.getElementById('topo');

  /* título: cada palavra sobe de dentro da própria linha */
  var linhas = document.querySelectorAll('#titulo .l');
  var atraso = 0;
  linhas.forEach(function (l) {
    var palavras = l.textContent.trim().split(/\s+/);
    l.textContent = '';
    palavras.forEach(function (p, i) {
      var w = document.createElement('span');
      w.className = 'w';
      var wi = document.createElement('span');
      wi.className = 'wi';
      wi.textContent = p;
      wi.style.transitionDelay = (0.12 + atraso * 0.07).toFixed(2) + 's';
      atraso++;
      w.appendChild(wi);
      l.appendChild(w);
      if (i < palavras.length - 1) l.appendChild(document.createTextNode(' '));
    });
    l.appendChild(document.createTextNode(' '));
  });

  function comecar() {
    requestAnimationFrame(function () {
      abre.classList.add('pronto');
      topo.classList.add('pronto-topo');
    });
  }
  if (document.fonts && document.fonts.ready) {
    var feito = false;
    var vai = function () { if (!feito) { feito = true; comecar(); } };
    document.fonts.ready.then(vai);
    setTimeout(vai, 900);
  } else {
    comecar();
  }

  /* topo ganha fundo depois de rolar */
  function topoRolou() {
    topo.classList.toggle('rolou', window.scrollY > 40);
  }

  /* linha "começo, meio e resolução": a barra dourada enche com a rolagem */
  var trilho = document.getElementById('trilho');
  var linha = trilho.querySelector('.proc-linha');
  var etapas = Array.prototype.slice.call(trilho.querySelectorAll('.etapa'));
  var celular = window.matchMedia('(max-width: 760px)');

  function limite(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function linhaRolou() {
    var vh = window.innerHeight;
    var r = linha.getBoundingClientRect();
    var p, marcos;
    if (celular.matches) {
      p = limite((vh * 0.62 - r.top) / r.height);
      marcos = etapas.map(function (e) {
        var pt = e.querySelector('.etapa-ponto').getBoundingClientRect();
        return (pt.top + pt.height / 2 - r.top) / r.height;
      });
    } else {
      var t = trilho.getBoundingClientRect();
      var curso = t.height - vh;
      /* a linha enche enquanto a tela está presa; a última etapa acende com folga antes de soltar */
      p = limite(-t.top / (curso * 0.8));
      marcos = etapas.map(function (e) {
        var pt = e.querySelector('.etapa-ponto').getBoundingClientRect();
        return (pt.left + pt.width / 2 - r.left) / r.width;
      });
    }
    if (parado) p = 1;
    linha.style.setProperty('--p', p.toFixed(4));
    etapas.forEach(function (e, i) {
      e.classList.toggle('ativa', p >= marcos[i] - 0.001 || (i === 0 && p > 0.02));
    });
  }

  var pedido = false;
  function aoRolar() {
    if (pedido) return;
    pedido = true;
    requestAnimationFrame(function () {
      pedido = false;
      topoRolou();
      linhaRolou();
    });
  }
  window.addEventListener('scroll', aoRolar, { passive: true });
  window.addEventListener('resize', aoRolar);
  aoRolar();

  /* ---------- seções entrando ao rolar ---------- */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !parado) {
    var obs = new IntersectionObserver(function (itens) {
      itens.forEach(function (it) {
        if (it.isIntersecting) { it.target.classList.add('vis'); obs.unobserve(it.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach(function (el) {
      /* itens irmãos do sumário e das perguntas entram em cascata */
      var irmaos = el.parentElement ? el.parentElement.querySelectorAll(':scope > .rv') : [];
      var i = Array.prototype.indexOf.call(irmaos, el);
      if (i > 0) el.style.transitionDelay = Math.min(i * 0.07, 0.42).toFixed(2) + 's';
      obs.observe(el);
    });
  } else {
    rv.forEach(function (el) { el.classList.add('vis'); });
  }

  /* ---------- atalhos das áreas (faixa da abertura) abrem a área certa ---------- */
  function abrirArea(id) {
    var d = document.getElementById(id);
    if (!d) return;
    d.open = true;
    d.classList.add('vis');
  }
  document.querySelectorAll('[data-abre]').forEach(function (a) {
    a.addEventListener('click', function () { abrirArea(a.getAttribute('data-abre')); });
  });
  if (/^#area-/.test(location.hash)) abrirArea(location.hash.slice(1));

  /* ---------- apresentação: as palavras acendem conforme a rolagem ---------- */
  var acende = document.getElementById('acende');
  if (acende) {
    var palavras = acende.textContent.trim().split(/\s+/);
    acende.textContent = '';
    var spans = palavras.map(function (t, i) {
      var sp = document.createElement('span');
      sp.className = 'pa';
      sp.textContent = t;
      acende.appendChild(sp);
      if (i < palavras.length - 1) acende.appendChild(document.createTextNode(' '));
      return sp;
    });
    var acenderAgora = function () {
      if (parado) { spans.forEach(function (sp) { sp.classList.add('on'); }); return; }
      var r = acende.getBoundingClientRect(), vh = window.innerHeight;
      /* começa quando o topo do texto passa de 85% da tela e termina quando o fim chega a 45% */
      var p = (vh * 0.85 - r.top) / (r.height + vh * 0.40);
      var n = Math.round(Math.max(0, Math.min(1, p)) * spans.length);
      spans.forEach(function (sp, i) { sp.classList.toggle('on', i < n); });
    };
    window.addEventListener('scroll', acenderAgora, { passive: true });
    window.addEventListener('resize', acenderAgora);
    acenderAgora();
  }

  /* ---------- rolagem suave (inércia), só com mouse e sem "reduzir movimento" ---------- */
  (function () {
    var temMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (parado || !temMouse) return;
    var raiz = document.documentElement;
    raiz.classList.add('suave');
    var alvo = window.scrollY, atual = window.scrollY, rodando = false, ultimoNosso = -1;
    var limite = function () { return raiz.scrollHeight - window.innerHeight; };
    function quadro() {
      atual += (alvo - atual) * 0.11;
      if (Math.abs(alvo - atual) < 0.6) { atual = alvo; rodando = false; }
      ultimoNosso = Math.round(atual);
      window.scrollTo(0, atual);
      if (rodando) requestAnimationFrame(quadro);
    }
    function ir(y) {
      alvo = Math.max(0, Math.min(limite(), y));
      if (!rodando) { rodando = true; atual = window.scrollY; requestAnimationFrame(quadro); }
    }
    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.defaultPrevented) return;
      /* caixas com rolagem própria (textarea, mensagem pronta) rolam sozinhas */
      for (var el = e.target; el && el !== document.body && el !== raiz; el = el.parentElement) {
        var oy = getComputedStyle(el).overflowY;
        if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1) return;
      }
      e.preventDefault();
      var d = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 1);
      if (!rodando) alvo = window.scrollY;
      ir(alvo + d);
    }, { passive: false });
    /* teclado, barra de rolagem ou busca: segue a posição real */
    window.addEventListener('scroll', function () {
      if (!rodando && Math.abs(window.scrollY - ultimoNosso) > 2) { alvo = atual = window.scrollY; }
    }, { passive: true });
    /* links internos (#seção) também deslizam */
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented) return;
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.getElementById(id.slice(1));
      if (!t) return;
      e.preventDefault();
      requestAnimationFrame(function () { ir(t.getBoundingClientRect().top + window.scrollY - 84); });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  })();

  /* ======================================================================
     Refinamento (24/11): títulos, traços, paralaxe, topo e sanfonas
     ====================================================================== */

  /* títulos das seções: cada palavra sobe de dentro da própria linha (como o da abertura) */
  function dividir(el) {
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'w';
          var wi = document.createElement('span'); wi.className = 'wi'; wi.textContent = p;
          w.appendChild(wi); frag.appendChild(w);
        });
        el.replaceChild(frag, n);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') {
        dividir(n);
      }
    });
  }
  if (!parado && 'IntersectionObserver' in window) {
    var obsT = new IntersectionObserver(function (itens) {
      itens.forEach(function (it) {
        if (it.isIntersecting) { it.target.classList.add('vis'); obsT.unobserve(it.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.2 });
    document.querySelectorAll('main .titulo-grande, main .golpe-titulo').forEach(function (t) {
      t.classList.add('tt');
      dividir(t);
      t.querySelectorAll('.wi').forEach(function (wi, i) { wi.style.transitionDelay = (0.08 + i * 0.065).toFixed(3) + 's'; });
      obsT.observe(t);
    });
    document.querySelectorAll('main .rotulo').forEach(function (r) {
      if (!r.closest('.abre')) obsT.observe(r);
    });
  }

  /* topo: claro sobre as seções brancas; some ao descer e volta ao subir */
  var escuros = document.querySelectorAll('.abre, .bloco-escuro, .rodape');
  var ultimoY = window.scrollY;
  function topoTom() {
    var y = window.scrollY, meio = 44, escuro = false;
    escuros.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= meio && r.bottom >= meio) escuro = true; });
    topo.classList.toggle('claro', !escuro);
    if (!parado) {
      if (y > ultimoY + 8 && y > window.innerHeight * 0.7 && !topo.contains(document.activeElement)) topo.classList.add('some');
      else if (y < ultimoY - 8 || y < 80) topo.classList.remove('some');
    }
    ultimoY = y;
  }

  /* paralaxe leve nas fotos do escritório e dos sócios */
  var fotosPar = parado ? [] : Array.prototype.slice.call(document.querySelectorAll('.colagem img, .socio-foto img'));
  var ampli = window.matchMedia('(max-width: 760px)').matches ? 16 : 28;
  function paralaxe() {
    var vh = window.innerHeight;
    fotosPar.forEach(function (img) {
      var r = img.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.setProperty('--py', (Math.max(-1, Math.min(1, p)) * -ampli).toFixed(1) + 'px');
    });
  }
  var pedidoR = false;
  function aoRolarR() {
    if (pedidoR) return;
    pedidoR = true;
    requestAnimationFrame(function () { pedidoR = false; topoTom(); paralaxe(); });
  }
  window.addEventListener('scroll', aoRolarR, { passive: true });
  window.addEventListener('resize', aoRolarR);
  aoRolarR();

  /* sanfonas: áreas e perguntas abrem e fecham deslizando (uma aberta por grupo) */
  function animarAltura(d, de, para, fim) {
    if (d._anim) d._anim.cancel();
    d.style.overflow = 'hidden';
    var an = d.animate({ height: [de + 'px', para + 'px'] }, {
      duration: Math.min(700, Math.max(340, Math.abs(para - de) * 1.1)),
      easing: 'cubic-bezier(.22,.8,.2,1)'
    });
    d._anim = an;
    var limpar = function () { d._anim = null; d.style.overflow = ''; };
    an.onfinish = function () { limpar(); if (fim) fim(); };
    an.oncancel = limpar;
  }
  function fecharSanfona(d) {
    if (parado || !d.animate) { d.open = false; return; }
    var de = d.offsetHeight;
    var para = d.querySelector('summary').offsetHeight + (d.offsetHeight - d.clientHeight);
    animarAltura(d, de, para, function () { d.open = false; });
  }
  function abrirSanfona(d) {
    if (parado || !d.animate) { d.open = true; return; }
    var de = d.offsetHeight;
    d.open = true;
    animarAltura(d, de, d.offsetHeight, null);
  }
  document.querySelectorAll('details.area, details.pergunta').forEach(function (d) {
    var grupo = d.getAttribute('name');
    if (grupo) { d.setAttribute('data-grupo', grupo); d.removeAttribute('name'); }
    d.querySelector('summary').addEventListener('click', function (e) {
      e.preventDefault();
      /* aberta (ou abrindo) → fecha; fechada (ou fechando) → abre */
      if (d.open && !d._fechando) { d._fechando = true; fecharSanfona(d); return; }
      if (grupo) {
        document.querySelectorAll('details[data-grupo="' + grupo + '"]').forEach(function (o) {
          if (o !== d && o.open && !o._fechando) { o._fechando = true; fecharSanfona(o); }
        });
      }
      d._fechando = false;
      abrirSanfona(d);
    });
  });

  /* ---------- triagem "Qual é o seu caso?" → WhatsApp do escritório ---------- */
  var WHATSAPP = '559186310721';               /* WhatsApp do Vitor, passado pelo Leandro em 24/11 (como aparece no WhatsApp, sem o 9) */
  var EMAIL = 'nakanorodriguesadv@gmail.com';   /* alternativa para quem prefere e-mail */
  var tri = document.getElementById('triagem');

  /* botão flutuante: aparece depois da abertura e some em cima da triagem e do rodapé */
  var flutua = document.getElementById('flutua');
  if (flutua) {
    var abertura = document.getElementById('inicio');
    var rodape = document.querySelector('.rodape');
    var mostrarFlutua = function () {
      var passou = abertura.getBoundingClientRect().bottom < 0;
      var vh = window.innerHeight;
      var emCima = function (el) { if (!el) return false; var r = el.getBoundingClientRect(); return r.top < vh * .85 && r.bottom > vh * .15; };
      flutua.classList.toggle('vis', passou && !emCima(tri) && !emCima(rodape));
    };
    window.addEventListener('scroll', mostrarFlutua, { passive: true });
    window.addEventListener('resize', mostrarFlutua);
    mostrarFlutua();
  }

  if (!tri) return;
  var etapasTri = tri.querySelectorAll('.tri-etapa');
  var passo = document.getElementById('triPasso');
  var barra = document.getElementById('triBarra');
  var b1 = document.getElementById('tri1');
  var b2 = document.getElementById('tri2');
  var relato = document.getElementById('triRelato');
  var nome = document.getElementById('triNome');
  var zap = document.getElementById('triZap');
  var zapDeNovo = document.getElementById('triZapDeNovo');
  var enviar = document.getElementById('triEnviar');
  var resumo = document.getElementById('triResumo');
  var fimTexto = document.getElementById('triFimTexto');
  var caixaTema = document.getElementById('triTema');
  var nomeTema = document.getElementById('triTemaNome');
  var msgEl = document.getElementById('triMsg');
  var tema = '';
  var porEmail = false;

  function marcado(nomeCampo) {
    var r = tri.querySelector('input[name="' + nomeCampo + '"]:checked');
    return r ? r.value : '';
  }
  function irPara(n) {
    etapasTri.forEach(function (e) { e.classList.toggle('ativa', e.getAttribute('data-etapa') === String(n)); });
    var k = Math.min(n, 3);
    passo.textContent = k + '/3';
    barra.style.transform = 'scaleX(' + (n > 3 ? 1 : k / 3).toFixed(4) + ')';
    var alvo = n === 4 ? document.getElementById('triCopiar') : tri.querySelector('.tri-etapa.ativa input, .tri-etapa.ativa textarea, .tri-etapa.ativa button');
    if (alvo && n > 1) alvo.focus({ preventScroll: true });
    if (tri.getBoundingClientRect().top < 60) tri.scrollIntoView({ behavior: parado ? 'auto' : 'smooth', block: 'start' });
  }
  function assuntoTexto() {
    return (marcado('assunto') || 'Ainda não sei') + (tema ? ' · ' + tema : '');
  }
  /* a mesma mensagem serve para o WhatsApp (com *negrito*) e para o e-mail (sem) */
  function mensagem(paraZap) {
    var b = function (t) { return paraZap ? '*' + t + '*' : t; };
    return [
      'Olá, vim pelo site do Nakano & Rodrigues e gostaria de orientação.',
      '',
      b('Assunto:') + ' ' + assuntoTexto(),
      b('Prazo correndo:') + ' ' + (marcado('prazo') || 'não informado'),
      '',
      b('O que aconteceu:'),
      relato.value.trim(),
      '',
      b('Nome:') + ' ' + nome.value.trim()
    ].join('\n');
  }
  function linkZap() { return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(mensagem(true)); }
  function linkEmail() {
    return 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Consulta pelo site: ' + (marcado('assunto') || 'Ainda não sei')) +
      '&body=' + encodeURIComponent(mensagem(false));
  }
  function atualizar() {
    b1.disabled = !marcado('assunto');
    b2.disabled = relato.value.trim().length < 10;
    var ok = nome.value.trim().length >= 2;
    [zap, enviar].forEach(function (a) { a.setAttribute('aria-disabled', ok ? 'false' : 'true'); });
    zap.href = ok ? linkZap() : 'https://wa.me/' + WHATSAPP;
    zapDeNovo.href = linkZap();
    enviar.href = ok ? linkEmail() : 'mailto:' + EMAIL;
    resumo.textContent = marcado('assunto') ? 'Assunto: ' + assuntoTexto() + (marcado('prazo') ? ' · Prazo correndo: ' + marcado('prazo') : '') : '';
  }
  function escolherTema(assunto, t) {
    var r = tri.querySelector('input[name="assunto"][value="' + assunto + '"]');
    if (r) r.checked = true;
    tema = t || '';
    nomeTema.textContent = tema;
    caixaTema.hidden = !tema;
    atualizar();
    irPara(1);
  }
  function concluir(viaEmail) {
    porEmail = viaEmail;
    msgEl.textContent = mensagem(false);
    fimTexto.textContent = viaEmail
      ? 'O seu aplicativo de e-mail abriu com a mensagem preenchida. É só conferir e enviar. Se não abriu, copie a mensagem e mande para ' + EMAIL + '.'
      : 'O WhatsApp abriu com a sua mensagem preenchida. É só conferir e tocar em enviar. Se não abriu, copie a mensagem e mande para (91) 98631-0721.';
    zapDeNovo.hidden = viaEmail;
    setTimeout(function () { irPara(4); }, 250);
  }

  tri.addEventListener('input', atualizar);
  tri.addEventListener('change', function (e) {
    if (e.target.name === 'assunto' && tema) {
      /* trocou de área: o tema escolhido na lista deixa de valer */
      var dono = document.querySelector('.tema[data-tema="' + CSS.escape(tema) + '"]');
      if (!dono || dono.getAttribute('data-assunto') !== e.target.value) { tema = ''; caixaTema.hidden = true; }
    }
    atualizar();
  });
  tri.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ir]');
    if (b && !b.disabled) irPara(+b.getAttribute('data-ir'));
  });
  document.getElementById('triTirarTema').addEventListener('click', function () {
    tema = ''; caixaTema.hidden = true; atualizar();
  });
  zap.addEventListener('click', function (e) {
    if (zap.getAttribute('aria-disabled') === 'true') { e.preventDefault(); nome.focus(); return; }
    zap.href = linkZap();
    concluir(false);
  });
  enviar.addEventListener('click', function (e) {
    if (enviar.getAttribute('aria-disabled') === 'true') { e.preventDefault(); nome.focus(); return; }
    enviar.href = linkEmail();
    concluir(true);
  });
  document.getElementById('triCopiar').addEventListener('click', function () {
    var btn = this;
    var texto = (porEmail ? 'Para: ' + EMAIL : 'WhatsApp: (91) 98631-0721') + '\n\n' + mensagem(false);
    var feito = function () { btn.textContent = 'Mensagem copiada'; setTimeout(function () { btn.textContent = 'Copiar mensagem'; }, 2200); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(feito, function () {});
    }
  });

  atualizar();
})();
