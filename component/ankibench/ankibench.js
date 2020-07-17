/*
    AnkiBench
    
    main JS
    (c)2020 Soruto Project.
    MIT Licensed.
*/

//write user file content to abContentsData 
let abContentsData = {
    "properties":{
        "description":"",
        "author":"",
        "updateDate":""
    },
    "data":[]
};

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
            document.querySelectorAll("#pages > div").forEach(function (elem) {
                elem.style.display = "none";
            });

            document.querySelector(`#pages > div#${view}`).style.display = "block";
        }else{
            throw view + " is not found.";
        }

        history.pushState({
            view:view
        },null,".#" + view);

        if(view === "home") document.getElementById("back-button").style.display = "none";
        else document.getElementById("back-button").style.display = "list-item";
    },
    edit:{
        add: function(){
            const newName = prompt("作成する単元の名前を入力してください");
            if(newName !== null){
                abContentsData.data.push({
                    "name":newName,
                    "cards":[]
                });
            }
        }
    }

}

//popstate
window.onpopstate = function(e){
    const view = e.state.view;
    if (document.querySelector(`#pages > div#${view}`)) {
        document.querySelectorAll("#pages > div").forEach(function (elem) {
            elem.style.display = "none";
        });

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
        view:"home"
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
                abContentsData = JSON.parse(reader.result);
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
});
