
let stream = null;
let photoCaptured = false;

$(document).ready(function () {
    checkAuth();
    initializeForm();
    setupEventListeners();
    setupFileUploads();
    setupProgressTracking();

    setTimeout(() => {
        $('#subscribe-form input[type="email"]').removeAttr('required');
        $('#subscribe-form').on('submit', function (e) {
            e.preventDefault();
            alert('Subscription feature is disabled on the registration page.');
        });
    }, 1000); 
});

// Check authentication and load user data
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('/api/citizens/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            // Auto-fill fields
            $('#fullName').val(user.fullName);
            $('#email').val(user.email);

            validateField(document.getElementById('fullName'));
            validateField(document.getElementById('email'));
        } else {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = 'login.html';
    }
}

// Initialize form
function initializeForm() {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    $('#dob').attr('max', maxDate.toISOString().split('T')[0]);
}

function setupEventListeners() {
    // Camera functionality
    $('#openCameraBtn').on('click', openCamera);
    $('#closeCameraBtn').on('click', closeCamera);
    $('#captureBtn').on('click', capturePhoto);

    // Photo upload
    $('#uploadPhotoBtn').on('click', () => $('#photoInput').click());
    $('#photoInput').on('change', handlePhotoUpload);

    // Form submission
    $('#registerForm').on('submit', handleFormSubmit);

    // Real-time validation
    $('input[required], select[required], textarea[required]').on('input blur change', function () {
        validateField(this);
    });
}

// Open camera modal
async function openCamera() {
    const modal = $('#cameraModal');
    modal.addClass('active');

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        const video = document.getElementById('videoElement');
        video.srcObject = stream;
        video.play();
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Unable to access camera. Please check your permissions and try again.');
        closeCamera();
    }
}

// Close camera modal
function closeCamera() {
    const modal = $('#cameraModal');
    modal.removeClass('active');

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    const video = document.getElementById('videoElement');
    video.srcObject = null;
}

// Capture photo from camera
async function capturePhoto() {
    const video = document.getElementById('videoElement');
    const canvas = document.getElementById('canvasElement');
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    // Validate and display photo
    const isValid = await validateImage(imageData);
    if (isValid) {
        displayPhoto(imageData);
        photoCaptured = true;
        closeCamera();
        updateProgress(2);
    } else {
        alert('Please ensure your face is clearly visible in the photo.');
    }
}

// Handle photo file upload
async function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function (e) {
        const imageData = e.target.result;
        const isValid = await validateImage(imageData);
        if (isValid) {
            displayPhoto(imageData);
            photoCaptured = true;
            updateProgress(2);
        } else {
            alert('Please ensure the image is clear and shows your full face.');
        }
    };
    reader.readAsDataURL(file);
}

// Display photo preview
function displayPhoto(imageData) {
    const preview = $('#photoPreview');
    const placeholder = $('#photoPlaceholder');

    preview.attr('src', imageData);
    preview.show();
    placeholder.hide();

    // Store photo data
    $('#photoData').val(imageData);
}

// Validate image
function validateImage(imageData) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function () {
            if (img.width < 200 || img.height < 200) {
                resolve(false);
                return;
            }
            resolve(true);
        };
        img.onerror = function () {
            resolve(false);
        };
        img.src = imageData;
    });
}

// Validate individual field
function validateField(field) {
    const $field = $(field);
    const value = $field.val().trim();

    if (field.hasAttribute('required') && !value) {
        $field.addClass('is-invalid');
        $field.siblings('.invalid-feedback').text('This field is required.');
        return false;
    }

    $field.removeClass('is-invalid');
    if (value) {
        $field.addClass('is-valid');
    }
    return true;
}

function setupFileUploads() {
    // Birth Certificate
    $('#birthCertificate').on('change', function () {
        if (this.files && this.files.length > 0) {
            handleFileUpload(this, 'birthCertFile', 'birthCertFileName');
        }
    });

    // Proof of Address
    $('#proofOfAddress').on('change', function () {
        if (this.files && this.files.length > 0) {
            handleFileUpload(this, 'proofOfAddressFile', 'proofOfAddressFileName');
        }
    });

    // Educational Certificate
    $('#educationalCert').on('change', function () {
        if (this.files && this.files.length > 0) {
            handleFileUpload(this, 'educationalCertFile', 'educationalCertFileName');
        }
    });

    // Additional Documents
    $('#additionalDocs').on('change', function () {
        if (this.files && this.files.length > 0) {
            handleMultipleFileUpload(this);
        }
    });
}

