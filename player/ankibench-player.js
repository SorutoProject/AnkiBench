const ankiBench = {
	"getEmbedJSON": function () {
		return JSON.parse(document.getElementById("ankibench-data").textContent);
	},
	//load and init ankibench json data
	"load": function (doc) {
		if (!doc.properties || !doc.data) {
			ankiBench.modal("<h4>Load Error</h4>Some required values are not found.");
			return null;
		}
		document.getElementById("ankibench-title").textContent = doc.properties.title;
		//set application information to #ankibench-modal-about
		document.querySelector("#ankibench-modal-about .modal-content").innerHTML = DOMPurify.sanitize(`<h5>このアプリについて</h5><div class="grey-text darken-4-text">タイトル</div>${DOMPurify.sanitize(doc.properties.title)}<div class="grey-text darken-4-text">作成者</div>${DOMPurify.sanitize(doc.properties.author)}<div class="grey-text darken-4-text">作成日</div>${DOMPurify.sanitize(doc.properties.createdOn)}<div class="grey-text darken-4-text">説明</div>${DOMPurify.sanitize(doc.properties.description.split("\n").join("<br>"))}<hr>Made with AnkiBench, an online memorizer.</div>`);

		//set list to #ankibench-list
		const list = document.getElementById("ankibench-list");
		Object.keys(doc.data).forEach(function (key) {
			//Check whether question is a word
			if (doc.data[key])
				list.innerHTML += `<li class="collection-item" onclick="ankiBench.startFromList(event,'${key}');">${key}</li>`;
		});
	},
	//show alert
	"modal": function (html, footerHTML = `<a href="javascript:void(0)" class="modal-close waves-effect btn-flat">OK</a>`) {
		const modal = document.getElementById("ankibench-modal");
		const event = M.Modal.getInstance(modal);
		modal.querySelector(".modal-content").innerHTML = html;
		modal.querySelector(".modal-footer").innerHTML = footerHTML;
		event.open();
	},
	//start learning(name => doc.data[name])
	"start": function (doc, name, hideMode = "ja") {
		//exist check
		if (doc.data[name]) {
			//shuffle list
			const shuffle = function (array) {
				for (let i = array.length - 1; i >= 0; i--) {
					let rand = Math.floor(Math.random() * (i + 1));
					// 配列の数値を入れ替える
    				[array[i], array[rand]] = [array[rand], array[i]]
				}
				return array;
			}
			const qdata = shuffle(doc.data[name]);
			let exportHTML = "";
			if (hideMode === "ja") exportHTML = `<div id="ankibench-learn-title">${name}（英語 ⇒ 日本語）<div id="ankibench-learn-percent" data-sum="${qdata.length}" style="width:0%"></div></div><div class="ankibench-card-finish">すべてのカードを覚えました<br>別の単元を覚えるには、上の「単元選択」をタップしてから、単元を選んでください。</div>`;
			else exportHTML = `<div id="ankibench-learn-title" data-sum="${qdata.length}">${name}（日本語 ⇒ 英語）<div id="ankibench-learn-percent" data-sum="${qdata.length}" style="width:0%"></div></div><div class="ankibench-card-finish">すべてのカードを覚えました<br>別の単元を覚えるには、上の「単元選択」をタップしてから、単元を選んでください。</div>`;
			qdata.forEach(function (data) {
				const question = DOMPurify.sanitize(data[0]);
				let answer = '<ul class="browser-default">';
				data[1].split("/").forEach(function (ans) {
					answer += DOMPurify.sanitize(`<li>${ans}</li>`);
				});

				//Check whether question is a word
				let qmode;
				if (question.trim().split(" ").length === 1 && question.trim().match(/^[a-zA-Z]*$/)) {
					qmode = "english";
				} else {
					qmode = "normal";
				}
				exportHTML += `<div class="ankibench-card ${qmode}" data-unrecollect="1" data-hidemode="${hideMode}"><div class="ankibench-card-question" onclick="ankiBench.changeCardView(event);">${question}</div><div class="ankibench-card-answer">${answer}</div><footer class="row"><a href="javascript:void(0);" class="col s6 l2 offset-l4 btn blue lighten-1 waves-effect" onclick="ankiBench.answerToCard(event,false)">わからない</a><a href="javascript:void(0);" class="col s6 l2 btn pink lighten-1 waves-effect" onclick="ankiBench.answerToCard(event,true);">わかる</a></footer></div>`;
			});
			document.getElementById("ankibench-learn").innerHTML = exportHTML;
			document.querySelectorAll("#ankibench-learn div.ankibench-card").forEach(function (elem) {
				if (elem.classList.contains("english")) {
					if (elem.dataset.hidemode === "ja") elem.querySelector(".ankibench-card-answer").classList.add("hidden");
					else elem.querySelector(".ankibench-card-question").classList.add("hidden");
				} else {
					elem.querySelector(".ankibench-card-answer").classList.add("hidden");
				}
				elem.addEventListener("click", function (e) {
					const target = e.currentTarget;
					//english words learning mode
					if (target.classList.contains("english")) {
						if (target.dataset.hidemode === "ja") {
							if (target.querySelector(".ankibench-card-answer").classList.contains("show")) {
								target.querySelector(".ankibench-card-answer").classList.remove("show");
								target.querySelector(".ankibench-card-answer").classList.add("hidden");
							} else {
								target.querySelector(".ankibench-card-answer").classList.remove("hidden");
								target.querySelector(".ankibench-card-answer").classList.add("show");
							}
						} else {
							const wordElem = target.querySelector(".ankibench-card-question");
							if (wordElem.classList.contains("showFirstLetter")) {
								wordElem.classList.remove("showFirstLetter");
								wordElem.classList.add("show");
							} else if (wordElem.classList.contains("show")) {
								wordElem.classList.remove("show");
								wordElem.classList.add("hidden");
							} else {
								wordElem.classList.add("showFirstLetter");
								wordElem.classList.remove("hidden");
							}
						}
					}
					//normal questions mode
					else {
						target.querySelector(".ankibench-card-answer").classList.toggle("show");
						target.querySelector(".ankibench-card-answer").classList.toggle("hidden");
					}
				});
			});
		} else {
			return;
		}

		//switch to #ankibench-learn
		const tab = M.Tabs.getInstance(document.getElementById("header-tab"));
		tab.select("ankibench-learn");

	},

	"startFromList": function (event, key) {
		ankiBench.modal(`<h5>出題モードの選択</h5><p>英単語のカードでどちらを答えるか選んでください。<br>※通常の問題カードは、ここでの選択の影響は受けません。</p><div class="row"><a href="javascript:void(0)" class="modal-close waves-effect btn-large pink col s12 l4 offset-l2" onclick="ankiBench.start(ankiBench.getEmbedJSON(), '${key}', 'ja');">英語 ⇒ 日本語</a><a href="javascript:void(0)" class="modal-close waves-effect btn-large blue lighten-1 col s12 l4" onclick="ankiBench.start(ankiBench.getEmbedJSON(), '${key}', 'en');">日本語 ⇒ 英語</a></div>`, `<a href="javascript:void(0)" class="modal-close waves-effect btn-flat">キャンセル</a>`)
	},
	"answerToCard": function (event, qbool) {
		const card = event.currentTarget.parentElement.parentElement;
		const unrecollectedLevel = parseInt(card.dataset["unrecollect"]);
		setTimeout(function () {
			//Reset card
			if (card.classList.contains("english")) {
				if (card.dataset.hidemode === "ja") {
					card.querySelector(".ankibench-card-answer").classList.add("hidden");
					card.querySelector(".ankibench-card-answer").classList.remove("show");
				} else {
					card.querySelector(".ankibench-card-question").classList.add("hidden");
					card.querySelector(".ankibench-card-question").classList.remove("show");
					card.querySelector(".ankibench-card-question").classList.remove("showFirstLetter");
				}
			} else {
				card.querySelector(".ankibench-card-answer").classList.add("hidden");
				card.querySelector(".ankibench-card-answer").classList.remove("show");
			}
		}, 250);


		if (qbool === true) {
			if (unrecollectedLevel == 1) {
				card.remove();
				//update percent
				const graph = document.getElementById("ankibench-learn-percent");
				const percent = 100 - (document.querySelectorAll("#ankibench-learn div.ankibench-card").length / parseInt(graph.dataset["sum"]) * 100);
				graph.style.width = percent + "%";
			} else {
				document.getElementById("ankibench-learn").insertBefore(card, document.querySelector("#ankibench-learn div.ankibench-card:nth-child(3)"));
				card.dataset["unrecollect"] = unrecollectedLevel - 1;
			}
		} else {
			card.dataset["unrecollect"] = unrecollectedLevel + 1;
			if (document.querySelectorAll("#ankibench-learn div.ankibench-card").length > 15) {
				document.getElementById("ankibench-learn").insertBefore(card, document.querySelector("#ankibench-learn div.ankibench-card:nth-last-child(15)"));
			} else {
				document.getElementById("ankibench-learn").insertBefore(card, document.querySelector("#ankibench-learn div.ankibench-card:nth-child(3)"));
			}
		}
	}
}
//After page loading
document.addEventListener("DOMContentLoaded", function () {
	//init tabs
	M.Tabs.init(document.querySelectorAll(".tabs"));
	//init modals
	M.Modal.init(document.querySelectorAll(".modal"), {
		startingTop: "10%"
	});

	//load JSON from <script>
	ankiBench.load(ankiBench.getEmbedJSON());
});
