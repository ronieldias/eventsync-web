const fs = require('fs');
const path = require('path');

// Caminhos base
const rootDir = __dirname;
const srcDir = path.join(rootDir, 'src');
const srcAppDir = path.join(srcDir, 'app');
const oldAppDir = path.join(rootDir, 'app');

// 1. Garantir que as pastas de destino existem
if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir);
if (!fs.existsSync(srcAppDir)) fs.mkdirSync(srcAppDir);

console.log('📦 Iniciando reorganização das pastas...');

// 2. Mover arquivos específicos da pasta 'app' antiga para 'src/app'
const filesToMove = ['globals.css', 'page.tsx', 'favicon.ico'];

filesToMove.forEach(file => {
  const oldPath = path.join(oldAppDir, file);
  const newPath = path.join(srcAppDir, file);

  if (fs.existsSync(oldPath)) {
    // Se o arquivo já existir no destino, removemos o antigo para evitar conflito ou sobrescrevemos?
    // Aqui vamos mover. Se existir no destino, avisa.
    if (fs.existsSync(newPath)) {
      console.warn(`⚠️  Aviso: ${file} já existe em src/app. O arquivo da raiz não foi movido.`);
    } else {
      fs.renameSync(oldPath, newPath);
      console.log(`✅ ${file} movido para src/app/`);
    }
  }
});

// 3. Remover a pasta 'app' antiga (e o layout duplicado incorreto)
if (fs.existsSync(oldAppDir)) {
  // Removemos recursivamente para limpar o layout.tsx duplicado e a pasta
  fs.rmSync(oldAppDir, { recursive: true, force: true });
  console.log('🗑️  Pasta "app" antiga (e layout duplicado) removida.');
}

// 4. Atualizar components.json
const componentsConfigPath = path.join(rootDir, 'components.json');
if (fs.existsSync(componentsConfigPath)) {
  const config = JSON.parse(fs.readFileSync(componentsConfigPath, 'utf8'));
  
  // Atualiza o caminho do CSS global
  if (config.tailwind && config.tailwind.css) {
    config.tailwind.css = 'src/app/globals.css';
  }
  
  // Opcional: Garante que os aliases estão apontando corretamente se não estiverem
  if (config.aliases) {
    // Apenas garante, geralmente o padrão já é @/...
    config.aliases.components = "@/components";
    config.aliases.utils = "@/lib/utils";
  }

  fs.writeFileSync(componentsConfigPath, JSON.stringify(config, null, 2));
  console.log('⚙️  components.json atualizado.');
}

// 5. Atualizar tsconfig.json para corrigir os imports (@/* -> ./src/*)
const tsConfigPath = path.join(rootDir, 'tsconfig.json');
if (fs.existsSync(tsConfigPath)) {
  // Ler como texto primeiro porque tsconfig pode ter comentários (embora o JSON.parse padrão não suporte, o do Next.js gerado costuma ser JSON puro)
  try {
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
    
    if (!tsConfig.compilerOptions) tsConfig.compilerOptions = {};
    
    // Atualiza o path alias para apontar para src
    tsConfig.compilerOptions.paths = {
      "@/*": ["./src/*"]
    };

    fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
    console.log('⚙️  tsconfig.json atualizado para usar "./src/*".');
  } catch (error) {
    console.error('❌ Erro ao ler tsconfig.json. Verifique se ele contém comentários não padrão JSON.');
  }
}

console.log('\n🎉 Reorganização concluída! Agora rode "npm run dev" para testar.');