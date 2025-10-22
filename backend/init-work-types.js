const mongoose = require('mongoose');
const dotenv = require('dotenv');
const WorkType = require('./models/worktype.model');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const defaultWorkTypes = [
  {
    name: 'Electricity',
    description: 'Electrical maintenance and repair services including wiring, outlets, switches, and electrical systems'
  },
  {
    name: 'Plumbing',
    description: 'Plumbing services including pipe repairs, fixture installations, leak fixing, and drainage systems'
  },
  {
    name: 'Carpenter',
    description: 'Carpentry work including woodwork, furniture repair, door/window installation, and structural repairs'
  }
];

const createDefaultWorkTypes = async () => {
  try {
    console.log('Checking and creating default work types...');

    let createdCount = 0;
    let skippedCount = 0;

    for (const workTypeData of defaultWorkTypes) {
      // Check if work type already exists
      const existingWorkType = await WorkType.findOne({ name: workTypeData.name });

      if (existingWorkType) {
        console.log(`Work type '${workTypeData.name}' already exists, skipping...`);
        skippedCount++;
      } else {
        // Create new work type
        const workType = new WorkType(workTypeData);
        await workType.save();
        console.log(`Created work type: ${workTypeData.name}`);
        createdCount++;
      }
    }

    console.log(`\nSeeding completed:`);
    console.log(`- Created: ${createdCount} work types`);
    console.log(`- Skipped: ${skippedCount} existing work types`);
    console.log('\nDefault work types seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating default work types:', error);
    process.exit(1);
  }
};

createDefaultWorkTypes();
