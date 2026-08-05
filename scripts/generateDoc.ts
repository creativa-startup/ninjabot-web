import fs from 'fs';
import path from 'path';

/**
 * Genera la documentación técnica de un componente graduado a features/
 */
export function generateComponentDoc(
  moduleName: string,
  componentName: string,
  description: string,
  propsList: Array<{ name: string; type: string; description: string }>,
  level: 'N1' | 'N2' | 'N3' | 'N4'
) {
  const docsDir = path.join(__dirname, `../docs/features/${moduleName}`);
  
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const docContent = `# 📄 Ficha Técnica: ${componentName}

**Módulo:** \`${moduleName}\`  
**Nivel Jerárquico:** \`${level}\`  
**Estado:** ✅ Graduado a Producción  
**Fecha de Aprobación:** ${new Date().toISOString().split('T')[0]}

---

## 1. Descripción Funcional
${description}

---

## 2. Contrato de Interfaces (Props)

| Prop | Tipo | Descripción |
| :--- | :--- | :--- |
${propsList.map(p => `| \`${p.name}\` | \`${p.type}\` | ${p.description} |`).join('\n')}

---

## 3. Reglas de Comportamiento y Responsive
- **Pantalla Desktop (\`md:\`):** Renderizado en columna fija dentro del layout de 4 niveles.
- **Pantalla Mobile:** Manejo de estado visual con conmutación en cascada mediante callbacks.

---

## 4. Archivos Relacionados
- Componente: \`src/features/${moduleName}/${componentName}.tsx\`
`;

  const filePath = path.join(docsDir, `${componentName}.md`);
  fs.writeFileSync(filePath, docContent, 'utf-8');
  console.log(`✅ Documentación generada con éxito en: ${filePath}`);
}