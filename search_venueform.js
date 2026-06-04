const fs = require('fs');
const content = fs.readFileSync('app/components/admin/venues/VenueForm.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('name') && line.toLowerCase().includes('input')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
  if (line.toLowerCase().includes('priceperhour')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
