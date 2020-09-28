/*
    AnkiBench

    main JS
    (c)2020 Soruto Project.
    MIT Licensed.
*/


let pageNo = 0; //add 1 when pushstated to detect "back" or "forward"
const ankiBench = {
  modal: {
    alert: function (html) {
      const modal = document.getElementById("main-modal");
      const modalInstance = M.Modal.getInstance(modal);
      modal.querySelector(".modal-content").innerHTML = html;
      modalInstance.open();
    },
    load: {
      open: function () {
        M.Modal.getInstance(document.getElementById("load-modal")).open();
      },
      close: function () {
        M.Modal.getInstance(document.getElementById("load-modal")).close();
      }
    }
  },
  //change view to ...
  changeView: function (view, replaceBool = false) {
    if (document.querySelector(`#pages > div#${view}`)) {
      const inViewElem = document.querySelector(`#pages > div#${view}`);
      //現在表示中のビューと要求されたビューが同じ場合は無視する
      if (inViewElem === document.querySelector(`#pages > div.active-view`)) {
        return;
      }
      document.querySelectorAll("#pages > div").forEach(function (elem) {
        if (elem !== inViewElem) {
          elem.classList.remove("active-view");
          elem.classList.add("outView");
          setTimeout(function () {
            elem.style.display = "none";
            elem.classList.remove("outView");
          }, 300);
        }
      });

      inViewElem.style.display = "block";
      inViewElem.classList.add("inView");
      inViewElem.classList.add("active-view");
      setTimeout(function () {
        inViewElem.classList.remove("inView");
        inViewElem.style.display = "block";
      }, 300);
    } else {
      throw view + " is not found.";
    }

    pageNo++;
    if (replaceBool === true) {
      history.replaceState({
        view: view,
        pageNo: pageNo
      }, null, ".#" + view);
    } else {
      history.pushState({
        view: view,
        pageNo: pageNo
      }, null, ".#" + view);
    }

    if (view === "home") document.getElementById("back-button").style.display = "none";
    else document.getElementById("back-button").style.display = "list-item";

    ankiBench.closeAllTooltip();
  },
  //#home-listに関する関数とか
  homeList: {
    //リストを更新(readOnlyBoolをtrueにすると、編集できなくなる)
    update: function () {
      //#home-listを更新
      if (ankiBench.userData.data.length === 0) {
        document.getElementById("home-list").innerHTML = `<li class="collection-item">単元データがありません。</li>`;
        document.getElementById("home-list").dataset.listed = "false";
      } else {
        let homeList = document.querySelector("#home-list");
        if (homeList.dataset.listed === "false") {
          homeList.dataset.listed = "true";
        }
        homeList.innerHTML = "";

        ankiBench.userData.list.forEach(function (item) {
          const newItem = document.createElement("li");
          newItem.classList.add("collection-item");
          newItem.innerHTML = `<div class="row"><span class="col s10 left-align"><span class="ankibench-unit-name">${item}</span></span><span class="col s1 center-align"><i class="material-icons md-view_list ankibench-list"></i></span><span class="col s1 center-align"><i class="material-icons md-play_arrow ankibench-play"></i></span></div>`;
          newItem.dataset["id"] = item;

          //Button Events
          newItem.querySelector(".ankibench-play").addEventListener("click", function (e) {
            const listParent = e.currentTarget.parentElement.parentElement.parentElement; //単元リストの親要素
            const listId = listParent.dataset.id;

            ankiBench.play.open(listId);
          });

          //Open QA List View
          newItem.querySelector(".ankibench-list").addEventListener("click", function (e) {
            const listParent = e.currentTarget.parentElement.parentElement.parentElement; //単元リストの親要素
            const listId = listParent.dataset.id;

            ankiBench.openQAList(listId);
          });

          homeList.appendChild(newItem);
        });
      }

    }
  },
  openQAList: function (id) {
    //検索
    const dataIndex = ankiBench.userData.data.findIndex(item => item.id === id);
    if (dataIndex === -1) {
      ankiBench.modal.alert(`<b>エラー</b><p>単元「${id}」が見つかりませんでした。</p>`);
      return;
    }
    const listTable = document.getElementById("qa-list-table");
    //DOMを直接いじると重いので、一旦変数に保存
    let listTableHTML = "";
    //単元名を表示
    document.getElementById("qa-list-id").textContent = id;
    if (ankiBench.userData.data[dataIndex].cards.length === 0) {
      listTableHTML = `<tr><td>この単元には問題がありません。</td></tr>`;
    } else {
      //タイトルを作る
      listTableHTML = `<tr><th>問題</th><th>答え</th></tr>`;

      ankiBench.userData.data[dataIndex].cards.forEach(function (qa) {
        //各問題の問題と答えを出力（答えは || を ； に変える）
        listTableHTML += `<tr><td>${DOMPurify.sanitize(qa.q)}</td><td>${DOMPurify.sanitize(qa.a.split("||").join("；"))}</td></tr>`;
      });
    }
    //DOMに適用
    listTable.innerHTML = listTableHTML;
    //数式を変換
    //katexを適用
    const katexOption = {
      delimiters: [{
        "left": "$$",
        "right": "$$",
        display: false
      },
      {
        "left": "$",
        "right": "$",
        display: false
      }
      ]
    };
    renderMathInElement(listTable, katexOption);
    //問題数を表示
    document.getElementById("qa-list-length").textContent = ankiBench.userData.data[dataIndex].cards.length;
    //問題答えリストへ移動
    ankiBench.changeView("qa-list");
  },
  play: {
    open: function (id) {
      //単元の存在チェック
      const dataIndex = ankiBench.userData.data.findIndex(item => item.id === id);
      if (dataIndex === -1) {
        ankiBench.modal.alert(`<b>エラー</b><p>単元「${id}」が見つかりませんでした。</p>`);
        return;
      }
      if (ankiBench.userData.data[dataIndex].cards.length === 0) {
        ankiBench.modal.alert(`<b>エラー</b><p>単元「${id}」には、問題が登録されていません。`);
        return;
      }
      const playModal = document.getElementById("play-modal");

      //単元名を表示
      document.getElementById("play-modal-unit-name").textContent = id;

      M.Modal.getInstance(playModal).open();

      playModal.dataset.id = id;
    },
    know: function () {
      ankiBench.playingData.splice(0, 1);
      //進捗状況を更新
      const card = document.getElementById("learn-card");
      card.dataset.know = Number(card.dataset.know) + (1 / Number(card.dataset.length));
      if (card.dataset.displayedBool !== "true") card.dataset.displayed = Number(card.dataset.displayed) + (1 / Number(card.dataset.length));
      document.getElementById("learn-progress-displayed").style = `width:${Number(card.dataset.displayed) * 100}%`;
      document.getElementById("learn-progress-know").style = `width:${Number(card.dataset.know) * 100}%`;

      //残りの問題がなかったらメッセージを出して終了
      if (ankiBench.playingData.length === 0) {
        /*ankiBench.modal.alert(`<b>完了！</b><p>すべての問題が完了しました！</p>`);
        ankiBench.changeView("home", true);*/
        document.getElementById("learn-question").innerHTML = `<div class="center-align black-text">すべての問題が完了しました</div>`;
        document.getElementById("learn-answer").innerHTML = `<div class="center-align"><button class="btn waves-effect" onclick="ankiBench.changeView('home',true);"><i class="material-icons md-arrow_forward right"></i>ホーム画面に移動</button></div>`;

        document.getElementById("learn-button-wrapper").style.display = "none";
        card.dataset.displayedBool = "false";
        return;
      }
      document.getElementById("learn-question").textContent = ankiBench.playingData[0].q;
      if(ankiBench.playingData[0].q.length > 20) document.getElementById("learn-question").style.fontSize = "12pt";
      else document.getElementById("learn-question").style.fontSize = "16pt";

      if (ankiBench.playingData[0].displayed === true) {
        card.dataset.displayedBool = "true";
      } else {
        card.dataset.displayedBool = "false";
      }

      //答えを箇条書きにする
      let answerText = `<ul class="browser-default">`;
      ankiBench.playingData[0].a.split("||").forEach(function (item) {
        answerText += `<li>${item}</li>`;
      });
      answerText += "</ul>";
      document.getElementById("learn-answer").innerHTML = DOMPurify.sanitize(answerText);

      //katexを適用
      const katexOption = {
        delimiters: [{
          "left": "$$",
          "right": "$$",
          display: true
        },
        {
          "left": "$",
          "right": "$",
          display: false
        }
        ]
      };

      renderMathInElement(document.getElementById("learn-question"), katexOption);
      renderMathInElement(document.getElementById("learn-answer"), katexOption);

      card.dataset.hide = "true";
    },
    unknow: function () {
      //進捗状況を更新
      const card = document.getElementById("learn-card");
      if (card.dataset.displayedBool !== "true") card.dataset.displayed = Number(card.dataset.displayed) + (1 / Number(card.dataset.length));
      document.getElementById("learn-progress-displayed").style = `width:${Number(card.dataset.displayed) * 100}%`;

      ankiBench.playingData[0].displayed = true; //出題したことを記録
      //残りの問題が20個以上ある時
      if (ankiBench.playingData.length >= 20) {
        //配列の位置を移動させる関数
        const moveAt = function (array, index, at) {
          if (index === at || index > array.length - 1 || at > array.length - 1) {
            return array;
          }

          const value = array[index];
          const tail = array.slice(index + 1);

          array.splice(index);

          Array.prototype.push.apply(array, tail);

          array.splice(at, 0, value);

          return array;
        }

        moveAt(ankiBench.playingData, 0, 20);
      } else {
        //最後へ移動
        ankiBench.playingData.push(ankiBench.playingData.shift());
      }
      document.getElementById("learn-question").textContent = ankiBench.playingData[0].q;
      if(ankiBench.playingData[0].q.length > 20) document.getElementById("learn-question").style.fontSize = "12pt";
      else document.getElementById("learn-question").style.fontSize = "16pt";

      if (ankiBench.playingData[0].displayed === true) {
        card.dataset.displayedBool = "true";
      } else {
        card.dataset.displayedBool = "false";
      }


      //答えを箇条書きにする
      let answerText = `<ul class="browser-default">`;
      ankiBench.playingData[0].a.split("||").forEach(function (item) {
        answerText += `<li>${item}</li>`;
      });
      answerText += "</ul>";
      document.getElementById("learn-answer").innerHTML = DOMPurify.sanitize(answerText);

      //katexを適用
      const katexOption = {
        delimiters: [{
          "left": "$$",
          "right": "$$",
          display: true
        },
        {
          "left": "$",
          "right": "$",
          display: false
        }
        ]
      };

      renderMathInElement(document.getElementById("learn-question"), katexOption);
      renderMathInElement(document.getElementById("learn-answer"), katexOption);

      document.getElementById("learn-card").dataset.hide = "true";
    },
    //問題読み上げ
    speakQ: function () {
      const questionText = document.getElementById("learn-question").innerText;
      const uttr = new SpeechSynthesisUtterance(questionText);
      uttr.lang = "en-US";

      speechSynthesis.speak(uttr);
    },
    //学習開始
    start: function (options) {
      const card = document.getElementById("learn-card");

      card.classList.remove("pre-know");
      card.classList.remove("pre-unknow");
      //検索
      const dataIndex = ankiBench.userData.data.findIndex(item => item.id === options.id);
      if (dataIndex === -1) {
        ankiBench.modal.alert(`<b>エラー</b><p>単元「${options.id}」が見つかりませんでした。</p>`);
        return;
      }
      if (ankiBench.userData.data[dataIndex].cards.length === 0) {
        ankiBench.modal.alert(`<b>エラー</b><p>単元「${options.id}」には、問題が登録されていません。`);
        return;
      }
      // 配列をシャッフル
      const shuffle = function (array) {
        for (let i = array.length - 1; i >= 0; i--) {
          let rand = Math.floor(Math.random() * (i + 1));
          // 配列の数値を入れ替える
          [array[i], array[rand]] = [array[rand], array[i]]
        }
        return array;
      }
      //なぜかankiBench.playngDataをいじるとankiBench.userData.dataも変わってしまうので、JSONを経由させる
      if (options.random === false) {
        ankiBench.playingData = JSON.parse(JSON.stringify(ankiBench.userData.data[dataIndex].cards));
      } else {
        ankiBench.playingData = shuffle(JSON.parse(JSON.stringify(ankiBench.userData.data[dataIndex].cards)));
      }

      //最初の問題・答えを表示
      document.getElementById("learn-question").textContent = ankiBench.playingData[0].q;
      if(ankiBench.playingData[0].q.length > 20) document.getElementById("learn-question").style.fontSize = "12pt";
      else document.getElementById("learn-question").style.fontSize = "16pt";

      ankiBench.playingData[0].displayed = true; //出題したことを記録

      //答えを箇条書きにする
      let answerText = `<ul class="browser-default">`;
      ankiBench.playingData[0].a.split("||").forEach(function (item) {
        answerText += `<li>${item}</li>`;
      });
      answerText += "</ul>";
      document.getElementById("learn-answer").innerHTML = DOMPurify.sanitize(answerText);

      //カードを初期化
      card.dataset.hide = "true";
      card.dataset.qaaq = options.qaaq;
      card.dataset.firstletter = options.firstletter;
      card.dataset.length = ankiBench.userData.data[dataIndex].cards.length;
      card.dataset.displayedBool = "false";
      card.dataset.displayedMark = options.displayedMark;
      card.dataset.speak = options.speak;

      //#learn-subject-nameに単元名を表示
      document.getElementById("learn-unit-name").textContent = options.id;

      //「わかる」「わからない」ボタンを表示
      document.getElementById("learn-button-wrapper").style.display = "block";

      //進捗状況をリセット
      document.getElementById("learn-progress-displayed").style = `width:0%`;
      document.getElementById("learn-progress-know").style = `width:0%`;

      //進捗状況表示用
      card.dataset.displayed = 0;
      card.dataset.know = 0;

      //katexを適用
      const katexOption = {
        delimiters: [{
          "left": "$$",
          "right": "$$",
          display: true
        },
        {
          "left": "$",
          "right": "$",
          display: false
        }
        ]
      };

      renderMathInElement(document.getElementById("learn-question"), katexOption);
      renderMathInElement(document.getElementById("learn-answer"), katexOption);

      ankiBench.changeView("learn");
    }
  },
  //Load .ankibench file content here.
  userData: {
    "properties": {
      "title": "",
      "description": "",
      "author": ""
    },
    "list": [],
    "data": []
  },
  defaultUserData: {
    "properties": {
      "title": "",
      "description": "",
      "author": ""
    },
    "list": [],
    "data": []
  },
  //すべてのtooltipを隠す
  closeAllTooltip: function () {
    const allTooltipElem = document.querySelectorAll(".tooltipped").forEach(function (elem) {
      M.Tooltip.getInstance(elem).close();
    });
  },
  sortable: null,
  editingData: null,
  playingData: null

}

