document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM content loaded');

  const profileButton = document.getElementById('profileButton');
  const userDetailsContainer = document.getElementById('userDetailsContainer');

  if (profileButton && userDetailsContainer) {
      console.log('Profile button found');

      profileButton.addEventListener('click', function() {
          console.log('Profile button clicked');

          if (userDetailsContainer.style.display === 'block') {
              userDetailsContainer.style.display = 'none';
          } else {
              
              const userId = localStorage.getItem('userId');

              if (userId) {
                  console.log('User ID found in local storage:', userId);
                  
                  fetchUserDetails(userId);
              } else {
                  console.error('User ID not found in local storage');
               
              }
              userDetailsContainer.style.display = 'block';
          }
      });
  } else {
      console.error('Profile button or user details container not found');
     
  }

  
  const logoutButton = document.getElementById('logoutButton');

  if (logoutButton) {
    logoutButton.addEventListener('click', logout);
  }

  function fetchUserDetails(userId) {
      fetch(`/api/userDetails/${userId}`)
          .then(response => {
              if (response.ok) {
                  return response.json();
              } else {
                  return response.json().then(data => {
                      throw new Error(data.error);
                  });
              }
          })
          .then(data => {
              console.log('User details:', data);

             
              userDetailsContainer.innerHTML = '';

             
              const userDetailsHeader = document.createElement('h2');
              userDetailsHeader.textContent = 'User Details';
              const userDetailsList = document.createElement('ul');

              
              const keys = Object.keys(data);
              keys.forEach(key => {
                  const listItem = document.createElement('li');
                  listItem.textContent = `${key}: ${data[key]}`;
                  userDetailsList.appendChild(listItem);
              });

              
              userDetailsContainer.appendChild(userDetailsHeader);
              userDetailsContainer.appendChild(userDetailsList);
          })
          .catch(error => {
              console.error('Error fetching user details:', error);
              
          });
  }
});

const notificationButton = document.getElementById('notificationButton');
const notificationContainer = document.getElementById('notificationContainer');

if (notificationButton && notificationContainer) {
  notificationButton.addEventListener('click', function() {
    if (notificationContainer.style.display === 'block') {
      notificationContainer.style.display = 'none';
    } else {
      
      fetchNotifications();
      notificationContainer.style.display = 'block';
    }
  });
}

// Function to fetch notifications
function fetchNotifications() {
  // Fetch notifications for the logged-in user
  const userId = localStorage.getItem('userId');
  fetch(`/api/notifications/${userId}`)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to fetch notifications');
      }
    })
    .then(data => {
      // Display notifications
      displayNotifications(data);
    })
    .catch(error => {
      console.error('Error fetching notifications:', error);
      
    });
}

// Function to display notifications
function displayNotifications(notifications) {

  notificationContainer.innerHTML = '';

  
  const notificationsHeader = document.createElement('h2');
  notificationsHeader.textContent = 'Notifications';
  const notificationsList = document.createElement('ul');

  
  notifications.forEach(notification => {
    const listItem = document.createElement('li');
    listItem.textContent = `${notification.message}`;
    notificationsList.appendChild(listItem);
  });

  
  notificationContainer.appendChild(notificationsHeader);
  notificationContainer.appendChild(notificationsList);
};

function showSignupForm() {
  const signupFormContainer = document.getElementById('signupFormContainer');
  if (signupFormContainer) {
    signupFormContainer.style.display = 'block';
  }
  const loginFormContainer = document.getElementById('loginFormContainer');
  if (loginFormContainer) {
    loginFormContainer.style.display = 'none';
  }
  const tripsContainer = document.getElementById('tripsContainer');
  if (tripsContainer) {
    tripsContainer.style.display = 'none';
  }
  const postForm = document.getElementById('postForm');
  if (postForm) {
    postForm.style.display = 'none';
  }
}

function showLoginForm() {
  const signupFormContainer = document.getElementById('signupFormContainer');
  if (signupFormContainer) {
    signupFormContainer.style.display = 'none';
  }
  const loginFormContainer = document.getElementById('loginFormContainer');
  if (loginFormContainer) {
    loginFormContainer.style.display = 'block';
  }
  const tripsContainer = document.getElementById('tripsContainer');
  if (tripsContainer) {
    tripsContainer.style.display = 'none';
  }
  const postForm = document.getElementById('postForm');
  if (postForm) {
    postForm.style.display = 'none';
  }
}

