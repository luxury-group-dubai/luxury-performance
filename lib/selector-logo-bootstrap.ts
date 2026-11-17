// Run while the preview HTML streams, before React hydration. Each logo checks
// only its own images; the end marker prevents revealing half a compound logo.
export const selectorLogoBootstrap = `(function(){
  if(window.__lxpSelectorLogos)return;
  window.__lxpSelectorLogos=true;
  var selector='[data-selector-logo]';
  function reveal(logo){
    if(!logo||logo.dataset.logoLoaded==='true'||!logo.querySelector('[data-selector-logo-end]'))return;
    var images=logo.querySelectorAll('[data-selector-logo-artwork] img');
    if(images.length&&Array.prototype.every.call(images,function(image){return image.complete&&image.naturalWidth>0;}))logo.dataset.logoLoaded='true';
  }
  function scan(node){
    if(node.nodeType!==1)return;
    reveal(node.closest(selector));
    node.querySelectorAll(selector).forEach(reveal);
  }
  document.addEventListener('load',function(event){
    if(event.target instanceof HTMLImageElement)reveal(event.target.closest(selector));
  },true);
  var observer=new MutationObserver(function(records){
    records.forEach(function(record){record.addedNodes.forEach(scan);});
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.querySelectorAll(selector).forEach(reveal);
  document.addEventListener('DOMContentLoaded',function(){
    document.querySelectorAll(selector).forEach(reveal);
    observer.disconnect();
  },{once:true});
})();`;
