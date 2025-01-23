const STATUS_AVAILABLE = 'Tilgjengelig';
const STATUS_RENTED = 'Utleid';
const ERROR_NAME_REQUIRED = "Name is required to rent the equipment.";
const ERROR_EQUIPMENT_DETAILS = "Please enter equipment name and select an image.";
const SUCCESS_LOGIN = "Logged in successfully!";
const ERROR_INVALID_USERNAME = "Invalid username. Please try again.";
const USERNAME = "Arian"; // Replace with the desired username

function addEquipment() {
    const name = document.getElementById('equipmentName').value;
    const imageFile = document.getElementById('equipmentImage').files[0];

    if (!name || !imageFile) {
        alert(ERROR_EQUIPMENT_DETAILS);
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        const newRow = {
            name: name,
            imageUrl: reader.result,
            status: STATUS_AVAILABLE
        };

        const equipmentList = getEquipmentList();
        equipmentList.push(newRow);
        saveEquipmentList(equipmentList);
        renderEquipment();
        clearInputFields();
    };
    
    reader.readAsDataURL(imageFile);
}

function renderEquipment() {
    const table = document.getElementById('equipmentTable').getElementsByTagName('tbody')[0];
    table.innerHTML = ''; 
    const equipmentList = getEquipmentList();

    equipmentList.forEach(item => {
        const newRow = table.insertRow();
        newRow.innerHTML = `
            <td>${item.name}</td>
            <td><img src="${item.imageUrl}" alt="${item.name}" width="50"></td>
            <td>
                <span class="status ${item.status === STATUS_AVAILABLE ? 'available' : 'rented'}">
                    ${item.status}
                    ${item.returnDate ? ` (Returned by: ${item.returner} on ${item.returnDate})` : ''}
                </span>
                ${item.renter ? `<br><small>Leietaker: ${item.renter}</small>` : ''}
            </td>
            <td>
                <button onclick="changeStatus(this)">${item.status === STATUS_AVAILABLE ? 'Leie ut' : 'Returner'}</button>
                <button onclick="deleteEquipment(this)" class="delete-button" ${isLoggedIn ? '' : 'disabled'}>Slett</button>
            </td>
        `;
    });
}




function changeStatus(button) {
    const statusCell = button.parentElement.parentElement.getElementsByClassName('status')[0];
    const equipmentList = getEquipmentList();
    const index = Array.from(button.parentElement.parentElement.parentElement.children).indexOf(button.parentElement.parentElement);
    
    if (statusCell.innerText.includes(STATUS_AVAILABLE)) {
        const renterName = prompt("Please enter your name:");
        if (!renterName) {
            alert(ERROR_NAME_REQUIRED);
            return;
        }

        // Mark item as rented
        statusCell.innerText = STATUS_RENTED;
        statusCell.classList.remove('available');
        statusCell.classList.add('rented');
        equipmentList[index].status = STATUS_RENTED;
        equipmentList[index].renter = renterName; // Store renter's name
        equipmentList[index].returner = null; // Reset returner when rented
        equipmentList[index].returnDate = null; // Reset return date when rented

        button.innerText = 'Returner'; // Change button text to 'Returner'
    } else {
        // Use the previously stored renter's name for returning
        const returnerName = equipmentList[index].renter; 
        const returnDate = new Date();
        const formattedDate = returnDate.toLocaleString(); // Format the date and time
        
        // Update status with return timestamp and returner name
        statusCell.innerText = `${STATUS_AVAILABLE} (Returned by: ${returnerName} on ${formattedDate})`;
        statusCell.classList.remove('rented');
        statusCell.classList.add('available');
        equipmentList[index].status = STATUS_AVAILABLE;
        equipmentList[index].returnDate = formattedDate; // Save return date
        equipmentList[index].returner = returnerName; // Store the returner name
        delete equipmentList[index].renter; // Clear the renter

        button.innerText = 'Leie ut'; // Change button text back to 'Leie ut'
    }

    saveEquipmentList(equipmentList);
    renderEquipment();
}






function deleteEquipment(button) {
    const row = button.parentElement.parentElement;
    const index = Array.from(row.parentElement.children).indexOf(row);
    const equipmentList = getEquipmentList();

    equipmentList.splice(index, 1); 
    saveEquipmentList(equipmentList);
    row.parentElement.removeChild(row);
}

function getEquipmentList() {
    return JSON.parse(localStorage.getItem('equipmentList')) || [];
}

function saveEquipmentList(equipmentList) {
    try {
        localStorage.setItem('equipmentList', JSON.stringify(equipmentList));
    } catch (error) {
        console.error("Error saving equipment list:", error);
    }
}

function clearInputFields() {
    document.getElementById('equipmentName').value = '';
    document.getElementById('equipmentImage').value = '';
}

let isLoggedIn = false;

document.addEventListener("DOMContentLoaded", function() {
    const buttons = document.querySelectorAll("button:not(#loginButton)");
    buttons.forEach(button => button.disabled = true);

    const loginButton = document.getElementById("loginButton");
    loginButton.addEventListener("click", function() {
        const username = prompt("Enter your username:");
        if (username === USERNAME) {
            isLoggedIn = true;
            buttons.forEach(button => button.disabled = false);
            alert(SUCCESS_LOGIN);
            renderEquipment();
        } else {
            alert(ERROR_INVALID_USERNAME);
        }
    });
});

// Load equipment on page load
window.onload = function() {
    renderEquipment();
};


function searchEquipment() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const table = document.getElementById('equipmentTable').getElementsByTagName('tbody')[0];
    const rows = table.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        const equipmentName = cells[0].textContent.toLowerCase();
        
        // Check if the equipment name includes the search input
        if (equipmentName.includes(searchInput)) {
            rows[i].style.display = ''; // Show row
        } else {
            rows[i].style.display = 'none'; // Hide row
        }
    }
}
