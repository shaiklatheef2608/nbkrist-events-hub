export const APPROVED_HOSTS: Record<string, string> = {
  "abdullatheefshaik4o@gmail.com": "CSE NBKRIST",
  "uhvcellnbkrist@nbkrist.org": "UHV CELL NBKRST",
  "ieeenbkrist@nbkrist.org": "IEEE NBKRIST",
  "istesbnbkrist@nbkrist.org": "ISTE SB NBKRST",
  "iicnbkrist@nbkrist.org": "IIC NBKRIST",
  "csenbkrist@nbkrist.org": "CSE NBKRIST",
  "mechnbkrist@nbkrist.org": "MECH NBKRIST",
  "eeenbkrist@nbkrist.org": "EEE NBKRIST",
  "ecenbkrist@nbkrist.org": "ECE NBKRIST",
  "aidsnbkrist@nbkrist.org": "AIDS NBKRIST",
  "civilnbkrist@nbkrist.org": "CIVIL NBKRIST"
};

export const APPROVED_ORGANIZATIONS = [
  "UHV CELL NBKRST",
  "IEEE NBKRIST",
  "ISTE SB NBKRST",
  "IIC NBKRIST",
  "CSE NBKRIST",
  "MECH NBKRIST",
  "EEE NBKRIST",
  "ECE NBKRIST",
  "AIDS NBKRIST",
  "CIVIL NBKRIST"
] as const;

export const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Artificial Intelligence & Data Science",
  "Electronics & Communication Engineering",
  "Electrical & Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Science & Humanities",
  "Interdisciplinary & Central Chapters"
] as const;

export const EVENT_TYPES = [
  "Technical Symposium",
  "Workshop & Hands-On",
  "Hackathon & Coding Contest",
  "National Conference",
  "Guest Lecture & Tech Talk",
  "Chapter & Branch Activity",
  "Student Technical Fest",
  "Project Exhibition"
] as const;

export const HOST_METADATA: Record<string, { type: string; department: string; code: string }> = {
  "CSE NBKRIST": { type: "Department", department: "Computer Science & Engineering", code: "NBKR-CSE" },
  "AIDS NBKRIST": { type: "Department", department: "Artificial Intelligence & Data Science", code: "NBKR-AIDS" },
  "ECE NBKRIST": { type: "Department", department: "Electronics & Communication Engineering", code: "NBKR-ECE" },
  "EEE NBKRIST": { type: "Department", department: "Electrical & Electronics Engineering", code: "NBKR-EEE" },
  "MECH NBKRIST": { type: "Department", department: "Mechanical Engineering", code: "NBKR-MECH" },
  "CIVIL NBKRIST": { type: "Department", department: "Civil Engineering", code: "NBKR-CIVIL" },
  "IEEE NBKRIST": { type: "Student Chapter", department: "Interdisciplinary & Central Chapters", code: "NBKR-IEEE" },
  "ISTE SB NBKRST": { type: "Student Chapter", department: "Interdisciplinary & Central Chapters", code: "NBKR-ISTE" },
  "IIC NBKRIST": { type: "Institution's Innovation Council", department: "Interdisciplinary & Central Chapters", code: "NBKR-IIC" },
  "UHV CELL NBKRST": { type: "Universal Human Values Cell", department: "Science & Humanities", code: "NBKR-UHV" },
};
