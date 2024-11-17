import { readFileSync, readdirSync, statSync, renameSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function renameJsToJsx(dir) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      renameJsToJsx(filePath);
    } else if (file.endsWith('.js') && file !== 'vite.config.js' && file !== 'rename-files.js') {
      // Read file content
      const content = readFileSync(filePath, 'utf8');
      
      // Check if file contains JSX
      if (content.includes('React') || content.includes('jsx') || content.includes('<')) {
        const newPath = filePath.replace('.js', '.jsx');
        renameSync(filePath, newPath);
        console.log(`Renamed ${filePath} to ${newPath}`);
      }
    }
  });
}

// Start from src directory
renameJsToJsx(join(__dirname, 'src')); 