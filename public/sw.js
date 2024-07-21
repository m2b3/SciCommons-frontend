if (!self.define) {
  let s,
    e = {};
  const a = (a, i) => (
    (a = new URL(a + '.js', i).href),
    e[a] ||
      new Promise((e) => {
        if ('document' in self) {
          const s = document.createElement('script');
          (s.src = a), (s.onload = e), document.head.appendChild(s);
        } else (s = a), importScripts(a), e();
      }).then(() => {
        let s = e[a];
        if (!s) throw new Error(`Module ${a} didn’t register its module`);
        return s;
      })
  );
  self.define = (i, n) => {
    const c = s || ('document' in self ? document.currentScript.src : '') || location.href;
    if (e[c]) return;
    let o = {};
    const r = (s) => a(s, c),
      t = { module: { uri: c }, exports: o, require: r };
    e[c] = Promise.all(i.map((s) => t[s] || r(s))).then((s) => (n(...s), o));
  };
}
define(['./workbox-f1770938'], function (s) {
  'use strict';
  importScripts(),
    self.skipWaiting(),
    s.clientsClaim(),
    s.precacheAndRoute(
      [
        {
          url: '/_next/static/LEKsQXVPy9PM7HESsVzs_/_buildManifest.js',
          revision: '3e2d62a10f4d6bf0b92e14aecf7836f4',
        },
        {
          url: '/_next/static/LEKsQXVPy9PM7HESsVzs_/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/0e5ce63c-599777d16caf1818.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/160b575a-7ab80f3ebb5388ea.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        { url: '/_next/static/chunks/1948-9636f3d23870808c.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/2524-5414128321a4ddf4.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/2910-8abfdd68c0316929.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/3122-51e942fc7de39719.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/3260-3547d16759152384.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/3887-06668e2d747cf92e.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/4081-de507a81bb840699.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/410-728eeca3803a8427.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/4705-d5135076991b3cb7.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/5018-6238e31f32052e7f.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/5190-e0c0615f5e06f54b.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/5205-279714636368b6f9.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/5289-ee75b776d1acc18e.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/5428-d11735316e39d175.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        {
          url: '/_next/static/chunks/54a60aa6-847da28e356aa880.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        { url: '/_next/static/chunks/5510-896cef172528b352.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/5602-e0d8358d55a8decd.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/5624-99a194ec4b615b59.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/6047-437d8db02ac86bb2.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/611-77609eda62bc6417.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/6151-38b3c7a10f5ce46a.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/6300-869dc042b17a69e1.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/6533-3c9486c6febac24a.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/6648-53e7394ba107858a.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/6832-ca4c920da5128af1.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        {
          url: '/_next/static/chunks/70e0d97a-07ede5c7b0026190.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        { url: '/_next/static/chunks/7138-b7fc64d778b97d2e.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/7776-47765d54b3d17003.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/8126-10a1d1f08e9f96ce.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/8502-0c077c4148895b0e.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/8687-a288cd1af1e44cc8.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/8726-02eeb6b17a58728b.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/8824-e6779d95e4550fb0.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/8993-28cf9f0a31f6a41d.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        { url: '/_next/static/chunks/9343-74dd702967156eb8.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        {
          url: '/_next/static/chunks/app/(authentication)/auth/activate/%5Btoken%5D/page-4c71ae61e6bcc216.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(authentication)/auth/forgotpassword/page-68de69d115529b15.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(authentication)/auth/login/page-281842bdd437ad8a.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(authentication)/auth/register/page-4385f9084413e862.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(authentication)/auth/resendverificationemail/page-facfb7cee93bf3da.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(authentication)/auth/resetpassword/%5Btoken%5D/page-c7b59103ba519073.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(authentication)/auth/signupsuccess/page-096ed3cd0fba4d11.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(home)/page-a923a90e8774c11f.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/article/%5Bslug%5D/(articledashboard)/community-stats/page-5d11fd1969fe1de0.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/article/%5Bslug%5D/(articledashboard)/layout-705f0e9a12331fa2.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/article/%5Bslug%5D/(articledashboard)/notifications/page-c716bc9d5f514a48.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/article/%5Bslug%5D/(articledashboard)/official-stats/page-a4b6aaeef82ec611.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/article/%5Bslug%5D/(articledashboard)/settings/page-c05bcb081f275d7d.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/article/%5Bslug%5D/(articledashboard)/submit/page-3e7a6317af7d6d76.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/article/%5Bslug%5D/(displayarticle)/page-36aa1f3e2a0ba0da.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/articles/page-208a425343c51f6a.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(articles)/submitarticle/page-f84cb267a916c70e.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/communities/page-2c05e5cdd89ee32a.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(admin)/dashboard/page-9dedacfa7b9a5f4a.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(admin)/invite/page-b25ff14473b2e468.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(admin)/layout-49ac411d7db98069.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(admin)/preferences/page-3a5549b59aadeb64.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(admin)/requests/page-549a48a921b95c0b.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(admin)/roles/page-85cc14317722c3dd.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(admin)/submissions/page-3aa27e7e78151a54.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/(displaycommunity)/page-a7a5c29127ed468f.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/articles/%5BarticleSlug%5D/page-ddcb96bca6be4479.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/assessments/%5BassessmentId%5D/page-8353342b1bc4fb38.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/createcommunityarticle/page-39431282be2d05b8.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/invitations/registered/%5Binvitation_id%5D/page-422f43c90575f414.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/community/%5Bslug%5D/invitations/unregistered/%5Binvitation_id%5D/%5Bsigned_email%5D/page-858a6df4589ef0d4.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(communities)/createcommunity/page-b888e3159c10dbd1.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(posts)/posts/%5BpostId%5D/page-176a6aaad37cc87a.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(posts)/posts/createpost/page-dce87c4207d08534.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(posts)/posts/page-a16638728d307905.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(users)/mycontributions/page-f76e01d91b6aeaf4.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(users)/myprofile/page-ee5a7133ba27f530.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/(users)/notifications/page-536047a128cd5fd4.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/(main)/layout-4e130ca5df5c92e9.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-e60c97a5462e97fc.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/app/layout-e92f6b2b186c4f0a.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/fd9d1056-376cd1900f1dcb63.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/framework-8e0e0f4a6b83a956.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/main-app-31af15bd4171bfcc.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        { url: '/_next/static/chunks/main-f2cc04af6f1caec2.js', revision: 'LEKsQXVPy9PM7HESsVzs_' },
        {
          url: '/_next/static/chunks/pages/_app-f870474a17b7f2fd.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/pages/_error-c66a4e8afc46f17b.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        {
          url: '/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js',
          revision: '79330112775102f91e1010318bae2bd3',
        },
        {
          url: '/_next/static/chunks/webpack-0477319d899992f4.js',
          revision: 'LEKsQXVPy9PM7HESsVzs_',
        },
        { url: '/_next/static/css/2f71e0d51b6954c9.css', revision: '2f71e0d51b6954c9' },
        { url: '/_next/static/css/9e929cb8a7923bc5.css', revision: '9e929cb8a7923bc5' },
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
    s.cleanupOutdatedCaches(),
    s.registerRoute(
      '/',
      new s.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ response: s }) =>
              s && 'opaqueredirect' === s.type
                ? new Response(s.body, { status: 200, statusText: 'OK', headers: s.headers })
                : s,
          },
        ],
      }),
      'GET'
    ),
    s.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new s.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [new s.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new s.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [new s.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new s.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new s.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 2592e3 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\/_next\/static.+\.js$/i,
      new s.CacheFirst({
        cacheName: 'next-static-js-assets',
        plugins: [new s.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [new s.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new s.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new s.RangeRequestsPlugin(),
          new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    s.registerRoute(
      /\.(?:mp4|webm)$/i,
      new s.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new s.RangeRequestsPlugin(),
          new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    s.registerRoute(
      /\.(?:js)$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new s.ExpirationPlugin({ maxEntries: 48, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\.(?:css|less)$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new s.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      ({ sameOrigin: s, url: { pathname: e } }) =>
        !(!s || e.startsWith('/api/auth/callback') || !e.startsWith('/api/')),
      new s.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [new s.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      ({ request: s, url: { pathname: e }, sameOrigin: a }) =>
        '1' === s.headers.get('RSC') &&
        '1' === s.headers.get('Next-Router-Prefetch') &&
        a &&
        !e.startsWith('/api/'),
      new s.NetworkFirst({
        cacheName: 'pages-rsc-prefetch',
        plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      ({ request: s, url: { pathname: e }, sameOrigin: a }) =>
        '1' === s.headers.get('RSC') && a && !e.startsWith('/api/'),
      new s.NetworkFirst({
        cacheName: 'pages-rsc',
        plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      ({ url: { pathname: s }, sameOrigin: e }) => e && !s.startsWith('/api/'),
      new s.NetworkFirst({
        cacheName: 'pages',
        plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      ({ sameOrigin: s }) => !s,
      new s.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })],
      }),
      'GET'
    ),
    (self.__WB_DISABLE_DEV_LOGS = !0);
});
