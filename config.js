// The ONLY file you edit if your ngrok URL changes. Public values only: never put keys or passwords here.
window.SITE_CONFIG = {
  // Your ngrok HTTPS URL, no trailing slash.
  N8N_BASE_URL: "https://REPLACE-WITH-YOUR-NGROK-DOMAIN.ngrok-free.app",

  // Production path of the Form Trigger in workflow 1.
  FORM_PATH: "/form/a3ca78f8-59a6-4aeb-9061-18b46ff0e721",

  COMPANY: "Horizon Byte Solutions",
  MAX_CV_MB: 5,
  MAX_MOTIVATION_CHARS: 1500,
  COOLDOWN_SECONDS: 60,

  // Label shown to applicants -> exact value sent to n8n (matches workflow 1's validation list).
  POSITIONS: [
    { label: "Data Analyst", value: "Data Analyst" },
    { label: "AI Automation", value: "AI Automation" },
    { label: "Customer Support Specialist", value: "Customer Support Specialist" }
  ],

  // n8n Form Trigger names inputs by position. Order must match workflow 1:
  // 0 fullname, 1 email, 2 postion, 3 CV, 4 Why do you want this job
  FIELDS: { name: "field-0", email: "field-1", position: "field-2", cv: "field-3", motivation: "field-4" }
};
