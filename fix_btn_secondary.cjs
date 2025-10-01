const fs = require('fs');
const path = require('path');

// Styling yang konsisten untuk tombol secondary
const secondaryButtonStyle = 'px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600';

function updateFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Replace btn-secondary dengan styling yang sesuai
        const btnSecondaryRegex = /className="([^"]*?)btn-secondary([^"]*?)"/g;
        content = content.replace(btnSecondaryRegex, (match, before, after) => {
            modified = true;
            return `className="${before}${secondaryButtonStyle}${after}"`;
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
