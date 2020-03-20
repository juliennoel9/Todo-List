/***********************************************************************
 * App Controllers. These controllers will be called on page initialization. *
 ***********************************************************************/

myApp.controllers = {

  //////////////////////////
  // Tabbar Page Controller //
  //////////////////////////
  tabbarPage: function(page) {
    // Set button functionality to open/close the menu.
    page.querySelector('[component="button/menu"]').onclick = function() {
      document.querySelector('#mySplitter').left.toggle();
    };

    // Set button functionality to push 'new_task.html' page.
    Array.prototype.forEach.call(page.querySelectorAll('[component="button/new-task"]'), function(element) {
      element.onclick = function() {
        document.querySelector('#myNavigator').pushPage('pages/new_task.html');
      };

      element.show && element.show(); // Fix ons-fab in Safari.
    });

    page.querySelector('[component="button/deleteAllTasksToolBar"]').onclick = function() {
      ons.notification.confirm(
          {
            title: 'Supprimer toutes les tâches',
            message: 'Attention cette action est irrversible.',
            buttonLabels: ['Annuler', 'Supprimer']
          }
      ).then(function(buttonIndex) {
        if (buttonIndex === 1) {
          // If 'Supprimer' button was pressed, delete all the tasks.
          myApp.services.tasks.deleteAllTasks();
          // Set selected category to 'All', refresh and pop page.
          document.querySelector('#default-category-list ons-list-item ons-radio').checked = true;
          document.querySelector('#default-category-list ons-list-item').updateCategoryView();
          document.querySelector('#myNavigator').popPage();
        }
      });
    };

    // Change tabbar animation depending on platform.
    page.querySelector('#myTabbar').setAttribute('animation', ons.platform.isAndroid() ? 'slide' : 'none');
  },

  ////////////////////////
  // Menu Page Controller //
  ////////////////////////
  menuPage: function(page) {
    // Set functionality for 'No Category' and 'All' default categories respectively.
    myApp.services.categories.bindOnCheckboxChange(page.querySelector('#default-category-list ons-list-item[category-id=""]'));
    myApp.services.categories.bindOnCheckboxChange(page.querySelector('#default-category-list ons-list-item:not([category-id])'));

    // Change splitter animation depending on platform.
    document.querySelector('#mySplitter').left.setAttribute('animation', ons.platform.isAndroid() ? 'overlay' : 'reveal');

    page.querySelector('#deleteAllTasks').onclick = function() {
      ons.notification.confirm(
          {
            title: 'Supprimer toutes les tâches',
            message: 'Attention cette action est irrversible.',
            buttonLabels: ['Annuler', 'Supprimer']
          }
      ).then(function(buttonIndex) {
        if (buttonIndex === 1) {
          // If 'Supprimer' button was pressed, delete all the tasks.
          myApp.services.tasks.deleteAllTasks();
          // Set selected category to 'All', refresh and pop page.
          document.querySelector('#default-category-list ons-list-item ons-radio').checked = true;
          document.querySelector('#default-category-list ons-list-item').updateCategoryView();
          document.querySelector('#myNavigator').popPage();
        }
      });
    };
  },

  ////////////////////////////
  // New Task Page Controller //
  ////////////////////////////
  newTaskPage: function(page) {

    let selector = page.querySelector('.select-input');
    for (let i = 0; i < myApp.tempStorage.categories.length; i++) {
      let newChild = document.createElement("option");
      newChild.setAttribute("value", myApp.tempStorage.categories[i]);
      newChild.innerText = myApp.tempStorage.categories[i];
      selector.append(newChild);
    }

    page.querySelector('[component="select/chooseCategory"]').onchange = function (event) {
      page.querySelector('#category-input').value = event.target.selectedOptions[0].innerText;
    };

    // Set button functionality to save a new task.
    Array.prototype.forEach.call(page.querySelectorAll('[component="button/save-task"]'), function(element) {
      element.onclick = function() {
        var newTitle = page.querySelector('#title-input').value;

        if (newTitle) {
          // If input title is not empty, create a new task.
          myApp.services.tasks.create(
            {
              title: newTitle,
              category: page.querySelector('#category-input').value,
              description: page.querySelector('#description-input').value,
              highlight: page.querySelector('#highlight-input').checked,
              urgent: page.querySelector('#urgent-input').checked,
              dateFin: page.querySelector('#dateFin').value
            }
          );

          // Set selected category to 'All', refresh and pop page.
          document.querySelector('#default-category-list ons-list-item ons-radio').checked = true;
          document.querySelector('#default-category-list ons-list-item').updateCategoryView();
          document.querySelector('#myNavigator').popPage();

        } else {
          // Show alert if the input title is empty.
          ons.notification.alert('You must provide a task title.');
        }
      };
    });
  },

  ////////////////////////////////
  // Details Task Page Controller //
  ///////////////////////////////
  detailsTaskPage: function(page) {
    // Get the element passed as argument to pushPage.
    var element = page.data.element;
    let dataTask;

    if (localStorage.getItem("compteurTODO")!=null){
      for (let i = 0; i < parseInt(localStorage.getItem("compteurTODO")); i++) {
        if (typeof(localStorage.getItem("todo-"+i))!="undefined" && localStorage.getItem("todo-"+i)!=null){
          let dataTemp = JSON.parse(localStorage.getItem("todo-"+i));
          if (dataTemp.title === element.querySelector('.list-item__center').textContent){
            dataTask = dataTemp;
          }
        }
      }
    }

    // Fill the view with the stored data.
    // page.querySelector('#title-input').value = element.data.title;
    // page.querySelector('#category-input').value = element.data.category;
    // page.querySelector('#description-input').value = element.data.description;
    // page.querySelector('#highlight-input').checked = element.data.highlight;
    // page.querySelector('#urgent-input').checked = element.data.urgent;

    page.querySelector('#title-input').value = dataTask.title;
    page.querySelector('#category-input').value = dataTask.category;
    page.querySelector('#description-input').value = dataTask.description;
    page.querySelector('#highlight-input').checked = dataTask.highlight;
    page.querySelector('#urgent-input').checked = dataTask.urgent;
    page.querySelector('#dateFin').value = dataTask.dateFin;

    let selector = page.querySelector('.select-input');
    for (let i = 0; i < myApp.tempStorage.categories.length; i++) {
      let newChild = document.createElement("option");
      newChild.setAttribute("value", myApp.tempStorage.categories[i]);
      newChild.innerText = myApp.tempStorage.categories[i];
      selector.append(newChild);
    }

    page.querySelector('[component="select/chooseCategory"]').onchange = function (event) {
      page.querySelector('#category-input').value = event.target.selectedOptions[0].innerText;
    };

    // Set button functionality to save an existing task.
    page.querySelector('[component="button/save-task"]').onclick = function() {
      var newTitle = page.querySelector('#title-input').value;

      if (newTitle) {
        // If input title is not empty, ask for confirmation before saving.
        ons.notification.confirm(
          {
            title: 'Save changes?',
            message: 'Previous data will be overwritten.',
            buttonLabels: ['Discard', 'Save']
          }
        ).then(function(buttonIndex) {
          if (buttonIndex === 1) {
            // If 'Save' button was pressed, overwrite the task.
            myApp.services.tasks.update(element,
              {
                title: newTitle,
                category: page.querySelector('#category-input').value,
                description: page.querySelector('#description-input').value,
                ugent: element.data.urgent,
                highlight: page.querySelector('#highlight-input').checked,
                dateFin: page.querySelector('#dateFin').value
              }
            );

            // Set selected category to 'All', refresh and pop page.
            document.querySelector('#default-category-list ons-list-item ons-radio').checked = true;
            document.querySelector('#default-category-list ons-list-item').updateCategoryView();
            document.querySelector('#myNavigator').popPage();
          }
        });

      } else {
        // Show alert if the input title is empty.
        ons.notification.alert('You must provide a task title.');
      }
    };
  }
};
