document.addEventListener('DOMContentLoaded', () => {
  // Initialize variables and elements
  const generateBookQRButton = document.getElementById('generate-book-qr');
  const generateStudentQRButton = document.getElementById('generate-student-qr');
  const bookQRImage = document.getElementById('book-qrImage');
  const studentQRImage = document.getElementById('student-qrImage');
  const inventoryCheckPopup = document.getElementById('inventory-check-popup');
  const sidePanelButtons = document.querySelectorAll('.side-panel button');
  const panels = document.querySelectorAll('.panel');
  const detailsModal = document.getElementById('details-modal');
  const modalBody = document.getElementById('modal-body');
  const closeModal = document.querySelector('.close');
  const notification = document.getElementById('notification');

  // Initialize data from localStorage
  let books = JSON.parse(localStorage.getItem('books')) || [];
  let students = JSON.parse(localStorage.getItem('students')) || [];

  // Function to update localStorage with debouncing
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  const updateLocalStorage = debounce(() => {
    localStorage.setItem('books', JSON.stringify(books));
    localStorage.setItem('students', JSON.stringify(students));
  }, 500);

  // Function to switch panels
  function switchPanel(panelId) {
    panels.forEach(panel => panel.classList.remove('active'));
    document.getElementById(panelId).classList.add('active');

    sidePanelButtons.forEach(button => button.classList.remove('active'));
    const button = document.getElementById(`${panelId}-btn`);
    if (button) {
      button.classList.add('active');
    }
  }

  // Function to show popup
  function showPopup(element, duration) {
    if (element) {
      element.classList.add('show');
      setTimeout(() => {
        element.classList.remove('show');
      }, duration);
    }
  }

  // Function to show notification
  function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `popup ${type}`;
    showPopup(notification, 3000);
  }

  // Function to open modal with book or student details
  function openDetails(index, type) {
    const data = type === 'book' ? books[index] : students[index];
    modalBody.innerHTML = `
      <h2>${type === 'book' ? 'Book Details' : 'Student Details'}</h2>
      <p>${type === 'book' ? `Title: ${data.title}<br>Author: ${data.author}<br>Description: ${data.description}` : `Name: ${data.name}<br>ID: ${data.id}<br>Course: ${data.course}<br>Contact: ${data.contact}<br>Gmail: ${data.gmail}`}</p>
      <img src="${data.qrCode}" alt="QR Code">
    `;
    detailsModal.style.display = 'flex';
  }

  // Function to close modal
  function closeModalHandler() {
    detailsModal.style.display = 'none';
  }

  closeModal.addEventListener('click', closeModalHandler);
  window.addEventListener('click', (event) => {
    if (event.target === detailsModal) {
      closeModalHandler();
    }
  });

  // Event listeners for side panel buttons
  document.getElementById('book-qr-generator-btn').addEventListener('click', () => switchPanel('book-qr-generator'));
  document.getElementById('student-qr-generator-btn').addEventListener('click', () => switchPanel('student-qr-generator'));
  document.getElementById('book-inventory-btn').addEventListener('click', () => switchPanel('book-inventory'));
  document.getElementById('student-list-btn').addEventListener('click', () => switchPanel('student-list'));
  document.getElementById('attendance-btn').addEventListener('click', () => switchPanel('attendance'));
  document.getElementById('dashboard-btn').addEventListener('click', () => switchPanel('dashboard'));

  // Variables for Book QR Code generation and inventory
  const bookTitleInput = document.querySelector("#book-title");
  const bookAuthorInput = document.querySelector("#book-author");
  const bookDescriptionInput = document.querySelector("#book-description");
  const bookGenerateBtn = document.querySelector("#generate-book-qr");
  const bookQrImg = document.querySelector("#book-qrImage");
  const bookInventoryList = document.querySelector("#inventory-list");

  // Function to check for duplicate books
  function isDuplicateBook(title, author) {
    return books.some(book => book.title === title && book.author === author);
  }

  // Function to generate Book QR Code and add to inventory
  bookGenerateBtn.addEventListener("click", () => {
    const title = bookTitleInput.value.trim();
    const author = bookAuthorInput.value.trim();
    const description = bookDescriptionInput.value.trim();

    if (!title || !author || !description) {
      showNotification("Please fill out all fields!", "error");
      return;
    }

    if (isDuplicateBook(title, author)) {
      showNotification("This book already exists!", "error");
      return;
    }

    const qrValue = `Title: ${title}\nAuthor: ${author}\nDescription: ${description}`;

    bookGenerateBtn.innerText = "Generating QR Code...";
    bookQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrValue)}`;

    bookQrImg.addEventListener("load", () => {
      bookGenerateBtn.innerText = "Generate QR Code";

      const book = {
        title,
        author,
        description,
        qrCode: bookQrImg.src
      };
      books.push(book);
      updateLocalStorage();
      updateInventory();
      showPopup(inventoryCheckPopup, 3000);
      showNotification("Book QR code successfully generated!", "success"); // Show notification for book
    });

    bookQrImg.addEventListener("error", () => {
      bookGenerateBtn.innerText = "Generate QR Code";
      showNotification("Failed to generate QR code. Please try again.", "error");
    });
  });

  // Function to update inventory list
  function updateInventory() {
    bookInventoryList.innerHTML = '';
    books.forEach((book, index) => {
      const item = document.createElement('li');
      item.classList.add('inventory-item');
      item.innerHTML = `
        <img src="${book.qrCode}" alt="QR Code">
        <div>
          <h3>Title: ${book.title}</h3>
          <p>Author: ${book.author}</p>
          <p class="short-desc">${book.description.length > 100 ? book.description.slice(0, 100) + '...' : book.description}</p>
        </div>
        <button data-index="${index}" class="details-btn" data-type="book">Details</button>
        <button data-index="${index}" class="delete-btn" data-type="book">Delete</button>
      `;
      bookInventoryList.appendChild(item);
    });

    // Add event listeners for dynamically created buttons
    document.querySelectorAll('.details-btn').forEach(button => {
      button.addEventListener('click', () => {
        const index = button.getAttribute('data-index');
        const type = button.getAttribute('data-type');
        openDetails(index, type);
      });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', () => {
        const index = button.getAttribute('data-index');
        const type = button.getAttribute('data-type');
        if (type === 'book') {
          deleteBook(index);
        } else {
          deleteStudent(index);
        }
      });
    });
  }

  // Function to delete a book from inventory
  function deleteBook(index) {
    books.splice(index, 1);
    updateLocalStorage();
    updateInventory(); // Refresh inventory UI
  }

  // Variables for Student QR Code generation and list
  const studentNameInput = document.querySelector("#student-name");
  const studentIdInput = document.querySelector("#student-id");
  const studentCourseInput = document.querySelector("#student-course");
  const studentContactInput = document.querySelector("#student-contact");
  const studentGmailInput = document.querySelector("#student-gmail");
  const studentGenerateBtn = document.querySelector("#generate-student-qr");
  const studentQrImg = document.querySelector("#student-qrImage");
  const studentList = document.querySelector("#student-list-items");

  // Function to check for duplicate students
  function isDuplicateStudent(id) {
    return students.some(student => student.id === id);
  }

  // Function to generate Student QR Code and add to list
  studentGenerateBtn.addEventListener("click", () => {
    const name = studentNameInput.value.trim();
    const id = studentIdInput.value.trim();
    const course = studentCourseInput.value.trim();
    const contact = studentContactInput.value.trim();
    const gmail = studentGmailInput.value.trim();

    if (!name || !id || !course || !contact || !gmail) {
      showNotification("Please fill out all fields!", "error");
      return;
    }

    if (!/^\d{11}$/.test(contact)) {
      showNotification("Please enter a valid contact no.", "error");
      return;
    }

    if (!/^.+@gmail\.com$/.test(gmail)) {
      showNotification("Please enter a valid gmail address", "error");
      return;
    }

    if (isDuplicateStudent(id)) {
      showNotification("This student ID already exists!", "error");
      return;
    }

    const qrValue = `Name: ${name}\nID: ${id}\nCourse: ${course}\nContact: ${contact}\nGmail: ${gmail}`;

    studentGenerateBtn.innerText = "Generating QR Code...";
    studentQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrValue)}`;

    studentQrImg.addEventListener("load", () => {
      studentGenerateBtn.innerText = "Generate QR Code";

      const student = {
        name,
        id,
        course,
        contact,
        gmail,
        qrCode: studentQrImg.src
      };
      students.push(student);
      updateLocalStorage();
      updateStudentList();
      showPopup(inventoryCheckPopup, 3000);
      showNotification("Student QR code successfully generated!", "success"); // Show notification for student
    });

    studentQrImg.addEventListener("error", () => {
      studentGenerateBtn.innerText = "Generate QR Code";
      showNotification("Failed to generate QR code. Please try again.", "error");
    });
  });

  // Function to update student list
  function updateStudentList() {
    studentList.innerHTML = '';
    students.forEach((student, index) => {
      const item = document.createElement('li');
      item.classList.add('inventory-item');
      item.innerHTML = `
        <img src="${student.qrCode}" alt="QR Code">
        <div>
          <h3>Name: ${student.name}</h3>
          <p>ID: ${student.id}</p>
          <p>Course: ${student.course}</p>
        </div>
        <button data-index="${index}" class="details-btn" data-type="student">Details</button>
        <button data-index="${index}" class="delete-btn" data-type="student">Delete</button>
      `;
      studentList.appendChild(item);
    });

    // Add event listeners for dynamically created buttons
    document.querySelectorAll('.details-btn').forEach(button => {
      button.addEventListener('click', () => {
        const index = button.getAttribute('data-index');
        const type = button.getAttribute('data-type');
        openDetails(index, type);
      });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', () => {
        const index = button.getAttribute('data-index');
        const type = button.getAttribute('data-type');
        if (type === 'book') {
          deleteBook(index);
        } else {
          deleteStudent(index);
        }
      });
    });
  }

  // Function to delete a student from list
  function deleteStudent(index) {
    students.splice(index, 1);
    updateLocalStorage();
    updateStudentList(); // Refresh student list UI
  }

  // Function to add attendance records
  function addAttendance(studentId) {
    const attendanceRecord = {
      studentId,
      dateTime: new Date().toLocaleString()
    };
    // Here you should implement attendance recording logic
    console.log("Attendance recorded:", attendanceRecord);
  }

  // Initialize the system
  updateInventory();
  updateStudentList();
});
