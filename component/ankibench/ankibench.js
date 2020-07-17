/*
    AnkiBench
    
    main JS
    (c)2020 Soruto Project.
    MIT Licensed.
*/

//write user file content to abContentsData 
let abContentsData;

const ankiBench = {
    modal:{
        alert:function(html){
            const modal = document.getElementById("main-modal");
            const modalInstance = M.Modal.getInstance(modal);
            modal.querySelector(".modal-content").innerHTML = html;
            modalInstance.open();
        }
    }
    
}

document.addEventListener("DOMContentLoaded", function(){
   //Materialize will be Initialized here
    M.AutoInit();
    

    //ankibench init

    //addEvents
    document.getElementById("file-open").addEventListener("click", function(){
        document.getElementById("file-selector").click();
    });
    document.getElementById("file-selector").addEventListener("change", function(e){
        const reader = new FileReader();
        reader.onload = function(){
            try{
                abContentsData = JSON.parse(reader.result);
            }catch(e){
                ankiBench.modal.alert(`<h5>エラーが発生しました</h5><p>.ankibenchファイルの読み込みに失敗しました。<br>ファイルが壊れている可能性があります。</p><p>詳細情報:<br>${e}</p>`);
            }
        }
        reader.readAsText(e.target.files[0]);
    })
    document.getElementById("file-save").addEventListener("click", function(){

    });
});