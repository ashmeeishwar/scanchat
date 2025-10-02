// Register the service worker for PWA functionality
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('Service Worker registered', reg))
        .catch(err => console.error('Service Worker registration failed', err));
}

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture-btn');
const statusDiv = document.getElementById('status');

// 1. Access the camera
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' } // Use the rear camera
        });
        video.srcObject = stream;
    } catch (err) {
        console.error("Error accessing camera: ", err);
        statusDiv.textContent = "Could not access camera. Please grant permission.";
    }
}

// 2. The main function to find and open a WhatsApp chat
function findAndOpenWhatsApp(text) {
    statusDiv.textContent = "Searching for number...";
    // Regex to find phone numbers (Indonesian format friendly)
    const phoneRegex = /(\+?\d[\d\s-]{7,}\d)/g;
    const matches = text.match(phoneRegex);

    if (!matches) {
        statusDiv.textContent = "No phone number found. Please try again.";
        return;
    }

    // Process the first valid number found
    let number = matches[0];
    
    // Clean the number: remove spaces and dashes
    number = number.replace(/[\s-]/g, '');

    // Format for Indonesia: replace leading '0' with '62'
    if (number.startsWith('0')) {
        number = '62' + number.substring(1);
    }
    
    // Remove any '+' if it exists with '62'
    if (number.startsWith('+62')) {
        number = number.substring(1);
    }

    statusDiv.textContent = `Found: ${number}. Opening WhatsApp...`;
    
    // Redirect to WhatsApp
    window.location.href = `https://wa.me/${number}`;
}


// 3. Capture button event listener
captureBtn.addEventListener('click', async () => {
    statusDiv.textContent = 'Scanning image...';
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to the hidden canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Use Tesseract.js to perform OCR on the canvas
    try {
        const result = await Tesseract.recognize(canvas, 'eng');
        findAndOpenWhatsApp(result.data.text);
    } catch (error) {
        console.error('OCR Error:', error);
        statusDiv.textContent = 'Could not read text. Please try again.';
    }
});

// Start the camera when the page loads
setupCamera();