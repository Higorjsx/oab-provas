const fs = require("fs");
const path = require("path");

// pega argumentos no formato --flag=valor
function getArg(name, def) {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (!arg) return def;
  return arg.split("=")[1];
}

const provasDir = getArg("provas", "./public/pdfs/provas");
const gabsDir = getArg("gabs", "./public/pdfs/gabaritos");

function stripExt(filename) {
  return filename.replace(/\.[^/.]+$/, "");
}

function normalizeName(filename) {
  return stripExt(filename)
    .toLowerCase()
    .replace(/(gabarito|prova)/g, "") // remove "gabarito" e "prova"
    .replace(/[^a-z0-9]/g, "");       // remove separadores
}

function extractInfo(filename) {
  const base = stripExt(filename).toLowerCase();
  const parts = base.split("-");

  const instituicao = parts[0]?.toUpperCase() || "";
  const ano = parts.find((p) => /^\d{4}$/.test(p)) || "";

  return {
    nome: base
      .replace(/\b(fgv|oab|prova|gabarito|\d{4})\b/gi, "")
      .replace(/--+/g, "-")
      .replace(/(^-|-$)/g, ""),
    ano,
    instituicao,
  };
}

function pairFiles(provasDir, gabsDir) {
  const provas = fs.readdirSync(provasDir).filter((f) => f.endsWith(".pdf"));
  const gabs = fs.readdirSync(gabsDir).filter((f) => f.endsWith(".pdf"));

  const provasMap = new Map(
    provas.map((f) => [normalizeName(f), path.join("pdfs/provas", f)])
  );
  const gabsMap = new Map(
    gabs.map((f) => [normalizeName(f), path.join("pdfs/gabaritos", f)])
  );

  // Debug
  console.log("🔎 Provas normalizadas:", [...provasMap.keys()]);
  console.log("🔎 Gabaritos normalizados:", [...gabsMap.keys()]);

  const pairs = [];

  for (const [key, provaPath] of provasMap.entries()) {
    if (gabsMap.has(key)) {
      const gabPath = gabsMap.get(key);
      const info = extractInfo(path.basename(provaPath));

      pairs.push({
        ...info,
        prova: provaPath,
        gabarito: gabPath,
      });
    }
  }

  return pairs;
}

function main() {
  const pairs = pairFiles(provasDir, gabsDir);
  const output = path.join(process.cwd(), "public", "pairs.json");
  fs.writeFileSync(output, JSON.stringify(pairs, null, 2), "utf-8");
  console.log(`✅ JSON gerado em ${output}`);
}

main();
