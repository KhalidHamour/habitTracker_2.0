/** 
 * @class Model
 * 
 * Controls app data
*/
class Model {
  constructor() {
    this.habits = JSON.parse(localStorage.getItem('habits')) || [];
  }

  bindOnHabitChanges(handler) {
    this.onHabitChanged = handler;
  }

  _commit(habits) {
    this.onHabitChanged(habits);
    localStorage.setItem('habits', JSON.stringify(habits));
    console.table(habits);
  }

  addHabit(habitTitle) {
    const newHabit = {
      id: this.habits.length > 0 ? this.habits[this.habits.length - 1].id + 1 : 1,
      title: habitTitle,
      calendarDays: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      progress: 0,
      daysComplete: 0,
      hide: 1
    }
    this.habits.push(newHabit);
    this._commit(this.habits);
  }

  _getHabit(id){
    return this.habits.findIndex(habit => habit.id === id);
  }

  deleteHabit(id) {
    this.habits = this.habits.filter(habit => habit.id !== id);
    this._commit(this.habits);
  }

  toggleDayComplete(id, day) {
    let index = this._getHabit(id);
    let selectedDay = this.habits[index].calendarDays[day-1];
    
    if(selectedDay === 0){
      this.habits[index].calendarDays[day-1] = 1;
      this.habits[index].daysComplete++;
    }
    else{
      this.habits[index].calendarDays[day-1] = 0;
      this.habits[index].daysComplete--;
    }

    this.habits[index].progress = (this.habits[index].daysComplete / this.habits[index].calendarDays.length) * 100;

    this._commit(this.habits);
  }

  toggleCalendarHidden(id) {
    let index = this._getHabit(id);
    let hidden = this.habits[index].hide;
    
    hidden ? this.habits[index].hide = 0 : this.habits[index].hide = 1;

    this._commit(this.habits);
  }
}

/** 
 * @class View
 * 
 * visual representation of app data
*/
class View {
  
  // initialise static app elements
  constructor() {
    this.app = document.getElementById('root');
    this.addButton = this.createElement('button', 'add-btn');
    this.addButton.innerText = "Track a new Habit";
    this.habitList = this.createElement('section', 'habit-list', 'habit-list');
    this.addHabitModal= this.createAddHabitModal();
    this.modalBackdrop = this.createElement('div', 'modal-backdrop', 'modal-backdrop');
    
    //regex used to extract the habit id from Dom elements 
    this.idRegEx = /[0-9]+/g;

    
    this.app.append(this.addButton, this.habitList, this.addHabitModal, this.modalBackdrop);

    this._initListenters();
  }

  createAddHabitModal(){
    const addHabitModal = this.createElement('div', 'add-habit-modal', 'add-habit-modal'); 
   
    this.modalTitle = this.createElement('h2');
    this.modalTitle.value = "Track a new habit";
   
    this.newHabitInput = this.createElement('input', 'new-habit-input');
    this.newHabitInput.type = 'text';
    this.newHabitInput.placeholder = 'New Habit title';
    
    this.saveBtn = this.createElement('input', 'save-btn');
    this.saveBtn.type = 'button';
    this.saveBtn.value = 'save';
    
    this.cancelBtn = this.createElement('input', 'cancel-btn');
    this.cancelBtn.type = 'button';
    this.cancelBtn.value = 'cancel';

    addHabitModal.append(this.modalTitle, this.newHabitInput, this.saveBtn, this.cancelBtn);

    return addHabitModal;
  }

  createElement(tag, id = null, cls = null, src = null, alt = null) {
    const element = document.createElement(tag);
    if (id) {
      element.id = id;
    }
    if (cls) {
      element.classList.add(cls);
    }
    if (src) {
      element.src = src;
    }
    if (alt) {
      element.alt = alt;
    }
    return element;
  }

  renderTab(habit) {
    const tab = this.createElement('div', `habit${habit.id}-tab`, 'habit-tab');

    const ribbon = this.createElement('div', `habit${habit.id}-ribbon`, 'ribbon');
    ribbon.style.backgroundColor = habit.color;
    
    const progressBar = this.createElement('div', `habit${habit.id}-progress-bar`, 'progress-bar');
    const progress = this.createElement('div', `habit${habit.id}-progress`, 'progress');
    progress.style.backgroundColor = habit.color;
    progress.style.width = `${habit.progress}%`;
    
    const menuBtn = this.createElement('img', `habit${habit.id}-menu-btn`, undefined, './images/menu.svg', 'open menu');
    menuBtn.addEventListener('click', event => {this.menuBtnEvent(this.getHabitID(event.target.id))});
    
    const title = this.createElement('h1');
    title.innerText = habit.title;
    
    progressBar.appendChild(progress);
    tab.append(ribbon, progressBar, title, menuBtn);

    return tab;
  }

