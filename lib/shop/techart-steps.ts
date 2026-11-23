import type { Filters } from './taxonomy';
import type { VehicleGeneration } from './techart-fitment';
import { normalizeTechartRoute } from './techart-routes';

export function techartBodies(generation: VehicleGeneration) {
  // Cayenne Turbo GT is a trim of the Coupé, not a separate body style.
  const bodies = new Map<string, VehicleGeneration['bodies'][number]>();
  for (const body of generation.bodies) {
    const current = bodies.get(body.key);
    bodies.set(body.key, {
      ...body, name: body.key === 'coupe' ? 'Coupé' : body.name,
      choices: [...new Map([...(current?.choices ?? []), ...body.choices].map(choice => [choice.fit, choice])).values()],
    });
  }
  return [...bodies.values()];
}

export function techartStep(options: VehicleGeneration[], input: Filters) {
  const filters = normalizeTechartRoute(input);
  const generation = options.find(item => item.key === filters.generation);
  const bodies = generation ? techartBodies(generation) : [];
  const body = bodies.find(item => item.key === filters.body);
  const choice = body?.choices.find(item => item.fit === filters.fit);
  const invalid = !!filters.generation && !generation || !!filters.body && !!generation && !body || !!filters.fit && !!body && !choice;
  const next = !generation && options.length === 1 ? { ...filters, generation: options[0].key }
    : generation && !body && bodies.length === 1 ? { ...filters, body: bodies[0].key }
    : body && !filters.fit && body.choices.length === 1 ? { ...filters, fit: body.choices[0].fit } : undefined;
  return { filters, generation, bodies, body, choice, invalid, next };
}
