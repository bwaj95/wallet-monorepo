const HARDENED_OFFSET = 0x80000000; // 2^31

export function parseDerivationPath(path: string): number[] {
  if (!path || !path.startsWith("m/")) {
    throw new Error("Invalid derivation path format");
  }

  // Remove 'm/' prefix and split into components
  const parts = path.replace("m/", "").split("/");

  if (parts.length < 4) {
    throw new Error(
      "Derivation path must have at least 4 components (e.g., m/44'/501'/0'/0')",
    );
  }

  return parts.map(parsePathComponent);
}

function parsePathComponent(component: string): number {
  const hardened = component.endsWith("'");
  const indexStr = hardened ? component.slice(0, -1) : component;
  const index = parseInt(indexStr, 10);
  if (isNaN(index) || index < 0) {
    throw new Error(`Invalid path component: ${component}`);
  }
  return hardened ? index + HARDENED_OFFSET : index;
}
