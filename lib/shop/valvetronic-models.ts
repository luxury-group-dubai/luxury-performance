const aliases: Record<string, string> = {
  m235: 'm235i', m240: 'm240i', m340: 'm340i', m440: 'm440i', m550: 'm550i', m850: 'm850i',
  m5cs: 'm5', c63s: 'c63', gle: 'gle63', glc: 'glc63', z06: 'c8',
  g500: 'g_class', g550: 'g_class', g63: 'g_class',
};

export function valvetronicModelKey(model: string) {
  return aliases[model] ?? model;
}
