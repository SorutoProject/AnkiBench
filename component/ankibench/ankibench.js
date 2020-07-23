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
		}
	},
	//change view to ...
	changeView: function (view) {
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
		history.pushState({
			view: view,
			pageNo: pageNo
		}, null, ".#" + view);

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
	edit: {
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
				newItem.innerHTML = `<div class="row"><span class="col s1 left-align drag-handle"><i class="material-icons md-drag_handle"></i></span><span class="col s8 left-align">${newName}</span><span class="col s1 center-align ankibench-play"><i class="material-icons md-play_arrow"></i></span><span class="col s1 center-align"><i class="material-icons md-edit ankibench-edit"></i></span><span class="col s1 center-align"><i class="material-icons md-delete_forever ankibench-delete"></i></span></div>`;
				newItem.dataset["id"] = newName;

				//Button Events
				newItem.querySelector(".ankibench-play").addEventListener("click", function () {

				});

				newItem.querySelector(".ankibench-edit").addEventListener("click", function () {

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
					})
				}
			}
		}
	},
	//Load .ankibench file content here.
	userData: {
		"properties": {
			"title": "",
			"description": "",
			"author": "",
			"updateDate": ""
		},
		"list": [],
		"data": []
	},
	defaultUserData: {
		"properties": {
			"title": "",
			"description": "",
			"author": "",
			"updateDate": ""
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
	sortable: null

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

	//ankibench init

	//addEvents
	document.getElementById("file-newfile").addEventListener("click", function () {
		ankiBench.newFile();
	});
	document.getElementById("file-open").addEventListener("click", function () {
		document.getElementById("file-selector").click();
	});
	document.getElementById("file-selector").addEventListener("change", function (e) {
		const reader = new FileReader();
		reader.onload = function () {
			try {
				ankiBench.userData = JSON.parse(reader.result);

				//set properties page
				document.getElementById("pro-title").value = ankiBench.userData.properties.title;
				document.getElementById("pro-author").value = ankiBench.userData.properties.author;
				document.getElementById("pro-description").value = ankiBench.userData.properties.description;
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
						newItem.innerHTML = `<div class="row"><span class="col s1 left-align drag-handle"><i class="material-icons md-drag_handle"></i></span><span class="col s8 left-align">${item}</span><span class="col s1 center-align ankibench-play"><i class="material-icons md-play_arrow"></i></span><span class="col s1 center-align"><i class="material-icons md-edit ankibench-edit"></i></span><span class="col s1 center-align"><i class="material-icons md-delete_forever ankibench-delete"></i></span></div>`;
						newItem.dataset["id"] = item;

						//Button Events
						newItem.querySelector(".ankibench-play").addEventListener("click", function () {

						});

						newItem.querySelector(".ankibench-edit").addEventListener("click", function () {

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
			}
		}
		reader.readAsText(e.target.files[0]);
	})
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
