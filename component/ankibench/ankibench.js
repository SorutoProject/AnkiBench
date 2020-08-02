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
		load:{
			open:function(){
				M.Modal.getInstance(document.getElementById("load-modal")).open();
			},
			close:function(){
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
	newFile: function () {
		if (confirm("新規作成すると、現在使用しているドキュメントのデータは削除されます。\n新規作成する前に必要な場合はドキュメントを保存してください。\n新規作成しますか？")) {
			ankiBench.userData = ankiBench.defaultUserData; //Initialize UserData
			document.getElementById("home-list").innerHTML = `<li class="collection-item">単元データがありません。下のボタンから新しい単元を作成しましょう。</li>`;
			document.getElementById("home-list").dataset.listed = "false";
			document.getElementById("pro-title").value = "";
			document.getElementById("pro-author").value = "";
			document.getElementById("pro-description").value = "";
			M.updateTextFields();
			M.toast({
				html: "新規作成を実行しました"
			});
		}
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
			if(card.dataset.displayedBool !== "true") card.dataset.displayed = Number(card.dataset.displayed) + (1 / Number(card.dataset.length)); 
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
			if(ankiBench.playingData[0].displayed === true){
				card.dataset.displayedBool = "true";
			}else{
				card.dataset.displayedBool = "false";
			}

			//答えを箇条書きにする
			let answerText = `<ul class="browser-default">`;
			ankiBench.playingData[0].a.split("||").forEach(function (item) {
				answerText += `<li>${item}</li>`;
			});
			answerText+="</ul>";
			document.getElementById("learn-answer").innerHTML = DOMPurify.sanitize(answerText);

			//katexを適用
			const katexOption = {
				delimiters: [
					{ "left": "$$", "right": "$$", display: true },
					{ "left": "$", "right": "$", display: false }
				]
			};

			renderMathInElement(document.getElementById("learn-question"), katexOption);
			renderMathInElement(document.getElementById("learn-answer"), katexOption);

			card.dataset.hide = "true";
		},
		unknow: function () {
			//進捗状況を更新
			const card = document.getElementById("learn-card");
			if(card.dataset.displayedBool !== "true") card.dataset.displayed = Number(card.dataset.displayed) + (1 / Number(card.dataset.length)); 
			document.getElementById("learn-progress-displayed").style = `width:${Number(card.dataset.displayed) * 100}%`;

			ankiBench.playingData[0].displayed = true;//出題したことを記録
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
			if(ankiBench.playingData[0].displayed === true){
				card.dataset.displayedBool = "true";
			}else{
				card.dataset.displayedBool = "false";
			}
			

			//答えを箇条書きにする
			let answerText = `<ul class="browser-default">`;
			ankiBench.playingData[0].a.split("||").forEach(function (item) {
				answerText += `<li>${item}</li>`;
			});
			answerText+="</ul>";
			document.getElementById("learn-answer").innerHTML = DOMPurify.sanitize(answerText);

			//katexを適用
			const katexOption = {
				delimiters: [
					{ "left": "$$", "right": "$$", display: true },
					{ "left": "$", "right": "$", display: false }
				]
			};

			renderMathInElement(document.getElementById("learn-question"), katexOption);
			renderMathInElement(document.getElementById("learn-answer"), katexOption);

			document.getElementById("learn-card").dataset.hide = "true";
		},
		//問題読み上げ
		speakQ:function(){
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
			ankiBench.playingData[0].displayed = true;//出題したことを記録

			//答えを箇条書きにする
			let answerText = `<ul class="browser-default">`;
			ankiBench.playingData[0].a.split("||").forEach(function (item) {
				answerText += `<li>${item}</li>`;
			});
			answerText+="</ul>";
			document.getElementById("learn-answer").innerHTML = DOMPurify.sanitize(answerText);

			//カードを初期化
			card.dataset.hide = "true";
			card.dataset.qaaq = options.qaaq;
			card.dataset.firstletter = options.firstletter;
			card.dataset.length = ankiBench.userData.data[dataIndex].cards.length;
			card.dataset.displayedBool = "false";
			card.dataset.displayedMark = options.displayedMark;

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
				delimiters: [
					{ "left": "$$", "right": "$$", display: true },
					{ "left": "$", "right": "$", display: false }
				]
			};

			renderMathInElement(document.getElementById("learn-question"), katexOption);
			renderMathInElement(document.getElementById("learn-answer"), katexOption);

			ankiBench.changeView("learn");
		}
	},
	edit: {
		//編集エディタを開く
		open: function (id) {
			const dataIndex = ankiBench.userData.data.findIndex(item => item.id === id);
			if (dataIndex === -1) {
				ankiBench.modal.alert(`<b>エラー</b><p>単元「${id}」が見つかりませんでした。</p>`);
				return;
			}

			ankiBench.editingData = ankiBench.userData.data[dataIndex].cards;

		},
		add: function (name) {
			let newName;
			if (typeof name === "undefined") {
				//newName = prompt("作成する単元の名前を入力してください");
				const modal = document.getElementById("add-modal");
				modal.querySelector("input").value = "";
				M.updateTextFields();
				M.Modal.getInstance(modal).open();
				document.getElementById("add-modal-input").focus();
				return;
			} else {
				newName = name;
			}

			//名前がダブっていたら弾く
			if (ankiBench.userData.list.indexOf(newName) !== -1) {
				M.toast({
					html: "すでに使われている単元名は使用できません。"
				})
			} else if (newName !== null && newName !== "") {
				ankiBench.userData.data.push({
					"id": newName,
					"cards": []
				});

				ankiBench.userData.list.push(newName);


				let homeList = document.querySelector("#home-list");
				if (homeList.dataset.listed === "false") {
					homeList.innerHTML = "";
					homeList.dataset.listed = "true";
				}

				const newItem = document.createElement("li");
				newItem.classList.add("collection-item");
				newItem.innerHTML = `<div class="row"><span class="col s1 left-align"><i class="material-icons md-drag_handle drag-handle"></i></span><span class="col s8 left-align"><span class="ankibench-unit-name">${newName}</span></span><span class="col s1 center-align"><i class="material-icons md-play_arrow ankibench-play"></i></span><span class="col s1 center-align"><i class="material-icons md-edit ankibench-edit"></i></span><span class="col s1 center-align"><i class="material-icons md-delete_forever ankibench-delete"></i></span></div>`;
				newItem.dataset["id"] = newName;

				//Button Events
				newItem.querySelector(".ankibench-play").addEventListener("click", function (e) {
					const listParent = e.currentTarget.parentElement.parentElement.parentElement; //単元リストの親要素
					const listId = listParent.dataset.id;

					ankiBench.play.open(listId);
				});

				newItem.querySelector(".ankibench-edit").addEventListener("click", function () {

				});

				newItem.querySelector(".ankibench-unit-name").addEventListener("click", function(e){
					const listParent = e.currentTarget.parentElement.parentElement.parentElement; //単元リストの親要素
					console.log(listParent);
					const listId = listParent.dataset.id; //単元ID

					ankiBench.edit.changeUnitName(listId);
				});

				newItem.querySelector(".ankibench-delete").addEventListener("click", function (e) {
					const listParent = e.currentTarget.parentElement.parentElement.parentElement; //単元リストの親要素

					const listId = listParent.dataset.id; //単元ID
					if (confirm(`単元「${listId}」を削除しますか？\n削除すると、二度と回復できません。`)) {
						//ankiBench.userData.listから削除

						const listIndex = ankiBench.userData.list.indexOf(listId);
						ankiBench.userData.list.splice(listIndex, 1); //ankiBench.userData.dataから削除
						const dataIndex = ankiBench.userData.data.findIndex(item => item.id === listId);
						if (dataIndex !== -1) {
							ankiBench.userData.data.splice(dataIndex, 1);
						}

						listParent.remove();

						//単元が何もなくなったとき
						if (ankiBench.userData.list.length === 0) {
							document.getElementById("home-list").innerHTML = `<li class="collection-item">単元データがありません。下のボタンから新しい単元を作成しましょう。</li>`;
							document.getElementById("home-list").dataset.listed = "false";
						}

					}
				})

				homeList.appendChild(newItem);
			} else {
				if (newName === "") {
					M.toast({
						html: "単元の名前が入力されていません"
					});
				}
			}
		},
		changeUnitName:function(originalName){
			const newName = prompt(`単元「${originalName}」の名前を変更します。\n新しい名前を入力して、OKをクリックしてください。`);
			if(newName === ""){
				M.toast({
					html: "単元の名前が入力されていません"
				});
				return;
			}
			if(newName === null) return;
			//名前がすでにあるものとダブっていたら弾く
			if(ankiBench.userData.list.indexOf(newName) !== -1){
				M.toast({
					html:"すでに使われている単元名は使用できません"
				});
				return;
			}
			//ankiBench.userData.listから、originNameで検索して、それをnewNameに変更する
			const listIndex = ankiBench.userData.list.indexOf(originalName);
			if(listIndex === -1){
				ankiBench.modal.alert(`<b>エラー</b><p>単元「${originalName}」が見つかりませんでした。</p>`);
				return;
			}else{
				//ankiBench.userData.list[listIndex]を書き換え
				ankiBench.userData.list[listIndex] = newName;
			}

			//ankiBench.userData.dataから、originNameで検索して、そのidをnewNameに変更する
			const dataIndex = ankiBench.userData.data.findIndex(item => item.id === originalName);
			if(dataIndex === -1){
				ankiBench.modal.alert(`<b>エラー</b><p>単元リストと単元データの構造が壊れています。</b>`);
				return;
			}
			else{
				//ankiBench.userData.data[dataIndex].idを書き換え
				ankiBench.userData.data[dataIndex].id = newName;
			}

			//#home-listを更新
			if (ankiBench.userData.data.length === 0) {
				document.getElementById("home-list").innerHTML = `<li class="collection-item">単元データがありません。下のボタンから新しい単元を作成しましょう。</li>`;
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
					newItem.innerHTML = `<div class="row"><span class="col s1 left-align"><i class="material-icons md-drag_handle drag-handle"></i></span><span class="col s8 left-align"><span class="ankibench-unit-name">${item}</span></span><span class="col s1 center-align"><i class="material-icons md-play_arrow ankibench-play"></i></span><span class="col s1 center-align"><i class="material-icons md-edit ankibench-edit"></i></span><span class="col s1 center-align"><i class="material-icons md-delete_forever ankibench-delete"></i></span></div>`;
					newItem.dataset["id"] = item;

					//Button Events
					newItem.querySelector(".ankibench-play").addEventListener("click", function (e) {
						const listParent = e.currentTarget.parentElement.parentElement.parentElement; //単元リストの親要素
						const listId = listParent.dataset.id;

						ankiBench.play.open(listId);
					});

					newItem.querySelector(".ankibench-edit").addEventListener("click", function () {

					});

					newItem.querySelector(".ankibench-unit-name").addEventListener("click", function(e){
						const listParent = e.currentTarget.parentElement.parentElement.parentElement; //単元リストの親要素
						const listId = listParent.dataset.id; //単元ID

						ankiBench.edit.changeUnitName(listId);
					});

					newItem.querySelector(".ankibench-delete").addEventListener("click", function (e) {
						const listParent = e.currentTarget.parentElement.parentElement.parentElement; //単元リストの親要素

						const listId = listParent.dataset.id; //単元ID
						if (confirm(`単元「${listId}」を削除しますか？\n削除すると、二度と回復できません。`)) {
							//ankiBench.userData.listから削除

							const listIndex = ankiBench.userData.list.indexOf(listId);
							ankiBench.userData.list.splice(listIndex, 1); //ankiBench.userData.dataから削除
							const dataIndex = ankiBench.userData.data.findIndex(item => item.id === listId);
							if (dataIndex !== -1) {
								ankiBench.userData.data.splice(dataIndex, 1);
							}

							listParent.remove();

							//単元が何もなくなったとき
							if (ankiBench.userData.list.length === 0) {
								document.getElementById("home-list").innerHTML = `<li class="collection-item">単元データがありません。下のボタンから新しい単元を作成しましょう。</li>`;
								document.getElementById("home-list").dataset.listed = "false";
							}

						}
					});

					homeList.appendChild(newItem);
				});

				M.toast({
					html:"単元の名前を変更しました"
				})
			}

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

	//Initialize SortableJS
	ankiBench.sortable = new Sortable(document.getElementById("home-list"), {
		handle: ".drag-handle",
		animation: 150,
		onUpdate: function () {
			//リストの順番が変更されたら、ankiBench.userData.listもその順番にする
			const newList = [];
			document.querySelectorAll("#home-list .collection-item").forEach(function (item) {
				newList.push(item.dataset.id);
			});
			ankiBench.userData.list = newList;
		}
	});

	//Floating Buttons
	const FloatingActionButton = document.querySelector(".fixed-action-btn");
	M.Tooltip.init(FloatingActionButton);

	//file dropdown
	M.Dropdown.init(document.querySelector("#file-button"), {
		coverTrigger: false
	});

	//#load-modal initialize
	M.Modal.init(document.getElementById("load-modal"), {
		dismissible: false
	});

	//ankibench init

	//addEvents
	document.getElementById("file-newfile").addEventListener("click", function () {
		ankiBench.newFile();
	});
	document.getElementById("file-open").addEventListener("click", function () {
		document.getElementById("file-selector").click();
	});
	document.getElementById("file-selector").addEventListener("change", function (e) {
		if (!confirm("[確認]\nファイルを開くと、現在編集中の内容は削除されます。\n必要な場合は現在の編集データを保存してください。\n続行しますか？")) return;
		//読込中モーダルを表示
		ankiBench.modal.load.open();
		const reader = new FileReader();
		reader.onload = function () {
			ankiBench.modal.load.close();
			try {
				ankiBench.userData = JSON.parse(reader.result);

				//set properties page
				document.getElementById("pro-title").value = ankiBench.userData.properties.title;
				document.getElementById("pro-author").value = ankiBench.userData.properties.author;
				document.getElementById("pro-description").value = ankiBench.userData.properties.description;
				//読込中モーダルを閉じる
				
				
				M.updateTextFields();
				if (ankiBench.userData.data.length === 0) {
					document.getElementById("home-list").innerHTML = `<li class="collection-item">単元データがありません。下のボタンから新しい単元を作成しましょう。</li>`;
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
						newItem.innerHTML = `<div class="row"><span class="col s1 left-align"><i class="material-icons md-drag_handle drag-handle"></i></span><span class="col s8 left-align"><span class="ankibench-unit-name">${item}</span></span><span class="col s1 center-align"><i class="material-icons md-play_arrow ankibench-play"></i></span><span class="col s1 center-align"><i class="material-icons md-edit ankibench-edit"></i></span><span class="col s1 center-align"><i class="material-icons md-delete_forever ankibench-delete"></i></span></div>`;
						newItem.dataset["id"] = item;

						//Button Events
						newItem.querySelector(".ankibench-play").addEventListener("click", function (e) {
							const listParent = e.currentTarget.parentElement.parentElement.parentElement; //単元リストの親要素
							const listId = listParent.dataset.id;

							ankiBench.play.open(listId);
						});

						newItem.querySelector(".ankibench-edit").addEventListener("click", function () {

						});

						newItem.querySelector(".ankibench-unit-name").addEventListener("click", function(e){
							const listParent = e.currentTarget.parentElement.parentElement.parentElement; //単元リストの親要素
							const listId = listParent.dataset.id; //単元ID
	
							ankiBench.edit.changeUnitName(listId);
						});

						newItem.querySelector(".ankibench-delete").addEventListener("click", function (e) {
							const listParent = e.currentTarget.parentElement.parentElement.parentElement; //単元リストの親要素

							const listId = listParent.dataset.id; //単元ID
							if (confirm(`単元「${listId}」を削除しますか？\n削除すると、二度と回復できません。`)) {
								//ankiBench.userData.listから削除

								const listIndex = ankiBench.userData.list.indexOf(listId);
								ankiBench.userData.list.splice(listIndex, 1); //ankiBench.userData.dataから削除
								const dataIndex = ankiBench.userData.data.findIndex(item => item.id === listId);
								if (dataIndex !== -1) {
									ankiBench.userData.data.splice(dataIndex, 1);
								}

								listParent.remove();

								//単元が何もなくなったとき
								if (ankiBench.userData.list.length === 0) {
									document.getElementById("home-list").innerHTML = `<li class="collection-item">単元データがありません。下のボタンから新しい単元を作成しましょう。</li>`;
									document.getElementById("home-list").dataset.listed = "false";
								}

							}
						});

						homeList.appendChild(newItem);
					});
				}

				M.toast({
					html: `${e.target.files[0].name} を読み込みました。`
				});
			} catch (e) {
				ankiBench.modal.alert(`<b>エラーが発生しました</b><p>.ankibenchファイルの読み込みに失敗しました。<br>ファイルが壊れている可能性があります。</p><p>詳細情報:<br>${e}</p>`);
				//ankiBench.userDataを初期状態に戻す
				ankiBench.userData = ankiBench.defaultUserData;

				document.getElementById("pro-title").value = "";
				document.getElementById("pro-author").value = "";
				document.getElementById("pro-description").value = "";

				document.getElementById("home-list").innerHTML = `<li class="collection-item">単元データがありません。下のボタンから新しい単元を作成しましょう。</li>`;
				document.getElementById("home-list").dataset.listed = "false";
			}
		}
		reader.readAsText(e.target.files[0]);
		ankiBench.changeView("home", true);// ホーム画面に強制移動
	});
	document.getElementById("file-save").addEventListener("click", function () {
		let fileName;
		if (ankiBench.userData.properties.title !== "") {
			fileName = ankiBench.userData.properties.title;
		} else {
			fileName = "notitle";
		}
		saveAs(new Blob([JSON.stringify(ankiBench.userData)], {
			type: "application/x-ankibench;charset=utf-8"
		}), `${fileName}.ankibench`);
	});

	document.getElementById("back-button").addEventListener("click", function () {
		history.back();
	});

	document.getElementById("add-button").addEventListener("click", function () {
		ankiBench.edit.add();
	});

	document.getElementById("home-pro-button").addEventListener("click", function () {
		ankiBench.changeView("properties");
	});

	//add modal events
	document.getElementById("add-modal-input").addEventListener("keypress", function (e) {
		if (e.keyCode === 13) {
			ankiBench.edit.add(document.getElementById("add-modal-input").value);
			M.Modal.getInstance(document.getElementById("add-modal")).close();
		}
	});
	document.getElementById("add-modal-make-button").addEventListener("click", function () {
		ankiBench.edit.add(document.getElementById("add-modal-input").value);
	});

	//play-modal events
	document.getElementById("play-modal-start-button").addEventListener("click", function () {
		const playModal = document.getElementById("play-modal");

		ankiBench.play.start({
			id: playModal.dataset.id,
			qaaq: document.getElementById("play-modal-qaaq")["play-modal-qaaq-item"].value,
			random: document.getElementById("play-modal-random").checked,
			firstletter:document.getElementById("play-modal-firstletter").checked,
			displayedMark:document.getElementById("play-modal-displayedmark").checked
		});
	});

	//learn view events
	//swipe
	//タッチデバイス向け

	
	if (window.ontouchstart === null) {/*
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
			if(hide == "true"){
				e.currentTarget.dataset.hide = "false";
			}else{
				e.currentTarget.dataset.hide = "true";
			}
		});
	} else {
		//タップしたら、表示を切り替える
		//pc用
		document.getElementById("learn-card").addEventListener("mousedown", function (e) {
			const hide = e.currentTarget.dataset.hide;
			if(hide == "true"){
				e.currentTarget.dataset.hide = "false";
			}else{
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

	document.getElementById("learn-speak-button").addEventListener("click", function(){
		ankiBench.play.speakQ();
	});

	//properties page
	document.getElementById("pro-title").addEventListener("change", function (e) {
		ankiBench.userData.properties.title = e.currentTarget.value;
	});
	document.getElementById("pro-author").addEventListener("change", function (e) {
		ankiBench.userData.properties.author = e.currentTarget.value;
	});
	document.getElementById("pro-description").addEventListener("change", function (e) {
		ankiBench.userData.properties.description = e.currentTarget.value;
	});
});
