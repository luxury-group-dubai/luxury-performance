import { brandMenu, vehicleMenu, type ShopMenuItem } from '@/lib/shop-navigation';
import { previewBrandPath, previewBrands } from './brand-catalogue';
import { vehicleStepHref } from './vehicle-navigation';

export type PreviewShopTab = 'brands' | 'vehicles' | 'stock';
export const previewShopTabs: { key: PreviewShopTab; label: string; href: string }[] = [
  { key: 'brands', label: 'BY BRAND', href: '/shop' },
  { key: 'vehicles', label: 'BY VEHICLE', href: '/shop/vehicles' },
  { key: 'stock', label: 'IN STOCK', href: '/shop/in-stock' },
];
export const previewShopBrands: ShopMenuItem[] = brandMenu.map(item => {
  const brand = item.artwork!;
  if (brand === 'novitec' || previewBrands.some(value => value === brand)) return { ...item, href: previewBrandPath(brand) };
  if (brand === 'collectibles') return { ...item, href: '/shop/collectibles' };
  return { ...item, href: `/contact?programme=${encodeURIComponent(item.name)}`, note: 'Private enquiry' };
});
export const previewPopularVehicles = vehicleMenu.map(item => {
  const make = new URLSearchParams(item.href.split('?')[1]).get('make')!;
  return { ...item, make, href: vehicleStepHref(make) };
});
export const previewStockLinks = [
  { name: 'Available parts', href: '/shop/in-stock', description: 'Browse available stock' },
  { name: 'Used OEM parts', href: '/shop/in-stock?stock_group=used', description: 'Original parts, individually listed' },
  { name: 'URBAN kits', href: '/shop/in-stock?stock_group=urban', description: 'Two remaining kits · private enquiry' },
];
