// Collects all task lists.
// An item represents a task.
// itemsContainersSet represents the set of task lists.
const itemsContainersSet = document.querySelectorAll(
  ".items-container"
) as NodeListOf<HTMLDivElement>;

// Variable declaration
let actualContainer: HTMLDivElement,
  actualBtn: HTMLButtonElement,
  actualUL: HTMLUListElement,
  actualForm: HTMLFormElement,
  actualTextInput: HTMLInputElement,
  actualValidation: HTMLSpanElement;

// Adds event listeners to the components of a task list.
function addContainerListeners(currentContainer: HTMLDivElement) {
  const currentContainerDeletionBtn = currentContainer.querySelector(
    ".delete-container-btn"
  ) as HTMLButtonElement;
  const currentAddItemBtn = currentContainer.querySelector(
    ".add-item-btn"
  ) as HTMLButtonElement;
  const currentCloseFormBtn = currentContainer.querySelector(
    ".close-form-btn"
  ) as HTMLButtonElement;
  const currentForm = currentContainer.querySelector("form") as HTMLFormElement;

  deleteBtnListener(currentContainerDeletionBtn);
  addItemBtnListener(currentAddItemBtn);
  closingFormBtnListener(currentCloseFormBtn);
  addFormSubmitListener(currentForm);
  addDDListeners(currentContainer);
}

// Starts adding event listeners to all task lists.
itemsContainersSet.forEach((container: HTMLDivElement) => {
  addContainerListeners(container);
});

// Managing the deletion of a to-do list
function deleteBtnListener(btn: HTMLButtonElement) {
  btn.addEventListener("click", handleContainerDeletion);
}

function handleContainerDeletion(e: MouseEvent) {
  const btn = e.target as HTMLButtonElement;
  const btnsArray = [
    ...document.querySelectorAll(".delete-container-btn"),
  ] as HTMLButtonElement[];
  const containers = [
    ...document.querySelectorAll(".items-container"),
  ] as HTMLDivElement[];
  containers[btnsArray.indexOf(btn)].remove();
}

// Management of adding a task
function addItemBtnListener(btn: HTMLButtonElement) {
  btn.addEventListener("click", handleAddItem);
}

function handleAddItem(e: MouseEvent) {
  const btn = e.target as HTMLButtonElement;
  if (actualContainer) toggleForm(actualBtn, actualForm, false);
  setContainerItems(btn);
  toggleForm(actualBtn, actualForm, true);
  actualTextInput.focus();
}

// Management of the closing of the form for adding a new task
function closingFormBtnListener(btn: HTMLButtonElement) {
  btn.addEventListener("click", () => toggleForm(actualBtn, actualForm, false));
}

// Management of the toggle between the button for adding a new task
// and the form for adding a new task
function toggleForm(
  btn: HTMLButtonElement,
  form: HTMLFormElement,
  action: boolean
) {
  if (!action) {
    form.style.display = "none";
    btn.style.display = "block";
  } else if (action) {
    form.style.display = "block";
    btn.style.display = "none";
  }
}


function addFormSubmitListener(form: HTMLFormElement) {
  form.addEventListener("submit", createNewItem);
}

function addDDListeners(element: HTMLElement) {
  element.addEventListener("dragstart", handleDragStart);
  element.addEventListener("dragover", handleDragOver);
  element.addEventListener("drop", handleDrop);
  element.addEventListener("dragend", handleDragEnd);
}


function setContainerItems(btn: HTMLButtonElement) {
  actualBtn = btn;
  actualContainer = btn.parentElement as HTMLDivElement;
  actualUL = actualContainer.querySelector("ul") as HTMLUListElement;
  actualForm = actualContainer.querySelector("form") as HTMLFormElement;
  actualTextInput = actualContainer.querySelector("input") as HTMLInputElement;
  actualValidation = actualContainer.querySelector(
    ".validation-msg"
  ) as HTMLSpanElement;
}

function createNewItem(e: Event) {
  e.preventDefault();
  // Validation
  if (actualTextInput.value.length === 0) {
    actualValidation.textContent = "Must be at least 1 character long";
    return;
  } else {
    actualValidation.textContent = "";
  }
  // Creating a task (item)
  const itemContent = actualTextInput.value;
  const li = 
    `<li class="item" draggable="true">
      <p>${itemContent}</p>
      <button>X</button>
    </li>`;
  actualUL.insertAdjacentHTML("beforeend", li);

  const item = actualUL.lastElementChild as HTMLLIElement;
  const liBtn = item.querySelector("button") as HTMLButtonElement;
  handleItemDeletion(liBtn);
  addDDListeners(item);
  actualTextInput.value = "";
}

function handleItemDeletion(btn: HTMLButtonElement) {
  btn.addEventListener("click", () => {
    const elToRemove = btn.parentElement as HTMLLIElement;
    elToRemove.remove();
  });
}

