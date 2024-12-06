const postcss = require('postcss');
const fs = require('fs').promises;
const path = require('path');
const bundleConfig = require('../app/styles/bundle.config.js');

async function buildCSSBundle(type) {
  const config = bundleConfig[type];
  const plugins = bundleConfig.plugins[type];
  const outputPath = bundleConfig.output[type];

  try {
    // Read and concatenate input files
    const cssContent = await Promise.all(
      config.map(file => fs.readFile(path.resolve(__dirname, '../app', file), 'utf8'))
    ).then(contents => contents.join('\n'));

    // Process with PostCSS
    const result = await postcss(plugins)
      .process(cssContent, { from: undefined });

    // Ensure output directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Write output
    await fs.writeFile(outputPath, result.css);
    console.log(`Built ${type} CSS bundle: ${outputPath}`);
  } catch (error) {
    console.error(`Error building ${type} CSS bundle:`, error);
  }
}

async function buildAll() {
  await Promise.all([
    buildCSSBundle('critical'),
    buildCSSBundle('components'),
    buildCSSBundle('utilities'),
    buildCSSBundle('base'),
  ]);
}

buildAll();