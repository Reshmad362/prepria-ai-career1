import fs from 'fs';

const filePath = './src/data/coursesData.js';
const data = fs.readFileSync(filePath, 'utf-8');

// Regex to find all categories in the filterGroups
const filterGroupsMatch = data.match(/const filterGroups = \{([\s\S]*?)\};/);
if (!filterGroupsMatch) {
  console.log('No filterGroups found');
  process.exit(1);
}

const categories = new Set();
const groupRegex = /"([^"]+)": \[([\s\S]*?)\]/g;
let match;
while ((match = groupRegex.exec(filterGroupsMatch[1])) !== null) {
  const groupName = match[1];
  if (groupName === 'General') continue;
  
  const subcats = match[2].match(/"([^"]+)"/g);
  if (subcats) {
    subcats.forEach(sub => categories.add(sub.replace(/"/g, '')));
  }
}

console.log('Total categories:', categories.size);

// Extract existing courses
const coursesRegex = /export const coursesData = \[([\s\S]*?)\];/;
const coursesMatch = data.match(coursesRegex);

if (!coursesMatch) {
  console.log('No coursesData found');
  process.exit(1);
}

const existingCoursesCode = coursesMatch[1];
const courseCategoryRegex = /category:\s*"([^"]+)"/g;

const existingCategories = {};
let catMatch;
while ((catMatch = courseCategoryRegex.exec(existingCoursesCode)) !== null) {
  const cat = catMatch[1];
  existingCategories[cat] = (existingCategories[cat] || 0) + 1;
}

const newCourses = [];
let idCounter = 1000;

categories.forEach(cat => {
  const count = existingCategories[cat] || 0;
  if (count < 2) {
    const missing = 2 - count;
    console.log(`Category '${cat}' needs ${missing} more courses.`);
    
    // Determine domain
    let domain = "tech";
    if (["Finance", "Accounting", "Investment Banking", "Business & Management", "Human Resources (HR)", "Marketing", "Digital Marketing", "Sales", "Product Management", "Operations Management", "Supply Chain Management", "Consulting", "Entrepreneurship", "Business Analytics"].includes(cat)) {
        domain = "business";
    }
    if (["Finance", "Accounting", "Investment Banking"].includes(cat)) {
        domain = "finance";
    }
    if (["UI/UX Design", "Graphic Design", "Video Editing", "Animation", "Content Creation", "Social Media Management", "Branding"].includes(cat)) {
        domain = "creative";
    }
    if (["Generative AI", "Prompt Engineering", "AI Product Management", "Data Engineering", "MLOps", "Cyber Forensics", "AR/VR Development", "Robotics"].includes(cat)) {
        domain = "emerging";
    }
    if (["Communication", "Interview Skills", "Resume Building", "Public Speaking", "Leadership", "Time Management", "Critical Thinking", "Problem Solving", "Negotiation Skills", "Emotional Intelligence"].includes(cat)) {
        domain = "soft-skills";
    }

    for (let i = 0; i < missing; i++) {
        newCourses.push(`
    {
        id: "auto-${domain}-${idCounter++}",
        title: "${cat} Fundamentals ${i + 1}",
        category: "${cat}",
        domain: "${domain}",
        level: "Beginner",
        duration: "4 Weeks",
        description: "Comprehensive introduction to ${cat} with practical examples and deep dives.",
        modules: [
            {
                title: "Introduction to ${cat}",
                duration: 90,
                content: {
                    text: "Learn the core concepts and principles of ${cat}.",
                    bullets: ["Understanding the basics", "Key methodologies", "Practical applications"],
                    example: "Applying ${cat} concepts to solve real-world problems."
                }
            }
        ]
    }`);
    }
  }
});

if (newCourses.length > 0) {
    const updatedCourses = existingCoursesCode + ",\n" + newCourses.join(",\n");
    const newData = data.replace(coursesMatch[1], updatedCourses);
    fs.writeFileSync(filePath, newData);
    console.log(`Added ${newCourses.length} new courses!`);
} else {
    console.log('All categories have at least 2 courses!');
}
