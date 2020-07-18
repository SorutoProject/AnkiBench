/*
    AnkiBench
    
    main JS
    (c)2020 Soruto Project.
    MIT Licensed.
*/


let pageNo = 0;//add 1 when pushstated to detect "back" or "forward"
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
            if(inViewElem === document.querySelector(`#pages > div.active-view`)) { return;}
            document.querySelectorAll("#pages > div").forEach(function (elem) {
                if(elem !== inViewElem){
                    elem.classList.remove("active-view");
                    elem.classList.add("outView");
                    setTimeout(function(){
                        elem.style.display = "none";
                        elem.classList.remove("outView");
                    },300);
                }
            });

            inViewElem.style.display = "block";
            inViewElem.classList.add("inView");
            inViewElem.classList.add("active-view");
            setTimeout(function(){
                inViewElem.classList.remove("inView");
            },300);
        }else{
            throw view + " is not found.";
        }

        pageNo++;
        history.pushState({
            view:view,
            pageNo:pageNo
        },null,".#" + view);

        if(view === "home") document.getElementById("back-button").style.display = "none";
        else document.getElementById("back-button").style.display = "list-item";
    },
    edit:{
        add: function(){
            const newName = prompt("作成する単元の名前を入力してください");
            if(newName !== null && newName !== ""){
                ankiBench.userData.data.push({
                    "name":newName,
                    "cards":[]
                });

                
                let homeList = document.querySelector("#home-list");
                if(!homeList.classList.contains("collection")){
                    homeList.outerHTML = `<ui id="home-list" class="collection"></ui>`;
                    homeList = document.querySelector("#home-list");
                }

                const newItem = document.createElement("li");
                newItem.classList.add("collection-item");
                newItem.innerHTML = `<div class="row"><span class="col s8 l10">${newName}</span><span class="col s2 l1 btn-flat waves-effect center-align"><i class="material-icons md-play_arrow"></i></span><span class="col s2 l1 btn-flat waves-effect center-align"><i class="material-icons md-edit"></i></span></div>`;
                newItem.dataset["id"] = newName;
                homeList.appendChild(newItem);
            }else{
                if(newName === ""){
                    M.toast({
                        html:"単元の名前が入力されていません。"
                    })
                }
            }
        }
    },
    //Load .ankibench file content here.
    userData:{
        "properties":{
            "title":"",
            "description":"",
            "author":"",
            "updateDate":""
        },
        "data":[]
    }

}

//popstate
window.onpopstate = function(e){
    const view = e.state.view;
    if (document.querySelector(`#pages > div#${view}`)) {
        
        const inViewElem = document.querySelector(`#pages > div#${view}`);
        document.querySelectorAll("#pages > div").forEach(function (elem) {
            if(elem !== inViewElem){
                if(elem.style.display == "block"){
                    elem.classList.add("outViewBack");
                    elem.classList.remove("active-view");
                    setTimeout(function(){
                        elem.classList.remove("outViewBack");
                        elem.style.display = "none";
                    },300);
                }
            }
        });
        inViewElem.classList.add("inViewBack");
        inViewElem.classList.add("active-view");
        inViewElem.style.display = "block";
        setTimeout(function(){
            inViewElem.classList.remove("inViewBack");
        },300);

        document.querySelector(`#pages > div#${view}`).style.display = "block";
        if(view === "home") document.getElementById("back-button").style.display = "none";
        else document.getElementById("back-button").style.display = "list-item";
    }else{
        throw view + " is not found.";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    //Initialize history
    history.replaceState({
        view:"home",
        pageNo:0
    },null,".#home");

    document.querySelectorAll("#pages > div").forEach(function (elem) {
        elem.style.display = "none";
    });
    document.querySelector(`#pages > div#home`).style.display = "block";
    
    document.getElementById("back-button").style.display = "none";

    //Materialize will be Initialized here
    M.AutoInit();

    //Floating Buttons
    const FloatingActionButton = document.querySelector(".fixed-action-btn");
    M.FloatingActionButton.init(FloatingActionButton, {
        hoverEnabled: false
    });
    M.Tooltip.init(FloatingActionButton);

    //file dropdown
    M.Dropdown.init(document.querySelector("#file-button"),{
        coverTrigger:false
    });

    //ankibench init

    //addEvents
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
                if(ankiBench.userData.data.length === 0){
                    document.getElementById("home-list").textContent = "単元データがありません。右下のボタンから新しい単元を作成しましょう。";
                }

                M.toast({
                    html:`${e.target.files[0].name} を読み込みました。`
                });
            } catch (e) {
                ankiBench.modal.alert(`<h5>エラーが発生しました</h5><p>.ankibenchファイルの読み込みに失敗しました。<br>ファイルが壊れている可能性があります。</p><p>詳細情報:<br>${e}</p>`);
            }
        }
        reader.readAsText(e.target.files[0]);
    })
    document.getElementById("file-save").addEventListener("click", function () {

    });

    document.getElementById("back-button").addEventListener("click", function(){
        history.back();
    });

    //properties page
    document.getElementById("pro-title").addEventListener("change", function(e){
        ankiBench.userData.properties.title = e.currentTarget.value;
    });
    document.getElementById("pro-author").addEventListener("change", function(e){
        ankiBench.userData.properties.author = e.currentTarget.value;
    });
    document.getElementById("pro-description").addEventListener("change", function(e){
        ankiBench.userData.properties.description = e.currentTarget.value;
    });
});