  renderDaySquare(day, habit, i){
    const daySquare = this.createElement('div', `habit${habit.id}-calendar-day${i}`, 'calendar-day');
    day === 1 ? daySquare.style.backgroundColor = habit.color : undefined;
    daySquare.addEventListener('click', event => {
      this.daySqyareEvent(this.getHabitID(event.target.id), this.getDayofMonth(event.target.id))
    });

    return daySquare;
  }

  renderCalendar(habit) {
    var i = 1;
    const calendar = this.createElement('div', `habit${habit.id}-calendar`, 'habit-calendar');
    habit.calendarDays.forEach(day => {
      const daySquare = this.renderDaySquare(day, habit, i++);
      calendar.append(daySquare);
    })
    const deleteBtn = this.createElement('button', `habit${habit.id}-remove-btn`, 'button');
    deleteBtn.innerText = 'delete';
    deleteBtn.addEventListener('click', event => {this.deleteBtnEvent(this.getHabitID(event.target.id))});
    calendar.append(deleteBtn);
    habit.hide === 1 ? calendar.classList.add('hidden') : undefined;
    return calendar;
  }

  getHabitID(elementID){
    return elementID.match(this.idRegEx)[0];
  }

  getDayofMonth(elementID){
    return elementID.match(this.idRegEx)[1];
  }
  
  menuBtnEvent(id){
    const calendar = document.getElementById(`habit${id}-calendar`);

    if (calendar.classList.contains('hidden')) {
      calendar.classList.remove('hidden');
    }
    else {
      calendar.classList.add('hidden');
    }
    this.onMenuClick(parseInt(id));
  }
  
  daySqyareEvent(id, day){
    this.onDayClick(parseInt(id), parseInt(day));
  }
  
  deleteBtnEvent(id){
    this.onHabitDelete(parseInt(id));
  }

  _initListenters() {
    this.addButton.addEventListener('click', event => {
      this.addHabitModal.style.display = "block";
      this.modalBackdrop.style.display = "block";
    })
    this.saveBtn.addEventListener('click', event => {
      this.addHabitModal.style.display = "none";
      this.modalBackdrop.style.display = "none";

      this.onHabitAdd(this.newHabitInput.value);
      this.newHabitInput.value = '';

    })
    this.cancelBtn.addEventListener('click', event => {
      this.addHabitModal.style.display = "none";
      this.modalBackdrop.style.display = "none";
      this.newHabitInput.value = '';
    })
  }

  bindOnHabitAdd(handler) {
    this.onHabitAdd = handler;
  }

  bindOnHabitDelete(handler) {
    this.onHabitDelete = handler;
  }

  bindOndayClick(handler) {
    this.onDayClick = handler;
  }

  bindOnMenuClick(handler) {
    this.onMenuClick = handler;
  }

  renderHabits(habits) {
    
    while (this.habitList.firstChild) {
      this.habitList.removeChild(this.habitList.lastChild);
    }

    habits.forEach(habit => {
      const habitTab = this.renderTab(habit);
      const habitCalendar = this.renderCalendar(habit);

      this.habitList.appendChild(habitTab);
      this.habitList.appendChild(habitCalendar);
    })
  }
}
/** 
 * @class Controller
 * 
 * Manages interaction between Model and View
*/
class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.model.bindOnHabitChanges(this.onHabitChanged);
    this.view.bindOnHabitAdd(this.handleAddHabit);
    this.view.bindOnHabitDelete(this.handleDeleteHabit);
    this.view.bindOnMenuClick(this.handleCalenderToggle);
    this.view.bindOndayClick(this.handleDayToggle);

    this.onHabitChanged(this.model.habits);
  }

  onHabitChanged = habits => {
    this.view.renderHabits(habits);
  }

  handleAddHabit = title => {
    this.model.addHabit(title);
  }

  handleDeleteHabit = id => {
    this.model.deleteHabit(id);
  }

  handleDayToggle = (id, day) => {
    this.model.toggleDayComplete(id, day);
  }

  handleCalenderToggle = id => {
      this.model.toggleCalendarHidden(id);
  }
}

const app = new Controller(new Model(), new View());