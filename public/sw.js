if (!self.define) {
  let e,
    a = {};
  const i = (i, s) => (
    (i = new URL(i + '.js', s).href),
    a[i] ||
      new Promise((a) => {
        if ('document' in self) {
          const e = document.createElement('script');
          (e.src = i), (e.onload = a), document.head.appendChild(e);
        } else (e = i), importScripts(i), a();
      }).then(() => {
        let e = a[i];
        if (!e) throw new Error(`Module ${i} didn’t register its module`);
        return e;
      })
  );
  self.define = (s, n) => {
    const c = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (a[c]) return;
    let o = {};
    const t = (e) => i(e, c),
      r = { module: { uri: c }, exports: o, require: t };
    a[c] = Promise.all(s.map((e) => r[e] || t(e))).then((e) => (n(...e), o));
  };
}
define(['./workbox-f1770938'], function (e) {
  'use strict';
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '/_next/static/8HxLbMgdji_guYDfe36YK/_buildManifest.js',
          revision: '3e2d62a10f4d6bf0b92e14aecf7836f4',
        },
        {
          url: '/_next/static/8HxLbMgdji_guYDfe36YK/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/0e5ce63c-599777d16caf1818.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/160b575a-7ab80f3ebb5388ea.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        { url: '/_next/static/chunks/1948-7211611bd9e29b26.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/2524-5414128321a4ddf4.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/2737-8ede06494cb9b1c5.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/2910-057fd53f455ef98e.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/3122-e71af9ca847642aa.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/3887-06668e2d747cf92e.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/4081-e0ea8b66dd6e2ef5.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/410-adf4d53a1b587d60.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/4705-d5135076991b3cb7.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/5018-6238e31f32052e7f.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/5190-e14697257246ba7e.js', revision: '8HxLbMgdji_guYDfe36YK' },
        {
          url: '/_next/static/chunks/51e9b3d4-f25cbe9beb17fe47.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        { url: '/_next/static/chunks/5205-8a76ce14ff64a629.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/5289-ee75b776d1acc18e.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/5428-d99fbac872c19c53.js', revision: '8HxLbMgdji_guYDfe36YK' },
        {
          url: '/_next/static/chunks/54a60aa6-1e824378beaf3429.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        { url: '/_next/static/chunks/5510-e7c6a29c01e417c7.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/5602-2376fa30e4de0260.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/5624-99a194ec4b615b59.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/6047-fac22ae44e3accf2.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/611-77609eda62bc6417.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/6151-38b3c7a10f5ce46a.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/6300-869dc042b17a69e1.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/6533-0bb0cdb8759a6bb5.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/6648-e87afa133cec3208.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/6832-7f026810d5d5c21a.js', revision: '8HxLbMgdji_guYDfe36YK' },
        {
          url: '/_next/static/chunks/70e0d97a-9237484dd0081762.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        { url: '/_next/static/chunks/7138-b7fc64d778b97d2e.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/7403-39eebadd88e84b2e.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/7522-290a2afec3f64b9d.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/7776-e317b79b5cf1a3f5.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/8126-bb78646b2e71a368.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/8502-0c077c4148895b0e.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/8687-a288cd1af1e44cc8.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/8726-02eeb6b17a58728b.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/8824-e6779d95e4550fb0.js', revision: '8HxLbMgdji_guYDfe36YK' },
        {
          url: '/_next/static/chunks/8ace8c09-2b1a88a690c14971.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        { url: '/_next/static/chunks/9343-74dd702967156eb8.js', revision: '8HxLbMgdji_guYDfe36YK' },
        { url: '/_next/static/chunks/9839-b912396439dacfba.js', revision: '8HxLbMgdji_guYDfe36YK' },
        {
          url: '/_next/static/chunks/app/(authentication)/auth/activate/%5Btoken%5D/page-cc86d99213fcb1cc.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(authentication)/auth/forgotpassword/page-cd17ff47263948b5.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(authentication)/auth/login/page-c318330c7dceacce.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(authentication)/auth/register/page-f31df4e52c1d5154.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(authentication)/auth/resendverificationemail/page-e0665c422f6cfee6.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(authentication)/auth/resetpassword/%5Btoken%5D/page-216721c84912d2f7.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(authentication)/auth/signupsuccess/page-66c439992a014c83.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(home)/page-158446579340b003.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/article/%5Bslug%5D/(articledashboard)/community-stats/page-54e2eb03fd1dda61.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/article/%5Bslug%5D/(articledashboard)/layout-e3a124fb190747e4.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/article/%5Bslug%5D/(articledashboard)/notifications/page-062ad8be056202d4.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/article/%5Bslug%5D/(articledashboard)/official-stats/page-453476bcd405f65b.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/article/%5Bslug%5D/(articledashboard)/settings/page-199e38aaad2edafe.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/article/%5Bslug%5D/(articledashboard)/submit/page-5b9b07de545e087e.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/article/%5Bslug%5D/(displayarticle)/page-60f9452dc774432c.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/articles/page-c14f346bd7703051.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/submitarticle/page-d1417a049f57e2b3.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/communities/page-71592f1d7df41e8c.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(admin)/dashboard/page-b4d6b6ee0aa42e1b.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(admin)/invite/page-71a237aa19f5e155.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(admin)/layout-aef31d370ebda348.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(admin)/preferences/page-e95c25e6ba5a2a33.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(admin)/requests/page-68dbe758aaefd590.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(admin)/roles/page-bab255697896dced.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(admin)/submissions/page-5cfa8bee8787e59e.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(displaycommunity)/page-7473bd90ed239e0e.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/articles/%5BarticleSlug%5D/page-615bca876b13eaaa.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/assessments/%5BassessmentId%5D/page-04331205297ee18f.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/createcommunityarticle/page-4432a1733055fae9.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/invitations/registered/%5Binvitation_id%5D/page-05843b2537f557ae.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/invitations/unregistered/%5Binvitation_id%5D/%5Bsigned_email%5D/page-ba8a493249c77332.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/createcommunity/page-b8d1526f42d8439b.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(posts)/posts/%5BpostId%5D/page-824cd42256463f9d.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(posts)/posts/createpost/page-1f70818e4495b8ea.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(posts)/posts/page-6d897d996bb7ea66.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(users)/mycontributions/page-60d8947d5a443006.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(users)/myprofile/page-e39ee8e0ef9a9187.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/(users)/notifications/page-2d5cad1d2940c2f5.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/(main)/layout-bd29ac4798e765d5.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-e60c97a5462e97fc.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/app/layout-a622b72c760680fa.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/ccd63cfe-81f5594c3a9641c2.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/fd9d1056-376cd1900f1dcb63.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/framework-8e0e0f4a6b83a956.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/main-app-2063d2eec8beb389.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        { url: '/_next/static/chunks/main-f2cc04af6f1caec2.js', revision: '8HxLbMgdji_guYDfe36YK' },
        {
          url: '/_next/static/chunks/pages/_app-f870474a17b7f2fd.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/pages/_error-c66a4e8afc46f17b.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        {
          url: '/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js',
          revision: '79330112775102f91e1010318bae2bd3',
        },
        {
          url: '/_next/static/chunks/webpack-0477319d899992f4.js',
          revision: '8HxLbMgdji_guYDfe36YK',
        },
        { url: '/_next/static/css/2f71e0d51b6954c9.css', revision: '2f71e0d51b6954c9' },
        { url: '/_next/static/css/81cd9fd94325b287.css', revision: '81cd9fd94325b287' },
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
        { url: '/auth/login.jpg', revision: 'feb731243df7fa93cb83f622d93630bb' },
        { url: '/auth/register.jpg', revision: 'cd7517dc069365758ecce39b35125f64' },
        { url: '/auth/resendemail.png', revision: '67e1b21d85ebe24be16955b9477b9478' },
        { url: '/auth/resetpassword.png', revision: '04ef095a279b2068ec191599a6b61c3d' },
        { url: '/imageupload.png', revision: '61cccdd853d48f561b3861b1cf3a12a1' },
        { url: '/logo.png', revision: 'b5912e120bd8eb6ca8683fcc73b5e5ef' },
        { url: '/manifest.json', revision: '7b44098a7da20486e066239827422db1' },
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
      ({ request: e, url: { pathname: a }, sameOrigin: i }) =>
        '1' === e.headers.get('RSC') &&
        '1' === e.headers.get('Next-Router-Prefetch') &&
        i &&
        !a.startsWith('/api/'),
      new e.NetworkFirst({
        cacheName: 'pages-rsc-prefetch',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ request: e, url: { pathname: a }, sameOrigin: i }) =>
        '1' === e.headers.get('RSC') && i && !a.startsWith('/api/'),
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
