/**
 * AI Knowledge Base
 * Static FAQ, policies, and general health education context.
 * Used to enrich AI context without RAG for the current scale.
 */

const KNOWLEDGE_BASE = `
## DOCTOR APPOINTMENT SYSTEM — KNOWLEDGE BASE

### AVAILABLE MEDICAL SPECIALTIES
- General Physician / General Medicine
- Cardiology (Heart & Cardiovascular)
- Dermatology (Skin, Hair, Nails)
- Neurology (Brain, Nerves, Spine)
- Pediatrics (Children's Healthcare)
- Orthopedics (Bones, Joints, Muscles)
- Gynecology / Obstetrics (Women's Health)
- Ophthalmology (Eyes & Vision)
- ENT (Ear, Nose, Throat)
- Psychiatry / Mental Health
- Endocrinology (Hormones, Diabetes, Thyroid)
- Gastroenterology (Digestive System)
- Urology (Urinary System)
- Oncology (Cancer Care)
- Pulmonology (Lungs & Respiratory)
- Nephrology (Kidneys)
- Rheumatology (Arthritis, Autoimmune)

### APPOINTMENT BOOKING RULES
- Patients can book appointments with any approved doctor
- Each appointment slot is 30 minutes
- Available slots: 09:00 AM to 05:00 PM (with lunch break 12:30–2:00 PM)
- Appointments require: doctor selection, date, time, and reason
- Appointment types: In Person or Video consultation
- Double booking is not allowed for the same doctor at the same time
- All booked appointments start with "pending" status until the doctor confirms

### APPOINTMENT STATUSES
- **Pending**: Appointment booked, waiting for doctor confirmation
- **Confirmed**: Doctor has accepted the appointment
- **Completed**: Appointment has taken place
- **Cancelled**: Appointment was cancelled by patient
- **Rejected**: Doctor has rejected the appointment

### CANCELLATION POLICY
- Patients can cancel any pending or confirmed appointment
- Completed appointments cannot be cancelled
- It is recommended to cancel at least 24 hours in advance as a courtesy
- A reason for cancellation may be optionally provided

### RESCHEDULING POLICY
- Patients can reschedule pending or confirmed appointments
- After rescheduling, the appointment status resets to "pending" for doctor re-confirmation
- Completed or cancelled appointments cannot be rescheduled

### VIDEO CONSULTATION
- Video consultations are available as "Video" appointment type
- Once confirmed, a video link will be provided by the doctor
- Join the video room from the appointment details at the scheduled time
- Works directly in the browser using WebRTC (no extra software needed)

### LIVE QUEUE TRACKING
- Patients can track their live queue token number
- The system shows the current token being served
- Estimated wait time is displayed in real time
- Queue tracking helps patients avoid long waiting room times

### MEDICINE REMINDERS
- Patients can set automated medicine reminders
- Reminders can be configured for specific times and frequencies
- Helps patients stay on schedule with prescribed medications

### GENERAL HEALTH EDUCATION (Brief Overviews)

**What is blood pressure?**
Blood pressure measures the force of blood against artery walls. Normal is around 120/80 mmHg. High blood pressure (hypertension) can increase risk of heart disease and stroke.

**What is diabetes?**
Diabetes is a condition where the body cannot properly regulate blood sugar (glucose). Type 1 is autoimmune; Type 2 is lifestyle-related. Managed with diet, exercise, and sometimes medication.

**What does a cardiologist treat?**
Cardiologists specialize in heart and blood vessel conditions including heart disease, heart attacks, arrhythmias, high blood pressure, and heart failure.

**What does a dermatologist treat?**
Dermatologists treat conditions of the skin, hair, and nails including acne, eczema, psoriasis, skin infections, hair loss, and skin cancer screening.

**What does a neurologist treat?**
Neurologists specialize in brain, spinal cord, and nerve conditions including migraines, epilepsy, Parkinson's disease, multiple sclerosis, and stroke.

**What does a pediatrician treat?**
Pediatricians provide healthcare for infants, children, and adolescents including routine checkups, vaccinations, growth monitoring, and childhood illnesses.

**What should I ask my doctor?**
Good questions to ask your doctor include:
- What is my diagnosis?
- What are my treatment options?
- Are there side effects I should watch for?
- When should I come back for a follow-up?
- Are there lifestyle changes that could help?

### EMERGENCY GUIDANCE
If you experience any of the following, seek emergency medical help IMMEDIATELY:
- Chest pain or pressure
- Difficulty breathing or shortness of breath
- Sudden severe headache
- Signs of stroke: Face drooping, Arm weakness, Speech difficulty
- Severe allergic reaction (throat swelling, difficulty breathing)
- Loss of consciousness
- Heavy uncontrolled bleeding
- Severe burns
**Call your local emergency number (911 / 112) or go to the nearest Emergency Room.**

### FREQUENTLY ASKED QUESTIONS

**How do I book an appointment?**
Log in to your patient dashboard, go to "Book Appointment", select a doctor, choose a date and time slot, provide the reason for visit, and confirm.

**How do I cancel my appointment?**
Go to "My Appointments", find the appointment you want to cancel, and click the cancel button. You can also ask me and I will guide you through it.

**How do I reschedule?**
Go to "My Appointments", select the appointment, and choose "Reschedule" to pick a new date and time. The appointment will return to pending status for doctor re-confirmation.

**Can I see a doctor online?**
Yes! Choose "Video" as the appointment type when booking. Once the doctor confirms, a video link will be provided for the teleconsultation.

**Why is my appointment status "Pending"?**
Pending means your appointment request has been received and is waiting for the doctor to confirm it. You will be notified once the doctor responds.
`;

module.exports = { KNOWLEDGE_BASE };
