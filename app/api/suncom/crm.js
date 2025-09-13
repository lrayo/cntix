export async function SunComCRM(applicant) {
const response = await fetch('https://prod-api.suncompr.com/applicant/create/7e8f4a12-9b3d-4d9f-8a45-23c6f3b2e971', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(applicant),
});

  console.log("Response from CRM:", response);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error: ${response.status} - ${error?.message || 'Unknown error'}`);
  }

  return await response.json();
}
