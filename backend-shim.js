(function(){
  if (window.google && window.google.script && window.google.script.run) return;

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
      telephoneRP:data.telephoneRP || '',
      permisConduire:data.permisConduire || '',
      experienceForces:data.experienceForces || '',
      qcm:data.qcm || {},
      openQuestions:data.openQuestions || {},
      situations:data.situations || {},
      scores:data.scores || { total:0, verdict:'A analyser', forces:[], faiblesses:[] }
    };
  }

  function runner(){
    var success = function(){};
    var failure = function(err){ console.error(err); };
    var api = {
      withSuccessHandler:function(fn){ success = fn || success; return api; },
      withFailureHandler:function(fn){ failure = fn || failure; return api; },
      validateAdmin:function(user, pass){ setTimeout(function(){ success(user === 'admin' && pass === 'saspnord2026'); }, 120); },
      submitApplication:function(data){
        setTimeout(function(){
          try {
            var all = read();
            var id = makeId();
            all.push(normalize(data || {}, id));
            write(all);
            success({ success:true, id:id });
          } catch(e) { failure(e); }
        }, 180);
      },
      getApplications:function(){ setTimeout(function(){ success({ success:true, data:read().slice().reverse() }); }, 140); },
      setStatus:function(id, status){
        setTimeout(function(){
          var all = read();
          var item = all.find(function(x){ return x.id === id; });
          if (!item) return success({ success:false, error:'Candidature introuvable' });
          item.statut = status;
          write(all);
          success({ success:true });
        }, 120);
      }
    };
    return api;
  }

  window.google = { script:{ get run(){ return runner(); } } };
})();