// Handle single file upload
function handleFileUpload(input, fileDisplayId, fileNameId) {
    const file = input.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        input.value = '';
        return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF, JPG, or PNG file.');
        input.value = '';
        return;
    }

    // Display file name
    $('#' + fileDisplayId).show();
    $('#' + fileNameId).text(file.name);

    updateProgress(3);
}

// Handle multiple file upload
function handleMultipleFileUpload(input) {
    const files = Array.from(input.files);
    const container = $('#additionalDocsFiles');
    container.empty();

    files.forEach((file, index) => {
        // Validate each file
        if (file.size > 5 * 1024 * 1024) {
            alert(`File "${file.name}" exceeds 5MB limit.`);
            return;
        }

        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            alert(`File "${file.name}" is not a valid format.`);
            return;
        }

        // Create file display element
        const fileElement = $(`
            <div class="uploaded-file">
                <span><i class="bi bi-file-earmark-pdf me-2"></i>${file.name}</span>
                <button type="button" class="btn btn-sm btn-link text-danger p-0" onclick="removeAdditionalFile(${index})">
                    <i class="bi bi-x-circle"></i>
                </button>
            </div>
        `);
        container.append(fileElement);
    });
}

// Remove file
function removeFile(inputId) {
    $('#' + inputId).val('');
    const fileDisplayId = inputId + 'File';
    $('#' + fileDisplayId).hide();
}

// Remove additional file (for multiple uploads)
function removeAdditionalFile(index) {
    const input = document.getElementById('additionalDocs');
    const dt = new DataTransfer();
    const files = Array.from(input.files);

    files.forEach((file, i) => {
        if (i !== index) {
            dt.items.add(file);
        }
    });

    input.files = dt.files;
    handleMultipleFileUpload(input);
}

function setupProgressTracking() {
    $('input, select, textarea').on('input change', function () {
        const section = $(this).closest('.form-section');
        if (section.length) {
            const sectionIndex = $('.form-section').index(section);
            if (sectionIndex === 0) {
                updateProgress(1);
            }
        }
    });
}

function updateProgress(step) {
    $('.step').each(function (index) {
        const stepNumber = index + 1;
        $(this).removeClass('active completed');

        if (stepNumber < step) {
            $(this).addClass('completed');
        } else if (stepNumber === step) {
            $(this).addClass('active');
        }
    });
}

