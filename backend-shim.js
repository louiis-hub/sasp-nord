(function(){
  if (window.google && window.google.script && window.google.script.run) return;

  var API_URL = String(window.BCSO_API_URL || '').trim();
  var KEY = 'sasp_github_applications';

  function read(){ try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e) { return []; } }
  function write(data){ localStorage.setItem(KEY, JSON.stringify(data)); }
  function makeId(){ return 'GH-' + Date.now().toString(36).toUpperCase(); }
  function normalize(data, id){
    var now = new Date().toLocaleString('fr-FR');
    return {
      id:id,
      date:now,
      statut:'En attente',
      nomRP:data.nomRP || '',
      prenomRP:data.prenomRP || '',
      email:data.email || '',
      pseudoDiscord:data.pseudoDiscord || data.email || '',
      telephoneRP:data.telephoneRP || '',
      permisConduire:data.permisConduire || '',
      experienceForces:data.experienceForces || '',
      qcm:data.qcm || {},
      openQuestions:data.openQuestions || {},
      situations:data.situations || {},
      scores:data.scores || { rp:0, hrp:0, global:0, verdict:'A analyser', forces:[], faiblesses:[] }
    };
  }

  function jsonp(action, params, success, failure) {
    if (!API_URL) return failure(new Error('API Apps Script non configuree.'));
    var cb = '__sasp_cb_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    var qs = new URLSearchParams(params || {});
    qs.set('action', action);
    qs.set('callback', cb);
    var script = document.createElement('script');
    var timer = setTimeout(function(){
      cleanup();
      failure(new Error('Delai depasse avec Apps Script.'));
    }, 12000);
    function cleanup(){
      clearTimeout(timer);
      delete window[cb];
      if (script.parentNode) script.parentNode.removeChild(script);
    }
    window[cb] = function(res){
      cleanup();
      success(res);
    };
    script.onerror = function(){
      cleanup();
      failure(new Error('Impossible de contacter Apps Script.'));
    };
    script.src = API_URL + (API_URL.indexOf('?') === -1 ? '?' : '&') + qs.toString();
    document.head.appendChild(script);
  }

  function postApplication(data, success, failure) {
    if (!API_URL) return saveLocal(data, success, failure);

    var iframeName = 'sasp_submit_' + Date.now();
    var iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.style.display = 'none';
    var form = document.createElement('form');
    form.method = 'POST';
    form.action = API_URL;
    form.target = iframeName;
    form.style.display = 'none';

    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'payload';
    input.value = JSON.stringify(data || {});
    form.appendChild(input);

    document.body.appendChild(iframe);
    document.body.appendChild(form);
    form.submit();

    setTimeout(function(){
      if (form.parentNode) form.parentNode.removeChild(form);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      success({ success:true, id:'SHEET' });
    }, 900);
  }

  function saveLocal(data, success, failure) {
    try {
      var all = read();
      var id = makeId();
      all.push(normalize(data || {}, id));
      write(all);
      success({ success:true, id:id });
    } catch(e) {
      failure(e);
    }
  }

  function runner(){
    var success = function(){};
    var failure = function(err){ console.error(err); };
    var api = {
      withSuccessHandler:function(fn){ success = fn || success; return api; },
      withFailureHandler:function(fn){ failure = fn || failure; return api; },
      validateAdmin:function(user, pass){
        if (API_URL) return jsonp('auth', { username:user, password:pass }, function(res){ success(!!(res && res.valid)); }, failure);
        setTimeout(function(){ success(user === 'admin' && pass === 'saspnord2026'); }, 120);
      },
      submitApplication:function(data){ postApplication(data, success, failure); },
      getApplications:function(){
        if (API_URL) return jsonp('list', {}, success, failure);
        setTimeout(function(){ success({ success:true, data:read().slice().reverse() }); }, 140);
      },
      getRecruitmentStatus:function(){
        if (API_URL) return jsonp('recruitmentStatus', {}, success, failure);
        setTimeout(function(){ success({success:true, status:localStorage.getItem('sasp_recruitment_status') || 'open'}); }, 80);
      },
      setRecruitmentStatus:function(status){
        if (API_URL) return jsonp('setRecruitmentStatus', {status:status}, success, failure);
        localStorage.setItem('sasp_recruitment_status', status);
        setTimeout(function(){ success({success:true, status:status}); }, 80);
      },
      updateStatus:function(id, status){
        if (API_URL) return jsonp('status', { id:id, status:status }, success, failure);
        setTimeout(function(){
          var all = read();
          var item = all.find(function(x){ return x.id === id; });
          if (!item) return success({ success:false, error:'Candidature introuvable' });
          item.statut = status;
          write(all);
          success({ success:true });
        }, 120);
      },
      setStatus:function(id, status){ return api.updateStatus(id, status); }
    };
    return api;
  }

  window.google = { script:{ get run(){ return runner(); } } };
})();
