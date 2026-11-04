import { TypingContent } from '../models/content.model.js';
import { User } from '../models/user.model.js';

export const SEED_PASSAGES = [
  {
    title: 'Unix Philosophy and Modularity',
    description: 'Foundational principles of Unix operating systems and software composability.',
    category: 'Technology',
    difficulty: 'Medium',
    passageText: 'Write programs that do one thing and do it well. Write programs to work together. Write programs to handle text streams, because that is a universal interface. The design of Unix encouraged developers to view computation as an interconnected assembly of sharp tools rather than monolithic architectures.',
  },
  {
    title: 'Asynchronous Event Loop in Node.js',
    description: 'An overview of non-blocking I/O and libuv mechanics in single-threaded runtimes.',
    category: 'Programming',
    difficulty: 'Hard',
    passageText: 'The event loop is what allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded. By offloading system operations to the system kernel whenever possible, modern web backends achieve immense concurrency while preserving predictable memory footprints.',
  },
  {
    title: 'Entropy and Thermodynamics',
    description: 'Physical concepts of disorder and thermal equilibrium in closed systems.',
    category: 'Science',
    difficulty: 'Medium',
    passageText: 'The second law of thermodynamics states that the total entropy of an isolated system can never decrease over time. Natural processes tend toward thermodynamic equilibrium, where matter is uniformly dispersed and no further mechanical work can be extracted without external energy input.',
  },
  {
    title: 'Precision Typography and Geometric Grids',
    description: 'Swiss design system conventions and architectural hairline discipline.',
    category: 'General Knowledge',
    difficulty: 'Easy',
    passageText: 'A grid-based layout provides structure, coherence, and visual hierarchy. When elements align to an unyielding millimeter division, the eye effortlessly navigates content without extraneous decorative noise or unnecessary rounded embellishments.',
  },
  {
    title: 'Competitive Market Dynamics and Moats',
    description: 'Economic mechanisms of competitive advantage and switching costs.',
    category: 'Business',
    difficulty: 'Medium',
    passageText: 'A business moat represents a company sustained competitive advantage that protects its market share and profitability against rival entrants. Network effects, high switching costs, and regulatory barriers establish durable defenses in high-velocity tech ecosystems.',
  },
];

export const seedSharedContent = async (systemAdminId) => {
  const existingCount = await TypingContent.countDocuments({ scope: 'global' });
  if (existingCount > 0) return;

  for (const item of SEED_PASSAGES) {
    await TypingContent.create({
      ...item,
      scope: 'global',
      status: 'Published',
      createdBy: systemAdminId,
    });
  }
  console.log(`[Seed] Seeded ${SEED_PASSAGES.length} shared platform library passages.`);
};
