import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowRight, Stamp } from 'lucide-react';

/* Paleta oficial do escritório (kit de identidade visual):
   grafite, bronze, cinza e filete — os mesmos tons usados nas petições. */
const C = {
  ink: '#121619',      // grafite — textos e fundo escuro
  ink2: '#121619',      // grafite — texto principal
  muted: '#63676B',    // cinza — texto de apoio
  paper: '#F4F3F0',    // fundo de quadro
  paperDark: '#EAE8E2',
  brass: '#8C6A3F',    // bronze — acento, nunca preenchimento
  brassLight: '#C7A876',
  burgundy: '#8B3A3A', // uso interno (status "aguardando"), fora da identidade impressa
  sage: '#5C7A5E',     // uso interno (status "concluído")
  line: '#D9D6D1',     // filete
};

const FONT_DISPLAY = "Georgia, 'Times New Roman', serif"; // mesma fonte do nome do escritório no timbre
const FONT_BODY = "'Public Sans', sans-serif";             // equivalente web da Calibri usada no timbre
const FONT_MONO = "'IBM Plex Mono', monospace";

/* Logo real do escritório (kit de identidade), em duas versões:
   clara (para fundo escuro) e escura (para fundo claro). */

/* ---------------------------------------------------------
   DADOS DE EXEMPLO (substitua pelos dados reais do escritório)
--------------------------------------------------------- */
const AREAS = [
  {
    slug: 'tributario', titulo: 'Tributário',
    desc: 'Planejamento e contencioso em tributos federais, estaduais e municipais.',
    especificos: [
      {
        titulo: 'Revisão e contestação de IPTU',
        desc: 'Quando o valor cobrado está incorreto ou foi calculado com base em critério ilegal, é possível contestar o lançamento e reaver valores pagos a mais.',
      },
      {
        titulo: 'Restituição de Imposto de Renda (IRPF)',
        desc: 'Análise da declaração em busca de deduções não aproveitadas — como despesas médicas e de instrução — com pedido de restituição dos valores pagos indevidamente.',
      },
    ],
  },
  {
    slug: 'trabalhista', titulo: 'Trabalhista',
    desc: 'Reclamações, acordos e adequação de rotinas trabalhistas.',
    especificos: [
      {
        titulo: 'Reclamação trabalhista por verbas rescisórias pagas de forma errada',
        desc: 'Cobrança judicial da diferença devida quando o empregador calcula ou paga incorretamente verbas como aviso prévio, férias, 13º salário ou FGTS na rescisão do contrato de trabalho.',
      },
    ],
  },
  {
    slug: 'civel', titulo: 'Cível',
    desc: 'Contratos, responsabilidade civil e disputas patrimoniais.',
    especificos: [
      {
        titulo: 'Usucapião judicial e extrajudicial',
        desc: 'Reconhecimento da propriedade de um imóvel a quem já exerce posse mansa e pacífica por tempo suficiente, seja pela via judicial ou diretamente em cartório.',
      },
      {
        titulo: 'Responsabilidade civil (danos materiais e morais)',
        desc: 'Reparação de prejuízos financeiros e morais causados por terceiros, condomínios, empresas ou particulares.',
      },
      {
        titulo: 'Direito do consumidor (planos de saúde, produtos com defeito)',
        desc: 'Defesa do consumidor em cobranças indevidas por operadoras de saúde, ou produtos e serviços com defeito não solucionado no prazo legal.',
      },
      {
        titulo: 'Ação de superendividamento',
        desc: 'Repactuação de dívidas de consumo quando os compromissos financeiros comprometem o mínimo existencial do consumidor, com base no Código de Defesa do Consumidor.',
      },
    ],
  },
  {
    slug: 'servidor-publico', titulo: 'Direito do Servidor Público',
    desc: 'Direitos funcionais, remuneratórios e disciplinares de servidores públicos.',
    especificos: [
      {
        titulo: 'Horas extras não pagas',
        desc: 'Cobrança de horas trabalhadas além da jornada legal e não remuneradas pela Administração Pública.',
      },
      {
        titulo: 'Revisão de remuneração e progressão funcional',
        desc: 'Correção de valores pagos a menor por erro de cálculo, ausência de progressão ou outras inconsistências na remuneração.',
      },
      {
        titulo: 'Revisão do PASEP',
        desc: 'Análise e cobrança judicial de valores não repassados ou calculados incorretamente no Programa de Formação do Patrimônio do Servidor Público.',
      },
    ],
  },
  {
    slug: 'administrativo', titulo: 'Direito Administrativo',
    desc: 'Licitações, contratos administrativos e atuação perante a Administração Pública.',
    especificos: [
      {
        titulo: 'Mandado de segurança contra atos da Administração Pública',
        desc: 'Medida judicial para proteger direito líquido e certo violado por ato ilegal ou abusivo de autoridade pública — como negativas de licenças, afastamentos ou benefícios funcionais.',
      },
    ],
  },
];
/* Para incluir um item específico de uma área, adicione um objeto
   { titulo, desc } ao array "especificos" correspondente, ex.:
   especificos: [{ titulo: 'Usucapião', desc: 'Breve explicação em linguagem acessível.' }] */

