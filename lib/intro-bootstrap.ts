// Play the full entrance once per tab session. Later visits can paint immediately.
// Progressive enhancement: unavailable storage or scripting leaves the site visible.
export const introBootstrap = `(function(){try{
  var root=document.documentElement;
  var key='lxp:intro-played:v1';
  if(location.pathname==='/shop'||location.pathname==='/shop/'||location.pathname.indexOf('/partners/')===0){history.scrollRestoration='auto';return;}
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){history.scrollRestoration='auto';return;}
  if(sessionStorage.getItem(key)==='1'){history.scrollRestoration='auto';return;}
  sessionStorage.setItem(key,'1');
  var nav=performance.getEntriesByType('navigation')[0];
  if(nav&&nav.type==='reload'){
    root.dataset.lxpReload='true';
    history.scrollRestoration='manual';
    if(location.hash)history.replaceState(history.state,'',location.pathname+location.search);
    scrollTo({top:0,left:0,behavior:'instant'});
    addEventListener('pageshow',function(){scrollTo({top:0,left:0,behavior:'instant'});},{once:true});
  }
  var introDeadline=location.pathname==='/'&&matchMedia('(max-width: 700px)').matches?performance.now()+2200:0;
  root.dataset.lxpIntro='tracing';
  if(introDeadline)root.dataset.lxpIntroDeadline=String(introDeadline);
  setTimeout(function(){
    delete root.dataset.lxpIntro;
    delete root.dataset.lxpIntroDeadline;
    if(introDeadline){var shell=document.getElementById('site-shell');if(shell)shell.removeAttribute('inert');}
    if(root.dataset.lxpReload==='true'){delete root.dataset.lxpReload;history.scrollRestoration='auto';}
  },introDeadline?2200:5000);
}catch(e){
  if(document.documentElement.dataset.lxpReload==='true')history.scrollRestoration='auto';
  delete document.documentElement.dataset.lxpIntro;delete document.documentElement.dataset.lxpIntroDeadline;delete document.documentElement.dataset.lxpReload;
}})()`;
