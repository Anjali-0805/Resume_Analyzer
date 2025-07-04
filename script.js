function updateFileName() {
    const fileInput = document.getElementById("resumeUpload");
    const fileName = document.getElementById("fileName");

    if (fileInput.files.length > 0) {
        fileName.textContent = "✅ File Selected: " + fileInput.files[0].name;
    } else {
        fileName.textContent = "📂 Choose File";
    }
}

function analyzeResume() {
    const resumeText = document.getElementById('resumeText').value;
    const fileInput = document.getElementById('resumeUpload');
    const analysisResult = document.getElementById('analysisResult');

    if (!resumeText && !fileInput.files[0]) {
        alert("Please upload a resume or paste the text.");
        return;
    }

    let text = resumeText;

    // If a file is uploaded, read its content
    if (fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            text = e.target.result;
            performAnalysis(text);
        };

        if (file.type === "application/pdf") {
            readPDF(file);
        } else {
            reader.readAsText(file);
        }
    } else {
        performAnalysis(text);
    }
}

function readPDF(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
        const typedArray = new Uint8Array(event.target.result);
        pdfjsLib.getDocument(typedArray).promise.then(pdf => {
            let text = "";
            let countPromises = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                countPromises.push(
                    pdf.getPage(i).then(page => {
                        return page.getTextContent().then(textContent => {
                            textContent.items.forEach(item => {
                                text += item.str + " ";
                            });
                        });
                    })
                );
            }

            Promise.all(countPromises).then(() => {
                performAnalysis(text);
            });
        });
    };

    reader.readAsArrayBuffer(file);
}

function performAnalysis(text) {
    const analysisResult = document.getElementById('analysisResult');

    // Define a comprehensive list of skills (technical and non-technical)
    const skillsKeywords = [
        // Programming Languages
        "JavaScript", "Python", "Java", "C++", "C#", "Ruby", "PHP", "Swift", "Go", "TypeScript", "Kotlin", "Rust",
        // Web Development
        "HTML", "CSS", "React", "Angular", "Vue.js", "Node.js", "Express.js", "Django", "Flask", "Spring Boot",
        // Databases
        "SQL", "MySQL", "PostgreSQL", "MongoDB", "Oracle", "SQLite", "Firebase",
        // Cloud & DevOps
        "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform", "Jenkins", "CI/CD", "Ansible",
        // Data Science & Machine Learning
        "Machine Learning", "Data Analysis", "Pandas", "NumPy", "TensorFlow", "PyTorch", "Scikit-learn", "Data Visualization",
        // Data Visualization Tools
        "Tableau", "Power BI", "QlikView", "D3.js", "Matplotlib", "Seaborn", "Plotly",
        // Mobile Development
        "Android Development", "iOS Development", "React Native", "Flutter",
        // Tools & Platforms
        "Git", "GitHub", "GitLab", "Jira", "Confluence", "Slack", "Trello", "Figma", "Adobe XD",
        // Soft Skills
        "Communication", "Teamwork", "Leadership", "Problem Solving", "Time Management", "Adaptability", "Creativity",
        // Other Technical Skills
        "REST API", "GraphQL", "Microservices", "Agile", "Scrum", "Linux", "Shell Scripting", "Cybersecurity",
    ];

    // Extract name (assume the name is the first line and matches a name pattern)
    const lines = text.split('\n');
    let name = "Not found";

    // Regex to match a typical name format (e.g., "John Doe" or "Doe, John")
    const nameRegex = /^[A-Z][a-z]*(\s[A-Z][a-z]*)*$/;

    for (let line of lines) {
        line = line.trim(); // Remove extra spaces
        if (nameRegex.test(line)) {
            name = line;
            break; // Stop after finding the first valid name
        }
    }

    // Extract email and phone number using regex
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /\+?\d[\d -]{8,12}\d/;

    const email = text.match(emailRegex) ? text.match(emailRegex)[0] : "Not found";
    const phone = text.match(phoneRegex) ? text.match(phoneRegex)[0] : "Not found";

    // Convert text to lowercase for case-insensitive matching
    const lowerText = text.toLowerCase();

    // Analyze skills
    const foundSkills = skillsKeywords.filter(skill => lowerText.includes(skill.toLowerCase()));

    // Analyze education
    const educationKeywords = ["Bachelor", "Master", "PhD", "Degree", "Diploma"];
    const foundEducation = educationKeywords.filter(edu => lowerText.includes(edu.toLowerCase()));

    // Analyze experience
    const experienceKeywords = ["Experience", "Internship", "Worked", "Projects"];
    const foundExperience = experienceKeywords.filter(exp => lowerText.includes(exp.toLowerCase()));

    // Generate analysis result
    let result = "<h3>Analysis Result:</h3>";
    result += `<p><strong>Name:</strong> ${name}</p>`;
    result += `<p><strong>Email:</strong> ${email}</p>`;
    result += `<p><strong>Phone:</strong> ${phone}</p>`;
    result += `<p><strong>Skills Found:</strong> ${foundSkills.length > 0 ? foundSkills.join(", ") : "No relevant skills found."}</p>`;
    result += `<p><strong>Education Found:</strong> ${foundEducation.length > 0 ? foundEducation.join(", ") : "No education details found."}</p>`;
    result += `<p><strong>Experience Found:</strong> ${foundExperience.length > 0 ? foundExperience.join(", ") : "No experience details found."}</p>`;

    // Display the result
    analysisResult.innerHTML = result;
}

// Event listeners for file input and textarea
document.getElementById('resumeUpload').addEventListener('change', () => {
    // Clear the textarea when a file is chosen
    document.getElementById('resumeText').value = "";
    updateFileName();
});

document.getElementById('resumeText').addEventListener('input', () => {
    // Clear the file input when text is pasted
    document.getElementById('resumeUpload').value = "";
    updateFileName();
});