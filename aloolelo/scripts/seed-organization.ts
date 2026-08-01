import 'dotenv/config';
import { prisma } from '../src/lib/vector/client';
import bcrypt from 'bcrypt';

const PROFILES = [
  { name: 'Sarah Chen', role: 'Employee', profileType: 'star' },
  { name: 'Marcus Johnson', role: 'Employee', profileType: 'struggling' },
  { name: 'Elena Rodriguez', role: 'Employee', profileType: 'mixed' },
  { name: 'David Kim', role: 'Employee', profileType: 'star' },
  { name: 'Priya Patel', role: 'Employee', profileType: 'mixed' },
  { name: 'James Wilson', role: 'Employee', profileType: 'struggling' },
  { name: 'Nina Simone', role: 'Employee', profileType: 'star' },
  { name: 'Alex Vance', role: 'Employee', profileType: 'mixed' }, // Existing dummy employee
  { name: 'Tom Hardy', role: 'Employee', profileType: 'struggling' },
  { name: 'Lisa Su', role: 'Employee', profileType: 'star' },
  { name: 'Robert Kiyosaki', role: 'Employee', profileType: 'mixed' },
  { name: 'Emma Watson', role: 'Employee', profileType: 'star' },
];

async function seedOrganization() {
  console.log('🌱 Starting organization seed...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  for (let i = 0; i < PROFILES.length; i++) {
    const p = PROFILES[i];
    const email = `${p.name.toLowerCase().replace(' ', '.')}@company.com`;
    
    // Create or update user
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: p.name, role: p.role, password: hashedPassword },
      create: { email, name: p.name, role: p.role, password: hashedPassword },
    });

    console.log(`Created user: ${user.name} (${user.id}) - Type: ${p.profileType}`);

    // Generate Evidence based on profile type
    let evidence = [];

    if (p.profileType === 'star') {
      evidence = [
        { type: 'jira', content: `Jira Ticket INNOVA-${100+i}: Led migration to Next.js 14, improving page load speeds by 60%. Delivered 3 days ahead of schedule.` },
        { type: 'jira', content: `Jira Ticket INNOVA-${200+i}: Implemented real-time collaboration feature using WebSockets. Zero critical bugs reported in production.` },
        { type: 'peer_review', content: `${user.name} is exceptional. They constantly mentor junior devs and output flawless code. A true asset.` }
      ];
    } else if (p.profileType === 'struggling') {
      evidence = [
        { type: 'jira', content: `Jira Ticket INNOVA-${100+i}: Refactored login page. Ticket was delayed by 2 weeks due to misunderstood requirements.` },
        { type: 'jira', content: `Jira Ticket INNOVA-${200+i}: Fixed CSS bug in header. Had to be reopened 3 times by QA.` },
        { type: 'peer_review', content: `${user.name} has been struggling to meet sprint deadlines lately. Needs to communicate blockers earlier.` }
      ];
    } else {
      evidence = [
        { type: 'jira', content: `Jira Ticket INNOVA-${100+i}: Integrated third-party payment gateway. Code quality was solid, but lacked unit tests initially.` },
        { type: 'jira', content: `Jira Ticket INNOVA-${200+i}: Updated documentation for API endpoints. Completed on time.` },
        { type: 'peer_review', content: `${user.name} writes good code, but sometimes works in a silo. Could improve on team communication.` }
      ];
    }

    // Insert Evidence Chunks
    for (const ev of evidence) {
      await prisma.evidenceChunk.create({
        data: {
          content: ev.content,
          metadata: {
            employeeId: user.id,
            sourceType: ev.type,
            authorRole: ev.type === 'jira' ? 'System' : 'Peer',
            timestamp: new Date().toISOString(),
          },
        },
      });
    }
  }

  console.log('✅ Organization seed complete!');
}

seedOrganization()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
