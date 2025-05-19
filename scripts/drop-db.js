const mysql = require('mysql2/promise');

async function dropAllTables() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'chat_app',
    });

    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

    const [tables] = await connection.query("SHOW TABLES");
    const tableKey = `Tables_in_chat_app`;

    for (const row of tables) {
        const tableName = row[tableKey];
        console.log(`Dropping table: ${tableName}`);
        await connection.query(`DROP TABLE IF EXISTS \`${tableName}\``);
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    await connection.end();
    console.log('✅ Todas as tabelas foram removidas.');
}

dropAllTables().catch(err => {
    console.error('❌ Erro ao apagar tabelas:', err);
    process.exit(1);
});
