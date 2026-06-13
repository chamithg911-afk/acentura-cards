/* ─────────────────────────────────────────
   profile.js — Acentura Digital Card
   Reads slug from URL → fetches employee
   from Supabase → builds the profile card
───────────────────────────────────────── */

// ── Step 1: Read the slug from the URL ──
// When someone visits cards.acentura.com/pemith-paaris
// window.location.pathname gives us "/pemith-paaris"
// .slice(1) removes the leading slash → "pemith-paaris"
function getSlugFromURL() {
  const path = window.location.pathname.slice(1);
  // Remove any trailing slash just in case
  return path.replace(/\/$/, '');
}

// ── Step 2: Get initials for photo fallback ──
// e.g. "Pemith Paaris" → "PP"
function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// ── Step 3: Generate a .vcf file for Save Contact ──
// A .vcf file is like a digital business card that
// iPhones and Android phones can read and save to Contacts.
// Think of it as a text file with a specific format
// that your phone's Contacts app understands.
function generateVCF(employee) {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${employee.full_name}`,
    `ORG:Acentura`,
    `TITLE:${employee.role || ''}`,
  ];

  if (employee.email)   lines.push(`EMAIL:${employee.email}`);
  if (employee.phone)   lines.push(`TEL:${employee.phone}`);
  if (employee.linkedin_url) lines.push(`URL:${employee.linkedin_url}`);
  if (employee.photo_url)    lines.push(`PHOTO;VALUE=URI:${employee.photo_url}`);

  lines.push('END:VCARD');
  return lines.join('\n');
}

// ── Step 4: Trigger the .vcf download ──
function downloadVCF(employee) {
  const vcfContent = generateVCF(employee);
  // Create an invisible link, click it, then remove it
  // (This is the standard trick to trigger a file download)
  const blob = new Blob([vcfContent], { type: 'text/vcard' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${employee.slug || employee.full_name}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Step 5: Show/hide the right screen ──
function showScreen(name) {
  // name = 'loading' | 'profile' | 'deactivated'
  document.getElementById('loading').style.display     = name === 'loading'     ? 'flex'  : 'none';
  document.getElementById('profile').style.display     = name === 'profile'     ? 'flex'  : 'none';
  document.getElementById('deactivated').style.display = name === 'deactivated' ? 'flex'  : 'none';
}

// ── Step 6: Populate the card with employee data ──
function renderProfile(employee) {
  // Name, role, department
  document.getElementById('emp-name').textContent       = employee.full_name;
  document.getElementById('emp-role').textContent       = employee.role || '';
  document.getElementById('emp-department').textContent = employee.department || '';

  // Photo — if no photo_url, show initials instead
  const photoEl    = document.getElementById('emp-photo');
  const initialsEl = document.getElementById('emp-initials');

  if (employee.photo_url) {
    photoEl.src = employee.photo_url;
    // If the image fails to load (broken URL), fall back to initials
    photoEl.onerror = () => {
      photoEl.style.display    = 'none';
      initialsEl.style.display = 'flex';
      initialsEl.textContent   = getInitials(employee.full_name);
    };
    photoEl.style.display    = 'block';
    initialsEl.style.display = 'none';
  } else {
    photoEl.style.display    = 'none';
    initialsEl.style.display = 'flex';
    initialsEl.textContent   = getInitials(employee.full_name);
  }

  // Call button
  if (employee.phone) {
    const btnCall = document.getElementById('btn-call');
    btnCall.href           = `tel:${employee.phone}`;
    btnCall.style.display  = 'flex';
  }

  // Email button
  if (employee.email) {
    const btnEmail = document.getElementById('btn-email');
    btnEmail.href          = `mailto:${employee.email}`;
    btnEmail.style.display = 'flex';
  }

  // LinkedIn button
  if (employee.linkedin_url) {
    const btnLinkedIn = document.getElementById('btn-linkedin');
    btnLinkedIn.href          = employee.linkedin_url;
    btnLinkedIn.style.display = 'flex';
  }

  // Save Contact button — attach VCF download on click
  document.getElementById('btn-save').addEventListener('click', () => {
    downloadVCF(employee);
  });

  // Update page title so it shows the person's name in the browser tab
  document.title = `${employee.full_name} – Acentura`;
}

// ── Step 7: Main function — runs when page loads ──
async function init() {
  const slug = getSlugFromURL();

  // If someone visits cards.acentura.com with no slug
  // send them to 404
  if (!slug) {
    window.location.href = '/404.html';
    return;
  }

  showScreen('loading');

  try {
    // Fetch the employee where slug matches AND is_active is true
    // sbSelect is from supabase.js — it's our fetch helper
    // "eq.true" means "where is_active = true"
    const data = await sbSelect(
      'employees',
      `slug=eq.${slug}&select=*`
    );

    // data will be an array — we want the first (and only) match
    const employee = data[0];

    // Slug not found in DB at all → redirect to 404
    if (!employee) {
      window.location.href = '/404.html';
      return;
    }

    // Employee exists but has been deactivated
    if (!employee.is_active) {
      showScreen('deactivated');
      return;
    }

    // All good — render the card!
    renderProfile(employee);
    showScreen('profile');

  } catch (err) {
    // Something went wrong with the network or Supabase
    console.error('Profile load error:', err);
    window.location.href = '/404.html';
  }
}

// Kick everything off
init();
