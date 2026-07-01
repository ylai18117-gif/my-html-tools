/**
 * MyHtml i18n — Lightweight multilingual system
 * Supports: zh-CN, en, ja, ko
 * Usage: <script src="/i18n.js"></script> then I18n.init(TRANSLATIONS)
 */
(function(){
  const STORAGE_KEY='_userLang';
  const LANGS=[
    {code:'zh-CN',label:'中文'},
    {code:'en',label:'EN'},
    {code:'ja',label:'日本語'},
    {code:'ko',label:'한국어'}
  ];

  let _curLang='en';
  let _translations={};
  let _onSwitchCb=null;

  function detectLang(){
    // 1. localStorage preference
    const saved=localStorage.getItem(STORAGE_KEY);
    if(saved&&LANGS.some(l=>l.code===saved))return saved;
    // 2. Browser language
    const nav=navigator.language||navigator.userLanguage||'';
    // Exact match
    const exact=LANGS.find(l=>l.code===nav);
    if(exact)return exact.code;
    // Prefix match: zh-TW -> zh-CN, en-US -> en, ja-JP -> ja
    const prefix=nav.split('-')[0];
    if(prefix==='zh')return'zh-CN';
    const prefixMatch=LANGS.find(l=>l.code.startsWith(prefix));
    if(prefixMatch)return prefixMatch.code;
    // 3. Default English
    return'en';
  }

  function t(key){
    if(!_translations[_curLang])return _translations['en']?.[key]||key;
    return _translations[_curLang][key]||_translations['en']?.[key]||key;
  }

  function applyToDOM(){
    // Translate textContent
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key=el.getAttribute('data-i18n');
      el.textContent=t(key);
    });
    // Translate innerHTML (for elements with HTML content)
    document.querySelectorAll('[data-i18n-html]').forEach(el=>{
      const key=el.getAttribute('data-i18n-html');
      el.innerHTML=t(key);
    });
    // Translate attributes (placeholder, title, aria-label)
    document.querySelectorAll('[data-i18n-attr]').forEach(el=>{
      const spec=el.getAttribute('data-i18n-attr');
      // Format: "placeholder:key1,title:key2"
      spec.split(',').forEach(pair=>{
        const[attr,key]=pair.split(':').map(s=>s.trim());
        if(attr&&key)el.setAttribute(attr,t(key));
      });
    });
  }

  function switchLang(code){
    if(!LANGS.some(l=>l.code===code))return;
    _curLang=code;
    localStorage.setItem(STORAGE_KEY,code);
    applyToDOM();
    updateSelector();
    if(_onSwitchCb)_onSwitchCb(code);
  }

  function updateSelector(){
    document.querySelectorAll('.i18n-opt').forEach(btn=>{
      btn.classList.toggle('active',btn.dataset.lang===_curLang);
    });
  }

  function renderSelector(containerId){
    const container=document.getElementById(containerId);
    if(!container)return;
    container.innerHTML='';
    container.className='i18n-selector';
    LANGS.forEach(lang=>{
      const btn=document.createElement('button');
      btn.className='i18n-opt'+(lang.code===_curLang?' active':'');
      btn.dataset.lang=lang.code;
      btn.textContent=lang.label;
      btn.addEventListener('click',()=>switchLang(lang.code));
      container.appendChild(btn);
    });
    // Inject shared styles if not already present
    if(!document.getElementById('i18n-styles')){
      const style=document.createElement('style');
      style.id='i18n-styles';
      style.textContent=`
        .i18n-selector{display:inline-flex;gap:2px;background:rgba(0,0,0,.06);border-radius:100px;padding:2px}
        .i18n-opt{border:none;background:none;padding:4px 10px;font-size:11px;font-weight:600;border-radius:100px;cursor:pointer;color:var(--text3,#999);font-family:inherit;transition:all .2s;-webkit-tap-highlight-color:transparent}
        .i18n-opt:hover{color:var(--text,#333)}
        .i18n-opt.active{background:var(--surface,#fff);color:var(--text,#333);box-shadow:0 1px 3px rgba(0,0,0,.08)}
      `;
      document.head.appendChild(style);
    }
  }

  function init(translations,onSwitch){
    _translations=translations||{};
    _onSwitchCb=onSwitch||null;
    _curLang=detectLang();
    applyToDOM();
  }

  window.I18n={
    init,
    switchLang,
    t,
    renderSelector,
    getCurrentLang:()=>_curLang,
    getSupportedLangs:()=>LANGS,
    applyToDOM
  };
})();
