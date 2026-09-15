import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Opportunity from './src/models/Opportunity.js';

dotenv.config();

dns.setServers(['8.8.8.8', '1.1.1.1']);

// Additive test-data seeding: gives the existing verified employer accounts
// enough spread of postings that every discipline filter and every Anambra
// LGA location filter on the Browse page returns at least one result.
// Safe to re-run: skipped postings (already present by position+city) are
// not duplicated.
const newOpportunities = [
  { employerEmail: 'brightpath@gmail.com', position: 'Software Development Intern', disciplines: ['Computer Science', 'Software Engineering'], requirements: 'Familiarity with JavaScript and basic web development.', city: 'Anambra East' },
  { employerEmail: 'novatech@gmail.com', position: 'Site Engineering Intern', disciplines: ['Engineering'], requirements: 'Interest in civil/structural site work and willingness to do fieldwork.', city: 'Anambra West' },
  { employerEmail: 'brightpath@gmail.com', position: 'IT Support Intern', disciplines: ['Computer Science'], requirements: 'Basic troubleshooting skills and willingness to learn on the job.', city: 'Anaocha' },
  { employerEmail: 'novatech@gmail.com', position: 'Accounts Intern', disciplines: ['Accountancy'], requirements: 'Good with figures, basic Excel/bookkeeping knowledge.', city: 'Awka North' },
  { employerEmail: 'brightpath@gmail.com', position: 'Lab and Quality Intern', disciplines: ['Sciences'], requirements: 'Attention to detail and basic lab safety awareness.', city: 'Ayamelum' },
  { employerEmail: 'novatech@gmail.com', position: 'Junior Accountant Intern', disciplines: ['Accountancy'], requirements: 'Understanding of basic accounting principles.', city: 'Dunukofia' },
  { employerEmail: 'brightpath@gmail.com', position: 'Frontend Developer Intern', disciplines: ['Computer Science', 'Software Engineering'], requirements: 'Some exposure to HTML/CSS/React is an advantage.', city: 'Ekwusigo' },
  { employerEmail: 'novatech@gmail.com', position: 'Mechanical Engineering Intern', disciplines: ['Engineering'], requirements: 'Basic mechanical drawing/CAD exposure preferred.', city: 'Idemili North' },
  { employerEmail: 'brightpath@gmail.com', position: 'QA and Testing Intern', disciplines: ['Software Engineering'], requirements: 'Detail-oriented, interest in software testing.', city: 'Idemili South' },
  { employerEmail: 'novatech@gmail.com', position: 'Research Assistant Intern', disciplines: ['Sciences'], requirements: 'Comfortable with data collection and basic report writing.', city: 'Ihiala' },
  { employerEmail: 'brightpath@gmail.com', position: 'Network Support Intern', disciplines: ['Computer Science'], requirements: 'Basic networking concepts (IP addressing, LAN/WAN).', city: 'Njikoka' },
  { employerEmail: 'novatech@gmail.com', position: 'Finance and Accounts Intern', disciplines: ['Accountancy'], requirements: 'Interest in financial record-keeping and reconciliation.', city: 'Nnewi North' },
  { employerEmail: 'brightpath@gmail.com', position: 'Backend Developer Intern', disciplines: ['Software Engineering', 'Computer Science'], requirements: 'Basic understanding of APIs and databases.', city: 'Nnewi South' },
  { employerEmail: 'novatech@gmail.com', position: 'Civil Engineering Intern', disciplines: ['Engineering'], requirements: 'Coursework in civil engineering fundamentals.', city: 'Ogbaru' },
  { employerEmail: 'brightpath@gmail.com', position: 'Data Analyst Intern', disciplines: ['Computer Science', 'Sciences'], requirements: 'Comfortable with spreadsheets and basic data analysis.', city: 'Onitsha North' },
  { employerEmail: 'novatech@gmail.com', position: 'Audit Intern', disciplines: ['Accountancy'], requirements: 'Interest in internal audit processes.', city: 'Orumba North' },
  { employerEmail: 'brightpath@gmail.com', position: 'Laboratory Intern', disciplines: ['Sciences'], requirements: 'Willingness to follow lab procedures and safety protocols.', city: 'Orumba South' },
  { employerEmail: 'novatech@gmail.com', position: 'Electrical Engineering Intern', disciplines: ['Engineering'], requirements: 'Basic circuit theory knowledge.', city: 'Oyi' },
  { employerEmail: 'novatech@gmail.com', position: 'Bookkeeping Intern', disciplines: ['Accountancy'], requirements: 'Organised and comfortable maintaining financial records.', city: 'Onitsha South' },
  { employerEmail: 'brightpath@gmail.com', position: 'Systems Administration Intern', disciplines: ['Computer Science'], requirements: 'Interest in server/system administration basics.', city: 'Onitsha South' },
  { employerEmail: 'novatech@gmail.com', position: 'Structural Engineering Intern', disciplines: ['Engineering'], requirements: 'Coursework relevant to structural analysis.', city: 'Awka South' },
  { employerEmail: 'brightpath@gmail.com', position: 'Accounts and Records Intern', disciplines: ['Accountancy'], requirements: 'Basic bookkeeping and record management skills.', city: 'Awka South' },
  { employerEmail: 'brightpath@gmail.com', position: 'Software QA Intern', disciplines: ['Software Engineering'], requirements: 'Interest in manual and automated testing.', city: 'Aguata' },
  { employerEmail: 'novatech@gmail.com', position: 'Environmental Sciences Intern', disciplines: ['Sciences'], requirements: 'Interest in environmental data collection and fieldwork.', city: 'Aguata' },
];

const seedOpportunities = async () => {
  try {
    await connectDB();

    const employerEmails = [...new Set(newOpportunities.map((o) => o.employerEmail))];
    const employers = await User.find({ email: { $in: employerEmails }, role: 'employer' });
    const employerByEmail = new Map(employers.map((e) => [e.email, e]));

    let created = 0;
    let skipped = 0;

    for (const item of newOpportunities) {
      const employer = employerByEmail.get(item.employerEmail);
      if (!employer) {
        console.log(`Skipping "${item.position}" — no employer found for ${item.employerEmail}`);
        skipped += 1;
        continue;
      }

      const existing = await Opportunity.findOne({
        employer: employer._id,
        position: item.position,
        city: item.city,
      });
      if (existing) {
        skipped += 1;
        continue;
      }

      await Opportunity.create({
        employer: employer._id,
        position: item.position,
        disciplines: item.disciplines,
        requirements: item.requirements,
        state: 'Anambra',
        city: item.city,
      });
      created += 1;
    }

    console.log(`Done. Created ${created} new opportunities, skipped ${skipped} (already present).`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedOpportunities();
