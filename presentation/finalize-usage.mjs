import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const skillDir = process.env.PRESENTATION_SKILL_DIR;
const pythonExecutable = process.env.RUNTIME_PYTHON;
if (!skillDir || !pythonExecutable)
  throw new Error('Set PRESENTATION_SKILL_DIR and RUNTIME_PYTHON');
const { finalizePresentation } = await import(
  pathToFileURL(path.join(skillDir, 'container_tools/artifact_tool_utils.mjs')).href
);
const finalPath = path.join(
  here,
  'output',
  'RobloxSafeSpace-SSS-System-Userflow-Workflow-2026-11-18.pptx',
);
await fs.mkdir(path.dirname(finalPath), { recursive: true });
const result = await finalizePresentation({
  workspaceDir: path.resolve(here, '..'),
  candidatePath: path.join(here, '.usage-build', 'candidate.pptx'),
  finalPath,
  pythonExecutable,
  integrityValidatorPath: path.join(
    skillDir,
    'container_tools/inspect_presentation_package_integrity.py',
  ),
  layoutValidatorPath: path.join(
    skillDir,
    'container_tools/inspect_presentation_layout_geometry.py',
  ),
  layoutArgs: ['--expected-slide-size-emu', '12192000,6858000', '--validate-heading-fit'],
  explicitTotalSlideCount: 12,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
  fontPolicy: { basis: 'design', families: ['Leelawadee UI'] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(here, '.usage-build', 'final-validation.json'),
});
console.log(JSON.stringify({ finalPath, result }, null, 2));