//popstate
window.onpopstate = function (e) {
  const view = e.state.view;
  if (document.querySelector(`#pages > div#${view}`)) {

    const inViewElem = document.querySelector(`#pages > div#${view}`);
    document.querySelectorAll("#pages > div").forEach(function (elem) {
      if (elem !== inViewElem) {
        if (elem.style.display == "block") {
          elem.classList.add("outViewBack");
          elem.classList.remove("active-view");
          setTimeout(function () {
            elem.classList.remove("outViewBack");
            elem.style.display = "none";
          }, 300);
        }
      }
    });
    inViewElem.classList.add("inViewBack");
    inViewElem.classList.add("active-view");
    inViewElem.style.display = "block";
    setTimeout(function () {
      inViewElem.classList.remove("inViewBack");
      inViewElem.style.display = "block";
    }, 300);

    document.querySelector(`#pages > div#${view}`).style.display = "block";
    if (view === "home") document.getElementById("back-button").style.display = "none";
    else document.getElementById("back-button").style.display = "list-item";
  } else {
    throw view + " is not found.";
  }

  ankiBench.closeAllTooltip();
}

document.addEventListener("DOMContentLoaded", function () {
  //Initialize history
  history.replaceState({
    view: "home",
    pageNo: 0
  }, null, ".#home");

  document.getElementById("home").classList.add("active-view");

  document.querySelectorAll("#pages > div").forEach(function (elem) {
    elem.style.display = "none";
  });
  document.querySelector(`#pages > div#home`).style.display = "block";

  document.getElementById("back-button").style.display = "none";

  //Materialize will be Initialized here
  M.AutoInit();

  //#load-modal initialize
  M.Modal.init(document.getElementById("load-modal"), {
    dismissible: true
  });

  //ankibench init
  document.getElementById("file-button").addEventListener("click", function () {
    document.getElementById("file-selector").click();
  });
  document.getElementById("file-selector").addEventListener("change", function (e) {
    //読込中モーダルを表示
    ankiBench.modal.load.open();
    const reader = new FileReader();
    const getExtension = function (filename) {
      return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    }
    const fileExt = getExtension(e.target.files[0].name);
    reader.onload = function () {
      ankiBench.modal.load.close();
      try {
        if (fileExt === "xlsx" || fileExt === "ods") {
          const data = new Uint8Array(reader.result);
          const workbook = XLSX.read(data, {
            type: "array"
          });
          let exportData = {
            "list": [],
            "data": []
          };
          workbook.SheetNames.forEach(function (sheetName) {
            const roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
              header: 1
            });
            if (roa.length) {
              exportData.list.push(sheetName);
              //問題と答えを抽出
              const data = {
                "id": sheetName,
                "cards": []
              };

              //console.log(roa);

              for (let i = 0; i < roa.length; i++) {
                data.cards[i] = {
                  "q": roa[i][0],
                  "a": roa[i][1]
                };
              }

              exportData.data.push(data);
            }
            //適用、更新
            ankiBench.userData = exportData;
            ankiBench.homeList.update(true);
          });
          M.toast({
            html: `${e.target.files[0].name} を読み込みました。`
          });
          //ページタイトルに適用
          document.title = e.target.files[0].name + " - AnkiBench"
        } else {
          M.toast({
            html: `対応していないファイルです。<br>.xlsxファイルのみ使用できます。`
          })
        }
      } catch (e) {
        ankiBench.modal.alert(`<b>エラーが発生しました</b><p>.xlsxファイルの読み込みに失敗しました。<br>ファイルが壊れている可能性があります。</p><p>詳細情報:<br>${e}</p>`);
        //ankiBench.userDataを初期状態に戻す
        ankiBench.userData = ankiBench.defaultUserData;

        document.getElementById("home-list").innerHTML = `<li class="collection-item">単元データがありません。下のボタンから新しい単元を作成しましょう。</li>`;
        document.getElementById("home-list").dataset.listed = "false";
      }
    }
    reader.readAsArrayBuffer(e.target.files[0]);
    ankiBench.changeView("home", true); // ホーム画面に強制移動
  });

  document.getElementById("back-button").addEventListener("click", function () {
    history.back();
  });

  //play-modal events
  document.getElementById("play-modal-start-button").addEventListener("click", function () {
    const playModal = document.getElementById("play-modal");

    ankiBench.play.start({
      id: playModal.dataset.id,
      qaaq: document.getElementById("play-modal-qaaq")["play-modal-qaaq-item"].value,
      random: document.getElementById("play-modal-random").checked,
      firstletter: document.getElementById("play-modal-firstletter").checked,
      displayedMark: document.getElementById("play-modal-displayedmark").checked,
      speak: document.getElementById("play-modal-speak").checked
    });
  });

  //learn view events
  //swipe
  //タッチデバイス向け


  if (window.ontouchstart === null) {
    /*
        const cardContent = document.querySelector("#learn-card .card-content");
        const card = document.getElementById("learn-card");
        let startX;
        let startY;
        let moveX;
        let moveY;
        let dist = 50;

        cardContent.addEventListener("touchstart", function (e) {
          e.preventDefault();
          startX = e.touches[0].pageX;
          startY = e.touches[0].pageY;
        });

        cardContent.addEventListener("touchmove", function (e) {
          e.preventDefault();
          moveX = e.changedTouches[0].pageX;
          moveY = e.changedTouches[0].pageY;

          //カードを動かす
          console.log(moveX - startX);
          e.currentTarget.parentElement.style = `transform:translate3d(${moveX - startX}px,0,0);`;
          if (Math.abs(moveX - startX) < dist) {
            card.classList.remove("pre-know");
            card.classList.remove("pre-unknow");
          }
          else if (startX >= moveX && startX >= moveX + dist) {
            card.classList.remove("pre-know");
            card.classList.add("pre-unknow");
          } else {
            card.classList.remove("pre-unknow");
            card.classList.add("pre-know");
          }
        });

        cardContent.addEventListener("touchend", function (e) {
          if (Math.abs(moveX - startX) < dist) {
            card.classList.remove("pre-know", "pre-unknow");
            document.getElementById("learn-card").style = ``;
          }
          else if (startX > moveX && startX > moveX + dist) {
            //right to left(わからない)
            document.getElementById("learn-card").style = ``;

            document.getElementById("learn-unknow").click();

          } else {
            //left to right(わかる)
            document.getElementById("learn-card").style = ``;

            document.getElementById("learn-know").click();
          }
        });*/
    //タップしたら、表示を切り替える
    //スマホ用
    document.getElementById("learn-card").addEventListener("touchstart", function (e) {
      const hide = e.currentTarget.dataset.hide;
      if (hide == "true") {
        e.currentTarget.dataset.hide = "false";
      } else {
        e.currentTarget.dataset.hide = "true";
      }
    });
  } else {
    //タップしたら、表示を切り替える
    //pc用
    document.getElementById("learn-card").addEventListener("mousedown", function (e) {
      const hide = e.currentTarget.dataset.hide;
      if (hide == "true") {
        e.currentTarget.dataset.hide = "false";
      } else {
        e.currentTarget.dataset.hide = "true";
      }
    });
  }


  document.getElementById("learn-know").addEventListener("click", function () {
    document.getElementById("learn-card").classList.add("know");
    setTimeout(function () {
      ankiBench.play.know();
      document.getElementById("learn-card").classList.remove("pre-unknow", "pre-know");
    }, 100);
    setTimeout(function () {
      document.getElementById("learn-card").classList.remove("know");
    }, 300);

  });

  document.getElementById("learn-unknow").addEventListener("click", function () {
    document.getElementById("learn-card").classList.add("unknow");
    setTimeout(function () {
      ankiBench.play.unknow();
      document.getElementById("learn-card").classList.remove("pre-unknow", "pre-know");
    }, 100);
    setTimeout(function () {
      document.getElementById("learn-card").classList.remove("unknow");
    }, 300);
  });

  document.getElementById("learn-speak-button").addEventListener("click", function () {
    ankiBench.play.speakQ();
  });

  document.getElementById("learn-list").addEventListener("click", function(){
    ankiBench.openQAList(document.getElementById("learn-unit-name").innerText);
  });
});
