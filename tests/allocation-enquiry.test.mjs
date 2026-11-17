import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/allocation-enquiry.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const compiledModule = { exports: {} };
new Function('module', 'exports', compiled.outputText)(compiledModule, compiledModule.exports);
const { validateAllocationEnquiry, allocationEnquiryText, interestOptions } = compiledModule.exports;
const enquiry = {
  name: '  Preview Client  ', phone: '+971 (50) 000-0000', email: 'preview@example.com',
  country: 'United Arab Emirates',
  interest: interestOptions[0], message: 'Specification & delivery?\nDubai collection.', consent: true,
};

test('enquiries require usable contact details, a valid enquiry interest and consent', () => {
  assert.equal(validateAllocationEnquiry(enquiry).name, 'Preview Client');
  for (const invalid of [
    { name: ' ' }, { phone: '123' }, { phone: '+971hello' }, { email: 'not-an-email' },
    { country: '' }, { interest: 'Unknown' }, { interest: '' }, { interest: undefined }, { interest: 'Please source a Ferrari for me' }, { consent: false },
    { name: 'Client\nInjected field' }, { message: 'a'.repeat(3001) },
  ]) assert.equal(validateAllocationEnquiry({ ...enquiry, ...invalid }), null);
});

test('enquiries identify the Coupé without a body-style field', () => {
  assert.equal(validateAllocationEnquiry(enquiry).vehicle, 'Ferrari 12Cilindri Coupé');
  const data = validateAllocationEnquiry({ ...enquiry, vehicle: 'Ferrari 12Cilindri Spider' });
  assert.equal(data.vehicle, 'Ferrari 12Cilindri Coupé');
  assert.match(allocationEnquiryText(data, true), /Vehicle: Ferrari 12Cilindri Coupé/);
});

test('WhatsApp handoff preserves all details and Unicode without restricting vehicle options', () => {
  const data = validateAllocationEnquiry(enquiry);
  const message = allocationEnquiryText(data, true);
  const link = new URL(`https://wa.me/971565155886?text=${encodeURIComponent(message)}`);
  assert.equal(link.searchParams.get('text'), message);
  for (const field of ['name', 'phone', 'email', 'country', 'vehicle', 'interest', 'message']) {
    assert.ok(message.includes(data[field]), field);
  }
  assert.match(message, /NOVITEC N-LARGO — private project enquiry/);
  assert.doesNotMatch(message, /vehicle not included|package only/);
});

test('fully allocated enquiries explicitly concern future opportunities', () => {
  const message = allocationEnquiryText(validateAllocationEnquiry(enquiry), false);
  assert.match(message, /^Future opportunity enquiry:/);
  assert.match(message, /fully allocated/);
});

test('each enquiry option is preserved in the WhatsApp handoff', () => {
  for (const interest of interestOptions) {
    const data = validateAllocationEnquiry({ ...enquiry, interest });
    assert.ok(data);
    assert.ok(allocationEnquiryText(data, true).includes(`Interested in: ${interest}`));
    assert.doesNotMatch(allocationEnquiryText(data, true), /Ownership status:/);
  }
});

test('complete-vehicle enquiries remain separate when conversion allocations are sold', () => {
  const data = validateAllocationEnquiry({ ...enquiry, interest: interestOptions[1] });
  for (const available of [true, false]) {
    const message = allocationEnquiryText(data, available);
    assert.match(message, /^Private purchase enquiry: complete Ferrari 12Cilindri N-LARGO/);
    assert.doesNotMatch(message, /fully allocated|Future opportunity|package delivery/);
  }
});
