const API_BASE = '/api/requests';
const requestForm = document.getElementById('requestForm');
const requestId = document.getElementById('requestId');
const nameInput = document.getElementById('name');
const serviceTypeSelect = document.getElementById('serviceType');
const descriptionTextarea = document.getElementById('description');
const fileUpload = document.getElementById('fileUpload');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const searchInput = document.getElementById('searchInput');
const requestTable = document.getElementById('requestTable');
const statsDiv = document.getElementById('stats');
const rowTemplate = document.getElementById('rowTemplate');

let currentRequests = [];

async function fetchRequests(query = '') {
  try {
    const url = query ? `${API_BASE}?q=${encodeURIComponent(query)}` : API_BASE;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    currentRequests = await response.json();
    renderRequests();
  } catch (error) {
    console.error('Error fetching requests:', error);
    alert('Gagal memuat data pengajuan.');
  }
}

function renderRequests() {
  requestTable.innerHTML = '';
  currentRequests.forEach(request => {
    const row = rowTemplate.content.cloneNode(true);
    row.querySelector('.nameCell').textContent = request.name;
    row.querySelector('.serviceCell').textContent = request.serviceType || 'Surat Keterangan';
    row.querySelector('.statusCell').textContent = request.status || 'Menunggu Proses';

    const fileCell = row.querySelector('.fileCell');
    if (request.fileUrl) {
      const link = document.createElement('a');
      link.href = request.fileUrl;
      link.target = '_blank';
      link.textContent = 'Lihat Dokumen';
      fileCell.appendChild(link);
    } else {
      fileCell.textContent = 'Tidak ada';
    }

    const actionsCell = row.querySelector('.actionsCell');
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => editRequest(request);
    actionsCell.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Hapus';
    deleteBtn.className = 'delete';
    deleteBtn.onclick = () => deleteRequest(request.id);
    actionsCell.appendChild(deleteBtn);

    requestTable.appendChild(row);
  });

  statsDiv.textContent = `Total: ${currentRequests.length} pengajuan`;
}

function editRequest(request) {
  requestId.value = request.id;
  nameInput.value = request.name;
  serviceTypeSelect.value = request.serviceType || 'Surat Keterangan';
  descriptionTextarea.value = request.description;
  fileUpload.value = ''; // Reset file input
  saveBtn.textContent = 'Update';
}

async function deleteRequest(id) {
  if (!confirm('Yakin hapus pengajuan ini?')) return;
  try {
    const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await fetchRequests(searchInput.value);
  } catch (error) {
    console.error('Error deleting request:', error);
    alert('Gagal menghapus pengajuan.');
  }
}

function clearForm() {
  requestForm.reset();
  requestId.value = '';
  saveBtn.textContent = 'Simpan';
}

async function submitForm(event) {
  event.preventDefault();
  const formData = new FormData();
  formData.append('name', nameInput.value.trim());
  formData.append('serviceType', serviceTypeSelect.value);
  formData.append('description', descriptionTextarea.value.trim());
  if (fileUpload.files[0]) {
    formData.append('file', fileUpload.files[0]);
  }

  const isUpdate = requestId.value;
  const method = isUpdate ? 'PUT' : 'POST';
  const url = isUpdate ? `${API_BASE}/${requestId.value}` : API_BASE;

  try {
    const response = await fetch(url, {
      method,
      body: formData
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    console.log('Success:', result);
    clearForm();
    await fetchRequests(searchInput.value);
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('Gagal menyimpan pengajuan.');
  }
}

// Event listeners
requestForm.addEventListener('submit', submitForm);
clearBtn.addEventListener('click', clearForm);
searchInput.addEventListener('input', () => fetchRequests(searchInput.value));

// Initial load
fetchRequests();