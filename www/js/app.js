// App logic.parseInt(localStorage.getItem("compteurTODO"))parseInt(localStorage.getItem("compteurTODO"))parseInt(localStorage.getItem("compteurTODO"))
window.myApp = {};

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
       // myApp.services.fixtures.forEach(function(data) {
       //   myApp.services.tasks.create(data);
       // });

      if (localStorage.getItem("compteurTODO")!=null){
        console.log("salut");
        for (let i = 0; i < parseInt(localStorage.getItem("compteurTODO")); i++) {
          console.log(i);
          let dataTemp = localStorage.getItem("todo-"+i);
          myApp.services.tasks.create(dataTemp);
        }
      }
      //console.log(localStorage);
    }
  }
});
