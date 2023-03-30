LISTS = ["To do", "Doing", "Done"]


const source = new EventSource("http://localhost:3000/events");
const listsTypeContainer = document.getElementById("List-Container")

source.addEventListener("message", function getTasks(event) {
  const tasks = JSON.parse(event.data);
  console.log(tasks)
  const newListsContainer = document.createElement("div");
  newListsContainer.id = "ListsContainer";

  LISTS.forEach((list, index) => {
      const listType = document.createElement("div");
      listType.class = list;
      const newTaskList = document.createElement("ol");
      newTaskList.id = "TaskList";
      newTaskList.textContent = list;

      tasks.forEach((task) => {
        if(task.TaskAttributes.Status == list){
          const newTask = document.createElement("li");
          newTask.textContent = task.TaskName;
          newTaskList.appendChild(newTask); 
          makeDeleteButton(task, newTask);
        }
      });
      newListsContainer.appendChild(newTaskList);
  });
  const previousContainer = document.getElementById("ListsContainer");
  if (previousContainer) {
      previousContainer.parentNode.removeChild(previousContainer);
  }
  listsTypeContainer.appendChild(newListsContainer);
});

function makeDeleteButton(task, newTask){
    const deleteButton = document.createElement("button");
    deleteButton.value = "Delete Task";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", async (event) => {
      event.preventDefault();
      const response = await fetch("http://localhost:3000/api/Task/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"                                  
        },
        body: JSON.stringify(task)
      });
      try{
        const data = await response.json();
        console.log(data.status, data);
      }
      catch (error) {
        console.error(error);
      }
    });
    newTask.appendChild(deleteButton);
}

taskForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = {
      TaskName: taskForm.taskName.value,
      TaskAttributes : {
          Description: taskForm.description.value,
          Assignee: taskForm.assignee.value,
          Priority: taskForm.priority.value,
          StartDate: taskForm.startDate.value,
          EndDate: taskForm.endDate.value,
          Status: taskForm.status.value
      }
    };
    try {
      const response = await fetch("http://localhost:3000/Tasks/SendTask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      const responseData = await response.json();
      console.log(responseData.status, responseData);
    } catch (error) {
      console.error(error);
    }
});