/* Import de la photo du CV (générateur de CV, candidature 1 clic, candidatures en masse).
 * Toute photo est convertie dans le navigateur en JPEG de 800 px maximum : poids raisonnable dans le CV
 * enregistré et dans le PDF, et affichage identique partout. Les photos HEIC/HEIF (iPhone) ne sont lisibles
 * nativement que par Safari : pour les autres navigateurs, le décodeur heic-to (libheif récent, gère les photos
 * en tuiles et HDR des iPhone récents) puis, en secours, heic2any les convertissent. Ces décodeurs sont hébergés sur
 * le site et chargés seulement dans ce cas. La photo ne quitte jamais l'ordinateur pendant cette étape.
 *   swisscvReadPhoto(file).then(dataUrl => …).catch(err => alert(err.message));
 */
(function () {
    'use strict';
    var MAX_SIDE = 800;
    var MAX_BYTES = 25 * 1024 * 1024;
    var HEIC_LIBS = [
        { src: '/public/js/vendor/heic-to-1.6.6.js', name: 'HeicTo', run: function (lib, blob) { return lib({ blob: blob, type: 'image/jpeg', quality: 0.92 }); } },
        { src: '/public/js/vendor/heic2any-0.0.4.min.js', name: 'heic2any', run: function (lib, blob) { return lib({ blob: blob, toType: 'image/jpeg', quality: 0.92 }).then(function (r) { return Array.isArray(r) ? r[0] : r; }); } }
    ];

    function isHeic(file) {
        return /image\/hei[cf]/i.test(file.type || '') || /\.(heic|heif)$/i.test(file.name || '');
    }

    function loadImage(blob) {
        return new Promise(function (resolve, reject) {
            var url = URL.createObjectURL(blob);
            var img = new Image();
            img.onload = function () { resolve({ img: img, url: url }); };
            img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('decode')); };
            img.src = url;
        });
    }

    var loading = {};
    function loadLib(def) {
        if (window[def.name]) return Promise.resolve(window[def.name]);
        if (!loading[def.src]) {
            loading[def.src] = new Promise(function (resolve, reject) {
                var s = document.createElement('script');
                s.src = def.src;
                s.onload = function () { window[def.name] ? resolve(window[def.name]) : reject(new Error('bibliothèque ' + def.name + ' absente')); };
                s.onerror = function () { delete loading[def.src]; reject(new Error('chargement de ' + def.src + ' impossible')); };
                document.head.appendChild(s);
            });
        }
        return loading[def.src];
    }

    // Essaie les décodeurs l'un après l'autre ; la raison de chaque échec est notée dans la console (diagnostic)
    function convertHeic(file) {
        var i = 0;
        function next(lastErr) {
            if (i >= HEIC_LIBS.length) return Promise.reject(lastErr || new Error('aucun décodeur'));
            var def = HEIC_LIBS[i++];
            return loadLib(def).then(function (lib) { return def.run(lib, file); }).then(loadImage).catch(function (err) {
                try { console.warn('[photo] décodage HEIC par ' + def.name + ' en échec :', err && (err.message || err.code || err)); } catch (e) { /* ignore */ }
                return next(err);
            });
        }
        return next();
    }

    function toJpeg(img) {
        var w = img.naturalWidth, h = img.naturalHeight;
        var k = Math.min(1, MAX_SIDE / Math.max(w, h));
        var canvas = document.createElement('canvas');
        canvas.width = Math.round(w * k);
        canvas.height = Math.round(h * k);
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF'; // fond blanc pour les PNG transparents
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.88);
    }

    window.swisscvReadPhoto = function (file) {
        if (!file) return Promise.reject(new Error('Aucun fichier sélectionné.'));
        if (file.size > MAX_BYTES) return Promise.reject(new Error('Cette photo est trop lourde (25 Mo au maximum).'));
        if (file.type && !/^image\//i.test(file.type) && !isHeic(file)) return Promise.reject(new Error('Ce fichier n\'est pas une image. Choisissez une photo (JPG, PNG, HEIC…).'));
        // 1) décodage natif (JPG, PNG, WebP partout ; HEIC dans Safari)
        return loadImage(file).catch(function () {
            if (!isHeic(file)) throw new Error('Ce format de photo n\'est pas pris en charge. Choisissez une photo JPG ou PNG.');
            // 2) HEIC dans Chrome / Firefox / Edge : heic-to, puis heic2any en secours
            return convertHeic(file).catch(function () {
                throw new Error('Impossible de lire cette photo HEIC. Exportez-la en JPG (sur iPhone : Réglages › Appareil photo › Formats › « Le plus compatible ») puis réessayez.');
            });
        }).then(function (r) {
            try { return toJpeg(r.img); } finally { URL.revokeObjectURL(r.url); }
        });
    };
})();
