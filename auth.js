/* =====================================================================
   BraSCORE — Módulo de Autenticação (Frontend, modo demonstração)
   ---------------------------------------------------------------------
   ATENÇÃO: Esta camada é VISUAL / DE ESQUELETO. A autenticação real,
   o hash de senhas, o controle de sessão e o registro persistente de
   logs/auditoria precisam de um BACKEND (PHP+MySQL, Supabase, Firebase
   ou similar). Quando o servidor de dados estiver disponível, basta
   substituir as funções demoLogin() e o uso de localStorage por
   chamadas reais à API. As demais páginas (login.html, restrito.html,
   admin.html) consomem somente as funções públicas deste arquivo.
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

  // Inicialização — só na primeira visita
  function init() {
    if (!localStorage.getItem(KEYS.ADMIN_EMAIL)) {
      localStorage.setItem(KEYS.ADMIN_EMAIL, DEFAULT_ADMIN);
    }
    if (!localStorage.getItem(KEYS.USERS)) {
      const seed = [
        { email: DEFAULT_ADMIN, name: 'Bianca M. Maglia Orlandi', role: 'coordenador', createdAt: new Date().toISOString(), active: true },
        { email: 'omar.mejia@incor.usp.br', name: 'Omar Mejía', role: 'pesquisador', createdAt: new Date().toISOString(), active: true },
        { email: 'camila.arthur@bp.org.br', name: 'Camila P. S. Arthur', role: 'pesquisador', createdAt: new Date().toISOString(), active: true }
      ];
      localStorage.setItem(KEYS.USERS, JSON.stringify(seed));
    }
    if (!localStorage.getItem(KEYS.LOGS)) localStorage.setItem(KEYS.LOGS, JSON.stringify([]));
    if (!localStorage.getItem(KEYS.AUDIT)) localStorage.setItem(KEYS.AUDIT, JSON.stringify([]));
  }

  // Helpers
  function read(k)  { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function write(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

  function log(type, detail) {
    const arr = read(KEYS.LOGS) || [];
    arr.unshift({ ts: new Date().toISOString(), type, detail, user: getSession()?.email || 'anon' });
    write(KEYS.LOGS, arr.slice(0, 500)); // limite circular
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

  // Demo: aceita qualquer e-mail + senha de 4+ caracteres. Marca admin se
  // o e-mail coincidir com o adminEmail vigente.
  function demoLogin(email, password) {
    init();
    email = String(email || '').trim().toLowerCase();
    password = String(password || '');
    if (!email || !email.includes('@')) return { ok: false, msg: 'E-mail inválido.' };
    if (password.length < 4) return { ok: false, msg: 'Senha precisa ter ao menos 4 caracteres.' };

    const adminEmail = (localStorage.getItem(KEYS.ADMIN_EMAIL) || DEFAULT_ADMIN).toLowerCase();
    const isAdmin = email === adminEmail;

    // garante usuário no diretório
    const users = read(KEYS.USERS) || [];
    if (!users.find(u => u.email.toLowerCase() === email)) {
      users.push({ email, name: email.split('@')[0], role: isAdmin ? 'coordenador' : 'visitante', createdAt: new Date().toISOString(), active: true });
      write(KEYS.USERS, users);
      audit('user.created', email, null, 'auto-cadastro no login demo');
    }

    setSession({ email, isAdmin, loginAt: new Date().toISOString() });
    log('login.ok', `Login demo de ${email}${isAdmin ? ' (coordenador)' : ''}`);
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
    audit('admin.email.changed', 'coordenador', old, newEmail);
    log('admin.changed', `Coordenador alterado: ${old} → ${newEmail}`);
    // se a sessão atual era do admin antigo, encerra para forçar reentrada
    const s = getSession();
    if (s && s.email === old) setSession(null);
    return { ok: true };
  }

  function listUsers() { return read(KEYS.USERS) || []; }
  function setUserActive(email, active) {
    const users = listUsers();
    const u = users.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!u) return false;
    const before = u.active;
    u.active = !!active;
    write(KEYS.USERS, users);
    audit('user.active.changed', email, before, u.active);
    return true;
  }
  function removeUser(email) {
    if (email.toLowerCase() === getAdminEmail().toLowerCase()) return false;
    const users = listUsers().filter(u => u.email.toLowerCase() !== email.toLowerCase());
    write(KEYS.USERS, users);
    audit('user.removed', email, 'existente', null);
    return true;
  }

  function getLogs()  { return read(KEYS.LOGS)  || []; }
  function getAudit() { return read(KEYS.AUDIT) || []; }

  function clearLogs()  { write(KEYS.LOGS, []);  audit('logs.cleared', 'logs', null, null); }
  function clearAudit() { write(KEYS.AUDIT, []); }

  // Export
  window.BraAuth = {
    init, getSession, demoLogin, logout, requireAuth, requireAdmin,
    getAdminEmail, setAdminEmail,
    listUsers, setUserActive, removeUser,
    getLogs, getAudit, clearLogs, clearAudit,
    log, audit
  };

  init();
})();
