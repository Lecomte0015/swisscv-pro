/* Import de la photo du CV (générateur de CV, candidature 1 clic, candidatures en masse).
 * Toute photo est convertie dans le navigateur en JPEG de 800 px maximum : poids raisonnable dans le CV
 * enregistré et dans le PDF, et affichage identique partout. Les photos HEIC/HEIF (iPhone) ne sont lisibles
 * nativement que par Safari : pour les autres navigateurs, le décodeur heic2any (hébergé sur le site, chargé
 * seulement dans ce cas) les convertit. La photo ne quitte jamais l'ordinateur pendant cette étape.
 *   swisscvReadPhoto(file).then(dataUrl => …).catch(err => alert(err.message));
 */
(function () {
    'use strict';
    var MAX_SIDE = 800;
    var MAX_BYTES = 25 * 1024 * 1024;
    var HEIC_LIB = '/public/js/vendor/heic2any-0.0.4.min.js';

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

    var heicLoading = null;
    function loadHeicLib() {
        if (window.heic2any) return Promise.resolve(window.heic2any);
        if (!heicLoading) {
            heicLoading = new Promise(function (resolve, reject) {
                var s = document.createElement('script');
                s.src = HEIC_LIB;
                s.onload = function () { window.heic2any ? resolve(window.heic2any) : reject(new Error('heic-lib')); };
                s.onerror = function () { heicLoading = null; reject(new Error('heic-lib')); };
                document.head.appendChild(s);
            });
        }
        return heicLoading;
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
            // 2) HEIC dans Chrome / Firefox / Edge : conversion par heic2any
            return loadHeicLib().then(function (heic2any) {
                return heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
            }).then(function (out) {
                return loadImage(Array.isArray(out) ? out[0] : out);
            }).catch(function () {
                throw new Error('Impossible de lire cette photo HEIC. Exportez-la en JPG (sur iPhone : Réglages › Appareil photo › Formats › « Le plus compatible ») puis réessayez.');
            });
        }).then(function (r) {
            try { return toJpeg(r.img); } finally { URL.revokeObjectURL(r.url); }
        });
    };
})();
