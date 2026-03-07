/* seo.js — injects meta tags and JSON-LD schema on every page load.
   Idempotent: uses element IDs/selectors to avoid duplicates. */
(function () {
  'use strict';

  const BASE      = 'https://ostuitesdojardel.com';
  const OG_IMAGE  = BASE + '/images/OpenGraphImage.png';
  const path      = location.pathname;
  const params    = new URLSearchParams(location.search);

  /* ── Page-type detection ── */
  const isHome     = path === '/' || path.endsWith('/index.html') || path === '';
  const isCat      = path.includes('categoria');
  const isSearch   = path.includes('busca');
  const isSobre    = path.includes('sobre-jardel');
  const isMeuAmigo = path.includes('meu-amigo-jardel');
  const isContato  = path.includes('contato');

  const CAT_LABELS = {
    'Jardel':     'Jardel sendo Jardel',
    'Música':     'Música',
    'Futebol':    'Futebol',
    'Política':   'Política',
    'Televisão':  'Televisão',
    'Jornalismo': 'Jornalismo',
    'São Paulo':  'São Paulo'
  };

  /* ── Title / description / canonical per page ── */
  var title, description, canonical, ogType = 'website';

  if (isHome) {
    title       = 'Os Tuítes do Jardel';
    description = 'Um arquivo com todos os 15.587 tuítes de Jardel Sebba. Pesquise, explore por categoria e reviva a irreverência do jornalista.';
    canonical   = BASE + '/';

  } else if (isCat) {
    var cat   = params.get('cat') || 'Jardel';
    var label = CAT_LABELS[cat] || cat;
    title       = label + ' — Os Tuítes do Jardel';
    description = 'Explore os tuítes de Jardel Sebba sobre ' + label + '. Um arquivo com 15.587 tuítes do jornalista.';
    canonical   = BASE + '/categoria.html?cat=' + encodeURIComponent(cat);

  } else if (isSearch) {
    var q = params.get('q') || '';
    title       = (q ? 'Busca: ' + q + ' — ' : 'Busca — ') + 'Os Tuítes do Jardel';
    description = 'Pesquise entre os 15.587 tuítes de Jardel Sebba.';
    canonical   = BASE + '/busca.html' + (q ? '?q=' + encodeURIComponent(q) : '');

  } else if (isSobre) {
    title       = 'Sobre o projeto — Os Tuítes do Jardel';
    description = 'Como e por que foi criado o arquivo Os Tuítes do Jardel — 15.587 tuítes de Jardel Sebba entre 2009 e 2023.';
    canonical   = BASE + '/sobre-jardel.html';
    ogType      = 'article';

  } else if (isMeuAmigo) {
    title       = 'Meu amigo Jardel — Os Tuítes do Jardel';
    description = 'Um texto de Daniel Motta sobre sua amizade com Jardel Sebba — jornalista, tuíteiro incansável e um dos meus melhores amigos.';
    canonical   = BASE + '/meu-amigo-jardel.html';
    ogType      = 'article';

  } else if (isContato) {
    title       = 'Contato — Os Tuítes do Jardel';
    description = 'Entre em contato com o criador do arquivo Os Tuítes do Jardel.';
    canonical   = BASE + '/contato.html';

  } else {
    return; /* 404 or unknown — leave existing tags untouched */
  }

  var head = document.head;

  /* ── Helpers ── */
  function setMeta(selector, attrName, attrVal, content) {
    var el = head.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrVal);
      head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function setLink(rel, href) {
    var el = head.querySelector('link[rel="' + rel + '"]');
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      head.appendChild(el);
    }
    el.setAttribute('href', href);
  }

  function injectLD(id, schema) {
    if (document.getElementById(id)) return;
    var s = document.createElement('script');
    s.id        = id;
    s.type      = 'application/ld+json';
    s.textContent = JSON.stringify(schema);
    head.appendChild(s);
  }

  /* ── Meta / link tags ── */
  setMeta('meta[name="description"]',         'name',     'description',  description);
  setLink('canonical',                                                     canonical);

  setMeta('meta[property="og:title"]',        'property', 'og:title',        title);
  setMeta('meta[property="og:description"]',  'property', 'og:description',  description);
  setMeta('meta[property="og:url"]',          'property', 'og:url',          canonical);
  setMeta('meta[property="og:type"]',         'property', 'og:type',         ogType);
  setMeta('meta[property="og:image"]',        'property', 'og:image',        OG_IMAGE);

  setMeta('meta[name="twitter:card"]',        'name', 'twitter:card',        'summary_large_image');
  setMeta('meta[name="twitter:title"]',       'name', 'twitter:title',       title);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  setMeta('meta[name="twitter:image"]',       'name', 'twitter:image',       OG_IMAGE);

  /* ── JSON-LD: Person — Jardel Sebba (every page) ── */
  injectLD('ld-person-jardel', {
    '@context':      'https://schema.org',
    '@type':         'Person',
    'name':          'Jardel Sebba',
    'alternateName': 'Jardel',
    'sameAs':        ['https://twitter.com/jsebba'],
    'url':           BASE + '/'
  });

  /* ── JSON-LD: Homepage ── */
  if (isHome) {
    injectLD('ld-website', {
      '@context': 'https://schema.org',
      '@type':    'WebSite',
      'name':     'Os Tuítes do Jardel',
      'url':      BASE + '/',
      'potentialAction': {
        '@type':       'SearchAction',
        'target':      {
          '@type':      'EntryPoint',
          'urlTemplate': BASE + '/busca.html?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    });

    injectLD('ld-archive', {
      '@context':    'https://schema.org',
      '@type':       'ArchiveOrganization',
      'name':        'Os Tuítes do Jardel',
      'url':         BASE + '/',
      'description': 'Um arquivo de tuítes escritos por Jardel Sebba.',
      'founder':     { '@type': 'Person', 'name': 'Daniel Motta' }
    });
  }

  /* ── JSON-LD: Category pages ── */
  if (isCat) {
    var catName  = params.get('cat') || 'Jardel';
    var catLabel = CAT_LABELS[catName] || catName;

    injectLD('ld-collection', {
      '@context': 'https://schema.org',
      '@type':    'CollectionPage',
      'name':     'Tuítes sobre ' + catLabel,
      'url':      canonical,
      'about':    { '@type': 'Person', 'name': 'Jardel Sebba' },
      'isPartOf': { '@type': 'WebSite', 'name': 'Os Tuítes do Jardel', 'url': BASE + '/' }
    });

    injectLD('ld-breadcrumb', {
      '@context':        'https://schema.org',
      '@type':           'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home',     'item': BASE + '/' },
        { '@type': 'ListItem', 'position': 2, 'name': catLabel,   'item': canonical  }
      ]
    });
  }

  /* ── JSON-LD: Essay pages ── */
  if (isSobre || isMeuAmigo) {
    var headline = title.split(' — ')[0];

    injectLD('ld-article', {
      '@context': 'https://schema.org',
      '@type':    'Article',
      'headline': headline,
      'url':      canonical,
      'author':   { '@type': 'Person', 'name': 'Daniel Motta' },
      'about':    { '@type': 'Person', 'name': 'Jardel Sebba' },
      'isPartOf': { '@type': 'WebSite', 'name': 'Os Tuítes do Jardel', 'url': BASE + '/' }
    });

    injectLD('ld-breadcrumb', {
      '@context':        'https://schema.org',
      '@type':           'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home',     'item': BASE + '/' },
        { '@type': 'ListItem', 'position': 2, 'name': headline,   'item': canonical  }
      ]
    });
  }
}());
