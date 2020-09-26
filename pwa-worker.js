/*
// Assign Cache
var CACHE_NAME = 'ankibench-offline-caches';
var urlsToCache = [
  "img/ankibench.svg",

  "component/ankibench/ankibench.css",
  "component/materialize/materialize.min.css",
  "component/katex/katex.min.css",
  "component/material-icons/css/baseline.css",

  "component/ankibench/ankibench.js",
  "component/materialize/materialize.min.js",
  "component/katex/katex.min.js",
  "component/katex/auto-render.min.js",
  "component/katex/mhchem.min.js",
  "component/dompurify/purify.min.js",
  "component/sheetjs/xlsx.full.min.js",

  "component/material-icons/font/MaterialIcons.ttf",
  'component/katex/fonts/KaTeX_AMS-Regular.ttf',
  'component/katex/fonts/KaTeX_AMS-Regular.woff',
  'component/katex/fonts/KaTeX_AMS-Regular.woff2',
  'component/katex/fonts/KaTeX_Caligraphic-Bold.ttf',
  'component/katex/fonts/KaTeX_Caligraphic-Bold.woff',
  'component/katex/fonts/KaTeX_Caligraphic-Bold.woff2',
  'component/katex/fonts/KaTeX_Caligraphic-Regular.ttf',
  'component/katex/fonts/KaTeX_Caligraphic-Regular.woff',
  'component/katex/fonts/KaTeX_Caligraphic-Regular.woff2',
  'component/katex/fonts/KaTeX_Fraktur-Bold.ttf',
  'component/katex/fonts/KaTeX_Fraktur-Bold.woff',
  'component/katex/fonts/KaTeX_Fraktur-Bold.woff2',
  'component/katex/fonts/KaTeX_Fraktur-Regular.ttf',
  'component/katex/fonts/KaTeX_Fraktur-Regular.woff',
  'component/katex/fonts/KaTeX_Fraktur-Regular.woff2',
  'component/katex/fonts/KaTeX_Main-Bold.ttf',
  'component/katex/fonts/KaTeX_Main-Bold.woff',
  'component/katex/fonts/KaTeX_Main-Bold.woff2',
  'component/katex/fonts/KaTeX_Main-BoldItalic.ttf',
  'component/katex/fonts/KaTeX_Main-BoldItalic.woff',
  'component/katex/fonts/KaTeX_Main-BoldItalic.woff2',
  'component/katex/fonts/KaTeX_Main-Italic.ttf',
  'component/katex/fonts/KaTeX_Main-Italic.woff',
  'component/katex/fonts/KaTeX_Main-Italic.woff2',
  'component/katex/fonts/KaTeX_Main-Regular.ttf',
  'component/katex/fonts/KaTeX_Main-Regular.woff',
  'component/katex/fonts/KaTeX_Main-Regular.woff2',
  'component/katex/fonts/KaTeX_Math-BoldItalic.ttf',
  'component/katex/fonts/KaTeX_Math-BoldItalic.woff',
  'component/katex/fonts/KaTeX_Math-BoldItalic.woff2',
  'component/katex/fonts/KaTeX_Math-Italic.ttf',
  'component/katex/fonts/KaTeX_Math-Italic.woff',
  'component/katex/fonts/KaTeX_Math-Italic.woff2',
  'component/katex/fonts/KaTeX_SansSerif-Bold.ttf',
  'component/katex/fonts/KaTeX_SansSerif-Bold.woff',
  'component/katex/fonts/KaTeX_SansSerif-Bold.woff2',
  'component/katex/fonts/KaTeX_SansSerif-Italic.ttf',
  'component/katex/fonts/KaTeX_SansSerif-Italic.woff',
  'component/katex/fonts/KaTeX_SansSerif-Italic.woff2',
  'component/katex/fonts/KaTeX_SansSerif-Regular.ttf',
  'component/katex/fonts/KaTeX_SansSerif-Regular.woff',
  'component/katex/fonts/KaTeX_SansSerif-Regular.woff2',
  'component/katex/fonts/KaTeX_Script-Regular.ttf',
  'component/katex/fonts/KaTeX_Script-Regular.woff',
  'component/katex/fonts/KaTeX_Script-Regular.woff2',
  'component/katex/fonts/KaTeX_Size1-Regular.ttf',
  'component/katex/fonts/KaTeX_Size1-Regular.woff',
  'component/katex/fonts/KaTeX_Size1-Regular.woff2',
  'component/katex/fonts/KaTeX_Size2-Regular.ttf',
  'component/katex/fonts/KaTeX_Size2-Regular.woff',
  'component/katex/fonts/KaTeX_Size2-Regular.woff2',
  'component/katex/fonts/KaTeX_Size3-Regular.ttf',
  'component/katex/fonts/KaTeX_Size3-Regular.woff',
  'component/katex/fonts/KaTeX_Size3-Regular.woff2',
  'component/katex/fonts/KaTeX_Size4-Regular.ttf',
  'component/katex/fonts/KaTeX_Size4-Regular.woff',
  'component/katex/fonts/KaTeX_Size4-Regular.woff2',
  'component/katex/fonts/KaTeX_Typewriter-Regular.ttf',
  'component/katex/fonts/KaTeX_Typewriter-Regular.woff',
  'component/katex/fonts/KaTeX_Typewriter-Regular.woff2',
  
  "index.html"
];

const CACHE_KEYS = [
  CACHE_NAME
];

// インストール処理
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches
    .open(CACHE_NAME)
    .then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});


self.addEventListener('fetch', function(event) {
  //ブラウザが回線に接続しているかをboolで返してくれる
  var online = navigator.onLine;

  //回線が使えるときの処理
  if (online) {
    event.respondWith(
      caches.match(event.request)
      .then(
        function(response) {
          if (response) {
            return response;
          }
          //ローカルにキャッシュがあればすぐ返して終わりですが、
          //無かった場合はここで新しく取得します
          return fetch(event.request)
            .then(function(response) {
              // 取得できたリソースは表示にも使うが、キャッシュにも追加しておきます
              // ただし、Responseはストリームなのでキャッシュのために使用してしまうと、ブラウザの表示で不具合が起こる(っぽい)ので、複製しましょう
              cloneResponse = response.clone();
              if (response) {
                //ここ&&に修正するかもです
                if (response || response.status == 200) {
                  //現行のキャッシュに追加
                  caches.open(CACHE_NAME)
                    .then(function(cache) {
                      cache.put(event.request, cloneResponse)
                        .then(function() {
                          //正常にキャッシュ追加できたときの処理(必要であれば)
                        });
                    });
                } else {
                  //正常に取得できなかったときにハンドリングしてもよい
                  return response;
                }
                return response;
              }
            }).catch(function(error) {
              //デバッグ用
              return console.log(error);
            });
        })
    );
  } else {
    //オフラインのときの制御
    event.respondWith(
      caches.match(event.request)
      .then(function(response) {
        // キャッシュがあったのでそのレスポンスを返す
        if (response) {
          return response;
        }
        //オフラインでキャッシュもなかったパターン
        return caches.match("offline.html")
          .then(function(responseNodata) {
            //適当な変数にオフラインのときに渡すリソースを入れて返却
            //今回はoffline.htmlを返しています
            return responseNodata;
          });
      })
    );
  }
});


self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => {
          return !CACHE_KEYS.includes(key);
        }).map(key => {
          // 不要なキャッシュを削除
          return caches.delete(key);
        })
      );
    })
  );
});
*/

self.addEventListener("fetch", function() {

});
