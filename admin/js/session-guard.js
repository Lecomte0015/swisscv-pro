/* Back-office : si le serveur refuse le jeton admin (expiré après 12 h, rôle retiré...), on renvoie vers la
 * connexion au lieu d'afficher des erreurs incompréhensibles. */
(function () {
    var originalFetch = window.fetch;
    window.fetch = function (input) {
        return originalFetch.apply(this, arguments).then(function (res) {
            try {
                var url = typeof input === 'string' ? input : (input && input.url) || '';
                if ((res.status === 401 || res.status === 403) && /\/admin\//.test(url) && !/\/admin\/login/.test(url)) {
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_user');
                    window.location.href = 'admin-login.html';
                }
            } catch (e) { /* ne jamais casser l'appel d'origine */ }
            return res;
        });
    };
})();