// Drag And Drop

// dragSrcEl represents the element to drag and drop.
let dragSrcEl: HTMLElement;

function handleDragStart(this: HTMLElement, e: DragEvent) {
  e.stopPropagation();

  if (actualContainer) toggleForm(actualBtn, actualForm, false);
  dragSrcEl = this;
  // copies the dragged element's innerHTML content.
  e.dataTransfer?.setData("text/html", this.innerHTML);
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
}

function handleDrop(this: HTMLElement, e: DragEvent) {
  e.stopPropagation();
  // receptionEl represents the element that receives the dragged element.
  const receptionEl = this;

  // Management of the deposit of a task in another list
  if (
    dragSrcEl.nodeName === "LI" &&
    receptionEl.classList.contains("items-container")
  ) {
    (receptionEl.querySelector("ul") as HTMLUListElement).appendChild(
      dragSrcEl
    );
    addDDListeners(dragSrcEl);
    handleItemDeletion(dragSrcEl.querySelector("button") as HTMLButtonElement);
  }


  if (dragSrcEl !== this && this.classList[0] === dragSrcEl.classList[0]) {
    dragSrcEl.innerHTML = this.innerHTML;
    this.innerHTML = e.dataTransfer?.getData("text/html") as string;
    if (this.classList.contains("items-container")) {
      addContainerListeners(this as HTMLDivElement);

      this.querySelectorAll("li").forEach((li: HTMLLIElement) => {
        handleItemDeletion(li.querySelector("button") as HTMLButtonElement);
        addDDListeners(li);
      });
    } else {
      addDDListeners(this);
      handleItemDeletion(this.querySelector("button") as HTMLButtonElement);
    }
  }
}

function handleDragEnd(this: HTMLElement, e: DragEvent) {
  e.stopPropagation();

  // If the item that received the dragged/dropped item is an items-container?
  if (this.classList.contains("items-container")) {
    addContainerListeners(this as HTMLDivElement);
    if (this.querySelectorAll("li")) {
      this.querySelectorAll("li").forEach((li: HTMLLIElement) => {
        handleItemDeletion(li.querySelector("button") as HTMLButtonElement);
        addDDListeners(li);
      });
    }
  } else {
    addDDListeners(this);
    handleItemDeletion(this.querySelector("button") as HTMLButtonElement);
  }
}

// Add a new container

const addContainerBtn = document.querySelector(
  ".add-container-btn"
) as HTMLButtonElement;
const addContainerForm = document.querySelector(
  ".add-new-container form"
) as HTMLFormElement;
const addContainerFormInput = document.querySelector(
  ".add-new-container input"
) as HTMLInputElement;
const validationNewContainer = document.querySelector(
  ".add-new-container .validation-msg"
) as HTMLSpanElement;
const addContainerCloseBtn = document.querySelector(
  ".close-add-list"
) as HTMLButtonElement;
const addNewContainer = document.querySelector(
  ".add-new-container"
) as HTMLDivElement;
const containersList = document.querySelector(
  ".main-content"
) as HTMLDivElement;

addContainerBtn.addEventListener("click", () => {
  toggleForm(addContainerBtn, addContainerForm, true);
  addContainerFormInput.focus();
});
addContainerCloseBtn.addEventListener("click", () => {
  toggleForm(addContainerBtn, addContainerForm, false);
});
addContainerForm.addEventListener("submit", createNewContainer);

// Generates a UID in two parts of 3 characters (letters and numbers).
function generateUID() {
  let firstPart: number | string = (Math.random() * 46656) | 0;
  let secondPart: number | string = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
}

function createNewContainer(e: Event) {
  e.preventDefault();

  const uid = generateUID();

  if (addContainerFormInput.value.length === 0) {
    validationNewContainer.textContent = "Must be at least 1 character long";
    return;
  } else {
    validationNewContainer.textContent = "";
  }

  const newContainer = document.createElement("div");
  newContainer.classList.add("items-container");
  const dragAttr: Attr = document.createAttribute("draggable");
  dragAttr.value = "true";
  newContainer.setAttributeNode(dragAttr);

  const newContainerContent = `
    <div class="top-container">
      <h2>${addContainerFormInput.value}</h2>
      <button class="delete-container-btn">X</button>
    </div>
    <ul class="tasks-list"></ul>
    <button class="add-item-btn">Add an item</button>
    <form autocomplete="off">
      <div class="top-form-container">
        <label for="item-${uid}">Add a new item</label>
        <button type="button" class="close-form-btn">X</button>
      </div>
      <input type="text" id="item-${uid}" />
      <span class="validation-msg"></span>
      <button type="submit">Submit</button>
    </form>`;
  newContainer.innerHTML = newContainerContent;
  containersList.insertBefore(newContainer, addNewContainer);
  addContainerFormInput.value = "";
  addContainerListeners(newContainer);
}
