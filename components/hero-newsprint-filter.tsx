export function HeroNewsprintFilter({ preserveYellow = false, id = 'hero-newsprint' }: { preserveYellow?: boolean; id?: string } = {}) {
  return (
  <svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute' }}>
    <filter id={id} colorInterpolationFilters="sRGB">
      <feColorMatrix in="SourceGraphic" type="saturate" values="0" />
      <feComponentTransfer result="ink">
        <feFuncR type="linear" slope="1.4" intercept="-.18" />
        <feFuncG type="linear" slope="1.4" intercept="-.18" />
        <feFuncB type="linear" slope="1.4" intercept="-.18" />
      </feComponentTransfer>
      {/* Preserve pixels where red exceeds both green and blue. */}
      <feColorMatrix in="SourceGraphic" result="over-green" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  10 -13 0 0 -.3" />
      <feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  6 0 -6 0 -.4" />
      <feComposite in2="over-green" operator="in" result="red-mask" />
      {preserveYellow && <>
        {/* Yellow requires warm red/green channels and little blue. */}
        <feColorMatrix in="SourceGraphic" result="yellow-warm" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  12 -11 0 0 -.15" />
        <feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 8 -12 0 -.6" />
        <feComposite in2="yellow-warm" operator="in" result="yellow-mask" />
        <feComposite in="red-mask" in2="yellow-mask" operator="arithmetic" k2="1" k3="1" result="color-mask" />
      </>}
      <feComposite in="SourceGraphic" in2={preserveYellow ? 'color-mask' : 'red-mask'} operator="in" />
      <feComposite in2="ink" operator="over" />
    </filter>
  </svg>
  );
}
