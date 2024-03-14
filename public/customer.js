// // script.js
//
// // Function to preview file
// // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
// function previewFile() {
//   var preview = document.getElementById('preview');
//   preview.innerHTML = ''; // Clear previous previews
//
//   var files = document.getElementById('files').files;
//   for (var i = 0; i < files.length; i++) {
//     var file = files[i];
//     var reader = new FileReader();
//
//     // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
//     reader.onload = function (e) {
//       var img = document.createElement('img');
//       img.src = e.target.result;
//       img.style.maxWidth = '200px'; // Limit the width for better preview
//       preview.appendChild(img);
//     };
//
//     reader.readAsDataURL(file);
//   }
// }
//
// // Add event listener to trigger previewFile function when file input changes
// document.getElementById('files').addEventListener('change', previewFile);
//
// // Function to handle form submission
// // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
// function handleSubmit(event) {
//   event.preventDefault(); // Prevent default form submission
//
//   // Get form data
//   var formData = new FormData(event.target);
//
//   // Make HTTP request using Axios
//   axios
//     .post('/your-api-endpoint', formData)
//     .then(function (response) {
//       console.log('Success:', response);
//       // Handle success response here
//     })
//     .catch(function (error) {
//       console.error('Error:', error);
//       // Handle error here
//     });
// }
//
// // Add event listener to form submission
// document.querySelector('form').addEventListener('submit', handleSubmit);

// Add event listener to trigger previewFile function when file input changes
document.getElementById('files').addEventListener('change', previewFile);

// Function to preview file
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function previewFile() {
  var previewContainer = document.getElementById('preview');
  previewContainer.innerHTML = ''; // Clear previous previews

  var files = document.getElementById('files').files;
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var reader = new FileReader();

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    reader.onload = function (e) {
      var img = document.createElement('img');
      img.src = e.target.result;
      img.style.maxWidth = '200px'; // Limit the width for better preview

      // Create trash icon
      var trashIcon = document.createElement('i');
      trashIcon.className = 'fas fa-trash-alt trash-icon';

      // Create image container
      var imgContainer = document.createElement('div');
      imgContainer.className = 'img-container';
      imgContainer.appendChild(img);
      imgContainer.appendChild(trashIcon);

      // Add image container to preview container
      previewContainer.appendChild(imgContainer);

      // Add event listener to remove image on trash icon click
      trashIcon.addEventListener('click', function () {
        previewContainer.removeChild(imgContainer);
      });
    };

    reader.readAsDataURL(file);
  }
}

// Function to extract token from URL parameters
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
// Function to extract token from URL parameters
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  const results = regex.exec(location.search);
  return results === null
    ? ''
    : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Function to pre-fill form fields with token data
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function preFillFormFields() {
  const token = getUrlParameter('token');
  // Make a request to decode the token on the server-side or decode it directly on the client-side
  // For demonstration, let's assume the token is decoded on the client-side
  const decodedToken = parseJwt(token);

  // Check if the token is expired
  const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
  if (decodedToken.exp < currentTimestamp) {
    alert('Token is expired');
    // Handle expired token (e.g., redirect to login page)
    return;
  }

  // Fill the form fields with the decoded token data
  document.getElementById('fullName').value = decodedToken.fullName;
  document.getElementById('email').value = decodedToken.email;
  document.getElementById('phoneNumber').value = decodedToken.phoneNumber;
  document.getElementById('address').value = decodedToken.address;
  document.getElementById('nationalId').value = decodedToken.nationalId;
  document.getElementById('paymentMethod').value = decodedToken.paymentMethod;

  // Add additional fields as needed
}

// Function to parse JWT token
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );
  return JSON.parse(jsonPayload);
}

// Call the function to pre-fill form fields when the page loads
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
window.onload = function () {
  preFillFormFields();
};
