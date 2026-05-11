/* =====================================================================
   BraSCORE — Módulo de Autenticação (Frontend, modo demonstração)
   ---------------------------------------------------------------------
   ATENÇÃO: Esta camada é VISUAL / DE ESQUELETO. A autenticação real,
   o hash de senhas, o controle de sessão e o registro persistente de
   logs/auditoria precisam de um BACKEND (PHP+MySQL, Supabase, Firebase
   ou similar). Quando o servidor de dados estiver disponível, basta
   substituir as funções demoLogin() e o uso de localStorage por
   chamadas reais à API.

   CONTROLE DE ACESSO (whitelist):
   - AUTHORIZED_EMAILS abaixo é a fonte de verdade — só esses e-mails
     podem entrar na área restrita.
   - Para adicionar/remover acesso de forma permanente, edite a lista
     abaixo e faça um commit no Git.
   - A coordenadora também pode adicionar usuários TEMPORÁRIOS pelo
     painel admin (ficam apenas no navegador onde foram adicionados).
   ===================================================================== */

(function () {
  'use strict';

  const KEYS = {
    SESSION: 'brascore.session',
    ADMIN_EMAIL: 'brascore.adminEmail',
    USERS: 'brascore.users',
    LOGS: 'brascore.logs',
    AUDIT: 'brascore.audit'
  };

  const DEFAULT_ADMIN = 'estatisticanasaude@gmail.com';
  const CONTACT_EMAIL = 'biancamaglia@alumni.usp.br'; // e-mail mostrado em mensagens de bloqueio

  // ===== LISTA OFICIAL DE E-MAILS AUTORIZADOS =====
  // Sempre em letras minúsculas. Para adicionar alguém de forma permanente,
  // inclua aqui e faça commit no repositório.
  const AUTHORIZED_EMAILS = [
    'estatisticanasaude@gmail.com',           // Coordenadora
    'gibranrf@yahoo.com.br',
    'eccorcuiaba@yahoo.com',
    'kalil.renato@gmail.com',
    'pesquisaclinica@cardiologia.org.br',
    'cintialiberato.hana@hotmail.com',
    'isameal@hotmail.com',
    'omar.mejia@incor.usp.br',
    'marcoapoliveira@uol.com.br',
    'camilapsarthur@gmail.com',
    'drmarioissa@yahoo.com.br',
    'melina.mb@hotmail.com',
    'fernando@imip.org.br',
    'rafaela.silva@imip.org.br',
    'mariany.imip.cardio@hotmail.com',
    'luizrafael_pc@hotmail.com',
    'gustavo_guerreiro@hotmail.com',
    'mgtiveron@gmail.com',
    'mgtiveron@yahoo.com.br',
    'alexmenezes@hotmail.com',
    'ricardo.lima@upe.br',
    'vinicius.nina@ufma.br',
    'pgsc.campos@discente.ufma.br',
    'tamarautam_menezes@hotmail.com',
    'marcel.portela@discente.ufma.br',
    'welson.sousa@discente.ufma.br',
    'erik.victor@discente.ufma.br',
    'glauber.miranda@discente.ufma.br',
    'lm.castro@discente.ufma.br',
    'brascore.huufma@gmail.com',
    'diegopgandrade@gmail.com',
    'rsegalote@gmail.com',
    'marciabdefreitas@gmail.com',
    'bcb0014@gmail.com',
    'renata_jesus_esteves@hotmail.com',
    'cirurgia.cardiaccare@gmail.com',
    'cristianeleta.hsf@alsf.org.br',
    'maurilio.od@gmail.com',
    'werylane@gmail.com',
    'maikonmadeira@gmail.com',
    'guscs@icloud.com',
    'evtnhiraiwa@gmail.com',
    'ccvmarieta@gmail.com',
    'mateusbueno@gmail.com',
    'intensivahaccr@gmail.com',
    'murillo_antunes@terra.com.br',
    'mariana.goncalves.husf@gmail.com',
    'alice2003garciacamargo@gmail.com',
    'isalugli1@gmail.com',
    'debora.addantas@hrj.org.br',
    'danilo.fcduarte@hrj.org.br',
    'timerocha1@gmail.com',
    'vanessapesciotto@gmail.com',
    'rafaeltineli@gmail.com',
    'fhjsil@yahoo.com.br',
    'kaytiussia.sena@ictdf.org.br',
    'elsonblima@gmail.com',
    'manakazone@gmail.com',
    'valpelisser@terra.com.br',
    'micalay@hotmail.com',
    'henricoutinho@gmail.com',
    'dr.alexandrezilli@gmail.com',
    'limongi_carol@hotmail.com',
    'leilanogueirabarros@gmail.com',
    'davson.jbcs@gmail.com',
    'clgelape@uol.com.br',
    'alfredo@fmrp.usp.br',
    'fabianojuca@gmail.com',
    'frosanece@gmail.com',
    'danielli.lino.hm@gmail.com',
    'cardiologiahf1@gmail.com',
    'gabrielazlruiz@gmail.com',
    'sallesfb@gmail.com',
    'jorgeluismed@me.com',
    'caroline.l.m.med@gmail.com'
  ];

  // Inicialização — só na primeira visita
  function init() {
    if (!localStorage.getItem(KEYS.ADMIN_EMAIL)) {
      localStorage.setItem(KEYS.ADMIN_EMAIL, DEFAULT_ADMIN);
    }
    if (!localStorage.getItem(KEYS.LOGS))  localStorage.setItem(KEYS.LOGS,  JSON.stringify([]));
    if (!localStorage.getItem(KEYS.AUDIT)) localStorage.setItem(KEYS.AUDIT, JSON.stringify([]));

    // Sincroniza a lista de USERS com a whitelist hardcoded.
    // - Garante que toda autorização permanente apareça no painel.
    // - Mantém usuários adicionados temporariamente pelo painel.
    const current = readUsers();
    const map = new Map(current.map(u => [u.email.toLowerCase(), u]));
    AUTHORIZED_EMAILS.forEach(em => {
      const lo = em.toLowerCase();
      if (!map.has(lo)) {
        map.set(lo, {
          email: lo,
          name: emailToName(lo),
          role: (lo === DEFAULT_ADMIN.toLowerCase()) ? 'coordenador' : 'pesquisador',
          createdAt: new Date(2024, 0, 1).toISOString(),
          active: true,
          source: 'whitelist'
        });
      } else {
        // marca origem como whitelist se ainda não estiver marcado
        const u = map.get(lo);
        u.source = u.source || 'whitelist';
      }
    });
    writeUsers([...map.values()]);
  }

  function emailToName(email) {
    const local = String(email).split('@')[0];
    return local.split(/[._-]+/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  }

  // Helpers
  function read(k)  { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function write(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  function readUsers()  { return read(KEYS.USERS) || []; }
  function writeUsers(v){ write(KEYS.USERS, v); }

  function log(type, detail) {
    const arr = read(KEYS.LOGS) || [];
    arr.unshift({ ts: new Date().toISOString(), type, detail, user: getSession()?.email || 'anon' });
    write(KEYS.LOGS, arr.slice(0, 500));
  }

  function audit(action, target, before, after) {
    const arr = read(KEYS.AUDIT) || [];
    arr.unshift({
      ts: new Date().toISOString(),
      action, target,
      before: before == null ? null : String(before),
      after:  after  == null ? null : String(after),
      by: getSession()?.email || 'anon'
    });
    write(KEYS.AUDIT, arr.slice(0, 500));
  }

  // ===== Sessão =====
  function getSession() {
    try { return JSON.parse(sessionStorage.getItem(KEYS.SESSION) || 'null'); } catch (e) { return null; }
  }
  function setSession(s) {
    if (s) sessionStorage.setItem(KEYS.SESSION, JSON.stringify(s));
    else   sessionStorage.removeItem(KEYS.SESSION);
  }

  function isAuthorized(emailLower) {
    if (AUTHORIZED_EMAILS.includes(emailLower)) return true;
    const u = readUsers().find(x => x.email.toLowerCase() === emailLower);
    return !!(u && u.active);
  }

  function isActive(emailLower) {
    const u = readUsers().find(x => x.email.toLowerCase() === emailLower);
    if (!u) return true; // ainda não está no localStorage (whitelist pura): considera ativo
    return u.active !== false;
  }

  // Login em modo demonstração — exige e-mail na whitelist OU adicionado pelo
  // painel admin. Aceita qualquer senha de 4+ caracteres por enquanto.
  function demoLogin(email, password) {
    init();
    email = String(email || '').trim().toLowerCase();
    password = String(password || '');
    if (!email || !email.includes('@')) {
      log('login.fail', `Tentativa com e-mail inválido: ${email}`);
      return { ok: false, msg: 'E-mail inválido.' };
    }
    if (password.length < 4) {
      return { ok: false, msg: 'Senha precisa ter ao menos 4 caracteres.' };
    }
    if (!isAuthorized(email)) {
      log('login.denied', `Acesso negado para ${email} (fora da whitelist)`);
      return {
        ok: false,
        denied: true,
        msg: `Acesso negado. Este e-mail não está autorizado. Solicite cadastro à coordenação: ${CONTACT_EMAIL}`
      };
    }
    if (!isActive(email)) {
      log('login.denied', `Acesso negado para ${email} (usuário inativo)`);
      return {
        ok: false,
        denied: true,
        msg: `Seu acesso está temporariamente desativado. Contate a coordenação: ${CONTACT_EMAIL}`
      };
    }

    const adminEmail = (localStorage.getItem(KEYS.ADMIN_EMAIL) || DEFAULT_ADMIN).toLowerCase();
    const isAdmin = email === adminEmail;

    // se foi autorizado mas ainda não está no diretório (caso raro), cadastra
    const users = readUsers();
    if (!users.find(u => u.email.toLowerCase() === email)) {
      users.push({
        email,
        name: emailToName(email),
        role: isAdmin ? 'coordenador' : 'pesquisador',
        createdAt: new Date().toISOString(),
        active: true,
        source: 'whitelist'
      });
      writeUsers(users);
    }

    setSession({ email, isAdmin, loginAt: new Date().toISOString() });
    log('login.ok', `Login de ${email}${isAdmin ? ' (coordenador)' : ''}`);
    return { ok: true, isAdmin };
  }

  function logout() {
    const s = getSession();
    if (s) log('logout', `Encerramento de sessão de ${s.email}`);
    setSession(null);
  }

  function requireAuth(redirectTo) {
    const s = getSession();
    if (!s) {
      const back = encodeURIComponent(location.pathname + location.hash);
      location.href = (redirectTo || 'login.html') + '?next=' + back;
      return null;
    }
    return s;
  }

  function requireAdmin() {
    const s = requireAuth();
    if (!s) return null;
    if (!s.isAdmin) {
      alert('Acesso restrito ao coordenador do projeto.');
      location.href = 'restrito.html';
      return null;
    }
    return s;
  }

  // ===== Admin / coordenador =====
  function getAdminEmail() { return localStorage.getItem(KEYS.ADMIN_EMAIL) || DEFAULT_ADMIN; }

  function setAdminEmail(newEmail) {
    newEmail = String(newEmail || '').trim().toLowerCase();
    if (!newEmail.includes('@')) return { ok: false, msg: 'E-mail inválido.' };
    const old = getAdminEmail();
    localStorage.setItem(KEYS.ADMIN_EMAIL, newEmail);

    // garante que o novo coordenador esteja nos USERS e ativo
    const users = readUsers();
    let u = users.find(x => x.email.toLowerCase() === newEmail);
    if (!u) {
      u = { email: newEmail, name: emailToName(newEmail), role: 'coordenador', createdAt: new Date().toISOString(), active: true, source: 'painel' };
      users.push(u);
    } else {
      u.role = 'coordenador';
      u.active = true;
    }
    writeUsers(users);

    audit('admin.email.changed', 'coordenador', old, newEmail);
    log('admin.changed', `Coordenador alterado: ${old} → ${newEmail}`);
    const s = getSession();
    if (s && s.email === old) setSession(null);
    return { ok: true };
  }

  function listUsers() { return readUsers(); }

  function setUserActive(email, active) {
    const users = readUsers();
    const u = users.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!u) return false;
    const before = u.active;
    u.active = !!active;
    writeUsers(users);
    audit('user.active.changed', email, before, u.active);
    return true;
  }

  function addUser(email, name, role) {
    email = String(email || '').trim().toLowerCase();
    if (!email.includes('@')) return { ok: false, msg: 'E-mail inválido.' };
    const users = readUsers();
    if (users.find(u => u.email.toLowerCase() === email)) return { ok: false, msg: 'Já cadastrado.' };
    users.push({
      email,
      name: name || emailToName(email),
      role: role || 'pesquisador',
      createdAt: new Date().toISOString(),
      active: true,
      source: 'painel'
    });
    writeUsers(users);
    audit('user.created', email, null, role || 'pesquisador');
    return { ok: true };
  }

  function removeUser(email) {
    email = String(email || '').toLowerCase();
    if (email === getAdminEmail().toLowerCase()) return false;
    // não permite remover quem está na whitelist hardcoded (somente desativar)
    if (AUTHORIZED_EMAILS.includes(email)) return false;
    const users = readUsers().filter(u => u.email.toLowerCase() !== email);
    writeUsers(users);
    audit('user.removed', email, 'existente', null);
    return true;
  }

  function isWhitelisted(email) {
    return AUTHORIZED_EMAILS.includes(String(email || '').toLowerCase());
  }

  function getLogs()  { return read(KEYS.LOGS)  || []; }
  function getAudit() { return read(KEYS.AUDIT) || []; }
  function clearLogs()  { write(KEYS.LOGS, []);  audit('logs.cleared', 'logs', null, null); }
  function clearAudit() { write(KEYS.AUDIT, []); }

  // Export
  window.BraAuth = {
    init, getSession, demoLogin, logout, requireAuth, requireAdmin,
    getAdminEmail, setAdminEmail,
    listUsers, setUserActive, addUser, removeUser, isWhitelisted,
    getLogs, getAudit, clearLogs, clearAudit,
    log, audit,
    CONTACT_EMAIL,
    AUTHORIZED_COUNT: AUTHORIZED_EMAILS.length
  };

  init();
})();
