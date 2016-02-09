export default class TaskManager {
  constructor() {
    this.state = {
      currentTasks: []
    };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
  }

  getTasks(taskIds) {
    var tasks = this.state.currentTasks;

    if (taskIds) {
      tasks = tasks.filter((task) => (taskIds.indexOf(task.id) != -1));
    }

    return tasks.map((task) => task.id);
  }

  addTask(taskId, taskType) {
    var tasks = this.state.currentTasks.slice();

    const otherTasks = tasks
      .filter((task) => ((task.id != taskId) && (task.type == taskType)))
      .map((task) => task.id);

    if (tasks.find((oldTask) => (oldTask.id == taskId)) == undefined) {
       tasks.push({ id: taskId, type: taskType });
    }

    this.setState({ currentTasks: tasks });
    return otherTasks;
  }

  removeTask(taskId) {
    var tasks = this.state.currentTasks.slice();
    tasks = tasks.filter((task) => task.id == taskId);
    this.setState({ currentTasks: tasks });
  }

  removeTasks(taskIds) {
    var tasks = this.state.currentTasks.slice();
    tasks = tasks.filter((task) => taskIds.indexOf(task.id) == -1);
    this.setState({ currentTasks: tasks });
  }
}