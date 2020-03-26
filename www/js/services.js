/***********************************************************************************
 * App Services. This contains the logic of the application organised in modules/objects. *
 ***********************************************************************************/

//localStorage.clear();
if (localStorage.getItem("compteurTODO")==null){
  localStorage.setItem("compteurTODO",0);
}

myApp.services = {

  /////////////////
  // Task Service //
  /////////////////
  tasks: {

    // Creates a new task and attaches it to the pending task list.
    create: function(data) {

      let taskStatus = 'pending';

      //dateTask < current date
      function dateIsBeforeToday(dateTask) {
        let intDateTask = new Date(dateTask).getTime();
        let currentDate = new Date();
        let intCurrentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime();
        return intDateTask < intCurrentDate+86400000;
      }

      let dataStorage = JSON.parse(JSON.stringify(data));
      if (dateIsBeforeToday(dataStorage.dateFin)){
        dataStorage.dateFin = "";
      }
      if (typeof (data.idCompteur) == "undefined"){
        dataStorage.idCompteur = localStorage.getItem("compteurTODO");
        dataStorage.status = 'pending';
        window.localStorage.setItem("todo-"+localStorage.getItem("compteurTODO"),JSON.stringify(dataStorage));
        localStorage.setItem("compteurTODO", parseInt(localStorage.getItem("compteurTODO"))+1);
      }

      // Task item template.
      var taskItem = ons.createElement(
        '<ons-list-item tappable component="task" category="' + myApp.services.categories.parseId(data.category)+ '" style="background-color: #1a1a1a">' +
          '<label class="left">' +
          ((dataStorage.status==='completed') ? '<ons-checkbox checked="true"></ons-checkbox>' : '<ons-checkbox></ons-checkbox>') +
          '</label>' +
          '<div class="center">' +
            '<div class="title">' + data.title + '</div>' + '<div class="dateFin">' + ((dataStorage.dateFin!=="") ? ('&nbsp; &#9200; ' + myApp.services.tasks.formatDate(dataStorage.dateFin)) : ('')) + '</div>' +
          '</div>' +
          '<div class="right">' +
            '<ons-icon style="color: grey; padding-left: 4px" icon="ion-trash-b" size="24px" style="color: red;"></ons-icon>' +
          '</div>' +
        '</ons-list-item>'
      );

      // Store data within the element.
      taskItem.data = dataStorage;

      // Add 'completion' functionality when the checkbox changes.
      taskItem.data.onCheckboxChange = function(event) {
        myApp.services.animators.swipe(taskItem, function() {
          //var listId = (taskItem.parentElement.id === 'pending-list' && event.target.checked) ? '#completed-list' : '#pending-list';
          var listId = '#pending-list';
          if (taskItem.parentElement.id === 'pending-list' && event.target.checked) {
            listId = '#inProgress-list';
            event.target.checked=false;
            let tempNewData = JSON.stringify(dataStorage);
            let newData = JSON.parse(tempNewData);
            let compteur = newData.idCompteur;
            let newTaskData = JSON.parse(localStorage.getItem('todo-'+compteur));
            newTaskData.status = 'inProgress';
            taskStatus = 'inProgress';
            taskItem.data.status = 'inProgress';
            localStorage.setItem('todo-'+compteur, JSON.stringify(newTaskData));
            //myApp.services.tasks.update(taskItem,newData);
          }
          if (taskItem.parentElement.id === 'inProgress-list' && event.target.checked){
            listId = '#completed-list';
            event.target.checked=true;
            let tempNewData = JSON.stringify(dataStorage);
            let newData = JSON.parse(tempNewData);
            let compteur = newData.idCompteur;
            let newTaskData = JSON.parse(localStorage.getItem('todo-'+compteur));
            newTaskData.status = 'completed';
            taskStatus = 'completed';
            taskItem.data.status = 'completed';
            localStorage.setItem('todo-'+compteur, JSON.stringify(newTaskData));
            //myApp.services.tasks.update(taskItem,newData);
          }
          if (taskItem.parentElement.id === 'completed-list'){
            listId = '#pending-list';
            event.target.checked=false;
            let tempNewData = JSON.stringify(dataStorage);
            let newData = JSON.parse(tempNewData);
            let compteur = newData.idCompteur;
            let newTaskData = JSON.parse(localStorage.getItem('todo-'+compteur));
            newTaskData.status = 'pending';
            taskStatus = 'pending';
            taskItem.data.status = 'pending';
            localStorage.setItem('todo-'+compteur, JSON.stringify(newTaskData));
            //myApp.services.tasks.update(taskItem,newData);
          }
          document.querySelector(listId).appendChild(taskItem);
        });
      };

      taskItem.addEventListener('change', taskItem.data.onCheckboxChange);

      // Add button functionality to remove a task.
      taskItem.querySelector('.right').onclick = function() {
        myApp.services.tasks.remove(taskItem);
      };

      // Add functionality to push 'details_task.html' page with the current element as a parameter.
      taskItem.querySelector('.center').onclick = function() {
        document.querySelector('#myNavigator')
          .pushPage('pages/details_task.html',
            {
              animation: 'lift',
              data: {
                element: taskItem
              }
            }
          );
      };

      // Check if it's necessary to create new categories for this item.
      myApp.services.categories.updateAdd(taskItem.data.category);

      // Add the highlight if necessary.
      if (taskItem.data.highlight) {
        taskItem.classList.add('highlight');
      }

      // Insert urgent tasks at the top and non urgent tasks at the bottom.
      var list = document.querySelector('#'+dataStorage.status+'-list');
      list.insertBefore(taskItem, taskItem.data.urgent ? list.firstChild : null);
    },

    // Modifies the inner data and current view of an existing task.
    update: function(taskItem, data) {
      if (data.title !== taskItem.data.title) {
        // Update title view.
        taskItem.querySelector('.center').innerHTML = '<div class="title">' + data.title + '</div>' + '<div class="dateFin">' + ((data.dateFin!=="") ? ('&nbsp; &#9200; ' + myApp.services.tasks.formatDate(data.dateFin)) : ('')) + '</div>';
      }

      if (data.category !== taskItem.data.category) {
        // Modify the item before updating categories.
        taskItem.setAttribute('category', myApp.services.categories.parseId(data.category));
        // Check if it's necessary to create new categories.
        myApp.services.categories.updateAdd(data.category);
        // Check if it's necessary to remove empty categories.
        myApp.services.categories.updateRemove(taskItem.data.category);

      }

      // Add or remove the highlight.
      taskItem.classList[data.highlight ? 'add' : 'remove']('highlight');

      let oldStatus;

      let dataTemp = JSON.parse(localStorage.getItem("todo-"+taskItem.data.idCompteur));
      if (typeof JSON.parse(JSON.stringify(data)).status != "undefined"){
        oldStatus = JSON.parse(JSON.stringify(data)).status;
      }else {
        oldStatus = dataTemp.status;
      }

      let nameTask = "todo-"+taskItem.data.idCompteur;

      // Store the new data within the element.
      //taskItem.data = JSON.parse(JSON.stringify(data));

      let tempData = JSON.stringify(JSON.parse(JSON.stringify(data)));
      let newDataParse = JSON.parse(tempData);

      //dateTask < current date
      function dateIsBeforeToday(dateTask) {
        let intDateTask = new Date(dateTask).getTime();
        let currentDate = new Date();
        let intCurrentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime();
        return intDateTask < intCurrentDate+86400000;
      }

      if (dateIsBeforeToday(newDataParse.dateFin) && newDataParse.dateFin !== ""){
        newDataParse.dateFin = taskItem.data.dateFin;
      }

      //newDataParse.idCompteur = numIdCompteur;
      newDataParse.idCompteur = taskItem.data.idCompteur;
      newDataParse.status = oldStatus;
      if (!(data.title === taskItem.data.title && data.category === taskItem.data.category && data.description === taskItem.data.description && data.highlight === taskItem.data.highlight && data.dateFin === taskItem.data.dateFin)) {
        localStorage.setItem(nameTask, JSON.stringify(newDataParse));
        taskItem.querySelector('.list-item__center > .dateFin').innerHTML = ((newDataParse.dateFin!=="") ? ('&nbsp; &#9200; ' + myApp.services.tasks.formatDate(newDataParse.dateFin)) : (''));
      }
    },

    // Deletes a task item and its listeners.
    remove: function(taskItem) {
      taskItem.removeEventListener('change', taskItem.data.onCheckboxChange);
      localStorage.removeItem("todo-" + taskItem.data.idCompteur);
      myApp.services.animators.remove(taskItem, function() {
        // Remove the item before updating the categories.
        taskItem.remove();
        // Check if the category has no items and remove it in that case.
        myApp.services.categories.updateRemove(taskItem.data.category);
      });
    },

    //Deletes all tasks of the app
    deleteAllTasks: function () {
      Array.prototype.forEach.call(document.querySelectorAll('[component="task"]'), function(element) {
        myApp.services.tasks.remove(element);
      });
      localStorage.setItem("compteurTODO",0);
    },

    //Format date format
    formatDate: function (date) {
      let newDateArray = date.split('-');
      let newDate = newDateArray[2] + "/" + newDateArray[1] + "/" + newDateArray[0];
      return newDate;
    },

    deleteCategoryTasks: function (categoryLabel) {
      Array.prototype.forEach.call(document.querySelectorAll('[component="task"]'), function(element) {
        if (!(categoryLabel === null || categoryLabel === "")) {
          if (element.data.category === categoryLabel){
            localStorage.removeItem("todo-"+element.data.idCompteur);
            myApp.services.tasks.remove(element);
          }
        }
      });
    },
  },

  /////////////////////
  // Category Service //
  ////////////////////
  categories: {

    // Creates a new category and attaches it to the custom category list.
    create: function(categoryLabel) {
      var categoryId = myApp.services.categories.parseId(categoryLabel);

      // Category item template.
      var categoryItem = ons.createElement(
        '<ons-list-item tappable category-id="' + categoryId + '">' +
          '<div class="left">' +
            '<ons-radio name="categoryGroup" input-id="radio-'  + categoryId + '"></ons-radio>' +
          '</div>' +
          '<label class="center" for="radio-' + categoryId + '">' +
            (categoryLabel || 'Pas de catégorie') +
          '</label>' +
          '<div class="right">' +
            '<ons-icon style="padding-left: 4px; color: #63EAA7" icon="ion-trash-b" size="24px"></ons-icon>' +
          '</div>' +
        '</ons-list-item>'
      );

      // Add button functionality to remove a category and therefore all its tasks.
      categoryItem.querySelector('.right').onclick = function() {
        ons.notification.confirm(
            {
              title: 'Supprimer les tâches de la catégorie ' + categoryItem.getAttribute("category-id") ,
              message: 'Attention cette action est irréversible.',
              buttonLabels: ['Annuler', 'Supprimer']
            }
        ).then(function(buttonIndex) {
          if (buttonIndex === 1) {
            // If 'Supprimer' button was pressed, delete all the tasks.
            myApp.services.tasks.deleteCategoryTasks(categoryItem.getAttribute("category-id"));
            // Set selected category to 'All', refresh and pop page.
            document.querySelector('#default-category-list ons-list-item ons-radio').checked = true;
            document.querySelector('#default-category-list ons-list-item').updateCategoryView();
            document.querySelector('#myNavigator').popPage();
          }
        });
      };

      // Adds filtering functionality to this category item.
      myApp.services.categories.bindOnCheckboxChange(categoryItem);

      // Attach the new category to the corresponding list.
      document.querySelector('#custom-category-list').appendChild(categoryItem);
      myApp.tempStorage.categories.push(categoryLabel);
    },

    // On task creation/update, updates the category list adding new categories if needed.
    updateAdd: function(categoryLabel) {
      var categoryId = myApp.services.categories.parseId(categoryLabel);
      var categoryItem = document.querySelector('#menuPage ons-list-item[category-id="' + categoryId + '"]');

      if (!categoryItem) {
        // If the category doesn't exist already, create it.
        myApp.services.categories.create(categoryLabel);
      }
    },

    // On task deletion/update, updates the category list removing categories without tasks if needed.
    updateRemove: function(categoryLabel) {
      var categoryId = myApp.services.categories.parseId(categoryLabel);
      var categoryItem = document.querySelector('#tabbarPage ons-list-item[category="' + categoryId + '"]');

      if (!categoryItem) {
        // If there are no tasks under this category, remove it.
        myApp.services.categories.remove(document.querySelector('#custom-category-list ons-list-item[category-id="' + categoryId + '"]'));
        let newCategories = [];
        for (let i = 0; i < myApp.tempStorage.categories.length; i++) {
          if (myApp.tempStorage.categories[i]!==categoryLabel){
            newCategories.push(myApp.tempStorage.categories[i]);
          }
        }
        myApp.tempStorage.categories = newCategories;
      }
    },

    // Deletes a category item and its listeners.
    remove: function(categoryItem) {
      if (categoryItem) {
        // Remove listeners and the item itself.
        categoryItem.removeEventListener('change', categoryItem.updateCategoryView);
        categoryItem.remove();
      }
    },

    // Adds filtering functionality to a category item.
    bindOnCheckboxChange: function(categoryItem) {
      var categoryId = categoryItem.getAttribute('category-id');
      var allItems = categoryId === null;

      categoryItem.updateCategoryView = function() {
        var query = '[category="' + (categoryId || '') + '"]';

        var taskItems = document.querySelectorAll('#tabbarPage ons-list-item');
        for (var i = 0; i < taskItems.length; i++) {
          taskItems[i].style.display = (allItems || taskItems[i].getAttribute('category') === categoryId) ? '' : 'none';
        }
      };

      categoryItem.addEventListener('change', categoryItem.updateCategoryView);
    },

    // Transforms a category name into a valid id.
    parseId: function(categoryLabel) {
      return categoryLabel ? categoryLabel.replace(/\s\s+/g, ' ').toLowerCase() : '';
    }
  },

  //////////////////////
  // Animation Service //
  /////////////////////
  animators: {

    // Swipe animation for task completion.
    swipe: function(listItem, callback) {
      var animation = (listItem.parentElement.id === 'completed-list') ? 'animation-swipe-left' : 'animation-swipe-right';
      listItem.classList.add('hide-children');
      listItem.classList.add(animation);

      setTimeout(function() {
        listItem.classList.remove(animation);
        listItem.classList.remove('hide-children');
        callback();
      }, 950);
    },

    // Remove animation for task deletion.
    remove: function(listItem, callback) {
      listItem.classList.add('animation-remove');
      listItem.classList.add('hide-children');

      setTimeout(function() {
        callback();
      }, 750);
    }
  }
};
