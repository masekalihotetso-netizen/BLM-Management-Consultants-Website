const state = {enquiries: []};

const elements = {
  body: document.querySelector('#enquiriesBody'),
  empty: document.querySelector('#emptyState'),
  error: document.querySelector('#adminError'),
  search: document.querySelector('#searchInput'),
  updated: document.querySelector('#lastUpdated'),
  total: document.querySelector('#totalCount'),
  newCount: document.querySelector('#newCount'),
  contacted: document.querySelector('#contactedCount'),
  closed: document.querySelector('#closedCount')
};

function formatDate(value) {
  if (value && typeof value === 'object' && value._seconds) {
    value = new Date(value._seconds * 1000);
  }
  const date = value instanceof Date ? value : new Date(String(value).replace(' ', 'T') + 'Z');
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, {day: 'numeric', month: 'short', year: 'numeric'});
}

function statusClass(status) {
  return `status-${status.toLowerCase()}`;
}

function renderSummary() {
  elements.total.textContent = state.enquiries.length;
  elements.newCount.textContent = state.enquiries.filter(item => item.status === 'New').length;
  elements.contacted.textContent = state.enquiries.filter(item => item.status === 'Contacted').length;
  elements.closed.textContent = state.enquiries.filter(item => item.status === 'Closed').length;
}

function renderTable() {
  const query = elements.search.value.trim().toLowerCase();
  const filtered = state.enquiries.filter(item => [item.name, item.phone, item.service, item.message].some(value => value.toLowerCase().includes(query)));
  elements.body.innerHTML = filtered.map(item => `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      <td><a href="tel:${escapeHtml(item.phone)}">${escapeHtml(item.phone)}</a></td>
      <td>${escapeHtml(item.service)}</td>
      <td class="message">${escapeHtml(item.message)}</td>
      <td><select class="status-select ${statusClass(item.status)}" data-id="${item.id}" aria-label="Status for ${escapeHtml(item.name)}">
        ${['New', 'Contacted', 'Closed'].map(status => `<option ${status === item.status ? 'selected' : ''}>${status}</option>`).join('')}
      </select></td>
      <td>${formatDate(item.createdAt)}</td>
    </tr>`).join('');
  elements.empty.hidden = filtered.length > 0;
  elements.body.querySelectorAll('.status-select').forEach(select => select.addEventListener('change', updateStatus));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
}

async function loadEnquiries() {
  elements.error.textContent = '';
  try {
    const response = await fetch('/api/enquiries');
    if (!response.ok) throw new Error('Enquiries could not be loaded.');
    state.enquiries = await response.json();
    renderSummary();
    renderTable();
    elements.updated.textContent = `Updated ${new Date().toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'})}`;
  } catch (error) {
    elements.error.textContent = error.message;
  }
}

async function updateStatus(event) {
  const select = event.target;
  const enquiry = state.enquiries.find(item => String(item.id) === select.dataset.id);
  const previousStatus = enquiry.status;
  try {
    const response = await fetch(`/api/enquiries/${select.dataset.id}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({status: select.value})
    });
    if (!response.ok) throw new Error('Status could not be updated.');
    enquiry.status = select.value;
    select.className = `status-select ${statusClass(select.value)}`;
    renderSummary();
  } catch (error) {
    select.value = previousStatus;
    elements.error.textContent = error.message;
  }
}

elements.search.addEventListener('input', renderTable);
document.querySelector('#refreshButton').addEventListener('click', loadEnquiries);
loadEnquiries();
