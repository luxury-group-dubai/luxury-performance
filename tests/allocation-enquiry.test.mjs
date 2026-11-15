import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/allocation-enquiry.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const module = { exports: {} };
new Function('module', 'exports', compiled.outputText)(module, module.exports);
const { validateAllocationEnquiry, allocationEnquiryText } = module.exports;
const enquiry = {
  name: '  Preview Client  ', phone: '+971 (50) 000-0000', email: 'preview@example.com',
  country: 'United Arab Emirates', vehicle: 'Ferrari 12Cilindri Coupé',
  ownership: 'Already own', message: 'Specification & delivery?\nDubai collection.', consent: true,
};

test('enquiries require usable contact details, vehicle selection and consent', () => {
  assert.equal(validateAllocationEnquiry(enquiry).name, 'Preview Client');
  for (const invalid of [
    { name: ' ' }, { phone: '123' }, { phone: '+971hello' }, { email: 'not-an-email' },
    { country: '' }, { vehicle: 'Other' }, { ownership: 'Unknown' }, { consent: false },
    { name: 'Client\nInjected field' }, { message: 'a'.repeat(3001) },
  ]) assert.equal(validateAllocationEnquiry({ ...enquiry, ...invalid }), null);
});

test('WhatsApp handoff preserves all details, Unicode and package-only scope', () => {
  const data = validateAllocationEnquiry(enquiry);
  const message = allocationEnquiryText(data, true);
  const link = new URL(`https://wa.me/971565155886?text=${encodeURIComponent(message)}`);
  assert.equal(link.searchParams.get('text'), message);
  for (const field of ['name', 'phone', 'email', 'country', 'vehicle', 'ownership', 'message']) {
    assert.ok(message.includes(data[field]), field);
  }
  assert.match(message, /Ferrari vehicle not included/);
});

test('fully allocated enquiries explicitly concern future opportunities', () => {
  const message = allocationEnquiryText(validateAllocationEnquiry(enquiry), false);
  assert.match(message, /^Future opportunity enquiry:/);
  assert.match(message, /fully allocated/);
});
