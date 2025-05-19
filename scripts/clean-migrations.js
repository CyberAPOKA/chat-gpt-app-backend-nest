const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/migrations');

fs.readdir(dir, (err, files) => {
    if (err) {
        console.error('Erro ao ler pasta de migrations:', err);
        process.exit(1);
    }

    files.forEach((file) => {
        if (file.endsWith('.ts')) {
            fs.unlinkSync(path.join(dir, file));
            console.log(`🧹 Removido: ${file}`);
        }
    });

    console.log('✅ Migrations limpas.');
});