const EQUIPE = [
  { nome: 'Vitor Nakano dos Reis', iniciais: ['V', 'N'], oab: 'OAB/PA nº 39.983', papel: 'Sócio' },
  { nome: 'José Alberto Pinto da Costa Rodrigues Pereira', iniciais: ['J', 'R'], oab: 'OAB/PA nº 40.892', papel: 'Sócio' },
];

const WEB3FORMS_ACCESS_KEY = 'aaf4ba78-3423-45f4-91cc-83747fa5ff98';

function gerarProtocolo() {
  const now = new Date();
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${n}`;
}


/* =========================================================
   MONOGRAMA ANIMADO (redesenho vetorial do NR do escritório)
   Os traços se desenham ao abrir o site e o filete de bronze
   desce por último. Respeita quem prefere menos movimento.
========================================================= */
function Monograma({ className = '', cor = '#F4F3F0', animar = true }) {
  const t = (n) => (animar ? `traco traco-${n}` : '');
  const clipId = useRef(Math.random().toString(36).slice(2)).current;
  return (
    <svg viewBox="-60 -60 2068 1326" className={className} fill="none" role="img" aria-label="Nakano & Rodrigues Advogados">
      <defs>
        <clipPath id={`corte-${clipId}`}><rect x="0" y="0" width="1948" height="1206" /></clipPath>
      </defs>
      <g stroke={cor} strokeWidth="107" strokeLinejoin="miter" clipPath={`url(#corte-${clipId})`}>
        <path className={t(1)} pathLength="1" d="M54 1266 V-60" />
        <path className={t(2)} pathLength="1" d="M20 -60 L882 1266" />
        <path className={t(3)} pathLength="1" d="M848 1266 V-60" />
        <path className={t(4)} pathLength="1" d="M1328 1266 V0" />
        <path className={t(5)} pathLength="1" d="M1275 54 H1660 C1752 54 1790 170 1790 316 C1790 462 1752 578 1660 578 H1328" />
        <path className={t(6)} pathLength="1" d="M1435 600 L1935 1243" />
      </g>
      <rect className={animar ? 'filete' : ''} x="1067" y="0" width="42" height="1206" fill={C.brassLight} />
    </svg>
  );
}

/* Linha do tempo que se preenche conforme a pessoa rola a página */
function useProgressoRolagem(ref) {
  const [p, setP] = useState(0);
  useEffect(() => {
    function calc() {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = r.height + vh * 0.4;
      const andado = vh * 0.7 - r.top;
      setP(Math.max(0, Math.min(1, andado / total)));
    }
    calc();
    window.addEventListener('scroll', calc, { passive: true });
    window.addEventListener('resize', calc);
    return () => {
      window.removeEventListener('scroll', calc);
      window.removeEventListener('resize', calc);
    };
  }, [ref]);
  return p;
}

