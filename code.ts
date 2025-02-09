// Show the UI panel with a specified width and height
figma.showUI(__html__, { width: 300, height: 400 });

// Function that collects fonts from all TEXT nodes on the current page
function getFontsFromPage() {
  // Find all text nodes on the current page
  const textNodes = figma.currentPage.findAll(node => node.type === "TEXT") as TextNode[];

  // Create a Map to group font families with their styles (using a Set to avoid duplicate styles)
  const fontsMap = new Map<string, Set<string>>();

  for (const node of textNodes) {
    let fonts: readonly FontName[];
    try {
      // This returns all font names used in the text node, handling both uniform and mixed fonts.
      fonts = node.getRangeAllFontNames(0, node.characters.length);
    } catch (e) {
      // In case the text node is empty or another error occurs, skip it.
      continue;
    }
    for (const font of fonts) {
      const family = font.family;
      const style = font.style;
      if (!fontsMap.has(family)) {
        fontsMap.set(family, new Set());
      }
      fontsMap.get(family)!.add(style);
    }
  }

  // Convert the Map to an array of objects for easy UI consumption
  const fontsList = Array.from(fontsMap.entries()).map(([family, styles]) => {
    return { family, styles: Array.from(styles) };
  });
  return fontsList;
}

// Get the list of fonts and send it to the UI
const fontsList = getFontsFromPage();
figma.ui.postMessage({ type: 'fonts-detected', fonts: fontsList });

// Listen for messages from the UI (e.g., to close the plugin)
figma.ui.onmessage = (msg) => {
  if (msg.type === 'close-plugin') {
    figma.closePlugin();
  }
};
