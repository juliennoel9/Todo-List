// App logic
window.myApp = {tempStorage : {categories : [], selectedCategory : ''}};

document.addEventListener('init', function(event) {
  var page = event.target;

  // Each page calls its own initialization controller.
  if (myApp.controllers.hasOwnProperty(page.id)) {
    myApp.controllers[page.id](page);
  }

  // Fill the lists with initial data when the pages we need are ready.
  // This only happens once at the beginning of the app.
  if (page.id === 'menuPage' || page.id === 'pendingTasksPage') {
    if (document.querySelector('#menuPage')
      && document.querySelector('#pendingTasksPage')
      && !document.querySelector('#pendingTasksPage ons-list-item')
    ) {

      if (localStorage.getItem("compteurTODO")!=null){
        for (let i = 0; i < parseInt(localStorage.getItem("compteurTODO")); i++) {
          if (typeof(localStorage.getItem("todo-"+i))!="undefined" && localStorage.getItem("todo-"+i)!=null){
            let dataTemp = JSON.parse(localStorage.getItem("todo-"+i));
            if (dataTemp.dateFin!==""){
              dateFinArray = dataTemp.dateFin.split('-');
              if (Date.UTC(parseInt(dateFinArray[0]),parseInt(dateFinArray[1])-1, parseInt(dateFinArray[2])) <= Date.now()){
                localStorage.removeItem("todo-"+dataTemp.idCompteur);
              }else {
                myApp.services.tasks.create(dataTemp);
              }
            }else {
              myApp.services.tasks.create(dataTemp);
            }
          }
        }
      }
    }
  }

  dragula([document.getElementById('completed-list'), document.getElementById('inProgress-list'), document.getElementById('pending-list')], {
    revertOnSpill: true
  });
});