function registerUser() {
  const username = document.getElementById('signupUsername').value;
  const password = document.getElementById('signupPassword').value;
  const mobileNumber = document.getElementById('mobileNumber').value;
  const adharCard = document.getElementById('adharCard').value;
  const licenseNumber = document.getElementById('licenseNumber').value;

  // Validate password before submitting the registration
  if (!validatePassword()) {
    
    return;
  }
  if (!validatePhoneNumber()) {
    
    return;
  }
  if (!validateAadharCard()) {
    
    return;
  }

  fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password, mobileNumber, adharCard, licenseNumber }),
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      
      alert(`Registered successfully! Your User ID is: ${data.userId}`);
     
      window.location.href = '/login';
    })
    .catch(error => console.error('Error registering user:', error));
}

function validatePassword() {
  console.log('Validating password...'); 
  const passwordInput = document.getElementById('signupPassword');
  const password = passwordInput.value;

 
  const passwordRegex = /^(?=.*\d)(?=.*[a-zA-Z]).{8,}$/;

  
  if (passwordRegex.test(password)) {
   
    passwordInput.style.display = 'none';
    return true;
  } else {
    console.log('Password validation failed!'); e
    passwordInput.setCustomValidity('Password must be alphanumeric and at least 8 characters long.');
    passwordInput.reportValidity();
    return false;
  }
}
// Function to validate phone number
function validatePhoneNumber() {
  console.log('Validating phone number...'); // Check if the function is called
  const phoneNumberInput = document.getElementById('mobileNumber');
  const phoneNumber = phoneNumberInput.value;

  
  const phoneNumberRegex = /^\d{10}$/;


  if (phoneNumberRegex.test(phoneNumber)) {
    return true;
  } else {
    console.log('Phone number validation failed!'); 
    phoneNumberInput.setCustomValidity('Phone number must be 10 digits.');
    phoneNumberInput.reportValidity();
    return false;
  }
}

// Function to validate Aadhar card
function validateAadharCard() {
  console.log('Validating Aadhar card...'); 
  const aadharCardInput = document.getElementById('adharCard');
  const aadharCard = aadharCardInput.value;

 
  const aadharCardRegex = /^\d{12}$/;

 
  if (aadharCardRegex.test(aadharCard)) {
    return true;
  } else {
    console.log('Aadhar card validation failed!'); 
    aadharCardInput.setCustomValidity('Aadhar card must be 12 digits.');
    aadharCardInput.reportValidity();
    return false;
  }
}




function fetchUserDetails(userId) {
  fetch(`/api/userDetails/${userId}`)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return response.json().then(data => {
          throw new Error(data.error);
        });
      }
    })
    .then(data => {
     
      console.log('User details:', data);
     
    })
    .catch(error => {
      console.error('Error fetching user details:', error);
      
    });
}

function loginAndRedirect() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return response.json().then(data => {
          throw new Error(data.error);
        });
      }
    })
    .then(data => {
      const userId = data.userId; 
      localStorage.setItem('userId', userId); 
      fetchUserDetails(userId); 
      const baseUrl = window.location.protocol + '//' + window.location.host;
      window.location.href = baseUrl + '/home.html';
    })
    .catch(error => {
      console.error('Error logging in:', error);
      alert(error.message);
    });
}


function createTrip() {

  const destination = document.getElementById('createTripDestination').value;
  const userId = document.getElementById('createTripuserId').value; 

  const travellerName = document.getElementById('createTripTravellerName').value;
  const startDate = document.getElementById('createTripStartDate').value;
  const endDate = document.getElementById('createTripEndDate').value;
  const duration = document.getElementById('createTripDuration').value;
  const noofseats = document.getElementById('createTripNoOfSeats').value; 

 
  const postData = {
    destination: destination,
    id: userId, 
    travellerName: travellerName,

    
    startDate: startDate,
    endDate: endDate,
    duration: duration,
    noofseats: noofseats 
  };

  
  fetch('/api/trip', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  })
    .then(response => {
      if (response.ok) {
      
        window.location.reload();
      } else {
       
        throw new Error('Failed to create trip post');
      }
    })
    .catch(error => {
      console.error('Error creating trip post:', error);
      
      alert('Failed to create trip post. Please try again later.');
    });
}

function showCreateTripForm() {
  const createTripForm = document.getElementById('createTripForm');
  if (createTripForm.style.display === 'none') {
    createTripForm.style.display = 'block';
  } else {
    createTripForm.style.display = 'none';
  }
}




function logout() {
 
  localStorage.removeItem('userId');
  
  window.location.href = '/login';
}
