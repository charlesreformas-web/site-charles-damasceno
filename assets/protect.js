(function(){
  'use strict';
  document.addEventListener('contextmenu',function(e){if(e.target.closest('img'))e.preventDefault()},{passive:false});
  document.addEventListener('dragstart',function(e){if(e.target.closest('img'))e.preventDefault()},{passive:false});
})();