const ETAPAS = [
  { rotulo: 'Começo', titulo: 'Primeiro contato', texto: 'Você conta a sua situação pelo site ou por e-mail. Lemos com atenção e respondemos indicando o que é preciso para avaliar o caso.' },
  { rotulo: 'Meio', titulo: 'Análise e condução', texto: 'Estudamos os documentos, explicamos os caminhos possíveis em linguagem simples e conduzimos o caso, informando você a cada etapa.' },
  { rotulo: 'Resolução', titulo: 'Até a decisão final', texto: 'Acompanhamos o processo até o fim, com clareza sobre prazos e próximos passos, para que você nunca fique sem saber em que pé está.' },
];

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */
export default function EscritorioSite() {
  const [view, setView] = useState('public'); // public | area | privacidade
  const [areaAtiva, setAreaAtiva] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [areaAberta, setAreaAberta] = useState(null); // item do sumário expandido

  // triagem "Qual é o seu caso?"
  const [passo, setPasso] = useState(1);
  const [areaSel, setAreaSel] = useState(null); // objeto de AREAS ou 'naosei'
  const [situacaoSel, setSituacaoSel] = useState(null);

  const [contato, setContato] = useState({ nome: '', email: '', telefone: '', mensagem: '' });
  const [stamped, setStamped] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');
  const [protocolo] = useState(gerarProtocolo);

  const linhaRef = useRef(null);
  const progresso = useProgressoRolagem(linhaRef);

  const estilos = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
      html { scroll-behavior: smooth; }
      .traco { stroke-dasharray: 1; stroke-dashoffset: 1; animation: desenhar 1.1s cubic-bezier(.65,0,.25,1) forwards; }
      .traco-1 { animation-delay: .15s } .traco-2 { animation-delay: .45s } .traco-3 { animation-delay: .75s }
      .traco-4 { animation-delay: 1.05s } .traco-5 { animation-delay: 1.3s } .traco-6 { animation-delay: 1.6s }
      .filete { transform-box: fill-box; transform-origin: top; transform: scaleY(0); animation: descer 1.2s 2.1s cubic-bezier(.65,0,.25,1) forwards; }
      .surgir { opacity: 0; transform: translateY(14px); animation: surgir .9s cubic-bezier(.2,.7,.2,1) forwards; }
      @keyframes desenhar { to { stroke-dashoffset: 0; } }
      @keyframes descer { to { transform: scaleY(1); } }
      @keyframes surgir { to { opacity: 1; transform: none; } }
      @keyframes stampDown {
        0% { transform: translate(-50%,-70%) rotate(-18deg) scale(1.6); opacity: 0; }
        60% { transform: translate(-50%,-50%) rotate(-12deg) scale(1); opacity: 1; }
        100% { transform: translate(-50%,-50%) rotate(-12deg) scale(1); opacity: 1; }
      }
      .pontilhado { flex: 1; border-bottom: 1px dotted ${C.muted}; opacity: .45; margin: 0 14px; transform: translateY(-6px); }
      .opcao { transition: background .2s, border-color .2s, color .2s; }
      .opcao:hover { border-color: ${C.brass}; }
      @media (prefers-reduced-motion: reduce) {
        .traco, .filete, .surgir { animation: none !important; stroke-dashoffset: 0; transform: none; opacity: 1; }
        html { scroll-behavior: auto; }
      }
    `}</style>
  );

  function abrirArea(area) {
    setAreaAtiva(area);
    setView('area');
    window.scrollTo(0, 0);
  }

  function irParaConsulta(area) {
    setView('public');
    setStamped(false);
    if (area) {
      setAreaSel(area);
      setSituacaoSel(null);
      setPasso(2);
    }
    setTimeout(() => document.getElementById('consulta')?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  function escolherArea(a) {
    setAreaSel(a);
    setSituacaoSel(null);
    setPasso(a === 'naosei' ? 3 : 2);
  }

  function escolherSituacao(s) {
    setSituacaoSel(s);
    setPasso(3);
  }

  function recomecar() {
    setPasso(1);
    setAreaSel(null);
    setSituacaoSel(null);
  }

  const nomeArea = areaSel === 'naosei' ? 'Ainda não sei' : areaSel?.titulo;

  async function handleContatoSubmit() {
    if (!contato.nome || !contato.email || !contato.mensagem) {
      setErroEnvio('Preencha nome, e-mail e a descrição da sua situação.');
      return;
    }
    setErroEnvio('');
    setEnviando(true);
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `Nova consulta pelo site: ${nomeArea || 'área não informada'}`,
          from_name: 'Site Nakano & Rodrigues',
          area: nomeArea || 'Não informada',
          situacao: situacaoSel || 'Não informada',
          nome: contato.nome,
          email: contato.email,
          telefone: contato.telefone || 'Não informado',
          mensagem: contato.mensagem,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Falha ao enviar.');
      setStamped(true);
    } catch (err) {
      setErroEnvio('Não foi possível enviar agora. Tente novamente em instantes ou escreva para nakanorodriguesadv@gmail.com.');
    } finally {
      setEnviando(false);
    }
  }

  const Cabecalho = ({ simples = false }) => (
    <header className="sticky top-0 z-30" style={{ background: 'rgba(18,22,25,0.92)', backdropFilter: 'blur(8px)' }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
        <button onClick={() => { setView('public'); window.scrollTo(0, 0); }} aria-label="Início">
          <Monograma className="h-7 w-auto" animar={false} />
        </button>
        {!simples && (
          <>
            <nav className="hidden md:flex items-center gap-8 text-sm" style={{ color: C.paper }}>
              <a href="#atuacao" className="opacity-70 hover:opacity-100 transition">Atuação</a>
              <a href="#atendimento" className="opacity-70 hover:opacity-100 transition">Atendimento</a>
              <a href="#equipe" className="opacity-70 hover:opacity-100 transition">Equipe</a>
              <a href="#consulta" className="px-4 py-2 rounded-sm text-sm" style={{ border: `1px solid ${C.brassLight}`, color: C.brassLight }}>
                Solicitar consulta
              </a>
            </nav>
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              {menuOpen ? <X color={C.paper} /> : <Menu color={C.paper} />}
            </button>
          </>
        )}
      </div>
      {!simples && menuOpen && (
        <div className="md:hidden px-5 pb-5 flex flex-col gap-4 text-sm" style={{ color: C.paper }}>
          <a href="#atuacao" onClick={() => setMenuOpen(false)}>Atuação</a>
          <a href="#atendimento" onClick={() => setMenuOpen(false)}>Atendimento</a>
          <a href="#equipe" onClick={() => setMenuOpen(false)}>Equipe</a>
          <a href="#consulta" onClick={() => setMenuOpen(false)} style={{ color: C.brassLight }}>Solicitar consulta</a>
        </div>
      )}
    </header>
  );

  const Rodape = () => (
    <footer className="px-5 md:px-8 py-12" style={{ background: C.ink, color: C.paper }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <Monograma className="h-10 w-auto mb-5" animar={false} />
          <p className="text-sm opacity-70" style={{ fontFamily: FONT_DISPLAY }}>Nakano & Rodrigues Advogados</p>
          <p className="text-xs mt-2 opacity-50 max-w-md">Av. Alcindo Cacela, nº 700, Sala 103 A, Umarizal · Belém/PA · CEP 66060-000</p>
          <p className="text-xs mt-1 opacity-50">nakanorodriguesadv@gmail.com · Segunda a sexta, das 8h às 18h</p>
        </div>
        <div className="flex flex-col md:items-end gap-2 text-xs opacity-60">
          <button onClick={() => { setView('privacidade'); window.scrollTo(0, 0); }} className="hover:opacity-100 text-left md:text-right">
            Política de Privacidade
          </button>
          <p>© 2026 Nakano & Rodrigues Advogados</p>
        </div>
      </div>
    </footer>
  );

  /* ------------------ POLÍTICA DE PRIVACIDADE ------------------ */
  if (view === 'privacidade') {
    const secoes = [
      {
        titulo: '1. Quem somos',
        corpo: 'Nakano & Rodrigues Advogados, com sede na Av. Alcindo Cacela, nº 700, Sala 103 A, Umarizal · Belém/PA · CEP 66060-000, é o controlador dos dados pessoais tratados por meio deste site, nos termos da Lei nº 13.709/2018 (LGPD).',
      },
      {
        titulo: '2. Quais dados coletamos',
        corpo: 'Apenas os dados informados voluntariamente no formulário de contato (nome, e-mail, telefone e mensagem). Este site não utiliza cookies de rastreamento ou ferramentas de análise de terceiros.',
      },
      {
        titulo: '3. Para que usamos os dados',
        corpo: 'Para responder solicitações de contato, prestar consultoria e atuação jurídica e cumprir obrigações legais e regulatórias aplicáveis à advocacia.',
      },
      {
        titulo: '4. Base legal',
        corpo: 'O tratamento se baseia, conforme o caso, na execução de procedimentos preliminares a um contrato (art. 7º, V, da LGPD), no legítimo interesse do escritório (art. 7º, IX), ou no consentimento fornecido ao preencher o formulário de contato (art. 7º, I).',
      },
      {
        titulo: '5. Com quem compartilhamos',
        corpo: 'Não vendemos nem compartilhamos dados com terceiros para fins comerciais. Podemos compartilhar informações com órgãos do Poder Judiciário, tribunais e autoridades quando necessário à atuação processual, e com prestadores de infraestrutura (hospedagem do site e envio de e-mail) que seguem padrões adequados de segurança.',
      },
      {
        titulo: '6. Como protegemos os dados',
        corpo: 'As mensagens do formulário são enviadas diretamente ao e-mail do escritório e não ficam armazenadas no site. O acesso a esse e-mail é restrito aos sócios.',
      },
      {
        titulo: '7. Por quanto tempo guardamos os dados',
        corpo: 'Os dados são mantidos enquanto durar a relação contratual e pelo prazo necessário ao cumprimento de obrigações legais, incluindo prazos prescricionais aplicáveis a cada caso.',
      },
      {
        titulo: '8. Seus direitos',
        corpo: 'Nos termos do art. 18 da LGPD, você pode solicitar a confirmação da existência de tratamento, acesso, correção de dados incompletos ou desatualizados, eliminação de dados desnecessários, portabilidade, informação sobre compartilhamento e a revogação do consentimento, quando aplicável.',
      },
      {
        titulo: '9. Como exercer seus direitos',
        corpo: 'Entre em contato pelo e-mail nakanorodriguesadv@gmail.com ou pelo endereço indicado no início desta página.',
      },
      {
        titulo: '10. Alterações desta política',
        corpo: 'Esta política pode ser atualizada periodicamente. A data da última atualização está indicada no topo desta página.',
      },
    ];
    return (
      <div className="min-h-screen w-full" style={{ background: C.paper, fontFamily: FONT_BODY, color: C.ink2 }}>
        {estilos}
        <Cabecalho simples />
        <section className="px-5 md:px-8 py-16 md:py-20">
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setView('public')} className="text-sm mb-8 opacity-60 hover:opacity-100 transition">
              ← Voltar ao site
            </button>
            <h1 style={{ fontFamily: FONT_DISPLAY }} className="text-3xl md:text-4xl mb-2">Política de Privacidade</h1>
            <p className="text-xs mb-10" style={{ fontFamily: FONT_MONO, opacity: 0.5 }}>Última atualização: novembro de 2026</p>
            <div className="space-y-8">
              {secoes.map((s) => (
                <div key={s.titulo}>
                  <h2 className="text-base font-medium mb-2">{s.titulo}</h2>
                  <p className="text-sm opacity-70 leading-relaxed">{s.corpo}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <Rodape />
      </div>
    );
  }

  /* ---------------------- ÁREA (detalhe) ---------------------- */
  if (view === 'area' && areaAtiva) {
    const idx = AREAS.indexOf(areaAtiva);
    return (
      <div className="min-h-screen w-full" style={{ background: C.paper, fontFamily: FONT_BODY, color: C.ink2 }}>
        {estilos}
        <Cabecalho simples />
        <section className="px-5 md:px-8 py-16 md:py-24">
          <div className="max-w-3xl mx-auto">
            <button onClick={() => { setView('public'); setTimeout(() => document.getElementById('atuacao')?.scrollIntoView(), 50); }}
              className="text-sm mb-10 opacity-60 hover:opacity-100 transition">
              ← Voltar às áreas de atuação
            </button>
            <p className="text-xs mb-3" style={{ fontFamily: FONT_MONO, color: C.brass }}>{String(idx + 1).padStart(2, '0')} / {String(AREAS.length).padStart(2, '0')}</p>
            <h1 style={{ fontFamily: FONT_DISPLAY }} className="text-4xl md:text-6xl leading-tight mb-5">{areaAtiva.titulo}</h1>
            <p className="text-lg opacity-70 max-w-xl">{areaAtiva.desc}</p>
            <div className="mt-12">
              {areaAtiva.especificos.map((item, i) => (
                <div key={item.titulo} className="py-6 grid md:grid-cols-[60px_1fr] gap-2" style={{ borderTop: `1px solid ${C.line}` }}>
                  <p className="text-xs pt-1" style={{ fontFamily: FONT_MONO, color: C.brass }}>{idx + 1}.{i + 1}</p>
                  <div>
                    <h3 style={{ fontFamily: FONT_DISPLAY }} className="text-xl mb-2">{item.titulo}</h3>
                    <p className="text-sm opacity-70 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => irParaConsulta(areaAtiva)}
              className="inline-flex items-center gap-2 mt-10 px-6 py-3 rounded-sm text-sm font-medium" style={{ background: C.ink, color: C.paper }}>
              Solicitar consulta sobre {areaAtiva.titulo} <ArrowRight size={16} />
            </button>
          </div>
        </section>
        <Rodape />
      </div>
    );
  }

  /* -------------------------- SITE PÚBLICO -------------------------- */
  return (
    <div className="min-h-screen w-full" style={{ background: C.paper, fontFamily: FONT_BODY, color: C.ink2 }}>
      {estilos}
      <Cabecalho />

      {/* ABERTURA: o monograma se desenha */}
      <section className="px-5 md:px-8 relative overflow-hidden" style={{ background: C.ink, minHeight: '92vh' }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1.1fr_1fr] gap-12 items-center py-20 md:py-28" style={{ minHeight: '92vh' }}>
          <div className="order-2 md:order-1">
            <p className="surgir text-xs uppercase mb-6" style={{ color: C.brassLight, letterSpacing: '0.25em', animationDelay: '2.4s' }}>
              Nakano & Rodrigues · Advogados · Belém/PA
            </p>
            <h1 className="surgir text-4xl md:text-6xl leading-[1.08]" style={{ fontFamily: FONT_DISPLAY, color: C.paper, animationDelay: '2.6s' }}>
              Todo processo tem começo, meio e <em style={{ color: C.brassLight }}>resolução</em>.
            </h1>
            <p className="surgir mt-7 text-base md:text-lg max-w-lg leading-relaxed" style={{ color: 'rgba(244,243,240,0.72)', animationDelay: '2.8s' }}>
              Acompanhamos cada caso do primeiro contato até a decisão final, com clareza sobre prazos,
              custos e próximos passos.
            </p>
            <div className="surgir flex flex-wrap gap-4 mt-10" style={{ animationDelay: '3s' }}>
              <a href="#consulta" className="inline-flex items-center gap-2 px-6 py-3 rounded-sm text-sm font-medium" style={{ background: C.brassLight, color: C.ink }}>
                Qual é o seu caso? <ArrowRight size={16} />
              </a>
              <a href="#atuacao" className="inline-flex items-center gap-2 px-6 py-3 rounded-sm text-sm" style={{ color: C.paper, border: '1px solid rgba(244,243,240,0.25)' }}>
                Áreas de atuação
              </a>
            </div>
          </div>
          <div className="order-1 md:order-2 flex justify-center md:justify-end">
            <Monograma className="w-56 md:w-[420px] h-auto" />
          </div>
        </div>
      </section>

      {/* ÁREAS como sumário de livro */}
      <section id="atuacao" className="px-5 md:px-8 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-[220px_1fr] gap-10">
            <div>
              <p className="text-xs uppercase mb-3" style={{ color: C.brass, letterSpacing: '0.25em' }}>Sumário</p>
              <h2 style={{ fontFamily: FONT_DISPLAY }} className="text-3xl md:text-4xl leading-tight">Áreas de atuação</h2>
              <p className="text-sm opacity-60 mt-4 leading-relaxed">Passe o cursor ou toque em uma área para ver os tipos de ação.</p>
            </div>
            <ol>
              {AREAS.map((a, i) => {
                const aberta = areaAberta === a.slug;
                return (
                  <li key={a.slug} style={{ borderTop: `1px solid ${C.line}` }}
                    onMouseEnter={() => setAreaAberta(a.slug)} onMouseLeave={() => setAreaAberta(null)}>
                    <button onClick={() => (aberta ? abrirArea(a) : setAreaAberta(a.slug))} className="w-full text-left py-6 group">
                      <div className="flex items-baseline">
                        <span className="text-xs w-10 shrink-0" style={{ fontFamily: FONT_MONO, color: C.brass }}>{String(i + 1).padStart(2, '0')}</span>
                        <span style={{ fontFamily: FONT_DISPLAY }} className="text-2xl md:text-3xl transition-colors"
                          >{a.titulo}</span>
                        <span className="pontilhado hidden sm:block" />
                        <span className="text-xs shrink-0 ml-3 sm:ml-0" style={{ fontFamily: FONT_MONO, opacity: 0.5 }}>
                          {a.especificos.length} {a.especificos.length === 1 ? 'tema' : 'temas'}
                        </span>
                      </div>
                    </button>
                    <div style={{ display: 'grid', gridTemplateRows: aberta ? '1fr' : '0fr', transition: 'grid-template-rows .45s ease' }}>
                      <div style={{ overflow: 'hidden' }}>
                        <div className="pl-10 pb-7">
                          <p className="text-sm opacity-70 mb-4">{a.desc}</p>
                          <div className="flex flex-wrap gap-2 mb-5">
                            {a.especificos.map((e) => (
                              <span key={e.titulo} className="text-xs px-3 py-1.5 rounded-full" style={{ border: `1px solid ${C.line}`, background: '#fff' }}>{e.titulo}</span>
                            ))}
                          </div>
                          <button onClick={() => abrirArea(a)} className="text-sm inline-flex items-center gap-1.5" style={{ color: C.brass }}>
                            Ler sobre {a.titulo} <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
              <li style={{ borderTop: `1px solid ${C.line}` }} />
            </ol>
          </div>
        </div>
      </section>

      {/* COMEÇO, MEIO E RESOLUÇÃO — linha que se preenche com a rolagem */}
      <section id="atendimento" className="px-5 md:px-8 py-20 md:py-28" style={{ background: C.ink, color: C.paper }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-[220px_1fr] gap-10">
          <div>
            <p className="text-xs uppercase mb-3" style={{ color: C.brassLight, letterSpacing: '0.25em' }}>Atendimento</p>
            <h2 style={{ fontFamily: FONT_DISPLAY }} className="text-3xl md:text-4xl leading-tight">Começo, meio e resolução</h2>
          </div>
          <div ref={linhaRef} className="relative pl-12">
            <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: 'rgba(244,243,240,0.15)' }} />
            <div className="absolute left-[7px] top-2 w-px" style={{ background: C.brassLight, height: `calc((100% - 16px) * ${progresso})`, transition: 'height .15s linear' }} />
            {ETAPAS.map((e, i) => {
              const ativa = progresso >= (i / (ETAPAS.length - 1)) * 0.92;
              return (
                <div key={e.rotulo} className="relative pb-16 last:pb-0" style={{ opacity: ativa ? 1 : 0.35, transition: 'opacity .5s' }}>
                  <span className="absolute -left-12 top-1.5 w-[15px] h-[15px] rounded-full"
                    style={{ background: ativa ? C.brassLight : C.ink, border: `1px solid ${ativa ? C.brassLight : 'rgba(244,243,240,0.35)'}`, transition: 'background .4s' }} />
                  <p className="text-xs uppercase mb-2" style={{ fontFamily: FONT_MONO, color: C.brassLight, letterSpacing: '0.15em' }}>{e.rotulo}</p>
                  <h3 style={{ fontFamily: FONT_DISPLAY }} className="text-2xl md:text-3xl mb-3">{e.titulo}</h3>
                  <p className="text-sm md:text-base leading-relaxed max-w-lg" style={{ opacity: 0.7 }}>{e.texto}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* EQUIPE */}
      <section id="equipe" className="px-5 md:px-8 py-20 md:py-28">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[220px_1fr] gap-10">
          <div>
            <p className="text-xs uppercase mb-3" style={{ color: C.brass, letterSpacing: '0.25em' }}>Quem conduz seu caso</p>
            <h2 style={{ fontFamily: FONT_DISPLAY }} className="text-3xl md:text-4xl leading-tight">Sócios</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-px" style={{ background: C.line }}>
            {EQUIPE.map((p) => {
              return (
                <div key={p.nome} className="p-8" style={{ background: C.paper }}>
                  <p style={{ fontFamily: FONT_DISPLAY, color: C.brass, fontSize: 64, lineHeight: 1 }}>
                    {p.iniciais[0]}<span style={{ color: C.line }}>|</span>{p.iniciais[1]}
                  </p>
                  <h3 style={{ fontFamily: FONT_DISPLAY }} className="text-xl mt-8 leading-snug">{p.nome}</h3>
                  <p className="text-xs mt-2" style={{ fontFamily: FONT_MONO, opacity: 0.55 }}>{p.oab}</p>
                  <p className="text-sm mt-1 opacity-70">{p.papel}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* QUAL É O SEU CASO? — triagem guiada */}
      <section id="consulta" className="px-5 md:px-8 py-20 md:py-28" style={{ background: C.paperDark }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_300px] gap-10">
          <div>
            <p className="text-xs uppercase mb-3" style={{ color: C.brass, letterSpacing: '0.25em' }}>Solicite uma consulta</p>
            <h2 style={{ fontFamily: FONT_DISPLAY }} className="text-3xl md:text-4xl leading-tight mb-8">Qual é o seu caso?</h2>

            {stamped ? (
              <div className="p-10 rounded-sm text-center relative overflow-hidden" style={{ background: '#fff', border: `1px solid ${C.line}`, minHeight: 260 }}>
                <p className="opacity-70 text-sm">Recebemos sua solicitação, {contato.nome.split(' ')[0]}.</p>
                <p className="opacity-70 text-sm">Responderemos pelo e-mail informado.</p>
                <div className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center rounded-full"
                  style={{ width: 132, height: 132, border: `3px solid ${C.burgundy}`, color: C.burgundy, animation: 'stampDown 0.6s ease-out forwards' }}>
                  <Stamp size={22} />
                  <span style={{ fontSize: 10, letterSpacing: '0.15em', marginTop: 4 }}>PROTOCOLADO</span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 9, marginTop: 2 }}>Nº {protocolo}</span>
                </div>
              </div>
            ) : (
              <div className="p-6 md:p-8 rounded-sm" style={{ background: '#fff', border: `1px solid ${C.line}` }}>
                {/* progresso */}
                <div className="flex items-center gap-2 mb-7">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-1 flex-1 rounded-full" style={{ background: n <= passo ? C.brass : C.line, transition: 'background .3s' }} />
                  ))}
                  <span className="text-xs ml-2" style={{ fontFamily: FONT_MONO, opacity: 0.5 }}>{passo}/3</span>
                </div>

                {passo === 1 && (
                  <div>
                    <p className="text-sm mb-4 opacity-80">Sobre qual assunto você precisa de orientação?</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {AREAS.map((a) => (
                        <button key={a.slug} onClick={() => escolherArea(a)} className="opcao text-left px-4 py-3 rounded-sm text-sm" style={{ border: `1px solid ${C.line}` }}>
                          {a.titulo}
                        </button>
                      ))}
                      <button onClick={() => escolherArea('naosei')} className="opcao text-left px-4 py-3 rounded-sm text-sm" style={{ border: `1px dashed ${C.muted}` }}>
                        Ainda não sei
                      </button>
                    </div>
                  </div>
                )}

                {passo === 2 && areaSel && areaSel !== 'naosei' && (
                  <div>
                    <button onClick={recomecar} className="text-xs mb-4 opacity-60 hover:opacity-100">← {areaSel.titulo}</button>
                    <p className="text-sm mb-4 opacity-80">Qual dessas situações é mais parecida com a sua?</p>
                    <div className="grid gap-3">
                      {areaSel.especificos.map((e) => (
                        <button key={e.titulo} onClick={() => escolherSituacao(e.titulo)} className="opcao text-left px-4 py-3 rounded-sm text-sm" style={{ border: `1px solid ${C.line}` }}>
                          {e.titulo}
                        </button>
                      ))}
                      <button onClick={() => escolherSituacao('Outra situação')} className="opcao text-left px-4 py-3 rounded-sm text-sm" style={{ border: `1px dashed ${C.muted}` }}>
                        Outra situação
                      </button>
                    </div>
                  </div>
                )}

                {passo === 3 && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-3 py-1.5 rounded-full" style={{ background: C.paper, border: `1px solid ${C.line}` }}>{nomeArea}</span>
                      {situacaoSel && <span className="px-3 py-1.5 rounded-full" style={{ background: C.paper, border: `1px solid ${C.line}` }}>{situacaoSel}</span>}
                      <button onClick={recomecar} className="underline opacity-60 hover:opacity-100">alterar</button>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wide opacity-60">Nome</label>
                      <input value={contato.nome} onChange={(e) => setContato({ ...contato, nome: e.target.value })}
                        className="w-full mt-1 px-3 py-2.5 text-sm rounded-sm outline-none" style={{ border: `1px solid ${C.line}` }} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs uppercase tracking-wide opacity-60">E-mail</label>
                        <input type="email" value={contato.email} onChange={(e) => setContato({ ...contato, email: e.target.value })}
                          className="w-full mt-1 px-3 py-2.5 text-sm rounded-sm outline-none" style={{ border: `1px solid ${C.line}` }} />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wide opacity-60">Telefone (opcional)</label>
                        <input value={contato.telefone} onChange={(e) => setContato({ ...contato, telefone: e.target.value })}
                          className="w-full mt-1 px-3 py-2.5 text-sm rounded-sm outline-none" style={{ border: `1px solid ${C.line}` }} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wide opacity-60">Conte brevemente a sua situação</label>
                      <textarea rows={4} value={contato.mensagem} onChange={(e) => setContato({ ...contato, mensagem: e.target.value })}
                        className="w-full mt-1 px-3 py-2.5 text-sm rounded-sm outline-none resize-none" style={{ border: `1px solid ${C.line}` }} />
                    </div>
                    {erroEnvio && <p className="text-xs" style={{ color: C.burgundy }}>{erroEnvio}</p>}
                    <button onClick={handleContatoSubmit} disabled={enviando}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-sm text-sm font-medium"
                      style={{ background: C.ink, color: C.paper, opacity: enviando ? 0.7 : 1 }}>
                      {enviando ? 'Enviando...' : <>Enviar solicitação <ArrowRight size={16} /></>}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* lateral: dados oficiais + aviso contra golpes */}
          <aside className="space-y-6 md:pt-[104px]">
            <div className="text-sm space-y-4">
              <div>
                <p className="text-xs uppercase opacity-50 mb-1">E-mail oficial</p>
                <a href="mailto:nakanorodriguesadv@gmail.com" className="break-all" style={{ color: C.brass }}>nakanorodriguesadv@gmail.com</a>
              </div>
              <div>
                <p className="text-xs uppercase opacity-50 mb-1">Endereço</p>
                <p className="opacity-80">Av. Alcindo Cacela, nº 700, Sala 103 A, Umarizal · Belém/PA · CEP 66060-000</p>
              </div>
              <div>
                <p className="text-xs uppercase opacity-50 mb-1">Horário</p>
                <p className="opacity-80">Segunda a sexta, das 8h às 18h</p>
              </div>
            </div>
            <div className="p-5 rounded-sm text-sm" style={{ background: C.ink, color: C.paper }}>
              <p className="font-medium mb-2" style={{ color: C.brassLight }}>Atenção a golpes</p>
              <p className="opacity-80 leading-relaxed">
                O escritório nunca solicita pagamentos, depósitos ou dados bancários por WhatsApp ou telefone.
                Em caso de dúvida, confirme sempre pelo e-mail oficial.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <Rodape />
    </div>
  );
}
