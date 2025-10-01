const fs = require('fs');
const path = require('path');

// Styling yang konsisten untuk input
const inputStyle = 'px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400';

// Styling untuk select (tanpa placeholder)
const selectStyle = 'px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white';

// Styling untuk textarea
const textareaStyle = 'px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400';

function updateFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Replace input-style dengan styling yang sesuai
        const inputRegex = /className="([^"]*?)input-style([^"]*?)"/g;
        content = content.replace(inputRegex, (match, before, after) => {
            modified = true;
            // Tentukan apakah ini input, select, atau textarea
            const isSelect = match.includes('<select') || match.includes('select ');
            const isTextarea = match.includes('<textarea') || match.includes('textarea ');
            
            if (isSelect) {
                return `className="${before}${selectStyle}${after}"`;
            } else if (isTextarea) {
                return `className="${before}${textareaStyle}${after}"`;
            } else {
                return `className="${before}${inputStyle}${after}"`;
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error updating ${filePath}:`, error.message);
    }
}

function walkDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            walkDirectory(filePath);
        } else if (file.endsWith('.jsx')) {
            updateFile(filePath);
        }
    });
}

// Update pages directory
console.log('Updating pages directory...');
walkDirectory('./src/pages');

// Update components directory
console.log('Updating components directory...');
walkDirectory('./src/components');

console.log('Update completed!');