async function handleFormSubmit(event) {
    event.preventDefault();

    // Validate all fields
    if (!validateForm()) {
        return;
    }

    // Check if photo is captured
    if (!photoCaptured) {
        alert('Please capture or upload your profile photo.');
        return;
    }

    // Disable submit button
    const submitBtn = $('#submitBtn');
    submitBtn.prop('disabled', true);
    submitBtn.html('<i class="bi bi-hourglass-split me-2"></i>Submitting...');

    console.log('--- Starting Form Submission ---');

    try {
        // Prepare form data
        const formData = new FormData();
        console.log('Building FormData...');

        // Add text fields
        formData.append('dob', $('#dob').val());
        formData.append('occupation', $('#occupation').val().trim());
        formData.append('phoneNumber', $('#phoneNumber').val().trim());
        formData.append('address', $('#address').val().trim());

        console.log('Text fields added: dob, occupation, phoneNumber, address');

        // Add photo
        const photoData = $('#photoData').val();
        if (photoData) {
            console.log('Adding captured photo...');
            // Convert base64 to blob
            const blob = dataURLtoBlob(photoData);
            formData.append('photo', blob, 'profile-photo.jpg');
        } else {
            console.log('Adding uploaded photo...');
            // If no photo from camera, check file input
            const photoFile = $('#photoInput')[0].files[0];
            if (photoFile) {
                formData.append('photo', photoFile);
            }
        }

        // Add documents
        const birthCert = $('#birthCertificate')[0].files[0];
        if (birthCert) {
            console.log('Adding Birth Certificate:', birthCert.name);
            formData.append('birthCertificate', birthCert);
        }

        const proofOfAddress = $('#proofOfAddress')[0].files[0];
        if (proofOfAddress) {
            console.log('Adding Proof of Address:', proofOfAddress.name);
            formData.append('proofOfAddress', proofOfAddress);
        }

        const educationalCert = $('#educationalCert')[0].files[0];
        if (educationalCert) {
            console.log('Adding Educational Cert:', educationalCert.name);
            formData.append('educationalCert', educationalCert);
        }

        const additionalDocs = $('#additionalDocs')[0].files;
        if (additionalDocs.length > 0) {
            console.log(`Adding ${additionalDocs.length} additional documents`);
            for (let i = 0; i < additionalDocs.length; i++) {
                formData.append('additionalDocs', additionalDocs[i]);
            }
        }

        // Submit to backend
        console.log('Sending request to /api/citizens/application ...');
        const token = localStorage.getItem('token');
        const response = await fetch('/api/citizens/application', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        console.log('Response status:', response.status);

        let result;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
            console.log('Response JSON:', result);
        } else {
            const text = await response.text();
            console.error('Non-JSON response received:', text);
            throw new Error(`Server returned non-JSON response: ${response.status}`);
        }

        if (response.ok) {
            console.log('Submission successful!');
            alert('Application submitted successfully! Your application is pending approval.');
            window.location.href = 'profile.html';
        } else {
            console.error('Submission failed:', result);
            alert(result.message || 'Submission failed. Please try again.');
            submitBtn.prop('disabled', false);
            submitBtn.html('<i class="bi bi-check-circle me-2"></i>Submit Application');
        }
    } catch (error) {
        console.error('Submission error (catch block):', error);
        alert('An error occurred. Please check the console for details.');
        submitBtn.prop('disabled', false);
        submitBtn.html('<i class="bi bi-check-circle me-2"></i>Submit Application');
    }
}

// Validate entire form
function validateForm() {
    let isValid = true;
    let firstErrorMessage = '';
    console.log('--- Validating Form ---');

    // Validate all required fields
    $('input[required], select[required]').each(function () {
        if (!validateField(this)) {
            console.log('Field invalid:', this.id || this.name);
            if (!firstErrorMessage) {
                const label = $(`label[for="${this.id}"]`).text().replace('*', '').trim();
                firstErrorMessage = `Missing required field: ${label || this.name}`;
            }
            isValid = false;
        }
    });

    // Validate documents with visual feedback
    const birthCert = $('#birthCertificate')[0].files[0];
    const birthCertLabel = $('label[for="birthCertificate"]');
    if (!birthCert) {
        $('#birthCertificate').addClass('is-invalid');
        birthCertLabel.addClass('border-danger text-danger');
        console.log('Document missing: Birth Certificate');
        if (!firstErrorMessage) firstErrorMessage = 'Missing required document: Birth Certificate';
        isValid = false;
    } else {
        $('#birthCertificate').removeClass('is-invalid');
        birthCertLabel.removeClass('border-danger text-danger');
    }

    const proofOfAddress = $('#proofOfAddress')[0].files[0];
    const proofOfLabel = $('label[for="proofOfAddress"]');
    if (!proofOfAddress) {
        $('#proofOfAddress').addClass('is-invalid');
        proofOfLabel.addClass('border-danger text-danger');
        console.log('Document missing: Proof of Address');
        if (!firstErrorMessage) firstErrorMessage = 'Missing required document: Proof of Address';
        isValid = false;
    } else {
        $('#proofOfAddress').removeClass('is-invalid');
        proofOfLabel.removeClass('border-danger text-danger');
    }

    if (!isValid) {
        if (firstErrorMessage) {
            alert(firstErrorMessage);
        }

        const firstError = $('.is-invalid, .border-danger').first();
        if (firstError.length) {
            console.log('Scrolling to error at:', firstError.offset().top);
            $('html, body').animate({
                scrollTop: firstError.offset().top - 150 
            }, 500);
        } else {
            console.warn('Form invalid but no visible error found to scroll to.');
        }
    } else {
        console.log('Form validation passed.');
    }

    return isValid;
}

// Convert data URL to blob
function dataURLtoBlob(dataurl) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
}

window.removeFile = removeFile;
window.removeAdditionalFile = removeAdditionalFile;

