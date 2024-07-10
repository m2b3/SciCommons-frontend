if (!self.define) {
  let e,
    a = {};
  const s = (s, n) => (
    (s = new URL(s + '.js', n).href),
    a[s] ||
      new Promise((a) => {
        if ('document' in self) {
          const e = document.createElement('script');
          (e.src = s), (e.onload = a), document.head.appendChild(e);
        } else (e = s), importScripts(s), a();
      }).then(() => {
        let e = a[s];
        if (!e) throw new Error(`Module ${s} didn’t register its module`);
        return e;
      })
  );
  self.define = (n, i) => {
    const c = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (a[c]) return;
    let o = {};
    const r = (e) => s(e, c),
      t = { module: { uri: c }, exports: o, require: r };
    a[c] = Promise.all(n.map((e) => t[e] || r(e))).then((e) => (i(...e), o));
  };
}
define(['./workbox-c2c0676f'], function (e) {
  'use strict';
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '/_next/static/VgO8RR7y0NLKouk-5pW9Q/_buildManifest.js',
          revision: '3e2d62a10f4d6bf0b92e14aecf7836f4',
        },
        {
          url: '/_next/static/VgO8RR7y0NLKouk-5pW9Q/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/0e5ce63c-599777d16caf1818.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        { url: '/_next/static/chunks/118-4ee21d54e462b7df.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/1829-63457f32f5e65894.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/2227-692bce25314391ef.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/2403-489fa6c07ab3f5f3.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/2524-3cdaa5ba72f5f658.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/2535-003f58d0cb9108ec.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/3067-bce1f1af280a4234.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/3255-2c31e43238a26853.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/3260-c60ea4210b0cbc48.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/3610-7052a8eea0624401.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/4255-ef4b6c0d1c8cdcea.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/5428-d363e107447dca2f.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        {
          url: '/_next/static/chunks/54a60aa6-958d9a409187b4d8.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        { url: '/_next/static/chunks/5530-9b0acce4804ea2d7.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/5651-60736b91d4e75972.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/6151-28bca5c867940437.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/6300-869dc042b17a69e1.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/6381-4e674faf76d70333.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/6502-9177233c1acd2dba.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/6648-9c8e81a1fd032ec6.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/6832-31684e176727ba38.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/6893-8237d4df49040501.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        {
          url: '/_next/static/chunks/70e0d97a-2d01882bb9f05ef7.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        { url: '/_next/static/chunks/7138-b7fc64d778b97d2e.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/8170-a080a0869b25de46.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/8228-c12d4adc96a8e5bd.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/8451-b0548d2dc03fd8a6.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/8502-b4dbebe03c3af00a.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/8726-1aa95abd107548ce.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/9099-dc1b8f3b2c7dde09.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/9343-622c1758fad68ad6.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        { url: '/_next/static/chunks/9885-e95062138788530c.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        {
          url: '/_next/static/chunks/app/(authentication)/auth/activate/%5Btoken%5D/page-e535f4a1ad8011c7.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(authentication)/auth/forgotpassword/page-dcd9b7dd8641697d.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(authentication)/auth/login/page-59bd1864f22ac0b3.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(authentication)/auth/register/page-c4826e906224910b.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(authentication)/auth/resendverificationemail/page-f4e4575e4a20c43f.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(authentication)/auth/resetpassword/%5Btoken%5D/page-c7a24fad5a904437.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(authentication)/auth/signupsuccess/page-c5dbcd2d784eb07b.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(home)/page-d5532b3168164a4f.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/article/%5Bslug%5D/(articledashboard)/community-stats/page-91f5dc751f3362e2.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/article/%5Bslug%5D/(articledashboard)/layout-a32040f01774a246.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/article/%5Bslug%5D/(articledashboard)/notifications/page-f8c02efb073e2fa9.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/article/%5Bslug%5D/(articledashboard)/official-stats/page-67cdfc4632495a60.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/article/%5Bslug%5D/(articledashboard)/settings/page-52535123733fb076.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/article/%5Bslug%5D/(articledashboard)/submit/page-020ce2232963c7da.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/article/%5Bslug%5D/(displayarticle)/page-1ce5fbc0d970ae70.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/articles/page-8a1cb9a23f3b4a0b.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/submitarticle/page-977132d63307422e.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/communities/page-084e356c8fe09643.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(admin)/dashboard/page-8f83e952df89e88f.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(admin)/invite/page-644c80b856baf556.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(admin)/layout-8bff0ddc35684808.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(admin)/preferences/page-d238a0dc9e2c881e.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(admin)/requests/page-c1ab32014b38ff46.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(admin)/roles/page-a47adf323899839f.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(admin)/submissions/page-166f55b793d783e8.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(displaycommunity)/page-9fe000ae2c2ee2e5.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/articles/%5BpostId%5D/page-3bb600948179e0dd.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/createcommunityarticle/page-2a01fb24228e87cd.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/invitations/registered/%5Binvitation_id%5D/page-da63406c1d662ea3.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/invitations/unregistered/%5Binvitation_id%5D/%5Bsigned_email%5D/page-a6f570e802caa76f.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/createcommunity/page-10fafaa0b57a9b6d.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(posts)/posts/%5BpostId%5D/page-4295e1bee714e134.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(posts)/posts/createpost/page-28f3e2b5a01fe513.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(posts)/posts/page-5d26e3def616a8ee.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(users)/mycontributions/page-3bc27db83d3ea0a9.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(users)/myprofile/page-ea991000bc1cecc5.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/(users)/notifications/page-346f3e3cca9038fa.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/(main)/layout-d0cbff589592bb7e.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-13bb9acdb0103dba.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/app/layout-b5c8dca0d87efe6e.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/fd9d1056-376cd1900f1dcb63.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/framework-8e0e0f4a6b83a956.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        { url: '/_next/static/chunks/main-03436996b095c1f1.js', revision: 'VgO8RR7y0NLKouk-5pW9Q' },
        {
          url: '/_next/static/chunks/main-app-b59546500c0da029.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/pages/_app-f870474a17b7f2fd.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/pages/_error-c66a4e8afc46f17b.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        {
          url: '/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js',
          revision: '79330112775102f91e1010318bae2bd3',
        },
        {
          url: '/_next/static/chunks/webpack-0e59933ffef68f43.js',
          revision: 'VgO8RR7y0NLKouk-5pW9Q',
        },
        { url: '/_next/static/css/2f71e0d51b6954c9.css', revision: '2f71e0d51b6954c9' },
        { url: '/_next/static/css/73efd49010ba2717.css', revision: '73efd49010ba2717' },
        {
          url: '/_next/static/media/05a31a2ca4975f99-s.woff2',
          revision: 'f1b44860c66554b91f3b1c81556f73ca',
        },
        {
          url: '/_next/static/media/513657b02c5c193f-s.woff2',
          revision: 'c4eb7f37bc4206c901ab08601f21f0f2',
        },
        {
          url: '/_next/static/media/51ed15f9841b9f9d-s.woff2',
          revision: 'bb9d99fb9bbc695be80777ca2c1c2bee',
        },
        {
          url: '/_next/static/media/c9a5bc6a7c948fb0-s.p.woff2',
          revision: '74c3556b9dad12fb76f84af53ba69410',
        },
        {
          url: '/_next/static/media/d6b16ce4a6175f26-s.woff2',
          revision: 'dd930bafc6297347be3213f22cc53d3e',
        },
        {
          url: '/_next/static/media/ec159349637c90ad-s.woff2',
          revision: '0e89df9522084290e01e4127495fae99',
        },
        {
          url: '/_next/static/media/fd4db3eb5472fc27-s.woff2',
          revision: '71f3fcaf22131c3368d9ec28ef839831',
        },
        {
          url: '/appIcons/android/android-launchericon-144-144.png',
          revision: 'ee6563d0d825556ae081829b0ab14400',
        },
        {
          url: '/appIcons/android/android-launchericon-192-192.png',
          revision: 'a46683c5a6b98c6764d212493fe3ea49',
        },
        {
          url: '/appIcons/android/android-launchericon-48-48.png',
          revision: 'f34020158fe09ef2b07b42a8534121a8',
        },
        {
          url: '/appIcons/android/android-launchericon-512-512.png',
          revision: '2ad8e7b8fcab7aed25e7feacae6c845e',
        },
        {
          url: '/appIcons/android/android-launchericon-72-72.png',
          revision: '223e8f7a40c7de5b01c0f241c14f0b2b',
        },
        {
          url: '/appIcons/android/android-launchericon-96-96.png',
          revision: 'd13da72e68157333ff9e4c9753f88316',
        },
        { url: '/appIcons/ios/100.png', revision: '809455175efe81cb867c8f89dbd2be61' },
        { url: '/appIcons/ios/1024.png', revision: '16ac31cea1f28d6c3683736d727b753d' },
        { url: '/appIcons/ios/114.png', revision: 'bccf0e8d5026187922293650d06801c4' },
        { url: '/appIcons/ios/120.png', revision: 'd94e01603d8dea33d615053dac82c87e' },
        { url: '/appIcons/ios/128.png', revision: '78ccf947fee35ff64af092bbf4f5d3d5' },
        { url: '/appIcons/ios/144.png', revision: 'ee6563d0d825556ae081829b0ab14400' },
        { url: '/appIcons/ios/152.png', revision: '492964e409a8fcc9e3074a6fdbb3cd32' },
        { url: '/appIcons/ios/16.png', revision: '16991ad63f407b9ba90da7083da4330b' },
        { url: '/appIcons/ios/167.png', revision: 'dcc104e59d4c77ddba59116e26b7531b' },
        { url: '/appIcons/ios/180.png', revision: 'f4863e362296a8dd11494aaf61ef9c08' },
        { url: '/appIcons/ios/192.png', revision: 'a46683c5a6b98c6764d212493fe3ea49' },
        { url: '/appIcons/ios/20.png', revision: '15fad33b2e16d1a572d2f986b0e92ef7' },
        { url: '/appIcons/ios/256.png', revision: '7086879df0f3f6850f194c2dec926582' },
        { url: '/appIcons/ios/29.png', revision: 'e37874700fbe15820427d9078e4b1034' },
        { url: '/appIcons/ios/32.png', revision: 'ad92fb7cba3646d27dcb6ed4c47c642d' },
        { url: '/appIcons/ios/40.png', revision: '02e83d83504fcab1b9a498c70dc54297' },
        { url: '/appIcons/ios/50.png', revision: '232ecd24f746ac8a1d95e97799abc0f3' },
        { url: '/appIcons/ios/512.png', revision: '2ad8e7b8fcab7aed25e7feacae6c845e' },
        { url: '/appIcons/ios/57.png', revision: 'c3962b4acea77936de1a8ff3fbb2df33' },
        { url: '/appIcons/ios/58.png', revision: 'a224d9f7011610f7328f459b81f7513c' },
        { url: '/appIcons/ios/60.png', revision: '950dd075ead6dc9bf5e7319bd1e43e02' },
        { url: '/appIcons/ios/64.png', revision: 'fdd16521e27c0fa48681a28cef67c527' },
        { url: '/appIcons/ios/72.png', revision: '223e8f7a40c7de5b01c0f241c14f0b2b' },
        { url: '/appIcons/ios/76.png', revision: '7c0401baac61eab0670ef03c5d1239de' },
        { url: '/appIcons/ios/80.png', revision: '77bf2acd8e09ca6ab1b139d53aa92a10' },
        { url: '/appIcons/ios/87.png', revision: '129458a731ef4ab97d693d9e1c718c03' },
        {
          url: '/appIcons/windows11/LargeTile.scale-100.png',
          revision: '80015f16eb8f82af29b9ec390a49a241',
        },
        {
          url: '/appIcons/windows11/LargeTile.scale-125.png',
          revision: '271700da0b60edac80a4fb541e09e0ef',
        },
        {
          url: '/appIcons/windows11/LargeTile.scale-150.png',
          revision: 'e0062d3ab62c29067b98928f5b1a0372',
        },
        {
          url: '/appIcons/windows11/LargeTile.scale-200.png',
          revision: 'b080b90594274d63759c0c8605292140',
        },
        {
          url: '/appIcons/windows11/LargeTile.scale-400.png',
          revision: 'b5381612ef8a6cf046e33e46337a7b39',
        },
        {
          url: '/appIcons/windows11/SmallTile.scale-100.png',
          revision: '3224f9a598b049a2bc5d6b828ddfb766',
        },
        {
          url: '/appIcons/windows11/SmallTile.scale-125.png',
          revision: '255d6e11cbaa1b133c94785c2394bc3f',
        },
        {
          url: '/appIcons/windows11/SmallTile.scale-150.png',
          revision: '76dcef1dbcdd69680d360128352f2080',
        },
        {
          url: '/appIcons/windows11/SmallTile.scale-200.png',
          revision: '6c84bbc082c7427d42f3c6c23f43210f',
        },
        {
          url: '/appIcons/windows11/SmallTile.scale-400.png',
          revision: 'd7e6c2ae39d852f8bfb449724d9aaa6d',
        },
        {
          url: '/appIcons/windows11/SplashScreen.scale-100.png',
          revision: '24000322bcffa5c081a86af6adbcf1fa',
        },
        {
          url: '/appIcons/windows11/SplashScreen.scale-125.png',
          revision: 'e1b678906f2326c7141be3a470c75d4f',
        },
        {
          url: '/appIcons/windows11/SplashScreen.scale-150.png',
          revision: '73974a2884b3d923f58426dfef56368e',
        },
        {
          url: '/appIcons/windows11/SplashScreen.scale-200.png',
          revision: '601f96fb7237d6eed9137a4738e73545',
        },
        {
          url: '/appIcons/windows11/SplashScreen.scale-400.png',
          revision: '0abedcf836d2125d57c5917e5e5c2308',
        },
        {
          url: '/appIcons/windows11/Square150x150Logo.scale-100.png',
          revision: '698273af9ece646b232bf5f878a0ad6b',
        },
        {
          url: '/appIcons/windows11/Square150x150Logo.scale-125.png',
          revision: '7eedf6571f47c81663c48442b455bf91',
        },
        {
          url: '/appIcons/windows11/Square150x150Logo.scale-150.png',
          revision: 'd13fb5dccc6520002f4bec95dceae8ba',
        },
        {
          url: '/appIcons/windows11/Square150x150Logo.scale-200.png',
          revision: 'a8c3ad50f7a2a47cd1dfd5add9e84763',
        },
        {
          url: '/appIcons/windows11/Square150x150Logo.scale-400.png',
          revision: '9bcd4ec7ade74cf1e044f66437a2fa30',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-lightunplated_targetsize-16.png',
          revision: 'c1796c790a76233f285da7c4663423b4',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-lightunplated_targetsize-20.png',
          revision: 'a361ae3f6c0ed694822f89b941b0285c',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-lightunplated_targetsize-24.png',
          revision: '6cd42b8979eac028cff023898b894e5c',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-lightunplated_targetsize-256.png',
          revision: 'fcf99a2bd97dd3cb0c03c67fc062cbef',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-lightunplated_targetsize-30.png',
          revision: 'ee4f97d121eab113678e0696201b5809',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-lightunplated_targetsize-32.png',
          revision: '3248cca53f9a30eca5bd0a8a5638324b',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-lightunplated_targetsize-36.png',
          revision: '6108bdd44699d30086edc4f0f77fa666',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-lightunplated_targetsize-40.png',
          revision: 'fc0c6ec1dafa8b8ad20b5e7c9a0cfa03',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-lightunplated_targetsize-44.png',
          revision: '3b7e38b19b2e1f1c84084e6d1dd12712',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-lightunplated_targetsize-48.png',
          revision: '384d4817f922e7070b9d662527caeba8',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-lightunplated_targetsize-60.png',
          revision: '91cf6435c2cb28b70e5109e1c7412477',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-lightunplated_targetsize-64.png',
          revision: 'daecc87aa37cd51a8754ad4d27340077',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-lightunplated_targetsize-72.png',
          revision: 'fce9c3cac34fbea4a504ba40fb87a30f',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-lightunplated_targetsize-80.png',
          revision: 'b7aaf53801741af4183ea8c0b59723eb',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-lightunplated_targetsize-96.png',
          revision: 'b4c25870760b686008053d7e3d57a5df',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-unplated_targetsize-16.png',
          revision: 'c1796c790a76233f285da7c4663423b4',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-unplated_targetsize-20.png',
          revision: 'a361ae3f6c0ed694822f89b941b0285c',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-unplated_targetsize-24.png',
          revision: '6cd42b8979eac028cff023898b894e5c',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-unplated_targetsize-256.png',
          revision: 'fcf99a2bd97dd3cb0c03c67fc062cbef',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-unplated_targetsize-30.png',
          revision: 'ee4f97d121eab113678e0696201b5809',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-unplated_targetsize-32.png',
          revision: '3248cca53f9a30eca5bd0a8a5638324b',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-unplated_targetsize-36.png',
          revision: '6108bdd44699d30086edc4f0f77fa666',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-unplated_targetsize-40.png',
          revision: 'fc0c6ec1dafa8b8ad20b5e7c9a0cfa03',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-unplated_targetsize-44.png',
          revision: '3b7e38b19b2e1f1c84084e6d1dd12712',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-unplated_targetsize-48.png',
          revision: '384d4817f922e7070b9d662527caeba8',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-unplated_targetsize-60.png',
          revision: '91cf6435c2cb28b70e5109e1c7412477',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-unplated_targetsize-64.png',
          revision: 'daecc87aa37cd51a8754ad4d27340077',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-unplated_targetsize-72.png',
          revision: 'fce9c3cac34fbea4a504ba40fb87a30f',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-unplated_targetsize-80.png',
          revision: 'b7aaf53801741af4183ea8c0b59723eb',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.altform-unplated_targetsize-96.png',
          revision: 'b4c25870760b686008053d7e3d57a5df',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.scale-100.png',
          revision: '3b7e38b19b2e1f1c84084e6d1dd12712',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.scale-125.png',
          revision: '2423ca0a25a2999b859c6fb605e5fea1',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.scale-150.png',
          revision: '111413aec66f0d3309ed935362513644',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.scale-200.png',
          revision: 'd42f56a75a1c0c0821c311781f0837b0',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.scale-400.png',
          revision: '384c2d8e0698062e5be3870950d154b4',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.targetsize-16.png',
          revision: 'c1796c790a76233f285da7c4663423b4',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.targetsize-20.png',
          revision: 'a361ae3f6c0ed694822f89b941b0285c',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.targetsize-24.png',
          revision: '6cd42b8979eac028cff023898b894e5c',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.targetsize-256.png',
          revision: 'fcf99a2bd97dd3cb0c03c67fc062cbef',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.targetsize-30.png',
          revision: 'ee4f97d121eab113678e0696201b5809',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.targetsize-32.png',
          revision: '3248cca53f9a30eca5bd0a8a5638324b',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.targetsize-36.png',
          revision: '6108bdd44699d30086edc4f0f77fa666',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.targetsize-40.png',
          revision: 'fc0c6ec1dafa8b8ad20b5e7c9a0cfa03',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.targetsize-44.png',
          revision: '3b7e38b19b2e1f1c84084e6d1dd12712',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.targetsize-48.png',
          revision: '384d4817f922e7070b9d662527caeba8',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.targetsize-60.png',
          revision: '91cf6435c2cb28b70e5109e1c7412477',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.targetsize-64.png',
          revision: 'daecc87aa37cd51a8754ad4d27340077',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.targetsize-72.png',
          revision: 'fce9c3cac34fbea4a504ba40fb87a30f',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.targetsize-80.png',
          revision: 'b7aaf53801741af4183ea8c0b59723eb',
        },
        {
          url: '/appIcons/windows11/Square44x44Logo.targetsize-96.png',
          revision: 'b4c25870760b686008053d7e3d57a5df',
        },
        {
          url: '/appIcons/windows11/StoreLogo.scale-100.png',
          revision: '232ecd24f746ac8a1d95e97799abc0f3',
        },
        {
          url: '/appIcons/windows11/StoreLogo.scale-125.png',
          revision: 'f745f753eac21196935678bb11adab9f',
        },
        {
          url: '/appIcons/windows11/StoreLogo.scale-150.png',
          revision: '1505b1d2d84b955d65739ee4f270b642',
        },
        {
          url: '/appIcons/windows11/StoreLogo.scale-200.png',
          revision: '809455175efe81cb867c8f89dbd2be61',
        },
        {
          url: '/appIcons/windows11/StoreLogo.scale-400.png',
          revision: '57b4ead7ef5586af89125bf365050ea1',
        },
        {
          url: '/appIcons/windows11/Wide310x150Logo.scale-100.png',
          revision: '3deaad44251aad4b441802804a4d52af',
        },
        {
          url: '/appIcons/windows11/Wide310x150Logo.scale-125.png',
          revision: '3bef197d5c8915f67dd12e75d5e7ad18',
        },
        {
          url: '/appIcons/windows11/Wide310x150Logo.scale-150.png',
          revision: 'a68d7dbd82f2b4f222ec30719299c9d8',
        },
        {
          url: '/appIcons/windows11/Wide310x150Logo.scale-200.png',
          revision: '24000322bcffa5c081a86af6adbcf1fa',
        },
        {
          url: '/appIcons/windows11/Wide310x150Logo.scale-400.png',
          revision: '601f96fb7237d6eed9137a4738e73545',
        },
        { url: '/auth/activateaccount.png', revision: '6ead77f17a8a904576765c97610eb894' },
        { url: '/auth/forgotpassword.png', revision: '9469c44a3018d7693c08bd0cc2f2307c' },
        { url: '/auth/login.png', revision: 'aad8cdb8977acce0045797027163844a' },
        { url: '/auth/register.png', revision: '9a5022aa38572aabd049097f40739625' },
        { url: '/auth/resendemail.png', revision: '67e1b21d85ebe24be16955b9477b9478' },
        { url: '/auth/resetpassword.png', revision: '04ef095a279b2068ec191599a6b61c3d' },
        { url: '/imageupload.png', revision: '61cccdd853d48f561b3861b1cf3a12a1' },
        { url: '/logo.png', revision: 'b5912e120bd8eb6ca8683fcc73b5e5ef' },
        { url: '/manifest.json', revision: '96739c9389b228d034f1da44998d75b3' },
        { url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
        { url: '/signupsuccess.gif', revision: 'd947a6c22611188129b4c4523fbe7435' },
        { url: '/swe-worker-5c72df51bb1f6ee0.js', revision: '5a47d90db13bb1309b25bdf7b363570e' },
      ],
      { ignoreURLParametersMatching: [/^utm_/, /^fbclid$/] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ response: e }) =>
              e && 'opaqueredirect' === e.type
                ? new Response(e.body, { status: 200, statusText: 'OK', headers: e.headers })
                : e,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 2592e3 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/static.+\.js$/i,
      new e.CacheFirst({
        cacheName: 'next-static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp4|webm)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 48, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ sameOrigin: e, url: { pathname: a } }) =>
        !(!e || a.startsWith('/api/auth/callback') || !a.startsWith('/api/')),
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ request: e, url: { pathname: a }, sameOrigin: s }) =>
        '1' === e.headers.get('RSC') &&
        '1' === e.headers.get('Next-Router-Prefetch') &&
        s &&
        !a.startsWith('/api/'),
      new e.NetworkFirst({
        cacheName: 'pages-rsc-prefetch',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ request: e, url: { pathname: a }, sameOrigin: s }) =>
        '1' === e.headers.get('RSC') && s && !a.startsWith('/api/'),
      new e.NetworkFirst({
        cacheName: 'pages-rsc',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: { pathname: e }, sameOrigin: a }) => a && !e.startsWith('/api/'),
      new e.NetworkFirst({
        cacheName: 'pages',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ sameOrigin: e }) => !e,
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })],
      }),
      'GET'
    ),
    (self.__WB_DISABLE_DEV_LOGS = !0);
});
